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
      const blogModels = await this.crawlBlogs();
      
      // Crawl new sources
      const apiProviderModels = await this.crawlApiProviders();
      const newsModels = await this.crawlCommunityNews();
      const leaderboardModels = await this.crawlLeaderboards();
      
      allModels.push(...fallbackModels, ...githubModels, ...huggingFaceModels, ...blogModels, 
                    ...apiProviderModels, ...newsModels, ...leaderboardModels);
      
      // Enrich models with additional data before filtering
      const enrichedModels = allModels.map(model => filters.enrichModelData(model));
      
      const filteredModels = filters.filterModels(enrichedModels);
      const deduplicatedModels = this.removeDuplicates(filteredModels);
      
      console.log(`Total models collected: ${allModels.length}, after filtering: ${deduplicatedModels.length}`);
      
      return deduplicatedModels;
    } catch (error) {
      console.error('Error during model discovery:', error);
      // Return fallback models if everything fails
      const fallbackModels = this.getFallbackModels();
      return fallbackModels.map(model => filters.enrichModelData(model));
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
            shortName: this.deriveShortName(repo.name),
            country: await this.detectCountry(repo.name, repo.owner.login),
            modelSize: this.extractModelSize(repo.name),
            sourceUrl: repo.html_url,
            releaseDate: this.formatReleaseDate(repo.created_at).split('T')[0],
            accessType: 'Open Source',
            license: repo.license?.name || 'Unknown'
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
      // Check if HuggingFace token is available
      const hfToken = process.env.HUGGINGFACE_TOKEN || process.env.HF_TOKEN;
      const headers = {
        'User-Agent': 'askme-scout-agent/1.0.0'
      };
      
      if (hfToken && hfToken !== 'undefined' && hfToken.length > 10) {
        headers['Authorization'] = `Bearer ${hfToken}`;
        console.log('Using authenticated HuggingFace API requests');
      } else {
        console.warn('No valid HuggingFace token found, using unauthenticated requests (limited rate)');
      }
      
      const response = await axios.get('https://huggingface.co/api/models', {
        params: {
          filter: 'text-generation',
          sort: 'lastModified',
          direction: -1,
          limit: 50
        },
        headers
      });
      
      for (const model of response.data) {
        const modelData = {
          name: model.modelId,
          shortName: this.deriveShortName(model.modelId),
          country: await this.detectCountry(model.modelId, model.modelId.split('/')[0]),
          modelSize: this.extractModelSize(model.modelId),
          sourceUrl: `https://huggingface.co/${model.modelId}`,
          releaseDate: this.formatReleaseDate(model.lastModified).split('T')[0],
          accessType: 'Open Source',
          license: model.cardData?.license || 'Unknown'
        };
        
        models.push(modelData);
      }
    } catch (error) {
      console.error('Hugging Face crawl error:', error.message);
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
        
        const elements = $(blogSource.selector);
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const title = $(element).find(blogSource.titleSelector).text().trim();
          const link = $(element).find(blogSource.linkSelector).attr('href');
          const date = $(element).find(blogSource.dateSelector).text();
          
          if (title && link) {
            const model = {
              name: title,
              shortName: this.deriveShortName(title),
              country: await this.detectCountry(title, blogSource.publisher),
              modelSize: this.extractModelSize(title),
              sourceUrl: link.startsWith('http') ? link : `${blogSource.baseUrl}${link}`,
              releaseDate: this.formatReleaseDate(date).split('T')[0],
              accessType: 'Blog Post',
              license: 'Unknown'
            };
            
            models.push(model);
          }
        }
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
        shortName: 'Llama-2',
        country: 'US',
        modelSize: '7B',
        sourceUrl: 'https://github.com/facebookresearch/llama',
        releaseDate: '2023-07-18',
        accessType: 'Open Source',
        license: 'Custom'
      },
      {
        name: 'GPT4All',
        shortName: 'GPT4All',
        country: 'US',
        modelSize: '7B',
        sourceUrl: 'https://github.com/nomic-ai/gpt4all',
        releaseDate: '2023-03-27',
        accessType: 'Open Source',
        license: 'MIT'
      },
      {
        name: 'Vicuna',
        shortName: 'Vicuna',
        country: 'US',
        modelSize: '7B',
        sourceUrl: 'https://github.com/lm-sys/FastChat',
        releaseDate: '2023-03-30',
        accessType: 'Open Source',
        license: 'Apache 2.0'
      },
      {
        name: 'Alpaca',
        shortName: 'Alpaca',
        country: 'US',
        modelSize: '7B',
        sourceUrl: 'https://github.com/tatsu-lab/stanford_alpaca',
        releaseDate: '2023-03-13',
        accessType: 'Open Source',
        license: 'Apache 2.0'
      },
      {
        name: 'Code Llama',
        shortName: 'Code-Llama',
        country: 'US',
        modelSize: '7B',
        sourceUrl: 'https://github.com/facebookresearch/codellama',
        releaseDate: '2023-08-24',
        accessType: 'Open Source',
        license: 'Custom'
      }
    ];
  }

  async crawlApiProviders() {
    const models = [];
    
    if (!this.sources.apiProviders) return models;
    
    for (const provider of this.sources.apiProviders) {
      if (provider.enabled) {
        console.log(`Crawling API provider: ${provider.name}...`);
        
        try {
          await this.rateLimit(provider.url);
          
          if (provider.apiUrl) {
            const response = await axios.get(provider.apiUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LLMScout/1.0)' }
            });
            
            const providerModels = await this.parseApiProviderResponse(response.data, provider);
            models.push(...providerModels);
            console.log(`Found ${providerModels.length} models from ${provider.name}`);
          }
        } catch (error) {
          console.error(`Error crawling API provider ${provider.name}:`, error.message);
        }
      }
    }
    
    return models;
  }

  async crawlCommunityNews() {
    const models = [];
    
    if (!this.sources.communityNews) return models;
    
    for (const news of this.sources.communityNews) {
      if (news.enabled) {
        console.log(`Crawling community news: ${news.name}...`);
        
        try {
          await this.rateLimit(news.url);
          
          if (news.type === 'rss' && news.feedUrl) {
            // Skip RSS for now, implement basic scraping
            const response = await axios.get(news.url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LLMScout/1.0)' }
            });
            
            const newsModels = await this.parseNewsPage(response.data, news);
            models.push(...newsModels);
            console.log(`Found ${newsModels.length} model mentions from ${news.name}`);
          }
        } catch (error) {
          console.error(`Error crawling community news ${news.name}:`, error.message);
        }
      }
    }
    
    return models;
  }

  async crawlLeaderboards() {
    const models = [];
    
    if (!this.sources.leaderboards) return models;
    
    for (const leaderboard of this.sources.leaderboards) {
      if (leaderboard.enabled) {
        console.log(`Crawling leaderboard: ${leaderboard.name}...`);
        
        try {
          await this.rateLimit(leaderboard.url);
          
          const response = await axios.get(leaderboard.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LLMScout/1.0)' }
          });
          
          const leaderboardModels = await this.parseLeaderboardPage(response.data, leaderboard);
          models.push(...leaderboardModels);
          console.log(`Found ${leaderboardModels.length} models from ${leaderboard.name}`);
        } catch (error) {
          console.error(`Error crawling leaderboard ${leaderboard.name}:`, error.message);
        }
      }
    }
    
    return models;
  }

  async parseApiProviderResponse(data, provider) {
    const models = [];
    
    try {
      const modelArray = data.models || data.data || data || [];
      
      if (Array.isArray(modelArray)) {
        for (const item of modelArray) {
          const fullName = item.name || item.id || item.model_name || 'Unknown';
          const model = {
            name: fullName,
            shortName: this.deriveShortName(fullName),
            country: await this.detectCountry(fullName, provider.publisher),
            modelSize: this.extractModelSize(fullName),
            releaseDate: this.formatReleaseDate(item.created_at || item.created || 'Unknown').split('T')[0],
            sourceUrl: item.url || item.link || provider.url,
            license: item.license || 'Unknown',
            accessType: provider.accessType || 'API'
          };
          
          if (this.isLLMRelated(model.name)) {
            models.push(model);
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing API provider response for ${provider.name}:`, error.message);
    }
    
    return models;
  }

  async parseNewsPage(html, news) {
    const models = [];
    
    try {
      const $ = cheerio.load(html);
      const selector = news.selector || 'article, .post, .news-item';
      
      const elements = $(selector);
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const title = $(element).find('h1, h2, h3, .title').first().text().trim();
        if (this.containsKeywords(title, news.keywords)) {
          const fullName = this.extractModelName(title);
          const model = {
            name: fullName,
            shortName: this.deriveShortName(fullName),
            country: await this.detectCountry(fullName, news.publisher),
            modelSize: this.extractModelSize(title),
            releaseDate: 'Unknown',
            sourceUrl: news.url,
            license: 'Unknown',
            accessType: 'News Reference'
          };
          models.push(model);
        }
      }
    } catch (error) {
      console.error(`Error parsing news page for ${news.name}:`, error.message);
    }
    
    return models;
  }

  async parseLeaderboardPage(html, leaderboard) {
    const models = [];
    
    try {
      const $ = cheerio.load(html);
      
      const elements = $('table tbody tr, .leaderboard-entry, .model-row');
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const modelName = $(element).find('td:first-child, .model-name').text().trim();
        
        if (this.isLLMRelated(modelName)) {
          const model = {
            name: modelName,
            shortName: this.deriveShortName(modelName),
            country: await this.detectCountry(modelName, 'Unknown'),
            modelSize: this.extractModelSize(modelName),
            releaseDate: 'Unknown',
            sourceUrl: leaderboard.url,
            license: 'Unknown',
            accessType: 'Leaderboard Entry'
          };
          models.push(model);
        }
      }
    } catch (error) {
      console.error(`Error parsing leaderboard page for ${leaderboard.name}:`, error.message);
    }
    
    return models;
  }

  containsKeywords(text, keywords) {
    if (!keywords || !Array.isArray(keywords)) return true;
    
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  extractModelName(text) {
    // Extract model name from text (first capitalized word or known pattern)
    const modelPatterns = [
      /\b(GPT-?\d+|Claude|Llama|Mistral|Falcon|Vicuna|Alpaca|T5|BERT|RoBERTa|DeBERTa)\b/i,
      /\b[A-Z][a-z]+-\d+[BM]?\b/,
      /\b[A-Z][a-z]+\s+\d+[BM]?\b/
    ];
    
    for (const pattern of modelPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    // Fallback to first few words
    const words = text.split(/\s+/).slice(0, 3);
    return words.join(' ') || 'Unknown Model';
  }

  deriveShortName(fullName) {
    if (!fullName || fullName === 'Unknown') return 'Unknown';
    
    // Handle format like "p2g8gensyn/Qwen2.5-0.5B-Gensyn-Swarm-diving_giant_alpaca"
    const parts = fullName.split('/');
    const modelPart = parts[parts.length - 1]; // Get the part after "/"
    
    // Extract base model name and size
    const baseModelPatterns = [
      // Qwen patterns
      /^(Qwen\d*\.?\d*)-(\d+\.?\d*[BM])/i,
      // Llama patterns  
      /^(Llama[- ]?\d*\.?\d*)-(\d+\.?\d*[BM])/i,
      // Mistral patterns
      /^(Mistral[- ]?\d*\.?\d*)-(\d+\.?\d*[BM])/i,
      // GPT patterns
      /^(GPT[- ]?\d*\.?\d*)-(\d+\.?\d*[BM])/i,
      // Generic patterns
      /^([A-Za-z]+\d*\.?\d*)-(\d+\.?\d*[BM])/i
    ];
    
    for (const pattern of baseModelPatterns) {
      const match = modelPart.match(pattern);
      if (match) {
        const baseName = match[1];
        const size = match[2];
        
        // Extract additional identifier (like "Gensyn")
        const remainder = modelPart.replace(match[0], '');
        const additionalParts = remainder.split(/[-_]/);
        const identifier = additionalParts.find(part => 
          part.length > 2 && 
          part.length < 15 && 
          !/^(chat|instruct|base|fine|tuned|swarm|diving|giant|alpaca)$/i.test(part)
        );
        
        if (identifier) {
          return `${baseName}-${size}-${identifier}`;
        } else {
          return `${baseName}-${size}`;
        }
      }
    }
    
    // Fallback: try to extract first meaningful part
    const cleanName = modelPart.replace(/[-_]/g, ' ').split(' ');
    const meaningfulParts = cleanName.filter(part => 
      part.length > 2 && 
      !/^(chat|instruct|base|fine|tuned|model|llm)$/i.test(part)
    ).slice(0, 3);
    
    return meaningfulParts.join('-') || fullName.substring(0, 30);
  }

  async detectCountry(modelName, publisher) {
    // Enhanced country detection with external sources
    const countryMap = {
      // Company-based detection
      'openai': 'US',
      'anthropic': 'US', 
      'google': 'US',
      'microsoft': 'US',
      'meta': 'US',
      'facebook': 'US',
      'nvidia': 'US',
      'together': 'US',
      'replicate': 'US',
      'openrouter': 'US',
      'perplexity': 'US',
      'cohere': 'Canada',
      'mistral': 'France',
      'deepmind': 'UK',
      'stability': 'UK',
      'huggingface': 'US',
      
      // Model-based detection
      'qwen': 'China',
      'baichuan': 'China',
      'chatglm': 'China',
      'internlm': 'China',
      'yi': 'China',
      'llama': 'US',
      'mistral': 'France',
      'falcon': 'UAE',
      'bloom': 'France',
      'alpaca': 'US',
      'vicuna': 'US',
      'claude': 'US',
      'gpt': 'US',
      'palm': 'US',
      'bard': 'US',
      'gemini': 'US',
      
      // Extended model database with research
      'ernie': 'China',        // Baidu
      'pangu': 'China',        // Huawei
      'wenxin': 'China',       // Baidu
      'tongyi': 'China',       // Alibaba
      'sage': 'China',         // 360
      'moss': 'China',         // Fudan University
      'aquila': 'China',       // BAAI
      'glm': 'China',          // Tsinghua
      'phoenix': 'China',      // ByteDance
      'yuan': 'China',         // Inspur
      'solar': 'South Korea',  // Upstage
      'polyglot': 'South Korea', // EleutherAI Korea
      'klue': 'South Korea',   // NAVER
      'hyperclova': 'South Korea', // NAVER
      'rinna': 'Japan',        // Rinna Inc
      'gpt-neox': 'Japan',     // Japanese variant
      'stockmark': 'Japan',    // Stockmark
      'elyza': 'Japan',        // ELYZA
      'nekomata': 'Japan',     // Nekomata
      'japanese-gpt': 'Japan', // Japanese GPT
      'swallow': 'Japan',      // Swallow
      'stablelm': 'Japan',     // Stability AI Japan
      'reka': 'Canada',        // Reka AI
      'alpaca-lora': 'US',     // Stanford
      'databricks': 'US',      // Databricks
      'mpt': 'US',             // MosaicML
      'falcon-7b': 'UAE',      // Technology Innovation Institute
      'bloom-7b': 'France',    // BigScience
      'flan-t5': 'US',         // Google
      'opt': 'US',             // Meta
      'galactica': 'US',       // Meta
      'codegen': 'US',         // Salesforce
      'santacoder': 'France',  // BigCode
      'starcoder': 'France',   // BigCode
      'wizardcoder': 'US',     // WizardLM
      'phind': 'US',           // Phind
      'airoboros': 'US',       // jondurbin
      'manticore': 'US',       // Open Assistant
      'guanaco': 'US',         // UW
      'koala': 'US',           // Berkeley
      'nous-hermes': 'US',     // NousResearch
      'wizard': 'US',          // WizardLM
      'openchat': 'US',        // OpenChat
      'zephyr': 'US',          // HuggingFace
      'mixtral': 'France',     // Mistral AI
      'dolphin': 'US',         // Cognitive Computations
      'orca': 'US',            // Microsoft
      'platypus': 'US',        // Platypus
      'samantha': 'US',        // Cognitive Computations
      'limarp': 'US',          // Limarp
      'hermes': 'US',          // NousResearch
      'airoboros': 'US',       // jondurbin
      'synthia': 'US',         // Synthia
      'chronos': 'US',         // Chronos
      'neural-chat': 'US',     // Intel
      'phi': 'US',             // Microsoft
      'deepseek': 'China',     // DeepSeek
      'internlm2': 'China',    // InternLM
      'baichuan2': 'China',    // Baichuan
      'yi-6b': 'China',        // 01.AI
      'chatglm2': 'China',     // Tsinghua
      'qwen-7b': 'China',      // Alibaba
      'llama-2': 'US',         // Meta
      'code-llama': 'US',      // Meta
      'vicuna-7b': 'US',       // LMSYS
      'alpaca-7b': 'US',       // Stanford
      'gpt4all': 'US',         // Nomic AI
      'mpt-7b': 'US',          // MosaicML
      'redpajama': 'US',       // Together
      'open-assistant': 'Germany', // LAION
      'oasst': 'Germany',      // LAION
      'laion': 'Germany',      // LAION
      'pythia': 'US',          // EleutherAI
      'dolly': 'US',           // Databricks
      'stablelm-7b': 'UK',     // Stability AI
      'rwkv': 'US',            // RWKV
      'bloom-176b': 'France',  // BigScience
      'opt-175b': 'US',        // Meta
      'gpt-j': 'US',           // EleutherAI
      'gpt-neox-20b': 'US',    // EleutherAI
      'fairseq': 'US',         // Facebook
      'transformers': 'US',    // HuggingFace
      'sentence-transformers': 'US', // HuggingFace
      'spacy': 'Germany',      // spaCy
      'allennlp': 'US',        // AllenNLP
      'flair': 'Germany',      // Flair
      'stanza': 'US',          // Stanford
      'bert': 'US',            // Google
      'roberta': 'US',         // Facebook
      'deberta': 'US',         // Microsoft
      'electra': 'US',         // Google
      'xlnet': 'US',           // Google/CMU
      'xlm': 'US',             // Facebook
      'mbart': 'US',           // Facebook
      'pegasus': 'US',         // Google
      'bigbird': 'US',         // Google
      'longformer': 'US',      // AllenAI
      'funnel': 'US',          // Google/CMU
      'reformer': 'US',        // Google
      'linformer': 'US',       // Facebook
      'performer': 'US',       // Google
      'synthesizer': 'US',     // Google
      'switch-transformer': 'US', // Google
      'gshard': 'US',          // Google
      'pathways': 'US',        // Google
      'palm-2': 'US',          // Google
      'bard-2': 'US',          // Google
      'lamda': 'US',           // Google
      'mineralm': 'US',        // Google
      'chinchilla': 'UK',      // DeepMind
      'gopher': 'UK',          // DeepMind
      'flamingo': 'UK',        // DeepMind
      'sparrow': 'UK',         // DeepMind
      'gato': 'UK',            // DeepMind
      'retro': 'UK',           // DeepMind
      'jurassic': 'Israel',    // AI21 Labs
      'glide': 'US',           // OpenAI
      'dall-e': 'US',          // OpenAI
      'clip': 'US',            // OpenAI
      'whisper': 'US',         // OpenAI
      'codex': 'US',           // OpenAI
      'davinci': 'US',         // OpenAI
      'curie': 'US',           // OpenAI
      'babbage': 'US',         // OpenAI
      'ada': 'US',             // OpenAI
      'gpt-3': 'US',           // OpenAI
      'gpt-4': 'US',           // OpenAI
      'chatgpt': 'US',         // OpenAI
      'instruct': 'US',        // OpenAI
      'text-davinci': 'US',    // OpenAI
      'text-curie': 'US',      // OpenAI
      'text-babbage': 'US',    // OpenAI
      'text-ada': 'US',        // OpenAI
      'code-davinci': 'US',    // OpenAI
      'code-cushman': 'US',    // OpenAI
      'edit-davinci': 'US',    // OpenAI
      'insert-davinci': 'US',  // OpenAI
      'search-davinci': 'US',  // OpenAI
      'search-curie': 'US',    // OpenAI
      'search-babbage': 'US',  // OpenAI
      'search-ada': 'US',      // OpenAI
      'similarity-davinci': 'US', // OpenAI
      'similarity-curie': 'US',   // OpenAI
      'similarity-babbage': 'US', // OpenAI
      'similarity-ada': 'US',     // OpenAI
      'classification-davinci': 'US', // OpenAI
      'classification-curie': 'US',   // OpenAI
      'classification-babbage': 'US', // OpenAI
      'classification-ada': 'US'      // OpenAI
    };
    
    const searchText = `${modelName} ${publisher}`.toLowerCase();
    
    // First, try direct mapping with priority for model names over companies
    // Check model names first (higher priority)
    const chinaModels = ['qwen', 'baichuan', 'chatglm', 'internlm', 'yi', 'ernie', 'pangu', 'wenxin', 'tongyi', 'sage', 'moss', 'aquila', 'glm', 'phoenix', 'yuan', 'deepseek'];
    const usModels = ['llama', 'gpt', 'claude', 'palm', 'bard', 'gemini', 'alpaca', 'vicuna'];
    const franceModels = ['mistral', 'bloom'];
    const uaeModels = ['falcon'];
    const japanModels = ['rinna', 'stockmark', 'elyza', 'nekomata', 'japanese-gpt', 'swallow', 'stablelm'];
    const koreaModels = ['solar', 'polyglot', 'klue', 'hyperclova'];
    
    // Check for China models first (highest priority due to confusion with US hosting)
    for (const modelName of chinaModels) {
      if (searchText.includes(modelName.toLowerCase())) {
        return 'China';
      }
    }
    
    // Check for other specific regions
    for (const modelName of usModels) {
      if (searchText.includes(modelName.toLowerCase())) {
        return 'US';
      }
    }
    
    for (const modelName of franceModels) {
      if (searchText.includes(modelName.toLowerCase())) {
        return 'France';
      }
    }
    
    for (const modelName of uaeModels) {
      if (searchText.includes(modelName.toLowerCase())) {
        return 'UAE';
      }
    }
    
    for (const modelName of japanModels) {
      if (searchText.includes(modelName.toLowerCase())) {
        return 'Japan';
      }
    }
    
    for (const modelName of koreaModels) {
      if (searchText.includes(modelName.toLowerCase())) {
        return 'South Korea';
      }
    }
    
    // Then check company names
    for (const [key, country] of Object.entries(countryMap)) {
      if (searchText.includes(key.toLowerCase())) {
        return country;
      }
    }
    
    // If not found, try web search for model origin
    try {
      const country = await this.searchModelOrigin(modelName);
      if (country && country !== 'Unknown') {
        return country;
      }
    } catch (error) {
      console.log(`Could not search for ${modelName} origin:`, error.message);
    }
    
    return 'Unknown';
  }

  async searchModelOrigin(modelName) {
    // Extract base model name for better search
    const baseModelName = this.extractBaseModelName(modelName);
    
    // Search patterns for different model origins
    const searchPatterns = [
      `${baseModelName} language model company origin`,
      `${baseModelName} AI model developer country`,
      `${baseModelName} created by company`,
      `${baseModelName} developed by organization`
    ];
    
    // Country indicators in search results
    const countryIndicators = {
      'china': 'China',
      'chinese': 'China',
      'beijing': 'China',
      'shanghai': 'China',
      'shenzhen': 'China',
      'alibaba': 'China',
      'baidu': 'China',
      'tencent': 'China',
      'huawei': 'China',
      'bytedance': 'China',
      'tsinghua': 'China',
      'fudan': 'China',
      'peking university': 'China',
      'chinese academy': 'China',
      
      'united states': 'US',
      'america': 'US',
      'american': 'US',
      'stanford': 'US',
      'berkeley': 'US',
      'mit': 'US',
      'harvard': 'US',
      'carnegie mellon': 'US',
      'georgia tech': 'US',
      'university of washington': 'US',
      'openai': 'US',
      'google': 'US',
      'microsoft': 'US',
      'meta': 'US',
      'facebook': 'US',
      'anthropic': 'US',
      'nvidia': 'US',
      'salesforce': 'US',
      'databricks': 'US',
      'together ai': 'US',
      'replicate': 'US',
      'huggingface': 'US',
      'san francisco': 'US',
      'silicon valley': 'US',
      'california': 'US',
      'seattle': 'US',
      'new york': 'US',
      
      'france': 'France',
      'french': 'France',
      'paris': 'France',
      'mistral': 'France',
      'bigscience': 'France',
      'sorbonne': 'France',
      'inria': 'France',
      
      'united kingdom': 'UK',
      'britain': 'UK',
      'british': 'UK',
      'london': 'UK',
      'cambridge': 'UK',
      'oxford': 'UK',
      'deepmind': 'UK',
      'stability ai': 'UK',
      'imperial college': 'UK',
      
      'germany': 'Germany',
      'german': 'Germany',
      'berlin': 'Germany',
      'munich': 'Germany',
      'laion': 'Germany',
      'max planck': 'Germany',
      
      'canada': 'Canada',
      'canadian': 'Canada',
      'toronto': 'Canada',
      'montreal': 'Canada',
      'university of toronto': 'Canada',
      'mcgill': 'Canada',
      'cohere': 'Canada',
      'vector institute': 'Canada',
      
      'japan': 'Japan',
      'japanese': 'Japan',
      'tokyo': 'Japan',
      'kyoto': 'Japan',
      'osaka': 'Japan',
      'rinna': 'Japan',
      'preferred networks': 'Japan',
      'softbank': 'Japan',
      'university of tokyo': 'Japan',
      
      'south korea': 'South Korea',
      'korean': 'South Korea',
      'seoul': 'South Korea',
      'naver': 'South Korea',
      'kaist': 'South Korea',
      'samsung': 'South Korea',
      'lg': 'South Korea',
      'upstage': 'South Korea',
      
      'israel': 'Israel',
      'israeli': 'Israel',
      'tel aviv': 'Israel',
      'hebrew university': 'Israel',
      'technion': 'Israel',
      'ai21': 'Israel',
      'ai21 labs': 'Israel',
      
      'uae': 'UAE',
      'united arab emirates': 'UAE',
      'abu dhabi': 'UAE',
      'dubai': 'UAE',
      'technology innovation institute': 'UAE',
      'mohamed bin zayed': 'UAE',
      
      'netherlands': 'Netherlands',
      'dutch': 'Netherlands',
      'amsterdam': 'Netherlands',
      'university of amsterdam': 'Netherlands',
      'delft': 'Netherlands',
      
      'switzerland': 'Switzerland',
      'swiss': 'Switzerland',
      'zurich': 'Switzerland',
      'geneva': 'Switzerland',
      'eth zurich': 'Switzerland',
      'epfl': 'Switzerland',
      
      'singapore': 'Singapore',
      'national university of singapore': 'Singapore',
      'nanyang technological': 'Singapore',
      
      'australia': 'Australia',
      'australian': 'Australia',
      'sydney': 'Australia',
      'melbourne': 'Australia',
      'university of melbourne': 'Australia',
      'australian national university': 'Australia'
    };
    
    // For now, use the enhanced mapping without actual web search
    // This prevents rate limiting and keeps the function fast
    const searchKey = baseModelName.toLowerCase();
    
    for (const [indicator, country] of Object.entries(countryIndicators)) {
      if (searchKey.includes(indicator.toLowerCase())) {
        return country;
      }
    }
    
    return 'Unknown';
  }

  extractBaseModelName(modelName) {
    // Extract base model name from complex names
    const parts = modelName.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Remove version numbers, fine-tuning indicators, etc.
    const basePatterns = [
      /^([A-Za-z]+(?:\d+)?(?:\.\d+)?)/,  // Extract base name like "Qwen2.5", "GPT4", etc.
      /^([A-Za-z-]+)/,                   // Extract hyphenated names like "Code-Llama"
      /^([A-Za-z\s]+)/                   // Extract spaced names like "Code Llama"
    ];
    
    for (const pattern of basePatterns) {
      const match = lastPart.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return lastPart.split('-')[0]; // Fallback
  }

  extractModelSize(text) {
    const sizePatterns = [
      // Enhanced patterns for better detection
      /(\d+\.?\d*)\s*[BM](?![a-zA-Z])/gi,  // 7B, 13B, 0.5B
      /(\d+)\s*billion/gi,                   // 7 billion
      /(\d+)\s*million/gi,                   // 500 million
      /(\d+\.?\d*)\s*[BM](?=[-_])/gi,       // 7B- or 13B_
      /(\d+\.?\d*)[BM](?=[-_])/gi           // 7B- or 13B_
    ];
    
    for (const pattern of sizePatterns) {
      const match = text.match(pattern);
      if (match) {
        let size = match[0].toUpperCase();
        // Normalize format
        size = size.replace(/\s+/g, '').replace(/BILLION/gi, 'B').replace(/MILLION/gi, 'M');
        return size;
      }
    }
    
    return 'Unknown';
  }

  formatReleaseDate(dateValue) {
    if (!dateValue || dateValue === 'Unknown') {
      return 'Unknown';
    }
    
    // Handle Unix timestamps
    if (typeof dateValue === 'number' || /^\d{10}$/.test(dateValue)) {
      const timestamp = parseInt(dateValue);
      const date = new Date(timestamp * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Handle ISO date strings
    if (typeof dateValue === 'string' && dateValue.includes('-')) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return 'Unknown';
  }

  isLLMRelated(text) {
    const llmKeywords = [
      'gpt', 'claude', 'llama', 'mistral', 'falcon', 'vicuna', 'alpaca',
      'bert', 'roberta', 'deberta', 't5', 'palm', 'bard', 'chatgpt',
      'language model', 'llm', 'transformer', 'generative'
    ];
    
    const lowerText = text.toLowerCase();
    return llmKeywords.some(keyword => lowerText.includes(keyword));
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