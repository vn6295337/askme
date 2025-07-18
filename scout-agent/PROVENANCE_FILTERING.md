# Geographic Model Filtering

The Scout Agent implements geographic filtering to **include models from North American and European economic regions**. 

## ✅ Approved Regions & Companies

### Allowed Geographic Regions

**North America:**
- Major technology companies: OpenAI, Anthropic, Google, Microsoft, Meta, Tesla, NVIDIA, Together AI, Replicate, Groq, Cohere

**Europe:**
- Western European companies: DeepMind, Stability AI, Mistral AI, Hugging Face, Aleph Alpha
- European economic area entities and research institutions
- Mediterranean economic region: AI21 Labs

### Approved Companies
Pre-verified companies from approved economic regions:
- **North American:** OpenAI, Anthropic, Google, Microsoft, Meta, Tesla, NVIDIA, Together, Replicate, Groq, Cohere, Scale AI, Databricks
- **European:** Mistral, Hugging Face, DeepMind, Stability AI, Aleph Alpha, AI21

### Approved Model Patterns
Common naming patterns for included models:
- **OpenAI:** GPT series, Codex
- **Anthropic:** Claude series  
- **Google:** Gemini, FLAN, T5, BERT, RoBERTa
- **Meta:** LLaMA, OPT
- **Mistral:** Mistral series
- **Microsoft:** Various fine-tuned models
- **Community:** Alpaca, Vicuna, Wizard, Orca (approved region fine-tunes)
- **Research:** BLOOM, Galactica (approved region research models)

## 🔍 Validation Methods

### 1. Approved Company Verification
Models from pre-verified North American and European companies:
```javascript
approvedCompanies: [
  'openai', 'anthropic', 'google', 'microsoft', 'cohere',
  'mistral', 'huggingface', 'deepmind', 'stability', 'ai21'
]
```

### 2. Regional Origin Verification
Models with clear approved region indicators:
```javascript
allowedRegions: {
  'north america': ['na', 'american', 'openai', 'anthropic', 'cohere'],
  'europe': ['eu', 'european', 'mistral', 'huggingface'],
  'mediterranean': ['ai21']
}
```

### 3. Approved Model Pattern Recognition
Recognition of established approved region model families:
```javascript
approvedPatterns: [
  /\bgpt-/i, /\bclaude/i, /\bgemini/i, /\bllama/i, /\bmistral/i
]
```

## 📊 Validation Output

### Validated Models
Models that pass verification include:
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

### Validation Metadata
Tracking information for approved models:
```json
{
  "geographic_filtering": {
    "enabled": true,
    "allowed_regions": ["North America", "Europe"],
    "approved_models": 89,
    "verification_rate": "100%"
  }
}
```

## 🌍 Provider Assessment

### Approved Provider Categories

**Tier 1 - Direct Company APIs:**
- **Gemini (Google):** North American-developed models
- **Mistral:** European company, regional models  
- **Cohere:** North American company, proprietary models
- **AI21 Labs:** Mediterranean economic region, Jurassic series
- **Groq:** North American infrastructure, curated model selection

**Tier 2 - Platform Providers:**
- **OpenRouter:** Multi-provider platform with verification
- **Together AI:** Aggregated models with origin filtering
- **Hugging Face:** Community platform with origin verification
- **Replicate:** Model hosting with provenance checking

### Verification Process
All providers undergo validation to ensure:
- Model origin transparency
- Proper geographic attribution  
- Access to approved region models only
- Clear documentation and provenance tracking

## 📈 Validation Statistics

The validation process reports approved models:
- Total models verified across all providers
- Approved models from designated economic regions
- Provider-specific validation results
- Geographic origin verification rates

```
✅ Validation complete:
- Total models verified: 89
- Approved models (North America/Europe): 89
- Verification rate: 100%
- Providers with approved models: 9/9
```

Example metadata output:
```json
{
  "geographic_filtering": {
    "enabled": true,
    "allowed_regions": ["North America", "Europe"],
    "approved_models": 89,
    "verification_success_rate": "100%",
    "providers_validated": 9
  }
}
```

## 🔄 Maintenance

### Regular Updates
The approved regions list requires periodic updates:

1. **New Companies:** Monitor emerging AI companies in designated economic regions
2. **Model Releases:** Track new releases from approved companies and regions
3. **Company Verification:** Verify geographic origins of new AI companies
4. **Partnership Assessment:** Monitor partnerships to ensure continued compliance

### Data Sources for Updates
- AI company announcements from approved economic regions
- Model leaderboards with verified company origins
- Academic publications from designated regions
- Industry reports on approved region AI development
- Official company documentation and registration records

### Validation Accuracy
To ensure accurate approval:
- Verify all approved models have clear approved region provenance
- Regular audits of approved company lists
- Continuous monitoring of model origin verification
- Update approval criteria based on new company formations

## 🔄 Operational Procedures

### New Approved Model Integration
1. Verify company origin in designated economic regions
2. Add to `approvedCompanies` list if from verified region
3. Update pattern matching for new naming conventions
4. Trigger validation to include new approved models
5. Document addition for future reference

### Company Verification Process
1. Research company headquarters and primary development locations
2. Verify alignment with approved economic regions
3. Add to approved companies list if verification passes
4. Update regional indicators as needed
5. Re-run validation to include newly approved models

### Model Addition Workflow
When new models from approved companies are released:
1. Automatic inclusion if from pre-approved company
2. Pattern recognition for established model families
3. Manual verification for new company subsidiaries
4. Documentation update for new model patterns

### Partnership Evaluation
For models developed through partnerships:
1. Verify primary development occurs in approved regions
2. Ensure majority control remains with approved entities
3. Assess technology transfer implications
4. Maintain approval only if compliance standards met

### Continuous Compliance
Regular procedures to maintain compliance:
1. Monitor approved companies for geographic changes
2. Track new model releases from approved sources
3. Verify continued alignment with approval criteria
4. Update documentation to reflect current status

This geographic filtering system ensures the askme CLI includes only models from approved North American and European economic regions, maintaining compliance while providing access to leading AI capabilities from designated allied economic zones.