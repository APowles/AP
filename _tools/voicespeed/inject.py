#!/usr/bin/env python3
"""Inject the voice-speed button add-on into the apps that have a navy drill banner and spoken voices but no speed control of their own. Idempotent. Run from the repo root."""
import re, glob, os
here = os.path.dirname(os.path.abspath(__file__))
js = open(os.path.join(here,'voicespeed.js'),encoding='utf-8').read().strip()
block = '<script id="ap-voicespeed">\n'+js+'\n</script>\n'
SKIP = ('Vocab and Gr EWs','Structures','Oral Topics','F Spanish Vocab','Listening','Tests','IPA','Oxbridge')
for f in sorted(glob.glob('Eton *.html')+glob.glob('AP All Languages - *.html')):
    if any(k in f for k in SKIP): continue
    s = open(f,encoding='utf-8').read()
    if 'SpeechSynthesisUtterance' not in s or 'aph-dbar' not in s: continue
    s2 = re.sub(r'<script id="ap-voicespeed">.*?</script>\n','',s,flags=re.S)
    j = s2.rfind('</html>'); i = s2.rfind('</body>')
    k = i if i >= 0 and (j < 0 or i < j) else j
    if k < 0: print('SKIP',f); continue
    s2 = s2[:k]+block+s2[k:]
    open(f,'w',encoding='utf-8').write(s2); print('injected',f)
