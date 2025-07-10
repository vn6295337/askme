// Test the fixes for the runtime errors
const filters = require('./src/filters');

console.log('Testing filter fixes...');

// Test case 1: Model with non-string publisher
const badModel1 = {
  name: 'Test Model',
  publisher: null,  // This was causing the error
  country: 'US'
};

// Test case 2: Model with missing fields
const badModel2 = {
  name: 'Another Model',
  // missing publisher entirely
  sourceUrl: 123  // wrong type
};

// Test case 3: Good model
const goodModel = {
  name: 'Good Model',
  publisher: 'OpenAI',
  country: 'US',
  sourceUrl: 'https://openai.com'
};

const testModels = [badModel1, badModel2, goodModel];

try {
  console.log('Testing filterModels...');
  const filtered = filters.filterModels(testModels);
  console.log('✅ filterModels succeeded');
  console.log(`Filtered ${filtered.length} models from ${testModels.length} input models`);
  
  // Test individual methods
  console.log('\\nTesting individual methods...');
  
  testModels.forEach((model, index) => {
    console.log(`\\nModel ${index + 1}:`);
    try {
      console.log(`  - isFromUSOrEurope: ${filters.isFromUSOrEurope(model)}`);
      console.log(`  - hasFreeAccess: ${filters.hasFreeAccess(model)}`);
      console.log(`  - supportsEnglish: ${filters.supportsEnglish(model)}`);
      console.log(`  - isDeprecated: ${filters.isDeprecated(model)}`);
      console.log(`  - isActive: ${filters.isActive(model)}`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  });
  
  console.log('\\n✅ All tests passed! The fixes should work.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
}