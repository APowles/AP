/* AP NEW VERSION: when a newer version of this page has been published, a slim gold strip at the very top (not floating) says so; one tap loads it. It checks 2.5 s after opening, when the tab returns to view, and every 90 s while visible. */
(function () {
  /* keyed on the page's root element, so a page that rewrites itself (F Block Spanish) restarts the check */
  if (window.__apNewVer === document.documentElement) return; window.__apNewVer = document.documentElement; try { clearInterval(window.__apNVT); } catch (e) { }
  if (!/^https?:$/.test(location.protocol)) return;
  var name = ''; try { name = decodeURIComponent(location.pathname.split('/').pop() || ''); } catch (e) { return; }
  if (!name) return;
  function show(latest) {
    if (document.getElementById('ap-newver')) return;
    var d = document.createElement('div'); d.id = 'ap-newver'; d.setAttribute('role', 'button'); d.tabIndex = 0;
    d.style.cssText = 'position:relative;background:#c9a84c;color:#1a2744;font:700 .95rem/1.3 "DM Sans",system-ui,-apple-system,sans-serif;text-align:center;padding:10px 14px;cursor:pointer;border-bottom:2px solid #1a2744';
    d.innerHTML = '<div>🔄 AP has updated this app. Tap here to get the latest version.</div><div style="font-weight:800;font-size:.85rem;margin-top:3px">DO NOT tap this while you are doing a test or timed task: you will lose your work. Finish it first, then tap.</div>';
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
  function start() { setTimeout(check, 2500); window.__apNVT = setInterval(function () { if (document.visibilityState === 'visible' && !document.getElementById('ap-newver')) check(); }, 90000); document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') setTimeout(check, 500); }); }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
