# Backend Rollback Plan

## Overview
Emergency rollback procedures for askme-backend if scout agent integration causes issues.

## Pre-rollback Preparation

### 1. Current State Backup
Before any deployment, ensure these backups exist:

```bash
# Backup current server.js
cp 300_implementation/askme-backend/server.js server.js.backup

# Create git tag for current state
git tag -a "pre-scout-$(date +%Y%m%d)" -m "Before scout agent integration"

# Export current environment variables
# (From Render.com dashboard → Environment tab)
```

### 2. Rollback Triggers
Initiate rollback if:
- Health endpoints return 500+ errors
- Existing functionality breaks (providers, query endpoints)
- Performance significantly degrades
- Critical dependency issues

## Rollback Procedures

### Option 1: Quick Revert (5 minutes)
**Use when**: Minor issues, recent deployment

1. **Render.com Dashboard**:
   - Go to your service → Deploys tab
   - Click "Redeploy" on last working deployment
   - Monitor logs for successful restart

2. **Environment Variables**:
   - Remove `AGENT_AUTH_TOKEN` temporarily
   - Keep existing API keys intact

### Option 2: Code Rollback (15 minutes)
**Use when**: Code changes causing issues

1. **Git Revert**:
   ```bash
   # Revert to tagged version
   git checkout pre-scout-$(date +%Y%m%d)
   
   # Or revert specific commit
   git revert [commit-hash]
   
   # Push changes
   git push origin main
   ```

2. **Render Auto-deploy**: Service will automatically redeploy

### Option 3: Full Restoration (30 minutes)
**Use when**: Complete failure, data corruption

1. **Restore Original Files**:
   ```bash
   # Restore backed up server.js
   cp server.js.backup 300_implementation/askme-backend/server.js
   
   # Restore original package.json (remove fs-extra)
   git checkout HEAD~1 -- 300_implementation/askme-backend/package.json
   ```

2. **Clean Environment**:
   - Remove all scout agent environment variables
   - Clear any created data directories
   - Reset to minimal configuration

3. **Redeploy from Clean State**

## Verification After Rollback

### Critical Endpoints Test
```bash
# Test original functionality
curl https://your-backend.onrender.com/health
curl https://your-backend.onrender.com/api/providers

# Test original query endpoint
curl -X POST https://your-backend.onrender.com/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "provider": "google"}'
```

### Automated Rollback Test
```bash
# Run verification script
cd askme-backend
node verify-rollback.js
```

## File Changes to Revert

### Modified Files
1. **server.js**: Remove LLM endpoints, authentication middleware
2. **package.json**: Remove fs-extra dependency
3. **Environment**: Remove AGENT_AUTH_TOKEN

### Added Files to Remove
- Any `data/` directories created
- LLM-related configuration files
- Scout agent specific logs

## Original File Contents

### server.js Key Sections
Restore these original sections if needed:

```javascript
// Original imports (without fs-extra)
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

// Original API keys (without AGENT_AUTH_TOKEN)
const API_KEYS = {
  google: process.env.GOOGLE_API_KEY,
  mistral: process.env.MISTRAL_API_KEY,
  llama: process.env.LLAMA_API_KEY
};

// Remove these added sections:
// - authenticateAgent middleware
// - POST /api/llms endpoint
// - GET /api/llms endpoint
// - GET /api/llms/health endpoint
```

### package.json Dependencies
Original dependencies (without fs-extra):
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5", 
    "express-rate-limit": "^7.1.5",
    "axios": "^1.6.2",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "compression": "^1.7.4"
  }
}
```

## Communication Plan

### Internal Team
1. **Immediate**: Notify team of rollback initiation
2. **Progress**: Update on rollback completion
3. **Analysis**: Schedule post-mortem meeting

### Users/Stakeholders
1. **During**: Brief status update if user-facing
2. **After**: Summary of incident and resolution

## Prevention for Next Attempt

### Staging Environment
- Always test in staging first
- Run comprehensive verification
- Load test with realistic data

### Deployment Strategy
- Blue-green deployment if possible
- Feature flags for gradual rollout
- Monitoring and alerting setup

### Rollback Testing
- Practice rollback procedures
- Automate rollback scripts
- Document lessons learned

## Emergency Contacts

### Key Personnel
- **Primary**: Repository owner
- **Secondary**: Backend maintainer
- **Tertiary**: DevOps/Infrastructure team

### Service Providers
- **Render.com**: Support via dashboard
- **Domain/DNS**: Registrar support
- **Monitoring**: Alert system contacts

## Post-Rollback Actions

### Immediate (within 1 hour)
- [ ] Verify all original functionality restored
- [ ] Check performance metrics normal
- [ ] Confirm user access working
- [ ] Document incident details

### Short-term (within 24 hours)
- [ ] Analyze root cause of failure
- [ ] Review rollback effectiveness
- [ ] Plan improved deployment strategy
- [ ] Update rollback procedures if needed

### Medium-term (within 1 week)
- [ ] Conduct post-mortem meeting
- [ ] Update deployment documentation
- [ ] Implement additional safeguards
- [ ] Plan next integration attempt