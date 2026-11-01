#!/usr/bin/env python3
"""Put the shared shuffle engine (shuffles.js) into blitz.js (Gamify it, all apps) and into the A Level Shuffle and deal.
Run after editing shuffles.js, then run _tools/gamify/rollout.sh to carry blitz.js into every app."""
import re,os,sys
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
eng=open(os.path.join(R,'_tools/shuffles/shuffles.js'),encoding='utf-8').read().strip()
pat=re.compile(r'/\*SHX-BEGIN\*/.*?/\*SHX-END\*/',re.S)
def put(path,anchor,wrap):
    s=open(path,encoding='utf-8').read()
    if pat.search(s): s=pat.sub(lambda m:eng,s,count=1)
    else:
        k=s.index(anchor); s=s[:k]+wrap[0]+eng+wrap[1]+s[k:]
    open(path,'w',encoding='utf-8').write(s);print('ok',os.path.basename(path))
put(os.path.join(R,'_tools/gamify/blitz.js'),'  var ov = null, snd = true',('',"\n"))
# the A Level Shuffle and deal lives in the KTR Studio block (its own document: closing tags there are written <\\/script>)
P=os.path.join(R,'Eton A Level French Oral Topics & Paper 1 Practice.html');S=open(P,encoding='utf-8').read()
if pat.search(S): S=pat.sub(lambda m:eng,S,count=1)
else:
    st=S.index('<script type="text/plain" id="ktr-studio-src">');k=S.index('<script>\n',st);S=S[:k]+'<script id="ap-shuffle">\n'+eng+'\n<\\/script>\n'+S[k:]
open(P,'w',encoding='utf-8').write(S);print('ok',os.path.basename(P))
