#!/bin/bash
set -e

echo "=== ENTRYPOINT SCRIPT STARTED ==="

echo "Updating yt-dlp to latest version..."
pip install --no-cache-dir -U yt-dlp || echo "yt-dlp update failed, continuing with existing version"

if [ -n "$YT_COOKIES_B64" ]; then
  echo "Loading YouTube cookies from environment..."
  echo "$YT_COOKIES_B64" | base64 -d > /app/audioEngine/cookies.txt
  echo "cookies.txt written, size: $(wc -c < /app/audioEngine/cookies.txt) bytes"
else
  echo "WARNING: YT_COOKIES_B64 not set — cookies.txt will not be created"
fi

echo "Starting server..."
exec node app.js