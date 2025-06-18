package com.askme.api

import com.askme.model.Answer
import com.askme.model.ApiResponse
import com.askme.model.Question

interface ApiService {
    suspend fun askQuestion(question: String): ApiResponse<Answer>
    suspend fun getQuestionHistory(): ApiResponse<List<Question>>
    suspend fun saveQuestion(question: Question): ApiResponse<Question>
}
