package com.askme.api

import com.askme.model.Answer
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.serialization.Serializable

class GeminiProvider(private val apiKey: String) : AiProvider {

    @Serializable
    private data class GeminiRequest(
        val contents: List<Content>
    )

    @Serializable
    private data class Content(
        val parts: List<Part>
    )

    @Serializable
    private data class Part(
        val text: String
    )

    @Serializable
    private data class GeminiResponse(
        val candidates: List<Candidate>
    )

    @Serializable
    private data class Candidate(
        val content: Content,
        val finishReason: String? = null
    )

    override suspend fun askQuestion(question: String): Answer {
        try {
            val client = ApiClient.client

            val request = GeminiRequest(
                contents = listOf(
                    Content(
                        parts = listOf(Part(text = question))
                    )
                )
            )

            val response = client.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent") {
                parameter("key", apiKey)
                contentType(ContentType.Application.Json)
                setBody(request)
            }

            if (response.status.value in 200..299) {
                val geminiResponse = kotlinx.serialization.json.Json.decodeFromString<GeminiResponse>(
                    response.bodyAsText()
                )
                val content = geminiResponse.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: "No response"
                return Answer(
                    content = content,
                    provider = "Google Gemini Pro",
                    timestamp = System.currentTimeMillis()
                )
            } else {
                return Answer(
                    content = "Error: ${response.status}",
                    provider = "Google Gemini Pro",
                    timestamp = System.currentTimeMillis()
                )
            }
        } catch (e: Exception) {
            return Answer(
                content = "Network error: ${e.message}",
                provider = "Google Gemini Pro",
                timestamp = System.currentTimeMillis()
            )
        }
    }
}
