#!/bin/bash
echo "Testing CLI with debug..."
echo "What is 2+2?" > /tmp/test.txt
timeout 30 ./gradlew cliApp:run --args='-f /tmp/test.txt -m mistral' --quiet
