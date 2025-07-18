# askme API Model Update Plan

## 🚨 CRITICAL PRIORITY - Immediate Action Required

### 🔴 URGENT: Google Deprecated Models (FAIL: Returns 404)
**Timeline**: Immediate (these will cause failures)

#### Backend Server Updates Required:
**File to update:**
- `300_implementation/askme-backend/server.js` (PROVIDERS.google.models array)

**Current (REMOVE):**
```javascript
models: [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b", 
  "gemini-1.0-pro",        // ❌ REMOVE - Returns 404
  "gemini-pro",            // ❌ REMOVE - Returns 404  
  "gemini-1.5-pro"
]
```

**Updated (NEW):**
```javascript
models: [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-2.5-pro",       // ✅ ADD - #1 LMArena model
  "gemini-2.5-flash",     // ✅ ADD - Replace deprecated
  "gemini-2.0-flash"      // ✅ ADD - Multimodal outputs  
]
```

#### CLI Provider Updates Required:
**File to update:**
- `300_implementation/askme-cli/cliApp/src/main/kotlin/com/askme/providers/Providers.kt` (GoogleProvider.getAvailableModels())

**Current (REMOVE):**
```kotlin
override fun getAvailableModels(): List<String> = listOf(
    "gemini-1.5-flash",           
    "gemini-1.5-flash-8b",        
    "gemini-1.0-pro",             // ❌ REMOVE - Returns 404
    "gemini-pro",                 // ❌ REMOVE - Returns 404
    "gemini-1.5-pro"              
)
```

**Updated (NEW):**
```kotlin
override fun getAvailableModels(): List<String> = listOf(
    "gemini-1.5-flash",           
    "gemini-1.5-flash-8b",        
    "gemini-1.5-pro",
    "gemini-2.5-pro",            // ✅ ADD - #1 LMArena model
    "gemini-2.5-flash",          // ✅ ADD - Fast replacement
    "gemini-2.0-flash"           // ✅ ADD - Multimodal
)
```

---

## 🟡 PLANNED: Llama Model Replacement 
**Timeline**: Before June 30, 2025 (deprecation deadline)

#### Backend Server Updates:
**File to update:**
- `300_implementation/askme-backend/server.js` (PROVIDERS.llama.models array)

**Current (REPLACE):**
```javascript
models: [
  "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
  "meta-llama/Llama-3-8b-chat-hf",
  "meta-llama/Meta-Llama-3-70B-Instruct-Turbo", // 🔄 REPLACE
  "meta-llama/Llama-2-7b-chat-hf",
  "meta-llama/Llama-2-13b-chat-hf"
]
```

**Updated:**
```javascript
models: [
  "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
  "meta-llama/Llama-3-8b-chat-hf", 
  "meta-llama/Llama-3.3-70B-Instruct",    // ✅ REPLACE deprecated
  "meta-llama/Llama-2-7b-chat-hf",
  "meta-llama/Llama-2-13b-chat-hf"
]
```

---

## 🟢 OPTIMIZE: Add New High-Performance Models

### Mistral New Models
**Timeline**: After critical updates completed

#### Backend Server Addition:
```javascript
models: [
  "mistral-small-latest",
  "open-mistral-7b",
  "open-mixtral-8x7b", 
  "open-mixtral-8x22b",
  "mistral-medium-latest",
  "mistral-medium-3",        // ✅ ADD - 90% Claude performance
  "magistral-small",         // ✅ ADD - Reasoning model
  "magistral-medium"         // ✅ ADD - Advanced reasoning
]
```

### Llama New Models Addition:
```javascript
models: [
  "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
  "meta-llama/Llama-3-8b-chat-hf",
  "meta-llama/Llama-3.3-70B-Instruct",
  "meta-llama/Llama-2-7b-chat-hf",
  "meta-llama/Llama-2-13b-chat-hf",
  "meta-llama/Llama-4-Maverick",     // ✅ ADD - 400B MoE, 9-23x cheaper
  "meta-llama/Llama-4-Scout"        // ✅ ADD - 10M context length
]
```

---

## 📋 Implementation Checklist

### Phase 1: Critical Google Updates (COMPLETED)
- [x] 1.1 Update backend server.js Google models array
- [x] 1.2 Update CLI Providers.kt Google models list  
- [ ] 1.3 Update Google provider selectBestModel() logic (Future optimization)
- [ ] 1.4 Test new Google models work correctly (Future optimization)
- [x] 1.5 Deploy backend with new Google configuration
- [x] 1.6 Rebuild CLI release: `./gradlew cliApp:build` 
- [x] 1.7 Update build-release/ directory with new CLI build

### Phase 2: Model Routing Updates (PENDING)
- [ ] 2.1 Update smart selection logic for new Google models
- [ ] 2.2 Add fallback priorities: gemini-2.5-flash → gemini-1.5-flash → gemini-1.5-pro
- [ ] 2.3 Test failover works with new model hierarchy

### Phase 3: Llama Replacement (PENDING)
- [ ] 3.1 Update Llama model configurations
- [ ] 3.2 Test Llama-3.3-70B-Instruct compatibility
- [ ] 3.3 Update routing logic for new Llama model

### Phase 4: New Model Integration (PENDING)
- [ ] 4.1 Add new Mistral models to configuration
- [ ] 4.2 Add new Llama models to configuration  
- [ ] 4.3 Update intelligent routing for new capabilities
- [ ] 4.4 Test all new models end-to-end

---

## 📂 Project Context

**Current Status**: askme CLI is built and operational in `build-release/askme-cli/`
**Documentation**: Plan will be saved to `800_misc_docs/api_model_update_plan.md`
**Working Directory**: `/mnt/chromeos/removable/USBdrive/askme/`

---

## 🔧 Next Steps

**Ready to start with the critical Google updates?**

The deprecated Google models are currently failing with 404 errors and need immediate replacement. We should start there first.

**Which file would you like to update first:**
1. Backend server.js configuration (enables new models)
2. CLI Providers.kt configuration (uses new models)

**Or would you prefer a different approach?**