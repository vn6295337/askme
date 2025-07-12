// AskMe Backend Proxy Server - UPDATED VERSION
// Secure API key management and request proxying

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
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

// API Keys (stored securely on server)
const API_KEYS = {
  google: process.env.GOOGLE_API_KEY,
  mistral: process.env.MISTRAL_API_KEY,
  llama: process.env.LLAMA_API_KEY,
  cohere: process.env.COHERE_API_KEY,
  groq: process.env.GROQ_API_KEY,
  huggingface: process.env.HUGGINGFACE_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  ai21: process.env.AI21_API_KEY,
  replicate: process.env.REPLICATE_API_KEY
};

// LLM Scout Agent configuration
const AGENT_AUTH_TOKEN = process.env.AGENT_AUTH_TOKEN || 'scout-agent-default-token';
const LLMS_FILE_PATH = path.join(__dirname, 'data', 'llms.json');

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
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    providers: Object.keys(PROVIDERS)
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
    
    const apiKey = API_KEYS[provider];
    if (!apiKey) {
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
    available: !!API_KEYS[provider],
    status: API_KEYS[provider] ? 'active' : 'unavailable',
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
    
    const apiKey = API_KEYS[selectedProvider];
    if (!apiKey) {
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
  
  // Verify API keys are loaded
  const loadedKeys = Object.entries(API_KEYS)
    .filter(([_, key]) => key)
    .map(([provider, _]) => provider);
  console.log(`🔑 Loaded API keys for: ${loadedKeys.join(', ')}`);
  
  if (loadedKeys.length === 0) {
    console.warn('⚠️  No API keys loaded. Check your environment variables.');
  }
});

module.exports = app;