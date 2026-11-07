#!/usr/bin/env python3
"""Stamp every app page with a build id and write version.json (used by the 'newer version available' strip).
Run from the repo root before committing (the pre-commit hook does this).  Idempotent: the stamp block is removed, the page is hashed without it, and the block is appended at the very end."""
import re, glob, os, hashlib, json
here = os.path.dirname(os.path.abspath(__file__))
# ⛔ EXAM AUDIO LOCK: refuse to stamp anything if the Paper 1 listening audio was changed without Andrew's approval (see CLAUDE.md)
import subprocess, sys
if subprocess.call([sys.executable, '-I', os.path.join(here, '..', 'locks', 'p1_audio.py')]) != 0:
    sys.exit('stamp.py: NOT stamped, because the EXAM AUDIO LOCK failed (see the message above).')
chk = open(os.path.join(here,'newversion.js'),encoding='utf-8').read().strip()
CHK = '<script id="ap-newver-js">\n'+chk+'\n</script>\n'
STAMP = re.compile(r'<script id="ap-build">[^<]*</script>\n?')
CHKRX = re.compile(r'<script id="ap-newver-js">.*?</script>\n?', re.S)
vl = open(os.path.join(here,'vlabel.js'),encoding='utf-8').read().strip()
try: fv = json.load(open('filever.json',encoding='utf-8'))
except Exception: fv = {}
out = {}
for f in sorted(glob.glob('Eton *.html')+glob.glob('AP All Languages - *.html')+['AP F Block Spanish.html']):
    s = open(f,encoding='utf-8').read()
    base = STAMP.sub('', CHKRX.sub('', s)).rstrip('\n')
    h = hashlib.sha1((base+'\n'+chk).encode('utf-8')).hexdigest()[:10]
    e = fv.get(f)
    if not e: e = {'h': h, 'n': 150}
    elif e['h'] != h: e = {'h': h, 'n': e['n'] + 1}
    fv[f] = e
    new = base + '\n' + CHK + '<script id="ap-build">window.__apBuild="'+h+'";window.__apVer='+str(e['n'])+';'+vl+'</script>\n'
    if new != s: open(f,'w',encoding='utf-8').write(new)
    out[f] = h
old = None
try: old = json.load(open('version.json',encoding='utf-8'))
except Exception: pass
if old != out: json.dump(out, open('version.json','w',encoding='utf-8'), indent=1, ensure_ascii=False)
json.dump(fv, open('filever.json','w',encoding='utf-8'), indent=1, ensure_ascii=False)
print('stamped', len(out))
