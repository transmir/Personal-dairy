# Splat Survey Desk

A single-page research desk for a survey on 3D Gaussian splatting. Open `index.html` in a browser; it needs no server or install.

## What's inside

- **Latest arXiv:** about 3,000 Gaussian splatting papers, newest first, sorted into 8 survey topics. These are feed-forward 3DGS, scene-specific 3DGS, surface reconstruction, 4D/dynamic, sparse-view, real-time / fast training, Gaussian compaction, and meshes + Gaussians. The **Fetch live from arXiv** button loads the 50 newest papers for a topic.
- **Accepted at venues:** papers accepted at CVPR, ICCV, ECCV, NeurIPS, ICLR, SIGGRAPH, 3DV, AAAI and others.
- **Classic papers:** older geometry and vision papers that each topic builds on.
- **Search conferences:** links to arXiv, Google Scholar, Semantic Scholar, OpenReview, CVF, ACM DL and DBLP for each venue.
- **Compare:** papers side by side, with Markdown export.
- **Learn:** a from-scratch 3DGS learning path and a 90-day Blender plan.
- **Reading list:** a starred list with BibTeX export.

Ticks, the reading list and saved explanations are stored in your browser only (`localStorage`).

## Features that need claude.ai

The per-paper summary and method diagram, the experiment details read from a PDF, and "Compare with Claude" all call Claude. These run only when the page is opened as a Claude artifact on claude.ai. In this standalone copy those panels show the abstract and links instead.

## Rebuilding the paper list

```bash
bash splat-survey-desk/build/build_site.sh
```

The script downloads three public paper lists and regenerates `index.html` with today's snapshot date. It needs `git`, `python3` and `pyyaml`. The three lists are:

- [MrNeRF/awesome-3D-gaussian-splatting](https://github.com/MrNeRF/awesome-3D-gaussian-splatting)
- [Awesome3DGS/3D-Gaussian-Splatting-Papers](https://github.com/Awesome3DGS/3D-Gaussian-Splatting-Papers), the source of the venue lists
- [Vincentqyw/cv-arxiv-daily](https://github.com/Vincentqyw/cv-arxiv-daily)

The page layout and code live in `build/template.html`. Topic tags come from keyword rules in `build/build.py`.
