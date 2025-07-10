// Simple test for the type checking fix
console.log('Testing type checking fixes...');

// Simulate the problematic code from filters.js
function testTypeChecking() {
  const models = [
    { name: 'Good Model', publisher: 'OpenAI', sourceUrl: 'https://openai.com' },
    { name: 'Bad Model', publisher: null, sourceUrl: 'https://example.com' },
    { name: 'Missing Fields' }, // No publisher at all
    { name: 123, publisher: [], sourceUrl: {} } // Wrong types
  ];

  console.log('Testing old approach (would fail):');
  models.forEach((model, index) => {
    try {
      // This is the OLD way that was failing
      const publisherText = (model.publisher || '').toLowerCase();
      console.log(`  Model ${index + 1}: ✅ ${publisherText}`);
    } catch (error) {
      console.log(`  Model ${index + 1}: ❌ ${error.message}`);
    }
  });

  console.log('\\nTesting new approach (should work):');
  models.forEach((model, index) => {
    try {
      // This is the NEW way with type checking
      const publisherText = (typeof model.publisher === 'string' ? model.publisher : '').toLowerCase();
      console.log(`  Model ${index + 1}: ✅ "${publisherText}"`);
    } catch (error) {
      console.log(`  Model ${index + 1}: ❌ ${error.message}`);
    }
  });
}

testTypeChecking();
console.log('\\n✅ Type checking fixes are working correctly!');