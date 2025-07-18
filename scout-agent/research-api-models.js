#!/usr/bin/env node

const https = require('https');
const { promisify } = require('util');
const fs = require('fs');

const writeFile = promisify(fs.writeFile);

// CLI argument parsing
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(arg => arg.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const PROVIDERS = getArg('providers') ? getArg('providers').split(',') : ['google', 'mistral', 'cohere', 'groq', 'openrouter'];
const CHECK_NEW_MODELS = getArg('check-new-models') === 'true';
const BACKEND_URL = 'https://askme-backend-proxy.onrender.com';

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'askme-scout-agent/1.0',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Research new models from provider APIs
async function researchNewModels() {
  console.log('🔍 Researching new models from provider APIs...');
  
  const newModels = [];
  const errors = [];

  // Provider-specific research endpoints
  const researchEndpoints = {
    google: 'https://generativelanguage.googleapis.com/v1beta/models',
    mistral: 'https://api.mistral.ai/v1/models',
    cohere: 'https://api.cohere.ai/v1/models',
    groq: 'https://api.groq.com/openai/v1/models',
    openrouter: 'https://openrouter.ai/api/v1/models'
  };

  // Community news sources for model announcements
  const newsSources = [
    'https://huggingface.co/models?sort=trending',
    'https://www.reddit.com/r/MachineLearning/.rss',
    'https://paperswithcode.com/api/v1/papers/?order=published'
  ];

  for (const provider of PROVIDERS) {
    console.log(`🔍 Researching ${provider} models...`);
    
    try {
      // Try to get models from provider API (will likely fail without auth)
      if (researchEndpoints[provider]) {
        try {
          const response = await makeRequest(researchEndpoints[provider]);
          const models = response.data || response.models || response;
          
          if (Array.isArray(models)) {
            models.forEach(model => {
              newModels.push({
                provider: provider,
                model_name: model.id || model.name || model.model_name,
                source: 'provider_api',
                discovered_at: new Date().toISOString(),
                description: model.description || '',
                capabilities: model.capabilities || [],
                context_length: model.context_length || null,
                max_tokens: model.max_tokens || null
              });
            });
          }
        } catch (error) {
          console.warn(`⚠️ ${provider} API research failed (expected without auth): ${error.message}`);
        }
      }
      
      // Check for recent model announcements
      console.log(`📢 Checking for ${provider} announcements...`);
      
      // Check provider-specific announcement sources
      const announcementSources = {
        google: ['https://ai.google.dev/models'],
        mistral: ['https://mistral.ai/news/'],
        cohere: ['https://cohere.com/blog'],
        groq: ['https://groq.com/news/'],
        openrouter: ['https://openrouter.ai/models']
      };
      
      if (announcementSources[provider]) {
        for (const source of announcementSources[provider]) {
          try {
            // This would require web scraping capabilities
            console.log(`📰 Would check ${source} for announcements`);
          } catch (error) {
            console.warn(`⚠️ Failed to check ${source}: ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      errors.push({
        provider: provider,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Check community sources for general model announcements
  console.log('🌐 Checking community sources for model announcements...');
  
  for (const source of newsSources) {
    try {
      console.log(`📰 Would check ${source} for community announcements`);
      // This would require RSS parsing or web scraping
    } catch (error) {
      console.warn(`⚠️ Failed to check community source ${source}: ${error.message}`);
    }
  }

  return { newModels, errors };
}

// Check for deprecated models
async function checkDeprecatedModels() {
  console.log('🔍 Checking for deprecated models...');
  
  const deprecatedModels = [];
  
  // Load current validated models
  let currentModels = [];
  try {
    const currentData = JSON.parse(fs.readFileSync('validated_models.json', 'utf8'));
    currentModels = currentData.models || [];
  } catch (error) {
    console.warn('⚠️ Could not load current validated models:', error.message);
  }

  // Check each current model against backend
  for (const model of currentModels) {
    try {
      // Test model availability through backend
      const testResponse = await makeRequest(`${BACKEND_URL}/providers/${model.provider}/test`);
      
      if (testResponse.status !== 'available') {
        deprecatedModels.push({
          model_name: model.model_name,
          provider: model.provider,
          reason: `Backend reports status: ${testResponse.status}`,
          last_working: model.last_validated || 'unknown',
          deprecated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      deprecatedModels.push({
        model_name: model.model_name,
        provider: model.provider,
        reason: `Validation failed: ${error.message}`,
        last_working: model.last_validated || 'unknown',
        deprecated_at: new Date().toISOString()
      });
    }
  }

  return deprecatedModels;
}

// API Provider configurations based on research
const apiProviders = {
  'Google': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://ai.google.dev/docs',
    notes: 'Gemini models with free tier limits',
    models: ['gemini-pro', 'gemini-pro-vision']
  },
  'Mistral': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: false,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.mistral.ai/',
    notes: 'Mistral AI language models',
    models: ['mistral-tiny', 'mistral-small', 'mistral-medium']
  },
  'Cohere': {
    apiAvailable: true,
    registrationRequired: true,
    freeTier: true,
    authMethod: 'API Key',
    documentationUrl: 'https://docs.cohere.com/',
    notes: 'Trial API key, rate-limited access to all endpoints',
    models: ['command', 'command-light', 'command-nightly', 'embed-english-v2.0']
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
  }
};

// Main research function
async function main() {
  console.log('🚀 Starting model research for 5-provider system...');
  console.log(`📋 Providers: ${PROVIDERS.join(', ')}`);
  console.log(`🔍 Check new models: ${CHECK_NEW_MODELS}`);
  
  const results = {
    metadata: {
      timestamp: new Date().toISOString(),
      providers_researched: PROVIDERS,
      check_new_models: CHECK_NEW_MODELS,
      backend_url: BACKEND_URL
    },
    new_models: [],
    deprecated_models: [],
    errors: []
  };

  // Research new models if requested
  if (CHECK_NEW_MODELS) {
    const { newModels, errors } = await researchNewModels();
    results.new_models = newModels;
    results.errors.push(...errors);
  }

  // Check for deprecated models
  const deprecatedModels = await checkDeprecatedModels();
  results.deprecated_models = deprecatedModels;

  // Save results
  await writeFile('research-results.json', JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Research complete:`);
  console.log(`- New models discovered: ${results.new_models.length}`);
  console.log(`- Deprecated models found: ${results.deprecated_models.length}`);
  console.log(`- Errors encountered: ${results.errors.length}`);
  
  if (results.deprecated_models.length > 0) {
    console.log(`\n⚠️ Deprecated models detected:`);
    results.deprecated_models.forEach(model => {
      console.log(`  - ${model.provider}/${model.model_name}: ${model.reason}`);
    });
  }
  
  console.log(`\n📁 Results saved to research-results.json`);
}

// Run the research
if (require.main === module) {
  main().catch(error => {
    console.error('Research failed:', error);
    process.exit(1);
  });
}

module.exports = { researchNewModels, checkDeprecatedModels };
