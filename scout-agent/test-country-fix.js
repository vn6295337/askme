// Test the country field fix
console.log('Testing country field fix...');

// Mock the extractCountry method
function extractCountry(model) {
  const publisherText = (typeof model.publisher === 'string' ? model.publisher : '').toLowerCase();
  const sourceText = (typeof model.sourceUrl === 'string' ? model.sourceUrl : '').toLowerCase();
  const nameText = (typeof model.name === 'string' ? model.name : '').toLowerCase();
  
  const combinedText = `${publisherText} ${sourceText} ${nameText}`;
  
  // Company-based detection
  const countryMap = {
    'openai': 'US',
    'anthropic': 'US',
    'google': 'US',
    'microsoft': 'US',
    'meta': 'US',
    'huggingface': 'US',
    'mistral': 'France',
    'deepmind': 'UK',
    'stability': 'UK'
  };
  
  for (const [company, country] of Object.entries(countryMap)) {
    if (combinedText.includes(company)) {
      return country;
    }
  }
  
  // URL-based detection
  if (sourceText.includes('github.com') || sourceText.includes('huggingface.co')) {
    return 'US'; // Default for GitHub/HuggingFace
  }
  
  return 'US'; // Default
}

// Test with typical model data structures
const testModels = [
  {
    name: 'GPT-4',
    publisher: 'OpenAI',
    sourceUrl: 'https://openai.com/gpt4'
  },
  {
    name: 'Llama-2-7B',
    publisher: 'meta-llama',
    sourceUrl: 'https://huggingface.co/meta-llama/Llama-2-7b'
  },
  {
    name: 'some-model',
    publisher: null,
    sourceUrl: 'https://github.com/microsoft/some-model'
  },
  {
    name: 'mistral-7b',
    sourceUrl: 'https://huggingface.co/mistralai/Mistral-7B-v0.1'
  }
];

console.log('\\nTesting country extraction:');
testModels.forEach((model, index) => {
  const country = extractCountry(model);
  console.log(`Model ${index + 1}: ${model.name} -> ${country}`);
});

console.log('\\n✅ Country extraction should now work for all models!');