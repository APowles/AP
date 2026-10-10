import json,sys,re
sys.path.insert(0,'.')
from apply import expected, CFG, TMRE, AP
from checkparse_map import DUMP
fixes=json.load(open(sys.argv[1]))
before={};after={}
for ds,fn in DUMP.items():
    before[ds]=json.load(open('../all_before/'+fn+'.json')); after[ds]=json.load(open('../all/'+fn+'.json'))
for lang in ['fr','it','es']:
    pass
exp=expected([f for f in fixes if not f['ds'].startswith('TM_')],before)
bad=0
for ds in DUMP:
    if exp[ds]!=after[ds]:
        bad+=1; e,a=exp[ds],after[ds]
        ks=range(len(e)) if isinstance(e,list) else e.keys()
        diffs=[k for k in ks if e[k]!=a[k]]
        print('MISMATCH',ds,len(diffs),diffs[:5])
    else: print('ok',ds)
# GEP second copy
g2=json.load(open('../all/Gen_Essential_Phrases__VOCAB_PHRASES.json')); print('GEP copy2', 'ok' if g2==after['GEP_PHRASES'] else 'MISMATCH')
