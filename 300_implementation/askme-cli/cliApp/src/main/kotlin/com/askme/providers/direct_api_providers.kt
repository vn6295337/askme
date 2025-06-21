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

// Temporary direct API implementations for debugging
// These bypass the backend to test the original working setup

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

@Serializable
data class MistralRequest(
    val model: String,
    val messages: List<MistralMessage>,
    val max_tokens: Int = 500,
    val temperature: Double = 0.7
)

@Serializable
data class MistralMessage(
    val role: String,
    val content: String
)

object DirectGoogleGemini {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { 
                ignoreUnknownKeys = true
                isLenient = true
                coerceInputValues = true
            })
        }
    }
    
    suspend fun chat(prompt: String, apiKey: String): String {
        return try {
            val request = GeminiRequest(
                contents = listOf(
                    GeminiContent(
                        parts = listOf(GeminiPart(prompt))
                    )
                )
            )
            
            val httpResponse: HttpResponse = client.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey") {
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
                return "❌ Google API Error ($errorCode): $errorMessage"
            }
            
            // Extract response text
            val candidates = jsonObject["candidates"]?.jsonArray
            val firstCandidate = candidates?.firstOrNull()?.jsonObject
            val content = firstCandidate?.get("content")?.jsonObject
            val parts = content?.get("parts")?.jsonArray
            val text = parts?.firstOrNull()?.jsonObject?.get("text")?.jsonPrimitive?.content
            
            text ?: "No response from Gemini"
                
        } catch (e: Exception) {
            "❌ Gemini API Error: ${e.message}"
        }
    }
}

object DirectMistralAI {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { 
                ignoreUnknownKeys = true
                isLenient = true
                coerceInputValues = true
            })
        }
    }
    
    suspend fun chat(prompt: String, apiKey: String): String {
        return try {
            val request = MistralRequest(
                model = "mistral-small-latest",
                messages = listOf(
                    MistralMessage(role = "user", content = prompt)
                ),
                max_tokens = 500,
                temperature = 0.7
            )
            
            val httpResponse: HttpResponse = client.post("https://api.mistral.ai/v1/chat/completions") {
                header("Content-Type", "application/json")
                header("Authorization", "Bearer $apiKey")
                setBody(request)
            }
            
            val responseText = httpResponse.bodyAsText()
            
            // Parse response
            val jsonElement = Json.parseToJsonElement(responseText)
            val jsonObject = jsonElement.jsonObject
            
            // Check for error
            if (jsonObject.containsKey("error")) {
                val errorMessage = jsonObject["error"]?.jsonObject?.get("message")?.jsonPrimitive?.content
                return "❌ Mistral API Error: $errorMessage"
            }
            
            // Extract response
            val choices = jsonObject["choices"]?.jsonArray
            val firstChoice = choices?.firstOrNull()?.jsonObject
            val message = firstChoice?.get("message")?.jsonObject
            val content = message?.get("content")?.jsonPrimitive?.content
            
            content ?: "No response from Mistral"
                
        } catch (e: Exception) {
            "❌ Mistral API Error: ${e.message}"
        }
    }
}

object DirectLlamaAI {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { 
                ignoreUnknownKeys = true
                isLenient = true
                coerceInputValues = true
            })
        }
    }
    
    suspend fun chat(prompt: String, apiKey: String): String {
        return try {
            val requestJson = """
            {
                "model": "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": "${prompt.trim().replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r")}"
                    }
                ],
                "max_tokens": 500,
                "temperature": 0.7
            }
            """.trimIndent()
            
            val httpResponse: HttpResponse = client.post("https://api.together.xyz/v1/chat/completions") {
                header("Authorization", "Bearer $apiKey")
                header("Content-Type", "application/json")
                setBody(requestJson)
            }
            
            val responseText = httpResponse.bodyAsText()
            
            // Parse response
            val jsonElement = Json.parseToJsonElement(responseText)
            val jsonObject = jsonElement.jsonObject
            
            // Check for error
            if (jsonObject.containsKey("error")) {
                val errorMessage = jsonObject["error"]?.jsonObject?.get("message")?.jsonPrimitive?.content
                return "❌ Llama API Error: $errorMessage"
            }
            
            // Extract response
            val choices = jsonObject["choices"]?.jsonArray
            val firstChoice = choices?.firstOrNull()?.jsonObject
            val message = firstChoice?.get("message")?.jsonObject
            val content = message?.get("content")?.jsonPrimitive?.content
            
            content ?: "No response from Llama"
                
        } catch (e: Exception) {
            "❌ Llama API Error: ${e.message}"
        }
    }
}

// Temporary environment variable API key getter
object DirectAPIKeys {
    fun getGoogleKey(): String? = System.getenv("GOOGLE_API_KEY")
    fun getMistralKey(): String? = System.getenv("MISTRAL_API_KEY")  
    fun getLlamaKey(): String? = System.getenv("LLAMA_API_KEY")
}