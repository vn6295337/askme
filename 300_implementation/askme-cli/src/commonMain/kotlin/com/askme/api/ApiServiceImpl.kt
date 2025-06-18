package com.askme.api

import com.askme.model.Answer
import com.askme.model.ApiResponse
import com.askme.model.Question
import kotlinx.datetime.Clock

/**
 * Implementation of ApiService using ProviderManager
 */
class ApiServiceImpl(private val providerManager: ProviderManager) : ApiService {

    private val questionHistory = mutableListOf<Question>()
    private val answerHistory = mutableListOf<Answer>()

    override suspend fun askQuestion(questionText: String): ApiResponse<Answer> {
        return try {
            val question = Question(
                id = generateQuestionId(),
                text = questionText,
                timestamp = Clock.System.now().toEpochMilliseconds()
            )

            // Save question to history
            questionHistory.add(question)

            // Get answer from provider manager (with failover)
            val answer = providerManager.askQuestion(question)

            // Save answer to history
            answerHistory.add(answer)

            ApiResponse.success(answer)
        } catch (e: Exception) {
            ApiResponse.error("Failed to get answer: ${e.message}")
        }
    }

    override suspend fun getQuestionHistory(): ApiResponse<List<Question>> {
        return try {
            ApiResponse.success(questionHistory.toList())
        } catch (e: Exception) {
            ApiResponse.error("Failed to retrieve question history: ${e.message}")
        }
    }

    override suspend fun saveQuestion(question: Question): ApiResponse<Boolean> {
        return try {
            if (!questionHistory.contains(question)) {
                questionHistory.add(question)
            }
            ApiResponse.success(true)
        } catch (e: Exception) {
            ApiResponse.error("Failed to save question: ${e.message}")
        }
    }

    /**
     * Get answer history
     */
    suspend fun getAnswerHistory(): ApiResponse<List<Answer>> {
        return try {
            ApiResponse.success(answerHistory.toList())
        } catch (e: Exception) {
            ApiResponse.error("Failed to retrieve answer history: ${e.message}")
        }
    }

    /**
     * Get provider status
     */
    fun getProviderStatus(): Map<String, String> {
        return providerManager.getProviderStats()
    }

    /**
     * Get available providers
     */
    fun getAvailableProviders(): List<String> {
        return providerManager.getAvailableProviders()
    }

    private fun generateQuestionId(): String {
        return "q_${Clock.System.now().toEpochMilliseconds()}_${(1000..9999).random()}"
    }
}
