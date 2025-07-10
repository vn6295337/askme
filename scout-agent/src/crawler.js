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
      // Add fallback static data in case all APIs fail
      const fallbackModels = this.getFallbackModels();
      
      const githubModels = await this.crawlGitHub();
      const huggingFaceModels = await this.crawlHuggingFace();
      const arxivModels = await this.crawlArxiv();
      const papersWithCodeModels = await this.crawlPapersWithCode();
      const blogModels = await this.crawlBlogs();
      
      allModels.push(...fallbackModels, ...githubModels, ...huggingFaceModels, ...arxivModels, ...papersWithCodeModels, ...blogModels);
      
      const filteredModels = filters.filterModels(allModels);
      const deduplicatedModels = this.removeDuplicates(filteredModels);
      
      console.log(`Total models collected: ${allModels.length}, after filtering: ${deduplicatedModels.length}`);
      
      return deduplicatedModels;
    } catch (error) {
      console.error('Error during model discovery:', error);
      // Return fallback models if everything fails
      return this.getFallbackModels();
    }
  }

  async crawlGitHub() {
    await this.rateLimit('github.com');
    const models = [];
    
    try {
      const searchQueries = [
        'language:Python topic:llm topic:free',
        'language:Python topic:language-model topic:open-source',
        'language:Python topic:transformer topic:free'
      ];
      
      // Check if GitHub token is available
      const githubToken = process.env.GITHUB_TOKEN;
      const headers = {
        'User-Agent': 'askme-scout-agent/1.0.0'
      };
      
      if (githubToken && githubToken !== 'undefined' && githubToken.length > 10) {
        headers['Authorization'] = `token ${githubToken}`;
        console.log('Using authenticated GitHub API requests');
      } else {
        console.warn('No valid GitHub token found, using unauthenticated requests (limited rate)');
      }
      
      for (const query of searchQueries) {
        const response = await axios.get(`https://api.github.com/search/repositories`, {
          params: {
            q: query,
            sort: 'updated',
            order: 'desc',
            per_page: 30
          },
          headers
        });
        
        for (const repo of response.data.items) {
          const model = {
            name: repo.name,
            publisher: repo.owner.login,
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
      if (error.response?.status === 403) {
        console.warn('GitHub API rate limit exceeded or authentication failed, skipping GitHub crawl');
      }
    }
    
    return models;
  }

  async crawlHuggingFace() {
    await this.rateLimit('huggingface.co');
    const models = [];
    
    try {
      const response = await axios.get('https://huggingface.co/api/models', {
        params: {
          filter: 'text-generation',
          sort: 'lastModified',
          direction: -1,
          limit: 50
        }
      });
      
      for (const model of response.data) {
        const modelData = {
          name: model.modelId,
          publisher: model.modelId.split('/')[0],
          sourceUrl: `https://huggingface.co/${model.modelId}`,
          releaseDate: model.lastModified,
          accessType: 'Open Source',
          license: model.cardData?.license || 'Unknown',
          inferenceSupport: 'API/CPU/GPU',
          source: 'Hugging Face'
        };
        
        models.push(modelData);
      }
    } catch (error) {
      console.error('Hugging Face crawl error:', error.message);
    }
    
    return models;
  }

  async crawlArxiv() {
    await this.rateLimit('arxiv.org');
    const models = [];
    
    try {
      const searchTerms = ['large language model', 'transformer', 'llm'];
      
      for (const term of searchTerms) {
        const response = await axios.get('http://export.arxiv.org/api/query', {
          params: {
            search_query: `all:${term}`,
            start: 0,
            max_results: 20,
            sortBy: 'submittedDate',
            sortOrder: 'descending'
          }
        });
        
        const $ = cheerio.load(response.data, { xmlMode: true });
        
        $('entry').each((i, entry) => {
          const title = $(entry).find('title').text().trim();
          const authors = $(entry).find('author name').map((i, el) => $(el).text()).get();
          const published = $(entry).find('published').text();
          const link = $(entry).find('id').text();
          
          const model = {
            name: title,
            publisher: authors.join(', '),
            sourceUrl: link,
            releaseDate: published,
            accessType: 'Research Paper',
            license: 'Academic Use',
            inferenceSupport: 'Unknown',
            source: 'arXiv'
          };
          
          models.push(model);
        });
        
        await this.rateLimit('arxiv.org');
      }
    } catch (error) {
      console.error('arXiv crawl error:', error.message);
    }
    
    return models;
  }

  async crawlPapersWithCode() {
    await this.rateLimit('paperswithcode.com');
    const models = [];
    
    try {
      const response = await axios.get('https://paperswithcode.com/api/v1/papers/', {
        params: {
          q: 'language model',
          ordering: '-published'
        }
      });
      
      for (const paper of response.data.results.slice(0, 20)) {
        const model = {
          name: paper.title,
          publisher: paper.authors || 'Unknown',
          sourceUrl: paper.url_abs || paper.url_pdf,
          releaseDate: paper.published,
          accessType: 'Research Paper',
          license: 'Academic Use',
          inferenceSupport: 'Unknown',
          source: 'Papers with Code'
        };
        
        models.push(model);
      }
    } catch (error) {
      console.error('Papers with Code crawl error:', error.message);
    }
    
    return models;
  }

  async crawlBlogs() {
    const models = [];
    const blogSources = this.sources.blogs || [];
    
    for (const blogSource of blogSources) {
      try {
        await this.rateLimit(new URL(blogSource.url).hostname);
        
        const response = await axios.get(blogSource.url, {
          headers: {
            'User-Agent': 'askme-scout-agent/1.0.0'
          }
        });
        
        const $ = cheerio.load(response.data);
        
        $(blogSource.selector).each((i, element) => {
          const title = $(element).find(blogSource.titleSelector).text().trim();
          const link = $(element).find(blogSource.linkSelector).attr('href');
          const date = $(element).find(blogSource.dateSelector).text();
          
          if (title && link) {
            const model = {
              name: title,
              publisher: blogSource.publisher,
              sourceUrl: link.startsWith('http') ? link : `${blogSource.baseUrl}${link}`,
              releaseDate: date,
              accessType: 'Blog Post',
              license: 'Unknown',
              inferenceSupport: 'Unknown',
              source: 'Blog'
            };
            
            models.push(model);
          }
        });
      } catch (error) {
        console.error(`Blog crawl error for ${blogSource.url}:`, error.message);
      }
    }
    
    return models;
  }

  getFallbackModels() {
    // Static fallback data in case all APIs fail
    return [
      {
        name: 'Llama 2',
        publisher: 'Meta',
        sourceUrl: 'https://github.com/facebookresearch/llama',
        releaseDate: '2023-07-18',
        accessType: 'Open Source',
        license: 'Custom',
        inferenceSupport: 'CPU/GPU',
        source: 'Fallback Data'
      },
      {
        name: 'GPT4All',
        publisher: 'Nomic AI',
        sourceUrl: 'https://github.com/nomic-ai/gpt4all',
        releaseDate: '2023-03-27',
        accessType: 'Open Source',
        license: 'MIT',
        inferenceSupport: 'CPU',
        source: 'Fallback Data'
      },
      {
        name: 'Vicuna',
        publisher: 'LMSYS',
        sourceUrl: 'https://github.com/lm-sys/FastChat',
        releaseDate: '2023-03-30',
        accessType: 'Open Source',
        license: 'Apache 2.0',
        inferenceSupport: 'CPU/GPU',
        source: 'Fallback Data'
      },
      {
        name: 'Alpaca',
        publisher: 'Stanford',
        sourceUrl: 'https://github.com/tatsu-lab/stanford_alpaca',
        releaseDate: '2023-03-13',
        accessType: 'Open Source',
        license: 'Apache 2.0',
        inferenceSupport: 'CPU/GPU',
        source: 'Fallback Data'
      },
      {
        name: 'Code Llama',
        publisher: 'Meta',
        sourceUrl: 'https://github.com/facebookresearch/codellama',
        releaseDate: '2023-08-24',
        accessType: 'Open Source',
        license: 'Custom',
        inferenceSupport: 'CPU/GPU',
        source: 'Fallback Data'
      }
    ];
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