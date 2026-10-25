#!/usr/bin/env python3
"""One-off test links: inject the add-on (oneoff.css/js) into every app with a link maker, and patch the shared engine so a one-off is never filed in the device's Test Library.
Eton Tests.html also gets: expired one-off codes (7 days, date in the folder column) are ignored and swept from tests.txt.
Run from the repo root:  python3 _tools/oneoff/inject.py     Idempotent."""
import re, glob, os
here = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(here,'oneoff.css'),encoding='utf-8').read().strip(); js = open(os.path.join(here,'oneoff.js'),encoding='utf-8').read().strip()
block = '<style id="ap-oneoff-css">\n'+css+'\n</style>\n<script id="ap-oneoff">\n'+js+'\n</script>\n'
LA_OLD = "function listAdd(e) { var l = listGet();"
LA_NEW = "function listAdd(e) { if (e && /^⚡ One-off/.test(e.cat || '')) return; var l = listGet();"
for f in sorted(glob.glob('Eton *.html')+glob.glob('AP All Languages - *.html')):
    s = open(f,encoding='utf-8').read()
    if 'aptt-mk-go' not in s: continue
    s2 = re.sub(r'<style id="ap-oneoff-css">.*?</style>\n<script id="ap-oneoff">.*?</script>\n','',s,flags=re.S)
    s2 = s2.replace(LA_OLD, LA_NEW)
    i = s2.rfind('</body>')
    if i >= 0 and s2[i+7:].strip() in ('</html>',''): s2 = s2[:i]+block+s2[i:]
    elif s2.rstrip().endswith('</script>') or s2.rstrip().endswith('</html>'): 
        j = s2.rfind('</html>')
        if j >= 0 and s2[j:].strip()=='</html>': s2 = s2[:j]+block+s2[j:]
        else: s2 = s2.rstrip('\n')+'\n'+block
    else: print('SKIP',f); continue
    if s2 != s: open(f,'w',encoding='utf-8').write(s2); print('injected',f, s2.count('One-off/.test'))
    else: print('unchanged',f)
