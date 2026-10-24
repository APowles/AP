#!/usr/bin/env python3
"""Top Structures Challenge, "Use them in an answer": a question-kind chooser (Easy present / Past tense anecdote /
Detailed opinion / Future speculation / Random), nothing preselected, question numbers labelled with their kind.
Edits the APC_TPL page inside both IGCSE Structures twins. Run from /home/claude/ap. Idempotent."""
import json, sys
FILES = ['Eton IGCSE Structures & Oral and Writing Practice.html', 'AP All Languages - IGCSE Structures & Oral and Writing Practice.html']
NAMES = "{ present: 'Easy present', past: 'Past tense anecdote', opinion: 'Detailed opinion', future: 'Future speculation' }"

CSS = """
.qn{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:16px}
.qn button{width:auto;min-width:118px;height:auto;border-radius:16px;padding:8px 14px 9px;display:flex;flex-direction:column;align-items:center;gap:1px;line-height:1.15}
.qn button b{font-size:1.15rem}.qn button small{font-size:.72rem;font-weight:700;letter-spacing:.04em;opacity:.85}
#kindpick{display:none;text-align:center;max-width:1200px;margin:0 auto}
body.nopick #kindpick{display:block}
body.nopick .qtext,body.nopick .qtype,body.nopick #cards,body.nopick #atimer{display:none}
#kindpick h2{margin:6px 0 4px;font-size:clamp(1.5rem,2.6vw,2.4rem);color:#fff}
#kindpick p{margin:0 0 18px;color:var(--muted);font-size:1.05rem}
#kindpick .kinds{display:flex;flex-wrap:wrap;justify-content:center;gap:16px}
#kindpick .kinds button{--k:#c9a84c;min-width:230px;max-width:260px;padding:18px 20px;border-radius:18px;border:2.5px solid var(--k);background:rgba(255,255,255,.05);color:#fff;cursor:pointer;text-align:center;font-family:inherit;transition:transform .12s,background .15s}
#kindpick .kinds button:hover,#kindpick .kinds button:active{background:rgba(255,255,255,.12);transform:translateY(-3px)}
#kindpick .kinds button b{display:block;font-size:1.25rem;color:var(--k);margin-bottom:4px}
#kindpick .kinds button small{display:block;font-size:.92rem;color:#c8d3ea;line-height:1.3}
#kindpick .kinds .k-present{--k:#3fc79a}#kindpick .kinds .k-past{--k:#f0974a}#kindpick .kinds .k-opinion{--k:#9d8cff}#kindpick .kinds .k-future{--k:#4db3ff}#kindpick .kinds .k-random{--k:#ffd76a}
"""
HTML = ("<div id=\"kindpick\"><h2>What kind of question do you want to answer?</h2><p>Choose a kind of question, or tap a numbered question below.</p><div class=\"kinds\">"
  "<button class=\"k-present\" onclick=\"pickKind('present')\"><b>Easy present</b><small>Everyday facts and routines</small></button>"
  "<button class=\"k-past\" onclick=\"pickKind('past')\"><b>Past tense anecdote</b><small>Tell a story about something that happened</small></button>"
  "<button class=\"k-opinion\" onclick=\"pickKind('opinion')\"><b>Detailed opinion</b><small>Give your view and justify it</small></button>"
  "<button class=\"k-future\" onclick=\"pickKind('future')\"><b>Future speculation</b><small>Plans, hopes and what might happen</small></button>"
  "<button class=\"k-random\" onclick=\"pickKind('random')\"><b>&#127922; Random</b><small>Any kind: surprise me</small></button></div></div>\n  ")
JS = """
var KIND_NAME = %s;
function pickKind(k) {
  closeModel(); S.kind = k; var L = DATA.cards[S.lang], c = S.card, idx = [];
  function types(card) { return card.q.map(function (_, i) { return qType(card.tags[i]); }); }
  function match(card) { return types(card).map(function (t, i) { return (k === 'random' || t === k) ? i : -1; }).filter(function (i) { return i >= 0; }); }
  idx = match(c);
  if (!idx.length) { var pool = L.filter(function (x) { return match(x).length; }); if (pool.length) { c = pool[Math.floor(Math.random() * pool.length)]; S.card = c; idx = match(c); } }
  S.q = idx.length ? idx[Math.floor(Math.random() * idx.length)] : 0; S.picked = true; deal(); autoSpeak();
}
function kindApply() { if (S.kind) pickKind(S.kind); }
""" % NAMES

def edit(val):
    def rep(a, b, n=1):
        global_c = val.count(a)
        assert global_c == n, (a[:60], global_c)
        return val.replace(a, b)
    if 'id="kindpick"' in val: return val
    val = rep("var S = { lang: 'fr', card: null, q: 0, n: 3, ex: false, hand: [] };", "var S = { lang: 'fr', card: null, q: 0, n: 3, ex: false, hand: [], picked: false, kind: null };")
    val = rep("function autoSpeak() { if (AUTO &&", "function autoSpeak() { if (S.picked && AUTO &&")
    val = rep("function goQ(i) { closeModel(); S.q = i;", "function goQ(i) { closeModel(); S.picked = true; S.kind = null; S.q = i;")
    val = rep("function step(d) { closeModel(); S.q =", "function step(d) { closeModel(); S.picked = true; S.q =")
    val = rep("S.q = 0; deal(); autoSpeak(); }\nfunction goCode()", "S.q = 0; S.picked = false; if (S.kind) kindApply(); else { deal(); autoSpeak(); } }\nfunction goCode()")
    val = rep("if (c) { S.card = c; S.q = 0; deal(); autoSpeak(); } else alert(", "if (c) { S.card = c; S.q = 0; S.picked = false; if (S.kind) kindApply(); else { deal(); autoSpeak(); } } else alert(")
    val = rep("if (c) { S.card = c; S.q = Math.min(4, I.q || 0); deal(); autoSpeak(); } else randomCard();", "if (c) { S.card = c; S.q = Math.min(4, I.q || 0); S.picked = true; deal(); autoSpeak(); } else randomCard();")
    val = rep("""document.getElementById('qn').innerHTML = c.q.map(function (_, i) { return '<button class="' + (i === S.q ? 'on' : '') + '" onclick="goQ(' + i + ')">' + (i + 1) + '</button>'; }).join('');""",
              """document.getElementById('qn').innerHTML = c.q.map(function (_, i) { return '<button class="' + (i === S.q && S.picked ? 'on' : '') + '" onclick="goQ(' + i + ')"><b>' + (i + 1) + '</b><small>' + KIND_NAME[qType(c.tags[i])] + '</small></button>'; }).join('');
  document.body.classList.toggle('nopick', !S.picked);""")
    val = rep("{ present: 'Present', past: 'Past anecdote', opinion: 'Opinion', future: 'Future' }[type] + ' — use these structures in your answer'", "KIND_NAME[type] + ' — use these structures in your answer'")
    val = rep("present, past anecdote, opinion or future. Choose", "easy present, past tense anecdote, detailed opinion or future speculation. Choose")
    val = rep('<div class="qwrap"><div class="qn" id="qn">', HTML + '<div class="qwrap"><div class="qn" id="qn">')
    val = rep("</style>", CSS + "</style>", val.count("</style>")) if False else val
    i = val.find('.qtype{margin-top:10px'); assert i > 0
    val = val[:i] + CSS.strip() + '\n' + val[i:]
    val = rep("function goQ(i) {", JS.strip() + "\nfunction goQ(i) {")
    return val

for f in FILES:
    s = open(f, encoding='utf-8').read()
    i = s.find('var APC_TPL = "'); st = i + len('var APC_TPL = ')
    j = st + 1
    while True:
        if s[j] == '\\': j += 2; continue
        if s[j] == '"': break
        j += 1
    lit = s[st:j+1]; val = json.loads(lit); new = edit(val)
    if new == val: print('unchanged', f); continue
    out = json.dumps(new, ensure_ascii=False).replace('</', '<\\/')
    open(f, 'w', encoding='utf-8').write(s[:st] + out + s[j+1:]); print('patched', f)
