#  1st try

# import sys
# from pydub import AudioSegment
# import numpy as np
# from scipy.signal import fftconvolve


# # def apply_3d_effect(audio, intensity=0.75):
# #     """Creates rotating/panning left-right 3D effect."""
# #     samples = np.array(audio.get_array_of_samples()).astype(np.float32)
# #     channels = 1 if audio.channels == 1 else 2

# #     if channels == 1:
# #         samples = np.stack([samples, samples], axis=1)

# #     left = samples[:, 0]
# #     right = samples[:, 1]

# #     length = len(left)
# #     t = np.linspace(0, 2*np.pi, length)

# #     pan = np.sin(t * intensity)

# #     left_new = left * (1 - pan)
# #     right_new = right * (1 + pan)

# #     stereo = np.vstack((left_new, right_new)).T.astype(np.int16)
# #     return AudioSegment(
# #         stereo.tobytes(),
# #         frame_rate=audio.frame_rate,
# #         sample_width=2,
# #         channels=2
# #     )

# def apply_3d_effect(audio, intensity=0.75):
#     """Creates rotating/panning left-right 3D effect."""
#     # Mono ko stereo mein convert karo
#     if audio.channels == 1:
#         audio = AudioSegment.from_mono_audiosegments(audio, audio)
    
#     samples = np.array(audio.get_array_of_samples()).astype(np.float32)
    
#     # Ab samples ko reshape karo stereo ke liye
#     samples = samples.reshape((-1, 2))
    
#     left = samples[:, 0]
#     right = samples[:, 1]

#     length = len(left)
#     t = np.linspace(0, 2*np.pi, length)

#     pan = np.sin(t * intensity)

#     left_new = left * (1 - pan)
#     right_new = right * (1 + pan)

#     stereo = np.vstack((left_new, right_new)).T.astype(np.int16)
#     return AudioSegment(
#         stereo.tobytes(),
#         frame_rate=audio.frame_rate,
#         sample_width=2,
#         channels=2
#     )

# def apply_lofi_effect(audio):
#     """Applies low-pass filter + noise + warm EQ."""
#     # Low-pass
#     lofi = audio.low_pass_filter(2500)

#     # Slight reverb IR
#     impulse = AudioSegment.silent(duration=50).overlay(AudioSegment.silent(duration=10, frame_rate=lofi.frame_rate))
    
#     return lofi.overlay(impulse - 20)


# def apply_slowed_reverb(audio):
#     """Slowed + slight reverb."""
#     slowed = audio.speedup(playback_speed=0.88)
#     reverb = slowed.low_pass_filter(4000)
#     return reverb


# def apply_16d(audio):
#     """16D is faster rotation speed."""
#     return apply_3d_effect(audio, intensity=1.5)


# def apply_8d(audio):
#     """8D effect."""
#     return apply_3d_effect(audio, intensity=1.0)


# def main():
#     if len(sys.argv) < 4:
#         print("Usage: python process_audio.py <input> <output> <effect>")
#         sys.exit(1)

#     input_path = sys.argv[1]
#     output_path = sys.argv[2]
#     effect = sys.argv[3]

#     audio = AudioSegment.from_file(input_path)

#     if effect == "3d":
#         processed = apply_3d_effect(audio)
#     elif effect == "8d":
#         processed = apply_8d(audio)
#     elif effect == "16d":
#         processed = apply_16d(audio)
#     elif effect == "lofi":
#         processed = apply_lofi_effect(audio)
#     elif effect == "slowed":
#         processed = apply_slowed_reverb(audio)
#     else:
#         processed = audio  # no effect

#     processed.export(output_path, format="mp3")
#     print("Processing complete.")


# if __name__ == "__main__":
#     main()


















# 2nd try

# import sys
# from pydub import AudioSegment
# import numpy as np
# from scipy import signal


# def apply_3d_effect(audio, intensity=0.75, rotation_speed=0.5):
#     """
#     Real 3D/8D audio effect with proper spatial positioning.
#     Creates the illusion of sound rotating around your head.
#     """
#     # Convert to stereo if mono
#     if audio.channels == 1:
#         audio = audio.set_channels(2)
    
#     samples = np.array(audio.get_array_of_samples()).astype(np.float32)
#     samples = samples.reshape((-1, 2))
    
#     left = samples[:, 0]
#     right = samples[:, 1]
    
#     # Normalize
#     max_val = np.max(np.abs(samples))
#     if max_val > 0:
#         left = left / max_val
#         right = right / max_val
    
#     length = len(left)
#     sample_rate = audio.frame_rate
    
#     # Create time array for smooth rotation
#     duration = length / sample_rate
#     t = np.linspace(0, duration, length)
    
#     # Rotation angle (controls speed of rotation)
#     angle = 2 * np.pi * rotation_speed * t
    
#     # Calculate stereo position using cosine for smooth circular motion
#     # This creates the "around your head" effect
#     pan_left = (np.cos(angle) + 1) / 2  # 0 to 1
#     pan_right = (np.sin(angle) + 1) / 2  # 0 to 1
    
#     # Apply HRTF-like delay for depth perception
#     # This makes the sound feel like it's moving in 3D space
#     delay_samples = int(0.0006 * sample_rate)  # ~0.6ms delay for ITD
    
#     # Create delayed versions
#     left_delayed = np.pad(left, (delay_samples, 0), mode='constant')[:-delay_samples]
#     right_delayed = np.pad(right, (delay_samples, 0), mode='constant')[:-delay_samples]
    
#     # Mix original and delayed with panning
#     # When sound is on left, use delayed right channel (creates distance)
#     left_new = (left * pan_left * intensity + 
#                 left_delayed * (1 - pan_left) * 0.3 + 
#                 right_delayed * pan_right * 0.2)
    
#     right_new = (right * pan_right * intensity + 
#                  right_delayed * (1 - pan_right) * 0.3 + 
#                  left_delayed * pan_left * 0.2)
    
#     # Add subtle reverb for spatial depth
#     # Create a simple reverb impulse response
#     reverb_length = int(0.05 * sample_rate)  # 50ms reverb
#     reverb_ir = np.exp(-np.linspace(0, 5, reverb_length))
#     reverb_ir = reverb_ir / np.sum(reverb_ir)
    
#     # Apply reverb
#     left_new = signal.fftconvolve(left_new, reverb_ir, mode='same')
#     right_new = signal.fftconvolve(right_new, reverb_ir, mode='same')
    
#     # Normalize output
#     max_output = np.max(np.abs([left_new, right_new]))
#     if max_output > 0:
#         left_new = left_new / max_output * 0.95
#         right_new = right_new / max_output * 0.95
    
#     # Convert back to int16
#     stereo = np.vstack((left_new, right_new)).T
#     stereo = (stereo * 32767).astype(np.int16)
    
#     return AudioSegment(
#         stereo.tobytes(),
#         frame_rate=audio.frame_rate,
#         sample_width=2,
#         channels=2
#     )


# def apply_8d(audio):
#     """8D effect - moderate rotation speed"""
#     return apply_3d_effect(audio, intensity=0.8, rotation_speed=0.5)


# def apply_16d(audio):
#     """16D effect - faster rotation"""
#     return apply_3d_effect(audio, intensity=0.9, rotation_speed=1.0)


# def apply_lofi_effect(audio):
#     """Applies low-pass filter + vinyl crackle + warm EQ."""
#     # Low-pass for warmth
#     lofi = audio.low_pass_filter(3000)
    
#     # Add slight high-pass to remove mud
#     lofi = lofi.high_pass_filter(100)
    
#     # Reduce bitrate feel
#     lofi = lofi - 3  # Slight volume reduction
    
#     return lofi


# def apply_slowed_reverb(audio):
#     """Slowed + reverb effect (popular on TikTok/YouTube)."""
#     # Slow down to 85% speed
#     slowed = audio._spawn(audio.raw_data, overrides={
#         "frame_rate": int(audio.frame_rate * 0.85)
#     })
#     slowed = slowed.set_frame_rate(audio.frame_rate)
    
#     # Add reverb-like effect with low-pass
#     reverb = slowed.low_pass_filter(4000)
    
#     return reverb


# def main():
#     if len(sys.argv) < 4:
#         print("Usage: python process_audio.py <input> <output> <effect>")
#         sys.exit(1)

#     input_path = sys.argv[1]
#     output_path = sys.argv[2]
#     effect = sys.argv[3]

#     print(f"Loading audio: {input_path}")
#     audio = AudioSegment.from_file(input_path)

#     print(f"Applying {effect} effect...")
#     if effect == "3d":
#         processed = apply_3d_effect(audio)
#     elif effect == "8d":
#         processed = apply_8d(audio)
#     elif effect == "16d":
#         processed = apply_16d(audio)
#     elif effect == "lofi":
#         processed = apply_lofi_effect(audio)
#     elif effect == "slowed":
#         processed = apply_slowed_reverb(audio)
#     else:
#         print(f"Unknown effect: {effect}, using original audio")
#         processed = audio

#     print(f"Exporting to: {output_path}")
#     processed.export(output_path, format="mp3", bitrate="320k")
#     print("Processing complete.")


# if __name__ == "__main__":
#     main()




#  3rd try

# import sys
# from pydub import AudioSegment
# import numpy as np
# from scipy import signal


# def apply_3d_effect(audio, intensity=0.85, rotation_speed=0.15):
#     """
#     Real 3D/8D audio effect with proper spatial positioning.
#     Creates the illusion of sound rotating around your head.
#     rotation_speed: 0.15 = very slow (like YouTube), 0.5 = medium, 1.0 = fast
#     """
#     # Convert to stereo if mono
#     if audio.channels == 1:
#         audio = audio.set_channels(2)
    
#     samples = np.array(audio.get_array_of_samples()).astype(np.float32)
#     samples = samples.reshape((-1, 2))
    
#     left = samples[:, 0]
#     right = samples[:, 1]
    
#     # Normalize
#     max_val = np.max(np.abs(samples))
#     if max_val > 0:
#         left = left / max_val
#         right = right / max_val
    
#     length = len(left)
#     sample_rate = audio.frame_rate
    
#     # Create time array for smooth rotation
#     duration = length / sample_rate
#     t = np.linspace(0, duration, length)
    
#     # Rotation angle (controls speed of rotation)
#     angle = 2 * np.pi * rotation_speed * t
    
#     # Calculate stereo position using cosine for smooth circular motion
#     # This creates the "around your head" effect
#     pan_left = (np.cos(angle) + 1) / 2  # 0 to 1
#     pan_right = (np.sin(angle) + 1) / 2  # 0 to 1
    
#     # Apply HRTF-like delay for depth perception
#     # This makes the sound feel like it's moving in 3D space
#     delay_samples = int(0.0006 * sample_rate)  # ~0.6ms delay for ITD
    
#     # Create delayed versions
#     left_delayed = np.pad(left, (delay_samples, 0), mode='constant')[:-delay_samples]
#     right_delayed = np.pad(right, (delay_samples, 0), mode='constant')[:-delay_samples]
    
#     # Mix original and delayed with panning
#     # When sound is on left, use delayed right channel (creates distance)
#     left_new = (left * pan_left * intensity + 
#                 left_delayed * (1 - pan_left) * 0.15 + 
#                 right_delayed * pan_right * 0.1)
    
#     right_new = (right * pan_right * intensity + 
#                  right_delayed * (1 - pan_right) * 0.15 + 
#                  left_delayed * pan_left * 0.1)
    
#     # Add subtle reverb for spatial depth
#     # Create a simple reverb impulse response
#     reverb_length = int(0.03 * sample_rate)  # 30ms reverb (reduced)
#     reverb_ir = np.exp(-np.linspace(0, 5, reverb_length))
#     reverb_ir = reverb_ir / np.sum(reverb_ir) * 0.1  # Very subtle
    
#     # Apply reverb
#     left_new = signal.fftconvolve(left_new, reverb_ir, mode='same')
#     right_new = signal.fftconvolve(right_new, reverb_ir, mode='same')
    
#     # Add back original signal for volume boost
#     left_new = left_new * 0.7 + left * 0.5
#     right_new = right_new * 0.7 + right * 0.5
    
#     # Normalize output to maintain volume
#     max_output = np.max(np.abs([left_new, right_new]))
#     if max_output > 0:
#         left_new = left_new / max_output * 0.98  # Almost full volume
#         right_new = right_new / max_output * 0.98
    
#     # Convert back to int16
#     stereo = np.vstack((left_new, right_new)).T
#     stereo = (stereo * 32767).astype(np.int16)
    
#     return AudioSegment(
#         stereo.tobytes(),
#         frame_rate=audio.frame_rate,
#         sample_width=2,
#         channels=2
#     )


# def apply_8d(audio):
#     """8D effect - moderate rotation speed"""
#     return apply_3d_effect(audio, intensity=0.8, rotation_speed=0.5)


# def apply_16d(audio):
#     """16D effect - faster rotation"""
#     return apply_3d_effect(audio, intensity=0.9, rotation_speed=1.0)


# def apply_lofi_effect(audio):
#     """Applies low-pass filter + vinyl crackle + warm EQ."""
#     # Low-pass for warmth
#     lofi = audio.low_pass_filter(3000)
    
#     # Add slight high-pass to remove mud
#     lofi = lofi.high_pass_filter(100)
    
#     # Reduce bitrate feel
#     lofi = lofi - 3  # Slight volume reduction
    
#     return lofi


# def apply_slowed_reverb(audio):
#     """Slowed + reverb effect (popular on TikTok/YouTube)."""
#     # Slow down to 85% speed
#     slowed = audio._spawn(audio.raw_data, overrides={
#         "frame_rate": int(audio.frame_rate * 0.85)
#     })
#     slowed = slowed.set_frame_rate(audio.frame_rate)
    
#     # Add reverb-like effect with low-pass
#     reverb = slowed.low_pass_filter(4000)
    
#     return reverb


# def main():
#     if len(sys.argv) < 4:
#         print("Usage: python process_audio.py <input> <output> <effect>")
#         sys.exit(1)

#     input_path = sys.argv[1]
#     output_path = sys.argv[2]
#     effect = sys.argv[3]

#     print(f"Loading audio: {input_path}")
#     audio = AudioSegment.from_file(input_path)

#     print(f"Applying {effect} effect...")
#     if effect == "3d":
#         processed = apply_3d_effect(audio)
#     elif effect == "8d":
#         processed = apply_8d(audio)
#     elif effect == "16d":
#         processed = apply_16d(audio)
#     elif effect == "lofi":
#         processed = apply_lofi_effect(audio)
#     elif effect == "slowed":
#         processed = apply_slowed_reverb(audio)
#     else:
#         print(f"Unknown effect: {effect}, using original audio")
#         processed = audio

#     print(f"Exporting to: {output_path}")
#     processed.export(output_path, format="mp3", bitrate="320k")
#     print("Processing complete.")


# if __name__ == "__main__":
#     main()





# 4th try

# import sys
# from pydub import AudioSegment
# import numpy as np
# from scipy import signal

# def apply_3d_effect(audio, rotation_speed=0.055, reverb_amount=0.22):
#     if audio.channels == 1:
#         audio = audio.set_channels(2)

#     samples = np.array(audio.get_array_of_samples()).astype(np.float32)
#     samples = samples.reshape((-1, 2))

#     left = samples[:, 0]
#     right = samples[:, 1]

#     # Original RMS for volume match
#     original_rms = np.sqrt(np.mean((left + right) ** 2))

#     # Normalize
#     max_val = np.max(np.abs(samples))
#     if max_val > 0:
#         left /= max_val
#         right /= max_val

#     length = len(left)
#     sr = audio.frame_rate

#     t = np.linspace(0, len(left) / sr, length)

#     # Smooth L-R panning
#     pan = (np.sin(2 * np.pi * rotation_speed * t) + 1) / 2

#     # -------- FIXED BASS FILTER (error solved) --------
#     sos = signal.butter(4, 180/(sr/2), btype='low', output='sos')
#     bass = (left + right) / 2
#     bass = signal.sosfilt(sos, bass)

#     # Remove bass before panning
#     left = left - bass
#     right = right - bass

#     # Apply smooth rotation to mid-high
#     left_new = left * (1 - pan)
#     right_new = right * pan

#     # Add bass back to center
#     left_new += bass * 0.9
#     right_new += bass * 0.9

#     # Light stereo delay for realism (~1ms)
#     delay = int(0.0011 * sr)

#     left_delay = np.pad(left_new, (delay, 0))[:-delay]
#     right_delay = np.pad(right_new, (delay, 0))[:-delay]

#     left_new = left_new * 0.9 + right_delay * 0.18
#     right_new = right_new * 0.9 + left_delay * 0.18

#     # Reverb IR
#     reverb_len = int(0.09 * sr)
#     reverb_ir = np.exp(-np.linspace(0, 8, reverb_len))
#     reverb_ir /= np.sum(reverb_ir)
#     reverb_ir *= reverb_amount

#     left_new = signal.fftconvolve(left_new, reverb_ir, mode='same')
#     right_new = signal.fftconvolve(right_new, reverb_ir, mode='same')

#     # Volume match
#     new_rms = np.sqrt(np.mean((left_new + right_new) ** 2))
#     if new_rms > 0:
#         gain = original_rms / new_rms
#         left_new *= gain
#         right_new *= gain

#     # Final safe normalize
#     max_output = max(np.max(np.abs(left_new)), np.max(np.abs(right_new)))
#     if max_output > 0:
#         left_new = left_new / max_output * 0.98
#         right_new = right_new / max_output * 0.98

#     # Convert back to audio
#     stereo = np.vstack((left_new, right_new)).T
#     stereo = (stereo * 32767).astype(np.int16)

#     return AudioSegment(
#         stereo.tobytes(),
#         frame_rate=sr,
#         sample_width=2,
#         channels=2
#     )


# def apply_3d(audio):
#     return apply_3d_effect(audio, rotation_speed=0.12, reverb_amount=0.18)

# def apply_8d(audio):
#     return apply_3d_effect(audio, rotation_speed=0.055, reverb_amount=0.22)

# def apply_16d(audio):
#     return apply_3d_effect(audio, rotation_speed=0.08, reverb_amount=0.30)

# def apply_lofi_effect(audio):
#     """Applies low-pass filter + vinyl crackle + warm EQ."""
#     # Low-pass for warmth
#     lofi = audio.low_pass_filter(3000)
    
#     # Add slight high-pass to remove mud
#     lofi = lofi.high_pass_filter(100)
    
#     # Reduce bitrate feel
#     lofi = lofi - 3  # Slight volume reduction
    
#     return lofi


# def apply_slowed_reverb(audio):
#     """Slowed + reverb effect (popular on TikTok/YouTube)."""
#     # Slow down to 85% speed
#     slowed = audio._spawn(audio.raw_data, overrides={
#         "frame_rate": int(audio.frame_rate * 0.85)
#     })
#     slowed = slowed.set_frame_rate(audio.frame_rate)
    
#     # Add reverb-like effect with low-pass
#     reverb = slowed.low_pass_filter(4000)
    
#     return reverb


# def main():
#     if len(sys.argv) < 4:
#         print("Usage: python process_audio.py <input> <output> <effect>")
#         sys.exit(1)

#     input_path = sys.argv[1]
#     output_path = sys.argv[2]
#     effect = sys.argv[3]

#     print(f"Loading audio: {input_path}")
#     audio = AudioSegment.from_file(input_path)

#     print(f"Applying {effect} effect...")
#     if effect == "3d":
#         processed = apply_3d_effect(audio)
#     elif effect == "8d":
#         processed = apply_8d(audio)
#     elif effect == "16d":
#         processed = apply_16d(audio)
#     elif effect == "lofi":
#         processed = apply_lofi_effect(audio)
#     elif effect == "slowed":
#         processed = apply_slowed_reverb(audio)
#     else:
#         print(f"Unknown effect: {effect}, using original audio")
#         processed = audio

#     print(f"Exporting to: {output_path}")
#     processed.export(output_path, format="mp3", bitrate="320k")
#     print("Processing complete.")


# if __name__ == "__main__":
#     main()




#  5th try

#!/usr/bin/env python3



# """
# process_audio.py

# Usage:
#     python process_audio.py <input_path> <output_path> <effect>

# Effects: 3d, 8d, 16d, lofi, slowed

# Requirements:
#     pip install pydub numpy scipy
#     (ffmpeg must be installed for pydub to read/write many formats)
# """

# import sys
# from pydub import AudioSegment
# import numpy as np
# from scipy import signal

# # -------------------------
# # Helper: LUFS (simplified)
# # -------------------------
# def calculate_lufs(mono_signal: np.ndarray) -> float:
#     """
#     Very simplified LUFS-like estimator.
#     Not a full EBU R128 implementation, but works for loudness matching here.
#     """
#     # Use mean-square energy approach
#     mean_sq = np.mean(mono_signal.astype(np.float64) ** 2) + 1e-12
#     return -0.691 + 10.0 * np.log10(mean_sq)

# # -------------------------
# # Core processing function
# # -------------------------
# def apply_3d_effect(audio: AudioSegment,
#                     rotation_speed=0.055,
#                     reverb_amount=0.22,
#                     keep_original_loudness=True):
#     """
#     Apply a YouTube-style 3D/8D effect with:
#       - slow sinusoidal panning
#       - bass centered (low freq preserved in center)
#       - light stereo delays
#       - reverb tail
#       - LUFS-based loudness matching (to original) if requested
#     audio: pydub.AudioSegment (any channels; will be converted to stereo)
#     rotation_speed: frequency in Hz of a full L->R->L cycle (small = slow)
#     reverb_amount: multiplier for reverb tail energy
#     """
#     # ensure stereo (2 channels)
#     if audio.channels == 1:
#         audio = audio.set_channels(2)

#     # read samples into numpy float arrays in range [-1,1]
#     samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
#     samples = samples.reshape((-1, 2))

#     left = samples[:, 0].astype(np.float64)
#     right = samples[:, 1].astype(np.float64)
#     sr = audio.frame_rate
#     length = len(left)

#     # compute original mono for loudness reference
#     original_mono = (left + right) / 2.0
#     original_lufs = calculate_lufs(original_mono)

#     # normalize to -1..1 using max absolute (prevents overflow)
#     peak = np.max(np.abs(samples))
#     if peak > 0:
#         left /= peak
#         right /= peak

#     # time vector
#     t = np.linspace(0.0, length / sr, length)

#     # smooth L-R pan curve (sinusoidal)
#     pan = (np.sin(2.0 * np.pi * rotation_speed * t) + 1.0) / 2.0  # 0..1

#     # ---- center bass using a lowpass sos filter ----
#     cutoff_hz = 180.0
#     nyq = 0.5 * sr
#     sos = signal.butter(4, cutoff_hz / nyq, btype='low', output='sos')
#     bass = signal.sosfilt(sos, (left + right) / 2.0)

#     # subtract bass from channels (so bass won't be panned)
#     left_mid = left - bass
#     right_mid = right - bass

#     # apply panning to mid/high components
#     left_panned = left_mid * (1.0 - pan)
#     right_panned = right_mid * pan

#     # add bass back to both channels (centered)
#     left_new = left_panned + bass * 0.95
#     right_new = right_panned + bass * 0.95

#     # small stereo delay to create width (ITD)
#     delay_sec = 0.0011  # ~1.1 ms
#     delay_samples = int(np.round(delay_sec * sr))
#     if delay_samples > 0:
#         left_del = np.pad(left_new, (delay_samples, 0), mode='constant')[:-delay_samples]
#         right_del = np.pad(right_new, (delay_samples, 0), mode='constant')[:-delay_samples]
#     else:
#         left_del = left_new.copy()
#         right_del = right_new.copy()

#     # mix with delayed opposite channel for head-shadow feel
#     left_new = left_new * 0.90 + right_del * 0.18
#     right_new = right_new * 0.90 + left_del * 0.18

#     # ---- Reverb: simple exponentially decaying IR ----
#     reverb_len = int(0.09 * sr)  # 90ms IR (balanced)
#     if reverb_len < 1:
#         reverb_len = 1
#     ir = np.exp(-np.linspace(0.0, 8.0, reverb_len))
#     ir /= np.sum(ir)
#     ir *= reverb_amount

#     left_new = signal.fftconvolve(left_new, ir, mode='same')
#     right_new = signal.fftconvolve(right_new, ir, mode='same')

#     # ---- Loudness match: compute current LUFS and match to original ----
#     if keep_original_loudness:
#         processed_mono = (left_new + right_new) / 2.0
#         processed_lufs = calculate_lufs(processed_mono)
#         lufs_diff_db = original_lufs - processed_lufs
#         gain = 10.0 ** (lufs_diff_db / 20.0)
#         left_new *= gain
#         right_new *= gain

#     # ---- final soft normalization to avoid clipping ----
#     max_val = max(np.max(np.abs(left_new)), np.max(np.abs(right_new)))
#     # keep slightly below full scale to prevent conversion clipping
#     if max_val > 0:
#         left_new = left_new / max_val * 0.98
#         right_new = right_new / max_val * 0.98

#     # convert back to int16
#     stereo = np.vstack((left_new, right_new)).T
#     stereo_int16 = np.int16(np.clip(stereo * 32767.0, -32768, 32767))

#     return AudioSegment(
#         stereo_int16.tobytes(),
#         frame_rate=sr,
#         sample_width=2,
#         channels=2
#     )

# # -------------------------
# # Presets
# # -------------------------
# def apply_3d(audio):
#     return apply_3d_effect(audio, rotation_speed=0.12, reverb_amount=0.18)

# def apply_8d(audio):
#     # very slow rotation typical of YouTube 8D
#     return apply_3d_effect(audio, rotation_speed=0.055, reverb_amount=0.22)

# def apply_16d(audio):
#     # keep rotation distinct but not outrageously fast; 16D usually has multiple independent movements,
#     # but for single-track approximation increase reverb and slightly different speed
#     return apply_3d_effect(audio, rotation_speed=0.08, reverb_amount=0.30)

# # -------------------------
# # Other effects (kept simple)
# # -------------------------
# def apply_lofi_effect(audio):
#     lofi = audio.low_pass_filter(3000).high_pass_filter(100)
#     lofi = lofi - 3
#     return lofi

# def apply_slowed_reverb(audio):
#     slowed = audio._spawn(audio.raw_data, overrides={"frame_rate": int(audio.frame_rate * 0.85)})
#     slowed = slowed.set_frame_rate(audio.frame_rate)
#     return slowed.low_pass_filter(4000)

# # -------------------------
# # CLI / main
# # -------------------------
# def main():
#     if len(sys.argv) < 4:
#         print("Usage: python process_audio.py <input> <output> <effect>")
#         print("Effects: 3d, 8d, 16d, lofi, slowed")
#         sys.exit(1)

#     input_path = sys.argv[1]
#     output_path = sys.argv[2]
#     effect = sys.argv[3].lower()

#     print(f"Loading audio: {input_path}")
#     audio = AudioSegment.from_file(input_path)

#     print(f"Applying {effect} effect...")
#     if effect == "3d":
#         processed = apply_3d(audio)
#     elif effect == "8d":
#         processed = apply_8d(audio)
#     elif effect == "16d":
#         processed = apply_16d(audio)
#     elif effect == "lofi":
#         processed = apply_lofi_effect(audio)
#     elif effect == "slowed":
#         processed = apply_slowed_reverb(audio)
#     else:
#         print(f"Unknown effect '{effect}' - exporting original.")
#         processed = audio

#     print(f"Exporting to: {output_path}")
#     processed.export(output_path, format="mp3", bitrate="320k")
#     print("Processing complete.")

# if __name__ == "__main__":
#     main()






# 6th try


# """
# spatializer.py

# Usage:
#     python spatializer.py input.wav output_8d.wav --preset 8d

# Requirements:
#     pip install numpy scipy soundfile librosa pyloudnorm spleeter
#     (spleeter optional but recommended for better result)

# Description:
#     - Separates stems (vocals / accompaniment) using Spleeter if available.
#     - For each stem: splits low (center) and mid/high (spatial) bands.
#     - Applies an independent panning automation (sinusoidal LFO) per stem.
#       Vocals/instruments can be configured to move in opposite or same direction.
#     - Adds per-stem reverb (simple exponential IR convolution).
#     - Mixes stems, LUFS-normalizes to target, applies simple brickwall limiter,
#       and exports stereo wav.
# """

# import argparse
# import os
# import numpy as np
# import soundfile as sf
# import librosa
# from scipy import signal
# import pyloudnorm as pyln

# # Try importing spleeter (stem separation). If not present, continue with fallback.
# try:
#     from spleeter.separator import Separator
#     HAVE_SPLEETER = True
# except Exception:
#     HAVE_SPLEETER = False

# # -------------------------
# # Utilities
# # -------------------------
# def load_audio_mono(path, sr=None):
#     y, sr = librosa.load(path, sr=sr, mono=True)
#     return y, sr

# def write_stereo(path, stereo_array, sr):
#     # stereo_array shape: (2, n)
#     data = np.vstack(stereo_array).T  # shape (n,2)
#     sf.write(path, data, sr, subtype='PCM_16')

# def ensure_len(a, n):
#     if len(a) >= n:
#         return a[:n]
#     else:
#         return np.pad(a, (0, n - len(a)))

# # Equal-power pan from pan in [-1..1] -> left/right gains
# def pan_to_gains(pan):
#     # pan = -1 (full left) -> (1,0)
#     # pan =  1 (full right) -> (0,1)
#     # use equal-power law
#     theta = (pan + 1.0) * (np.pi / 4.0)  # map [-1..1] to [0..pi/2]
#     gl = np.cos(theta)
#     gr = np.sin(theta)
#     return gl, gr

# # brickwall limiter (simple) - ceiling in linear (e.g. 0.999)
# def simple_limiter(stereo, ceiling=0.999):
#     peak = np.max(np.abs(stereo))
#     if peak <= ceiling:
#         return stereo
#     gain = ceiling / peak
#     return stereo * gain

# # small function to create exponential IR
# def make_exponential_ir(length_samples, decay=5.0):
#     # decay controls slope; larger -> faster decay
#     t = np.linspace(0, 1, length_samples)
#     ir = np.exp(-decay * t)
#     # small pre-delay/early reflection can be added by shaping ir
#     ir /= np.sum(np.abs(ir)) + 1e-12
#     return ir

# # -------------------------
# # Stem separation (Spleeter)
# # -------------------------
# def separate_stems_spleeter(input_path, out_dir="spleeter_out", stems=2):
#     """
#     Runs spleeter to separate into {stems} (2 = vocals + accompaniment).
#     Returns dict of stem_name -> (y, sr)
#     """
#     if not HAVE_SPLEETER:
#         raise RuntimeError("Spleeter not installed or import failed.")
#     os.makedirs(out_dir, exist_ok=True)
#     model = "spleeter:2stems" if stems == 2 else f"spleeter:{stems}stems"
#     sep = Separator(model)
#     # Spleeter writes files; we read them back
#     sep.separate_to_file(input_path, out_dir)
#     # standard output folder name
#     base = os.path.splitext(os.path.basename(input_path))[0]
#     folder = os.path.join(out_dir, base)
#     results = {}
#     # For 2 stems, files: vocals.wav, accompaniment.wav
#     mapping = {
#         2: ["vocals.wav", "accompaniment.wav"]
#     }
#     files = mapping.get(stems, [])  # if different stems, user can adapt
#     for f in files:
#         p = os.path.join(folder, f)
#         if os.path.exists(p):
#             y, sr = librosa.load(p, sr=None, mono=True)
#             results[f.split(".")[0]] = (y, sr)
#     # If no files found (rare), fallback to reading input as 'mix'
#     if not results:
#         y, sr = load_audio_mono(input_path, sr=None)
#         results["mix"] = (y, sr)
#     return results

# # -------------------------
# # Core spatialization per stem
# # -------------------------
# def spatialize_stem(y, sr,
#                     pan_func,         # function t -> pan value in [-1..1], vectorized for t array
#                     low_cutoff=200.0, # Hz: below this is centered (bass)
#                     reverb_ms=120,
#                     reverb_amount=0.12):
#     """
#     y: mono stem np.ndarray (shape n,)
#     pan_func: function that accepts time vector (seconds) and returns pan array in [-1..1]
#     Returns stereo pair (left, right) arrays shape (n,)
#     """
#     n = len(y)
#     # 1) split low and mid-high with butter filters (zero-phase for safety)
#     nyq = 0.5 * sr
#     low_norm = low_cutoff / nyq
#     if low_norm >= 0.999:
#         low_norm = 0.999
#     b_low, a_low = signal.butter(4, low_norm, btype='low', analog=False)
#     b_high, a_high = signal.butter(4, low_norm, btype='high', analog=False)
#     bass = signal.filtfilt(b_low, a_low, y)
#     midhigh = signal.filtfilt(b_high, a_high, y)

#     # 2) compute pan envelope
#     t = np.arange(n) / sr
#     pan_env = pan_func(t)  # [-1..1], shape (n,)

#     # 3) apply equal-power panning to midhigh
#     gl, gr = pan_to_gains_array(pan_env)
#     left_mid = midhigh * gl
#     right_mid = midhigh * gr

#     # 4) add bass centered (slightly scaled)
#     bass_center = bass * 0.98
#     left = left_mid + bass_center
#     right = right_mid + bass_center

#     # 5) add small ITD/ILD to increase realism: a tiny delay on one side depending on pan
#     # compute sample delays between -1ms..+1ms mapped from pan
#     max_itd_ms = 1.2
#     itd_samples = np.round((pan_env * max_itd_ms / 1000.0) * sr).astype(int)  # positive -> delay right relative to left
#     # create delayed versions (vectorized naive: shift arrays)
#     left_del = np.zeros_like(left)
#     right_del = np.zeros_like(right)
#     for i, d in enumerate(itd_samples):
#         # For performance we could do grouped constant-delay segments — simple approach below:
#         # But to be efficient, implement as piecewise constant where pan_env is slowly varying.
#         pass
#     # For simplicity (and performance), implement static small crossfeed instead of per-sample delay:
#     # crossfeed = 0.08 scaled by abs(pan)
#     cross = 0.08 * np.abs(pan_env)
#     left = left * (1.0 - cross) + right * cross
#     right = right * (1.0 - cross) + left * cross  # note: this uses updated left — acceptable here

#     # 6) Reverb via convolution with exponential IR
#     ir_len = max(64, int(sr * (reverb_ms / 1000.0)))
#     ir = make_exponential_ir(ir_len, decay=4.0)
#     ir *= reverb_amount
#     left = signal.fftconvolve(left, ir, mode='same')
#     right = signal.fftconvolve(right, ir, mode='same')

#     return left, right

# # vectorized pan_to_gains for array input
# def pan_to_gains_array(pan_array):
#     theta = (pan_array + 1.0) * (np.pi / 4.0)
#     gl = np.cos(theta)
#     gr = np.sin(theta)
#     return gl, gr

# # -------------------------
# # Preset pan functions
# # -------------------------
# def make_lfo_pan(speed_hz=0.06, phase=0.0, depth=1.0, shape='sine'):
#     """
#     returns pan_func(t) -> [-depth..depth] * shape, clipped to [-1..1]
#     speed_hz: frequency
#     phase: phase offset in radians
#     depth: 0..1
#     """
#     def pan(t):
#         if shape == 'sine':
#             p = np.sin(2.0 * np.pi * speed_hz * t + phase) * depth
#         elif shape == 'saw':
#             p = 2.0 * ( (speed_hz * t + phase/(2*np.pi)) % 1.0 ) - 1.0
#             p = p * depth
#         else:
#             p = np.sin(2.0 * np.pi * speed_hz * t + phase) * depth
#         return np.clip(p, -1.0, 1.0)
#     return pan

# # -------------------------
# # Top-level pipeline
# # -------------------------
# def process_file(input_path, output_path, preset='8d', target_lufs=-14.0):
#     print("Loading audio...")
#     y_mix, sr = load_audio_mono(input_path, sr=None)
#     duration = len(y_mix) / sr
#     print(f"Sample rate: {sr}, duration: {duration:.2f}s")

#     # 1) separate stems
#     stems = {}
#     if HAVE_SPLEETER:
#         try:
#             print("Separating stems with Spleeter (2 stems: vocals + accompaniment)...")
#             sep = separate_stems_spleeter(input_path, stems=2)
#             # rename keys to 'vocals' 'accompaniment' expected
#             if 'vocals' in sep:
#                 stems['vocals'] = sep['vocals']
#             elif 'vocals.wav' in sep:
#                 stems['vocals'] = sep['vocals.wav']
#             # accompaniment fallback
#             for k, v in sep.items():
#                 if 'accompaniment' in k or 'mix' in k:
#                     stems['instruments'] = v
#             # if only mix returned, use as 'instruments'
#             if not stems:
#                 stems['instruments'] = (y_mix, sr)
#         except Exception as e:
#             print("Spleeter failed: falling back to mix-only. Error:", e)
#             stems['instruments'] = (y_mix, sr)
#     else:
#         print("Spleeter not available — processing whole mix as single 'instruments' stem.")
#         stems['instruments'] = (y_mix, sr)

#     # 2) choose pan behaviors per preset
#     if preset == '3d':
#         # vocals subtle, slow; instruments slightly opposite
#         v_pan = make_lfo_pan(speed_hz=0.09, phase=0.0, depth=0.35)
#         i_pan = make_lfo_pan(speed_hz=0.09, phase=np.pi, depth=0.55)
#         reverb_amount_v = 0.12
#         reverb_amount_i = 0.18
#     elif preset == '8d':
#         v_pan = make_lfo_pan(speed_hz=0.045, phase=0.0, depth=0.30)  # slow vocal orbit (~22s)
#         i_pan = make_lfo_pan(speed_hz=0.055, phase=np.pi, depth=0.85)  # instruments wider / opposite
#         reverb_amount_v = 0.12
#         reverb_amount_i = 0.22
#     elif preset == '16d':
#         # multi-movement — simulate with slightly different speeds & occasional sync
#         v_pan = make_lfo_pan(speed_hz=0.07, phase=0.0, depth=0.40)
#         i_pan = make_lfo_pan(speed_hz=0.11, phase=np.pi/3, depth=0.85)
#         reverb_amount_v = 0.18
#         reverb_amount_i = 0.30
#     else:
#         # default to 8d
#         v_pan = make_lfo_pan(speed_hz=0.05, depth=0.35)
#         i_pan = make_lfo_pan(speed_hz=0.055, phase=np.pi, depth=0.7)
#         reverb_amount_v = 0.12
#         reverb_amount_i = 0.18

#     # 3) spatialize per stem and mix
#     max_len = 0
#     for k, (y, s) in stems.items():
#         max_len = max(max_len, len(y))

#     left_total = np.zeros(max_len, dtype=np.float64)
#     right_total = np.zeros(max_len, dtype=np.float64)

#     for name, (y, s) in stems.items():
#         if s != sr:
#             y = librosa.resample(y, orig_sr=s, target_sr=sr)
#         y = ensure_len(y, max_len)

#         if name.lower().startswith('voc'):
#             pan_func = v_pan
#             reverb_amount = reverb_amount_v
#         else:
#             pan_func = i_pan
#             reverb_amount = reverb_amount_i

#         print(f"Processing stem '{name}' - len {len(y)/sr:.2f}s, reverb {reverb_amount:.3f}")
#         l, r = spatialize_stem(y, sr, pan_func,
#                                low_cutoff=180.0,
#                                reverb_ms=90,
#                                reverb_amount=reverb_amount)
#         left_total += l
#         right_total += r

#     # 4) basic safety: match overall peak to prevent insane clipping before LUFS
#     peak = max(np.max(np.abs(left_total)), np.max(np.abs(right_total)), 1e-12)
#     if peak > 1.0:
#         left_total /= peak
#         right_total /= peak

#     # 5) LUFS normalization
#     print("Measuring loudness and normalizing to target LUFS:", target_lufs)
#     meter = pyln.Meter(sr)  # create meter
#     stereo_for_meter = np.vstack([left_total, right_total]).T
#     loudness = meter.integrated_loudness(stereo_for_meter)
#     print(f"Current integrated loudness: {loudness:.2f} LUFS")
#     loudness_diff = target_lufs - loudness
#     gain = 10.0 ** (loudness_diff / 20.0)
#     left_total *= gain
#     right_total *= gain
#     print(f"Applied gain {20*np.log10(gain):.2f} dB to match LUFS.")

#     # 6) Simple limiter (brickwall) to -1 dBFS
#     stereo = np.vstack([left_total, right_total])
#     # ensure no NaNs
#     stereo = np.nan_to_num(stereo)
#     stereo = simple_limiter(stereo, ceiling=0.999)

#     # 7) final small normalization to make sure int16 fits (scale down if needed)
#     final_peak = np.max(np.abs(stereo)) + 1e-12
#     if final_peak > 0.9999:
#         stereo = stereo / final_peak * 0.9999

#     # 8) write out
#     print("Exporting stereo file:", output_path)
#     write_stereo(output_path, stereo, sr)
#     print("Done.")

# # -------------------------
# # CLI
# # -------------------------
# def main_cli():
#     parser = argparse.ArgumentParser(description="Spatialize audio into 3D/8D/16D style.")
#     parser.add_argument("input", help="Input audio file (wav/mp3)")
#     parser.add_argument("output", help="Output wav path (stereo)")
#     parser.add_argument("--preset", choices=['3d','8d','16d'], default='8d')
#     parser.add_argument("--lufs", type=float, default=-14.0, help="Target integrated LUFS (default -14)")
#     args = parser.parse_args()

#     process_file(args.input, args.output, preset=args.preset, target_lufs=args.lufs)

# if __name__ == "__main__":
#     main_cli()



# 7th try


# #!/usr/bin/env python3
# """
# spatializer_final.py

# Final offline spatializer engine (3D / 8D / 16D style).

# Features:
#  - Stem separation using Spleeter (optional)
#  - Natural movement pattern: vocals vs instruments opposite / hold / drift / sync
#  - Bass centered, mid/high panned with equal-power law
#  - Reverb via convolution (wet/dry mix so energy preserved)
#  - Peak-normalization to preserve loudness (no automatic LUFS by default)
#  - Optional LUFS target via --lufs (use carefully if you want exact loudness)
#  - Simple brickwall limiter

# Usage:
#     python spatializer_final.py input.wav output.wav --preset 8d
#     python spatializer_final.py input.wav output.wav --preset 8d --lufs -14.0

# Dependencies:
#     pip install numpy scipy librosa soundfile pyloudnorm spleeter
#     (spleeter is optional — fallback to single-stem processing if missing)
# """

# import argparse
# import os
# import numpy as np
# import soundfile as sf
# import librosa
# from scipy import signal

# # optional loudness library
# try:
#     import pyloudnorm as pyln
#     HAVE_PYL = True
# except Exception:
#     HAVE_PYL = False

# # try spleeter
# try:
#     from spleeter.separator import Separator
#     HAVE_SPLEETER = True
# except Exception:
#     HAVE_SPLEETER = False

# # -------------------------
# # Utilities
# # -------------------------
# def load_audio_mono(path, sr=None):
#     y, sr = librosa.load(path, sr=sr, mono=True)
#     return y, sr

# def write_stereo(path, stereo_array, sr):
#     # stereo_array shape: (2, n) or (n,2)
#     arr = np.asarray(stereo_array)
#     if arr.shape[0] == 2 and arr.ndim == 2:
#         data = np.vstack(arr).T  # (n,2)
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

# # equal-power pan for scalars
# def pan_to_gains(pan):
#     theta = (pan + 1.0) * (np.pi / 4.0)
#     gl = np.cos(theta)
#     gr = np.sin(theta)
#     return gl, gr

# # vectorized equal-power pan for arrays
# def pan_to_gains_array(pan_array):
#     theta = (pan_array + 1.0) * (np.pi / 4.0)
#     gl = np.cos(theta)
#     gr = np.sin(theta)
#     return gl, gr

# def simple_limiter(stereo, ceiling=0.999):
#     # stereo shape: (2, n)
#     peak = np.max(np.abs(stereo))
#     if peak <= ceiling:
#         return stereo
#     gain = ceiling / (peak + 1e-12)
#     return stereo * gain

# # create exponential IR normalized to sum=1 (so convolution is energy-preserving)
# def make_exponential_ir(length_samples, decay=4.0):
#     t = np.linspace(0, 1, max(1, length_samples))
#     ir = np.exp(-decay * t)
#     ir /= (np.sum(np.abs(ir)) + 1e-12)
#     return ir

# # -------------------------
# # Spleeter separation (optional)
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
# # Pattern generator (natural movement)
# # -------------------------
# def make_pattern_pan_arrays(sr, n_samples,
#                             block_durations=(5.0, 4.0, 3.0, 6.0),
#                             left_val=-0.85, right_val=0.85):
#     """
#     Creates two pan arrays (vocals_pan, inst_pan) length n_samples that follow:
#       A: hold opposite (vocals left, inst right)
#       B: both drift to center
#       C: both sync (same side)
#       D: reverse drift
#     block_durations are seconds for A,B,C,D
#     returns arrays in [-1..1]
#     """
#     A_s = int(block_durations[0] * sr)
#     B_s = int(block_durations[1] * sr)
#     C_s = int(block_durations[2] * sr)
#     D_s = int(block_durations[3] * sr)

#     vocals = np.zeros(n_samples, dtype=np.float64)
#     inst = np.zeros(n_samples, dtype=np.float64)

#     idx = 0
#     # precompute small random variation to avoid mechanical repeating pattern
#     jitter = lambda L: int(max(0, np.round( (np.random.rand() - 0.5) * 0.15 * L )))  # +-15% jitter

#     while idx < n_samples:
#         # Block A - hold opposite
#         A_len = min(A_s + jitter(A_s), n_samples - idx)
#         end = idx + A_len
#         vocals[idx:end] = left_val
#         inst[idx:end] = right_val
#         idx = end

#         if idx >= n_samples: break

#         # Block B - drift to center
#         B_len = min(B_s + jitter(B_s), n_samples - idx)
#         end = idx + B_len
#         vocals[idx:end] = np.linspace(left_val, 0.0, B_len)
#         inst[idx:end] = np.linspace(right_val, 0.0, B_len)
#         idx = end

#         if idx >= n_samples: break

#         # Block C - both same side (random choose left/right)
#         side = right_val if (np.random.rand() > 0.5) else left_val
#         C_len = min(C_s + jitter(C_s), n_samples - idx)
#         end = idx + C_len
#         vocals[idx:end] = side
#         inst[idx:end] = side
#         idx = end

#         if idx >= n_samples: break

#         # Block D - reverse drift (from side back to opposite)
#         D_len = min(D_s + jitter(D_s), n_samples - idx)
#         end = idx + D_len
#         # go from current side to new opposites:
#         # if C used right_val, go right -> left_val; else left -> right
#         if vocals[idx-1] == right_val or inst[idx-1] == right_val:
#             vocals[idx:end] = np.linspace(right_val, left_val, D_len)
#             inst[idx:end]   = np.linspace(right_val, right_val * 0.94, D_len)  # slight difference
#         else:
#             vocals[idx:end] = np.linspace(left_val, right_val, D_len)
#             inst[idx:end]   = np.linspace(left_val * 0.94, right_val, D_len)
#         idx = end

#     # clamp
#     vocals = np.clip(vocals, -1.0, 1.0)
#     inst = np.clip(inst, -1.0, 1.0)
#     return vocals, inst

# # -------------------------
# # Core spatialize per-stem using pan arrays
# # -------------------------
# def spatialize_stem_with_pan_array(y, sr, pan_array,
#                                    low_cutoff=180.0,
#                                    reverb_ms=90,
#                                    reverb_amount=0.20,
#                                    mid_gain=1.0,
#                                    bass_gain=1.0):
#     """
#     y: mono stem (n,)
#     pan_array: length n array with pan values [-1..1] (precomputed)
#     returns left, right arrays length n
#     """
#     n = len(y)
#     # filter split (use filtfilt for minimal phase distortion)
#     nyq = 0.5 * sr
#     low_norm = min(low_cutoff / nyq, 0.999)
#     b_low, a_low = signal.butter(4, low_norm, btype='low')
#     b_high, a_high = signal.butter(4, low_norm, btype='high')
#     # protect very short signals
#     if n < 10:
#         bass = signal.lfilter(b_low, a_low, y)
#         midhigh = y - bass
#     else:
#         bass = signal.filtfilt(b_low, a_low, y)
#         midhigh = signal.filtfilt(b_high, a_high, y)

#     # apply separate gains (useful to balance stems)
#     bass *= bass_gain
#     midhigh *= mid_gain

#     # equal-power panning for midhigh
#     gl, gr = pan_to_gains_array(pan_array)  # each shape (n,)
#     left_mid = midhigh * gl
#     right_mid = midhigh * gr

#     # center bass
#     bass_center = bass  # already mono
#     left = left_mid + bass_center
#     right = right_mid + bass_center

#     # crossfeed (compute using originals to avoid in-place update issues)
#     cross = 0.06 * np.abs(pan_array)  # small crossfeed increasing with pan amount
#     # save pre-cross for mixing
#     left_pre = left.copy()
#     right_pre = right.copy()
#     left = left_pre * (1.0 - cross) + right_pre * cross
#     right = right_pre * (1.0 - cross) + left_pre * cross

#     # Reverb: compute wet by convolution then mix: out = dry*(1-reverb_amount) + wet*reverb_amount
#     ir_len = max(64, int(sr * (reverb_ms / 1000.0)))
#     ir = make_exponential_ir(ir_len, decay=4.0)
#     wet_l = signal.fftconvolve(left, ir, mode='same')
#     wet_r = signal.fftconvolve(right, ir, mode='same')
#     left_out = left * (1.0 - reverb_amount) + wet_l * reverb_amount
#     right_out = right * (1.0 - reverb_amount) + wet_r * reverb_amount

#     return left_out, right_out

# # -------------------------
# # Top-level process
# # -------------------------
# def process_file(input_path, output_path, preset='8d', target_lufs=None):
#     print("Loading audio...")
#     y_mix, sr = load_audio_mono(input_path, sr=None)
#     duration = len(y_mix) / sr
#     print(f"Sample rate: {sr}, duration: {duration:.2f}s")

#     # 1) Stem separation (vocals + accompaniment) if spleeter available
#     stems = {}
#     if HAVE_SPLEETER:
#         try:
#             print("Running Spleeter (2 stems)...")
#             sep = separate_stems_spleeter(input_path, out_dir="spleeter_out", stems=2)
#             # sep keys: 'vocals', 'accompaniment' typically
#             if 'vocals' in sep:
#                 stems['vocals'] = sep['vocals']
#             # pick accompaniment / mix as instruments
#             for k, v in sep.items():
#                 if 'accompaniment' in k or 'mix' in k:
#                     stems['instruments'] = v
#             if not stems:
#                 stems['instruments'] = (y_mix, sr)
#         except Exception as e:
#             print("Spleeter failed:", e)
#             stems['instruments'] = (y_mix, sr)
#     else:
#         print("Spleeter not available: processing mix as single 'instruments' stem.")
#         stems['instruments'] = (y_mix, sr)

#     # 2) get max length
#     max_len = 0
#     for k, (y, s) in stems.items():
#         max_len = max(max_len, len(y))

#     # 3) generate pan pattern arrays for vocals & instruments
#     vocals_pan = np.zeros(max_len, dtype=np.float64)
#     inst_pan = np.zeros(max_len, dtype=np.float64)
#     if 'vocals' in stems and 'instruments' in stems:
#         vocals_pan, inst_pan = make_pattern_pan_arrays(sr, max_len,
#                                                       block_durations=(5.0, 4.0, 3.0, 6.0))
#     else:
#         # if only one stem (instruments), give it slow orbit
#         inst_pan = np.sin(2.0 * np.pi * 0.04 * (np.arange(max_len) / sr)) * 0.65
#         vocals_pan = np.zeros(max_len, dtype=np.float64)

#     # 4) assign per-stem parameters by preset
#     if preset == '3d':
#         # subtle movement, smaller depth
#         reverb_v = 0.10
#         reverb_i = 0.14
#         v_low_cut = 150.0
#         i_low_cut = 180.0
#     elif preset == '8d':
#         reverb_v = 0.12
#         reverb_i = 0.20
#         v_low_cut = 160.0
#         i_low_cut = 180.0
#     elif preset == '16d':
#         reverb_v = 0.16
#         reverb_i = 0.28
#         v_low_cut = 180.0
#         i_low_cut = 200.0
#     else:
#         reverb_v = 0.12
#         reverb_i = 0.20
#         v_low_cut = 180.0
#         i_low_cut = 180.0

#     # 5) spatialize each stem and accumulate
#     left_total = np.zeros(max_len, dtype=np.float64)
#     right_total = np.zeros(max_len, dtype=np.float64)

#     for name, (y, s) in stems.items():
#         if s != sr:
#             y = librosa.resample(y, orig_sr=s, target_sr=sr)
#         y = ensure_len(y, max_len)

#         if name.lower().startswith('voc'):
#             pan_arr = vocals_pan
#             reverb_amount = reverb_v
#             low_cut = v_low_cut
#             # slightly boost vocal mids to keep presence
#             mid_gain = 1.02
#             bass_gain = 0.95
#         else:
#             pan_arr = inst_pan
#             reverb_amount = reverb_i
#             low_cut = i_low_cut
#             mid_gain = 1.00
#             bass_gain = 1.00

#         print(f"Processing stem '{name}' length {len(y)/sr:.2f}s | reverb {reverb_amount:.2f}")
#         l, r = spatialize_stem_with_pan_array(y, sr, pan_arr,
#                                              low_cutoff=low_cut,
#                                              reverb_ms=90,
#                                              reverb_amount=reverb_amount,
#                                              mid_gain=mid_gain,
#                                              bass_gain=bass_gain)
#         left_total += l
#         right_total += r

#     # 6) simple peak safety normalization (preserve loudness)
#     peak = max(np.max(np.abs(left_total)), np.max(np.abs(right_total)), 1e-12)
#     target_peak = 0.98
#     if peak > 0:
#         gain = target_peak / peak
#         left_total *= gain
#         right_total *= gain
#     print(f"Applied global peak gain: {20*np.log10(gain):.2f} dB")

#     # 7) Optional LUFS normalization (only if user provided target and pyloudnorm available)
#     if target_lufs is not None:
#         if HAVE_PYL:
#             stereo_for_meter = np.vstack([left_total, right_total]).T
#             meter = pyln.Meter(sr)
#             loudness = meter.integrated_loudness(stereo_for_meter)
#             print(f"Current LUFS: {loudness:.2f} LUFS -> Target: {target_lufs:.2f} LUFS")
#             loudness_diff = target_lufs - loudness
#             lgain = 10.0 ** (loudness_diff / 20.0)
#             left_total *= lgain
#             right_total *= lgain
#             print(f"Applied LUFS gain {20*np.log10(lgain):.2f} dB")
#         else:
#             print("pyloudnorm not installed — skipping LUFS normalization (install pyloudnorm to enable)")

#     # 8) brickwall limiter and final peak safe
#     stereo = np.vstack([left_total, right_total])
#     stereo = np.nan_to_num(stereo)
#     stereo = simple_limiter(stereo, ceiling=0.999)
#     final_peak = np.max(np.abs(stereo)) + 1e-12
#     if final_peak > 0.9999:
#         stereo = stereo / final_peak * 0.9999

#     # 9) write out
#     print(f"Exporting to {output_path}")
#     write_stereo(output_path, stereo, sr)
#     print("Done.")

# # -------------------------
# # CLI
# # -------------------------
# def main_cli():
#     parser = argparse.ArgumentParser(description="Final Spatializer (3D/8D/16D)")
#     parser.add_argument("input", help="Input audio (wav/mp3)")
#     parser.add_argument("output", help="Output wav file (stereo PCM16)")
#     parser.add_argument("--preset", choices=['3d','8d','16d'], default='8d')
#     parser.add_argument("--lufs", type=float, default=None, help="Optional target LUFS (requires pyloudnorm). Default: None (disabled)")
#     args = parser.parse_args()
#     process_file(args.input, args.output, preset=args.preset, target_lufs=args.lufs)

# if __name__ == "__main__":
#     main_cli()



# 8th try

#!/usr/bin/env python3
"""
spatializer_behavioral.py

Behavior-driven spatializer engine for 3D/8D/16D.

Run:
    python spatializer_behavioral.py input.mp3 output.wav --preset 8d
    python spatializer_behavioral.py input.mp3 output.wav --preset 8d --lufs -14

Dependencies:
    pip install numpy scipy librosa soundfile pyloudnorm spleeter
    (spleeter optional)

Design:
 - Behavior states: OPPOSITE_HOLD -> PAUSE -> SLOW_ROTATE -> SYNC_HOLD -> REVERSE_ROTATE (loop)
 - Smooth (cosine) transitions and jitter for natural feel
 - Bass centered; mid/high panned using equal-power panning
 - Peak normalization to preserve loudness (no automatic LUFS unless requested)
"""

import argparse
import os
import numpy as np
import soundfile as sf
import librosa
from scipy import signal

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

# load audio file as mono
def load_audio_mono(path, sr=None):
    y, sr = librosa.load(path, sr=sr, mono=True)
    return y, sr


# write stereo wav file from (2,n) or (n,2) array
# (left - right ) ko combine karke ek stereo file export karta hai
def write_stereo(path, stereo_array, sr):
    arr = np.asarray(stereo_array)
    if arr.shape[0] == 2 and arr.ndim == 2:
        data = np.vstack(arr).T
    elif arr.ndim == 2 and arr.shape[1] == 2:
        data = arr
    else:
        raise ValueError("stereo_array shape not understood")
    sf.write(path, data, sr, subtype='PCM_16')

# mono stem short ho ya long ho, usko n length me ensure karta hai
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
        y, sr = load_audio_mono(input_path, sr=None)
        results["mix"] = (y, sr)
    return results

# -------------------------
# Smooth easing helpers
# -------------------------
def cosine_interpolate(a, b, t):
    """t in [0,1] -> eased value between a and b"""
    f = (1 - np.cos(np.pi * t)) * 0.5
    return a * (1 - f) + b * f

def make_eased_linspace(start, end, length):
    if length <= 1:
        return np.array([end])
    t = np.linspace(0, 1, length)
    return cosine_interpolate(start, end, t)

# -------------------------
# Behavior-driven pan array generator
# -------------------------

# Original
# def make_behavioral_pan_arrays(sr, n_samples,
#                                params=None):
#     """
#     Create two pan arrays (vocals_pan, inst_pan) with behavior states:
#       - OPPOSITE_HOLD: vocals left, inst right (hold)
#       - PAUSE: both slightly inward (small center)
#       - SLOW_ROTATE: slow ease-driven rotation from current to target
#       - SYNC_HOLD: both same side (random)
#       - REVERSE_ROTATE: slow rotation to opposite config

#     params: dict to control durations and jitter
#     """
#     if params is None:
#         params = {}
#     # base durations in seconds (can be tuned by preset)
#     A = params.get("A", 5.0)   # opposite hold
#     B = params.get("B", 3.5)   # pause/center
#     C = params.get("C", 2.8)   # sync hold
#     D = params.get("D", 5.5)   # reverse rotate
#     jitter_frac = params.get("jitter_frac", 0.12)  # ±12% jitter
#     left_val = params.get("left_val", -0.85)
#     right_val = params.get("right_val", 0.85)
#     slow_speed_factor = params.get("slow_speed_factor", 1.0)

#     vocals = np.zeros(n_samples, dtype=np.float64)
#     inst = np.zeros(n_samples, dtype=np.float64)

#     idx = 0
#     rng = np.random.RandomState(12345)  # deterministic unless you want random each run

#     def jitter(sec):
#         return int(np.round(sec * sr * (1.0 + (rng.rand() - 0.5) * 2 * jitter_frac)))

#     # Start with an opposite hold (vocals left, instruments right)
#     # Loop until we fill n_samples
#     while idx < n_samples:
#         # A: Opposite Hold
#         L = min(jitter(A), n_samples - idx)
#         end = idx + L
#         vocals[idx:end] = left_val
#         inst[idx:end] = right_val
#         idx = end
#         if idx >= n_samples:
#             break

#         # B: Pause/center (ease from previous to center)
#         L = min(jitter(B), n_samples - idx)
#         end = idx + L
#         vocals[idx:end] = make_eased_linspace(left_val, 0.0, L)
#         inst[idx:end] = make_eased_linspace(right_val, 0.0, L)
#         idx = end
#         if idx >= n_samples:
#             break

#         # C: SLOW_ROTATE (from center to a side but slowly rotate with easing + micro-random curve)
#         # Choose a target side for vocals (opposite of previous hold sometimes) with slight randomness
#         target_v = right_val if rng.rand() > 0.4 else left_val
#         target_i = left_val if target_v == right_val else right_val
#         L = min(jitter(D), n_samples - idx)
#         end = idx + L
#         # build an eased path from center to target but with a subtle sine wobble for realism
#         t = np.linspace(0, 1, L)
#         base = cosine_interpolate(0.0, target_v, t)
#         wobble = 0.06 * np.sin(2 * np.pi * 0.6 * t + rng.rand() * 2 * np.pi)  # slow micro wobble
#         vocals[idx:end] = np.clip(base + wobble * np.sign(target_v), -1.0, 1.0)
#         base_i = cosine_interpolate(0.0, target_i, t)
#         wobble_i = 0.05 * np.sin(2 * np.pi * 0.55 * t + rng.rand() * 2 * np.pi)
#         inst[idx:end] = np.clip(base_i + wobble_i * np.sign(target_i), -1.0, 1.0)
#         idx = end
#         if idx >= n_samples:
#             break

#         # D: SYNC_HOLD - both same side for a short duration (random pick)
#         L = min(jitter(C), n_samples - idx)
#         end = idx + L
#         side = right_val if rng.rand() > 0.5 else left_val
#         vocals[idx:end] = side
#         inst[idx:end] = side
#         idx = end
#         if idx >= n_samples:
#             break

#         # E: Reverse rotate back to opposite hold but slowly
#         L = min(jitter(D), n_samples - idx)
#         end = idx + L
#         # Usually go from current side to the opposite hold:
#         start_v = vocals[idx-1] if idx > 0 else left_val
#         target_v = left_val if start_v > 0 else right_val
#         vocals[idx:end] = make_eased_linspace(start_v, target_v, L)
#         start_i = inst[idx-1] if idx > 0 else right_val
#         target_i = right_val if start_i < 0 else left_val
#         inst[idx:end] = make_eased_linspace(start_i, target_i, L)
#         idx = end

#     # safety clamp
#     vocals = np.clip(vocals, -1.0, 1.0)
#     inst = np.clip(inst, -1.0, 1.0)
#     return vocals, inst

# Testing 
def make_behavioral_pan_arrays(sr, n_samples, params=None):
    """
    Revised: Vocals and instruments switch left/right independently with smooth waits.
    Occasionally, both sync to the same direction.
    """
    if params is None:
        params = {}
    left_val = params.get("left_val", -0.85)
    right_val = params.get("right_val", 0.85)
    switch_duration = params.get("switch_duration", 3.0)  # Base time for a switch (seconds)
    wait_duration = params.get("wait_duration", 2.0)     # Base wait after switch (seconds)
    sync_prob = params.get("sync_prob", 0.3)             # Probability of syncing both (0-1)
    jitter_frac = params.get("jitter_frac", 0.12)

    vocals = np.zeros(n_samples, dtype=np.float64)
    inst = np.zeros(n_samples, dtype=np.float64)

    idx = 0
    rng = np.random.RandomState()  # Remove 12345 for true randomness each run

    def jitter(sec):
        return int(np.round(sec * sr * (1.0 + (rng.rand() - 0.5) * 2 * jitter_frac)))

    # Start positions
    current_vocal_pan = left_val  # Start vocals left
    current_inst_pan = right_val  # Start instruments right

    while idx < n_samples:
        # Randomly decide: switch vocals, instruments, or both (sync)
        action = rng.choice(['vocal_switch', 'inst_switch', 'sync_switch'], p=[0.4, 0.4, sync_prob])

        if action == 'vocal_switch':
            # Switch vocals to opposite side smoothly
            target_v = right_val if current_vocal_pan == left_val else left_val
            L = min(jitter(switch_duration), n_samples - idx)
            end = idx + L
            vocals[idx:end] = make_eased_linspace(current_vocal_pan, target_v, L)
            inst[idx:end] = current_inst_pan  # Instruments hold
            current_vocal_pan = target_v
            idx = end

            # Add a wait (ease to slight center or hold)
            if idx < n_samples:
                L_wait = min(jitter(wait_duration), n_samples - idx)
                end = idx + L_wait
                vocals[idx:end] = make_eased_linspace(current_vocal_pan, 0.0, L_wait)  # Slight inward wait
                inst[idx:end] = current_inst_pan
                idx = end

        elif action == 'inst_switch':
            # Switch instruments to opposite side smoothly
            target_i = right_val if current_inst_pan == left_val else left_val
            L = min(jitter(switch_duration), n_samples - idx)
            end = idx + L
            inst[idx:end] = make_eased_linspace(current_inst_pan, target_i, L)
            vocals[idx:end] = current_vocal_pan  # Vocals hold
            current_inst_pan = target_i
            idx = end

            # Add a wait
            if idx < n_samples:
                L_wait = min(jitter(wait_duration), n_samples - idx)
                end = idx + L_wait
                inst[idx:end] = make_eased_linspace(current_inst_pan, 0.0, L_wait)
                vocals[idx:end] = current_vocal_pan
                idx = end

        elif action == 'sync_switch':
            # Both switch to the same random side smoothly
            target_side = rng.choice([left_val, right_val])
            L = min(jitter(switch_duration), n_samples - idx)
            end = idx + L
            vocals[idx:end] = make_eased_linspace(current_vocal_pan, target_side, L)
            inst[idx:end] = make_eased_linspace(current_inst_pan, target_side, L)
            current_vocal_pan = target_side
            current_inst_pan = target_side
            idx = end

            # Add a wait
            if idx < n_samples:
                L_wait = min(jitter(wait_duration), n_samples - idx)
                end = idx + L_wait
                vocals[idx:end] = make_eased_linspace(current_vocal_pan, 0.0, L_wait)
                inst[idx:end] = make_eased_linspace(current_inst_pan, 0.0, L_wait)
                idx = end

    # Safety clamp
    vocals = np.clip(vocals, -1.0, 1.0)
    inst = np.clip(inst, -1.0, 1.0)
    return vocals, inst

# -------------------------
# Spatialize stem given pan array
# -------------------------
def spatialize_stem_with_pan_array(y, sr, pan_array,
                                   low_cutoff=180.0,
                                   reverb_ms=90,
                                   reverb_amount=0.18,
                                   mid_gain=1.0,
                                   bass_gain=1.0):
    n = len(y)
    nyq = 0.5 * sr
    low_norm = min(low_cutoff / nyq, 0.999)
    b_low, a_low = signal.butter(4, low_norm, btype='low')
    b_high, a_high = signal.butter(4, low_norm, btype='high')

    if n < 10:
        bass = signal.lfilter(b_low, a_low, y)
        midhigh = y - bass
    else:
        bass = signal.filtfilt(b_low, a_low, y)
        midhigh = signal.filtfilt(b_high, a_high, y)

    bass *= bass_gain
    midhigh *= mid_gain

    gl, gr = pan_to_gains_array(pan_array)
    left_mid = midhigh * gl
    right_mid = midhigh * gr

    # center bass
    left = left_mid + bass
    right = right_mid + bass

    # small crossfeed depending on pan magnitude
    cross = 0.06 * np.abs(pan_array)
    left_pre = left.copy()
    right_pre = right.copy()
    left = left_pre * (1.0 - cross) + right_pre * cross
    right = right_pre * (1.0 - cross) + left_pre * cross

    # reverb wet/dry mix
    ir_len = max(64, int(sr * (reverb_ms / 1000.0)))
    ir = make_exponential_ir(ir_len, decay=4.0)
    wet_l = signal.fftconvolve(left, ir, mode='same')
    wet_r = signal.fftconvolve(right, ir, mode='same')
    left_out = left * (1.0 - reverb_amount) + wet_l * reverb_amount
    right_out = right * (1.0 - reverb_amount) + wet_r * reverb_amount

    return left_out, right_out

# -------------------------
# Top-level processing
# -------------------------
def process_file(input_path, output_path, preset='8d', target_lufs=None):
    print("Loading audio...")
    y_mix, sr = load_audio_mono(input_path, sr=None)
    duration = len(y_mix) / sr
    print(f"Sample rate: {sr}, duration: {duration:.2f}s")

    # stems
    stems = {}
    if HAVE_SPLEETER:
        try:
            print("Running Spleeter (2 stems)...")
            sep = separate_stems_spleeter(input_path, out_dir="spleeter_out", stems=2)
            if 'vocals' in sep:
                stems['vocals'] = sep['vocals']
            for k, v in sep.items():
                if 'accompaniment' in k or 'mix' in k:
                    stems['instruments'] = v
            if not stems:
                stems['instruments'] = (y_mix, sr)
        except Exception as e:
            print("Spleeter error:", e)
            stems['instruments'] = (y_mix, sr)
    else:
        print("Spleeter not available — using mix as instruments")
        stems['instruments'] = (y_mix, sr)

    max_len = 0
    for k, (y, s) in stems.items():
        max_len = max(max_len, len(y))

    # preset-specific parameters
    if preset == '3d':
        params = {'A': 4.5, 'B': 3.0, 'C': 2.2, 'D': 5.0, 'jitter_frac': 0.10}
        reverb_v = 0.10; reverb_i = 0.14; v_low_cut = 150.0; i_low_cut = 170.0
    elif preset == '8d':
        # Original code ke liye
        # params = {'A': 5.0, 'B': 3.5, 'C': 2.8, 'D': 6.0, 'jitter_frac': 0.12}
        # Testing code ke
        params = {'switch_duration': 3.0, 'wait_duration': 2.5, 'sync_prob': 0.3, 'jitter_frac': 0.12}
        reverb_v = 0.12; reverb_i = 0.22; v_low_cut = 160.0; i_low_cut = 180.0
    elif preset == '16d':
        params = {'A': 6.0, 'B': 4.0, 'C': 3.5, 'D': 7.0, 'jitter_frac': 0.15}
        reverb_v = 0.16; reverb_i = 0.30; v_low_cut = 180.0; i_low_cut = 200.0
    else:
        params = {'A':5.0,'B':3.5,'C':2.8,'D':6.0,'jitter_frac':0.12}
        reverb_v = 0.12; reverb_i = 0.20; v_low_cut = 160.0; i_low_cut = 180.0

    # generate pan arrays
    if 'vocals' in stems and 'instruments' in stems:
        vocals_pan, inst_pan = make_behavioral_pan_arrays(sr, max_len, params=params)
    else:
        # single stem: give slow orbit
        t = np.arange(max_len) / sr
        inst_pan = np.sin(2.0 * np.pi * 0.035 * t) * 0.65
        vocals_pan = np.zeros(max_len, dtype=np.float64)

    left_total = np.zeros(max_len, dtype=np.float64)
    right_total = np.zeros(max_len, dtype=np.float64)

    for name, (y, s) in stems.items():
        if s != sr:
            y = librosa.resample(y, orig_sr=s, target_sr=sr)
        y = ensure_len(y, max_len)

        if name.lower().startswith('voc'):
            pan_arr = vocals_pan
            reverb_amount = reverb_v
            low_cut = v_low_cut
            mid_gain = 1.03  # keep vocals present
            bass_gain = 0.95
        else:
            pan_arr = inst_pan
            reverb_amount = reverb_i
            low_cut = i_low_cut
            mid_gain = 1.00
            bass_gain = 1.00

        print(f"Processing stem '{name}' len {len(y)/sr:.2f} s, reverb {reverb_amount:.2f}")
        l, r = spatialize_stem_with_pan_array(y, sr, pan_arr,
                                             low_cutoff=low_cut,
                                             reverb_ms=90,
                                             reverb_amount=reverb_amount,
                                             mid_gain=mid_gain,
                                             bass_gain=bass_gain)
        left_total += l
        right_total += r

    # peak safety normalization (preserve loudness)
    peak = max(np.max(np.abs(left_total)), np.max(np.abs(right_total)), 1e-12)
    target_peak = 0.98
    gain = target_peak / peak
    left_total *= gain
    right_total *= gain
    print(f"Applied global peak gain: {20*np.log10(gain):.2f} dB")

    # optional LUFS
    if target_lufs is not None:
        if HAVE_PYL:
            stereo_for_meter = np.vstack([left_total, right_total]).T
            meter = pyln.Meter(sr)
            loudness = meter.integrated_loudness(stereo_for_meter)
            print(f"Current LUFS: {loudness:.2f} -> Target: {target_lufs:.2f}")
            loudness_diff = target_lufs - loudness
            lgain = 10.0 ** (loudness_diff / 20.0)
            left_total *= lgain
            right_total *= lgain
            print(f"Applied LUFS gain {20*np.log10(lgain):.2f} dB")
        else:
            print("pyloudnorm not installed, skipping LUFS normalization")

    # limiter & final peak safe
    stereo = np.vstack([left_total, right_total])
    stereo = np.nan_to_num(stereo)
    stereo = simple_limiter(stereo, ceiling=0.999)
    final_peak = np.max(np.abs(stereo)) + 1e-12
    if final_peak > 0.9999:
        stereo = stereo / final_peak * 0.9999

    print(f"Exporting to {output_path}")
    write_stereo(output_path, stereo, sr)
    print("Done.")

# -------------------------
# CLI
# -------------------------
def main_cli():
    parser = argparse.ArgumentParser(description="Behavioral Spatializer (3D/8D/16D)")
    parser.add_argument("input", help="Input audio (wav/mp3)")
    parser.add_argument("output", help="Output wav file (stereo PCM16)")
    parser.add_argument("--preset", choices=['3d','8d','16d'], default='8d')
    parser.add_argument("--lufs", type=float, default=None, help="Optional target LUFS (requires pyloudnorm). Default: None (disabled)")
    args = parser.parse_args()
    process_file(args.input, args.output, preset=args.preset, target_lufs=args.lufs)

if __name__ == "__main__":
    main_cli()
