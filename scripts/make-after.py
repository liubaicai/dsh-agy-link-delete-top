"""Generate docs/after.png from docs/before.png by removing the AGY badge.

The toolbar background varies only vertically (a subtle gradient), so each
row inside the removed region is filled with that row's background colour,
estimated as the median of intact pixels to the right of the badge. This
also erases the badge's soft box-shadow and the stray text at the left edge.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "before.png"
DST = ROOT / "docs" / "after.png"

img = Image.open(SRC).convert("RGB")
arr = np.asarray(img).astype(np.int16)
h, w, _ = arr.shape

# Foreground = pixels deviating from the row's right-side background estimate.
right_med = np.median(arr[:, w - 6:, :], axis=1, keepdims=True)  # (h, 1, 3)
deviation = np.abs(arr - right_med).sum(axis=2)
mask = deviation > 24

rows = np.where(mask.any(axis=1))[0]
cols = np.where(mask.any(axis=0))[0]
if rows.size == 0:
    raise SystemExit("nothing detected to remove")
y0, y1 = int(rows.min()), int(rows.max())
x0, x1 = int(cols.min()), int(cols.max())

# Clean sample window on the same rows, right of the content.
sx0, sx1 = min(x1 + 10, w - 2), w - 2
if sx1 - sx0 < 8:  # fall back to a window left of the content
    sx0, sx1 = max(x0 - 60, 0), max(x0 - 10, 1)
for y in range(y0, y1 + 1):
    row_med = np.median(arr[y, sx0:sx1], axis=0)
    arr[y, :] = row_med

Image.fromarray(arr.astype(np.uint8)).save(DST)
print(f"removed region x=[{x0},{x1}] y=[{y0},{y1}] -> {DST}")
