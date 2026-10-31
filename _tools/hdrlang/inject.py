#!/usr/bin/env python3
"""Inject the header language buttons (French / Italian / Spanish, next to Speed & pauses) into every app. Idempotent. Run from the repo root.
Appended at the very end of the file ('</body>' can also occur inside a script string). The module shows nothing where an app has no language choice."""
import re, glob, os
here = os.path.dirname(os.path.abspath(__file__))
js = open(os.path.join(here, 'hdrlang.js'), encoding='utf-8').read().strip()
block = '<script id="ap-hdrlang">\n' + js + '\n</script>\n'
SKIP = ('Vocab and Gr EWs', 'Tests', 'Listening', 'IPA', 'Oxbridge', 'F Block Spanish', 'F Spanish Vocab', 'Spanish Verbs', 'French Verbs', 'Italian Verbs', 'Oral Topics')
for f in sorted(glob.glob('Eton *.html') + glob.glob('AP All Languages - *.html')):
    if any(k in f for k in SKIP): continue
    s = open(f, encoding='utf-8').read()
    if 'aph-header' not in s: continue
    s2 = re.sub(r'<script id="ap-hdrlang">.*?</script>\n', '', s, flags=re.S)
    s2 = s2.rstrip('\n') + '\n' + block
    open(f, 'w', encoding='utf-8').write(s2); print('injected', f)
