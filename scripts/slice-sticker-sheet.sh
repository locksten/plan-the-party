#!/usr/bin/env bash

set -euo pipefail

if (( $# < 4 )); then
  cat >&2 <<'EOF'
Usage: slice-sticker-sheet.sh INPUT OUTPUT_DIR NAME NAME [NAME...]

Removes an edge-connected solid background, finds each sticker by its alpha
component, sorts the stickers left-to-right, and writes tightly cropped PNGs.

The sheet must contain one horizontal row of disconnected stickers. Set FUZZ
to override ImageMagick's background matching tolerance (default: 18%).
EOF
  exit 2
fi

command -v magick >/dev/null || {
  echo "ImageMagick's 'magick' command is required." >&2
  exit 1
}

input=$1
output_dir=$2
shift 2
names=("$@")

[[ -f "$input" ]] || {
  echo "Input sheet does not exist: $input" >&2
  exit 1
}

for name in "${names[@]}"; do
  [[ "$name" =~ ^[a-z0-9-]+$ ]] || {
    echo "Invalid output name '$name'; use lowercase letters, numbers, and hyphens." >&2
    exit 1
  }
done

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT

background=$(magick "$input" -format '%[pixel:p{0,0}]' info:)
keyed="$work_dir/keyed.png"

# Adding a one-pixel border joins the entire edge background before flood-fill.
magick "$input" \
  -alpha on \
  -bordercolor "$background" -border 1 \
  -fuzz "${FUZZ:-18%}" \
  -fill none -draw 'color 0,0 floodfill' \
  -shave 1x1 \
  "$keyed"

mapfile -t components < <(
  magick "$keyed" \
    -alpha extract -threshold 1% \
    -define connected-components:verbose=true \
    -connected-components 8 null: \
    | awk '/srgb\(255,255,255\)$/ {
        split($2, offset, "+");
        print offset[2], $2;
      }' \
    | sort -n \
    | cut -d' ' -f2
)

if (( ${#components[@]} != ${#names[@]} )); then
  echo "Expected ${#names[@]} stickers, found ${#components[@]}. Adjust FUZZ or check the sheet." >&2
  exit 1
fi

mkdir -p "$output_dir"
padding=10
read -r image_width image_height < <(magick identify -format '%w %h\n' "$keyed")

for index in "${!components[@]}"; do
  box=${components[$index]}
  if [[ ! "$box" =~ ^([0-9]+)x([0-9]+)\+([0-9]+)\+([0-9]+)$ ]]; then
    echo "Unexpected component geometry: $box" >&2
    exit 1
  fi

  width=${BASH_REMATCH[1]}
  height=${BASH_REMATCH[2]}
  x=${BASH_REMATCH[3]}
  y=${BASH_REMATCH[4]}

  crop_x=$(( x > padding ? x - padding : 0 ))
  crop_y=$(( y > padding ? y - padding : 0 ))
  crop_right=$(( x + width + padding < image_width ? x + width + padding : image_width ))
  crop_bottom=$(( y + height + padding < image_height ? y + height + padding : image_height ))
  crop_width=$(( crop_right - crop_x ))
  crop_height=$(( crop_bottom - crop_y ))

  cropped="$work_dir/cropped-$index.png"
  magick "$keyed" \
    -crop "${crop_width}x${crop_height}+${crop_x}+${crop_y}" \
    +repage \
    "$cropped"

  # Generated backgrounds can leave tiny disconnected flecks. Preserve only
  # substantial alpha components so they do not become stray sprite pixels.
  magick "$cropped" \
    \( +clone -alpha extract -threshold 1% \
      -define connected-components:area-threshold=5000 \
      -define connected-components:mean-color=true \
      -connected-components 8 \) \
    -alpha off -compose CopyOpacity -composite -strip \
    "$output_dir/${names[$index]}.png"
done
