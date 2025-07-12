# Model Provenance Filtering

The Scout Agent implements comprehensive filtering to exclude models that originate from China or have Chinese provenance in their development chain.

## 🚫 Exclusion Criteria

### Direct Chinese Companies
Models from companies headquartered or controlled by China:
- **Tech Giants:** Baidu, Alibaba, Tencent, ByteDance
- **AI Specialists:** SenseTime, Megvii, iFlytek, DeepSeek, Zhipu AI
- **Emerging Players:** Minimax, Moonshot AI, 01.AI, Baichuan AI

### Chinese Model Families
Specific model series known to be Chinese-developed:
- **Baidu:** ERNIE-Bot series, Wenxin models
- **Alibaba:** Qwen/Tongyi-Qianwen series
- **Tsinghua/Zhipu:** ChatGLM, GLM-4 series
- **iFlytek:** Spark series
- **Open Source:** BELLE, MOSS, CPM, PanGu, WuDao
- **Academic:** InternLM, Skywork, Aquila, Yi series

### Pattern-Based Detection
Models identified through naming patterns:
- Chinese language indicators (中文, 中国)
- "Chinese" in model names (chinese-llama, chinese-alpaca)
- Company names in model IDs (baidu-*, qwen-*, ernie-*)
- Chinese Unicode characters in descriptions

## 🔍 Detection Methods

### 1. Explicit Model Lists
```javascript
specificModels: [
  'ernie-bot', 'ernie-bot-turbo', 'qwen-turbo', 'qwen-plus',
  'chatglm-6b', 'chatglm2-6b', 'glm-4', 'spark-lite',
  'belle-7b', 'moss-moon-003-sft', 'internlm-7b', 'yi-34b'
]
```

### 2. Company Name Matching
```javascript
companies: [
  'baidu', 'alibaba', 'tencent', 'bytedance', 'deepseek',
  'zhipu', 'minimax', 'moonshot', '01.ai', 'baichuan'
]
```

### 3. Regex Pattern Matching
```javascript
modelPatterns: [
  /chinese/i, /china/i, /qwen/i, /ernie/i, /chatglm/i,
  /belle/i, /moss/i, /internlm/i, /skywork/i, /yi-/i
]
```

### 4. Unicode Character Detection
```javascript
// Detects Chinese characters in model names/descriptions
if (fullText.match(/[\u4e00-\u9fff]/)) {
  return { excluded: true, reason: 'Chinese characters detected' };
}
```

## 📊 Validation Output

### Validated Models
Models that pass provenance checks include:
```json
{
  "model_name": "gpt-4",
  "provider": "OpenRouter",
  "provenance_verified": true,
  "chinese_origin": false,
  "documentation_url": "https://openrouter.ai/docs"
}
```

### Excluded Models
Models rejected due to Chinese provenance:
```json
{
  "model_name": "qwen-turbo",
  "provider": "Together AI",
  "reason": "Chinese provenance: Specific Chinese model identified"
}
```

## 🌍 Provider-Specific Considerations

### High-Risk Providers
Providers that commonly host Chinese models:

**Hugging Face:**
- Hosts many Chinese open-source models
- Filters by model author and tags
- Checks model repository descriptions

**Replicate:**
- Community-uploaded models may include Chinese variants
- Validates model owner and description fields
- Filters Chinese fine-tuned versions

**Together AI:**
- Aggregates models from multiple sources
- May include Chinese LLaMA variants
- Applies comprehensive name filtering

### Lower-Risk Providers
Providers with primarily Western models:

**Gemini (Google):** US-developed models only
**Mistral:** French company, European models
**Cohere:** Canadian company, proprietary models
**Groq:** US infrastructure, curated model selection
**OpenRouter:** Filters out Chinese providers
**AI21 Labs:** Israeli company, Jurassic series

## 📈 Filtering Statistics

The validation process reports:
- Total models checked across all providers
- Number of models excluded due to Chinese provenance
- Breakdown by exclusion reason
- Provider-specific filtering results

```
✅ Validation complete:
- Total models checked: 127
- Validated models (non-Chinese): 89
- Excluded models: 38
  - Chinese provenance: 23
  - Other reasons: 15
```

## 🔄 Maintenance

### Regular Updates
The provenance database requires periodic updates:

1. **New Chinese Companies:** Monitor emerging AI companies in China
2. **Model Name Changes:** Track rebranding of existing Chinese models
3. **Acquisition Monitoring:** Watch for Chinese acquisition of Western AI companies
4. **Partnership Filtering:** Identify Western models with Chinese development partnerships

### Data Sources for Updates
- Chinese AI company announcements
- Model leaderboards (e.g., Chatbot Arena, LMSYS)
- Academic paper publications from Chinese institutions
- Venture capital funding announcements
- Open source model repositories

### Validation Accuracy
To ensure filtering accuracy:
- Test with known Chinese models (should be excluded)
- Test with known Western models (should be included)
- Monitor false positives/negatives
- Regular provenance database audits

## 🚨 Emergency Procedures

### New Chinese Model Detection
1. Add to `specificModels` array immediately
2. Update pattern matching if new naming convention
3. Trigger validation to update model lists
4. Document discovery for future reference

### False Positive Handling
1. Investigate why Western model was excluded
2. Adjust filtering logic if necessary
3. Re-run validation to include valid models
4. Update documentation with edge cases

### Acquisition Scenarios
If Chinese company acquires Western AI company:
1. Add acquired company to exclusion list
2. Identify all affected model families
3. Update provider configurations
4. Communicate changes to stakeholders

This comprehensive filtering ensures the askme CLI only includes models from non-Chinese sources, maintaining compliance with provenance requirements while maximizing access to available Western AI capabilities.