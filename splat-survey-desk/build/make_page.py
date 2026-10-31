"""Fill template.html with papers.json and write a standalone ../index.html."""
import datetime, os
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, 'template.html'), encoding='utf8').read()
data = open(os.path.join(here, 'papers.json'), encoding='utf8').read().replace('</', '<\\/')
snap = datetime.date.today().strftime('%-d %b %Y')
page = t.replace('__DATA__', data).replace('__SNAPSHOT__', snap)
# Backend URL: the diary's Apps Script web app (see backend/Code.gs, action 'arxiv').
# Read from ../../index.html so it stays in sync; override with build/backend_url.txt.
import re
backend = ''
override = os.path.join(here, 'backend_url.txt')
if os.path.exists(override):
    backend = open(override, encoding='utf8').read().strip()
else:
    try:
        m = re.search(r"SCRIPT_URL\s*=\s*'(https://script\.google\.com/[^']+)'", open(os.path.join(here, '..', '..', 'index.html'), encoding='utf8').read())
        backend = m.group(1) if m else ''
    except OSError:
        pass
cut = page.index('<style>')
head, body = page[:cut], page[cut:]
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       + head +
       (f'<script>window.SSD_BACKEND_URL={backend!r};</script>\n' if backend else '') +
       '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
       '</head>\n<body>\n' + body + '\n</body>\n</html>\n')
open(os.path.join(here, '..', 'index.html'), 'w', encoding='utf8').write(doc)
print('wrote index.html, snapshot', snap, '| backend:', backend or 'none')
