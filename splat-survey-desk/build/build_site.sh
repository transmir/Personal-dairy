#!/usr/bin/env bash
# Rebuild splat-survey-desk/index.html from the latest public paper lists.
# Usage: bash splat-survey-desk/build/build_site.sh
set -euo pipefail
cd "$(dirname "$0")"
rm -rf src 3D-Gaussian-Splatting-Papers cv-arxiv-daily
GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 https://github.com/MrNeRF/awesome-3D-gaussian-splatting src
GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 https://github.com/Awesome3DGS/3D-Gaussian-Splatting-Papers
GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 https://github.com/Vincentqyw/cv-arxiv-daily
python3 -c "import yaml" 2>/dev/null || python3 -m pip install -q pyyaml
python3 -I build.py
python3 -I make_page.py
rm -rf src 3D-Gaussian-Splatting-Papers cv-arxiv-daily papers.json
