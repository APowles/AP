/* BuildIt: tap-or-drag tile sentence builder, shared by the teaching apps.
   BuildIt.open({ items:[{fr,en}], title, sub, code, lang:'fr'|'es'|'it', count:6, say:function(text), onBack:function(){} })
   Everything (look, sounds, state) lives in here; the host app only supplies sentences. */
(function () {
  if (window.BuildIt) return;
  var BOARD = '{{BOARD}}', TILE = '{{TILE}}', SND = { place: '{{SND_PLACE}}', remove: '{{SND_REMOVE}}', ok: '{{SND_OK}}', bad: '{{SND_BAD}}' };
  var LV = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }, Z = null, root = null, st = null, bound = false;
  function ls(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function ss(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function snd() { return ls('bi_snd', '1') !== '0'; }
  // ---- Parlour sound set and music (felt piano, wooden tiles on velvet) ----
  var BS = null, BM = null, SIL = null;
  function bF(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function bAc() {
    var c = null; try { var C = window.AudioContext || window.webkitAudioContext; c = window.__apCtx || window.__amCtx || (C ? new C() : null); if (c) window.__apCtx = c; if (c && c.state !== 'running') { var p = c.resume(); if (p && p.catch) p.catch(function () { }); } } catch (e) { c = null; }
    return c;
  }
  function bUnlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
    try { if (!SIL) { SIL = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='); SIL.setAttribute('playsinline', ''); } SIL.currentTime = 0; var pr = SIL.play(); if (pr && pr.catch) pr.catch(function () { }); } catch (e) { }
    bAc();
  }
  function bx() {
    var c = bAc(); if (!c) return null; if (BS && BS.c === c) return BS;
    try {
      var comp = c.createDynamicsCompressor(), out = c.createGain(), dry = c.createGain(), wet = c.createGain(), rev = c.createConvolver(), n = c.sampleRate * 1.9 | 0, ib = c.createBuffer(2, n, c.sampleRate), i, ch, d;
      out.gain.value = 0.9; out.connect(comp); comp.connect(c.destination);
      for (ch = 0; ch < 2; ch++) { d = ib.getChannelData(ch); for (i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.8); }
      rev.buffer = ib; wet.gain.value = 0.3; dry.connect(out); wet.connect(rev); rev.connect(out);
      var nb = c.createBuffer(1, c.sampleRate * 3, c.sampleRate), nd = nb.getChannelData(0); for (i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      BS = { c: c, dry: dry, wet: wet, nb: nb };
    } catch (e) { BS = null; }
    return BS;
  }
  function bBus(g, send, dest) { if (dest) { g.connect(dest); return; } g.connect(BS.dry); var s = BS.c.createGain(); s.gain.value = send; g.connect(s); s.connect(BS.wet); }
  function bEnv(g, t, a, d, v) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function bTone(f, t, d, o) {
    o = o || {}; var c = BS.c, v = o.v == null ? 0.2 : o.v, a = o.a || 0.01, os = c.createOscillator(), g = c.createGain();
    os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + a + d);
    var nd = os; if (o.lp) { var l = c.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = o.lp; os.connect(l); nd = l; }
    nd.connect(g); bEnv(g, t, a, d, v); bBus(g, o.send == null ? 0.25 : o.send, o.dest); os.start(t); os.stop(t + a + d + 0.1);
  }
  function bNoise(t, d, o) {
    o = o || {}; var c = BS.c, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), a = o.a || 0.003;
    s.buffer = BS.nb; fl.type = o.type || 'bandpass'; fl.Q.value = o.q || 1.2; fl.frequency.setValueAtTime(o.f0 || 1800, t); fl.frequency.exponentialRampToValueAtTime(o.f1 || 900, t + a + d);
    s.connect(fl); fl.connect(g); bEnv(g, t, a, d, o.v || 0.1); bBus(g, o.send == null ? 0.2 : o.send, o.dest); s.start(t); s.stop(t + a + d + 0.1);
  }
  function bPiano(n, t, v, d, dest) { v = v || 0.1; d = d || 1.6; bTone(bF(n), t, d, { v: v, a: 0.006, lp: 2600, send: 0.45, dest: dest }); bTone(bF(n) * 2, t, d * 0.5, { type: 'triangle', v: v * 0.3, a: 0.004, lp: 3000, send: 0.45, dest: dest }); bTone(bF(n) * 3, t, d * 0.2, { v: v * 0.1, a: 0.003, send: 0.4, dest: dest }); }
  function bCel(n, t, v, d, dest) { v = v || 0.07; d = d || 1.8; bTone(bF(n), t, d, { v: v, a: 0.003, send: 0.6, dest: dest }); bTone(bF(n) * 4, t, d * 0.25, { v: v * 0.35, a: 0.002, send: 0.6, dest: dest }); bTone(bF(n) * 2.01, t, d * 0.5, { v: v * 0.2, a: 0.002, send: 0.6, dest: dest }); }
  function bPad(n, t, d, v) { bTone(bF(n), t, d, { type: 'sawtooth', v: v || 0.025, a: d * 0.45, lp: 650, send: 0.5 }); }
  function bLift(t) { bNoise(t, 0.025, { f0: 2600, f1: 1800, v: 0.05, send: 0.1 }); bTone(520, t, 0.04, { v: 0.04, f2: 640, a: 0.003, send: 0.1 }); }
  function bPlace(t) { bNoise(t, 0.035, { f0: 2200, f1: 1100, v: 0.12, q: 2.2, send: 0.15 }); bTone(190, t, 0.09, { v: 0.22, f2: 120, a: 0.003, lp: 900, send: 0.1 }); bTone(980, t, 0.03, { v: 0.05, a: 0.002, f2: 700, send: 0.1 }); }
  function bThud(t) { bTone(120, t, 0.2, { v: 0.28, f2: 70, a: 0.004, lp: 500, send: 0.08 }); bNoise(t, 0.1, { type: 'lowpass', f0: 700, f1: 150, v: 0.1, send: 0.05 }); }
  var BSET = {
    place: function (t) { bPlace(t); },
    remove: function (t) { bLift(t); },
    ok: function (t) { [62, 66, 69, 74].forEach(function (n, i) { bPiano(n, t + i * 0.07, 0.09, 1.8); }); bCel(86, t + 0.3, 0.05, 2); },
    bad: function (t) { bThud(t); bThud(t + 0.16); },
    open: function (t) { [50, 57, 62, 66].forEach(function (n, i) { bPiano(n, t + 0.05 + i * 0.12, 0.07, 2.4); }); bCel(86, t + 0.65, 0.05, 2.4); },
    finish: function (t) { [50, 57, 62, 66, 69, 74].forEach(function (n, i) { bPiano(n, t + i * 0.14, 0.08, 3.2); }); [43, 50, 55].forEach(function (n) { bPad(n, t, 2.8, 0.04); }); bCel(90, t + 1.1, 0.05, 3); }
  };
  var WT = 0;
  function wRun(c, fn) { try { var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) { } var n = Date.now(); if (!WT) WT = n + 600; var d = WT - n; if (d > 0) setTimeout(fn, d); else fn(); }   // Safari: let the speakers wake up before the first real sound
  function sound(n) {
    if (!snd() || !BSET[n]) return; var c = bAc(); if (!c) return;
    function run() { try { if (bx()) BSET[n](BS.c.currentTime + 0.03); } catch (e) { } }
    if (c.state === 'running') wRun(c, run); else { var done = false, once = function () { if (!done) { done = true; wRun(c, run); } }; try { var p = c.resume(); if (p && p.then) p.then(once, once); } catch (e) { } setTimeout(once, 250); }
  }
  var BCH = [[43, 59, 62, 66], [38, 57, 62, 66]], BMEL = [66, null, 69, null, 66, 64, null, 62, null, 59, null, null];
  function bMusic() {
    if (BM || !snd()) return; var c = bAc(); if (!c || c.state !== 'running' || !bx()) return;
    var mg = c.createGain(), ms = c.createGain(); mg.gain.value = 0.4; ms.gain.value = 0.4; mg.connect(BS.dry); mg.connect(ms); ms.connect(BS.wet);
    var sp = 60 / 66, step = 0, next = c.currentTime + 0.6;
    function sched(s, t) {
      var bar = Math.floor(s / 3) % 2, b = s % 3, ch = BCH[bar];
      if (b === 0) bPiano(ch[0], t, 0.07, 2.6, mg); else [1, 2, 3].forEach(function (i, j) { bPiano(ch[i], t + j * 0.012, 0.04, 1.6, mg); });
      var m = BMEL[s % 12]; if (m && b !== 1) bPiano(m, t, 0.05, 1.8, mg);
    }
    var timer = setInterval(function () { try { while (next < c.currentTime + 0.5) { sched(step, next); next += sp; step++; } } catch (e) { } }, 100);
    BM = { timer: timer, mg: mg, c: c };
  }
  function bStop() {
    if (!BM) return; var m = BM; BM = null; clearInterval(m.timer);
    try { var t = m.c.currentTime; m.mg.gain.cancelScheduledValues(t); m.mg.gain.setValueAtTime(m.mg.gain.value, t); m.mg.gain.linearRampToValueAtTime(0, t + 0.6); } catch (e) { }
  }
  function css() {
    if (document.getElementById('bi-css')) return;
    var s = document.createElement('style'); s.id = 'bi-css'; s.textContent = '#bi-ov{position:fixed;inset:0;z-index:2147482000;overflow:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(#f3efe4,#ebe5d4);color:#1a2744;font-family:"DM Sans",system-ui,-apple-system,sans-serif}\n'
      + '#bi-ov *{box-sizing:border-box}.bi-in{max-width:1080px;margin:0 auto;padding:14px 16px 28px}\n'
      + '.bi-hd{display:flex;align-items:center;gap:12px;margin:0 0 12px}.bi-back{font:700 1rem "DM Sans",system-ui,sans-serif;border:2px solid #1a2744;background:#fff;color:#1a2744;border-radius:14px;padding:10px 16px;cursor:pointer}\n'
      + '.bi-ht{font:700 1.6rem "Playfair Display",Georgia,serif;margin:0;line-height:1.1}.bi-hs{font-size:.9375rem;color:#5c6785;font-weight:600}.bi-code{display:inline-block;font:700 .8125rem ui-monospace,Menlo,monospace;background:#c0392b;color:#fff;border-radius:6px;padding:3px 9px;margin-left:8px;vertical-align:middle}\n'
      + '.bi-stage{position:relative;aspect-ratio:3/2;min-height:420px;padding:7% 8% 0;background:#0d3a22 url(' + BOARD + ') center/100% 100% no-repeat;border-radius:3.5%;box-shadow:0 14px 30px rgba(0,0,0,.35);color:#fff}\n'
      + '.bi-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 10px}.bi-lv{display:flex;gap:6px;background:rgba(0,0,0,.28);border-radius:999px;padding:4px}\n'
      + '.bi-lvb{font:800 .875rem "DM Sans",sans-serif;border:0;border-radius:999px;padding:7px 16px;background:transparent;color:#d9e8dc;cursor:pointer}.bi-lvb.on{background:#f1e2b8;color:#1a2744;box-shadow:0 2px 0 #b79a4e}\n'
      + '.bi-snd,.bi-sec{font:700 .8125rem "DM Sans",sans-serif;border:1.5px solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);color:#fff;border-radius:999px;padding:7px 14px;cursor:pointer}.bi-sec{font-size:.9375rem;border-radius:14px;padding:11px 18px}\n'
      + '.bi-dots{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:0 0 12px;position:relative;z-index:1}.bi-dot{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.25)}.bi-dot.done{background:#5be37d}.bi-dot.cur{background:#c9a84c;box-shadow:0 0 0 3px rgba(201,168,76,.4)}.bi-dt{font-size:.8125rem;color:#e8f1ea;margin-left:6px}\n'
      + '.bi-cluebtn{font:700 .875rem "DM Sans",sans-serif;border:0;border-radius:12px;padding:8px 14px;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;margin:0 0 10px;position:relative;z-index:1}.bi-clue{background:rgba(255,255,255,.95);color:#1a2744;border-radius:12px;padding:8px 14px;margin:0 0 10px;font-weight:600;position:relative;z-index:1}\n'
      + '.bi-cr{min-height:44px;position:relative;z-index:1}.bi-ctl{margin:0 0 6px}.bi-cluebtn:disabled{opacity:.45;cursor:default}.bi-many .bi-chip{min-height:46px;border-width:10px 11px 13px 11px;font-size:.9rem}.bi-many .bi-slot{min-width:42px;min-height:48px}.bi-mr{min-height:64px;position:relative;z-index:1}.bi-line{min-height:74px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;padding:4px 0;margin:0 0 10px;border-radius:14px;transition:box-shadow .2s}.bi-line.ok{box-shadow:0 0 0 2px rgba(201,168,76,.7),0 0 22px rgba(201,168,76,.45)}.bi-line.bad{box-shadow:0 0 0 2px rgba(210,90,90,.8),0 0 18px rgba(210,90,90,.4);animation:bishake .4s}\n'
      + '@keyframes bishake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}@keyframes bipulse{50%{box-shadow:0 0 0 5px rgba(201,168,76,.3)}}@keyframes bipop{0%{transform:scale(.6)}100%{transform:scale(1)}}\n'
      + '.bi-slot{display:inline-flex;align-items:center;justify-content:center;min-width:56px;min-height:64px;border:2px solid rgba(0,0,0,.28);border-radius:8px;background:rgba(0,0,0,.22);box-shadow:inset 0 2px 5px rgba(0,0,0,.35)}.bi-slot i{font:700 .8125rem "DM Sans",sans-serif;color:rgba(255,255,255,.35);font-style:normal;align-self:flex-start;margin:3px 0 0 4px}.bi-slot.next{border-color:#c9a84c;background:rgba(201,168,76,.18);animation:bipulse 1.2s ease-in-out infinite}.bi-slot.next i{color:#e6c871}\n'
      + '.bi-tray{position:absolute;left:17.5%;right:15.5%;bottom:12.4%;display:flex;flex-wrap:wrap-reverse;justify-content:center;align-content:flex-start;gap:6px}.bi-empty{color:#f1e2b8;font-style:italic;font-size:.9375rem;position:absolute;left:0;right:0;bottom:-2px;text-align:center}\n'
      + '.bi-chip{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-height:64px;border:0 solid transparent;border-width:15px 17px 20px 17px;padding:0 4px;background:none;border-image:url(' + TILE + ') 56 62 74 62 fill/15px 17px 20px 17px stretch;color:#4a3319;font:700 1.1875rem "DM Sans",sans-serif;letter-spacing:.01em;filter:drop-shadow(0 4px 4px rgba(0,0,0,.4));cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;white-space:nowrap}\n'
      + '.bi-chip:active{filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))}.bi-chip.fixed{color:#5b4a30;filter:brightness(.8) saturate(.75) drop-shadow(0 1px 1px rgba(0,0,0,.4));cursor:default;touch-action:auto}.bi-chip.pop{animation:bipop .28s cubic-bezier(.2,1.6,.4,1)}.bi-chip[disabled]{cursor:default}\n'
      + '.bi-ghost{opacity:.25}.bi-fly{cursor:grabbing;transform:translate(-50%,-50%) scale(1.06)!important}.bi-stage .drop{outline:3px solid #ffd76a;outline-offset:2px;background-color:rgba(255,215,106,.25)}\n'
      + '.bi-msg{font-weight:800;font-size:1.125rem;margin:0 0 8px;color:#fff;position:relative;z-index:1}.bi-msg.ok{color:#f1e2b8}.bi-msg.bad{color:#ffc9c9}.bi-star{display:inline-block;animation:bipop .5s cubic-bezier(.2,1.8,.4,1)}\n'
      + '.bi-right{background:rgba(255,255,255,.95);color:#1a2744;border-radius:12px;padding:10px 14px;font-weight:700;margin:0 0 10px;position:relative;z-index:1}.bi-acts{display:flex;flex-wrap:wrap;gap:10px;position:relative;z-index:1}\n'
      + '.bi-go{font:800 1.0625rem "DM Sans",sans-serif;border:0;border-radius:14px;padding:12px 22px;background:#f1e2b8;color:#1a2744;box-shadow:0 4px 0 #b79a4e;cursor:pointer}.bi-go:active{transform:translateY(3px);box-shadow:0 1px 0 #b79a4e}.bi-go[disabled]{opacity:.45;cursor:default}\n'
      + '.bi-done{text-align:center;padding:60px 16px;color:#fff}.bi-done b{display:block;font:700 1.6rem "Playfair Display",Georgia,serif;margin:8px 0}';
    document.head.appendChild(s);
  }
  // sentence -> tiles. Tiles are words (punctuation stays with its word); the level decides the size of the pieces and how many are already down
  function words(fr) {
    var out = []; String(fr).trim().split(/\s+/).forEach(function (t) { if (!t) return; if (out.length && /^[?!:;»]+$/.test(t)) out[out.length - 1] += ' ' + t; else if (/^[«¿¡]+$/.test(t)) { out.push(t); out.__pre = 1; } else if (out.length && /^[«¿¡]+$/.test(out[out.length - 1])) out[out.length - 1] += ' ' + t; else out.push(t); });
    return out;
  }
  function make(b, lv) {
    var w = words(b.fr), mx = lv === 1 ? 3 : lv === 2 ? 2 : 1, canon = [], q = 0;
    while (q < w.length) { var sz = mx === 1 ? 1 : 1 + Math.floor(Math.random() * mx); if (lv === 1 && sz === 1 && Math.random() < .3) sz = 2; if (!canon.length) sz = 1; canon.push(w.slice(q, q + sz).join(' ')); q += sz; }
    var n = canon.length, miss = Math.min(n - 1, Math.max(3, Math.round(n * (lv === 1 ? 1 / 3 : lv === 2 ? 1 / 2 : 1)))); if (lv === 3) miss = n; miss = Math.min(miss, 15);
    var idx = shuffle(canon.map(function (t, k) { return k; }).filter(function (k) { return lv === 3 ? true : k > 0; })), gone = {};
    idx.slice(0, miss).forEach(function (k) { gone[k] = 1; });
    var slots = canon.map(function (t, k) { return gone[k] ? null : { t: t, k: k, fixed: true }; });
    var bank = canon.map(function (t, k) { return { t: t, k: k }; }).filter(function (x) { return gone[x.k]; }), tries = 0, ks = Object.keys(gone).map(Number).sort(function (a, b) { return a - b; });
    do { bank = shuffle(bank); tries++; } while (tries < 30 && bank.length > 1 && bank.every(function (x, j) { return x.k === ks[j]; }));
    return { canon: canon, slots: slots, bank: bank, en: b.en || '', fr: b.fr, tries: 0, state: '' };
  }
  function deal() {
    var o = Z.opts, pool = (o.items || []).filter(function (b) { var n = words(b.fr || '').length; return b.fr && n >= 4 && n <= 40 && (/^[¿¡"«“‘']?\p{Lu}/u.test(b.fr) || n >= 6) && !/\b[XY]\b/.test(b.fr); });
    var good = pool.filter(function (b) { return words(b.fr).length >= 6 && !/\d{3,}/.test(b.fr); }); if (good.length >= (o.count || 6)) pool = good;   // prefer real sentences over short labels and dated references
    var sh = shuffle(pool); Z.rest = sh.slice(o.count || 6); Z.items = sh.slice(0, o.count || 6).map(function (b) { return make(b, Z.lv); }); Z.i = 0; Z.first = 0; Z.clue = false;
  }
  function open(o) {
    css(); close(true); Z = { opts: o, lv: parseInt(ls('bi_lv', '2'), 10) || 2 };
    root = document.createElement('div'); root.id = 'bi-ov'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Build it'); document.body.appendChild(root);
    Z.scroll = document.body.style.overflow; document.body.style.overflow = 'hidden';
    root.addEventListener('click', onClick); document.addEventListener('keydown', onKey, true);
    root.addEventListener('pointerdown', down); window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    bUnlock(); sound('open'); setTimeout(bMusic, 900); deal(); if (!Z.items.length) { root.innerHTML = '<div class="bi-in"><div class="bi-hd"><button type="button" class="bi-back" data-a="back">← Back</button></div><p>There are no sentences here that suit Build it.</p></div>'; return; }
    page();
  }
  function close(silent) {
    if (!root) return; document.removeEventListener('keydown', onKey, true); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    bStop(); root.remove(); root = null; if (Z) document.body.style.overflow = Z.scroll || ''; var cb = Z && Z.opts && Z.opts.onBack; Z = null; if (!silent && cb) cb();
  }
  function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }
  function full(it) { return it.slots.every(function (x) { return !!x; }); }
  function head() { var o = Z.opts; return '<div class="bi-hd"><button type="button" class="bi-back" data-a="back">← Back</button><div><h2 class="bi-ht">Build it' + (o.code ? '<span class="bi-code">' + esc(o.code) + '</span>' : '') + '</h2>' + (o.sub ? '<div class="bi-hs">' + esc(o.sub) + '</div>' : '') + '</div></div>'; }
  function page() {
    if (!root) return; var o = Z.opts, lg = o.lang || 'fr';
    if (Z.i >= Z.items.length) { if (!Z.fin) { Z.fin = 1; bStop(); sound('finish'); } root.innerHTML = '<div class="bi-in">' + head() + '<div class="bi-stage"><div class="bi-done"><div style="font-size:2.4rem">⭐</div><b>' + Z.first + ' of ' + Z.items.length + ' right first time</b><div>' + LV[Z.lv] + ' level</div><div class="bi-acts" style="justify-content:center;margin-top:18px"><button type="button" class="bi-go" data-a="again">Build again</button><button type="button" class="bi-sec" data-a="back">Back</button></div></div></div></div>'; root.scrollTop = 0; return; }
    var it = Z.items[Z.i], isFull = full(it), lock = it.state === 'ok' || it.state === 'shown', h = '<div class="bi-in">' + head() + '<div class="bi-stage' + (it.slots.length > 11 ? ' bi-many' : '') + '">';
    h += '<div class="bi-top"><div class="bi-lv" role="group" aria-label="Level">' + [1, 2, 3].map(function (n) { return '<button type="button" class="bi-lvb' + (Z.lv === n ? ' on' : '') + '" data-a="level" data-v="' + n + '">' + LV[n] + '</button>'; }).join('') + '</div><button type="button" class="bi-snd" data-a="snd" aria-pressed="' + (snd() ? 'true' : 'false') + '">' + (snd() ? '🔊 Sound' : '🔇 Muted') + '</button></div>';
    h += '<div class="bi-dots">' + Z.items.map(function (x, j) { return '<span class="bi-dot' + (j < Z.i ? ' done' : j === Z.i ? ' cur' : '') + '"></span>'; }).join('') + '<span class="bi-dt">Sentence ' + (Z.i + 1) + ' of ' + Z.items.length + ' · ' + (Z.lv === 1 ? 'up to three words a piece, most in place' : Z.lv === 2 ? 'mostly single words, half in place' : 'single words') + '</span></div>';
    var lk0 = it.state === 'ok' || it.state === 'shown'; h += '<div class="bi-acts bi-ctl">' + (lk0 ? '<button type="button" class="bi-sec" data-a="say">🔊 Hear it</button><button type="button" class="bi-go" data-a="next">' + (Z.i < Z.items.length - 1 ? 'Next sentence →' : 'Finish ✓') + '</button>' : (it.en ? '<button type="button" class="bi-cluebtn" data-a="clue"' + (Z.clue ? ' disabled' : '') + '>💡 Give me a clue</button>' : '') + '<button type="button" class="bi-sec" data-a="tile">🎯 Clue: put one tile in for me</button><button type="button" class="bi-sec" data-a="skip">↷ Another sentence</button><button type="button" class="bi-sec" data-a="show">Show me the answer</button>') + '</div><div class="bi-cr">' + (it.en && Z.clue ? '<div class="bi-clue">💡 ' + esc(it.en) + '</div>' : '') + '</div>';
    var ne = it.slots.indexOf(null);
    h += '<div class="bi-line' + (it.state === 'ok' ? ' ok' : it.state === 'bad' ? ' bad' : '') + '" lang="' + lg + '">' + it.slots.map(function (p, j) {
      if (!p) return '<span class="bi-slot' + (j === ne && !lock ? ' next' : '') + '" data-s="' + j + '"><i>' + (j + 1) + '</i></span>';
      if (p.fixed) return '<span class="bi-chip fixed" data-s="' + j + '">' + esc(p.t) + '</span>';
      return '<button type="button" class="bi-chip on' + (it.pop === j ? ' pop' : '') + '" data-a="unpick" data-k="' + j + '" data-s="' + j + '"' + (lock ? ' disabled' : '') + '>' + esc(p.t) + '</button>';
    }).join('') + '</div>'; it.pop = -1;
    h += '<div class="bi-tray" lang="' + lg + '">' + (it.bank.length ? it.bank.map(function (p, j) { return '<button type="button" class="bi-chip" data-a="pick" data-k="' + j + '"' + (lock ? ' disabled' : '') + '>' + esc(p.t) + '</button>'; }).join('') : '<span class="bi-empty">All the tiles are placed</span>') + '</div>';
    var nxt = '<button type="button" class="bi-go" data-a="next">' + (Z.i < Z.items.length - 1 ? 'Next sentence →' : 'Finish ✓') + '</button>', hear = '<button type="button" class="bi-sec" data-a="say">🔊 Hear it</button>';
    var mg = it.state === 'ok' ? '<div class="bi-msg ok"><span class="bi-star">⭐</span> Correct!</div>' : it.state === 'shown' ? '<div class="bi-msg">The right order:</div><div class="bi-right" lang="' + lg + '">' + esc(it.fr) + '</div>' : it.state === 'bad' ? '<div class="bi-msg bad">Not quite. Move the tiles round and it will check again.</div>' : '';
    h += '<div class="bi-mr">' + mg + '</div>';
    root.innerHTML = h + '</div></div>';
  }
  function cur() { return Z.items[Z.i]; }
  function hint() { var it = cur(); if (!it || it.state === 'ok' || it.state === 'shown') return; var opts = []; it.slots.forEach(function (p, j) { if (p) return; var k = -1; it.bank.forEach(function (b, m) { if (k < 0 && b.t === it.canon[j]) k = m; }); if (k >= 0) opts.push([j, k]); }); var ne = it.slots.indexOf(null), others = opts.filter(function (x) { return x[0] !== ne; }); if (others.length) opts = others; if (!opts.length) return; var o = opts[Math.floor(Math.random() * opts.length)], c = it.bank.splice(o[1], 1)[0]; c.fixed = true; it.slots[o[0]] = c; it.state = ''; sound('place'); if (full(it)) check(); else page(); }
  function pick(k) { if (Date.now() - (Z.dragEnd || 0) < 350) return; var it = cur(); if (!it || it.state === 'ok' || it.state === 'shown') return; var j = it.slots.indexOf(null); if (j < 0) return; var p = it.bank.splice(k, 1)[0]; if (p) { it.slots[j] = p; it.state = ''; it.pop = j; sound('place'); } if (full(it)) check(); else page(); }
  function unpick(k) { if (Date.now() - (Z.dragEnd || 0) < 350) return; var it = cur(); if (!it || it.state === 'ok' || it.state === 'shown') return; var p = it.slots[k]; if (p && !p.fixed) { it.slots[k] = null; it.bank.push(p); it.state = ''; sound('remove'); } page(); }
  function check() { var it = cur(); if (!full(it)) return; it.tries++; var ok = it.slots.map(function (p) { return p.t; }).join(' ') === it.canon.join(' '); if (ok) { it.state = 'ok'; if (it.tries === 1) Z.first++; sound('ok'); } else { it.state = 'bad'; sound('bad'); } page(); }
  function retry() { var it = cur(); it.slots = it.slots.map(function (p) { if (p && !p.fixed) { it.bank.push(p); return null; } return p; }); it.state = ''; page(); }
  function say(t) { var o = Z.opts; if (o.say) { o.say(t); return; } try { var sy = window.speechSynthesis; if (sy.speaking) { sy.cancel(); return; } var u = new SpeechSynthesisUtterance(t); u.lang = { fr: 'fr-FR', es: 'es-ES', it: 'it-IT' }[o.lang || 'fr'] || 'fr-FR'; u.rate = .9; sy.speak(u); } catch (e) { } }
  function onClick(e) {
    var t = e.target.closest && e.target.closest('[data-a]'); if (!t || !Z) return; var a = t.getAttribute('data-a');
    if (a === 'back') close(); else if (a === 'pick') pick(+t.getAttribute('data-k')); else if (a === 'unpick') unpick(+t.getAttribute('data-k')); else if (a === 'check') check(); else if (a === 'retry') retry();
    else if (a === 'tile') hint(); else if (a === 'skip') { var nb = Z.rest && Z.rest.shift(); if (nb) { Z.items[Z.i] = make(nb, Z.lv); Z.clue = false; page(); } else { Z.i++; Z.clue = false; page(); } } else if (a === 'show') { cur().state = 'shown'; page(); } else if (a === 'next') { Z.i++; Z.clue = false; page(); root.scrollTop = 0; } else if (a === 'clue') { Z.clue = true; page(); }
    else if (a === 'say') say(cur().fr); else if (a === 'again') { deal(); Z.fin = 0; setTimeout(bMusic, 300); page(); }
    else if (a === 'snd') { ss('bi_snd', snd() ? '0' : '1'); if (snd()) { sound('place'); if (Z && Z.i < Z.items.length) bMusic(); } else bStop(); page(); } else if (a === 'level') { Z.lv = +t.getAttribute('data-v'); ss('bi_lv', Z.lv); deal(); page(); }
  }
  // drag and drop (finger, Apple Pencil or mouse); tapping works as well
  function down(e) { if (!Z || (e.button != null && e.button > 0)) return; var el = e.target.closest && e.target.closest('.bi-chip[data-a="pick"],.bi-chip[data-a="unpick"]'); if (!el || el.disabled) return; st = { el: el, id: e.pointerId, x: e.clientX, y: e.clientY, on: false, from: el.getAttribute('data-a') === 'pick' ? { tray: +el.getAttribute('data-k') } : { slot: +el.getAttribute('data-k') }, clone: null }; }
  function target(x, y) { var t = document.elementFromPoint(x, y); return t && t.closest ? t.closest('.bi-slot,.bi-line .bi-chip,.bi-tray') : null; }
  function move(e) {
    if (!st || e.pointerId !== st.id) return;
    if (!st.on) { if (Math.abs(e.clientX - st.x) + Math.abs(e.clientY - st.y) < 10) return; st.on = true; var r = st.el.getBoundingClientRect(), cl = st.el.cloneNode(true); cl.classList.add('bi-fly'); cl.removeAttribute('data-a'); cl.style.cssText = 'position:fixed;left:0;top:0;width:' + r.width + 'px;margin:0;pointer-events:none;z-index:2147483000'; document.body.appendChild(cl); st.clone = cl; st.el.classList.add('bi-ghost'); }
    st.clone.style.left = e.clientX + 'px'; st.clone.style.top = e.clientY + 'px';
    Array.prototype.forEach.call(root.querySelectorAll('.drop'), function (n) { n.classList.remove('drop'); }); var g = target(e.clientX, e.clientY); if (g && !g.classList.contains('fixed')) g.classList.add('drop'); e.preventDefault();
  }
  function up(e) {
    if (!st || e.pointerId !== st.id) return; var s0 = st; st = null; if (!s0.on || !Z) return; if (s0.clone) s0.clone.remove(); s0.el.classList.remove('bi-ghost'); Z.dragEnd = Date.now();
    var g = e.type === 'pointercancel' ? null : target(e.clientX, e.clientY); if (!g) { page(); return; } drop(s0.from, g);
  }
  function drop(from, g) {
    var it = cur(); if (!it || it.state === 'ok' || it.state === 'shown') return page(); var chip = from.tray != null ? it.bank[from.tray] : it.slots[from.slot]; if (!chip) return page();
    if (g.classList.contains('bi-tray')) { if (from.slot != null) { it.slots[from.slot] = null; it.bank.push(chip); it.state = ''; sound('remove'); } return page(); }
    var to = +g.getAttribute('data-s'), occ = it.slots[to]; if (isNaN(to) || (occ && occ.fixed) || from.slot === to) return page();
    if (from.tray != null) { it.bank.splice(from.tray, 1); it.slots[to] = chip; if (occ) it.bank.push(occ); } else { it.slots[from.slot] = occ || null; it.slots[to] = chip; }
    it.state = ''; it.pop = to; sound('place'); if (full(it)) check(); else page();
  }
  window.BuildIt = { open: open, close: close, ICON: '{{ICON}}' };
})();
