#!/usr/bin/env bash
# Rebuild the brand landing reel from its three keyframes.
#
# The keyframes in public/brand/frames are AI-generated stills of the same
# scene the canvas field draws (a dark emerald wireframe plane under a lime
# horizon). The reel is not a render of that scene — it is footage of it, and
# the canvas still runs on top so the mesh stays crisp while the film drifts
# behind it.
#
# Loop design, because a background loop has to be seamless:
#   A -> B -> C -> A   crossfaded, 2s dissolves, 10s total
#   The last segment is the first keyframe again, so the clip ends exactly
#   where it starts, and the camera drift is applied once to the joined
#   timeline with a period of exactly 10s — both axes are back at zero on the
#   final frame. A slight pre-blur (gblur) keeps the footage from moiréing
#   against the crisp canvas lines and saves ~25% of the bitrate.
#
# Needs an ffmpeg binary: pip install imageio-ffmpeg, or use your own on PATH.
#
# Usage: bash scripts/brand-reel.sh
set -euo pipefail

cd "$(dirname "$0")/.."
FRAMES=public/brand/frames
OUT=public/brand
FF=${FFMPEG:-$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())' 2>/dev/null || command -v ffmpeg)}

build() { # out crf width height
  local out=$1 crf=$2 w=$3 h=$4
  local ow=$((w * 53 / 50)) oh=$((h * 53 / 50))
  local dx=$(( (ow - w) / 2 )) dy=$(( (oh - h) / 2 ))
  "$FF" -y -hide_banner -loglevel error \
    -loop 1 -t 4 -i "$FRAMES/key-01.webp" \
    -loop 1 -t 4 -i "$FRAMES/key-02.webp" \
    -loop 1 -t 4 -i "$FRAMES/key-03.webp" \
    -loop 1 -t 4 -i "$FRAMES/key-01.webp" \
    -filter_complex "\
[0:v]scale=${ow}:${oh}:flags=lanczos,fps=24,setsar=1,format=yuv420p[s0];\
[1:v]scale=${ow}:${oh}:flags=lanczos,fps=24,setsar=1,format=yuv420p[s1];\
[2:v]scale=${ow}:${oh}:flags=lanczos,fps=24,setsar=1,format=yuv420p[s2];\
[3:v]scale=${ow}:${oh}:flags=lanczos,fps=24,setsar=1,format=yuv420p[s3];\
[s0][s1]xfade=transition=fade:duration=2:offset=2[x1];\
[x1][s2]xfade=transition=fade:duration=2:offset=4[x2];\
[x2][s3]xfade=transition=fade:duration=2:offset=6[x3];\
[x3]crop=${w}:${h}:x='(iw-ow)/2 + ${dx}*sin(2*PI*t/10)':y='(ih-oh)/2 + ${dy}*sin(2*PI*t/10)*cos(4*PI*t/10)',\
gblur=sigma=0.9,hqdn3d=1.2:1.2:5:4,format=yuv420p[outv]" \
    -map '[outv]' -c:v libx264 -preset veryslow -crf "$crf" -pix_fmt yuv420p \
    -movflags +faststart -an "$OUT/$out"
}

build reel.mp4 30 1280 720
build reel-480.mp4 31 854 480

# Poster = the loop's opening frame, at the drift's zero phase so the still and
# the first decoded frame line up and there is no flash when playback starts.
"$FF" -y -hide_banner -loglevel error -i "$FRAMES/key-01.webp" \
  -vf 'scale=1280:720:flags=lanczos' -frames:v 1 -quality 70 "$OUT/reel-poster.webp"

ls -l "$OUT"/reel*.mp4 "$OUT"/reel-poster.webp
