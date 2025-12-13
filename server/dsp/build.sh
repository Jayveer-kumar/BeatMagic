# emcc audio.cpp \
#   -O3 \
#   -s WASM=1 \
#   -s EXPORTED_FUNCTIONS='["_process8D"]' \
#   -s ALLOW_MEMORY_GROWTH=1 \
#   -o ../wasm-build/audio.js

emcc audio.cpp \
  -s WASM=1 \
  -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' \
  -s EXPORTED_FUNCTIONS='["_process8D","_malloc","_free"]' \
  -o ../wasm-build/audio.js
