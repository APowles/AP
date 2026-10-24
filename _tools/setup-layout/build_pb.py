import re,sys,base64,os
R='/home/claude/ap'
def icons():
    d={}
    for k in ['drill','speed','leis','test','spell_fr','spell_it','spell_es','match_fr','match_it','match_es']:
        d[k]='data:image/webp;base64,'+base64.b64encode(open(f'{R}/icons/{k}.webp','rb').read()).decode()
    return d
def build(path):
    t=open(path,encoding='utf-8').read()
    t=re.sub(r'<style id="ap-setup-css">.*?</style><script id="ap-setup">.*?</script>','',t,flags=re.S)
    if 'pbPool(' not in t:
        a=t.count("let _fromLang='en', _toLang='fr', _catVal='all'")
        assert a==1,a
        t=t.replace("_catVal='all', _selectedCount=10","_catVal='', _selectedCount=10;\nvar pbPool=function(v){var o=['react','point','media','example','analyse','opinion','hypo','conclude','interact','lead_back','lead_fwd'],k=['toolkit_org','toolkit_dist','toolkit_add','toolkit_hl','toolkit_ex','toolkit_conf','toolkit_rest','toolkit_concl','causes','conseq','goals','oppos','concede','compare'];return !v?[]:v==='all'?ALL_PHRASES:v==='oral_all'?ALL_PHRASES.filter(p=>o.includes(p.cat)):v==='toolkit_all'?ALL_PHRASES.filter(p=>k.includes(p.cat)):ALL_PHRASES.filter(p=>p.cat===v);}   // replaced by the set-up block at the end of the page")
        t,n1=re.subn(r"let pool=_catVal==='all'\?ALL_PHRASES:.*?ALL_PHRASES\.filter\(p=>p\.cat===_catVal\);","let pool=pbPool(_catVal);",t,flags=re.S)
        t,n2=re.subn(r"const phrases=v==='all'\?ALL_PHRASES:.*?ALL_PHRASES\.filter\(p=>p\.cat===v\);","const phrases=pbPool(v);",t,flags=re.S)
        assert (n1,n2)==(2,1),(n1,n2)
    css=open(R+'/_tools/setup-layout/setup.css',encoding='utf-8').read()
    js=open(R+'/_tools/setup-layout/pb.js',encoding='utf-8').read()
    ic=icons()
    js=js.replace("var ICONS = {};","var ICONS = "+__import__('json').dumps(ic)+";",1)
    blk='<style id="ap-setup-css">'+css+'</style><script id="ap-setup">\n'+js+'</script>'
    i=t.rfind('</script>')+len('</script>')
    t=t[:i]+blk+t[i:]
    open(path,'w',encoding='utf-8').write(t)
for p in sys.argv[1:]: build(p)
