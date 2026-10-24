(function () {
  'use strict';
  if (window.__apStSetup) return; window.__apStSetup = 1;
  var KEY = 'apis_myset_v1', MY = 'myset';
  var S = { c: {}, due: {}, f: 'all' }, note = '', setOpen = false;
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(s) { var h = 5381; s = String(s); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); }
  function kOf(c) { return (c.section || '') + '~' + hash(c.en || ''); }
  function dueNow(k) { var d = S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function ids() { return Object.keys(S.c); }
  function dueCount() { return ids().filter(dueNow).length; }
  function inSet() { return CARDS.filter(function (c) { return S.c[kOf(c)]; }); }

  // the one place that turns the chosen section into a list of cards (the page's own functions call it)
  window.stPool = function (sec) {
    if (sec === MY) {
      var f = getLangFrom(), t = getLangTo();
      return inSet().filter(function (c) { var k = kOf(c), l = S.c[k].l || 2; if (!(c[f] && c[t])) return false; return S.f === 'all' ? true : S.f === 'due' ? dueNow(k) : S.f === '3' ? l === 3 : l >= 2; });
    }
    return CARDS.filter(function (c) { return sectionMatches(c.section, sec || 'all'); });
  };
  var sl0 = window._secLabel;
  window._secLabel = function (v) { return v === MY ? 'My personalised set' : sl0.apply(this, arguments); };

  // ---- marking in any drill feeds the personalised set
  function record(c, res) {
    if (!c || !c.en) return;
    var k = kOf(c);
    if (res === 'bad') { S.c[k] = { l: 3 }; S.due[k] = { b: 0, d: today() + 1 }; }
    else if (res === 'ok' && S.c[k] && dueNow(k)) { var b = (S.due[k].b || 0) + 1; S.due[k] = b >= 3 ? { b: 3, d: null } : { b: b, d: today() + [1, 3, 7][b] }; }
    else return;
    save();
  }
  var m0 = window.mark;
  window.mark = function (r) {
    try { var p = deck[idx]; if (p) record(p, r === 'end' ? 'bad' : r === 'got' ? 'ok' : ''); } catch (e) { }
    return m0.apply(this, arguments);
  };

  var ICONS = {};
  var TILES = [
    ['ms-drill', 'drill', 'Drill', 'Cards one at a time. Say it, then mark yourself ✗ ~ ✓.', 'startQuickPractice(_selectedCount)'],
    ['ms-speed', 'speed', 'Speed Challenge', 'Name the structures against the clock, solo or in teams.', 'apStSpeed()'],
    ['ms-spell', 'spell', 'Spell', 'Hear the phrase and write it. Accents count.', 'apSpell()'],
    ['ms-match', 'match', 'Match', 'Pair six English and foreign phrases against the clock.', 'apMatch()'],
    ['ms-leis', 'leis', 'Leisure Mode', 'Just press play and let it all wash over you.', 'startLeisureMode()'],
    ['ms-test', 'test', 'Test', 'Make a test to print or copy. The answers are a click away.', 'showMSTestPanel()']
  ];
  function foreign() { var f = getLangFrom(), t = getLangTo(); return t === 'en' ? f : t; }
  function iconFor(k) { var l = foreign(); if (k === 'spell' || k === 'match') return ICONS[k + '_' + (l === 'it' || l === 'es' ? l : 'fr')]; return ICONS[k]; }
  function speedOK() { try { return !!(_apcData().prompts[foreign()]); } catch (e) { return false; } }
  window.apStSpeed = function () {
    var l = foreign();
    openStructureChallenge({ lang: l, sel: _apcSelFromSections(currentSection, l) });
  };

  function myBox(n, dc, on) {
    var fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']];
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (n || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apMySetUse()" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note" style="min-width:auto">' + n + ' phrase' + (n === 1 ? '' : 's') + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apMySetHelp()">? How does this work?</button></div>'
      + (n || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apMySetEdit()">✎ Edit</button><button class="ms-b sm" onclick="apMySetLink()">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (S.f === x[0] ? ' on' : '') + '" onclick="apMySetFilter(\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (note || !n ? '<div class="ms-note">' + (note ? '<b>' + note + '</b> ' : '') + (!n ? 'Empty so far. Phrases you mark ✗ Major error in any drill join it automatically.' : '') + '</div>' : '') + '</div>';
  }
  function sumText() {
    var f = getLangFrom(), t = getLangTo();
    return (_selectedCount === -1 ? 'All cards' : _selectedCount + ' cards') + ' · ' + timerSecs + 's a card · ' + LANG_NAMES[f] + ' → ' + LANG_NAMES[t] + (isAutotime ? ' · Autotime on' : '');
  }
  function refreshSum() { var s = document.querySelector('#app .ms-opts > summary small'); if (s) s.textContent = sumText(); }
  var at0 = window.adjustTimer; window.adjustTimer = function () { var r = at0.apply(this, arguments); refreshSum(); return r; };
  var ta0 = window.toggleAutotime; window.toggleAutotime = function () { var r = ta0.apply(this, arguments); refreshSum(); return r; };

  var ri = window.renderIntro;
  window.renderIntro = function () {
    ri.apply(this, arguments);
    var app = document.getElementById('app'); if (!app) return;
    var card = app.querySelector('.st-setup'); if (!card || card.getAttribute('data-ms')) return; card.setAttribute('data-ms', '1');
    var sec = currentSection || '', chosen = !!sec, my = sec === MY, n = ids().length, dc = dueCount();
    var f = getLangFrom(), t = getLangTo();
    var pool = chosen ? stPool(sec).filter(function (c) { return c[f] && c[t]; }).length : 0;
    var usable = chosen && pool > 0;
    var B = { head: [], banner: [], dir: [], what: [], cards: [], timer: [], stack: null, keys: null }, cur = 'head';
    [].slice.call(card.children).forEach(function (e) {
      var tx = e.classList.contains('aph-label') ? e.textContent.trim() : '';
      if (e.tagName === 'H2') { B.head.push(e); return; }
      if (e.classList.contains('aph-banner')) { B.banner.push(e); return; }
      if (e.classList.contains('aph-stack')) { B.stack = e; cur = 'x'; return; }
      if (e.classList.contains('aph-keys')) { B.keys = e; cur = 'x'; return; }
      if (/^Direction/i.test(tx)) cur = 'dir'; else if (/^Section/i.test(tx)) cur = 'what'; else if (/^Cards per session/i.test(tx)) cur = 'cards'; else if (/^Timer per card/i.test(tx)) cur = 'timer';
      if (B[cur]) B[cur].push(e);
    });
    if (!B.stack || !B.what.length) return;
    B.what = B.what.filter(function (e) { return !e.classList.contains('aph-label'); });
    // the section row: nothing chosen yet / chosen
    var row = B.what[0];
    if (row && row.classList.contains('st-lists')) {
      var lab = !chosen ? 'Nothing chosen yet' : my ? '★ My personalised set' : _secLabel(sec);
      row.innerHTML = '<span class="st-ln">' + lab + (chosen ? '<small>' + pool + ' phrases</small>' : '') + '</span><button class="aph-btn aph-btn-sm' + (chosen ? '' : ' aph-btn-primary') + '" onclick="introPickSections()">' + (chosen ? 'Change' : 'Choose sections') + '</button>';
    }
    var setDet = document.createElement('details'); setDet.className = 'ms-opts'; setDet.open = setOpen; setDet.addEventListener('toggle', function () { setOpen = setDet.open; });
    setDet.innerHTML = '<summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small>' + sumText() + '</small><span class="ms-chg"></span></summary>';
    B.cards.concat(B.timer).forEach(function (e) { setDet.appendChild(e); });
    var auto = B.stack.querySelector('#autotimeBtn'); if (auto) { var ar = document.createElement('div'); ar.className = 'aph-row'; ar.appendChild(auto); var an = document.createElement('div'); an.className = 'aph-note'; an.style.margin = '0 0 4px'; an.textContent = 'Autotime: Leisure Mode moves on by itself, with no timer bar.'; setDet.appendChild(ar); setDet.appendChild(an); }
    B.dir.forEach(function (e) { setDet.appendChild(e); });
    setDet.insertAdjacentHTML('beforeend', '<div class="aph-note" style="margin:6px 0 4px;line-height:1.45"><b>Direction</b> is which language you see and which you answer in. Swap turns it round.</div>');
    var views = [].slice.call(B.stack.querySelectorAll('.st-tools2'));
    var extra = [].slice.call(B.stack.children).filter(function (e) { return e.classList.contains('aph-tools') && !e.querySelector('#autotimeBtn') && !e.classList.contains('st-tools2') && !e.querySelector('[onclick^="showMSTestPanel"]'); });
    var spOK = speedOK();
    var tilesHtml = TILES.map(function (x) {
      var off = !usable || (my && x[1] === 'speed') || (x[1] === 'speed' && !spOK);
      var d = x[3];
      if (x[1] === 'speed' && my) d = 'Works on whole sections, so not on a personalised set.';
      else if (x[1] === 'speed' && !spOK) d = 'Not yet available in ' + (LANG_NAMES[foreign()] || 'this language') + '.';
      return '<button class="ms-tile ' + x[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + x[4] + '"><img class="ms-img" alt="" src="' + iconFor(x[1]) + '"><span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + d + '</span></span></button>';
    }).join('');
    while (card.firstChild) card.removeChild(card.firstChild);
    B.head.forEach(function (e) { card.appendChild(e); });
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">1</span>What do you want to practise?</div>');
    var wrap = document.createElement('div'); wrap.className = 'aph-row'; wrap.style.display = 'block'; B.what.forEach(function (e) { wrap.appendChild(e); }); card.appendChild(wrap);
    card.insertAdjacentHTML('beforeend', myBox(n, dc, my));
    card.insertAdjacentHTML('beforeend', '<div class="ms-now">' + (!chosen ? 'Choose sections above, or ★ My personalised set, to unlock the ways to practise them.' : (!pool ? 'This selection has no phrases yet.' : 'Practising: <b>' + esc(my ? 'my personalised set' : _secLabel(sec)) + '</b> · ' + pool + ' phrases')) + '</div>');
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">2</span>How do you want to practise it?</div>');
    card.appendChild(setDet);
    card.insertAdjacentHTML('beforeend', '<div class="aph-tools ms-tiles">' + tilesHtml + '</div>');
    var vr = document.createElement('div'); vr.className = 'ms-viewrow'; vr.insertAdjacentHTML('beforeend', '<span class="aph-note" style="margin:0">Just want to read or print the phrases?</span>');
    views.forEach(function (v) { while (v.firstChild) vr.appendChild(v.firstChild); }); card.appendChild(vr);
    extra.forEach(function (e) { card.appendChild(e); });
    if (B.keys) card.appendChild(B.keys);
  };
  // the section picker starts empty when nothing (or the personalised set) is chosen
  var ips = window.introPickSections;
  window.introPickSections = function () {
    var fresh = !currentSection || currentSection === MY;
    if (!fresh) return ips.apply(this, arguments);
    var keep = currentSection; currentSection = 'all';
    try { ips.apply(this, arguments); } finally { currentSection = keep; }
    if (typeof _stPick !== 'undefined' && _stPick) { _stPick.sel = []; _stPickRender(); }
  };
  window.apMySetUse = function () { currentSection = MY; window.renderIntro(); };
  window.apMySetFilter = function (f) { S.f = f; save(); window.renderIntro(); };

  // ---- overlays
  var keyH = null, mt = null;
  function ov(inner) { closeOv(); var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ms-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild; }
  function closeOv() { var o = document.getElementById('ms-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } try { speechSynthesis.cancel(); } catch (e) { } }
  window.apMsClose = function () { closeOv(); if (document.querySelector('#app .st-setup')) window.renderIntro(); };
  function head(t, sub) { return '<div class="ms-head"><h2>' + t + '</h2><button class="ms-x" onclick="apMsClose()" aria-label="Close">✕</button></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apMsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }
  function txt(c, l) { return plain(c[l] || '').replace(/\s*\([^)]*\)/g, '').trim(); }
  function show(c, l) { return plain(c[l] || ''); }

  window.apMySetHelp = function () {
    ov(head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the phrases you find hardest. You do not have to build it: the app does it for you.</p>'
      + '<p><b>How do phrases get in?</b> Do any drill. Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> choose <b>★ My personalised set</b>. Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell, Match, Leisure Mode or Test, exactly as normal but only on your tricky phrases.</p>'
      + '<p><b>Hard, Tricky, Easier.</b> Every ✗ card goes in as Hard. Press <b>✎ Edit</b> to change a level or take a phrase out. Then you can practise just the Hard ones.</p>'
      + '<p><b>Due today.</b> A phrase you missed comes back after 1 day, then 3 days, then 7. Get it right each time and it stops coming back.</p>'
      + '<p><b>Keep it safe.</b> Press <b>🔗 Save my personalised set</b>, copy the link and paste it into OneNote. Tap that link on any device and your set is back. It is also kept on this iPad, but the link is the safe copy.</p></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apMsClose()">Got it</button></div>');
    keys(function () { return false; });
  };

  // ---- Edit
  window.apMySetEdit = function () { editView(); };
  function editView() {
    var rows = inSet().sort(function (a, b) { return (S.c[kOf(b)].l || 2) - (S.c[kOf(a)].l || 2); });
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' }, F = foreign();
    ov(head('✎ Personalised set', 'Tap a level to change it. ✕ takes a phrase out. ' + rows.length + ' phrases.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (c) { var k = kOf(c), l = S.c[k].l || 2; return '<div class="ms-li"><div><div class="f">' + esc(show(c, c[F] ? F : 'en')) + '</div><div class="e">' + esc(show(c, 'en')) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" onclick="apMsLv(\'' + k + '\')">' + lv[l] + '</button><button class="ms-lv" onclick="apMsDel(\'' + k + '\')" aria-label="Take out">✕</button></div></div>'; }).join('') : '<div class="ms-note">Nothing here yet.</div>')
      + '</div><div class="ms-cen" style="margin-top:12px"><button class="ms-b pri" onclick="apMsClose()">Done</button></div>');
    keys(function () { return false; });
  }
  function redo() { var y = document.getElementById('ms-ov').scrollTop; editView(); document.getElementById('ms-ov').scrollTop = y; }
  window.apMsLv = function (k) { var l = S.c[k].l || 2; S.c[k].l = l === 3 ? 1 : l + 1; save(); redo(); };
  window.apMsDel = function (k) { delete S.c[k]; delete S.due[k]; save(); redo(); };

  // ---- Save / open link
  function linkText() { return location.href.replace(/[#?].*$/, '') + '#stset=' + ids().map(function (k) { return k + '~' + (S.c[k].l || 2); }).join('.'); }
  window.apMySetLink = function () {
    var n = ids().length;
    ov(head('🔗 Save my personalised set') + (n ? '<p class="ms-note" style="font-size:1rem">Paste this link into OneNote. Opening it, on any device, brings back these ' + n + ' phrases. It is also kept on this iPad automatically.</p><textarea id="ms-link" class="ms-ta" readonly>' + esc(linkText()) + '</textarea><div class="ms-cen"><button class="ms-b pri" onclick="apMsCopy()">Copy link</button><button class="ms-b" onclick="apMsClose()">Close</button></div><div id="ms-copied" class="ms-note" style="text-align:center"></div>' : '<p class="ms-note" style="font-size:1rem">Nothing to save yet. Phrases you mark ✗ Major error join your set.</p><div class="ms-cen"><button class="ms-b" onclick="apMsClose()">Close</button></div>'));
    keys(function () { return false; });
    var t = document.getElementById('ms-link'); if (t) { t.focus(); t.select(); }
  };
  window.apMsCopy = function () {
    var t = document.getElementById('ms-link'), m = document.getElementById('ms-copied'); t.focus(); t.select();
    var done = function () { m.textContent = 'Copied. Now paste it into OneNote.'; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t.value).then(done, function () { document.execCommand('copy'); done(); }); return; } } catch (e) { }
    try { document.execCommand('copy'); done(); } catch (e) { m.textContent = 'Press and hold the link, then choose Copy.'; }
  };
  function openFromHash() {
    var m = /^#stset=([^&]*)/.exec(location.hash || ''); if (!m) return;
    var got = 0, miss = 0, have = {}; CARDS.forEach(function (c) { have[kOf(c)] = 1; });
    m[1].split('.').forEach(function (x) {
      var a = x.split('~'); if (a.length < 3) return; var k = a[0] + '~' + a[1], l = parseInt(a[2], 10); if (!(l >= 1 && l <= 3)) l = 2;
      if (!have[k]) { miss++; return; } var o = S.c[k]; S.c[k] = { l: Math.max(o ? o.l || 1 : 1, l) }; if (!S.due[k]) S.due[k] = { b: 0, d: today() }; got++;
    });
    S.f = 'all'; save();
    note = got + ' phrase' + (got === 1 ? '' : 's') + ' loaded' + (miss ? ' (' + miss + ' no longer in the list)' : '') + '.';
    currentSection = MY;
    try { if (typeof _currentApp === 'undefined' || _currentApp !== 'structures') launchStructures(); else window.renderIntro(); } catch (e) { }
    setTimeout(function () { var t = document.querySelector('#app .ms-tiles'); if (t && t.scrollIntoView) { var r = t.getBoundingClientRect(); if (r.bottom > window.innerHeight) t.scrollIntoView({ block: 'end' }); } }, 80);
  }
  if (document.readyState === 'complete') setTimeout(openFromHash, 400); else window.addEventListener('load', function () { setTimeout(openFromHash, 400); });
  window.addEventListener('hashchange', openFromHash);

  // ---- Spell
  var sp = null;
  function pickPool() {
    if (!currentSection) { alert('Choose what to practise first.'); return null; }
    var L = foreign(), pool = stPool(currentSection).filter(function (c) { return c.en && c[L]; });
    if (!pool.length) { alert('No phrases available for this selection.'); return null; }
    return { pool: pool, n: _selectedCount > 0 ? Math.min(_selectedCount, pool.length) : pool.length };
  }
  function label() { return currentSection === MY ? 'My personalised set' : _secLabel(currentSection); }
  window.apSpell = function () {
    var p = pickPool(); if (!p) return;
    sp = { d: shuffle(p.pool).slice(0, p.n), i: 0, ok: 0, near: 0, bad: 0, miss: [], rev: false, label: label(), L: foreign() };
    spCard();
  };
  function spCard() {
    if (sp.i >= sp.d.length) return spEnd();
    var c = sp.d[sp.i]; sp.rev = false;
    ov(head('✍ Spell', esc(sp.label) + ' · card ' + (sp.i + 1) + ' of ' + sp.d.length) + '<div class="ms-bar"><div style="width:' + Math.round(sp.i / sp.d.length * 100) + '%"></div></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpListen()">🔊 Listen</button><button class="ms-b" onclick="apSpHint()">Show meaning</button></div>'
      + '<div class="ms-big" id="ms-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(show(c, 'en')) + '</div>'
      + '<textarea id="ms-in" class="ms-in" rows="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="' + sp.L + '" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-note" style="text-align:center">Words in capitals such as VERB or INF are placeholders: write them as you hear them, or leave them out.</div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpCheck()">Check</button></div><div id="ms-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apSpCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apSpMark('bad'); return true; } if (e.key === 'ArrowDown') { apSpMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apSpMark('ok'); return true; }
      return false;
    });
    apSpListen(); var i = document.getElementById('ms-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  };
  window.apSpListen = function () { var c = sp.d[sp.i]; try { speak(c[sp.L], LANG_CODES[sp.L]); } catch (e) { } };
  window.apSpHint = function () { var m = document.getElementById('ms-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/[«»"]/g, '').replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var PH = /^(INF|VERB[A-ZÀ-Ý]*|ADJ|NOUNS?|SUBJ|TIME|X|Y|IMPARFAIT|IMPERFETTO|IMPERFECTO)$/;
  window.apSpCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm(document.getElementById('ms-in').value), ans = txt(c, sp.L).replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/) : [], bad = 0, acc = 0;
    var words = ans.split(/\s+/).map(function (w) {
      var k = w.toLowerCase(), kw = k.replace(/[,.;:!?]+$/, '');
      if (PH.test(w.replace(/[,.;:!?]+$/, ''))) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      if (tw.indexOf(k) >= 0 || tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(k) || noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    document.getElementById('ms-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + '<div class="ms-note" style="text-align:center">' + esc(show(c, 'en')) + '</div>'
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apSpMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apSpMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apSpMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = document.getElementById('ms-in'); if (i) i.blur();
  };
  window.apSpMark = function (r) {
    var c = sp.d[sp.i]; record(c, r); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length;
    ov(head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(show(c, sp.L)) + '</div><div class="e">' + esc(show(c, 'en')) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apSpell()">↻ Again</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
    keys(function () { return false; });
  }

  // ---- Match (six pairs: the phrases are long)
  var mm = null, BEST = 'apis_match_best';
  window.apMatch = function () {
    if (!currentSection) { alert('Choose what to practise first.'); return; }
    var L = foreign(), seen = {}, u = [];
    stPool(currentSection).forEach(function (c) { if (!c.en || !c[L]) return; var a = txt(c, 'en').toLowerCase(), b = txt(c, L).toLowerCase(); if (seen[a] || seen[b]) return; seen[a] = seen[b] = 1; u.push(c); });
    if (u.length < 3) { alert('Match needs at least 3 different phrases in the selection.'); return; }
    var np = u.filter(function (c) { return !/\b(INF|VERB[A-ZÀ-Ý]*|ADJ|NOUNS?|SUBJ|X|Y)\b/.test(c.en + ' ' + c[L]); });   // placeholder phrases give the pair away by their shape: keep them for when there are too few others
    var d = shuffle(np.length >= 6 ? np : u).slice(0, 6);
    mm = { d: d, L: L, en: shuffle(d.map(function (_, i) { return i; })), fr: shuffle(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: label() };
    ov(head('🧩 Match', esc(mm.label) + ' · tap an English phrase, then its ' + LANG_NAMES[L]) + '<div class="ms-time" id="ms-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-e' + i + '" onclick="apMatchTap(\'e\',' + i + ')">' + esc(txt(d[i], 'en')) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-f' + i + '" onclick="apMatchTap(\'f\',' + i + ')">' + esc(txt(d[i], L)) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" id="ms-mnote" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = document.getElementById('ms-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apMatchTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = document.getElementById('ms-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') { try { speak(mm.d[i][mm.L], LANG_CODES[mm.L]); } catch (e) { } }
    if (!mm.sel || mm.sel.side === side) { if (mm.sel) { var o = document.getElementById('ms-' + mm.sel.side + mm.sel.i); if (o) o.classList.remove('sel'); } mm.sel = { side: side, i: i }; el.classList.add('sel'); return; }
    var a = mm.sel; mm.sel = null; var ae = document.getElementById('ms-' + a.side + a.i); var ei = side === 'e' ? i : a.i, fi = side === 'f' ? i : a.i;
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
  window.apMySetFilterGet = function () { return S.f; };
  if (document.querySelector('#app .st-setup')) window.renderIntro();
})();
