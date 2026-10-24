import re,sys,base64,json,os
R='/home/claude/ap'
D=R+'/_tools/setup-layout/igcse-vocab-essentials'
def icons(es):
    d={}
    ks=['drill','speed','leis','test','spell_fr','spell_it','match_fr','match_it']+(['spell_es','match_es'] if es else [])
    for k in ks:
        d[k]='data:image/webp;base64,'+base64.b64encode(open(f'{R}/icons/{k}.webp','rb').read()).decode()
    return d
def build(path):
    t=open(path,encoding='utf-8').read()
    t=re.sub(r'<style id="ap-setup-css">.*?</style><script id="ap-setup">.*?</script>','',t,flags=re.S)
    es='es:"Spanish"' in t.replace(' ','')
    css=open(D+'/setup.css',encoding='utf-8').read()
    js=open(D+'/ve.js',encoding='utf-8').read()
    assert 'var ICONS = {};' in js
    js=js.replace('var ICONS = {};','var ICONS = '+json.dumps(icons(es))+';',1)
    blk='<style id="ap-setup-css">'+css+'</style><script id="ap-setup">\n'+js+'</script>'
    i=t.rfind('</script>')+len('</script>')
    t=t[:i]+blk+t[i:]
    open(path,'w',encoding='utf-8').write(t)
    print('built',os.path.basename(path),'es' if es else 'no-es',len(t))
for p in sys.argv[1:]: build(p)
