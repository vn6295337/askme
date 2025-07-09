const crawler = require('../src/crawler');
const axios = require('axios');

// Mock axios for testing
jest.mock('axios');
const mockedAxios = axios;

describe('LLM Crawler', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
  });

  describe('GitHub crawler', () => {
    it('should fetch repositories from GitHub API', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              name: 'test-llm',
              owner: { login: 'test-org' },
              html_url: 'https://github.com/test-org/test-llm',
              created_at: '2023-01-01T00:00:00Z',
              license: { name: 'MIT' }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await crawler.crawlGitHub();
      
      expect(result).toHaveLength(3); // 3 search queries
      expect(result[0]).toMatchObject({
        name: 'test-llm',
        publisher: 'test-org',
        sourceUrl: 'https://github.com/test-org/test-llm',
        accessType: 'Open Source',
        source: 'GitHub'
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const result = await crawler.crawlGitHub();
      
      expect(result).toEqual([]);
    });
  });

  describe('Hugging Face crawler', () => {
    it('should fetch models from Hugging Face API', async () => {
      const mockResponse = {
        data: [
          {
            modelId: 'test-org/test-model',
            lastModified: '2023-01-01T00:00:00Z',
            cardData: { license: 'apache-2.0' }
          }
        ]
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await crawler.crawlHuggingFace();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'test-org/test-model',
        publisher: 'test-org',
        sourceUrl: 'https://huggingface.co/test-org/test-model',
        accessType: 'Open Source',
        source: 'Hugging Face'
      });
    });
  });

  describe('Rate limiting', () => {
    it('should respect rate limits', async () => {
      const startTime = Date.now();
      
      await crawler.rateLimit('test-domain.com', 100);
      await crawler.rateLimit('test-domain.com', 100);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Duplicate removal', () => {
    it('should remove duplicate models', () => {
      const models = [
        { name: 'Model A', publisher: 'Org 1' },
        { name: 'Model B', publisher: 'Org 2' },
        { name: 'Model A', publisher: 'Org 1' }, // duplicate
        { name: 'Model C', publisher: 'Org 3' }
      ];

      const result = crawler.removeDuplicates(models);
      
      expect(result).toHaveLength(3);
      expect(result.map(m => m.name)).toEqual(['Model A', 'Model B', 'Model C']);
    });
  });

  describe('Full discovery process', () => {
    it('should complete discovery workflow', async () => {
      // Mock all crawler methods
      jest.spyOn(crawler, 'crawlGitHub').mockResolvedValue([
        { name: 'GitHub Model', publisher: 'GitHub Org', source: 'GitHub' }
      ]);
      
      jest.spyOn(crawler, 'crawlHuggingFace').mockResolvedValue([
        { name: 'HF Model', publisher: 'HF Org', source: 'Hugging Face' }
      ]);
      
      jest.spyOn(crawler, 'crawlArxiv').mockResolvedValue([]);
      jest.spyOn(crawler, 'crawlPapersWithCode').mockResolvedValue([]);
      jest.spyOn(crawler, 'crawlBlogs').mockResolvedValue([]);

      const result = await crawler.discoverModels();
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('GitHub Model');
      expect(result[1].name).toBe('HF Model');
    });
  });
});