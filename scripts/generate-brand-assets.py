"""Generate checked-in icons from favicon.svg using Python 3 and ImageMagick.

Run from any directory: python scripts/generate-brand-assets.py
Requires ImageMagick's `magick` command and Pillow with WOFF2 font support.
"""

import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PUBLIC = Path(__file__).resolve().parents[1] / "public"
FONT = PUBLIC.parent / "src/assets/fonts/nunito/nunito-latin-wght-normal.woff2"
CREAM = "#FFF8E7"
SVG = ET.parse(PUBLIC.parent / "src/assets/ui/favicon.svg").getroot()
DOTS = "".join(ET.tostring(circle, encoding="unicode") for circle in SVG)


def cluster(cx, cy, width):
    return (
        f'<g transform="translate({cx} {cy}) scale({width / 16}) '
        f'translate(-8 -8)">{DOTS}</g>'
    )


def render(markup, output, width, height):
    source = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" '
        f'height="{height}" viewBox="0 0 {width} {height}">'
        f"{markup}</svg>"
    )
    subprocess.run(
        [
            "magick",
            "-background",
            "none",
            "-density",
            "192",
            "svg:-",
            "-resize",
            f"{width}x{height}",
            str(output),
        ],
        input=source,
        text=True,
        check=True,
    )


for name, size, fraction in [
    ("apple-touch-icon.png", 180, 0.7),
    ("icon-192.png", 192, 0.7),
    ("icon-512.png", 512, 0.7),
    # All dots fit comfortably within the centered 80%-diameter safe circle.
    ("icon-maskable-512.png", 512, 0.6),
]:
    render(
        f'<rect width="{size}" height="{size}" fill="{CREAM}"/>'
        + cluster(size / 2, size / 2, size * fraction),
        PUBLIC / name,
        size,
        size,
    )

with tempfile.TemporaryDirectory() as directory:
    frames = []
    for size in [16, 32, 48]:
        frame = Path(directory) / f"{size}.png"
        render(cluster(size / 2, size / 2, size), frame, size, size)
        frames.append(str(frame))
    subprocess.run(["magick", *frames, str(PUBLIC / "favicon.ico")], check=True)

render(
    f'<rect width="1200" height="630" fill="{CREAM}"/>'
    + cluster(600, 238, 210),
    PUBLIC / "og-image.png",
    1200,
    630,
)

# Pillow reads the bundled variable webfont directly, without a system font.
font = ImageFont.truetype(str(FONT), 64)
font.set_variation_by_axes([700])
with Image.open(PUBLIC / "og-image.png") as sharing_image:
    ImageDraw.Draw(sharing_image).text(
        (600, 435), "Plan the Party", font=font, fill="#17233F", anchor="ms",
    )
    sharing_image.save(PUBLIC / "og-image.png")
