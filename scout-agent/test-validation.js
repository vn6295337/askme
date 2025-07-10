const { validateLLMData } = require('./src/schemas/llm-model');

// Test data that should now pass validation
const testModel = {
  name: 'Test Model',
  publisher: 'Test Publisher',
  country: 'Unknown', // This was the missing field
  accessType: 'Open Source',
  license: 'MIT',
  sourceUrl: 'https://github.com/test/model'
};

console.log('Testing model validation...');
const result = validateLLMData(testModel);

if (result.isValid) {
  console.log('✅ Model validation PASSED - all required fields present');
} else {
  console.log('❌ Model validation FAILED:', result.errors);
}

// Test a model missing the country field (old style)
const oldModel = {
  name: 'Old Model',
  publisher: 'Old Publisher',
  accessType: 'Open Source'
  // Missing country field
};

console.log('\nTesting old model without country field...');
const oldResult = validateLLMData(oldModel);

if (!oldResult.isValid) {
  console.log('✅ Old model correctly FAILED validation:', oldResult.errors);
} else {
  console.log('❌ Old model unexpectedly PASSED validation');
}