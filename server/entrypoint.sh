#!/bin/bash
set -e

echo "Updating yt-dlp to latest version..."
pip install --no-cache-dir -U yt-dlp || echo "yt-dlp update failed, continuing with existing version"

# Optional: decode cookies from env var if provided (base64-encoded cookies.txt)
if [ -n "$YT_COOKIES_B64" ]; then
  echo "Loading YouTube cookies from environment..."
  echo "$YT_COOKIES_B64" | base64 -d > /app/audioEngine/cookies.txt
fi

echo "Starting server..."
exec node app.js