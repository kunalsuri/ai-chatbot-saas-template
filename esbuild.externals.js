/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * External dependencies for esbuild server bundling
 * These dependencies will be loaded at runtime instead of bundled
 */
export const externals = [
  // Node.js built-ins
  'express', 'cors', 'helmet', 'compression', 'cookie-parser',
  'zod', 'bcryptjs', 'jsonwebtoken', 'multer', 'sharp',
  'fs', 'path', 'url', 'crypto', 'http', 'https', 'stream',
  'buffer', 'util', 'events', 'os', 'child_process',
  
  // Build tools
  'vite.config.ts', '@babel/preset-typescript/package.json',
  'lightningcss', 'fsevents',
  
  // Client-side libraries (shouldn't be in server bundle)
  '@tanstack/react-query', 'react', 'react-dom', 'framer-motion',
  'tailwindcss', '@radix-ui/*', 'lucide-react',
  'class-variance-authority', 'clsx', 'tailwind-merge',
  
  // Large dependencies that should be external
  'tsx', 'typescript', 'esbuild', 'vite'
];
