/* AP AUDIOFIX: one shared, always-unlocked audio engine for every page (iPad Prisma / Safari first).
   Loaded FIRST in <head>, before any app script. Does five things:
   1. Every `new AudioContext()` in the page (Gamify, Match, Build it, splashes, drills...) returns ONE shared context.
      iOS allows only a few contexts per page and each one has to be unlocked separately; one context is unlocked by one tap.
   2. Every tap / click / key press (capture phase, so it runs before the app's own handler) resumes that context, plays a
      silent 1-sample buffer through it, and sets navigator.audioSession.type = 'playback' so the iPad silent switch cannot mute it.
   3. Older iPads without audioSession: a REAL silent looping clip (not an empty file) keeps the media session in playback mode.
   4. Re-wakes the context when the page comes back (screen lock, app switch, phone call: iOS then reports 'interrupted').
   5. If sound is still blocked after a tap, a small "tap here for sound" chip appears until it works. Add #sounddebug to the
      address for a status line (context state, taps, contexts asked for) with a test beep.
   Also gives window.__apAudio.clip(src, vol) / .prep(src): plays a recorded clip through Web Audio (no loose <audio> elements). */
(function () {
  var W = window, noop = function () { };
  var G = W.__apAudio;
  if (!G) {
    G = W.__apAudio = { ctx: null, made: 0, kicks: 0, buf: {}, loop: null, H: null, chip: null, dbg: null, Real: null, Shim: null };
    var Real = W.AudioContext || W.webkitAudioContext;
    G.Real = Real;
    if (Real && !Real.__apShim) {
      G.make = function () {
        var c = null;
        try { c = new Real(); } catch (e) { try { c = new Real(); } catch (e2) { c = null; } }
        if (!c) throw new Error('AudioContext unavailable');
        try { c.close = function () { return Promise.resolve(); }; } catch (e) { }   // nobody may shut the shared context
        try { if (c.addEventListener) c.addEventListener('statechange', function () { if (c.state !== 'running' && c === G.ctx) { try { var p = c.resume(); if (p && p.catch) p.catch(noop); } catch (e) { } } }); } catch (e) { }
        return c;
      };
      var Shim = function () {
        G.made++;
        if (!G.ctx || G.ctx.state === 'closed') G.ctx = G.make();
        return G.ctx;
      };
      Shim.prototype = Real.prototype; Shim.__apShim = 1;
      try { W.AudioContext = Shim; } catch (e) { }
      try { W.webkitAudioContext = Shim; } catch (e) { }
      G.Shim = Shim;
    }
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }

    // a real, silent, looping clip (0.4 s of 8 kHz mono silence made here) for iPads that lack navigator.audioSession
    G.silentWav = function () {
      var n = 3200, b = new Uint8Array(44 + n), dv = new DataView(b.buffer), i;
      function s(o, t) { for (var k = 0; k < t.length; k++) b[o + k] = t.charCodeAt(k); }
      s(0, 'RIFF'); dv.setUint32(4, 36 + n, true); s(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
      dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); s(36, 'data'); dv.setUint32(40, n, true);
      for (i = 0; i < n; i++) b[44 + i] = 128;
      var bin = ''; for (i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
      return 'data:audio/wav;base64,' + btoa(bin);
    };
    G.startLoop = function () {
      try {
        if (!G.loop) { var a = new Audio(); a.src = G.silentWav(); a.loop = true; a.preload = 'auto'; a.setAttribute('playsinline', ''); a.setAttribute('webkit-playsinline', ''); a.volume = 1; G.loop = a; }
        if (G.loop.paused) { var p = G.loop.play(); if (p && p.catch) p.catch(noop); }
      } catch (e) { }
    };

    G.resume = function () {
      var c = G.ctx; if (!c || c.state === 'running') return;
      try { var p = c.resume(); if (p && p.catch) p.catch(noop); } catch (e) { }
    };
    // runs inside every tap: make (if needed), resume, ping
    G.kick = function () {
      G.kicks++;
      try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) { }
      var c = G.ctx;
      if (!c && G.Shim) { try { var m = G.made; c = new G.Shim(); G.made = m; } catch (e) { c = null; } }
      if (c) {
        G.resume();
        if (c.state !== 'running' || !c.__apPing) {
          try { var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); c.__apPing = 1; } catch (e) { }
        }
      }
      if (!navigator.audioSession) G.startLoop();
      try { var P = W.parent; if (P && P !== W && P.__apAudio && P.__apAudio.kick) P.__apAudio.kick(); } catch (e) { }   // frames: wake the page's context too
      setTimeout(G.check, 1300);
    };
    // 'running' is not proof of sound: after a long stall the iPad can leave a context that says running while its clock is frozen
    G.frozen = function () {
      var c = G.ctx; if (!c || c.state !== 'running') return false;
      var now = performance.now(), ct = c.currentTime, L = G.lastT;
      if (!L || L.c !== c) { G.lastT = { at: now, ct: ct, c: c }; return false; }
      if (now - L.at < 700) return false;
      G.lastT = { at: now, ct: ct, c: c };
      return (ct - L.ct) < ((now - L.at) / 1000) * 0.25;
    };
    G.check = function () {
      var c = G.ctx;
      if (!c) { G.hideChip(); return; }
      if (c.state === 'running' && !G.frozen()) { G.hideChip(); G.bad = 0; return; }
      G.resume();
      if (c.state === 'running') { G.bad = (G.bad || 0) + 1; if (G.bad < 2) { setTimeout(G.check, 900); return; } }
      if (G.made > 0 && G.kicks > 0) G.showChip();   // only when something in the page has asked for sound and the page has been tapped
    };
    // tapped the chip (shown only when the sound is really dead): build a fresh context that every engine follows
    G.recover = function () {   // runs inside the tap on the chip: a new context is only allowed to start inside a tap, so build it right now
      G.renew(); G.kick();
      setTimeout(G.check, 800);
    };
    G.renew = function () {
      try {
        var old = G.ctx, c = G.make(); G.ctx = c; G.renewed = (G.renewed || 0) + 1; G.lastT = null; G.bad = 0;
        try { W.__apCtx = c; } catch (e) { }
        try { if (W.__amCtx) W.__amCtx = c; } catch (e) { }
        try { var p = c.resume(); if (p && p.catch) p.catch(noop); } catch (e) { }
        try { var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) { }
        if (old) { try { G.Real.prototype.close.call(old); } catch (e) { } }
        G.buf = {};   // decoded clips belong to the old context
        try { W.dispatchEvent(new Event('apaudio-renew')); } catch (e) { }
      } catch (e) { }
    };
    G.showChip = function () {
      try {
        if (G.chip && G.chip.isConnected) return;
        if (!document.body) return;
        var b = document.createElement('div'); b.id = 'ap-sound-chip'; b.setAttribute('role', 'button');
        b.textContent = '🔇 Sound has stopped: tap here to turn it back on';
        b.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483600;max-width:92vw;text-align:center;background:#0b1a3b;color:#f0d27a;border:2px solid #f0d27a;border-radius:999px;padding:14px 22px;font:700 18px/1.2 system-ui,-apple-system,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.6);cursor:pointer;-webkit-tap-highlight-color:transparent';
        b.addEventListener('click', function () { G.recover(); G.beep(); });
        document.body.appendChild(b); G.chip = b;
      } catch (e) { }
    };
    G.hideChip = function () { try { if (G.chip && G.chip.parentNode) G.chip.parentNode.removeChild(G.chip); G.chip = null; } catch (e) { } };
    G.beep = function () {
      try {
        var c = G.ctx; if (!c) return; var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
        o.type = 'sine'; o.frequency.value = 660; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.3);
      } catch (e) { }
    };

    // recorded clips through Web Audio (decoded once, then played from memory)
    function decode(src, cb) {
      var e = G.buf[src];
      if (e && e.b) return cb(e.b);
      if (e && e.fail) return cb(null);
      if (e && e.q) { e.q.push(cb); return; }
      var c = G.ctx; if (!c) return cb(null);
      e = G.buf[src] = { q: [cb] };
      function done(b) { if (!e.q) return; var q = e.q; e.q = null; if (b) e.b = b; else e.fail = 1; for (var k = 0; k < q.length; k++) { try { q[k](b); } catch (x) { } } }
      function ready(ab) { try { var r = c.decodeAudioData(ab, function (b) { done(b); }, function () { done(null); }); if (r && r.catch) r.catch(function () { done(null); }); } catch (x) { done(null); } }
      try {
        if (/^data:/.test(src)) { var i = src.indexOf(','), bin = atob(src.slice(i + 1)), u = new Uint8Array(bin.length); for (var k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); ready(u.buffer); }
        else { var x = new XMLHttpRequest(); x.open('GET', src); x.responseType = 'arraybuffer'; x.onload = function () { ready(x.response); }; x.onerror = function () { done(null); }; x.send(); }
      } catch (x2) { done(null); }
    }
    G.prep = function (src) { try { if (typeof src === 'string' && src) decode(src, noop); } catch (e) { } };
    // true = played through Web Audio now; false = not ready (it is being decoded for next time), so the caller plays its usual way
    G.clip = function (src, vol, onend) {
      try {
        if (typeof src !== 'string' || !src) return false;
        var c = G.ctx, e = G.buf[src];
        if (!c) return false;
        if (c.state !== 'running') { G.resume(); decode(src, noop); return false; }
        if (!e || !e.b) { decode(src, noop); return false; }
        var s = c.createBufferSource(), g = c.createGain(); s.buffer = e.b; g.gain.value = vol == null ? 1 : vol; s.connect(g); g.connect(c.destination);
        if (onend) s.onended = onend; s.start(0); return true;
      } catch (x) { return false; }
    };

    G.watch = function () {
      try { if (document.visibilityState === 'hidden' || !G.kicks || !G.ctx) return; G.check(); } catch (e) { }
    };
    setInterval(function () { G.watch(); }, 2500);
    G.wake = function () {
      try {
        if (document.visibilityState === 'hidden') { if (G.loop && !G.loop.paused) G.loop.pause(); return; }
        G.resume();
      } catch (e) { }
    };
    G.debugOn = function () {
      try {
        if (!/sounddebug/i.test(String(location.hash || '') + String(location.search || ''))) return;
        if (G.dbg && G.dbg.isConnected) return;
        if (!document.body) return;
        var d = document.createElement('div'); d.id = 'ap-sound-dbg';
        d.style.cssText = 'position:fixed;right:8px;top:8px;z-index:2147483601;background:#111;color:#9ff;font:12px/1.3 monospace;padding:6px 9px;border-radius:6px;white-space:pre;opacity:.92';
        d.addEventListener('click', function () { G.kick(); G.beep(); });
        document.body.appendChild(d); G.dbg = d;
        // sound test buttons (only with #sounddebug): tap each one and tell me which makes the odd noise
        var tb = document.createElement('div'); tb.id = 'ap-sound-tests';
        tb.style.cssText = 'position:fixed;right:8px;top:92px;z-index:2147483601;display:flex;flex-direction:column;gap:6px';
        function sw(f0, f1, dur, type) { try { G.kick(); var c = G.ctx, t = c.currentTime + .02, o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .05); } catch (e) { } }
        function noise() { try { G.kick(); var c = G.ctx, n = Math.floor(c.sampleRate * .3), b = c.createBuffer(1, n, c.sampleRate), x = b.getChannelData(0), i; for (i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n); var s = c.createBufferSource(); s.buffer = b; var g = c.createGain(); g.gain.value = .3; s.connect(g); g.connect(c.destination); s.start(); } catch (e) { } }
        [['1 plain beep', function () { G.kick(); G.beep(); }], ['2 falling tone', function () { sw(600, 120, .6); }], ['3 rising tone', function () { sw(200, 2000, .6); }], ['4 noise burst', noise], ['5 reset audio', function () { G.renew(); G.beep(); }]].forEach(function (a) {
          var b = document.createElement('button'); b.textContent = a[0]; b.style.cssText = 'font:600 15px system-ui;padding:12px 16px;border-radius:10px;border:2px solid #9ff;background:#123;color:#9ff';
          b.addEventListener('click', function (ev) { ev.stopPropagation(); a[1](); }); tb.appendChild(b);
        });
        document.body.appendChild(tb);
        setInterval(function () {
          var c = G.ctx;
          d.textContent = 'sound: ' + (c ? c.state : 'no context') + '\nrate ' + (c ? c.sampleRate : '-') + '  taps ' + G.kicks + '  asked ' + G.made +
            '\nsession ' + ((navigator.audioSession && navigator.audioSession.type) || 'n/a') + '  loop ' + (G.loop ? (G.loop.paused ? 'paused' : 'playing') : 'off') + '\n(tap here for a test beep)';
        }, 400);
      } catch (e) { }
    };
  }

  // (re)attach the listeners to the current document (document.open() erases them, so this runs again for every page the router writes)
  var EVS = ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown'];
  if (!G.H) G.H = function () { try { G.kick(); } catch (e) { } };
  EVS.forEach(function (e) { try { W.removeEventListener(e, G.H, true); } catch (x) { } try { W.addEventListener(e, G.H, { capture: true, passive: true }); } catch (x) { try { W.addEventListener(e, G.H, true); } catch (y) { } } });
  ['visibilitychange', 'pageshow', 'focus'].forEach(function (e) { try { (e === 'visibilitychange' ? document : W).removeEventListener(e, G.wake, true); (e === 'visibilitychange' ? document : W).addEventListener(e, G.wake, true); } catch (x) { } });
  try { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', G.debugOn); else G.debugOn(); } catch (e) { }
})();
