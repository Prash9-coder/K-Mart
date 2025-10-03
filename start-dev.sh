#!/bin/bash

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend server in the background
cd "$SCRIPT_DIR/server" && node server.js &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start frontend
cd "$SCRIPT_DIR/client" && npm run dev

# Cleanup on exit
trap "kill $SERVER_PID" EXIT
