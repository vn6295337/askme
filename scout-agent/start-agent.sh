#!/bin/bash

# Script to run the scout-agent with correct module paths
# This addresses the ChromeOS symlink/mount path resolution issue

export NODE_PATH="/home/km_project/askme/scout-agent/node_modules:$NODE_PATH"

# Change to the real project directory
cd /home/km_project/askme/scout-agent

# Run the scout agent
node src/index.js