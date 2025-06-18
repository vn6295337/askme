package com.askme.model

import kotlinx.serialization.Serializable

@Serializable
data class Question(
    val id: String,
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Serializable
data class Answer(
    val id: String,
    val questionId: String,
    val text: String,
    val provider: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val error: String? = null
)
