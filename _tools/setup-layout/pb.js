(function () {
  'use strict';
  var KEY = 'appb_myset_v1', MY = 'myset';
  var S = { c: {}, due: {}, f: 'all' }, note = '', setOpen = false;
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function kOf(p) { return p.cat + '~' + p.n; }
  function dueNow(k) { var d = S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function ids() { return Object.keys(S.c); }
  function dueCount() { return ids().filter(dueNow).length; }
  function inSet() { return ALL_PHRASES.filter(function (p) { return S.c[kOf(p)]; }); }
  var ORAL = ['react', 'point', 'media', 'example', 'analyse', 'opinion', 'hypo', 'conclude', 'interact', 'lead_back', 'lead_fwd'];
  var TOOL = ['toolkit_org', 'toolkit_dist', 'toolkit_add', 'toolkit_hl', 'toolkit_ex', 'toolkit_conf', 'toolkit_rest', 'toolkit_concl', 'causes', 'conseq', 'goals', 'oppos', 'concede', 'compare'];
  pbPool = function (v) {
    if (!v) return [];
    if (v === 'all') return ALL_PHRASES;
    if (v === 'oral_all') return ALL_PHRASES.filter(function (p) { return ORAL.indexOf(p.cat) >= 0; });
    if (v === 'toolkit_all') return ALL_PHRASES.filter(function (p) { return TOOL.indexOf(p.cat) >= 0; });
    if (v === MY) return inSet().filter(function (p) { var k = kOf(p), l = S.c[k].l || 2; return S.f === 'all' ? true : S.f === 'due' ? dueNow(k) : S.f === '3' ? l === 3 : l >= 2; });
    return ALL_PHRASES.filter(function (p) { return p.cat === v; });
  };

  // ---- marking in any drill feeds the personalised set
  function record(p, res) {
    if (!p || p.n == null) return;
    var k = kOf(p);
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
    ['ms-drill', 'drill', 'Drill', 'Cards one at a time. You mark yourself ✗ ~ ✓.', 'startDrill()'],
    ['ms-speed', 'speed', 'Speed Challenge', 'Race the clock, solo or in teams.', 'openVocabChallenge()'],
    ['ms-spell', 'spell', 'Spell', 'Hear the phrase and write it. Accents count.', 'apSpell()'],
    ['ms-match', 'match', 'Match', 'Pair six English and foreign phrases against the clock.', 'apMatch()'],
    ['ms-leis', 'leis', 'Leisure Mode', 'Just press play and let it all wash over you.', 'startLeisureMode()'],
    ['ms-test', 'test', 'Test', 'A test to print or do on screen. Answers stay hidden.', 'showOPTestPanel()']
  ];
  function foreign() { var f = getLangFrom(), t = getLangTo(); return t === 'en' ? f : t; }
  function iconFor(k) { var l = foreign(); if (k === 'spell' || k === 'match') return ICONS[k + '_' + (l === 'it' || l === 'es' ? l : 'fr')]; return ICONS[k]; }

  function myBox(n, dc, on) {
    var fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']];
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (n || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apMySetUse()" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note" style="min-width:auto">' + n + ' phrase' + (n === 1 ? '' : 's') + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apMySetHelp()">? How does this work?</button></div>'
      + (n || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apMySetEdit()">✎ Edit</button><button class="ms-b sm" onclick="apMySetLink()">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (S.f === x[0] ? ' on' : '') + '" onclick="apMySetFilter(\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (note || !n ? '<div class="ms-note">' + (note ? '<b>' + note + '</b> ' : '') + (!n ? 'Empty so far. Phrases you mark ✗ Major error in any drill join it automatically.' : '') + '</div>' : '') + '</div>';
  }

  var ri = window.renderIntro;
  window.renderIntro = function () {
    var keep = _catVal;
    ri.apply(this, arguments);
    _catVal = keep;
    var app = document.getElementById('app'); if (!app) return;
    var card = app.querySelector('.intro-card'); if (!card || card.getAttribute('data-ms')) return; card.setAttribute('data-ms', '1');
    var sel = card.querySelector('#cat-select');
    var chosen = !!_catVal, my = _catVal === MY, n = ids().length, dc = dueCount();
    if (sel) {
      sel.insertAdjacentHTML('afterbegin', '<option value="" disabled>Choose a category…</option><option value="' + MY + '">★ My personalised set (' + n + ')</option>');
      sel.value = _catVal;
      var pc = card.querySelector('.intro-phrase-count'); if (pc) { if (!chosen) pc.style.display = 'none'; else pc.textContent = pbPool(_catVal).length + ' phrases'; }
    }
    var usable = chosen && pbPool(_catVal).length > 0;
    var B = { head: [], banner: [], dir: [], what: [], cards: [], timer: [], stack: null, keys: null }, cur = 'head';
    [].slice.call(card.children).forEach(function (e) {
      var t = e.classList.contains('aph-label') ? e.textContent.trim() : '';
      if (e.tagName === 'H2') { B.head.push(e); return; }
      if (e.classList.contains('aph-banner')) { B.banner.push(e); return; }
      if (e.classList.contains('aph-stack')) { B.stack = e; cur = 'x'; return; }
      if (e.classList.contains('aph-keys')) { B.keys = e; cur = 'x'; return; }
      if (/^(Direction|Mix both ways)/i.test(t)) cur = 'dir'; else if (/^Category/i.test(t)) cur = 'what'; else if (/^Cards per session/i.test(t)) cur = 'cards'; else if (/^Timer per card/i.test(t)) cur = 'timer';
      if (B[cur]) B[cur].push(e);
    });
    if (!B.stack || !B.what.length) return;
    // the "Category" label is replaced by the step heading
    B.what = B.what.filter(function (e) { return !e.classList.contains('aph-label'); });
    var setDet = document.createElement('details'); setDet.className = 'ms-opts'; setDet.open = setOpen; setDet.addEventListener('toggle', function () { setOpen = setDet.open; });
    var f = getLangFrom(), t = getLangTo();
    setDet.innerHTML = '<summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small>' + (_selectedCount === -1 ? 'All cards' : _selectedCount + ' cards') + ' · ' + timerSecs + 's a card · ' + LANG_NAMES[f] + ' → ' + LANG_NAMES[t] + (mixOn() ? ' · mixed ' + mixShort() : '') + (isAutotime ? ' · Autotime on' : '') + '</small><span class="ms-chg"></span></summary>';
    B.cards.concat(B.timer).forEach(function (e) { setDet.appendChild(e); });
    var auto = B.stack.querySelector('#autotimeBtn'); if (auto) { var ar = document.createElement('div'); ar.className = 'aph-row'; ar.appendChild(auto); var an = document.createElement('div'); an.className = 'aph-note'; an.style.margin = '0 0 4px'; an.textContent = 'Autotime: Leisure Mode moves on by itself, with no timer bar.'; setDet.appendChild(ar); setDet.appendChild(an); }
    B.dir.forEach(function (e) { setDet.appendChild(e); });
    setDet.insertAdjacentHTML('beforeend', '<div class="aph-note" style="margin:6px 0 4px;line-height:1.45"><b>Direction</b> is which language you see and which you answer in. <b>Mix both ways</b>: Off = every card goes the way round chosen above. 50–50 = half the cards go English → foreign and half the other way, each card showing its own direction. 70–30 = seven in ten English → foreign, three in ten the other way.</div>');
    var view = B.stack.querySelector('[onclick^="pbOpenView"]');
    var extra = [].slice.call(B.stack.children).filter(function (e) { return e.classList.contains('aph-tools') && !e.querySelector('#autotimeBtn') && !e.querySelector('[onclick^="pbOpenView"]') && !e.querySelector('[onclick^="showOPTestPanel"]'); });
    var tilesHtml = TILES.map(function (x) {
      var off = !usable || (my && x[1] === 'speed');
      var d = x[3]; if (my && x[1] === 'speed') d = 'Works on whole categories, so not on a personalised set.';
      return '<button class="ms-tile ' + x[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + x[4] + '"><img class="ms-img" alt="" src="' + iconFor(x[1]) + '"><span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + d + '</span></span></button>';
    }).join('');
    while (card.firstChild) card.removeChild(card.firstChild);
    B.head.forEach(function (e) { card.appendChild(e); });
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">1</span>What do you want to practise?</div>');
    var wrap = document.createElement('div'); wrap.className = 'aph-row'; B.what.forEach(function (e) { wrap.appendChild(e); }); card.appendChild(wrap);
    card.insertAdjacentHTML('beforeend', myBox(n, dc, my));
    var pool = chosen ? pbPool(_catVal).length : 0;
    var lab = sel && chosen ? sel.options[sel.selectedIndex].text.replace(/ \(\d+( phrases)?\)$/, '') : '';
    card.insertAdjacentHTML('beforeend', '<div class="ms-now">' + (!chosen ? 'Choose a category above to unlock the ways to practise it.' : (!pool ? 'This selection has no phrases yet.' : 'Practising: <b>' + esc(my ? 'my personalised set' : lab) + '</b> · ' + pool + ' phrases')) + '</div>');
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">2</span>How do you want to practise it?</div>');
    card.appendChild(setDet);
    card.insertAdjacentHTML('beforeend', '<div class="aph-tools ms-tiles">' + tilesHtml + '</div>');
    var vr = document.createElement('div'); vr.className = 'ms-viewrow'; vr.insertAdjacentHTML('beforeend', '<span class="aph-note" style="margin:0">Just want to read or print the list?</span>'); if (view) vr.appendChild(view); card.appendChild(vr);
    extra.forEach(function (e) { card.appendChild(e); });
    if (B.keys) card.appendChild(B.keys);
  };
  var oc = window.onCatChange;
  window.onCatChange = function () { oc.apply(this, arguments); if (document.querySelector('#app .intro-card')) window.renderIntro(); };
  window.apMySetUse = function () { _catVal = MY; window.renderIntro(); };
  window.apMySetFilter = function (f) { S.f = f; save(); window.renderIntro(); };

  // ---- overlays
  var keyH = null, mt = null;
  function ov(inner) { closeOv(); var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ms-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild; }
  function closeOv() { var o = document.getElementById('ms-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } try { speechSynthesis.cancel(); } catch (e) { } }
  window.apMsClose = function () { closeOv(); if (document.querySelector('#app .intro-card')) window.renderIntro(); };
  function head(t, sub) { return '<div class="ms-head"><h2>' + t + '</h2><button class="ms-x" style="width:auto;padding:0 16px;font-weight:700;font-size:1rem" onclick="apMsClose()" aria-label="Back">← Back</button></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apMsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }
  function txt(p, l, o) { return plain(resolveDisplay(p, l, o)).replace(/\s*\([^)]*\)/g, '').trim(); }
  function show(p, l, o) { return plain(resolveDisplay(p, l, o)); }

  window.apMySetHelp = function () {
    ov(head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the phrases you find hardest. You do not have to build it: the app does it for you.</p>'
      + '<p><b>How do phrases get in?</b> Do any drill. Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> choose <b>★ My personalised set</b> (or tap the button under it). Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell, Match, Leisure Mode or Test, exactly as normal but only on your tricky phrases.</p>'
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
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' };
    ov(head('✎ Personalised set', 'Tap a level to change it. ✕ takes a phrase out. ' + rows.length + ' phrases.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (p) { var k = kOf(p), l = S.c[k].l || 2; return '<div class="ms-li"><div><div class="f">' + esc(show(p, foreign(), 'en')) + '</div><div class="e">' + esc(show(p, 'en', foreign())) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" onclick="apMsLv(\'' + k + '\')">' + lv[l] + '</button><button class="ms-lv" onclick="apMsDel(\'' + k + '\')" aria-label="Remove">✕</button></div></div>'; }).join('') : '<div class="ms-note">No phrases yet.</div>') + '</div>');
    keys(function () { return false; });
  }
  function redo() { var y = document.getElementById('ms-ov').scrollTop; editView(); document.getElementById('ms-ov').scrollTop = y; }
  window.apMsLv = function (k) { var l = S.c[k].l || 2; S.c[k].l = l === 3 ? 1 : l + 1; save(); redo(); };
  window.apMsDel = function (k) { delete S.c[k]; delete S.due[k]; save(); redo(); };

  // ---- Save / open link
  function linkText() { return location.href.replace(/[#?].*$/, '') + '#pbset=' + ids().map(function (k) { return k + '~' + (S.c[k].l || 2); }).join('.'); }
  window.apMySetLink = function () {
    var n = ids().length;
    ov(head('🔗 Save my personalised set') + (n ? '<p class="ms-note" style="font-size:1rem">Paste this link into OneNote. Opening it, on any device, brings back these ' + n + ' phrases. It is also kept on this iPad automatically.</p><textarea id="ms-link" class="ms-ta" readonly>' + esc(linkText()) + '</textarea><div class="ms-cen"><button class="ms-b pri" onclick="apMsCopy()">Copy link</button></div><div class="ms-note" id="ms-copied" style="text-align:center"></div>' : '<p class="ms-note" style="font-size:1rem">Nothing to save yet. Mark some cards ✗ in a drill first.</p>'));
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
    var m = /^#pbset=([^&]*)/.exec(location.hash || ''); if (!m) return;
    var got = 0, miss = 0, have = {}; ALL_PHRASES.forEach(function (p) { have[kOf(p)] = 1; });
    m[1].split('.').forEach(function (x) {
      var a = x.split('~'); if (a.length < 3) return; var k = a[0] + '~' + a[1], l = parseInt(a[2], 10); if (!(l >= 1 && l <= 3)) l = 2;
      if (!have[k]) { miss++; return; } var o = S.c[k]; S.c[k] = { l: Math.max(o ? o.l || 1 : 1, l) }; if (!S.due[k]) S.due[k] = { b: 0, d: today() }; got++;
    });
    S.f = 'all'; save();
    note = got + ' phrase' + (got === 1 ? '' : 's') + ' loaded' + (miss ? ' (' + miss + ' no longer in the list)' : '') + '.';
    _catVal = MY; if (document.getElementById('app')) window.renderIntro();
  }
  if (document.readyState === 'complete') setTimeout(openFromHash, 400); else window.addEventListener('load', function () { setTimeout(openFromHash, 400); });
  window.addEventListener('hashchange', openFromHash);

  // ---- Spell
  var sp = null;
  function pickPool() {
    var s = document.getElementById('cat-select'); if (s && s.value) _catVal = s.value;
    if (!_catVal) { alert('Choose a category under What to practise first.'); return null; }
    var pool = pbPool(_catVal); if (!pool.length) { alert('No phrases available for this selection.'); return null; }
    return { pool: pool, n: _selectedCount > 0 ? Math.min(_selectedCount, pool.length) : pool.length };
  }
  function label() { return _catVal === MY ? 'My personalised set' : (function () { var s = document.getElementById('cat-select'); return s && s.selectedIndex >= 0 ? s.options[s.selectedIndex].text.replace(/ \(\d+( phrases)?\)$/, '') : ''; })(); }
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
      + '<div class="ms-big" id="ms-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(show(c, 'en', sp.L)) + '</div>'
      + '<textarea id="ms-in" class="ms-in" rows="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="' + sp.L + '" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpCheck()">Check</button></div><div id="ms-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apSpCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apSpMark('bad'); return true; } if (e.key === 'ArrowDown') { apSpMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apSpMark('ok'); return true; }
      return false;
    });
    apSpListen(); var i = document.getElementById('ms-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  }
  window.apSpListen = function () { var c = sp.d[sp.i]; speakResolved(c, sp.L, 'en'); };
  window.apSpHint = function () { var m = document.getElementById('ms-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  window.apSpCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm(document.getElementById('ms-in').value), ans = txt(c, sp.L, 'en').replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/) : [], bad = 0, acc = 0;
    var words = ans.split(/\s+/).map(function (w) {
      var k = w.toLowerCase(); if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      var kw = k.replace(/[,.;:!?]+$/, '');
      if (tw.indexOf(k) >= 0 || tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(k) || noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc && tw.length === ans.split(/\s+/).length ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    document.getElementById('ms-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + '<div class="ms-note" style="text-align:center">' + esc(show(c, 'en', sp.L)) + '</div>'
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apSpMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apSpMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apSpMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = document.getElementById('ms-in'); if (i) i.blur();
  };
  window.apSpMark = function (r) {
    var c = sp.d[sp.i]; record(c, r); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length;
    ov(head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(show(c, sp.L, 'en')) + '</div><div class="e">' + esc(show(c, 'en', sp.L)) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apSpell()">↻ Again</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
    keys(function () { return false; });
  }

  // ---- Match (six pairs: the phrases are long)
  var mm = null, BEST = 'appb_match_best';
  window.apMatch = function () {
    var s = document.getElementById('cat-select'); if (s && s.value) _catVal = s.value;
    if (!_catVal) { alert('Choose a category under What to practise first.'); return; }
    var L = foreign(), seen = {}, u = [];
    pbPool(_catVal).forEach(function (c) { var a = txt(c, 'en', L).toLowerCase(), b = txt(c, L, 'en').toLowerCase(); if (seen[a] || seen[b]) return; seen[a] = seen[b] = 1; u.push(c); });
    if (u.length < 3) { alert('Match needs at least 3 different phrases in the selection.'); return; }
    var d = shuffle(u).slice(0, 6);
    mm = { d: d, L: L, en: shuffle(d.map(function (_, i) { return i; })), fr: shuffle(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: label() };
    ov(head('🧩 Match', esc(mm.label) + ' · tap an English phrase, then its ' + LANG_NAMES[L]) + '<div class="ms-time" id="ms-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-e' + i + '" onclick="apMatchTap(\'e\',' + i + ')">' + esc(txt(d[i], 'en', L)) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-f' + i + '" onclick="apMatchTap(\'f\',' + i + ')">' + esc(txt(d[i], L, 'en')) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" id="ms-mnote" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = document.getElementById('ms-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apMatchTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = document.getElementById('ms-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') { try { speakResolved(mm.d[i], mm.L, 'en'); } catch (e) { } }
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
  // ---- Back (AP BACK): one stage back from screens the generic mechanism cannot restore
  window.aphBackHook = function () {
    try {
      if (document.getElementById('ms-ov')) { window.apMsClose(); return true; }
      var a = document.getElementById('app');
      if (a && a.querySelector('.adj-paused')) { renderCard(); return true; }
      if (a && a.querySelector('.er-item') && deck && idx < deck.length) { renderCard(); return true; }
    } catch (e) { }
    return false;
  };
  window.apMySetFilterGet = function () { return S.f; };
  if (document.querySelector('#app .intro-card')) window.renderIntro();
})();
