#!/usr/bin/env python3
"""Inject the in-banner timer stepper into every app that has a per-card timer (adjustTimer) and a navy drill banner. Idempotent. Run from the repo root."""
import re, glob, os
here = os.path.dirname(os.path.abspath(__file__))
js = open(os.path.join(here,'timerbar.js'),encoding='utf-8').read().strip()
block = '<script id="ap-timerbar">\n'+js+'\n</script>\n'
for f in sorted(glob.glob('Eton *.html')+glob.glob('AP All Languages - *.html')):
    s = open(f,encoding='utf-8').read()
    if 'function adjustTimer' not in s or 'aph-dbar-score' not in s: continue
    s2 = re.sub(r'<script id="ap-timerbar">.*?</script>\n','',s,flags=re.S)
    s2 = s2.rstrip('\n') + '\n' + block   # appended at the very end of the file: '</body>' can also occur inside a script string, so never insert there
    open(f,'w',encoding='utf-8').write(s2); print('injected',f)
