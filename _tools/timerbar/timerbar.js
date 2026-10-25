/* AP TIMER BAR: a  − ⏱ 12s +  stepper in the navy drill banner, so the time per card can be changed during the drill (it applies from the next card). */
(function () {
  if (window.__apTimerBar) return; window.__apTimerBar = 1;
  function cur(bar) {
    try {
      if (bar.closest && bar.closest('#ggApp') && typeof ggTimerSecs !== 'undefined' && typeof ggAdjustTimer === 'function') return { v: ggTimerSecs, adj: function (d) { ggAdjustTimer(5 * d); }, get: function () { return ggTimerSecs; } };
    } catch (e) { }
    try { if (typeof timerSecs !== 'undefined' && typeof adjustTimer === 'function') return { v: timerSecs, adj: function (d) { adjustTimer(2 * d); }, get: function () { return timerSecs; } }; } catch (e) { }
    try { if (typeof timerSeconds !== 'undefined' && typeof adjustTimer === 'function') return { v: timerSeconds, adj: function (d) { adjustTimer(d); }, get: function () { return timerSeconds; } }; } catch (e) { }
    return null;
  }
  function refresh() { [].forEach.call(document.querySelectorAll('.ap-tbar'), function (g) { var c = cur(g); var v = g.querySelector('.ap-tv'); if (c && v) v.textContent = '⏱ ' + c.get() + 's'; }); }
  function add() {
    [].forEach.call(document.querySelectorAll('.aph-dbar'), function (bar) {
      if (bar.querySelector('.ap-tbar') || !bar.querySelector('.aph-dbar-score')) return;
      var c = cur(bar); if (!c) return;
      var g = document.createElement('span'); g.className = 'ap-tbar'; g.title = 'Time per card (applies from the next card)';
      g.innerHTML = '<button type="button" class="aph-dbar-btn ap-tm" aria-label="Less time">−</button><span class="ap-tv">⏱ ' + c.get() + 's</span><button type="button" class="aph-dbar-btn ap-tp" aria-label="More time">+</button>';
      g.querySelector('.ap-tm').onclick = function () { c.adj(-1); refresh(); };
      g.querySelector('.ap-tp').onclick = function () { c.adj(1); refresh(); };
      var t = bar.querySelector('.ap-vspeed') || bar.querySelector('.aph-dbar-title');
      if (t && t.nextSibling) bar.insertBefore(g, t.nextSibling); else bar.appendChild(g);
    });
  }
  var st = document.createElement('style'); st.textContent = '.ap-tbar{display:inline-flex;align-items:center;gap:4px;color:#dfe5f3;font:600 .9375rem/1 inherit}.ap-tbar .aph-dbar-btn{padding:6px 10px}.ap-tv{min-width:52px;text-align:center}'; document.head.appendChild(st);
  var q = 0; function sched() { if (q) return; q = setTimeout(function () { q = 0; add(); }, 80); }
  function go() { add(); try { new MutationObserver(sched).observe(document.body, { childList: true, subtree: true }); } catch (e) { } }
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})();
