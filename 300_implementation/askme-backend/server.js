// AskMe Backend Proxy Server - UPDATED VERSION
// Secure API key management and request proxying

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const JSZip = require('jszip');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  }
});
app.use('/api/', limiter);

// Security Middleware - Input Validation & Attack Prevention
const validateInput = (req, res, next) => {
    const { prompt, provider, model } = req.body;
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Log security events
    const logSecurityEvent = (event, details = {}) => {
        console.warn(`🚨 SECURITY: ${event} from ${clientIP}`, details);
    };
    
    // 1. Required field validation
    if (!prompt || typeof prompt !== 'string') {
        logSecurityEvent('INVALID_INPUT', { error: 'Missing or invalid prompt' });
        return res.status(400).json({ 
            error: 'Valid prompt is required',
            code: 'INVALID_PROMPT'
        });
    }
    
    // 2. Length validation
    if (prompt.length > 10000) {
        logSecurityEvent('PAYLOAD_TOO_LARGE', { length: prompt.length });
        return res.status(400).json({ 
            error: 'Prompt too long (max 10,000 characters)',
            code: 'PROMPT_TOO_LONG'
        });
    }
    
    if (prompt.length < 1) {
        logSecurityEvent('EMPTY_PROMPT', {});
        return res.status(400).json({ 
            error: 'Prompt cannot be empty',
            code: 'EMPTY_PROMPT'
        });
    }
    
    // 3. XSS Prevention - Multiple patterns
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*>/gi,
        /javascript:/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,  // event handlers like onclick=
        /<img[^>]+src[\s]*=[\s]*["|']javascript:/gi
    ];
    
    for (let pattern of xssPatterns) {
        if (pattern.test(prompt)) {
            logSecurityEvent('XSS_ATTEMPT', { pattern: pattern.toString() });
            return res.status(400).json({ 
                error: 'Invalid input detected - potential security risk',
                code: 'XSS_BLOCKED'
            });
        }
    }
    
    // 4. SQL Injection Prevention
    const sqlPatterns = [
        /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|join)\b)/gi,
        /(where|having|group\s+by|order\s+by)/gi,
        /('|"|;|--|\*|\/\*|\*\/|@@|char\(|nchar\(|varchar\(|nvarchar\(|alter\(|begin\(|cast\(|create\(|cursor\(|declare\(|delete\(|drop\(|end\(|exec\(|execute\(|fetch\(|insert\(|kill\(|open\(|select\(|sys\(|table\(|update\()/gi,
        /(union.*select|select.*union)/gi,
        /\b(or|and)\b.*[=<>]/gi
    ];
    
    for (let pattern of sqlPatterns) {
        if (pattern.test(prompt)) {
            logSecurityEvent('SQL_INJECTION_ATTEMPT', { pattern: pattern.toString() });
            return res.status(400).json({ 
                error: 'Invalid input detected - potential security risk',
                code: 'SQL_INJECTION_BLOCKED'
            });
        }
    }
    
    // 5. Command Injection Prevention
    const commandPatterns = [
        /[;&|`$(){}[\]\\]/g,
        /\.\.\//g,  // Path traversal
        /\/etc\/passwd/gi,
        /\/proc\//gi,
        /cmd\.exe/gi,
        /powershell/gi,
        /bash/gi,
        /\/bin\//gi
    ];
    
    for (let pattern of commandPatterns) {
        if (pattern.test(prompt)) {
            logSecurityEvent('COMMAND_INJECTION_ATTEMPT', { pattern: pattern.toString() });
            return res.status(400).json({ 
                error: 'Invalid input detected - potential security risk',
                code: 'COMMAND_INJECTION_BLOCKED'
            });
        }
    }
    
    // 6. Provider validation
    if (provider && !/^[a-zA-Z0-9_-]+$/.test(provider)) {
        logSecurityEvent('INVALID_PROVIDER', { provider });
        return res.status(400).json({ 
            error: 'Invalid provider name format',
            code: 'INVALID_PROVIDER'
        });
    }
    
    // 7. Model validation
    if (model && !/^[a-zA-Z0-9._/-]+$/.test(model)) {
        logSecurityEvent('INVALID_MODEL', { model });
        return res.status(400).json({ 
            error: 'Invalid model name format',
            code: 'INVALID_MODEL'
        });
    }
    
    // 8. Content type validation
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
        logSecurityEvent('INVALID_CONTENT_TYPE', { contentType });
        return res.status(400).json({ 
            error: 'Content-Type must be application/json',
            code: 'INVALID_CONTENT_TYPE'
        });
    }
    
    // 9. Basic sanitization (remove null bytes and control characters)
    req.body.prompt = prompt.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // 10. Suspicious pattern detection (log but don't block)
    const suspiciousPatterns = [
        /crypto/gi,
        /wallet/gi,
        /password/gi,
        /credit.?card/gi,
        /ssn|social.?security/gi
    ];
    
    for (let pattern of suspiciousPatterns) {
        if (pattern.test(prompt)) {
            logSecurityEvent('SUSPICIOUS_CONTENT', { pattern: pattern.toString() });
        }
    }
    
    // Success - log clean request
    console.log(`✅ Input validated for ${provider || 'unknown'} - ${prompt.length} chars from ${clientIP}`);
    next();
};

// Content Security Middleware
const contentSecurity = (req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
};

// Apply security middleware to all routes
app.use(contentSecurity);

// Apply input validation to API endpoints that need it
app.use('/api/query', validateInput);
app.use('/api/smart', validateInput);

// Secure Key Manager - Enhanced security for Render deployment
const crypto = require('crypto');

class SecureKeyManager {
    constructor() {
        this.keys = new Map();
        this.loadedCount = 0;
        this.initializeKeys();
    }
    
    initializeKeys() {
        const providers = ['google', 'mistral', 'llama', 'cohere', 'groq', 'huggingface', 'openrouter', 'ai21', 'replicate'];
        
        console.log('🔐 Initializing secure key management...');
        
        providers.forEach(provider => {
            const envKey = `${provider.toUpperCase()}_API_KEY`;
            const key = process.env[envKey];
            
            if (key && key.trim() !== '') {
                // Create secure hash for logging (first 8 chars of SHA256)
                const keyHash = crypto.createHash('sha256').update(key).digest('hex').substring(0, 8);
                
                // Store key with metadata
                this.keys.set(provider, {
                    key: key.trim(),
                    hash: keyHash,
                    lastUsed: null,
                    useCount: 0,
                    loaded: new Date().toISOString()
                });
                
                // Clear from process.env for security
                delete process.env[envKey];
                
                console.log(`✅ Loaded ${provider} key (${keyHash}...)`);
                this.loadedCount++;
            } else {
                console.warn(`⚠️  Missing or empty API key for ${provider}`);
            }
        });
        
        console.log(`🔑 Secure key manager initialized: ${this.loadedCount}/${providers.length} keys loaded`);
    }
    
    getKey(provider) {
        const keyData = this.keys.get(provider);
        if (!keyData) {
            throw new Error(`API key not configured for provider: ${provider}`);
        }
        
        // Update usage tracking
        keyData.lastUsed = new Date().toISOString();
        keyData.useCount++;
        
        return keyData.key;
    }
    
    hasKey(provider) {
        return this.keys.has(provider);
    }
    
    getStats() {
        const stats = {};
        this.keys.forEach((data, provider) => {
            stats[provider] = {
                hash: data.hash,
                lastUsed: data.lastUsed,
                useCount: data.useCount,
                loaded: data.loaded,
                status: 'active'
            };
        });
        return {
            totalKeys: this.keys.size,
            providers: stats,
            securityStatus: 'enabled'
        };
    }
    
    // Get sanitized key info for API responses
    getProviderStatus() {
        const status = [];
        this.keys.forEach((data, provider) => {
            status.push({
                name: provider,
                available: true,
                status: 'active',
                hash: data.hash,
                useCount: data.useCount
            });
        });
        return status;
    }
}

// Initialize secure key manager
const keyManager = new SecureKeyManager();

// Secure key retrieval function
const getAPIKey = (provider) => {
    try {
        return keyManager.getKey(provider);
    } catch (error) {
        console.error(`🚨 Key retrieval failed for ${provider}:`, error.message);
        throw error;
    }
};

// LLM Scout Agent configuration
const AGENT_AUTH_TOKEN = process.env.AGENT_AUTH_TOKEN || 'scout-agent-default-token';
const LLMS_FILE_PATH = path.join(__dirname, 'data', 'llms.json');

// GitHub Dashboard configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'vn6295337';
const GITHUB_REPO = 'askme';
const WORKFLOW_FILE = 'scout-agent.yml';
const ARTIFACT_NAME = 'model-validation-results';

// Cache for GitHub dashboard data to avoid API limits
let githubDataCache = {
  data: null,
  timestamp: null,
  previousMetrics: null
};
const GITHUB_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Ensure data directory exists
fs.ensureDirSync(path.dirname(LLMS_FILE_PATH));

// Authentication middleware for agent requests
const authenticateAgent = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || token !== AGENT_AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized agent access' });
  }
  
  next();
};

// Provider configurations - UPDATED WITH LATEST MODELS
const PROVIDERS = {
  google: {
    models: [
      "gemini-1.5-flash",           // Fast, efficient
      "gemini-1.5-flash-8b",        // Even faster
      "gemini-1.5-pro",             // Stable, capable
    ],
    url: (apiKey, model) => `https://generativelanguage.googleapis.com/v1/models/${model || "gemini-1.5-flash"}:generateContent?key=${apiKey}`,
    headers: () => ({
      "Content-Type": "application/json"
    }),
    formatRequest: (prompt) => ({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
    extractResponse: (data) => {
      try {
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Google Gemini";
      } catch (e) {
        return "Error processing Google Gemini response";
      }
    }
  },
  
  mistral: {
    models: [
      "mistral-small-latest",       // Fast, efficient
      "open-mistral-7b",           // Open source
      "open-mixtral-8x7b",         // Powerful open source
      "open-mixtral-8x22b",        // Most powerful open
      "mistral-medium-latest",     // Balanced performance
    ],
    url: () => "https://api.mistral.ai/v1/chat/completions",
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }),
    formatRequest: (prompt, model) => ({
      model: model || "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    }),
    extractResponse: (data) => {
      try {
        return data.choices?.[0]?.message?.content || "No response from Mistral";
      } catch (e) {
        return "Error processing Mistral response";
      }
    }
  },
  
  llama: {
    models: [
      "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",     // Fast, reliable
      "meta-llama/Llama-3-8b-chat-hf",                 // Standard chat
      "meta-llama/Llama-3.3-70B-Instruct-Turbo",       // UPDATED - Replaces deprecated 70B-Turbo
      "meta-llama/Llama-2-7b-chat-hf",                 // Legacy support
      "meta-llama/Llama-2-13b-chat-hf",                // Legacy medium
    ],
    url: () => "https://api.together.xyz/v1/chat/completions",
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }),
    formatRequest: (prompt, model) => ({
      model: model || "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    }),
    extractResponse: (data) => {
      try {
        return data.choices?.[0]?.message?.content || "No response from Llama";
      } catch (e) {
        return "Error processing Llama response";
      }
    }
  },
  
  cohere: {
    models: [
      "command",                        // Main conversational model
      "command-light",                  // Faster, lightweight version
      "command-nightly",                // Latest experimental features
      "command-r",                      // Retrieval-optimized
      "command-r-plus"                  // Enhanced retrieval
    ],
    url: () => "https://api.cohere.ai/v1/chat",
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }),
    formatRequest: (prompt, model) => ({
      model: model || "command",
      message: prompt,
      max_tokens: 500,
      temperature: 0.7
    }),
    extractResponse: (data) => {
      try {
        return data.text || data.message || "No response from Cohere";
      } catch (e) {
        return "Error processing Cohere response";
      }
    }
  },
  
  groq: {
    models: [
      "llama-3.3-70b-versatile",        // Latest Llama 3.3
      "llama-3.1-70b-versatile",        // Llama 3.1 70B
      "llama-3.1-8b-instant",           // Fast 8B model
      "mixtral-8x7b-32768",             // Mixtral with long context
      "gemma2-9b-it",                   // Google Gemma 2
      "gemma-7b-it"                     // Google Gemma 7B
    ],
    url: () => "https://api.groq.com/openai/v1/chat/completions",
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }),
    formatRequest: (prompt, model) => ({
      model: model || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    }),
    extractResponse: (data) => {
      try {
        return data.choices?.[0]?.message?.content || "No response from Groq";
      } catch (e) {
        return "Error processing Groq response";
      }
    }
  },
  
  huggingface: {
    models: [
      "microsoft/DialoGPT-large",       // Conversational AI
      "microsoft/DialoGPT-medium",      // Medium conversational
      "facebook/blenderbot-400M-distill", // Facebook's chatbot
      "google/flan-t5-large",           // Instruction-following
      "microsoft/CodeBERT-base"         // Code understanding
    ],
    url: (apiKey, model) => `https://api-inference.huggingface.co/models/${model || "microsoft/DialoGPT-large"}`,
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }),
    formatRequest: (prompt) => ({
      inputs: prompt,
      parameters: {
        max_length: 500,
        temperature: 0.7,
        return_full_text: false
      }
    }),
    extractResponse: (data) => {
      try {
        if (Array.isArray(data)) {
          return data[0]?.generated_text || data[0]?.text || "No response from HuggingFace";
        }
        return data.generated_text || data.text || data.response || "No response from HuggingFace";
      } catch (e) {
        return "Error processing HuggingFace response";
      }
    }
  },
  
  openrouter: {
    models: [
      "anthropic/claude-3-haiku",       // Fast Claude model
      "meta-llama/llama-3.1-8b-instruct", // Llama via OpenRouter
      "mistralai/mistral-7b-instruct",  // Mistral via OpenRouter
      "google/gemma-7b-it",             // Gemma via OpenRouter
      "microsoft/wizardlm-2-8x22b"      // WizardLM via OpenRouter
    ],
    url: () => "https://openrouter.ai/api/v1/chat/completions",
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://askme-backend-proxy.onrender.com",
      "X-Title": "AskMe CLI"
    }),
    formatRequest: (prompt, model) => ({
      model: model || "anthropic/claude-3-haiku",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    }),
    extractResponse: (data) => {
      try {
        return data.choices?.[0]?.message?.content || "No response from OpenRouter";
      } catch (e) {
        return "Error processing OpenRouter response";
      }
    }
  },
  
  ai21: {
    models: [
      "j2-light",                       // Fast, efficient
      "j2-mid",                         // Balanced performance
      "j2-ultra",                       // Most capable
      "jamba-instruct"                  // Latest instruction model
    ],
    url: (apiKey, model) => `https://api.ai21.com/studio/v1/${model || "j2-light"}/complete`,
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }),
    formatRequest: (prompt) => ({
      prompt: prompt,
      maxTokens: 500,
      temperature: 0.7,
      topP: 1,
      stopSequences: []
    }),
    extractResponse: (data) => {
      try {
        return data.completions?.[0]?.data?.text || "No response from AI21";
      } catch (e) {
        return "Error processing AI21 response";
      }
    }
  },
  
  replicate: {
    models: [
      "meta/llama-2-70b-chat",          // Llama 2 70B
      "meta/llama-2-13b-chat",          // Llama 2 13B
      "mistralai/mixtral-8x7b-instruct-v0.1", // Mixtral
      "meta/codellama-34b-instruct"     // Code-focused model
    ],
    url: () => "https://api.replicate.com/v1/predictions",
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "Authorization": `Token ${apiKey}`
    }),
    formatRequest: (prompt, model) => ({
      version: this.getModelVersion(model || "meta/llama-2-70b-chat"),
      input: {
        prompt: prompt,
        max_length: 500,
        temperature: 0.7
      }
    }),
    getModelVersion: (model) => {
      // Model version mappings for Replicate
      const versions = {
        "meta/llama-2-70b-chat": "02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
        "meta/llama-2-13b-chat": "f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d",
        "mistralai/mixtral-8x7b-instruct-v0.1": "cf18decbf51c27fed6bbdc3492312c1c903222a56e3fe9ca02d6cbe5198afc10",
        "meta/codellama-34b-instruct": "7fdf82bb301ebeea7ba2b9e4d19b4e49d1ce6faae5c0ddc6b5af9f33d52ee346"
      };
      return versions[model] || versions["meta/llama-2-70b-chat"];
    },
    extractResponse: (data) => {
      try {
        if (data.output && Array.isArray(data.output)) {
          return data.output.join('') || "No response from Replicate";
        }
        return data.output || "No response from Replicate";
      } catch (e) {
        return "Error processing Replicate response";
      }
    }
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  const keyStats = keyManager.getStats();
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.2.0',
    providers: Object.keys(PROVIDERS),
    security: {
      keyManagerActive: true,
      totalKeys: keyStats.totalKeys,
      securityStatus: keyStats.securityStatus,
      inputValidation: true,
      attackPrevention: true
    },
    uptime: process.uptime()
  });
});

// Security status endpoint (basic monitoring)
app.get('/api/security-status', (req, res) => {
  const keyStats = keyManager.getStats();
  res.json({
    timestamp: new Date().toISOString(),
    keyManager: keyStats,
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: PORT,
      uptime: process.uptime()
    },
    security: {
      rateLimitingActive: true,
      corsConfigured: true,
      secureKeyManagement: true,
      inputValidation: true,
      xssProtection: true,
      sqlInjectionProtection: true,
      commandInjectionProtection: true,
      contentSecurityHeaders: true
    }
  });
});

// Main API endpoint
app.post("/api/query", async (req, res) => {
  try {
    const { prompt, provider = "mistral", model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    const providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      return res.status(400).json({ 
        error: `Unsupported provider: ${provider}`,
        availableProviders: Object.keys(PROVIDERS)
      });
    }
    
    let apiKey;
    try {
      apiKey = getAPIKey(provider);
    } catch (error) {
      return res.status(500).json({ 
        error: `API key not configured for ${provider}`,
        provider: provider
      });
    }
    
    // Validate model exists for provider
    if (model && !providerConfig.models.includes(model)) {
      return res.status(400).json({
        error: `Model ${model} not supported for ${provider}`,
        availableModels: providerConfig.models
      });
    }
    
    const url = providerConfig.url(apiKey, model);
    const headers = providerConfig.headers(apiKey);
    const requestBody = providerConfig.formatRequest(prompt, model);
    
    console.log(`📡 ${provider} request: ${model || 'default'} model`);
    
    const response = await axios.post(url, requestBody, { headers });
    const result = providerConfig.extractResponse(response.data);
    
    res.json({ 
      response: result, 
      provider, 
      model: model || providerConfig.models[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ ${req.body.provider || 'Unknown'} API Error:`, error);
    
    // Better error handling
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message;
      
      return res.status(status).json({
        error: `${req.body.provider || 'API'} Error: ${message}`,
        provider: req.body.provider,
        statusCode: status
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      provider: req.body.provider || "unknown"
    });
  }
});

// Provider status endpoint
app.get('/api/providers', (req, res) => {
  const providerStatus = Object.keys(PROVIDERS).map(provider => ({
    name: provider,
    available: keyManager.hasKey(provider),
    status: keyManager.hasKey(provider) ? 'active' : 'unavailable',
    models: PROVIDERS[provider].models,
    modelCount: PROVIDERS[provider].models.length
  }));
  
  res.json({
    providers: providerStatus,
    timestamp: new Date().toISOString(),
    totalProviders: providerStatus.length,
    activeProviders: providerStatus.filter(p => p.available).length
  });
});

// Smart provider selection endpoint
app.post('/api/smart', async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  // Enhanced smart selection logic with new providers
  let selectedProvider = 'google'; // default
  
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('code') || promptLower.includes('programming') || promptLower.includes('function')) {
    selectedProvider = 'mistral';  // Good at code
  } else if (promptLower.includes('creative') || promptLower.includes('story') || promptLower.includes('write')) {
    selectedProvider = 'llama';    // Creative writing
  } else if (promptLower.includes('analysis') || promptLower.includes('research') || promptLower.includes('explain')) {
    selectedProvider = 'google';   // Analytical tasks
  } else if (promptLower.includes('math') || promptLower.includes('calculate') || promptLower.includes('solve')) {
    selectedProvider = 'google';   // Mathematical tasks
  } else if (promptLower.includes('fast') || promptLower.includes('quick') || promptLower.includes('instant')) {
    selectedProvider = 'groq';     // Ultra-fast inference
  } else if (promptLower.includes('conversation') || promptLower.includes('chat') || promptLower.includes('talk')) {
    selectedProvider = 'cohere';   // Conversational AI
  } else if (promptLower.includes('open source') || promptLower.includes('community') || promptLower.includes('hugging')) {
    selectedProvider = 'huggingface'; // Community models
  }
  
  try {
    const providerConfig = PROVIDERS[selectedProvider];
    if (!providerConfig) {
      return res.status(400).json({ 
        error: `Unsupported provider: ${selectedProvider}`,
        availableProviders: Object.keys(PROVIDERS)
      });
    }
    
    let apiKey;
    try {
      apiKey = getAPIKey(selectedProvider);
    } catch (error) {
      return res.status(500).json({ 
        error: `API key not configured for ${selectedProvider}`,
        provider: selectedProvider
      });
    }
    
    const url = providerConfig.url(apiKey, null);
    const headers = providerConfig.headers(apiKey);
    const requestBody = providerConfig.formatRequest(prompt, null);
    
    console.log(`📡 ${selectedProvider} request: default model`);
    
    const response = await axios.post(url, requestBody, { headers });
    const result = providerConfig.extractResponse(response.data);
    
    res.json({ 
      response: result, 
      provider: selectedProvider, 
      model: providerConfig.models[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ ${selectedProvider} API Error:`, error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message;
      
      return res.status(status).json({
        error: `${selectedProvider} API Error: ${message}`,
        provider: selectedProvider,
        statusCode: status
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      provider: selectedProvider
    });
  }
});

// GitHub Dashboard endpoints
app.get('/api/github/llm-data', async (req, res) => {
  try {
    console.log('[GitHub] Fetching LLM dashboard data...');
    
    // Check cache first
    const now = Date.now();
    if (githubDataCache.data && githubDataCache.timestamp && (now - githubDataCache.timestamp < GITHUB_CACHE_DURATION)) {
      console.log('[GitHub] Returning cached data');
      return res.json({
        ...githubDataCache.data,
        cached: true,
        cacheAge: Math.round((now - githubDataCache.timestamp) / 1000)
      });
    }

    // Verify GitHub token exists
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable not configured');
    }

    // GitHub API headers with authentication
    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'AskMe-LLM-Dashboard/1.0',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // Step 1: Fetch workflow runs
    console.log('[GitHub] Fetching workflow runs...');
    const runsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=10`;
    const runsResponse = await axios.get(runsUrl, { headers });
    
    const { workflow_runs } = runsResponse.data;
    console.log(`[GitHub] Found ${workflow_runs?.length || 0} workflow runs`);
    
    if (!workflow_runs || workflow_runs.length === 0) {
      throw new Error('No workflow runs found');
    }

    // Step 2: Find successful run
    const successfulRun = workflow_runs.find(r => r.conclusion === 'success');
    if (!successfulRun) {
      throw new Error('No successful workflow runs found');
    }

    const latestRun = workflow_runs[0];
    const isOutdated = latestRun.id !== successfulRun.id;
    console.log(`[GitHub] Using run #${successfulRun.run_number}, outdated: ${isOutdated}`);

    // Step 3: Get artifacts
    console.log('[GitHub] Fetching artifacts...');
    const artifactsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${successfulRun.id}/artifacts`;
    const artifactsResponse = await axios.get(artifactsUrl, { headers });
    
    const { artifacts } = artifactsResponse.data;
    const targetArtifact = artifacts.find(a => a.name === ARTIFACT_NAME);
    console.log(`[GitHub] Found ${artifacts.length} artifacts, target found: ${!!targetArtifact}`);
    
    if (!targetArtifact) {
      const availableArtifacts = artifacts.map(a => a.name).join(', ');
      throw new Error(`Artifact "${ARTIFACT_NAME}" not found. Available: ${availableArtifacts}`);
    }

    // Step 4: Download and parse artifact
    console.log('[GitHub] Downloading artifact...');
    const zipResponse = await axios.get(targetArtifact.archive_download_url, { 
      headers,
      responseType: 'arraybuffer'
    });
    
    const zip = await JSZip.loadAsync(zipResponse.data);
    
    const jsonFile = Object.keys(zip.files).find(k => 
      k.endsWith('validated_models.json') || k.endsWith('.json')
    );
    
    if (!jsonFile) {
      const availableFiles = Object.keys(zip.files).join(', ');
      throw new Error(`validated_models.json not found. Available files: ${availableFiles}`);
    }
    
    console.log(`[GitHub] Parsing ${jsonFile}...`);
    const content = await zip.files[jsonFile].async('string');
    const jsonData = JSON.parse(content);
    
    // Handle different JSON structures
    let models;
    if (Array.isArray(jsonData)) {
      // Direct array of models
      models = jsonData;
    } else if (jsonData.models && Array.isArray(jsonData.models)) {
      // Object with models property
      models = jsonData.models;
    } else {
      throw new Error('Invalid JSON structure: expected array or object with models property');
    }
    
    console.log(`[GitHub] Parsed ${models.length} models`);

    // Step 5: Calculate metrics
    const totalProviders = new Set(models.map(m => m.provider)).size;
    const totalAvailableModels = models.filter(m => m.api_available).length;
    const modelsExcluded = models.length - totalAvailableModels;

    // Calculate change from previous metrics
    let availableModelsChange = 0;
    if (githubDataCache.previousMetrics?.totalAvailableModels) {
      availableModelsChange = totalAvailableModels - githubDataCache.previousMetrics.totalAvailableModels;
    }

    const metrics = {
      totalProviders,
      totalAvailableModels,
      availableModelsChange,
      modelsExcluded,
      lastUpdate: new Date(successfulRun.created_at).toISOString(),
      nextUpdate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      dataSource: isOutdated ? `${targetArtifact.name} (using previous successful run)` : targetArtifact.name
    };

    const status = {
      status: successfulRun.conclusion || 'success',
      lastRun: new Date(successfulRun.created_at).toISOString(),
      runNumber: successfulRun.run_number
    };

    const result = {
      models,
      metrics,
      status,
      isOutdated,
      fallbackReason: isOutdated ? 'Latest run failed, using previous successful data' : '',
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Update cache
    githubDataCache = {
      data: result,
      timestamp: now,
      previousMetrics: metrics
    };

    console.log('[GitHub] Successfully fetched and cached data');
    res.json(result);

  } catch (error) {
    console.error('[GitHub] Error:', error);
    
    // Return cached data if available during errors
    if (githubDataCache.data) {
      console.log('[GitHub] Returning cached data due to error');
      const cacheAge = githubDataCache.timestamp ? Math.round((Date.now() - githubDataCache.timestamp) / 1000) : null;
      return res.json({
        ...githubDataCache.data,
        cached: true,
        error: error.message,
        cacheAge
      });
    }
    
    // No cached data available
    res.status(500).json({
      error: 'Failed to fetch LLM dashboard data',
      message: error.message,
      timestamp: new Date().toISOString(),
      details: 'No cached data available'
    });
  }
});

// GitHub Dashboard health check
app.get('/api/github/llm-health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'LLM Dashboard GitHub Proxy',
    timestamp: new Date().toISOString(),
    hasToken: !!GITHUB_TOKEN,
    config: {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      workflow: WORKFLOW_FILE,
      artifact: ARTIFACT_NAME
    },
    cache: {
      hasData: !!githubDataCache.data,
      age: githubDataCache.timestamp ? Math.round((Date.now() - githubDataCache.timestamp) / 1000) : null
    }
  });
});

// LLM Scout Agent endpoints
app.post('/api/llms', authenticateAgent, async (req, res) => {
  try {
    const { models, metadata } = req.body;
    
    if (!models || !Array.isArray(models)) {
      return res.status(400).json({ error: 'Models array is required' });
    }
    
    const llmData = {
      models: models,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalModels: models.length,
        agentVersion: metadata?.agentVersion || 'unknown',
        runId: metadata?.runId || 'unknown',
        sources: metadata?.sources || []
      }
    };
    
    await fs.writeJson(LLMS_FILE_PATH, llmData, { spaces: 2 });
    
    console.log(`📊 LLM data updated: ${models.length} models from agent`);
    
    res.json({ 
      success: true,
      message: 'LLM data updated successfully',
      modelsCount: models.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ LLM data update error:', error);
    res.status(500).json({ 
      error: 'Failed to update LLM data',
      details: error.message
    });
  }
});

app.get('/api/llms', async (req, res) => {
  try {
    const exists = await fs.pathExists(LLMS_FILE_PATH);
    
    if (!exists) {
      return res.json({
        models: [],
        metadata: {
          lastUpdated: null,
          totalModels: 0,
          message: 'No LLM data available yet'
        }
      });
    }
    
    const llmData = await fs.readJson(LLMS_FILE_PATH);
    
    // Filter and format for client consumption
    const filters = req.query;
    let filteredModels = llmData.models || [];
    
    if (filters.country) {
      filteredModels = filteredModels.filter(model => 
        model.country?.toLowerCase() === filters.country.toLowerCase()
      );
    }
    
    if (filters.accessType) {
      filteredModels = filteredModels.filter(model => 
        model.accessType?.toLowerCase().includes(filters.accessType.toLowerCase())
      );
    }
    
    if (filters.source) {
      filteredModels = filteredModels.filter(model => 
        model.source?.toLowerCase() === filters.source.toLowerCase()
      );
    }
    
    res.json({
      models: filteredModels,
      metadata: {
        ...llmData.metadata,
        filteredCount: filteredModels.length,
        appliedFilters: filters
      }
    });
    
  } catch (error) {
    console.error('❌ LLM data fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LLM data',
      details: error.message
    });
  }
});

app.get('/api/llms/health', (req, res) => {
  fs.pathExists(LLMS_FILE_PATH).then(exists => {
    res.json({
      status: 'healthy',
      dataFile: exists ? 'exists' : 'missing',
      lastCheck: new Date().toISOString(),
      agentEndpoint: '/api/llms',
      clientEndpoint: '/api/llms'
    });
  }).catch(error => {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  const availableEndpoints = app._router.stack
    .filter(r => r.route && r.route.path)
    .map(r => r.route.path)
    .filter(path => !path.includes('*')); // Exclude the catch-all route itself
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ AskMe Backend Proxy server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Query API: http://localhost:${PORT}/api/query`);
  console.log(`📋 Providers: http://localhost:${PORT}/api/providers`);
  console.log(`🧠 Smart API: http://localhost:${PORT}/api/smart`);
  console.log(`📊 GitHub Dashboard: http://localhost:${PORT}/api/github/llm-data`);
  console.log(`🔍 GitHub Health: http://localhost:${PORT}/api/github/llm-health`);
  
  // Display key manager status
  const keyStats = keyManager.getStats();
  const loadedProviders = Object.keys(keyStats.providers);
  console.log(`🔑 Secure key manager status: ${keyStats.totalKeys} keys loaded`);
  console.log(`📊 Providers: ${loadedProviders.join(', ')}`);
  
  if (keyStats.totalKeys === 0) {
    console.warn('⚠️  No API keys loaded. Check your environment variables.');
  }
});

module.exports = app;