#!/usr/bin/env python3
"""Put (or refresh) the shared audio fix in every page, and apply the small sound patches to the engines embedded in the apps.
Run from the repo root:  python3 -I _tools/audio/inject.py [--dry]   then   python3 -I _tools/version/stamp.py
- ap-audiofix (audiofix.js) goes first in <head> of each page that makes sound, and of each complete page the router/studio writes
  in later (text/plain payloads such as fb-vocab / fb-verbs in Eton F Block Spanish). Safe to re-run.
- ENGINE PATCHES are exact search-and-replace pairs (idempotent); the same pairs are already in _tools/gamify/blitz.js and
  _tools/buildit/buildit.src.js, so a future re-inject keeps them. Never runs the Gamify rollout, never rebuilds F Block."""
import re, sys, os, glob
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(R)
DRY = '--dry' in sys.argv
JS = open('_tools/audio/audiofix.js', encoding='utf-8').read().strip()
assert '</script' not in JS.lower(), 'audiofix.js must not contain a closing script tag'
BLOCK = '<script id="ap-audiofix">\n' + JS + '\n</script>\n'
BLOCK_ESC = BLOCK.replace('</script>', '⟦/script>')            # inside text/plain payloads the closer is written as the marker
OLD = re.compile(r'\n?<script id="ap-audiofix">(?:(?!\u27e6/script>).)*?</script>\n?', re.S)   # never runs on into an escaped payload block
OLD_ESC = re.compile(r'\n?<script id="ap-audiofix">.*?\u27e6/script>\n?', re.S)
HEAD = re.compile(r'<head[^>]*>', re.I)

PAIRS = [   # (name, old, new) for the engines embedded in the apps
 ('blitz dice clip',
  "else if (k === 'dice') { if (!snd) return; try { var au = new Audio(DICE_SND);",
  "else if (k === 'dice') { if (!snd) return; try { if (window.__apAudio && __apAudio.clip(DICE_SND, Math.min(1, .9 * CFG.vol))) return; } catch (e) { } try { var au = new Audio(DICE_SND);"),
 ('blitz deal clip',
  "var a = new Audio(_dU[k]); a.volume = Math.min(1, .7 * CFG.vol * (v == null ? 1 : Math.min(1.3, v * 1.25))); var pr = a.play();",
  "var vv = Math.min(1, .7 * CFG.vol * (v == null ? 1 : Math.min(1.3, v * 1.25))); if (window.__apAudio && __apAudio.clip(_dU[k], vv)) return; var a = new Audio(_dU[k]); a.volume = vv; var pr = a.play();"),
 ('blitz prep clips',
  "window.apBlitz = function () {",
  "window.apBlitz = function () { try { if (window.__apAudio) __apAudio.prep(DICE_SND); } catch (e) { }"),
 ('blitz ctx follows shared context',
  "function ctx() { if (!AC) {",
  "function ctx() { try { if (window.__apAudio && __apAudio.ctx && AC && AC !== __apAudio.ctx) AC = __apAudio.ctx; } catch (e) { } if (!AC) {"),
 ('matchfx ctx follows shared context',
  "function ac() {\n    try {\n      if (!ctx) {",
  "function ac() {\n    try {\n      if (ctx && window.__apAudio && __apAudio.ctx && ctx !== __apAudio.ctx) ctx = window.__apCtx = __apAudio.ctx;\n      if (!ctx) {"),
 ('blitz music follows a renewed context',
  "  function musicStop() {\n    if (mTimer)",
  "  window.addEventListener('apaudio-renew', function () { try { if (MG) musicStart(false); } catch (e) { } });   // sound was reset: carry the music on over the new context\n  function musicStop() {\n    if (mTimer)"),
 ('buildit music retry',
  "if (BM || !snd()) return; var c = bAc(); if (!c || c.state !== 'running' || !bx()) return;",
  "if (BM || !snd()) return; var c = bAc(); if (!c) return; if (c.state !== 'running') { if (document.getElementById('bi-ov') && (bMusic.__r = (bMusic.__r || 0) + 1) <= 10) setTimeout(bMusic, 400); return; } bMusic.__r = 0; if (!bx()) return;"),
]

def put(s, esc=False):
    """insert/refresh the block after the first <head> of this document text; returns (new, inserted?)"""
    s = (OLD_ESC if esc else OLD).sub('', s)
    m = HEAD.search(s)
    if not m: return s, False
    return s[:m.end()] + '\n' + (BLOCK_ESC if esc else BLOCK) + s[m.end():], True

if '--sources' in sys.argv:   # keep the same patches in the engine source files
    for sf in ('_tools/gamify/blitz.js', '_tools/buildit/buildit.src.js', '_tools/setup-layout/matchfx/matchfx.js'):
        t = open(sf, encoding='utf-8').read(); o2 = t
        for name, old, new in PAIRS:
            if new not in t and t.count(old): t = t.replace(old, new); print(sf, name)
        if t != o2: open(sf, 'w', encoding='utf-8').write(t)
    sys.exit(0)

total = 0
for f in sorted(glob.glob('*.html')):
    s = open(f, encoding='utf-8').read(); o = s
    notes = []
    # 1. the page itself (the Eton F Block router is replaced at once by its payload, so only its payloads get the block)
    isrouter = 'id="fb-verbs"' in s and 'id="fb-vocab"' in s
    games = ('id="ap-blitz"' in s) or ('id="ap-matchfx"' in s) or ('BuildIt: tap-or-drag' in s)
    if 'AudioContext' in s and games and not isrouter:
        s, ok = put(s); notes.append('page' if ok else 'NO <head>')
    # 2. complete pages held as text and written in later
    out = []
    for m in re.finditer(r'<script type="text/plain" id="([^"]+)">(.*?)</script>', s, re.S):
        body = m.group(2)
        if not re.match(r'\s*(<!DOCTYPE|<html)', body[:200], re.I): continue
        nb, ok = put(body, esc=True)
        if ok:
            out.append((m.start(2), m.end(2), nb)); notes.append('payload ' + m.group(1))
    for a, b, nb in reversed(out): s = s[:a] + nb + s[b:]
    # 3. engine patches
    for name, old, new in PAIRS:
        if new in s: continue
        c = s.count(old)
        if c: s = s.replace(old, new); notes.append('%s x%d' % (name, c))
    if s != o:
        total += 1
        if not DRY: open(f, 'w', encoding='utf-8').write(s)
    if s != o: print('CHANGES', f[:70], ', '.join(notes))
print(('dry run: ' if DRY else '') + 'files changed', total)
