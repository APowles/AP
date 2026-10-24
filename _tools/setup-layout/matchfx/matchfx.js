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
  var PENTA = [0, 2, 4, 7, 9, 12];
  function pop(n) { var f = 520 * Math.pow(2, PENTA[Math.min(n || 0, 5)] / 12); tone('sine', f, f * 1.7, 0.11, 0.07); }
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

  function bestTime() { try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (/match/i.test(k) && /best/i.test(k)) { var v = parseFloat(localStorage.getItem(k)); if (v > 0) return v; } } } catch (e) { } return null; }
  function spark(el, col) {
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 9; i++) { var d = document.createElement('div'); d.className = 'mfx-spark'; var a = Math.random() * 6.283, dist = 40 + Math.random() * 50;
      d.style.left = cx + 'px'; d.style.top = cy + 'px'; d.style.background = col; d.style.setProperty('--dx', Math.cos(a) * dist + 'px'); d.style.setProperty('--dy', Math.sin(a) * dist + 'px');
      document.body.appendChild(d); (function (x) { setTimeout(function () { x.remove(); }, 800); })(d); }
  }
  function word(txt, el) { var r = el.getBoundingClientRect(), w = document.createElement('div'); w.className = 'mfx-word'; w.textContent = txt; w.style.left = (r.left + r.width / 2 - 40) + 'px'; w.style.top = (r.top + 30) + 'px'; document.body.appendChild(w); setTimeout(function () { w.remove(); }, 1200); }
  // Match is silent by default: the French / Italian / Spanish is only spoken when the boy switches Voice on
  var TK = 'ap_match_tts';
  function tts() { try { return localStorage.getItem(TK) === 'on'; } catch (e) { return false; } }
  try { var SP = window.SpeechSynthesis && window.SpeechSynthesis.prototype; if (SP && !SP.__apMF) { SP.__apMF = 1; var so = SP.speak;
    SP.speak = function (u) { try { if (document.querySelector('.ms-ov .ms-grid') && !tts()) return; } catch (e) { } return so.call(this, u); }; } } catch (e) { }
  var G = null;   // the current game
  function setT(el, t) { if (el.textContent !== t) el.textContent = t; }   // never rewrite identical text: the observer would loop
  function buildRace(sheet, tm) {
    if (sheet.querySelector('.mfx-race')) return;
    var r = document.createElement('div'); r.className = 'mfx-race';
    r.innerHTML = '<div class="mfx-lane"><div class="mfx-fill"></div><div class="mfx-ghost" style="display:none;left:0%">👻</div><div class="mfx-you" style="left:0%">🧩</div></div><div class="mfx-lbl"><span class="cnt"></span><span class="mfx-streak"></span><span class="st"></span></div>';
    tm.parentNode.insertBefore(r, tm.nextSibling);
  }
  function updateRace(sheet, tm, total, done) {
    var lane = sheet.querySelector('.mfx-lane'); if (!lane) return;
    var you = lane.querySelector('.mfx-you'), gh = lane.querySelector('.mfx-ghost'), fill = lane.querySelector('.mfx-fill'), lbl = sheet.querySelector('.mfx-lbl');
    var yp = total ? done / total : 0, t = parseFloat(tm.textContent) || 0;
    you.style.left = (yp * 100) + '%'; fill.style.width = (yp * 100) + '%';
    var cnt = lbl.querySelector('.cnt'), st = lbl.querySelector('.st');
    setT(cnt, done + ' of ' + total + ' pairs');
    if (G.best) {
      var gp = Math.min(1, t / G.best); gh.style.display = ''; gh.style.left = (gp * 100) + '%';
      var behind = t > 0.5 && yp + 0.0001 < gp - 0.02; lane.classList.toggle('behind', behind);
      setT(st, done === total ? '' : (t < 0.5 ? 'Race your best: ' + G.best.toFixed(1) + ' s' : behind ? 'Behind your best' : 'Ahead of your best'));
    } else { gh.style.display = 'none'; lane.classList.remove('behind'); setT(st, done === total ? '' : 'Set your first best time'); }
  }
  function refresh(sheet) {
    var tm = sheet.querySelector('.ms-time'), tiles = sheet.querySelectorAll('.ms-t'), grid = sheet.querySelector('.ms-grid');
    var isMatch = !!(tm && tiles.length && grid);
    sheet.classList.toggle('mfx-on', isMatch);
    if (!isMatch) return false;
    if (!G || G.grid !== grid) G = { grid: grid, total: Math.floor(tiles.length / 2), best: bestTime(), streak: 0, prevBad: 0 };
    if (!sheet.querySelector('.mfx-snd')) { var b = document.createElement('button'); b.className = 'mfx-snd'; b.type = 'button'; b.setAttribute('aria-label', 'Sound effects on or off'); b.textContent = snd() ? '🔊' : '🔇';
      b.onclick = function () { var v = !snd(); setSnd(v); b.textContent = v ? '🔊' : '🔇'; if (v) pop(0); }; sheet.appendChild(b); }
    if (!sheet.querySelector('.mfx-tts')) { var vb = document.createElement('button'); vb.className = 'mfx-tts'; vb.type = 'button'; vb.textContent = tts() ? '🗣 Voice on' : '🗣 Voice off';
      vb.onclick = function () { var v = !tts(); try { localStorage.setItem(TK, v ? 'on' : 'off'); } catch (e) { } vb.textContent = v ? '🗣 Voice on' : '🗣 Voice off'; if (!v) { try { speechSynthesis.cancel(); } catch (e) { } } }; sheet.appendChild(vb); }
    buildRace(sheet, tm);
    var sel = sheet.querySelector('.ms-t.sel'), selSide = sel ? (/^(?:ms|ps)-([ef])/.exec(sel.id) || [])[1] : null;
    var fresh = [];
    for (var i = 0; i < tiles.length; i++) { var t = tiles[i], ix = idx(t), sd = (/^(?:ms|ps)-([ef])/.exec(t.id) || [])[1];
      t.classList.toggle('mfx-target', !!(selSide && sd && sd !== selSide));
      if (t.classList.contains('done') && !t.dataset.mfx && ix >= 0) { var p = PAL[ix % PAL.length]; t.style.setProperty('--pcb', p[0]); t.style.setProperty('--pc', p[1]); t.style.setProperty('--pci', p[2]); t.dataset.mfx = p[1]; fresh.push(t); } }
    var v = parseFloat(tm.textContent) || 0;
    tm.classList.toggle('mfx-warm', v >= 30 && v < 60); tm.classList.toggle('mfx-hot', v >= 60);
    var done = sheet.querySelectorAll('.ms-t.done').length / 2, bad = sheet.querySelectorAll('.ms-t.bad').length;
    if (fresh.length) {
      fresh.forEach(function (t) { spark(t, t.dataset.mfx); setTimeout(function () { t.classList.add('mfx-gone'); }, 560); });
      G.streak++; pop(G.streak - 1);
      var sk = sheet.querySelector('.mfx-streak'); if (G.streak >= 2) { setT(sk, '🔥 streak ×' + G.streak); sk.classList.remove('on'); void sk.offsetWidth; sk.classList.add('on'); }
      var W = { 3: 'Nice!', 4: 'Great!', 5: 'On fire!' }; if (W[G.streak] && done < G.total) word(W[G.streak], tm);
    }
    if (bad > G.prevBad) { dull(); G.streak = 0; var sk2 = sheet.querySelector('.mfx-streak'); if (sk2) { sk2.classList.remove('on'); setT(sk2, ''); } tm.classList.remove('mfx-flash'); void tm.offsetWidth; tm.classList.add('mfx-flash'); floatTxt('+3 s', tm); }
    G.prevBad = bad;
    updateRace(sheet, tm, G.total, done);
    return true;
  }
  function finish() {
    var sheet = document.querySelector('.ms-ov .ms-sheet'); if (!sheet) return;
    var big = sheet.querySelector('.ms-big'), h2 = sheet.querySelector('h2');
    if (!big || big.dataset.mfx || !/Match/.test((h2 || {}).textContent || '') || !/second/.test(big.textContent)) return;
    big.dataset.mfx = 1;
    var note = big.nextElementSibling, ntxt = (note && note.textContent) || '', nb = /New best/i.test(ntxt), t = parseFloat(big.textContent) || 0;
    var m = /(\d+) wrong pair/.exec(ntxt), wrong = m ? +m[1] : 0, stars = wrong === 0 ? 3 : wrong === 1 ? 2 : 1;
    var sr = document.createElement('div'); sr.className = 'mfx-stars';
    for (var i = 0; i < 3; i++) { var s = document.createElement('span'); s.textContent = '★'; if (i < stars) s.className = 'on'; s.style.animationDelay = (0.15 + i * 0.32) + 's'; sr.appendChild(s); }
    big.parentNode.insertBefore(sr, big);
    if (nb) { var bn = document.createElement('div'); bn.className = 'mfx-banner'; bn.textContent = '🏆 New best time!'; big.parentNode.insertBefore(bn, sr); }
    var prev = G && G.best;
    if (prev && !nb) { var dl = document.createElement('div'); dl.className = 'mfx-delta down'; dl.textContent = (t - prev).toFixed(1) + ' s off your best (' + prev.toFixed(1) + ' s)'; note.parentNode.insertBefore(dl, note); }
    else if (prev && nb) { var d2 = document.createElement('div'); d2.className = 'mfx-delta up'; d2.textContent = (prev - t).toFixed(1) + ' s faster than your previous best'; note.parentNode.insertBefore(d2, note); }
    var t0 = Date.now(); (function tick() { var f = Math.min(1, (Date.now() - t0) / 900), e = 1 - Math.pow(1 - f, 3); big.textContent = (t * e).toFixed(1) + ' seconds'; if (f < 1) requestAnimationFrame(tick); })();
    confetti(nb ? 110 : stars === 3 ? 70 : 35);
    for (var j = 0; j < stars; j++) (function (k) { setTimeout(function () { tone('sine', 520 * Math.pow(2, PENTA[k * 2] / 12), 900, 0.14, 0.07); }, 150 + k * 320); })(j);
    if (stars === 3 || nb) setTimeout(cheer, 1000);
    G = null;
  }
  function onMut() {
    var sheet = document.querySelector('.ms-ov .ms-sheet');
    if (!sheet) { G = null; return; }
    if (!refresh(sheet)) finish();
  }
  function start() { var mo = new MutationObserver(onMut); mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    document.addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('.ms-ov .ms-t')) ac(); }, true); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
