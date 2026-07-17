#!/usr/bin/env bash

set -euo pipefail

if (( $# != 2 && $# != 4 )); then
  cat >&2 <<'EOF'
Usage: encode-game-art.sh INPUT OUTPUT [WIDTH HEIGHT]

Encodes game artwork using the project's standard lossy WebP settings.
When WIDTH and HEIGHT are provided, the image is resized before encoding.
EOF
  exit 2
fi

command -v cwebp >/dev/null || {
  echo "The 'cwebp' command from libwebp is required." >&2
  exit 1
}

input=$1
output=$2

[[ -f "$input" ]] || {
  echo "Input image does not exist: $input" >&2
  exit 1
}

[[ "$input" != "$output" ]] || {
  echo "Input and output paths must differ." >&2
  exit 1
}

resize_options=()
if (( $# == 4 )); then
  width=$3
  height=$4
  [[ "$width" =~ ^[1-9][0-9]*$ && "$height" =~ ^[1-9][0-9]*$ ]] || {
    echo "WIDTH and HEIGHT must be positive integers." >&2
    exit 1
  }
  resize_options=(-resize "$width" "$height")
fi

cwebp -quiet \
  -preset drawing \
  "${resize_options[@]}" \
  -q 90 \
  -sharp_yuv \
  -af \
  -m 6 \
  -mt \
  -alpha_q 100 \
  -alpha_filter best \
  "$input" \
  -o "$output"
