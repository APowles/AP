#!/usr/bin/env python3
"""Install/refresh the shared Build it module in an app file.
usage: install.py "<file.html>" [...]   (puts the module between BUILDIT markers just before the last </body>)"""
import sys,os,re
d=os.path.dirname(os.path.abspath(__file__))
def rd(n): return open(os.path.join(d,n),encoding='utf-8').read().strip()
src=rd('buildit.src.js')
for k,v in {'{{BOARD}}':rd('board.txt'),'{{TILE}}':rd('tile.txt'),'{{ICON}}':rd('icon.txt'),'{{SND_PLACE}}':rd('snd_place.txt'),'{{SND_REMOVE}}':rd('snd_remove.txt'),'{{SND_OK}}':rd('snd_ok.txt'),'{{SND_BAD}}':rd('snd_bad.txt')}.items(): src=src.replace(k,v)
block='<!--BUILDIT:START-->\n<script>\n'+src+'\n</script>\n<!--BUILDIT:END-->\n'
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read()
    pat=re.compile(r'<!--BUILDIT:START-->.*?<!--BUILDIT:END-->\n?',re.S)
    if pat.search(s): s=pat.sub(lambda m: block,s,count=1)
    else:
        i=s.rfind('</body>')
        # some pages end without a real </body> (the last one is inside a script string): then the block goes at the very end
        if i<0 or s.rfind('<script',0,i)>s.rfind('</script>',0,i): s=s.rstrip('\n')+'\n'+block
        else: s=s[:i]+block+s[i:]
    open(f,'w',encoding='utf-8').write(s); print('installed in',f)
