#!/usr/bin/env python3
"""Inject/refresh the AP STEPS add-on (spot.css/js) into every app that has the FIRST / NEXT set-up screen.
Run from /home/claude/ap:  python3 _tools/setup-layout/spot/inject.py [files...]
Does NOT restamp; restamp separately. Idempotent."""
import re, sys, glob, os
here = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(here, 'spot.css'), encoding='utf-8').read().strip()
js = open(os.path.join(here, 'spot.js'), encoding='utf-8').read().strip()
block = '<style id="ap-spot-css">\n' + css + '\n</style>\n<script id="ap-spot">\n' + js + '\n</script>\n'
files = sys.argv[1:] or sorted(glob.glob('Eton *.html') + glob.glob('AP All Languages - *.html'))
for f in files:
    s = open(f, encoding='utf-8').read()
    if 'Spot Test' not in s or f.startswith('Eton Tests'): continue
    s2 = re.sub(r'<style id="ap-spot-css">.*?</style>\n<script id="ap-spot">.*?</script>\n', '', s, flags=re.S)
    i = s2.rfind('</body>')
    if i >= 0 and s2[i+7:].strip() in ('</html>', ''):
        s2 = s2[:i] + block + s2[i:]
    elif s2.rstrip().endswith('</script>') or s2.rstrip().endswith('</html>') and False:
        s2 = s2.rstrip('\n') + '\n' + block          # these files end with a script and no </body>
    else:
        print('SKIP (no clean end)', f); continue
    if s2 != s:
        open(f, 'w', encoding='utf-8').write(s2); print('injected', f)
    else: print('unchanged', f)
