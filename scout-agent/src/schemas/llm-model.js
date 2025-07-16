const fs = require('fs-extra');
const path = require('path');

class LLMSchema {
  constructor() {
    this.requiredFields = ['name', 'shortName', 'country'];
    this.optionalFields = [
      'accessType', 'license', 'modelSize', 'releaseDate', 
      'sourceUrl', 'inferenceSupport', 'deprecationDate', 'capabilities', 'validation_notes'
    ];
    this.validAccessTypes = [
      'Open Source', 'Proprietary - Free Tier', 'Research Paper', 'Blog Post',
      'Free API', 'Community', 'Public', 'Free Tier', 'Beta', 'Unknown',
      'API', 'freemium', 'Freemium', 'News Reference', 'Leaderboard Entry'
    ];
    this.validCountries = [
      'US', 'UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
      'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
      'Finland', 'Poland', 'Portugal', 'Ireland', 'Czech Republic',
      'Hungary', 'Greece', 'Europe', 'China', 'Japan', 'South Korea',
      'Singapore', 'UAE', 'Canada', 'Australia', 'Israel', 'Unknown'
    ];
  }

  validateLLMData(model) {
    const errors = [];
    
    if (!model || typeof model !== 'object') {
      return {
        isValid: false,
        errors: ['Model must be an object']
      };
    }

    this.requiredFields.forEach(field => {
      if (!model[field] || typeof model[field] !== 'string' || model[field].trim() === '') {
        errors.push(`Required field '${field}' is missing or empty`);
      }
    });

    if (model.accessType && !this.validAccessTypes.includes(model.accessType)) {
      errors.push(`Invalid access type: ${model.accessType}`);
    }

    if (model.country && !this.validCountries.includes(model.country)) {
      errors.push(`Invalid country: ${model.country}`);
    }

    if (model.releaseDate && !this.isValidDate(model.releaseDate)) {
      errors.push(`Invalid release date: ${model.releaseDate}`);
    }

    if (model.sourceUrl && !this.isValidUrl(model.sourceUrl)) {
      errors.push(`Invalid source URL: ${model.sourceUrl}`);
    }

    if (model.modelSize && !this.isValidModelSize(model.modelSize)) {
      errors.push(`Invalid model size format: ${model.modelSize}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  isValidDate(dateString) {
    if (!dateString || dateString === 'Unknown') {
      return true;
    }
    
    // Handle Unix timestamps
    if (typeof dateString === 'number' || /^\d{10}$/.test(dateString)) {
      const timestamp = parseInt(dateString);
      const date = new Date(timestamp * 1000);
      return !isNaN(date.getTime()) && date.getFullYear() > 2010;
    }
    
    // Handle ISO date strings
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.getFullYear() > 2010;
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isValidModelSize(size) {
    // Support multi-size entries like "7B,13B,70B"
    const multiSizePattern = /^\d+\.?\d*[BMK](?:,\d+\.?\d*[BMK])*$/i;
    const singleSizePattern = /^(\d+(\.\d+)?)(B|M|K|billion|million|thousand)$/i;
    return multiSizePattern.test(size) || singleSizePattern.test(size) || size === 'Unknown';
  }

  normalizeModel(model) {
    const normalized = {};
    
    this.requiredFields.forEach(field => {
      normalized[field] = model[field] ? model[field].trim() : '';
    });
    
    this.optionalFields.forEach(field => {
      if (model[field]) {
        normalized[field] = model[field].trim();
      }
    });

    if (model.releaseDate) {
      normalized.releaseDate = new Date(model.releaseDate).toISOString();
    }

    normalized.discoveryTimestamp = new Date().toISOString();
    normalized.lastValidated = new Date().toISOString();
    
    return normalized;
  }

  createModelTemplate() {
    return {
      name: '',
      publisher: '',
      country: '',
      accessType: 'Open Source',
      license: '',
      modelSize: 'Unknown',
      releaseDate: '',
      sourceUrl: '',
      inferenceSupport: 'Unknown',
      deprecationDate: null,
      capabilities: [],
      tags: [],
      notes: ''
    };
  }

  generateJsonSchema() {
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
          description: 'Country of origin (US or European)',
          enum: this.validCountries
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
          pattern: '^(\\\\d+(\\\\.\\\\d+)?)(B|M|K|billion|million|thousand)$|^Unknown$'
        },
        releaseDate: {
          type: 'string',
          description: 'Date when the model was first released',
          format: 'date-time'
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
        deprecationDate: {
          type: ['string', 'null'],
          description: 'Known end-of-life date',
          format: 'date-time'
        },
        capabilities: {
          type: 'array',
          description: 'List of model capabilities',
          items: {
            type: 'string'
          }
        },
        tags: {
          type: 'array',
          description: 'Additional tags or categories',
          items: {
            type: 'string'
          }
        },
        notes: {
          type: 'string',
          description: 'Additional notes or comments',
          maxLength: 500
        },
        validation_notes: {
          type: 'string',
          description: 'Data validation and quality notes',
          maxLength: 1000
        }
      }
    };
  }

  async saveSchema(outputPath) {
    const schema = this.generateJsonSchema();
    const schemaPath = path.join(outputPath, 'llm-model-schema.json');
    
    await fs.ensureDir(path.dirname(schemaPath));
    await fs.writeJson(schemaPath, schema, { spaces: 2 });
    
    console.log(`Schema saved to: ${schemaPath}`);
    return schemaPath;
  }

  validateBatch(models) {
    const results = {
      valid: [],
      invalid: [],
      totalCount: models.length,
      validCount: 0,
      invalidCount: 0
    };

    models.forEach((model, index) => {
      const validation = this.validateLLMData(model);
      
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
      }
    });

    return results;
  }
}

const schema = new LLMSchema();

module.exports = {
  validateLLMData: schema.validateLLMData.bind(schema),
  normalizeModel: schema.normalizeModel.bind(schema),
  createModelTemplate: schema.createModelTemplate.bind(schema),
  generateJsonSchema: schema.generateJsonSchema.bind(schema),
  saveSchema: schema.saveSchema.bind(schema),
  validateBatch: schema.validateBatch.bind(schema),
  LLMSchema
};