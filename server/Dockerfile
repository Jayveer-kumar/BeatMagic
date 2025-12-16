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

# ---------------- SYSTEM DEPS ----------------
RUN apt-get update && apt-get install -y \
    ffmpeg \
    nodejs \
    npm \
    curl \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# ---------------- PYTHON DEPS ----------------
RUN pip install --no-cache-dir \
    "numpy<2" \
    yt-dlp \
    spleeter==2.4.0 \
    soundfile \
    librosa \
    scipy \
    pydub


ENV NVIDIA_VISIBLE_DEVICES="none"    

#  FORCE MODEL DOWNLOAD AT BUILD TIME
RUN python - <<EOF
from spleeter.separator import Separator
Separator('spleeter:2stems')
print("Spleeter model cached")
EOF

# ---------------- APP ----------------
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

CMD ["node", "app.js"]
