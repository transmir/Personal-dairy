# Audio Classification Desk

A research desk for a survey on audio classification. It uses the same page as the [Splat Survey Desk](../splat-survey-desk/) with its own topics, arXiv queries, venues, classic papers and learning path.

In the diary, open **Research Desk** in the sidebar (or **More** on a phone). Person 1 sees the Gaussian Splatting desk and Person 2 sees this desk by default. Either person can switch desks with the **Desk** menu, and the choice is remembered for each person.

## Where the papers come from

This desk has no built-in snapshot. Each time it opens, it loads up to 1,000 of the newest audio classification papers from arXiv (eess.AS and cs.SD) through the diary's Apps Script backend (`backend/Code.gs`, action `arxiv`). Results are cached in the browser for 6 hours. If the backend has not been redeployed with the `arxiv` action, the desk shows a message and no papers.

## Topics

Audio tagging and sound classification; acoustic scene classification; sound event detection; audio transformers and pretrained models; zero/few-shot and audio-language models; efficient and on-device models; self-supervised representations; bioacoustics, music and speech.

## Editing and rebuilding

- Topics, keyword rules, queries, venues, classic papers and the learning path: `build/desk-config.js`
- Page layout and code (shared with the Splat desk): `../splat-survey-desk/build/template.html`

To rebuild `index.html` after changing either file:

```bash
python3 audio-survey-desk/build/make_page.py
```
