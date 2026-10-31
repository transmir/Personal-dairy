"""Build audio-survey-desk/index.html from the shared desk template.

Uses splat-survey-desk/build/template.html (one copy of the page code) with
desk-config.js swapped in. Papers load live from arXiv through the diary's
Apps Script backend, so the built-in paper list starts empty.
Usage: python3 audio-survey-desk/build/make_page.py
"""
import datetime, os, re
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..', '..')
t = open(os.path.join(root, 'splat-survey-desk', 'build', 'template.html'), encoding='utf8').read()
cfg = open(os.path.join(here, 'desk-config.js'), encoding='utf8').read()

backend = ''
override = os.path.join(here, 'backend_url.txt')
if os.path.exists(override):
    backend = open(override, encoding='utf8').read().strip()
else:
    m = re.search(r"SCRIPT_URL\s*=\s*'(https://script\.google\.com/[^']+)'", open(os.path.join(root, 'index.html'), encoding='utf8').read())
    backend = m.group(1) if m else ''

snap = datetime.date.today().strftime('%-d %b %Y')
page = t.replace('__DATA__', '[]').replace('__SNAPSHOT__', snap)
swaps = [
    ('<title>Splat Survey Desk</title>', '<title>Audio Classification Desk</title>'),
    ('<h1>Splat Survey Desk</h1>', '<h1>Audio Classification Desk</h1>'),
    ('<p>Gaussian splatting literature for your survey: newest arXiv preprints, accepted conference papers, and the geometry &amp; vision classics behind them.</p>',
     '<p>Audio classification literature for your survey: newest arXiv preprints, accepted papers at ICASSP, Interspeech, DCASE and beyond, and the signal-processing classics behind them.</p>'),
]
for a, b in swaps:
    assert page.count(a) == 1, a
    page = page.replace(a, b)
cut = page.index('<style>')
head, body = page[:cut], page[cut:]
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       + head
       + (f'<script>window.SSD_BACKEND_URL={backend!r};</script>\n' if backend else '')
       + '<script>\n' + cfg + '\n</script>\n'
       + '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
       '</head>\n<body>\n' + body + '\n</body>\n</html>\n')
open(os.path.join(here, '..', 'index.html'), 'w', encoding='utf8').write(doc)
print('wrote audio-survey-desk/index.html | backend:', backend or 'none')
