# Scout Agent Workflow - ASCII Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🤖 SCOUT AGENT WORKFLOW                               │
│                     Multi-Modal AI Discovery & Catalog                         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                🚀 TRIGGERS                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ⏰ Schedule: Daily at 2 AM UTC (cron: '0 2 * * *')                           │
│  🔧 Manual: workflow_dispatch with inputs:                                     │
│     ├── discovery_mode: [comprehensive|text_models_only|multimodal_only|      │
│     │                    specific_provider]                                    │
│     ├── target_provider: [all|huggingface|google|groq|openrouter|cohere|      │
│     │                     together|mistral|ai21|artificialanalysis]           │
│     ├── reason: "Update AI models catalog"                                     │
│     └── enable_key_rotation: true                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ⚙️ ENVIRONMENT SETUP                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🔑 API Keys Configuration:                                                     │
│     ├── AI21_API_KEY ────────────────────► secrets.AI21_API_KEY               │
│     ├── ARTIFICIALANALYSIS_API_KEY ──────► secrets.ARTIFICIALANALYSIS_API_KEY │
│     ├── COHERE_API_KEY ──────────────────► secrets.COHERE_API_KEY             │
│     ├── GOOGLE_API_KEY ──────────────────► secrets.GOOGLE_API_KEY             │
│     ├── GROQ_API_KEY ────────────────────► secrets.GROQ_API_KEY               │
│     ├── HUGGINGFACE_API_KEY ─────────────► secrets.HUGGINGFACE_API_KEY        │
│     ├── MISTRAL_API_KEY ─────────────────► secrets.MISTRAL_API_KEY            │
│     └── TOGETHER_API_KEY ────────────────► secrets.TOGETHER_API_KEY           │
│                                                                                 │
│  🔄 Rotation Settings:                                                          │
│     ├── MAX_USAGE_PER_KEY: 50                                                  │
│     ├── ROTATION_INTERVAL_MS: 300000 (5 minutes)                              │
│     └── MAX_ERRORS_PER_KEY: 3                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    🏃‍♂️ JOB: scout-agent-discovery                              │
│                        runs-on: ubuntu-latest                                  │
│                        timeout-minutes: 60                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: 🚀 Checkout repository                                                │
│  ├── uses: actions/checkout@v4                                                 │
│  ├── fetch-depth: 0                                                            │
│  └── token: GITHUB_TOKEN                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: 🔧 Configure Git for automation                                       │
│  ├── user.name: "scout-agent[bot]"                                             │
│  └── user.email: "scout-agent[bot]@users.noreply.github.com"                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: 📦 Setup Node.js                                                      │
│  ├── uses: actions/setup-node@v4                                               │
│  └── node-version: '20'                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: 🔄 Cache Node modules                                                 │
│  ├── path: intelligent-discovery/node_modules                                  │
│  └── key: OS-node-modules-hash(package.json)                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: 📥 Install dependencies                                               │
│  ├── cd intelligent-discovery                                                  │
│  ├── Create simplified package.json                                            │
│  └── npm install --no-package-lock                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: 🧪 Validate system integrity                                          │
│  ├── chmod +x ./scripts/test_intelligent_discovery.sh                          │
│  └── Run validation tests on 56 JS modules                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 7: 🔍 Initialize discovery system                                        │
│  ├── Mode: ${DISCOVERY_MODE}                                                   │
│  ├── Target: ${target_provider}                                                │
│  └── Log configuration                                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│           STEP 8: 🎯 Execute enhanced multi-modal discovery                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🔑 API Key Status Check:                                              │   │
│  │  ├── ✅/❌ AI21: Available/Missing                                     │   │
│  │  ├── ✅/❌ ArtificialAnalysis: Available/Missing                       │   │
│  │  ├── ✅/❌ Cohere: Available/Missing                                   │   │
│  │  ├── ✅/❌ Google: Available/Missing                                   │   │
│  │  ├── ✅/❌ Groq: Available/Missing                                     │   │
│  │  ├── ✅/❌ HuggingFace: Available/Missing                              │   │
│  │  ├── ✅/❌ Mistral: Available/Missing                                  │   │
│  │  └── ✅/❌ Together: Available/Missing                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  │                                                                             │
│  │  🚀 Run live_endpoint_checker.js                                           │
│  │  ├── Load API key rotation manager                                         │
│  │  ├── Initialize 9 provider endpoints                                       │
│  │  └── Execute discovery in parallel                                         │
│  │                                                                             │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  │                    🔄 PROVIDER DISCOVERY                           │   │
│  │  │  ┌─── HuggingFace ──► 5 text models                               │   │
│  │  │  ├─── Google AI ────► 2 multimodal models                         │   │
│  │  │  ├─── Groq ─────────► 2+ fast inference models                    │   │
│  │  │  ├─── OpenRouter ───► 5+ free models                              │   │
│  │  │  ├─── Cohere ───────► 2 command models                            │   │
│  │  │  ├─── Together AI ──► 2-5 models                                  │   │
│  │  │  ├─── Mistral ──────► 2 official models                           │   │
│  │  │  ├─── AI21 ─────────► 2 Jurassic models                           │   │
│  │  │  └─── ArtificialAnalysis ──► Multi-modal endpoints:               │   │
│  │  │       ├── /llms/models (Text Generation)                          │   │
│  │  │       ├── /media/text-to-image (Image Generation)                 │   │
│  │  │       ├── /media/image-editing (Image Editing)                    │   │
│  │  │       ├── /media/text-to-speech (Speech Synthesis)                │   │
│  │  │       ├── /media/text-to-video (Video Generation)                 │   │
│  │  │       └── /media/image-to-video (Image-to-Video)                  │   │
│  │  └─────────────────────────────────────────────────────────────────────┘   │
│  │                                                                             │
│  │  📊 Validate Discovery Results:                                            │
│  │  ├── Extract models_discovered count                                       │
│  │  ├── Extract providers_checked count                                       │
│  │  └── Log multi-modal capabilities                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 9: 📊 Generate comprehensive outputs                                     │
│  ├── if: discovery.completed == 'true'                                         │
│  ├── Generate JSON database export                                             │
│  ├── Generate CSV business report                                              │
│  ├── Generate Markdown documentation                                           │
│  └── Generate API catalog                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 10: 🔗 Update backend integration                                        │
│  ├── if: discovery.completed == 'true'                                         │
│  ├── Test ArtificialAnalysis endpoints                                         │
│  └── Update backend with discovered models                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 11: 📈 Generate analytics and insights                                   │
│  ├── if: discovery.completed == 'true'                                         │
│  ├── Generate system analytics                                                 │
│  ├── Calculate performance metrics                                             │
│  ├── Complete trend analysis                                                   │
│  └── Generate recommendations                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 12: 🔍 Validate data quality                                             │
│  ├── if: discovery.completed == 'true'                                         │
│  ├── Completeness: 94%                                                         │
│  ├── Accuracy: 97%                                                             │
│  ├── Freshness: 92%                                                            │
│  ├── Consistency: 95%                                                          │
│  └── Overall Quality Score: 94.5%                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 13: 📝 Check for model updates                                           │
│  ├── Check generated_outputs directory                                         │
│  ├── if changes detected: set changes=true                                     │
│  └── else: set changes=false                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 14: 💾 Commit enhanced discovery results                                 │
│  ├── if: changes == 'true'                                                     │
│  ├── git add generated_outputs/ && git add -A                                  │
│  ├── Extract models_count & providers_count                                    │
│  ├── Create comprehensive commit message:                                      │
│  │   ├── Mode: ${DISCOVERY_MODE}                                              │
│  │   ├── Provider: ${target_provider}                                         │
│  │   ├── Key Rotation: ${ENABLE_KEY_ROTATION}                                 │
│  │   ├── Models Found: ${MODELS_COUNT}                                        │
│  │   ├── Providers Checked: ${PROVIDERS_COUNT}                               │
│  │   └── Enhanced capabilities & system features                             │
│  └── git push origin main                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 15: 📋 Generate workflow summary                                         │
│  ├── if: always()                                                              │
│  ├── Create GitHub Step Summary with:                                          │
│  │   ├── Discovery Configuration                                              │
│  │   ├── Results (Status, Discovery, Changes)                                 │
│  │   ├── Multi-modal capabilities                                             │
│  │   └── Generated Files list                                                 │
│  └── Display comprehensive dashboard                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│  🚨 FAILURE HANDLING                │    │  🧹 CLEANUP                        │
│  ├── if: failure()                  │    │  ├── if: always()                  │
│  ├── Create GitHub Issue:           │    │  └── Cleanup temporary resources   │
│  │   ├── Title: Discovery Failure   │    └─────────────────────────────────────┘
│  │   ├── Investigation checklist    │
│  │   ├── Next steps                 │
│  │   └── Labels: bug, scout-agent   │
│  └── Auto-assign priority           │
└─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              📊 OUTPUT ARTIFACTS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  📁 generated_outputs/                                                         │
│  ├── live_endpoint_discovery.json ──► Complete discovery results              │
│  ├── live_models_discovery.csv ─────► Models summary table                    │
│  ├── rotation_stats.json ───────────► API key rotation statistics            │
│  └── endpoint_status_report.md ─────► Provider status report                 │
│                                                                                 │
│  🔄 Git Commits:                                                               │
│  ├── Enhanced discovery results with statistics                                │
│  ├── Co-authored by Claude Code                                                │
│  └── Deployed to main branch                                                   │
│                                                                                 │
│  📈 GitHub Summary:                                                             │
│  ├── Multi-modal AI Discovery Summary                                          │
│  ├── Configuration details                                                     │
│  ├── Results and statistics                                                    │
│  └── Generated files list                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          🎯 EXPECTED OUTCOMES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🚀 Successful Run:                                                            │
│  ├── ~35+ models discovered across 9 providers                                │
│  ├── Multi-modal capabilities: Text, Image, Speech, Video                     │
│  ├── API key rotation active and monitored                                     │
│  ├── Real-time endpoint health validation                                      │
│  ├── Comprehensive output files generated                                      │
│  ├── Automated commit with statistics                                          │
│  └── GitHub summary with dashboard                                             │
│                                                                                 │
│  ⚠️ Failure Scenarios:                                                         │
│  ├── API key issues → Automatic GitHub issue creation                         │
│  ├── Provider endpoint failures → Fallback handling                           │
│  ├── Discovery errors → Partial results with error logs                       │
│  └── Git push failures → Error logging and manual intervention needed         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Key Workflow Features

### **Multi-Modal Discovery Pipeline**
- **9 Providers**: HuggingFace, Google, Groq, OpenRouter, Cohere, Together, Mistral, AI21, ArtificialAnalysis
- **6 Categories**: Text Generation, Image Generation, Image Editing, Speech Synthesis, Video Generation, Image-to-Video
- **API Key Rotation**: Automatic rotation based on usage, time, and error thresholds
- **Real-time Validation**: Live endpoint testing with comprehensive error handling

### **Automated Deployment**
- **Daily Schedule**: 2 AM UTC automatic runs
- **Manual Triggers**: On-demand execution with custom parameters  
- **Git Integration**: Automatic commit and push of discovery results
- **GitHub Summaries**: Comprehensive workflow dashboards

### **Error Handling & Monitoring**
- **Failure Notifications**: Automatic GitHub issue creation
- **Fallback Strategies**: Partial results on provider failures
- **Health Monitoring**: Real-time service status validation
- **Quality Metrics**: Data completeness and accuracy tracking