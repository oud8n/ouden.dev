#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
chrome="${CHROME:-chromium}"

"$chrome" --headless --disable-gpu --no-pdf-header-footer \
	--virtual-time-budget=5000 \
	--print-to-pdf="$root/public/cv.pdf" \
	"file://$root/cv/cv.html"
