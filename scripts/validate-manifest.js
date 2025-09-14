/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class ManifestValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.manifest = null;
  }

  async loadManifest() {
    try {
      const manifestPath = path.join(projectRoot, 'ai-project-manifest.json');
      const content = await fs.readFile(manifestPath, 'utf-8');
      this.manifest = JSON.parse(content);
      console.log('✅ Manifest loaded successfully');
    } catch (error) {
      this.errors.push(`Failed to load manifest: ${error.message}`);
      return false;
    }
    return true;
  }

  async validateFileExists(filePath, description) {
    try {
      const fullPath = path.join(projectRoot, filePath);
      await fs.access(fullPath);
      console.log(`✅ ${description}: ${filePath}`);
      return true;
    } catch {
      this.errors.push(`Missing file: ${filePath} (${description})`);
      return false;
    }
  }

  async validatePackageJson() {
    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const content = await fs.readFile(packagePath, 'utf-8');
      const pkg = JSON.parse(content);

      // Validate basic metadata
      if (pkg.name !== 'saas-chatbot-ai') {
        this.warnings.push(`Package name mismatch: expected 'saas-chatbot-ai', got '${pkg.name}'`);
      }

      // Validate React version
      const reactVersion = pkg.dependencies?.react;
      if (!reactVersion?.includes('18.3.1')) {
        this.warnings.push(`React version mismatch: manifest says 18.3.1, package.json has ${reactVersion}`);
      }

      // Validate TypeScript version
      const tsVersion = pkg.devDependencies?.typescript;
      if (!tsVersion?.includes('5.6.3')) {
        this.warnings.push(`TypeScript version mismatch: manifest says 5.6.3, package.json has ${tsVersion}`);
      }

      console.log('✅ Package.json validation completed');
    } catch (error) {
      this.errors.push(`Package.json validation failed: ${error.message}`);
    }
  }

  async validateEntryPoints() {
    console.log('\n📁 Validating Entry Points...');
    const entryPoints = this.manifest.architecture.entryPoints;
    
    for (const entryPoint of entryPoints) {
      await this.validateFileExists(entryPoint, 'Entry point');
    }
  }

  async validateKeyModules() {
    console.log('\n📁 Validating Key Modules...');
    const keyModules = this.manifest.architecture.keyModules;
    
    for (const module of keyModules) {
      if (module.endsWith('/')) {
        // Directory check
        try {
          const fullPath = path.join(projectRoot, module);
          const stats = await fs.stat(fullPath);
          if (stats.isDirectory()) {
            console.log(`✅ Directory exists: ${module}`);
          } else {
            this.errors.push(`Expected directory but found file: ${module}`);
          }
        } catch {
          this.errors.push(`Missing directory: ${module}`);
        }
      } else {
        await this.validateFileExists(module, 'Key module');
      }
    }
  }

  async validateCoreFunctions() {
    console.log('\n🔧 Validating Core Functions...');
    const functions = this.manifest.apiSurface.coreFunctions;
    
    for (const func of functions) {
      const exists = await this.validateFileExists(func.file, `Core function file (${func.name})`);
      
      if (exists) {
        try {
          const content = await fs.readFile(path.join(projectRoot, func.file), 'utf-8');
          if (content.includes(func.name)) {
            console.log(`✅ Function '${func.name}' found in ${func.file}`);
          } else {
            this.warnings.push(`Function '${func.name}' not found in ${func.file}`);
          }
        } catch (error) {
          this.warnings.push(`Could not verify function '${func.name}': ${error.message}`);
        }
      }
    }
  }

  async searchInFiles(pattern, dir = 'client/src') {
    const regex = new RegExp(pattern, 'i');
    let found = false;

    async function scan(directory) {
      try {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(directory, entry.name);
          if (entry.isDirectory()) {
            await scan(fullPath);
          } else if (/\.(ts|js|tsx|jsx)$/.test(entry.name)) {
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              if (regex.test(content)) {
                found = true;
                return;
              }
            } catch {
              // Skip files that can't be read
            }
          }
        }
      } catch {
        // Skip directories that can't be read
      }
    }

    await scan(path.join(projectRoot, dir));
    return found;
  }

  async validateApiEndpoints() {
    console.log('\n🌐 Validating API Endpoints...');
    
    try {
      const routesPath = path.join(projectRoot, 'server/routes.ts');
      const content = await fs.readFile(routesPath, 'utf-8');
      
      const endpoints = this.manifest.apiSurface.endpoints;
      for (const endpoint of endpoints) {
        const routePattern = `app.${endpoint.method.toLowerCase()}("${endpoint.path}"`;
        if (content.includes(routePattern)) {
          console.log(`✅ Endpoint found: ${endpoint.method} ${endpoint.path}`);
        } else {
          // Try searching across all files
          const endpointPath = endpoint.path;
          const foundInCode = await this.searchInFiles(endpointPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          if (foundInCode) {
            console.log(`✅ Endpoint confirmed in codebase: ${endpoint.method} ${endpoint.path}`);
          } else {
            this.warnings.push(`Endpoint not found in codebase: ${endpoint.method} ${endpoint.path}`);
          }
        }
      }
    } catch (error) {
      this.errors.push(`Could not validate API endpoints: ${error.message}`);
    }
  }

  async validateTsConfig() {
    console.log('\n⚙️  Validating TypeScript Configuration...');
    
    try {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);
      
      // Check strict mode
      if (tsconfig.compilerOptions?.strict === true) {
        console.log('✅ TypeScript strict mode enabled');
      } else {
        this.warnings.push('TypeScript strict mode not enabled');
      }
      
      // Check noEmit
      if (tsconfig.compilerOptions?.noEmit === true) {
        console.log('✅ TypeScript noEmit enabled');
      } else {
        this.warnings.push('TypeScript noEmit not enabled');
      }
      
      // Check path aliases
      const paths = tsconfig.compilerOptions?.paths;
      if (paths?.['@/*'] && paths?.['@shared/*']) {
        console.log('✅ Path aliases configured');
      } else {
        this.warnings.push('Path aliases not properly configured');
      }
      
    } catch (error) {
      this.errors.push(`TypeScript config validation failed: ${error.message}`);
    }
  }

  async validateSchemaFiles() {
    console.log('\n📋 Validating Schema Files...');
    
    const schemaFile = 'shared/validation.ts';
    const exists = await this.validateFileExists(schemaFile, 'Validation schemas');
    
    if (exists) {
      try {
        const content = await fs.readFile(path.join(projectRoot, schemaFile), 'utf-8');
        const expectedSchemas = ['loginSchema', 'chatMessageSchema', 'translationSchema'];
        
        for (const schema of expectedSchemas) {
          if (content.includes(schema)) {
            console.log(`✅ Schema found: ${schema}`);
          } else {
            this.warnings.push(`Schema not found: ${schema}`);
          }
        }
      } catch (error) {
        this.warnings.push(`Could not validate schemas: ${error.message}`);
      }
    }
  }

  async validateRelatedProjects() {
    console.log('\n🔗 Validating Related Projects...');
    
    const relatedProjects = this.manifest.architecture.relatedProjects || [];
    if (relatedProjects.length === 0) {
      console.log('✅ No related projects to validate');
      return;
    }
    
    for (const project of relatedProjects) {
      try {
        const projectPath = path.resolve(projectRoot, project);
        await fs.access(projectPath);
        console.log(`✅ Related project found: ${project}`);
      } catch {
        this.warnings.push(`Related project not found: ${project}`);
      }
    }
  }

  async validateManifestSync() {
    console.log('\n🔄 Validating JSON/Markdown Sync...');
    
    try {
      const markdownPath = path.join(projectRoot, 'AI-PROJECT-MANIFEST.md');
      const markdownContent = await fs.readFile(markdownPath, 'utf-8');
      
      // Extract key sections from markdown
      const mdSections = this.parseMarkdownSections(markdownContent);
      
      // Compare critical sections
      const syncIssues = [];
      
      // Check project name
      if (mdSections.name && mdSections.name !== this.manifest.metadata.name) {
        syncIssues.push(`Name mismatch: MD="${mdSections.name}" vs JSON="${this.manifest.metadata.name}"`);
      }
      
      // Check tech stack (JSON has nested object structure)
      if (mdSections.techStack) {
        const jsonTechStack = `${this.manifest.metadata.techStack.language}, ${this.manifest.metadata.techStack.frontend.framework} ${this.manifest.metadata.techStack.frontend.version}, ${this.manifest.metadata.techStack.backend.framework}, ${this.manifest.metadata.techStack.frontend.styling}`;
        if (!mdSections.techStack.includes(this.manifest.metadata.techStack.frontend.framework)) {
          syncIssues.push('Tech stack differences detected between MD and JSON');
        }
      }
      
      // Check entry points count
      const mdEntryPoints = mdSections.entryPoints || [];
      const jsonEntryPoints = this.manifest.architecture.entryPoints || [];
      if (mdEntryPoints.length !== jsonEntryPoints.length) {
        syncIssues.push(`Entry points count mismatch: MD=${mdEntryPoints.length} vs JSON=${jsonEntryPoints.length}`);
      }
      
      // Check endpoints count
      const mdEndpoints = mdSections.endpoints || [];
      const jsonEndpoints = this.manifest.apiSurface.endpoints || [];
      if (mdEndpoints.length !== jsonEndpoints.length) {
        syncIssues.push(`Endpoints count mismatch: MD=${mdEndpoints.length} vs JSON=${jsonEndpoints.length}`);
      }
      
      // Check last modified times
      const mdStats = await fs.stat(markdownPath);
      const jsonPath = path.join(projectRoot, 'ai-project-manifest.json');
      const jsonStats = await fs.stat(jsonPath);
      
      const timeDiff = Math.abs(mdStats.mtime - jsonStats.mtime) / 1000; // seconds
      if (timeDiff > 3600) { // More than 1 hour difference
        syncIssues.push(`File modification time difference: ${Math.round(timeDiff/60)} minutes`);
      }
      
      if (syncIssues.length > 0) {
        syncIssues.forEach(issue => this.warnings.push(issue));
        console.log(`⚠️  Found ${syncIssues.length} sync issues`);
      } else {
        console.log('✅ JSON and Markdown manifests appear synchronized');
      }
      
    } catch (error) {
      this.warnings.push(`Could not validate manifest sync: ${error.message}`);
    }
  }
  
  parseMarkdownSections(content) {
    const sections = {};
    
    // Extract project name
    const nameMatch = content.match(/\*\*Name:\*\*\s*(.+)/i);
    if (nameMatch) sections.name = nameMatch[1].trim();
    
    // Extract tech stack
    const techStackMatch = content.match(/\*\*Tech Stack:\*\*\s*(.+)/i);
    if (techStackMatch) sections.techStack = techStackMatch[1].trim();
    
    // Extract entry points
    const entryPointsSection = content.match(/\*\*Entrypoints:\*\*([\s\S]*?)(?=\*\*|##|$)/i);
    if (entryPointsSection) {
      sections.entryPoints = (entryPointsSection[1].match(/`([^`]+)`/g) || []).map(m => m.replace(/`/g, ''));
    }
    
    // Extract endpoints
    const endpointsSection = content.match(/\*\*Endpoints:\*\*([\s\S]*?)(?=##|$)/i);
    if (endpointsSection) {
      sections.endpoints = (endpointsSection[1].match(/`(\w+)\s+([^`]+)`/g) || []);
    }
    
    return sections;
  }

  async validateManifestAge() {
    console.log('\n⏰ Validating Manifest Freshness...');
    
    const lastUpdated = new Date(this.manifest.lastUpdated);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
    
    if (daysSinceUpdate > 30) {
      this.warnings.push(`Manifest is ${daysSinceUpdate} days old - consider updating`);
    } else {
      console.log(`✅ Manifest is ${daysSinceUpdate} days old (acceptable)`);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All validations passed! Manifest is accurate.');
    } else {
      if (this.errors.length > 0) {
        console.log(`\n❌ ERRORS (${this.errors.length}):`);
        this.errors.forEach((error, i) => {
          console.log(`  ${i + 1}. ${error}`);
        });
      }
      
      if (this.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
        this.warnings.forEach((warning, i) => {
          console.log(`  ${i + 1}. ${warning}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    return this.errors.length === 0;
  }

  async validate() {
    console.log('🔍 Starting AI Project Manifest Validation...\n');
    
    const loaded = await this.loadManifest();
    if (!loaded) {
      this.printResults();
      return false;
    }

    await this.validatePackageJson();
    await this.validateEntryPoints();
    await this.validateKeyModules();
    await this.validateRelatedProjects();
    await this.validateCoreFunctions();
    await this.validateApiEndpoints();
    await this.validateTsConfig();
    await this.validateSchemaFiles();
    await this.validateManifestSync();
    await this.validateManifestAge();
    
    return this.printResults();
  }
}

// Run validation
const validator = new ManifestValidator();
const success = await validator.validate();
process.exit(success ? 0 : 1);
