// AskMe Backend Proxy Server
// Secure API key management and request proxying

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
  xai: process.env.XAI_API_KEY
};

// Provider configurations
const PROVIDERS = {
  google: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    }),
    formatRequest: (prompt) => ({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
    extractResponse: (data) => data.candidates[0]?.content?.parts[0]?.text || 'No response'
  },
  
  mistral: {
    url: 'https://api.mistral.ai/v1/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (prompt) => ({
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    }),
    extractResponse: (data) => data.choices[0]?.message?.content || 'No response'
  },
  
  llama: {
    url: 'https://api.together.xyz/v1/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (prompt) => ({
      model: 'meta-llama/Llama-2-7b-chat-hf',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    }),
    extractResponse: (data) => data.choices[0]?.message?.content || 'No response'
  },
  
  xai: {
    url: 'https://api.x.ai/v1/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (prompt) => ({
      model: 'grok-beta',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    }),
    extractResponse: (data) => data.choices[0]?.message?.content || 'No response'
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, provider = 'google', userId = 'anonymous' } = req.body;
    
    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Prompt is required and must be a non-empty string'
      });
    }
    
    if (prompt.length > 4000) {
      return res.status(400).json({
        error: 'Prompt too long. Maximum 4000 characters.'
      });
    }
    
    if (!PROVIDERS[provider]) {
      return res.status(400).json({
        error: `Unsupported provider. Available: ${Object.keys(PROVIDERS).join(', ')}`
      });
    }
    
    const apiKey = API_KEYS[provider];
    if (!apiKey) {
      return res.status(503).json({
        error: `Provider ${provider} is temporarily unavailable`
      });
    }
    
    // Log request (without sensitive data)
    console.log(`[${new Date().toISOString()}] Chat request - Provider: ${provider}, User: ${userId}, Prompt length: ${prompt.length}`);
    
    // Make request to AI provider
    const providerConfig = PROVIDERS[provider];
    const requestStart = Date.now();
    
    const response = await axios.post(
      providerConfig.url,
      providerConfig.formatRequest(prompt.trim()),
      {
        headers: providerConfig.headers(apiKey),
        timeout: 30000 // 30 second timeout
      }
    );
    
    const responseTime = Date.now() - requestStart;
    const aiResponse = providerConfig.extractResponse(response.data);
    
    // Log successful response
    console.log(`[${new Date().toISOString()}] Response completed - Provider: ${provider}, Response time: ${responseTime}ms`);
    
    res.json({
      response: aiResponse,
      provider: provider,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timeout. Please try again.',
        provider: req.body.provider || 'unknown'
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response.headers['retry-after'] || '60'
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(503).json({
        error: 'Provider authentication failed. Service temporarily unavailable.'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error. Please try again later.'
    });
  }
});

// Provider status endpoint
app.get('/api/providers', (req, res) => {
  const providerStatus = Object.keys(PROVIDERS).map(provider => ({
    name: provider,
    available: !!API_KEYS[provider],
    status: API_KEYS[provider] ? 'active' : 'unavailable'
  }));
  
  res.json({
    providers: providerStatus,
    timestamp: new Date().toISOString()
  });
});

// Smart provider selection endpoint
app.post('/api/smart', async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  // Simple smart selection logic (can be enhanced)
  let selectedProvider = 'google'; // default
  
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('code') || promptLower.includes('programming')) {
    selectedProvider = 'mistral';
  } else if (promptLower.includes('creative') || promptLower.includes('story')) {
    selectedProvider = 'llama';
  } else if (promptLower.includes('analysis') || promptLower.includes('research')) {
    selectedProvider = 'xai';
  }
  
  // Forward to regular chat endpoint
  req.body.provider = selectedProvider;
  return app._router.handle({ ...req, method: 'POST', url: '/api/chat' }, res);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AskMe Backend Proxy running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📋 Providers: http://localhost:${PORT}/api/providers`);
  
  // Verify API keys are loaded
  const loadedKeys = Object.entries(API_KEYS)
    .filter(([_, key]) => key)
    .map(([provider, _]) => provider);
  console.log(`🔑 Loaded API keys for: ${loadedKeys.join(', ')}`);
});

module.exports = app;