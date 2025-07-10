# askme Project Directory Structure

## Root Level Organization
```
askme/
├── README.md                   # Main project overview
├── PROJECT_STRUCTURE.md        # Project organization (this file)
├── .github/workflows/          # GitHub Actions workflows
│   └── RELEASE_WORKFLOW.yaml  # Release automation workflow
├── 100_planning/               # Project Planning & Management
├── 200_development/            # Technical Development Documentation
├── 300_implementation/         # Source Code & Applications
├── 400_testing/               # Quality Assurance & Testing
├── 500_release/               # Release Management & Deployment
├── 700_scripts/               # Development Tools & Scripts
├── 800_misc_docs/             # Miscellaneous Documentation & Assets
└── 900_archive/               # Archives & Distributions
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
├── 206_system_architecture.md      # System architecture overview
├── 207_tool_checklist.md           # Tool installation and verification procedures
├── 208_cli_wireframes.txt          # CLI interface wireframes
├── 209_wireframe_notes.md          # Wireframe design notes and documentation
├── 210_implementation_summary.md   # Implementation summary
└── 211_implementation_status.md    # Implementation status tracking
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
    │   ├── build.gradle.kts        # CLI module build config with buffer fix
    │   └── src/                    # CLI source code
    │       └── main/kotlin/com/askme/
    │           ├── cli/Main.kt     # CLI entry point
    │           └── providers/       # AI provider implementations
    │               ├── AIProvider.kt       # Provider interface
    │               ├── IntelligentProvider.kt  # Smart provider selection
    │               └── Providers.kt        # Provider implementations
    ├── buildSrc_disabled/          # Disabled integrity plugin
    │   ├── build.gradle.kts        # Plugin build config
    │   └── src/main/kotlin/        # Plugin source code
    │       └── IntegrityPlugin.kt  # Script validation plugin
    ├── config/detekt/              # Code quality configuration
    │   └── detekt.yml              # Detekt configuration
    ├── docs/                       # CLI-specific documentation
    │   ├── FINAL_SUCCESS.md        # Project completion status
    │   ├── ProjectCompletion.md    # Completion documentation
    │   └── screenshots/            # CLI demonstration images
    │       └── cli_screenshot.png  # CLI interface screenshot
    └── src/                        # Shared source code
        └── commonTest/kotlin/com/askme/security/ # Security test suites
            ├── ConnectionValidationUnitTest.kt
            ├── DataDeletionValidationUnitTest.kt
            ├── FileAccessValidationUnitTest.kt
            └── InputValidationUnitTest.kt
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
├── 409_prevention_implementation_complete.md # Buffer size prevention strategy
└── reports/                        # Test execution reports
    └── end_to_end_test_report.md   # Comprehensive E2E test results
```

## 500_release/ - Release Management & Deployment
```
├── 501_license                     # License information
├── 502_changelog.md                # Version change log
├── 503_release_notes.md            # Release notes and updates
├── 504_user_guide.md               # Complete CLI user guide
├── 505_user_guide_simplified.md    # Simplified user guide for executives
├── 506_api_docs.md                 # Technical API documentation
├── 507_development_setup.md        # Development environment setup
├── 508_contributing.md             # Contribution guidelines
├── 509_known_issues.md             # Known issues and limitations
├── 510_install.sh                  # Installation script
└── 511_docs/                       # Release documentation assets
    └── index.html                  # Documentation index
```

## 700_scripts/ - Development Tools & Automation
```
├── 701_sync_script.sh              # Cloud storage synchronization
├── 702_env_check.sh                # Environment validation script
├── 703_cli_automation.sh           # CLI automation utilities
├── 704_cli_performance_test.sh     # Performance testing script
├── 705_build_release.sh            # Enhanced release build automation
├── 706_create_backup_distributions.sh # Distribution backup creation
├── 707_setup_fallback_system.sh    # Fallback system setup
├── 708_release_health_monitor.sh   # Release health monitoring
└── 709_continuous_validation.sh    # Continuous validation automation
```

## 800_misc_docs/ - Miscellaneous Documentation & Assets
```
├── 801_api_model_update_plan.md        # API model update strategy
└── 802_api_provider_status_table.md    # Provider status documentation
```

## 900_archive/ - Archives & Distributions
```
├── distributions/                  # Distribution archives
│   ├── askme-cli-v1.2.1.tar.gz   # Production release archive
│   └── askme-distribution-final/   # Final distribution package
│       ├── app/                   # Application files
│       │   ├── bin/              # Executable scripts
│       │   │   ├── cliApp        # Unix executable
│       │   │   └── cliApp.bat    # Windows batch file
│       │   └── lib/              # Runtime libraries (25+ JARs)
│       ├── install.sh            # Installation script
│       ├── LICENSE               # License file
│       └── USER_GUIDE.md         # User documentation
└── monitoring/                    # Historical monitoring data
    └── v1.2.1/                   # Version-specific health reports
        └── health-report-v1.2.1.md
```

## GitHub Actions Workflow
```
.github/workflows/
└── RELEASE_WORKFLOW.yaml          # Automated release pipeline
    ├── Build verification         # Gradle build with compact scripts
    ├── Distribution packaging     # Archive creation
    ├── Release asset upload       # GitHub release management
    └── Checksum validation       # Security verification
```

## File Statistics Summary
```
Total Directories: 47
Total Files: 122
Archive Files: 52
Active Project Files: 70
```

## Project Organization Features

### ✅ Numbered Directory Structure (000-900)
- **100-199**: Planning and project management
- **200-299**: Development documentation
- **300-399**: Implementation and source code
- **400-499**: Testing and quality assurance
- **500-599**: Release and deployment
- **700-799**: Scripts and automation
- **800-899**: Miscellaneous documentation and assets
- **900-999**: Archives and distributions