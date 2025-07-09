# Operations and Maintenance Guide

## Overview
Operational procedures for the LLM Scout Agent production system.

## System Components

### 1. Scout Agent (GitHub Actions)
- **Location**: `.github/workflows/scout-agent.yml`
- **Schedule**: Weekly (Sundays 2 AM UTC)
- **Runtime**: ~5-10 minutes
- **Dependencies**: GitHub, npm packages, external APIs

### 2. Backend Service (Render.com)
- **Service**: askme-backend-production
- **Endpoints**: `/api/llms`, `/api/llms/health`
- **Storage**: JSON files in `data/` directory
- **Dependencies**: Node.js, fs-extra, express

### 3. Data Storage
- **Format**: JSON (`data/llms.json`)
- **Backup**: Timestamped files
- **Retention**: Persistent on Render.com filesystem

## Monitoring and Alerts

### Health Checks

#### Daily Checks (Automated)
```bash
# Backend health
curl -f https://your-backend.onrender.com/health

# LLM system health  
curl -f https://your-backend.onrender.com/api/llms/health

# Data freshness (should be updated weekly)
curl -s https://your-backend.onrender.com/api/llms | jq .metadata.lastUpdated
```

#### Weekly Checks (Manual)
- [ ] Review GitHub Actions workflow status
- [ ] Check discovery results quality
- [ ] Verify new models are being found
- [ ] Monitor API rate limits usage
- [ ] Review error logs and issues

### Key Metrics

#### Success Metrics
- **Discovery Count**: 10-50 new models per week
- **Success Rate**: >95% workflow completion
- **Data Quality**: >90% valid models after filtering
- **API Response**: <2 seconds for backend endpoints

#### Warning Thresholds
- **Zero Models**: No models discovered for 2 weeks
- **High Failure Rate**: >10% workflow failures
- **Stale Data**: No updates for >10 days
- **API Errors**: >5% error rate on backend

#### Alert Triggers
- Automatic GitHub issue creation on workflow failure
- Backend health check failures
- Authentication errors
- Significant drop in discovery count

## Routine Maintenance

### Weekly Tasks
1. **Review Workflow Results**
   - Check GitHub Actions → LLM Scout Agent
   - Download and review discovery artifacts
   - Verify data quality and count

2. **Monitor System Health**
   - Backend service status on Render.com
   - Check for any error logs
   - Verify environment variables intact

3. **Data Quality Check**
   ```bash
   # Check latest models
   curl -s https://your-backend.onrender.com/api/llms?limit=10 | jq '.models[0:5]'
   
   # Verify data structure
   curl -s https://your-backend.onrender.com/api/llms | jq '.metadata'
   ```

### Monthly Tasks
1. **Security Review**
   - Rotate authentication tokens if needed
   - Review GitHub secrets access
   - Check for any security alerts

2. **Performance Analysis**
   - Review workflow execution times
   - Analyze discovery patterns and trends
   - Check API rate limit usage

3. **Dependency Updates**
   - Update npm packages for security
   - Review GitHub Actions versions
   - Test updates in staging first

### Quarterly Tasks
1. **Configuration Review**
   - Update source configurations (`config/sources.json`)
   - Review filtering criteria effectiveness
   - Add new sources if identified

2. **Backup and Recovery**
   - Export current data for backup
   - Test recovery procedures
   - Document any changes

## Troubleshooting Guide

### Common Issues

#### 1. Workflow Fails with "No models discovered"
**Symptoms**: Agent runs successfully but finds 0 models
**Causes**: API rate limits, source changes, filtering too strict
**Resolution**:
```bash
# Check API responses manually
curl "https://api.github.com/search/repositories?q=language:Python+topic:llm"

# Review filtering logic
node src/filters.js --debug

# Temporarily relax filters for testing
```

#### 2. Backend Authentication Errors
**Symptoms**: 401 Unauthorized from `/api/llms` endpoint
**Causes**: Token mismatch, environment variable issues
**Resolution**:
```bash
# Verify tokens match
echo $AGENT_AUTH_TOKEN  # In GitHub secrets
# Compare with Render.com environment variable

# Test authentication
curl -X POST https://your-backend.onrender.com/api/llms \
  -H "Authorization: Bearer $AGENT_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"models":[],"metadata":{}}'
```

#### 3. Data Not Updating
**Symptoms**: `/api/llms` shows old `lastUpdated` timestamp
**Causes**: Workflow not running, backend write failures
**Resolution**:
- Check GitHub Actions workflow status
- Review workflow logs for errors
- Verify backend write permissions
- Check Render.com service logs

#### 4. High Error Rates
**Symptoms**: Many API calls failing
**Causes**: Rate limiting, API changes, network issues
**Resolution**:
- Implement exponential backoff
- Review API documentation changes
- Check GitHub token permissions
- Monitor rate limit headers

### Emergency Procedures

#### System Outage
1. **Immediate Actions**:
   - Check backend service status on Render.com
   - Verify GitHub Actions service status
   - Review recent deployments/changes

2. **Communication**:
   - Update stakeholders on investigation
   - Document incident timeline
   - Post updates on resolution progress

3. **Recovery**:
   - Use rollback procedures if needed
   - Restore from backups if necessary
   - Gradually restore full functionality

#### Data Corruption
1. **Assessment**:
   - Determine scope of corruption
   - Identify root cause
   - Check if backups are available

2. **Recovery**:
   - Stop further data writes
   - Restore from most recent good backup
   - Re-run discovery to rebuild data

3. **Prevention**:
   - Implement data validation checks
   - Increase backup frequency
   - Add integrity monitoring

## Operational Scripts

### Health Check Script
```bash
#!/bin/bash
# health-check.sh - Daily system health verification

BACKEND_URL="https://your-backend.onrender.com"

echo "🏥 LLM Scout Agent Health Check - $(date)"

# Backend health
echo "Checking backend health..."
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    echo "✅ Backend healthy"
else
    echo "❌ Backend unhealthy"
fi

# LLM system health
echo "Checking LLM system..."
HEALTH=$(curl -s "$BACKEND_URL/api/llms/health")
if echo "$HEALTH" | jq -e '.status == "healthy"' > /dev/null; then
    echo "✅ LLM system healthy"
else
    echo "❌ LLM system unhealthy"
fi

# Data freshness
echo "Checking data freshness..."
LAST_UPDATE=$(curl -s "$BACKEND_URL/api/llms" | jq -r '.metadata.lastUpdated')
if [[ -n "$LAST_UPDATE" && "$LAST_UPDATE" != "null" ]]; then
    echo "✅ Data last updated: $LAST_UPDATE"
else
    echo "⚠️ No data update timestamp found"
fi
```

### Manual Discovery Trigger
```bash
#!/bin/bash
# trigger-discovery.sh - Manually trigger discovery run

echo "🚀 Triggering manual LLM discovery..."

gh workflow run scout-agent.yml \
  --ref main \
  -f debug=true

echo "✅ Workflow triggered. Check status at:"
echo "https://github.com/vn6295337/askme/actions"
```

### Data Backup Script
```bash
#!/bin/bash
# backup-data.sh - Backup current LLM data

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
BACKEND_URL="https://your-backend.onrender.com"

echo "💾 Backing up LLM data..."

mkdir -p "$BACKUP_DIR"

# Download current data
curl -s "$BACKEND_URL/api/llms" > "$BACKUP_DIR/llms.json"

# Create metadata
cat > "$BACKUP_DIR/backup-info.json" << EOF
{
  "timestamp": "$(date -u -Iseconds)",
  "source": "$BACKEND_URL",
  "type": "manual_backup"
}
EOF

echo "✅ Backup saved to: $BACKUP_DIR"
```

## Contact Information

### System Owners
- **Primary**: Repository maintainer
- **Secondary**: Backend administrator  
- **Emergency**: On-call engineer

### Service Dependencies
- **GitHub**: github.com/contact
- **Render.com**: help.render.com
- **npm Registry**: npmjs.com/support

### Escalation Procedures
1. **Level 1**: Check documentation and logs
2. **Level 2**: Contact system owners
3. **Level 3**: Engage external service support
4. **Level 4**: Emergency rollback/recovery

## Performance Baselines

### Normal Operation
- Discovery runtime: 5-10 minutes
- Models discovered: 10-50 per week
- Backend response time: <2 seconds
- Error rate: <5%

### Resource Usage
- GitHub Actions minutes: ~40 minutes/month
- Backend memory: <512MB
- Storage: <100MB for data files
- API calls: ~500 requests/week

## Future Improvements

### Monitoring Enhancements
- Real-time dashboards
- Automated anomaly detection
- Slack/email notifications
- Performance trending

### Operational Automation
- Automated health checks
- Self-healing capabilities
- Predictive maintenance
- Capacity planning

### Security Hardening
- Token rotation automation
- Access logging and auditing
- Vulnerability scanning
- Compliance monitoring