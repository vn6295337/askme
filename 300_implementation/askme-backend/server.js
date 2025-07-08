// AskMe Backend Proxy Server - UPDATED VERSION
// Secure API key management and request proxying

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
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
  llama: process.env.LLAMA_API_KEY
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
  
  // Simple smart selection logic (enhanced)
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