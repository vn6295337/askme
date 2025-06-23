package com.askme.providers

class GoogleProvider : BaseProvider() {
    
    override fun getProviderName(): String = "google"
    
    override fun getAvailableModels(): List<String> = listOf(
        "gemini-1.5-flash",           // Fast, efficient
        "gemini-1.5-flash-8b",        // Even faster
        "gemini-1.5-pro",
        "gemini-2.5-pro",            // ✅ ADD - #1 LMArena model
        "gemini-2.5-flash",          // ✅ ADD - Fast replacement
        "gemini-2.0-flash"           // ✅ ADD - Multimodal
    )
    
    override fun selectBestModel(prompt: String): String {
        val analysis = analyzePrompt(prompt)
        return when {
            analysis.isMath || analysis.complexity == PromptComplexity.LOW ->
                "gemini-2.5-flash"  // Fastest for simple queries
            
            analysis.isCodeRelated ->
                "gemini-1.5-pro"  // Best for coding
            
            analysis.isLongForm || analysis.complexity == PromptComplexity.HIGH ->
                "gemini-2.5-pro"  // Most capable for complex queries
            
            analysis.isAnalytical ->
                "gemini-2.0-flash"  // Multimodal/analytical
            
            else ->
                "gemini-1.5-flash"  // Good general fallback
        }
    }
    
    override suspend fun chat(prompt: String): String {
        val bestModel = selectBestModel(prompt)
        return callBackend(prompt, "google", bestModel)
    }
}

class MistralProvider : BaseProvider() {
    
    override fun getProviderName(): String = "mistral"
    
    override fun getAvailableModels(): List<String> = listOf(
        "mistral-small-latest",       // Fast, efficient
        "open-mistral-7b",           // Open source
        "open-mixtral-8x7b",         // Powerful open source
        "open-mixtral-8x22b",        // Most powerful open
        "mistral-medium-latest",      // Balanced performance
        "mistral-medium-3",           // ✅ ADD - 90% Claude performance
        "magistral-small",            // ✅ ADD - Reasoning model
        "magistral-medium"            // ✅ ADD - Advanced reasoning
    )
    
    override fun selectBestModel(prompt: String): String {
        val analysis = analyzePrompt(prompt)
        return when {
            analysis.isMath || analysis.complexity == PromptComplexity.LOW ->
                "mistral-small-latest"  // Fast for simple queries
            
            analysis.isCodeRelated ->
                "open-mixtral-8x7b"  // Good at code
            
            analysis.isLongForm || analysis.complexity == PromptComplexity.HIGH ->
                "open-mixtral-8x22b"  // Most powerful
            
            analysis.isAnalytical ->
                "mistral-medium-3"  // Advanced reasoning
            
            else ->
                "mistral-small-latest"  // Good default
        }
    }
    
    override suspend fun chat(prompt: String): String {
        val bestModel = selectBestModel(prompt)
        return callBackend(prompt, "mistral", bestModel)
    }
}

class LlamaProvider : BaseProvider() {
    
    override fun getProviderName(): String = "llama"
    
    override fun getAvailableModels(): List<String> = listOf(
        "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",     // Fast, good quality
        "meta-llama/Llama-3-8b-chat-hf",                 // Chat optimized
        "meta-llama/Llama-3.3-70B-Instruct",             // ✅ REPLACE deprecated
        "meta-llama/Llama-2-7b-chat-hf",                 // Stable fallback
        "meta-llama/Llama-2-13b-chat-hf",                // Larger fallback
        "meta-llama/Llama-4-Maverick",                   // ✅ ADD - 400B MoE, 9-23x cheaper
        "meta-llama/Llama-4-Scout"                       // ✅ ADD - 10M context length
    )
    
    override fun selectBestModel(prompt: String): String {
        val analysis = analyzePrompt(prompt)
        return when {
            analysis.isMath || analysis.complexity == PromptComplexity.LOW ->
                "meta-llama/Meta-Llama-3-8B-Instruct-Turbo"  // Fast for simple queries
            
            analysis.isCodeRelated ->
                "meta-llama/Llama-3.3-70B-Instruct"  // Best for code
            
            analysis.isCreative ->
                "meta-llama/Llama-3-8b-chat-hf"  // Good for creative tasks
            
            analysis.isLongForm || analysis.complexity == PromptComplexity.HIGH ->
                "meta-llama/Llama-3.3-70B-Instruct"  // Most capable
            
            analysis.isAnalytical ->
                "meta-llama/Llama-4-Scout"  // Best for analysis, long context
            
            else ->
                "meta-llama/Meta-Llama-3-8B-Instruct-Turbo"  // Good default
        }
    }
    
    override suspend fun chat(prompt: String): String {
        val bestModel = selectBestModel(prompt)
        return callBackend(prompt, "llama", bestModel)
    }
}
