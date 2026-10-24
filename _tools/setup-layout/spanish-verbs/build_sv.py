import re,sys,base64,os,json
R='/home/claude/ap'
D=R+'/_tools/setup-layout/spanish-verbs'
def icons():
    d={}
    for k in ['drill','speed','leis','test','spell_es','match_es']:
        d[k]='data:image/webp;base64,'+base64.b64encode(open(f'{R}/icons/{k}.webp','rb').read()).decode()
    return d
def build(path):
    t=open(path,encoding='utf-8').read()
    # idempotent: drop any earlier block first
    t=re.sub(r'<style id="ap-setup-css">.*?</style><script id="ap-setup">.*?</script>','',t,flags=re.S)
    css=open(D+'/setup.css',encoding='utf-8').read()
    js=open(D+'/sv.js',encoding='utf-8').read()
    js=js.replace("var ICONS = {};","var ICONS = "+json.dumps(icons())+";",1)
    blk='<style id="ap-setup-css">'+css+'</style><script id="ap-setup">\n'+js+'</script>'
    i=t.rfind('</script>')+len('</script>')
    t=t[:i]+blk+t[i:]
    open(path,'w',encoding='utf-8').write(t)
if __name__=='__main__':
    build(sys.argv[1] if len(sys.argv)>1 else R+'/Eton Spanish Verbs.html')
