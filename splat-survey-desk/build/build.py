import re, os, json, glob, yaml, sys
S = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(S, '3D-Gaussian-Splatting-Papers')
P = {}  # arxiv id -> paper

def arx(s):
    m = re.search(r'(\d{4}\.\d{4,5})', s or '')
    return m.group(1) if m else None

def get(i):
    return P.setdefault(i, {'id': i, 'v': set(), 'tg': set()})

VEN_RE = re.compile(r'\b(CVPR|ICCV|ECCV|NeurIPS|ICLR|ICML|SIGGRAPH Asia|SIGGRAPH|3DV|AAAI|TPAMI|T-PAMI|WACV|BMVC|ICRA|IROS|ACM MM|ACMMM|TOG|IJCV|TVCG|Eurographics|TIP|RA-L|CoRL|RSS|MICCAI|ISMAR|IEEE VR|Pacific Graphics)\s*[\'’]?(20\d\d|\d\d)\b')
def norm_ven(n, y):
    n = {'T-PAMI': 'TPAMI', 'ACMMM': 'ACM MM'}.get(n, n)
    y = y if len(y) == 4 else '20' + y
    return f'{n} {y}'

# --- Awesome3DGS markdown lists
entry_re = re.compile(r'^#### \[\d+\] (.+?)\n(.*?)(?=^#### |\Z)', re.S | re.M)
for f in glob.glob(A + '/*.md') + glob.glob(A + '/archive/*.md') + glob.glob(A + '/20*/*.md'):
    rel = os.path.relpath(f, A)
    venue = None
    m = re.match(r'(20\d\d)/(\w+)\.md', rel)
    if m and m.group(2) != 'Accepted':
        name = {'ACMMM': 'ACM MM'}.get(m.group(2), m.group(2))
        venue = f'{name} {m.group(1)}'
    txt = open(f, encoding='utf8').read()
    for em in entry_re.finditer(txt):
        title, body = em.group(1).strip(), em.group(2)
        i = arx(re.search(r'arXiv:[\d.]+', body).group(0)) if re.search(r'arXiv:[\d.]+', body) else None
        if not i: continue
        p = get(i)
        p['t'] = title
        a = re.search(r'作者\*\*[：:]\s*(.+)', body)
        if a: p['a'] = a.group(1).strip()
        u = re.search(r'单位\*\*[：:]\s*(.+)', body)
        if u: p['org'] = u.group(1).replace(' ⟐ ', '; ').strip()
        c = re.search(r'\[\[Code\]\((https?://[^)]+)\)\]', body)
        if c: p['c'] = c.group(1)
        n = re.search(r'说明\*\*[：:]\s*(.*)', body)
        note = n.group(1) if n else ''
        if venue: p['v'].add(venue)
        for vm in VEN_RE.finditer(note): p['v'].add(norm_ven(*vm.groups()))
        if 'Survey' in rel: p['tg'].add('Survey')
for f in glob.glob(A + '/abs/*.md'):
    i = arx(os.path.basename(f))
    if not i: continue
    parts = open(f, encoding='utf8').read().split('\n\n')
    p = get(i)
    if len(parts) > 1:
        p.setdefault('t', parts[0].lstrip('# ').strip())
        p['ab'] = parts[1].strip()

# --- MrNeRF yaml
for e in yaml.safe_load(open(os.path.join(S, 'src/awesome_3dgs_papers.yaml'), encoding='utf8')):
    i = arx(e.get('paper') or '')
    if not i: continue
    p = get(i)
    p.setdefault('t', ' '.join(str(e['title']).split()))
    p.setdefault('a', e.get('authors'))
    if e.get('abstract') and not p.get('ab'): p['ab'] = ' '.join(e['abstract'].split())
    if e.get('code') and not p.get('c'): p['c'] = e['code']
    if e.get('project_page'): p['pp'] = e['project_page']
    if e.get('publication_date'): p['d'] = e['publication_date'][:10]
    for t in e.get('tags') or []:
        if t not in ('Project', 'Code', 'Video') and not t.startswith('Year'): p['tg'].add(t)

# --- cv-arxiv-daily (newest papers)
row = re.compile(r'^\|\*\*(\d{4}-\d\d-\d\d)\*\*\|\*\*(.+?)\*\*\|(.+?)\|\[([\d.]+)\]\(.+?\)\|(.*)\|$', re.M)
D = os.path.join(S, 'cv-arxiv-daily')
for f in [D + '/README.md'] + glob.glob(D + '/docs/archive/2026/*.md'):
    txt = open(f, encoding='utf8').read()
    for sec in re.split(r'^## ', txt, flags=re.M):
        head = sec.split('\n', 1)[0]
        if not re.match(r'(Gaussian Splatting|3D Reconstruction|NeRF)', head): continue
        for d, t, au, i, code in row.findall(sec):
            if head.startswith('NeRF') and not re.search(r'gaussian|splat|3dgs', t, re.I): continue
            p = get(i); p.setdefault('t', t); p.setdefault('a', au.replace(' et.al.', ' et al.'))
            p['d'] = d
            cm = re.search(r'\((https://github[^)]+)\)', code)
            if cm and not p.get('c'): p['c'] = cm.group(1)

# --- arXiv API: newest papers straight from arXiv (skipped if arXiv is unreachable)
def fetch_arxiv(max_total=1500, page=200):
    import urllib.request, urllib.parse, time, xml.etree.ElementTree as ET, ssl
    ns = {'a': 'http://www.w3.org/2005/Atom', 'x': 'http://arxiv.org/schemas/atom'}
    ctx = None
    for ca in ('/root/.ccr/ca-bundle.crt',):
        if os.path.exists(ca): ctx = ssl.create_default_context(cafile=ca)
    q = 'abs:"gaussian splatting" OR ti:"gaussian splatting" OR abs:3DGS OR abs:"gaussian splats"'
    got = 0
    for start in range(0, max_total, page):
        url = 'https://export.arxiv.org/api/query?' + urllib.parse.urlencode({'search_query': q, 'sortBy': 'submittedDate', 'sortOrder': 'descending', 'start': start, 'max_results': page})
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'splat-survey-desk/1.0'}), timeout=60, context=ctx) as r:
                root = ET.fromstring(r.read())
        except Exception as e:
            print('arXiv API not reachable, skipping live arXiv step:', e, file=sys.stderr); return got
        entries = root.findall('a:entry', ns)
        if not entries: break
        for en in entries:
            i = arx(en.findtext('a:id', '', ns))
            if not i: continue
            p = get(i)
            p.setdefault('t', ' '.join(en.findtext('a:title', '', ns).split()))
            if not p.get('a'): p['a'] = ', '.join(x.findtext('a:name', '', ns) for x in en.findall('a:author', ns))
            if not p.get('ab'): p['ab'] = ' '.join(en.findtext('a:summary', '', ns).split())
            if not p.get('d') or len(p['d']) < 10: p['d'] = en.findtext('a:published', '', ns)[:10]
            com = en.findtext('x:comment', '', ns) or ''
            for vm in VEN_RE.finditer(com): p['v'].add(norm_ven(*vm.groups()))
            cm = re.search(r'https?://github\.com/[\w.-]+/[\w.-]+', com + ' ' + p.get('ab', ''))
            if cm and not p.get('c'): p['c'] = cm.group(0).rstrip('.')
            got += 1
        if len(entries) < page: break
        time.sleep(3)  # arXiv API etiquette
    return got
if os.environ.get('SKIP_ARXIV') != '1':
    print('arXiv API papers:', fetch_arxiv(), file=sys.stderr)

# --- topic classification
TOP = {
 'ff': (r'feed[- ]?forward|generali[sz]able|pixelsplat|mvsplat|pose[- ]free|unposed|single[- ]image to 3d|image-to-3d|large reconstruction model|\bLRM\b|one forward pass|single forward|zero-shot (3d|reconstruction)|amortized', {'Feed-Forward'}),
 'scene': (r'per-scene|scene[- ]specific|novel view synthesis|densification|anti-?alias|view-dependent|reflect|specular|unbounded|large-scale|in the wild|city|aerial|optimi[sz]ation of 3d gaussian|rendering quality|floaters', {'Rendering', 'Densification', 'Antialiasing', 'Large-Scale', 'In the Wild', 'Optimization', 'Ray Tracing', 'Perspective-correct'}),
 'surf': (r'surface reconstruction|\bsdf\b|signed distance|2dgs|2d gaussian|geometr(y|ic) (accura|reconstruct|fidelity)|normal (prior|estimation|consisten)|planar|surfel|depth[- ]normal|watertight|neus|chamfer', {'Meshing'}),
 'dyn': (r'\b4d\b|4dgs|dynamic|deformable|deformation field|temporal|monocular video|motion|time-varying|non-rigid|free[- ]viewpoint video|volumetric video', {'Dynamic'}),
 'sparse': (r'sparse[- ]view|few[- ]shot|few[- ]view|sparse input|limited views|two views|three views|\b3 views|sparse images|sparse observations', {'Sparse'}),
 'fast': (r'real[- ]time|fast training|training time|accelerat|speed[- ]?up|faster|in (seconds|minutes)|\d+ ?(seconds|minutes)|efficient training|rapid|instant|\bfps\b|lightweight', {'Acceleration'}),
 'compact': (r'compact|compress|prun|storage|memory (footprint|efficient|consumption)|quantiz|codebook|\bmb\b|bitrate|rate-distortion|lightweight|fewer gaussians|number of gaussians|entropy|distill', {'Compression'}),
 'mesh': (r'\bmesh|meshes|meshing|marching cubes|tetrahedr|triangle|mesh extraction|mesh-based|polygon|texture[d ]? mesh', {'Meshing', 'Texturing'}),
}
TR = {k: re.compile(v[0], re.I) for k, v in TOP.items()}
out = []
for i, p in P.items():
    if not p.get('t'): continue
    text = p['t'] + ' ' + (p.get('ab') or '')
    if not re.search(r'gaussian|splat|3dgs|radiance field|nerf|reconstruct|novel view', text, re.I): continue
    for vm in VEN_RE.finditer(text): p['v'].add(norm_ven(*vm.groups()))
    tops = []
    for k, (rx, tags) in TOP.items():
        hits = len(TR[k].findall(text))
        title_hit = bool(TR[k].search(p['t']))
        if (p['tg'] & tags) or title_hit or hits >= 2: tops.append(k)
    if not p.get('d'):
        yy, mm = i[:2], i[2:4]
        p['d'] = f'20{yy}-{mm}'
    ab = p.get('ab') or ''
    if len(ab) > 900: ab = ab[:900].rsplit(' ', 1)[0] + '…'
    o = {'i': i, 't': p['t'], 'a': p.get('a') or '', 'd': p['d'], 'ab': ab, 'k': tops,
         'v': sorted(p['v']), 'g': sorted(p['tg'])}
    for f in ('c', 'pp', 'org'):
        if p.get(f): o[f] = p[f]
    out.append(o)
out.sort(key=lambda o: (o['d'][:7], o['i']), reverse=True)
import collections
print(len(out), collections.Counter(k for o in out for k in o['k']), file=sys.stderr)
print(collections.Counter(v for o in out for v in o['v']).most_common(40), file=sys.stderr)
print(out[0]['d'], out[-1]['d'], sum(1 for o in out if o['d'] >= '2026-06'), file=sys.stderr)
json.dump(out, open(os.path.join(S, 'papers.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
