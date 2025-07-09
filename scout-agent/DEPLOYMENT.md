# LLM Scout Agent Deployment Guide

## Overview
This guide covers deployment of the LLM Scout Agent for the askme-cli project.

## Prerequisites
- Node.js 18+ installed
- GitHub repository with Actions enabled
- Render.com account for backend hosting
- Environment variables configured

## Environment Variables

### Required Variables
```bash
BACKEND_URL=https://your-render-app.onrender.com
AGENT_AUTH_TOKEN=your-secure-token-here
```

### Optional Variables
```bash
GITHUB_TOKEN=your-github-token  # For higher API rate limits
DEBUG=false                     # Enable debug logging
```

## GitHub Actions Setup

### 1. Configure Repository Secrets
Go to your GitHub repository settings → Secrets and variables → Actions

Add these secrets:
- `BACKEND_URL`: Your Render.com backend URL
- `AGENT_AUTH_TOKEN`: Secure token for agent authentication

### 2. Workflow Configuration
The workflow file `.github/workflows/scout-agent.yml` is already configured to:
- Run weekly on Sundays at 2 AM UTC
- Allow manual triggering
- Upload discovery results as artifacts
- Create issues on failure

### 3. Testing the Workflow
```bash
# Trigger manually from GitHub Actions tab
# Or use GitHub CLI:
gh workflow run scout-agent.yml
```

## Backend Deployment

### 1. Render.com Setup
- Deploy the updated backend with LLM endpoints
- Add environment variable: `AGENT_AUTH_TOKEN`
- Ensure `data/` directory is writable

### 2. API Endpoints
The backend now includes:
- `POST /api/llms` - Agent data submission (authenticated)
- `GET /api/llms` - Public data retrieval
- `GET /api/llms/health` - Health check

### 3. Authentication
Agent requests require Bearer token authentication:
```
Authorization: Bearer <AGENT_AUTH_TOKEN>
```

## Local Development

### 1. Install Dependencies
```bash
cd scout-agent
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run Tests
```bash
npm test
npm test -- --coverage  # With coverage report
```

### 4. Manual Execution
```bash
# Run discovery once
npm run start

# Run with scheduler
npm run schedule
```

## Monitoring

### 1. GitHub Actions
- Check weekly run status in Actions tab
- Review uploaded artifacts for discovery results
- Monitor for failure notifications

### 2. Backend Health
```bash
curl https://your-backend.onrender.com/api/llms/health
```

### 3. Data Validation
```bash
curl https://your-backend.onrender.com/api/llms
```

## Troubleshooting

### Common Issues

1. **Agent authentication failed**
   - Verify `AGENT_AUTH_TOKEN` matches backend configuration
   - Check Authorization header format

2. **No models discovered**
   - Check API rate limits
   - Verify source configurations in `config/sources.json`
   - Review filtering logic

3. **Backend connection failed**
   - Verify `BACKEND_URL` is correct
   - Check backend service status
   - Ensure network connectivity

### Debugging

1. **Enable debug mode**
   ```bash
   DEBUG=true npm run start
   ```

2. **Check logs**
   - GitHub Actions logs
   - Backend application logs
   - Local execution logs

3. **Test individual components**
   ```bash
   npm test -- --testNamePattern="specific test"
   ```

## Maintenance

### 1. Regular Updates
- Update source configurations as needed
- Review and update filtering logic
- Monitor for deprecated APIs

### 2. Security
- Rotate authentication tokens regularly
- Review API permissions
- Update dependencies

### 3. Performance
- Monitor discovery execution time
- Review rate limiting settings
- Optimize data storage

## Next Steps
After successful deployment:
1. Monitor first few weekly runs
2. Validate data quality
3. Plan CLI integration (next phase)
4. Consider additional data sources