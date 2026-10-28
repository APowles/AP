#!/usr/bin/env python3
"""Build 'Eton F Block Spanish.html' (the public F Block file) from the two Eton Spanish files.
Run from the repo root:  python3 _tools/fblock/build.py   (then python3 _tools/version/stamp.py)

The new file is a small front page (the router) that holds two complete apps as text and writes the right one into the page:
  Vocab                      <- Eton F Spanish Vocab.html
  Verbs and Grammar          <- Eton Spanish Verbs.html, stripped to the 100 Core Verbs, the F Block tenses
                                (Infinitives, Present, Preterite, Future) and the F Block Trials sets.
Nothing in the two source files is changed by this script; run it again after any F Block change to them."""
import re, json, sys, os, base64

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
VERBS_SRC = os.path.join(ROOT, 'Eton Spanish Verbs.html')
VOCAB_SRC = os.path.join(ROOT, 'Eton F Spanish Vocab.html')
OUT = os.path.join(ROOT, 'Eton F Block Spanish.html')
TITLE = 'Eton F Block Spanish'
KEEP_T = ('PRESENT', 'PRETERITE', 'FUTURE')
dec = json.JSONDecoder()
M_SCRIPT = '⟦/script'   # stands in for "</script" inside the text payloads
M_COMM = '⟦!--'         # stands in for "<!--"


def rep(s, a, b, n=1, what=''):
    c = s.count(a)
    if c != n:
        sys.exit('REPLACE FAILED (%s): expected %d, found %d: %s' % (what, n, c, a[:90]))
    return s.replace(a, b)


def strip_stamps(s):
    s = re.sub(r'<script id="ap-update">.*?</script>\n?', '', s, flags=re.S)
    s = re.sub(r'<script id="ap-newver-js">.*?</script>\n?', '', s, flags=re.S)
    s = re.sub(r'<script id="ap-build">[^<]*</script>\n?', '', s)
    return s


def filt_json_after(s, prefix, keep, nmin=1):
    """find every `prefix` followed by a JSON array of objects; keep only the items for which keep(item) is true"""
    out, pos, cur, n = [], 0, 0, 0
    while True:
        i = s.find(prefix, cur)
        if i < 0:
            break
        j = i + len(prefix)
        cur = j
        if s[j:j + 2] != '[{':
            continue
        arr, e = dec.raw_decode(s[j:])
        arr = [x for x in arr if keep(x)]
        out.append(s[pos:j])
        out.append(json.dumps(arr, ensure_ascii=False))
        pos = cur = j + e
        n += 1
    out.append(s[pos:])
    if n < nmin:
        sys.exit('no data found for ' + prefix)
    return ''.join(out), n


def icon_b64(name):
    return 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(HERE, 'icons', name + '.webp'), 'rb').read()).decode()


HUB_JS = r'''W.goHub = function () {
    var I = window.FB_ICONS || {};
    function card(on, key, name, desc, tags) { return '<div class="fbh-card" onclick="' + on + '"><img class="fbh-ic" src="' + (I[key] || '') + '" alt=""><div class="fbh-t">' + name + '</div><div class="fbh-d">' + desc + '</div><div class="fbh-tags">' + tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div><button type="button" class="fbh-btn" onclick="event.stopPropagation();' + on + '">&#9654; Start ' + name + '</button></div>'; }
    show('<div class="aph-wrap gh-hub"><div class="fbh-title">What would you like to practise?</div><div class="fbh-sub">Choose where to start</div><div class="fbh-grid">'
      + card('fbDoor(\'vocab\')', 'vocab', 'Vocab', 'Learn and test the F Block vocabulary, unit by unit, with audio.', ['Say it', 'Spell it', 'Match it', 'Tests'])
      + card('hmOpen(\'core\')', 'verbs', 'Verbs', 'The 100 Core Verbs: drills, tests and sentences, one tense at a time.', ['100 Core Verbs', 'Audio', 'Trials'])
      + card('gramMenu()', 'grammar', 'Grammar', 'Clear notes for beginners, step-by-step lessons, drills and tests.', ['Notes', 'Studio', 'Drills', 'Tests'])
      + '</div></div>');
  };
'''

HUB_CSS = r'''<style id="fb-hub-css">
/* the F Block Spanish front page and Grammar menu: the same cards as the A Level French home page */
.gh-hub{max-width:1000px}
.fbh-title{text-align:center;font:700 1.6rem/1.2 var(--aph-display,Georgia,serif);color:var(--navy);margin:18px 0 4px}
.fbh-sub{text-align:center;font-size:.8125rem;font-weight:600;color:var(--text3,#8a93a8);letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.6rem}
.fbh-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.fbh-card{background:var(--white,#fff);border:1px solid var(--border,#e2ddd0);border-radius:14px;padding:1.4rem 1.2rem 1.2rem;display:flex;flex-direction:column;align-items:center;text-align:center;cursor:pointer;transition:box-shadow .15s,transform .15s;box-shadow:var(--shadow)}
.fbh-card:hover{box-shadow:0 4px 20px rgba(26,39,68,.15);transform:translateY(-2px)}
.fbh-ic{width:96px;height:96px;object-fit:contain;display:block;margin-bottom:.7rem}
.fbh-t{font:700 1.15rem/1.2 var(--aph-display,Georgia,serif);color:var(--navy);margin-bottom:.4rem}
.fbh-d{font-size:.875rem;color:var(--text2);line-height:1.5;margin-bottom:.9rem;flex:1}
.fbh-tags{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin-bottom:1rem}
.fbh-tags span{font-size:.75rem;font-weight:700;color:var(--nearly,#9a7a1c);letter-spacing:.06em;text-transform:uppercase}
.fbh-tags span+span::before{content:"\00b7";margin-right:5px;color:var(--text3,#8a93a8)}
.fbh-btn{width:100%;border:0;cursor:pointer;background:var(--navy);color:var(--gold2,#ffd76a);font:600 .9375rem/1.25 var(--aph-body);border-radius:8px;padding:11px;min-height:44px}
.fbh-btn:hover{background:var(--navy2,#2c4180)}
/* Grammar menu: the six cards are the same cards, smaller */
#drill .gh-menu .gh-cards{grid-template-columns:repeat(3,1fr);gap:.9rem;align-items:stretch}
#drill .gh-menu .gh-card.fbh-done{background:var(--white,#fff);color:var(--navy);border:1px solid var(--border,#e2ddd0);border-radius:14px;padding:1.05rem .9rem .95rem;min-height:0;align-items:center;text-align:center;box-shadow:var(--shadow);gap:0}
#drill .gh-menu .gh-card.fbh-done{background:var(--white,#fff)!important;color:var(--navy)!important;border:1px solid var(--border,#e2ddd0)!important;margin:0!important;transform:none}
#drill .gh-menu .gh-card.fbh-done:hover{transform:translateY(-2px)}
#drill .gh-menu .gh-card.fbh-done .fbh-ic{width:80px;height:80px;margin-bottom:.45rem}
#drill .gh-menu .gh-card.fbh-done .fbh-t{font-size:1.05rem}
#drill .gh-menu .gh-card.fbh-done .fbh-d{font-size:.875rem;margin-bottom:.6rem}
@media (max-width:820px){.fbh-grid,#drill .gh-menu .gh-cards{grid-template-columns:1fr}}
</style>
'''


VERBS_TAIL = r'''<script id="fb-lock">
/* F Block Spanish: the front page is the start; the apps' own "start" screens that listed All Verbs / Specialist Structures never show */
(function () {
  window.fbDoor = function (d) {
    try { history.replaceState(null, '', location.pathname + location.search + (d === 'vocab' ? '#vocab' : '')); } catch (e) { }
    location.reload();
  };
  /* the Grammar menu: each card gets its glossy icon and the same card look as the front page */
  var GM = { STUDIO: ['studio', 'Studio'], NOTES: ['notes', 'Notes'], DRILLS: ['drills', 'Drills'], TESTS: ['tests', 'Tests'], 'SPOT TEST': ['spot', 'Spot Test'], SPEED: ['speed', 'Speed'] };
  function dress() {
    var I = window.FB_ICONS || {}, cs = document.querySelectorAll('#drill .gh-menu .gh-cards .gh-card:not(.fbh-done)');
    Array.prototype.forEach.call(cs, function (c) {
      var t = c.querySelector('.gh-t'), d = c.querySelector('.gh-s'); if (!t) return;
      var m = GM[String(t.textContent).trim().toUpperCase()]; if (!m) return;
      c.innerHTML = '<img class="fbh-ic" src="' + (I[m[0]] || '') + '" alt=""><div class="fbh-t">' + m[1] + '</div><div class="fbh-d">' + (d ? d.textContent : '') + '</div>';
      c.classList.add('fbh-done');
    });
  }
  try { new MutationObserver(dress).observe(document.getElementById('drill'), { childList: true, subtree: true }); } catch (e) { }
  window.addEventListener('hashchange', function () { if (/^#(vocab|vsec=|fvset=|sv=)/.test(location.hash)) location.reload(); });
  var ri = window.renderIntro;
  if (typeof ri === 'function') window.renderIntro = function () { if (window.apHome === 'landing' && typeof goHub === 'function') { goHub(); return; } return ri.apply(this, arguments); };
})();
</script>
'''

VOCAB_TAIL = r'''<script id="fb-back">
/* F Block Spanish: Back from the Vocab start screen goes to the F Block Spanish front page */
(function () {
  function up() { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } location.reload(); }
  function wire() { var c = window.APBK && APBK.cs && APBK.cs[0]; if (!c) return false; c.up = up; try { aphBackUpd(); } catch (e) { } return true; }
  if (!wire()) { var n = 0, t = setInterval(function () { if (wire() || ++n > 60) clearInterval(t); }, 250); }
})();
</script>
'''


def transform_verbs(s):
    s = s.replace("encodeURI('Eton F Spanish Vocab.html')", "encodeURI('Eton F Block Spanish.html')")
    s = strip_stamps(s)
    m = re.search(r"'Eton F Verbs': new Set\((\[.*?\])\)", s, re.S)
    core = set(json.loads(m.group(1)))
    assert len(core) == 100, len(core)
    keepv = lambda v: v.get('inf') in core and not v.get('group') and v.get('tense') in KEEP_T
    s, n = filt_json_after(s, 'const VERBS = ', keepv)
    # the Specialist Verb Structures: out
    i = s.find('const VR_STRUCT='); k = s.find('\n', i)
    s = s[:i] + 'const VR_STRUCT=[];' + s[k:]
    i = s.find('STRUCT_EN={'); k = s.find('\n', i)
    s = s[:i] + 'STRUCT_EN={};' + s[k:]
    keeps = lambda x: x.get('inf') in core and x.get('tense') in KEEP_T
    s, n = filt_json_after(s, 'const SENTENCES = ', keeps)
    s, n = filt_json_after(s, 'SENTENCES.push(...', keeps, 0)
    # ---- name and header
    s = rep(s, '<title>Eton F Block Verbs and Grammar</title>', '<title>' + TITLE + '</title>', what='title')
    s = rep(s, 'Eton F Block <em>Verbs and Grammar</em>', 'Eton F Block <em>Spanish</em>', what='header')
    s = rep(s, '\U0001f1ea\U0001f1f8 Verbs · Grammar notes · Drills · Tests · Audio', '\U0001f1ea\U0001f1f8 Vocabulary · Verbs · Grammar', what='subhead')
    # ---- the front page: three doors (Vocab, Verbs, Grammar)
    a = s.index('W.goHub = function () {')
    b = s.index('\n  };', a) + len('\n  };') + 1
    s = s[:a] + HUB_JS + s[b:]
    s = rep(s, "function hmLand() { apHome = 'landing'; renderIntro(); }", 'function hmLand() { goHub(); }', what='hmLand')
    # ---- F Block only: no E Block Trials sets, only the F Block tenses
    s = rep(s, "var FT_DEF = { ftrials: { t: { INFINITIVE: 1, PRESENT: 1 } }, etrials: { t: { INFINITIVE: 1, PRESENT: 1, IMPERFECT: 1, FUTURE: 1 } } };\nFT_DEF.etrials.t[HMC.past] = 1;\nFT_DEF.fsummer = { t: { INFINITIVE: 1, PRESENT: 1, FUTURE: 1 } }; FT_DEF.fsummer.t[HMC.past] = 1; FT_DEF.esummer = FT_DEF.etrials;",
            "var FT_DEF = { ftrials: { t: { INFINITIVE: 1, PRESENT: 1 } } };\nFT_DEF.fsummer = { t: { INFINITIVE: 1, PRESENT: 1, FUTURE: 1 } }; FT_DEF.fsummer.t[HMC.past] = 1;", what='FT_DEF')
    s = rep(s, "var TR_NAME = { ftrials: 'F Michaelmas Trials', etrials: 'E Block Michaelmas Trials', fsummer: 'F Block Summer Trials', esummer: 'E Block Summer Trials' };",
            "var TR_NAME = { ftrials: 'F Michaelmas Trials', fsummer: 'F Block Summer Trials' };", what='TR_NAME')
    s = rep(s, "var TR_KIND = { ftrials: 'F', etrials: 'E', fsummer: 'F', esummer: 'E' };", "var TR_KIND = { ftrials: 'F', fsummer: 'F' };", what='TR_KIND')
    s = rep(s, "var XQ_RULE = { ftrials: { A: 'U', B: 'E', C: 'I', D: 'E' }, etrials: { B: 'U', C: 'I', D: 'E' } }; XQ_RULE.fsummer = XQ_RULE.ftrials; XQ_RULE.esummer = XQ_RULE.etrials;",
            "var XQ_RULE = { ftrials: { A: 'U', B: 'E', C: 'I', D: 'E' } }; XQ_RULE.fsummer = XQ_RULE.ftrials;", what='XQ_RULE')
    s = rep(s, "  if (which === 'F') return F; if (which === 'E') return E; return F + '<br>' + E;", '  return F;', what='xqRuleText')
    s, c = re.subn(r"\n    \+ '<tr><th>E Block &amp; Summer<small>20 verb questions</small></th>.*?</tr></tbody></table>';", "\n    + '</tbody></table>';", s, count=1, flags=re.S)
    assert c == 1, 'xqRuleTable'
    s = rep(s, "        <button class=\"hm-tile hm-tile-g\" onclick=\"hmTrialsPaper('etrials')\"><b>&#128221; Practice Trials paper &middot; E Block</b><small>20 verb questions in the Trials layout</small></button>\n", '', what='E tile')
    s, c = re.subn(r"<button class=\"aph-btn aph-btn-sm\" onclick=\"hmTrialsPaper\(\\'etrials\\'\)\">&#128221; Practice Trials paper &middot; E Block \(20\)</button>", '', s, count=1)
    assert c == 1, 'E button'
    s = rep(s, "tenses: [['INFINITIVE', 'Infinitives'], ['PRESENT', 'Present'], ['PRETERITE', 'Preterite'], ['FUTURE', 'Future'], ['IMPERFECT', 'Imperfect'], ['COND', 'Conditional'], ['PERFECT', 'Perfect'], ['PRESENT_SUBJ', 'Pres. Subj.'], ['IMP_SUBJ', 'Imp. Subj.']],",
            "tenses: [['INFINITIVE', 'Infinitives'], ['PRESENT', 'Present'], ['PRETERITE', 'Preterite'], ['FUTURE', 'Future']],", what='HMC.tenses')
    c1 = s.count('&#8249; ${HMC.title}</button>'); c2 = s.count("&#8249; ' + HMC.title + '</button>")
    assert c1 + c2 >= 3, (c1, c2)
    s = s.replace('&#8249; ${HMC.title}</button>', '&#8249; Eton F Block Spanish</button>').replace("&#8249; ' + HMC.title + '</button>", "&#8249; Eton F Block Spanish</button>")
    s = rep(s, "  tenses: [['PRESENT', 'Present'], ['PRETERITE', 'Preterite'], ['IMPERFECT', 'Imperfect'], ['PERFECT', 'Perfect'], ['FUTURE', 'Future'], ['COND', 'Conditional'], ['PRESENT_SUBJ', 'Present subjunctive'], ['IMP_SUBJ', 'Imperfect subjunctive']],",
            "  tenses: [['PRESENT', 'Present'], ['PRETERITE', 'Preterite'], ['FUTURE', 'Future']],", what='tenses 6062')
    s = rep(s, "var TENSES = [['PRESENT', 'Present'], ['PRETERITE', 'Preterite'], ['FUTURE', 'Future'], ['COND', 'Conditional'], ['IMPERFECT', 'Imperfect'], ['PERFECT', 'Perfect'], ['PRESENT_SUBJ', 'Pres. Subj.'], ['IMP_SUBJ', 'Imp. Subj.'], ['INFINITIVE', 'Infinitive']];",
            "var TENSES = [['PRESENT', 'Present'], ['PRETERITE', 'Preterite'], ['FUTURE', 'Future'], ['INFINITIVE', 'Infinitive']];", what='TENSES')
    s = rep(s, "['FUTURE','Future','#0a7050'],['COND','Conditional','#0a6080'],\n  ['IMPERFECT','Imperfect','#6020a0'],['PERFECT','Perfect','#1a4090'],['PRESENT_SUBJ','Pres. Subj.','#805010'],['IMP_SUBJ','Imp. Subj.','#7a1818']];",
            "['FUTURE','Future','#0a7050']];", what='SP_TEST_TENSES')
    for t in ('COND', 'IMPERFECT', 'PERFECT', 'PRESENT_SUBJ', 'IMP_SUBJ', 'SET'):
        s, c = re.subn(r'\n[ \t]*<button class="aph-chip on" id="stt-' + t + r'" onclick="toggleSentTestTense\(\'' + t + r'\'\)">.*?</button>', '', s, count=1)
        assert c == 1, 'stt ' + t
    s = rep(s, "window._sentTestTenses = new Set(['PRESENT','PRETERITE','FUTURE','COND','IMPERFECT','PERFECT','PRESENT_SUBJ','IMP_SUBJ','SET']);", "window._sentTestTenses = new Set(['PRESENT','PRETERITE','FUTURE']);", what='sentTestTenses')
    # ---- icons and the front page's styles, and the door switch
    ic = {k: icon_b64(k) for k in ('vocab', 'verbs', 'grammar', 'studio')}
    for k, key in (('notes', 'grrecap'), ('drills', 'spell_es'), ('tests', 'trials'), ('spot', 'test'), ('speed', 'speed')):
        mm = re.search(r'["\']' + key + r'["\']\s*:\s*["\'](data:image/webp;base64,[A-Za-z0-9+/=]{500,})', s)
        if not mm: sys.exit('icon not found: ' + key)
        ic[k] = mm.group(1)
    icons = 'window.FB_ICONS=' + json.dumps(ic) + ';'
    s = rep(s, '<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<script id="fb-icons">' + icons + '</script>', what='viewport')
    k = s.rindex('</body>'); s = s[:k] + HUB_CSS + VERBS_TAIL + s[k:]
    return s, core


def transform_vocab(s):
    s = strip_stamps(s)
    s = s.replace('Eton F Spanish Vocab', 'Eton F Block Spanish')
    k = s.rindex('</body>')
    return s[:k] + VOCAB_TAIL + s[k:]


def pack(html):
    html = re.sub(r'</script', M_SCRIPT, html, flags=re.I)
    return html.replace('<!--', M_COMM)


ROUTER = r'''<script id="fb-router">
/* Eton F Block Spanish: one file, two complete apps. The page below is empty until the right app is written into it, so each app runs exactly as its own file does
   (links, Back buttons, voices, saved answers). Hash routes: #vocab and the vocab links (#vsec=, #fvset=, #sv=) open Vocab; everything else opens the front page. */
(function () {
  if (window.__fbRouter) return; window.__fbRouter = 1;
  var MS = '⟦/script', MC = '⟦!--';
  function txt(id) { return document.getElementById(id).textContent.split(MS).join('</script').split(MC).join('<' + '!--'); }
  function b64u(t) { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var b = atob(t), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function peek(h) {   // a teacher's test or Speed link: which app made it?
    var m = /^#(?:dr|sp)[tv]=([^&]+)/.exec(h); if (!m) return Promise.resolve('verbs');
    try {
      var tok = decodeURIComponent(m[1]).replace(/^.*#t=/, ''), i = tok.lastIndexOf('.'), t = tok.slice(0, i), raw = b64u(t.slice(1));
      var p = t.charAt(0) === 'j' ? Promise.resolve(new TextDecoder().decode(raw)) : new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
      return p.then(function (j) { var o = JSON.parse(j); return /vocab/i.test(String(o.a || '') + ' ' + String(o.t || '')) ? 'vocab' : 'verbs'; }).catch(function () { return 'verbs'; });
    } catch (e) { return Promise.resolve('verbs'); }
  }
  function door() { var h = location.hash || ''; if (/^#(vocab|vsec=|fvset=|sv=)/.test(h)) return Promise.resolve('vocab'); return peek(h); }
  function boot() {
    door().then(function (d) {
      var html = txt(d === 'vocab' ? 'fb-vocab' : 'fb-verbs');
      var nv = document.getElementById('ap-newver-js'), bld = window.__apBuild;
      var add = (bld ? '<' + 'script>window.__apBuild=' + JSON.stringify(bld) + ';</' + 'script>' : '') + (nv ? '<' + 'script>' + nv.textContent + '</' + 'script>' : '');
      html = html.replace(/<\/body>\s*<\/html>\s*$/i, function () { return add + '</body></html>'; });
      if (add && html.indexOf(add) < 0) html += add;
      document.open(); document.write(html); document.close();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>
'''


def build():
    V = open(VERBS_SRC, encoding='utf-8').read()
    B = open(VOCAB_SRC, encoding='utf-8').read()
    V, core = transform_verbs(V)
    B = transform_vocab(B)
    shell = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="robots" content="noindex, nofollow">\n'
             '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + TITLE + '</title>\n'
             '<style>html,body{margin:0;background:#1a2744}</style>\n</head>\n<body>\n'
             '<script type="text/plain" id="fb-verbs">' + pack(V) + '</script>\n'
             '<script type="text/plain" id="fb-vocab">' + pack(B) + '</script>\n'
             + ROUTER + '</body>\n</html>\n')
    open(OUT, 'w', encoding='utf-8').write(shell)
    print('wrote', OUT, len(shell), 'bytes; verbs payload', len(V), 'vocab payload', len(B), 'core verbs', len(core))


if __name__ == '__main__':
    build()
