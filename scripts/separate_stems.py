import os
import sys
import subprocess
import shutil
import imageio_ffmpeg

# Add imageio_ffmpeg binary to PATH as ffmpeg.exe if needed
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
ffmpeg_dir = os.path.dirname(ffmpeg_exe)
shim_dir = os.path.abspath("scripts/bin")
os.makedirs(shim_dir, exist_ok=True)
shim_ffmpeg = os.path.join(shim_dir, "ffmpeg.exe")
if not os.path.exists(shim_ffmpeg):
    shutil.copy2(ffmpeg_exe, shim_ffmpeg)

env = os.environ.copy()
env["PATH"] = shim_dir + os.pathsep + env.get("PATH", "")

import torch
import numpy as np
import lameenc
from demucs.pretrained import get_model
from demucs.apply import apply_model
import soundfile as sf

torch.set_num_threads(max(1, (os.cpu_count() or 8) - 1))

TRACKS = [
    ("mosh", "MUSICAS SHOW/nova versao mosh de arma branca.mp3"),
    ("martelo", "MUSICAS SHOW/Capacete de Nazista é Martelo.mp3"),
    ("cansei", "MUSICAS SHOW/Eu Cansei.mp3"),
    ("catareich", "MUSICAS SHOW/Santa Catareich.mp3"),
]

def decode_mp3_ffmpeg(path, sr=44100):
    cmd = [
        shim_ffmpeg, "-y", "-i", path,
        "-f", "f32le", "-acodec", "pcm_f32le",
        "-ac", "2", "-ar", str(sr), "pipe:1"
    ]
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    audio = np.frombuffer(p.stdout, dtype=np.float32).reshape(-1, 2).T.copy()
    return audio

def encode_mp3(audio_np, sr, out_path, bitrate=160):
    # audio_np: shape (2, samples), float32 in [-1, 1]
    clipped = np.clip(audio_np.T, -1.0, 1.0)
    pcm16 = (clipped * 32767.0).astype(np.int16).tobytes()
    enc = lameenc.Encoder()
    enc.set_bit_rate(bitrate)
    enc.set_in_sample_rate(sr)
    enc.set_channels(2)
    enc.set_quality(5)
    mp3_data = enc.encode(pcm16) + enc.flush()
    with open(out_path, "wb") as f:
        f.write(mp3_data)

def main():
    print("Loading htdemucs model...", flush=True)
    model = get_model("htdemucs")
    model.eval()
    sr = model.samplerate
    sources = model.sources  # ['drums', 'bass', 'other', 'vocals']
    print(f"Model loaded! Sources: {sources}, SR: {sr}", flush=True)

    for slug, src_path in TRACKS:
        out_dir = os.path.join("stems", slug)
        os.makedirs(out_dir, exist_ok=True)
        done_marker = os.path.join(out_dir, "ready.txt")
        if os.path.exists(done_marker):
            print(f"[{slug}] already done, skipping.", flush=True)
            continue

        print(f"[{slug}] Decoding {src_path}...", flush=True)
        wav_np = decode_mp3_ffmpeg(src_path, sr=sr)
        wav = torch.from_numpy(wav_np).unsqueeze(0)  # (1, 2, T)

        print(f"[{slug}] Separating 4 stems ({wav.shape[-1]/sr:.1f}s)...", flush=True)
        with torch.no_grad():
            est = apply_model(model, wav, shifts=0, split=True, overlap=0.15, progress=False)[0]

        for idx, name in enumerate(sources):
            out_name = "guitar.mp3" if name == "other" else f"{name}.mp3"
            out_file = os.path.join(out_dir, out_name)
            encode_mp3(est[idx].cpu().numpy(), sr, out_file, bitrate=160)
            print(f"  -> saved {out_file}", flush=True)

        with open(done_marker, "w") as f:
            f.write("ok")
        print(f"[{slug}] COMPLETE!", flush=True)

    print("ALL 4 TRACK STEMS SEPARATED!", flush=True)

if __name__ == "__main__":
    main()
