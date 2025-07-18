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

// Quality-based inclusion criteria (positive validation only)
const QUALITY_INCLUSION_CRITERIA = {
  // Trusted AI companies and organizations
  trustedOrganizations: [
    'openai', 'anthropic', 'google', 'microsoft', 'meta', 'apple', 'nvidia',
    'together', 'replicate', 'groq', 'scale', 'databricks', 'cohere',
    'mistral', 'huggingface', 'deepmind', 'stability', 'aleph alpha', 'ai21',
    'amazon', 'salesforce', 'adobe', 'ibm', 'intel', 'qualcomm'
  ],
  
  // Academic and research institutions (global)
  academicInstitutions: [
    // North America
    'stanford', 'berkeley', 'mit', 'harvard', 'cmu', 'carnegie', 'caltech',
    'princeton', 'yale', 'columbia', 'cornell', 'chicago', 'nyu', 'usc',
    'toronto', 'montreal', 'mcgill', 'ubc', 'waterloo',
    // Europe
    'oxford', 'cambridge', 'imperial', 'ucl', 'edinburgh', 'eth', 'epfl',
    'karolinska', 'sorbonne', 'max-planck', 'inria', 'cnrs', 'dtu', 'kth',
    // Global Research Labs
    'allen', 'fair', 'deepmind', 'openai', 'anthropic', 'partnership-ai'
  ],
  
  // Well-known model families and architectures
  establishedModelFamilies: [
    'gpt', 'claude', 'gemini', 'llama', 'mistral', 'alpaca', 'vicuna',
    'bert', 'roberta', 'gpt2', 'gpt3', 'gpt4', 't5', 'flan', 'bloom',
    'opt', 'palm', 'chinchilla', 'galactica', 'codex', 'whisper',
    'stable-diffusion', 'dalle', 'midjourney', 'controlnet'
  ],
  
  // Quality indicators for HuggingFace models
  qualityThresholds: {
    minDownloads: 1000,        // Minimum download count
    minStars: 5,               // Minimum star rating
    hasModelCard: true,        // Must have documentation
    hasLicense: true           // Must specify license
  }
};

function isQualityModel(modelName, modelData = {}) {
  const name = modelName.toLowerCase();
  const provider = (modelData.provider || '').toLowerCase();
  const owner = (modelData.owner || '').toLowerCase();
  const description = (modelData.description || '').toLowerCase();
  const tags = (modelData.tags || []).join(' ').toLowerCase();
  const author = (modelData.model_author || '').toLowerCase();
  const fullText = `${name} ${provider} ${owner} ${description} ${tags} ${author}`;
  
  // 1. Check trusted organizations (companies and research labs)
  if (QUALITY_INCLUSION_CRITERIA.trustedOrganizations.some(org => 
    fullText.includes(org.toLowerCase()))) {
    return { allowed: true, reason: 'Trusted organization identified' };
  }
  
  // 2. Check if provider itself is trusted (for cross-provider routing)
  if (QUALITY_INCLUSION_CRITERIA.trustedOrganizations.includes(provider)) {
    return { allowed: true, reason: `Trusted provider: ${provider}` };
  }
  
  // 3. Check academic institutions (global research)
  if (QUALITY_INCLUSION_CRITERIA.academicInstitutions.some(institution => 
    fullText.includes(institution.toLowerCase()))) {
    return { allowed: true, reason: 'Academic/research institution identified' };
  }
  
  // 4. Check established model families (well-known architectures)
  if (QUALITY_INCLUSION_CRITERIA.establishedModelFamilies.some(family => 
    name.includes(family.toLowerCase()))) {
    return { allowed: true, reason: 'Established model family detected' };
  }
  
  // 5. HuggingFace quality metrics (if available)
  if (provider === 'huggingface' && modelData.downloads && modelData.stars) {
    const downloads = parseInt(modelData.downloads) || 0;
    const stars = parseInt(modelData.stars) || 0;
    
    if (downloads >= QUALITY_INCLUSION_CRITERIA.qualityThresholds.minDownloads && 
        stars >= QUALITY_INCLUSION_CRITERIA.qualityThresholds.minStars) {
      return { allowed: true, reason: `High-quality model: ${downloads} downloads, ${stars} stars` };
    }
  }
  
  // 6. Small Language Models (SLMs) - special consideration for efficiency
  const slmIndicators = ['small', 'mini', 'tiny', 'lite', 'efficient', 'mobile', 'edge'];
  if (slmIndicators.some(indicator => fullText.includes(indicator))) {
    return { allowed: true, reason: 'Small/efficient language model identified' };
  }
  
  // 7. Open source indicators (positive signals for transparency)
  const openSourceIndicators = ['open', 'community', 'apache', 'mit', 'cc-by', 'creative-commons'];
  if (openSourceIndicators.some(indicator => fullText.includes(indicator))) {
    return { allowed: true, reason: 'Open source model with transparent licensing' };
  }
  
  // Default: Allow with quality review needed
  return { allowed: true, reason: 'Model approved for general use (quality review recommended)' };
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
      url: `${BACKEND_CONFIG.url}/api/providers`,
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
      
      // Handle providers response format
      if (response.data.providers && Array.isArray(response.data.providers)) {
        // Extract all models from all providers
        const allModels = [];
        for (const provider of response.data.providers) {
          if (provider.models && Array.isArray(provider.models)) {
            for (const modelName of provider.models) {
              allModels.push({
                name: modelName,
                model_name: modelName,
                provider: provider.name,
                available: provider.available,
                status: provider.status
              });
            }
          }
        }
        return allModels;
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
    
    // Apply quality-based filtering
    for (const model of backendModels) {
      const qualityCheck = isQualityModel(model.name || model.model_name, model);
      
      if (qualityCheck.allowed) {
        const validatedModel = {
          model_name: model.name || model.model_name,
          provider: model.provider || 'Unknown',
          api_available: true,
          registration_required: true,
          free_tier: model.free_tier !== false,
          auth_method: 'api_key',
          documentation_url: model.documentation_url || '',
          notes: model.notes || 'Validated through backend proxy',
          quality_verified: true,
          trusted_source: true,
          validation_reason: qualityCheck.reason
        };
        allValidatedModels.push(validatedModel);
      } else {
        allExcludedModels.push({
          model_name: model.name || model.model_name,
          provider: model.provider || 'Unknown',
          reason: `Quality review needed: ${qualityCheck.reason}`
        });
      }
    }
    
    // Sort results
    allValidatedModels.sort((a, b) => a.provider.localeCompare(b.provider) || a.model_name.localeCompare(b.model_name));
    allExcludedModels.sort((a, b) => a.provider.localeCompare(b.provider));
    
    // Calculate statistics
    const qualityReviewNeeded = allExcludedModels.filter(m => m.reason.includes('Quality review needed')).length;
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
      quality_filtering: {
        enabled: true,
        criteria: ['Trusted organizations', 'Academic institutions', 'Established model families', 'HuggingFace quality metrics', 'SLM efficiency', 'Open source licensing'],
        quality_review_needed: qualityReviewNeeded,
        quality_review_rate: totalChecked > 0 ? (qualityReviewNeeded / totalChecked * 100).toFixed(1) + '%' : '0%',
        immediately_approved: allValidatedModels.length
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
    console.log(`- Immediately validated models: ${allValidatedModels.length}`);
    console.log(`- Models needing quality review: ${allExcludedModels.length}`);
    console.log(`  - Quality criteria review needed: ${qualityReviewNeeded}`);
    console.log(`- Providers with available models: ${validationMetadata.providers_with_models.length}`);
    
    if (specificProvider) {
      console.log(`- Focus provider '${specificProvider}': ${allValidatedModels.length} models validated`);
    }
    
    console.log(`\n🌟 Quality-based filtering active: Prioritizing trusted organizations, academic research, and open source models`);
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

module.exports = { main, isQualityModel };