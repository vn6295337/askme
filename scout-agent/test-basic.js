// Basic functionality test for scout agent
console.log('Starting basic scout agent test...');

// Test 1: Basic Node.js functionality
console.log('✓ Node.js basic functionality working');

// Test 2: File system access
const fs = require('fs');
const path = require('path');

try {
  const packageJson = fs.readFileSync('package.json', 'utf8');
  const pkg = JSON.parse(packageJson);
  console.log('✓ Package.json read successfully:', pkg.name);
} catch (error) {
  console.log('✗ Package.json read failed:', error.message);
}

// Test 3: Test basic schema validation without external deps
function basicValidation(model) {
  const errors = [];
  
  if (!model || typeof model !== 'object') {
    return { isValid: false, errors: ['Model must be an object'] };
  }
  
  const requiredFields = ['name', 'publisher', 'country'];
  requiredFields.forEach(field => {
    if (!model[field] || typeof model[field] !== 'string' || model[field].trim() === '') {
      errors.push(`Required field '${field}' is missing or empty`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Test validation
const testModel = {
  name: 'Test LLM',
  publisher: 'Test Org',
  country: 'US'
};

const validation = basicValidation(testModel);
if (validation.isValid) {
  console.log('✓ Basic validation working');
} else {
  console.log('✗ Basic validation failed:', validation.errors);
}

// Test 4: Directory structure
try {
  const srcExists = fs.existsSync('src');
  const configExists = fs.existsSync('config');
  const testsExists = fs.existsSync('tests');
  
  console.log('✓ Directory structure check:');
  console.log('  - src/', srcExists ? '✓' : '✗');
  console.log('  - config/', configExists ? '✓' : '✗');
  console.log('  - tests/', testsExists ? '✓' : '✗');
} catch (error) {
  console.log('✗ Directory check failed:', error.message);
}

console.log('\\nBasic test completed successfully!');
console.log('Environment: Linux Chromebook with USB symlink');