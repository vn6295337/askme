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
    return models.filter(model => {
      return this.hasFreeAccess(model) &&
             !this.isDeprecated(model);
    });
  }

  isFromUSOrEurope(model) {
    const publisherText = this.getStringField(model.publisher);
    const nameText = (model.name || '').toLowerCase();
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
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
    const nameText = (model.name || '').toLowerCase();
    const publisherText = this.getStringField(model.publisher);
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
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
    const nameText = (model.name || '').toLowerCase();
    const publisherText = this.getStringField(model.publisher);
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
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
    enriched.validation_notes = this.generateValidationNotes(model);
    enriched.lastUpdated = new Date().toISOString();
    
    return enriched;
  }

  getStringField(field) {
    if (Array.isArray(field)) {
      return field.join(', ').toLowerCase();
    }
    return (field || '').toLowerCase();
  }

  extractCountry(model) {
    const publisherText = this.getStringField(model.publisher);
    const sourceText = (model.sourceUrl || '').toLowerCase();
    const nameText = (model.name || '').toLowerCase();
    const shortNameText = (model.shortName || '').toLowerCase();
    
    const searchText = `${nameText} ${shortNameText} ${publisherText} ${sourceText}`;
    
    // Enhanced country detection with priority for model names
    const chinaModels = ['qwen', 'baichuan', 'chatglm', 'internlm', 'yi', 'ernie', 'pangu', 'wenxin', 'tongyi', 'sage', 'moss', 'aquila', 'glm', 'phoenix', 'yuan', 'deepseek'];
    const usModels = ['llama', 'gpt', 'claude', 'palm', 'bard', 'gemini', 'alpaca', 'vicuna', 'phi', 'mpt', 'dolly', 'falcon-instruct', 'gpt4all'];
    const franceModels = ['mistral', 'bloom', 'mixtral'];
    const uaeModels = ['falcon'];
    const japanModels = ['rinna', 'stockmark', 'elyza', 'nekomata', 'japanese-gpt', 'swallow', 'stablelm'];
    const koreaModels = ['solar', 'polyglot', 'klue', 'hyperclova'];
    const singaporeModels = ['deepseek-r1'];
    
    // Check for China models first (highest priority)
    for (const modelName of chinaModels) {
      if (searchText.includes(modelName.toLowerCase())) {
        return 'China';
      }
    }
    
    // Check for Singapore models
    for (const modelName of singaporeModels) {
      if (searchText.includes(modelName.toLowerCase())) {
        return 'Singapore';
      }
    }
    
    // Check for other regions
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
    
    // Enhanced company mapping
    const countryMap = {
      'openai': 'US',
      'anthropic': 'US',
      'google': 'US',
      'microsoft': 'US',
      'meta': 'US',
      'facebook': 'US',
      'huggingface': 'US',
      'stanford': 'US',
      'berkeley': 'US',
      'mistral': 'France',
      'deepmind': 'UK',
      'stability': 'UK',
      'cohere': 'Canada',
      'alibaba': 'China',
      'baidu': 'China',
      'tencent': 'China',
      'huawei': 'China',
      'bytedance': 'China',
      'tsinghua': 'China',
      'fudan': 'China',
      'naver': 'South Korea',
      'kaist': 'South Korea',
      'upstage': 'South Korea',
      'rinna': 'Japan',
      'preferred-networks': 'Japan',
      'technology-innovation-institute': 'UAE',
      'ai21': 'Israel',
      'laion': 'Germany'
    };
    
    for (const [company, country] of Object.entries(countryMap)) {
      if (searchText.includes(company)) {
        return country;
      }
    }
    
    return model.country || 'Unknown';
  }

  extractModelSize(model) {
    const nameText = (model.name || '').toLowerCase();
    const shortNameText = (model.shortName || '').toLowerCase();
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
    const searchText = `${nameText} ${shortNameText} ${sourceText}`;
    
    // Enhanced patterns for multi-size entries
    const sizePatterns = [
      // Multi-size patterns like "7B,13B,70B"
      /(\d+\.?\d*[BM](?:,\d+\.?\d*[BM])*)/gi,
      // Single size patterns
      /(\d+\.?\d*)\s*[BM](?![a-zA-Z])/gi,
      /(\d+\.?\d*)\s*billion/gi,
      /(\d+\.?\d*)\s*million/gi,
      /(\d+)\s*thousand/gi,
      // Patterns with separators
      /(\d+\.?\d*)[BM](?=[-_])/gi,
      /(\d+\.?\d*)\s*[BM](?=[-_])/gi
    ];
    
    for (const pattern of sizePatterns) {
      const match = searchText.match(pattern);
      if (match) {
        let size = match[0].toUpperCase();
        // Normalize format
        size = size.replace(/\s+/g, '').replace(/BILLION/gi, 'B').replace(/MILLION/gi, 'M').replace(/THOUSAND/gi, 'K');
        return size;
      }
    }
    
    return model.modelSize || 'Unknown';
  }

  extractCapabilities(model) {
    const nameText = (model.name || '').toLowerCase();
    const shortNameText = (model.shortName || '').toLowerCase();
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
    const searchText = `${nameText} ${shortNameText} ${sourceText}`;
    const capabilities = [];
    
    // Enhanced capability detection
    if (searchText.includes('chat') || searchText.includes('instruct') || searchText.includes('conversation') || searchText.includes('dialogue')) {
      capabilities.push('Conversational');
    }
    if (searchText.includes('code') || searchText.includes('program') || searchText.includes('coding') || searchText.includes('software')) {
      capabilities.push('Code Generation');
    }
    if (searchText.includes('vision') || searchText.includes('image') || searchText.includes('visual') || searchText.includes('img')) {
      capabilities.push('Vision');
    }
    if (searchText.includes('multimodal') || searchText.includes('multi-modal')) {
      capabilities.push('Multimodal');
    }
    if (searchText.includes('rag') || searchText.includes('retrieval') || searchText.includes('search')) {
      capabilities.push('RAG');
    }
    if (searchText.includes('moderation') || searchText.includes('safety') || searchText.includes('content-filter')) {
      capabilities.push('Moderation');
    }
    if (searchText.includes('signal') || searchText.includes('trading') || searchText.includes('finance')) {
      capabilities.push('Signal Generation');
    }
    if (searchText.includes('deploy') || searchText.includes('toolkit') || searchText.includes('infrastructure')) {
      capabilities.push('LLM Deployment Toolkit');
    }
    
    return capabilities.length > 0 ? capabilities : ['Text Generation'];
  }
  
  generateValidationNotes(model) {
    const notes = [];
    
    // Check for validation issues
    if (!model.license || model.license === 'Unknown') {
      notes.push('License unverified');
    }
    if (!model.country || model.country === 'Unknown') {
      notes.push('Country of origin unclear');
    }
    if (!model.modelSize || model.modelSize === 'Unknown') {
      notes.push('Model size not specified');
    }
    if (!model.releaseDate || model.releaseDate === 'Unknown') {
      notes.push('Release date unverified');
    }
    if (!model.sourceUrl || model.sourceUrl === 'Unknown') {
      notes.push('Source URL missing');
    }
    
    // Check for repository/source validation
    if (model.sourceUrl && model.sourceUrl.includes('github.com')) {
      notes.push('GitHub repository verified');
    }
    if (model.sourceUrl && model.sourceUrl.includes('huggingface.co')) {
      notes.push('HuggingFace model verified');
    }
    
    // Check for license validation
    if (model.license && ['MIT', 'Apache-2.0', 'Apache 2.0', 'GPL v3.0', 'MPL 2.0', 'CC BY-NC 4.0'].includes(model.license)) {
      notes.push('License confirmed');
    }
    
    // Check for multi-size models
    if (model.modelSize && model.modelSize.includes(',')) {
      notes.push('Multiple model sizes available');
    }
    
    // Check for checkpoint models
    if (model.name && model.name.includes('checkpoint')) {
      notes.push('Checkpoint model; production readiness unclear');
    }
    
    // Check for derived models
    if (model.name && (model.name.includes('Gensyn') || model.name.includes('fork') || model.name.includes('derivative'))) {
      notes.push('Derived/fine-tuned model');
    }
    
    return notes.length > 0 ? notes.join('; ') : 'Basic validation complete';
  }
}

module.exports = new LLMFilters();