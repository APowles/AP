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
      }
    }
  }
  function start() {
    var mo = new MutationObserver(function () { mo.disconnect(); try { run(); } catch (e) { } mo.observe(document.body, { subtree: true, childList: true }); });
    mo.observe(document.body, { subtree: true, childList: true }); try { run(); } catch (e) { }
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
