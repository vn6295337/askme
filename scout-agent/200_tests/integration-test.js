const { main } = require('../src/index');
const crawler = require('../src/crawler');
const reporter = require('../src/reporter');
const { validateLLMData } = require('../src/schemas/llm-model');

// Mock dependencies
jest.mock('../src/crawler');
jest.mock('../src/reporter');

describe('Integration Tests', () => {
  beforeEach(() => {
    crawler.discoverModels.mockClear();
    reporter.sendToBackend.mockClear();
    
    // Mock console methods to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Main agent workflow', () => {
    it('should complete full discovery and reporting workflow', async () => {
      const mockModels = [
        {
          name: 'GPT-4',
          publisher: 'OpenAI',
          country: 'US',
          accessType: 'Free Tier',
          releaseDate: '2023-01-01T00:00:00Z',
          sourceUrl: 'https://openai.com/gpt4'
        },
        {
          name: 'Llama-2-7B',
          publisher: 'Meta',
          country: 'US',
          accessType: 'Open Source',
          releaseDate: '2023-07-01T00:00:00Z',
          sourceUrl: 'https://huggingface.co/meta-llama/Llama-2-7b'
        }
      ];

      crawler.discoverModels.mockResolvedValue(mockModels);
      reporter.sendToBackend.mockResolvedValue(true);

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await main();

      expect(crawler.discoverModels).toHaveBeenCalledTimes(1);
      expect(reporter.sendToBackend).toHaveBeenCalledTimes(1);
      expect(reporter.sendToBackend).toHaveBeenCalledWith(mockModels);
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle discovery errors gracefully', async () => {
      const error = new Error('Discovery failed');
      crawler.discoverModels.mockRejectedValue(error);

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await main();

      expect(crawler.discoverModels).toHaveBeenCalledTimes(1);
      expect(reporter.sendToBackend).not.toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should filter out invalid models', async () => {
      const mockModels = [
        {
          name: 'Valid Model',
          publisher: 'Valid Publisher',
          country: 'US'
        },
        {
          name: '', // Invalid - empty name
          publisher: 'Publisher',
          country: 'US'
        },
        {
          name: 'Another Valid Model',
          publisher: 'Another Publisher',
          country: 'UK'
        }
      ];

      crawler.discoverModels.mockResolvedValue(mockModels);
      reporter.sendToBackend.mockResolvedValue(true);

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await main();

      expect(reporter.sendToBackend).toHaveBeenCalledWith([
        {
          name: 'Valid Model',
          publisher: 'Valid Publisher',
          country: 'US'
        },
        {
          name: 'Another Valid Model',
          publisher: 'Another Publisher',
          country: 'UK'
        }
      ]);
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle case where no models are discovered', async () => {
      crawler.discoverModels.mockResolvedValue([]);
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await main();

      expect(crawler.discoverModels).toHaveBeenCalledTimes(1);
      expect(reporter.sendToBackend).not.toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle backend communication errors', async () => {
      const mockModels = [
        {
          name: 'Valid Model',
          publisher: 'Valid Publisher',
          country: 'US'
        }
      ];

      crawler.discoverModels.mockResolvedValue(mockModels);
      reporter.sendToBackend.mockRejectedValue(new Error('Backend error'));

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await main();

      expect(crawler.discoverModels).toHaveBeenCalledTimes(1);
      expect(reporter.sendToBackend).toHaveBeenCalledTimes(1);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Data validation integration', () => {
    it('should validate discovered models correctly', () => {
      const testModels = [
        {
          name: 'GPT-4',
          publisher: 'OpenAI',
          country: 'US',
          accessType: 'Free Tier',
          releaseDate: '2023-01-01T00:00:00Z',
          sourceUrl: 'https://openai.com/gpt4'
        },
        {
          name: 'Invalid Model',
          publisher: '', // Invalid - empty publisher
          country: 'US'
        }
      ];

      const validModels = testModels.filter(model => {
        const validation = validateLLMData(model);
        return validation.isValid;
      });

      expect(validModels).toHaveLength(1);
      expect(validModels[0].name).toBe('GPT-4');
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors in main workflow', async () => {
      const mockModels = [
        {
          name: 'Valid Model',
          publisher: 'Valid Publisher',
          country: 'US'
        },
        {
          name: null, // Invalid - null name
          publisher: 'Publisher',
          country: 'US'
        }
      ];

      crawler.discoverModels.mockResolvedValue(mockModels);
      reporter.sendToBackend.mockResolvedValue(true);

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await main();

      // Should only send valid models
      expect(reporter.sendToBackend).toHaveBeenCalledWith([
        {
          name: 'Valid Model',
          publisher: 'Valid Publisher',
          country: 'US'
        }
      ]);
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle all models being invalid', async () => {
      const mockModels = [
        {
          name: '',
          publisher: 'Publisher 1',
          country: 'US'
        },
        {
          name: 'Model 2',
          publisher: '', // Invalid
          country: 'US'
        }
      ];

      crawler.discoverModels.mockResolvedValue(mockModels);
      
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await main();

      expect(reporter.sendToBackend).not.toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
  });
});