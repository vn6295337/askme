// Backend deployment verification script
const https = require('https');
const http = require('http');

const STAGING_URL = process.env.STAGING_URL || 'https://askme-backend-staging.onrender.com';
const AUTH_TOKEN = process.env.AGENT_AUTH_TOKEN || 'scout-agent-secure-token-2024';

console.log('Verifying backend deployment...');
console.log('Target URL:', STAGING_URL);

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestModule = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => reject(error));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  try {
    console.log('\\n1. Testing health endpoint...');
    const response = await makeRequest(`${STAGING_URL}/health`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('✓ Health endpoint working');
      console.log('  Version:', data.version);
      console.log('  Providers:', data.providers?.join(', '));
      return true;
    } else {
      console.log('✗ Health endpoint failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('✗ Health endpoint error:', error.message);
    return false;
  }
}

async function testLLMHealthEndpoint() {
  try {
    console.log('\\n2. Testing LLM health endpoint...');
    const response = await makeRequest(`${STAGING_URL}/api/llms/health`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('✓ LLM health endpoint working');
      console.log('  Status:', data.status);
      console.log('  Data file:', data.dataFile);
      return true;
    } else {
      console.log('✗ LLM health endpoint failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('✗ LLM health endpoint error:', error.message);
    return false;
  }
}

async function testLLMGetEndpoint() {
  try {
    console.log('\\n3. Testing LLM GET endpoint...');
    const response = await makeRequest(`${STAGING_URL}/api/llms`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('✓ LLM GET endpoint working');
      console.log('  Models count:', data.models?.length || 0);
      console.log('  Last updated:', data.metadata?.lastUpdated || 'None');
      return true;
    } else {
      console.log('✗ LLM GET endpoint failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('✗ LLM GET endpoint error:', error.message);
    return false;
  }
}

async function testAuthenticationFail() {
  try {
    console.log('\\n4. Testing authentication (should fail)...');
    const response = await makeRequest(`${STAGING_URL}/api/llms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ models: [] })
    });
    
    if (response.statusCode === 401) {
      console.log('✓ Authentication properly rejects unauthorized requests');
      return true;
    } else {
      console.log('✗ Authentication failed to reject:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('✗ Authentication test error:', error.message);
    return false;
  }
}

async function testAuthenticationSuccess() {
  try {
    console.log('\\n5. Testing authentication (should succeed)...');
    const testData = {
      models: [
        {
          name: 'Test Model',
          publisher: 'Test Org',
          country: 'US'
        }
      ],
      metadata: {
        agentVersion: '1.0.0',
        runId: 'test-' + Date.now()
      }
    };
    
    const response = await makeRequest(`${STAGING_URL}/api/llms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(testData)
    });
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✓ Authentication accepts valid tokens');
      const data = JSON.parse(response.data);
      console.log('  Response:', data.message);
      return true;
    } else {
      console.log('✗ Authentication failed for valid token:', response.statusCode);
      console.log('  Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('✗ Authentication success test error:', error.message);
    return false;
  }
}

async function testProvidersEndpoint() {
  try {
    console.log('\\n6. Testing existing providers endpoint...');
    const response = await makeRequest(`${STAGING_URL}/api/providers`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('✓ Providers endpoint still working');
      console.log('  Active providers:', data.activeProviders);
      console.log('  Total providers:', data.totalProviders);
      return true;
    } else {
      console.log('✗ Providers endpoint failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('✗ Providers endpoint error:', error.message);
    return false;
  }
}

// Main verification function
async function runVerification() {
  console.log('Starting backend verification...');
  
  const tests = [
    testHealthEndpoint,
    testLLMHealthEndpoint,
    testLLMGetEndpoint,
    testAuthenticationFail,
    testAuthenticationSuccess,
    testProvidersEndpoint
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\\n' + '='.repeat(50));
  console.log('Verification Results:');
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\\n🎉 All tests passed! Backend is ready for agent integration.');
    process.exit(0);
  } else {
    console.log('\\n⚠️  Some tests failed. Please check the backend deployment.');
    process.exit(1);
  }
}

// Run verification
runVerification().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});