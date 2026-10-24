/* AP MATCHFX v1: reacts to the classes the Match game already sets (sel / done / bad); changes no game logic */
(function () {
  if (window.__apMatchFx) return; window.__apMatchFx = 1;
  var PAL = [['#e8f0ff','#3b6fe0','#1f4bb0'],['#fff0e0','#e08a1f','#9a5a08'],['#f3e8ff','#8a4fd6','#5d2ea6'],['#e0f6ee','#1fa37a','#0f6e51'],['#ffe8ef','#d6457a','#9d1f50'],['#e7f6fb','#1f9fc4','#106a85']];
  var SK = 'ap_match_snd', ctx = null;
  function snd() { try { return localStorage.getItem(SK) !== 'off'; } catch (e) { return true; } }
  function setSnd(v) { try { localStorage.setItem(SK, v ? 'on' : 'off'); } catch (e) { } }
  function ac() { try { if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); } if (ctx && ctx.state === 'suspended') ctx.resume(); } catch (e) { } return ctx; }
  function tone(type, f0, f1, dur, vol) {
    if (!snd()) return; var c = ac(); if (!c) return;
    try { var o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02); } catch (e) { }
  }
  function pop() { tone('sine', 520, 900, 0.11, 0.07); }
  function dull() { tone('triangle', 190, 120, 0.14, 0.05); }
  function cheer() { tone('sine', 660, 990, 0.14, 0.06); setTimeout(function () { tone('sine', 880, 1320, 0.18, 0.06); }, 120); }
  function idx(el) { var m = /^(?:ms|ps)-[ef](\d+)$/.exec(el.id || ''); return m ? +m[1] : -1; }
  function floatTxt(txt, near) {
    var r = (near || document.body).getBoundingClientRect(), s = document.createElement('div'); s.className = 'mfx-float'; s.textContent = txt;
    s.style.left = (r.left + r.width / 2 + 40) + 'px'; s.style.top = (r.top + 6) + 'px'; document.body.appendChild(s); setTimeout(function () { s.remove(); }, 1100);
  }
  function confetti(n) {
    var cols = ['#e0a800', '#3b6fe0', '#d6457a', '#1fa37a', '#8a4fd6', '#e08a1f'];
    for (var i = 0; i < n; i++) { var d = document.createElement('div'); d.className = 'mfx-conf'; d.style.left = (Math.random() * 100) + 'vw'; d.style.background = cols[i % cols.length];
      d.style.setProperty('--x', (Math.random() * 160 - 80) + 'px'); d.style.setProperty('--r', (360 + Math.random() * 540) + 'deg'); d.style.setProperty('--d', (1.5 + Math.random() * 1.2) + 's'); d.style.animationDelay = (Math.random() * 0.4) + 's';
      document.body.appendChild(d); (function (x) { setTimeout(function () { x.remove(); }, 3400); })(d); }
  }
  var lastPen = 0, lastTime = '';
  function refresh() {
    var sheet = document.querySelector('.ms-ov .ms-sheet'); if (!sheet) return;
    var tm = sheet.querySelector('.ms-time'), tiles = sheet.querySelectorAll('.ms-t');
    var isMatch = !!(tm && tiles.length && sheet.querySelector('.ms-grid'));
    sheet.classList.toggle('mfx-on', isMatch);
    if (isMatch) {
      if (!sheet.querySelector('.mfx-snd')) { var b = document.createElement('button'); b.className = 'mfx-snd'; b.type = 'button'; b.setAttribute('aria-label', 'Sound on or off'); b.textContent = snd() ? '🔊' : '🔇';
        b.onclick = function () { var v = !snd(); setSnd(v); b.textContent = v ? '🔊' : '🔇'; if (v) pop(); }; sheet.appendChild(b); }
      var sel = sheet.querySelector('.ms-t.sel'), selSide = sel ? (/^(?:ms|ps)-([ef])/.exec(sel.id) || [])[1] : null;
      for (var i = 0; i < tiles.length; i++) { var t = tiles[i], ix = idx(t), sd = (/^(?:ms|ps)-([ef])/.exec(t.id) || [])[1];
        t.classList.toggle('mfx-target', !!(selSide && sd && sd !== selSide));
        if (t.classList.contains('done') && !t.style.getPropertyValue('--pc') && ix >= 0) { var p = PAL[ix % PAL.length]; t.style.setProperty('--pcb', p[0]); t.style.setProperty('--pc', p[1]); t.style.setProperty('--pci', p[2]); } }
      var txt = tm.textContent, v = parseFloat(txt) || 0;
      tm.classList.toggle('mfx-warm', v >= 30 && v < 60); tm.classList.toggle('mfx-hot', v >= 60);
    }
  }
  var prevDone = 0, prevBad = 0;
  function onMut() {
    refresh();
    var sheet = document.querySelector('.ms-ov .ms-sheet');
    if (sheet && sheet.querySelector('.ms-time') && sheet.querySelector('.ms-grid')) {
      var d = sheet.querySelectorAll('.ms-t.done').length, bd = sheet.querySelectorAll('.ms-t.bad').length;
      if (d > prevDone && d % 2 === 0) pop();
      if (bd > prevBad) { dull(); var tm = sheet.querySelector('.ms-time'); tm.classList.remove('mfx-flash'); void tm.offsetWidth; tm.classList.add('mfx-flash'); floatTxt('+3 s', tm); }
      prevDone = d; prevBad = bd;
    } else { prevDone = 0; prevBad = 0;
      var big = document.querySelector('.ms-ov .ms-big');
      if (big && !big.dataset.mfx && /Match/.test((document.querySelector('.ms-ov h2') || {}).textContent || '') && /second/.test(big.textContent)) {
        big.dataset.mfx = 1; var nb = /New best/i.test((big.parentNode || document).textContent); confetti(nb ? 110 : 45); cheer(); } }
  }
  function start() { var mo = new MutationObserver(onMut); mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    document.addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('.ms-ov .ms-t')) ac(); }, true); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
