#!/usr/bin/env python3
"""Random shuffles for the Shuffle and deal inside the Approved Material Studio (Eton file and its AP All Languages twin).
Same engine as the A Level KTR Studio; the engine goes inside the Studio block (its own document)."""
import re,os
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'));os.chdir(R)
eng=open('_tools/shuffles/shuffles.js',encoding='utf-8').read().strip();GO=open('_tools/shuffles/fcshuffle_am.txt',encoding='utf-8').read()
ENG=re.compile(r'/\*SHX-BEGIN\*/.*?/\*SHX-END\*/',re.S)
def rep(s,old,new,n=1):
    assert s.count(old)==n,(old[:60],s.count(old));return s.replace(old,new)
for f in ["Eton IGCSE Approved Material Practice Sentences.html","AP All Languages - IGCSE Approved Material Practice Sentences.html"]:
    s=open(f,encoding='utf-8').read()
    st=s.index('<script type="text/plain" id="am-studio-src">')
    if 'function fcShuffleGo' not in s[st:]:
        s=rep(s,"function fcPlay(k){try{","function fcPlay(k,v){try{")
        s=rep(s,"const a=new Audio(_fcU[k]);a.volume=1;const pr=a.play()","const a=new Audio(_fcU[k]);a.volume=v==null?1:Math.min(1,v*1.25);const pr=a.play()")
        old="""  fcPlay('fan1');FC.tms.push(setTimeout(()=>fcPlay('fan2'),800));
  FC.to=setTimeout(()=>{FC.to=null;FC.phase='table';render();fcDealAnim()},2350);
};"""
        s=rep(s,old,"  fcShuffleGo();\n};",2)
        a=s.index("'<div class=\"fc-deck\">'+[0,1,2,3,4,5,6]");b=s.index("<div class=\"fc-shuf\">Shuffling…</div>';",a)+len("<div class=\"fc-shuf\">Shuffling…</div>';")
        s=s[:a]+"'<div class=\"shx-st\" id=\"shx-st\"></div><div class=\"fc-shuf\">Shuffling…</div>';"+s[b:]
        s=rep(s,"function fcDealAnim(){",GO+"function fcDealAnim(){")
    st=s.index('<script type="text/plain" id="am-studio-src">')
    if 'id="ap-shuffle"' not in s[st:st+400000]:
        k=s.index('<script>\n',st);assert '</script' not in eng
        s=s[:k]+'<script id="ap-shuffle">\n'+eng+'\n<\\/script>\n'+s[k:]
    open(f,'w',encoding='utf-8').write(s);print('patched',f)
