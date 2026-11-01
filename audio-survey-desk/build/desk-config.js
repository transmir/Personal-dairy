// Configuration for the Audio Classification Desk.
// The page template is shared with splat-survey-desk; this file swaps in the
// audio topics, arXiv queries, venues, classic papers and learning path.
// Topic keys (ff, scene, ...) are the template's 8 colour slots; only the names matter to readers.
(function () {
  const YT = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  const GH = q => 'https://github.com/search?q=' + encodeURIComponent(q) + '&type=repositories&s=stars&o=desc';
  const AX = id => 'https://arxiv.org/abs/' + id;
  const BASE = '(cat:eess.AS OR cat:cs.SD) AND (abs:"audio classification" OR abs:"sound classification" OR abs:"audio tagging" OR abs:"sound event" OR abs:"acoustic scene" OR abs:"audio event")';
  const B = '(cat:eess.AS OR cat:cs.SD)';

  // ── DCASE challenge tab ───────────────────────────────────────
  // Task history is curated by hand; each row links the official year page to check details.
  const DC = 'https://dcase.community/';
  const SCH = t => 'https://scholar.google.com/scholar?q=' + encodeURIComponent('"' + t + '"');
  const SITE = q => 'https://www.google.com/search?q=' + encodeURIComponent('site:dcase.community ' + q);
  // [family key, label, what it is]
  const FAM = [
    ['asc', 'Acoustic scene classification', 'Label a whole recording with the place it was recorded (park, metro, airport…). Later editions add device mismatch, low-complexity limits (parameters, MACs) and data efficiency.'],
    ['sed', 'Sound event detection', 'Find which events happen and when (onset/offset). Domestic SED (DESED) has run since 2018 with weak, strong, synthetic and soft labels.'],
    ['seld', 'Sound event localization and detection', 'Detect events and estimate their direction (and later distance) from multichannel microphone-array or FOA audio.'],
    ['asd', 'Anomalous sound detection', 'Detect machine faults from sound, trained only on normal sounds; later editions add domain shift and first-shot (unseen machine types).'],
    ['tag', 'Audio tagging', 'Clip-level multi-label classification, including noisy labels and urban sound tagging.'],
    ['bio', 'Bioacoustics', 'Bird audio detection and few-shot bioacoustic event detection (find a call type from five examples).'],
    ['lang', 'Captioning, retrieval and language', 'Automated audio captioning, language-based audio retrieval and language-queried source separation.'],
    ['other', 'Other tasks', 'Domestic activity monitoring, sound synthesis, traffic monitoring and more.']
  ];
  // [year, task, family, title, dataset, main metric]
  const TASKS = [
    [2013,'—','asc','Scene classification (IEEE AASP challenge)','DCASE 2013 scenes','accuracy'],
    [2013,'—','sed','Event detection, office live and synthetic','DCASE 2013 office events','frame/event-based F1'],
    [2016,1,'asc','Acoustic scene classification','TUT Acoustic Scenes 2016','accuracy'],
    [2016,2,'sed','Sound event detection in synthetic audio','DCASE 2016 office synthetic','event-based F1'],
    [2016,3,'sed','Sound event detection in real-life audio','TUT Sound Events 2016','segment-based ER / F1'],
    [2016,4,'tag','Domestic audio tagging','CHiME-Home','equal error rate'],
    [2017,1,'asc','Acoustic scene classification','TUT Acoustic Scenes 2017','accuracy'],
    [2017,2,'sed','Detection of rare sound events','TUT Rare Sound Events 2017','event-based ER / F1'],
    [2017,3,'sed','Sound event detection in real-life audio','TUT Sound Events 2017','segment-based ER / F1'],
    [2017,4,'tag','Large-scale weakly supervised SED for smart cars','AudioSet subset','tagging F1, segment-based ER'],
    [2018,1,'asc','Acoustic scene classification (incl. mismatched devices)','TUT Urban Acoustic Scenes 2018 (+ Mobile)','accuracy'],
    [2018,2,'tag','General-purpose audio tagging of Freesound content','FSDKaggle2018','MAP@3'],
    [2018,3,'bio','Bird audio detection','freefield1010, warblrb10k, BirdVox-DCASE-20k','AUC'],
    [2018,4,'sed','Large-scale weakly labeled semi-supervised SED in domestic environments','DCASE 2018 Task 4 (AudioSet-based)','event-based F1'],
    [2018,5,'other','Monitoring of domestic activities','SINS','macro F1'],
    [2019,1,'asc','Acoustic scene classification (device mismatch, open set)','TAU Urban Acoustic Scenes 2019','accuracy'],
    [2019,2,'tag','Audio tagging with noisy labels and minimal supervision','FSDKaggle2019','lwlrap'],
    [2019,3,'seld','Sound event localization and detection','TAU Spatial Sound Events 2019','ER, F1, DOA error, frame recall'],
    [2019,4,'sed','Sound event detection in domestic environments','DESED','event-based F1'],
    [2019,5,'tag','Urban sound tagging','SONYC-UST','micro/macro AUPRC'],
    [2020,1,'asc','ASC: multi-device (1a) and low-complexity (1b)','TAU Urban Acoustic Scenes 2020 Mobile / 3Class','accuracy, log loss, model size'],
    [2020,2,'asd','Unsupervised anomalous sound detection for machine condition monitoring','ToyADMOS, MIMII','AUC, pAUC'],
    [2020,3,'seld','Sound event localization and detection','TAU-NIGENS Spatial Sound Events 2020','location-aware ER / F1'],
    [2020,4,'sed','SED and separation in domestic environments','DESED','event-based F1, PSDS'],
    [2020,5,'tag','Urban sound tagging with spatiotemporal context','SONYC-UST-V2','AUPRC'],
    [2020,6,'lang','Automated audio captioning','Clotho','SPIDEr'],
    [2021,1,'asc','Low-complexity device-robust ASC (1a), audio-visual scenes (1b)','TAU Urban Acoustic Scenes 2020 Mobile, TAU Urban Audio-Visual Scenes 2021','log loss, accuracy'],
    [2021,2,'asd','Unsupervised ASD under domain shift','ToyADMOS2, MIMII DUE','AUC, pAUC'],
    [2021,3,'seld','SELD with directional interference','TAU-NIGENS Spatial Sound Events 2021','location-aware ER / F1'],
    [2021,4,'sed','SED and separation in domestic environments','DESED','PSDS'],
    [2021,5,'bio','Few-shot bioacoustic event detection','DCASE few-shot bioacoustic set','event-based F-measure'],
    [2021,6,'lang','Automated audio captioning','Clotho','SPIDEr'],
    [2022,1,'asc','Low-complexity ASC (1-second clips)','TAU Urban Acoustic Scenes 2022 Mobile','log loss, accuracy, MACs'],
    [2022,2,'asd','Unsupervised ASD with domain generalization','ToyADMOS2, MIMII DG','AUC, pAUC'],
    [2022,3,'seld','SELD in real spatial recordings','STARSS22 + synthetic','location-aware F / ER, DOA error'],
    [2022,4,'sed','SED in domestic environments','DESED','PSDS'],
    [2022,5,'bio','Few-shot bioacoustic event detection','DCASE few-shot bioacoustic set','event-based F-measure'],
    [2022,6,'lang','Audio captioning (6a) and language-based audio retrieval (6b)','Clotho','SPIDEr; mAP@10, R@k'],
    [2023,1,'asc','Low-complexity ASC','TAU Urban Acoustic Scenes 2022 Mobile','accuracy, complexity'],
    [2023,2,'asd','First-shot unsupervised ASD','ToyADMOS2, MIMII DG (new machine types)','AUC, pAUC'],
    [2023,3,'seld','SELD, audio-only and audio-visual','STARSS23','location-aware F / ER, DOA error'],
    [2023,4,'sed','SED with weak labels (4a) and soft labels (4b)','DESED; MAESTRO Real','PSDS; F1 / ER on soft labels'],
    [2023,5,'bio','Few-shot bioacoustic event detection','DCASE few-shot bioacoustic set','event-based F-measure'],
    [2023,6,'lang','Audio captioning (6a) and language-based retrieval (6b)','Clotho','SPIDEr / SPIDEr-FL; mAP@10'],
    [2023,7,'other','Foley sound synthesis','DCASE Foley set','FAD + listening test'],
    [2024,1,'asc','Data-efficient low-complexity ASC','TAU Urban Acoustic Scenes 2022 Mobile (training subsets)','accuracy vs. training-data size'],
    [2024,2,'asd','First-shot unsupervised ASD','ToyADMOS2 / MIMII DG family','AUC, pAUC'],
    [2024,3,'seld','Audio and audio-visual SELD with source distance','STARSS23','location-aware F, DOA and distance error'],
    [2024,4,'sed','SED with heterogeneous training data and missing labels','DESED + MAESTRO','PSDS, mpAUC'],
    [2024,5,'bio','Few-shot bioacoustic event detection','DCASE few-shot bioacoustic set','event-based F-measure'],
    [2024,6,'lang','Automated audio captioning','Clotho','FENSE, SPIDEr-FL'],
    [2024,7,'other','Sound scene synthesis','DCASE scene synthesis set','FAD + listening test'],
    [2024,8,'lang','Language-based audio retrieval','Clotho','mAP@10'],
    [2024,9,'lang','Language-queried audio source separation','Clotho / FSD-based mixtures','SDR'],
    [2024,10,'other','Acoustic-based traffic monitoring','DCASE traffic set','error in vehicle counts']
  ];
  // [family, title, authors, venue, year, why it matters]
  const DPAPERS = [
    ['asc','Detection and Classification of Acoustic Scenes and Events','Stowell, Giannoulis, Benetos, Lagrange, Plumbley','IEEE Trans. Multimedia',2015,'Outcome of the first (2013) challenge; defines the field.'],
    ['sed','Metrics for Polyphonic Sound Event Detection','Mesaros, Heittola, Virtanen','Applied Sciences',2016,'Segment- and event-based ER/F1 used in DCASE (sed_eval).'],
    ['asc','Detection and Classification of Acoustic Scenes and Events: Outcome of the DCASE 2016 Challenge','Mesaros et al.','IEEE/ACM TASLP',2018,'Overview of all 2016 tasks and systems.'],
    ['asc','Acoustic Scene Classification in DCASE 2019 Challenge: Closed and Open Set Classification and Data Mismatch Setups','Mesaros, Heittola, Virtanen','DCASE Workshop',2019,'Task 1 overview: device mismatch and open-set ASC.'],
    ['asc','Receptive-Field-Regularized CNN Variants for Acoustic Scene Classification','Koutini, Eghbal-zadeh, Widmer','DCASE Workshop',2019,'Influential top-ranked ASC architecture.'],
    ['asc','Acoustic Scene Classification in DCASE 2020 Challenge: Generalization Across Devices and Low Complexity Solutions','Heittola, Mesaros, Virtanen','DCASE Workshop',2020,'Task 1 overview introducing low-complexity limits.'],
    ['sed','Sound Event Detection in Domestic Environments with Weakly Labeled Data and Soundscape Synthesis','Turpault, Serizel, Parag Shah, Salamon','DCASE Workshop',2019,'The DESED dataset behind Task 4 since 2019.'],
    ['sed','A Framework for the Robust Evaluation of Sound Event Detection','Bilen, Ferroni, Tuveri, Azcarreta, Krstulović','ICASSP',2020,'PSDS, the main SED metric since 2020.'],
    ['sed','Sound Event Detection: A Tutorial','Mesaros, Serizel, Heittola, Virtanen, Plumbley','IEEE Signal Processing Magazine',2021,'Best single introduction to SED and its evaluation.'],
    ['seld','Sound Event Localization and Detection of Overlapping Sources Using Convolutional Recurrent Neural Networks','Adavanne, Politis, Nikunen, Virtanen','IEEE JSTSP',2019,'SELDnet, the original SELD baseline.'],
    ['seld','Overview and Evaluation of Sound Event Localization and Detection in DCASE 2019','Politis, Mesaros, Adavanne, Heittola, Virtanen','IEEE/ACM TASLP',2021,'SELD task design and metrics.'],
    ['seld','STARSS22: A Dataset of Spatial Recordings of Real Scenes with Spatiotemporal Annotations of Sound Events','Politis et al.','DCASE Workshop',2022,'Real-recording SELD data used from 2022.'],
    ['asd','MIMII Dataset: Sound Dataset for Malfunctioning Industrial Machine Investigation and Inspection','Purohit et al.','DCASE Workshop',2019,'Machine sounds dataset used in Task 2.'],
    ['asd','ToyADMOS: A Dataset of Miniature-Machine Operating Sounds for Anomalous Sound Detection','Koizumi et al.','WASPAA',2019,'Second Task 2 dataset.'],
    ['asd','Description and Discussion on DCASE2020 Challenge Task2: Unsupervised Anomalous Sound Detection for Machine Condition Monitoring','Koizumi et al.','DCASE Workshop',2020,'Task 2 overview and baseline.'],
    ['asd','MIMII DG: Sound Dataset for Malfunctioning Industrial Machine Investigation and Inspection for Domain Generalization Task','Dohi et al.','DCASE Workshop',2022,'Domain-generalization data for ASD.'],
    ['tag','Audio Tagging with Noisy Labels and Minimal Supervision','Fonseca, Plakal, Font, Ellis, Serra','DCASE Workshop',2019,'Task 2 (2019) overview and FSDKaggle2019.'],
    ['tag','Cross-Task Learning for Audio Tagging, Sound Event Detection and Spatial Localization: DCASE 2019 Baseline Systems','Kong, Cao, Iqbal, Xu, Wang, Plumbley','arXiv',2019,'Shared baselines across 2019 tasks.'],
    ['bio','Learning to Detect an Animal Sound from Five Examples','Nolasco et al.','Ecological Informatics',2023,'Few-shot bioacoustic event detection task overview.'],
    ['lang','Clotho: An Audio Captioning Dataset','Drossos, Lipping, Virtanen','ICASSP',2020,'Dataset for captioning and retrieval tasks.']
  ];
  const dcState = { fam: 'all', q: '', live: null, err: '' };
  function dcRender(c) {
    const e = c.esc, fams = dcState.fam === 'all' ? FAM : FAM.filter(f => f[0] === dcState.fam);
    const q = dcState.q.trim().toLowerCase();
    const hit = r => !q || r.join(' ').toLowerCase().includes(q);
    const inDesk = c.P.filter(p => /dcase/i.test(p.t + ' ' + p.ab + ' ' + (p.v || []).join(' '))).length;
    let h = `<section class="panel live"><h2>DCASE challenge</h2>
      <p>The DCASE challenge (Detection and Classification of Acoustic Scenes and Events) runs yearly tasks with shared datasets, baselines and metrics, and a workshop where the task overviews and many systems are published. For a survey, the task overview papers, the datasets and the top-ranked technical reports are the standard citations.</p>
      <div class="row"><a class="btn" href="${DC}" target="_blank" rel="noopener">dcase.community ↗</a>
        <a class="btn" href="https://github.com/DCASE-REPO" target="_blank" rel="noopener">DCASE baselines on GitHub ↗</a>
        <a class="btn" href="${SITE('results technical reports')}" target="_blank" rel="noopener">Results and technical reports ↗</a>
        <button class="btn" data-dc="desk">${inDesk} desk paper${inDesk === 1 ? '' : 's'} mention${inDesk === 1 ? 's' : ''} DCASE</button></div>
      <div class="row" style="margin-top:6px">${[2013,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026].map(y => `<a class="vbtn" href="${DC}challenge${y}/" target="_blank" rel="noopener">${y} ↗</a>`).join('')}</div>
      <p class="note">Task list curated from the official challenge pages up to 2024; for 2025 onward, open the year page. Metrics and datasets are the main ones per task. Check the year page before citing details.</p></section>
      <div class="searchbar"><input type="search" id="dcq" placeholder="Filter tasks and papers, e.g. “DESED”, “low-complexity”, “2022”" value="${e(dcState.q)}" aria-label="Filter DCASE tasks"></div>
      <div class="venuebar">${[['all', 'All task families']].concat(FAM.map(f => [f[0], f[1]])).map(([k, l]) => `<button class="vbtn" data-dcf="${k}" aria-pressed="${dcState.fam === k}">${e(l)}<span class="ct">${k === 'all' ? TASKS.length : TASKS.filter(t => t[2] === k).length}</span></button>`).join('')}</div>`;
    fams.forEach(f => {
      const rows = TASKS.filter(t => t[2] === f[0] && hit(t)).sort((a, b) => a[0] - b[0]);
      const pap = DPAPERS.filter(p => p[0] === f[0] && hit(p));
      if (!rows.length && !pap.length) return;
      h += `<section class="sec"><h2>${e(f[1])}</h2><p class="note">${e(f[2])}</p>`;
      if (rows.length) h += `<div class="tablebox"><table class="found"><thead><tr><th>Year</th><th>Task</th><th>Dataset</th><th>Main metric</th><th>Find papers</th></tr></thead><tbody>${rows.map(r => `<tr><td class="yr"><a href="${DC}challenge${r[0]}/" target="_blank" rel="noopener">${r[0]}</a></td><td><b>${r[1] === '—' ? '' : 'Task ' + r[1] + ' · '}</b>${e(r[3])}</td><td>${e(r[4])}</td><td class="vn">${e(r[5])}</td><td><a href="${SITE('challenge' + r[0] + ' ' + r[3])}" target="_blank" rel="noopener">DCASE site</a> · <a href="https://scholar.google.com/scholar?q=${encodeURIComponent('DCASE ' + r[0] + ' ' + r[3])}" target="_blank" rel="noopener">Scholar</a></td></tr>`).join('')}</tbody></table></div>`;
      if (pap.length) h += `<p class="lab" style="margin-top:6px">Key papers</p><div class="lgrid">${pap.map(p => `<div class="litem"><div style="min-width:0"><a class="ltitle" href="${SCH(p[1])}" target="_blank" rel="noopener">${e(p[1])} ↗</a><div class="p-auth">${e(p[2])}</div><div class="chips"><span class="chip venue">${e(p[3])} ${p[4]}</span></div><p class="lwhy">${e(p[5])}</p></div></div>`).join('')}</div>`;
      h += '</section>';
    });
    h += `<section class="sec"><div class="x-h"><h2>DCASE papers on arXiv</h2><button class="btn primary" id="dcLive">${dcState.live ? 'Refresh' : 'Load newest'}</button></div>
      <p class="note">Newest arXiv papers that mention DCASE in the title, abstract or comments (often challenge systems and workshop papers), through your diary backend.</p>
      <div class="status" id="dcStatus">${e(dcState.err)}</div><div id="dcList">${dcState.live ? (dcState.live.length ? '<div class="list">' + dcState.live.slice(0, 60).map(p => c.card(p)).join('') + '</div>' : '<div class="empty">No papers found.</div>') : ''}</div></section>`;
    return h;
  }
  async function dcLoad(c, force) {
    const s = document.getElementById('dcStatus');
    if (!c.hasBackend()) { dcState.err = 'Live search needs the diary backend; open this desk from the diary site.'; if (s) s.textContent = dcState.err; return; }
    if (!force) { try { const x = JSON.parse(localStorage.getItem(c.SP + 'dcase') || 'null'); if (x && Date.now() - x.at < 6 * 3600e3) { dcState.live = x.items; x.items.forEach(p => c.BYID.set(p.i, p)); c.render(); return; } } catch (e) {} }
    if (s) s.textContent = 'Loading DCASE papers from arXiv…';
    try {
      const items = await c.backendArxiv('abs:DCASE OR ti:DCASE OR co:DCASE', 100, 0);
      items.forEach(p => { p.k = p.k && p.k.length ? p.k : []; c.BYID.set(p.i, p); });
      dcState.live = items; dcState.err = items.length + (items.length === 1 ? ' paper' : ' papers') + ' · fetched ' + new Date().toLocaleString();
      try { localStorage.setItem(c.SP + 'dcase', JSON.stringify({ at: Date.now(), items })); } catch (e) {}
    } catch (e) { dcState.err = 'Could not load DCASE papers: ' + e.message; }
    c.render();
  }

  window.DESK = {
    allLabel: 'All audio classification',
    surveyDesc: 'a survey on audio classification (audio tagging and environmental sound classification, acoustic scene classification, sound event detection, audio transformers and pretrained models, zero/few-shot and audio-language models, efficient on-device models, self-supervised audio representations, and bioacoustics / music / speech classification)',
    baseline: 'standard CNN / transformer audio classifiers such as PANNs and AST',
    blockHints: 'e.g. resampling, STFT / log-mel spectrogram, SpecAugment or mixup augmentation, CNN or transformer backbone, temporal pooling, classification head, BCE / cross-entropy loss, pretraining on AudioSet',
    loopHint: 'e.g. teacher-student distillation, pseudo-labelling or self-training loops',
    edgeHint: 'e.g. "waveform", "log-mel spectrogram", "patch embeddings", "class logits"',
    datasetEg: 'AudioSet, ESC-50, UrbanSound8K, FSD50K, DCASE TAU Urban Acoustic Scenes, Speech Commands',
    metricEg: 'mAP, accuracy, macro F1, PSDS, d-prime, parameters, MACs, latency',
    viewsLabel: 'Input setting',
    viewsDesc: "input setting: clip length, sample rate and features, e.g. '10 s clips at 32 kHz, 128 log-mel bins' or 'raw waveform, 16 kHz'",
    compareDims: '"Input features", "Model architecture", "Pretraining / training data", "Supervision and losses", "Label setting (supervised, weak, zero-shot)", "Efficiency", "Task and output"',
    compareExtra: 'e.g. "Temporal resolution", "Handles polyphony", "Robustness to domain shift", "On-device suitability"',
    searchEg: 'Search title, abstract, authors, venue… e.g. “sound event detection”, “CLAP”, “ICASSP 2026”',
    latestNote: 'Papers on this desk come live from arXiv through your diary backend: up to 1,000 of the newest audio classification papers in eess.AS and cs.SD, refreshed every 6 hours.',
    listLabel: 'Live from arXiv, newest first',
    noLiveChip: true,
    storePrefix: 'acd-',
    views: [{ id: 'dcase', label: 'DCASE challenge', render: dcRender, bind: c => {
      const q = document.getElementById('dcq');
      if (q) { q.addEventListener('input', () => { dcState.q = q.value; clearTimeout(dcState.t); dcState.t = setTimeout(() => { const pos = q.selectionStart; c.render(); const n = document.getElementById('dcq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 250); }); }
      document.querySelectorAll('[data-dcf]').forEach(b => b.onclick = () => { dcState.fam = b.dataset.dcf; c.render(); });
      const d = document.querySelector('[data-dc="desk"]'); if (d) d.onclick = () => c.go('latest', 'DCASE');
      const l = document.getElementById('dcLive'); if (l) l.onclick = () => dcLoad(c, true);
      if (!dcState.live && !dcState.tried) { dcState.tried = true; dcLoad(c, false); }
    } }],
    listings: [['eess.AS','new','Today’s eess.AS listing'],['cs.SD','recent','cs.SD recent']],
    srcNote: 'Papers load live from arXiv (eess.AS and cs.SD) through the diary backend. Topic tags are assigned by keyword rules, so check borderline papers.',
    freshPages: 5,
    noBlender: true,
    fileName: 'audio-classification-desk.html',
    learnLabel: 'Audio learning path',
    learnIntro: 'Free courses, books, tutorials and code in the order to take them: signal processing, then audio features, then deep learning, then audio models and pretraining, then one deep dive per survey topic.',
    oldLabel: 'Pre-deep-learning roots',
    oldQuery: q => q,
    oldKwTitle: 'Older audio keywords to try',
    oldKwNote: 'Pre-deep-learning terms for the same problems.',
    oldKeywords: ['MFCC','Gaussian mixture model','hidden Markov model sound event','i-vector','bag of audio words','non-negative matrix factorization sound','acoustic event detection','audio fingerprinting','timbre features','zero-crossing rate','onset detection','spectrogram image features','computational auditory scene analysis','auditory scene analysis'],
    dblpNote: 'DBLP indexes every edition of these venues back to their first year. Good for finding older signal-processing work on the same idea.',
    extraSearch: (qd, enc) => [
      ['ISCA Archive (Interspeech)', 'https://www.google.com/search?q=' + enc('site:isca-archive.org ' + qd), 'Interspeech papers'],
      ['DCASE workshop and challenge', 'https://www.google.com/search?q=' + enc('site:dcase.community ' + qd), 'Challenge reports and workshop papers'],
      ['IEEE Xplore', 'https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=' + enc(qd), 'ICASSP, TASLP, SPL']
    ],
    topics: [
      {k:'ff',      n:'Audio tagging & sound classification'},
      {k:'scene',   n:'Acoustic scene classification'},
      {k:'surf',    n:'Sound event detection'},
      {k:'dyn',     n:'Audio transformers & pretrained models'},
      {k:'sparse',  n:'Zero/few-shot & audio-language'},
      {k:'fast',    n:'Efficient & on-device models'},
      {k:'compact', n:'Self-supervised representations'},
      {k:'mesh',    n:'Bioacoustics, music & speech'}
    ],
    arxivQ: {
      all: BASE,
      ff: B + ' AND (abs:"audio tagging" OR abs:"environmental sound" OR abs:"sound classification" OR abs:AudioSet OR abs:"ESC-50")',
      scene: B + ' AND (abs:"acoustic scene" OR abs:"scene classification")',
      surf: B + ' AND (abs:"sound event detection" OR abs:"event detection" OR abs:"polyphonic")',
      dyn: B + ' AND (abs:transformer OR abs:"pretrained" OR abs:"pre-trained") AND (abs:"audio classification" OR abs:"audio tagging")',
      sparse: B + ' AND (abs:"zero-shot" OR abs:"few-shot" OR abs:CLAP OR abs:"audio-language" OR abs:"language model")',
      fast: B + ' AND (abs:efficient OR abs:"on-device" OR abs:"low-complexity" OR abs:"knowledge distillation" OR abs:edge) AND (abs:classification OR abs:tagging)',
      compact: B + ' AND (abs:"self-supervised" OR abs:"representation learning" OR abs:"masked") AND (abs:audio)',
      mesh: B + ' AND (abs:bioacoustic OR abs:"bird" OR abs:"music genre" OR abs:"instrument recognition" OR abs:"speech emotion" OR abs:"speaker")'
    },
    plainQ: {all:'audio classification', ff:'audio tagging environmental sound classification', scene:'acoustic scene classification', surf:'sound event detection', dyn:'audio spectrogram transformer pretrained', sparse:'zero-shot audio classification CLAP', fast:'efficient audio classification on-device', compact:'self-supervised audio representation learning', mesh:'bioacoustics music speech classification'},
    topicRx: {
      ff: 'audio tagging|environmental sound|sound classification|audio classification|audioset|esc-50|urbansound|fsd50k|general-purpose audio',
      scene: 'acoustic scene|scene classification|\\bASC\\b|tau urban|device mismatch',
      surf: 'sound event detection|\\bSED\\b|event detection|polyphonic|onset|offset|temporal localization|frame-level|strong label|weak label|psds',
      dyn: 'transformer|\\bAST\\b|pretrain|pre-train|foundation model|\\bBEATs\\b|\\bPANNs?\\b|htsat|hts-at|passt|large-scale',
      sparse: 'zero-shot|few-shot|\\bCLAP\\b|audio-language|language model|text-audio|prompt|open-vocabulary|captioning|\\bLLM',
      fast: 'efficient|on-device|low-complexity|lightweight|knowledge distillation|mobile|edge|latency|quantiz|prun|tiny|real-time|\\bMACs?\\b',
      compact: 'self-supervised|self supervised|representation learning|contrastive|masked|\\bSSL\\b|byol|wav2vec|hubert|data2vec',
      mesh: 'bioacoustic|bird|animal|whale|bat|insect|music|genre|instrument|speech emotion|emotion recognition|speaker|keyword spotting|medical|cough|heart sound|respiratory'
    },
    venues: [
      ['ICASSP','IEEE Intl. Conf. on Acoustics, Speech and Signal Processing','conf/icassp'],
      ['Interspeech','Annual Conference of the ISCA','conf/interspeech'],
      ['DCASE','Detection and Classification of Acoustic Scenes and Events workshop','conf/dcase'],
      ['WASPAA','IEEE Workshop on Applications of Signal Processing to Audio and Acoustics','conf/waspaa'],
      ['TASLP','IEEE/ACM Trans. Audio, Speech and Language Processing','journals/taslp'],
      ['IEEE SPL','IEEE Signal Processing Letters','journals/spl'],
      ['EUSIPCO','European Signal Processing Conference','conf/eusipco'],
      ['ISMIR','Intl. Society for Music Information Retrieval','conf/ismir'],
      ['NeurIPS','Neural Information Processing Systems','conf/nips'],
      ['ICLR','International Conference on Learning Representations','conf/iclr'],
      ['ICML','International Conference on Machine Learning','conf/icml'],
      ['AAAI','AAAI Conference on Artificial Intelligence','conf/aaai'],
      ['ACM MM','ACM Multimedia','conf/mm'],
      ['JASA','Journal of the Acoustical Society of America','journals/jasa']
    ],
    classics: [
      ['ff','Comparison of Parametric Representations for Monosyllabic Word Recognition (MFCCs)','Davis, Mermelstein','IEEE TASSP',1980],
      ['mesh','Musical Genre Classification of Audio Signals','Tzanetakis, Cook','IEEE TSAP',2002],
      ['ff','Environmental Sound Recognition With Time–Frequency Audio Features','Chu, Narayanan, Kuo','IEEE TASLP',2009],
      ['ff','A Dataset and Taxonomy for Urban Sound Research (UrbanSound8K)','Salamon, Jacoby, Bello','ACM MM',2014],
      ['ff','ESC: Dataset for Environmental Sound Classification','Piczak','ACM MM',2015],
      ['ff','Environmental Sound Classification with Convolutional Neural Networks','Piczak','IEEE MLSP',2015],
      ['compact','SoundNet: Learning Sound Representations from Unlabeled Video','Aytar, Vondrick, Torralba','NeurIPS',2016],
      ['ff','Audio Set: An Ontology and Human-Labeled Dataset for Audio Events','Gemmeke et al.','ICASSP',2017],
      ['ff','CNN Architectures for Large-Scale Audio Classification','Hershey et al.','ICASSP',2017],
      ['ff','Deep Convolutional Neural Networks and Data Augmentation for Environmental Sound Classification','Salamon, Bello','IEEE SPL',2017],
      ['surf','Convolutional Recurrent Neural Networks for Polyphonic Sound Event Detection','Çakır, Parascandolo, Heittola, Huttunen, Virtanen','IEEE TASLP',2017],
      ['scene','Detection and Classification of Acoustic Scenes and Events: Outcome of the DCASE 2016 Challenge','Mesaros et al.','IEEE TASLP',2018],
      ['ff','mixup: Beyond Empirical Risk Minimization','Zhang, Cisse, Dauphin, Lopez-Paz','ICLR',2018],
      ['ff','SpecAugment: A Simple Data Augmentation Method for Automatic Speech Recognition','Park et al.','Interspeech',2019],
      ['sparse','Prototypical Networks for Few-shot Learning','Snell, Swersky, Zemel','NeurIPS',2017],
      ['dyn','PANNs: Large-Scale Pretrained Audio Neural Networks for Audio Pattern Recognition','Kong et al.','IEEE TASLP',2020],
      ['compact','wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations','Baevski, Zhou, Mohamed, Auli','NeurIPS',2020],
      ['dyn','AST: Audio Spectrogram Transformer','Gong, Chung, Glass','Interspeech',2021],
      ['mesh','BirdNET: A Deep Learning Solution for Avian Diversity Monitoring','Kahl, Wood, Eibl, Klinck','Ecological Informatics',2021],
      ['ff','FSD50K: An Open Dataset of Human-Labeled Sound Events','Fonseca, Favory, Pons, Font, Serra','IEEE TASLP',2022],
      ['dyn','HTS-AT: A Hierarchical Token-Semantic Audio Transformer for Sound Classification and Detection','Chen et al.','ICASSP',2022],
      ['fast','Efficient Training of Audio Transformers with Patchout (PaSST)','Koutini, Schlüter, Eghbal-zadeh, Widmer','Interspeech',2022],
      ['compact','SSAST: Self-Supervised Audio Spectrogram Transformer','Gong, Lai, Chung, Glass','AAAI',2022],
      ['compact','Masked Autoencoders that Listen (Audio-MAE)','Huang et al.','NeurIPS',2022],
      ['sparse','Wav2CLIP: Learning Robust Audio Representations from CLIP','Wu, Seetharaman, Kumar, Bello','ICASSP',2022],
      ['sparse','CLAP: Learning Audio Concepts from Natural Language Supervision','Elizalde, Deshmukh, Al Ismail, Wang','ICASSP',2023],
      ['sparse','Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation (LAION-CLAP)','Wu et al.','ICASSP',2023],
      ['fast','Efficient Large-Scale Audio Tagging via Transformer-to-CNN Knowledge Distillation','Schmid, Koutini, Widmer','ICASSP',2023],
      ['dyn','BEATs: Audio Pre-Training with Acoustic Tokenizers','Chen et al.','ICML',2023]
    ],
    learn: [
      {s:'Math and signal processing', d:'Sampling, Fourier transforms and filters. Every audio model starts from a waveform and usually a spectrogram.', items:[
        ['Essence of Linear Algebra','3Blue1Brown','Video series','Beginner','https://www.3blue1brown.com/topics/linear-algebra','Vectors, matrices and change of basis.'],
        ['But what is the Fourier Transform?','3Blue1Brown','Video','Beginner',YT('3Blue1Brown Fourier transform visual introduction'),'The clearest visual introduction to frequency. Opens a YouTube search.'],
        ['Think DSP','Allen B. Downey','Free book + code','Beginner','https://greenteapress.com/wp/think-dsp/','Digital signal processing in Python: spectra, filters, the DFT.'],
        ['Mathematics for Machine Learning','Deisenroth, Faisal, Ong','Free book','Beginner','https://mml-book.github.io/','Probability, optimisation and matrix calculus for ML.']
      ]},
      {s:'Audio features and tools', d:'Turning sound into features: STFT, mel scale, MFCCs, and the libraries that compute them.', items:[
        ['Audio Signal Processing for Machine Learning (Valerio Velardo)','The Sound of AI','Video course','Beginner',YT('Valerio Velardo audio signal processing for machine learning'),'Spectrograms, MFCCs and audio features step by step. Opens a YouTube search.'],
        ['librosa documentation and examples','librosa','Library docs','Beginner','https://librosa.org/doc/latest/index.html','Load audio, compute mel spectrograms and MFCCs in Python.'],
        ['torchaudio documentation','PyTorch','Library docs','Beginner','https://pytorch.org/audio/stable/index.html','Audio I/O, transforms and datasets inside PyTorch.'],
        ['Fundamentals of Music Processing (notebooks)','Meinard Müller','Book + notebooks','Intermediate',GH('FMP notebooks Meinard Muller'),'Fourier analysis, chroma and onsets with runnable notebooks. Opens a GitHub search.']
      ]},
      {s:'Deep learning foundations', d:'Enough deep learning to train and read audio models.', items:[
        ['Dive into Deep Learning','d2l.ai','Free book + code','Beginner','https://d2l.ai/','CNNs, RNNs, attention and transformers with PyTorch code.'],
        ['CS231n: Deep Learning for Computer Vision','Stanford University','Course','Beginner','https://cs231n.stanford.edu/','CNN fundamentals that transfer directly to spectrograms.'],
        ['PyTorch tutorials','PyTorch','Tutorials','Beginner','https://pytorch.org/tutorials/','Datasets, training loops and custom models.'],
        ['Neural Networks: Zero to Hero (Andrej Karpathy)','Andrej Karpathy','Video series','Beginner',YT('Andrej Karpathy neural networks zero to hero micrograd'),'Backpropagation and transformers built by hand. Opens a YouTube search.']
      ]},
      {s:'Audio classification core', d:'Datasets, baselines and the models every audio classification paper compares against.', items:[
        ['Hugging Face Audio Course','Hugging Face','Course','Beginner','https://huggingface.co/learn/audio-course','Audio data, pretrained models and fine-tuning an audio classifier end to end.'],
        ['ESC-50 dataset','Karol Piczak','Dataset','Beginner','https://github.com/karolpiczak/ESC-50','The standard small benchmark: 2,000 clips, 50 classes, 5 folds.'],
        ['AudioSet','Google Research','Dataset','Intermediate','https://research.google.com/audioset/','The large-scale ontology and dataset most models pretrain on.'],
        ['PANNs paper','Kong et al.','Paper','Intermediate',AX('1912.10211'),'Large-scale pretrained CNNs for audio tagging; a standard baseline.'],
        ['PANNs code','Qiuqiang Kong','Code','Intermediate','https://github.com/qiuqiangkong/audioset_tagging_cnn','Training and inference code for PANNs.'],
        ['AST paper','Gong, Chung, Glass','Paper','Intermediate',AX('2104.01778'),'The Audio Spectrogram Transformer.'],
        ['AST code','Yuan Gong','Code','Intermediate','https://github.com/YuanGongND/ast','Fine-tune AST on ESC-50, Speech Commands and AudioSet.'],
        ['SpecAugment paper','Park et al.','Paper','Beginner',AX('1904.08779'),'The augmentation used by almost every spectrogram model.']
      ]},
      {s:'Deep dives for your survey topics', d:'One starting point per topic.', items:[
        ['DCASE challenge','DCASE community','Challenge + workshop','Intermediate','https://dcase.community/','Tasks, baselines and results for scene classification, event detection and more.','scene'],
        ['Polyphonic sound event detection with CRNNs','Çakır et al.','Paper','Advanced','https://scholar.google.com/scholar?q=%22Convolutional+Recurrent+Neural+Networks+for+Polyphonic+Sound+Event+Detection%22','The classic SED architecture.','surf'],
        ['HTS-AT paper','Chen et al.','Paper','Advanced',AX('2202.00874'),'Hierarchical token-semantic audio transformer for tagging and detection.','dyn'],
        ['BEATs paper','Chen et al.','Paper','Advanced',AX('2212.09058'),'Audio pretraining with acoustic tokenizers.','dyn'],
        ['LAION-CLAP code','LAION','Code','Advanced','https://github.com/LAION-AI/CLAP','Contrastive language-audio pretraining for zero-shot classification.','sparse'],
        ['PaSST paper','Koutini et al.','Paper','Advanced',AX('2110.05069'),'Efficient audio transformer training with patchout.','fast'],
        ['Audio-MAE paper','Huang et al.','Paper','Advanced',AX('2207.06405'),'Masked autoencoders for self-supervised audio representations.','compact'],
        ['SSAST paper','Gong et al.','Paper','Advanced',AX('2110.09784'),'Self-supervised audio spectrogram transformer.','compact'],
        ['BirdNET','Cornell Lab of Ornithology','Code','Intermediate',GH('BirdNET-Analyzer'),'Bird sound identification used in real ecology work. Opens a GitHub search.','mesh']
      ]},
      {s:'Hands-on tools', d:'Listen, label and inspect audio yourself.', items:[
        ['Audacity','Audacity','Desktop app','Beginner','https://www.audacityteam.org/','Record, cut and view spectrograms of audio.'],
        ['Sonic Visualiser','Queen Mary University of London','Desktop app','Beginner','https://www.sonicvisualiser.org/','Inspect spectrograms and annotate audio.'],
        ['Hugging Face audio classification models','Hugging Face','Model hub','Beginner','https://huggingface.co/models?pipeline_tag=audio-classification','Try pretrained audio classifiers in the browser.']
      ]}
    ]
  };
})();
