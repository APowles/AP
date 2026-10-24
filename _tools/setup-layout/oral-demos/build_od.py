#!/usr/bin/env python3
"""Build the "Learn from this demo" feature into the A Level Oral Topics page. Idempotent: run it again on an already built file
(or on a fresh copy of the original) and it gives the same result.

  python3 build_od.py "<Eton A Level French Oral Topics & Paper 1 Practice.html>" [demo_learn.json]

  * demo_learn.json = {id: {en:{p1,p2}, chunks, gaps, errors}}  (id = ORAL_CARDS index + side, e.g. "12A").
    It is injected as <script id="demo-learn-data">const DEMO_LEARN=...;</script>, kept apart from the UI code.
    Without a data file the page gets an empty DEMO_LEARN (every demo then degrades to Read it again, Have a go, Facts and the old sheet).
  * One small source edit: the card's "Translation sheet" button becomes "Learn from this demo" (the old sheet is reached from inside it).
  * Appended after the last </script>: the data block, then <style id="ap-od-css"> and <script id="ap-od">.
There is no "AP All Languages" twin of this page (the AP page is only a redirect stub), so only the Eton file is built."""
import sys,os,json,base64
HERE=os.path.dirname(os.path.abspath(__file__))
R='/home/claude/ap'
OLD_BTN=("""      + ((typeof TOPICS_DEMO_EN !== 'undefined' && TOPICS_DEMO_EN[card['code' + choice]]) ? '<button class="aph-btn" onclick="openTopicsTranslationSheet(\\'' + uid + '\\',\\'' + choice + '\\')" style="flex:0 0 auto;">&#128424; Translation sheet</button>' : '')""")
NEW_BTN=("""      + '<button class="aph-btn" onclick="apDemoLearn(\\'' + uid + '\\',\\'' + choice + '\\')" style="flex:0 0 auto;background:#fdf3dc;border-color:#c9a84c;color:#8a5c00;font-weight:700;">&#127891; Learn from this demo</button>'""")
def cut(t,start_marker,end_marker):
    """remove every block that starts with start_marker and ends with the next end_marker"""
    while True:
        i=t.find(start_marker)
        if i<0: return t
        j=t.find(end_marker,i)
        assert j>0,start_marker
        t=t[:i]+t[j+len(end_marker):]
def icons():
    d={}
    for k in ['drill','speed','test']:
        d[k]='data:image/webp;base64,'+base64.b64encode(open(f'{R}/icons/{k}.webp','rb').read()).decode()
    return d
def build(path,data_path=None):
    t=open(path,encoding='utf-8').read()
    # 1. strip earlier output
    t=cut(t,'<script id="demo-learn-data">','</script>')
    t=cut(t,'<style id="ap-od-css">','</style>')
    t=cut(t,'<script id="ap-od">','</script>')
    # 2. the one source edit
    if OLD_BTN in t:
        assert t.count(OLD_BTN)==1,t.count(OLD_BTN)
        t=t.replace(OLD_BTN,NEW_BTN)
    assert NEW_BTN in t,'card button edit did not apply'
    # 3. data
    data={}
    if data_path:
        data=json.load(open(data_path,encoding='utf-8'))
        assert isinstance(data,dict)
        bad=[k for k,v in data.items() if not (isinstance(v,dict) and 'en' in v)]
        assert not bad,('entries without en',bad[:5])
    blob=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
    dblock='<script id="demo-learn-data">const DEMO_LEARN='+blob+';</script>'
    # 4. UI
    css=open(R+'/_tools/setup-layout/setup.css',encoding='utf-8').read()+'\n'+open(HERE+'/od.css',encoding='utf-8').read()
    js=open(HERE+'/od.js',encoding='utf-8').read()
    assert 'var ICONS = {};' in js
    js=js.replace('var ICONS = {};','var ICONS = '+json.dumps(icons())+';',1)
    assert '</script' not in js
    blk=dblock+'<style id="ap-od-css">'+css+'</style><script id="ap-od">\n'+js+'</script>'
    i=t.rfind('</script>')+len('</script>')
    t=t[:i]+blk+t[i:]
    open(path,'w',encoding='utf-8').write(t)
    print('built',path,'| demos with data:',len(data),'| size',len(t))
if __name__=='__main__':
    a=sys.argv[1:]
    assert a,__doc__
    build(a[0],a[1] if len(a)>1 else None)
