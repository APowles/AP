#!/usr/bin/env python3
"""Rewrite the '★ How your personalised set works' sheet in every app with the short, scannable version
(three numbered steps, button names as pills, one amber warning panel about saving the link into OneNote).
Idempotent. Usage: mysethelp.py [files...]  (default: all Eton*/AP All Languages* html in cwd).
Per-app wording is in APPS below (matched by file name)."""
import re, sys, glob, os

CSS = """/* mysethelp */
.mh{font-size:1.0625rem;line-height:1.5;color:var(--navy,#1a2744)}
.mh-steps{list-style:none;margin:0 0 14px;padding:0}
.mh-steps li{display:flex;gap:12px;align-items:flex-start;margin:0 0 12px}
.mh-n{flex:none;width:30px;height:30px;border-radius:50%;background:var(--navy,#1a2744);color:var(--gold2,#e8c96a);font:700 1rem/30px var(--aph-body,inherit);text-align:center}
.mh-l{font:700 .8125rem/1.2 var(--aph-body,inherit);letter-spacing:.08em;text-transform:uppercase;color:#8a6d1f;margin:2px 0 3px}
.mh p{margin:0 0 4px}
.mh-k{display:inline-block;background:#eaf0fb;border:1px solid #c8d4ee;border-radius:6px;padding:0 6px;font-weight:600;white-space:nowrap}
.mh-warn{background:#fff3cf;border:2px solid #d9a521;border-radius:12px;padding:12px 14px;margin:0 0 8px}
.mh-wt{font:700 1.125rem/1.25 var(--aph-body,inherit);color:#7a4a00;margin:0 0 6px}
.mh-warn p{margin:0 0 6px}
.mh-warn p:last-child{margin:0}
"""

TILES = 'Drill, Spell, Match, Leisure Mode or Test'
APPS = {
 'A Level French VVs': dict(noun='word', tiles='Drill, Speed Challenge, Spell, Match, Leisure Mode or Test', use='', edit='take a card out, or add cards yourself', due=True),
 'A Level Oral Phrase Bank': dict(noun='phrase', tiles=TILES, use='', edit='take a phrase out'),
 'IGCSE Approved Material': dict(noun='sentence', tiles=TILES, use='Speed Challenge works on whole topics, so it waits for a topic.', edit='take a sentence out', also='Approved Material and Practice Sentences each keep their own set.'),
 'IGCSE Structures': dict(noun='phrase', tiles=TILES, use='', edit='take a phrase out'),
 'IGCSE Vocab Essentials': dict(noun='card', tiles=TILES, use='Speed Challenge is not available for a personalised set.', edit='take one out', also='Your set keeps Practice Sentences and Vocab Items apart: the two buttons above the lists choose which you practise.'),
 'IGCSE Vocab and Gr EWs': dict(dyn=True),
 'F Spanish Vocab': dict(noun='word', tiles=TILES, use='Speed Challenge works on whole sections, so it stays greyed out for this set.', edit='take a word out'),
 'French Verbs': dict(noun='card', tiles='Drill, Spell, Match or Leisure Mode', use='', edit='take a card out', also='A card is kept under the kind of question you missed it in (Single form, Full (6 forms) verb, Infinitive or Sentence). Choose the same kind to practise it.'),
 'Italian Verbs': dict(noun='card', tiles='Drill, Spell, Match or Leisure Mode', use='', edit='take a card out', also='A card is kept under the kind of question you missed it in (Single form, Full (6 forms) verb, Infinitive or Sentence). Choose the same kind to practise it.'),
 'Spanish Verbs': dict(noun='card', tiles='Drill, Spell, Match or Leisure Mode', use='', edit='take a card out', also='A card is kept under the kind of question you missed it in (Single form, Full (6 forms) verb, Infinitive or Sentence). Choose the same kind to practise it.'),
 'Gen Essential Phrases': dict(noun='phrase', tiles=TILES, use='Speed Challenge needs whole lists, so it is switched off for this set.', edit='take a phrase out'),
}

def js(s): return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"

def build(p):
    k = lambda t: '<span class="mh-k">' + t + '</span>'
    if p.get('dyn'):
        tiles = "'Drill, Spell, Match' + (m.kind === 'v' ? ', Leisure Mode' : '') + ' or Test'"
        edit = "'take ' + (m.kind === 'v' ? 'a word' : 'an item') + ' out'"
        pre = 'var m = M(), w = m.many; '
        use_extra = ''
        also = ''
    else:
        tiles = js(p['tiles']); edit = js(p['edit']); pre = ''
        use_extra = (' ' + p['use']) if p.get('use') else ''
        also = p.get('also', '')
    parts = []
    parts.append("'<div class=\"mh\"><ol class=\"mh-steps\">'")
    parts.append("'<li><span class=\"mh-n\">1</span><div><div class=\"mh-l\">It builds itself</div><p>Do any drill. Every card you mark " + k('✗ Major error') + " goes into your set. " + k('~ Nearly') + " just brings the card back a little later.</p></div></li>'")
    parts.append("'<li><span class=\"mh-n\">2</span><div><div class=\"mh-l\">Use it</div><p>Under step 1, choose " + k('★ My personalised set') + ". Under step 2, choose ' + " + tiles + " + '." + use_extra.replace("'", "\\'") + "</p>" + (("<p>" + also.replace("'", "\\'") + "</p>") if also else '') + "</div></li>'")
    parts.append("'<li><span class=\"mh-n\">3</span><div><div class=\"mh-l\">Tidy it</div><p>Press " + k('✎ Edit') + " to change Hard, Tricky or Easier, or to ' + " + edit + " + '. A card you missed comes back after 1 day, then 3, then 7. Get it right each time and it stops coming back.</p></div></li>'")
    parts.append("'</ol><div class=\"mh-warn\"><div class=\"mh-wt\">⚠ Save it, or you could lose it</div><p>Your set lives only on this iPad, in this browser. Clearing the browser, or using another device, wipes it.</p><p>Press " + k('🔗 Save my personalised set') + ", paste the link into <b>your own OneNote</b> and keep it tidy, with a clear title, where you can find it. The link is your only safe copy, and looking after it is up to you. Tap the link on any device and your set comes back.</p></div></div>'")
    body = ' + '.join(parts)
    return ("window.apMySetHelp = function () { " + pre + "ov(head('★ How your personalised set works') + " + body +
            " + '<div class=\"ms-cen\"><button class=\"ms-b pri\" onclick=\"apMsClose()\">Got it</button></div>');")

def key_for(fn):
    for k in APPS:
        if k in fn: return k
    return None

pat = re.compile(r"window\.apMySetHelp = function \(\) \{.*?onclick=\"apMsClose\(\)\">Got it</button></div>'\);", re.S)
def main(files):
    for f in files:
        k = key_for(os.path.basename(f))
        if not k: continue
        s = open(f, encoding='utf-8').read()
        if 'apMySetHelp' not in s: continue
        n = len(pat.findall(s))
        if n != 1: print('SKIP', f, n); continue
        new = build(APPS[k])
        s2 = pat.sub(lambda m: new, s)
        if '/* mysethelp */' not in s2:
            for hook in ('ap-setup-css', 'ap-grsetup-css', 'ap-myset-css'):
                s2 = s2.replace('<style id="%s">' % hook, '<style id="%s">\n' % hook + CSS, 1)
                if '/* mysethelp */' in s2: break
            if '/* mysethelp */' not in s2: print('NO CSS HOOK', f)
        open(f, 'w', encoding='utf-8').write(s2); print('ok', f[:60])
if __name__ == '__main__':
    fs = sys.argv[1:] or sorted(glob.glob('Eton*.html') + glob.glob('AP All Languages*.html'))
    main(fs)
