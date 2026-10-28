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
    s=re.sub(r'<!--BUILDIT:START-->.*?<!--BUILDIT:END-->\n?','',s,flags=re.S)
    i=s.rindex('</body>'); s=s[:i]+block+s[i:]
    open(f,'w',encoding='utf-8').write(s); print('installed in',f)
