#!/bin/bash
while [ ! -f "/usr/src/app/env/.env" ]; do  # Added a space before `do` and semicolon
    echo "Waiting for vault..."
    sleep 5
done

npm run dev
