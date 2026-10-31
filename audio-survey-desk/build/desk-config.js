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
