import re,sys,base64,json
R='/home/claude/ap'
D=R+'/_tools/setup-layout/gen-essential-phrases'
def icons():
    d={}
    for k in ['drill','speed','leis','test','spell_fr','spell_it','spell_es','match_fr','match_it','match_es']:
        d[k]='data:image/webp;base64,'+base64.b64encode(open(f'{R}/icons/{k}.webp','rb').read()).decode()
    return d
def build(path):
    t=open(path,encoding='utf-8').read()
    # idempotent: drop any earlier block first
    t=re.sub(r'<style id="ap-setup-css">.*?</style><script id="ap-setup">.*?</script>','',t,flags=re.S)
    # small source edit: the #ep= deep link's landing hands over to the new layout when it is present
    if 'window.gepLand' not in t:
        a="  function land() {\n"
        assert t.count(a)==1,t.count(a)
        t=t.replace(a,"  function land() {\n    if (window.gepLand) { window.gepLand(); return; }\n",1)
    css=open(D+'/setup.css',encoding='utf-8').read()+open(D+'/gep.css',encoding='utf-8').read()
    js=open(D+'/gep.js',encoding='utf-8').read()
    js=js.replace("var ICONS = {};","var ICONS = "+json.dumps(icons())+";",1)
    blk='<style id="ap-setup-css">'+css+'</style><script id="ap-setup">\n'+js+'</script>'
    i=t.rfind('</script>')+len('</script>')
    t=t[:i]+blk+t[i:]
    open(path,'w',encoding='utf-8').write(t)
for p in sys.argv[1:]: build(p)
