# askme Project Directory Structure

## Root Level Organization
```
askme/
├── 001_readme.md                   # Main project overview
├── 002_project_structure.md        # Project organization (this file)
├── 100_planning/                   # Project Planning & Management
├── 200_development/                # Technical Development Documentation
├── 300_implementation/             # Source Code & Applications
├── 400_testing/                    # Quality Assurance & Testing
├── 500_release/                    # Release Management & Deployment
├── 600_team/                       # Team Structure & Coordination
├── 700_scripts/                    # Development Tools & Scripts
├── 800_misc_docs/                  # Miscellaneous Documentation & Assets
├── build-release/                  # Production Build Distribution
├── install.sh                     # Installation script
└── release_workflow.yaml          # Release automation workflow
```

## 100_planning/ - Project Planning & Management
```
├── 101_project_charter.md          # Project charter and scope
├── 102_master_checklist.md         # Master execution checklist
├── 103_project_plan.md             # Detailed project roadmap
├── 104_risk_management.md          # Risk assessment and mitigation
├── 105_resource_planning.md        # Resource allocation planning
├── 106_mvp_requirements.md         # MVP definition and boundaries
├── 107_roadmap.md                  # Project roadmap
└── 108_project_completion.md       # Project completion documentation
```

## 200_development/ - Technical Development Documentation
```
├── 201_tech_stack.md               # Technology stack documentation
├── 202_setup_guide.md              # Development environment setup
├── 203_implementation_log.md       # Implementation history and decisions
├── 204_stack_diagram.html          # Visual tech stack diagram (HTML)
├── 205_stack_diagram.pdf           # Visual tech stack diagram (PDF)
├── 206_system_architecture.md      # System architecture overview
├── 207_tool_checklist.md           # Tool installation and verification procedures
├── 208_cli_wireframes.txt          # CLI interface wireframes
└── 209_wireframe_notes.md          # Wireframe design notes and documentation
```

## 300_implementation/ - Source Code & Applications
```
├── askme-backend/                  # Backend API service
│   ├── package.json                # Node.js dependencies
│   └── server.js                   # Express server implementation
└── askme-cli/                      # CLI Application (Kotlin Multiplatform)
    ├── build.gradle.kts            # Root build configuration
    ├── settings.gradle.kts         # Gradle project settings
    ├── gradle.properties           # Gradle configuration properties
    ├── gradlew                     # Gradle wrapper script (Unix)
    ├── gradlew.bat                 # Gradle wrapper script (Windows)
    ├── gradle/                     # Gradle wrapper files
    │   ├── libs.versions.toml      # Version catalog
    │   └── wrapper/                # Gradle wrapper binaries
    ├── cliApp/                     # CLI application module
    │   ├── build.gradle.kts        # CLI module build config
    │   ├── src/                    # CLI source code
    │   │   ├── main/kotlin/com/askme/
    │   │   │   ├── cli/Main.kt     # CLI entry point
    │   │   │   └── providers/       # AI provider implementations
    │   │   │       ├── AIProvider.kt       # Provider interface
    │   │   │       ├── IntelligentProvider.kt  # Smart provider selection
    │   │   │       └── Providers.kt        # Provider implementations
    │   │   └── test/kotlin/        # CLI tests
    │   └── build/                  # Build artifacts and outputs
    │       ├── classes/kotlin/main/ # Compiled class files
    │       ├── distributions/       # Application distributions
    │       ├── libs/cliApp.jar     # Built JAR file
    │       └── scripts/            # Generated run scripts
    ├── config/detekt/              # Code quality configuration
    ├── docs/                       # CLI-specific documentation
    │   ├── FINAL_SUCCESS.md        # Project completion status
    │   ├── ProjectCompletion.md    # Completion documentation
    │   ├── prompt.txt              # Development prompts
    │   └── screenshots/            # CLI demonstration images
    └── src/                        # Shared source code
        └── commonTest/kotlin/com/askme/security/ # Security test suites
            ├── ManInTheMiddleTest.kt
            ├── SecureDeletionTest.kt
            ├── SqlInjectionTest.kt
            └── UnauthorizedFileAccessTest.kt
```

## 400_testing/ - Quality Assurance & Testing
```
├── 401_test_strategy.md            # Overall testing strategy
├── 402_test_plan.md                # Detailed test planning procedures
├── 403_test_scenarios.md           # Test scenario definitions
├── 404_test_cases.md               # Specific test case documentation
├── 405_test_checklist.md           # Testing execution checklist
├── 406_bug_tracking.md             # Bug tracking and resolution procedures
├── 407_test_summary.md             # Test execution summary and results
├── 408_static_analysis_report.html # Automated static analysis report
└── reports/                        # Test execution reports
    └── end_to_end_test_report.md   # Comprehensive E2E test results
```

## 500_release/ - Release Management & Documentation
```
├── 501_readme.md                   # Main project README
├── 502_license                     # License information
├── 503_changelog.md                # Version change log
├── 504_release_notes.md            # Release notes and updates
├── 505_user_guide.md               # Complete CLI user guide
├── 506_api_docs.md                 # Technical API documentation
├── 507_development_setup.md        # Development environment setup
├── 508_contributing.md             # Contribution guidelines
└── 509_known_issues.md             # Known issues and limitations
```

## 600_team/ - Team Structure & Coordination
```
├── 601_persona_prompts.md          # AI persona specifications
├── 602_team_structure.html         # Visual team structure diagram (HTML)
└── 603_team_structure.md           # Team organization overview
```

## 700_scripts/ - Development Tools & Automation
```
├── 701_sync_script.sh              # Cloud storage synchronization
├── 702_env_check.sh                # Environment validation script
├── 703_cli_automation.sh           # CLI automation utilities
├── 704_cli_performance_test.sh     # Performance testing script
├── 704_installer.sh                # Installation automation script
├── 705_build_release.sh            # Release build automation
└── tiered_sync.log                 # Synchronization operation logs
```

## 800_misc_docs/ - Miscellaneous Documentation & Assets
```
├── api_model_update_plan.md        # API model update strategy
├── API Provider Model Status Table.pdf # Provider status reference
├── api_provider_status_table.md    # Provider status documentation
└── askme-cli_demo.mp4              # CLI demonstration video
```

## build-release/ - Production Distribution
```
└── askme-cli/                      # Ready-to-deploy CLI application
    ├── bin/                        # Executable scripts
    │   ├── cliApp                  # Unix executable
    │   └── cliApp.bat              # Windows batch file
    ├── lib/                        # Runtime dependencies
    │   ├── cliApp.jar              # Main application JAR
    │   ├── kotlin-stdlib-*.jar     # Kotlin runtime libraries
    │   ├── kotlinx-*.jar           # Kotlin extensions
    │   ├── ktor-*.jar              # HTTP client libraries
    │   └── slf4j-*.jar             # Logging framework
    ├── README.md                   # Distribution README
    └── VERSION                     # Version information
```

## File Statistics Summary
```
Total Directories: 68
Total Files: 248
```

## Project Organization Features

### ✅ Numbered Directory Structure (000-900)
- **000-099**: Reserved for root documentation
- **100-199**: Planning and project management
- **200-299**: Development documentation
- **300-399**: Implementation and source code
- **400-499**: Testing and quality assurance
- **500-599**: Release and deployment
- **600-699**: Team coordination
- **700-799**: Scripts and automation
- **800-899**: Miscellaneous documentation and assets
- **900-999**: Reserved for future expansion