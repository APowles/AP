import json,re,collections
D='/tmp/claude-0/-home-claude/5d1c4334-7c31-5c63-bb77-7f8672935c5f/scratchpad/ican/'
R={(2,14):"Discrimination means treating people worse because of who they are. The PACS gave fewer rights than marriage, so supporters wanted equal rights.",
(3,15):"Opponents said it refused equal rights for all, the opposite of the traditional view of marriage. Hostile acts against gay and lesbian people increased, which shows how heated the debate was.",
(5,8):"The 700,000 is rounded (the picture says 717,000). It matches the 9% figure: almost one family in ten.",
(7,3):"The hesitation is the central argument: repeating a year is one way to help, but critics doubt it works.",
(7,11):"A four-day week with the same lessons makes each school day longer, which adds to the heavy timetable.",
(7,13):"'Select' means filter out the weak, 'support' means help them. This is the central argument of the Education sub-theme.",
(7,14):"A second chance is the positive side of the debate. 'Lacunes' means gaps in knowledge. Critics answer that it does not work.",
(7,15):"The key figure is 'twice as often' at equal skills: it shows repeating depends on social background, not just ability, so it is unfair. It answers the defenders' 'second chance' argument.",
(8,1):"The reform removed the three old streams (L, ES, S), so every pupil follows a common core plus chosen subjects.",
(8,2):"40% plus the 60% from the final exams makes 100%. A figure this big is the best proof that the year's work now counts, not only the final exams.",
(8,3):"Modernising means matching the exam to how pupils really work. This is the reform's main argument; critics answer it with worries about equality and early choices.",
(8,7):"This is the terminale list of exams. Philosophy is written (4 hours), the grand oral is spoken (20 minutes).",
(8,12):"Three days (16, 17, 18 June) for the written specialism papers. These are the exams with the highest coefficient.",
(8,13):"These are the pro-reform arguments: less stress because the mark is spread over the year. Critics see it differently.",
(8,14):"The first worry is about equality between lycées and links to Parcoursup. The second is the 3-then-2 choice of subjects.",
(9,7):"So it is no longer luck: courses read each file, which is the meritocracy idea. Critics say files may favour the best-reputed lycées."}
for (n,i),t in R.items():
    p=D+f'ktr{n}.json'; d=json.load(open(p,encoding='utf-8')); d[i-1]['en']=t; json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
f="Eton A Level French Oral Topics & Paper 1 Practice.html"
s=open(f,encoding='utf-8').read(); L=s.split('\n')
k=[j for j,l in enumerate(L) if l.startswith('const DATA=')][0]
dd,e=json.JSONDecoder().raw_decode(L[k][11:]); tail=L[k][11+e:]
pr=re.compile(r"(\S+(?: \S+){0,3}) \(([^()]+)\)")
for sub in dd['subs']:
    for kt in sub['ktrs']:
        ic=kt.get('ican')
        if not ic: continue
        n=kt['n']
        for x in ic:
            t=R.get((n,ic.index(x)+1))
            if t: x['en']=t
        cnt=collections.defaultdict(list)
        for x in ic:
            for m in pr.finditer(x['prompt']): cnt[m.group(2)].append(m.group(1).split())
        best=max(cnt.items(),key=lambda kv:len(kv[1]),default=None)
        kt.pop('icanSub',None)
        if best and len(best[1])>=4:
            g,occ=best; suf=[]
            for w in zip(*[o[::-1] for o in occ]):
                if len(set(w))==1: suf.append(w[0])
                else: break
            suf=suf[::-1]
            if suf:
                fr=' '.join(suf); kt['icanSub']={'fr':fr,'en':g}
                for x in ic: x['prompt']=x['prompt'].replace(fr+' ('+g+')',fr)
                print(n,'sub:',fr,'=',g)
L[k]='const DATA='+json.dumps(dd,ensure_ascii=False,separators=(',',':'))+tail
open(f,'w',encoding='utf-8').write('\n'.join(L))
pat=re.compile(r'\bpoints?\s+\d+',re.I)
print('refs left',sum(1 for sub in dd['subs'] for kt in sub['ktrs'] for x in kt.get('ican',[]) if pat.search(x['en'])))
