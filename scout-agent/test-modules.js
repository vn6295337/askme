const path = require('path');
const fs = require('fs');

console.log('Current working directory:', process.cwd());
console.log('Real project path:', '/home/km_project/askme/scout-agent');

// Test if node_modules exists
const nodeModulesPath = '/home/km_project/askme/scout-agent/node_modules';
console.log('Node modules exists:', fs.existsSync(nodeModulesPath));

// Test if axios exists
const axiosPath = path.join(nodeModulesPath, 'axios');
console.log('Axios path:', axiosPath);
console.log('Axios exists:', fs.existsSync(axiosPath));

if (fs.existsSync(axiosPath)) {
  const axiosPackage = path.join(axiosPath, 'package.json');
  console.log('Axios package.json exists:', fs.existsSync(axiosPackage));
  
  if (fs.existsSync(axiosPackage)) {
    const packageData = JSON.parse(fs.readFileSync(axiosPackage, 'utf8'));
    console.log('Axios main file:', packageData.main);
    
    const mainFile = path.join(axiosPath, packageData.main);
    console.log('Axios main file path:', mainFile);
    console.log('Axios main file exists:', fs.existsSync(mainFile));
  }
}

// Check Node.js module resolution paths
console.log('Module paths:', require.resolve.paths('axios'));