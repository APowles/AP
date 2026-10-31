/* AP HEADER LANGUAGES: French / Italian / Spanish quick buttons in the navy header, next to Speed & pauses.
   They drive the app's own language choice (the Direction selects, or the app's own language buttons), so the
   Settings choice and the header always agree. They appear only where the app is showing a language choice. */
(function () {
  var W = window, D = document, NAMES = { fr: 'French', it: 'Italian', es: 'Spanish' }, FLAGS = { fr: '🇫🇷', it: '🇮🇹', es: '🇪🇸' };
  if (W.__apHdrLang) return; W.__apHdrLang = 1;
  var css = D.createElement('style'); css.id = 'aphl-css';
  css.textContent = '.aph-hlangs{display:inline-flex;gap:6px;align-items:center;margin:0 6px 0 auto;flex:none}'
    + '.aph-hlangs+.aph-pace{margin-left:0!important}'
    + '.aph-hlang{font:700 .9rem/1 var(--aph-body,inherit);background:transparent;color:#c9a84c;border:1.5px solid rgba(201,168,76,.7);border-radius:999px;padding:6px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}'
    + '.aph-hlang:hover{border-color:#c9a84c}.aph-hlang.on{background:#c9a84c;border-color:#c9a84c;color:#13203f}'
    + '@media print{.aph-hlangs{display:none!important}}';
  D.head.appendChild(css);
  function vis(e) { return e && e.offsetParent !== null; }
  function sels() {
    var p = [['intro-from', 'intro-to'], ['lang-from', 'lang-to']];
    for (var i = 0; i < p.length; i++) { var f = D.getElementById(p[i][0]), t = D.getElementById(p[i][1]); if (f && t && vis(t)) return { f: f, t: t }; }
    return null;
  }
  function codes(s) {
    var seen = {}, out = [];
    [s.t, s.f].forEach(function (x) { [].slice.call(x.options).forEach(function (o) { if (NAMES[o.value] && !seen[o.value]) { seen[o.value] = 1; out.push(o.value); } }); });
    return ['fr', 'it', 'es'].filter(function (c) { return seen[c]; });
  }
  function model() {
    var s = sels();
    if (s) {
      var L = codes(s); if (L.length < 2) return null;
      var cur = NAMES[s.t.value] ? s.t.value : (NAMES[s.f.value] ? s.f.value : null);
      return { L: L, cur: cur, go: function (c) {
        var ch;
        if (s.f.value === 'en') { s.t.value = c; ch = s.t; } else if (s.t.value === 'en') { s.f.value = c; ch = s.f; } else { s.t.value = c; ch = s.t; }
        ch.dispatchEvent(new Event('change', { bubbles: true }));
      } };
    }
    var hb = [].slice.call(D.querySelectorAll('[id^="hlang-"]')).filter(vis);
    if (hb.length >= 2) {
      var L2 = [], cur2 = null;
      hb.forEach(function (b) { var c = b.id.slice(6); if (NAMES[c]) { L2.push(c); if (/\bactive\b/.test(b.className)) cur2 = c; } });
      L2 = ['fr', 'it', 'es'].filter(function (c) { return L2.indexOf(c) >= 0; });
      if (L2.length >= 2) return { L: L2, cur: cur2, go: function (c) { var b = D.getElementById('hlang-' + c); if (b) b.click(); } };
    }
    return null;
  }
  var last = '', t;
  function sync() {
    var h = D.querySelector('.aph-header-in') || D.querySelector('.aph-header'); if (!h) return;
    if (h.querySelector('.gg-hdr-langs')) return;   // an app that already has its own header language pills
    var m = model(), box = h.querySelector('.aph-hlangs');
    if (!m) { if (box) box.remove(); last = ''; return; }
    var sig = m.L.join() + '|' + m.cur;
    if (box && sig === last) return;
    last = sig;
    if (!box) { box = D.createElement('div'); box.className = 'aph-hlangs'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Language'); }
    box.innerHTML = '';
    m.L.forEach(function (c) {
      var b = D.createElement('button'); b.type = 'button'; b.className = 'aph-hlang' + (m.cur === c ? ' on' : ''); b.setAttribute('data-l', c); b.setAttribute('aria-pressed', m.cur === c ? 'true' : 'false');
      b.innerHTML = '<span>' + FLAGS[c] + '</span><span>' + NAMES[c] + '</span>';
      b.onclick = function (e) { e.stopPropagation(); var mm = model(); if (mm) mm.go(c); setTimeout(sync, 0); setTimeout(sync, 150); };
      box.appendChild(b);
    });
    if (!box.parentNode) { var pace = h.querySelector('.aph-pace'), ref = pace || h.querySelector('.aph-voice') || h.querySelector('.aph-home'); h.insertBefore(box, ref || null); }
  }
  function later() { clearTimeout(t); t = setTimeout(sync, 40); }
  new MutationObserver(later).observe(D.body || D.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  D.addEventListener('change', later, true); D.addEventListener('click', later, true);
  sync();
})();
