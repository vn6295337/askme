# AskMe Lite - Directory Structure

// Renamed to 109_directory_structure.md for consistency with numbering scheme

This document outlines the complete directory structure of the AskMe Lite project in a hierarchical numbered format.

## 1. Root Directory

1.1 `01_androidApp/` - Android application module
1.2 `02_cli/` - Command Line Interface module
1.3 `03_core/` - Core module with shared business logic
1.4 `04_config/` - Configuration files
   - 1.4.1 `detekt/` - Static code analysis configuration
     - `detekt.yml` - Detekt configuration file
1.5 `05_docs/` - Project documentation
   - 1.5.1 `development/` - Development documentation
     - `301_architecture.md` - System architecture
     - `302_tech_stack.md` - Technology stack details
     - `303_api_contracts.md` - API specifications
     - `304_setup_guide.md` - Development setup guide
   - 1.5.2 `planning/` - Project planning documents
     - `101_problem_statement.md` - Project problem statement
     - `102_user_personas.md` - User personas
     - `103_user_stories.md` - User stories
     - `104_feature_list.md` - Feature list
   - 1.5.3 `qa/` - Quality assurance
     - `401_testing_checklist.md` - Testing procedures
   - 1.5.4 `release/` - Release management
     - `501_release_process.md` - Release process
     - `502_play_store_assets.md` - Play Store assets
   - 1.5.5 `support/` - Support documentation
     - `601_known_issues.md` - Known issues
     - `602_feedback_plan.md` - Feedback collection plan
   - 1.5.6 `ux/` - User experience
     - `201_wireframes.md` - Application wireframes
1.6 `06_gradle/` - Gradle configuration
   - `libs.versions.toml` - Dependency versions
   - `wrapper/` - Gradle wrapper files
     - `gradle-wrapper.properties` - Wrapper properties
1.7 `07_github/` - GitHub configuration
   - `workflows/` - GitHub Actions workflows

## 2. Build and Configuration Files

2.1 `build.gradle.kts` - Root build configuration
2.2 `settings.gradle.kts` - Project settings
2.3 `gradle.properties` - Gradle properties
2.4 `gradlew` - Gradle wrapper script (Unix/Linux)
2.5 `gradlew.bat` - Gradle wrapper script (Windows)
2.6 `CODE_QUALITY.md` - Code quality standards
2.7 `DOCUMENT_INDEX.md` - Documentation index
2.8 `README.md` - Project overview

## 3. Module Structure

### 3.1 `01_androidApp/` - Android Application Module
- `src/main/` - Main source set
  - `AndroidManifest.xml` - Android manifest
  - `java/` - Java source files
    - `com/askme/lite/` - Application package
  - `kotlin/` - Kotlin source files
    - `com/askme/lite/` - Application package
  - `res/` - Android resources
    - `layout/` - UI layouts
    - `values/` - Resource values

### 3.2 `02_cli/` - Command Line Interface Module
- `src/main/kotlin/` - Kotlin source files
  - `com/askme/lite/cli/` - CLI application package

### 3.3 `03_core/` - Core Module
- `src/` - Source sets
  - `commonMain/` - Common code
    - `kotlin/` - Kotlin source files
      - `com/askme/lite/core/` - Core package
  - `androidMain/` - Android-specific code
  - `iosX64Main/` - iOS x64 target
  - `iosArm64Main/` - iOS ARM64 target
  - `iosSimulatorArm64Main/` - iOS Simulator ARM64 target

## 4. Build Outputs

Build outputs are generated in the `build/` directory (not versioned).

## 5. Generated Files

- `.gradle/` - Gradle build cache
- `.idea/` - IDE configuration (not versioned)
- `build/` - Build outputs (not versioned)
- `local.properties` - Local configuration (not versioned)

## Last Updated

This document was last updated on: 2025-05-29
