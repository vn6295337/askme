/**
 * ModelValidator - Handles validation and normalization of model data
 */
class ModelValidator {
  constructor() {
    this.requiredFields = ['name', 'publisher', 'country', 'source'];
    
    this.optionalFields = [
      'accessType', 'license', 'modelSize', 'releaseDate', 
      'sourceUrl', 'inferenceSupport', 'capabilities',
      'discoveryTimestamp', 'validationStatus'
    ];
    
    this.validAccessTypes = [
      'Open Source',
      'Commercial API', 
      'Free Tier/Commercial API',
      'Open Source/Commercial API',
      'Research Paper',
      'Blog Post',
      'News Article',
      'API Reference',
      'Custom Open Source'
    ];
    
    this.validCountries = [
      'US', 'UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
      'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
      'Finland', 'Poland', 'Portugal', 'Ireland', 'Czech Republic',
      'Hungary', 'Greece', 'Europe', 'Canada', 'Unknown'
    ];

    this.validSources = [
      'GitHub', 'Hugging Face', 'Company', 'Blog', 'Model Tracking',
      'Tech News', 'API Documentation', 'arXiv', 'Papers with Code'
    ];
  }

  /**
   * Validate a single model
   */
  validateModel(model) {
    const errors = [];
    
    if (!model || typeof model !== 'object') {
      return {
        isValid: false,
        errors: ['Model must be an object']
      };
    }

    // Check required fields
    this.requiredFields.forEach(field => {
      if (!model[field] || typeof model[field] !== 'string' || model[field].trim() === '') {
        errors.push(`Required field '${field}' is missing or empty`);
      }
    });

    // Validate access type
    if (model.accessType && !this.validAccessTypes.includes(model.accessType)) {
      errors.push(`Invalid access type: ${model.accessType}. Valid options: ${this.validAccessTypes.join(', ')}`);
    }

    // Validate country
    if (model.country && !this.validCountries.includes(model.country)) {
      errors.push(`Invalid country: ${model.country}. Valid options: ${this.validCountries.join(', ')}`);
    }

    // Validate source
    if (model.source && !this.validSources.includes(model.source)) {
      errors.push(`Invalid source: ${model.source}. Valid options: ${this.validSources.join(', ')}`);
    }

    // Validate release date
    if (model.releaseDate && model.releaseDate !== 'Unknown' && !this.isValidDate(model.releaseDate)) {
      errors.push(`Invalid release date: ${model.releaseDate}`);
    }

    // Validate source URL
    if (model.sourceUrl && !this.isValidUrl(model.sourceUrl)) {
      errors.push(`Invalid source URL: ${model.sourceUrl}`);
    }

    // Validate model size
    if (model.modelSize && !this.isValidModelSize(model.modelSize)) {
      errors.push(`Invalid model size format: ${model.modelSize}`);
    }

    // Validate name length and content
    if (model.name && model.name.length > 200) {
      errors.push('Model name is too long (max 200 characters)');
    }

    // Validate publisher length
    if (model.publisher && model.publisher.length > 100) {
      errors.push('Publisher name is too long (max 100 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate batch of models
   */
  validateBatch(models) {
    console.log(`🔍 Validating ${models.length} models...`);
    
    const results = {
      valid: [],
      invalid: [],
      totalCount: models.length,
      validCount: 0,
      invalidCount: 0,
      summary: {}
    };

    models.forEach((model, index) => {
      const validation = this.validateModel(model);
      
      if (validation.isValid) {
        results.valid.push({
          index,
          model: this.normalizeModel(model)
        });
        results.validCount++;
      } else {
        results.invalid.push({
          index,
          model,
          errors: validation.errors
        });
        results.invalidCount++;
        
        console.warn(`⚠️  Model ${index + 1} validation failed:`, validation.errors);
      }
    });

    // Generate summary
    results.summary = this.generateValidationSummary(results);
    
    console.log(`✅ Validation complete: ${results.validCount} valid, ${results.invalidCount} invalid`);
    return results;
  }

  /**
   * Normalize model data
   */
  normalizeModel(model) {
    const normalized = {};
    
    // Copy required fields
    this.requiredFields.forEach(field => {
      normalized[field] = model[field] ? String(model[field]).trim() : '';
    });
    
    // Copy optional fields
    this.optionalFields.forEach(field => {
      if (model[field] !== undefined && model[field] !== null) {
        normalized[field] = String(model[field]).trim();
      } else {
        normalized[field] = 'Unknown';
      }
    });

    // Ensure timestamps
    if (!normalized.discoveryTimestamp) {
      normalized.discoveryTimestamp = new Date().toISOString();
    }
    
    if (!normalized.validationStatus) {
      normalized.validationStatus = 'validated';
    }

    // Normalize release date
    if (model.releaseDate && model.releaseDate !== 'Unknown') {
      try {
        normalized.releaseDate = new Date(model.releaseDate).toISOString();
      } catch {
        normalized.releaseDate = 'Unknown';
      }
    }

    return normalized;
  }

  /**
   * Check if date is valid
   */
  isValidDate(dateString) {
    if (dateString === 'Unknown') return true;
    
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) && date.getFullYear() > 2010 && date.getFullYear() <= new Date().getFullYear() + 1;
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is valid
   */
  isValidUrl(url) {
    if (!url || url === 'Unknown') return true;
    
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Check if model size format is valid
   */
  isValidModelSize(size) {
    if (size === 'Unknown') return true;
    
    const sizePattern = /^(\d+(\.\d+)?)(B|M|K|billion|million|thousand)$/i;
    return sizePattern.test(size);
  }

  /**
   * Generate validation summary
   */
  generateValidationSummary(results) {
    const summary = {
      validationRate: results.totalCount > 0 ? (results.validCount / results.totalCount * 100).toFixed(1) : 0,
      commonErrors: {},
      fieldCompletion: {}
    };

    // Count common errors
    results.invalid.forEach(item => {
      item.errors.forEach(error => {
        summary.commonErrors[error] = (summary.commonErrors[error] || 0) + 1;
      });
    });

    // Calculate field completion rates
    const allFields = [...this.requiredFields, ...this.optionalFields];
    allFields.forEach(field => {
      const completed = results.valid.filter(item => 
        item.model[field] && item.model[field] !== 'Unknown' && item.model[field] !== ''
      ).length;
      
      summary.fieldCompletion[field] = results.validCount > 0 ? 
        (completed / results.validCount * 100).toFixed(1) : 0;
    });

    return summary;
  }

  /**
   * Create model template
   */
  createModelTemplate() {
    return {
      name: '',
      publisher: '',
      country: 'Unknown',
      source: '',
      accessType: 'Unknown',
      license: 'Unknown',
      modelSize: 'Unknown',
      releaseDate: 'Unknown',
      sourceUrl: '',
      inferenceSupport: 'Unknown',
      capabilities: 'Text Generation',
      discoveryTimestamp: new Date().toISOString(),
      validationStatus: 'pending'
    };
  }

  /**
   * Get validation schema for JSON Schema validation
   */
  getJsonSchema() {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'LLM Model Schema',
      description: 'Schema for LLM model data discovered by the scout agent',
      required: this.requiredFields,
      properties: {
        name: {
          type: 'string',
          description: 'Official name of the model',
          minLength: 1,
          maxLength: 200
        },
        publisher: {
          type: 'string',
          description: 'Organization or individual behind the model',
          minLength: 1,
          maxLength: 100
        },
        country: {
          type: 'string',
          description: 'Country of origin',
          enum: this.validCountries
        },
        source: {
          type: 'string',
          description: 'Data source',
          enum: this.validSources
        },
        accessType: {
          type: 'string',
          description: 'Type of access available',
          enum: this.validAccessTypes
        },
        license: {
          type: 'string',
          description: 'License or terms of use',
          maxLength: 100
        },
        modelSize: {
          type: 'string',
          description: 'Model size (e.g., 7B, 13B)',
          pattern: '^(\\d+(\\.\\d+)?)(B|M|K|billion|million|thousand)$|^Unknown$'
        },
        releaseDate: {
          type: 'string',
          description: 'Date when the model was first released'
        },
        sourceUrl: {
          type: 'string',
          description: 'Canonical URL for the model',
          format: 'uri'
        },
        inferenceSupport: {
          type: 'string',
          description: 'Supported inference methods',
          maxLength: 100
        },
        capabilities: {
          type: 'string',
          description: 'Model capabilities'
        },
        discoveryTimestamp: {
          type: 'string',
          description: 'When the model was discovered',
          format: 'date-time'
        },
        validationStatus: {
          type: 'string',
          description: 'Validation status',
          enum: ['pending', 'validated', 'failed']
        }
      }
    };
  }
}

module.exports = ModelValidator;