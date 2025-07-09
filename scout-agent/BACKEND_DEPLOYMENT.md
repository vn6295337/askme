# Backend Deployment Guide for Render.com

## Overview
Deploy the updated askme-backend with LLM scout agent endpoints to Render.com staging environment.

## Pre-deployment Checklist

### 1. Backend Code Changes ✓
- [x] Added fs-extra dependency to package.json
- [x] Implemented authentication middleware
- [x] Added POST /api/llms endpoint
- [x] Added GET /api/llms endpoint  
- [x] Added GET /api/llms/health endpoint
- [x] Added JSON file storage system

### 2. Required Environment Variables
Add these to your Render.com service:

```bash
# Existing variables (keep these)
GOOGLE_API_KEY=your-google-api-key
MISTRAL_API_KEY=your-mistral-api-key  
LLAMA_API_KEY=your-llama-api-key

# New variables for scout agent
AGENT_AUTH_TOKEN=scout-agent-secure-token-2024
```

## Deployment Steps

### Step 1: Staging Environment Setup
1. Create new Render.com service for staging:
   - Service name: `askme-backend-staging`
   - Environment: `Node`
   - Build command: `npm install`
   - Start command: `npm start`

### Step 2: Deploy Updated Code
1. Push updated backend code to staging branch
2. Connect Render service to staging branch
3. Add environment variables in Render dashboard
4. Deploy service

### Step 3: Verify Deployment
Test these endpoints after deployment:

```bash
# Health check
curl https://askme-backend-staging.onrender.com/health

# LLM health check  
curl https://askme-backend-staging.onrender.com/api/llms/health

# Test LLM endpoint (should return empty data)
curl https://askme-backend-staging.onrender.com/api/llms

# Test providers endpoint (existing)
curl https://askme-backend-staging.onrender.com/api/providers
```

## File Structure Changes

### New Files Created
```
askme-backend/
├── data/              # New directory for LLM data
│   └── llms.json     # Will be created by agent
├── package.json      # Updated with fs-extra
└── server.js         # Updated with new endpoints
```

### Storage Directory
The backend will create a `data/` directory for storing LLM discovery results:
- `data/llms.json` - Main LLM data file
- Persistent across deployments on Render.com

## Testing the Deployment

### 1. Basic Functionality Test
```bash
# Test script for staging deployment
cd askme-backend

# Test health endpoint
curl -f https://askme-backend-staging.onrender.com/health || echo "Health check failed"

# Test LLM health  
curl -f https://askme-backend-staging.onrender.com/api/llms/health || echo "LLM health failed"

# Test authentication (should fail without token)
curl -X POST https://askme-backend-staging.onrender.com/api/llms \
  -H "Content-Type: application/json" \
  -d '{"models": []}' || echo "Auth test passed (expected to fail)"
```

### 2. Agent Integration Test
```bash
# Test with proper authentication
curl -X POST https://askme-backend-staging.onrender.com/api/llms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer scout-agent-secure-token-2024" \
  -d '{
    "models": [
      {
        "name": "Test Model",
        "publisher": "Test Org", 
        "country": "US"
      }
    ],
    "metadata": {
      "agentVersion": "1.0.0",
      "runId": "test-123"
    }
  }'
```

## Rollback Plan

### If Deployment Fails
1. **Immediate Rollback**:
   - Revert to previous commit in Render dashboard
   - Or switch back to main branch

2. **Environment Variables**:
   - Remove AGENT_AUTH_TOKEN if causing issues
   - Keep existing API keys intact

3. **Code Rollback**:
   - Create backup of current server.js
   - Restore previous version without LLM endpoints

### Backup Current State
```bash
# Before deployment, backup current state
cp server.js server.js.backup
git tag -a "pre-scout-agent" -m "Before scout agent integration"
```

## Production Deployment

After staging verification:

1. **Create Production Service**:
   - Service name: `askme-backend-production`
   - Connect to main branch
   - Add production environment variables

2. **DNS/Domain Setup**:
   - Update domain to point to production service
   - Update BACKEND_URL in GitHub secrets

3. **Monitor Initial Deployment**:
   - Check logs for any errors
   - Verify all endpoints respond correctly
   - Test agent integration

## Troubleshooting

### Common Issues
1. **Environment Variables Not Set**: Check Render dashboard settings
2. **File Permissions**: Ensure data directory is writable
3. **Authentication Errors**: Verify AGENT_AUTH_TOKEN matches
4. **JSON Storage Errors**: Check available disk space

### Debug Commands
```bash
# Check environment variables
curl https://your-backend.onrender.com/health

# Check LLM system status
curl https://your-backend.onrender.com/api/llms/health

# View recent logs in Render dashboard
```