# Geographic Model Filtering

The Scout Agent implements strict geographic filtering to **only include models from US, Canada, and European origins**. All models from other regions are excluded by default.

## ✅ Inclusion Criteria (Allowlist Approach)

### Allowed Regions

**North America:**
- **United States:** OpenAI, Anthropic, Google, Microsoft, Meta, Tesla, NVIDIA, Together AI, Replicate, Groq
- **Canada:** Cohere

**Europe:**
- **United Kingdom:** DeepMind, Stability AI
- **France:** Mistral AI, Hugging Face
- **Germany:** Aleph Alpha
- **Israel:** AI21 Labs (included as approved Western-aligned)
- **Other EU Countries:** Netherlands, Switzerland, Norway, Sweden, Denmark, Finland, Ireland, Belgium, Austria, Italy, Spain, Portugal

### Approved Companies
Pre-verified companies with confirmed Western origins:
- **US:** OpenAI, Anthropic, Google, Microsoft, Meta, Tesla, NVIDIA, Together, Replicate, Groq, AI21, Scale AI, Databricks
- **Canada:** Cohere
- **Europe:** Mistral, Hugging Face, DeepMind, Stability AI, Aleph Alpha

### Western Model Patterns
Common naming patterns indicating Western origin:
- GPT series, Claude, Gemini, LLaMA, Mistral, Alpaca
- Vicuna, Wizard, Orca, FLAN, T5, BERT, RoBERTa
- BLOOM, OPT, Galactica, Codex

## 🚫 Exclusion Criteria

### Excluded Regions/Countries
Models from these regions are automatically excluded:
- **Asia:** China, Japan, Korea, India, Singapore, Saudi Arabia, UAE, Qatar
- **Other Americas:** Brazil, Mexico, Argentina
- **Other:** Russia, Iran, North Korea, Belarus, Myanmar, Syria, Venezuela, Cuba, Sudan

### Excluded Model Patterns
Specific models/patterns known to be non-Western:
- **Chinese:** Qwen, ERNIE, ChatGLM, Baidu, Alibaba, Tencent, DeepSeek, Yi, InternLM, Baichuan, BELLE, MOSS
- **Russian:** Yandex, Sber, GigaChat
- **Other Non-Western:** Various regional language models

### Language Pattern Exclusions
Models containing non-Western language characters:
```javascript
excludedLanguagePatterns: [
  /[\u4e00-\u9fff]/, // Chinese characters
  /[\u0400-\u04ff]/, // Cyrillic (Russian)
  /[\u3040-\u309f]/, // Hiragana (Japanese)
  /[\u30a0-\u30ff]/, // Katakana (Japanese)
  /[\uac00-\ud7af]/  // Hangul (Korean)
]
```

## 🔍 Detection Methods

### 1. Approved Company Matching (High Confidence)
```javascript
approvedCompanies: [
  'openai', 'anthropic', 'google', 'microsoft', 'cohere',
  'mistral', 'huggingface', 'deepmind', 'stability'
]
```

### 2. Regional Indicator Matching
```javascript
allowedRegions: {
  'united states': ['us', 'usa', 'america', 'openai', 'anthropic'],
  'france': ['fr', 'french', 'mistral', 'huggingface'],
  'canada': ['ca', 'canadian', 'cohere']
}
```

### 3. Western Model Pattern Recognition
```javascript
westernPatterns: [
  /\bgpt-/i, /\bclaude/i, /\bgemini/i, /\bllama/i, /\bmistral/i
]
```

### 4. Default to Exclusion
If geographic origin cannot be clearly determined as Western, the model is excluded for safety.

## 📊 Validation Output

### Validated Models
Models that pass geographic filtering include:
```json
{
  "model_name": "gpt-4",
  "provider": "OpenRouter",
  "geographic_origin_verified": true,
  "allowed_region": true,
  "origin_reason": "Approved company identified",
  "documentation_url": "https://openrouter.ai/docs"
}
```

### Excluded Models
Models rejected due to geographic restrictions:
```json
{
  "model_name": "qwen-turbo",
  "provider": "Together AI",
  "reason": "Geographic restriction: Model from excluded list detected"
}
```

## 🌍 Provider-Specific Considerations

### High-Risk Providers
Providers that commonly host non-Western models:

**Hugging Face:**
- Hosts models from global community including Asia
- Requires filtering by model author and geographic tags
- Checks model repository descriptions for origin indicators

**Replicate:**
- Community-uploaded models from worldwide developers
- May include Asian, Russian, or other non-Western variants
- Validates model owner and description fields for geographic indicators

**Together AI:**
- Aggregates models from multiple global sources
- May include non-Western LLaMA variants and fine-tunes
- Applies comprehensive geographic filtering

### Lower-Risk Providers
Providers with primarily Western-origin models:

**Gemini (Google):** US-developed models only
**Mistral:** French company, European models
**Cohere:** Canadian company, proprietary models
**Groq:** US infrastructure, curated Western model selection
**OpenRouter:** Tends to filter out non-Western providers
**AI21 Labs:** Israeli company, Jurassic series

## 📈 Filtering Statistics

The validation process reports:
- Total models checked across all providers
- Number of models excluded due to geographic restrictions
- Breakdown by exclusion reason
- Provider-specific filtering results

```
✅ Validation complete:
- Total models checked: 127
- Validated models (US/Canada/Europe only): 89
- Excluded models: 38
  - Geographic restrictions: 23
  - Other reasons: 15
```

Example metadata output:
```json
{
  "geographic_filtering": {
    "enabled": true,
    "allowed_regions": ["United States", "Canada", "Europe"],
    "geographic_exclusions": 23,
    "geographic_exclusion_rate": "18.1%",
    "other_exclusions": 15
  }
}
```

## 🔄 Maintenance

### Regular Updates
The geographic allowlist requires periodic updates:

1. **New Companies:** Monitor emerging AI companies globally and verify their origins
2. **Model Name Changes:** Track rebranding and new releases from both allowed and excluded regions
3. **Acquisition Monitoring:** Watch for acquisitions that might change company geographic control
4. **Partnership Filtering:** Identify Western models with significant non-Western development partnerships

### Data Sources for Updates
- Global AI company announcements and funding news
- Model leaderboards (e.g., Chatbot Arena, LMSYS) with origin tracking
- Academic paper publications from various international institutions
- Venture capital and investment announcements
- Open source model repositories with contributor analysis

### Validation Accuracy
To ensure filtering accuracy:
- Test with known non-Western models (should be excluded)
- Test with known US/Canada/European models (should be included)
- Monitor false positives (Western models incorrectly excluded)
- Monitor false negatives (non-Western models incorrectly included)
- Regular geographic database audits

## 🚨 Emergency Procedures

### New Non-Western Model Detection
1. Add to `excludedModels` array immediately
2. Update pattern matching if new naming convention detected
3. Trigger validation to update model lists
4. Document discovery for future reference

### False Positive Handling (Western Models Incorrectly Excluded)
1. Investigate why legitimate Western model was excluded
2. Add to `approvedCompanies` list if from verified Western company
3. Adjust filtering logic if necessary
4. Re-run validation to include valid models
5. Update documentation with edge cases

### False Negative Handling (Non-Western Models Incorrectly Included)
1. Immediately add problematic models to exclusion lists
2. Update geographic indicators if new patterns discovered
3. Re-run validation to exclude unauthorized models
4. Review and strengthen filtering criteria

### Acquisition Scenarios
If non-Western entity acquires Western AI company:
1. Move company from approved to excluded list
2. Identify all affected model families
3. Update provider configurations
4. Re-run validation and communicate changes

### New Country/Region Considerations
When evaluating new regions for inclusion:
1. Assess geopolitical alignment with US/Canada/Europe
2. Evaluate data privacy and security regulations
3. Review potential technology transfer concerns
4. Update allowlist only after thorough vetting

This comprehensive geographic filtering ensures the askme CLI only includes models from US, Canada, and European sources, maintaining strict compliance with Western-origin requirements while maximizing access to available allied AI capabilities.