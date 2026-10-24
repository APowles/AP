import re,sys,base64,os,json
R='/home/claude/ap'; D=R+'/_tools/setup-layout/igcse-structures'
def icons():
    d={}
    for k in ['drill','speed','leis','test','spell_fr','spell_it','spell_es','match_fr','match_it','match_es']:
        d[k]='data:image/webp;base64,'+base64.b64encode(open(f'{R}/icons/{k}.webp','rb').read()).decode()
    return d
EDITS=[
 # (old, new)  each old must occur exactly once in a fresh file; skipped if the new text is already there
 ("var pool = CARDS.filter(function (c) { return sectionMatches(c.section, filterVal); }).filter(function (c) { return c[f] && c[t]; });",
  "var pool = stPool(filterVal).filter(function (c) { return c[f] && c[t]; });"),
 ("const filtered = CARDS.filter(c => sectionMatches(c.section, currentSection || 'all'));",
  "const filtered = stPool(currentSection || 'all');"),
 ("let pool = CARDS.filter(c => sectionMatches(c.section, filterVal));",
  "let pool = stPool(filterVal);"),
 ("var pool = CARDS.filter(function(c){ return sectionMatches(c.section, sec); });\n  pool = pool.filter(function(c){ return c[f] && c[t]; });",
  "var pool = stPool(sec);\n  pool = pool.filter(function(c){ return c[f] && c[t]; });"),
 ("function getMSPhrases(){\n  return CARDS.filter(c => sectionMatches(c.section, currentSection || 'all'));\n}",
  "function getMSPhrases(){\n  return stPool(currentSection || 'all');\n}"),
 ("let editModeUnlocked = false;\n",
  "let editModeUnlocked = false;\nvar stPool = function (sec) { return CARDS.filter(function (c) { return sectionMatches(c.section, sec || 'all'); }); };   // replaced by the set-up block at the end of the page\n"),
 ("populateSectionFilter();\ncurrentSection = 'all';\nstartDrillSession();",
  "populateSectionFilter();\ncurrentSection = null;   // nothing preselected: the boy chooses the sections himself\nstartDrillSession();"),
 ("if (!majorErrors.find(p => p.n === errPhrase.n && p.section === errPhrase.section)) {",
  "if (!majorErrors.find(p => p.en === errPhrase.en && p.section === errPhrase.section)) {"),
 ("""<div style="font-size:0.75rem;font-weight:700;color:#8899bb;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Answer Sheet</div>
    <div style="background:#fff;border:1px solid #e2e6f0;border-radius:10px;padding:12px 16px;">${answers}</div>`;""",
  """<details class="ms-ansdet"><summary style="cursor:pointer;font-size:0.9375rem;font-weight:700;color:#1a2744;padding:10px 0;min-height:44px">Show answers</summary>
    <div style="background:#fff;border:1px solid #e2e6f0;border-radius:10px;padding:12px 16px;">${answers}</div></details>`;"""),
]
def build(path):
    t=open(path,encoding='utf-8').read()
    t=re.sub(r'<style id="ap-setup-css">.*?</style><script id="ap-setup">.*?</script>','',t,flags=re.S)
    for old,new in EDITS:
        if new in t and old not in t: continue
        assert t.count(old)==1,(path,old[:60],t.count(old))
        t=t.replace(old,new)
    css=open(D+'/setup.css',encoding='utf-8').read()
    js=open(D+'/st.js',encoding='utf-8').read()
    js=js.replace("var ICONS = {};","var ICONS = "+json.dumps(icons())+";",1)
    blk='<style id="ap-setup-css">'+css+'</style><script id="ap-setup">\n'+js+'</script>'
    i=t.rfind('</script>')+len('</script>')
    t=t[:i]+blk+t[i:]
    open(path,'w',encoding='utf-8').write(t)
    print('built',path)
for p in sys.argv[1:]: build(p)
