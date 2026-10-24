(function () {
  'use strict';
  // Set-up layout for Eton IGCSE Vocab and Gr EWs: two steps, six tiles, Settings bar, personalised set.
  // Works on both homes: the Vocab home (#app .intro-card) and the Gr EWs home (#ggApp), French and Italian (and Spanish in the AP All Languages twin).
  var ICONS = {};
  var MYV = 'MYSET';
  function $(i) { return document.getElementById(i); }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function isGr() { return typeof ggVisible === 'function' && ggVisible(); }
  function load(key) { var S = { c: {}, due: {}, f: 'all' }; try { var raw = JSON.parse(localStorage.getItem(key) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { } return S; }

  // ---- the two sets (vocab words; grammar items) -------------------------------------------------
  var V = {
    kind: 'v', one: 'word', many: 'words', key: 'apigv_myset_v1', hash: '#vset=', note: '', S: null,
    id: function (p) { return p.sec + '~' + p.n; },
    all: function () { return ALL_PHRASES; },
    foreign: function () { var f = getLangFrom(), t = getLangTo(); return t === 'en' ? f : t; },
    lcode: function () { return LANG_CODES[this.foreign()]; },
    fText: function (p) { return plain(p[this.foreign()]).replace(/\s*\([^)]*\)/g, '').trim(); },
    eText: function (p) { return plain(p.en); },
    show: function (p, l) { return plain(p[l]); },
    hear: function (p) { speak(p[this.foreign()], this.lcode()); },
    pool: function () { return getSelectedPhrases(); },
    pairPool: function () { return getSelectedPhrases(); },
    label: function () { var s = $('sel-section'); return s && s.value === MYV ? 'My personalised set' : ((typeof introListName === 'function' && introListName()) || ''); },
    redraw: function () { renderIntro(); },
    ok: function () { return !!$('sel-section'); },
    max: 70
  };
  var G = {
    kind: 'g', one: 'item', many: 'items', key: 'apigg_myset_v1', hash: '#gset=', note: '', S: null,
    id: function (it) { return it.id; },
    all: function () { var o = []; ggOrder().forEach(function (k) { GGD[k].items.forEach(function (it) { o.push(it); }); }); return o; },
    foreign: function () { return ggLang; },
    lcode: function () { return GGL().code; },
    fText: function (it) { return plain(ggPlain(it.fr)).split(/ \/ | \(also/)[0].trim(); },
    eText: function (it) { return plain(ggPlain(it.en)); },
    show: function (it, l) { return l === 'en' ? plain(ggPlain(it.en)) : plain(ggPlain(it.fr)); },
    hear: function (it) { speak(ggPlain(it.fr), this.lcode()); },
    pool: function () { return ggPool(ggSelKeys()).filter(function (it) { return it.type === 'translate'; }); },
    pairPool: function () { return this.pool().filter(function (it) { return G.fText(it).length <= 80 && G.eText(it).length <= 80; }); },
    label: function () { return ggS.my ? 'My personalised set' : ggSelLabel(); },
    redraw: function () { ggHome(); },
    ok: function () { return true; },
    max: 80
  };
  V.S = load(V.key); G.S = load(G.key);
  function M() { return isGr() ? G : V; }
  function save(m) { try { localStorage.setItem(m.key, JSON.stringify(m.S)); } catch (e) { } }
  function dueNow(m, k) { var d = m.S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function ids(m) { return Object.keys(m.S.c); }
  function dueCount(m) { return inSet(m).filter(function (x) { return dueNow(m, m.id(x)); }).length; }
  function inSet(m) { return m.all().filter(function (x) { return m.S.c[m.id(x)]; }); }
  function myPool(m) {
    return inSet(m).filter(function (x) { var k = m.id(x), l = m.S.c[k].l || 2, f = m.S.f; return f === 'all' ? true : f === 'due' ? dueNow(m, k) : f === '3' ? l === 3 : l >= 2; });
  }
  function record(m, x, res) {
    if (!x) return; var k = m.id(x); if (k == null) return;
    if (res === 'bad') { m.S.c[k] = { l: 3 }; m.S.due[k] = { b: 0, d: today() + 1 }; }
    else if (res === 'ok' && m.S.c[k] && dueNow(m, k)) { var b = (m.S.due[k].b || 0) + 1; m.S.due[k] = b >= 3 ? { b: 3, d: null } : { b: b, d: today() + [1, 3, 7][b] }; }
    else return;
    save(m);
  }
  function icon(k) { var l = M().foreign(); if (k === 'spell' || k === 'match') return ICONS[k + '_' + (l === 'it' || l === 'es' ? l : 'fr')]; return ICONS[k]; }

  // ---- marking in any drill feeds the personalised set
  var m0 = window.mark;
  window.mark = function (r) {
    try { var p = deck[idx]; if (p) record(V, p, r === 'end' ? 'bad' : r === 'got' ? 'ok' : ''); } catch (e) { }
    return m0.apply(this, arguments);
  };
  var gm0 = ggMark;
  ggMark = function (v) {
    try { var D = ggS.drill; if (D && D.revealed) record(G, D.items[D.idx], v === 'miss' ? 'bad' : v === 'ok' ? 'ok' : ''); } catch (e) { }
    return gm0.apply(this, arguments);
  };

  // ---- vocab: the personalised set is one more "selection"
  var gs0 = getSelectedPhrases;
  getSelectedPhrases = function () { var s = $('sel-section'); if (s && s.value === MYV) return cogFilter(myPool(V)); return gs0.apply(this, arguments); };
  function ensureOpt() {
    var s = $('sel-section'); if (!s) return;
    var o = s.querySelector('option[value="' + MYV + '"]');
    if (!o) { o = document.createElement('option'); o.value = MYV; s.insertBefore(o, s.firstChild); }
    o.textContent = '★ My personalised set';
  }
  var ovo0 = openListOverview, ovc0 = closeListOverview, wasMy = false;
  openListOverview = function () {
    var s = $('sel-section'); wasMy = !!(s && s.value === MYV);
    if (wasMy && s.querySelector('option[value="OVSEL"]')) s.value = 'OVSEL';   // the Choose lists panel starts from the lists, not from the personalised set
    return ovo0.apply(this, arguments);
  };
  closeListOverview = function () {
    var s = $('sel-section'), had = wasMy; wasMy = false;
    var r = ovc0.apply(this, arguments);
    if (had && s && s.value === 'OVSEL' && !_ovSecs.length) { s.value = MYV; var a = $('app'); if (a && a.querySelector('.intro-card')) renderIntro(); }
    return r;
  };

  // ---- small shared bits -------------------------------------------------------------------------
  var TILES = [
    ['ms-drill', 'drill', 'Drill', 'Cards one at a time. You mark yourself ✗ ~ ✓.'],
    ['ms-speed', 'speed', 'Speed Challenge', 'Race the clock, solo or in teams.'],
    ['ms-spell', 'spell', 'Spell', 'Hear it and write it. Accents count.'],
    ['ms-match', 'match', 'Match', 'Pair six English and foreign ones against the clock.'],
    ['ms-leis', 'leis', 'Leisure Mode', 'Just press play and let it all wash over you.'],
    ['ms-test', 'test', 'Test', 'A test to print or do on screen. Answers stay hidden.']
  ];
  function tileHtml(x, off, desc, act) {
    return '<button class="ms-tile ' + x[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + act + '"><img class="ms-img" alt="" src="' + icon(x[1]) + '"><span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + desc + '</span></span></button>';
  }
  function step(n, t) { return '<div class="ms-step"><span class="ms-num">' + n + '</span>' + t + '</div>'; }
  function myBox(m, n, dc, on) {
    var fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']];
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (n || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apMySetUse()" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note" style="min-width:auto">' + n + ' ' + (n === 1 ? m.one : m.many) + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apMySetHelp()">? How does this work?</button></div>'
      + (n || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apMySetEdit()">✎ Edit</button><button class="ms-b sm" onclick="apMySetLink()">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (m.S.f === x[0] ? ' on' : '') + '" onclick="apMySetFilter(\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (m.note || !n ? '<div class="ms-note">' + (m.note ? '<b>' + esc(m.note) + '</b> ' : '') + (!n ? 'Empty so far. Anything you mark ✗ Major error in any drill joins it automatically.' : '') + '</div>' : '') + '</div>';
  }
  function wordsSummary() {
    var lv = 'Mixed', im = 'All words';
    try { if (!cogAll()) lv = COG_BANDS.filter(function (x) { return cogOn.indexOf(x[0]) >= 0; }).map(function (x) { return x[1]; }).join(' + '); } catch (e) { }
    try { if (vtOn !== 'ALL') im = VT_DEF.filter(function (x) { return x[0] === vtOn; })[0][1]; } catch (e) { }
    return 'Level: ' + lv + ' · Importance: ' + im;
  }
  function settingsSummary() {
    var f = getLangFrom(), t = getLangTo();
    var dir = mixOn() ? 'English ↔ ' + LANG_NAMES[mixTarget()] + (mixIsRec() ? ', by importance' : ', mixed ' + mixNums()) : LANG_NAMES[f] + ' → ' + LANG_NAMES[t];
    return (_selectedCount === -1 ? 'All cards' : _selectedCount + ' cards') + ' · ' + timerSecs + 's a card · ' + dir;
  }
  var setOpen = false, wordsOpen = false;

  // ---- VOCAB HOME ---------------------------------------------------------------------------------
  var ri = renderIntro;
  renderIntro = function () {
    ensureOpt();
    ri.apply(this, arguments);
    var app = $('app'); if (!app) return;
    var card = app.querySelector('.intro-card'); if (!card || card.getAttribute('data-ms')) return;
    // the Generate Test panel may have been placed inside the old card: put it back before the card is rebuilt
    var P = $('igcseTestPanel'), mainEl = document.querySelector('main'), edm = $('vocabEditorModal'), panelOpen = !!(P && P.style.display === 'block');
    if (P && mainEl && edm && P.parentNode !== mainEl) mainEl.insertBefore(P, edm);
    card.setAttribute('data-ms', '1');
    var sel = $('sel-section'), my = !!(sel && sel.value === MYV), n = ids(V).length, dc = dueCount(V);
    var pool = getSelectedPhrases().length, chosen = pool > 0, usable = chosen;
    var B = { head: [], dir: [], mix: [], lists: [], cog: [], vt: [], cards: [], timer: [], stack: null, keys: null }, cur = 'head';
    [].slice.call(card.children).forEach(function (e) {
      var t = e.classList.contains('aph-label') ? e.textContent.trim() : '';
      if (e.tagName === 'H2') { B.head.push(e); return; }
      if (e.classList.contains('aph-banner')) return;
      if (e.classList.contains('aph-stack')) { B.stack = e; cur = 'x'; return; }
      if (e.classList.contains('aph-keys')) { B.keys = e; cur = 'x'; return; }
      if (e.classList.contains('cog-row')) { B.cog.push(e); cur = 'x'; return; }
      if (e.classList.contains('vt-row')) { B.vt.push(e); cur = 'x'; return; }
      if (/^Direction by importance/i.test(t)) cur = 'mix'; else if (/^Direction/i.test(t)) cur = 'dir'; else if (/^Lists/i.test(t)) cur = 'lists'; else if (/^Cards per session/i.test(t)) cur = 'cards'; else if (/^Timer per card/i.test(t)) cur = 'timer';
      if (B[cur]) B[cur].push(e);
    });
    if (!B.stack || !B.lists.length) return;
    B.lists = B.lists.filter(function (e) { return !e.classList.contains('aph-label'); });
    var edit = [].slice.call(B.stack.querySelectorAll('.aph-tools')).filter(function (e) { return e.querySelector('[onclick^="showEWsPracticePdf"]'); })[0];
    var setDet = document.createElement('details'); setDet.className = 'ms-opts'; setDet.id = 'ms-set'; setDet.open = setOpen; setDet.addEventListener('toggle', function () { setOpen = setDet.open; });
    setDet.innerHTML = '<summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small id="ms-setsum">' + esc(settingsSummary()) + '</small><span class="ms-chg"></span></summary>';
    B.dir.concat(B.mix, B.cards, B.timer).forEach(function (e) { setDet.appendChild(e); });
    var wDet = document.createElement('details'); wDet.className = 'ms-opts'; wDet.id = 'ms-words'; wDet.open = wordsOpen; wDet.addEventListener('toggle', function () { wordsOpen = wDet.open; });
    wDet.innerHTML = '<summary><span class="ms-gear">🎯</span><span class="ms-st">Narrow the words</span><small>' + esc(wordsSummary()) + '</small><span class="ms-chg"></span></summary>';
    B.cog.concat(B.vt).forEach(function (e) { wDet.appendChild(e); });
    var tiles = TILES.map(function (x) {
      var off = !usable, d = x[3], act;
      if (x[1] === 'speed') { act = 'openVocabChallenge()'; if (my) { off = true; d = 'Works on whole lists, so not on a personalised set.'; } }
      else if (x[1] === 'drill') act = 'introStartDrill()';
      else if (x[1] === 'spell') act = 'apSpell()';
      else if (x[1] === 'match') { act = 'apMatch()'; d = 'Pair six English and ' + LANG_NAMES[V.foreign()] + ' words against the clock.'; }
      else if (x[1] === 'leis') act = 'introStartLeisure()';
      else { act = 'showIGCSEFullTestPanel()'; if (my) { /* tests draw from the words chosen: fine on the personalised set */ } }
      if (x[1] === 'test') off = !usable;
      return tileHtml(x, off, d, act);
    }).join('');
    while (card.firstChild) card.removeChild(card.firstChild);
    B.head.forEach(function (e) { card.appendChild(e); });
    card.insertAdjacentHTML('beforeend', step(1, 'What do you want to practise?'));
    var wrap = document.createElement('div'); wrap.className = 'ms-listsrow' + (chosen ? ' ms-chosen' : ''); B.lists.forEach(function (e) { wrap.appendChild(e); }); card.appendChild(wrap);
    card.insertAdjacentHTML('beforeend', myBox(V, n, dc, my));
    card.insertAdjacentHTML('beforeend', '<div class="ms-now">' + (!chosen ? (my ? 'Your personalised set has no words that fit the Level and Importance chosen.' : 'Choose your lists (or your personalised set) above to unlock the ways to practise them.') : '') + '</div>');
    card.appendChild(wDet);
    card.insertAdjacentHTML('beforeend', step(2, 'How do you want to practise it?'));
    card.appendChild(setDet);
    card.insertAdjacentHTML('beforeend', '<div class="aph-tools ms-tiles ih-pair">' + tiles + '</div>');
    var vr = document.createElement('div'); vr.className = 'ms-viewrow';
    vr.innerHTML = '<span class="aph-note" style="margin:0">Just want to read or print the lists?</span><button class="aph-btn aph-btn-sm"' + (chosen && !my ? '' : ' disabled') + ' onclick="apMsView(0)">📖 View</button><button class="aph-btn aph-btn-sm"' + (chosen && !my ? '' : ' disabled') + ' onclick="apMsView(1)">🖨 Print / PDF</button>';
    card.appendChild(vr);
    if (edit) card.appendChild(edit);
    if (B.keys) card.appendChild(B.keys);
    if (panelOpen && P) { P.style.display = 'none'; try { showIGCSEFullTestPanel(); } catch (e) { } }
  };
  // View / Print work from the lists ticked in Choose lists
  window.apMsView = function (print) {
    var s = $('sel-section');
    if (s && s.value !== 'OVSEL' && s.value !== MYV) { try { _ovSecs = window.__voc.current(); _ovSave(); } catch (e) { } }
    if (!_ovSecs.length) { openListOverview(true); return; }
    if (print) ovPrint(); else ovView();
  };
  function refreshSums() { var e = $('ms-setsum'); if (e) e.textContent = settingsSummary(); }
  ['introOnDirChange', 'adjustTimer', 'setSelectedCount'].forEach(function (n) {
    var f = window[n]; if (typeof f !== 'function') return;
    window[n] = function () { var r = f.apply(this, arguments); try { refreshSums(); } catch (e) { } return r; };
  });

  // ---- GR EWs HOME --------------------------------------------------------------------------------
  var gl0 = ggLoadState;
  ggLoadState = function () { ggS.my = false; return gl0.apply(this, arguments); };
  ggS.my = false;
  var gSelKeys0 = ggSelKeys;
  ggSelKeys = function () {
    if (!ggS.my) return gSelKeys0.apply(this, arguments);
    var S = G.S.c; return ggOrder().filter(function (k) { return GGD[k].items.some(function (it) { return S[it.id]; }); });
  };
  var gPool0 = ggPool;
  ggPool = function (keys) {
    var p = gPool0.apply(this, arguments);
    if (!ggS.my) return p;
    var mine = {}; myPool(G).forEach(function (it) { mine[it.id] = 1; });
    return p.filter(function (it) { return mine[it.id]; });
  };
  var gLab0 = ggSelLabel;
  ggSelLabel = function (keys) { return ggS.my ? '★ My personalised set' : gLab0.apply(this, arguments); };
  ggNeedSel = function () {
    if (ggSelKeys().length) return false;
    var e = $('ggSel');
    if (e) { e.scrollIntoView({ behavior: 'smooth', block: 'start' }); e.classList.remove('gg-flash'); void e.offsetWidth; e.classList.add('gg-flash'); }
    return true;
  };
  // a hand-made chapter choice replaces the personalised set
  ['ggPickTog', 'ggTickSet', 'ggComboAll', 'ggClear'].forEach(function (n) {
    var f = window[n]; window[n] = function () { ggS.my = false; return f.apply(this, arguments); };
  });
  var gBar0 = ggPickBarHtml;
  ggPickBarHtml = function () {
    if (!ggS.my) return gBar0.apply(this, arguments);
    var k = myPool(G).length;
    return '<span class="gg-selsum">★ <b>My personalised set</b> · ' + k + ' item' + (k === 1 ? '' : 's') + '</span><button class="gg-mini gg-clear" onclick="ggClear()">✕ Clear</button>';
  };
  ggGoHtml = function () { return ''; };
  var gFill0 = ggPickFill;
  ggPickFill = function () {
    gFill0.apply(this, arguments);
    var s = $('ggSel'); if (s) s.classList.toggle('ms-my', !!ggS.my);
  };
  var gTestOpen = false;
  function gNarrowSum() { return 'Level: ' + (ggS.lvl === 'all' ? 'Mixed' : GG_LVL_NAME[ggS.lvl]) + ' · Items: ' + (GG_TYPES.filter(function (t) { return t[0] === ggS.type; })[0] || ['', 'All'])[1].replace(/^[^A-Za-z]+/, ''); }
  function gNarrowInner() {
    return '<div class="aph-label">Level</div><div class="gg-chips">' + ggLvlRow('ggRefreshAct()') + '</div><div class="gg-hint">Easy = one form or a short sentence · Medium = a short sentence or one verb in full · Hard = a trickier grammar point · Mixed = everything.</div>'
      + '<div class="aph-label">Item type</div><div class="gg-chips">' + ggTypeRow('ggRefreshAct()') + '</div>';
  }
  function gMyHtml() { return myBox(G, inSet(G).length, dueCount(G), !!ggS.my); }
  ggActHtml = function () {
    var keys = ggSelKeys(), has = keys.length > 0, pool = has ? ggPool(keys) : [], usable = has && pool.length > 0;
    var tr = G.pool(), canPair = usable && G.pairPool().length >= 3, canSpell = usable && tr.length > 0;
    var h = '<div class="ms-now">' + (!has ? (ggS.my ? 'Your personalised set is empty so far.' : 'Choose your chapters above to unlock the ways to practise them.') : (!usable ? 'No items match the Level and Item type chosen. Change them under Narrow the items.' : 'Practising: <b>' + esc(ggSelLabel(keys)) + '</b> · ' + pool.length + ' item' + (pool.length === 1 ? '' : 's'))) + '</div>';
    var LN = GGL().lang;
    h += '<div class="aph-tools ms-tiles">'
      + tileHtml(TILES[0], !usable, TILES[0][3], 'ggStart()')
      + tileHtml(TILES[1], !usable || ggS.my, ggS.my ? 'Works on whole chapters, so not on a personalised set.' : TILES[1][3], 'openGgChallenge()')
      + tileHtml(TILES[2], !canSpell, canSpell || !usable ? 'Hear the ' + LN + ' sentence and write it. Accents count.' : 'Needs translation items: set Item type to All or Translations.', 'apSpell()')
      + tileHtml(TILES[3], !canPair, canPair || !usable ? 'Pair six English and ' + LN + ' sentences against the clock.' : 'Needs at least three translation items in your chapters.', 'apMatch()')
      + tileHtml(TILES[5], !usable, TILES[5][3], 'apGTest()')
      + '</div>';
    h += '<div class="ms-testrow" id="ggTestRow" style="display:' + (gTestOpen && usable ? 'flex' : 'none') + '"><b>Test</b>'
      + '<button class="aph-btn" onclick="ggTestMenu()">&#128221; Generate Test <small>(print / PDF)</small></button><button class="aph-btn" onclick="ggSpotMenu()">&#128424; Paper Spot Test <small>(print / PDF)</small></button><button class="aph-btn aptt-btn" onclick="apttLevel(\'gg\',function(){ggSpotMenu(true)})">✍ Submitted Spot Test</button></div>';
    var rc = ggRecapEntry().replace(' · choose chapters above, or on the next page', ' · choose chapters above');
    h += '<div class="ms-recap"><div class="aph-note" style="margin:0 0 6px">Just want to read the grammar?</div>' + rc
      + '<button class="gg-rcopen"' + (has ? '' : ' disabled') + ' onclick="ggRecapPdf()"><span class="gg-rcopen-ic">📄</span><span class="gg-rcopen-t"><b>Recap as a PDF</b><small>Print or save the recap of your chapters as a PDF</small></span><span class="gg-rbar-ar">▶</span></button></div>';
    h += '<div class="aph-keys"><span><span class="aph-key bad">&#8592;</span>major error</span><span><span class="aph-key near">&#8595;</span>nearly</span><span><span class="aph-key ok">&#8594;</span>got it</span></div>';
    return h;
  };
  window.apGTest = function () { gTestOpen = !gTestOpen; ggRefreshAct(); var r = $('ggTestRow'); if (r && gTestOpen) r.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  ggRefreshAct = function () {
    var a = $('ggAct'); if (a) a.innerHTML = ggActHtml();
    var m = $('ggMy'); if (m) m.innerHTML = gMyHtml();
    var nr = $('ggNarrowIn'); if (nr) nr.innerHTML = gNarrowInner();
    var ns = $('ggNarrowSum'); if (ns) ns.textContent = gNarrowSum();
    var s = $('ggSel'); if (s) s.classList.toggle('ms-my', !!ggS.my);
  };
  ggHome = function () {
    ggS.drill = null; ggS.stage = 'pick';
    var el = $('ggApp'); if (!el) return;
    var edit = (typeof editModeUnlocked !== 'undefined' && editModeUnlocked)
      ? '<div class="gg-editbar">✏️ Edit mode: reveal any card and click <b>✎ Edit</b> to change it. <button onclick="ggExport()">⬇ Export HTML</button></div>' : '';
    el.innerHTML = ggSwitchHtml(ggLang) + '<div class="gg-wrap">'
      + '<div class="aph-card gg-setup ms-card">'
      + '<h2 class="aph-h gg-h">' + GGL().flag + ' ' + GGL().name + '</h2><div class="gg-sub">' + GGL().sub + '</div>'
      + step(1, 'What do you want to practise?')
      + ggPicker().replace('<div class="gg-pick-h">① Choose your chapters</div>', '')
      + '<div id="ggMy">' + gMyHtml() + '</div>'
      + '<details class="ms-opts" id="ggNarrow"><summary><span class="ms-gear">🎯</span><span class="ms-st">Narrow the items</span><small id="ggNarrowSum">' + esc(gNarrowSum()) + '</small><span class="ms-chg"></span></summary><div id="ggNarrowIn">' + gNarrowInner() + '</div></details>'
      + step(2, 'How do you want to practise it?')
      + '<div id="ggAct">' + ggActHtml() + '</div>' + edit
      + '</div>'
      + '<div id="ggTestOut"></div>'
      + '</div>';
    ggPickFill(true); ggPickScroll(); ggRefreshAct();
  };

  // ---- shared handlers (both homes) ---------------------------------------------------------------
  function redraw() { var m = M(); if (m.kind === 'g' ? !!document.querySelector('#ggApp .gg-setup') : !!document.querySelector('#app .intro-card')) m.redraw(); }
  window.apMySetUse = function () {
    if (isGr()) { ggS.my = true; ggHome(); return; }
    var s = $('sel-section'); ensureOpt(); if (s) s.value = MYV; renderIntro();
  };
  window.apMySetFilter = function (f) { var m = M(); m.S.f = f; save(m); if (m.kind === 'g') ggRefreshAct(); else renderIntro(); };

  // ---- overlays
  var keyH = null, mt = null;
  function ov(inner) { closeOv(); if (isGr()) { var mk = document.createElement('i'); mk.id = 'apgg-overlay'; mk.setAttribute('data-ms', '1'); mk.hidden = true; document.body.appendChild(mk); }   // tells the Gr EWs keyboard handler to keep its hands off while this panel is open
    var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ms-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild; }
  function closeOv() { var o = $('ms-ov'); if (o) o.remove(); var mk = $('apgg-overlay'); if (mk && mk.getAttribute('data-ms')) mk.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } try { speechSynthesis.cancel(); } catch (e) { } }
  window.apMsClose = function () { closeOv(); redraw(); };
  function head(t, sub) { return '<div class="ms-head"><h2>' + t + '</h2><button class="ms-x" onclick="apMsClose()" aria-label="Close">✕</button></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apMsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }

  window.apMySetHelp = function () {
    var m = M(), w = m.many;
    ov(head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the ' + w + ' you find hardest. You do not have to build it: the app does it for you.</p>'
      + '<p><b>How do ' + w + ' get in?</b> Do any drill. Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> choose <b>★ My personalised set</b>. Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell, Match' + (m.kind === 'v' ? ', Leisure Mode' : '') + ' or Test, exactly as normal but only on your tricky ' + w + '.</p>'
      + '<p><b>Hard, Tricky, Easier.</b> Every ✗ card goes in as Hard. Press <b>✎ Edit</b> to change a level or take ' + (m.kind === 'v' ? 'a word' : 'an item') + ' out. Then you can practise just the Hard ones.</p>'
      + '<p><b>Due today.</b> A card you missed comes back after 1 day, then 3 days, then 7. Get it right each time and it stops coming back.</p>'
      + '<p><b>Keep it safe.</b> Press <b>🔗 Save my personalised set</b>, copy the link and paste it into OneNote. Tap that link on any device and your set is back. It is also kept on this iPad, but the link is the safe copy.</p></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apMsClose()">Got it</button></div>');
    keys(function () { return false; });
  };

  // ---- Edit
  window.apMySetEdit = function () { editView(); };
  function cut(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function editView() {
    var m = M(), rows = inSet(m).sort(function (a, b) { return (m.S.c[m.id(b)].l || 2) - (m.S.c[m.id(a)].l || 2); });
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' }, L = m.foreign();
    ov(head('✎ Personalised set', 'Tap a level to change it. ✕ takes ' + (m.kind === 'v' ? 'a word' : 'an item') + ' out. ' + rows.length + ' ' + m.many + '.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (p) { var k = m.id(p), l = m.S.c[k].l || 2; return '<div class="ms-li"><div><div class="f">' + esc(cut(m.kind === 'v' ? m.show(p, L) : m.show(p, 'fr'), 110)) + '</div><div class="e">' + esc(cut(m.show(p, 'en'), 110)) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" onclick="apMsLv(\'' + k + '\')">' + lv[l] + '</button><button class="ms-lv" onclick="apMsDel(\'' + k + '\')" aria-label="Remove">✕</button></div></div>'; }).join('') : '<div class="ms-note">Nothing here yet.</div>') + '</div>');
    keys(function () { return false; });
  }
  function redo() { var y = $('ms-ov').scrollTop; editView(); $('ms-ov').scrollTop = y; }
  window.apMsLv = function (k) { var m = M(), l = m.S.c[k].l || 2; m.S.c[k].l = l === 3 ? 1 : l + 1; save(m); redo(); };
  window.apMsDel = function (k) { var m = M(); delete m.S.c[k]; delete m.S.due[k]; save(m); redo(); };

  // ---- Save / open link
  function linkText(m) {
    var base = location.href.replace(/[#?].*$/, '');
    return base + m.hash + ids(m).map(function (k) { return k + '~' + (m.S.c[k].l || 2); }).join(',') + (m.kind === 'g' ? '&l=' + ggLang : '');
  }
  window.apMySetLink = function () {
    var m = M(), n = ids(m).length;
    ov(head('🔗 Save my personalised set') + (n ? '<p class="ms-note" style="font-size:1rem">Paste this link into OneNote. Opening it, on any device, brings back these ' + n + ' ' + m.many + '. It is also kept on this iPad automatically.</p><textarea id="ms-link" class="ms-ta" readonly>' + esc(linkText(m)) + '</textarea><div class="ms-cen"><button class="ms-b pri" onclick="apMsCopy()">Copy link</button></div><div class="ms-note" id="ms-copied" style="text-align:center"></div>' : '<p class="ms-note" style="font-size:1rem">Nothing to save yet. Mark some cards ✗ in a drill first.</p>'));
    keys(function () { return false; });
    var t = $('ms-link'); if (t) { t.focus(); t.select(); }
  };
  window.apMsCopy = function () {
    var t = $('ms-link'), mm = $('ms-copied'); t.focus(); t.select();
    var done = function () { mm.textContent = 'Copied. Now paste it into OneNote.'; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t.value).then(done, function () { document.execCommand('copy'); done(); }); return; } } catch (e) { }
    try { document.execCommand('copy'); done(); } catch (e) { mm.textContent = 'Press and hold the link, then choose Copy.'; }
  };
  function addFrom(m, body) {
    var got = 0, miss = 0, have = {}; m.all().forEach(function (x) { have[m.id(x)] = 1; });
    body.split(',').forEach(function (x) {
      var a = x.split('~'); if (a.length < 2) return;
      var lvl = parseInt(a[a.length - 1], 10); if (!(lvl >= 1 && lvl <= 3)) lvl = 2;
      var k = a.length >= 3 ? a.slice(0, -1).join('~') : a[0];
      if (!have[k]) { miss++; return; } var o = m.S.c[k]; m.S.c[k] = { l: Math.max(o ? o.l || 1 : 1, lvl) }; if (!m.S.due[k]) m.S.due[k] = { b: 0, d: today() }; got++;
    });
    m.S.f = 'all'; save(m);
    m.note = got + ' ' + (got === 1 ? m.one : m.many) + ' loaded' + (miss ? ' (' + miss + ' no longer in the list)' : '') + '.';
    return got;
  }
  function openFromHash() {
    var h = location.hash || '', mv = /^#vset=([^&]*)/.exec(h), mg = /^#gset=([^&]*)(?:&l=(fr|it|es))?/.exec(h);
    if (mv) {
      addFrom(V, mv[1]);
      try { if (isGr()) ggGoVocab(); } catch (e) { }
      var s = $('sel-section'); ensureOpt(); if (s) s.value = MYV;
      if ($('app')) { renderIntro(); window.scrollTo(0, 0); }
    } else if (mg) {
      var l = mg[2] && GG_LANGS[mg[2]] ? mg[2] : 'fr';
      try { ggGoGr(l); } catch (e) { return; }
      addFrom(G, mg[1]); ggS.my = true; ggHome(); window.scrollTo(0, 0);
    }
  }
  if (document.readyState === 'complete') setTimeout(openFromHash, 500); else window.addEventListener('load', function () { setTimeout(openFromHash, 500); });
  window.addEventListener('hashchange', openFromHash);

  // #voc=V2+V4 links: land on the chosen lists with the ways to practise them showing (the Choose lists panel is still one tap away)
  var vocFix = function () {
    var m = /^#voc=([^&]+)/.exec(location.hash || ''); if (!m) return;
    setTimeout(function () {
      try { var md = $('ov-modal'); if (md && md.style.display === 'block') { _ovFromHome = false; md.style.display = 'none'; document.documentElement.style.overflow = ''; } } catch (e) { }
      try { var a = $('app'); if (a && a.querySelector('.intro-card')) { renderIntro(); window.scrollTo(0, 0); } } catch (e) { }
    }, 450);
  };
  window.addEventListener('hashchange', vocFix);
  if (document.readyState === 'complete') setTimeout(vocFix, 350); else window.addEventListener('load', function () { setTimeout(vocFix, 350); });

  // ---- Spell
  var sp = null;
  function pickPool() {
    var m = M(), pool = m.pool();
    if (!pool.length) { alert(m.kind === 'g' ? 'Spell needs translation items: choose chapters first, and set Item type to All or Translations.' : 'Choose your lists first.'); return null; }
    var n = m.kind === 'v' ? (_selectedCount > 0 ? Math.min(_selectedCount, pool.length) : pool.length) : Math.min(10, pool.length);
    return { pool: pool, n: n, m: m };
  }
  window.apSpell = function () {
    var p = pickPool(); if (!p) return;
    sp = { d: shuffle(p.pool).slice(0, p.n), i: 0, ok: 0, near: 0, bad: 0, miss: [], rev: false, label: p.m.label(), m: p.m, L: p.m.foreign() };
    spCard();
  };
  function spCard() {
    if (sp.i >= sp.d.length) return spEnd();
    var c = sp.d[sp.i]; sp.rev = false;
    ov(head('✍ Spell', esc(sp.label) + ' · card ' + (sp.i + 1) + ' of ' + sp.d.length) + '<div class="ms-bar"><div style="width:' + Math.round(sp.i / sp.d.length * 100) + '%"></div></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpListen()">🔊 Listen</button><button class="ms-b" onclick="apSpHint()">Show meaning</button></div>'
      + '<div class="ms-big" id="ms-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(sp.m.eText(c)) + '</div>'
      + '<textarea id="ms-in" class="ms-in" rows="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="' + sp.L + '" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpCheck()">Check</button></div><div id="ms-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apSpCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apSpMark('bad'); return true; } if (e.key === 'ArrowDown') { apSpMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apSpMark('ok'); return true; }
      return false;
    });
    apSpListen(); var i = $('ms-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  }
  window.apSpListen = function () { sp.m.hear(sp.d[sp.i]); };
  window.apSpHint = function () { var m = $('ms-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  window.apSpCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm($('ms-in').value), ans = sp.m.fText(c).replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/) : [], bad = 0, acc = 0;
    var words = ans.split(/\s+/).map(function (w) {
      var k = w.toLowerCase(); if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      var kw = k.replace(/[,.;:!?]+$/, '');
      if (tw.indexOf(k) >= 0 || tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(k) || noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc && tw.length === ans.split(/\s+/).length ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    $('ms-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + '<div class="ms-note" style="text-align:center">' + esc(sp.m.eText(c)) + '</div>'
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apSpMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apSpMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apSpMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = $('ms-in'); if (i) i.blur();
  };
  window.apSpMark = function (r) {
    var c = sp.d[sp.i]; record(sp.m, c, r); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length, m = sp.m;
    ov(head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(cut(m.fText(c), 110)) + '</div><div class="e">' + esc(cut(m.eText(c), 110)) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apSpell()">↻ Again</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
    keys(function () { return false; });
  }

  // ---- Match (six pairs)
  var mm = null;
  window.apMatch = function () {
    var m = M(), L = m.foreign(), seen = {}, u = [];
    m.pairPool().forEach(function (c) { var a = m.eText(c).toLowerCase(), b = m.fText(c).toLowerCase(); if (!a || !b || seen[a] || seen['f' + b]) return; seen[a] = seen['f' + b] = 1; u.push(c); });
    if (u.length < 3) { alert('Match needs at least 3 different ' + m.many + ' in the selection.'); return; }
    var d = shuffle(u).slice(0, 6);
    mm = { d: d, m: m, L: L, en: shuffle(d.map(function (_, i) { return i; })), fr: shuffle(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: m.label() };
    var fs = m.kind === 'g' ? ' style="font-size:.9375rem"' : '';
    ov(head('🧩 Match', esc(mm.label) + ' · tap an English one, then its ' + LANG_NAMES[L]) + '<div class="ms-time" id="ms-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t"' + fs + ' id="ms-e' + i + '" onclick="apMatchTap(\'e\',' + i + ')">' + esc(m.eText(d[i])) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t"' + fs + ' id="ms-f' + i + '" onclick="apMatchTap(\'f\',' + i + ')">' + esc(m.fText(d[i])) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" id="ms-mnote" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = $('ms-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apMatchTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = $('ms-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') { try { mm.m.hear(mm.d[i]); } catch (e) { } }
    if (!mm.sel || mm.sel.side === side) { if (mm.sel) { var o = $('ms-' + mm.sel.side + mm.sel.i); if (o) o.classList.remove('sel'); } mm.sel = { side: side, i: i }; el.classList.add('sel'); return; }
    var a = mm.sel; mm.sel = null; var ae = $('ms-' + a.side + a.i); var ei = side === 'e' ? i : a.i, fi = side === 'f' ? i : a.i;
    if (ei === fi) { ae.classList.remove('sel'); ae.classList.add('done'); el.classList.add('done'); mm.done++; if (mm.done === mm.d.length) matchEnd(); }
    else { mm.pen += 3; ae.classList.remove('sel'); ae.classList.add('bad'); el.classList.add('bad'); setTimeout(function () { ae.classList.remove('bad'); el.classList.remove('bad'); }, 600); }
  };
  function matchEnd() {
    clearInterval(mt); mt = null; var t = (Date.now() - mm.t0) / 1000 + mm.pen, best = null, nb = false, BEST = 'apig' + mm.m.kind + '_match_best';
    if (mm.d.length === 6) { try { best = parseFloat(localStorage.getItem(BEST)); if (isNaN(best) || t < best) { localStorage.setItem(BEST, String(t)); nb = best != null && !isNaN(best); best = t; } } catch (e) { } }
    setTimeout(function () {
      ov(head('🧩 Match · done') + '<div class="ms-big">' + t.toFixed(1) + ' seconds</div><div class="ms-note" style="text-align:center;font-size:1rem">' + (mm.pen ? (mm.pen / 3) + ' wrong pair' + (mm.pen === 3 ? '' : 's') + ' (+' + mm.pen + ' s). ' : 'No wrong pairs. ') + (best != null ? (nb ? 'New best time! ' : '') + 'Best on this iPad: ' + best.toFixed(1) + ' s.' : '') + '</div>'
        + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apMatch()">↻ Another 6</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
      keys(function () { return false; });
    }, 500);
  }

  // ---- first draw (the main script drew before this block was added)
  try { ensureOpt(); } catch (e) { }
  try { if (isGr()) { if ($('ggApp').querySelector('.gg-setup')) ggHome(); } else if (document.querySelector('#app .intro-card')) renderIntro(); } catch (e) { }
})();
