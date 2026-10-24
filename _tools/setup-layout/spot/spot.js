/* AP SPOT add-on: one "Spot Test" card (Apple Pencil on the iPad / Print it) in place of the separate Paper and Submitted buttons;
   the plain Generate Test becomes a small "Quick plain test" link. Works on the rendered page; the original buttons stay (hidden) and do the work. */
(function () {
  var QUICK = 'No-limit test (up to the whole set)';
  function txt(b) { return (b.textContent || '').replace(/\s+/g, ' ').trim(); }

  /* Answers are never on show: the "Answer Sheet" of a generated test sits behind a Show answers button. */
  function hideAnswers() {
    var all = document.querySelectorAll('div,h3,h4,span,p'), heads = [];
    for (var i = 0; i < all.length; i++) if (all[i].children.length === 0 && /^(Answer Sheet|Teacher Sheet \(answer key\))$/i.test(txt(all[i])) && !all[i].closest('.spt-ans') && !all[i].closest('#opSpotAns')) heads.push(all[i]);
    heads.forEach(function (h) {
      var box = h.nextElementSibling; if (!box || !h.parentNode) return;
      var w = document.createElement('div'); w.className = 'spt-ans'; w.style.display = 'none';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'spt-showans aph-btn'; b.textContent = 'Show answers';
      b.onclick = function () { var on = w.style.display === 'none'; w.style.display = on ? '' : 'none'; b.textContent = on ? 'Hide answers' : 'Show answers'; };
      h.parentNode.insertBefore(b, h); h.parentNode.insertBefore(w, h); w.appendChild(h); w.appendChild(box);
    });
  }
  function run() {
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
      if (gen && !gen.classList.contains('spt-quick')) { gen.textContent = QUICK; gen.classList.add('spt-quick'); gen.title = 'Choose as many questions as you like, up to everything in the set'; gen.removeAttribute('style'); }
      if (P.classList.contains('hm-acts')) {   // the verb apps' small "Same choices" row: rename only
        if (pen) pen.textContent = '✍ Spot Test · Apple Pencil';
        if (pap) pap.textContent = '🖨 Spot Test · Print';
        continue;
      }
      var card = P.querySelector(':scope > .spt-card');
      var first = pen || pap; if (pap && pen && pap.compareDocumentPosition(pen) & 4) first = pap;
      if (!card) {
        card = document.createElement('div'); card.className = 'spt-card';
        card.innerHTML = '<div class="spt-h">\ud83d\udcdd Spot Test</div><div class="spt-s">15 short questions in boxes (or 10 or 5 if you prefer, and fewer if the set is small). You mark it yourself.</div><div class="spt-main"></div><div class="spt-pr"></div>';
        var main = card.querySelector('.spt-main'), pr = card.querySelector('.spt-pr');
        if (pen) { var a = document.createElement('button'); a.type = 'button'; a.className = 'spt-big'; a.innerHTML = '\u270d Do it with Apple Pencil <small>hand in as a PDF if required</small>'; a.onclick = (function (o) { return function () { o.click(); }; })(pen); main.appendChild(a); }
        if (pap) {
          var c = document.createElement('button'); c.type = 'button'; c.className = pen ? 'spt-link' : 'spt-big alt'; c.textContent = pen ? 'Print it' : '\ud83d\udda8 Print it';
          c.onclick = (function (o) { return function () { o.click(); }; })(pap);
          if (pen) { pr.appendChild(document.createTextNode('Prefer paper? ')); pr.appendChild(c); pr.appendChild(document.createTextNode(' to write on by hand.')); } else { main.appendChild(c); pr.style.display = 'none'; }
        }
        P.insertBefore(card, first);
        if (gen && gen.parentNode === P) P.insertBefore(gen, card.nextSibling);
      }
      // the Questions row only belongs to the plain No-limit test: move it below the Spot Test card, next to its link
      if (gen && card.parentNode === P && !P.querySelector(':scope > .spt-nl')) {
        var nl = document.createElement('div'); nl.className = 'spt-nl';
        var qs = P.ownerDocument.querySelectorAll('.aph-label,.l,div,span,label,small'), ql = null;
        for (var w = 0; w < qs.length; w++) { if (qs[w].children.length === 0 && /^Questions$/i.test(txt(qs[w])) && qs[w].nextElementSibling) { ql = qs[w]; break; } }
        if (ql) { var qc = ql.nextElementSibling; nl.appendChild(ql); nl.appendChild(qc); }
        nl.appendChild(gen); P.insertBefore(nl, card.nextSibling);
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
  function start() {
    var mo = new MutationObserver(function () { mo.disconnect(); try { run(); } catch (e) { } mo.observe(document.body, { subtree: true, childList: true }); });
    mo.observe(document.body, { subtree: true, childList: true }); try { run(); } catch (e) { }
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
