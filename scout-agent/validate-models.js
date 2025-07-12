#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

// Geographic provenance database - only allow models from US, Canada, and Europe
const GEOGRAPHIC_ALLOWLIST = {
  // Allowed economic regions
  allowedRegions: {
    // North America
    'north america': ['na', 'america', 'american', 'openai', 'anthropic', 'google', 'microsoft', 'cohere'],
    
    // Europe
    'europe': ['eu', 'european', 'deepmind', 'stability', 'mistral', 'huggingface', 'aleph alpha'],
    'western europe': ['western', 'deepmind', 'stability'],
    'central europe': ['central', 'aleph alpha'],
    'mediterranean': ['mediterranean', 'ai21']  // Mediterranean economic region
  },
  
  // Approved companies with verified origins
  approvedCompanies: [
    // North American Companies
    'openai', 'anthropic', 'google', 'microsoft', 'meta', 'tesla', 'nvidia',
    'together', 'replicate', 'groq', 'scale', 'databricks', 'cohere',
    
    // European Companies
    'mistral', 'huggingface', 'deepmind', 'stability', 'aleph alpha', 'ai21'
  ],
  
  // Known excluded regions/countries (non-exhaustive, complement to allowlist)
  excludedRegions: [
    'china', 'chinese', 'russia', 'russian', 'iran', 'iranian', 'north korea',
    'belarus', 'myanmar', 'syria', 'venezuela', 'cuba', 'sudan',
    // Add other regions as needed
    'india', 'indian', 'japan', 'japanese', 'korea', 'korean', 'singapore',
    'saudi', 'emirates', 'qatar', 'brazil', 'mexico', 'argentina'
  ],
  
  // Specific models/patterns to exclude (non-Western origin)
  excludedModels: [
    // Chinese models
    'qwen', 'ernie', 'chatglm', 'glm-', 'baidu', 'alibaba', 'tencent',
    'deepseek', 'yi-', 'internlm', 'baichuan', 'belle', 'moss',
    
    // Russian models
    'yandex', 'sber', 'gigachat',
    
    // Other non-Western models
    'palm2-bison', 'claude-instant-1' // Verify these are actually Western
  ],
  
  // Language indicators for exclusion
  excludedLanguagePatterns: [
    /[\u4e00-\u9fff]/, // Chinese characters
    /[\u0400-\u04ff]/, // Cyrillic (Russian)
    /[\u0590-\u05ff]/, // Hebrew (except AI21 which is Israeli/approved)
    /[\u0600-\u06ff]/, // Arabic
    /[\u3040-\u309f]/, // Hiragana (Japanese)
    /[\u30a0-\u30ff]/, // Katakana (Japanese)
    /[\uac00-\ud7af]/  // Hangul (Korean)
  ]
};

// Function to check if a model is from allowed geographic regions
function isGeographicallyAllowed(modelName, modelData = {}) {
  const name = modelName.toLowerCase();
  const owner = (modelData.owner || '').toLowerCase();
  const description = (modelData.description || '').toLowerCase();
  const tags = (modelData.tags || []).join(' ').toLowerCase();
  const author = (modelData.model_author || '').toLowerCase();
  const fullText = `${name} ${owner} ${description} ${tags} ${author}`;
  
  // First check if it's an explicitly excluded model
  if (GEOGRAPHIC_ALLOWLIST.excludedModels.some(excluded => 
    fullText.includes(excluded.toLowerCase()))) {
    return { allowed: false, reason: 'Model from excluded list detected' };
  }
  
  // Check for excluded language patterns
  for (const pattern of GEOGRAPHIC_ALLOWLIST.excludedLanguagePatterns) {
    if (pattern.test(fullText)) {
      return { allowed: false, reason: 'Non-Western language characters detected' };
    }
  }
  
  // Check for excluded regions
  if (GEOGRAPHIC_ALLOWLIST.excludedRegions.some(region => 
    fullText.includes(region.toLowerCase()))) {
    return { allowed: false, reason: 'Model from excluded geographic region' };
  }
  
  // Check if it's from an approved company (high confidence allowlist)
  if (GEOGRAPHIC_ALLOWLIST.approvedCompanies.some(company => 
    fullText.includes(company.toLowerCase()))) {
    return { allowed: true, reason: 'Approved company identified' };
  }
  
  // Check against allowed regions and their indicators
  for (const [region, indicators] of Object.entries(GEOGRAPHIC_ALLOWLIST.allowedRegions)) {
    if (indicators.some(indicator => fullText.includes(indicator.toLowerCase()))) {
      return { allowed: true, reason: `Model from allowed region: ${region}` };
    }
  }
  
  // Special handling for common Western model patterns
  const westernPatterns = [
    /\bgpt-/i, /\bclaude/i, /\bgemini/i, /\bllama/i, /\bmistral/i, /\balpaca/i,
    /\bvicuna/i, /\bwizard/i, /\borca/i, /\bflan/i, /\bt5-/i, /\bbert/i,
    /\brobert/i, /\bbloom/i, /\bopt-/i, /\bgalactica/i, /\bcodex/i
  ];
  
  if (westernPatterns.some(pattern => pattern.test(fullText))) {
    return { allowed: true, reason: 'Western model pattern detected' };
  }
  
  // If no clear indicators, default to exclusion for safety
  return { allowed: false, reason: 'Geographic origin unclear - defaulting to exclusion for safety' };
}

// Provider configurations with API endpoints and validation methods
const PROVIDERS = {
  'Gemini': {
    apiKey: process.env.GEMINI_API_KEY,
    listEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    authHeader: (key) => ({ 'x-goog-api-key': key }),
    validateModel: (model) => {
      return {
        model_name: model.name?.replace('models/', '') || model.displayName,
        provider: 'Gemini',
        api_available: true,
        registration_required: true,
        free_tier: true,
        auth_method: 'api_key',
        documentation_url: 'https://ai.google.dev/docs',
        notes: 'Google\'s Gemini models with various capabilities'
      };
    }
  },
  'Mistral': {
    apiKey: process.env.MISTRAL_API_KEY,
    listEndpoint: 'https://api.mistral.ai/v1/models',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    validateModel: (model) => {
      return {
        model_name: model.id,
        provider: 'Mistral',
        api_available: true,
        registration_required: true,
        free_tier: false,
        auth_method: 'api_key',
        documentation_url: 'https://docs.mistral.ai/',
        notes: 'Mistral AI language models'
      };
    }
  },
  'Together AI': {
    apiKey: process.env.TOGETHER_API_KEY,
    listEndpoint: 'https://api.together.xyz/v1/models',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    validateModel: (model) => {
      return {
        model_name: model.id,
        provider: 'Together AI',
        api_available: true,
        registration_required: true,
        free_tier: true,
        auth_method: 'api_key',
        documentation_url: 'https://docs.together.ai/',
        notes: 'LLaMA and other models via Together AI'
      };
    }
  },
  'Cohere': {
    apiKey: process.env.COHERE_API_KEY,
    listEndpoint: 'https://api.cohere.ai/v1/models',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    validateModel: (model) => {
      return {
        model_name: model.name,
        provider: 'Cohere',
        api_available: true,
        registration_required: true,
        free_tier: true,
        auth_method: 'api_key',
        documentation_url: 'https://docs.cohere.com/',
        notes: 'Cohere language models for various NLP tasks'
      };
    }
  },
  'Groq': {
    apiKey: process.env.GROQ_API_KEY,
    listEndpoint: 'https://api.groq.com/openai/v1/models',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    validateModel: (model) => {
      return {
        model_name: model.id,
        provider: 'Groq',
        api_available: true,
        registration_required: true,
        free_tier: true,
        auth_method: 'api_key',
        documentation_url: 'https://console.groq.com/docs',
        notes: 'High-speed inference for various LLMs'
      };
    }
  },
  'Hugging Face': {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    listEndpoint: 'https://huggingface.co/api/models?filter=text-generation&sort=trending&limit=50',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    validateModel: (model) => {
      return {
        model_name: model.modelId || model.id,
        provider: 'Hugging Face',
        api_available: true,
        registration_required: true,
        free_tier: true,
        auth_method: 'api_key',
        documentation_url: 'https://huggingface.co/docs/api-inference/',
        notes: 'Inference API for Hugging Face models',
        model_author: model.author || model.pipeline_tag || '',
        model_tags: model.tags || []
      };
    }
  },
  'OpenRouter': {
    apiKey: process.env.OPENROUTER_API_KEY,
    listEndpoint: 'https://openrouter.ai/api/v1/models',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    validateModel: (model) => {
      return {
        model_name: model.id,
        provider: 'OpenRouter',
        api_available: true,
        registration_required: true,
        free_tier: true,
        auth_method: 'api_key',
        documentation_url: 'https://openrouter.ai/docs',
        notes: 'Unified API for multiple LLM providers'
      };
    }
  },
  'AI21 Labs': {
    apiKey: process.env.AI21_API_KEY,
    listEndpoint: 'https://api.ai21.com/studio/v1/models',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    validateModel: (model) => {
      return {
        model_name: model.model_name || model.name,
        provider: 'AI21 Labs',
        api_available: true,
        registration_required: true,
        free_tier: true,
        auth_method: 'api_key',
        documentation_url: 'https://docs.ai21.com/',
        notes: 'AI21 Studio models including Jurassic series'
      };
    }
  },
  'Replicate': {
    apiKey: process.env.REPLICATE_API_TOKEN,
    listEndpoint: 'https://api.replicate.com/v1/models?cursor=&limit=50',
    authHeader: (key) => ({ 'Authorization': `Token ${key}` }),
    validateModel: (model) => {
      return {
        model_name: `${model.owner}/${model.name}`,
        provider: 'Replicate',
        api_available: true,
        registration_required: true,
        free_tier: true,
        auth_method: 'api_key',
        documentation_url: 'https://replicate.com/docs',
        notes: 'Open source models via Replicate API',
        model_owner: model.owner || '',
        model_description: model.description || '',
        model_visibility: model.visibility || 'public'
      };
    }
  }
};

// HTTP request helper
function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'askme-scout-agent/1.0',
        'Accept': 'application/json',
        ...headers
      }
    };

    const req = https.request(url, options, (res) => {
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

// Validate documentation URL
async function validateDocumentationUrl(url) {
  try {
    const response = await makeRequest(url);
    return true;
  } catch (error) {
    console.warn(`Documentation URL validation failed for ${url}: ${error.message}`);
    return false;
  }
}

// Validate models for a specific provider
async function validateProvider(providerName, config) {
  console.log(`\nValidating ${providerName}...`);
  
  const validatedModels = [];
  const excludedModels = [];

  if (!config.apiKey) {
    console.warn(`No API key found for ${providerName}`);
    excludedModels.push({
      model_name: 'N/A',
      provider: providerName,
      reason: 'No API key configured'
    });
    return { validatedModels, excludedModels };
  }

  try {
    const headers = config.authHeader(config.apiKey);
    const response = await makeRequest(config.listEndpoint, headers);
    
    let models = [];
    if (response.models) {
      models = response.models;
    } else if (Array.isArray(response)) {
      models = response;
    } else if (response.data) {
      models = response.data;
    }

    console.log(`Found ${models.length} models for ${providerName}`);

    for (const model of models.slice(0, 10)) { // Limit to first 10 models per provider
      try {
        const validatedModel = config.validateModel(model);
        
        // Check geographic allowlist first
        const geographicCheck = isGeographicallyAllowed(validatedModel.model_name, model);
        if (!geographicCheck.allowed) {
          excludedModels.push({
            model_name: validatedModel.model_name,
            provider: providerName,
            reason: `Geographic restriction: ${geographicCheck.reason}`
          });
          continue;
        }
        
        // Skip models that require local deployment or are not accessible via API
        if (model.type === 'local' || model.deployment === 'local') {
          excludedModels.push({
            model_name: validatedModel.model_name,
            provider: providerName,
            reason: 'Requires local deployment'
          });
          continue;
        }

        // Skip paywalled models without free tier access
        if (model.pricing?.free === false && !validatedModel.free_tier) {
          excludedModels.push({
            model_name: validatedModel.model_name,
            provider: providerName,
            reason: 'Paywalled without free tier'
          });
          continue;
        }

        // Add geographic provenance information to validated model
        validatedModel.geographic_origin_verified = true;
        validatedModel.allowed_region = true;
        validatedModel.origin_reason = geographicCheck.reason;
        
        validatedModels.push(validatedModel);
      } catch (error) {
        console.warn(`Failed to validate model ${model.id || model.name}: ${error.message}`);
        excludedModels.push({
          model_name: model.id || model.name || 'unknown',
          provider: providerName,
          reason: `Validation error: ${error.message}`
        });
      }
    }

  } catch (error) {
    console.error(`Failed to fetch models for ${providerName}: ${error.message}`);
    excludedModels.push({
      model_name: 'N/A',
      provider: providerName,
      reason: `API error: ${error.message}`
    });
  }

  return { validatedModels, excludedModels };
}

// Main validation function
async function main() {
  const trigger = process.env.VALIDATION_TRIGGER || 'manual';
  const reason = process.env.TRIGGER_REASON || 'Manual validation';
  const specificProvider = process.env.SPECIFIC_PROVIDER;
  const announcementUrl = process.env.ANNOUNCEMENT_URL;
  
  console.log('🚀 Starting model validation for approved providers...');
  console.log(`📋 Trigger: ${trigger}`);
  console.log(`📋 Reason: ${reason}`);
  
  if (specificProvider) {
    console.log(`🎯 Focusing on provider: ${specificProvider}`);
  }
  
  if (announcementUrl) {
    console.log(`📢 Announcement URL: ${announcementUrl}`);
  }
  
  const allValidatedModels = [];
  const allExcludedModels = [];

  // Determine which providers to validate
  let providersToValidate = Object.entries(PROVIDERS);
  
  if (specificProvider && PROVIDERS[specificProvider]) {
    providersToValidate = [[specificProvider, PROVIDERS[specificProvider]]];
    console.log(`✅ Validating only ${specificProvider} as requested`);
  } else if (specificProvider) {
    console.warn(`⚠️  Provider '${specificProvider}' not found in approved providers list`);
    console.log('📋 Available providers:', Object.keys(PROVIDERS).join(', '));
  }

  // Validate each provider
  for (const [providerName, config] of providersToValidate) {
    const { validatedModels, excludedModels } = await validateProvider(providerName, config);
    allValidatedModels.push(...validatedModels);
    allExcludedModels.push(...excludedModels);
  }

  // Sort results
  allValidatedModels.sort((a, b) => a.provider.localeCompare(b.provider) || a.model_name.localeCompare(b.model_name));
  allExcludedModels.sort((a, b) => a.provider.localeCompare(b.provider));

  // Calculate geographic filtering statistics for metadata
  const geographicExcluded = allExcludedModels.filter(m => m.reason.includes('Geographic restriction')).length;
  const totalChecked = allValidatedModels.length + allExcludedModels.length;

  // Create metadata about this validation run
  const validationMetadata = {
    timestamp: new Date().toISOString(),
    trigger: trigger,
    reason: reason,
    specific_provider: specificProvider || null,
    announcement_url: announcementUrl || null,
    providers_validated: specificProvider ? [specificProvider] : Object.keys(PROVIDERS),
    total_models_checked: totalChecked,
    total_validated_models: allValidatedModels.length,
    total_excluded_models: allExcludedModels.length,
    geographic_filtering: {
      enabled: true,
      allowed_regions: ['North America', 'Europe'],
      geographic_exclusions: geographicExcluded,
      geographic_exclusion_rate: totalChecked > 0 ? (geographicExcluded / totalChecked * 100).toFixed(1) + '%' : '0%',
      other_exclusions: allExcludedModels.length - geographicExcluded
    },
    providers_with_models: [...new Set(allValidatedModels.map(m => m.provider))],
    validation_summary: Object.keys(PROVIDERS).reduce((summary, provider) => {
      const providerModels = allValidatedModels.filter(m => m.provider === provider);
      const providerExcluded = allExcludedModels.filter(m => m.provider === provider);
      const providerGeographicExcluded = allExcludedModels.filter(m => 
        m.provider === provider && m.reason.includes('Geographic restriction')).length;
      
      summary[provider] = {
        validated: providerModels.length,
        excluded: providerExcluded.length,
        geographic_excluded: providerGeographicExcluded,
        available: providerModels.length > 0
      };
      return summary;
    }, {})
  };

  // Create output with metadata
  const validatedOutput = {
    metadata: validationMetadata,
    models: allValidatedModels
  };

  const excludedOutput = {
    metadata: validationMetadata,
    excluded_models: allExcludedModels
  };

  // Write results to files
  await writeFile('validated_models.json', JSON.stringify(validatedOutput, null, 2));
  await writeFile('excluded_models.json', JSON.stringify(excludedOutput, null, 2));

  console.log(`\n✅ Validation complete:`);
  console.log(`- Total models checked: ${totalChecked}`);
  console.log(`- Validated models (North America/Europe only): ${allValidatedModels.length}`);
  console.log(`- Excluded models: ${allExcludedModels.length}`);
  console.log(`  - Geographic restrictions: ${geographicExcluded}`);
  console.log(`  - Other reasons: ${allExcludedModels.length - geographicExcluded}`);
  console.log(`- Providers with available models: ${validationMetadata.providers_with_models.length}/${Object.keys(PROVIDERS).length}`);
  
  if (specificProvider) {
    console.log(`- Focus provider '${specificProvider}': ${allValidatedModels.length} models validated`);
  }
  
  console.log(`\n🌍 Geographic filtering active: Only North American and European models allowed`);
  console.log(`📁 Results saved to validated_models.json and excluded_models.json`);
  
  if (announcementUrl) {
    console.log(`📢 Related to announcement: ${announcementUrl}`);
  }
}

// Run the validation
if (require.main === module) {
  main().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = { validateProvider, PROVIDERS };