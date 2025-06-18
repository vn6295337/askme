# Complete Tech Stack & Architecture Components

**Document Version:** 1.2  
**Last Updated:** June 18, 2025  
**Status:** ✅ Current

## Version History
- **v1.2** (June 18, 2025) - Formatted for enhanced readability and GitHub compatibility
- **v1.1** (Previous) - Updated dependency versions and module descriptions  
- **v1.0** (Initial) - Base tech stack documentation

## Table of Contents
1. [Core Technologies](#1-core-technologies)
2. [Module Architecture](#2-module-architecture)
   - 2.1 [Core Modules](#21-core-modules)
   - 2.2 [Dependencies & Versioning](#22-dependencies--versioning)
3. [Technology Stack Visual](#3-technology-stack-visual)

---

## 1. Core Technologies

The following technologies form the foundation of the ask me CliApp project:

1.1. **Kotlin Multiplatform** - Shared business logic for Android and CLI  
1.2. **Jetpack Compose** - Modern Android UI (versioned via Compose BOM)  
1.3. **Ktor** - Networking (API calls, multiplatform)  
1.4. **gRPC** - Local model server communication  
1.5. **Koin** - Dependency injection  
1.6. **SQLDelight** - Local database  
1.7. **AndroidX** - Core Android libraries  
1.8. **JUnit, MockK, Kotest, Turbine** - Testing framework suite  
1.9. **Detekt, ktlint** - Code quality and style enforcement  
1.10. **Dokka** - Documentation generation

## 2. Module Architecture

### 2.1. Core Modules

The application is structured into three primary modules:

2.1.1. **Core Module**  
   - ✅ Shared business logic implementation
   - ✅ Query processing engine
   - ✅ Provider management system
   - ✅ Settings and configuration
   - **Purpose:** Central intelligence and privacy features

2.1.2. **AndroidApp Module**  
   - ✅ Modern Jetpack Compose UI implementation
   - ✅ Android device optimization
   - ✅ Core module integration
   - **Purpose:** User-friendly mobile interface

2.1.3. **CLI Module**  
   - ✅ Command-line interface implementation
   - ✅ Linux terminal integration
   - ✅ Core module connectivity
   - **Purpose:** Terminal-based LLM interaction

### 2.2. Dependencies & Versioning

All dependencies and tools are version-pinned in the [Gradle version catalog](../../gradle/libs.versions.toml) for maximum compatibility and reproducibility.

#### 2.2.1. Foundation Stack
- **JDK:** 17 (LTS)
- **Kotlin:** 1.9.10  
- **Gradle:** 8.4  
- **AGP:** 8.1.4

#### 2.2.2. Networking Components
- **Ktor:** 2.3.6 Client Core + CIO
- **gRPC Kotlin Stub:** 1.4.1
- **gRPC Java Runtime:** 1.58.0

#### 2.2.3. Multiplatform Core
- **Coroutines:** 1.7.3
- **Serialization:** 1.6.0
- **DateTime:** 0.5.0

#### 2.2.4. Android Framework
- **AndroidX Core:** 1.12.0
- **Lifecycle:** 2.7.0
- **Security Crypto:** 1.1.0-α4

#### 2.2.5. UI Components
- **Compose BOM:** 2023.10.01
- **Material Design:** Material3
- **Activity Compose:** 1.8.2
- **Compose Compiler:** 1.5.4

#### 2.2.6. Data & Dependency Injection
- **SQLDelight:** 2.0.0 Runtime Engine
- **Koin:** 3.5.0 (Core + Android + Compose)

#### 2.2.7. Testing Suite
- **JUnit:** 5.10.1
- **MockK + Kotest:** Latest stable
- **Turbine:** 1.0.0
- **AndroidX Compose Test:** 1.5.0

#### 2.2.8. Quality Assurance
- **Detekt:** 1.23.4
- **ktlint:** 0.50.0

#### 2.2.9. Documentation
- **Dokka:** 1.9.10

## 3. Technology Stack Visual

### 3.1. Stack Layers (Bottom to Top)

3.1.1. **Foundation Layer**  
   JDK 17 → Kotlin 1.9.10 → Gradle 8.4 → AGP 8.1.4

3.1.2. **Core Layer**  
   Coroutines → Serialization → DateTime → AndroidX Core → Lifecycle → Security

3.1.3. **UI Layer**  
   Compose UI + Tooling → Material3 → Activity Compose → Compose Compiler → Compose BOM

3.1.4. **Network Layer**  
   Ktor Client Core + CIO → Ktor Serialization → gRPC Kotlin Stub → gRPC Java Runtime

### 3.2. Side Components

3.2.1. **Data & DI**  
   SQLDelight Runtime + Drivers + Koin Core + Android + Compose

3.2.2. **Testing Infrastructure**  
   JUnit 5 + MockK + Kotest + Turbine + AndroidX Compose Test + Detekt + ktlint

3.2.3. **Documentation**  
   Dokka (Kotlin Documentation Generator)

---

**Reference:** For complete versioning rationale and detailed dependency management, see `gradle/libs.versions.toml`