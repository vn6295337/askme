const fs = require('fs-extra');
const path = require('path');

class LLMFilters {
  constructor() {
    this.usEuropeRegions = [
      'US', 'USA', 'United States', 'America', 'American',
      'UK', 'United Kingdom', 'Britain', 'British', 'England', 'English',
      'Germany', 'German', 'France', 'French', 'Italy', 'Italian',
      'Spain', 'Spanish', 'Netherlands', 'Dutch', 'Belgium', 'Swiss',
      'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
      'Poland', 'Portugal', 'Ireland', 'Czech', 'Hungary', 'Greece',
      'Europe', 'European', 'EU'
    ];
    
    this.freeAccessKeywords = [
      'free', 'open source', 'open-source', 'opensource', 'free tier',
      'free api', 'no cost', 'gratis', 'public', 'community',
      'apache', 'mit', 'gpl', 'bsd', 'creative commons', 'cc0',
      'unlicense', 'lgpl', 'mpl', 'mozilla'
    ];
    
    this.englishKeywords = [
      'english', 'en', 'text generation', 'language model',
      'conversational', 'chat', 'dialogue', 'instruction',
      'question answering', 'qa', 'natural language'
    ];
    
    this.deprecatedKeywords = [
      'deprecated', 'sunset', 'discontinued', 'end of life',
      'eol', 'archived', 'legacy', 'obsolete', 'withdrawn'
    ];
  }

  filterModels(models) {
    return models
      .filter(model => {
        return this.isFromUSOrEurope(model) &&
               this.hasFreeAccess(model) &&
               this.supportsEnglish(model) &&
               !this.isDeprecated(model) &&
               this.isActive(model);
      })
      .map(model => {
        // Enrich model with required fields
        const enriched = this.enrichModelData(model);
        
        // Ensure country is populated
        if (!enriched.country || enriched.country === 'Unknown') {
          enriched.country = this.extractCountry(model);
        }
        
        return enriched;
      });
  }

  isFromUSOrEurope(model) {
    const publisherText = (typeof model.publisher === 'string' ? model.publisher : '').toLowerCase();
    const nameText = (typeof model.name === 'string' ? model.name : '').toLowerCase();
    const sourceText = (typeof model.sourceUrl === 'string' ? model.sourceUrl : '').toLowerCase();
    
    const combinedText = `${publisherText} ${nameText} ${sourceText}`;
    
    return this.usEuropeRegions.some(region => 
      combinedText.includes(region.toLowerCase())
    );
  }

  hasFreeAccess(model) {
    const accessType = (typeof model.accessType === 'string' ? model.accessType : '').toLowerCase();
    const license = (typeof model.license === 'string' ? model.license : '').toLowerCase();
    const nameText = (typeof model.name === 'string' ? model.name : '').toLowerCase();
    const sourceText = (typeof model.sourceUrl === 'string' ? model.sourceUrl : '').toLowerCase();
    
    const combinedText = `${accessType} ${license} ${nameText} ${sourceText}`;
    
    if (accessType.includes('open source') || accessType.includes('research paper')) {
      return true;
    }
    
    return this.freeAccessKeywords.some(keyword => 
      combinedText.includes(keyword)
    );
  }

  supportsEnglish(model) {
    const nameText = (typeof model.name === 'string' ? model.name : '').toLowerCase();
    const publisherText = (typeof model.publisher === 'string' ? model.publisher : '').toLowerCase();
    const sourceText = (typeof model.sourceUrl === 'string' ? model.sourceUrl : '').toLowerCase();
    
    const combinedText = `${nameText} ${publisherText} ${sourceText}`;
    
    return this.englishKeywords.some(keyword => 
      combinedText.includes(keyword)
    ) || this.isLikelyEnglishModel(model);
  }

  isLikelyEnglishModel(model) {
    const nameText = (typeof model.name === 'string' ? model.name : '').toLowerCase();
    
    const englishModelPatterns = [
      /\b(gpt|bert|t5|llama|mistral|falcon|vicuna|alpaca|claude|palm|bard)\b/,
      /\b(chat|instruct|conversation|dialogue|qa|question|answer)\b/,
      /\b(english|multilingual|general|base|foundation)\b/
    ];
    
    return englishModelPatterns.some(pattern => pattern.test(nameText));
  }

  isDeprecated(model) {
    const nameText = (typeof model.name === 'string' ? model.name : '').toLowerCase();
    const publisherText = (typeof model.publisher === 'string' ? model.publisher : '').toLowerCase();
    const sourceText = (typeof model.sourceUrl === 'string' ? model.sourceUrl : '').toLowerCase();
    
    const combinedText = `${nameText} ${publisherText} ${sourceText}`;
    
    return this.deprecatedKeywords.some(keyword => 
      combinedText.includes(keyword)
    );
  }

  isActive(model) {
    if (!model.releaseDate) return true;
    
    const releaseDate = new Date(model.releaseDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return releaseDate > oneYearAgo;
  }

  enrichModelData(model) {
    const enriched = { ...model };
    
    enriched.country = this.extractCountry(model);
    enriched.modelSize = this.extractModelSize(model);
    enriched.capabilities = this.extractCapabilities(model);
    enriched.lastUpdated = new Date().toISOString();
    
    return enriched;
  }

  extractCountry(model) {
    const publisherText = (typeof model.publisher === 'string' ? model.publisher : '').toLowerCase();
    const sourceText = (typeof model.sourceUrl === 'string' ? model.sourceUrl : '').toLowerCase();
    const nameText = (typeof model.name === 'string' ? model.name : '').toLowerCase();
    
    const combinedText = `${publisherText} ${sourceText} ${nameText}`;
    
    // Company-based detection
    const countryMap = {
      'openai': 'US',
      'anthropic': 'US',
      'google': 'US',
      'microsoft': 'US',
      'meta': 'US',
      'facebook': 'US',
      'huggingface': 'US',
      'together': 'US',
      'mistral': 'France',
      'deepmind': 'UK',
      'stability': 'UK',
      'cohere': 'US',
      'ai21': 'US',
      'together.ai': 'US',
      'together.xyz': 'US'
    };
    
    for (const [company, country] of Object.entries(countryMap)) {
      if (combinedText.includes(company)) {
        return country;
      }
    }
    
    // URL-based detection
    if (sourceText.includes('github.com') || sourceText.includes('huggingface.co')) {
      // For GitHub/HuggingFace, try to detect from organization names
      const orgPatterns = {
        'microsoft': 'US',
        'google': 'US',
        'meta-llama': 'US',
        'openai': 'US',
        'anthropic': 'US',
        'mistralai': 'France',
        'bigscience': 'Europe',
        'eleutherai': 'US',
        'stanford': 'US',
        'berkeley': 'US',
        'mit': 'US',
        'deepmind': 'UK'
      };
      
      for (const [org, country] of Object.entries(orgPatterns)) {
        if (combinedText.includes(org)) {
          return country;
        }
      }
      
      // Default for GitHub/HuggingFace models without clear attribution
      return 'US';
    }
    
    // Domain-based detection
    if (sourceText.includes('.ai') || sourceText.includes('.com')) {
      return 'US'; // Most .ai and .com domains are US-based
    }
    
    if (sourceText.includes('.eu') || sourceText.includes('.uk') || sourceText.includes('.de') || sourceText.includes('.fr')) {
      return 'Europe';
    }
    
    // Default for models that pass US/Europe filter
    return 'US';
  }

  extractModelSize(model) {
    const nameText = (model.name || '').toLowerCase();
    const sizePatterns = [
      /(\d+)b\b/,
      /(\d+)billion/,
      /(\d+)m\b/,
      /(\d+)million/,
      /(\d+)k\b/,
      /(\d+)thousand/
    ];
    
    for (const pattern of sizePatterns) {
      const match = nameText.match(pattern);
      if (match) {
        return match[0].toUpperCase();
      }
    }
    
    return 'Unknown';
  }

  extractCapabilities(model) {
    const nameText = (model.name || '').toLowerCase();
    const capabilities = [];
    
    if (nameText.includes('chat') || nameText.includes('instruct')) {
      capabilities.push('Conversational');
    }
    if (nameText.includes('code') || nameText.includes('program')) {
      capabilities.push('Code Generation');
    }
    if (nameText.includes('vision') || nameText.includes('image')) {
      capabilities.push('Vision');
    }
    if (nameText.includes('multimodal')) {
      capabilities.push('Multimodal');
    }
    
    return capabilities.length > 0 ? capabilities : ['Text Generation'];
  }
}

module.exports = new LLMFilters();