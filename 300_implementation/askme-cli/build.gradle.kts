plugins {
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1"
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.kotlinSerialization)
    alias(libs.plugins.sqldelight)
    alias(libs.plugins.detekt)
}

kotlin {
    androidTarget()

    sourceSets {
        val commonMain by getting {
            dependencies {
                // Ktor HTTP Client
                implementation(libs.ktor.client.core)
                implementation(libs.ktor.client.cio)
                implementation(libs.ktor.client.serialization)
                implementation(libs.ktor.client.content.negotiation)

                // Coroutines
                implementation(libs.kotlinx.coroutines.core)

                // JSON Serialization
                implementation(libs.kotlinx.serialization.json)
            }
        }
    }
}

android {
    compileSdk = 34
    namespace = "com.askme.app"
    defaultConfig {
        minSdk = 24
        targetSdk = 34
    }
}
