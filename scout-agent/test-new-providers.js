#!/usr/bin/env node

// Test script for new API providers integration
const axios = require('axios');

const BACKEND_URL = 'https://askme-backend-proxy.onrender.com';

// Test data
const testPrompts = [
  {
    prompt: "Hello, can you tell me about yourself?",
    expectedProviders: ['cohere', 'groq', 'huggingface']
  },
  {
    prompt: "Write a Python function to calculate fibonacci numbers",
    expectedProviders: ['mistral', 'huggingface', 'replicate']
  },
  {
    prompt: "Fast answer: What is 2+2?",
    expectedProviders: ['groq', 'google']
  },
  {
    prompt: "Create a creative story about space exploration",
    expectedProviders: ['llama', 'ai21', 'cohere']
  }
];

// New providers to test
const newProviders = ['cohere', 'groq', 'huggingface', 'openrouter', 'ai21', 'replicate'];

async function testProviderAvailability() {
  console.log('🔍 Testing provider availability...\n');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/providers`);
    const { providers } = response.data;
    
    console.log('📊 Provider Status:');
    providers.forEach(provider => {
      const status = provider.available ? '✅' : '❌';
      const newLabel = newProviders.includes(provider.name) ? ' (NEW)' : '';
      console.log(`${status} ${provider.name}${newLabel}: ${provider.status} (${provider.modelCount} models)`);
    });
    
    console.log(`\n📈 Total: ${providers.length} providers, ${providers.filter(p => p.available).length} active\n`);
    
    return providers;
  } catch (error) {
    console.error('❌ Failed to check provider availability:', error.message);
    return [];
  }
}

async function testSpecificProvider(providerName, prompt) {
  console.log(`🧪 Testing ${providerName} with: "${prompt.substring(0, 50)}..."`);
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/query`, {
      prompt: prompt,
      provider: providerName
    }, {
      timeout: 30000
    });
    
    const result = response.data;
    console.log(`✅ ${providerName}: SUCCESS`);
    console.log(`   Model: ${result.model}`);
    console.log(`   Response: ${result.response.substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log(`❌ ${providerName}: FAILED`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.error || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

async function testSmartSelection() {
  console.log('🧠 Testing smart provider selection...\n');
  
  for (const test of testPrompts) {
    console.log(`📝 Prompt: "${test.prompt}"`);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/smart`, {
        prompt: test.prompt
      }, {
        timeout: 30000
      });
      
      const result = response.data;
      console.log(`✅ Selected: ${result.provider} (${result.model})`);
      console.log(`   Response: ${result.response.substring(0, 100)}...`);
      
      if (test.expectedProviders.includes(result.provider)) {
        console.log(`🎯 Good selection! Provider ${result.provider} is expected for this query type.`);
      }
    } catch (error) {
      console.log(`❌ Smart selection failed: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

async function testNewProvidersIndividually() {
  console.log('🔬 Testing each new provider individually...\n');
  
  const testPrompt = "Hello! Please introduce yourself in one sentence.";
  const results = {};
  
  for (const provider of newProviders) {
    const success = await testSpecificProvider(provider, testPrompt);
    results[provider] = success;
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 New Provider Test Results:');
  Object.entries(results).forEach(([provider, success]) => {
    const status = success ? '✅ WORKING' : '❌ FAILED';
    console.log(`   ${provider}: ${status}`);
  });
  
  const workingCount = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 Success Rate: ${workingCount}/${newProviders.length} (${Math.round(workingCount/newProviders.length*100)}%)\n`);
  
  return results;
}

async function main() {
  console.log('🚀 AskMe New Providers Integration Test\n');
  console.log(`Backend URL: ${BACKEND_URL}\n`);
  
  // Test 1: Check provider availability
  const providers = await testProviderAvailability();
  
  if (providers.length === 0) {
    console.error('❌ Cannot continue - backend is not accessible');
    process.exit(1);
  }
  
  // Test 2: Test new providers individually
  const results = await testNewProvidersIndividually();
  
  // Test 3: Test smart selection
  await testSmartSelection();
  
  // Summary
  console.log('📋 INTEGRATION TEST SUMMARY');
  console.log('==========================');
  
  const availableProviders = providers.filter(p => p.available);
  const newAvailable = availableProviders.filter(p => newProviders.includes(p.name));
  
  console.log(`✅ Available providers: ${availableProviders.length}/${providers.length}`);
  console.log(`🆕 New providers working: ${newAvailable.length}/${newProviders.length}`);
  
  if (newAvailable.length === newProviders.length) {
    console.log('🎉 ALL NEW PROVIDERS INTEGRATED SUCCESSFULLY!');
  } else {
    console.log('⚠️  Some new providers need attention:');
    const failed = newProviders.filter(p => !results[p]);
    failed.forEach(provider => {
      console.log(`   - ${provider}: Check API key and configuration`);
    });
  }
  
  console.log('\n🔗 Next steps:');
  console.log('1. Verify all API keys are correctly set in Render.com environment');
  console.log('2. Test CLI integration with new providers');
  console.log('3. Update documentation with new provider options');
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testProviderAvailability, testSpecificProvider, testSmartSelection };