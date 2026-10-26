#!/usr/bin/env python3
"""Stamp every app page with a build id and write version.json (used by the 'newer version available' strip).
Run from the repo root before committing (the pre-commit hook does this).  Idempotent: the stamp block is removed, the page is hashed without it, and the block is appended at the very end."""
import re, glob, os, hashlib, json
here = os.path.dirname(os.path.abspath(__file__))
chk = open(os.path.join(here,'newversion.js'),encoding='utf-8').read().strip()
CHK = '<script id="ap-newver-js">\n'+chk+'\n</script>\n'
STAMP = re.compile(r'<script id="ap-build">[^<]*</script>\n?')
CHKRX = re.compile(r'<script id="ap-newver-js">.*?</script>\n?', re.S)
out = {}
for f in sorted(glob.glob('Eton *.html')+glob.glob('AP All Languages - *.html')):
    s = open(f,encoding='utf-8').read()
    base = STAMP.sub('', CHKRX.sub('', s)).rstrip('\n')
    h = hashlib.sha1((base+'\n'+chk).encode('utf-8')).hexdigest()[:10]
    new = base + '\n' + CHK + '<script id="ap-build">window.__apBuild="'+h+'";</script>\n'
    if new != s: open(f,'w',encoding='utf-8').write(new)
    out[f] = h
old = None
try: old = json.load(open('version.json',encoding='utf-8'))
except Exception: pass
if old != out: json.dump(out, open('version.json','w',encoding='utf-8'), indent=1, ensure_ascii=False)
print('stamped', len(out))
