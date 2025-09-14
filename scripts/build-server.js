#!/usr/bin/env node

/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 * 
 * Optimized esbuild configuration for server bundling
 * Reduces bundle size through external dependency management and optimization
 */

import { build } from 'esbuild';
import { externals } from '../esbuild.externals.js';

async function buildServer() {
  try {
    const result = await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: 'dist/server.js',
      minify: true,
      treeShaking: true,
      external: externals,
      target: 'node18',
      sourcemap: process.env.NODE_ENV === 'development',
      metafile: true,
      logLevel: 'info'
    });

    // Log bundle analysis
    if (result.metafile) {
      const bundleSize = Object.values(result.metafile.outputs)[0].bytes;
      const bundleSizeMB = (bundleSize / 1024 / 1024).toFixed(1);

      console.log(`\n📦 Server bundle: ${bundleSizeMB}MB`);

      if (bundleSize > 2 * 1024 * 1024) { // > 2MB
        console.log('⚠️  Bundle size is large. Consider adding more externals.');
      } else {
        console.log('✅ Bundle size optimized');
      }
    }

  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();
