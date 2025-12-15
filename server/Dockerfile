# FROM python:3.9-slim

# RUN apt-get update && apt-get install -y \
#     ffmpeg \
#     nodejs \
#     npm \
#     curl \
#     && rm -rf /var/lib/apt/lists/*

# RUN pip install --no-cache-dir \
#     yt-dlp \
#     spleeter==2.4.0

# WORKDIR /app
# COPY package*.json ./
# RUN npm install --legacy-peer-deps
# COPY . .

# CMD ["node", "app.js"]


FROM python:3.9-slim

# ---------------- SYSTEM DEPENDENCIES ----------------
RUN apt-get update && apt-get install -y \
    ffmpeg \
    nodejs \
    npm \
    curl \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# ---------------- PYTHON DEPENDENCIES ----------------
RUN pip install --no-cache-dir \
    yt-dlp \
    spleeter==2.4.0 \
    numpy \
    soundfile \
    librosa \
    scipy \
    pydub

# ---------------- APP SETUP ----------------
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

CMD ["node", "app.js"]
