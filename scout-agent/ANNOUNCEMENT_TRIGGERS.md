# Announcement-Driven Model Validation

The Scout Agent now responds to real-world model announcements instead of running on a fixed schedule. This ensures validation happens when it matters most.

## 🚀 Trigger Methods

### 1. Manual Trigger (Recommended for Immediate Response)

**Use Cases:**
- New model announcements from providers
- Model deprecation notices
- API changes or updates
- Emergency validation needs

**How to Trigger:**
1. Go to GitHub Actions → Scout Agent - Model Validation
2. Click "Run workflow"
3. Select trigger reason:
   - `New model announcement`
   - `Model deprecation notice`
   - `API changes/updates`
   - `Provider service changes`
   - `Emergency validation`
4. Optionally specify a provider to focus on
5. Add announcement URL if available

**Example:**
```
Trigger Reason: New model announcement
Provider: Gemini
Announcement URL: https://ai.google.dev/models/gemini-2.0-flash
```

### 2. Issue-Based Triggers

**Use Cases:**
- Community-reported model changes
- Discussion about provider updates
- Documentation of breaking changes

**How to Trigger:**
Create a GitHub issue with model-related keywords in the title:
- "model", "deprecat", "updat", "new", "announc", "api"

**Examples:**
- "New Mistral model announced: Mixtral-8x22B"
- "OpenAI deprecating GPT-3.5 models"
- "Cohere API updates affecting model access"

### 3. External Webhook Triggers

**Use Cases:**
- Automated monitoring systems
- RSS feed watchers
- Third-party announcement aggregators

**Webhook Endpoint:**
```
POST /repos/{owner}/{repo}/dispatches
Authorization: token YOUR_GITHUB_TOKEN
```

**Payload Examples:**
```json
{
  "event_type": "model-announcement",
  "client_payload": {
    "provider": "Anthropic",
    "announcement": "Claude 3.5 Sonnet now available",
    "url": "https://www.anthropic.com/news/claude-3-5-sonnet"
  }
}
```

```json
{
  "event_type": "api-deprecation",
  "client_payload": {
    "provider": "OpenAI",
    "deprecated_models": ["gpt-3.5-turbo-0301"],
    "deprecation_date": "2024-06-13"
  }
}
```

## 📊 Validation Context

Each validation run includes metadata about what triggered it:

```json
{
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "trigger": "workflow_dispatch",
    "reason": "New model announcement",
    "specific_provider": "Gemini",
    "announcement_url": "https://ai.google.dev/models/gemini-2.0-flash",
    "providers_validated": ["Gemini"],
    "total_validated_models": 12,
    "validation_summary": {
      "Gemini": {
        "validated": 12,
        "excluded": 2,
        "available": true
      }
    }
  }
}
```

## 🔄 Monitoring Provider Announcements

### Official Announcement Channels

**Gemini (Google):**
- Blog: https://ai.google.dev/blog
- API Updates: https://ai.google.dev/models
- Discord: Google AI Discord

**Mistral:**
- Blog: https://mistral.ai/news/
- Twitter: @MistralAI
- Discord: Mistral AI Discord

**Together AI:**
- Blog: https://www.together.ai/blog
- Twitter: @togethercompute
- Models: https://api.together.xyz/models

**Cohere:**
- Blog: https://cohere.com/blog
- Twitter: @CohereAI
- Changelog: https://docs.cohere.com/changelog

**Groq:**
- Blog: https://groq.com/news/
- Twitter: @GroqInc
- Console: https://console.groq.com/docs/models

**Hugging Face:**
- Blog: https://huggingface.co/blog
- Twitter: @huggingface
- Model Hub: https://huggingface.co/models

**OpenRouter:**
- Discord: OpenRouter Discord
- Models: https://openrouter.ai/models
- Twitter: @OpenRouterAI

**AI21 Labs:**
- Blog: https://www.ai21.com/blog
- Twitter: @AI21Labs
- Documentation: https://docs.ai21.com/changelog

**Replicate:**
- Blog: https://replicate.com/blog
- Twitter: @replicate
- Explore: https://replicate.com/explore

### Setting Up RSS/Webhook Monitoring

1. **RSS Feed Aggregator:** Use tools like Zapier or IFTTT to monitor provider blogs
2. **Twitter Monitoring:** Set up Twitter alerts for provider accounts
3. **Discord Bots:** Create bots to monitor provider Discord channels
4. **GitHub Actions:** Use scheduled workflows to check for RSS updates

### Example RSS Monitoring Workflow

```yaml
name: Monitor Provider Announcements
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  
jobs:
  check-announcements:
    runs-on: ubuntu-latest
    steps:
    - name: Check RSS feeds
      run: |
        # Check each provider's RSS feed
        # If new posts contain model keywords, trigger validation
        curl -X POST \
          -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
          -H "Accept: application/vnd.github.v3+json" \
          https://api.github.com/repos/${{ github.repository }}/dispatches \
          -d '{"event_type":"model-announcement","client_payload":{"provider":"Gemini","announcement":"New model detected"}}'
```

## 🔍 Best Practices

1. **Immediate Response:** Trigger validation within hours of major announcements
2. **Provider Focus:** Use specific provider validation for targeted updates
3. **Documentation:** Always include announcement URLs when available
4. **Verification:** Check results to ensure new models are properly detected
5. **Rollback Plan:** Keep previous validation results for comparison

## 🚨 Emergency Procedures

**When a Provider Goes Down:**
1. Use emergency validation to confirm impact
2. Check excluded_models.json for connection errors
3. Update documentation if extended outage

**When Models Are Deprecated:**
1. Trigger validation with deprecation notice
2. Review affected models in excluded_models.json
3. Update askme CLI to handle deprecated models gracefully

**When New Models Are Released:**
1. Trigger validation with new model announcement
2. Verify models appear in validated_models.json
3. Test integration with askme CLI
4. Update user documentation if needed

This system ensures the askme CLI stays current with the rapidly evolving LLM landscape by responding to real-world events rather than arbitrary schedules.