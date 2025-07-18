const fs = require('fs');
const filteredData = JSON.parse(fs.readFileSync('filtered-models.json', 'utf8'));

console.log('Researching API availability for filtered models...');

// API Provider configurations based on research
const apiProviders = {
  'Cohere': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.cohere.com/',
    notes: 'Trial API key, rate-limited access to all endpoints',
    models: ['command', 'command-light', 'command-nightly', 'embed-english-v2.0']
  },
  'Together AI': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.together.ai/',
    notes: '$1-25 free credits, 60 requests/minute',
    models: ['meta-llama/Llama-2-7b-chat-hf', 'meta-llama/Llama-2-13b-chat-hf', 'meta-llama/Meta-Llama-3-8B-Instruct', 'meta-llama/Meta-Llama-3-70B-Instruct', 'mistralai/Mixtral-8x7B-Instruct-v0.1']
  },
  'HuggingFace': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'Bearer Token',
    documentationUrl: 'https://huggingface.co/docs/api-inference/',
    notes: 'Monthly credits for serverless inference API',
    models: ['gpt2', 'microsoft/DialoGPT-medium', 'facebook/blenderbot-400M-distill']
  },
  'Groq': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key (OpenAI compatible)',
    documentationUrl: 'https://console.groq.com/docs/',
    notes: 'Rate limits apply, extremely fast inference',
    models: ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it']
  },
  'OpenRouter': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://openrouter.ai/docs/',
    notes: '50 requests/day free, 1000/day with $5 purchase',
    models: ['openai/gpt-3.5-turbo', 'anthropic/claude-instant-v1', 'meta-llama/llama-2-7b-chat']
  },
  'AI21': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.ai21.com/',
    notes: '$10 credit for 3 months initially',
    models: ['j2-light', 'j2-mid', 'j2-ultra']
  },
  'Replicate': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://replicate.com/docs/',
    notes: 'Limited compute credits initially, pay-per-second after',
    models: ['stability-ai/stable-diffusion', 'meta/llama-2-7b-chat', 'mistralai/mixtral-8x7b-instruct-v0.1']
  }
};

// Process filtered models and match to API providers
const apiEligibleModels = [];

filteredData.models.forEach(model => {
  let apiProvider = null;
  let providerInfo = null;

  // Match models to API providers
  if (model.name.toLowerCase().includes('cohere') || model.sourceUrl?.includes('cohere.com')) {
    apiProvider = 'Cohere';
    providerInfo = apiProviders['Cohere'];
  } else if (model.sourceUrl?.includes('together.ai') || model.name.toLowerCase().includes('llama')) {
    apiProvider = 'Together AI';
    providerInfo = apiProviders['Together AI'];
  } else if (model.sourceUrl?.includes('huggingface.co')) {
    apiProvider = 'HuggingFace';
    providerInfo = apiProviders['HuggingFace'];
  } else if (model.name.toLowerCase().includes('groq')) {
    apiProvider = 'Groq';
    providerInfo = apiProviders['Groq'];
  } else if (model.name.toLowerCase().includes('mixtral') || model.name.toLowerCase().includes('mistral')) {
    // Many Mixtral models available via Together AI or OpenRouter
    apiProvider = 'Together AI / OpenRouter';
    providerInfo = apiProviders['Together AI'];
  } else if (model.name.toLowerCase().includes('gpt') && model.accessType === 'Open Source') {
    // Open source GPT models might be available via HuggingFace
    apiProvider = 'HuggingFace';
    providerInfo = apiProviders['HuggingFace'];
  }

  // Add to eligible list if API provider found
  if (apiProvider && providerInfo) {
    apiEligibleModels.push({
      modelName: model.name,
      provider: apiProvider,
      apiAvailable: providerInfo.apiAvailable,
      registrationRequired: providerInfo.registrationRequired,
      freeTier: providerInfo.freeTier,
      authMethod: providerInfo.authMethod,
      documentationUrl: providerInfo.documentationUrl,
      notes: providerInfo.notes,
      originalModel: model
    });
  }
});

// Add popular models that we know are available via APIs but might not be in the discovered list
const additionalApiModels = [
  {
    modelName: 'Command',
    provider: 'Cohere',
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.cohere.com/',
    notes: 'Trial API key, rate-limited access to all endpoints'
  },
  {
    modelName: 'Command Light',
    provider: 'Cohere',
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.cohere.com/',
    notes: 'Faster, smaller version of Command model'
  },
  {
    modelName: 'Llama-2-7B-Chat',
    provider: 'Together AI',
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.together.ai/',
    notes: 'Popular open-source model, $1-25 free credits'
  },
  {
    modelName: 'Mixtral-8x7B-Instruct',
    provider: 'Together AI',
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.together.ai/',
    notes: 'High-performance mixture of experts model'
  },
  {
    modelName: 'Llama-2-70B-Chat',
    provider: 'Groq',
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key (OpenAI compatible)',
    documentationUrl: 'https://console.groq.com/docs/',
    notes: 'Extremely fast inference speed, rate limits apply'
  },
  {
    modelName: 'Gemma-7B-IT',
    provider: 'Groq',
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key (OpenAI compatible)',
    documentationUrl: 'https://console.groq.com/docs/',
    notes: 'Google Gemma model optimized for instruction following'
  },
  {
    modelName: 'GPT-3.5-Turbo (via proxy)',
    provider: 'OpenRouter',
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://openrouter.ai/docs/',
    notes: '50 requests/day free, access to multiple model providers'
  },
  {
    modelName: 'Jurassic-2-Light',
    provider: 'AI21',
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.ai21.com/',
    notes: '$10 credit for 3 months, optimized for speed'
  }
];

// Combine discovered and additional models
const allApiModels = [...apiEligibleModels, ...additionalApiModels];

console.log(`Found ${apiEligibleModels.length} API-eligible models from discovery`);
console.log(`Added ${additionalApiModels.length} additional known API models`);
console.log(`Total API-accessible models: ${allApiModels.length}`);

// Save results
fs.writeFileSync('api-eligible-models.json', JSON.stringify({
  totalApiModels: allApiModels.length,
  discoveredApiModels: apiEligibleModels.length,
  additionalApiModels: additionalApiModels.length,
  providers: Object.keys(apiProviders),
  models: allApiModels
}, null, 2));

console.log('API-eligible models saved to api-eligible-models.json');

// Generate markdown table
let markdown = '# API-Accessible Language Models for askme CLI\n\n';
markdown += '## Summary\n';
markdown += `Total API-accessible models identified: **${allApiModels.length}**\n`;
markdown += `API providers with free tiers: **${Object.keys(apiProviders).length}**\n\n`;

markdown += '## Eligible Models Table\n\n';
markdown += '| Model Name | Provider | API Available | Registration Required | Free Tier | Auth Method | Documentation URL | Notes |\n';
markdown += '|------------|----------|---------------|----------------------|-----------|-------------|-------------------|-------|\n';

allApiModels.forEach(model => {
  const name = (model.modelName || '').replace(/\|/g, '\\|');
  const provider = (model.provider || '').replace(/\|/g, '\\|');
  const apiAvailable = model.apiAvailable ? 'Yes' : 'No';
  const registrationRequired = model.registrationRequired ? 'Yes' : 'No';
  const freeTier = model.freeTier ? 'Yes' : 'No';
  const authMethod = (model.authMethod || '').replace(/\|/g, '\\|');
  const docUrl = model.documentationUrl || '';
  const notes = (model.notes || '').replace(/\|/g, '\\|');
  
  markdown += `| ${name} | ${provider} | ${apiAvailable} | ${registrationRequired} | ${freeTier} | ${authMethod} | ${docUrl} | ${notes} |\n`;
});

markdown += '\n## Integration Notes\n\n';
markdown += '### Authentication Pattern\n';
markdown += 'All identified API providers use standard API key authentication that is compatible with the existing askme backend architecture:\n\n';
markdown += '```javascript\n';
markdown += '// Backend environment variables\n';
markdown += 'const API_KEYS = {\n';
markdown += '  cohere: process.env.COHERE_API_KEY,\n';
markdown += '  together: process.env.TOGETHER_API_KEY,\n';
markdown += '  groq: process.env.GROQ_API_KEY,\n';
markdown += '  openrouter: process.env.OPENROUTER_API_KEY,\n';
markdown += '  ai21: process.env.AI21_API_KEY,\n';
markdown += '  huggingface: process.env.HUGGINGFACE_API_KEY\n';
markdown += '};\n';
markdown += '```\n\n';

markdown += '### Recommended Implementation Priority\n';
markdown += '1. **Cohere API** - Full free access, robust models\n';
markdown += '2. **Together AI** - Excellent Llama/Mixtral models, generous credits\n';
markdown += '3. **Groq** - Ultra-fast inference, good for real-time use\n';
markdown += '4. **HuggingFace** - Wide model selection, community-driven\n';
markdown += '5. **OpenRouter** - Access to multiple providers through one API\n';
markdown += '6. **AI21** - Good initial credits, enterprise-quality models\n\n';

fs.writeFileSync('api-models-report.md', markdown);
console.log('Markdown report saved to api-models-report.md');