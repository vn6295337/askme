// End-to-end test for scout agent to backend flow
const https = require('https');
const http = require('http');

// Configuration
const TEST_CONFIG = {
  backendUrl: process.env.BACKEND_URL || 'https://test-backend.com',
  authToken: process.env.AGENT_AUTH_TOKEN || 'test-token-123',
  testRunId: `e2e-test-${Date.now()}`
};

console.log('🧪 Starting End-to-End Test');
console.log('Backend URL:', TEST_CONFIG.backendUrl);
console.log('Test Run ID:', TEST_CONFIG.testRunId);

// Mock LLM discovery data
const mockDiscoveredModels = [
  {
    name: 'E2E Test Model 1',
    publisher: 'Test Organization',
    country: 'US',
    accessType: 'Open Source',
    license: 'MIT',
    modelSize: '7B',
    releaseDate: new Date().toISOString(),
    sourceUrl: 'https://github.com/test-org/test-model',
    inferenceSupport: 'CPU/GPU',
    source: 'E2E Test',
    capabilities: ['Text Generation'],
    discoveryTimestamp: new Date().toISOString(),
    agentVersion: '1.0.0',
    validationStatus: 'validated'
  },
  {
    name: 'E2E Test Model 2',
    publisher: 'Another Test Org',
    country: 'UK',
    accessType: 'Proprietary - Free Tier',
    license: 'Custom',
    modelSize: '13B',
    releaseDate: new Date().toISOString(),
    sourceUrl: 'https://example.com/model2',
    inferenceSupport: 'API',
    source: 'E2E Test',
    capabilities: ['Conversational', 'Code Generation'],
    discoveryTimestamp: new Date().toISOString(),
    agentVersion: '1.0.0',
    validationStatus: 'validated'
  }
];

// Helper function for HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestModule = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'askme-scout-agent-e2e-test/1.0.0',
        ...options.headers
      }
    };
    
    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data
          });
        }
      });
    });
    
    req.on('error', (error) => reject(error));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Mock agent validation function
function validateModels(models) {
  const validated = models.filter(model => {
    // Basic validation
    if (!model.name || !model.publisher || !model.country) {
      console.log(`⚠️  Skipping invalid model: ${model.name || 'unnamed'}`);
      return false;
    }
    return true;
  });
  
  console.log(`✓ Validated ${validated.length}/${models.length} models`);
  return validated;
}

// Test steps
async function step1_DiscoverModels() {
  console.log('\\n📡 Step 1: Simulate Model Discovery');
  
  // Simulate discovery process
  console.log('  - Crawling GitHub... ✓');
  console.log('  - Crawling Hugging Face... ✓');
  console.log('  - Filtering by region/access... ✓');
  console.log('  - Removing duplicates... ✓');
  
  console.log(`  Discovered ${mockDiscoveredModels.length} models`);
  return mockDiscoveredModels;
}

async function step2_ValidateData(models) {
  console.log('\\n🔍 Step 2: Validate Discovered Models');
  
  const validatedModels = validateModels(models);
  
  // Additional validation checks
  const validationSummary = {
    total: models.length,
    valid: validatedModels.length,
    byCountry: {},
    byAccessType: {},
    bySource: {}
  };
  
  validatedModels.forEach(model => {
    validationSummary.byCountry[model.country] = (validationSummary.byCountry[model.country] || 0) + 1;
    validationSummary.byAccessType[model.accessType] = (validationSummary.byAccessType[model.accessType] || 0) + 1;
    validationSummary.bySource[model.source] = (validationSummary.bySource[model.source] || 0) + 1;
  });
  
  console.log('  Validation Summary:');
  console.log('  - By Country:', Object.entries(validationSummary.byCountry).map(([k,v]) => `${k}:${v}`).join(', '));
  console.log('  - By Access:', Object.entries(validationSummary.byAccessType).map(([k,v]) => `${k}:${v}`).join(', '));
  
  return validatedModels;
}

async function step3_SendToBackend(models) {
  console.log('\\n🚀 Step 3: Send Data to Backend');
  
  const payload = {
    models: models,
    metadata: {
      timestamp: new Date().toISOString(),
      totalModels: models.length,
      agentVersion: '1.0.0',
      runId: TEST_CONFIG.testRunId,
      sources: ['E2E Test'],
      testMode: true
    }
  };
  
  try {
    console.log('  Preparing request...');
    const response = await makeRequest(`${TEST_CONFIG.backendUrl}/api/llms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.authToken}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`  Response Status: ${response.statusCode}`);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('  ✓ Data successfully sent to backend');
      console.log('  Response:', response.data?.message || 'Success');
      return true;
    } else {
      console.log('  ✗ Backend request failed');
      console.log('  Error:', response.data || response.rawData);
      return false;
    }
    
  } catch (error) {
    console.log('  ✗ Request error:', error.message);
    return false;
  }
}

async function step4_VerifyStorage(models) {
  console.log('\\n💾 Step 4: Verify Data Storage');
  
  try {
    // Wait a moment for data to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('  Fetching stored data...');
    const response = await makeRequest(`${TEST_CONFIG.backendUrl}/api/llms`);
    
    if (response.statusCode === 200) {
      const storedData = response.data;
      console.log(`  ✓ Retrieved ${storedData.models?.length || 0} stored models`);
      console.log(`  Last updated: ${storedData.metadata?.lastUpdated || 'Unknown'}`);
      
      // Verify our test data is included
      const testModels = storedData.models?.filter(model => 
        model.source === 'E2E Test' && 
        model.discoveryTimestamp?.includes(new Date().toISOString().split('T')[0])
      ) || [];
      
      if (testModels.length > 0) {
        console.log(`  ✓ Found ${testModels.length} test models in storage`);
        console.log('  Test models:', testModels.map(m => m.name).join(', '));
        return true;
      } else {
        console.log('  ⚠️  Test models not found in storage');
        return false;
      }
      
    } else {
      console.log('  ✗ Failed to retrieve stored data:', response.statusCode);
      return false;
    }
    
  } catch (error) {
    console.log('  ✗ Storage verification error:', error.message);
    return false;
  }
}

async function step5_TestRetrieval() {
  console.log('\\n📥 Step 5: Test Data Retrieval');
  
  try {
    // Test basic retrieval
    const response = await makeRequest(`${TEST_CONFIG.backendUrl}/api/llms`);
    
    if (response.statusCode === 200) {
      console.log('  ✓ Basic retrieval working');
      
      // Test filtered retrieval
      const filters = [
        'country=US',
        'accessType=Open Source',
        'source=E2E Test'
      ];
      
      for (const filter of filters) {
        const filteredResponse = await makeRequest(`${TEST_CONFIG.backendUrl}/api/llms?${filter}`);
        if (filteredResponse.statusCode === 200) {
          console.log(`  ✓ Filter working: ${filter} (${filteredResponse.data.models?.length || 0} results)`);
        } else {
          console.log(`  ✗ Filter failed: ${filter}`);
        }
      }
      
      return true;
    } else {
      console.log('  ✗ Retrieval failed:', response.statusCode);
      return false;
    }
    
  } catch (error) {
    console.log('  ✗ Retrieval test error:', error.message);
    return false;
  }
}

// Main test function
async function runE2ETest() {
  console.log('Starting End-to-End Flow Test...');
  console.log('=' * 50);
  
  const results = [];
  
  try {
    // Step 1: Discovery
    const discoveredModels = await step1_DiscoverModels();
    results.push({ step: 'Discovery', success: true });
    
    // Step 2: Validation
    const validatedModels = await step2_ValidateData(discoveredModels);
    results.push({ step: 'Validation', success: validatedModels.length > 0 });
    
    // Step 3: Backend submission
    const backendSuccess = await step3_SendToBackend(validatedModels);
    results.push({ step: 'Backend Submission', success: backendSuccess });
    
    // Only continue if backend submission succeeded
    if (backendSuccess) {
      // Step 4: Storage verification
      const storageSuccess = await step4_VerifyStorage(validatedModels);
      results.push({ step: 'Storage Verification', success: storageSuccess });
      
      // Step 5: Retrieval test
      const retrievalSuccess = await step5_TestRetrieval();
      results.push({ step: 'Data Retrieval', success: retrievalSuccess });
    } else {
      console.log('\\n⚠️  Skipping storage/retrieval tests due to backend failure');
    }
    
  } catch (error) {
    console.error('\\n❌ E2E Test failed with error:', error.message);
    results.push({ step: 'Overall', success: false, error: error.message });
  }
  
  // Results summary
  console.log('\\n' + '='.repeat(50));
  console.log('📊 E2E Test Results Summary:');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.step}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
    
    if (result.success) passed++;
    else failed++;
  });
  
  console.log('\\nOverall Result:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\\n🎉 All E2E tests passed! The scout agent flow is working correctly.');
    process.exit(0);
  } else {
    console.log('\\n⚠️  Some E2E tests failed. Please check the configuration and try again.');
    process.exit(1);
  }
}

// Run the test
runE2ETest().catch(error => {
  console.error('\\n💥 E2E Test crashed:', error);
  process.exit(1);
});