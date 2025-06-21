package com.askme.providers

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.json.*

object GoogleGemini {
    private val client = HttpClient(CIO)
    private const val BACKEND_URL = "https://askme-backend-proxy.onrender.com/api/query"
    
    suspend fun chat(prompt: String): String {
        return try {
            val response: HttpResponse = client.post(BACKEND_URL) {
                contentType(ContentType.Application.Json)
                setBody("""{"prompt": "$prompt", "provider": "google"}""")
            }
            
            val responseText = response.bodyAsText()
            val json = Json.parseToJsonElement(responseText).jsonObject
            
            json["response"]?.jsonPrimitive?.content 
                ?: "❌ No response from Google Gemini via backend"
                
        } catch (e: Exception) {
            "❌ Google Backend Error: ${e.message}"
        }
    }
}
