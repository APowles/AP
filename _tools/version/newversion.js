/* AP NEW VERSION: when a newer version of this page has been published, a slim gold strip at the very top (not floating) says so; one tap loads it. */
(function () {
  if (window.__apNewVer) return; window.__apNewVer = 1;
  if (!/^https?:$/.test(location.protocol)) return;
  var name = ''; try { name = decodeURIComponent(location.pathname.split('/').pop() || ''); } catch (e) { return; }
  if (!name) return;
  function show(latest) {
    if (document.getElementById('ap-newver')) return;
    var d = document.createElement('div'); d.id = 'ap-newver'; d.setAttribute('role', 'button'); d.tabIndex = 0;
    d.style.cssText = 'position:relative;background:#c9a84c;color:#1a2744;font:700 .95rem/1.3 "DM Sans",system-ui,-apple-system,sans-serif;text-align:center;padding:10px 14px;cursor:pointer;border-bottom:2px solid #1a2744';
    d.textContent = '🔄 A newer version of this page is available. Tap here to update.';
    function go() {
      d.textContent = 'Updating…';
      var done = false, fin = function () { if (!done) { done = true; location.reload(); } };
      try { fetch(location.href, { cache: 'reload' }).then(fin, fin); } catch (e) { fin(); }
      setTimeout(fin, 8000);
    }
    d.onclick = go; d.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') go(); };
    document.body.insertBefore(d, document.body.firstChild);
  }
  function check() {
    var base = location.pathname.replace(/[^\/]*$/, '');
    fetch(base + 'version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !window.__apBuild || !j[name]) return;
      if (j[name] !== window.__apBuild) show(j[name]);
    }).catch(function () { });
  }
  function start() { setTimeout(check, 2500); document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') setTimeout(check, 500); }); }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
