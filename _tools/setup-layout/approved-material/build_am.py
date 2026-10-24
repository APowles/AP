"""Builds the two-step set-up layout into the Approved Material / Practice Sentences app (both twins).
Usage: python3 build_am.py [file ...]   (default: the Eton file and the AP All Languages twin)
Idempotent: source edits are applied only when missing; the appended block is replaced each run."""
import re, sys, base64, json, os
R = '/home/claude/ap'
D = R + '/_tools/setup-layout/approved-material'
FILES = [R + '/Eton IGCSE Approved Material Practice Sentences.html', R + '/AP All Languages - IGCSE Approved Material Practice Sentences.html']

def icons():
    d = {}
    for k in ['drill', 'speed', 'leis', 'test', 'spell_fr', 'spell_it', 'spell_es', 'match_fr', 'match_it', 'match_es']:
        d[k] = 'data:image/webp;base64,' + base64.b64encode(open(f'{R}/icons/{k}.webp', 'rb').read()).decode()
    return d

def fn_span(t, name):
    i = t.index('function ' + name + '(')
    j = t.index('\n}\n', i) + 3
    return i, j

def swap_fn(t, name, new):
    i, j = fn_span(t, name)
    return t[:i] + new + t[j:]

def port_to_ap(t):
    """The AP All Languages twin still preselects the first section and uses the old Section / Topic pickers.
    Bring it to the same 'nothing chosen yet' behaviour as the Eton file (topics box, Overview of Topics)."""
    if "Choose your topics to begin" in t:
        return t
    P = json.load(open(D + '/port_from_eton.json', encoding='utf-8'))
    ri = P['renderIntro'].replace("const flags = {en:'🇬🇧',fr:'🇫🇷',it:'🇮🇹'};", "const flags = {en:'🇬🇧',fr:'🇫🇷',it:'🇮🇹',es:'🇪🇸'};") \
                         .replace("const names = {en:'English',fr:'French',it:'Italian'};", "const names = {en:'English',fr:'French',it:'Italian',es:'Spanish'};")
    assert 'es:' in ri
    for n in ['renderIntro', 'populateSectionSelect', 'amFilterTopics', 'introStartDrill', 'introStartLeisure', 'openAMOverview', 'amOverviewUse', 'amEnhanceOverview']:
        t = swap_fn(t, n, ri if n == 'renderIntro' else P[n])
    # Tick all in the Overview
    if 'function amOverviewAll' not in t:
        k = t.index('function amOverviewClear(){')
        t = t[:k] + P['amOverviewAll'] + t[k:]
    # css
    k = t.index('.am-tools4{grid-template-columns:repeat(2,minmax(0,1fr))}')
    t = t[:k] + P['css'] + t[k:]
    return t

def source_edits(t):
    # 1. each card knows which sentence it is; the personalised set can filter the pool
    if '_sub: sub, _pi: i' not in t:
        i, j = fn_span(t, 'getPool')
        g = t[i:j]
        a = "if (phrase[fromLang] && phrase[toLang]) {"
        assert g.count(a) == 1
        g = g.replace(a, "if (phrase[fromLang] && phrase[toLang] && (currentSection !== '__MY__' || (typeof amMyHas === 'function' && amMyHas(sub, i)))) {")
        assert g.count('fromLang, toLang })') == 1
        g = g.replace('fromLang, toLang })', 'fromLang, toLang, _sub: sub, _pi: i })')
        t = t[:i] + g + t[j:]
    # 2. the personalised set covers every topic of the current set
    if "currentSection === '__MY__'" not in fn_span_text(t, 'amFilterTopics'):
        a = "  if (!currentSection) return [];\n  if (currentSection === '__MULTI__')"
        assert t.count(a) == 1
        t = t.replace(a, "  if (!currentSection) return [];\n  if (currentSection === '__MY__') return D.filter(subMatches);   // ★ My personalised set\n  if (currentSection === '__MULTI__')")
    # 3. on-screen test: the answer sheet waits behind a Show answers button
    if 'amShowAnsBtn' not in t:
        a = """<div style="font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">ANSWER SHEET</div>
    <div style="background:#f9f7f2;border-radius:8px;padding:12px;border:1px solid #e0e0e0;">${answers}</div>`;"""
        assert t.count(a) == 1
        t = t.replace(a, """<div style="margin:2px 0 10px;"><button type="button" id="amShowAnsBtn" class="aph-btn aph-btn-sm" onclick="document.getElementById('amAnsBox').style.display='block';this.style.display='none'">&#128065; Show answers</button></div>
    <div id="amAnsBox" style="display:none;"><div style="font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">ANSWER SHEET</div>
    <div style="background:#f9f7f2;border-radius:8px;padding:12px;border:1px solid #e0e0e0;">${answers}</div></div>`;""")
    # 4. a teacher drill link (EW) cannot be made from a boy's personalised set
    if "private to each boy" not in t:
        a = "      syncFromDom();\n      var pool = getPool();"
        assert t.count(a) == 1
        t = t.replace(a, "      syncFromDom();\n      if (currentSection === '__MY__') return { why: 'A personalised set is private to each boy, so it cannot be set as an EW. Choose topics first.' };\n      var pool = getPool();")
    return t

def fn_span_text(t, name):
    i, j = fn_span(t, name)
    return t[i:j]

def build(path):
    t = open(path, encoding='utf-8').read()
    t = re.sub(r'<style id="ap-setup-css">.*?</style><script id="ap-setup">.*?</script>', '', t, flags=re.S)
    if 'All Languages' in os.path.basename(path):
        t = port_to_ap(t)
    t = source_edits(t)
    css = open(D + '/setup.css', encoding='utf-8').read() + open(D + '/am.css', encoding='utf-8').read()
    js = open(D + '/am.js', encoding='utf-8').read()
    js = js.replace("var ICONS = {};", "var ICONS = " + json.dumps(icons()) + ";", 1)
    blk = '<style id="ap-setup-css">' + css + '</style><script id="ap-setup">\n' + js + '</script>'
    i = t.rfind('</script>') + len('</script>')
    t = t[:i] + blk + t[i:]
    open(path, 'w', encoding='utf-8').write(t)
    print('built', os.path.basename(path), len(t))

if __name__ == '__main__':
    for p in (sys.argv[1:] or FILES):
        build(p)
