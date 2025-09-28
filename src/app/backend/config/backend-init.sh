#!/bin/bash

while [ ! -f "/usr/src/app/env/.env" ]; do
    echo "Waiting for vault..."
    sleep 3
done

npm run start
