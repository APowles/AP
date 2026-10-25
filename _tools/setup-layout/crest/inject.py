#!/usr/bin/env python3
"""Inject/refresh the AP CREST add-on (crest.css/js) into every app with a header crest. Run from /home/claude/ap. Idempotent. Does NOT restamp."""
import re, sys, glob, os
here = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(here, 'crest.css'), encoding='utf-8').read().strip()
js = open(os.path.join(here, 'crest.js'), encoding='utf-8').read().strip()
block = '<style id="ap-crest-css">\n' + css + '\n</style>\n<script id="ap-crest">\n' + js + '\n</script>\n'
files = sys.argv[1:] or sorted(glob.glob('Eton *.html') + glob.glob('AP All Languages - *.html'))
for f in files:
    s = open(f, encoding='utf-8').read()
    if 'aph-avatar' not in s or f.startswith('Eton Tests'): print('skip', f); continue
    s2 = re.sub(r'<style id="ap-crest-css">.*?</style>\n<script id="ap-crest">.*?</script>\n', '', s, flags=re.S)
    i = s2.rfind('</body>')
    if i >= 0 and s2[i+7:].strip() in ('</html>', ''):
        s2 = s2[:i] + block + s2[i:]
    elif s2.rstrip().endswith('</script>'):
        s2 = s2.rstrip('\n') + '\n' + block
    else:
        print('SKIP (no clean end)', f); continue
    if s2 != s: open(f, 'w', encoding='utf-8').write(s2); print('injected', f)
    else: print('unchanged', f)
