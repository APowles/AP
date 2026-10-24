(function () {
  'use strict';
  // Set-up screens for the A Level VVs / Gr EWs / Translation app: Gr EWs, Grammar Drills and Metalanguage Formulae.
  // Two steps (What do you want to practise? / How do you want to practise it?), nothing preselected, picture tiles,
  // a personalised set for each, and on-screen test answers behind "Show answers".
  var ICONS = {};
  var PSV = 'apps';
  function $(i) { return document.getElementById(i); }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function h53(str) { var h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (var i = 0, c; i < str.length; i++) { c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return 4294967296 * (2097151 & h2) + (h1 >>> 0); }
  function hid(s) { return (h53(s) % 2821109907456).toString(36).padStart(8, '0'); }
  function load(key) { var S = { c: {}, due: {}, f: 'all' }; try { var raw = JSON.parse(localStorage.getItem(key) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { } return S; }
  function keyNum(k) { return parseInt(String(k).replace(/\D/g, ''), 10) || 0; }
  function chapKeys() { return Object.keys(GR_EWS_DATA).sort(function (a, b) { return keyNum(a) - keyNum(b); }); }
  function same(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }

  // ---- the three sets (Gr EWs items, grammar sentences, metalanguage formulae) --------------------------------
  var idMap = (typeof WeakMap === 'function') ? new WeakMap() : null;
  function memo(o, f) { if (!idMap) return f(); var v = idMap.get(o); if (v == null) { v = f(); idMap.set(o, v); } return v; }
  var GE = {
    kind: 'e', one: 'item', many: 'items', key: 'apge_myset_v1', hash: '#geset=', note: '', S: null, flow: 'Gr EWs',
    sel: [], my: false, chapOpen: true, narrowOpen: false, testOpen: false, q: '', lastKey: null,
    id: function (it) { return it.id; },
    all: function () { var o = []; chapKeys().forEach(function (k) { GR_EWS_DATA[k].items.forEach(function (it) { o.push(it); }); }); return o; },
    foreign: function () { return 'fr'; }, lcode: function () { return 'fr'; },
    fText: function (it) { return plain(it.fr).split(/ \/ | \(also/)[0].trim(); },
    eText: function (it) { return plain(it.en); },
    show: function (it, l) { return l === 'en' ? plain(it.en) : plain(it.fr); },
    hear: function (it) { speak(plain(it.fr), 'fr'); },
    chosen: function () { return this.my ? myPool(this).length > 0 : this.sel.length > 0; },
    base: function () { var o = []; if (this.my) return myPool(this); this.sel.forEach(function (k) { if (GR_EWS_DATA[k]) GR_EWS_DATA[k].items.forEach(function (it) { o.push(it); }); }); return o; },
    drillPool: function () { return grEwsApplyTypeFilter(this.base()); },
    pool: function () { return this.drillPool().filter(function (it) { return it.type === 'translate'; }); },
    pairPool: function () { return this.pool().filter(function (it) { return GE.fText(it).length <= 80 && GE.eText(it).length <= 80; }); },
    label: function () { return this.my ? 'My personalised set' : this.sel.map(function (k) { return 'Gr ' + keyNum(k); }).join(' + '); },
    redraw: function () { renderGrEws(); }, max: 80
  };
  var GDs = {
    kind: 'd', one: 'sentence', many: 'sentences', key: 'apgd_myset_v1', hash: '#gdset=', note: '', S: null,
    my: false, chapOpen: true, narrowOpen: false, setOpen: false, q: '',
    id: function (s) { return memo(s, function () { return hid((s.en || '') + '|' + (s.fr || '')); }); },
    all: function () { var o = []; GR_SETS.forEach(function (st) { st.sentences.forEach(function (s) { o.push(s); }); }); return o; },
    setOf: function (s) { for (var i = 0; i < GR_SETS.length; i++) if (GR_SETS[i].sentences.indexOf(s) >= 0) return GR_SETS[i].id; return null; },
    foreign: function () { return 'fr'; }, lcode: function () { return 'fr'; },
    fText: function (s) { return plain(s.fr).split(/ \/ | \(also/)[0].trim(); },
    eText: function (s) { return plain(s.en); },
    show: function (s, l) { return l === 'en' ? plain(s.en) : plain(s.fr); },
    hear: function (s) { speak(plain(s.fr), 'fr'); },
    sel: function () { return GR_SETS.map(function (s) { return s.id; }).filter(function (k) { return grSelected.has(k); }); },
    chosen: function () { return this.my ? myPool(this).length > 0 : grSelected.size > 0; },
    pool: function () { if (this.my) return myPool(this); var o = []; GR_SETS.forEach(function (st) { if (grSelected.has(st.id)) grFilterSentences(st.sentences).forEach(function (s) { o.push(s); }); }); return o; },
    pairPool: function () { return this.pool().filter(function (s) { return GDs.fText(s).length <= 80 && GDs.eText(s).length <= 80; }); },
    label: function () { return this.my ? 'My personalised set' : (grSelected.size === GR_SETS.length ? 'All grammar sets' : GR_SETS.filter(function (s) { return grSelected.has(s.id); }).map(function (s) { return s.chip || s.title; }).join(' + ')); },
    redraw: function () { renderGrammarMenu(); }, max: 80
  };
  function mlText(x, l) { var o = x && x[l]; return o ? plain(o.display || o.real || o.original || '') : ''; }
  var ML = {
    kind: 'm', one: 'formula', many: 'formulae', key: 'apml_myset_v1', hash: '#mlset=', note: '', S: null,
    my: false, setOpen: false, testOpen: false, f: null, t: null, link: false,
    id: function (x) { return memo(x, function () { return hid(((x.en && x.en.original) || '') + '|' + ((x.fr && x.fr.original) || '')); }); },
    all: function () { return MLF_DATA; },
    foreign: function () { return mlfState.toLang !== 'en' ? mlfState.toLang : mlfState.fromLang; },
    lcode: function () { return this.foreign(); },
    fText: function (x) { return plain((x[this.foreign()] || {}).real || (x[this.foreign()] || {}).display || ''); },
    eText: function (x) { return plain((x.en || {}).real || (x.en || {}).display || ''); },
    show: function (x, l) { return mlText(x, l); },
    hear: function (x) { speak(this.fText(x), this.lcode()); },
    chosen: function () { return !!(this.f && this.t && this.f !== this.t); },
    pool: function () { var a = mlfState.fromLang, b = mlfState.toLang; var p = this.my ? myPool(this) : MLF_DATA; return p.filter(function (x) { return x[a] && x[b]; }); },
    pairPool: function () { var self = this, f = this.foreign(); return this.pool().filter(function (x) { return x.en && x[f] && self.fText(x).length <= 80 && self.eText(x).length <= 80; }); },
    label: function () { return this.my ? 'My personalised set' : (MLF_LANGS[mlfState.fromLang].label + ' → ' + MLF_LANGS[mlfState.toLang].label); },
    redraw: function () { renderMLF(); }, max: 80
  };
  GE.S = load(GE.key); GDs.S = load(GDs.key); ML.S = load(ML.key);
  var MODELS = { e: GE, d: GDs, m: ML };
  function save(m) { try { localStorage.setItem(m.key, JSON.stringify(m.S)); } catch (e) { } }
  function dueNow(m, k) { var d = m.S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function ids(m) { return Object.keys(m.S.c); }
  function inSet(m) { return m.all().filter(function (x) { return m.S.c[m.id(x)]; }); }
  function dueCount(m) { return inSet(m).filter(function (x) { return dueNow(m, m.id(x)); }).length; }
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
  function icon(k, m) { var l = m.foreign(); if (k === 'spell' || k === 'match') return ICONS[k + '_' + (l === 'it' || l === 'es' ? l : 'fr')] || ICONS[k + '_fr']; return ICONS[k]; }

  // ---- marking in any drill feeds the personalised set --------------------------------------------------------
  var mG = window.markGrEws;
  window.markGrEws = function (v) { try { record(GE, grEwsState.items[grEwsState.idx], v === 'miss' ? 'bad' : v === 'ok' ? 'ok' : ''); } catch (e) { } return mG.apply(this, arguments); };
  var mD = window.markGrammar;
  window.markGrammar = function (v) { try { record(GDs, grState.shuffled[grState.idx], v === 'miss' ? 'bad' : v === 'ok' ? 'ok' : ''); } catch (e) { } return mD.apply(this, arguments); };
  var mM = window.markMLF;
  window.markMLF = function (v) { try { record(ML, mlfState.shuffled[mlfState.idx], v === 'miss' ? 'bad' : v === 'ok' ? 'ok' : ''); } catch (e) { } return mM.apply(this, arguments); };

  // ---- shared bits ----------------------------------------------------------------------------------------------
  var TILES = {
    drill: ['ms-drill', 'Drill', 'Cards one at a time. You mark yourself ✗ ~ ✓.'],
    speed: ['ms-speed', 'Speed Challenge', 'Race the clock, solo or in teams.'],
    spell: ['ms-spell', 'Spell', 'Hear it and write it. Accents count.'],
    match: ['ms-match', 'Match', 'Pair six English and French ones against the clock.'],
    leis: ['ms-leis', 'Leisure Mode', 'Just press play and let it all wash over you.'],
    test: ['ms-test', 'Test', 'A test to print or do on screen. Answers stay hidden.']
  };
  function tile(m, k, off, desc, act) {
    var t = TILES[k];
    return '<button class="ms-tile ' + t[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + act + '"><img class="ms-img" alt="" src="' + icon(k, m) + '"><span class="ms-tx"><span class="ms-tt">' + t[1] + '</span><span class="ms-td">' + (desc || t[2]) + '</span></span></button>';
  }
  function step(n, t) { return '<div class="ms-step"><span class="ms-num">' + n + '</span>' + t + '</div>'; }
  function myBox(m, on) {
    var n = ids(m).length, dc = dueCount(m), k = m.kind;
    var fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']];
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (n || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apPs(\'' + k + '\',\'use\')" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note" style="min-width:auto">' + n + ' ' + (n === 1 ? m.one : m.many) + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apPs(\'' + k + '\',\'help\')">? How does this work?</button></div>'
      + (n || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apPs(\'' + k + '\',\'edit\')">✎ Edit</button><button class="ms-b sm" onclick="apPs(\'' + k + '\',\'link\')">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (m.S.f === x[0] ? ' on' : '') + '" onclick="apPs(\'' + k + '\',\'filter\',\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (m.note || !n ? '<div class="ms-note">' + (m.note ? '<b>' + esc(m.note) + '</b> ' : '') + (!n ? 'Empty so far. Anything you mark ✗ Major error in any drill joins it automatically.' : '') + '</div>' : '') + '</div>';
  }
  function settingsBar(id, open, summary, inner) {
    return '<details class="ms-opts" id="' + id + '"' + (open ? ' open' : '') + '><summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small>' + esc(summary) + '</small><span class="ms-chg"></span></summary>' + inner + '</details>';
  }
  function narrowBar(id, open, ttl, summary, inner) {
    return '<details class="ms-opts" id="' + id + '"' + (open ? ' open' : '') + '><summary><span class="ms-gear">🎯</span><span class="ms-st">' + ttl + '</span><small id="' + id + 'Sum">' + esc(summary) + '</small><span class="ms-chg"></span></summary><div id="' + id + 'In">' + inner + '</div></details>';
  }
  function keysLegend() { return '<div class="aph-keys"><span><span class="aph-key bad">&#8592;</span>major error</span><span><span class="aph-key near">&#8595;</span>nearly</span><span><span class="aph-key ok">&#8594;</span>got it</span></div>'; }
  function unlock(m, what) { return 'Choose ' + what + ' above (or your personalised set) to unlock the ways to practise ' + (m.kind === 'm' ? 'them' : 'them') + '.'; }

  // ---- overlays (Spell, Match, help, edit, link): each has a labelled ← Back that returns to the set-up screen ---------
  var CUR = null, keyH = null, mt = null;
  function ov(m, inner) {
    closeOv(); CUR = m;
    var mk = document.createElement('i'); mk.id = 'apps-keyguard'; mk.hidden = true; document.body.appendChild(mk);   // tells the app's keyboard handlers to keep their hands off while this panel is open
    var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ps-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild;
  }
  function closeOv() { var o = $('ps-ov'); if (o) o.remove(); var mk = $('apps-keyguard'); if (mk) mk.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } try { speechSynthesis.cancel(); } catch (e) { } }
  window.apPsClose = function () { var m = CUR; closeOv(); if (m) redraw(m); };
  function redraw(m) { try { m.redraw(); } catch (e) { } }
  function head(t, sub) { return '<div class="ps-ovback"><button class="ms-b sm" onclick="apPsClose()">← Back</button><h2>' + t + '</h2></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apPsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }
  function cut(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  window.apPs = function (kind, act, arg) {
    var m = MODELS[kind]; if (!m) return;
    if (act === 'use') { if (kind === 'e') { GE.my = true; GE.sel = []; geSync(); } else if (kind === 'd') { GDs.my = true; grSelected = new Set(); } else { ML.my = true; if (!ML.chosen()) { ML.f = ML.f || 'en'; ML.t = ML.t || 'fr'; syncMl(); } } redraw(m); return; }
    if (act === 'filter') { m.S.f = arg; save(m); redraw(m); return; }
    if (act === 'help') return help(m);
    if (act === 'edit') return editView(m);
    if (act === 'link') return linkView(m);
  };
  function help(m) {
    var w = m.many;
    ov(m, head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the ' + w + ' you find hardest. You do not have to build it: the app does it for you.</p>'
      + '<p><b>How do ' + w + ' get in?</b> Do any drill (or Spell). Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> choose <b>★ My personalised set</b>. Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell or Match, exactly as normal but only on your tricky ' + w + '.</p>'
      + '<p><b>Hard, Tricky, Easier.</b> Every ✗ card goes in as Hard. Press <b>✎ Edit</b> to change a level or take ' + (m.kind === 'm' ? 'a formula' : m.kind === 'd' ? 'a sentence' : 'an item') + ' out. Then you can practise just the Hard ones.</p>'
      + '<p><b>Due today.</b> A card you missed comes back after 1 day, then 3 days, then 7. Get it right each time and it stops coming back.</p>'
      + '<p><b>Keep it safe.</b> Press <b>🔗 Save my personalised set</b>, copy the link and paste it into OneNote. Tap that link on any device and your set is back. It is also kept on this iPad, but the link is the safe copy.</p></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apPsClose()">Got it</button></div>');
    keys(function () { return false; });
  }
  function editView(m) {
    var rows = inSet(m).sort(function (a, b) { return (m.S.c[m.id(b)].l || 2) - (m.S.c[m.id(a)].l || 2); });
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' };
    function fr(p) { return m.kind === 'm' ? mlText(p, m.foreign()) || mlText(p, 'fr') : m.show(p, 'fr'); }
    ov(m, head('✎ Personalised set', 'Tap a level to change it. ✕ takes one out. ' + rows.length + ' ' + m.many + '.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (p) { var k = m.id(p), l = m.S.c[k].l || 2; return '<div class="ms-li"><div><div class="f">' + esc(cut(fr(p), 110)) + '</div><div class="e">' + esc(cut(m.show(p, 'en'), 110)) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" onclick="apPsLv(\'' + k + '\')">' + lv[l] + '</button><button class="ms-lv" onclick="apPsDel(\'' + k + '\')" aria-label="Remove">✕</button></div></div>'; }).join('') : '<div class="ms-note">Nothing here yet.</div>') + '</div>');
    keys(function () { return false; });
  }
  function redo() { var y = $('ps-ov').scrollTop, m = CUR; editView(m); $('ps-ov').scrollTop = y; }
  window.apPsLv = function (k) { var m = CUR, l = m.S.c[k].l || 2; m.S.c[k].l = l === 3 ? 1 : l + 1; save(m); redo(); };
  window.apPsDel = function (k) { var m = CUR; delete m.S.c[k]; delete m.S.due[k]; save(m); redo(); };
  function linkText(m) { return location.href.replace(/[#?].*$/, '') + m.hash + ids(m).map(function (k) { return k + '~' + (m.S.c[k].l || 2); }).join(','); }
  function linkView(m) {
    var n = ids(m).length;
    ov(m, head('🔗 Save my personalised set') + (n ? '<p class="ms-note" style="font-size:1rem">Paste this link into OneNote. Opening it, on any device, brings back these ' + n + ' ' + m.many + '. It is also kept on this iPad automatically.</p><textarea id="ps-link" class="ms-ta" readonly>' + esc(linkText(m)) + '</textarea><div class="ms-cen"><button class="ms-b pri" onclick="apPsCopy()">Copy link</button></div><div class="ms-note" id="ps-copied" style="text-align:center"></div>' : '<p class="ms-note" style="font-size:1rem">Nothing to save yet. Mark some cards ✗ in a drill first.</p>'));
    keys(function () { return false; });
    var t = $('ps-link'); if (t) { t.focus(); t.select(); }
  }
  window.apPsCopy = function () {
    var t = $('ps-link'), mm = $('ps-copied'); t.focus(); t.select();
    var done = function () { mm.textContent = 'Copied. Now paste it into OneNote.'; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t.value).then(done, function () { document.execCommand('copy'); done(); }); return; } } catch (e) { }
    try { document.execCommand('copy'); done(); } catch (e) { mm.textContent = 'Press and hold the link, then choose Copy.'; }
  };
  function addFrom(m, body) {
    var got = 0, miss = 0, have = {}; m.all().forEach(function (x) { have[m.id(x)] = 1; });
    body.split(',').forEach(function (x) {
      var a = x.split('~'); if (a.length < 2) return;
      var lvl = parseInt(a[a.length - 1], 10); if (!(lvl >= 1 && lvl <= 3)) lvl = 2;
      var k = a.slice(0, -1).join('~');
      if (!have[k]) { miss++; return; } var o = m.S.c[k]; m.S.c[k] = { l: Math.max(o ? o.l || 1 : 1, lvl) }; if (!m.S.due[k]) m.S.due[k] = { b: 0, d: today() }; got++;
    });
    m.S.f = 'all'; save(m);
    m.note = got + ' ' + (got === 1 ? m.one : m.many) + ' loaded' + (miss ? ' (' + miss + ' no longer in the list)' : '') + '.';
    return got;
  }
  function openFromHash() {
    var h = location.hash || '', r = /^#(geset|gdset|mlset)=([^&]*)/.exec(h); if (!r) return;
    try {
      if (r[1] === 'geset') { switchMode('gr_ews'); addFrom(GE, r[2]); GE.my = true; GE.sel = []; geSync(); renderGrEws(); }
      else if (r[1] === 'gdset') { switchMode('gr'); addFrom(GDs, r[2]); GDs.my = true; grSelected = new Set(); renderGrammarMenu(); }
      else { switchMode('mlf'); addFrom(ML, r[2]); ML.my = true; ML.f = ML.f || 'en'; ML.t = ML.t || 'fr'; syncMl(); renderMLF(); }
      window.scrollTo(0, 0);
    } catch (e) { }
  }
  if (document.readyState === 'complete') setTimeout(openFromHash, 600); else window.addEventListener('load', function () { setTimeout(openFromHash, 600); });
  window.addEventListener('hashchange', openFromHash);

  // ---- Spell ---------------------------------------------------------------------------------------------------
  var sp = null;
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  window.apPsSpell = function (kind) {
    var m = MODELS[kind], pool = m.pool();
    if (!pool.length) { alert('Spell needs ' + (kind === 'e' ? 'translation items: choose chapters first, and set Item type to All or Translations.' : 'a set chosen first.')); return; }
    sp = { d: shuffle(pool).slice(0, Math.min(10, pool.length)), i: 0, ok: 0, near: 0, bad: 0, miss: [], rev: false, label: m.label(), m: m, L: m.foreign() };
    spCard();
  };
  function spCard() {
    if (sp.i >= sp.d.length) return spEnd();
    var c = sp.d[sp.i]; sp.rev = false;
    ov(sp.m, head('✍ Spell', esc(sp.label) + ' · card ' + (sp.i + 1) + ' of ' + sp.d.length) + '<div class="ms-bar"><div style="width:' + Math.round(sp.i / sp.d.length * 100) + '%"></div></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apPsListen()">🔊 Listen</button><button class="ms-b" onclick="apPsHint()">Show meaning</button></div>'
      + '<div class="ms-big" id="ps-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(sp.m.eText(c)) + '</div>'
      + '<textarea id="ps-in" class="ms-in" rows="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="' + sp.L + '" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apPsCheck()">Check</button></div><div id="ps-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apPsCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apPsMark('bad'); return true; } if (e.key === 'ArrowDown') { apPsMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apPsMark('ok'); return true; }
      return false;
    });
    apPsListen(); var i = $('ps-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  }
  window.apPsListen = function () { sp.m.hear(sp.d[sp.i]); };
  window.apPsHint = function () { var m = $('ps-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  window.apPsCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm($('ps-in').value), ans = sp.m.fText(c).replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/) : [], bad = 0, acc = 0;
    var words = ans.split(/\s+/).map(function (w) {
      var k = w.toLowerCase(); if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      var kw = k.replace(/[,.;:!?]+$/, '');
      if (tw.indexOf(k) >= 0 || tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(k) || noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc && tw.length === ans.split(/\s+/).length ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    $('ps-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + '<div class="ms-note" style="text-align:center">' + esc(sp.m.eText(c)) + '</div>'
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apPsMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apPsMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apPsMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = $('ps-in'); if (i) i.blur();
  };
  window.apPsMark = function (r) {
    var c = sp.d[sp.i]; record(sp.m, c, r); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length, m = sp.m;
    ov(m, head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(cut(m.fText(c), 110)) + '</div><div class="e">' + esc(cut(m.eText(c), 110)) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apPsSpell(\'' + m.kind + '\')">↻ Again</button></div>');
    keys(function () { return false; });
  }

  // ---- Match (six pairs) ----------------------------------------------------------------------------------------
  var mm = null;
  window.apPsMatch = function (kind) {
    var m = MODELS[kind], L = m.foreign(), seen = {}, u = [];
    m.pairPool().forEach(function (c) { var a = m.eText(c).toLowerCase(), b = m.fText(c).toLowerCase(); if (!a || !b || seen[a] || seen['f' + b]) return; seen[a] = seen['f' + b] = 1; u.push(c); });
    if (u.length < 3) { alert('Match needs at least 3 different ' + m.many + ' in the selection.'); return; }
    var d = shuffle(u).slice(0, 6), LN = (typeof MLF_LANGS !== 'undefined' && MLF_LANGS[L]) ? MLF_LANGS[L].label : 'French';
    mm = { d: d, m: m, L: L, en: shuffle(d.map(function (_, i) { return i; })), fr: shuffle(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: m.label() };
    ov(m, head('🧩 Match', esc(mm.label) + ' · tap an English one, then its ' + LN) + '<div class="ms-time" id="ps-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ps-e' + i + '" onclick="apPsTap(\'e\',' + i + ')">' + esc(m.eText(d[i])) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ps-f' + i + '" onclick="apPsTap(\'f\',' + i + ')">' + esc(m.fText(d[i])) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = $('ps-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apPsTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = $('ps-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') { try { mm.m.hear(mm.d[i]); } catch (e) { } }
    if (!mm.sel || mm.sel.side === side) { if (mm.sel) { var o = $('ps-' + mm.sel.side + mm.sel.i); if (o) o.classList.remove('sel'); } mm.sel = { side: side, i: i }; el.classList.add('sel'); return; }
    var a = mm.sel; mm.sel = null; var ae = $('ps-' + a.side + a.i); var ei = side === 'e' ? i : a.i, fi = side === 'f' ? i : a.i;
    if (ei === fi) { ae.classList.remove('sel'); ae.classList.add('done'); el.classList.add('done'); mm.done++; if (mm.done === mm.d.length) matchEnd(); }
    else { mm.pen += 3; ae.classList.remove('sel'); ae.classList.add('bad'); el.classList.add('bad'); setTimeout(function () { ae.classList.remove('bad'); el.classList.remove('bad'); }, 600); }
  };
  function matchEnd() {
    clearInterval(mt); mt = null; var t = (Date.now() - mm.t0) / 1000 + mm.pen, best = null, nb = false, BEST = 'apps_' + mm.m.kind + '_match_best';
    try { best = parseFloat(localStorage.getItem(BEST)); if (isNaN(best) || t < best) { localStorage.setItem(BEST, String(t)); nb = best != null && !isNaN(best); best = t; } } catch (e) { }
    setTimeout(function () {
      if (!mm) return;
      ov(mm.m, head('🧩 Match · done') + '<div class="ms-big">' + t.toFixed(1) + ' seconds</div><div class="ms-note" style="text-align:center;font-size:1rem">' + (mm.pen ? (mm.pen / 3) + ' wrong pair' + (mm.pen === 3 ? '' : 's') + ' (+' + mm.pen + ' s). ' : 'No wrong pairs. ') + (best != null ? (nb ? 'New best time! ' : '') + 'Best on this iPad: ' + best.toFixed(1) + ' s.' : '') + '</div>'
        + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apPsMatch(\'' + mm.m.kind + '\')">↻ Another 6</button></div>');
      keys(function () { return false; });
    }, 500);
  }

  // ===================================================================================================================
  //  GR EWs
  // ===================================================================================================================
  function geSync() { grEwsSelectedKeys = GE.sel.slice(); if (GE.sel.length) grEwsState.grKey = GE.sel[0]; GE.lastKey = grEwsState.grKey; }
  function geAdopt() {
    var k = grEwsSelectedKeys.filter(function (x) { return GR_EWS_DATA[x]; });
    if (k.length && !same(k, GE.sel)) { GE.sel = k.slice().sort(function (a, b) { return keyNum(a) - keyNum(b); }); GE.my = false; GE.chapOpen = false; }
    else if (!k.length && grEwsState.grKey && GR_EWS_DATA[grEwsState.grKey] && grEwsState.grKey !== GE.lastKey) { GE.sel = [grEwsState.grKey]; GE.my = false; GE.chapOpen = false; }
    GE.lastKey = grEwsState.grKey;
    grEwsSelectedKeys = GE.sel.slice();
  }
  function geCount() { return GE.base().length; }
  function geSummary() {
    if (GE.my) { var k = myPool(GE).length; return '★ My personalised set · ' + k + ' item' + (k === 1 ? '' : 's'); }
    if (!GE.sel.length) return 'Nothing chosen yet. Tick one or more chapters.';
    var n = GE.base().length, all = chapKeys().length === GE.sel.length;
    return (all ? 'All chapters' : GE.sel.map(function (k) { return 'Gr ' + keyNum(k); }).join(' + ')) + ' · ' + n + ' items';
  }
  function geNarrowSum() { return 'Items: ' + (grEwsTypeFilter === 'rule' ? 'Rules only' : grEwsTypeFilter === 'translate' ? 'Translations only' : 'All (rules and translations)'); }
  function geRows() {
    return chapKeys().map(function (k) {
      var d = GR_EWS_DATA[k], on = GE.sel.indexOf(k) >= 0, t = ('gr ' + keyNum(k) + ' ' + d.title).toLowerCase();
      return '<label class="ps-row' + (on ? ' on' : '') + '" data-k="' + k + '" data-t="' + esc(t) + '"><input type="checkbox"' + (on ? ' checked' : '') + ' onchange="apGeTog(\'' + k + '\')"><span class="n">Gr ' + keyNum(k) + '</span><span class="t">' + esc(d.title) + '</span><span class="c">' + d.items.length + '</span></label>';
    }).join('');
  }
  function geActHtml() {
    var has = GE.chosen(), dp = has ? GE.drillPool() : [], usable = has && dp.length > 0;
    var tr = has ? GE.pool() : [], canSpell = usable && tr.length > 0, canPair = usable && GE.pairPool().length >= 3;
    var one = GE.sel.length === 1, dAct = GE.my ? 'apGeDrillMy()' : one ? "startGrEwsDrill('" + GE.sel[0] + "')" : 'startGrEwsDrillCombo()';
    var h = '<div class="ms-now">' + (!has ? (GE.my ? 'Your personalised set is empty so far.' : unlock(GE, 'your chapters')) : (!usable ? 'No items match the Items chosen under Narrow the items. Change it there.' : 'Practising: <b>' + esc(GE.label()) + '</b> · ' + dp.length + ' item' + (dp.length === 1 ? '' : 's'))) + '</div>';
    h += '<div class="aph-tools ms-tiles">'
      + tile(GE, 'drill', !usable, null, usable ? dAct : 'apGeNone()')
      + tile(GE, 'speed', !usable || GE.my, GE.my ? 'Works on whole chapters, so not on a personalised set.' : null, 'apGeSpeed()')
      + tile(GE, 'spell', !canSpell, canSpell || !usable ? 'Hear the French sentence and write it. Accents count.' : 'Needs translation items: set Items to All or Translations.', "apPsSpell('e')")
      + tile(GE, 'match', !canPair, canPair || !usable ? 'Pair six English and French sentences against the clock.' : 'Needs at least three translation items in your chapters.', "apPsMatch('e')")
      + tile(GE, 'test', !usable || GE.my, GE.my ? 'Tests work on whole chapters, so not on a personalised set.' : null, 'apGeTest()')
      + '</div>';
    h += '<div class="ps-testrow" id="ge-testrow" style="display:' + (GE.testOpen && usable && !GE.my ? 'flex' : 'none') + '"><b>Test</b>'
      + '<button class="aph-btn" onclick="apGeSync();grEwsOpenTestPanel()">&#128221; Generate Test <small>(print / PDF)</small></button><button class="aph-btn" onclick="apGeSync();grEwsOpenSpotTestPanel()">&#128424; Paper Spot Test <small>(print / PDF)</small></button><button class="aph-btn aptt-btn" onclick="apGeSync();apttLevel(\'grews\',function(){grEwsOpenSpotTestPanel(true)})">✍ Submitted Spot Test</button></div>';
    h += '<div class="ps-read"><div class="aph-note">Just want to read the grammar?</div>' + rcpEntry('ews') + '</div>';
    h += keysLegend();
    return h;
  }
  window.apGeNone = function () { };
  window.apGeSync = function () { geSync(); };
  window.apGeSpeed = function () { geSync(); openGrChallenge(); };
  window.apGeTest = function () { GE.testOpen = !GE.testOpen; geRefresh(); var r = $('ge-testrow'); if (r && GE.testOpen) r.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  window.apGeDrillMy = function () {
    var items = shuffle(grEwsApplyTypeFilter(myPool(GE))); if (!items.length) return;
    var k0 = null; items.some(function (it) { var m = /^Gr (\d+)/.exec(it.grRef || ''); if (m && GR_EWS_DATA['gr' + m[1]]) { k0 = 'gr' + m[1]; return true; } return false; });
    grEwsState.grKey = k0 || chapKeys()[0]; GE.lastKey = grEwsState.grKey;
    grEwsState.items = items; grEwsState.idx = 0; grEwsState.correct = 0; grEwsState.nearly = 0; grEwsState.errors = []; grEwsState.revealed = false; grEwsState.comboLabel = '★ My personalised set';
    renderGrEwsCard();
  };
  window.apGeTog = function (k) {
    GE.my = false; var i = GE.sel.indexOf(k); if (i >= 0) GE.sel.splice(i, 1); else GE.sel.push(k);
    GE.sel.sort(function (a, b) { return keyNum(a) - keyNum(b); }); geSync(); geRefresh();
  };
  window.apGeAll = function () { GE.my = false; var allOn = GE.sel.length === chapKeys().length; GE.sel = allOn ? [] : chapKeys(); geSync(); geRefresh(); };
  window.apGeSearch = function (q) {
    GE.q = String(q || '').toLowerCase().trim();
    [].forEach.call(document.querySelectorAll('#ge-list .ps-row'), function (r) { r.classList.toggle('ps-hide', !!GE.q && r.getAttribute('data-t').indexOf(GE.q) < 0); });
  };
  window.apGeType = function (v) { grEwsTypeFilter = v; geRefresh(); };
  function geTypeRow() {
    return [['all', 'All'], ['rule', '📘 Rules only'], ['translate', '✏️ Translations only']].map(function (o) { return '<button class="aph-chip' + (grEwsTypeFilter === o[0] ? ' on' : '') + '" onclick="apGeType(\'' + o[0] + '\')">' + o[1] + '</button>'; }).join('');
  }
  function geNarrowInner() { return '<div class="aph-label">Items</div><div class="aph-row">' + geTypeRow() + '</div><div class="aph-note" style="margin-top:6px">Rules = questions about the grammar. Translations = sentences to put into French. This affects Drill, Speed Challenge, Spell, Match and Test.</div>'; }
  function geRefresh() {
    var d = $('ge-chap'); if (!d) return;
    d.classList.toggle('ps-has', GE.chosen());
    var s = $('ge-chapsum'); if (s) s.textContent = geSummary();
    [].forEach.call(d.querySelectorAll('.ps-row'), function (r) { var on = !GE.my && GE.sel.indexOf(r.getAttribute('data-k')) >= 0; r.classList.toggle('on', on); r.querySelector('input').checked = on; });
    var m = $('ge-my'); if (m) m.innerHTML = myBox(GE, GE.my);
    var nr = $('ge-narrowIn'); if (nr) nr.innerHTML = geNarrowInner();
    var ns = $('ge-narrowSum'); if (ns) ns.textContent = geNarrowSum();
    var a = $('ge-act'); if (a) a.innerHTML = geActHtml();
  }
  function geDraw() {
    var el = $('grEwsContainer'); if (!el) return;
    var total = 0; chapKeys().forEach(function (k) { total += GR_EWS_DATA[k].items.length; });
    var keep = $('grEwsMenuTestOutput') ? $('grEwsMenuTestOutput').innerHTML : '';
    el.innerHTML = '<div class="aph-wrap"><div class="aph-card ms-card ps-card" id="ge-card">'
      + '<h2 class="aph-h">Gr EWs</h2><p class="vv-sub">Grammar rules and translations · ' + chapKeys().length + ' chapters · ' + total + ' items</p>'
      + step(1, 'What do you want to practise?')
      + '<details class="ps-pick" id="ge-chap"' + (GE.chapOpen ? ' open' : '') + '><summary><span class="ms-gear">📚</span><span class="ms-st">Chapters</span><small id="ge-chapsum"></small><span class="ms-chg"></span></summary>'
      + '<div class="ps-bar"><input class="ps-search" type="search" placeholder="Search chapters (e.g. subjunctive, Gr 12)…" value="' + esc(GE.q) + '" oninput="apGeSearch(this.value)"><button class="ms-b sm" onclick="apGeAll()">Select all / none</button></div>'
      + '<div class="ps-list" id="ge-list">' + geRows() + '</div></details>'
      + '<div id="ge-my"></div>'
      + narrowBar('ge-narrow', GE.narrowOpen, 'Narrow the items', geNarrowSum(), geNarrowInner())
      + step(2, 'How do you want to practise it?')
      + '<div id="ge-act"></div><div id="grEwsMenuTestOutput" class="aph-out">' + keep + '</div>'
      + '</div></div>';
    var d = $('ge-chap'); d.addEventListener('toggle', function () { GE.chapOpen = d.open; });
    var nb = $('ge-narrow'); nb.addEventListener('toggle', function () { GE.narrowOpen = nb.open; });
    if (GE.q) apGeSearch(GE.q);
    geRefresh();
  }
  window.renderGrEws = function () { geAdopt(); geDraw(); };

  // ===================================================================================================================
  //  GRAMMAR DRILLS
  // ===================================================================================================================
  var gdTopicNames = function () { return GR_TOPIC_NAMES; };
  function gdSummary() {
    if (GDs.my) { var k = myPool(GDs).length; return '★ My personalised set · ' + k + ' sentence' + (k === 1 ? '' : 's'); }
    if (!grSelected.size) return 'Nothing chosen yet. Tick one or more grammar points.';
    return GDs.label() + ' · ' + GDs.pool().length + ' sentences';
  }
  function gdNarrowSum() { return grTopicFilter > 0 ? 'Topic ' + grTopicFilter + ': ' + GR_TOPIC_NAMES[grTopicFilter] : grTopicFilter === -1 ? 'Generic sentences only' : 'All topics'; }
  function gdNarrowInner() {
    return '<div class="aph-label">Topic</div><div class="aph-row"><button onclick="grSetTopicFilter(0)" class="aph-chip ' + (grTopicFilter == 0 ? 'on' : '') + '">All</button><button onclick="grSetTopicFilter(-1)" class="aph-chip ' + (grTopicFilter == -1 ? 'on' : '') + '">Generic</button>'
      + Object.keys(GR_TOPIC_NAMES).filter(function (k) { return parseInt(k) > 0; }).map(function (k) { return '<button onclick="grSetTopicFilter(' + k + ')" class="aph-chip ' + (grTopicFilter == k ? 'on' : '') + '">' + GR_TOPIC_NAMES[k] + '</button>'; }).join('') + '</div>'
      + '<div class="aph-note" style="margin-top:6px">' + (grTopicFilter > 0 ? 'Topic ' + grTopicFilter + ': 4 sentences per set.' : grTopicFilter === -1 ? 'Generic only: 40 sentences per set.' : 'Every sentence in the sets you tick.') + '</div>';
  }
  function gdSettingsSum() {
    var tot = GDs.chosen() ? GDs.pool().length : 0, n = grState.drillCount;
    return (!n || n >= tot ? 'All cards' : n + ' cards') + ' · ' + (grState.timerSecs || 15) + 's a card';
  }
  function gdSettingsInner() {
    var tot = GDs.chosen() ? GDs.pool().length : 0, n = grState.drillCount;
    var chips = [10, 20].filter(function (x) { return x < tot; }).map(function (x) { return '<button class="aph-chip ' + (n === x ? 'on' : '') + '" onclick="grSetCount(' + x + ')">' + x + '</button>'; }).join('')
      + '<button class="aph-chip ' + ((!n || n >= tot) ? 'on' : '') + '" onclick="grSetCount(' + (tot || 99999) + ')">All' + (tot ? ' ' + tot : '') + '</button>';
    return '<div class="aph-label">Cards per session</div><div class="aph-row">' + chips + '</div>'
      + '<div class="aph-label">Timer per card</div><div class="aph-row">' + [10, 15, 20, 30].map(function (s) { return '<button class="aph-chip ' + ((grState.timerSecs || 15) === s ? 'on' : '') + '" onclick="apGdTimer(' + s + ')">' + s + 's</button>'; }).join('') + '</div>'
      + '<div class="aph-label">Leisure Mode pace</div>' + APLZ.ctrlHTML('gr', 'setup');
  }
  window.apGdTimer = function (s) { grState.timerSecs = s; grState.leisure = false; renderGrammarMenu(); };
  function gdActHtml() {
    var has = GDs.chosen(), pool = has ? GDs.pool() : [], usable = has && pool.length > 0, canPair = usable && GDs.pairPool().length >= 3;
    var h = '<div class="ms-now">' + (!has ? (GDs.my ? 'Your personalised set is empty so far.' : unlock(GDs, 'your grammar points')) : (!usable ? 'No sentences in that selection.' : 'Practising: <b>' + esc(GDs.label()) + '</b> · ' + pool.length + ' sentence' + (pool.length === 1 ? '' : 's'))) + '</div>';
    h += '<div class="aph-tools ms-tiles">'
      + tile(GDs, 'drill', !usable, null, !usable ? 'apGeNone()' : GDs.my ? "apGdDrillMy(false)" : 'startMultiGrammarDrill()')
      + tile(GDs, 'speed', !usable || GDs.my, GDs.my ? 'Works on whole grammar points, so not on a personalised set.' : null, 'openGdChallenge()')
      + tile(GDs, 'spell', !usable, 'Hear the French sentence and write it. Accents count.', "apPsSpell('d')")
      + tile(GDs, 'match', !canPair, canPair || !usable ? 'Pair six English and French sentences against the clock.' : 'Needs at least three sentences in your selection.', "apPsMatch('d')")
      + tile(GDs, 'leis', !usable, null, GDs.my ? 'apGdDrillMy(true)' : 'apGdLeisure()')
      + tile(GDs, 'test', !usable || GDs.my, GDs.my ? 'Tests work on whole grammar points, so not on a personalised set.' : null, 'openMultiGrammarTestPanel()')
      + '</div>';
    h += '<div class="ps-read"><div class="aph-note">Just want to read the grammar?</div>' + rcpEntry('gd') + '</div>';
    h += keysLegend();
    return h;
  }
  window.apGdLeisure = function () { grState.leisure = true; try { startMultiGrammarDrill(); } finally { grState.leisure = false; } };
  window.apGdDrillMy = function (leis) {
    var cnt = grState.drillCount || 99999, mine = myPool(GDs);
    var deck = shuffle(mine).slice(0, cnt).map(function (s, i) { return Object.assign({}, s, { _setId: GDs.setOf(s), _origIdx: i }); });
    if (!deck.length) return;
    var setIds = []; deck.forEach(function (s) { if (s._setId && setIds.indexOf(s._setId) < 0) setIds.push(s._setId); });
    if (leis) { grLeisureStart(deck, '__multi__', setIds); return; }
    grState = Object.assign({}, grState, { setId: '__multi__', multiIds: setIds, idx: 0, shuffled: deck, correct: 0, nearly: 0, errors: [], revealed: false, timerSecs: grState.timerSecs || 15, leisure: false, drillCount: cnt, timerVal: grState.timerSecs || 15, timerInterval: null, timerRunning: false });
    renderGrammarCard();
  };
  window.apGdTog = function (id) {
    GDs.my = false; if (grSelected.has(id)) grSelected.delete(id); else grSelected.add(id); GDs.sig = GDs.sel().join(','); gdRefresh();
  };
  window.apGdAll = function () { GDs.my = false; if (grSelected.size === GR_SETS.length) grSelected.clear(); else GR_SETS.forEach(function (s) { grSelected.add(s.id); }); GDs.sig = GDs.sel().join(','); gdRefresh(); };
  window.apGdSearch = function (q) {
    GDs.q = String(q || '').toLowerCase().trim();
    [].forEach.call(document.querySelectorAll('#gd-list .ps-row'), function (r) { r.classList.toggle('ps-hide', !!GDs.q && r.getAttribute('data-t').indexOf(GDs.q) < 0); });
  };
  function gdRows() {
    return GR_SETS.map(function (s) {
      var on = !GDs.my && grSelected.has(s.id), n = (grTopicFilter ? grFilterSentences(s.sentences) : s.sentences).length;
      return '<label class="ps-row ps-gd' + (on ? ' on' : '') + '" data-k="' + s.id + '" data-t="' + esc((s.title + ' ' + (s.chip || '')).toLowerCase()) + '"><input type="checkbox"' + (on ? ' checked' : '') + ' onchange="apGdTog(\'' + s.id + '\')"><span class="t">' + s.emoji + ' ' + esc(s.title) + '<small>' + esc(s.chip || '') + '</small></span><span class="c">' + n + ' sentences</span></label>';
    }).join('');
  }
  function gdRefresh() {
    var d = $('gd-chap'); if (!d) return;
    d.classList.toggle('ps-has', GDs.chosen());
    var s = $('gd-chapsum'); if (s) s.textContent = gdSummary();
    var l = $('gd-list'); if (l) { l.innerHTML = gdRows(); if (GDs.q) apGdSearch(GDs.q); }
    var m = $('gd-my'); if (m) m.innerHTML = myBox(GDs, GDs.my);
    var nr = $('gd-narrowIn'); if (nr) nr.innerHTML = gdNarrowInner();
    var ns = $('gd-narrowSum'); if (ns) ns.textContent = gdNarrowSum();
    var a = $('gd-act'); if (a) a.innerHTML = gdActHtml();
    var st = $('gd-set'); if (st) { st.querySelector('summary small').textContent = gdSettingsSum(); var si = $('gd-setIn'); if (si) si.innerHTML = gdSettingsInner(); }
  }
  function gdDraw() {
    var el = $('grammarContainer'); if (!el) return;
    grState.leisure = false;
    el.innerHTML = '<div class="aph-wrap"><div class="aph-card ms-card ps-card" id="gd-card">'
      + '<h2 class="aph-h">Grammar Drills</h2><p class="vv-sub">Targeted sentences for the essential translation grammar points</p>'
      + step(1, 'What do you want to practise?')
      + '<details class="ps-pick" id="gd-chap"' + (GDs.chapOpen ? ' open' : '') + '><summary><span class="ms-gear">🎯</span><span class="ms-st">Grammar points</span><small id="gd-chapsum"></small><span class="ms-chg"></span></summary>'
      + '<div class="ps-bar"><input class="ps-search" type="search" placeholder="Search grammar points…" value="' + esc(GDs.q) + '" oninput="apGdSearch(this.value)"><button class="ms-b sm" onclick="apGdAll()">Select all / none</button></div>'
      + '<div class="ps-list" id="gd-list"></div></details>'
      + '<div id="gd-my"></div>'
      + narrowBar('gd-narrow', GDs.narrowOpen, 'Narrow the sentences', gdNarrowSum(), gdNarrowInner())
      + step(2, 'How do you want to practise it?')
      + '<details class="ms-opts" id="gd-set"' + (GDs.setOpen ? ' open' : '') + '><summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small></small><span class="ms-chg"></span></summary><div id="gd-setIn"></div></details>'
      + '<div id="gd-act"></div>'
      + '</div></div>';
    var d = $('gd-chap'); d.addEventListener('toggle', function () { GDs.chapOpen = d.open; });
    var nb = $('gd-narrow'); nb.addEventListener('toggle', function () { GDs.narrowOpen = nb.open; });
    var sb = $('gd-set'); sb.addEventListener('toggle', function () { GDs.setOpen = sb.open; });
    gdRefresh();
  }
  GDs.sig = '';
  window.renderGrammarMenu = function () {
    var s = GDs.sel().join(',');
    if (s && s !== GDs.sig) { GDs.chapOpen = false; GDs.my = false; }   // a link or the recap page chose the sets: show them folded, with the ways to practise them in view
    GDs.sig = s; gdDraw();
  };

  // ===================================================================================================================
  //  METALANGUAGE FORMULAE
  // ===================================================================================================================
  function syncMl() { if (ML.f && ML.t && ML.f !== ML.t) { mlfState.fromLang = ML.f; mlfState.toLang = ML.t; } }
  var sM = window.startMLF;
  window.startMLF = function () { if (!ML.f || !ML.t) { ML.f = mlfState.fromLang; ML.t = mlfState.toLang; } return sM.apply(this, arguments); };
  window.apMlLang = function (dir, lang) {
    ML.my = false;
    if (dir === 'from') { if (ML.t === lang) ML.t = ML.f; ML.f = lang; } else { if (ML.f === lang) ML.f = ML.t; ML.t = lang; }
    syncMl(); renderMLF();
  };
  function mlSummary() {
    if (!ML.chosen()) return 'Nothing chosen yet. Choose the language you start from and the one you answer in.';
    if (ML.my) { var k = myPool(ML).length; return '★ My personalised set · ' + k + ' formula' + (k === 1 ? '' : 'e') + ' · ' + MLF_LANGS[mlfState.fromLang].label + ' → ' + MLF_LANGS[mlfState.toLang].label; }
    return MLF_LANGS[mlfState.fromLang].flag + ' ' + MLF_LANGS[mlfState.fromLang].label + ' → ' + MLF_LANGS[mlfState.toLang].flag + ' ' + MLF_LANGS[mlfState.toLang].label + ' · ' + ML.pool().length + ' formulae';
  }
  function mlSettingsSum() { var tot = ML.chosen() ? ML.pool().length : 0, n = mlfState.drillCount; return (n >= tot ? 'All cards' : n + ' cards') + ' · ' + mlfState.timerSecs + 's a card'; }
  function mlSettingsInner() {
    var tot = ML.chosen() ? ML.pool().length : 0, n = mlfState.drillCount;
    var chips = [10, 20].filter(function (x) { return x < tot; }).map(function (x) { return '<button class="aph-chip ' + (n === x ? 'on' : '') + '" onclick="apMlCount(' + x + ')">' + x + '</button>'; }).join('')
      + '<button class="aph-chip ' + (n >= tot ? 'on' : '') + '" onclick="apMlCount(' + (tot || 99999) + ')">All' + (tot ? ' ' + tot : '') + '</button>';
    return '<div class="aph-label">Cards per session</div><div class="aph-row">' + chips + '</div>'
      + '<div class="aph-label">Timer per card</div><div class="aph-row">' + [10, 15, 20, 30].map(function (s) { return '<button class="aph-chip ' + (mlfState.timerSecs === s ? 'on' : '') + '" onclick="apMlTimer(' + s + ')">' + s + 's</button>'; }).join('') + '</div>'
      + '<div class="aph-label">Leisure Mode pace</div>' + APLZ.ctrlHTML('mlf', 'setup');
  }
  window.apMlCount = function (n) { mlfState.drillCount = n; renderMLF(); };
  window.apMlTimer = function (s) { mlfState.timerSecs = s; mlfState.leisure = false; renderMLF(); };
  window.apMlLeisure = function () { mlfState.leisure = true; try { startMLF(); } finally { mlfState.leisure = false; } };
  window.apMlTest = function () { ML.testOpen = !ML.testOpen; var r = $('ml-testrow'); if (r) r.style.display = ML.testOpen && ML.chosen() && !ML.my ? 'flex' : 'none'; if (ML.testOpen && r) r.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  window.apMlDrillMy = function (leis) {
    var pool = shuffle(myPool(ML).filter(function (x) { return x[mlfState.fromLang] && x[mlfState.toLang]; })).slice(0, mlfState.drillCount || 99999); if (!pool.length) return;
    if (leis) { mlfLeisureStart(pool); return; }
    mlfState = Object.assign({}, mlfState, { shuffled: pool, idx: 0, errors: [], correct: 0, nearly: 0, revealed: false, timerVal: mlfState.timerSecs, timerInterval: null, timerRunning: false });
    renderMLFCard();
  };
  function mlActHtml() {
    var has = ML.chosen(), pool = has ? ML.pool() : [], usable = has && pool.length > 0, canPair = usable && ML.pairPool().length >= 3;
    var LN = has ? MLF_LANGS[ML.foreign()].label : 'French';
    var h = '<div class="ms-now">' + (!has ? 'Choose your two languages above to unlock the ways to practise them.' : (!usable ? 'No formulae for that choice yet.' : 'Practising: <b>' + esc(ML.label()) + '</b> · ' + pool.length + ' formula' + (pool.length === 1 ? 'e' : 'e'))) + '</div>';
    h += '<div class="aph-tools ms-tiles">'
      + tile(ML, 'drill', !usable, null, !usable ? 'apGeNone()' : ML.my ? 'apMlDrillMy(false)' : 'startMLF()')
      + tile(ML, 'speed', !usable || ML.my, ML.my ? 'Works on the whole list, so not on a personalised set.' : null, 'openMlfChallenge()')
      + tile(ML, 'spell', !(usable && ML.foreign() !== 'en'), usable && ML.foreign() === 'en' ? 'Spell needs a French or Italian side: choose one of them.' : 'Hear the ' + LN + ' formula and write it. Accents count.', "apPsSpell('m')")
      + tile(ML, 'match', !(canPair && ML.foreign() !== 'en'), 'Pair six English and ' + LN + ' formulae against the clock.', "apPsMatch('m')")
      + tile(ML, 'leis', !usable, null, ML.my ? 'apMlDrillMy(true)' : 'apMlLeisure()')
      + tile(ML, 'test', !usable || ML.my, ML.my ? 'Tests work on the whole list, so not on a personalised set.' : null, 'apMlTest()')
      + '</div>';
    h += '<div class="ps-testrow" id="ml-testrow" style="display:' + (ML.testOpen && usable && !ML.my ? 'flex' : 'none') + '"><b>Test</b>'
      + '<button class="aph-btn" onclick="generateMlfTest()">&#128221; Generate Test <small>(print / PDF)</small></button><button class="aph-btn" onclick="generateMlfSpotTest()">&#128424; Paper Spot Test <small>(print / PDF)</small></button><button class="aph-btn aptt-btn" onclick="apttLevel(\'mlf\',function(){generateMlfSpotTest(true)})">✍ Submitted Spot Test</button></div>';
    h += '<div class="aph-tools" style="margin-top:6px"><button class="aph-btn aph-btn-sm" onclick="openMlfEdit()">✏️ Edit</button></div>';
    h += keysLegend();
    return h;
  }
  function mlDraw() {
    var el = $('mlfContainer'); if (!el) return;
    mlfState.leisure = false;
    var keepOut = $('mlfTestOutput') ? $('mlfTestOutput').innerHTML : '';
    function chips(dir) { return Object.keys(MLF_LANGS).map(function (k) { var l = MLF_LANGS[k], on = (dir === 'from' ? ML.f : ML.t) === k; return '<button onclick="apMlLang(\'' + dir + "','" + k + '\')" class="aph-chip vv-flag' + (on ? ' on' : '') + '" title="' + l.label + '">' + l.flag + ' <span style="font-size:.8125rem;font-weight:700">' + l.label + '</span></button>'; }).join(''); }
    el.innerHTML = '<div class="aph-wrap"><div class="aph-card ms-card ps-card" id="ml-card">'
      + '<h2 class="aph-h">Metalanguage Formulae</h2><p class="vv-sub">Hear the prompt, produce the equivalent, in any language pair</p>'
      + step(1, 'What do you want to practise?')
      + '<div class="ps-pick' + (ML.chosen() ? ' ps-has' : '') + '" id="ml-pick" style="padding-top:12px"><div class="ms-st" style="font-size:1.0625rem;margin:0 0 6px">Which way round?</div>'
      + '<div class="ps-pairs"><div><div class="mini">From</div><div class="row">' + chips('from') + '</div></div><div class="ar">→</div><div><div class="mini">To</div><div class="row">' + chips('to') + '</div></div></div>'
      + '<div class="aph-note" style="margin:6px 0 0"><b>' + esc(mlSummary()) + '</b></div></div>'
      + '<div id="ml-my">' + myBox(ML, ML.my) + '</div>'
      + step(2, 'How do you want to practise it?')
      + '<details class="ms-opts" id="ml-set"' + (ML.setOpen ? ' open' : '') + '><summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small>' + esc(mlSettingsSum()) + '</small><span class="ms-chg"></span></summary><div id="ml-setIn">' + mlSettingsInner() + '</div></details>'
      + '<div id="ml-act">' + mlActHtml() + '</div>'
      + '<div class="vv-lv"><div class="aph-label">Level <span class="aph-note" style="text-transform:none;letter-spacing:0;font-weight:500">(for tests)</span></div>' + apLvRow('mlf', 'mlfTestOutput', { style: 'margin:0;', label: 'Level' }) + '</div>'
      + '<div id="mlfTestOutput" class="aph-out">' + keepOut + '</div>'
      + '</div></div>';
    var sb = $('ml-set'); sb.addEventListener('toggle', function () { ML.setOpen = sb.open; });
  }
  window.renderMLF = function () {
    if (!ML.link && /^#mlf=/.test(location.hash || '')) { ML.link = true; if (!ML.f || !ML.t) { ML.f = 'en'; ML.t = 'fr'; } }
    syncMl(); mlDraw();
  };

  // ---- on-screen test answers stay hidden until Show answers ---------------------------------------------------
  function gate() {
    var labs = [].slice.call(document.querySelectorAll('.aph-label')).filter(function (l) { return l.textContent.trim() === 'Answer key' && !l.closest('.ps-gate'); });
    [].slice.call(document.querySelectorAll('div')).forEach(function (d) { if (!d.children.length && /^Teacher Sheet \(answer key\)$/i.test(d.textContent.trim()) && !d.closest('.ps-gate')) labs.push(d); });
    labs.forEach(function (lab) {
      var nx = lab.nextElementSibling; if (!nx) return;
      var w = document.createElement('div'); w.className = 'ps-gate'; w.style.display = 'none';
      lab.parentNode.insertBefore(w, lab); w.appendChild(lab); w.appendChild(nx);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'aph-btn aph-btn-sm ps-gatebtn'; b.textContent = 'Show answers'; b.style.margin = '10px 0';
      b.onclick = function () { var hid2 = w.style.display === 'none'; w.style.display = hid2 ? '' : 'none'; b.textContent = hid2 ? 'Hide answers' : 'Show answers'; };
      w.parentNode.insertBefore(b, w);
    });
  }
  var gT = null;
  try { new MutationObserver(function () { if (gT) return; gT = setTimeout(function () { gT = null; try { gate(); } catch (e) { } }, 30); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { }

  // ---- first draw (the main script drew before this block was added) --------------------------------------------
  try { if ($('grEwsContainer') && $('grEwsContainer').innerHTML.trim()) renderGrEws(); } catch (e) { }
  try { if ($('grammarContainer') && $('grammarContainer').innerHTML.trim()) renderGrammarMenu(); } catch (e) { }
  try { if ($('mlfContainer') && $('mlfContainer').innerHTML.trim()) renderMLF(); } catch (e) { }
})();
