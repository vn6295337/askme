#!/usr/bin/env node

// Scout Agent Backend Connectivity Validation
// Validates that required environment variables and backend connectivity exist

const axios = require('axios');

async function validateSecrets() {
  console.log('🔐 Validating backend connectivity and secrets...');
  
  // Check required environment variables (BACKEND_URL has default)
  const requiredEnvVars = ['AGENT_AUTH_TOKEN'];
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
    console.log('💡 Using default backend URL, but some features may be limited without auth token');
  }
  
  console.log('✅ All required environment variables are present');
  
  // Test backend connectivity
  try {
    const backendUrl = process.env.BACKEND_URL || 'https://askme-backend-proxy.onrender.com';
    const authToken = process.env.AGENT_AUTH_TOKEN;
    
    console.log(`🌐 Testing connectivity to: ${backendUrl}`);
    
    // Test health endpoint
    const healthResponse = await axios.get(`${backendUrl}/health`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AskMe-Scout-Agent/1.0'
      }
    });
    
    console.log('✅ Backend health check passed:', healthResponse.data.status);
    
    // Test authentication with LLM endpoint
    const llmHealthResponse = await axios.get(`${backendUrl}/api/llms/health`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'AskMe-Scout-Agent/1.0'
      }
    });
    
    console.log('✅ Agent authentication successful');
    console.log('🎉 Backend connectivity validation complete');
    
  } catch (error) {
    console.error('❌ Backend connectivity failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateSecrets().catch(error => {
    console.error('Validation error:', error);
    process.exit(1);
  });
}

module.exports = { validateSecrets };