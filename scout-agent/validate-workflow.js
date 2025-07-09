// GitHub Actions workflow validation script
const fs = require('fs');
const path = require('path');

console.log('Validating GitHub Actions workflow...');

// Check 1: Workflow file exists
const workflowPath = '.github/workflows/scout-agent.yml';
if (!fs.existsSync(workflowPath)) {
  console.log('✗ Workflow file not found:', workflowPath);
  process.exit(1);
}
console.log('✓ Workflow file exists');

// Check 2: Read and validate workflow structure
try {
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  
  // Basic YAML structure checks
  const requiredSections = [
    'name:',
    'on:',
    'jobs:',
    'runs-on:',
    'steps:'
  ];
  
  requiredSections.forEach(section => {
    if (workflowContent.includes(section)) {
      console.log(`✓ Required section found: ${section}`);
    } else {
      console.log(`✗ Missing required section: ${section}`);
    }
  });
  
  // Check 3: Validate cron schedule
  if (workflowContent.includes("'0 2 * * 0'")) {
    console.log('✓ Cron schedule configured (Sunday 2 AM UTC)');
  } else {
    console.log('✗ Cron schedule not found or incorrect');
  }
  
  // Check 4: Required secrets references
  const requiredSecrets = [
    'BACKEND_URL',
    'AGENT_AUTH_TOKEN'
  ];
  
  requiredSecrets.forEach(secret => {
    if (workflowContent.includes(`secrets.${secret}`)) {
      console.log(`✓ Secret reference found: ${secret}`);
    } else {
      console.log(`✗ Missing secret reference: ${secret}`);
    }
  });
  
  // Check 5: Actions versions
  const actionVersions = {
    'actions/checkout@v4': '✓ Latest checkout action',
    'actions/setup-node@v4': '✓ Latest Node.js setup action',
    'actions/upload-artifact@v4': '✓ Latest artifact upload action',
    'actions/github-script@v7': '✓ Latest GitHub script action'
  };
  
  Object.entries(actionVersions).forEach(([action, message]) => {
    if (workflowContent.includes(action)) {
      console.log(message);
    } else {
      console.log(`⚠ Action not found or outdated: ${action}`);
    }
  });
  
  // Check 6: Error handling
  const errorHandling = [
    'if: always()',
    'if: failure()',
    'if: success()'
  ];
  
  errorHandling.forEach(condition => {
    if (workflowContent.includes(condition)) {
      console.log(`✓ Error handling condition: ${condition}`);
    }
  });
  
} catch (error) {
  console.log('✗ Error reading workflow file:', error.message);
  process.exit(1);
}

// Check 7: Package.json scripts
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['start', 'test'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✓ Package.json script found: ${script}`);
    } else {
      console.log(`✗ Missing package.json script: ${script}`);
    }
  });
  
} catch (error) {
  console.log('✗ Error reading package.json:', error.message);
}

// Check 8: Directory structure for workflow
const requiredDirs = ['src', 'config', 'tests'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✓ Required directory exists: ${dir}/`);
  } else {
    console.log(`✗ Missing required directory: ${dir}/`);
  }
});

console.log('\\n✓ Workflow validation completed');
console.log('\\nNext steps:');
console.log('1. Add secrets to GitHub repository settings');
console.log('2. Test workflow with manual trigger');
console.log('3. Monitor first automated run');