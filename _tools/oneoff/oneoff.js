/* AP ONE-OFF add-on: every "make a link / code" box must first ask: one-off (this lesson only) or keep permanently. Nothing is pre-selected and Make link stays greyed until he chooses. */
(function () {
  if (window.__apOneOff) return; window.__apOneOff = 1;
  var CAT = '⚡ One-off ▸ Live tests (codes clear after 7 days)';
  function today() { return new Date().toISOString().slice(0, 10); }
  function prep(box) {
    if (box.__ao) return; var m = /^(.*)-mk$/.exec(box.id || ''); if (!m) return;
    var P = m[1], q = function (s) { return document.getElementById(P + '-mk' + s); };
    var cat = q('-cat'), fol = q('-f'), code = q('-c'), go = q('-go'), out = q('-out'); if (!cat || !fol || !code || !go) return;
    if (cat.style.display === 'none') return;   // no teacher key: a plain link is made, nothing is filed
    box.__ao = 1;
    var first = box.querySelector('.aptt-mkbox > label'); if (!first) return;
    var orig = null, mode = '';
    var b = document.createElement('div'); b.className = 'ao-box'; b.setAttribute('role', 'radiogroup');
    b.innerHTML = '<div class="ao-h">FIRST: is this test for today only?</div>'
      + '<label class="ao-opt"><input type="radio" name="ao-' + P + '" value="one"><b>⚡ One-off: for this lesson only</b><small>You get the link and a code now. It is <u>not</u> added to your Test Library, and the code stops working after 7 days. (The link itself keeps working.)</small></label>'
      + '<label class="ao-opt"><input type="radio" name="ao-' + P + '" value="keep"><b>📚 Keep permanently in my AP Tests library</b><small>Filed under a heading and folder, as before.</small></label>'
      + '<div class="ao-need">👆 Choose one to continue</div>';
    first.parentNode.insertBefore(b, first);
    var hideRow = function (el, on) { if (!el) return; el.style.display = on ? 'none' : ''; var p = el.previousElementSibling; if (p && p.tagName === 'LABEL') p.style.display = on ? 'none' : ''; };
    var sets = Array.prototype.slice.call(box.querySelectorAll('input[name$="-mk-m"]'));
    function gate() { go.disabled = !mode; go.classList.toggle('ao-wait', !mode); go.title = mode ? '' : 'First choose: one-off or keep permanently'; }
    gate();
    new MutationObserver(function () { if (!mode && !go.disabled && go.style.display !== 'none' && !/Made/.test(go.textContent)) gate(); }).observe(go, { attributes: true, attributeFilter: ['disabled'] });
    go.addEventListener('click', function (e) { if (!mode) { e.stopImmediatePropagation(); e.preventDefault(); b.scrollIntoView({ block: 'center' }); } }, true);
    b.addEventListener('change', function (e) {
      if (!orig) orig = { cat: cat.value, code: code.value, typed: code.dataset.typed || '' };
      mode = e.target.value; b.classList.add('ok'); Array.prototype.forEach.call(b.querySelectorAll('.ao-opt'), function (l) { l.classList.toggle('on', l.querySelector('input').checked); });
      var one = mode === 'one';
      if (one) {
        if (![].some.call(cat.options, function (o) { return o.value === CAT; })) { var o = document.createElement('option'); o.textContent = CAT; o.value = CAT; cat.appendChild(o); }
        cat.value = CAT; fol.value = today();
        var one1 = sets.filter(function (r) { return r.value === '1'; })[0]; if (one1) one1.checked = true;
        sets.forEach(function (r) { if (r.value !== '1') { r.disabled = true; r.parentNode.style.display = 'none'; } });
        var L = (/^([A-Za-z]+)\d+$/.exec(String(orig.code).trim()) || [])[1];
        if (L && window.APTT && APTT.nextCodeFor) { var X = 'X' + L.slice(-1).toUpperCase(); code.dataset.typed = '1'; APTT.nextCodeFor(X, function (c) { if (mode === 'one') code.value = c; }); }
      } else {
        cat.value = orig.cat; if (fol.value === today()) fol.value = '';
        sets.forEach(function (r) { r.disabled = false; r.parentNode.style.display = ''; });
        if (orig.code) code.value = orig.code; code.dataset.typed = orig.typed;
        var L0 = (/^([A-Za-z]+)\d+$/.exec(String(orig.code).trim()) || [])[1]; if (L0 && window.APTT && APTT.nextCodeFor) APTT.nextCodeFor(L0.toUpperCase(), function (c) { if (mode === 'keep' && !code.dataset.typed) code.value = c; });
      }
      hideRow(cat, one); hideRow(fol, one);
      gate();
    });
    if (out) new MutationObserver(function () {
      var g0 = out.querySelector('.aptt-mkgh.ok');   // the code has been added to tests.txt: watch the live site until boys can really type it
      if (g0 && !g0.dataset.w && /^https?:/.test(location.href)) {
        g0.dataset.w = '1'; var cd = (code.value || '').replace(/\s+/g, '').toUpperCase(), lv = document.createElement('div');
        lv.className = 'ao-live'; lv.textContent = '⏳ Checking when ' + cd + ' goes live…'; g0.parentNode.insertBefore(lv, g0.nextSibling);
        var base = String(location.href).replace(/[#?].*$/, '').replace(/[^\/]*$/, ''), rx = new RegExp('^\\s*' + cd + '\\s*\\|', 'mi'), t0 = Date.now();
        (function poll() {
          if (!document.body.contains(lv)) return;
          fetch(base + 'tests.txt?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
            if (rx.test(t)) { lv.className = 'ao-live ok'; lv.textContent = '🟢 LIVE NOW: boys can type ' + cd + ' on the AP Tests page.'; return; }
            if (Date.now() - t0 > 600000) { lv.className = 'ao-live slow'; lv.textContent = '🟠 ' + cd + ' is not showing yet (over 10 minutes). Check GitHub, or use the link meanwhile.'; return; }
            lv.textContent = '⏳ Not live yet… checking again (' + Math.round((Date.now() - t0) / 1000) + 's)'; setTimeout(poll, 5000);
          }).catch(function () { setTimeout(poll, 8000); });
        })();
      }
      if (mode !== 'one') return;
      var ok = out.querySelector('.aptt-mkok'); if (ok && !/one-off/i.test(ok.textContent)) ok.innerHTML = '✅ Link made. <b>One-off:</b> copy it and use it now. It is not in your Test Library.';
      var gh = out.querySelector('.aptt-mkgh.ok'); if (gh && !/one-off/i.test(gh.textContent)) { var c = (code.value || '').toUpperCase(); gh.innerHTML = '✅ Code <b>' + c + '</b> added. Boys can type it on the AP Tests page in about a minute.<br><span style="font-weight:600">One-off: it is not in your Test Library and the code stops working after 7 days. Nothing else to do.</span>'; }
    }).observe(out, { childList: true, subtree: true });
  }
  function scan() { Array.prototype.forEach.call(document.querySelectorAll('.aptt-mkov'), prep); }
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
