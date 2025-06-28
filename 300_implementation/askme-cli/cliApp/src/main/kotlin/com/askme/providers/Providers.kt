package com.askme.providers

class GoogleProvider : BaseProvider() {
    
    override fun getProviderName(): String = "google"
    
    override fun getAvailableModels(): List<String> = listOf(
        "gemini-1.5-flash",           // Fast, efficient
        "gemini-1.5-flash-8b"         // Even faster
    )
    
    override fun selectBestModel(prompt: String): String {
        val analysis = analyzePrompt(prompt)
        return when {
            analysis.isMath || analysis.complexity == PromptComplexity.LOW ->
                "gemini-1.5-flash"  // Fastest for simple queries
            
            else ->
                "gemini-1.5-flash-8b"  // Good general fallback
        }
    }
    
    override suspend fun chat(prompt: String, model: String?): String {
        val selectedModel = model ?: selectBestModel(prompt)
        return callBackend(prompt, "google", selectedModel)
    }
}

class MistralProvider : BaseProvider() {
    
    override fun getProviderName(): String = "mistral"
    
    override fun getAvailableModels(): List<String> = listOf(
        "mistral-small-latest",       // Fast, efficient
        "open-mistral-7b",           // Open source
        "open-mixtral-8x7b",         // Powerful open source
        "open-mixtral-8x22b",        // Most powerful open
        "mistral-medium-latest"      // Balanced performance
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
                "mistral-medium-latest"  // Balanced for reasoning
            
            else ->
                "mistral-small-latest"  // Good default
        }
    }
    
    override suspend fun chat(prompt: String, model: String?): String {
        val selectedModel = model ?: selectBestModel(prompt)
        return callBackend(prompt, "mistral", selectedModel)
    }
}

class LlamaProvider : BaseProvider() {
    
    override fun getProviderName(): String = "llama"
    
    override fun getAvailableModels(): List<String> = listOf(
        "meta-llama/Llama-3-8b-chat-hf"                 // Chat optimized
    )
    
    override fun selectBestModel(prompt: String): String {
        return "meta-llama/Llama-3-8b-chat-hf"  // Only working model
    }
    
    override suspend fun chat(prompt: String, model: String?): String {
        val selectedModel = model ?: selectBestModel(prompt)
        return callBackend(prompt, "llama", selectedModel)
    }
}
