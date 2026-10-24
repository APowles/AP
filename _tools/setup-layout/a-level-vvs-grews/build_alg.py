import re,sys,base64,json
R='/home/claude/ap'
D=R+'/_tools/setup-layout/a-level-vvs-grews'
def icons():
    d={}
    for k in ['drill','speed','leis','test','spell_fr','spell_it','spell_es','match_fr','match_it','match_es']:
        d[k]='data:image/webp;base64,'+base64.b64encode(open(f'{R}/icons/{k}.webp','rb').read()).decode()
    return d
def build(path):
    t=open(path,encoding='utf-8').read()
    # idempotent: drop any earlier block first
    t=re.sub(r'<style id="ap-grsetup-css">.*?</style><script id="ap-grsetup">.*?</script>','',t,flags=re.S)
    css=open(D+'/alg.css',encoding='utf-8').read()
    js=open(D+'/alg.js',encoding='utf-8').read()
    js=js.replace("var ICONS = {};","var ICONS = "+json.dumps(icons())+";",1)
    blk='<style id="ap-grsetup-css">'+css+'</style><script id="ap-grsetup">\n'+js+'</script>'
    i=t.rfind('</script>')+len('</script>')
    t=t[:i]+blk+t[i:]
    open(path,'w',encoding='utf-8').write(t)
if __name__=='__main__':
    for p in (sys.argv[1:] or [R+'/Eton A Level French VVs & Gr EWs & Grammar Translation Practice and Drills.html',R+'/AP All Languages - A Level French VVs & Gr EWs & Grammar Translation Practice and Drills.html']): build(p)
