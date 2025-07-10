const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const filters = require('./filters');

class LLMCrawler {
  constructor() {
    this.sources = require('../config/sources.json');
    this.rateLimiter = new Map();
  }

  async rateLimit(domain, delayMs = 1000) {
    const lastRequest = this.rateLimiter.get(domain);
    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - lastRequest;
      if (timeSinceLastRequest < delayMs) {
        await new Promise(resolve => setTimeout(resolve, delayMs - timeSinceLastRequest));
      }
    }
    this.rateLimiter.set(domain, Date.now());
  }

  async discoverModels() {
    const allModels = [];
    
    try {
      const githubModels = await this.crawlGitHub();
      const huggingFaceModels = await this.crawlHuggingFace();
      const companyModels = await this.crawlCompanyModels();
      const blogModels = await this.crawlBlogs();
      const modelTrackingModels = await this.crawlModelTracking();
      const techNewsModels = await this.crawlTechNews();
      const apiDocsModels = await this.crawlApiDocs();
      
      allModels.push(...githubModels, ...huggingFaceModels, ...companyModels, ...blogModels, ...modelTrackingModels, ...techNewsModels, ...apiDocsModels);
      
      const filteredModels = filters.filterModels(allModels);
      const deduplicatedModels = this.removeDuplicates(filteredModels);
      
      return deduplicatedModels;
    } catch (error) {
      console.error('Error during model discovery:', error);
      throw error;
    }
  }

  async crawlGitHub() {
    if (!this.sources.github?.enabled) {
      console.log('GitHub crawling is disabled');
      return [];
    }
    
    await this.rateLimit('github.com');
    const models = [];
    
    try {
      const searchQueries = this.sources.github.queries || [
        'language:Python topic:llm topic:free',
        'language:Python topic:language-model topic:open-source',
        'language:Python topic:transformer topic:free'
      ];
      
      for (const query of searchQueries) {
        const response = await axios.get(`https://api.github.com/search/repositories`, {
          params: {
            q: query,
            sort: 'updated',
            order: 'desc',
            per_page: 30
          },
          headers: {
            'User-Agent': 'askme-scout-agent/1.0.0'
          }
        });
        
        for (const repo of response.data.items) {
          const model = {
            name: repo.name,
            publisher: repo.owner.login,
            country: 'Unknown', // Default country field
            sourceUrl: repo.html_url,
            releaseDate: repo.created_at,
            accessType: 'Open Source',
            license: repo.license?.name || 'Unknown',
            inferenceSupport: 'CPU/GPU',
            source: 'GitHub'
          };
          
          models.push(model);
        }
        
        await this.rateLimit('github.com');
      }
    } catch (error) {
      console.error('GitHub crawl error:', error.message);
    }
    
    return models;
  }

  async crawlHuggingFace() {
    if (!this.sources.huggingface?.enabled) {
      console.log('Hugging Face crawling is disabled');
      return [];
    }
    
    await this.rateLimit('huggingface.co');
    const models = [];
    
    try {
      const params = {
        filter: 'text-generation',
        sort: this.sources.huggingface.filters.sort || 'downloads',
        direction: this.sources.huggingface.filters.direction || -1,
        limit: this.sources.huggingface.filters.limit || 30
      };
      
      const response = await axios.get('https://huggingface.co/api/models', { params });
      
      for (const model of response.data) {
        const publisher = model.modelId.split('/')[0];
        const reputableOrgs = this.sources.huggingface.reputableOrganizations || [];
        
        // Only include models from reputable organizations
        if (reputableOrgs.includes(publisher)) {
          const modelData = {
            name: model.modelId,
            publisher: publisher,
            country: 'Unknown',
            sourceUrl: `https://huggingface.co/${model.modelId}`,
            releaseDate: model.lastModified,
            accessType: 'Open Source',
            license: model.cardData?.license || 'Unknown',
            inferenceSupport: 'API/CPU/GPU',
            source: 'Hugging Face'
          };
          
          models.push(modelData);
        }
      }
    } catch (error) {
      console.error('Hugging Face crawl error:', error.message);
    }
    
    return models;
  }

  async crawlArxiv() {
    // arXiv is disabled to focus on production models
    console.log('arXiv crawling is disabled');
    return [];
  }

  async crawlCompanyModels() {
    const models = [];
    
    // Add predefined company models
    const companySources = ['openai', 'anthropic', 'google', 'meta', 'mistral', 'cohere'];
    
    for (const company of companySources) {
      if (this.sources[company]?.enabled) {
        const companyModels = this.sources[company].models || [];
        
        for (const modelName of companyModels) {
          const model = {
            name: modelName,
            publisher: this.getCompanyName(company),
            country: this.getCompanyCountry(company),
            sourceUrl: this.getCompanyUrl(company, modelName),
            releaseDate: 'Unknown',
            accessType: this.getAccessType(company),
            license: this.getLicense(company),
            inferenceSupport: 'API',
            source: 'Company'
          };
          
          models.push(model);
        }
      }
    }
    
    return models;
  }
  
  getCompanyName(company) {
    const names = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google': 'Google',
      'meta': 'Meta',
      'mistral': 'Mistral AI',
      'cohere': 'Cohere'
    };
    return names[company] || company;
  }
  
  getCompanyCountry(company) {
    const countries = {
      'openai': 'US',
      'anthropic': 'US',
      'google': 'US',
      'meta': 'US',
      'mistral': 'France',
      'cohere': 'Canada'
    };
    return countries[company] || 'Unknown';
  }
  
  getCompanyUrl(company, modelName) {
    const baseUrls = {
      'openai': 'https://platform.openai.com/docs/models',
      'anthropic': 'https://docs.anthropic.com/claude/docs/models-overview',
      'google': 'https://ai.google.dev/models',
      'meta': 'https://llama.meta.com/',
      'mistral': 'https://docs.mistral.ai/getting-started/models/',
      'cohere': 'https://docs.cohere.com/docs/models'
    };
    return baseUrls[company] || '';
  }
  
  getAccessType(company) {
    const accessTypes = {
      'openai': 'Commercial API',
      'anthropic': 'Commercial API',
      'google': 'Free Tier/Commercial API',
      'meta': 'Open Source',
      'mistral': 'Open Source/Commercial API',
      'cohere': 'Free Tier/Commercial API'
    };
    return accessTypes[company] || 'Unknown';
  }
  
  getLicense(company) {
    const licenses = {
      'openai': 'Proprietary',
      'anthropic': 'Proprietary',
      'google': 'Apache 2.0/Proprietary',
      'meta': 'Custom Open Source',
      'mistral': 'Apache 2.0/Proprietary',
      'cohere': 'Proprietary'
    };
    return licenses[company] || 'Unknown';
  }

  async crawlBlogs() {
    return this.crawlGenericSources(this.sources.blogs || [], 'Blog');
  }

  async crawlModelTracking() {
    return this.crawlGenericSources(this.sources.modelTracking || [], 'Model Tracking');
  }

  async crawlTechNews() {
    return this.crawlGenericSources(this.sources.techNews || [], 'Tech News');
  }

  async crawlApiDocs() {
    return this.crawlGenericSources(this.sources.apiDocs || [], 'API Documentation');
  }

  async crawlGenericSources(sources, sourceType) {
    const models = [];
    
    for (const source of sources) {
      try {
        await this.rateLimit(new URL(source.url).hostname);
        
        const response = await axios.get(source.url, {
          headers: {
            'User-Agent': 'askme-scout-agent/1.0.0'
          }
        });
        
        const $ = cheerio.load(response.data);
        
        $(source.selector).each((i, element) => {
          const title = $(element).find(source.titleSelector).text().trim();
          const link = $(element).find(source.linkSelector).attr('href');
          const date = $(element).find(source.dateSelector).text();
          
          if (title && link && this.isRelevantToModels(title)) {
            const model = {
              name: title,
              publisher: source.publisher,
              country: this.getPublisherCountry(source.publisher),
              sourceUrl: link.startsWith('http') ? link : `${source.baseUrl}${link}`,
              releaseDate: date,
              accessType: this.getAccessTypeFromSource(sourceType),
              license: 'Unknown',
              inferenceSupport: 'Unknown',
              source: sourceType
            };
            
            models.push(model);
          }
        });
      } catch (error) {
        console.error(`${sourceType} crawl error for ${source.url}:`, error.message);
      }
    }
    
    return models;
  }

  isRelevantToModels(title) {
    const keywords = [
      'llm', 'model', 'gpt', 'claude', 'gemini', 'llama', 'mistral', 'release', 'launched',
      'api', 'ai', 'language model', 'transformer', 'chat', 'assistant', 'upgrade', 'update',
      'new version', 'deprecated', 'discontinued', 'beta', 'preview'
    ];
    
    return keywords.some(keyword => title.toLowerCase().includes(keyword));
  }

  getPublisherCountry(publisher) {
    const countries = {
      'OpenAI': 'US', 'Anthropic': 'US', 'Google': 'US', 'Meta': 'US', 'Microsoft': 'US',
      'Mistral AI': 'France', 'Cohere': 'Canada', 'Hugging Face': 'France',
      'TechCrunch': 'US', 'VentureBeat': 'US', 'The Verge': 'US', 'LlamaIndex': 'US',
      'FutureTools': 'US', 'Epoch AI': 'UK', 'Crescendo AI': 'US'
    };
    return countries[publisher] || 'Unknown';
  }

  getAccessTypeFromSource(sourceType) {
    const accessTypes = {
      'Model Tracking': 'Open Source/Commercial',
      'Tech News': 'News Article',
      'API Documentation': 'API Reference',
      'Blog': 'Blog Post'
    };
    return accessTypes[sourceType] || 'Unknown';
  }

  removeDuplicates(models) {
    const seen = new Set();
    return models.filter(model => {
      const key = `${model.name}-${model.publisher}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

module.exports = new LLMCrawler();