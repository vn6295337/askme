const path = require('path');
const fs = require('fs');
const Module = require('module');

// Get the real project path
const realProjectPath = '/home/km_project/askme/scout-agent';
const nodeModulesPath = path.join(realProjectPath, 'node_modules');

// Override Module._resolveFilename to handle path resolution
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function(request, parent, isMain) {
  // For non-relative requires, try to resolve from our real node_modules first
  if (!request.startsWith('./') && !request.startsWith('../') && !path.isAbsolute(request)) {
    try {
      // Check if the module exists in our real node_modules
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
        
        // Check if it's a directory with index.js
        const indexPath = path.join(modulePath, 'index.js');
        if (fs.existsSync(indexPath)) {
          return indexPath;
        }
        
        // Check if it's a direct JS file
        const jsPath = modulePath + '.js';
        if (fs.existsSync(jsPath)) {
          return jsPath;
        }
      }
    } catch (e) {
      // Fall back to original resolution
    }
  }
  
  return originalResolveFilename.call(this, request, parent, isMain);
};