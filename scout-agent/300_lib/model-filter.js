/**
 * ModelFilter - Handles filtering and processing of collected LLM model data
 */
class ModelFilter {
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

    this.companyCountryMap = {
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
      'ai21': 'US'
    };
  }

  /**
   * Main filtering method - processes raw models and returns filtered/enriched data
   */
  filterModels(models) {
    console.log(`🔍 Processing ${models.length} raw models...`);
    
    const filtered = models
      .filter(model => {
        return this.isFromUSOrEurope(model) &&
               this.hasFreeAccess(model) &&
               this.supportsEnglish(model) &&
               !this.isDeprecated(model) &&
               this.isActive(model);
      })
      .map(model => this.enrichModelData(model));

    console.log(`✅ Filtered to ${filtered.length} qualifying models`);
    return filtered;
  }

  /**
   * Check if model is from US or Europe
   */
  isFromUSOrEurope(model) {
    const publisherText = (model.publisher || '').toLowerCase();
    const nameText = (model.name || '').toLowerCase();
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
    const combinedText = `${publisherText} ${nameText} ${sourceText}`;
    
    return this.usEuropeRegions.some(region => 
      combinedText.includes(region.toLowerCase())
    );
  }

  /**
   * Check if model has free access
   */
  hasFreeAccess(model) {
    const accessType = (model.accessType || '').toLowerCase();
    const license = (model.license || '').toLowerCase();
    const nameText = (model.name || '').toLowerCase();
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
    const combinedText = `${accessType} ${license} ${nameText} ${sourceText}`;
    
    // Always include open source and company models
    if (accessType.includes('open source') || 
        accessType.includes('commercial api') ||
        accessType.includes('free tier')) {
      return true;
    }
    
    return this.freeAccessKeywords.some(keyword => 
      combinedText.includes(keyword)
    );
  }

  /**
   * Check if model supports English
   */
  supportsEnglish(model) {
    const nameText = (model.name || '').toLowerCase();
    const publisherText = (model.publisher || '').toLowerCase();
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
    const combinedText = `${nameText} ${publisherText} ${sourceText}`;
    
    return this.englishKeywords.some(keyword => 
      combinedText.includes(keyword)
    ) || this.isLikelyEnglishModel(model);
  }

  /**
   * Detect likely English models by patterns
   */
  isLikelyEnglishModel(model) {
    const nameText = (model.name || '').toLowerCase();
    
    const englishModelPatterns = [
      /\b(gpt|bert|t5|llama|mistral|falcon|vicuna|alpaca|claude|palm|bard|gemini|gemma)\b/,
      /\b(chat|instruct|conversation|dialogue|qa|question|answer)\b/,
      /\b(english|multilingual|general|base|foundation)\b/
    ];
    
    return englishModelPatterns.some(pattern => pattern.test(nameText));
  }

  /**
   * Check if model is deprecated
   */
  isDeprecated(model) {
    const nameText = (model.name || '').toLowerCase();
    const publisherText = (model.publisher || '').toLowerCase();
    const sourceText = (model.sourceUrl || '').toLowerCase();
    
    const combinedText = `${nameText} ${publisherText} ${sourceText}`;
    
    return this.deprecatedKeywords.some(keyword => 
      combinedText.includes(keyword)
    );
  }

  /**
   * Check if model is active (released within last year)
   */
  isActive(model) {
    if (!model.releaseDate || model.releaseDate === 'Unknown') return true;
    
    try {
      const releaseDate = new Date(model.releaseDate);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      return releaseDate > oneYearAgo;
    } catch {
      return true; // If date parsing fails, assume active
    }
  }

  /**
   * Enrich model data with additional fields
   */
  enrichModelData(model) {
    const enriched = { ...model };
    
    // Enrich with extracted data
    enriched.country = this.extractCountry(model);
    enriched.modelSize = this.extractModelSize(model);
    enriched.capabilities = this.extractCapabilities(model);
    enriched.discoveryTimestamp = new Date().toISOString();
    enriched.validationStatus = 'validated';
    
    // Ensure all required fields exist
    enriched.name = enriched.name || 'Unknown';
    enriched.publisher = enriched.publisher || 'Unknown';
    enriched.accessType = enriched.accessType || 'Unknown';
    enriched.license = enriched.license || 'Unknown';
    enriched.inferenceSupport = enriched.inferenceSupport || 'Unknown';
    enriched.sourceUrl = enriched.sourceUrl || '';
    enriched.releaseDate = enriched.releaseDate || 'Unknown';
    enriched.source = enriched.source || 'Unknown';
    
    return enriched;
  }

  /**
   * Extract country information
   */
  extractCountry(model) {
    if (model.country && model.country !== 'Unknown') {
      return model.country;
    }

    const publisherText = (model.publisher || '').toLowerCase();
    const sourceText = (model.sourceUrl || '').toLowerCase();
    const nameText = (model.name || '').toLowerCase();
    
    const combinedText = `${publisherText} ${sourceText} ${nameText}`;
    
    // Check company mapping first
    for (const [company, country] of Object.entries(this.companyCountryMap)) {
      if (combinedText.includes(company)) {
        return country;
      }
    }
    
    // URL-based detection for GitHub/HuggingFace
    if (sourceText.includes('github.com') || sourceText.includes('huggingface.co')) {
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
      
      return 'US'; // Default for GitHub/HuggingFace
    }
    
    // Domain-based detection
    if (sourceText.includes('.ai') || sourceText.includes('.com')) {
      return 'US';
    }
    
    if (sourceText.includes('.eu') || sourceText.includes('.uk') || 
        sourceText.includes('.de') || sourceText.includes('.fr')) {
      return 'Europe';
    }
    
    return 'US'; // Default fallback
  }

  /**
   * Extract model size from name
   */
  extractModelSize(model) {
    const nameText = (model.name || '').toLowerCase();
    const sizePatterns = [
      /(\d+\.?\d*)b\b/,     // 7b, 13b, 70b, 3.5b
      /(\d+\.?\d*)billion/,  // 7billion
      /(\d+\.?\d*)m\b/,      // 125m, 355m
      /(\d+\.?\d*)million/,  // 125million
      /(\d+\.?\d*)k\b/,      // 125k
      /(\d+\.?\d*)thousand/  // 125thousand
    ];
    
    for (const pattern of sizePatterns) {
      const match = nameText.match(pattern);
      if (match) {
        return match[1] + match[0].slice(-1).toUpperCase(); // e.g., "7B", "125M"
      }
    }
    
    return 'Unknown';
  }

  /**
   * Extract model capabilities
   */
  extractCapabilities(model) {
    const nameText = (model.name || '').toLowerCase();
    const capabilities = [];
    
    if (nameText.includes('chat') || nameText.includes('instruct')) {
      capabilities.push('Conversational');
    }
    if (nameText.includes('code') || nameText.includes('program') || nameText.includes('codestral')) {
      capabilities.push('Code Generation');
    }
    if (nameText.includes('vision') || nameText.includes('image') || nameText.includes('visual')) {
      capabilities.push('Vision');
    }
    if (nameText.includes('multimodal') || nameText.includes('multi-modal')) {
      capabilities.push('Multimodal');
    }
    if (nameText.includes('embed') || nameText.includes('retrieval')) {
      capabilities.push('Embeddings');
    }
    
    return capabilities.length > 0 ? capabilities.join('; ') : 'Text Generation';
  }
}

module.exports = ModelFilter;