// Production environment variables and secrets validation
const fs = require('fs');

console.log('🔐 Validating Production Environment Variables and Secrets');

// Required environment variables
const REQUIRED_ENV_VARS = {
  // Backend configuration
  'BACKEND_URL': {
    description: 'Backend URL for agent communication',
    example: 'https://your-app.onrender.com',
    required: true,
    validation: (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && url.hostname.length > 0;
      } catch {
        return false;
      }
    }
  },
  
  // Authentication
  'AGENT_AUTH_TOKEN': {
    description: 'Authentication token for agent requests',
    example: 'scout-agent-secure-token-2024',
    required: true,
    validation: (value) => value && value.length >= 20 && !value.includes('your-')
  },
  
  // Optional
  'GITHUB_TOKEN': {
    description: 'GitHub token for higher API rate limits',
    example: 'ghp_xxxxxxxxxxxxxxxxxxxx',
    required: false,
    validation: (value) => !value || value.startsWith('ghp_')
  },
  
  'DEBUG': {
    description: 'Enable debug logging',
    example: 'false',
    required: false,
    validation: (value) => !value || ['true', 'false'].includes(value.toLowerCase())
  }
};

// GitHub Secrets configuration
const GITHUB_SECRETS = {
  'BACKEND_URL': 'Backend URL for production deployment',
  'AGENT_AUTH_TOKEN': 'Secure authentication token for agent'
};

// API Keys for 9 approved providers
const API_KEYS = {
  'GEMINI_API_KEY': 'Google Gemini API key',
  'MISTRAL_API_KEY': 'Mistral AI API key',
  'TOGETHER_API_KEY': 'Together.ai API key for LLaMA models',
  'COHERE_API_KEY': 'Cohere API key for conversational AI',
  'GROQ_API_KEY': 'Groq API key for ultra-fast inference',
  'HUGGINGFACE_API_KEY': 'HuggingFace API token for community models',
  'OPENROUTER_API_KEY': 'OpenRouter API key for multi-provider access',
  'AI21_API_KEY': 'AI21 Studio API key for Jurassic models',
  'REPLICATE_API_TOKEN': 'Replicate API token for model hosting'
};

// Render.com environment variables
const RENDER_ENV_VARS = {
  // API keys for approved providers
  ...API_KEYS,
  
  // New for scout agent
  'AGENT_AUTH_TOKEN': 'Scout agent authentication token'
};

function validateEnvironmentVariable(name, config, value) {
  const result = {
    name,
    value: value ? '***REDACTED***' : undefined,
    required: config.required,
    present: !!value,
    valid: false,
    issues: []
  };
  
  if (!value) {
    if (config.required) {
      result.issues.push('Required variable is missing');
    }
    return result;
  }
  
  if (config.validation) {
    result.valid = config.validation(value);
    if (!result.valid) {
      result.issues.push('Value format is invalid');
    }
  } else {
    result.valid = true;
  }
  
  // Security checks
  if (value.includes('your-') || value.includes('example') || value.includes('test')) {
    result.issues.push('Appears to be placeholder value');
    result.valid = false;
  }
  
  if (name.includes('TOKEN') || name.includes('KEY')) {
    if (value.length < 20) {
      result.issues.push('Token/key appears too short for security');
      result.valid = false;
    }
  }
  
  return result;
}

function generateSecureToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = 'scout-agent-';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function checkAPIKeys() {
  console.log('\\n🔑 API Keys Check:');
  
  let availableProviders = 0;
  const keyResults = [];
  
  Object.entries(API_KEYS).forEach(([keyName, description]) => {
    const value = process.env[keyName];
    const present = !!value;
    const valid = present && value.length > 10 && !value.includes('your-') && !value.includes('example');
    
    if (valid) {
      availableProviders++;
    }
    
    keyResults.push({
      name: keyName,
      description,
      present,
      valid
    });
    
    const status = valid ? '✅' : (present ? '⚠️' : '❌');
    console.log(`  ${status} ${keyName}: ${present ? 'Set' : 'Not set'}`);
    
    if (present && !valid) {
      console.log(`      Issue: API key appears to be invalid or placeholder`);
    }
  });
  
  console.log(`\\n  📊 Available providers: ${availableProviders}/${Object.keys(API_KEYS).length}`);
  
  return { availableProviders, keyResults };
}

function checkLocalEnvironment() {
  console.log('\\n📋 Local Environment Check:');
  
  // Load .env file if it exists
  let envVars = {};
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    console.log('  ✓ .env file found and loaded');
  } else {
    console.log('  ⚠️  .env file not found (using process.env)');
  }
  
  // Combine with process.env
  envVars = { ...envVars, ...process.env };
  
  let allValid = true;
  const results = [];
  
  Object.entries(REQUIRED_ENV_VARS).forEach(([name, config]) => {
    const value = envVars[name];
    const result = validateEnvironmentVariable(name, config, value);
    results.push(result);
    
    const status = result.valid ? '✅' : (result.required ? '❌' : '⚠️');
    console.log(`  ${status} ${name}: ${result.present ? 'Set' : 'Not set'}`);
    
    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        console.log(`      Issue: ${issue}`);
      });
    }
    
    if (result.required && !result.valid) {
      allValid = false;
    }
  });
  
  return { allValid, results };
}

function generateProductionGuide() {
  console.log('\\n📝 Production Setup Guide:');
  
  console.log('\\n1. GitHub Repository Secrets:');
  console.log('   Go to: Settings → Secrets and variables → Actions');
  console.log('   Add these secrets:');
  
  Object.entries(GITHUB_SECRETS).forEach(([name, description]) => {
    console.log(`   - ${name}: ${description}`);
  });
  
  console.log('\\n2. Render.com Environment Variables:');
  console.log('   Go to: Your service → Environment tab');
  console.log('   Set these variables:');
  
  Object.entries(RENDER_ENV_VARS).forEach(([name, description]) => {
    console.log(`   - ${name}: ${description}`);
  });
  
  console.log('\\n3. Secure Token Generation:');
  const sampleToken = generateSecureToken();
  console.log(`   Sample AGENT_AUTH_TOKEN: ${sampleToken}`);
  console.log('   ⚠️  Generate a new unique token for production!');
  
  console.log('\\n4. Backend URL Format:');
  console.log('   Production: https://your-app.onrender.com');
  console.log('   Staging: https://your-app-staging.onrender.com');
  console.log('   ⚠️  Ensure both GitHub and Render use the same values!');
}

function validateURLConnectivity(url) {
  return new Promise((resolve) => {
    const https = require('https');
    const http = require('http');
    
    try {
      const urlObj = new URL(url);
      const requestModule = urlObj.protocol === 'https:' ? https : http;
      
      const req = requestModule.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: '/health',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        resolve({
          success: true,
          status: res.statusCode,
          accessible: res.statusCode < 500
        });
      });
      
      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          accessible: false
        });
      });
      
      req.on('timeout', () => {
        resolve({
          success: false,
          error: 'Connection timeout',
          accessible: false
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        success: false,
        error: error.message,
        accessible: false
      });
    }
  });
}

async function testConnectivity() {
  console.log('\\n🌐 Connectivity Tests:');
  
  const backendUrl = process.env.BACKEND_URL;
  if (backendUrl && !backendUrl.includes('your-')) {
    console.log(`  Testing connection to: ${backendUrl}`);
    const result = await validateURLConnectivity(backendUrl);
    
    if (result.accessible) {
      console.log('  ✅ Backend is accessible');
      console.log(`     Status: ${result.status}`);
    } else {
      console.log('  ❌ Backend is not accessible');
      console.log(`     Error: ${result.error}`);
    }
  } else {
    console.log('  ⚠️  No valid backend URL to test');
  }
}

function checkSecurityBestPractices() {
  console.log('\\n🔒 Security Best Practices Check:');
  
  const practices = [
    {
      name: 'Unique tokens',
      check: () => {
        const token = process.env.AGENT_AUTH_TOKEN;
        return !token || (!token.includes('test') && !token.includes('example') && !token.includes('default'));
      },
      advice: 'Use unique, randomly generated tokens'
    },
    {
      name: 'HTTPS URLs',
      check: () => {
        const url = process.env.BACKEND_URL;
        return !url || url.startsWith('https://');
      },
      advice: 'Always use HTTPS for backend URLs'
    },
    {
      name: 'No hardcoded secrets',
      check: () => {
        // Check if any JS files contain potential secrets
        try {
          const files = ['src/index.js', 'src/crawler.js', 'src/reporter.js'];
          for (const file of files) {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file, 'utf8');
              if (content.includes('your-') || content.includes('secret') || content.includes('token')) {
                return false;
              }
            }
          }
          return true;
        } catch {
          return true; // If we can't check, assume it's okay
        }
      },
      advice: 'Never hardcode secrets in source code'
    }
  ];
  
  practices.forEach(practice => {
    const passed = practice.check();
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${practice.name}`);
    if (!passed) {
      console.log(`      Advice: ${practice.advice}`);
    }
  });
}

// Main validation function
async function runValidation() {
  console.log('Starting production environment validation...\\n');
  
  // Check local environment
  const localCheck = checkLocalEnvironment();
  
  // Check API keys for approved providers
  const apiCheck = checkAPIKeys();
  
  // Test connectivity
  await testConnectivity();
  
  // Security check
  checkSecurityBestPractices();
  
  // Generate setup guide
  generateProductionGuide();
  
  // Summary
  console.log('\\n' + '='.repeat(60));
  console.log('📊 Validation Summary:');
  console.log('='.repeat(60));
  
  const hasMinimumProviders = apiCheck.availableProviders >= 3;
  const allSystemsValid = localCheck.allValid && hasMinimumProviders;
  
  if (allSystemsValid) {
    console.log('✅ All required environment variables are valid');
    console.log(`✅ ${apiCheck.availableProviders} API providers available`);
    console.log('🚀 Ready for production deployment!');
  } else {
    if (!localCheck.allValid) {
      console.log('❌ Some required environment variables are missing or invalid');
    }
    if (!hasMinimumProviders) {
      console.log(`❌ Insufficient API providers (${apiCheck.availableProviders}/9 available, minimum 3 required)`);
    }
    console.log('⚠️  Please fix issues before production deployment');
  }
  
  console.log('\\n📋 Next Steps:');
  console.log('1. Set up GitHub repository secrets');
  console.log('2. Configure Render.com environment variables');
  console.log('3. Test manual workflow trigger');
  console.log('4. Monitor first automated run');
  
  process.exit(allSystemsValid ? 0 : 1);
}

// Run validation
runValidation().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});