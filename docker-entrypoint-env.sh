#!/bin/sh
set -eu

ENV_JS_PATH="/usr/share/nginx/html/env.js"

{
    echo "window.__ENV = {";
    env | grep '^VITE_' | while IFS='=' read -r name value; do
        escaped_value=$(printf '%s' "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
        echo "  \"${name}\": \"${escaped_value}\",";
    done
    echo "};";
} > "$ENV_JS_PATH"
