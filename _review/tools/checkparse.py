import json,sys,re,time
sys.path.insert(0,'.')
from apply import *
A='../all/'
DUMP={'ALL_TOPICS':'A_Level_French_Oral_Topics_Pap__ALL_TOPICS','ORAL_CARDS':'A_Level_French_Oral_Topics_Pap__ORAL_CARDS','TOPICS_DEMO_EN':'A_Level_French_Oral_Topics_Pap__TOPICS_DEMO_EN','TR_PASSAGES':'A_Level_French_VVs_Gr_EWs_Gram__TR_PASSAGES','MLF_DATA':'A_Level_French_VVs_Gr_EWs_Gram__MLF_DATA','ALL_PHRASES_PB':'A_Level_Oral_Phrase_Bank__ALL_PHRASES','CARDS':'IGCSE_AP_Structures_Oral_and_W__CARDS','IGCSE_CARDS':'IGCSE_AP_Structures_Oral_and_W__IGCSE_CARDS','IGCSE_CARDS_IT':'IGCSE_AP_Structures_Oral_and_W__IGCSE_CARDS_IT','IGCSE_CARDS_ES':'IGCSE_AP_Structures_Oral_and_W__IGCSE_CARDS_ES','AM_DATA':'IGCSE_Approved_Material_Practi__AM_DATA','PAPERS':'IGCSE_French_Listening__PAPERS','VE_ALL_PHRASES':'IGCSE_Vocab_Essentials__ALL_PHRASES','VE_VOCAB_PHRASES':'IGCSE_Vocab_Essentials__VOCAB_PHRASES','GEP_PHRASES':'Gen_Essential_Phrases__ALL_PHRASES','FSV_PHRASES':'F_Spanish_Vocab__ALL_PHRASES'}
def norm(o):
    # JSON.stringify semantics: undefined in arrays->null
    return json.loads(json.dumps(o))
cache={}
for ds in list(CFG):
    f=CFG[ds][0]
    if f not in cache: cache[f]=open(AP+f).read()
    t=time.time(); roots=locate(cache[f],ds)
    for r in roots:
        py=norm(to_py(r))
        if ds.startswith('TM_'):
            s=cache[f]; m=re.search(TMRE+r'(.*?)</script>',s,re.S); ref=json.loads(m.group(1))[ds[3:].lower()]
        else: ref=json.load(open(A+DUMP[ds]+'.json'))
        print(ds, 'OK' if py==ref else 'DIFF', len(py), round(time.time()-t,1))
