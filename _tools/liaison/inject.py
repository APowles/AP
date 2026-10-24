#!/usr/bin/env python3
"""Add AP LIAISON v1 (liaison.js) before every <script id="ap-voice"> (main pages and the pop-out page templates).
Run from /home/claude/ap:  python3 _tools/liaison/inject.py     Idempotent. Restamp afterwards."""
import glob, json, os, re
here = os.path.dirname(os.path.abspath(__file__))
js = open(os.path.join(here, 'liaison.js'), encoding='utf-8').read().strip()
raw = '<script id="ap-liaison">\n' + js + '\n</script>\n'
esc = '<script id=\\"ap-liaison\\">\\n' + json.dumps(js)[1:-1] + '\\n<\\/script>\\n'
RAW_A, ESC_A = '<script id="ap-voice">', '<script id=\\"ap-voice\\">'
for f in sorted(glob.glob('Eton *.html') + glob.glob('AP All Languages - *.html')):
    s = open(f, encoding='utf-8').read()
    if RAW_A not in s: continue
    t = s.replace(raw, '').replace(esc, '')
    t = t.replace(ESC_A, esc + ESC_A).replace(RAW_A, raw + RAW_A)
    if t != s:
        open(f, 'w', encoding='utf-8').write(t); print('liaison ->', f, t.count('ap-liaison'))
