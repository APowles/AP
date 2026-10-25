/* AP TILES7 add-on: the small "View & Print", "Practice Trials paper" and "Grammar recaps" buttons under the NEXT tiles
   become tiles of their own (with AP's glossy icons), so the grid stays uniform and nothing important hides in small print.
   Works on the rendered page: the apps' own buttons stay in the DOM (hidden) and are clicked by the tiles, so every
   existing behaviour (disabled states, which paper, which lists) is unchanged. Re-applies after every re-render. */
(function () {
  'use strict';
  if (window.__apTiles7) return; window.__apTiles7 = 1;
  var ICON = window.AP_TILE_ICONS || {};
  function vis(e) { return !!(e && e.getClientRects().length); }
  function txt(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function q(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function hide(e) { if (e && !e.classList.contains('t7-hide')) e.classList.add('t7-hide'); }
  function onclk(e) { return e ? (e.getAttribute('onclick') || '') : ''; }
  // a tile that forwards its tap to the app's own (hidden) button
  function tile(grid, cls, icon, title, desc, src, off) {
    var t = grid.querySelector('.ms-tile.' + cls);
    if (!t) {
      t = document.createElement('button'); t.type = 'button'; t.className = 'ms-tile ' + cls;
      t.innerHTML = '<img class="ms-img" alt="" src="' + icon + '"><span class="ms-tx"><span class="ms-tt"></span><span class="ms-td"></span></span>';
      t.addEventListener('click', function () { var b = t.__src; if (b && !t.disabled) b.click(); });
      grid.appendChild(t);
    }
    t.__src = src;
    var tt = t.querySelector('.ms-tt'), td = t.querySelector('.ms-td');
    if (tt.innerHTML !== title) tt.innerHTML = title;
    if (td.innerHTML !== desc) td.innerHTML = desc;
    var dis = !!off || !src || src.disabled;
    if (t.disabled !== dis) t.disabled = dis;
    return t;
  }
  function hideRowIfEmpty(row) {
    if (!row) return;
    var live = q('button, a', row).filter(function (b) { return !b.classList.contains('t7-hide'); });
    if (!live.length) hide(row);
  }
  function apply() {
    var grids = q('.ms-tiles').filter(vis);
    if (!grids.length) return;
    var grid = grids[grids.length - 1];
    var card = grid.parentNode;
    if (!card || grid.querySelector('.ms-tile.ms-read')) return;   // Approved Material has its own pair already
    var btns = q('button', card).filter(function (b) { return !b.classList.contains('ms-tile') && !b.closest('.ms-tiles'); });
    // 1. Practice Trials paper (first, so it sits next to View & Print as the last pair)
    var paper = btns.filter(function (b) { return /Practice Trials paper/i.test(txt(b)) && (/hmTrialsPaper|vtpOpen/.test(onclk(b))); });
    if (paper.length) {
      paper.forEach(hide);
      var big = paper.filter(function (b) { return b.classList.contains('hm-paperbtn'); });
      var src, desc, off = false;
      if (big.length) {                                  // vocab app, a Trials set is chosen: the one-tap paper for that set
        src = big[0];
        var s = big[0].querySelector('.hm-paperbtn-s');
        desc = esc(s ? txt(s).replace(/ · print it or do it with Apple Pencil$/, '') : '20 questions, exactly like the real paper.');
      } else if (/hmTrialsPaper/.test(onclk(paper[0]))) { // verbs apps: the paper that matches the set chosen in FIRST
        var e = paper.filter(function (b) { return /etrials/.test(onclk(b)); })[0], f = paper.filter(function (b) { return /ftrials/.test(onclk(b)); })[0];
        if (paper.length === 1) { src = paper[0]; desc = /E Block/.test(txt(src)) ? 'E Block · 20 questions, exactly like the real paper. New questions each time.' : 'F Block · 40 questions, exactly like the real paper. New questions each time.'; }
        else { src = f || paper[0]; desc = 'F Block · 40 questions, exactly like the real paper. For the 20-question E Block paper, choose the E Block Trials set in FIRST.'; }
      } else {                                           // vocab app, no Trials set chosen yet
        src = paper[0]; off = true;
        desc = 'Choose the ⭐ Michaelmas Trials or ⭐ Summer Trials lists in FIRST first.';
      }
      paper.forEach(function (b) { hideRowIfEmpty(b.closest('.vtp-row, .ms-viewrow, .hm-paperrow')); });
      tile(grid, 'ms-trials', ICON.trials, 'Practice Trials paper', desc, src, off);
    } else if (typeof window.hmTrialsPaper === 'function') {   // verbs apps on another set: the paper is set on the 100 Core Verbs
      tile(grid, 'ms-trials', ICON.trials, 'Practice Trials paper', 'The Trials papers are set on the 100 Core Verbs: choose that set in FIRST.', null, true);
    } else if (typeof window.vtpOpen === 'function') {
      tile(grid, 'ms-trials', ICON.trials, 'Practice Trials paper', 'Choose the ⭐ Michaelmas Trials or ⭐ Summer Trials lists in FIRST first.', null, true);
    }
    // 2. View & Print (the vocab app's pair "📖 View" + "🖨 Print / PDF" counts: View opens the sheet, which has Print / PDF on it)
    var vp = btns.filter(function (b) { return /View (&|and) Print/i.test(txt(b)) || (/apMsView\(0\)/.test(onclk(b))); });
    if (vp.length) {
      var v = vp[0];
      hide(v);
      btns.filter(function (b) { return /apMsView\(1\)/.test(onclk(b)); }).forEach(hide);
      var row = v.closest('.ms-viewrow');
      if (row) {
        hideRowIfEmpty(row);
        q('.aph-note', row).forEach(function (n) { if (row.classList.contains('t7-hide')) return; if (/read (and|or) print/i.test(txt(n))) n.textContent = 'More ways to be tested:'; });
      }
      var verbs = /showVerbList/.test(onclk(v));
      tile(grid, 'ms-viewprint', ICON.viewprint, 'View &amp; Print', verbs ? 'Read the verb list on screen, or print it or save it as a PDF.' : 'Read the whole list on screen, or print it or save it as a PDF.', v, false);
    }
    // 3. Grammar recaps (Gr EWs: the recap card under the tiles)
    var rc = btns.filter(function (b) { return /ggOpenRecaps\(\)/.test(onclk(b)) && b.classList.contains('gg-rcopen'); });
    if (rc.length) {
      rc.forEach(hide);
      btns.filter(function (b) { return /ggRecapPdf/.test(onclk(b)); }).forEach(hide);
      var wrap = rc[0].parentNode; if (wrap && q('button', wrap).every(function (b) { return b.classList.contains('t7-hide'); })) hide(wrap);
      tile(grid, 'ms-recap', ICON.grrecap, 'Grammar recaps', 'Read the Eton recaps of your chosen chapters, then print them or save them as a PDF.', rc[0], false);
    }
  }
  function run() { try { apply(); } catch (e) { } }
  run();
  var t = 0;
  try { new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) { var n = ms[i].target; if (n && n.closest && n.closest('.ms-tile.ms-trials, .ms-tile.ms-viewprint, .ms-tile.ms-recap')) continue; clearTimeout(t); t = setTimeout(run, 30); return; } }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'class', 'style'] }); } catch (e) { }
})();
