#!/usr/bin/env node

// Scout Agent Model Validation Entry Point
// This script is called by the GitHub Actions workflow

const { main } = require('./src/index');

// Run the main validation process
main().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});