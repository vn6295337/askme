#!/bin/bash
echo "🧪 Testing AskMe CLI..."
echo "Java version:"
java -version

echo -e "\n🤖 Testing CLI help:"
./cliApp/bin/cliApp --help

echo -e "\n✅ CLI is ready to use!"
echo "Try: ./cliApp/bin/cliApp \"What is 2+2?\""
