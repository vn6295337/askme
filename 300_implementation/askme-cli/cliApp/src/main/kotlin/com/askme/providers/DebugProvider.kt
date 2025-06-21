package com.askme.providers

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.*

object DebugProvider {
    private val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                coerceInputValues = true
            })
        }
    }
    
    suspend fun testCall(prompt: String): String {
        return try {
            println("🔧 DEBUG: Starting request to backend...")
            
            val request = BackendRequest(
                prompt = prompt,
                provider = "mistral"
            )
            
            println("🔧 DEBUG: Request object: $request")
            
            val response: HttpResponse = httpClient.post("https://askme-backend-proxy.onrender.com/api/query") {
                contentType(ContentType.Application.Json)
                setBody(request)
            }
            
            println("🔧 DEBUG: Response status: ${response.status}")
            val responseText = response.bodyAsText()
            println("🔧 DEBUG: Response body: $responseText")
            
            when (response.status) {
                HttpStatusCode.OK -> {
                    val backendResponse = response.body<BackendResponse>()
                    println("🔧 DEBUG: Parsed response: $backendResponse")
                    "✅ SUCCESS: ${backendResponse.response}"
                }
                else -> {
                    "❌ HTTP Error: ${response.status}"
                }
            }
        } catch (e: Exception) {
            println("🔧 DEBUG: Exception caught: ${e::class.simpleName}: ${e.message}")
            e.printStackTrace()
            "❌ Exception: ${e.message}"
        }
    }
}
