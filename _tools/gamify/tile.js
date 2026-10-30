/* Gamify it tile: put it first among the practice tiles of any app that has them, whatever draws them. */
(function () {
  if (window.__apBzTile) return; window.__apBzTile = 1;
  var t = 0, mo = null;
  function ensure() {
    t = 0; if (mo) mo.disconnect();
    try {
      var cfg = window.APBZ_HOSTCFG || {}, n = (cfg.games || []).length || 9;
      [].forEach.call(document.querySelectorAll('.ms-tiles'), function (box) {
        if (box.querySelector('.ms-blitz') || !box.querySelector('.ms-tile')) return;
        var dr = box.querySelector('.ms-tile.ms-drill') || box.querySelector('.ms-tile'), b = document.createElement('button');
        b.className = 'ms-tile ms-blitz'; b.onclick = function () { window.apBlitz(); }; if (dr && dr.disabled) b.disabled = true;
        b.innerHTML = '<img class="ms-img" alt="" src="' + (window.BZ ? BZ.blitz : '') + '"><span class="ms-tx"><span class="ms-tt">Gamify it</span><span class="ms-td">Games: ' + n + ' different ways to play with the ' + (cfg.noun || 'words') + '.</span></span>';
        box.insertBefore(b, box.firstChild);
      });
    } catch (e) { }
    start();
  }
  function start() { if (mo && document.body) { try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { } } }
  function kick() { if (!t) t = setTimeout(ensure, 40); }
  try { mo = new MutationObserver(kick); } catch (e) { return; }
  if (document.body) { start(); kick(); } else document.addEventListener('DOMContentLoaded', function () { start(); kick(); });
})();
