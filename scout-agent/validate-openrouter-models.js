#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * OpenRouter Model Validator
 * Validates OpenRouter models against the comprehensive list provided by user
 * Focuses on free models with $0 costs and NA/EU regional compliance
 */

// User's provided OpenRouter model list (from conversation)
const providedOpenRouterModels = [
  // Free models with $0 input/output costs from user's list
  {
    name: "anthropic/claude-3-haiku",
    id: "anthropic/claude-3-haiku",
    inputCost: 0,
    outputCost: 0,
    context: 200000,
    publisher: "Anthropic",
    region: "US"
  },
  {
    name: "meta-llama/llama-3.1-8b-instruct",
    id: "meta-llama/llama-3.1-8b-instruct",
    inputCost: 0,
    outputCost: 0,
    context: 131072,
    publisher: "Meta",
    region: "US"
  },
  {
    name: "mistralai/mistral-7b-instruct",
    id: "mistralai/mistral-7b-instruct",
    inputCost: 0,
    outputCost: 0,
    context: 32768,
    publisher: "Mistral AI",
    region: "France"
  },
  {
    name: "google/gemma-7b-it",
    id: "google/gemma-7b-it",
    inputCost: 0,
    outputCost: 0,
    context: 8192,
    publisher: "Google",
    region: "US"
  },
  {
    name: "microsoft/wizardlm-2-8x22b",
    id: "microsoft/wizardlm-2-8x22b",
    inputCost: 0,
    outputCost: 0,
    context: 65536,
    publisher: "Microsoft",
    region: "US"
  },
  {
    name: "meta-llama/llama-3.1-70b-instruct",
    id: "meta-llama/llama-3.1-70b-instruct",
    inputCost: 0,
    outputCost: 0,
    context: 131072,
    publisher: "Meta",
    region: "US"
  },
  {
    name: "mistralai/mixtral-8x7b-instruct",
    id: "mistralai/mixtral-8x7b-instruct",
    inputCost: 0,
    outputCost: 0,
    context: 32768,
    publisher: "Mistral AI",
    region: "France"
  },
  {
    name: "google/gemma-2-9b-it",
    id: "google/gemma-2-9b-it",
    inputCost: 0,
    outputCost: 0,
    context: 8192,
    publisher: "Google",
    region: "US"
  },
  {
    name: "meta-llama/llama-3.2-1b-instruct",
    id: "meta-llama/llama-3.2-1b-instruct",
    inputCost: 0,
    outputCost: 0,
    context: 131072,
    publisher: "Meta",
    region: "US"
  },
  {
    name: "meta-llama/llama-3.2-3b-instruct",
    id: "meta-llama/llama-3.2-3b-instruct",
    inputCost: 0,
    outputCost: 0,
    context: 131072,
    publisher: "Meta",
    region: "US"
  },
  {
    name: "qwen/qwen-2.5-7b-instruct",
    id: "qwen/qwen-2.5-7b-instruct",
    inputCost: 0,
    outputCost: 0,
    context: 32768,
    publisher: "Alibaba",
    region: "China"
  },
  {
    name: "huggingface/zephyr-7b-beta",
    id: "huggingface/zephyr-7b-beta",
    inputCost: 0,
    outputCost: 0,
    context: 32768,
    publisher: "Hugging Face",
    region: "US"
  },
  {
    name: "openchat/openchat-7b",
    id: "openchat/openchat-7b",
    inputCost: 0,
    outputCost: 0,
    context: 8192,
    publisher: "OpenChat",
    region: "US"
  },
  {
    name: "nousresearch/nous-capybara-7b",
    id: "nousresearch/nous-capybara-7b",
    inputCost: 0,
    outputCost: 0,
    context: 32768,
    publisher: "Nous Research",
    region: "US"
  },
  {
    name: "microsoft/phi-3-mini-128k-instruct",
    id: "microsoft/phi-3-mini-128k-instruct",
    inputCost: 0,
    outputCost: 0,
    context: 128000,
    publisher: "Microsoft",
    region: "US"
  }
];

// Current OpenRouter models in CLI
const currentOpenRouterModels = [
  "anthropic/claude-3-haiku",
  "meta-llama/llama-3.1-8b-instruct",
  "mistralai/mistral-7b-instruct",
  "google/gemma-7b-it",
  "microsoft/wizardlm-2-8x22b"
];

// NA/EU regions for compliance
const naEuRegions = ['US', 'Canada', 'France', 'Germany', 'UK', 'Netherlands', 'Sweden', 'Switzerland'];

class OpenRouterValidator {
  constructor() {
    this.validationResults = {
      currentModels: [],
      recommendedModels: [],
      excludedModels: [],
      summary: {
        totalProvided: providedOpenRouterModels.length,
        currentlySupported: currentOpenRouterModels.length,
        naEuCompliant: 0,
        freeModels: 0,
        excludedCount: 0
      }
    };
  }

  validateModel(model) {
    const issues = [];
    
    // Check if free (both input and output cost = 0)
    if (model.inputCost !== 0 || model.outputCost !== 0) {
      issues.push(`Not free - Input: $${model.inputCost}, Output: $${model.outputCost}`);
    }
    
    // Check regional compliance (NA/EU focus)
    if (!naEuRegions.includes(model.region)) {
      issues.push(`Non-NA/EU region: ${model.region}`);
    }
    
    // Check context length (prefer models with good context)
    if (model.context < 8192) {
      issues.push(`Limited context: ${model.context} tokens`);
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues,
      model: model
    };
  }

  validateAllModels() {
    console.log('🔍 Validating OpenRouter models...');
    
    // Check current models
    for (const modelName of currentOpenRouterModels) {
      const providedModel = providedOpenRouterModels.find(m => m.name === modelName);
      if (providedModel) {
        const validation = this.validateModel(providedModel);
        this.validationResults.currentModels.push({
          name: modelName,
          status: validation.isValid ? 'valid' : 'invalid',
          issues: validation.issues,
          details: providedModel
        });
      } else {
        this.validationResults.currentModels.push({
          name: modelName,
          status: 'not_found',
          issues: ['Model not found in provided list'],
          details: null
        });
      }
    }
    
    // Validate all provided models
    for (const model of providedOpenRouterModels) {
      const validation = this.validateModel(model);
      
      if (validation.isValid) {
        this.validationResults.recommendedModels.push({
          name: model.name,
          id: model.id,
          publisher: model.publisher,
          region: model.region,
          context: model.context,
          currentlySupported: currentOpenRouterModels.includes(model.name)
        });
        this.validationResults.summary.naEuCompliant++;
        this.validationResults.summary.freeModels++;
      } else {
        this.validationResults.excludedModels.push({
          name: model.name,
          publisher: model.publisher,
          region: model.region,
          issues: validation.issues
        });
        this.validationResults.summary.excludedCount++;
      }
    }
    
    return this.validationResults;
  }

  generateReport() {
    const results = this.validateAllModels();
    
    console.log('\n📊 OpenRouter Model Validation Report');
    console.log('=====================================');
    
    console.log(`\n📈 Summary:`);
    console.log(`Total models provided: ${results.summary.totalProvided}`);
    console.log(`Currently supported: ${results.summary.currentlySupported}`);
    console.log(`NA/EU compliant free models: ${results.summary.naEuCompliant}`);
    console.log(`Excluded models: ${results.summary.excludedCount}`);
    
    console.log(`\n✅ Recommended Models (${results.recommendedModels.length}):`);
    results.recommendedModels.forEach(model => {
      const status = model.currentlySupported ? '[CURRENT]' : '[NEW]';
      console.log(`  ${status} ${model.name} (${model.publisher}, ${model.region}, ${model.context} tokens)`);
    });
    
    console.log(`\n❌ Excluded Models (${results.excludedModels.length}):`);
    results.excludedModels.forEach(model => {
      console.log(`  ${model.name} (${model.publisher}, ${model.region})`);
      model.issues.forEach(issue => console.log(`    - ${issue}`));
    });
    
    console.log(`\n🔄 Current Model Status:`);
    results.currentModels.forEach(model => {
      const statusIcon = model.status === 'valid' ? '✅' : model.status === 'invalid' ? '⚠️' : '❌';
      console.log(`  ${statusIcon} ${model.name} - ${model.status}`);
      if (model.issues.length > 0) {
        model.issues.forEach(issue => console.log(`    - ${issue}`));
      }
    });
    
    return results;
  }

  generateCLIUpdate() {
    const results = this.validateAllModels();
    
    // Remove duplicates and sort by name
    const uniqueModels = results.recommendedModels.filter((model, index, self) => 
      index === self.findIndex(m => m.name === model.name)
    ).sort((a, b) => a.name.localeCompare(b.name));
    
    // Create Kotlin code for OpenRouter provider
    const kotlinModels = uniqueModels.map(model => 
      `        "${model.name}",                    // ${model.publisher} (${model.region})`
    ).join('\n');
    
    const kotlinCode = `
    // Updated OpenRouter models (${uniqueModels.length} validated free models)
    override fun getAvailableModels(): List<String> = listOf(
${kotlinModels}
    )`;
    
    console.log('\n🔧 Kotlin Code Update:');
    console.log(kotlinCode);
    
    return {
      models: uniqueModels,
      kotlinCode: kotlinCode
    };
  }

  async saveReport() {
    const results = this.validateAllModels();
    const reportPath = path.join(__dirname, 'output', 'openrouter-validation-report.json');
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(reportPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log(`\n💾 Report saved to: ${reportPath}`);
    return reportPath;
  }
}

// Run validation
async function main() {
  const validator = new OpenRouterValidator();
  
  console.log('🚀 Starting OpenRouter Model Validation...');
  
  // Generate and display report
  const results = validator.generateReport();
  
  // Generate CLI update
  const cliUpdate = validator.generateCLIUpdate();
  
  // Save report
  await validator.saveReport();
  
  console.log('\n✅ OpenRouter validation complete!');
  
  return {
    results,
    cliUpdate
  };
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { OpenRouterValidator };