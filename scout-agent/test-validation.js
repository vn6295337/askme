const { validateLLMData } = require('./src/schemas/llm-model');

// Test cases that were failing
const testModels = [
  {
    name: 'Test Model 1',
    publisher: 'Test Publisher',
    country: 'US',
    modelSize: '5B'
  },
  {
    name: 'Test Model 2',
    publisher: 'Test Publisher',
    country: 'US',
    modelSize: '6B'
  },
  {
    name: 'Test Model 3',
    publisher: 'Test Publisher',
    country: 'US',
    modelSize: '7.5B'
  }
];

console.log('Testing model size validation fixes...');

testModels.forEach((model, index) => {
  const result = validateLLMData(model);
  console.log(`\nTest ${index + 1}: ${model.name}`);
  console.log(`Model Size: ${model.modelSize}`);
  console.log(`Valid: ${result.isValid}`);
  if (!result.isValid) {
    console.log(`Errors: ${result.errors.join(', ')}`);
  }
});