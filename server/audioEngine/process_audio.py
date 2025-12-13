# 9th try 

# import argparse
# import os
# import numpy as np
# import soundfile as sf
# import librosa
# from scipy import signal
# from pydub import AudioSegment
# import shutil

# # optional loudness library
# try:
#     import pyloudnorm as pyln
#     HAVE_PYL = True
# except Exception:
#     HAVE_PYL = False

# # optional spleeter
# try:
#     from spleeter.separator import Separator
#     HAVE_SPLEETER = True
# except Exception:
#     HAVE_SPLEETER = False

# # -------------------------
# # Utilities
# # -------------------------

# # load audio file as mono
# def load_audio_mono(path, sr=None):
#     y, sr = librosa.load(path, sr=sr, mono=True)
#     return y, sr


# # write stereo wav file from (2,n) or (n,2) array
# def write_stereo(path, stereo_array, sr):
#     arr = np.asarray(stereo_array)
#     if arr.shape[0] == 2 and arr.ndim == 2:
#         data = np.vstack(arr).T
#     elif arr.ndim == 2 and arr.shape[1] == 2:
#         data = arr
#     else:
#         raise ValueError("stereo_array shape not understood")
#     sf.write(path, data, sr, subtype='PCM_16')


# def ensure_len(a, n):
#     if len(a) >= n:
#         return a[:n]
#     else:
#         return np.pad(a, (0, n - len(a)))

# def pan_to_gains_array(pan_array):
#     theta = (pan_array + 1.0) * (np.pi / 4.0)
#     gl = np.cos(theta)
#     gr = np.sin(theta)
#     return gl, gr

# def simple_limiter(stereo, ceiling=0.999):
#     peak = np.max(np.abs(stereo))
#     if peak <= ceiling:
#         return stereo
#     gain = ceiling / (peak + 1e-12)
#     return stereo * gain

# def make_exponential_ir(length_samples, decay=4.0):
#     t = np.linspace(0, 1, max(1, length_samples))
#     ir = np.exp(-decay * t)
#     ir /= (np.sum(np.abs(ir)) + 1e-12)
#     return ir

# # -------------------------
# # Spleeter helper
# # -------------------------
# def separate_stems_spleeter(input_path, out_dir="spleeter_out", stems=2):
#     if not HAVE_SPLEETER:
#         raise RuntimeError("Spleeter not installed.")
#     os.makedirs(out_dir, exist_ok=True)
#     model = "spleeter:2stems" if stems == 2 else f"spleeter:{stems}stems"
#     sep = Separator(model)
#     sep.separate_to_file(input_path, out_dir)
#     base = os.path.splitext(os.path.basename(input_path))[0]
#     folder = os.path.join(out_dir, base)
#     results = {}
#     mapping = {2: ["vocals.wav", "accompaniment.wav"]}
#     files = mapping.get(stems, [])
#     for f in files:
#         p = os.path.join(folder, f)
#         if os.path.exists(p):
#             y, sr = librosa.load(p, sr=None, mono=True)
#             results[f.split(".")[0]] = (y, sr)
#     if not results:
#         y, sr = load_audio_mono(input_path, sr=None)
#         results["mix"] = (y, sr)
#     return results


# # -------------------------
# # Smooth helpers
# # -------------------------
# def cosine_interpolate(a, b, t):
#     f = (1 - np.cos(np.pi * t)) * 0.5
#     return a * (1 - f) + b * f

# def make_eased_linspace(start, end, length):
#     if length <= 1:
#         return np.array([end])
#     t = np.linspace(0, 1, length)
#     return cosine_interpolate(start, end, t)


# def make_behavioral_pan_arrays(sr, n_samples, params=None):
#     if params is None:
#         params = {}
#     left_val = params.get("left_val", -0.85)
#     right_val = params.get("right_val", 0.85)
#     switch_duration = params.get("switch_duration", 3.0)
#     wait_duration = params.get("wait_duration", 2.0)
#     sync_prob = params.get("sync_prob", 0.3)
#     jitter_frac = params.get("jitter_frac", 0.12)

#     vocals = np.zeros(n_samples, dtype=np.float64)
#     inst = np.zeros(n_samples, dtype=np.float64)

#     idx = 0
#     rng = np.random.RandomState()

#     def jitter(sec):
#         return int(np.round(sec * sr * (1.0 + (rng.rand() - 0.5) * 2 * jitter_frac)))

#     current_vocal_pan = left_val
#     current_inst_pan = right_val

#     while idx < n_samples:
#         action = rng.choice(['vocal_switch', 'inst_switch', 'sync_switch'],
#                             p=[0.4, 0.4, sync_prob])

#         if action == 'vocal_switch':
#             target_v = right_val if current_vocal_pan == left_val else left_val
#             L = min(jitter(switch_duration), n_samples - idx)
#             end = idx + L
#             vocals[idx:end] = make_eased_linspace(current_vocal_pan, target_v, L)
#             inst[idx:end] = current_inst_pan
#             current_vocal_pan = target_v
#             idx = end

#             if idx < n_samples:
#                 L_wait = min(jitter(wait_duration), n_samples - idx)
#                 end = idx + L_wait
#                 vocals[idx:end] = make_eased_linspace(current_vocal_pan, 0.0, L_wait)
#                 inst[idx:end] = current_inst_pan
#                 idx = end

#         elif action == 'inst_switch':
#             target_i = right_val if current_inst_pan == left_val else left_val
#             L = min(jitter(switch_duration), n_samples - idx)
#             end = idx + L
#             inst[idx:end] = make_eased_linspace(current_inst_pan, target_i, L)
#             vocals[idx:end] = current_vocal_pan
#             current_inst_pan = target_i
#             idx = end

#             if idx < n_samples:
#                 L_wait = min(jitter(wait_duration), n_samples - idx)
#                 end = idx + L_wait
#                 inst[idx:end] = make_eased_linspace(current_inst_pan, 0.0, L_wait)
#                 vocals[idx:end] = current_vocal_pan
#                 idx = end

#         elif action == 'sync_switch':
#             target = rng.choice([left_val, right_val])
#             L = min(jitter(switch_duration), n_samples - idx)
#             end = idx + L
#             vocals[idx:end] = make_eased_linspace(current_vocal_pan, target, L)
#             inst[idx:end] = make_eased_linspace(current_inst_pan, target, L)
#             current_vocal_pan = target
#             current_inst_pan = target
#             idx = end

#             if idx < n_samples:
#                 L_wait = min(jitter(wait_duration), n_samples - idx)
#                 end = idx + L_wait
#                 vocals[idx:end] = make_eased_linspace(current_vocal_pan, 0.0, L_wait)
#                 inst[idx:end] = make_eased_linspace(current_inst_pan, 0.0, L_wait)
#                 idx = end

#     return np.clip(vocals, -1, 1), np.clip(inst, -1, 1)


# # -------------------------
# # Spatializer
# # -------------------------
# def spatialize_stem_with_pan_array(y, sr, pan_array,
#                                    low_cutoff=180.0,
#                                    reverb_ms=90,
#                                    reverb_amount=0.18,
#                                    mid_gain=1.0,
#                                    bass_gain=1.0):

#     n = len(y)
#     nyq = sr * 0.5
#     low_norm = min(low_cutoff / nyq, 0.999)

#     b_low, a_low = signal.butter(4, low_norm, btype='low')
#     b_high, a_high = signal.butter(4, low_norm, btype='high')

#     bass = signal.filtfilt(b_low, a_low, y)
#     midhigh = signal.filtfilt(b_high, a_high, y)

#     bass *= bass_gain
#     midhigh *= mid_gain

#     gl, gr = pan_to_gains_array(pan_array)

#     left_mid = midhigh * gl
#     right_mid = midhigh * gr

#     left = left_mid + bass
#     right = right_mid + bass

#     cross = 0.06 * np.abs(pan_array)

#     lpre = left.copy()
#     rpre = right.copy()

#     left = lpre * (1 - cross) + rpre * cross
#     right = rpre * (1 - cross) + lpre * cross

#     ir_len = max(64, int(sr * (reverb_ms / 1000.0)))
#     ir = make_exponential_ir(ir_len, decay=4.0)

#     wet_l = signal.fftconvolve(left, ir, mode='same')
#     wet_r = signal.fftconvolve(right, ir, mode='same')

#     left_out = left * (1 - reverb_amount) + wet_l * reverb_amount
#     right_out = right * (1 - reverb_amount) + wet_r * reverb_amount

#     return left_out, right_out


# # -------------------------
# # Top-level processing
# # -------------------------
# def process_file(input_path, output_path, preset='8d', target_lufs=None):
#     spleeter_dir = "spleeter_out"
#     print("Loading audio...")
#     y_mix, sr = load_audio_mono(input_path, sr=None)
#     duration = len(y_mix) / sr
#     print(f"Sample rate: {sr}, duration: {duration:.2f}s")

#     # stems
#     stems = {}
#     if HAVE_SPLEETER:
#         try:
#             print("Running Spleeter (2 stems)...")
#             sep = separate_stems_spleeter(input_path, out_dir="spleeter_out", stems=2)
#             if 'vocals' in sep:
#                 stems['vocals'] = sep['vocals']
#             for k, v in sep.items():
#                 if 'accompaniment' in k or 'mix' in k:
#                     stems['instruments'] = v
#             if not stems:
#                 stems['instruments'] = (y_mix, sr)
#         except Exception as e:
#             print("Spleeter error:", e)
#             stems['instruments'] = (y_mix, sr)
#         finally:
#             # CLEANUP SPLEETER OUTPUT    
#             if os.path.exists(spleeter_dir):
#                 try:
#                     shutil.rmtree(spleeter_dir)
#                     print(f"Cleaned up {spleeter_dir}")
#                 except Exception as e:
#                     print(f"Cleanup error: {e}")    
#         print("Spleeter not available — using mix as instruments")
#         stems['instruments'] = (y_mix, sr)

#     max_len = max(len(stems[k][0]) for k in stems)

#     # presets
#     if preset == '3d':
#         params = {'A': 4.5, 'B': 3.0, 'C': 2.2, 'D': 5.0, 'jitter_frac': 0.10}
#         reverb_v = 0.10; reverb_i = 0.14; v_low_cut = 150.0; i_low_cut = 170.0
#     elif preset == '8d':
#         params = {'switch_duration': 3.0, 'wait_duration': 2.5, 'sync_prob': 0.3, 'jitter_frac': 0.12}
#         reverb_v = 0.12; reverb_i = 0.22; v_low_cut = 160.0; i_low_cut = 180.0
#     elif preset == '16d':
#         params = {'A': 6.0, 'B': 4.0, 'C': 3.5, 'D': 7.0, 'jitter_frac': 0.15}
#         reverb_v = 0.16; reverb_i = 0.30; v_low_cut = 180.0; i_low_cut = 200.0
#     elif preset == 'lofi':
#         params = {'switch_duration': 5.0, 'wait_duration': 4.0, 'sync_prob': 0.1, 'jitter_frac': 0.10}
#         reverb_v = 0.20; reverb_i = 0.30; v_low_cut = 150.0; i_low_cut = 180.0  
#     else:
#         params = {'A':5.0,'B':3.5,'C':2.8,'D':6.0,'jitter_frac':0.12}
#         reverb_v = 0.12; reverb_i = 0.20; v_low_cut = 160.0; i_low_cut = 180.0

#     # generate pan arrays
#     if 'vocals' in stems and 'instruments' in stems:
#         vocals_pan, inst_pan = make_behavioral_pan_arrays(sr, max_len, params=params)
#     else:
#         t = np.arange(max_len) / sr
#         inst_pan = np.sin(2 * np.pi * 0.035 * t) * 0.65
#         vocals_pan = np.zeros(max_len)

#     left_total = np.zeros(max_len)
#     right_total = np.zeros(max_len)

#     # -----------------------------
#     # MAIN STEM PROCESSING (PATCHED)
#     # -----------------------------
#     for name, (y, s) in stems.items():

#         # -------------- LOFI PATCH --------------
#         if preset == "lofi":
#             # slowed
#             slow_factor = 0.92
#             new_sr = int(sr * slow_factor)
#             y = librosa.resample(y, orig_sr=s, target_sr=new_sr)

#             # resample back
#             y = librosa.resample(y, orig_sr=new_sr, target_sr=sr)

#             # add vinyl noise
#             noise = np.random.normal(0, 0.004, len(y))
#             y = y + noise

#             # soft low-pass
#             b, a = signal.butter(4, 6000/(sr/2), 'low')
#             y = signal.filtfilt(b, a, y)
#         # ----------------------------------------

#         if s != sr:
#             y = librosa.resample(y, orig_sr=s, target_sr=sr)

#         y = ensure_len(y, max_len)

#         if name.lower().startswith("voc"):
#             pan_arr = vocals_pan
#             reverb_amount = reverb_v
#             low_cut = v_low_cut
#             mid_gain = 1.03
#             bass_gain = 0.95
#         else:
#             pan_arr = inst_pan
#             reverb_amount = reverb_i
#             low_cut = i_low_cut
#             mid_gain = 1.00
#             bass_gain = 1.00

#         l, r = spatialize_stem_with_pan_array(
#             y, sr, pan_arr,
#             low_cutoff=low_cut,
#             reverb_ms=90,
#             reverb_amount=reverb_amount,
#             mid_gain=mid_gain,
#             bass_gain=bass_gain
#         )

#         left_total += l
#         right_total += r

#     # peak normalize
#     peak = max(np.max(np.abs(left_total)), np.max(np.abs(right_total)), 1e-12)
#     gain = 0.98 / peak
#     left_total *= gain
#     right_total *= gain

#     stereo = np.vstack([left_total, right_total])
#     stereo = np.nan_to_num(stereo)
#     stereo = simple_limiter(stereo, 0.999)

#     print(f"Exporting to {output_path}")
#     write_stereo(output_path, stereo, sr)

#     # mp3 convert
#     if output_path.lower().endswith(".mp3"):
#         print("Converting wav -> mp3....")
#         wav_path = output_path.replace(".mp3", "_temp.wav")
#         sf.write(wav_path, np.vstack([left_total, right_total]).T, sr, subtype='PCM_16')
#         audio = AudioSegment.from_wav(wav_path)
#         audio.export(output_path, format="mp3", bitrate="320k")
#         os.remove(wav_path)
#         print("MP3 exported successfully!")
#     else:
#         print("WAV exported successfully!")


# # -------------------------
# # CLI
# # -------------------------
# def main_cli():
#     parser = argparse.ArgumentParser(description="Behavioral Spatializer (3D/8D/16D/Lofi)")
#     parser.add_argument("input", help="Input audio")
#     parser.add_argument("output", help="Output path")
#     parser.add_argument("--preset", choices=['3d','8d','16d','lofi'], default='8d')
#     parser.add_argument("--lufs", type=float, default=None)
#     args = parser.parse_args()
#     process_file(args.input, args.output, preset=args.preset, target_lufs=args.lufs)

# if __name__ == "__main__":
#     main_cli()






# 10th try

#!/usr/bin/env python3
import argparse
import os
import io
import sys
import numpy as np
import soundfile as sf
import librosa
from scipy import signal
from pydub import AudioSegment
import shutil
import tempfile

# optional loudness library
try:
    import pyloudnorm as pyln
    HAVE_PYL = True
except Exception:
    HAVE_PYL = False

# optional spleeter
try:
    from spleeter.separator import Separator
    HAVE_SPLEETER = True
except Exception:
    HAVE_SPLEETER = False

# -------------------------
# Utilities
# -------------------------

# load audio file as mono from path or bytes
def load_audio_mono_from_path_or_bytes(source, sr=None):
    """
    source: either a filepath string OR bytes/BytesIO (raw file contents)
    returns: (y_mono, sr)
    """
    if isinstance(source, (bytes, bytearray, io.BytesIO)):
        bio = io.BytesIO(source if isinstance(source, (bytes, bytearray)) else source.getvalue())
        data, fs = sf.read(bio, dtype='float32')
    elif source == "-":
        # read from stdin.buffer
        raw = sys.stdin.buffer.read()
        bio = io.BytesIO(raw)
        data, fs = sf.read(bio, dtype='float32')
    else:
        data, fs = sf.read(source, dtype='float32')

    # data can be (n,) mono or (n, channels)
    if data.ndim == 1:
        y = data
    else:
        # convert to mono by averaging channels
        y = np.mean(data, axis=1)

    if sr is not None and fs != sr:
        y = librosa.resample(y, orig_sr=fs, target_sr=sr)
        fs = sr

    return y, fs

# write stereo wav either to path or return bytes
def write_stereo_either(path_or_dash, stereo_array, sr):
    """
    If path_or_dash == "-", returns bytes suitable for writing to stdout.
    Otherwise writes to file path.
    stereo_array: (2, n) array or (n,2)
    """
    arr = np.asarray(stereo_array)
    if arr.shape[0] == 2 and arr.ndim == 2:
        data = np.vstack(arr).T
    elif arr.ndim == 2 and arr.shape[1] == 2:
        data = arr
    else:
        raise ValueError("stereo_array shape not understood")

    if path_or_dash == "-":
        out = io.BytesIO()
        sf.write(out, data, sr, subtype='PCM_16', format='WAV')
        return out.getvalue()
    else:
        sf.write(path_or_dash, data, sr, subtype='PCM_16')
        return None

def ensure_len(a, n):
    if len(a) >= n:
        return a[:n]
    else:
        return np.pad(a, (0, n - len(a)))

def pan_to_gains_array(pan_array):
    theta = (pan_array + 1.0) * (np.pi / 4.0)
    gl = np.cos(theta)
    gr = np.sin(theta)
    return gl, gr

def simple_limiter(stereo, ceiling=0.999):
    peak = np.max(np.abs(stereo))
    if peak <= ceiling:
        return stereo
    gain = ceiling / (peak + 1e-12)
    return stereo * gain

def make_exponential_ir(length_samples, decay=4.0):
    t = np.linspace(0, 1, max(1, length_samples))
    ir = np.exp(-decay * t)
    ir /= (np.sum(np.abs(ir)) + 1e-12)
    return ir

# -------------------------
# Spleeter helper
# -------------------------
def separate_stems_spleeter(input_path, out_dir="spleeter_out", stems=2):
    if not HAVE_SPLEETER:
        raise RuntimeError("Spleeter not installed.")
    os.makedirs(out_dir, exist_ok=True)
    model = "spleeter:2stems" if stems == 2 else f"spleeter:{stems}stems"
    sep = Separator(model)
    sep.separate_to_file(input_path, out_dir)
    base = os.path.splitext(os.path.basename(input_path))[0]
    folder = os.path.join(out_dir, base)
    results = {}
    mapping = {2: ["vocals.wav", "accompaniment.wav"]}
    files = mapping.get(stems, [])
    for f in files:
        p = os.path.join(folder, f)
        if os.path.exists(p):
            y, sr = librosa.load(p, sr=None, mono=True)
            results[f.split(".")[0]] = (y, sr)
    if not results:
        y, sr = load_audio_mono_from_path_or_bytes(input_path, sr=None)
        results["mix"] = (y, sr)
    return results

# -------------------------
# Smooth helpers
# -------------------------
def cosine_interpolate(a, b, t):
    f = (1 - np.cos(np.pi * t)) * 0.5
    return a * (1 - f) + b * f

def make_eased_linspace(start, end, length):
    if length <= 1:
        return np.array([end])
    t = np.linspace(0, 1, length)
    return cosine_interpolate(start, end, t)

def make_behavioral_pan_arrays(sr, n_samples, params=None):
    if params is None:
        params = {}
    left_val = params.get("left_val", -0.85)
    right_val = params.get("right_val", 0.85)
    switch_duration = params.get("switch_duration", 3.0)
    wait_duration = params.get("wait_duration", 2.0)
    sync_prob = params.get("sync_prob", 0.3)
    jitter_frac = params.get("jitter_frac", 0.12)

    vocals = np.zeros(n_samples, dtype=np.float64)
    inst = np.zeros(n_samples, dtype=np.float64)

    idx = 0
    rng = np.random.RandomState()

    def jitter(sec):
        return int(np.round(sec * sr * (1.0 + (rng.rand() - 0.5) * 2 * jitter_frac)))

    current_vocal_pan = left_val
    current_inst_pan = right_val

    while idx < n_samples:
        action = rng.choice(['vocal_switch', 'inst_switch', 'sync_switch'],
                            p=[0.4, 0.4, sync_prob])

        if action == 'vocal_switch':
            target_v = right_val if current_vocal_pan == left_val else left_val
            L = min(jitter(switch_duration), n_samples - idx)
            end = idx + L
            vocals[idx:end] = make_eased_linspace(current_vocal_pan, target_v, L)
            inst[idx:end] = current_inst_pan
            current_vocal_pan = target_v
            idx = end

            if idx < n_samples:
                L_wait = min(jitter(wait_duration), n_samples - idx)
                end = idx + L_wait
                vocals[idx:end] = make_eased_linspace(current_vocal_pan, 0.0, L_wait)
                inst[idx:end] = current_inst_pan
                idx = end

        elif action == 'inst_switch':
            target_i = right_val if current_inst_pan == left_val else left_val
            L = min(jitter(switch_duration), n_samples - idx)
            end = idx + L
            inst[idx:end] = make_eased_linspace(current_inst_pan, target_i, L)
            vocals[idx:end] = current_vocal_pan
            current_inst_pan = target_i
            idx = end

            if idx < n_samples:
                L_wait = min(jitter(wait_duration), n_samples - idx)
                end = idx + L_wait
                inst[idx:end] = make_eased_linspace(current_inst_pan, 0.0, L_wait)
                vocals[idx:end] = current_vocal_pan
                idx = end

        elif action == 'sync_switch':
            target = rng.choice([left_val, right_val])
            L = min(jitter(switch_duration), n_samples - idx)
            end = idx + L
            vocals[idx:end] = make_eased_linspace(current_vocal_pan, target, L)
            inst[idx:end] = make_eased_linspace(current_inst_pan, target, L)
            current_vocal_pan = target
            current_inst_pan = target
            idx = end

            if idx < n_samples:
                L_wait = min(jitter(wait_duration), n_samples - idx)
                end = idx + L_wait
                vocals[idx:end] = make_eased_linspace(current_vocal_pan, 0.0, L_wait)
                inst[idx:end] = make_eased_linspace(current_inst_pan, 0.0, L_wait)
                idx = end

    return np.clip(vocals, -1, 1), np.clip(inst, -1, 1)

# -------------------------
# Spatializer
# -------------------------
def spatialize_stem_with_pan_array(y, sr, pan_array,
                                   low_cutoff=180.0,
                                   reverb_ms=90,
                                   reverb_amount=0.18,
                                   mid_gain=1.0,
                                   bass_gain=1.0):

    n = len(y)
    nyq = sr * 0.5
    low_norm = min(low_cutoff / nyq, 0.999)

    b_low, a_low = signal.butter(4, low_norm, btype='low')
    b_high, a_high = signal.butter(4, low_norm, btype='high')

    bass = signal.filtfilt(b_low, a_low, y)
    midhigh = signal.filtfilt(b_high, a_high, y)

    bass *= bass_gain
    midhigh *= mid_gain

    gl, gr = pan_to_gains_array(pan_array)

    left_mid = midhigh * gl
    right_mid = midhigh * gr

    left = left_mid + bass
    right = right_mid + bass

    cross = 0.06 * np.abs(pan_array)

    lpre = left.copy()
    rpre = right.copy()

    left = lpre * (1 - cross) + rpre * cross
    right = rpre * (1 - cross) + lpre * cross

    ir_len = max(64, int(sr * (reverb_ms / 1000.0)))
    ir = make_exponential_ir(ir_len, decay=4.0)

    wet_l = signal.fftconvolve(left, ir, mode='same')
    wet_r = signal.fftconvolve(right, ir, mode='same')

    left_out = left * (1 - reverb_amount) + wet_l * reverb_amount
    right_out = right * (1 - reverb_amount) + wet_r * reverb_amount

    return left_out, right_out

# -------------------------
# Top-level processing
# -------------------------
def process_file(input_path, output_path, preset='8d', target_lufs=None):
    spleeter_dir = "spleeter_out"
    # Use stderr for logs so stdout remains audio when streaming
    def log(*args, **kwargs):
        print(*args, file=sys.stderr, **kwargs)

    log("Loading audio...")

    input_bytes = None
    temp_input_file = None
    try:
        if input_path == "-":
            # Read stdin bytes once (binary audio file contents)
            input_bytes = sys.stdin.buffer.read()
            y_mix, sr = load_audio_mono_from_path_or_bytes(input_bytes, sr=None)
        else:
            y_mix, sr = load_audio_mono_from_path_or_bytes(input_path, sr=None)

        duration = len(y_mix) / sr
        log(f"Sample rate: {sr}, duration: {duration:.2f}s")

        # stems
        stems = {}
        used_spleeter_temp = False
        if HAVE_SPLEETER:
            try:
                # If input is from bytes/stdin, we must write a temp file for spleeter
                if input_bytes is not None:
                    tf = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
                    temp_input_file = tf.name
                    # write a WAV for spleeter
                    sf.write(temp_input_file, y_mix, sr, subtype='PCM_16')
                    tf.close()
                    used_spleeter_temp = True
                    sep = separate_stems_spleeter(temp_input_file, out_dir=spleeter_dir, stems=2)
                else:
                    sep = separate_stems_spleeter(input_path, out_dir=spleeter_dir, stems=2)

                if 'vocals' in sep:
                    stems['vocals'] = sep['vocals']
                for k, v in sep.items():
                    if 'accompaniment' in k or 'mix' in k:
                        stems['instruments'] = v
                if not stems:
                    stems['instruments'] = (y_mix, sr)
            except Exception as e:
                log("Spleeter error:", e)
                stems['instruments'] = (y_mix, sr)
            finally:
                # CLEANUP SPLEETER OUTPUT
                if os.path.exists(spleeter_dir):
                    try:
                        shutil.rmtree(spleeter_dir)
                        log(f"Cleaned up {spleeter_dir}")
                    except Exception as e:
                        log(f"Cleanup error: {e}")
                if used_spleeter_temp and temp_input_file:
                    try:
                        os.remove(temp_input_file)
                    except Exception:
                        pass
        else:
            stems['instruments'] = (y_mix, sr)
            log("Spleeter not available — using mix as instruments")

        max_len = max(len(stems[k][0]) for k in stems)

        # presets
        if preset == '3d':
            params = {'A': 4.5, 'B': 3.0, 'C': 2.2, 'D': 5.0, 'jitter_frac': 0.10}
            reverb_v = 0.10; reverb_i = 0.14; v_low_cut = 150.0; i_low_cut = 170.0
        elif preset == '8d':
            params = {'switch_duration': 3.0, 'wait_duration': 2.5, 'sync_prob': 0.3, 'jitter_frac': 0.12}
            reverb_v = 0.12; reverb_i = 0.22; v_low_cut = 160.0; i_low_cut = 180.0
        elif preset == '16d':
            params = {'A': 6.0, 'B': 4.0, 'C': 3.5, 'D': 7.0, 'jitter_frac': 0.15}
            reverb_v = 0.16; reverb_i = 0.30; v_low_cut = 180.0; i_low_cut = 200.0
        elif preset == 'lofi':
            params = {'switch_duration': 5.0, 'wait_duration': 4.0, 'sync_prob': 0.1, 'jitter_frac': 0.10}
            reverb_v = 0.20; reverb_i = 0.30; v_low_cut = 150.0; i_low_cut = 180.0
        else:
            params = {'A':5.0,'B':3.5,'C':2.8,'D':6.0,'jitter_frac':0.12}
            reverb_v = 0.12; reverb_i = 0.20; v_low_cut = 160.0; i_low_cut = 180.0

        # generate pan arrays
        if 'vocals' in stems and 'instruments' in stems:
            vocals_pan, inst_pan = make_behavioral_pan_arrays(sr, max_len, params=params)
        else:
            t = np.arange(max_len) / sr
            inst_pan = np.sin(2 * np.pi * 0.035 * t) * 0.65
            vocals_pan = np.zeros(max_len)

        left_total = np.zeros(max_len)
        right_total = np.zeros(max_len)

        # -----------------------------
        # MAIN STEM PROCESSING
        # -----------------------------
        for name, (y, s) in stems.items():

            # -------------- LOFI PATCH --------------
            if preset == "lofi":
                # slowed
                slow_factor = 0.92
                new_sr = int(sr * slow_factor)
                y = librosa.resample(y, orig_sr=s, target_sr=new_sr)

                # resample back
                y = librosa.resample(y, orig_sr=new_sr, target_sr=sr)

                # add vinyl noise
                noise = np.random.normal(0, 0.004, len(y))
                y = y + noise

                # soft low-pass
                b, a = signal.butter(4, 6000/(sr/2), 'low')
                y = signal.filtfilt(b, a, y)
            # ----------------------------------------

            if s != sr:
                y = librosa.resample(y, orig_sr=s, target_sr=sr)

            y = ensure_len(y, max_len)

            if name.lower().startswith("voc"):
                pan_arr = vocals_pan
                reverb_amount = reverb_v
                low_cut = v_low_cut
                mid_gain = 1.03
                bass_gain = 0.95
            else:
                pan_arr = inst_pan
                reverb_amount = reverb_i
                low_cut = i_low_cut
                mid_gain = 1.00
                bass_gain = 1.00

            l, r = spatialize_stem_with_pan_array(
                y, sr, pan_arr,
                low_cutoff=low_cut,
                reverb_ms=90,
                reverb_amount=reverb_amount,
                mid_gain=mid_gain,
                bass_gain=bass_gain
            )

            left_total += l
            right_total += r

        # peak normalize
        peak = max(np.max(np.abs(left_total)), np.max(np.abs(right_total)), 1e-12)
        gain = 0.98 / peak
        left_total *= gain
        right_total *= gain

        stereo = np.vstack([left_total, right_total])
        stereo = np.nan_to_num(stereo)
        stereo = simple_limiter(stereo, 0.999)

        log("Preparing output...")

        # write to file or bytes
        wav_bytes = None
        if output_path == "-":
            wav_bytes = write_stereo_either("-", stereo, sr)
        else:
            # if user requested .mp3, we'll still generate wav bytes then convert to mp3 in-memory
            if output_path.lower().endswith(".mp3"):
                wav_bytes = write_stereo_either("-", stereo, sr)  # generate wav bytes in memory
                # convert to mp3 bytes
                wav_bio = io.BytesIO(wav_bytes)
                wav_bio.seek(0)
                audio = AudioSegment.from_file(wav_bio, format="wav")
                mp3_bio = io.BytesIO()
                audio.export(mp3_bio, format="mp3", bitrate="320k")
                mp3_bio.seek(0)
                # write mp3 to disk
                with open(output_path, "wb") as f:
                    f.write(mp3_bio.read())
                log("MP3 exported successfully!")
                return
            else:
                # write directly to disk as wav
                write_stereo_either(output_path, stereo, sr)
                log("WAV exported successfully!")
                return

        # If we reach here, we have wav_bytes (either because output_path == "-" or we created wav bytes for mp3 conversion)
        if output_path == "-":
            # Check desired output format: if user passed "-" but requested .mp3 in args, we don't have that metadata.
            # We will stream WAV by default to stdout.
            sys.stdout.buffer.write(wav_bytes)
            sys.stdout.buffer.flush()
            log("Streamed WAV to stdout (stderr contains logs).")
        else:
            # handled above
            pass

    finally:
        # best-effort cleanup if any temp files were created
        try:
            if 'spleeter_dir' in locals() and os.path.exists(spleeter_dir):
                shutil.rmtree(spleeter_dir)
        except Exception:
            pass

# -------------------------
# CLI
# -------------------------
def main_cli():
    parser = argparse.ArgumentParser(description="Behavioral Spatializer (3D/8D/16D/Lofi)")
    parser.add_argument("input", help="Input audio (use '-' to read from stdin)")
    parser.add_argument("output", help="Output path (use '-' to write WAV to stdout, or .mp3/.wav path)")
    parser.add_argument("--preset", choices=['3d','8d','16d','lofi'], default='8d')
    parser.add_argument("--lufs", type=float, default=None)
    args = parser.parse_args()
    process_file(args.input, args.output, preset=args.preset, target_lufs=args.lufs)

if __name__ == "__main__":
    main_cli()
