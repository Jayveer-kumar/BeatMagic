FROM node:22-slim

RUN apt-get update && apt-get install -y ffmpeg yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

CMD ["node", "app.js"]
