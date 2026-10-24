(function () {
  'use strict';
  /* ===== F Spanish Vocab: two-step set-up (1 What / 2 How), Settings bar, picture tiles, personalised set, Spell, Match ===== */
  var KEY = 'apfsv_myset_v1', BEST = 'apfsv_match_best', HASH = '#fvset=', MY = 'myset';
  var S = { c: {}, due: {}, f: 'all' }, note = '', setOpen = false;
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function $(i) { return document.getElementById(i); }
  function kOf(p) { return p.sec + '~' + p.n; }
  function dueNow(k) { var d = S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function ids() { return Object.keys(S.c); }
  function dueCount() { return ids().filter(dueNow).length; }
  function inSet() { return ALL_PHRASES.filter(function (p) { return S.c[kOf(p)]; }); }

  // ---- what has been chosen under step 1 (nothing at first)
  var msPicked = false, msMy = false;
  function customOn() { return typeof selectedSections !== 'undefined' && selectedSections.size > 0; }
  function isMy() { return msMy && !customOn(); }
  function chosen() { return isMy() || customOn() || msPicked; }
  function myPool() {
    return inSet().filter(function (p) { var k = kOf(p), l = S.c[k].l || 2; return S.f === 'all' ? true : S.f === 'due' ? dueNow(k) : S.f === '3' ? l === 3 : l >= 2; });
  }
  // everything in the app that asks for "the selection" now gets: nothing (not chosen yet), the personalised set, or the normal selection
  var sel0 = _cogGetSel0;
  _cogGetSel0 = function () { return isMy() ? myPool() : chosen() ? sel0() : []; };
  var gsp0 = getSelectedPhrases;
  getSelectedPhrases = function () { return isMy() ? myPool() : chosen() ? gsp0() : []; };
  var lab0 = _cogSelLab0;
  _cogSelLab0 = function (fb) { return isMy() ? 'My personalised set' : lab0(fb); };
  var gsl0 = getSelectionLabel;
  getSelectionLabel = function (fb) { return isMy() ? 'My personalised set' : gsl0(fb); };
  if (window.__spv) window.__spv.current = function () { var s = []; if (isMy() || !chosen()) return s; sel0().forEach(function (p) { if (s.indexOf(p.sec) < 0) s.push(p.sec); }); return s; };

  // picking a unit or section in the normal picker takes over from the personalised set
  var ouc = onUnitChange;
  onUnitChange = function () { msPicked = true; msMy = false; return ouc.apply(this, arguments); };
  var ouc2 = introUnitChange;
  introUnitChange = function () { var s = $('intro-sel-unit'); if (!s || !s.value) return; return ouc2.apply(this, arguments); };
  var isc = introSectionChange;
  introSectionChange = function () { msPicked = true; msMy = false; return isc.apply(this, arguments); };

  var stp0 = showSVTestPanel;
  showSVTestPanel = function () {
    var r = stp0.apply(this, arguments);
    try {
      if (isMy()) { var st = $('svTestContextStrip'); if (st) { var f = getLangFrom(), tt = getLangTo(); st.innerHTML = '<div style="font-size:0.75rem;font-weight:700;color:#8899bb;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px;">Testing</div><div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;"><span>' + (mixOn() ? mixLabel() : LANG_NAMES[f] + ' &rarr; ' + LANG_NAMES[tt]) + '</span><span style="color:#1a2744;font-weight:600;">★ My personalised set</span></div><div style="font-size:0.75rem;color:#8899bb;margin-top:5px;">To test a different set, close this and choose it under What to practise.</div>'; } }
    } catch (e) { }
    return r;
  };

  // ---- marking in any drill feeds the personalised set
  function record(p, res) {
    if (!p || p.n == null || p.sec == null) return;
    var k = kOf(p);
    if (res === 'bad') { S.c[k] = { l: 3 }; S.due[k] = { b: 0, d: today() + 1 }; }
    else if (res === 'ok' && S.c[k] && dueNow(k)) { var b = (S.due[k].b || 0) + 1; S.due[k] = b >= 3 ? { b: 3, d: null } : { b: b, d: today() + [1, 3, 7][b] }; }
    else return;
    save();
  }
  var m0 = mark;
  mark = function (r) {
    try { var p = deck[idx]; if (p) record(p, r === 'err' ? 'bad' : r === 'got' ? 'ok' : ''); } catch (e) { }
    return m0.apply(this, arguments);
  };

  var ICONS = {};
  var TILES = [
    ['ms-drill', 'drill', 'Drill', 'Cards one at a time. You mark yourself ✗ ~ ✓.', 'startDrill(_selectedCount)'],
    ['ms-speed', 'speed', 'Speed Challenge', 'Race the clock, solo or in teams.', 'openSpanishChallenge()'],
    ['ms-spell', 'spell_es', 'Spell', 'Hear the word and write it. Accents count.', 'apSpell()'],
    ['ms-match', 'match_es', 'Match', 'Pair six English and Spanish words against the clock.', 'apMatch()'],
    ['ms-leis', 'leis', 'Leisure Mode', 'Just press play and let it all wash over you.', 'startLeisureMode()'],
    ['ms-test', 'test', 'Test', 'A test to print or do on screen. Answers stay hidden.', 'showSVTestPanel()']
  ];

  function myBox(n, dc, on) {
    var fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']];
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (n || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apMySetUse()" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note" style="min-width:auto">' + n + ' word' + (n === 1 ? '' : 's') + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apMySetHelp()">? How does this work?</button></div>'
      + (n || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apMySetEdit()">✎ Edit</button><button class="ms-b sm" onclick="apMySetLink()">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (S.f === x[0] ? ' on' : '') + '" onclick="apMySetFilter(\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (note || !n ? '<div class="ms-note">' + (note ? '<b>' + note + '</b> ' : '') + (!n ? 'Empty so far. Words you mark ✗ Major error in any drill join it automatically.' : '') + '</div>' : '') + '</div>';
  }

  function sumText() {
    var f = getLangFrom(), t = getLangTo();
    return (_selectedCount === -1 ? 'All cards' : _selectedCount + ' cards') + ' · ' + timerSecs + 's a card · ' + LANG_NAMES[f] + ' → ' + LANG_NAMES[t] + (mixOn() ? ' · mixed ' + mixName() : '') + (isAutotime ? ' · Autotime on' : '');
  }
  function sumRefresh() { var s = document.querySelector('.ms-opts > summary small'); if (s) s.textContent = sumText(); }
  var tg0 = toggleAutotime; toggleAutotime = function () { var r = tg0.apply(this, arguments); sumRefresh(); return r; };
  var at0 = adjustTimer; adjustTimer = function () { var r = at0.apply(this, arguments); sumRefresh(); return r; };

  function labelNow() {
    if (isMy()) return 'my personalised set';
    if (customOn()) return getSelectionLabel('Custom selection');
    var u = $('sel-unit'), s = $('sel-section'), ut = u && u.selectedIndex >= 0 ? u.options[u.selectedIndex].text : '', st = s && s.selectedIndex >= 0 ? s.options[s.selectedIndex].text : '';
    return ut + (s && s.value && s.value !== 'ALL' && !/^ALL_/.test(s.value) ? ' · ' + st : '');
  }

  var ri = renderIntro;
  renderIntro = function () {
    ri.apply(this, arguments);
    var app = $('app'); if (!app) return;
    var card = app.querySelector('.intro-card'); if (!card || card.getAttribute('data-ms')) return; card.setAttribute('data-ms', '1');
    if (customOn()) msMy = false;
    var my = isMy(), ch = chosen(), n = ids().length, dc = dueCount();
    var pool = ch ? getSelectedPhrases().length : 0, usable = ch && pool > 0;
    var B = { head: [], what: [], dir: [], cards: [], timer: [], stack: null, keys: null }, cur = 'head';
    [].slice.call(card.children).forEach(function (e) {
      var t = e.classList.contains('aph-label') ? e.textContent.trim() : '';
      if (e.tagName === 'H2') { B.head.push(e); return; }
      if (e.classList.contains('aph-banner')) return;
      if (e.classList.contains('aph-stack')) { B.stack = e; cur = 'x'; return; }
      if (e.classList.contains('aph-keys')) { B.keys = e; cur = 'x'; return; }
      if (/^(Direction|Mix both ways)/i.test(t)) cur = 'dir'; else if (e.classList.contains('sv-what-head')) cur = 'what'; else if (/^Cards per session/i.test(t)) cur = 'cards'; else if (/^Timer per card/i.test(t)) cur = 'timer';
      if (B[cur]) B[cur].push(e);
    });
    if (!B.stack || !B.what.length) return;
    // selects: a "Choose" line first, nothing preselected
    var iu = $('intro-sel-unit'), is_ = $('intro-sel-section');
    if (iu) { iu.insertAdjacentHTML('afterbegin', '<option value="" disabled>Choose a unit…</option>'); if (!ch || my) iu.value = ''; if (my) iu.style.opacity = '.55'; }
    if (is_ && (!ch || my)) { is_.style.display = 'none'; }
    if (iu && customOn()) { var rw = iu.closest('.aph-row'); if (rw) rw.style.display = 'none'; if (is_) is_.style.display = 'none'; }
    var cnt = card.querySelector('.aph-row .aph-note'); if (cnt) { if (!ch || my) cnt.style.display = 'none'; else cnt.textContent = pool + ' words'; }
    B.what.forEach(function (e) { if (e.classList.contains('cog-row')) e.style.margin = '0 0 14px'; });
    var lw = B.what.filter(function (e) { return e.classList.contains('sv-what-head'); })[0];
    if (lw) { var sp = lw.querySelector('.aph-label'); if (sp) sp.textContent = 'Unit and section'; var bt = lw.querySelector('button'); if (bt) bt.innerHTML = '&#128218; Choose several topics'; lw.style.marginTop = '4px'; }

    var setDet = document.createElement('details'); setDet.className = 'ms-opts'; setDet.open = setOpen; setDet.addEventListener('toggle', function () { setOpen = setDet.open; });
    setDet.innerHTML = '<summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small>' + sumText() + '</small><span class="ms-chg"></span></summary>';
    B.cards.concat(B.timer).forEach(function (e) { setDet.appendChild(e); });
    var auto = B.stack.querySelector('#autotimeBtn'); if (auto) { var ar = document.createElement('div'); ar.className = 'aph-row'; ar.style.marginTop = '10px'; ar.appendChild(auto); var an = document.createElement('div'); an.className = 'aph-note'; an.style.margin = '0 0 4px'; an.textContent = 'Autotime: Leisure Mode moves on by itself, with no timer bar.'; setDet.appendChild(ar); setDet.appendChild(an); }
    B.dir.forEach(function (e) { setDet.appendChild(e); });
    setDet.insertAdjacentHTML('beforeend', '<div class="aph-note" style="margin:6px 0 4px;line-height:1.45"><b>Direction</b> is which language you see and which you answer in. <b>Mix both ways</b>: Off = every card goes the way round chosen above. 50–50 = half the cards go English → Spanish and half the other way, each card showing its own direction. 70–30 = seven in ten English → Spanish, three in ten the other way.</div>');
    var view = B.stack.querySelector('[onclick^="openStudyView"]');
    var extra = [].slice.call(B.stack.children).filter(function (e) { return e.classList.contains('aph-tools') && !e.querySelector('#autotimeBtn'); });
    var tilesHtml = TILES.map(function (x) {
      var off = !usable || (my && x[1] === 'speed');
      var d = x[3]; if (my && x[1] === 'speed') d = 'Works on whole sections, so not on a personalised set.';
      return '<button class="ms-tile ' + x[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + x[4] + '"><img class="ms-img" alt="" src="' + ICONS[x[1]] + '"><span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + d + '</span></span></button>';
    }).join('');
    while (card.firstChild) card.removeChild(card.firstChild);
    B.head.forEach(function (e) { card.appendChild(e); });
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">1</span>What do you want to practise?</div>');
    B.what.forEach(function (e) { card.appendChild(e); });
    card.insertAdjacentHTML('beforeend', myBox(n, dc, my));
    card.insertAdjacentHTML('beforeend', '<div class="ms-now">' + (!ch ? 'Choose a unit above to unlock the ways to practise it.' : (!pool ? 'This selection has no words yet.' : 'Practising: <b>' + esc(labelNow()) + '</b> · ' + pool + ' words')) + '</div>');
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">2</span>How do you want to practise it?</div>');
    card.appendChild(setDet);
    card.insertAdjacentHTML('beforeend', '<div class="aph-tools ms-tiles">' + tilesHtml + '</div>');
    var vr = document.createElement('div'); vr.className = 'ms-viewrow'; vr.insertAdjacentHTML('beforeend', '<span class="aph-note" style="margin:0">Just want to read or print the list?</span>');
    if (view) { if (!usable) { view.disabled = true; } vr.appendChild(view); } card.appendChild(vr);
    extra.forEach(function (e) { [].slice.call(e.querySelectorAll('[onclick^="showSVTestPanel"],[onclick^="openStudyView"]')).forEach(function (b) { b.remove(); }); if (e.children.length) card.appendChild(e); });
    if (B.keys) card.appendChild(B.keys);
  };
  window.apMySetUse = function () { msMy = true; try { clearOverviewSelection(); } catch (e) { } renderIntro(); };
  window.apMySetFilter = function (f) { S.f = f; save(); renderIntro(); };

  // ---- overlays
  var keyH = null, mt = null;
  function ov(inner) { closeOv(); var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ms-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild; }
  function closeOv() { var o = $('ms-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } try { speechSynthesis.cancel(); } catch (e) { } }
  window.apMsClose = function () { closeOv(); if (document.querySelector('#app .intro-card')) renderIntro(); };
  function head(t, sub) { return '<div class="ms-head"><h2>' + t + '</h2><button class="ms-x" onclick="apMsClose()" aria-label="Close">✕</button></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apMsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }
  function es(p) { return plain(p.es).replace(/\s*\([^)]*\)/g, '').trim() || plain(p.es); }
  function en(p) { return plain(p.en); }

  window.apMySetHelp = function () {
    ov(head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the words you find hardest. You do not have to build it: it builds itself.</p>'
      + '<p><b>How do words get in?</b> Do any drill. Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> choose <b>★ My personalised set</b>. Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell, Match, Leisure Mode or Test, exactly as normal but only on your tricky words. The Speed Challenge works on whole sections, so it stays greyed out for this set.</p>'
      + '<p><b>Hard, Tricky, Easier.</b> Every ✗ card goes in as Hard. Press <b>✎ Edit</b> to change a level or take a word out. Then you can practise just the Hard ones.</p>'
      + '<p><b>Due today.</b> A word you missed comes back after 1 day, then 3 days, then 7. Get it right each time and it stops coming back.</p>'
      + '<p><b>Keep it safe.</b> Press <b>🔗 Save my personalised set</b>, copy the link and paste it into OneNote. Tap that link on any device and your set is back. It is also kept on this iPad, but the link is the safe copy.</p></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apMsClose()">Got it</button></div>');
    keys(function () { return false; });
  };

  // ---- Edit
  window.apMySetEdit = function () { editView(); };
  function editView() {
    var rows = inSet().sort(function (a, b) { return (S.c[kOf(b)].l || 2) - (S.c[kOf(a)].l || 2); });
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' };
    ov(head('✎ Personalised set', 'Tap a level to change it. ✕ takes a word out. ' + rows.length + ' words.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (p) { var k = kOf(p), l = S.c[k].l || 2; return '<div class="ms-li"><div><div class="f">' + esc(plain(p.es)) + '</div><div class="e">' + esc(en(p)) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" data-k="' + esc(k) + '" onclick="apMsLv(this)">' + lv[l] + '</button><button class="ms-lv" data-k="' + esc(k) + '" onclick="apMsDel(this)" aria-label="Take out">✕</button></div></div>'; }).join('') : '<div class="ms-note" style="padding:12px 2px">Nothing here yet.</div>')
      + '</div><div class="ms-cen" style="margin-top:12px"><button class="ms-b pri" onclick="apMsClose()">Done</button></div>');
    keys(function () { return false; });
  }
  function redo() { var y = $('ms-ov').scrollTop; editView(); $('ms-ov').scrollTop = y; }
  window.apMsLv = function (b) { var k = b.getAttribute('data-k'), l = S.c[k].l || 2; S.c[k].l = l === 3 ? 1 : l + 1; save(); redo(); };
  window.apMsDel = function (b) { var k = b.getAttribute('data-k'); delete S.c[k]; delete S.due[k]; save(); redo(); };

  // ---- Save / open link
  function linkText() { return location.href.replace(/[#?].*$/, '') + HASH + ids().map(function (k) { return k + '~' + (S.c[k].l || 2); }).join(','); }
  window.apMySetLink = function () {
    var n = ids().length;
    ov(head('🔗 Save my personalised set') + (n ? '<p class="ms-note" style="font-size:1rem">Paste this link into OneNote. Opening it, on any device, brings back these ' + n + ' words. It is also kept on this iPad automatically.</p><textarea id="ms-link" class="ms-ta" readonly>' + esc(linkText()) + '</textarea><div class="ms-cen"><button class="ms-b pri" onclick="apMsCopy()">Copy link</button></div><div class="ms-note" id="ms-copied" style="text-align:center"></div>' : '<p class="ms-note" style="font-size:1rem">Your set is empty so far, so there is nothing to save yet.</p>')
      + '<div class="ms-cen"><button class="ms-b" onclick="apMsClose()">Close</button></div>');
    keys(function () { return false; });
    var t = $('ms-link'); if (t) { t.focus(); t.select(); }
  };
  window.apMsCopy = function () {
    var t = $('ms-link'), m = $('ms-copied'); t.focus(); t.select();
    var done = function () { m.textContent = 'Copied. Now paste it into OneNote.'; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t.value).then(done, function () { document.execCommand('copy'); done(); }); return; } } catch (e) { }
    try { document.execCommand('copy'); done(); } catch (e) { m.textContent = 'Press and hold the link, then choose Copy.'; }
  };
  function openFromHash() {
    var m = /^#fvset=([^&]*)/.exec(location.hash || ''); if (!m) return;
    var got = 0, miss = 0, have = {}; ALL_PHRASES.forEach(function (p) { have[kOf(p)] = 1; });
    m[1].split(',').forEach(function (x) {
      var a = x.split('~'); if (a.length < 3) return; var k = a[0] + '~' + a[1], l = parseInt(a[2], 10); if (!(l >= 1 && l <= 3)) l = 2;
      if (!have[k]) { miss++; return; } var o = S.c[k]; S.c[k] = { l: Math.max(o ? o.l || 1 : 1, l) }; if (!S.due[k]) S.due[k] = { b: 0, d: today() }; got++;
    });
    S.f = 'all'; save();
    note = got + ' word' + (got === 1 ? '' : 's') + ' loaded' + (miss ? ' (' + miss + ' no longer in the list)' : '') + '.';
    msMy = true; try { clearOverviewSelection(); } catch (e) { }
    if ($('app') && document.querySelector('#app .intro-card')) renderIntro(); else if ($('app')) goHome();
  }
  if (document.readyState === 'complete') setTimeout(openFromHash, 400); else window.addEventListener('load', function () { setTimeout(openFromHash, 400); });
  window.addEventListener('hashchange', openFromHash);

  // ---- Spell
  var sp = null;
  function pickPool() {
    var pool = getSelectedPhrases(); if (!pool.length) { alert('Choose a unit under What to practise first.'); return null; }
    return { pool: pool, n: _selectedCount > 0 ? Math.min(_selectedCount, pool.length) : pool.length };
  }
  window.apSpell = function () {
    var p = pickPool(); if (!p) return;
    sp = { d: shuffle(p.pool).slice(0, p.n), i: 0, ok: 0, near: 0, bad: 0, miss: [], rev: false, label: labelNow() };
    try { if (countdown) { clearInterval(countdown); countdown = null; } } catch (e) { }
    spCard();
  };
  function spCard() {
    if (sp.i >= sp.d.length) return spEnd();
    var c = sp.d[sp.i]; sp.rev = false;
    ov(head('✍ Spell', esc(sp.label) + ' · card ' + (sp.i + 1) + ' of ' + sp.d.length) + '<div class="ms-bar"><div style="width:' + Math.round(sp.i / sp.d.length * 100) + '%"></div></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpListen()">🔊 Listen</button><button class="ms-b" onclick="apSpHint()">Show meaning</button></div>'
      + '<div class="ms-big" id="ms-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(en(c)) + '</div>'
      + '<textarea id="ms-in" class="ms-in" rows="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="es" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpCheck()">Check</button></div><div id="ms-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apSpCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apSpMark('bad'); return true; } if (e.key === 'ArrowDown') { apSpMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apSpMark('ok'); return true; }
      return false;
    });
    apSpListen(); var i = $('ms-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  }
  window.apSpListen = function () { var c = sp.d[sp.i]; speak(c.es, 'es-ES'); };
  window.apSpHint = function () { var m = $('ms-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  window.apSpCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm($('ms-in').value), ans = es(c).replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/) : [], bad = 0, acc = 0;
    var words = ans.split(/\s+/).map(function (w) {
      var k = w.toLowerCase(); if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      var kw = k.replace(/[,.;:!?¿¡]+$/, '');
      if (tw.indexOf(k) >= 0 || tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(k) || noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc && tw.length === ans.split(/\s+/).length ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    $('ms-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + '<div class="ms-note" style="text-align:center">' + esc(en(c)) + '</div>'
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apSpMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apSpMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apSpMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = $('ms-in'); if (i) i.blur();
  };
  window.apSpMark = function (r) {
    var c = sp.d[sp.i]; record(c, r); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length;
    ov(head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(plain(c.es)) + '</div><div class="e">' + esc(en(c)) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apSpell()">↻ Again</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
    keys(function () { return false; });
  }

  // ---- Match (six pairs against the clock)
  var mm = null;
  window.apMatch = function () {
    var pool = getSelectedPhrases(); if (!pool.length) { alert('Choose a unit under What to practise first.'); return; }
    var seen = {}, u = [];
    pool.forEach(function (c) { var a = en(c).toLowerCase(), b = es(c).toLowerCase(); if (seen['e' + a] || seen['s' + b]) return; seen['e' + a] = seen['s' + b] = 1; u.push(c); });
    if (u.length < 3) { alert('Match needs at least 3 different words in the selection.'); return; }
    var d = shuffle(u).slice(0, 6);
    mm = { d: d, en: shuffle(d.map(function (_, i) { return i; })), fr: shuffle(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: labelNow() };
    ov(head('🧩 Match', esc(mm.label) + ' · tap an English word, then its Spanish') + '<div class="ms-time" id="ms-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t" id="ms-e' + i + '" onclick="apMatchTap(\'e\',' + i + ')">' + esc(en(d[i])) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t" id="ms-f' + i + '" onclick="apMatchTap(\'f\',' + i + ')">' + esc(es(d[i])) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" id="ms-mnote" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = $('ms-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apMatchTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = $('ms-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') { try { speak(mm.d[i].es, 'es-ES'); } catch (e) { } }
    if (!mm.sel || mm.sel.side === side) { if (mm.sel) { var o = $('ms-' + mm.sel.side + mm.sel.i); if (o) o.classList.remove('sel'); } mm.sel = { side: side, i: i }; el.classList.add('sel'); return; }
    var a = mm.sel; mm.sel = null; var ae = $('ms-' + a.side + a.i); var ei = side === 'e' ? i : a.i, fi = side === 'f' ? i : a.i;
    if (ei === fi) { ae.classList.remove('sel'); ae.classList.add('done'); el.classList.add('done'); mm.done++; if (mm.done === mm.d.length) matchEnd(); }
    else { mm.pen += 3; ae.classList.remove('sel'); ae.classList.add('bad'); el.classList.add('bad'); setTimeout(function () { ae.classList.remove('bad'); el.classList.remove('bad'); }, 600); }
  };
  function matchEnd() {
    clearInterval(mt); mt = null; var t = (Date.now() - mm.t0) / 1000 + mm.pen, best = null, nb = false;
    if (mm.d.length === 6) { try { best = parseFloat(localStorage.getItem(BEST)); if (isNaN(best) || t < best) { localStorage.setItem(BEST, String(t)); nb = best != null && !isNaN(best); best = t; } } catch (e) { } }
    setTimeout(function () {
      ov(head('🧩 Match · done') + '<div class="ms-big">' + t.toFixed(1) + ' seconds</div><div class="ms-note" style="text-align:center;font-size:1rem">' + (mm.pen ? (mm.pen / 3) + ' wrong pair' + (mm.pen === 3 ? '' : 's') + ' (+' + mm.pen + ' s). ' : 'No wrong pairs. ') + (best != null ? (nb ? 'New best time! ' : '') + 'Best on this iPad: ' + best.toFixed(1) + ' s.' : '') + '</div>'
        + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apMatch()">↻ Another 6</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
      keys(function () { return false; });
    }, 500);
  }
  if (document.querySelector('#app .intro-card')) renderIntro();
})();
