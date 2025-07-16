const fs = require('fs-extra');
const path = require('path');

/**
 * CLI Model Validator - Ensures scout-agent only discovers models supported by AskMe CLI
 * This validator matches the exact models defined in the CLI providers
 */
class CLIModelValidator {
  constructor() {
    // These are the EXACT models supported by the CLI providers
    this.supportedModels = {
      google: [
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b'
      ],
      mistral: [
        'mistral-small-latest',
        'open-mistral-7b',
        'open-mixtral-8x7b',
        'open-mixtral-8x22b',
        'mistral-medium-latest'
      ],
      together: [
        // DeepSeek Models (Latest and Advanced) - Chinese company, but models are global
        'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
        'deepseek-ai/deepseek-r1-0528',
        
        // Meta Llama Models (US - North America)
        'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        'meta-llama/Llama-3.1-70B-Instruct',
        'meta-llama/Llama-3.1-8B-Instruct',
        'meta-llama/Llama-3.1-405B-Instruct-Turbo',
        'meta-llama/Llama-3.2-1B-Instruct',
        'meta-llama/Llama-Vision-Free',
        
        // Nvidia Models (US - North America)
        'nvidia/Llama-3.3-Nemotron-Super-49B-v1',
        
        // Mixtral Models (France - Europe)
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        
        // Specialized Models (US - North America)
        'Arcee-AI/AFM-4.5B-Preview',
        
        // Legacy (for compatibility)
        'meta-llama/Llama-3-8b-chat-hf'
      ],
      cohere: [
        'command',
        'command-light',
        'command-nightly',
        'command-r',
        'command-r-plus'
      ],
      groq: [
        'llama-3.3-70b-versatile',
        'llama-3.1-70b-versatile',
        'llama-3.1-8b-instant',
        'mixtral-8x7b-32768',
        'gemma2-9b-it',
        'gemma-7b-it'
      ],
      openrouter: [
        'anthropic/claude-3-haiku',
        'meta-llama/llama-3.1-8b-instruct',
        'mistralai/mistral-7b-instruct',
        'google/gemma-7b-it',
        'microsoft/wizardlm-2-8x22b'
      ]
    };

    // Create a flattened list of all supported models
    this.allSupportedModels = Object.values(this.supportedModels).flat();
    
    // Provider metadata for validation
    this.providerMetadata = {
      google: {
        name: 'Google',
        publisher: 'Google',
        country: 'US',
        accessType: 'API',
        backendSupported: true
      },
      mistral: {
        name: 'Mistral',
        publisher: 'Mistral AI',
        country: 'France',
        accessType: 'API',
        backendSupported: true
      },
      together: {
        name: 'Together AI',
        publisher: 'Meta/Together AI',
        country: 'US',
        accessType: 'API',
        backendSupported: true
      },
      cohere: {
        name: 'Cohere',
        publisher: 'Cohere',
        country: 'Canada',
        accessType: 'API',
        backendSupported: true
      },
      groq: {
        name: 'Groq',
        publisher: 'Groq',
        country: 'US',
        accessType: 'API',
        backendSupported: true
      },
      openrouter: {
        name: 'OpenRouter',
        publisher: 'OpenRouter',
        country: 'US',
        accessType: 'API',
        backendSupported: true
      }
    };
  }

  /**
   * Validates if a model is supported by the CLI
   */
  isModelSupported(modelName) {
    return this.allSupportedModels.includes(modelName);
  }

  /**
   * Gets the provider for a given model
   */
  getProviderForModel(modelName) {
    for (const [provider, models] of Object.entries(this.supportedModels)) {
      if (models.includes(modelName)) {
        return provider;
      }
    }
    return null;
  }

  /**
   * Validates and enriches a model with CLI-specific metadata
   */
  validateAndEnrichModel(discoveredModel) {
    // First check if this is a supported model
    const modelName = discoveredModel.name || discoveredModel.shortName || '';
    const provider = this.getProviderForModel(modelName);
    
    if (!provider) {
      return {
        isValid: false,
        reason: `Model "${modelName}" is not supported by AskMe CLI`,
        supportedModels: this.allSupportedModels
      };
    }

    // Enrich with provider metadata
    const providerMeta = this.providerMetadata[provider];
    const enrichedModel = {
      ...discoveredModel,
      name: modelName,
      shortName: modelName.split('/').pop(), // Extract short name from full path
      provider: provider,
      publisher: providerMeta.publisher,
      country: providerMeta.country,
      accessType: providerMeta.accessType,
      backendSupported: providerMeta.backendSupported,
      cliIntegrated: true,
      validationStatus: 'cli-validated',
      validation_notes: `Validated against AskMe CLI provider: ${provider}`,
      lastUpdated: new Date().toISOString(),
      discoveryTimestamp: new Date().toISOString()
    };

    return {
      isValid: true,
      model: enrichedModel
    };
  }

  /**
   * Filters a list of discovered models to only include CLI-supported ones
   */
  filterSupportedModels(discoveredModels) {
    const results = {
      supported: [],
      unsupported: [],
      stats: {
        total: discoveredModels.length,
        supportedCount: 0,
        unsupportedCount: 0,
        supportedProviders: {}
      }
    };

    for (const model of discoveredModels) {
      const validation = this.validateAndEnrichModel(model);
      
      if (validation.isValid) {
        results.supported.push(validation.model);
        results.stats.supportedCount++;
        
        // Track provider stats
        const provider = validation.model.provider;
        if (!results.stats.supportedProviders[provider]) {
          results.stats.supportedProviders[provider] = 0;
        }
        results.stats.supportedProviders[provider]++;
      } else {
        results.unsupported.push({
          model: model,
          reason: validation.reason
        });
        results.stats.unsupportedCount++;
      }
    }

    return results;
  }

  /**
   * Generates CLI-compatible model list
   */
  generateCLIModelList() {
    const cliModels = [];
    
    for (const [provider, models] of Object.entries(this.supportedModels)) {
      const providerMeta = this.providerMetadata[provider];
      
      for (const modelName of models) {
        cliModels.push({
          name: modelName,
          shortName: modelName.split('/').pop(),
          provider: provider,
          publisher: providerMeta.publisher,
          country: providerMeta.country,
          accessType: providerMeta.accessType,
          backendSupported: providerMeta.backendSupported,
          cliIntegrated: true,
          validationStatus: 'cli-validated',
          validation_notes: `AskMe CLI provider: ${provider}`,
          lastUpdated: new Date().toISOString(),
          discoveryTimestamp: new Date().toISOString()
        });
      }
    }
    
    return cliModels;
  }

  /**
   * Validates that scout-agent output matches CLI requirements
   */
  validateScoutOutput(scoutOutput) {
    const issues = [];
    
    if (!scoutOutput.models || !Array.isArray(scoutOutput.models)) {
      issues.push('Scout output missing models array');
      return { isValid: false, issues };
    }

    // Check each model against CLI requirements
    for (const [index, model] of scoutOutput.models.entries()) {
      const validation = this.validateAndEnrichModel(model);
      
      if (!validation.isValid) {
        issues.push(`Model ${index}: ${validation.reason}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      totalModels: scoutOutput.models.length,
      supportedModels: scoutOutput.models.filter(m => this.isModelSupported(m.name || m.shortName || '')).length
    };
  }

  /**
   * Saves validation report
   */
  async saveValidationReport(outputPath, validationResults) {
    const reportPath = path.join(outputPath, 'cli-validation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDiscovered: validationResults.stats.total,
        cliSupported: validationResults.stats.supportedCount,
        unsupported: validationResults.stats.unsupportedCount,
        supportRate: (validationResults.stats.supportedCount / validationResults.stats.total * 100).toFixed(1) + '%'
      },
      supportedProviders: validationResults.stats.supportedProviders,
      supportedModels: validationResults.supported.map(m => ({
        name: m.name,
        provider: m.provider,
        publisher: m.publisher
      })),
      unsupportedModels: validationResults.unsupported.map(u => ({
        name: u.model.name || u.model.shortName || 'Unknown',
        reason: u.reason
      }))
    };

    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    console.log(`📊 CLI validation report saved to: ${reportPath}`);
    return reportPath;
  }
}

module.exports = {
  CLIModelValidator,
  createValidator: () => new CLIModelValidator()
};