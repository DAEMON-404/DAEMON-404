#!/usr/bin/env bash
# Render the static README graphics (section headers, education cards) from the
# HTML sources in scripts/graphics/ using headless Chrome at 2x device scale.
#
# Usage: scripts/render-graphics.sh            # render everything
#        CHROME=/path/to/chrome scripts/render-graphics.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/scripts/graphics"
OUT_HEADERS="$ROOT/images/daemon-404-section-headers"
OUT_IMAGES="$ROOT/images"

# Locate a Chrome/Chromium binary. Playwright's headless shell is preferred when
# present; otherwise fall back to a desktop Chrome install.
find_chrome() {
  if [[ -n "${CHROME:-}" ]]; then echo "$CHROME"; return; fi
  local pw
  pw="$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell 2>/dev/null | sort | tail -1 || true)"
  if [[ -n "$pw" ]]; then echo "$pw"; return; fi
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "$(command -v google-chrome || true)" "$(command -v chromium || true)"; do
    [[ -n "$c" && -x "$c" ]] && { echo "$c"; return; }
  done
  echo "error: no Chrome binary found; set CHROME=/path/to/chrome" >&2
  exit 1
}
CHROME_BIN="$(find_chrome)"

# render <html-file-or-url> <width> <height> <out.png>
render() {
  local url="$1" w="$2" h="$3" out="$4"
  "$CHROME_BIN" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 --window-size="${w},${h}" \
    --virtual-time-budget=8000 --screenshot="$out" "$url" >/dev/null 2>&1
  echo "  → ${out#$ROOT/}"
}

# header <num> <cmd> <tags> <accent-hex> <outfile>
header() {
  local num="$1" cmd="$2" tags="$3" accent="$4" out="$5"
  local q
  q="cmd=$(printf %s "$cmd" | jq -sRr @uri)&tags=$(printf %s "$tags" | jq -sRr @uri)&num=$num&accent=$(printf %s "$accent" | jq -sRr @uri)"
  render "file://$SRC/section-header.html?$q" 860 80 "$OUT_HEADERS/$out"
}

echo "Rendering section headers"
header 07 education "// ABERTAY // BSC (HONS) // NCSC" "#907aa9" 07-education.png
header 08 contact   "// SIGNAL // MAIL // PGP"         "#ea9d34" 08-contact.png

echo "Rendering education cards"
render "file://$SRC/education-degree.html"  440 280 "$OUT_IMAGES/education-degree.png"
render "file://$SRC/education-modules.html" 440 280 "$OUT_IMAGES/education-modules.png"
render "file://$SRC/education-honours.html" 880 216 "$OUT_IMAGES/education-honours.png"

echo "done"
