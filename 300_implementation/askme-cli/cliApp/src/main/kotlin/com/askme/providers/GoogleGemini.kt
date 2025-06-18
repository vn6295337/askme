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
                val errorMessage = jsonObject["error"]?.jsonObject?.get("message")?.jsonPrimitive?.content
                return "❌ Google API Error: $errorMessage"
            }
            
            // Extract response text manually
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
