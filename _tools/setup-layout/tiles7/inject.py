#!/usr/bin/env python3
"""Inject/refresh the AP TILES7 add-on (tiles7.css/js + icons) into the apps whose NEXT grid has a small View & Print,
Practice Trials paper or Grammar recaps button under it. Run from /home/claude/ap. Idempotent. Does NOT restamp."""
import re, sys, glob, os, json
here = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(here, 'tiles7.css'), encoding='utf-8').read().strip()
js = open(os.path.join(here, 'tiles7.js'), encoding='utf-8').read().strip()
icons = json.load(open(os.path.join(here, 'icons.json')))
block = ('<style id="ap-tiles7-css">\n' + css + '\n</style>\n<script id="ap-tiles7-icons">window.AP_TILE_ICONS = ' + json.dumps(icons) + ';</script>\n'
         + '<script id="ap-tiles7">\n' + js + '\n</script>\n')
APPS = ['Eton IGCSE Vocab and Gr EWs.html', 'AP All Languages - IGCSE Vocab and Gr EWs.html',
        'Eton F Spanish Vocab.html', 'Eton Gen Essential Phrases.html',
        'Eton A Level Oral Phrase Bank.html', 'AP All Languages - A Level Oral Phrase Bank.html',
        'Eton French Verbs.html', 'Eton Italian Verbs.html', 'Eton Spanish Verbs.html']
files = sys.argv[1:] or APPS
for f in files:
    s = open(f, encoding='utf-8').read()
    s2 = re.sub(r'<style id="ap-tiles7-css">.*?</style>\n<script id="ap-tiles7-icons">.*?</script>\n<script id="ap-tiles7">.*?</script>\n', '', s, flags=re.S)
    i = s2.rfind('</body>')
    if i >= 0 and s2[i+7:].strip() in ('</html>', ''):
        s2 = s2[:i] + block + s2[i:]
    elif s2.rstrip().endswith('</script>'):
        s2 = s2.rstrip('\n') + '\n' + block
    else:
        print('SKIP (no clean end)', f); continue
    if s2 != s: open(f, 'w', encoding='utf-8').write(s2); print('injected', f)
    else: print('unchanged', f)
