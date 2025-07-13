// Simplified AskMe CLI Build - 9 Provider Edition
plugins {
    kotlin("jvm") version "1.9.10"
    kotlin("plugin.serialization") version "1.9.10"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    // Core Kotlin
    implementation("org.jetbrains.kotlinx:kotlinx-cli:0.3.4")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    
    // HTTP Client for backend communication
    implementation("io.ktor:ktor-client-core:2.3.6")
    implementation("io.ktor:ktor-client-cio:2.3.6")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.6")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.6")
    
    // Logging
    implementation("org.slf4j:slf4j-simple:2.0.9")
    
    // Testing
    testImplementation(kotlin("test"))
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
}

application {
    mainClass.set("com.askme.cli.MainKt")
}

kotlin {
    jvmToolchain(17)
}

// Ensure distribution is built correctly
tasks.named("installDist") {
    doLast {
        println("✅ AskMe CLI 9-Provider Edition installed successfully!")
        val installDir = layout.buildDirectory.dir("install/cliApp").get().asFile
        println("📁 Installation directory: ${installDir.absolutePath}")
        println("🚀 Run with: ${installDir.absolutePath}/bin/cliApp --help")
    }
}