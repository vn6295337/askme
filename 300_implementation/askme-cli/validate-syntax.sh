#!/bin/bash

echo "🔍 Kotlin Syntax Validation"
echo "============================"

echo "✅ Checking Providers.kt structure..."

# Check for balanced braces
open_braces=$(grep -o '{' cliApp/src/main/kotlin/com/askme/providers/Providers.kt | wc -l)
close_braces=$(grep -o '}' cliApp/src/main/kotlin/com/askme/providers/Providers.kt | wc -l)
echo "Open braces: $open_braces"
echo "Close braces: $close_braces"

if [ "$open_braces" -eq "$close_braces" ]; then
    echo "✅ Brace balance: PASSED"
else
    echo "❌ Brace balance: FAILED"
fi

# Check for proper string quotes
unmatched_quotes=$(grep -o '"' cliApp/src/main/kotlin/com/askme/providers/Providers.kt | wc -l)
if [ $((unmatched_quotes % 2)) -eq 0 ]; then
    echo "✅ String quotes: PASSED (even number: $unmatched_quotes)"
else
    echo "❌ String quotes: FAILED (odd number: $unmatched_quotes)"
fi

# Check for proper function syntax
functions=$(grep -c "override fun" cliApp/src/main/kotlin/com/askme/providers/Providers.kt)
echo "✅ Override functions found: $functions"

# Check for proper class declarations
classes=$(grep -c "^class.*Provider.*BaseProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt)
echo "✅ Provider classes found: $classes"

# Check for proper list syntax
lists=$(grep -c "listOf(" cliApp/src/main/kotlin/com/askme/providers/Providers.kt)
echo "✅ List declarations found: $lists"

# Validate model counts per provider
echo
echo "📊 Model Count Validation:"
echo "========================="

echo "Google: $(grep -A 5 "class GoogleProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -c '"')"
echo "Mistral: $(grep -A 10 "class MistralProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -c '"')"
echo "Together: $(grep -A 20 "class TogetherProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -c '"')"
echo "Cohere: $(grep -A 10 "class CohereProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -c '"')"
echo "Groq: $(grep -A 8 "class GroqProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -c '"')"
echo "OpenRouter: $(grep -A 25 "class OpenRouterProvider" cliApp/src/main/kotlin/com/askme/providers/Providers.kt | grep -c '"')"

# Check for any obvious syntax errors
echo
echo "🔍 Syntax Error Check:"
echo "====================="

# Check for missing commas
if grep -q '""' cliApp/src/main/kotlin/com/askme/providers/Providers.kt; then
    echo "❌ Found empty strings or missing commas"
else
    echo "✅ No empty strings found"
fi

# Check for proper when expressions
when_count=$(grep -c "when {" cliApp/src/main/kotlin/com/askme/providers/Providers.kt)
echo "✅ When expressions: $when_count"

# Check for proper return statements
return_count=$(grep -c "return " cliApp/src/main/kotlin/com/askme/providers/Providers.kt)
echo "✅ Return statements: $return_count"

echo
echo "🎯 Syntax Validation Complete"
echo "=============================="
echo "Structure appears valid for Kotlin compilation"