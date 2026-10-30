#!/usr/bin/env python3
"""Put (or refresh) the Gamify it games in an app file.
usage: inject.py FILE [--games a,b,c] [--pics] [--noun words] [--host hostfile.js]
The shared module is blitz.js (one copy); host adapters feed it words, languages and speech."""
import re,sys,os,argparse
D=os.path.dirname(os.path.abspath(__file__))
ap=argparse.ArgumentParser();ap.add_argument('file');ap.add_argument('--games',default='');ap.add_argument('--pics',action='store_true');ap.add_argument('--noun',default='words');ap.add_argument('--short',type=int,default=0);ap.add_argument('--host',default='');ap.add_argument('--last',action='store_true');ap.add_argument('--inside',default='')
a=ap.parse_args()
rd=lambda n:open(os.path.join(D,n),encoding='utf-8').read()
js=rd('blitz.js');art=rd('ap-blitz-art.txt');tilecss=rd('ap-blitz-tile.txt')
ALL='clock,streak,odd,letter,gender,roll,catch,lane,pairs'.split(',')
games=a.games.split(',') if a.games else ALL
def process(s):
    # host script
    host=open(a.host,encoding='utf-8').read() if a.host else ''
    cfg='window.APBZ_HOSTCFG={games:%s,pics:%s,noun:"%s",short:%d};'%(repr(games).replace("'",'"'),'true' if a.pics else 'false',a.noun,a.short)
    tilejs=rd('tile.js')
    block=('<style id="ap-blitz-tile">'+tilecss+'</style>\n<script id="ap-blitz-art">'+art+'</script>\n'
     '<script id="ap-blitz-host">'+cfg+'\n'+host+'</script>\n<script id="ap-blitz">'+js+'</script>\n<script id="ap-blitz-tile-js">'+tilejs+'</script>\n')
    pat=re.compile(r'<style id="ap-blitz-tile">.*?</style>\n?(?:<script id="ap-blitz-art">.*?</script>\n?)?(?:<script id="ap-blitz-host">.*?</script>\n?)?<script id="ap-blitz">.*?</script>\n?(?:<script id="ap-blitz-tile-js">.*?</script>\n?)?',re.S)
    if pat.search(s):
        s=pat.sub(lambda m:block,s,count=1)
    else:
        k=(s.rfind if a.last else s.find)('<script id="ap-tileorder">'); assert k>0,'no tileorder anchor'
        s=s[:k]+block+s[k:]
    def fixrank(m):
        line=m.group(0)
        if "'ms-blitz'" in line: return line
        return line.replace('var RANK = {',"var RANK = { 'ms-blitz': %s,"%("-0.5" if "'ms-recap'" in line else "-1"),1)
    import itertools
    s=re.sub(r"var RANK = \{[^}]*\}",fixrank,s)

    return s
S=open(a.file,encoding='utf-8').read()
if a.inside:
    m=re.search(r'<script type="text/plain" id="%s">'%re.escape(a.inside),S); assert m,'no block'
    e=S.find('</script>',m.end()); inner=S[m.end():e].replace('\u27e6/script>','</script>')
    inner=process(inner).replace('</script>','\u27e6/script>')
    S=S[:m.end()]+inner+S[e:]
else:
    S=process(S)
open(a.file,'w',encoding='utf-8').write(S);print('ok',os.path.basename(a.file),len(S))
