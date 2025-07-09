const reporter = require('../src/reporter');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Mock dependencies
jest.mock('axios');
jest.mock('fs-extra');

const mockedAxios = axios;
const mockedFs = fs;

describe('Backend Reporter', () => {
  beforeEach(() => {
    mockedAxios.mockClear();
    mockedFs.ensureDir.mockClear();
    mockedFs.writeJson.mockClear();
    mockedFs.writeFile.mockClear();
    mockedFs.readJson.mockClear();
    mockedFs.pathExists.mockClear();
    
    // Mock successful directory creation
    mockedFs.ensureDir.mockResolvedValue(true);
    mockedFs.writeJson.mockResolvedValue(true);
    mockedFs.writeFile.mockResolvedValue(true);
  });

  describe('Model enrichment', () => {
    it('should enrich models with metadata', () => {
      const models = [
        {
          name: 'GPT-4',
          publisher: 'OpenAI',
          country: 'US'
        }
      ];

      const enriched = reporter.enrichModels(models);
      
      expect(enriched[0]).toHaveProperty('discoveryTimestamp');
      expect(enriched[0]).toHaveProperty('agentVersion');
      expect(enriched[0]).toHaveProperty('validationStatus');
      expect(enriched[0].agentVersion).toBe('1.0.0');
      expect(enriched[0].validationStatus).toBe('validated');
    });
  });

  describe('Report generation', () => {
    it('should generate a complete report', () => {
      const models = [
        {
          name: 'GPT-4',
          publisher: 'OpenAI',
          country: 'US',
          source: 'GitHub',
          accessType: 'Free Tier',
          modelSize: '175B'
        },
        {
          name: 'Llama-2',
          publisher: 'Meta',
          country: 'US',
          source: 'Hugging Face',
          accessType: 'Open Source',
          modelSize: '7B'
        }
      ];

      const report = reporter.generateReport(models);
      
      expect(report).toHaveProperty('metadata');
      expect(report).toHaveProperty('models');
      expect(report).toHaveProperty('summary');
      
      expect(report.metadata.totalModels).toBe(2);
      expect(report.metadata.sources).toContain('GitHub');
      expect(report.metadata.sources).toContain('Hugging Face');
      
      expect(report.summary.totalModels).toBe(2);
      expect(report.summary.bySource.GitHub).toBe(1);
      expect(report.summary.bySource['Hugging Face']).toBe(1);
      expect(report.summary.byAccessType['Free Tier']).toBe(1);
      expect(report.summary.byAccessType['Open Source']).toBe(1);
    });
  });

  describe('Local file operations', () => {
    it('should save local copy of report', async () => {
      const report = {
        metadata: {
          runId: 'test-run-123',
          timestamp: '2023-01-01T00:00:00Z'
        },
        models: []
      };

      await reporter.saveLocalCopy(report);
      
      expect(mockedFs.ensureDir).toHaveBeenCalled();
      expect(mockedFs.writeJson).toHaveBeenCalledTimes(2); // One for timestamped file, one for latest
      
      const calls = mockedFs.writeJson.mock.calls;
      expect(calls[0][0]).toContain('llm-discovery-test-run-123.json');
      expect(calls[1][0]).toContain('latest.json');
    });
  });

  describe('Backend communication', () => {
    it('should successfully post to backend', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: { success: true }
      };

      mockedAxios.mockResolvedValue(mockResponse);
      
      // Set environment variables for test
      process.env.BACKEND_URL = 'https://test-backend.com';
      process.env.AGENT_AUTH_TOKEN = 'test-token';

      const report = {
        metadata: { runId: 'test-123' },
        models: [{ name: 'Test Model' }]
      };

      await reporter.postToBackend(report);
      
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://test-backend.com/api/llms',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
          'User-Agent': 'askme-scout-agent/1.0.0'
        },
        data: {
          models: report.models,
          metadata: report.metadata
        },
        timeout: 30000
      });
    });

    it('should handle backend errors', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };

      mockedAxios.mockRejectedValue(mockError);
      
      process.env.BACKEND_URL = 'https://test-backend.com';
      process.env.AGENT_AUTH_TOKEN = 'test-token';

      const report = {
        metadata: { runId: 'test-123' },
        models: [{ name: 'Test Model' }]
      };

      await expect(reporter.postToBackend(report)).rejects.toThrow();
    });

    it('should skip backend submission when URL not configured', async () => {
      process.env.BACKEND_URL = 'https://your-render-app.onrender.com';
      
      const report = {
        metadata: { runId: 'test-123' },
        models: [{ name: 'Test Model' }]
      };

      await reporter.postToBackend(report);
      
      expect(mockedAxios).not.toHaveBeenCalled();
    });
  });

  describe('CSV export', () => {
    it('should export models to CSV format', async () => {
      const models = [
        {
          name: 'GPT-4',
          publisher: 'OpenAI',
          country: 'US'
        },
        {
          name: 'Llama-2',
          publisher: 'Meta',
          country: 'US'
        }
      ];

      const csvContent = await reporter.exportToCsv(models);
      
      expect(csvContent).toContain('name,publisher,country');
      expect(csvContent).toContain('GPT-4,OpenAI,US');
      expect(csvContent).toContain('Llama-2,Meta,US');
      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it('should handle empty models array', async () => {
      const csvContent = await reporter.exportToCsv([]);
      
      expect(csvContent).toBe('No models to export');
    });
  });

  describe('Latest report retrieval', () => {
    it('should retrieve latest report', async () => {
      const mockReport = {
        metadata: { runId: 'test-123' },
        models: [{ name: 'Test Model' }]
      };

      mockedFs.readJson.mockResolvedValue(mockReport);

      const result = await reporter.getLatestReport();
      
      expect(result).toEqual(mockReport);
      expect(mockedFs.readJson).toHaveBeenCalledWith(
        expect.stringContaining('latest.json')
      );
    });

    it('should handle missing latest report', async () => {
      mockedFs.readJson.mockRejectedValue(new Error('File not found'));

      const result = await reporter.getLatestReport();
      
      expect(result).toBeNull();
    });
  });

  describe('Full workflow', () => {
    it('should complete entire send workflow', async () => {
      const models = [
        {
          name: 'GPT-4',
          publisher: 'OpenAI',
          country: 'US'
        }
      ];

      const mockAxiosResponse = {
        status: 200,
        statusText: 'OK'
      };

      mockedAxios.mockResolvedValue(mockAxiosResponse);
      
      process.env.BACKEND_URL = 'https://test-backend.com';
      process.env.AGENT_AUTH_TOKEN = 'test-token';

      await reporter.sendToBackend(models);
      
      expect(mockedFs.ensureDir).toHaveBeenCalled();
      expect(mockedFs.writeJson).toHaveBeenCalled();
      expect(mockedAxios).toHaveBeenCalled();
    });
  });
});