const { validateLLMData, normalizeModel, validateBatch } = require('../src/schemas/llm-model');

describe('LLM Schema Validation', () => {
  describe('Required fields validation', () => {
    it('should validate models with all required fields', () => {
      const validModel = {
        name: 'GPT-4',
        publisher: 'OpenAI',
        country: 'US'
      };

      const result = validateLLMData(validModel);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject models missing required fields', () => {
      const invalidModel = {
        name: 'GPT-4'
        // missing publisher and country
      };

      const result = validateLLMData(invalidModel);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Required field 'publisher' is missing or empty");
      expect(result.errors).toContain("Required field 'country' is missing or empty");
    });

    it('should reject empty string values', () => {
      const invalidModel = {
        name: '',
        publisher: 'OpenAI',
        country: 'US'
      };

      const result = validateLLMData(invalidModel);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Required field 'name' is missing or empty");
    });
  });

  describe('Access type validation', () => {
    it('should accept valid access types', () => {
      const validTypes = [
        'Open Source',
        'Proprietary - Free Tier',
        'Research Paper',
        'Blog Post'
      ];

      validTypes.forEach(accessType => {
        const model = {
          name: 'Test Model',
          publisher: 'Test Org',
          country: 'US',
          accessType: accessType
        };

        const result = validateLLMData(model);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid access types', () => {
      const model = {
        name: 'Test Model',
        publisher: 'Test Org',
        country: 'US',
        accessType: 'Invalid Type'
      };

      const result = validateLLMData(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid access type: Invalid Type');
    });
  });

  describe('Date validation', () => {
    it('should accept valid dates', () => {
      const model = {
        name: 'Test Model',
        publisher: 'Test Org',
        country: 'US',
        releaseDate: '2023-01-01T00:00:00Z'
      };

      const result = validateLLMData(model);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid dates', () => {
      const model = {
        name: 'Test Model',
        publisher: 'Test Org',
        country: 'US',
        releaseDate: 'invalid-date'
      };

      const result = validateLLMData(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid release date: invalid-date');
    });

    it('should reject dates before 2010', () => {
      const model = {
        name: 'Test Model',
        publisher: 'Test Org',
        country: 'US',
        releaseDate: '2009-01-01T00:00:00Z'
      };

      const result = validateLLMData(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid release date: 2009-01-01T00:00:00Z');
    });
  });

  describe('URL validation', () => {
    it('should accept valid URLs', () => {
      const model = {
        name: 'Test Model',
        publisher: 'Test Org',
        country: 'US',
        sourceUrl: 'https://example.com/model'
      };

      const result = validateLLMData(model);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const model = {
        name: 'Test Model',
        publisher: 'Test Org',
        country: 'US',
        sourceUrl: 'not-a-url'
      };

      const result = validateLLMData(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid source URL: not-a-url');
    });
  });

  describe('Model size validation', () => {
    it('should accept valid model sizes', () => {
      const validSizes = ['7B', '13B', '70B', '1.5B', 'Unknown'];

      validSizes.forEach(size => {
        const model = {
          name: 'Test Model',
          publisher: 'Test Org',
          country: 'US',
          modelSize: size
        };

        const result = validateLLMData(model);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid model sizes', () => {
      const model = {
        name: 'Test Model',
        publisher: 'Test Org',
        country: 'US',
        modelSize: 'invalid-size'
      };

      const result = validateLLMData(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid model size format: invalid-size');
    });
  });

  describe('Model normalization', () => {
    it('should normalize model data correctly', () => {
      const model = {
        name: '  GPT-4  ',
        publisher: '  OpenAI  ',
        country: 'US',
        releaseDate: '2023-01-01T00:00:00Z',
        extraField: 'should be ignored'
      };

      const normalized = normalizeModel(model);
      
      expect(normalized.name).toBe('GPT-4');
      expect(normalized.publisher).toBe('OpenAI');
      expect(normalized.releaseDate).toBe('2023-01-01T00:00:00.000Z');
      expect(normalized).toHaveProperty('discoveryTimestamp');
      expect(normalized).toHaveProperty('lastValidated');
      expect(normalized).not.toHaveProperty('extraField');
    });
  });

  describe('Batch validation', () => {
    it('should validate multiple models', () => {
      const models = [
        {
          name: 'Valid Model 1',
          publisher: 'Publisher 1',
          country: 'US'
        },
        {
          name: 'Valid Model 2',
          publisher: 'Publisher 2',
          country: 'UK'
        },
        {
          name: '', // Invalid - empty name
          publisher: 'Publisher 3',
          country: 'Germany'
        }
      ];

      const results = validateBatch(models);
      
      expect(results.totalCount).toBe(3);
      expect(results.validCount).toBe(2);
      expect(results.invalidCount).toBe(1);
      expect(results.valid).toHaveLength(2);
      expect(results.invalid).toHaveLength(1);
      expect(results.invalid[0].errors).toContain("Required field 'name' is missing or empty");
    });
  });

  describe('Non-object input handling', () => {
    it('should handle null input', () => {
      const result = validateLLMData(null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model must be an object');
    });

    it('should handle undefined input', () => {
      const result = validateLLMData(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model must be an object');
    });

    it('should handle string input', () => {
      const result = validateLLMData('not an object');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model must be an object');
    });
  });
});