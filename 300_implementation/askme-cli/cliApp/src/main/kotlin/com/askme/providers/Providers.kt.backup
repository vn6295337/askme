package com.askme.providers

class GoogleProvider : BaseProvider() {
    
    override fun getProviderName(): String = "google"
    
    override fun getAvailableModels(): List<String> = listOf(
        "gemini-1.5-flash",           // Fast, efficient
        "gemini-1.5-flash-8b",        // Even faster
        "gemini-1.0-pro",             // Stable, reliable
        "gemini-pro",                 // Default
        "gemini-1.5-pro"              // Most capable
    )
    
    override fun selectBestModel(prompt: String): String {
        val analysis = analyzePrompt(prompt)
        
        return when {
            analysis.isMath || analysis.complexity == PromptComplexity.LOW -> 
                "gemini-1.5-flash-8b"  // Fast for simple queries
            
            analysis.isCodeRelated -> 
                "gemini-1.5-pro"  // Best for coding
            
            analysis.isLongForm || analysis.complexity == PromptComplexity.HIGH -> 
                "gemini-1.5-pro"  // Most capable for complex queries
            
            analysis.isAnalytical -> 
                "gemini-1.0-pro"  // Stable for analysis
            
            else -> 
                "gemini-1.5-flash"  // Good balance for general queries
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
        "mistral-medium-latest"       // Balanced performance
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
                "mistral-medium-latest"  // Balanced for analysis
            
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
        "meta-llama/Meta-Llama-3-70B-Instruct-Turbo",    // Most powerful
        "meta-llama/Llama-2-7b-chat-hf",                 // Stable fallback
        "meta-llama/Llama-2-13b-chat-hf"                 // Larger fallback
    )
    
    override fun selectBestModel(prompt: String): String {
        val analysis = analyzePrompt(prompt)
        
        return when {
            analysis.isMath || analysis.complexity == PromptComplexity.LOW ->
                "meta-llama/Meta-Llama-3-8B-Instruct-Turbo"  // Fast for simple queries
            
            analysis.isCodeRelated ->
                "meta-llama/Meta-Llama-3-70B-Instruct-Turbo"  // Best for code
            
            analysis.isCreative ->
                "meta-llama/Llama-3-8b-chat-hf"  // Good for creative tasks
            
            analysis.isLongForm || analysis.complexity == PromptComplexity.HIGH ->
                "meta-llama/Meta-Llama-3-70B-Instruct-Turbo"  // Most capable
            
            analysis.isAnalytical ->
                "meta-llama/Meta-Llama-3-70B-Instruct-Turbo"  // Best for analysis
            
            else ->
                "meta-llama/Meta-Llama-3-8B-Instruct-Turbo"  // Good default
        }
    }
    
    override suspend fun chat(prompt: String): String {
        val bestModel = selectBestModel(prompt)
        return callBackend(prompt, "llama", bestModel)
    }
}
