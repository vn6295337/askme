const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

/**
 * ModelCollector - Handles discovery and collection of LLM models from various sources
 */
class ModelCollector {
  constructor() {
    this.sources = require('../../config/sources/data-sources.json');
    this.rateLimiter = new Map();
  }

  /**
   * Rate limiting to respect API limits
   */
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

  /**
   * Main discovery method - orchestrates all collection sources
   */
  async discoverModels() {
    const allModels = [];
    
    try {
      console.log('🔍 Starting model discovery...');
      
      const [
        githubModels,
        huggingFaceModels,
        companyModels,
        blogModels,
        modelTrackingModels,
        techNewsModels,
        apiDocsModels
      ] = await Promise.all([
        this.collectFromGitHub(),
        this.collectFromHuggingFace(),
        this.collectFromCompanies(),
        this.collectFromBlogs(),
        this.collectFromModelTracking(),
        this.collectFromTechNews(),
        this.collectFromApiDocs()
      ]);
      
      allModels.push(
        ...githubModels,
        ...huggingFaceModels,
        ...companyModels,
        ...blogModels,
        ...modelTrackingModels,
        ...techNewsModels,
        ...apiDocsModels
      );
      
      console.log(`✅ Collected ${allModels.length} models from all sources`);
      return this.removeDuplicates(allModels);
    } catch (error) {
      console.error('❌ Error during model discovery:', error);
      throw error;
    }
  }

  /**
   * Collect models from GitHub repositories
   */
  async collectFromGitHub() {
    if (!this.sources.github?.enabled) {
      console.log('⏭️  GitHub collection disabled');
      return [];
    }
    
    await this.rateLimit('github.com');
    const models = [];
    
    try {
      const searchQueries = this.sources.github.queries || [];
      
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
          models.push({
            name: repo.name,
            publisher: repo.owner.login,
            country: 'Unknown',
            sourceUrl: repo.html_url,
            releaseDate: repo.created_at,
            accessType: 'Open Source',
            license: repo.license?.name || 'Unknown',
            inferenceSupport: 'CPU/GPU',
            source: 'GitHub'
          });
        }
        
        await this.rateLimit('github.com');
      }
      
      console.log(`📦 GitHub: ${models.length} models collected`);
    } catch (error) {
      console.error('❌ GitHub collection error:', error.message);
    }
    
    return models;
  }

  /**
   * Collect models from Hugging Face (filtered by reputable organizations)
   */
  async collectFromHuggingFace() {
    if (!this.sources.huggingface?.enabled) {
      console.log('⏭️  Hugging Face collection disabled');
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
      const reputableOrgs = this.sources.huggingface.reputableOrganizations || [];
      
      for (const model of response.data) {
        const publisher = model.modelId.split('/')[0];
        
        if (reputableOrgs.includes(publisher)) {
          models.push({
            name: model.modelId,
            publisher: publisher,
            country: 'Unknown',
            sourceUrl: `https://huggingface.co/${model.modelId}`,
            releaseDate: model.lastModified,
            accessType: 'Open Source',
            license: model.cardData?.license || 'Unknown',
            inferenceSupport: 'API/CPU/GPU',
            source: 'Hugging Face'
          });
        }
      }
      
      console.log(`🤗 Hugging Face: ${models.length} models collected`);
    } catch (error) {
      console.error('❌ Hugging Face collection error:', error.message);
    }
    
    return models;
  }

  /**
   * Collect models from major AI companies
   */
  async collectFromCompanies() {
    const models = [];
    const companySources = ['openai', 'anthropic', 'google', 'meta', 'mistral', 'cohere'];
    
    for (const company of companySources) {
      if (this.sources[company]?.enabled) {
        const companyModels = this.sources[company].models || [];
        
        for (const modelName of companyModels) {
          models.push({
            name: modelName,
            publisher: this.getCompanyName(company),
            country: this.getCompanyCountry(company),
            sourceUrl: this.getCompanyUrl(company, modelName),
            releaseDate: 'Unknown',
            accessType: this.getAccessType(company),
            license: this.getLicense(company),
            inferenceSupport: 'API',
            source: 'Company'
          });
        }
      }
    }
    
    console.log(`🏢 Companies: ${models.length} models collected`);
    return models;
  }

  /**
   * Collect from blog sources
   */
  async collectFromBlogs() {
    return this.collectFromGenericSources(this.sources.blogs || [], 'Blog');
  }

  /**
   * Collect from model tracking sources
   */
  async collectFromModelTracking() {
    return this.collectFromGenericSources(this.sources.modelTracking || [], 'Model Tracking');
  }

  /**
   * Collect from tech news sources
   */
  async collectFromTechNews() {
    return this.collectFromGenericSources(this.sources.techNews || [], 'Tech News');
  }

  /**
   * Collect from API documentation sources
   */
  async collectFromApiDocs() {
    return this.collectFromGenericSources(this.sources.apiDocs || [], 'API Documentation');
  }

  /**
   * Generic collection method for web scraping sources
   */
  async collectFromGenericSources(sources, sourceType) {
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
            models.push({
              name: title,
              publisher: source.publisher,
              country: this.getPublisherCountry(source.publisher),
              sourceUrl: link.startsWith('http') ? link : `${source.baseUrl}${link}`,
              releaseDate: date,
              accessType: this.getAccessTypeFromSource(sourceType),
              license: 'Unknown',
              inferenceSupport: 'Unknown',
              source: sourceType
            });
          }
        });
      } catch (error) {
        console.error(`❌ ${sourceType} collection error for ${source.url}:`, error.message);
      }
    }
    
    console.log(`📰 ${sourceType}: ${models.length} models collected`);
    return models;
  }

  // Helper methods
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

module.exports = ModelCollector;