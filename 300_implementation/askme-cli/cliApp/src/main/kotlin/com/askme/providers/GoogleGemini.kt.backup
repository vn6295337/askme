package com.askme.providers

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

@Serializable
data class GeminiRequest(
    val contents: List<GeminiContent>
)

@Serializable
data class GeminiContent(
    val parts: List<GeminiPart>,
    val role: String? = null
)

@Serializable
data class GeminiPart(
    val text: String
)

object GoogleGemini {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { 
                ignoreUnknownKeys = true
                isLenient = true
                coerceInputValues = true
            })
        }
    }
    
    // List of free Gemini models to try in order
    private val freeModels = listOf(
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-1.5-pro"
    )
    
    suspend fun chat(prompt: String, apiKey: String): String {
        // Try each model until one works
        for ((index, model) in freeModels.withIndex()) {
            val result = tryModel(prompt, apiKey, model)
            
            when {
                result.startsWith("❌") && (result.contains("quota") || result.contains("rate limit") || result.contains("RATE_LIMIT_EXCEEDED")) -> {
                    // This model has quota/rate issues, try next one
                    continue
                }
                result.startsWith("❌") && (result.contains("model not found") || result.contains("MODEL_NOT_FOUND")) -> {
                    // This model variant doesn't exist, try next one
                    continue
                }
                result.startsWith("❌") && index == freeModels.size - 1 -> {
                    // Last model failed, return the error
                    return result
                }
                result.startsWith("❌") -> {
                    // Other error, try next model
                    continue
                }
                else -> {
                    // Success! Return the response
                    return result
                }
            }
        }
        
        return "❌ Google API Error: All free models unavailable. Please check your API key or try again later."
    }
    
    private suspend fun tryModel(prompt: String, apiKey: String, model: String): String {
        return try {
            val request = GeminiRequest(
                contents = listOf(
                    GeminiContent(
                        parts = listOf(GeminiPart(prompt))
                    )
                )
            )
            
            val httpResponse: HttpResponse = client.post("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey") {
                header("Content-Type", "application/json")
                setBody(request)
            }
            
            val responseText = httpResponse.bodyAsText()
            
            // Parse manually to avoid serialization issues
            val jsonElement = Json.parseToJsonElement(responseText)
            val jsonObject = jsonElement.jsonObject
            
            // Check for error first
            if (jsonObject.containsKey("error")) {
                val errorObj = jsonObject["error"]?.jsonObject
                val errorMessage = errorObj?.get("message")?.jsonPrimitive?.content
                val errorCode = errorObj?.get("code")?.jsonPrimitive?.content
                val status = errorObj?.get("status")?.jsonPrimitive?.content
                
                val fullError = when {
                    errorCode != null && status != null -> "$status ($errorCode): $errorMessage"
                    errorMessage != null -> errorMessage
                    else -> "Unknown error format"
                }
                return "❌ Google API Error: $fullError"
            }
            
            // Extract response text manually with better error handling
            val candidates = jsonObject["candidates"]?.jsonArray
            if (candidates == null || candidates.isEmpty()) {
                return "❌ Google API Error: No candidates in response from model $model"
            }
            
            val firstCandidate = candidates.firstOrNull()?.jsonObject
            val content = firstCandidate?.get("content")?.jsonObject
            val parts = content?.get("parts")?.jsonArray
            if (parts == null || parts.isEmpty()) {
                return "❌ Google API Error: No parts in response from model $model"
            }
            
            val text = parts.firstOrNull()?.jsonObject?.get("text")?.jsonPrimitive?.content
            
            text ?: "No response from Gemini model $model"
                
        } catch (e: Exception) {
            "❌ Gemini API Error: ${e.message}"
        }
    }
}
