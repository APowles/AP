#!/usr/bin/env python3
"""Timed tests: "I've finished marking" button (with Are you sure?) in the shared APTT engine. Run from repo root. Idempotent; reports files whose engine differs."""
import glob
FM_FN = """  var FMASK = false;
  function fmUI() {
    var x = $('aptt-fm'); if (!x || !S) return;
    var live = !!(S.shown && S.mode === 'timed' && !S.markDone);
    x.hidden = !live; if (!live) { FMASK = false; x.innerHTML = ''; return; }
    var un = (S.left || []).length;
    if (FMASK) x.innerHTML = '<div class="aptt-fm-q" role="alertdialog" aria-label="Are you sure?"><b>Are you sure you have finished marking?</b><span>' + (un ? 'You have <b>' + un + '</b> still not marked: ' + (un > 1 ? 'they' : 'it') + ' will score 0. ' : 'Every answer is marked. ') + 'You will not be able to change any marks afterwards.</span><div><button type="button" class="aptt-fm-b no" onclick="APTT.fm(0)">Not yet: keep marking</button><button type="button" class="aptt-fm-b go" onclick="APTT.fm(2)">Yes, I have finished</button></div></div>';
    else x.innerHTML = '<button type="button" class="aptt-fm-b" onclick="APTT.fm(1)">&#10004; I\\'ve finished marking: stop the marking timer</button><small>Marking time left? Stop it here and go on to <b>What I learned</b>.</small>';
  }
  function fmClick(a) {
    if (!S || !S.shown || S.markDone || S.mode !== 'timed') return;
    if (a === 1) { FMASK = true; fmUI(); try { $('aptt-fm').scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { } return; }
    if (a === 0) { FMASK = false; fmUI(); return; }
    FMASK = false; markEnd(true);
    try { $('aptt-learn').scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) { }
  }
  function score() {
    todo(); fmUI();"""
ad3=[("  function score() {\n    todo();", FM_FN),
 ("<div class=\"aptt-cm\" id=\"aptt-cm\" hidden></div>'", "<div class=\"aptt-cm\" id=\"aptt-cm\" hidden></div><div class=\"aptt-fm\" id=\"aptt-fm\" hidden></div>'"),
 ("  function markEnd() {   // timed: marking time is over; anything not marked scores 0\n    if (!S || S.markDone) return;\n    S.markDone = true;", "  function markEnd(early) {   // timed: marking time is over (or he stopped it early); anything not marked scores 0\n    if (!S || S.markDone) return;\n    S.markDone = true; S.early = early === true;"),
 ("'aptt-tban done'; b.innerHTML = '✔ <b>Marking time is over.</b> Your score is what you managed to mark.", "'aptt-tban done'; b.innerHTML = '✔ <b>' + (S.early ? 'You finished marking.' : 'Marking time is over.') + '</b> Your score is what you managed to mark."),
 ("if (S.markDone) c.innerHTML = '✔ Marking time over';", "if (S.markDone) c.innerHTML = S.early ? '✔ Marking finished' : '✔ Marking time over';"),
 ("return { askSpanish: askSpanish, open: open,", "return { fm: fmClick, askSpanish: askSpanish, open: open,"),
 ("#aptt-top,.aptt-item,#aptt-after{scroll-margin-top:64px}", "#aptt-top,.aptt-item,#aptt-after{scroll-margin-top:64px}\n.aptt-fm{margin:14px 0;text-align:center}.aptt-fm[hidden]{display:none}.aptt-fm small{display:block;margin-top:6px;color:#555;font-size:.95rem}.aptt-fm-b{font:800 1.05rem/1.2 var(--aph-body);padding:12px 20px;border-radius:12px;border:2px solid var(--navy);background:#fff;color:var(--navy);cursor:pointer;margin:4px}.aptt-fm-b.go{background:var(--navy);color:#fff}.aptt-fm-q{background:#fff8e6;border:2px solid var(--gold);border-radius:12px;padding:14px}.aptt-fm-q>b{display:block;font-size:1.15rem;color:var(--navy);margin-bottom:4px}.aptt-fm-q>span{display:block;margin-bottom:8px}"),
]

for f in sorted(glob.glob('Eton *.html')+glob.glob('AP All Languages - *.html')):
    t=open(f,encoding='utf8').read()
    if 'function markEnd() {   // timed' not in t and 'function markEnd(early)' not in t: continue
    t0=t; bad=[]
    for a,b in ad3:
        if b in t: continue
        if a.startswith('return { askSpanish') and a not in t and 'return { ghSweep: ghSweep, askSpanish: askSpanish, open: open,' in t: a=a.replace('return { ','return { ghSweep: ghSweep, ',1); b=b.replace('return { fm: fmClick, ','return { fm: fmClick, ghSweep: ghSweep, ',1)
        if t.count(a)<1: bad.append((a[:40],t.count(a))); continue
        t=t.replace(a,b)
    if bad: print('PROBLEM',f,bad); continue
    if t!=t0: open(f,'w',encoding='utf8').write(t); print('patched',f)
    else: print('unchanged',f)
