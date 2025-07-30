#!/usr/bin/env node
/**
 * StormVerse Binary Builder
 * Creates standalone executable for StormVerse Server
 * Copyright (c) 2025 Daniel Guzman - All Rights Reserved
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function buildBinary() {
  console.log(`
════════════════════════════════════════════════════════════
           STORMVERSE BINARY BUILDER
════════════════════════════════════════════════════════════
  Creator: Daniel Guzman
  Project: StormVerse AI Network
  ARCSEC Protocol: v3.0X
════════════════════════════════════════════════════════════
`);

  try {
    // Step 1: Build the TypeScript server
    console.log('[BUILD] Compiling TypeScript server...');
    await execAsync('npx tsc stormverse-server.ts --module esnext --target es2020 --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop');
    
    // Step 2: Build the client
    console.log('[BUILD] Building client application...');
    await execAsync('cd client && npm run build');
    
    // Step 3: Create package.json for binary
    const pkgConfig = {
      name: "stormverse-server",
      version: "1.0.0",
      description: "StormVerse Environmental Intelligence Platform",
      author: "Daniel Guzman",
      license: "All Rights Reserved",
      main: "stormverse-server.js",
      bin: "stormverse-server.js",
      pkg: {
        scripts: ["server/**/*.js", "stormverse-server.js"],
        assets: ["client/dist/**/*", "attached_assets/**/*"],
        targets: ["node18-linux-x64", "node18-win-x64", "node18-macos-x64"],
        outputPath: "bin"
      }
    };
    
    await fs.writeFile('pkg-config.json', JSON.stringify(pkgConfig, null, 2));
    
    // Step 4: Create binaries using pkg
    console.log('[BUILD] Creating standalone binaries...');
    await execAsync('npx pkg pkg-config.json --out-path bin');
    
    // Step 5: Create start scripts
    const startScript = `#!/bin/bash
# StormVerse Server Launcher
# Copyright (c) 2025 Daniel Guzman - All Rights Reserved

echo "Starting StormVerse Server..."
echo "ARCSEC Protocol v3.0X - WAR MODE"
echo ""

export NODE_ENV=production
export PORT=5000

./bin/stormverse-server-linux
`;
    
    const startScriptWindows = `@echo off
REM StormVerse Server Launcher
REM Copyright (c) 2025 Daniel Guzman - All Rights Reserved

echo Starting StormVerse Server...
echo ARCSEC Protocol v3.0X - WAR MODE
echo.

set NODE_ENV=production
set PORT=5000

bin\\stormverse-server-win.exe
`;
    
    await fs.writeFile('start-stormverse.sh', startScript);
    await fs.chmod('start-stormverse.sh', 0o755);
    await fs.writeFile('start-stormverse.bat', startScriptWindows);
    
    console.log(`
════════════════════════════════════════════════════════════
           BUILD COMPLETE
════════════════════════════════════════════════════════════
  
  Binaries created in ./bin directory:
  - stormverse-server-linux (Linux x64)
  - stormverse-server-win.exe (Windows x64)
  - stormverse-server-macos (macOS x64)
  
  Start scripts:
  - ./start-stormverse.sh (Linux/macOS)
  - start-stormverse.bat (Windows)
  
  Owner: Daniel Guzman
  ARCSEC Protected: YES
  
════════════════════════════════════════════════════════════
`);
    
  } catch (error) {
    console.error('[BUILD ERROR]', error);
    process.exit(1);
  }
}

buildBinary();