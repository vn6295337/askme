const filters = require('../src/filters');

describe('LLM Filters', () => {
  describe('Region filtering', () => {
    it('should identify US/Europe based models', () => {
      const usModel = {
        name: 'GPT-4',
        publisher: 'OpenAI',
        sourceUrl: 'https://openai.com/model'
      };
      
      const europeModel = {
        name: 'Mistral-7B',
        publisher: 'Mistral AI',
        sourceUrl: 'https://mistral.ai/model'
      };
      
      const nonUSEuropeModel = {
        name: 'Some Model',
        publisher: 'Asian Company',
        sourceUrl: 'https://example.com'
      };

      expect(filters.isFromUSOrEurope(usModel)).toBe(true);
      expect(filters.isFromUSOrEurope(europeModel)).toBe(true);
      expect(filters.isFromUSOrEurope(nonUSEuropeModel)).toBe(false);
    });
  });

  describe('Access type filtering', () => {
    it('should identify free access models', () => {
      const openSourceModel = {
        name: 'Llama-2',
        accessType: 'Open Source',
        license: 'Apache 2.0'
      };
      
      const freeAPIModel = {
        name: 'GPT-3.5',
        accessType: 'Free Tier',
        license: 'OpenAI Terms'
      };
      
      const paidModel = {
        name: 'GPT-4',
        accessType: 'Paid',
        license: 'Commercial'
      };

      expect(filters.hasFreeAccess(openSourceModel)).toBe(true);
      expect(filters.hasFreeAccess(freeAPIModel)).toBe(true);
      expect(filters.hasFreeAccess(paidModel)).toBe(false);
    });
  });

  describe('English language support', () => {
    it('should identify English-capable models', () => {
      const englishModel = {
        name: 'GPT-3.5-turbo',
        publisher: 'OpenAI'
      };
      
      const multilingualModel = {
        name: 'Multilingual-BERT',
        publisher: 'Google'
      };
      
      const specificLanguageModel = {
        name: 'Chinese-GPT',
        publisher: 'Some Company'
      };

      expect(filters.supportsEnglish(englishModel)).toBe(true);
      expect(filters.supportsEnglish(multilingualModel)).toBe(true);
      expect(filters.supportsEnglish(specificLanguageModel)).toBe(false);
    });
  });

  describe('Deprecation detection', () => {
    it('should identify deprecated models', () => {
      const activeModel = {
        name: 'GPT-4',
        publisher: 'OpenAI',
        sourceUrl: 'https://openai.com/gpt4'
      };
      
      const deprecatedModel = {
        name: 'GPT-3 Deprecated',
        publisher: 'OpenAI',
        sourceUrl: 'https://openai.com/legacy'
      };

      expect(filters.isDeprecated(activeModel)).toBe(false);
      expect(filters.isDeprecated(deprecatedModel)).toBe(true);
    });
  });

  describe('Activity check', () => {
    it('should identify active models based on release date', () => {
      const recentModel = {
        name: 'Recent Model',
        releaseDate: new Date().toISOString()
      };
      
      const oldModel = {
        name: 'Old Model',
        releaseDate: new Date(2020, 0, 1).toISOString()
      };
      
      const noDateModel = {
        name: 'No Date Model'
      };

      expect(filters.isActive(recentModel)).toBe(true);
      expect(filters.isActive(oldModel)).toBe(false);
      expect(filters.isActive(noDateModel)).toBe(true);
    });
  });

  describe('Model enrichment', () => {
    it('should enrich model data with additional fields', () => {
      const model = {
        name: 'GPT-3.5-turbo',
        publisher: 'OpenAI',
        sourceUrl: 'https://openai.com'
      };

      const enriched = filters.enrichModelData(model);
      
      expect(enriched).toHaveProperty('country');
      expect(enriched).toHaveProperty('modelSize');
      expect(enriched).toHaveProperty('capabilities');
      expect(enriched).toHaveProperty('lastUpdated');
      expect(enriched.country).toBe('US');
    });
  });

  describe('Model size extraction', () => {
    it('should extract model size from name', () => {
      expect(filters.extractModelSize({ name: 'Llama-2-7B' })).toBe('7B');
      expect(filters.extractModelSize({ name: 'GPT-3.5-turbo' })).toBe('Unknown');
      expect(filters.extractModelSize({ name: 'Mistral-7B-Instruct' })).toBe('7B');
    });
  });

  describe('Capability extraction', () => {
    it('should extract capabilities from model name', () => {
      const chatModel = filters.extractCapabilities({ name: 'GPT-4-chat' });
      const codeModel = filters.extractCapabilities({ name: 'CodeLlama-7B' });
      const baseModel = filters.extractCapabilities({ name: 'Llama-2-7B' });

      expect(chatModel).toContain('Conversational');
      expect(codeModel).toContain('Code Generation');
      expect(baseModel).toContain('Text Generation');
    });
  });

  describe('Full filtering pipeline', () => {
    it('should filter models correctly', () => {
      const models = [
        {
          name: 'GPT-4',
          publisher: 'OpenAI',
          accessType: 'Free Tier',
          sourceUrl: 'https://openai.com',
          releaseDate: new Date().toISOString()
        },
        {
          name: 'Chinese-Only-Model',
          publisher: 'Asian Company',
          accessType: 'Open Source',
          sourceUrl: 'https://example.com',
          releaseDate: new Date().toISOString()
        },
        {
          name: 'Old-Deprecated-Model',
          publisher: 'OpenAI',
          accessType: 'Deprecated',
          sourceUrl: 'https://openai.com/legacy',
          releaseDate: new Date(2020, 0, 1).toISOString()
        }
      ];

      const filtered = filters.filterModels(models);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('GPT-4');
    });
  });
});