FROM node:22-slim

# -----------------------------
# System dependencies
# -----------------------------
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    python3.8 \
    python3.8-distutils \
    python3.8-venv \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Make Python 3.8 default
# -----------------------------
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.8 1

# -----------------------------
# Install pip for Python 3.8
# -----------------------------
RUN curl -sS https://bootstrap.pypa.io/pip/3.8/get-pip.py | python

# -----------------------------
# Install yt-dlp (latest) + spleeter
# -----------------------------
RUN pip install --no-cache-dir -U yt-dlp \
    && pip install --no-cache-dir spleeter==2.4.0

# -----------------------------
# App setup
# -----------------------------
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

CMD ["node", "app.js"]
