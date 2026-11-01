#!/usr/bin/env python3
"""Carry the random-shuffle change into the apps WITHOUT the full Gamify rollout (rollout.sh re-injects host adapters and
rebuilds F Block, which can undo newer work). Patches only the shared Gamify module inside each app, plus the A Level
Shuffle and deal (inside the KTR Studio block). Safe to re-run: files already patched are skipped."""
import re,os,glob,sys
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'));os.chdir(R)
eng=open('_tools/shuffles/shuffles.js',encoding='utf-8').read().strip()
pat=re.compile(r'(<script id="ap-blitz">)(.*?)(</script>)',re.S)
ENG=re.compile(r'/\*SHX-BEGIN\*/.*?/\*SHX-END\*/',re.S)
NEWSHUF=open('_tools/shuffles/dlshuffle.txt',encoding='utf-8').read()
def rep(s,old,new):
    assert s.count(old)==1,(old[:60],s.count(old));return s.replace(old,new)
def patch_blitz(t):
    if ENG.search(t): return ENG.sub(lambda m:eng,t,count=1)   # engine already in: just refresh it
    t=rep(t,"function dplay(k) {","function dplay(k, v) {")
    t=rep(t,"a.volume = Math.min(1, .7 * CFG.vol);","a.volume = Math.min(1, .7 * CFG.vol * (v == null ? 1 : Math.min(1.3, v * 1.25)));")
    t=rep(t,"var _dU = {}, dlSub = null, dlBackOrig = null;","var _dU = {}, dlSub = null, dlBackOrig = null, dlTok = 0;")
    a=t.index("  function dlShuffle(then) {");b=t.index("  function dlMarks()")
    t=t[:a]+NEWSHUF+t[b:]
    k=t.index("  var ov = null, snd = true");t=t[:k]+eng+"\n"+t[k:]
    return t
changed=0
for f in sorted(glob.glob('*.html')):
    s=open(f,encoding='utf-8').read()
    if 'id="ap-blitz">' not in s: continue
    n=pat.subn(lambda m:m.group(1)+patch_blitz(m.group(2))+m.group(3),s)
    if n[0]!=s: open(f,'w',encoding='utf-8').write(n[0]);changed+=1;print('patched',f[:70])
# A Level Shuffle and deal
f='Eton A Level French Oral Topics & Paper 1 Practice.html';s=open(f,encoding='utf-8').read()
if 'function fcShuffleGo' not in s:
    s=rep(s,"function fcPlay(k){try{","function fcPlay(k,v){try{")
    s=rep(s,"const a=new Audio(_fcU[k]);a.volume=1;const pr=a.play()","const a=new Audio(_fcU[k]);a.volume=v==null?1:Math.min(1,v*1.25);const pr=a.play()")
    old="""  fcPlay('fan1');FC.tms.push(setTimeout(()=>fcPlay('fan2'),800));
  FC.to=setTimeout(()=>{FC.to=null;FC.phase='table';render();fcDealAnim()},2350);
}"""
    assert s.count(old)==2;s=s.replace(old,"  fcShuffleGo();\n}")
    a=s.index("function vCardsShuffle(){");b=s.index("function vCardsTable(){")
    s=s[:a]+"""function vCardsShuffle(){
  return '<div class="row" style="justify-content:space-between"><h1 class="h2">🃏 Shuffle and deal</h1></div>'
   +'<div class="shx-st" id="shx-st"></div><div class="fc-shuf">Shuffling…</div>';
}
"""+s[b:]
    s=rep(s,"function fcDealAnim(){",open('_tools/shuffles/fcshuffle.txt',encoding='utf-8').read()+"function fcDealAnim(){")
    changed+=1;print('patched A Level Shuffle and deal')
if 'id="ap-shuffle"' not in s:
    st=s.index('<script type="text/plain" id="ktr-studio-src">');k=s.index('<script>\n',st)
    assert '</script' not in eng
    s=s[:k]+'<script id="ap-shuffle">\n'+eng+'\n<\\/script>\n'+s[k:]
else:
    s=ENG.sub(lambda m:eng,s,count=1) if s.count('SHX-BEGIN')==1 else s
open(f,'w',encoding='utf-8').write(s)
print('done',changed)
