#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

// Model provenance database - models/companies to exclude due to Chinese origin or control
const CHINA_PROVENANCE_EXCLUSIONS = {
  // Direct Chinese companies and models
  companies: [
    'baidu', 'alibaba', 'tencent', 'bytedance', 'sensetime', 'megvii', 'iflytek',
    'deepseek', 'zhipu', 'minimax', 'moonshot', '01.ai', 'baichuan', 'chatglm',
    'qwen', 'ernie', 'spark', 'belle', 'chinese-llama', 'chinese-alpaca',
    'moss', 'cpm', 'pangu', 'wudao', 'glm', 'chatglm2', 'chatglm3',
    'internlm', 'skywork', 'yi', 'aquila', 'falcon-chinese', 'phoenix',
    'tigerbot', 'xuanyuan', 'ziya', 'firefly', 'linly', 'flow-pilot',
    'chinese-vicuna', 'luotuo', 'guanaco-chinese', 'tulu-chinese'
  ],
  
  // Model name patterns that indicate Chinese origin
  modelPatterns: [
    /chinese/i, /china/i, /中文/i, /中国/i, /baidu/i, /alibaba/i, /tencent/i,
    /qwen/i, /tongyi/i, /ernie/i, /wenxin/i, /spark/i, /讯飞/i, /智谱/i,
    /chatglm/i, /glm-/i, /belle/i, /moss/i, /cpm/i, /pangu/i, /wudao/i,
    /internlm/i, /skywork/i, /aquila/i, /phoenix/i, /tigerbot/i, /xuanyuan/i,
    /ziya/i, /firefly/i, /linly/i, /luotuo/i, /yi-/i, /01-ai/i, /deepseek/i,
    /minimax/i, /moonshot/i, /baichuan/i, /zhipu/i
  ],
  
  // Specific model IDs known to be Chinese
  specificModels: [
    'ernie-bot', 'ernie-bot-turbo', 'ernie-bot-4', 'wenxin',
    'qwen-turbo', 'qwen-plus', 'qwen-max', 'tongyi-qianwen',
    'chatglm-6b', 'chatglm2-6b', 'chatglm3-6b', 'glm-4',
    'spark-lite', 'spark-pro', 'spark-max', 'spark-4',
    'belle-7b', 'belle-13b', 'moss-moon-003-sft',
    'cpm-bee-1b', 'cpm-bee-2b', 'cpm-bee-5b', 'cpm-bee-10b',
    'internlm-7b', 'internlm-20b', 'internlm2-7b', 'internlm2-20b',
    'baichuan-7b', 'baichuan-13b', 'baichuan2-7b', 'baichuan2-13b',
    'yi-6b', 'yi-34b', 'deepseek-coder', 'deepseek-chat'
  ]
};

// Function to check if a model has Chinese provenance
function hasChineseProvenance(modelName, modelData = {}) {
  const name = modelName.toLowerCase();
  const owner = (modelData.owner || '').toLowerCase();
  const description = (modelData.description || '').toLowerCase();
  const tags = (modelData.tags || []).join(' ').toLowerCase();
  const fullText = `${name} ${owner} ${description} ${tags}`;
  
  // Check specific model exclusions
  if (CHINA_PROVENANCE_EXCLUSIONS.specificModels.some(excluded => 
    name.includes(excluded.toLowerCase()))) {
    return { excluded: true, reason: 'Specific Chinese model identified' };
  }
  
  // Check company names
  if (CHINA_PROVENANCE_EXCLUSIONS.companies.some(company => 
    fullText.includes(company.toLowerCase()))) {
    return { excluded: true, reason: 'Chinese company/organization identified' };
  }
  
  // Check model name patterns
  for (const pattern of CHINA_PROVENANCE_EXCLUSIONS.modelPatterns) {
    if (pattern.test(fullText)) {
      return { excluded: true, reason: 'Chinese model pattern detected' };
    }
  }
  
  // Additional checks for common Chinese indicators
  if (fullText.match(/[\u4e00-\u9fff]/) || // Chinese characters
      fullText.includes('chinese') ||
      fullText.includes('china') ||
      fullText.includes('中文') ||
      fullText.includes('中国')) {
    return { excluded: true, reason: 'Chinese language/location indicators found' };
  }
  
  return { excluded: false, reason: null };
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
        
        // Check for Chinese provenance first
        const provenanceCheck = hasChineseProvenance(validatedModel.model_name, model);
        if (provenanceCheck.excluded) {
          excludedModels.push({
            model_name: validatedModel.model_name,
            provider: providerName,
            reason: `Chinese provenance: ${provenanceCheck.reason}`
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

        // Add provenance information to validated model
        validatedModel.provenance_verified = true;
        validatedModel.chinese_origin = false;
        
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

  // Calculate provenance statistics for metadata
  const chineseExcluded = allExcludedModels.filter(m => m.reason.includes('Chinese provenance')).length;
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
    provenance_filtering: {
      enabled: true,
      chinese_models_excluded: chineseExcluded,
      chinese_exclusion_rate: totalChecked > 0 ? (chineseExcluded / totalChecked * 100).toFixed(1) + '%' : '0%',
      other_exclusions: allExcludedModels.length - chineseExcluded
    },
    providers_with_models: [...new Set(allValidatedModels.map(m => m.provider))],
    validation_summary: Object.keys(PROVIDERS).reduce((summary, provider) => {
      const providerModels = allValidatedModels.filter(m => m.provider === provider);
      const providerExcluded = allExcludedModels.filter(m => m.provider === provider);
      const providerChineseExcluded = allExcludedModels.filter(m => 
        m.provider === provider && m.reason.includes('Chinese provenance')).length;
      
      summary[provider] = {
        validated: providerModels.length,
        excluded: providerExcluded.length,
        chinese_excluded: providerChineseExcluded,
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

  // Calculate provenance statistics
  const chineseExcluded = allExcludedModels.filter(m => m.reason.includes('Chinese provenance')).length;
  const totalChecked = allValidatedModels.length + allExcludedModels.length;
  
  console.log(`\n✅ Validation complete:`);
  console.log(`- Total models checked: ${totalChecked}`);
  console.log(`- Validated models (non-Chinese): ${allValidatedModels.length}`);
  console.log(`- Excluded models: ${allExcludedModels.length}`);
  console.log(`  - Chinese provenance: ${chineseExcluded}`);
  console.log(`  - Other reasons: ${allExcludedModels.length - chineseExcluded}`);
  console.log(`- Providers with available models: ${validationMetadata.providers_with_models.length}/${Object.keys(PROVIDERS).length}`);
  
  if (specificProvider) {
    console.log(`- Focus provider '${specificProvider}': ${allValidatedModels.length} models validated`);
  }
  
  console.log(`\n🌏 Provenance filtering active: Excluding all Chinese-origin models`);
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