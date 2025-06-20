# askme - Your Personal AI Assistant

**Get instant answers from multiple AI providers in one simple tool**

---

## What is askme?

askme is your private AI assistant that connects to Google, OpenAI, and other leading AI services. Think of it as having ChatGPT, Gemini, and Claude all in one place, with complete privacy.

**Perfect for:**
- Quick research and analysis
- Writing and communication help  
- Strategic planning support
- Market research and insights

---

## Quick Setup (2 minutes)

### Step 1: Download

**Option A: From GitHub**
1. Go to https://github.com/vn6295337/askme/releases
2. Download `askme-cli.zip` 
3. Extract the zip file to your Desktop

**Option B: From Shared Link**
1. Click the download link sent to you
2. Save file to your Desktop
3. Extract the zip file

### Step 2: Start Using

1. Open the extracted folder
2. Double-click on `askme` (or `start-askme`)
3. Type your question and press Enter

**That's it!** askme works immediately with free AI services.

---

## Your First Questions

Try these sample questions to get started:

```
What are the key trends in digital transformation for 2025?

Summarize the competitive advantages of subscription business models

Write a professional email declining a meeting request

What should I know about AI adoption in financial services?

Create an executive summary of remote work productivity research
```

---

## Getting Better Answers

### Use Multiple AI Services

askme connects to different AI providers that excel at different tasks:

- **Google Gemini**: Fast, factual answers
- **Mistral**: Detailed analysis and research
- **OpenAI**: Creative writing and complex reasoning  
- **Anthropic**: Careful, nuanced responses

### Add Your API Keys (Optional)

For unlimited usage and premium features:

1. Type: `setup`
2. Follow the simple prompts to add your API keys
3. Get API keys from: Google AI Studio, OpenAI, or Anthropic

*Don't have API keys? askme works fine with free services.*

---

## Business Use Cases

### Strategic Planning
```
Analyze the pros and cons of expanding into the European market

What are the key success factors for digital transformation initiatives?

Compare subscription vs one-time pricing models for B2B software
```

### Research & Analysis  
```
What are analysts saying about the future of remote work?

Summarize recent trends in cybersecurity spending

Compare the market positioning of Salesforce vs HubSpot
```

### Communication
```
Write a professional email announcing a new partnership

Create talking points for a board presentation on AI adoption

Draft a LinkedIn post about our company's sustainability initiative
```

### Competitive Intelligence
```
What are the key differentiators of our top 3 competitors?

Analyze recent funding rounds in the fintech space

What partnerships has Microsoft announced in the past 6 months?
```

---

## Privacy & Security

**Your data stays private:**
- Questions go directly to AI services (Google, OpenAI, etc.)
- Nothing stored on our servers
- No tracking or analytics
- Your API keys encrypted on your device

**Enterprise-grade security:**
- All connections encrypted
- Secure credential storage
- No data leakage or sharing

---

## Getting Help

### Quick Help
- Type `help` for command options
- Type `setup` to configure API keys  
- Type `test` to check your connection

### Support Options
1. **Email Support**: Use the contact info provided with your download
2. **Quick Reference**: Check the included Quick Start guide
3. **Video Tutorial**: Available at your download link

### Common Questions

**Q: Do I need technical skills?**
A: No. If you can use email, you can use askme.

**Q: What if I don't have API keys?**  
A: askme works immediately with free services. API keys just remove usage limits.

**Q: Is my data secure?**
A: Yes. Your questions go directly to AI providers (like using ChatGPT directly), with no middleman.

**Q: Can I use this offline?**
A: No. askme connects to online AI services for the best, most current answers.

---

## Upgrade Options

### Free Version
- Google Gemini and Mistral AI access
- Monthly usage limits
- Basic features

### Premium (Add Your API Keys)  
- Unlimited usage
- Access to GPT-4 and Claude
- Priority support
- Advanced features

---

# Intelligent Provider Manager
## How AI Provider Selection Works

---

## 🧠 How the Selection Logic Works

### The Smart Decision Process

The system makes decisions like a business manager evaluating suppliers:

1. **Track Performance History** 📊
   - How often does each provider succeed?
   - How fast do they respond?
   - When did they last fail?

2. **Calculate a Business Score** 🎯
   - **60% Weight on Reliability**: "Can I count on this provider?"
   - **40% Weight on Speed**: "How quickly do they deliver?"

3. **Make the Best Choice** ✅
   - Always picks the highest-scoring available provider
   - Automatically tries backup options if the first choice fails

### Simple Example
```
Provider A: 95% success rate, 2 seconds response = Score: 2.1
Provider B: 85% success rate, 1 second response = Score: 1.9
Provider C: 70% success rate, 3 seconds response = Score: 1.2

→ System automatically chooses Provider A
```

---

## 🤖 Available AI Models

| Provider | Model Name | Purpose |
|----------|------------|---------|
| **Google Gemini** | gemini-1.5-flash | Fastest responses for quick questions and high-volume tasks |
| | gemini-1.5-flash-8b | Lightweight version optimized for speed and efficiency |
| | gemini-1.0-pro | Balanced performance for general business applications |
| | gemini-pro | Standard model for reliable everyday use |
| | gemini-1.5-pro | Advanced model for complex reasoning and analysis |
| **Mistral AI** | mistral-small-latest | Fast, efficient responses for straightforward queries |
| | open-mistral-7b | Open-source model for basic conversational tasks |
| | open-mixtral-8x7b | Larger model for more sophisticated responses |
| | open-mixtral-8x22b | High-capacity model for complex problem solving |
| | mistral-medium-latest | Premium model for detailed analysis and reasoning |
| **Llama** | Meta-Llama-3-8B-Instruct-Turbo | Latest fast model optimized for instruction following |
| | Llama-3-8b-chat-hf | Standard conversational model with good performance |
| | Meta-Llama-3-70B-Instruct-Turbo | Large model for complex tasks requiring deep reasoning |
| | Llama-2-7b-chat-hf | Reliable older model for basic conversational needs |
| | Llama-2-13b-chat-hf | Medium-sized model balancing speed and capability |

---

## 🎚️ Understanding Model Differences Within Each Provider

### Why Multiple Models Matter

Each AI provider offers different "models" - think of them like different service tiers:

| Model Tier | Business Analogy | Performance | Use Case |
|------------|------------------|-------------|----------|
| **Flash/Small** | Express service | Very fast, good quality | Quick answers, high volume |
| **Standard** | Regular service | Balanced speed/quality | General business use |
| **Pro/Large** | Premium service | Slower, highest quality | Complex analysis |

### Smart Fallback Strategy

When a premium model is busy or unavailable, the system automatically "steps down" to ensure you still get service:

**Google Example:**
```
Try: Gemini Flash (fastest) 
→ If busy: Gemini Pro (balanced)
→ If busy: Gemini Standard (reliable)
```

**Business Impact**: You never experience complete service interruption

---

## 📊 Performance Tracking

### What We Monitor
- **Success Rate**: Percentage of requests that work
- **Response Time**: How fast you get answers  
- **Availability**: Which services are currently working
- **Usage Patterns**: Which providers work best for your needs

### Real-Time Business Dashboard
```
Current Provider Performance:
Google:  94% success, 1.8 seconds average
Mistral: 89% success, 2.1 seconds average  
Llama:   85% success, 2.9 seconds average

Smart System Choice: Google (best performance today)
```

### Business Value of Data
- **Trend Analysis**: See which providers are improving/declining
- **Performance Optimization**: Identify most efficient providers
- **Service Planning**: Understand usage patterns and reliability trends

---

## 🔄 Automatic Failover & Business Continuity

### Three-Layer Protection System

1. **Provider Level**: Multiple models within each service
2. **Service Level**: Three different AI companies
3. **System Level**: Intelligent retry and routing

### Failure Recovery Timeline
```
Primary fails     → Try backup model (0.1 seconds)
All models fail   → Switch to next provider (0.2 seconds)  
Provider fails    → Try third provider (0.3 seconds)
All providers fail → Clear error message to user
```

### Business Impact
- **99.9% Uptime**: Extremely rare for all providers to fail simultaneously
- **Transparent Operation**: Users rarely notice provider switches
- **No Manual Intervention**: System handles all failures automatically

---

## 💼 Business Configuration & Control

### Setup Requirements
- **API Accounts**: Business accounts with 2-3 AI providers
- **Authentication**: Secure API keys for each service
- **Monitoring**: Performance tracking enabled by default

### Usage Modes

| Mode | Business Use Case | When to Use |
|------|------------------|-------------|
| **Smart Mode** | Daily operations | Let system choose best provider |
| **Manual Mode** | Specific requirements | Need particular provider/model |
| **Stats Mode** | Performance review | Business analysis and planning |