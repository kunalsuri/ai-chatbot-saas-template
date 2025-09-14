/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class ManifestSyncer {
  constructor() {
    this.jsonPath = path.join(projectRoot, 'ai-project-manifest.json');
    this.mdPath = path.join(projectRoot, 'AI-PROJECT-MANIFEST.md');
  }

  async loadManifests() {
    try {
      const [jsonContent, mdContent] = await Promise.all([
        fs.readFile(this.jsonPath, 'utf-8'),
        fs.readFile(this.mdPath, 'utf-8')
      ]);
      
      this.jsonManifest = JSON.parse(jsonContent);
      this.mdContent = mdContent;
      return true;
    } catch (error) {
      console.error(`❌ Failed to load manifests: ${error.message}`);
      return false;
    }
  }

  parseMarkdownEndpoints() {
    const endpointsSection = this.mdContent.match(/\*\*Endpoints:\*\*([\s\S]*?)(?=##|$)/i);
    if (!endpointsSection) return [];

    const endpoints = [];
    const lines = endpointsSection[1].split('\n');
    
    for (const line of lines) {
      const match = line.match(/- `(\w+)\s+([^`]+)`\s*→\s*(.+)/);
      if (match) {
        endpoints.push({
          method: match[1],
          path: match[2],
          description: match[3].trim()
        });
      }
    }
    
    return endpoints;
  }

  async syncEndpoints() {
    console.log('🔄 Syncing endpoints from Markdown to JSON...');
    
    const mdEndpoints = this.parseMarkdownEndpoints();
    const jsonEndpoints = this.jsonManifest.apiSurface.endpoints;
    
    console.log(`📊 Found ${mdEndpoints.length} endpoints in MD, ${jsonEndpoints.length} in JSON`);
    
    // Find missing endpoints in JSON
    const missingInJson = [];
    for (const mdEndpoint of mdEndpoints) {
      const exists = jsonEndpoints.some(je => 
        je.method === mdEndpoint.method && je.path === mdEndpoint.path
      );
      if (!exists) {
        missingInJson.push(mdEndpoint);
      }
    }
    
    // Find extra endpoints in JSON
    const extraInJson = [];
    for (const jsonEndpoint of jsonEndpoints) {
      const exists = mdEndpoints.some(me => 
        me.method === jsonEndpoint.method && me.path === jsonEndpoint.path
      );
      if (!exists) {
        extraInJson.push(jsonEndpoint);
      }
    }
    
    if (missingInJson.length > 0) {
      console.log(`➕ Adding ${missingInJson.length} missing endpoints to JSON:`);
      missingInJson.forEach(ep => {
        console.log(`   ${ep.method} ${ep.path} → ${ep.description}`);
        this.jsonManifest.apiSurface.endpoints.push(ep);
      });
    }
    
    if (extraInJson.length > 0) {
      console.log(`❓ Found ${extraInJson.length} extra endpoints in JSON (review needed):`);
      extraInJson.forEach(ep => {
        console.log(`   ${ep.method} ${ep.path} → ${ep.description || 'No description'}`);
      });
    }
    
    return missingInJson.length > 0;
  }

  async syncMetadata() {
    console.log('🔄 Syncing metadata...');
    
    // Extract name from markdown
    const nameMatch = this.mdContent.match(/\*\*Name:\*\*\s*(.+)/i);
    if (nameMatch) {
      const mdName = nameMatch[1].trim();
      if (mdName !== this.jsonManifest.metadata.name) {
        console.log(`📝 Updating name: "${this.jsonManifest.metadata.name}" → "${mdName}"`);
        this.jsonManifest.metadata.name = mdName;
        return true;
      }
    }
    
    return false;
  }

  async updateTimestamps() {
    const now = new Date().toISOString();
    this.jsonManifest.lastUpdated = now;
    this.jsonManifest.version = "1.0.1"; // Increment version on sync
  }

  async saveJson() {
    try {
      await fs.writeFile(
        this.jsonPath, 
        JSON.stringify(this.jsonManifest, null, 2) + '\n'
      );
      console.log('✅ JSON manifest updated successfully');
      return true;
    } catch (error) {
      console.error(`❌ Failed to save JSON: ${error.message}`);
      return false;
    }
  }

  async generateSyncReport() {
    console.log('\n📋 SYNC REPORT');
    console.log('==============');
    
    const mdEndpoints = this.parseMarkdownEndpoints();
    const jsonEndpoints = this.jsonManifest.apiSurface.endpoints;
    
    console.log(`📊 Endpoints: MD=${mdEndpoints.length}, JSON=${jsonEndpoints.length}`);
    console.log(`📅 Last Updated: ${this.jsonManifest.lastUpdated}`);
    console.log(`🔢 Version: ${this.jsonManifest.version}`);
    
    // Check file modification times
    const [mdStats, jsonStats] = await Promise.all([
      fs.stat(this.mdPath),
      fs.stat(this.jsonPath)
    ]);
    
    const timeDiff = Math.abs(mdStats.mtime - jsonStats.mtime) / 1000;
    console.log(`⏱️  File time difference: ${Math.round(timeDiff)} seconds`);
    
    if (timeDiff < 60) {
      console.log('✅ Files are synchronized');
    } else {
      console.log('⚠️  Files may be out of sync');
    }
  }

  async sync(options = {}) {
    console.log('🚀 Starting manifest synchronization...\n');
    
    const loaded = await this.loadManifests();
    if (!loaded) return false;
    
    let hasChanges = false;
    
    // Sync different sections
    if (options.endpoints !== false) {
      hasChanges = await this.syncEndpoints() || hasChanges;
    }
    
    if (options.metadata !== false) {
      hasChanges = await this.syncMetadata() || hasChanges;
    }
    
    // Update timestamps if changes were made
    if (hasChanges) {
      await this.updateTimestamps();
      const saved = await this.saveJson();
      if (!saved) return false;
    } else {
      console.log('✅ No changes needed - manifests are in sync');
    }
    
    await this.generateSyncReport();
    return true;
  }
}

// CLI interface
const args = process.argv.slice(2);
const options = {};

// Parse command line options
for (const arg of args) {
  if (arg === '--no-endpoints') options.endpoints = false;
  if (arg === '--no-metadata') options.metadata = false;
  if (arg === '--help' || arg === '-h') {
    console.log(`
Manifest Synchronization Tool
=============================

Usage: node sync-manifests.js [options]

Options:
  --no-endpoints    Skip endpoint synchronization
  --no-metadata     Skip metadata synchronization  
  --help, -h        Show this help message

Examples:
  node sync-manifests.js                 # Full sync
  node sync-manifests.js --no-metadata   # Sync endpoints only
`);
    process.exit(0);
  }
}

// Run synchronization
const syncer = new ManifestSyncer();
const success = await syncer.sync(options);
process.exit(success ? 0 : 1);
