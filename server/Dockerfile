# ---- BeatMagic server image ----
# Node.js backend + Python audio engine + ffmpeg + yt-dlp + deno, all pinned in one place.
FROM node:20-bookworm-slim

# ---- System dependencies ----
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    libsndfile1 \
    build-essential \
    curl \
    ca-certificates \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# ---- Deno Installation (yt-dlp needs a JS runtime) ----
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

WORKDIR /app

# ---- Python Virtual Environment Setup ----
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Ensure pip is up to date inside venv
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ---------------- PYTHON DEPS (Spleeter 2.4.2 for Python 3.11+) ----------------
RUN pip install --no-cache-dir \
    "numpy<2" \
    yt-dlp \
    spleeter==2.4.2 \
    soundfile \
    librosa \
    scipy \
    pydub

ENV NVIDIA_VISIBLE_DEVICES="none"    

# ---- FORCE MODEL DOWNLOAD AT BUILD TIME ----
RUN python3 - <<EOF
from spleeter.separator import Separator
Separator('spleeter:2stems')
print("Spleeter model cached")
EOF

# ---- Python requirements from file ----
COPY server/audioEngine/requirements.txt ./audioEngine/requirements.txt
RUN pip install --no-cache-dir -r audioEngine/requirements.txt

# ---- Node deps ----
COPY server/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# ---- App code ----
COPY server/ .

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "app.js"]







































# # ---- BeatMagic server image ----
# # Node.js backend + Python audio engine + ffmpeg + yt-dlp + deno, all pinned in one place.
# FROM node:20-bookworm-slim

# # ---- System dependencies ----
# # python3/pip        -> runs process_audio.py
# # ffmpeg             -> used by fluent-ffmpeg AND by pydub's AudioSegment internally
# # libsndfile1        -> required by soundfile (librosa depends on it)
# # build-essential     -> some python audio packages compile native code on install
# # curl               -> needed to install deno
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     python3 \
#     python3-pip \
#     python3-venv \
#     ffmpeg \
#     libsndfile1 \
#     build-essential \
#     curl \
#     ca-certificates \
#     unzip \
#     && rm -rf /var/lib/apt/lists/*

# # ---------------- PYTHON DEPS ----------------
# RUN pip install --no-cache-dir \
#     "numpy<2" \
#     yt-dlp \
#     spleeter==2.4.0 \
#     soundfile \
#     librosa \
#     scipy \
#     pydub


# ENV NVIDIA_VISIBLE_DEVICES="none"    

# #  FORCE MODEL DOWNLOAD AT BUILD TIME
# RUN python - <<EOF
# from spleeter.separator import Separator
# Separator('spleeter:2stems')
# print("Spleeter model cached")
# EOF

# # ---------------- APP ----------------
# # ---- Deno (yt-dlp needs a JS runtime to solve YouTube's challenge) ----
# RUN curl -fsSL https://deno.land/install.sh | sh
# ENV DENO_INSTALL="/root/.deno"
# ENV PATH="$DENO_INSTALL/bin:$PATH"

# WORKDIR /app

# # ---- Python deps (isolated venv, exact pinned versions) ----
# COPY server/audioEngine/requirements.txt ./audioEngine/requirements.txt
# RUN python3 -m venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"
# RUN pip install --no-cache-dir -r audioEngine/requirements.txt

# # yt-dlp pinned separately so you control exactly when it updates
# # RUN pip install --no-cache-dir yt-dlp==2026.09.03
# RUN pip install --no-cache-dir yt-dlp

# # ---- Node deps ----
# COPY server/package*.json ./
# RUN npm ci --omit=dev --legacy-peer-deps

# # ---- App code ----
# COPY . .

# ENV NODE_ENV=production
# EXPOSE 8080

# CMD ["node", "app.js"]

