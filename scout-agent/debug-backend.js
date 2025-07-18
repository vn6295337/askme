#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

// CLI argument parsing
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(arg => arg.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const GENERATE_REPORT = getArg('generate-report') === 'true';
const OUTPUT_FILE = getArg('output') || 'api-models-report.md';
const BACKEND_URL = 'https://askme-backend-proxy.onrender.com';

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'askme-scout-agent/1.0',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Test backend connectivity
async function testBackendConnectivity() {
  console.log('🔍 Testing backend connectivity...');
  
  const tests = [
    { name: 'Health Check', url: `${BACKEND_URL}/health` },
    { name: 'Provider Status', url: `${BACKEND_URL}/providers` },
    { name: 'Google Provider', url: `${BACKEND_URL}/providers/google/test` },
    { name: 'Mistral Provider', url: `${BACKEND_URL}/providers/mistral/test` },
    { name: 'Cohere Provider', url: `${BACKEND_URL}/providers/cohere/test` },
    { name: 'Groq Provider', url: `${BACKEND_URL}/providers/groq/test` },
    { name: 'OpenRouter Provider', url: `${BACKEND_URL}/providers/openrouter/test` }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`  Testing ${test.name}...`);
      const startTime = Date.now();
      const response = await makeRequest(test.url);
      const endTime = Date.now();
      
      results.push({
        test: test.name,
        status: 'success',
        response_time: endTime - startTime,
        response: response,
        error: null
      });
      
      console.log(`    ✅ ${test.name}: ${endTime - startTime}ms`);
    } catch (error) {
      results.push({
        test: test.name,
        status: 'error',
        response_time: null,
        response: null,
        error: error.message
      });
      
      console.log(`    ❌ ${test.name}: ${error.message}`);
    }
  }

  return results;
}

// Generate validation report
async function generateValidationReport() {
  console.log('📊 Generating validation report...');
  
  // Test backend connectivity
  const connectivityResults = await testBackendConnectivity();
  
  // Load existing validation data
  let validatedModels = [];
  let excludedModels = [];
  let eligibleModels = [];
  
  try {
    const validatedData = JSON.parse(fs.readFileSync('validated_models.json', 'utf8'));
    validatedModels = validatedData.models || [];
  } catch (error) {
    console.warn('⚠️ Could not load validated models:', error.message);
  }
  
  try {
    const excludedData = JSON.parse(fs.readFileSync('excluded_models.json', 'utf8'));
    excludedModels = excludedData.excluded_models || [];
  } catch (error) {
    console.warn('⚠️ Could not load excluded models:', error.message);
  }
  
  try {
    const eligibleData = JSON.parse(fs.readFileSync('api-eligible-models.json', 'utf8'));
    eligibleModels = eligibleData.eligible_models || [];
  } catch (error) {
    console.warn('⚠️ Could not load eligible models:', error.message);
  }

  // Generate report
  const timestamp = new Date().toISOString();
  
  // Build connectivity test results
  const connectivitySection = connectivityResults.map(result => {
    if (result.status === 'success') {
      return `- ✅ **${result.test}**: ${result.response_time}ms`;
    } else {
      return `- ❌ **${result.test}**: ${result.error}`;
    }
  }).join('\n');
  
  // Build provider sections
  const activeProviders = validatedModels.map(model => 
    `- **${model.provider}**: ${model.model_name} (${model.health_status || 'unknown status'})`
  ).join('\n');
  
  const providerPerformance = connectivityResults
    .filter(r => r.test.includes('Provider') && r.status === 'success')
    .map(result => `- **${result.test.replace(' Provider', '')}**: ${result.response_time}ms response time`)
    .join('\n');
  
  const excludedSection = excludedModels.slice(0, 10)
    .map(model => `- **${model.provider}**: ${model.model_name} - ${model.reason}`)
    .join('\n');
  
  const eligibleSection = eligibleModels.slice(0, 10)
    .map((model, index) => `${index + 1}. **${model.provider}/${model.model_name}** (Score: ${model.eligibility_score})`)
    .join('\n');
  
  // Calculate metrics
  const avgResponseTime = connectivityResults
    .filter(r => r.status === 'success' && r.response_time)
    .reduce((sum, r) => sum + r.response_time, 0) / 
    connectivityResults.filter(r => r.status === 'success' && r.response_time).length || 0;
  
  const successRate = ((connectivityResults.filter(r => r.status === 'success').length / connectivityResults.length) * 100).toFixed(1);
  const uniqueProviders = [...new Set(validatedModels.map(m => m.provider))].length;
  
  const report = [
    '# AskMe CLI Model Validation Report',
    '',
    `**Generated:** ${timestamp}`,
    `**Backend URL:** ${BACKEND_URL}`,
    '**Scout Agent Version:** 1.0',
    '',
    '## 🔍 Backend Connectivity Test',
    '',
    connectivitySection,
    '',
    '## 📊 Validation Summary',
    '',
    `- **Total Validated Models:** ${validatedModels.length}`,
    `- **Total Excluded Models:** ${excludedModels.length}`,
    `- **API Eligible Models:** ${eligibleModels.length}`,
    `- **Backend Connectivity:** ${connectivityResults.filter(r => r.status === 'success').length}/${connectivityResults.length} tests passed`,
    '',
    '## 🤖 Provider Status',
    '',
    '### Active Providers',
    '',
    activeProviders,
    '',
    '### Provider Performance',
    '',
    providerPerformance,
    '',
    '## 🚫 Excluded Models',
    '',
    excludedSection,
    '',
    excludedModels.length > 10 ? `*... and ${excludedModels.length - 10} more excluded models*` : '',
    '',
    '## 🏆 Top Eligible Models',
    '',
    eligibleSection,
    '',
    '## 🛠️ Recommendations',
    '',
    '### High Priority',
    connectivityResults.filter(r => r.status === 'error').length > 0 ? 
      '- ⚠️ Fix failing backend connectivity tests' : 
      '- ✅ All backend tests passing',
    '',
    '### Medium Priority',
    '- 🔄 Consider expanding to additional providers if performance metrics support it',
    '- 📈 Monitor provider response times for performance optimization',
    '',
    '### Low Priority',
    '- 📝 Update model validation criteria based on usage patterns',
    '- 🔍 Research new models from existing providers',
    '',
    '## 📈 Metrics',
    '',
    `- **Average Response Time:** ${avgResponseTime}ms`,
    `- **Success Rate:** ${successRate}%`,
    `- **Model Coverage:** ${validatedModels.length} models across ${uniqueProviders} providers`,
    '',
    '---',
    '',
    '*Report generated by Scout Agent - AskMe CLI Model Validation System*'
  ].join('\n');

  return report;
}

// Main debug function
async function main() {
  console.log('🚀 Starting backend debug and validation...');
  
  if (GENERATE_REPORT) {
    console.log('📊 Generating validation report...');
    const report = await generateValidationReport();
    await writeFile(OUTPUT_FILE, report);
    console.log(`✅ Report generated: ${OUTPUT_FILE}`);
  } else {
    // Just test connectivity
    const results = await testBackendConnectivity();
    
    console.log(`\n📊 Backend Test Summary:`);
    console.log(`- Total tests: ${results.length}`);
    console.log(`- Passed: ${results.filter(r => r.status === 'success').length}`);
    console.log(`- Failed: ${results.filter(r => r.status === 'error').length}`);
    console.log(`- Success rate: ${((results.filter(r => r.status === 'success').length / results.length) * 100).toFixed(1)}%`);
    
    if (results.filter(r => r.status === 'error').length > 0) {
      console.log(`\n❌ Failed tests:`);
      results.filter(r => r.status === 'error').forEach(result => {
        console.log(`  - ${result.test}: ${result.error}`);
      });
    }
  }
}

// Run the debug
if (require.main === module) {
  main().catch(error => {
    console.error('Debug failed:', error);
    process.exit(1);
  });
}

module.exports = { testBackendConnectivity, generateValidationReport };
