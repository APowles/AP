import json,sys,re
SP="/tmp/claude-0/-home-claude/5d1c4334-7c31-5c63-bb77-7f8672935c5f/scratchpad/"
VERBS={"Say","Give","Name","Explain","Describe","Compare","Outline","Define"}
bad=0
for n in sys.argv[1:]:
    inp=json.load(open(SP+f"in/ktr{n}.json",encoding='utf-8'))
    try: o=json.load(open(SP+f"out/ktr{n}.json",encoding='utf-8'))
    except Exception as e: print(n,'CANNOT READ OUTPUT',e);bad+=1;continue
    P=[];I=o.get('ican',[])
    if len(I)!=15:P.append(f'{len(I)} points, need 15')
    t={}
    for p in I:t[p.get('tier')]=t.get(p.get('tier'),0)+1
    if set(t)-{'Essential','Important','Bonus'}:P.append(f'bad tiers {t}')
    if not(5<=t.get('Essential',0)<=7 and 4<=t.get('Important',0)<=6 and 3<=t.get('Bonus',0)<=5):P.append(f'tier counts {t} (want about 6/5/4)')
    seen=set()
    for j,p in enumerate(I):
        pr=p.get('prompt','');fr=p.get('fr','');en=p.get('en','')
        if not pr or pr.split()[0] not in VERBS:P.append(f'{j+1}: prompt must start with one of {sorted(VERBS)}: {pr[:40]}')
        if pr in seen:P.append(f'{j+1}: duplicate prompt')
        seen.add(pr)
        if not fr.strip():P.append(f'{j+1}: empty fr')
        if len(en.strip())<25:P.append(f'{j+1}: gloss missing or too short')
        if re.search(r'\bpoints? \d|see point|\(see\b|above|below',en,re.I):P.append(f'{j+1}: gloss cross-reference')
        if re.search(r'\b(he|his|him)/(she|her)\b|\b(she|her)/(he|his|him)\b',pr+' '+en,re.I):P.append(f'{j+1}: pronoun slash')
        if re.search(r'\b(translate|translation|conjugate|subjunctive|tense|vocabulary)\b',pr,re.I):P.append(f'{j+1}: linguistic prompt')
        if re.match(r"\s*(Il|Elle|Ils|Elles|Ce|Cet|Cette|Ces|Celui|Celle|Ceux|Elles)\b(?!\s*y\b)",fr) and j>2:P.append(f'{j+1}: fr opens with a pronoun/demonstrative with no antecedent (stand-alone test): {fr[:40]}')
        v0=pr.split()[0] if pr else ''
        if v0=='Compare' and not re.search(r'\b(contre|pour|par rapport|plus|moins|alors que|tandis que|que|supérieur\w*|inférieur\w*|entre|mais|et|ou|chacun|chacune)\b',fr):P.append(f'{j+1}: Compare prompt but fr has no comparison')
        if v0=='Explain' and len(fr.split())<8:P.append(f'{j+1}: Explain prompt but fr is too short to contain a reason')
        if v0=='Say' and re.match(r'Say what .* (is|was|are|were|means)\.?$',pr) and not re.search(r"\b(est|sont|était|étaient|désigne|désignent|signifie|c'est|ce sont)\b|,",fr):P.append(f'{j+1}: definition prompt but fr does not say what it is')
        m=re.search(r'\b(two|three|four|five)\b',pr)
        if v0=='Name' and m:
            n_=dict(two=2,three=3,four=4,five=5)[m.group(1)]
            if len(re.findall(r',| et | ou ',fr))<n_-1:P.append(f'{j+1}: Name {m.group(1)} but fr lists fewer')
        if fr.strip()[-1:] not in '.!?»)':P.append(f'{j+1}: fr should end with a full stop')
    for j,key in enumerate(['short_definition','short_example','short_analysis']):
        if I and I[j].get('fr')!=inp[key]['fr']:P.append(f'{j+1}: fr must equal {key}.fr word for word')
    for q in o.get('tense',[]):
        if not q.get('old') or q['old']==q.get('new'):P.append(f'tense pair invalid {q}')
    if P:
        bad+=1;print(f'KTR {n}: PROBLEMS');[print('  -',x) for x in P]
    else: print(f'KTR {n}: ok {t}')
print('problems in',bad,'KTRs')
