const fs = require('fs');
const data = JSON.parse(fs.readFileSync('output/latest.json', 'utf8'));

console.log('Analyzing', data.models.length, 'models...');

// Filter criteria
const excludeCountries = ['CN', 'China'];
const localOnlyKeywords = ['ollama', 'gguf', 'lm studio', 'local', 'offline', 'desktop', 'llamacpp', 'gpt4all-local'];
const paymentKeywords = ['paid', 'subscription', 'premium', 'enterprise-only'];

// Get unique countries and access types for analysis
const countries = [...new Set(data.models.map(m => m.country))].sort();
const accessTypes = [...new Set(data.models.map(m => m.accessType))].sort();

console.log('\nCountries found:', countries);
console.log('\nAccess types found:', accessTypes);

// Detailed filtering
const eligible = data.models.filter(model => {
  // Exclude China-based models
  if (excludeCountries.includes(model.country)) return false;
  
  // Exclude local-only models
  const nameAndDesc = (model.name + ' ' + (model.description || '')).toLowerCase();
  if (localOnlyKeywords.some(keyword => nameAndDesc.includes(keyword))) return false;
  
  // Must be API accessible (check access type)
  if (model.accessType === 'Local Only' || model.accessType === 'Desktop Only') return false;
  
  return true;
});

console.log('\nFiltered results:', eligible.length, 'eligible models out of', data.models.length);

// Group by likely API providers
const apiProviders = {};
eligible.forEach(model => {
  let provider = 'Unknown';
  
  if (model.sourceUrl && model.sourceUrl.includes('openai.com')) provider = 'OpenAI';
  else if (model.sourceUrl && model.sourceUrl.includes('anthropic.com')) provider = 'Anthropic';
  else if (model.sourceUrl && (model.sourceUrl.includes('google.com') || model.name.toLowerCase().includes('gemini'))) provider = 'Google';
  else if (model.sourceUrl && (model.sourceUrl.includes('together.ai') || model.sourceUrl.includes('together.xyz'))) provider = 'Together AI';
  else if (model.sourceUrl && model.sourceUrl.includes('mistral.ai')) provider = 'Mistral';
  else if (model.sourceUrl && model.sourceUrl.includes('cohere.com')) provider = 'Cohere';
  else if (model.sourceUrl && (model.sourceUrl.includes('meta.com') || model.name.toLowerCase().includes('llama'))) provider = 'Meta/Together';
  else if (model.sourceUrl && model.sourceUrl.includes('huggingface.co')) provider = 'HuggingFace';
  else if (model.sourceUrl && model.sourceUrl.includes('github.com')) provider = 'GitHub/Open Source';
  
  if (!apiProviders[provider]) apiProviders[provider] = [];
  apiProviders[provider].push(model);
});

console.log('\nModels by potential API provider:');
Object.keys(apiProviders).sort().forEach(provider => {
  console.log(`${provider}: ${apiProviders[provider].length} models`);
});

// Save filtered results for further processing
fs.writeFileSync('filtered-models.json', JSON.stringify({
  totalOriginal: data.models.length,
  totalFiltered: eligible.length,
  filterCriteria: {
    excludedCountries: excludeCountries,
    excludedKeywords: localOnlyKeywords
  },
  modelsByProvider: apiProviders,
  models: eligible
}, null, 2));

console.log('\nFiltered models saved to filtered-models.json');