# Project Execution Checklist

This checklist tracks every step required to deliver the AskMe Lite project, organized by phase and mapped to the project plan for full traceability. Mark each item as you complete it. (Preserve this file for active use; git history provides archiving.)

## ✅ Architecture & Stack Alignment (2025-06-05)
- [x] All module and dependency documentation consolidated into `114_architecture_components.md` for a single source of truth.
- [x] All dependencies and tools version-pinned in `gradle/libs.versions.toml` with detailed rationale for each major tech choice and version alignment.
- [x] Compose BOM and Compose Compiler versions aligned with Kotlin and AGP for maximum stability.
- [x] AndroidX Security set to most stable alpha (alpha04) for production use.
- [x] All documentation now references the version catalog for authoritative versioning and rationale.
- [x] Obsolete/duplicate docs (e.g., `HighLevelModules.md`, `archives/`) removed for clarity.
- [x] All changes committed and pushed to the repository.

## Core Project Steps

| Checkbox | S/N | Phase | Phase Ref | Checkpoint | Status | Notes |
|---|---|---|---|---|---|---|
| [ ] | 1 | Define MVP Scope and Success Metrics | 1.1 | Open the Problem Statement document in the repository. |  |  |
| [ ] | 2 | Define MVP Scope and Success Metrics | 1.1 | Read through the “Must Have (MVP)” section and highlight each required feature. |  |  |
| [ ] | 3 | Define MVP Scope and Success Metrics | 1.1 | Note the performance targets (e.g., < 2 s response time, < 20 MB app size). |  |  |
| [ ] | 4 | Define MVP Scope and Success Metrics | 1.1 | Create a new file named 115_mvp_scope.md and copy the list of core features and success metrics into it. |  |  |
| [ ] | 5 | Finalize Technical Architecture and Component Design | 1.2 | Open the draft Technical Architecture diagram or text file. |  |  |
| [ ] | 6 | Finalize Technical Architecture and Component Design | 1.2 | Identify the high-level modules (Core, AndroidApp, CLI) and write their names on a blank page. |  |  |
| [ ] | 7 | Finalize Technical Architecture and Component Design | 1.2 | For each module, write one or two sentences describing its purpose (e.g., Core handles LLM logic). |  |  |
| [ ] | 8 | Finalize Technical Architecture and Component Design | 1.2 | List the third-party libraries needed (Ktor, gRPC, Koin, SQLDelight, Detekt) under a heading “Dependencies.” |  |  |
| [ ] | 9 | Finalize Technical Architecture and Component Design | 1.2 | Save these descriptions in a new file named 114_architecture_components.md. |  |  |
| [ ] | 10 | Set Up Development Environment and Tooling | 1.3 | Open your Chromebook’s Linux terminal and verify that the USB drive is mounted at `/mnt/chromeos/removable/USB drive/ask me/` by running `ls /mnt/chromeos/removable/`. |  |  |
| [ ] | 11 | Set Up Development Environment and Tooling | 1.3 | If the USB drive is not mounted, click the Files app, locate “USB drive,” and choose “Mount”. |  |  |
| [ ] | 12 | Set Up Development Environment and Tooling | 1.3 | Ask the AI assistant to install JDK 17 into `/mnt/chromeos/removable/USB drive/ask me/jdk` by saying, “AI assistant, install JDK 17 to /mnt/chromeos/removable/USB drive/ask me/jdk.” |  |  |
| [ ] | 13 | Set Up Development Environment and Tooling | 1.3 | Once JDK 17 is installed, run `java -version` in the terminal to confirm it reports version 17. |  |  |
| [ ] | 14 | Set Up Development Environment and Tooling | 1.3 | Ask the AI assistant to install Kotlin and Kotlin Multiplatform tooling into `/mnt/chromeos/removable/USB drive/ask me/kotlin` by saying, “AI assistant, install Kotlin and KMP in /mnt/chromeos/removable/USB drive/ask me/kotlin.” |  |  |
| [ ] | 15 | Set Up Development Environment and Tooling | 1.3 | After installation, run `kotlinc -version` to confirm Kotlin is available. |  |  |
| [ ] | 16 | Set Up Development Environment and Tooling | 1.3 | Ask the AI assistant to install Android SDK Platform 34, build tools, and the Android emulator into `/mnt/chromeos/removable/USB drive/ask me/android-sdk` by saying, “AI assistant, install Android SDK components to /mnt/chromeos/removable/USB drive/ask me/android-sdk.” |  |  |
| [ ] | 17 | Set Up Development Environment and Tooling | 1.3 | Once installation finishes, run `ls /mnt/chromeos/removable/USB drive/ask me/android-sdk/platforms/android-34` to confirm the platform files exist. |  |  |
| [ ] | 18 | Set Up Development Environment and Tooling | 1.3 | Ask the AI assistant to install Gradle (or configure the Gradle wrapper) into `/mnt/chromeos/removable/USB drive/ask me/gradle` by saying, “AI assistant, install Gradle to /mnt/chromeos/removable/USB drive/ask me/gradle.” |  |  |
| [ ] | 19 | Create Initial Project Repository Structure | 1.5 | Open GitHub in your browser, navigate to your project’s repository, and click “Open in Codespace.” |  |  |
| [ ] | 20 | Create Initial Project Repository Structure | 1.5 | Wait for Codespace to launch, then click the terminal icon inside the Codespace. |  |  |
| [ ] | 21 | Create Initial Project Repository Structure | 1.5 | Inside the Codespace terminal, run `git init` to initialize a local Git repository if one is not already present. |  |  |
| [ ] | 22 | Create Initial Project Repository Structure | 1.5 | Run `git remote add origin <your-repo-URL>` to set the remote origin (replace `<your-repo-URL>` with your repository’s HTTPS link). |  |  |
| [ ] | 23 | Create Initial Project Repository Structure | 1.5 | In the Codespace file explorer, create folders named `core`, `androidApp`, `cliApp`, `docs`, and `scripts`. |  |  |
| [ ] | 24 | Create Initial Project Repository Structure | 1.5 | Save these changes by running `git add .` and `git commit -m "Initial repository structure"`. |  |  |
| [ ] | 25 | Create Initial Project Repository Structure | 1.5 | Push to GitHub by running `git push -u origin main`. |  |  |
| [ ] | 26 | Create Initial Project Repository Structure | 1.5 | Back in your Chromebook’s Linux terminal, type `cd /mnt/chromeos/removable/USB drive/ask me/` and run `git clone <your-repo-URL>` to clone the repo onto the USB drive. |  |  |
| [ ] | 27 | Create Initial Project Repository Structure | 1.5 | Open the cloned folder in the Chromebook terminal to confirm the files are present. |  |  |
| [ ] | 28 | Set Up Development Environment and Tooling | 1.3 | Ask the AI assistant to set environment variables by editing your shell profile (e.g., `nano ~/.bashrc`) and adding:

```
export JAVA_HOME="/mnt/chromeos/removable/USB drive/ask me/jdk"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_SDK_ROOT="/mnt/chromeos/removable/USB drive/ask me/android-sdk"
export GRADLE_USER_HOME="/mnt/chromeos/removable/USB drive/ask me/gradle"
```
 |  |  |
| [ ] | 29 | Set Up Development Environment and Tooling | 1.3 | Save and close the profile, then run `source ~/.bashrc` to apply changes. |  |  |
| [ ] | 30 | Set Up Development Environment and Tooling | 1.3 | Confirm that `java -version`, `kotlinc -version`, and `gradle -v` work in the Chromebook terminal. |  |  |
| [ ] | 31 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to create a Kotlin file at `core/src/commonMain/kotlin/FileUtils.kt` containing simple functions to read, write, and delete a JSON file. |  |  |
| [ ] | 32 | Implement Core Module with Shared Business Logic | 1.8 | In the Codespace terminal, open `FileUtils.kt` and verify that functions `readJson()`, `writeJson()`, and `deleteFile()` are present. |  |  |
| [ ] | 33 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to create a Kotlin file at `core/src/commonMain/kotlin/NetworkUtils.kt` with functions to perform HTTP GET and POST requests and retry once on failure. |  |  |
| [ ] | 34 | Implement Core Module with Shared Business Logic | 1.8 | Open `NetworkUtils.kt` in Codespace to confirm methods `httpGet()` and `httpPost()` exist with basic retry logic. |  |  |
| [ ] | 35 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to write unit tests for `FileUtils` by creating `core/src/commonTest/kotlin/FileUtilsTest.kt` and including tests for reading and writing a sample JSON. |  |  |
| [ ] | 36 | Implement Core Module with Shared Business Logic | 1.8 | In the Codespace terminal, run `./gradlew core:commonTest` and confirm all `FileUtils` tests pass. |  |  |
| [ ] | 37 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to write unit tests for `NetworkUtils` by creating `core/src/commonTest/kotlin/NetworkUtilsTest.kt` with a mock HTTP server test. |  |  |
| [ ] | 38 | Implement Core Module with Shared Business Logic | 1.8 | Run `./gradlew core:commonTest` again and confirm that `NetworkUtils` tests pass. |  |  |
| [ ] | 39 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to define a Kotlin interface named `LLMProvider` in `core/src/commonMain/kotlin/LLMProvider.kt` with methods `sendPrompt(prompt: String): Flow<String>` and `cancel()`. |  |  |
| [ ] | 40 | Implement Core Module with Shared Business Logic | 1.8 | In the Codespace file explorer, verify that `LLMProvider.kt` exists. |  |  |
| [ ] | 41 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to implement a class `OllamaProvider` in `core/src/commonMain/kotlin/OllamaProvider.kt` that connects to the local Ollama runtime and adheres to `LLMProvider`. |  |  |
| [ ] | 42 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to implement a class `OpenAIProvider` in `core/src/commonMain/kotlin/OpenAIProvider.kt` that connects to the cloud OpenAI API and implements `LLMProvider`. |  |  |
| [ ] | 43 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to open a new test file `core/src/commonTest/kotlin/LLMProviderTest.kt` and write tests that simulate sending a “Hello” prompt to both `OllamaProvider` and `OpenAIProvider`, verifying you receive a non-empty response. |  |  |
| [ ] | 44 | Implement Core Module with Shared Business Logic | 1.8 | Run `./gradlew core:commonTest` to confirm both providers pass their tests. |  |  |
| [ ] | 45 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to create a new Kotlin file `core/src/commonMain/kotlin/QueryProcessor.kt` with a function `processQuery(prompt: String, provider: LLMProvider): Flow<String>` that sanitizes input, checks length, and invokes `provider.sendPrompt()`. |  |  |
| [ ] | 46 | Implement Core Module with Shared Business Logic | 1.8 | In Codespace, open `QueryProcessor.kt` and confirm the presence of `sanitizeInput()`, `validateLength()`, and call to `provider.sendPrompt()`. |  |  |
| [ ] | 47 | Implement Core Module with Shared Business Logic | 1.8 | Ask the AI assistant to write unit tests in `core/src/commonTest/kotlin/QueryProcessorTest.kt` verifying that too-long inputs are rejected and valid inputs return a flow of strings. |  |  |
| [ ] | 48 | Implement Core Module with Shared Business Logic | 1.8 | Run `./gradlew core:commonTest` and confirm `QueryProcessor` tests pass. |  |  |
| [ ] | 49 | Initialize Kotlin Multiplatform Project Structure | 1.6 | In Codespace, create a new Kotlin Multiplatform module by running `./gradlew createModule --name=core --type=kotlin-multiplatform`. |  |  |
| [ ] | 50 | Initialize Kotlin Multiplatform Project Structure | 1.6 | Verify that a folder named `core` with the standard MPP structure appears in the file explorer. |  |  |
| [ ] | 51 | Set Up Build Configuration | 1.7 | In Codespace, run `./gradlew core:build` and confirm there are no compilation errors. |  |  |
| [ ] | 52 | Set Up Android App Module | 3.1 | Create an Android module by running `./gradlew createModule --name=androidApp --type=android-application`. |  |  |
| [ ] | 53 | Set Up Android App Module | 3.1 | In Codespace, verify that an `androidApp` folder with Gradle files appears. |  |  |
| [ ] | 54 | Set Up Android App Module | 3.1 | Open `androidApp/build.gradle.kts` and confirm that it depends on the `core` module (e.g., `implementation(project(":core"))`). |  |  |
| [ ] | 55 | Set Up Android App Module | 3.1 | In Codespace, run `./gradlew androidApp:assembleDebug` and confirm the build completes successfully. |  |  |
| [ ] | 56 | Implement Jetpack Compose UI Framework | 3.2 | In `androidApp/src/main/java/.../MainActivity.kt`, ask the AI assistant to set up a basic Jetpack Compose scaffold with a TopAppBar and a TextField for user input. |  |  |
| [ ] | 57 | Implement Jetpack Compose UI Framework | 3.2 | Open `MainActivity.kt` in Codespace and confirm the presence of a `Scaffold` and a `TextField` composable. |  |  |
| [ ] | 58 | Create Main Chat Interface | 3.3 | Ask the AI assistant to connect the `QueryProcessor` into `MainActivity.kt` so that when a user types text and taps a “Send” button, the app invokes `QueryProcessor.processQuery(...)`. |  |  |
| [ ] | 59 | Create Main Chat Interface | 3.3 | Open `ChatScreen.kt` (create it if missing) and confirm that it uses a `LazyColumn` to display user messages and a flow of AI responses in real time. |  |  |
| [ ] | 60 | Develop Model Management UI | 3.5 | Ask the AI assistant to create a new Composable `ModelManagementScreen.kt` under `androidApp/src/main/java/.../ui/` that lists available local models with download and delete buttons. |  |  |
| [ ] | 61 | Develop Model Management UI | 3.5 | Open `ModelManagementScreen.kt` and confirm that it shows a list of model names with icons for download or delete. |  |  |
| [ ] | 62 | Write UI Tests for Android App | 3.8 | Ask the AI assistant to write a Kotlin test under `androidApp/src/androidTest/kotlin/` named `ChatScreenTest.kt` that verifies the chat UI displays messages when you supply a fake `QueryProcessor`. |  |  |
| [ ] | 63 | Write UI Tests for Android App | 3.8 | Run `./gradlew androidApp:connectedAndroidTest` to confirm that `ChatScreenTest` passes. |  |  |
| [ ] | 64 | Write UI Tests for Android App | 3.8 | Ask the AI assistant to write a test named `ModelManagementTest.kt` under `androidApp/src/androidTest/kotlin/` verifying that tapping “Download” triggers a progress indicator. |  |  |
| [ ] | 65 | Write UI Tests for Android App | 3.8 | Run `./gradlew androidApp:connectedAndroidTest` and confirm the `ModelManagementTest` passes. |  |  |
| [ ] | 66 | Add Theme Support (Light/Dark) | 3.6 | Ask the AI assistant to add light/dark themes by creating `ui/theme/Color.kt`, `Typography.kt`, and updating `MaterialTheme` in `androidApp`. |  |  |
| [ ] | 67 | Add Theme Support (Light/Dark) | 3.6 | Open `Theme.kt` and confirm that `lightColors()` and `darkColors()` are defined. |  |  |
| [ ] | 68 | Implement Local Storage | 3.7 | Ask the AI assistant to implement local storage in `androidApp` by adding SQLDelight configuration under `androidApp/build.gradle.kts` and creating a `SettingsDatabase` class. |  |  |
| [ ] | 69 | Implement Local Storage | 3.7 | Open `SettingsDatabase` in Codespace and confirm it defines a table for storing user preferences. |  |  |
| [ ] | 70 | Implement Local Storage | 3.7 | Ask the AI assistant to write a test under `androidApp/src/androidTest/kotlin/SettingsDatabaseTest.kt` that inserts and reads a sample preference value. |  |  |
| [ ] | 71 | Implement Local Storage | 3.7 | Run `./gradlew androidApp:connectedAndroidTest` to confirm the `SettingsDatabaseTest` passes on an emulator. |  |  |
| [ ] | 72 | Perform Manual Testing on Multiple Devices | 3.9 | On your Chromebook terminal, ask the AI assistant to list connected Android emulator devices by running `adb devices`. |  |  |
| [ ] | 73 | Perform Manual Testing on Multiple Devices | 3.9 | Instruct the AI assistant to run the Android app on an emulator by executing `./gradlew androidApp:installDebug` and then `adb shell am start -n "com.example.androidApp/.MainActivity"`. |  |  |
| [ ] | 74 | Perform Manual Testing on Multiple Devices | 3.9 | Visually confirm in the emulator that the chat UI loads without errors. |  |  |
| [ ] | 75 | Validate Accessibility Compliance | 3.10 | Ask the AI assistant to set up accessibility checks by adding `android:contentDescription` for all important UI elements in XML or Compose code. |  |  |
| [ ] | 76 | Validate Accessibility Compliance | 3.10 | Open the Accessibility Scanner on the emulator and verify that there are no missing content descriptions or contrast issues. |  |  |
| [ ] | 77 | Set Up CLI Module | 4.1 | In Codespace, run `./gradlew createModule --name=cliApp --type=java-application`. |  |  |
| [ ] | 78 | Set Up CLI Module | 4.1 | Verify that a `cliApp` folder appears with a `build.gradle.kts` file. |  |  |
| [ ] | 79 | Implement Command Argument Parsing | 4.2 | Ask the AI assistant to add Kotlinx.CLI dependencies to `cliApp/build.gradle.kts` under `implementation("org.jetbrains.kotlinx:kotlinx-cli:0.3.4")`. |  |  |
| [ ] | 80 | Implement Command Argument Parsing | 4.2 | Create a Kotlin file `cliApp/src/main/kotlin/Main.kt` and ask the AI assistant to write code parsing flags `--model`, `--prompt-file`, and `--local`/`--remote` using `ArgParser`. |  |  |
| [ ] | 81 | Implement Command Argument Parsing | 4.2 | Open `Main.kt` in Codespace and confirm that `ArgParser("askme")` is defined with options for `model`, `promptFile`, and `mode`. |  |  |
| [ ] | 82 | Create Text-Based User Interface | 4.3 | Ask the AI assistant to implement a simple CLI user interface in `Main.kt` that prompts “Enter your query:” if no `--prompt-file` is provided. |  |  |
| [ ] | 83 | Create Text-Based User Interface | 4.3 | Open `Main.kt` and verify that a loop reads lines from `System.`in and sends each to `QueryProcessor`. |  |  |
| [ ] | 84 | Add Configuration File Support | 4.4 | Ask the AI assistant to add a configuration file feature: create `cliApp/src/main/resources/config.json` with placeholder fields `{"model": "local", "apiKey": ""}`. |  |  |
| [ ] | 85 | Add Configuration File Support | 4.4 | Update `Main.kt` so that if `--model` is omitted, it reads the `model` value from `config.json`. |  |  |
| [ ] | 86 | Implement Command History and Completion | 4.5 | Ask the AI assistant to integrate JLine (or similar) by adding the dependency `org.jline:jline:3.20.0` to `cliApp/build.gradle.kts`. |  |  |
| [ ] | 87 | Implement Command History and Completion | 4.5 | In `Main.kt`, ask the AI assistant to configure a `LineReader` instance that stores history in `~/.askme_history`. |  |  |
| [ ] | 88 | Implement Command History and Completion | 4.5 | Open the Chromebook terminal, navigate to `cliApp` on the USB drive, and run `./gradlew cliApp:installDist`. |  |  |
| [ ] | 89 | Implement Command History and Completion | 4.5 | Run `~/.askme_history` touch command: `touch ~/.askme_history`, then execute `~/cliApp/build/install/cliApp/bin/cliApp` and confirm that pressing the up arrow shows previous commands. |  |  |
| [ ] | 90 | Write CLI-Specific Tests | 4.6 | Ask the AI assistant to write a test file `cliApp/src/test/kotlin/CLITest.kt` that launches the CLI with a fixed prompt and verifies the printed response includes expected text. |  |  |
| [ ] | 91 | Write CLI-Specific Tests | 4.6 | Run `./gradlew cliApp:test` in Codespace and confirm that `CLITest` passes. |  |  |
| [ ] | 92 | Implement Response Caching | 5.1 | Ask the AI assistant to add an in-memory cache to `QueryProcessor` by creating a `ResponseCache` class under `core/src/commonMain/kotlin/ResponseCache.kt` with methods `getCached(prompt)` and `putCache(prompt, response)`. |  |  |
| [ ] | 93 | Implement Response Caching | 5.1 | Open `ResponseCache.kt` and confirm it uses a Kotlin `MutableMap<String, String>` underneath. |  |  |
| [ ] | 94 | Implement Response Caching | 5.1 | Ask the AI assistant to modify `QueryProcessor` so it checks `ResponseCache` first before calling the provider. |  |  |
| [ ] | 95 | Implement Response Caching | 5.1 | Ask the AI assistant to write a test named `ResponseCacheTest.kt` under `core/src/commonTest/kotlin/` that verifies caching behavior (store and retrieve). |  |  |
| [ ] | 96 | Implement Response Caching | 5.1 | Run `./gradlew core:commonTest` and confirm that `ResponseCacheTest` passes. |  |  |
| [ ] | 97 | Add Performance Monitoring | 5.2 | Ask the AI assistant to add a performance monitoring library (e.g., Kotlinx-kratix or a custom timer) by creating `PerformanceMonitor.kt` under `core/src/commonMain/kotlin/` that logs method durations. |  |  |
| [ ] | 98 | Add Performance Monitoring | 5.2 | Open `PerformanceMonitor.kt` and confirm it wraps calls to `QueryProcessor` with timing code that prints elapsed milliseconds. |  |  |
| [ ] | 99 | Add Performance Monitoring | 5.2 | Ask the AI assistant to write a test named `PerformanceMonitorTest.kt` that ensures timing information is printed when `QueryProcessor` is called. |  |  |
| [ ] | 100 | Conduct Performance Benchmarking | 5.6 | Run `./gradlew core:commonTest` and confirm `PerformanceMonitorTest` passes. |  |  |
| [ ] | 101 | Optimize App Size and Memory Usage | 5.3 | Ask the AI assistant to adjust `androidApp/build.gradle.kts` to enable R8 by adding `buildTypes { release { minifyEnabled true } }`. |  |  |
| [ ] | 102 | Optimize App Size and Memory Usage | 5.3 | In Codespace, run `./gradlew androidApp:assembleRelease` and locate the release APK under `androidApp/build/outputs/apk/release/`. |  |  |
| [ ] | 103 | Optimize App Size and Memory Usage | 5.3 | Copy the APK to the Chromebook terminal by running `adb install -r androidApp/build/outputs/apk/release/app-release.apk`. |  |  |
| [ ] | 104 | Optimize App Size and Memory Usage | 5.3 | On the emulator, open Settings → Apps, find your app, and note the installed size. Confirm it is under 20 MB. |  |  |
| [ ] | 105 | Optimize App Size and Memory Usage | 5.3 | If over 20 MB, ask the AI assistant to create a `proguard-rules.pro` file under `androidApp` with rules to remove unused code. |  |  |
| [ ] | 106 | Optimize App Size and Memory Usage | 5.3 | Rebuild the release APK (`./gradlew androidApp:assembleRelease`) and re-install on the emulator to confirm size is now under 20 MB. |  |  |
| [ ] | 107 | Implement Efficient Model Loading | 5.4 | Ask the AI assistant to create `ModelLoader.kt` under `core/src/commonMain/kotlin/` that lazily loads a local LLM model only when requested, using file streaming. |  |  |
| [ ] | 108 | Implement Efficient Model Loading | 5.4 | Open `ModelLoader.kt` in Codespace and confirm it exposes `loadModel(modelName: String): LLMProvider`. |  |  |
| [ ] | 109 | Implement Efficient Model Loading | 5.4 | Ask the AI assistant to modify `ResponseCache` so that it clears older entries when memory footprint exceeds a set threshold (e.g., 50). |  |  |
| [ ] | 110 | Implement Efficient Model Loading | 5.4 | Write a test `ModelLoaderTest.kt` under `core/src/commonTest/kotlin/` that attempts to load a mock model file and verifies an `LLMProvider` is returned. |  |  |
| [ ] | 111 | Implement Efficient Model Loading | 5.4 | Run `./gradlew core:commonTest` and confirm `ModelLoaderTest` passes. |  |  |
| [ ] | 112 | Add Support for Model Quantization | 5.5 | Ask the AI assistant to add a method in `ModelLoader` to quantize a model file by calling a compression routine (even if mocked), saving a `.quant` version. |  |  |
| [ ] | 113 | Add Support for Model Quantization | 5.5 | Write a test `ModelQuantizationTest.kt` under `core/src/commonTest/kotlin/` verifying that invoking quantization on a dummy model file produces a `.quant` file. |  |  |
| [ ] | 114 | Add Support for Model Quantization | 5.5 | Run `./gradlew core:commonTest` and confirm `ModelQuantizationTest` passes. |  |  |
| [ ] | 115 | Conduct Performance Benchmarking | 5.6 | In Codespace, create a test named `PerformanceBenchmarkTest.kt` under `core/src/commonTest/kotlin/` that measures the time taken for `QueryProcessor` on a sample prompt with a mock provider. |  |  |
| [ ] | 116 | Conduct Performance Benchmarking | 5.6 | Run `./gradlew core:commonTest` and note the timing output to confirm it meets your target (e.g., < 2 s). |  |  |
| [ ] | 117 | Perform Load Testing | 5.7 | Ask the AI assistant to create a Gradle task under `androidApp/build.gradle.kts` named `loadTest` that simulates multiple back-to-back queries to measure memory usage. |  |  |
| [ ] | 118 | Perform Load Testing | 5.7 | Run `./gradlew androidApp:loadTest` in Codespace and inspect the printed memory usage logs to confirm no out-of-memory. |  |  |
| [ ] | 119 | Implement Secure Storage for API Keys | 6.1 | Ask the AI assistant to create a Kotlin file `SecureStorage.kt` under `core/src/commonMain/kotlin/` that encrypts and decrypts strings using AES-256, storing keys in Android’s Keystore in `androidApp`. |  |  |
| [ ] | 120 | Implement Secure Storage for API Keys | 6.1 | Open `SecureStorage.kt` in Codespace and confirm methods `encrypt(value: String): String` and `decrypt(value: String): String` exist. |  |  |
| [ ] | 121 | Implement Secure Storage for API Keys | 6.1 | Ask the AI assistant to modify `SettingsDatabase` in `androidApp` to store API keys in encrypted form using `SecureStorage`. |  |  |
| [ ] | 122 | Implement Secure Storage for API Keys | 6.1 | Write a test `SecureStorageTest.kt` under `core/src/commonTest/kotlin/` verifying that encrypt/decrypt round-trips a sample string. |  |  |
| [ ] | 123 | Implement Secure Storage for API Keys | 6.1 | Run `./gradlew core:commonTest` and confirm `SecureStorageTest` passes. |  |  |
| [ ] | 124 | Add Data Encryption | 6.2 | Ask the AI assistant to modify all HTTP calls in `NetworkUtils.kt` to use HTTPS only. |  |  |
| [ ] | 125 | Add Data Encryption | 6.2 | Review `NetworkUtils.kt` in Codespace and confirm that URLs start with `https://`. |  |  |
| [ ] | 126 | Implement Secure Network Communication | 6.3 | Ask the AI assistant to implement certificate pinning in `NetworkUtils` by adding code to verify the server’s TLS certificate fingerprint. |  |  |
| [ ] | 127 | Implement Secure Network Communication | 6.3 | Write a test `CertificatePinningTest.kt` under `core/src/commonTest/kotlin/` that simulates a certificate mismatch and expects a failure. |  |  |
| [ ] | 128 | Implement Secure Network Communication | 6.3 | Run `./gradlew core:commonTest` and confirm `CertificatePinningTest` passes. |  |  |
| [ ] | 129 | Add Privacy Policy and Terms of Service | 6.4 | Ask the AI assistant to review `build.gradle.kts` files in all modules and list each dependency with its version. |  |  |
| [ ] | 130 | Add Privacy Policy and Terms of Service | 6.4 | Open the consolidated dependency list in Codespace and ask the AI assistant to create a new file `DependencyVersions.md` with that information. |  |  |
| [ ] | 131 | Add Privacy Policy and Terms of Service | 6.4 | Ask the AI assistant to configure Dependabot by adding a `.github/dependabot.yml` file that checks monthly for updates in Gradle dependencies. |  |  |
| [ ] | 132 | Add Privacy Policy and Terms of Service | 6.4 | Push `.github/dependabot.yml` and confirm GitHub shows a pending Dependabot configuration. |  |  |
| [ ] | 133 | Write User Guides | 7.1 | Ask the AI assistant to draft a user guide named USER_GUIDE.md under `docs/` describing:

* How to install the Android app (enable Unknown Sources if needed)
* How to install the CLI on Linux (download JAR and run `java -jar askme.jar`)
 |  |  |
| [ ] | 134 | Write User Guides | 7.1 | Open USER_GUIDE.md and confirm it has separate sections “Android Installation” and “Linux CLI Installation”, each with step-by-step bullets. |  |  |
| [ ] | 135 | Create API Documentation | 7.2 | Ask the AI assistant to create API documentation by generating a file `API_DOCS.md` under `docs/`, listing each public function in the `core` module with a one-sentence description. |  |  |
| [ ] | 136 | Create API Documentation | 7.2 | Open API_DOCS.md and confirm methods like `QueryProcessor.processQuery()` and `ModelLoader.loadModel()` appear with descriptions. |  |  |
| [ ] | 137 | Document Setup and Installation | 7.3 | Ask the AI assistant to write setup and installation instructions in SETUP.md under `docs/`, describing how to:

* Mount the USB drive on Chromebook
* Clone the GitHub repo to the USB drive
* Export environment variables
* Build each module via Gradle
 |  |  |
| [ ] | 138 | Document Setup and Installation | 7.3 | Open SETUP.md in Codespace and confirm it lists commands such as `git clone`, `export JAVA_HOME=...`, `./gradlew core:build`, etc. |  |  |
| [ ] | 139 | Create Contribution Guidelines | 7.4 | Ask the AI assistant to create CONTRIBUTING.md under `docs/` explaining:

* How to open an issue
* How to branch and create a pull request
* Coding style guidelines (e.g., Detekt rules)
 |  |  |
| [ ] | 140 | Create Contribution Guidelines | 7.4 | Open CONTRIBUTING.md and confirm it has headings “Issues,” “Branching,” “Pull Requests,” and “Style Guidelines.” |  |  |
| [ ] | 141 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to gather screenshots:

* Launch the Android app in the emulator, take a screenshot of the chat screen, save it as `chat_screenshot.png`.
* Take a CLI screenshot of `cliApp` running a sample query, save as `cli_screenshot.png`.
 |  |  |
| [ ] | 142 | Prepare Play Store Assets | 7.5 | In Codespace, create a folder `androidApp/app/src/main/playStoreAssets/` and move `chat_screenshot.png` there. |  |  |
| [ ] | 143 | Prepare Play Store Assets | 7.5 | In Codespace, create a folder `docs/screenshots/` and move `cli_screenshot.png` there. |  |  |
| [ ] | 144 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to resize both screenshots to 1080 × 1920 (Android) and 800 × 600 (CLI) using any image tool; confirm sizes by running `ls -lh`. |  |  |
| [ ] | 145 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to configure Gradle in `androidApp` so that Play Store assets are included automatically when building the release APK. |  |  |
| [ ] | 146 | Prepare Play Store Assets | 7.5 | Open `androidApp/build.gradle.kts` and confirm that `playStoreAssets` is assigned to the correct source set. |  |  |
| [ ] | 147 | Create Release Checklists | 7.7 | Ask the AI assistant to draft a release checklist in `docs/ReleaseChecklist.md` containing steps:

* Confirm all tests pass
* Bump version in `gradle.properties` and `build.gradle.kts`
* Build signed APK
* Test on emulator/device
* Tag Git release and upload artifacts
 |  |  |
| [ ] | 148 | Create Release Checklists | 7.7 | Open `ReleaseChecklist.md` and confirm it lists each item in bullet form. |  |  |
| [ ] | 149 | Package Application | 7.8 | Ask the AI assistant to run `./gradlew androidApp:assembleDebug` and then manually test the debug APK on an emulator, confirming the chat UI loads. |  |  |
| [ ] | 150 | Package Application | 7.8 | Ask the AI assistant to run `./gradlew cliApp:installDist` and then execute `~/cliApp/build/install/cliApp/bin/cliApp`, typing “Hello” to confirm you see a response. |  |  |
| [ ] | 151 | Package Application | 7.8 | Confirm both manual tests succeed, then ask the AI assistant to update `ReleaseChecklist.md` marking “Manual smoke test” as done (for your own reference). |  |  |
| [ ] | 152 | Deploy to Test Environments | 7.9 | Ask the AI assistant to tag the commit in GitHub as `v1.0.0` by running `git tag v1.0.0 && git push origin v1.0.0`. |  |  |
| [ ] | 153 | Deploy to Test Environments | 7.9 | Open GitHub in your browser and confirm that a new release `v1.0.0` has been created automatically with attached APK and CLI JAR. |  |  |
| [ ] | 154 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to set up issue tracking by opening the GitHub repository Settings → Features → Issues and ensuring “Issues” is enabled. |  |  |
| [ ] | 155 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to create a new Issue template in `.github/ISSUE_TEMPLATE/bug_report.md` with fields “Title,” “Steps to Reproduce,” and “Expected Result.” |  |  |
| [ ] | 156 | Set Up Issue Tracking | 8.1 | Open `bug_report.md` in Codespace and confirm that placeholders appear for each field. |  |  |
| [ ] | 157 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to create a new issue template `feature_request.md` with fields “Feature Description” and “Use Case.” |  |  |
| [ ] | 158 | Set Up Issue Tracking | 8.1 | Open `feature_request.md` and confirm it lists “Feature Description” and “Use Case.” |  |  |
| [ ] | 159 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to set up automatic labeling by adding a `probot.yml` or GitHub Actions that labels new issues based on keywords (e.g., “bug,” “feature”). |  |  |
| [ ] | 160 | Create Feedback Collection System | 8.2 | Ask the AI assistant to create a feedback collection web form using a free service (e.g., Google Forms) and embed the link in README.md under “Feedback.” |  |  |
| [ ] | 161 | Create Feedback Collection System | 8.2 | Open README.md and confirm that “Feedback” now points to the Google Forms link. |  |  |
| [ ] | 162 | Prepare Support Documentation | 8.4 | Ask the AI assistant to create a post-release support document named SUPPORT.md under `docs/` listing:

* How to report a bug
* How to request a feature
* Expected response time (e.g., 48 hours)
 |  |  |
| [ ] | 163 | Prepare Support Documentation | 8.4 | Open SUPPORT.md and confirm that it contains the three bullet points. |  |  |
| [ ] | 164 | Monitor Application Performance | 8.5 | Ask the AI assistant to create a GitHub Actions workflow `monitor.yml` under `.github/workflows/` that runs daily and collects basic performance metrics (e.g., test coverage) and posts a summary comment on a pinned issue. |  |  |
| [ ] | 165 | Monitor Application Performance | 8.5 | Confirm in GitHub Actions that `monitor.yml` has been triggered at least once. |  |  |
| [ ] | 166 | Monitor Application Performance | 8.5 | Ask the AI assistant to monitor logs by running `adb logcat` on an Android emulator and filtering for your app’s tag (e.g., “ASKME”). |  |  |
| [ ] | 167 | Monitor Application Performance | 8.5 | Confirm that any runtime errors appear in the log. |  |  |
| [ ] | 168 | Monitor Application Performance | 8.5 | Ask the AI assistant to monitor CLI logs by running `tail -f ~/askme-cli-crash.log` while executing invalid commands to confirm errors are logged. |  |  |
| [ ] | 169 | Address Critical Bugs | 8.6 | Ask the AI assistant to fix any critical bugs identified during monitoring (e.g., null-pointer in `MainActivity`). |  |  |
| [ ] | 170 | Address Critical Bugs | 8.6 | After fixes, rerun `./gradlew core:check`, `androidApp:connectedAndroidTest`, and `cliApp:test` to confirm no regressions. |  |  |
| [ ] | 171 | Address Critical Bugs | 8.6 | Ask the AI assistant to create a new issue for each identified bug that remains unfixed, tagging them with “bug” and assigning them to the appropriate AI developer. |  |  |
| [ ] | 172 | Plan Feature Updates | 8.7 | Ask the AI assistant to draft a one-page “Next Steps” roadmap in `docs/Roadmap.md` listing possible features (e.g., multi-language support, advanced analytics). |  |  |
| [ ] | 173 | Plan Feature Updates | 8.7 | Open `Roadmap.md` and confirm it lists at least three future feature ideas with brief descriptions. |  |  |
| [ ] | 174 | Conduct User Research | UX.1 | Ask the AI assistant to define at least five research questions for user research (e.g., “How quickly can users start a conversation without guidance?”) and save them in `docs/UserResearchPlan.md`. |  |  |
| [ ] | 175 | Conduct User Research | UX.1 | Open `UserResearchPlan.md` and confirm it contains the five questions. |  |  |
| [ ] | 176 | Create Wireframes for New Features | UX.2 | Ask the AI assistant to create a wireframe document in PDF or image format named `wireframes/basic-chat-flow.png` showing how chat screens should look. |  |  |
| [ ] | 177 | Create Wireframes for New Features | UX.2 | In Codespace, open `wireframes/basic-chat-flow.png` to confirm the diagram is visible. |  |  |
| [ ] | 178 | Develop Design System | UX.3 | Ask the AI assistant to convert the wireframe into a design system by creating `androidApp/src/main/java/.../ui/design/Colors.kt`, `Typography.kt`, and `Shapes.kt` with placeholder values. |  |  |
| [ ] | 179 | Develop Design System | UX.3 | Open `Colors.kt` and confirm that primary, secondary, and background colors are defined. |  |  |
| [ ] | 180 | Develop Design System | UX.3 | Ask the AI assistant to update all Composables in `androidApp` to reference the new design system color and typography objects. |  |  |
| [ ] | 181 | Conduct Code Reviews | QA.4 | Run `./gradlew detekt` and fix any style violations introduced by the design system changes. |  |  |
| [ ] | 182 | Add Animations and Transitions | UX.5 | Ask the AI assistant to add animations by creating `anim/FadeIn.kt` under `androidApp/src/main/kotlin/.../anim` that defines a fade-in transition. |  |  |
| [ ] | 183 | Add Animations and Transitions | UX.5 | Open `MainActivity.kt` and modify the Composable call to wrap the chat message list in the `FadeIn` animation. |  |  |
| [ ] | 184 | Add Animations and Transitions | UX.5 | Ask the AI assistant to write a UI test `androidApp/src/androidTest/kotlin/AnimationTest.kt` verifying that the fade-in animation property is applied to the message list. |  |  |
| [ ] | 185 | Add Animations and Transitions | UX.5 | Run `./gradlew androidApp:connectedAndroidTest` and confirm `AnimationTest` passes. |  |  |
| [ ] | 186 | Optimize for Different Screen Sizes | UX.6 | Ask the AI assistant to update `AndroidManifest.xml` to include `android:supportsRtl="true"` and a `<uses-permission android:name="android.permission.INTERNET"/>` entry. |  |  |
| [ ] | 187 | Optimize for Different Screen Sizes | UX.6 | Open `AndroidManifest.xml` in Codespace to confirm the changes. |  |  |
| [ ] | 188 | Optimize for Different Screen Sizes | UX.6 | Ask the AI assistant to create a test `androidApp/src/androidTest/kotlin/ScreenSizeTest.kt` that launches the chat UI on multiple emulator configurations (phone, tablet) and verifies no layout overflow. |  |  |
| [ ] | 189 | Optimize for Different Screen Sizes | UX.6 | Run `./gradlew androidApp:connectedAndroidTest` on two emulator profiles (e.g., Pixel 3 XL and Pixel C) and confirm `ScreenSizeTest` passes. |  |  |
| [ ] | 190 | Expand Test Coverage | QA.1 | Ask the AI assistant to add more unit tests in `core/src/commonTest/kotlin/` to cover error cases in `OllamaProvider` (e.g., service not running). |  |  |
| [ ] | 191 | Expand Test Coverage | QA.1 | Run `./gradlew core:commonTest` and confirm all new tests pass. |  |  |
| [ ] | 192 | Implement UI Automation | QA.2 | Ask the AI assistant to set up UI automation for the CLI by creating a script `scripts/cli_automation.sh` that runs the CLI with predefined input and verifies the output matches expected patterns. |  |  |
| [ ] | 193 | Implement UI Automation | QA.2 | In the Chromebook terminal, run `bash scripts/cli_automation.sh` and confirm it prints “All tests passed” if output is correct. |  |  |
| [ ] | 194 | Set Up Performance Regression Testing | QA.3 | Ask the AI assistant to add a performance regression test for the Android app by creating `androidApp/src/androidTest/kotlin/PerformanceRegressionTest.kt` that measures response time before and after a code change. |  |  |
| [ ] | 195 | Set Up Performance Regression Testing | QA.3 | Run `./gradlew androidApp:connectedAndroidTest --tests PerformanceRegressionTest` and confirm it prints the measured times. |  |  |
| [ ] | 196 | Conduct Code Reviews | QA.4 | Ask the AI assistant to schedule a weekly code review by adding a calendar event (calendar platform of your choice) with invitees set to “DevBot-A,” “DevBot-B,” and “TestBot-C.” |  |  |
| [ ] | 197 | Conduct Code Reviews | QA.4 | Confirm the calendar event exists and is set to recur every Monday at 10 AM local time. |  |  |
| [ ] | 198 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to create a GitHub issue labeled “Security Audit” and assign it to “SecBot-E.” |  |  |
| [ ] | 199 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to create a GitHub issue labeled “Penetration Testing” and assign it to “SecBot-E.” |  |  |
| [ ] | 200 | Validate No Data Leakage | QA.6 | Ask the AI assistant to create a GitHub issue labeled “No Data Leakage Validation” and assign it to “TestBot-C.” |  |  |
| [ ] | 201 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to draft a security audit plan named `docs/SecurityAuditPlan.md` that lists steps:

* Review encryption code
* Verify storage permissions
* Check network calls
* Inspect third-party libraries for vulnerabilities
 |  |  |
| [ ] | 202 | Perform Regular Security Audits | QA.5 | Open `SecurityAuditPlan.md` and confirm it contains the four steps. |  |  |
| [ ] | 203 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to run a static analysis tool (e.g., SpotBugs for JVM) on the project and save the report as `reports/static-analysis.html`. |  |  |
| [ ] | 204 | Perform Regular Security Audits | QA.5 | Open `static-analysis.html` in Codespace or download it to confirm it shows no critical issues. |  |  |
| [ ] | 205 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to draft a penetration testing checklist named `docs/PenTestChecklist.md` listing:

* Attempt unauthorized file access
* Simulate man-in-the-middle on network calls
* Test for SQL injection in any database queries
* Validate secure deletion of user data
 |  |  |
| [ ] | 206 | Conduct Penetration Testing | QA.5 | Open `PenTestChecklist.md` and confirm it contains four bullet points. |  |  |
| [ ] | 207 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to run an SQL injection simulation by calling a modified `SettingsDatabase` query with a string like `"' OR '1'='1"` and confirm no data leak occurs. |  |  |
| [ ] | 208 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to run a man-in-the-middle simulation on a local HTTP proxy to ensure certificate pinning in `NetworkUtils` blocks the connection. |  |  |
| [ ] | 209 | Validate Secure Deletion of Data | QA.6 | Ask the AI assistant to test deleting stored user data by resetting the app to clear databases and confirm no leftover files remain under the app’s data directory. |  |  |
| [ ] | 210 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to update SecurityAuditPlan.md with results from each of the four security checks. |  |  |
| [ ] | 211 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to produce a summary report named `docs/SecuritySummary.md` stating “No critical vulnerabilities found” if all checks passed. |  |  |
| [ ] | 212 | Write User Guides | 7.1 | Ask the AI assistant to draft USER_GUIDE.md under `docs/` if not already done, ensuring it explains how to:

* Install Android APK (enable Unknown Sources)
* Run CLI JAR (`java -jar askme.jar`)
* Configure models via Settings or config.json
 |  |  |
| [ ] | 213 | Write User Guides | 7.1 | Open USER_GUIDE.md in Codespace and confirm it has three main sections with step-by-step bullet points. |  |  |
| [ ] | 214 | Create API Documentation | 7.2 | Ask the AI assistant to update API_DOCS.md by adding a new section “Core Data Models” and listing data classes `LLMProvider`, `QueryResult`, and `ModelInfo`. |  |  |
| [ ] | 215 | Create API Documentation | 7.2 | Open API_DOCS.md and confirm the new section appears with brief descriptions. |  |  |
| [ ] | 216 | Document Setup and Installation | 7.3 | Ask the AI assistant to write SETUP.md under `docs/` if missing, explaining how to:

* How to open the Codespace in GitHub
* How to mount the USB drive on Chromebook
* How to set environment variables (JAVA_HOME, ANDROID_SDK_ROOT, GRADLE_USER_HOME)
* How to run `./gradlew core:build`, `./gradlew androidApp:assembleDebug`, and `./gradlew cliApp:installDist`
 |  |  |
| [ ] | 217 | Document Setup and Installation | 7.3 | Open SETUP.md in Codespace and confirm it lists these four steps clearly. |  |  |
| [ ] | 218 | Create Contribution Guidelines | 7.4 | Ask the AI assistant to create CONTRIBUTING.md under `docs/` if not present, explaining:

* How to fork and clone the repo
* How to create a branch (`git checkout -b feature/xyz`)
* How to run tests locally (`./gradlew test`)
* How to format code according to Detekt rules
* How to submit a pull request on GitHub
 |  |  |
| [ ] | 219 | Create Contribution Guidelines | 7.4 | Open CONTRIBUTING.md and confirm it contains five bullet points. |  |  |
| [ ] | 220 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to gather screenshots:

* Launch the Android app in the emulator, take a screenshot of the chat screen, save it as `chat_screenshot.png`.
* Take a CLI screenshot of `cliApp` running a sample query, save as `cli_screenshot.png`.
 |  |  |
| [ ] | 221 | Prepare Play Store Assets | 7.5 | In Codespace, create a folder `androidApp/app/src/main/playStoreAssets/` and move `chat_screenshot.png` there. |  |  |
| [ ] | 222 | Prepare Play Store Assets | 7.5 | In Codespace, create a folder `docs/screenshots/` and move `cli_screenshot.png` there. |  |  |
| [ ] | 223 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to resize both screenshots to 1080 × 1920 (Android) and 800 × 600 (CLI) using any image tool; confirm sizes by running `ls -lh`. |  |  |
| [ ] | 224 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to configure Gradle in `androidApp` so that Play Store assets are included automatically when building the release APK. |  |  |
| [ ] | 225 | Prepare Play Store Assets | 7.5 | Open `androidApp/build.gradle.kts` and confirm that `playStoreAssets` is assigned to the correct source set. |  |  |
| [ ] | 226 | Create Release Checklists | 7.7 | Ask the AI assistant to draft a release checklist in `docs/ReleaseChecklist.md` containing steps:

* Confirm all tests pass
* Bump version in `gradle.properties` and `build.gradle.kts`
* Build signed APK
* Test on emulator/device
* Tag Git release and upload artifacts
 |  |  |
| [ ] | 227 | Create Release Checklists | 7.7 | Open `ReleaseChecklist.md` and confirm it lists each item in bullet form. |  |  |
| [ ] | 228 | Package Application | 7.8 | Ask the AI assistant to run `./gradlew androidApp:assembleDebug` and then manually test the debug APK on an emulator, confirming the chat UI loads. |  |  |
| [ ] | 229 | Package Application | 7.8 | Ask the AI assistant to run `./gradlew cliApp:installDist` and then execute `~/cliApp/build/install/cliApp/bin/cliApp`, typing “Hello” to confirm you see a response. |  |  |
| [ ] | 230 | Package Application | 7.8 | Confirm both manual tests succeed, then ask the AI assistant to update `ReleaseChecklist.md` marking “Manual smoke test” as done (for your own reference). |  |  |
| [ ] | 231 | Deploy to Test Environments | 7.9 | Ask the AI assistant to tag the commit in GitHub as `v1.0.0` by running `git tag v1.0.0 && git push origin v1.0.0`. |  |  |
| [ ] | 232 | Deploy to Test Environments | 7.9 | Open GitHub in your browser and confirm that a new release `v1.0.0` has been created automatically with attached APK and CLI JAR. |  |  |
| [ ] | 233 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to set up issue tracking by opening the GitHub repository Settings → Features → Issues and ensuring “Issues” is enabled. |  |  |
| [ ] | 234 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to create a new Issue template in `.github/ISSUE_TEMPLATE/bug_report.md` with fields “Title,” “Steps to Reproduce,” and “Expected Result.” |  |  |
| [ ] | 235 | Set Up Issue Tracking | 8.1 | Open `bug_report.md` in Codespace and confirm that placeholders appear for each field. |  |  |
| [ ] | 236 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to create a new issue template `feature_request.md` with fields “Feature Description” and “Use Case.” |  |  |
| [ ] | 237 | Set Up Issue Tracking | 8.1 | Open `feature_request.md` and confirm it lists “Feature Description” and “Use Case.” |  |  |
| [ ] | 238 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to set up automatic labeling by adding a `probot.yml` or GitHub Actions that labels new issues based on keywords (e.g., “bug,” “feature”). |  |  |
| [ ] | 239 | Create Feedback Collection System | 8.2 | Ask the AI assistant to create a feedback collection web form using a free service (e.g., Google Forms) and embed the link in README.md under “Feedback.” |  |  |
| [ ] | 240 | Create Feedback Collection System | 8.2 | Open README.md and confirm that “Feedback” now points to the Google Forms link. |  |  |
| [ ] | 241 | Prepare Support Documentation | 8.4 | Ask the AI assistant to create a post-release support document named SUPPORT.md under `docs/` listing:

* How to report a bug
* How to request a feature
* Expected response time (e.g., 48 hours)
 |  |  |
| [ ] | 242 | Prepare Support Documentation | 8.4 | Open SUPPORT.md and confirm that it contains the three bullet points. |  |  |
| [ ] | 243 | Monitor Application Performance | 8.5 | Ask the AI assistant to create a GitHub Actions workflow `monitor.yml` under `.github/workflows/` that runs daily and collects basic performance metrics (e.g., test coverage) and posts a summary comment on a pinned issue. |  |  |
| [ ] | 244 | Monitor Application Performance | 8.5 | Confirm in GitHub Actions that `monitor.yml` has been triggered at least once. |  |  |
| [ ] | 245 | Monitor Application Performance | 8.5 | Ask the AI assistant to monitor logs by running `adb logcat` on an Android emulator and filtering for your app’s tag (e.g., “ASKME”). |  |  |
| [ ] | 246 | Monitor Application Performance | 8.5 | Confirm that any runtime errors appear in the log. |  |  |
| [ ] | 247 | Monitor Application Performance | 8.5 | Ask the AI assistant to monitor CLI logs by running `tail -f ~/askme-cli-crash.log` while executing invalid commands to confirm errors are logged. |  |  |
| [ ] | 248 | Address Critical Bugs | 8.6 | Ask the AI assistant to fix any critical bugs identified during monitoring (e.g., null-pointer in `MainActivity`). |  |  |
| [ ] | 249 | Address Critical Bugs | 8.6 | After fixes, rerun `./gradlew core:check`, `androidApp:connectedAndroidTest`, and `cliApp:test` to confirm no regressions. |  |  |
| [ ] | 250 | Address Critical Bugs | 8.6 | Ask the AI assistant to create a new issue for each identified bug that remains unfixed, tagging them with “bug” and assigning them to the appropriate AI developer. |  |  |
| [ ] | 251 | Plan Feature Updates | 8.7 | Ask the AI assistant to draft a one-page “Next Steps” roadmap in `docs/Roadmap.md` listing possible features (e.g., multi-language support, advanced analytics). |  |  |
| [ ] | 252 | Plan Feature Updates | 8.7 | Open `Roadmap.md` and confirm it lists at least three future feature ideas with brief descriptions. |  |  |
| [ ] | 253 | Conduct User Research | UX.1 | Ask the AI assistant to define at least five research questions for user research (e.g., “How quickly can users start a conversation without guidance?”) and save them in `docs/UserResearchPlan.md`. |  |  |
| [ ] | 254 | Conduct User Research | UX.1 | Open `UserResearchPlan.md` and confirm it contains the five questions. |  |  |
| [ ] | 255 | Create Wireframes for New Features | UX.2 | Ask the AI assistant to create a wireframe document in PDF or image format named `wireframes/basic-chat-flow.png` showing how chat screens should look. |  |  |
| [ ] | 256 | Create Wireframes for New Features | UX.2 | In Codespace, open `wireframes/basic-chat-flow.png` to confirm the diagram is visible. |  |  |
| [ ] | 257 | Develop Design System | UX.3 | Ask the AI assistant to convert the wireframe into a design system by creating `androidApp/src/main/java/.../ui/design/Colors.kt`, `Typography.kt`, and `Shapes.kt` with placeholder values. |  |  |
| [ ] | 258 | Develop Design System | UX.3 | Open `Colors.kt` and confirm that primary, secondary, and background colors are defined. |  |  |
| [ ] | 259 | Develop Design System | UX.3 | Ask the AI assistant to update all Composables in `androidApp` to reference the new design system color and typography objects. |  |  |
| [ ] | 260 | Conduct Code Reviews | QA.4 | Run `./gradlew detekt` and fix any style violations introduced by the design system changes. |  |  |
| [ ] | 261 | Add Animations and Transitions | UX.5 | Ask the AI assistant to add animations by creating `anim/FadeIn.kt` under `androidApp/src/main/kotlin/.../anim` that defines a fade-in transition. |  |  |
| [ ] | 262 | Add Animations and Transitions | UX.5 | Open `MainActivity.kt` and modify the Composable call to wrap the chat message list in the `FadeIn` animation. |  |  |
| [ ] | 263 | Add Animations and Transitions | UX.5 | Ask the AI assistant to write a UI test `androidApp/src/androidTest/kotlin/AnimationTest.kt` verifying that the fade-in animation property is applied to the message list. |  |  |
| [ ] | 264 | Add Animations and Transitions | UX.5 | Run `./gradlew androidApp:connectedAndroidTest` and confirm `AnimationTest` passes. |  |  |
| [ ] | 265 | Optimize for Different Screen Sizes | UX.6 | Ask the AI assistant to update `AndroidManifest.xml` to include `android:supportsRtl="true"` and a `<uses-permission android:name="android.permission.INTERNET"/>` entry. |  |  |
| [ ] | 266 | Optimize for Different Screen Sizes | UX.6 | Open `AndroidManifest.xml` in Codespace to confirm the changes. |  |  |
| [ ] | 267 | Optimize for Different Screen Sizes | UX.6 | Ask the AI assistant to create a test `androidApp/src/androidTest/kotlin/ScreenSizeTest.kt` that launches the chat UI on multiple emulator configurations (phone, tablet) and verifies no layout overflow. |  |  |
| [ ] | 268 | Optimize for Different Screen Sizes | UX.6 | Run `./gradlew androidApp:connectedAndroidTest` on two emulator profiles (e.g., Pixel 3 XL and Pixel C) and confirm `ScreenSizeTest` passes. |  |  |
| [ ] | 269 | Expand Test Coverage | QA.1 | Ask the AI assistant to add more unit tests in `core/src/commonTest/kotlin/` to cover error cases in `OllamaProvider` (e.g., service not running). |  |  |
| [ ] | 270 | Expand Test Coverage | QA.1 | Run `./gradlew core:commonTest` and confirm all new tests pass. |  |  |
| [ ] | 271 | Implement UI Automation | QA.2 | Ask the AI assistant to set up UI automation for the CLI by creating a script `scripts/cli_automation.sh` that runs the CLI with predefined input and verifies the output matches expected patterns. |  |  |
| [ ] | 272 | Implement UI Automation | QA.2 | In the Chromebook terminal, run `bash scripts/cli_automation.sh` and confirm it prints “All tests passed” if output is correct. |  |  |
| [ ] | 273 | Set Up Performance Regression Testing | QA.3 | Ask the AI assistant to add a performance regression test for the Android app by creating `androidApp/src/androidTest/kotlin/PerformanceRegressionTest.kt` that measures response time before and after a code change. |  |  |
| [ ] | 274 | Set Up Performance Regression Testing | QA.3 | Run `./gradlew androidApp:connectedAndroidTest --tests PerformanceRegressionTest` and confirm it prints the measured times. |  |  |
| [ ] | 275 | Conduct Code Reviews | QA.4 | Ask the AI assistant to schedule a weekly code review by adding a calendar event (calendar platform of your choice) with invitees set to “DevBot-A,” “DevBot-B,” and “TestBot-C.” |  |  |
| [ ] | 276 | Conduct Code Reviews | QA.4 | Confirm the calendar event exists and is set to recur every Monday at 10 AM local time. |  |  |
| [ ] | 277 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to create a GitHub issue labeled “Security Audit” and assign it to “SecBot-E.” |  |  |
| [ ] | 278 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to create a GitHub issue labeled “Penetration Testing” and assign it to “SecBot-E.” |  |  |
| [ ] | 279 | Validate No Data Leakage | QA.6 | Ask the AI assistant to create a GitHub issue labeled “No Data Leakage Validation” and assign it to “TestBot-C.” |  |  |
| [ ] | 280 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to draft a security audit plan named `docs/SecurityAuditPlan.md` that lists steps:

* Review encryption code
* Verify storage permissions
* Check network calls
* Inspect third-party libraries for vulnerabilities
 |  |  |
| [ ] | 281 | Perform Regular Security Audits | QA.5 | Open `SecurityAuditPlan.md` and confirm it contains the four steps. |  |  |
| [ ] | 282 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to run a static analysis tool (e.g., SpotBugs for JVM) on the project and save the report as `reports/static-analysis.html`. |  |  |
| [ ] | 283 | Perform Regular Security Audits | QA.5 | Open `static-analysis.html` in Codespace or download it to confirm it shows no critical issues. |  |  |
| [ ] | 284 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to draft a penetration testing checklist named `docs/PenTestChecklist.md` listing:

* Attempt unauthorized file access
* Simulate man-in-the-middle on network calls
* Test for SQL injection in any database queries
* Validate secure deletion of user data
 |  |  |
| [ ] | 285 | Conduct Penetration Testing | QA.5 | Open `PenTestChecklist.md` and confirm it contains four bullet points. |  |  |
| [ ] | 286 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to run an SQL injection simulation by calling a modified `SettingsDatabase` query with a string like `"' OR '1'='1"` and confirm no data leak occurs. |  |  |
| [ ] | 287 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to run a man-in-the-middle simulation on a local HTTP proxy to ensure certificate pinning in `NetworkUtils` blocks the connection. |  |  |
| [ ] | 288 | Validate Secure Deletion of Data | QA.6 | Ask the AI assistant to test deleting stored user data by resetting the app to clear databases and confirm no leftover files remain under the app’s data directory. |  |  |
| [ ] | 289 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to update SecurityAuditPlan.md with results from each of the four security checks. |  |  |
| [ ] | 290 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to produce a summary report named `docs/SecuritySummary.md` stating “No critical vulnerabilities found” if all checks passed. |  |  |
| [ ] | 291 | Write User Guides | 7.1 | Ask the AI assistant to draft USER_GUIDE.md under `docs/` if not already done, ensuring it explains how to:

* Install Android APK (enable Unknown Sources)
* Run CLI JAR (`java -jar askme.jar`)
* Configure models via Settings or config.json
 |  |  |
| [ ] | 292 | Write User Guides | 7.1 | Open USER_GUIDE.md in Codespace and confirm it has three main sections with step-by-step bullet points. |  |  |
| [ ] | 293 | Create API Documentation | 7.2 | Ask the AI assistant to update API_DOCS.md by adding a new section “Core Data Models” and listing data classes `LLMProvider`, `QueryResult`, and `ModelInfo`. |  |  |
| [ ] | 294 | Create API Documentation | 7.2 | Open API_DOCS.md and confirm the new section appears with brief descriptions. |  |  |
| [ ] | 295 | Document Setup and Installation | 7.3 | Ask the AI assistant to write SETUP.md under `docs/` if missing, explaining how to:

* How to open the Codespace in GitHub
* How to mount the USB drive on Chromebook
* How to set environment variables (JAVA_HOME, ANDROID_SDK_ROOT, GRADLE_USER_HOME)
* How to run `./gradlew core:build`, `./gradlew androidApp:assembleDebug`, and `./gradlew cliApp:installDist`
 |  |  |
| [ ] | 296 | Document Setup and Installation | 7.3 | Open SETUP.md in Codespace and confirm it lists these four steps clearly. |  |  |
| [ ] | 297 | Create Contribution Guidelines | 7.4 | Ask the AI assistant to create CONTRIBUTING.md under `docs/` if not present, explaining:

* How to fork and clone the repo
* How to create a branch (`git checkout -b feature/xyz`)
* How to run tests locally (`./gradlew test`)
* How to format code according to Detekt rules
* How to submit a pull request on GitHub
 |  |  |
| [ ] | 298 | Create Contribution Guidelines | 7.4 | Open CONTRIBUTING.md and confirm it contains five bullet points. |  |  |
| [ ] | 299 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to gather screenshots:

* Launch the Android app in the emulator, take a screenshot of the chat screen, save it as `chat_screenshot.png`.
* Take a CLI screenshot of `cliApp` running a sample query, save as `cli_screenshot.png`.
 |  |  |
| [ ] | 300 | Prepare Play Store Assets | 7.5 | In Codespace, create a folder `androidApp/app/src/main/playStoreAssets/` and move `chat_screenshot.png` there. |  |  |
| [ ] | 301 | Prepare Play Store Assets | 7.5 | In Codespace, create a folder `docs/screenshots/` and move `cli_screenshot.png` there. |  |  |
| [ ] | 302 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to resize both screenshots to 1080 × 1920 (Android) and 800 × 600 (CLI) using any image tool; confirm sizes by running `ls -lh`. |  |  |
| [ ] | 303 | Prepare Play Store Assets | 7.5 | Ask the AI assistant to configure Gradle in `androidApp` so that Play Store assets are included automatically when building the release APK. |  |  |
| [ ] | 304 | Prepare Play Store Assets | 7.5 | Open `androidApp/build.gradle.kts` and confirm that `playStoreAssets` is assigned to the correct source set. |  |  |
| [ ] | 305 | Create Release Checklists | 7.7 | Ask the AI assistant to draft a release checklist in `docs/ReleaseChecklist.md` containing steps:

* Confirm all tests pass
* Bump version in `gradle.properties` and `build.gradle.kts`
* Build signed APK
* Test on emulator/device
* Tag Git release and upload artifacts
 |  |  |
| [ ] | 306 | Create Release Checklists | 7.7 | Open `ReleaseChecklist.md` and confirm it lists each item in bullet form. |  |  |
| [ ] | 307 | Package Application | 7.8 | Ask the AI assistant to run `./gradlew androidApp:assembleDebug` and then manually test the debug APK on an emulator, confirming the chat UI loads. |  |  |
| [ ] | 308 | Package Application | 7.8 | Ask the AI assistant to run `./gradlew cliApp:installDist` and then execute `~/cliApp/build/install/cliApp/bin/cliApp`, typing “Hello” to confirm you see a response. |  |  |
| [ ] | 309 | Package Application | 7.8 | Confirm both manual tests succeed, then ask the AI assistant to update `ReleaseChecklist.md` marking “Manual smoke test” as done (for your own reference). |  |  |
| [ ] | 310 | Deploy to Test Environments | 7.9 | Ask the AI assistant to tag the commit in GitHub as `v1.0.0` by running `git tag v1.0.0 && git push origin v1.0.0`. |  |  |
| [ ] | 311 | Deploy to Test Environments | 7.9 | Open GitHub in your browser and confirm that a new release `v1.0.0` has been created automatically with attached APK and CLI JAR. |  |  |
| [ ] | 312 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to set up issue tracking by opening the GitHub repository Settings → Features → Issues and ensuring “Issues” is enabled. |  |  |
| [ ] | 313 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to create a new Issue template in `.github/ISSUE_TEMPLATE/bug_report.md` with fields “Title,” “Steps to Reproduce,” and “Expected Result.” |  |  |
| [ ] | 314 | Set Up Issue Tracking | 8.1 | Open `bug_report.md` in Codespace and confirm that placeholders appear for each field. |  |  |
| [ ] | 315 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to create a new issue template `feature_request.md` with fields “Feature Description” and “Use Case.” |  |  |
| [ ] | 316 | Set Up Issue Tracking | 8.1 | Open `feature_request.md` and confirm it lists “Feature Description” and “Use Case.” |  |  |
| [ ] | 317 | Set Up Issue Tracking | 8.1 | Ask the AI assistant to set up automatic labeling by adding a `probot.yml` or GitHub Actions that labels new issues based on keywords (e.g., “bug,” “feature”). |  |  |
| [ ] | 318 | Create Feedback Collection System | 8.2 | Ask the AI assistant to create a feedback collection web form using a free service (e.g., Google Forms) and embed the link in README.md under “Feedback.” |  |  |
| [ ] | 319 | Create Feedback Collection System | 8.2 | Open README.md and confirm that “Feedback” now points to the Google Forms link. |  |  |
| [ ] | 320 | Prepare Support Documentation | 8.4 | Ask the AI assistant to create a post-release support document named SUPPORT.md under `docs/` listing:

* How to report a bug
* How to request a feature
* Expected response time (e.g., 48 hours)
 |  |  |
| [ ] | 321 | Prepare Support Documentation | 8.4 | Open SUPPORT.md and confirm that it contains the three bullet points. |  |  |
| [ ] | 322 | Monitor Application Performance | 8.5 | Ask the AI assistant to create a GitHub Actions workflow `monitor.yml` under `.github/workflows/` that runs daily and collects basic performance metrics (e.g., test coverage) and posts a summary comment on a pinned issue. |  |  |
| [ ] | 323 | Monitor Application Performance | 8.5 | Confirm in GitHub Actions that `monitor.yml` has been triggered at least once. |  |  |
| [ ] | 324 | Monitor Application Performance | 8.5 | Ask the AI assistant to monitor logs by running `adb logcat` on an Android emulator and filtering for your app’s tag (e.g., “ASKME”). |  |  |
| [ ] | 325 | Monitor Application Performance | 8.5 | Confirm that any runtime errors appear in the log. |  |  |
| [ ] | 326 | Monitor Application Performance | 8.5 | Ask the AI assistant to monitor CLI logs by running `tail -f ~/askme-cli-crash.log` while executing invalid commands to confirm errors are logged. |  |  |
| [ ] | 327 | Address Critical Bugs | 8.6 | Ask the AI assistant to fix any critical bugs identified during monitoring (e.g., null-pointer in `MainActivity`). |  |  |
| [ ] | 328 | Address Critical Bugs | 8.6 | After fixes, rerun `./gradlew core:check`, `androidApp:connectedAndroidTest`, and `cliApp:test` to confirm no regressions. |  |  |
| [ ] | 329 | Address Critical Bugs | 8.6 | Ask the AI assistant to create a new issue for each identified bug that remains unfixed, tagging them with “bug” and assigning them to the appropriate AI developer. |  |  |
| [ ] | 330 | Plan Feature Updates | 8.7 | Ask the AI assistant to draft a one-page “Next Steps” roadmap in `docs/Roadmap.md` listing possible features (e.g., multi-language support, advanced analytics). |  |  |
| [ ] | 331 | Plan Feature Updates | 8.7 | Open `Roadmap.md` and confirm it lists at least three future feature ideas with brief descriptions. |  |  |
| [ ] | 332 | Conduct User Research | UX.1 | Ask the AI assistant to define at least five research questions for user research (e.g., “How quickly can users start a conversation without guidance?”) and save them in `docs/UserResearchPlan.md`. |  |  |
| [ ] | 333 | Conduct User Research | UX.1 | Open `UserResearchPlan.md` and confirm it contains the five questions. |  |  |
| [ ] | 334 | Create Wireframes for New Features | UX.2 | Ask the AI assistant to create a wireframe document in PDF or image format named `wireframes/basic-chat-flow.png` showing how chat screens should look. |  |  |
| [ ] | 335 | Create Wireframes for New Features | UX.2 | In Codespace, open `wireframes/basic-chat-flow.png` to confirm the diagram is visible. |  |  |
| [ ] | 336 | Develop Design System | UX.3 | Ask the AI assistant to convert the wireframe into a design system by creating `androidApp/src/main/java/.../ui/design/Colors.kt`, `Typography.kt`, and `Shapes.kt` with placeholder values. |  |  |
| [ ] | 337 | Develop Design System | UX.3 | Open `Colors.kt` and confirm that primary, secondary, and background colors are defined. |  |  |
| [ ] | 338 | Develop Design System | UX.3 | Ask the AI assistant to update all Composables in `androidApp` to reference the new design system color and typography objects. |  |  |
| [ ] | 339 | Conduct Code Reviews | QA.4 | Run `./gradlew detekt` and fix any style violations introduced by the design system changes. |  |  |
| [ ] | 340 | Add Animations and Transitions | UX.5 | Ask the AI assistant to add animations by creating `anim/FadeIn.kt` under `androidApp/src/main/kotlin/.../anim` that defines a fade-in transition. |  |  |
| [ ] | 341 | Add Animations and Transitions | UX.5 | Open `MainActivity.kt` and modify the Composable call to wrap the chat message list in the `FadeIn` animation. |  |  |
| [ ] | 342 | Add Animations and Transitions | UX.5 | Ask the AI assistant to write a UI test `androidApp/src/androidTest/kotlin/AnimationTest.kt` verifying that the fade-in animation property is applied to the message list. |  |  |
| [ ] | 343 | Add Animations and Transitions | UX.5 | Run `./gradlew androidApp:connectedAndroidTest` and confirm `AnimationTest` passes. |  |  |
| [ ] | 344 | Optimize for Different Screen Sizes | UX.6 | Ask the AI assistant to update `AndroidManifest.xml` to include `android:supportsRtl="true"` and a `<uses-permission android:name="android.permission.INTERNET"/>` entry. |  |  |
| [ ] | 345 | Optimize for Different Screen Sizes | UX.6 | Open `AndroidManifest.xml` in Codespace to confirm the changes. |  |  |
| [ ] | 346 | Optimize for Different Screen Sizes | UX.6 | Ask the AI assistant to create a test `androidApp/src/androidTest/kotlin/ScreenSizeTest.kt` that launches the chat UI on multiple emulator configurations (phone, tablet) and verifies no layout overflow. |  |  |
| [ ] | 347 | Optimize for Different Screen Sizes | UX.6 | Run `./gradlew androidApp:connectedAndroidTest` on two emulator profiles (e.g., Pixel 3 XL and Pixel C) and confirm `ScreenSizeTest` passes. |  |  |
| [ ] | 348 | Expand Test Coverage | QA.1 | Ask the AI assistant to add more unit tests in `core/src/commonTest/kotlin/` to cover error cases in `OllamaProvider` (e.g., service not running). |  |  |
| [ ] | 349 | Expand Test Coverage | QA.1 | Run `./gradlew core:commonTest` and confirm all new tests pass. |  |  |
| [ ] | 350 | Implement UI Automation | QA.2 | Ask the AI assistant to set up UI automation for the CLI by creating a script `scripts/cli_automation.sh` that runs the CLI with predefined input and verifies the output matches expected patterns. |  |  |
| [ ] | 351 | Implement UI Automation | QA.2 | In the Chromebook terminal, run `bash scripts/cli_automation.sh` and confirm it prints “All tests passed” if output is correct. |  |  |
| [ ] | 352 | Set Up Performance Regression Testing | QA.3 | Ask the AI assistant to add a performance regression test for the Android app by creating `androidApp/src/androidTest/kotlin/PerformanceRegressionTest.kt` that measures response time before and after a code change. |  |  |
| [ ] | 353 | Set Up Performance Regression Testing | QA.3 | Run `./gradlew androidApp:connectedAndroidTest --tests PerformanceRegressionTest` and confirm it prints the measured times. |  |  |
| [ ] | 354 | Conduct Code Reviews | QA.4 | Ask the AI assistant to schedule a weekly code review by adding a calendar event (calendar platform of your choice) with invitees set to “DevBot-A,” “DevBot-B,” and “TestBot-C.” |  |  |
| [ ] | 355 | Conduct Code Reviews | QA.4 | Confirm the calendar event exists and is set to recur every Monday at 10 AM local time. |  |  |
| [ ] | 356 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to create a GitHub issue labeled “Security Audit” and assign it to “SecBot-E.” |  |  |
| [ ] | 357 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to create a GitHub issue labeled “Penetration Testing” and assign it to “SecBot-E.” |  |  |
| [ ] | 358 | Validate No Data Leakage | QA.6 | Ask the AI assistant to create a GitHub issue labeled “No Data Leakage Validation” and assign it to “TestBot-C.” |  |  |
| [ ] | 359 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to draft a security audit plan named `docs/SecurityAuditPlan.md` that lists steps:

* Review encryption code
* Verify storage permissions
* Check network calls
* Inspect third-party libraries for vulnerabilities
 |  |  |
| [ ] | 360 | Perform Regular Security Audits | QA.5 | Open `SecurityAuditPlan.md` and confirm it contains the four steps. |  |  |
| [ ] | 361 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to run a static analysis tool (e.g., SpotBugs for JVM) on the project and save the report as `reports/static-analysis.html`. |  |  |
| [ ] | 362 | Perform Regular Security Audits | QA.5 | Open `static-analysis.html` in Codespace or download it to confirm it shows no critical issues. |  |  |
| [ ] | 363 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to draft a penetration testing checklist named `docs/PenTestChecklist.md` listing:

* Attempt unauthorized file access
* Simulate man-in-the-middle on network calls
* Test for SQL injection in any database queries
* Validate secure deletion of user data
 |  |  |
| [ ] | 364 | Conduct Penetration Testing | QA.5 | Open `PenTestChecklist.md` and confirm it contains four bullet points. |  |  |
| [ ] | 365 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to run an SQL injection simulation by calling a modified `SettingsDatabase` query with a string like `"' OR '1'='1"` and confirm no data leak occurs. |  |  |
| [ ] | 366 | Conduct Penetration Testing | QA.5 | Ask the AI assistant to run a man-in-the-middle simulation on a local HTTP proxy to ensure certificate pinning in `NetworkUtils` blocks the connection. |  |  |
| [ ] | 367 | Validate Secure Deletion of Data | QA.6 | Ask the AI assistant to test deleting stored user data by resetting the app to clear databases and confirm no leftover files remain under the app’s data directory. |  |  |
| [ ] | 368 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to update SecurityAuditPlan.md with results from each of the four security checks. |  |  |
| [ ] | 369 | Perform Regular Security Audits | QA.5 | Ask the AI assistant to update `docs/SecuritySummary.md` stating “No critical vulnerabilities found,” or update if not. |  |  |
| [ ] | 370 | Draft or Update User Guide Document | 10.18 | Ask the AI assistant to draft USER\_GUIDE.md under `docs/` if not already done, ensuring it explains how to:

* Install Android APK (enable Unknown Sources)
* Run CLI JAR (`java -jar askme.jar`)
* Configure models via Settings or config.json
 |  |  |
| [ ] | 371 | Review User Guide Document | 10.18 | Open USER\_GUIDE.md in Codespace and confirm it has three main sections with step-by-step bullet points. |  |  |
| [ ] | 372 | Update API Documentation | 10.18 | Ask the AI assistant to update API\_DOCS.md by adding a new section “Core Data Models” and listing data classes `LLMProvider`, `QueryResult`, and `ModelInfo`. |  |  |
| [ ] | 373 | Review API Documentation | 10.18 | Open API\_DOCS.md and confirm the new section appears with brief descriptions. |  |  |
| [ ] | 374 | Review or Create Setup Instructions Document | 10.18 | Ask the AI assistant to write SETUP.md under `docs/` if missing, explaining how to:

* How to open the Codespace in GitHub
* How to mount the USB drive on Chromebook
* How to set environment variables (JAVA\_HOME, ANDROID\_SDK\_ROOT, GRADLE\_USER\_HOME)
* How to run `./gradlew core:build`, `./gradlew androidApp:assembleDebug`, and `./gradlew cliApp:installDist`
 |  |  |
| [ ] | 375 | Review Setup Instructions Document | 10.18 | Open SETUP.md in Codespace and verify. |  |  |
| [ ] | 376 | Review or Create Contribution Guidelines Document | 10.18 | Ask the AI assistant to create CONTRIBUTING.md under `docs/` if not present, explaining:

* How to fork and clone the repo
* How to create a branch (`git checkout -b feature/xyz`)
* How to run tests locally (`./gradlew test`)
* How to format code according to Detekt rules
* How to submit a pull request on GitHub
 |  |  |
| [ ] | 377 | Review Contribution Guidelines Document | 10.18 | Open CONTRIBUTING.md and confirm it contains five bullet points. |  |  |
| [ ] | 378 | Verify Play Store Screenshot Placement | 10.22 | Ask the AI assistant to verify that `chat_screenshot.png` remains in `androidApp/app/src/main/playStoreAssets/`. |  |  |
| [ ] | 379 | Confirm Screenshot Presence | 10.22 | Confirm in Codespace that `androidApp/app/src/main/playStoreAssets/chat_screenshot.png` is still present. |  |  |
| [ ] | 380 | Verify CLI Screenshot Placement | 10.22 | Ask the AI assistant to verify that `cli_screenshot.png` remains in `docs/screenshots/`. |  |  |
| [ ] | 381 | Confirm CLI Screenshot Presence | 10.22 | Confirm in Codespace that `docs/screenshots/cli_screenshot.png` is still present. |  |  |
| [ ] | 382 | Verify Screenshot Resizing | 10.22 | Ask the AI assistant to verify both screenshots are sized correctly (1080×1920 for Android, 800×600 for CLI) by running an image check command or opening properties. |  |  |
| [ ] | 383 | Ensure Play Store Asset Inclusion Configuration | 10.22 | Ask the AI assistant to ensure `androidApp/build.gradle.kts` is set to include `playStoreAssets` under `release` resources. |  |  |
| [ ] | 384 | Review Asset Inclusion Configuration | 10.22 | Open `androidApp/build.gradle.kts` and confirm the `sourceSets` block includes `playStoreAssets`. |  |  |
| [ ] | 385 | Update Release Checklist Document | 10.22 | Ask the AI assistant to update `docs/ReleaseChecklist.md` adding a line: “Verify Play Store assets are correct.” |  |  |
| [ ] | 386 | Review Release Checklist Document | 10.22 | Open `docs/ReleaseChecklist.md` and confirm that line appears. |  |  |
| [ ] | 387 | Perform Manual Testing on Debug APK | 10.22 | Ask the AI assistant to run `./gradlew androidApp:assembleDebug` and manually test the debug APK on the emulator to ensure everything still works after all changes. |  |  |
| [ ] | 388 | Perform Manual Testing on CLI Install | 10.22 | Ask the AI assistant to run `./gradlew cliApp:installDist` and test the CLI again to confirm no regressions. |  |  |
| [ ] | 389 | Confirm Manual Test Success | 10.22 | Confirm both manual tests pass, then mark “Manual smoke test” as done in `ReleaseChecklist.md`. |  |  |
| [ ] | 390 | Tag Release in Git | 10.22 | Ask the AI assistant to create a new Git tag `v1.2.0` if any minor fixes were made, by running `git tag v1.2.0 && git push origin v1.2.0`. |  |  |
| [ ] | 391 | Verify GitHub Release Creation | 10.22 | Open GitHub and confirm that release `v1.2.0` appears with updated artifacts. |  |  |
| [ ] | 392 | Ensure GitHub Issues Are Enabled | 10.22 | Ask the AI assistant to ensure “Issues” remain enabled in the GitHub settings. |  |  |
| [ ] | 393 | Verify Issue Templates Exist | 10.22 | Ask the AI assistant to verify that the bug and feature request templates remain under `.github/ISSUE_TEMPLATE/`. |  |  |
| [ ] | 394 | Review or Create Support Document | 10.22 | Ask the AI assistant to create `docs/SUPPORT.md` if missing, listing:

* Step-by-step bug reporting procedure (link to bug\_report template)
* Step-by-step feature request procedure (link to feature\_request template)
* Expected response time

 |  |  |
| [ ] | 395 | Review Support Document | 10.22 | Open `docs/SUPPORT.md` and confirm it has the three bullet points. |  |  |
| [ ] | 396 | Verify Performance Monitoring Workflow | 10.22 | Ask the AI assistant to verify that GitHub Actions ran `monitor.yml` at least once by checking the “Actions” tab. |  |  |
| [ ] | 397 | Confirm Last Monitor Run | 10.22 | Open the Actions tab and confirm that `monitor.yml` ran today (or most recent day). |  |  |
| [ ] | 398 | Check for New Runtime Errors | 10.22 | Ask the AI assistant to confirm no new critical errors appear when running `adb logcat | grep ASKME`. |  |  |
| [ ] | 399 | Check for New CLI Crash Logs | 10.22 | Ask the AI assistant to confirm no new crash logs appear in `~/askme-cli-crash.log` after running random CLI commands. |  |  |
| [ ] | 400 | Fix Any New Critical Issues | 10.22 | Ask the AI assistant to fix any new critical issues if found and push changes. |  |  |
| [ ] | 401 | Confirm Stability After Fixes | 10.22 | After fixes, run `./gradlew core:check`, `androidApp:connectedAndroidTest`, and `cliApp:test` again to confirm stability. |  |  |
| [ ] | 402 | Create Issues for Noncritical Enhancements | 10.22 | Ask the AI assistant to create GitHub issues for any noncritical enhancements discovered. |  |  |
| [ ] | 403 | Update Roadmap with Enhancements | 10.22 | Ask the AI assistant to update `docs/Roadmap.md` with those enhancements. |  |  |
| [ ] | 404 | Update User Research Plan with Follow-ups | 10.22 | Ask the AI assistant to update `docs/UserResearchPlan.md` to include any follow-up research questions. |  |  |
| [ ] | 405 | Verify Wireframes Document Accessibility | 10.22 | Ask the AI assistant to confirm that `docs/wireframes/basic-chat-flow.png` is still viewable. |  |  |
| [ ] | 406 | Verify Design System Files Exist | 10.22 | Ask the AI assistant to confirm that design system files (`Colors.kt`, `Typography.kt`, `Shapes.kt`) still exist under the correct path. |  |  |
| [ ] | 407 | Review Color Definitions in Design System | 10.22 | Open `Colors.kt` and verify color definitions. |  |  |
| [ ] | 408 | Confirm Chat Screen Animation | 10.22 | Ask the AI assistant to confirm that `ChatScreen.kt` still wraps its content in the `FadeIn` animation. |  |  |
| [ ] | 409 | Review Animation Test for Chat Screen | 10.22 | Open `ChatScreen.kt` and verify the `FadeIn { … }` block. |  |  |
| [ ] | 410 | Verify Animation Test Passes | 10.22 | Ask the AI assistant to confirm `AnimationTest.kt` still passes by running `./gradlew androidApp:connectedAndroidTest --tests AnimationTest`. |  |  |
| [ ] | 411 | Confirm AndroidManifest.xml Settings | 10.22 | Ask the AI assistant to confirm `AndroidManifest.xml` still has `supportsRtl="true"` and `INTERNET` permission. |  |  |
| [ ] | 412 | Review AndroidManifest.xml Changes | 10.22 | Open `AndroidManifest.xml` and verify. |  |  |
| [ ] | 413 | Verify Screen Size Test Passes | 10.22 | Ask the AI assistant to confirm `ScreenSizeTest.kt` still passes by running `./gradlew androidApp:connectedAndroidTest --tests ScreenSizeTest`. |  |  |
| [ ] | 414 | Add Tests for New OllamaProvider Edge Cases | 10.22 | Ask the AI assistant to create any additional unit tests in `core/src/commonTest/kotlin/` covering new edge cases in `OllamaProvider`. |  |  |
| [ ] | 415 | Verify All Tests Pass | 10.22 | Run `./gradlew core:commonTest` and confirm all tests pass. |  |  |
| [ ] | 416 | Verify CLI Automation Script Functionality | 10.22 | Ask the AI assistant to confirm that `scripts/cli_automation.sh` still runs successfully with “All tests passed.” |  |  |
| [ ] | 417 | Run CLI Automation Script | 10.22 | Run `bash scripts/cli_automation.sh` and verify output. |  |  |
| [ ] | 418 | Verify Performance Regression Test Passes | 10.22 | Ask the AI assistant to confirm that `PerformanceRegressionTest` still passes (`./gradlew androidApp:connectedAndroidTest --tests PerformanceRegressionTest`). |  |  |
| [ ] | 419 | Confirm Recurring Code Review Event | 10.22 | Ask the AI assistant to ensure the “Project Code Review” calendar event is still scheduled. |  |  |
| [ ] | 420 | Check Calendar for Code Review Event | 10.22 | Check your calendar and confirm the event appears. |  |  |
| [ ] | 421 | Verify Security Audit Issues Exist | 10.22 | Ask the AI assistant to confirm the GitHub issues for “Security Audit,” “Penetration Testing,” and “No Data Leakage Validation” still exist. |  |  |
| [ ] | 422 | Review Security Audit Issues in GitHub | 10.22 | Open the GitHub Issues tab and verify those three issues. |  |  |
| [ ] | 423 | Confirm Security Audit Plan Steps | 10.22 | Ask the AI assistant to confirm `docs/SecurityAuditPlan.md` still lists its audit steps. |  |  |
| [ ] | 424 | Review Security Audit Plan Document | 10.22 | Open `docs/SecurityAuditPlan.md` and verify the content. |  |  |
| [ ] | 425 | Confirm Static Analysis Report Status | 10.22 | Ask the AI assistant to confirm `reports/static-analysis.html` still shows no critical issues. |  |  |
| [ ] | 426 | Confirm Penetration Testing Checklist Status | 10.22 | Ask the AI assistant to confirm `docs/PenTestChecklist.md` still contains its four penetration test items. |  |  |
| [ ] | 427 | Re-Test SQL Injection Vulnerability | 10.22 | Ask the AI assistant to re-run the SQL injection test to confirm no data leakage. |  |  |
| [ ] | 428 | Re-Test Man-in-the-Middle Protection | 10.22 | Ask the AI assistant to re-run the MITM simulation to confirm certificate pinning still works. |  |  |
| [ ] | 429 | Re-Test Secure Deletion of User Data | 10.22 | Ask the AI assistant to re-test secure deletion of user data and confirm no residual files. |  |  |
| [ ] | 430 | Update Security Audit Plan with Findings | 10.22 | Ask the AI assistant to update `docs/SecurityAuditPlan.md` with results from each of the four security checks. |  |  |
| [ ] | 431 | Update Security Summary Report | 10.22 | Ask the AI assistant to update `docs/SecuritySummary.md` stating “No critical vulnerabilities found,” or update if not. |  |  |
| [ ] | 432 | Draft or Update User Guide Document | 10.22 | Ask the AI assistant to draft USER\_GUIDE.md under `docs/` if not already done, ensuring it explains how to:

* Install Android APK (enable Unknown Sources)
* Run CLI JAR (`java -jar askme.jar`)
* Configure models via Settings or config.json
 |  |  |
| [ ] | 433 | Review User Guide Document | 10.22 | Open USER\_GUIDE.md in Codespace and confirm it has three main sections with step-by-step bullet points. |  |  |
| [ ] | 434 | Update API Documentation | 10.22 | Ask the AI assistant to update API\_DOCS.md by adding a new section “Core Data Models” and listing data classes `LLMProvider`, `QueryResult`, and `ModelInfo`. |  |  |
| [ ] | 435 | Review API Documentation | 10.22 | Open API\_DOCS.md and confirm the new section appears with brief descriptions. |  |  |
| [ ] | 436 | Review or Create Setup Instructions Document | 10.22 | Ask the AI assistant to write SETUP.md under `docs/` if missing, explaining how to:

* How to open the Codespace in GitHub
* How to mount the USB drive on Chromebook
* How to set environment variables (JAVA\_HOME, ANDROID\_SDK\_ROOT, GRADLE\_USER\_HOME)
* How to run `./gradlew core:build`, `./gradlew androidApp:assembleDebug`, and `./gradlew cliApp:installDist`
 |  |  |
| [ ] | 437 | Review Setup Instructions Document | 10.22 | Open SETUP.md in Codespace and verify. |  |  |
| [ ] | 438 | Confirm Contribution Guidelines Clarity | 10.22 | Ask the AI assistant to confirm CONTRIBUTING.md still explains forking, branching, testing, formatting, and PR steps. |  |  |
| [ ] | 439 | Review Contribution Guidelines Document | 10.22 | Open CONTRIBUTING.md and verify. |  |  |
| [ ] | 440 | Verify Play Store Screenshot Placement | 10.22 | Ask the AI assistant to verify that `chat_screenshot.png` remains in `androidApp/app/src/main/playStoreAssets/`. |  |  |
| [ ] | 441 | Confirm Screenshot Presence | 10.22 | Confirm in Codespace that `androidApp/app/src/main/playStoreAssets/chat_screenshot.png` is still present. |  |  |
| [ ] | 442 | Verify CLI Screenshot Placement | 10.22 | Ask the AI assistant to verify that `cli_screenshot.png` remains in `docs/screenshots/`. |  |  |
| [ ] | 443 | Confirm CLI Screenshot Presence | 10.22 | Confirm in Codespace that `docs/screenshots/cli_screenshot.png` is still present. |  |  |
| [ ] | 444 | Verify Screenshot Resizing | 10.22 | Ask the AI assistant to verify both screenshots are sized correctly (1080×1920 for Android, 800×600 for CLI) by running an image check command or opening properties. |  |  |
| [ ] | 445 | Ensure Play Store Asset Inclusion Configuration | 10.22 | Ask the AI assistant to ensure `androidApp/build.gradle.kts` is set to include `playStoreAssets` under `release` resources. |  |  |
| [ ] | 446 | Review Asset Inclusion Configuration | 10.22 | Open `androidApp/build.gradle.kts` and confirm the `sourceSets` block includes `playStoreAssets`. |  |  |
| [ ] | 447 | Update Release Checklist Document | 10.22 | Ask the AI assistant to update `docs/ReleaseChecklist.md` adding a line: “Verify Play Store assets are correct.” |  |  |
| [ ] | 448 | Review Release Checklist Document | 10.22 | Open `docs/ReleaseChecklist.md` and confirm that line appears. |  |  |
| [ ] | 449 | Perform Manual Testing on Debug APK | 10.22 | Ask the AI assistant to run `./gradlew androidApp:assembleDebug` and manually test the debug APK on the emulator to ensure everything still works after all changes. |  |  |
| [ ] | 450 | Perform Manual Testing on CLI Install | 10.22 | Ask the AI assistant to run `./gradlew cliApp:installDist` and test the CLI again to confirm no regressions. |  |  |
| [ ] | 451 | Confirm Manual Test Success | 10.22 | Confirm both manual tests pass, then mark “Manual smoke test” as done in `ReleaseChecklist.md`. |  |  |
| [ ] | 452 | Tag Release in Git | 10.22 | Ask the AI assistant to create a new Git tag `v1.2.1` if any minor fixes were made, by running `git tag v1.2.1 && git push origin v1.2.1`. |  |  |
| [ ] | 453 | Verify GitHub Release Creation | 10.22 | Open GitHub and confirm that release `v1.2.1` appears with updated artifacts. |  |  |
