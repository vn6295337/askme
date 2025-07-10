#!/usr/bin/env node

// This script helps run the scout-agent locally by setting up the correct paths
// to work around the ChromeOS symlink/mount issue

const path = require('path');
const fs = require('fs');

// Add the actual node_modules to the module search path
const realProjectPath = '/home/km_project/askme/scout-agent';
const nodeModulesPath = path.join(realProjectPath, 'node_modules');

// Check if node_modules exists
if (fs.existsSync(nodeModulesPath)) {
  // Add to NODE_PATH
  process.env.NODE_PATH = nodeModulesPath + ':' + (process.env.NODE_PATH || '');
  
  // Require the Module module to update the paths
  const Module = require('module');
  const originalResolveFilename = Module._resolveFilename;
  
  Module._resolveFilename = function(request, parent, isMain) {
    // For non-relative requires, try to resolve from our node_modules first
    if (!request.startsWith('./') && !request.startsWith('../') && !path.isAbsolute(request)) {
      try {
        // Try direct module path first
        const modulePath = path.join(nodeModulesPath, request);
        if (fs.existsSync(modulePath)) {
          // Check if it's a directory with package.json
          const packagePath = path.join(modulePath, 'package.json');
          if (fs.existsSync(packagePath)) {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const mainFile = packageData.main || 'index.js';
            const mainPath = path.join(modulePath, mainFile);
            if (fs.existsSync(mainPath)) {
              return mainPath;
            }
          }
          // Check if it's a direct JS file
          const jsPath = modulePath + '.js';
          if (fs.existsSync(jsPath)) {
            return jsPath;
          }
          // Check if it's a directory with index.js
          const indexPath = path.join(modulePath, 'index.js');
          if (fs.existsSync(indexPath)) {
            return indexPath;
          }
        }
      } catch (e) {
        // Fall back to original resolution
      }
    }
    
    return originalResolveFilename.call(this, request, parent, isMain);
  };
}

// Set the working directory to the real project path
process.chdir(realProjectPath);

// Now require and run the main script
try {
  const { main } = require('./src/index.js');
  main().catch(error => {
    console.error('Error running scout-agent:', error.message);
    process.exit(1);
  });
} catch (error) {
  console.error('Error loading scout-agent:', error.message);
  process.exit(1);
}