/* AP SPOT add-on: one "Spot Test" card (Apple Pencil on the iPad / Print it) in place of the separate Paper and Submitted buttons;
   the plain Generate Test becomes a small "Quick plain test" link. Works on the rendered page; the original buttons stay (hidden) and do the work. */
(function () {
  var QUICK = 'No-limit test (up to the whole set)';
  function txt(b) { return (b.textContent || '').replace(/\s+/g, ' ').trim(); }

  /* Answers are never on show: the "Answer Sheet" of a generated test sits behind a Show answers button. */
  function hideAnswers() {
    var all = document.querySelectorAll('div,h3,h4,span,p'), heads = [];
    for (var i = 0; i < all.length; i++) if (all[i].children.length === 0 && /^(Answer Sheet|Answer key|Teacher Sheet \(answer key\))$/i.test(txt(all[i])) && !all[i].closest('.spt-ans') && !all[i].closest('#opSpotAns')) heads.push(all[i]);
    heads.forEach(function (h) {
      var box = h.nextElementSibling; if (!box || !h.parentNode) return;
      var w = document.createElement('div'); w.className = 'spt-ans'; w.style.display = 'none';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'spt-showans aph-btn'; b.textContent = 'Show answers';
      b.onclick = function () { var on = w.style.display === 'none'; w.style.display = on ? '' : 'none'; b.textContent = on ? 'Hide answers' : 'Show answers'; };
      h.parentNode.insertBefore(b, h); h.parentNode.insertBefore(w, h); w.appendChild(h); w.appendChild(box);
    });
  }

  /* Back (the header button) closes an open test / print panel first: exactly one stage back, not Home. */
  function closePanel() {
    var ps = document.querySelectorAll('.aph-panel-top');
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i]; if (p.offsetParent === null || getComputedStyle(p).display === 'none') continue;
      var bs = p.querySelectorAll('button');
      for (var k = 0; k < bs.length; k++) if (/(\u2715|Close|Back)/.test(txt(bs[k])) && !bs[k].closest('.spt-card')) { bs[k].click(); return true; }
    }
    return false;
  }
  if (!window.__sptBack) { window.__sptBack = 1; var prevBack = window.aphBackHook; window.aphBackHook = function () { try { if (closePanel()) return true; } catch (e) { } return typeof prevBack === 'function' ? prevBack.apply(this, arguments) : false; }; }

  /* While a test / print panel is open it stands alone: the set-up screen below it is hidden, so the only way on is the panel's own Back / Close. */
  function focusPanel() {
    var open = null, ps = document.querySelectorAll('.aph-panel-top');
    for (var i = 0; i < ps.length; i++) if (ps[i].offsetParent !== null && getComputedStyle(ps[i]).display !== 'none') { open = ps[i]; break; }
    var all = document.querySelectorAll('[data-spt-hid]');
    if (!open) { for (var k = 0; k < all.length; k++) { all[k].style.display = all[k].getAttribute('data-spt-hid'); all[k].removeAttribute('data-spt-hid'); } return; }
    for (var e = open; e && e !== document.body; e = e.parentElement) {
      for (var n = e.nextElementSibling; n; n = n.nextElementSibling) {
        if (/^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(n.tagName) || n.hasAttribute('data-spt-hid') || getComputedStyle(n).display === 'none' || getComputedStyle(n).position === 'fixed') continue;
        n.setAttribute('data-spt-hid', n.style.display || ''); n.style.display = 'none';
      }
    }
  }
  function run() {
    focusPanel();
    hideAnswers();
    var bs = document.querySelectorAll('button'), seen = [];
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i], P = b.parentNode;
      if (!P || seen.indexOf(P) >= 0 || P.closest('.spt-card')) continue;
      if (!/^\S{0,4}\s*(Submitted|Paper) Spot Test(\s*\(.*\))?$/.test(txt(b))) continue;
      seen.push(P);
      var kids = P.querySelectorAll(':scope > button, :scope > .aph-btn'), pen = null, pap = null, gen = null;
      for (var k = 0; k < kids.length; k++) {
        var t = txt(kids[k]);
        if (/^\S{0,4}\s*Submitted Spot Test$/.test(t)) pen = kids[k]; else if (/^\S{0,4}\s*Paper Spot Test(\s*\(.*\))?$/.test(t)) pap = kids[k]; else if (/^\S{0,4}\s*Generate Test/.test(t) || /Generate Test/.test(t) && t.length < 40) gen = kids[k];
      }
      if (!pen && !pap) continue;
      if (gen && !gen.classList.contains('spt-make')) { gen.textContent = 'Make the test'; gen.classList.add('spt-make'); gen.removeAttribute('style'); gen.addEventListener('click', function () { reveal(gen); }); }
      if (P.classList.contains('hm-acts')) {   // the verb apps' small "Same choices" row: rename only
        if (pen) pen.textContent = '✍ Spot Test · Apple Pencil';
        if (pap) pap.textContent = '🖨 Spot Test · Print';
        continue;
      }
      var card = P.querySelector(':scope > .spt-card');
      var first = pen || pap; if (pap && pen && pap.compareDocumentPosition(pen) & 4) first = pap;
      if (!card) {
        card = document.createElement('div'); card.className = 'spt-card';
        card.innerHTML = '<div class="spt-h">\ud83d\udcdd Spot Test</div><div class="spt-s">15 short questions in boxes (or 10 or 5 if you prefer). You may get fewer if the set is small, or if the answers are long: a timed test never runs past 4\u00bd minutes. You mark it yourself.</div><div class="spt-main"></div><div class="spt-pr"></div>';
        var main = card.querySelector('.spt-main'), pr = card.querySelector('.spt-pr');
        if (pen) { var a = document.createElement('button'); a.type = 'button'; a.className = 'spt-big'; a.innerHTML = '\u270d Do it with Apple Pencil <small>hand in as a PDF if required</small>'; a.onclick = (function (o) { return function () { o.click(); }; })(pen); main.appendChild(a); }
        if (pap) {
          var c = document.createElement('button'); c.type = 'button'; c.className = pen ? 'spt-link' : 'spt-big alt'; c.textContent = pen ? 'Print it' : '\ud83d\udda8 Print it';
          c.onclick = (function (o, cc) { return function () { o.click(); reveal(cc); }; })(pap, c);
          if (pen) { pr.appendChild(document.createTextNode('Prefer paper? ')); pr.appendChild(c); pr.appendChild(document.createTextNode(' to write on by hand.')); } else { main.appendChild(c); pr.style.display = 'none'; }
        }
        P.insertBefore(card, first);
        if (gen && gen.parentNode === P) P.insertBefore(gen, card.nextSibling);
      }
      // the plain No-limit test lives inside the card as a discreet link; its Questions row and button open only when asked for
      if (gen && !card.querySelector('.spt-nl')) {
        var nl = document.createElement('div'); nl.className = 'spt-nl';
        var tg = document.createElement('button'); tg.type = 'button'; tg.className = 'spt-quick'; tg.textContent = QUICK + ' \u25b8'; tg.title = 'Choose as many questions as you like, up to everything in the set';
        var box = document.createElement('div'); box.className = 'spt-nlbox'; box.style.display = 'none';
        var qs = P.ownerDocument.querySelectorAll('.aph-label,.l,div,span,label,small'), ql = null;
        for (var w = 0; w < qs.length; w++) { if (qs[w].children.length === 0 && /^Questions$/i.test(txt(qs[w])) && qs[w].nextElementSibling) { ql = qs[w]; break; } }
        if (ql) { var qc = ql.nextElementSibling; box.appendChild(ql); box.appendChild(qc); }
        box.appendChild(gen);
        if (!ql) { tg.textContent = QUICK; tg.onclick = function () { gen.click(); reveal(tg); }; }   // no question chips here: its own options panel opens directly, no extra button
        else tg.onclick = function () { var on = box.style.display === 'none'; box.style.display = on ? '' : 'none'; tg.textContent = QUICK + (on ? ' \u25be' : ' \u25b8'); };
        nl.appendChild(tg); nl.appendChild(box); card.appendChild(nl);
      }
      var pills = card.querySelectorAll('.spt-big,.spt-link'), orig = [pen, pap].filter(Boolean);
      for (var q = 0; q < pills.length; q++) pills[q].disabled = !!(orig[q] && orig[q].disabled);
      if (pen) pen.classList.add('spt-hide'); if (pap) pap.classList.add('spt-hide');
      var ls = document.querySelectorAll('.aph-label,.l,div,span,label,small');
      for (var L = 0; L < ls.length; L++) {
        if (ls[L].children.length || !/Items per box/i.test(txt(ls[L]))) continue;
        var sib = ls[L].nextElementSibling, cs = sib ? sib.querySelectorAll('button') : [];
        for (var z = 0; z < cs.length; z++) { var m = /^([123])$/.exec(txt(cs[z])); if (m) cs[z].textContent = m[1] + ' \u00b7 ' + (5 * m[1]) + ' items'; }
      }
      var hs = document.querySelectorAll('h1,h2,h3,h4,.aph-h,span,div,b'); for (var h = 0; h < hs.length; h++) { if (hs[h].children.length === 0 && /^\W{0,4}\s*Generate Test$/.test(txt(hs[h]))) hs[h].textContent = '\ud83d\udcdd Test'; }
    }
  }
  function reveal(from) { setTimeout(function () { try { var c = document.querySelectorAll('[id*="Output"],[id$="TestOut"],[id$="Out"]'); for (var i = 0; i < c.length; i++) if (c[i].innerHTML.trim() && c[i].offsetHeight && !c[i].closest('.spt-card')) { c[i].scrollIntoView({ behavior: 'smooth', block: 'start' }); return; } } catch (e) {} }, 250); }
  function start() {
    var mo, timer = 0, opts = { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class'] };
    function go() { timer = 0; mo.disconnect(); try { run(); } catch (e) { } mo.observe(document.body, opts); }
    mo = new MutationObserver(function () { if (!timer) timer = setTimeout(go, 60); });
    mo.observe(document.body, opts); try { run(); } catch (e) { }
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
