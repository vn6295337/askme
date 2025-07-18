const fs = require('fs');

// API Provider links from research
const apiLinks = {
  'Cohere': {
    documentation: 'https://docs.cohere.com/',
    apiBase: 'https://api.cohere.ai/v1/',
    signup: 'https://dashboard.cohere.ai/register',
    models: 'https://docs.cohere.com/docs/models'
  },
  'Together AI': {
    documentation: 'https://docs.together.ai/',
    apiBase: 'https://api.together.xyz/v1/',
    signup: 'https://api.together.ai/signup',
    models: 'https://docs.together.ai/docs/inference-models'
  },
  'Groq': {
    documentation: 'https://console.groq.com/docs/',
    apiBase: 'https://api.groq.com/openai/v1/',
    signup: 'https://console.groq.com/',
    models: 'https://console.groq.com/docs/models'
  },
  'HuggingFace': {
    documentation: 'https://huggingface.co/docs/api-inference/',
    apiBase: 'https://api-inference.huggingface.co/models/',
    signup: 'https://huggingface.co/join',
    models: 'https://huggingface.co/models'
  },
  'OpenRouter': {
    documentation: 'https://openrouter.ai/docs/',
    apiBase: 'https://openrouter.ai/api/v1/',
    signup: 'https://openrouter.ai/auth',
    models: 'https://openrouter.ai/models'
  },
  'AI21': {
    documentation: 'https://docs.ai21.com/',
    apiBase: 'https://api.ai21.com/studio/v1/',
    signup: 'https://studio.ai21.com/sign-up',
    models: 'https://docs.ai21.com/docs/jurassic-2-models'
  },
  'Replicate': {
    documentation: 'https://replicate.com/docs/',
    apiBase: 'https://api.replicate.com/v1/',
    signup: 'https://replicate.com/signin',
    models: 'https://replicate.com/explore'
  },
  'Fireworks AI': {
    documentation: 'https://docs.fireworks.ai/',
    apiBase: 'https://api.fireworks.ai/inference/v1/',
    signup: 'https://fireworks.ai/login',
    models: 'https://docs.fireworks.ai/models'
  },
  'Perplexity': {
    documentation: 'https://docs.perplexity.ai/',
    apiBase: 'https://api.perplexity.ai/',
    signup: 'https://www.perplexity.ai/settings/api',
    models: 'https://docs.perplexity.ai/docs/model-cards'
  }
};

console.log('API Links Summary\n=================\n');

// Generate markdown list
let markdown = '# API Provider Links\n\n';
markdown += 'Complete list of API endpoints, documentation, and signup links for language model providers.\n\n';

Object.keys(apiLinks).forEach(provider => {
  const links = apiLinks[provider];
  
  console.log(`${provider}:`);
  console.log(`  Documentation: ${links.documentation}`);
  console.log(`  API Base URL:  ${links.apiBase}`);
  console.log(`  Signup:        ${links.signup}`);
  console.log(`  Models:        ${links.models}`);
  console.log('');
  
  markdown += `## ${provider}\n\n`;
  markdown += `- **Documentation:** ${links.documentation}\n`;
  markdown += `- **API Base URL:** ${links.apiBase}\n`;
  markdown += `- **Signup/Console:** ${links.signup}\n`;
  markdown += `- **Models List:** ${links.models}\n\n`;
});

// Add integration examples
markdown += '## Integration Examples\n\n';
markdown += '### Standard Chat Completion Pattern\n\n';
markdown += 'Most providers follow OpenAI-compatible format:\n\n';
markdown += '```bash\n';
markdown += 'curl -X POST {API_BASE_URL}/chat/completions \\\n';
markdown += '  -H "Authorization: Bearer {API_KEY}" \\\n';
markdown += '  -H "Content-Type: application/json" \\\n';
markdown += '  -d \'{\n';
markdown += '    "model": "model-name",\n';
markdown += '    "messages": [{"role": "user", "content": "Hello"}],\n';
markdown += '    "max_tokens": 500\n';
markdown += '  }\'\n';
markdown += '```\n\n';

markdown += '### Provider-Specific Endpoints\n\n';
markdown += '**Cohere** (Custom format):\n';
markdown += '```bash\n';
markdown += 'curl -X POST https://api.cohere.ai/v1/chat \\\n';
markdown += '  -H "Authorization: Bearer {API_KEY}" \\\n';
markdown += '  -d \'{"message": "Hello", "model": "command"}\'\n';
markdown += '```\n\n';

markdown += '**HuggingFace** (Model-specific):\n';
markdown += '```bash\n';
markdown += 'curl -X POST https://api-inference.huggingface.co/models/{model-name} \\\n';
markdown += '  -H "Authorization: Bearer {HF_TOKEN}" \\\n';
markdown += '  -d \'{"inputs": "Hello"}\'\n';
markdown += '```\n\n';

// Save results
fs.writeFileSync('api-links.json', JSON.stringify(apiLinks, null, 2));
fs.writeFileSync('api-links.md', markdown);

console.log('API links saved to:');
console.log('- api-links.json (structured data)');
console.log('- api-links.md (markdown format)');

// Create quick reference for backend integration
const quickRef = {
  environmentVariables: Object.keys(apiLinks).map(provider => 
    `${provider.toUpperCase().replace(/\s+/g, '_')}_API_KEY`
  ),
  apiBaseUrls: Object.fromEntries(
    Object.entries(apiLinks).map(([provider, data]) => [provider, data.apiBase])
  ),
  authHeaders: {
    'standard': 'Authorization: Bearer {API_KEY}',
    'cohere': 'Authorization: Bearer {API_KEY}',
    'huggingface': 'Authorization: Bearer {HF_TOKEN}'
  }
};

fs.writeFileSync('backend-integration-ref.json', JSON.stringify(quickRef, null, 2));
console.log('- backend-integration-ref.json (integration reference)');