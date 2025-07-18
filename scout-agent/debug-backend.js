#!/usr/bin/env node

const axios = require('axios');

// Backend configuration
const BACKEND_CONFIG = {
  url: process.env.BACKEND_URL || 'https://askme-backend-proxy.onrender.com',
  authToken: process.env.AGENT_AUTH_TOKEN,
  timeout: 30000
};

async function debugBackend() {
  console.log('🔍 Debugging backend endpoints...');
  console.log(`Backend URL: ${BACKEND_CONFIG.url}`);
  console.log(`Auth Token: ${BACKEND_CONFIG.authToken ? 'Present' : 'Missing'}`);
  
  const endpoints = [
    '/health',
    '/api/providers',
    '/api/llms',
    '/api/llms/health'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      
      const response = await axios({
        method: 'GET',
        url: `${BACKEND_CONFIG.url}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${BACKEND_CONFIG.authToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'askme-debug/1.0.0'
        },
        timeout: BACKEND_CONFIG.timeout
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Response type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
      
      if (Array.isArray(response.data)) {
        console.log(`📝 Array length: ${response.data.length}`);
        if (response.data.length > 0) {
          console.log(`🔍 First item keys:`, Object.keys(response.data[0]));
          console.log(`🔍 First item sample:`, JSON.stringify(response.data[0], null, 2));
        }
      } else if (typeof response.data === 'object') {
        console.log(`🔍 Object keys:`, Object.keys(response.data));
        console.log(`🔍 Object sample:`, JSON.stringify(response.data, null, 2));
      } else {
        console.log(`🔍 Raw data:`, response.data);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Status: ${error.response.status}`);
        console.log(`❌ Error:`, error.response.data);
      } else {
        console.log(`❌ Network error:`, error.message);
      }
    }
  }
}

if (require.main === module) {
  debugBackend().catch(error => {
    console.error('Debug failed:', error);
    process.exit(1);
  });
}

module.exports = { debugBackend };