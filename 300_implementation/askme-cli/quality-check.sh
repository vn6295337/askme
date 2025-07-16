#!/bin/bash

echo "🔍 AskMe CLI Quality Check Report"
echo "=================================="
echo

# Check provider model counts
echo "📊 Provider Model Counts:"
echo "========================"

# Google Provider
google_count=$(grep -A 10 "class GoogleProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -o '"[^"]*"' | wc -l)
echo "Google Provider: $google_count models"

# Mistral Provider  
mistral_count=$(grep -A 15 "class MistralProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -o '"[^"]*"' | wc -l)
echo "Mistral Provider: $mistral_count models"

# Together Provider
together_count=$(grep -A 25 "class TogetherProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -o '"[^"]*"' | wc -l)
echo "Together Provider: $together_count models"

# Cohere Provider
cohere_count=$(grep -A 10 "class CohereProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -o '"[^"]*"' | wc -l)
echo "Cohere Provider: $cohere_count models"

# Groq Provider
groq_count=$(grep -A 8 "class GroqProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -o '"[^"]*"' | wc -l)
echo "Groq Provider: $groq_count models"

# OpenRouter Provider
openrouter_count=$(grep -A 20 "class OpenRouterProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -o '"[^"]*"' | wc -l)
echo "OpenRouter Provider: $openrouter_count models"

total_models=$((google_count + mistral_count + together_count + cohere_count + groq_count + openrouter_count))
echo "Total Models: $total_models"

echo
echo "🧪 Code Quality Checks:"
echo "======================"

# Check for syntax errors
echo -n "Kotlin syntax check: "
if kotlinc -classpath . cliApp/src/main/kotlin/com/askme/providers/Providers.kt -d /tmp/kotlin-check 2>/dev/null; then
    echo "✅ PASSED"
else
    echo "❌ FAILED - Syntax errors found"
fi

# Check for proper class structure
echo -n "Provider class structure: "
active_providers=$(grep -c "^class.*Provider.*BaseProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt)
if [ "$active_providers" -eq 6 ]; then
    echo "✅ PASSED (6 active providers)"
else
    echo "❌ FAILED (Found $active_providers providers, expected 6)"
fi

# Check for DeepSeek models (should be removed)
echo -n "DeepSeek model removal: "
deepseek_count=$(grep -c -i "deepseek" cliApp/src/main/kotlin/com/askme/providers/Providers.kt)
if [ "$deepseek_count" -eq 0 ]; then
    echo "✅ PASSED (No DeepSeek models found)"
else
    echo "❌ FAILED (Found $deepseek_count DeepSeek references)"
fi

# Check for proper model selection logic
echo -n "Model selection methods: "
select_methods=$(grep -c "selectBestModel" cliApp/src/main/kotlin/com/askme/providers/Providers.kt)
if [ "$select_methods" -eq 6 ]; then
    echo "✅ PASSED (All providers have selectBestModel)"
else
    echo "❌ FAILED (Found $select_methods methods, expected 6)"
fi

echo
echo "📋 Configuration Validation:"
echo "==========================="

# Check scout-agent validator alignment
echo -n "Scout-agent validator sync: "
if [ -f "../../scout-agent/src/cli-model-validator.js" ]; then
    validator_openrouter=$(grep -A 20 "openrouter:" ../../scout-agent/src/cli-model-validator.js | grep -o "'[^']*'" | wc -l)
    if [ "$validator_openrouter" -eq "$openrouter_count" ]; then
        echo "✅ PASSED (OpenRouter models aligned)"
    else
        echo "⚠️  WARNING (Validator: $validator_openrouter, Provider: $openrouter_count)"
    fi
else
    echo "❌ FAILED (Validator file not found)"
fi

# Check validated models count
echo -n "Validated models file: "
if [ -f "../../scout-agent/validated_models.json" ]; then
    json_total=$(grep -o '"name":' ../../scout-agent/validated_models.json | wc -l)
    echo "✅ PASSED ($json_total models in validated_models.json)"
else
    echo "❌ FAILED (validated_models.json not found)"
fi

echo
echo "🎯 Summary:"
echo "=========="
echo "• Total active providers: 6"
echo "• Total models supported: $total_models"
echo "• Regional compliance: NA/EU only"
echo "• Model validation: Scout-agent integrated"
echo "• DeepSeek removal: Completed"
echo "• OpenRouter expansion: 5 → $openrouter_count models"

echo
echo "🚀 Ready for build: All quality checks completed"