#!/usr/bin/env python3
"""TEST FIXTURE ONLY (not shipped): builds a DEMO_LEARN-shaped json for testing build_od.py / the Learn page.
Real data wins: FR001 (hand-made from /tmp/ms/fr001b.json) and any /tmp/ms/learn/out_NN.json present;
every other demo in /tmp/ms/learn/input_all.json gets a clearly synthetic entry (English = '(English) ' + French,
mechanical gaps/errors) so that every demo can be exercised for page errors.
usage: make_fixture.py OUT.json [all|ID,ID,...]"""
import json,re,sys,glob,os
SPLIT=re.compile(r'(?<=[.!?])\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ])')
out_path=sys.argv[1]; want=sys.argv[2] if len(sys.argv)>2 else 'all'
inp=json.load(open('/tmp/ms/learn/input_all.json'))
res={}
# --- real files
for f in sorted(glob.glob('/tmp/ms/learn/out_*.json')):
    try:
        for d in json.load(open(f)): res[d['id']]=d
    except Exception as e: print('skip',f,e)
real=set(res)
# --- FR001 hand-made
d=json.load(open('/tmp/ms/fr001b.json'));c=d['card'];en=d['en']
p={n:SPLIT.split(c['demoA']['part'+str(n)].strip()) for n in (1,2)}
e1=[r[0] for r in en['p1']];e2=[r[0] for r in en['p2']]
e1[1]="One cannot help but note that marriage for all remains a subject that leaves the French far from indifferent… because while a majority has ended up accepting it, some religious and conservative circles still contest it."
chunks=[{'fr':x[2],'en':x[3]} for x in en['ch'][:8]]
gaps=[]
for x in en['ch']:
    for n in (1,2):
        for s,t in enumerate(p[n]):
            if x[1] in t and 2<=len(x[1].split())<=6 and all((g['part'],g['s'])!=(n,s) for g in gaps) and len(gaps)<6:
                gaps.append({'part':n,'s':s,'cut':x[1],'hint':x[3]}); break
        else: continue
        break
gaps+= [g for g in [{'part':1,'s':0,'cut':"c'est précisément le genre de sujet qui",'hint':'it is precisely the kind of subject that'},{'part':1,'s':6,'cut':'Je reste quand même persuadé que','hint':'I nevertheless remain convinced that'}] if g['cut'] in p[g['part']][g['s']]]
errs=[("Alors, c'est une excellente question parce que c'est précisément le genre de sujet qui continue à diviser la société français depuis l'adoption de la loi.","Alors, c'est une excellente question parce que c'est précisément le genre de sujet qui continue à diviser la société française depuis l'adoption de la loi.","« Société » is feminine, so the adjective is « française »."),
("Il ressort de l'exemple de la loi Taubira, adopté en 2013 après plusieurs mois de débats et de manifestations, que… malgré l'opposition très forte du mouvement La Manif pour tous, le législateur est allé jusqu'au bout.","Il ressort de l'exemple de la loi Taubira, adoptée en 2013 après plusieurs mois de débats et de manifestations, que… malgré l'opposition très forte du mouvement La Manif pour tous, le législateur est allé jusqu'au bout.","The participle agrees with « la loi » (feminine)."),
("Si la loi Taubira n'aurait pas été adoptée en 2013… peut-être que l'opinion n'aurait jamais appris à voir les couples homosexuels mariés comme une réalité ordinaire.","Si la loi Taubira n'avait pas été adoptée en 2013… peut-être que l'opinion n'aurait jamais appris à voir les couples homosexuels mariés comme une réalité ordinaire.","After « si » in a hypothesis about the past: pluperfect, never the conditional.")]
errors=[]
for w,r,why in errs:
    for n in (1,2):
        if r in p[n]: errors.append({'part':n,'s':p[n].index(r),'wrong':w,'right':r,'why':why})
fr001={'id':'0A','en':{'p1':e1,'p2':e2},'chunks':chunks,'gaps':gaps,'errors':errors}
if '0A' not in res: res['0A']=fr001
# --- synthetic for all the rest
for x in inp:
    id=str(x['i'])+x['k']
    if id in res: continue
    P={1:x['p1'],2:x['p2']}
    en={'p1':['(English) '+s for s in P[1]],'p2':['(English) '+s for s in P[2]]}
    ch=[];gp=[];er=[]
    for n in (1,2):
        for s,t in enumerate(P[n]):
            w=t.split()
            if len(ch)<7 and len(w)>=5 and s%2==0: ch.append({'fr':' '.join(w[:3])+' X','en':'(frame) '+' '.join(w[:3])+' X'})
            if len(gp)<6 and len(w)>=8 and s%2==1:
                cut=' '.join(w[2:5])
                if cut in t: gp.append({'part':n,'s':s,'cut':cut,'hint':'(clue) '+cut})
            if len(er)<3 and len(w)>=8 and s%3==0:
                for a,b in ((' est ',' sont '),(' de ',' des '),(' le ',' la '),(' les ',' le ')):
                    if a in t:
                        er.append({'part':n,'s':s,'wrong':t.replace(a,b,1),'right':t,'why':'(synthetic) rule note'}); break
    res[id]={'id':id,'en':en,'chunks':ch,'gaps':gp,'errors':er,'_synthetic':True}
if want!='all':
    keep=set(want.split(','));res={k:v for k,v in res.items() if k in keep}
json.dump(res,open(out_path,'w'),ensure_ascii=False,separators=(',',':'))
print('wrote',out_path,len(res),'demos;',len(real),'real from out_NN;','FR001 hand-made')
