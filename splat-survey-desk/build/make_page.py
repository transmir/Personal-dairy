"""Fill template.html with papers.json and write a standalone ../index.html."""
import datetime, os
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, 'template.html'), encoding='utf8').read()
data = open(os.path.join(here, 'papers.json'), encoding='utf8').read().replace('</', '<\\/')
snap = datetime.date.today().strftime('%-d %b %Y')
page = t.replace('__DATA__', data).replace('__SNAPSHOT__', snap)
cut = page.index('<style>')
head, body = page[:cut], page[cut:]
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       + head +
       '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
       '</head>\n<body>\n' + body + '\n</body>\n</html>\n')
open(os.path.join(here, '..', 'index.html'), 'w', encoding='utf8').write(doc)
print('wrote index.html, snapshot', snap)
