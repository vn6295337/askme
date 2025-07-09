# GitHub Actions Setup Guide

## Repository Secrets Configuration

### Required Secrets
Add these secrets in your GitHub repository settings → Secrets and variables → Actions:

1. **BACKEND_URL**
   - Value: `https://your-render-app.onrender.com`
   - Description: URL of your deployed askme-backend on Render.com

2. **AGENT_AUTH_TOKEN**
   - Value: `scout-agent-secure-token-2024`
   - Description: Authentication token for agent requests
   - **Note**: Use a strong, unique token in production

### Setup Steps

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the values above

## Workflow Testing

### Manual Trigger
1. Go to Actions tab in your repository
2. Click "LLM Scout Agent" workflow
3. Click "Run workflow"
4. Select branch and enable debug if needed
5. Click "Run workflow"

### Monitoring
- Check workflow status in Actions tab
- Review logs for any errors
- Download artifacts to see discovery results
- Issues will be automatically created on failure

## Deployment Checklist

- [ ] GitHub secrets configured
- [ ] Backend deployed with matching AGENT_AUTH_TOKEN
- [ ] Manual workflow test successful
- [ ] Weekly schedule ready (Sundays 2 AM UTC)
- [ ] Issue notifications working

## Troubleshooting

### Common Issues
1. **Secrets not found**: Verify secret names match exactly
2. **Backend connection failed**: Check BACKEND_URL is correct
3. **Authentication failed**: Ensure AGENT_AUTH_TOKEN matches backend
4. **Dependencies failed**: Check package.json is valid

### Debug Mode
Enable debug mode in manual trigger to get detailed logs.