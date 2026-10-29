import json,subprocess,glob,os,re,sys
os.chdir('/home/claude/ap')
F="Eton A Level French Oral Topics & Paper 1 Practice.html"
SCR='/tmp/claude-0/-home-claude/5d1c4334-7c31-5c63-bb77-7f8672935c5f/scratchpad/ican/'
s=subprocess.run(['git','show','HEAD:'+F],capture_output=True).stdout.decode('utf-8')
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(a[:60],s.count(a))
    s=s.replace(a,b)
rep("['r','Les repères','Final checklist']];","['r','Les repères','Final checklist'],['i','Je peux','I can']];")
rep("STAGES.filter(s=>s[0]!=='r'||hasRem(n))","STAGES.filter(s=>(s[0]!=='r'||hasRem(n))&&(s[0]!=='i'||hasIcan(n)))")
rep("STAGES.filter(s=>s[0]!=='r'||k.remember).map(s=>`<button class=\"stg","STAGES.filter(s=>(s[0]!=='r'||k.remember)&&(s[0]!=='i'||k.ican)).map(s=>`<button class=\"stg")
rep("S.stage==='r'&&k.remember?sRem(k):","S.stage==='r'&&k.remember?sRem(k):S.stage==='i'&&k.ican?sIcan(k):")
rep("STAGES.filter(st=>st[0]!=='r'||k.remember).map(st=>","STAGES.filter(st=>(st[0]!=='r'||k.remember)&&(st[0]!=='i'||k.ican)).map(st=>")
rep("function sRem(k){mark(k.n,'r');return `<div class=\"label\" style=\"margin-top:20px\">Les repères · Key things to remember</div>${remember(k)}`}",
    "function sRem(k){mark(k.n,'r');return `<div class=\"label\" style=\"margin-top:20px\">Les repères · Key things to remember</div>${remember(k)}`+(k.ican?`<div class=\"row\"><button class=\"btn\" onclick=\"S.stage='i';S.step=0;render();window.scrollTo(0,0)\">Final stage: Je peux (I can)</button></div>`:'')}\n"+open('_tools/ican/ican.js',encoding='utf-8').read())
# data
L=s.split('\n'); i=[j for j,l in enumerate(L) if l.startswith('const DATA=')][0]
d,e=json.JSONDecoder().raw_decode(L[i][11:]); tail=L[i][11+e:]
n=0
for p in sorted(glob.glob(SCR+'ktr*.json')):
    N=int(re.search(r'ktr(\d+)\.json',p).group(1)); pts=json.load(open(p,encoding='utf-8'))
    assert len(pts)==15,(p,len(pts))
    for x in pts:
        assert x['tier'] in('Essential','Important','Bonus') and all(x[k].strip() for k in('prompt','fr','en')),(p,x)
    for sub in d['subs']:
        for k in sub['ktrs']:
            if k['n']==N: k['ican']=[{'tier':x['tier'],'prompt':x['prompt'],'fr':x['fr'],'en':x['en']} for x in pts]; n+=1
L[i]='const DATA='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+tail
s='\n'.join(L)
open(F,'w',encoding='utf-8').write(s); print('KTRs with ican:',n)
