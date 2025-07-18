#!/usr/bin/env node

const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

// CLI argument parsing
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(arg => arg.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const FILTER_GEOGRAPHIC = getArg('filter-geographic') === 'true';
const FILTER_QUALITY = getArg('filter-quality') === 'true';
const OUTPUT_FILE = getArg('output') || 'api-eligible-models.json';

// Quality criteria for model filtering
const QUALITY_CRITERIA = {
  trustedOrganizations: [
    'google', 'mistral', 'cohere', 'groq', 'openrouter',
    'anthropic', 'openai', 'huggingface', 'meta', 'microsoft'
  ],
  academicInstitutions: [
    'stanford', 'berkeley', 'mit', 'cambridge', 'oxford'
  ],
  establishedModelFamilies: [
    'gemini', 'mistral', 'command', 'claude', 'gpt', 'llama'
  ],
  minimumParameters: 1000000, // 1M parameters minimum
  maximumParameters: 100000000000, // 100B parameters maximum
  supportedLanguages: ['en', 'english', 'multilingual']
};

// Geographic filtering (North America and Europe only)
const GEOGRAPHIC_ALLOWLIST = {
  allowedRegions: ['north america', 'europe', 'western europe'],
  allowedCountries: ['us', 'usa', 'canada', 'uk', 'france', 'germany', 'netherlands', 'sweden'],
  approvedCompanies: [
    'google', 'mistral', 'cohere', 'groq', 'openrouter',
    'anthropic', 'openai', 'huggingface', 'meta', 'microsoft'
  ]
};

// Analyze model eligibility
function analyzeModelEligibility(model) {
  const analysis = {
    eligible: true,
    reasons: [],
    warnings: [],
    score: 0
  };

  // Geographic filtering
  if (FILTER_GEOGRAPHIC) {
    const modelText = `${model.model_name} ${model.provider}`.toLowerCase();
    const isApprovedCompany = GEOGRAPHIC_ALLOWLIST.approvedCompanies.some(company => 
      modelText.includes(company.toLowerCase())
    );
    
    if (isApprovedCompany) {
      analysis.reasons.push('Approved geographic origin');
      analysis.score += 20;
    } else {
      analysis.eligible = false;
      analysis.reasons.push('Geographic origin not verified');
    }
  }

  // Quality filtering
  if (FILTER_QUALITY) {
    const modelText = `${model.model_name} ${model.provider}`.toLowerCase();
    
    // Check trusted organizations
    const isTrustedOrg = QUALITY_CRITERIA.trustedOrganizations.some(org => 
      modelText.includes(org.toLowerCase())
    );
    
    if (isTrustedOrg) {
      analysis.reasons.push('Trusted organization');
      analysis.score += 25;
    }
    
    // Check established model families
    const isEstablishedFamily = QUALITY_CRITERIA.establishedModelFamilies.some(family => 
      modelText.includes(family.toLowerCase())
    );
    
    if (isEstablishedFamily) {
      analysis.reasons.push('Established model family');
      analysis.score += 15;
    }
    
    // Check API availability
    if (model.api_available) {
      analysis.reasons.push('API available');
      analysis.score += 20;
    }
    
    // Check free tier availability
    if (model.free_tier) {
      analysis.reasons.push('Free tier available');
      analysis.score += 10;
    }
    
    // Backend proxy availability
    if (model.auth_method === 'backend_proxy') {
      analysis.reasons.push('Backend proxy managed');
      analysis.score += 30;
    }
  }

  return analysis;
}

// Main analysis function
async function main() {
  console.log('🔍 Analyzing models for eligibility...');
  console.log(`📋 Geographic filtering: ${FILTER_GEOGRAPHIC}`);
  console.log(`📋 Quality filtering: ${FILTER_QUALITY}`);
  
  // Load validated models
  let validatedModels = [];
  try {
    const validatedData = JSON.parse(fs.readFileSync('validated_models.json', 'utf8'));
    validatedModels = validatedData.models || [];
  } catch (error) {
    console.error('❌ Could not load validated models:', error.message);
    process.exit(1);
  }

  console.log(`📊 Analyzing ${validatedModels.length} validated models...`);

  const eligibleModels = [];
  const ineligibleModels = [];
  const analysisResults = [];

  for (const model of validatedModels) {
    const analysis = analyzeModelEligibility(model);
    
    const result = {
      model: model,
      analysis: analysis,
      final_score: analysis.score
    };

    analysisResults.push(result);

    if (analysis.eligible && analysis.score >= 30) {
      eligibleModels.push({
        ...model,
        eligibility_score: analysis.score,
        eligibility_reasons: analysis.reasons,
        warnings: analysis.warnings
      });
    } else {
      ineligibleModels.push({
        ...model,
        eligibility_score: analysis.score,
        ineligibility_reasons: analysis.reasons,
        warnings: analysis.warnings
      });
    }
  }

  // Sort by eligibility score
  eligibleModels.sort((a, b) => b.eligibility_score - a.eligibility_score);

  // Create output
  const output = {
    metadata: {
      timestamp: new Date().toISOString(),
      total_models_analyzed: validatedModels.length,
      eligible_models: eligibleModels.length,
      ineligible_models: ineligibleModels.length,
      filtering_criteria: {
        geographic_filtering: FILTER_GEOGRAPHIC,
        quality_filtering: FILTER_QUALITY,
        minimum_score: 30
      },
      geographic_allowlist: GEOGRAPHIC_ALLOWLIST,
      quality_criteria: QUALITY_CRITERIA
    },
    eligible_models: eligibleModels,
    ineligible_models: ineligibleModels,
    analysis_results: analysisResults
  };

  // Save results
  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`\n✅ Analysis complete:`);
  console.log(`- Total models analyzed: ${validatedModels.length}`);
  console.log(`- Eligible models: ${eligibleModels.length}`);
  console.log(`- Ineligible models: ${ineligibleModels.length}`);
  console.log(`- Average eligibility score: ${(analysisResults.reduce((sum, r) => sum + r.final_score, 0) / analysisResults.length).toFixed(1)}`);
  
  if (eligibleModels.length > 0) {
    console.log(`\n🏆 Top eligible models:`);
    eligibleModels.slice(0, 5).forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.provider}/${model.model_name} (score: ${model.eligibility_score})`);
    });
  }

  console.log(`\n📁 Results saved to ${OUTPUT_FILE}`);
}

// Run the analysis
if (require.main === module) {
  main().catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = { analyzeModelEligibility, QUALITY_CRITERIA, GEOGRAPHIC_ALLOWLIST };
