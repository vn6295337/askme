# askme Project Directory Structure

## Root Level Organization
```
askme/
├── 000_README.md                    # Main project overview
├── 100_planning/                    # Project Planning & Management
├── 200_development/                 # Technical Development Documentation  
├── 300_implementation/              # Source Code & Applications
├── 400_testing/                     # Quality Assurance & Testing
├── 500_release/                     # Release Management & Deployment
├── 600_documentation/               # User Documentation & Guides
├── 700_team/                        # Team Structure & Coordination
├── 800_tools/                       # Development Tools & Scripts
├── 900_config/                      # Configuration & Settings
├── ARCHIVE_OLD_STRUCTURE/           # Previous organization (archived)
├── .git/                           # Git repository metadata
├── .github/                        # GitHub configuration
└── .gitignore                      # Git ignore rules
```

## 100_planning/ - Project Planning & Management
```
├── 101_project_charter.md          # Project charter and scope
├── 102_user_personas.md            # Target user definitions
├── 103_user_stories.md             # User story specifications
├── 104_feature_list.md             # Comprehensive feature catalog
├── 105_master_checklist.md         # 420-item execution checklist
├── 107_project_plan.md             # Detailed project roadmap
├── 111_risk_management.md          # Risk assessment and mitigation
├── 112_resource_planning.md        # Resource allocation planning
└── 115_mvp_scope.md                # MVP definition and boundaries
```

## 200_development/ - Technical Development
```
├── 201_system_architecture.md      # System architecture overview
├── 202_tech_stack.md               # Technology stack documentation
├── 203_api_contracts.md            # API specifications and contracts
├── 204_setup_guide.md              # Development environment setup
├── 205_implementation_log.md       # Implementation history and decisions
├── 206_tool_checklist.md           # Tool installation procedures
├── 207_stack_diagram.html          # Visual tech stack diagram
├── 208_development_process.md      # Development methodology
└── 209_architecture_components.md  # Component architecture details
```

## 300_implementation/ - Source Code
```
└── askme-cli/                      # CLI Application (KMP)
    ├── src/                        # Source code
    │   ├── commonMain/kotlin/      # Shared Kotlin code
    │   ├── commonTest/kotlin/      # Shared tests
    │   └── cliApp/                 # CLI application module
    ├── build.gradle.kts            # Build configuration
    ├── settings.gradle.kts         # Gradle settings
    ├── gradle.properties           # Gradle properties
    ├── gradlew                     # Gradle wrapper script
    ├── docs/                       # CLI-specific documentation
    └── README.md                   # CLI application overview
```

## 400_testing/ - Quality Assurance
```
├── 401_code_quality.md            # Code quality standards
└── 402_testing_checklist.md       # Testing procedures checklist
```

## 500_release/ - Release Management
```
└── 501_release_process.md         # Release procedures and guidelines
```

## 600_documentation/ - User Documentation
```
├── 601_document_index.md          # Documentation navigation index
├── 602_directory_structure.md     # This file - project organization
└── 603_setup_guide.md             # User setup and installation guide
```

## 700_team/ - Team Coordination
```
├── 701_team_diagram.md            # Team structure documentation
├── 702_persona_prompts.md         # 13 AI persona specifications (CLI focus)
├── 703_team_structure.md          # Team organization overview
├── 704_team_diagram.html          # Visual team structure diagram
└── 705_android_personas.md        # Android development personas (future)
```

## 800_tools/ - Development Tools
```
├── 801_sync_script.sh             # 3-tier cloud storage synchronization
├── 802_env_check.sh               # Environment validation script
└── 803_tools_readme.md            # Tools documentation and inventory
```

## 900_config/ - Configuration
```
└── 901_github_config/             # GitHub configuration files
    ├── copilot-instructions.md    # GitHub Copilot instructions
    └── dependabot.yml             # Dependency management automation
```

## Key Features
- **Numbered Organization**: 000-900 systematic categorization
- **CLI MVP**: Production-ready command-line application
- **Live AI Integration**: Google Gemini + Mistral AI providers
- **Comprehensive Documentation**: 30+ documentation files
- **Version Control**: Git repository with GitHub integration
- **Cloud Backup**: 3-tier synchronization system ready
- **Team Coordination**: 13 AI persona specifications

## Project Status: CLI MVP SUCCESS ✅

### Success Metrics Achieved
- ✅ **Response Time**: 1.92s (target <2s)
- ✅ **LLM Providers**: 2 live + 2 ready (Google Gemini, Mistral AI working)
- ✅ **CLI Interface**: Professional with emoji indicators
- ✅ **Data Collection**: Zero - direct API calls only
- ✅ **Project Organization**: 800+ files properly structured

### Live AI Demonstration
```bash
# Google Gemini Example
./gradlew cliApp:run --args="-f prompt.txt -m google" --quiet
🤖 askme CLI - Processing prompt from file: prompt.txt
🎯 Selected model: google
💬 Response: Tokyo

# Mistral AI Example  
./gradlew cliApp:run --args="-f prompt.txt -m mistral" --quiet
🤖 askme CLI - Processing prompt from file: prompt.txt
🎯 Selected model: mistral
💬 Response: The capital of Japan is **Tokyo**. Tokyo is not only the capital but also the most populous metropolitan area in the world.
```

## File Statistics
- **Total Files**: 800+ organized files
- **Documentation**: 30+ technical and user guides
- **Source Code**: Complete Kotlin Multiplatform CLI application
- **Configuration**: GitHub, Gradle,