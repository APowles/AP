/* AP STEPS add-on: the two big steps read FIRST and NEXT; the essential questions inside FIRST are numbered 1, 2, 3...
   and a "still to choose" message stands out. Works on the rendered page, so it needs no change to each app's own code. */
(function () {
  var QRE = /^(Which |Kind of question)/i;
  function run() {
    var steps = document.querySelectorAll('.ms-step');
    for (var i = 0; i < steps.length; i++) {
      var st = steps[i], num = st.querySelector('.ms-num'); if (!num) continue;
      var t = (st.textContent || '').replace(num.textContent, '').trim();
      var want = /^What do you want to practise/i.test(t) ? 'FIRST' : /^How do you want to practise/i.test(t) ? 'NEXT' : null;
      if (want) {
        if (num.textContent !== want) num.textContent = want;
        if (!num.classList.contains('ms-big')) num.classList.add('ms-big');
      }
      if (want === 'FIRST') {
        var labels = [], now = null, n = st.nextElementSibling;
        while (n && !n.classList.contains('ms-step')) {
          if (n.classList.contains('aph-label') && QRE.test((n.textContent || '').replace(/^\d+\s*/, ''))) labels.push(n);
          if (n.classList.contains('ms-now')) now = n;
          n = n.nextElementSibling;
        }
        if (labels.length > 1) labels.forEach(function (l, k) {
          var q = l.querySelector('.ms-q');
          if (!q) { q = document.createElement('span'); q.className = 'ms-q'; l.insertBefore(q, l.firstChild); }
          if (q.textContent !== String(k + 1)) q.textContent = String(k + 1);
          if (!l.classList.contains('ms-qh')) l.classList.add('ms-qh');
        });
        if (now) { var need = /^(Choose|Now choose|Nothing|No cards|Tick|Pick)/i.test((now.textContent || '').trim()); if (need !== now.classList.contains('ms-need')) now.classList.toggle('ms-need', need); }
        if (window.AP_STEP_GATE && labels.length > 1) gate(labels, st);
      }
    }
  }
  /* Step-by-step (only on busy set-up screens that opt in with window.AP_STEP_GATE = true): the numbered questions inside FIRST
     unlock one at a time. A question is answered when one of its choices is on (a ticked button or box); every later question is
     greyed out until then, with a short line saying what to do first. Nothing is hidden, so the boy still sees what is coming. */
  function answered(block) {
    for (var i = 0; i < block.length; i++) {
      var el = block[i];
      if (el.querySelector('.on, [aria-pressed="true"], input:checked')) return true;
      if (el.classList && el.classList.contains('on')) return true;
    }
    return false;
  }
  function labelName(l) {
    var t = '';
    for (var c = l.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3) t += c.textContent; else if (c.nodeType === 1 && !/ms-q\b|ms-qhint|vb-light|vb-count/.test(c.className || '')) t += c.textContent; }
    return t.replace(/^\d+\s*/, '').trim();
  }
  function gate(labels, st) {
    var blocks = [], names = [];
    for (var k = 0; k < labels.length; k++) {
      var b = [], n = labels[k].nextElementSibling, stop = labels[k + 1] || null;
      while (n && n !== stop && !n.classList.contains('ms-step') && !(n.classList.contains('ms-now')) && !/^Or practise your own/i.test((n.textContent || '').trim())) { b.push(n); n = n.nextElementSibling; }
      blocks.push(b); names.push(labelName(labels[k]));
    }
    var done = true;
    for (var k = 0; k < labels.length; k++) {
      var lock = !done, l = labels[k];
      l.classList.toggle('ms-qlock', lock);
      blocks[k].forEach(function (el) { el.classList.toggle('ms-qlock', lock); });
      var hint = l.querySelector('.ms-qhint');
      if (lock) { if (!hint) { hint = document.createElement('span'); hint.className = 'ms-qhint'; l.appendChild(hint); } var t = (k ? 'Answer ' + k + ' (' + names[k - 1].toLowerCase() + ') first' : ''); if (hint.textContent !== t) hint.textContent = t; }
      else if (hint) hint.remove();
      if (done && !answered(blocks[k])) done = false;
    }
  }
  function start() {
    var mo = new MutationObserver(function () { mo.disconnect(); try { run(); } catch (e) { } mo.observe(document.body, { subtree: true, childList: true }); });
    mo.observe(document.body, { subtree: true, childList: true }); try { run(); } catch (e) { }
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
