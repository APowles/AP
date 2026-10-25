/* AP CREST add-on: tapping the crest opens the teacher's link / code maker for whatever is set up on screen
   (only with the teacher key on this device). Without the key it just says "Not available". The crest no longer opens any edit mode.
   Works on the rendered page; the apps' own code is untouched. */
(function () {
  'use strict';
  if (window.__apCrest) return; window.__apCrest = 1;
  function key() { try { return !!localStorage.getItem('apTeacherKey'); } catch (e) { return false; } }
  var msgT = 0;
  function say(img, t) {
    var w = img.parentNode;
    if (!w || !w.classList || !w.classList.contains('ap-crest-wrap')) { w = document.createElement('span'); w.className = 'ap-crest-wrap'; img.parentNode.insertBefore(w, img); w.appendChild(img); }
    var m = w.querySelector('.ap-crest-msg'); if (!m) { m = document.createElement('span'); m.className = 'ap-crest-msg'; w.appendChild(m); }
    m.textContent = t; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(function () { m.classList.remove('on'); }, 2600);
  }
  function tap(img) {
    if (!key()) { say(img, 'Not available'); return; }
    var b = document.getElementById('apdl-btn');                       // the drill-link maker, created by the apps' own code when a drill is set up
    if (b) { b.click(); return; }
    if (typeof window.toggleTeacherMode === 'function') { window.toggleTeacherMode(); return; }   // the Listening apps: teacher mode (mock papers)
    var spd = document.querySelector('.apss-link, [data-apss-link]'), lnk = null;
    var bs = document.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) { var t = (bs[i].textContent || '').trim(); if (bs[i].offsetHeight && /Make a link|Speed session link|make a test link/i.test(t)) { lnk = bs[i]; break; } }
    if (lnk) { lnk.click(); return; }
    say(img, 'Set something up first (a drill, test or Speed session), then tap the crest');
  }
  function bind() {
    var imgs = document.querySelectorAll('.aph-header .aph-avatar, .aph-header .header-photo');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i]; if (img.__apCrest) continue; img.__apCrest = 1;
      img.removeAttribute('onclick'); img.onclick = null; img.title = ''; img.style.cursor = 'pointer';
      img.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); tap(this); }, true);
    }
  }
  bind();
  try { new MutationObserver(function () { bind(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { }
})();
