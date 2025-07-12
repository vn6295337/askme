#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

// Backend configuration
const BACKEND_CONFIG = {
  url: process.env.BACKEND_URL || 'https://askme-backend-proxy.onrender.com',
  authToken: process.env.AGENT_AUTH_TOKEN,
  timeout: 30000
};

// Geographic filtering function (same as before)
const GEOGRAPHIC_ALLOWLIST = {
  allowedRegions: {
    'north america': ['na', 'america', 'american', 'openai', 'anthropic', 'google', 'microsoft', 'cohere'],
    'europe': ['eu', 'european', 'deepmind', 'stability', 'mistral', 'huggingface', 'aleph alpha'],
    'western europe': ['western', 'deepmind', 'stability'],
    'central europe': ['central', 'aleph alpha'],
    'mediterranean': ['mediterranean', 'ai21']
  },
  approvedCompanies: [
    'openai', 'anthropic', 'google', 'microsoft', 'meta', 'tesla', 'nvidia',
    'together', 'replicate', 'groq', 'scale', 'databricks', 'cohere',
    'mistral', 'huggingface', 'deepmind', 'stability', 'aleph alpha', 'ai21'
  ],
  excludedRegions: [
    'china', 'chinese', 'russia', 'russian', 'iran', 'iranian', 'north korea',
    'belarus', 'myanmar', 'syria', 'venezuela', 'cuba', 'sudan',
    'india', 'indian', 'japan', 'japanese', 'korea', 'korean', 'singapore',
    'saudi', 'emirates', 'qatar', 'brazil', 'mexico', 'argentina'
  ],
  excludedModels: [
    'qwen', 'ernie', 'chatglm', 'glm-', 'baidu', 'alibaba', 'tencent',
    'deepseek', 'yi-', 'internlm', 'baichuan', 'belle', 'moss',
    'yandex', 'sber', 'gigachat'
  ],
  excludedLanguagePatterns: [
    /[\u4e00-\u9fff]/, // Chinese
    /[\u0400-\u04ff]/, // Cyrillic
    /[\u0590-\u05ff]/, // Hebrew
    /[\u0600-\u06ff]/, // Arabic
    /[\u3040-\u309f]/, // Hiragana
    /[\u30a0-\u30ff]/, // Katakana
    /[\uac00-\ud7af]/  // Hangul
  ]
};

function isGeographicallyAllowed(modelName, modelData = {}) {
  const name = modelName.toLowerCase();
  const owner = (modelData.owner || '').toLowerCase();
  const description = (modelData.description || '').toLowerCase();
  const tags = (modelData.tags || []).join(' ').toLowerCase();
  const author = (modelData.model_author || '').toLowerCase();
  const fullText = `${name} ${owner} ${description} ${tags} ${author}`;
  
  // Check excluded models first
  if (GEOGRAPHIC_ALLOWLIST.excludedModels.some(excluded => 
    fullText.includes(excluded.toLowerCase()))) {
    return { allowed: false, reason: 'Model from excluded list detected' };
  }
  
  // Check excluded language patterns
  for (const pattern of GEOGRAPHIC_ALLOWLIST.excludedLanguagePatterns) {
    if (pattern.test(fullText)) {
      return { allowed: false, reason: 'Non-approved region language characters detected' };
    }
  }
  
  // Check excluded regions
  if (GEOGRAPHIC_ALLOWLIST.excludedRegions.some(region => 
    fullText.includes(region.toLowerCase()))) {
    return { allowed: false, reason: 'Model from non-approved geographic region' };
  }
  
  // Check approved companies
  if (GEOGRAPHIC_ALLOWLIST.approvedCompanies.some(company => 
    fullText.includes(company.toLowerCase()))) {
    return { allowed: true, reason: 'Approved company identified' };
  }
  
  // Check allowed regions
  for (const [region, indicators] of Object.entries(GEOGRAPHIC_ALLOWLIST.allowedRegions)) {
    if (indicators.some(indicator => fullText.includes(indicator.toLowerCase()))) {
      return { allowed: true, reason: `Model from approved region: ${region}` };
    }
  }
  
  // Western model patterns
  const approvedPatterns = [
    /\bgpt-/i, /\bclaude/i, /\bgemini/i, /\bllama/i, /\bmistral/i, /\balpaca/i,
    /\bvicuna/i, /\bwizard/i, /\borca/i, /\bflan/i, /\bt5-/i, /\bbert/i,
    /\brobert/i, /\bbloom/i, /\bopt-/i, /\bgalactica/i, /\bcodex/i
  ];
  
  if (approvedPatterns.some(pattern => pattern.test(fullText))) {
    return { allowed: true, reason: 'Approved region model pattern detected' };
  }
  
  return { allowed: false, reason: 'Geographic origin unclear - defaulting to exclusion for safety' };
}

// Get models through backend proxy
async function getModelsFromBackend() {
  if (!BACKEND_CONFIG.authToken) {
    throw new Error('AGENT_AUTH_TOKEN is required but not provided');
  }

  try {
    console.log('Fetching models through backend proxy...');
    
    const response = await axios({
      method: 'GET',
      url: `${BACKEND_CONFIG.url}/api/llms`,
      headers: {
        'Authorization': `Bearer ${BACKEND_CONFIG.authToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'askme-scout-agent/1.0.0'
      },
      timeout: BACKEND_CONFIG.timeout
    });

    if (response.status === 200) {
      console.log('Successfully fetched models from backend');
      console.log('Response structure:', JSON.stringify(Object.keys(response.data), null, 2));
      
      // Handle different response formats
      if (response.data.models) {
        return response.data.models;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data) {
        return response.data.data;
      } else {
        console.log('Full response:', JSON.stringify(response.data, null, 2));
        return [];
      }
    } else {
      throw new Error(`Backend returned status ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      console.error('Backend error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
    throw error;
  }
}

// Main validation function
async function main() {
  const trigger = process.env.VALIDATION_TRIGGER || 'manual';
  const reason = process.env.TRIGGER_REASON || 'Manual validation';
  const specificProvider = process.env.SPECIFIC_PROVIDER;
  const announcementUrl = process.env.ANNOUNCEMENT_URL;
  
  console.log('🚀 Starting model validation through backend proxy...');
  console.log(`📋 Trigger: ${trigger}`);
  console.log(`📋 Reason: ${reason}`);
  
  if (specificProvider) {
    console.log(`🎯 Focusing on provider: ${specificProvider}`);
  }
  
  if (announcementUrl) {
    console.log(`📢 Announcement URL: ${announcementUrl}`);
  }
  
  try {
    // Get models from backend
    const backendModels = await getModelsFromBackend();
    console.log(`Received ${backendModels.length} models from backend`);
    
    if (backendModels.length > 0) {
      console.log('Sample model structure:', JSON.stringify(backendModels[0], null, 2));
    }
    
    const allValidatedModels = [];
    const allExcludedModels = [];
    
    // Apply geographic filtering
    for (const model of backendModels) {
      const geographicCheck = isGeographicallyAllowed(model.name || model.model_name, model);
      
      if (geographicCheck.allowed) {
        const validatedModel = {
          model_name: model.name || model.model_name,
          provider: model.provider || 'Unknown',
          api_available: true,
          registration_required: true,
          free_tier: model.free_tier !== false,
          auth_method: 'api_key',
          documentation_url: model.documentation_url || '',
          notes: model.notes || 'Validated through backend proxy',
          geographic_origin_verified: true,
          allowed_region: true,
          origin_reason: geographicCheck.reason
        };
        allValidatedModels.push(validatedModel);
      } else {
        allExcludedModels.push({
          model_name: model.name || model.model_name,
          provider: model.provider || 'Unknown',
          reason: `Geographic restriction: ${geographicCheck.reason}`
        });
      }
    }
    
    // Sort results
    allValidatedModels.sort((a, b) => a.provider.localeCompare(b.provider) || a.model_name.localeCompare(b.model_name));
    allExcludedModels.sort((a, b) => a.provider.localeCompare(b.provider));
    
    // Calculate statistics
    const geographicExcluded = allExcludedModels.filter(m => m.reason.includes('Geographic restriction')).length;
    const totalChecked = allValidatedModels.length + allExcludedModels.length;
    
    // Create metadata
    const validationMetadata = {
      timestamp: new Date().toISOString(),
      trigger: trigger,
      reason: reason,
      specific_provider: specificProvider || null,
      announcement_url: announcementUrl || null,
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
      backend_proxy_used: true
    };
    
    // Create output
    const validatedOutput = {
      metadata: validationMetadata,
      models: allValidatedModels
    };
    
    const excludedOutput = {
      metadata: validationMetadata,
      excluded_models: allExcludedModels
    };
    
    // Write results
    await writeFile('validated_models.json', JSON.stringify(validatedOutput, null, 2));
    await writeFile('excluded_models.json', JSON.stringify(excludedOutput, null, 2));
    
    console.log(`\n✅ Validation complete:`);
    console.log(`- Total models checked: ${totalChecked}`);
    console.log(`- Validated models (North America/Europe only): ${allValidatedModels.length}`);
    console.log(`- Excluded models: ${allExcludedModels.length}`);
    console.log(`  - Geographic restrictions: ${geographicExcluded}`);
    console.log(`  - Other reasons: ${allExcludedModels.length - geographicExcluded}`);
    console.log(`- Providers with available models: ${validationMetadata.providers_with_models.length}`);
    
    if (specificProvider) {
      console.log(`- Focus provider '${specificProvider}': ${allValidatedModels.length} models validated`);
    }
    
    console.log(`\n🌍 Geographic filtering active: Only North American and European models allowed`);
    console.log(`📁 Results saved to validated_models.json and excluded_models.json`);
    
    if (announcementUrl) {
      console.log(`📢 Related to announcement: ${announcementUrl}`);
    }
    
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  main().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = { main, isGeographicallyAllowed };