#!/usr/bin/env node

// Scout Agent Backend Debug Tool
// Provides detailed debugging information about backend endpoints

const axios = require('axios');

async function debugBackend() {
  console.log('🔍 Starting backend endpoint debugging...');
  
  const backendUrl = process.env.BACKEND_URL || 'https://askme-backend-proxy.onrender.com';
  const authToken = process.env.AGENT_AUTH_TOKEN;
  
  // backendUrl will always have a value due to default fallback
  
  console.log(`🌐 Backend URL: ${backendUrl}`);
  console.log(`🔐 Auth Token: ${authToken ? '***' + authToken.slice(-4) : 'Not set'}`);
  console.log('');
  
  // Test endpoints in order
  const endpoints = [
    { path: '/health', auth: false, description: 'General health check' },
    { path: '/api/providers', auth: false, description: 'Provider status' },
    { path: '/api/llms/health', auth: true, description: 'LLM agent health' },
    { path: '/api/llms', auth: true, description: 'LLM data endpoint' },
    { path: '/api/github/llm-health', auth: false, description: 'GitHub dashboard health' }
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(backendUrl, endpoint, authToken);
  }
  
  console.log('\n🎉 Backend debugging complete');
}

async function testEndpoint(baseUrl, endpoint, authToken) {
  const url = `${baseUrl}${endpoint.path}`;
  const headers = {
    'User-Agent': 'AskMe-Scout-Agent-Debug/1.0',
    'Accept': 'application/json'
  };
  
  if (endpoint.auth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  console.log(`📡 Testing: ${endpoint.path} (${endpoint.description})`);
  
  try {
    const response = await axios.get(url, {
      headers,
      timeout: 10000,
      validateStatus: () => true // Don't throw on HTTP errors
    });
    
    const status = response.status;
    const statusIcon = status < 300 ? '✅' : status < 400 ? '⚠️' : '❌';
    
    console.log(`   ${statusIcon} Status: ${status} ${response.statusText}`);
    
    if (response.data && typeof response.data === 'object') {
      // Show relevant info from response
      const data = response.data;
      
      if (data.status) console.log(`   📊 Status: ${data.status}`);
      if (data.providers) console.log(`   🤖 Providers: ${data.providers.length || 'N/A'}`);
      if (data.totalProviders) console.log(`   🔢 Total Providers: ${data.totalProviders}`);
      if (data.activeProviders) console.log(`   ⚡ Active Providers: ${data.activeProviders}`);
      if (data.version) console.log(`   📦 Version: ${data.version}`);
      if (data.hasToken !== undefined) console.log(`   🔑 Has Token: ${data.hasToken}`);
      if (data.timestamp) console.log(`   ⏰ Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    
    if (error.code) {
      console.log(`   📡 Error Code: ${error.code}`);
    }
    
    if (error.response) {
      console.log(`   📄 Response Status: ${error.response.status}`);
    }
  }
  
  console.log('');
}

// Run debugging if called directly
if (require.main === module) {
  debugBackend().catch(error => {
    console.error('Debug error:', error);
    process.exit(1);
  });
}

module.exports = { debugBackend };