FROM node:22-slim

# System deps
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install latest yt-dlp 
RUN pip3 install --no-cache-dir -U yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

CMD ["node", "app.js"]
