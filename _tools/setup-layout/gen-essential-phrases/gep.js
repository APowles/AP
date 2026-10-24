(function () {
  'use strict';
  var KEY = 'apgep_myset_v1', BEST = 'apgep_match_best';
  var S = { c: {}, due: {}, f: 'all' }, note = '', setOpen = false, my = false, wired = false;
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(id) { return document.getElementById(id); }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function isV() { return vocabMode === 'vocab'; }
  function kOf(p, v) { return p.sec + '~' + p.n + ((v == null ? isV() : v) ? '~v' : ''); }
  function dueNow(k) { var d = S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function ids() { return Object.keys(S.c); }
  function dueCount() { return inSet().filter(function (p) { return dueNow(kOf(p)); }).length; }
  function inSet() { return getActivePhrases().filter(function (p) { return S.c[kOf(p)]; }); }
  function myPool() {
    return inSet().filter(function (p) { var k = kOf(p), l = S.c[k].l || 2; return S.f === 'all' ? true : S.f === 'due' ? dueNow(k) : S.f === '3' ? l === 3 : l >= 2; });
  }
  function foreign() { var f = getLangFrom(), t = getLangTo(); return t === 'en' ? f : t; }
  function fam(v) { return String(v).split('.')[0]; }
  function famName(f) { var m = /^L(\d+)$/.exec(f); return m ? 'Level ' + m[1] : f === 'ST' ? 'Small Talk' : f; }

  // ---- the selection: nothing is chosen until a list (or the personalised set) is
  var gsp0 = window.getSelectedPhrases;
  window.getSelectedPhrases = function () { return my ? myPool() : gsp0.apply(this, arguments); };
  function chosen() { return my || getCheckedSections().length > 0; }
  function pool() { return !chosen() ? [] : getSelectedPhrases(); }
  function wrap(name, fn) { var o = window[name]; if (typeof o !== 'function') return; window[name] = function () { var r = o.apply(this, arguments); try { fn.apply(this, arguments); } catch (e) { } return r; }; }
  function wrapPre(name, fn) { var o = window[name]; if (typeof o !== 'function') return; window[name] = function () { try { fn.apply(this, arguments); } catch (e) { } return o.apply(this, arguments); }; }

  // ---- marking in any drill feeds the personalised set
  function record(p, res, v) {
    if (!p || p.n == null) return;
    var k = kOf(p, v);
    if (res === 'bad') { S.c[k] = { l: 3 }; S.due[k] = { b: 0, d: today() + 1 }; }
    else if (res === 'ok' && S.c[k] && dueNow(k)) { var b = (S.due[k].b || 0) + 1; S.due[k] = b >= 3 ? { b: 3, d: null } : { b: b, d: today() + [1, 3, 7][b] }; }
    else return;
    save();
  }
  wrapPre('mark', function (r) { var p = deck[idx]; if (p) record(p, r === 'end' ? 'bad' : r === 'got' ? 'ok' : ''); });

  var ICONS = {};
  var TILES = [
    ['ms-drill', 'drill', 'Drill', 'Cards one at a time. You mark yourself ✗ ~ ✓.', 'epStart()'],
    ['ms-speed', 'speed', 'Speed Challenge', 'Race the clock, solo or in teams.', 'openVocabChallenge()'],
    ['ms-spell', 'spell', 'Spell', 'Hear the phrase and write it. Accents count.', 'apSpell()'],
    ['ms-match', 'match', 'Match', 'Pair six English and foreign phrases against the clock.', 'apMatch()'],
    ['ms-leis', 'leis', 'Leisure Mode', 'Just press play and let it all wash over you.', 'startLeisureMode()'],
    ['ms-test', 'test', 'Test', 'A test to print or do on screen. Answers stay hidden.', 'showIGCSETestPanel()']
  ];
  function iconFor(k) { var l = foreign(); if (k === 'spell' || k === 'match') return ICONS[k + '_' + (l === 'it' || l === 'es' ? l : 'fr')]; return ICONS[k]; }

  // ---- build the new card once, moving the page's own controls (ids and handlers untouched)
  function rowOf(id) { var e = $(id); return e ? e.closest('.aph-row') || e : null; }
  function prevLabel(e) { var p = e && e.previousElementSibling; return p && p.classList.contains('aph-label') ? p : null; }
  function build() {
    var card = document.querySelector('#home-controls .aph-card.ep-setup'); if (!card || card.getAttribute('data-gep')) return;
    card.setAttribute('data-gep', '1');
    var h2 = card.querySelector('h2.aph-h'), banner = card.querySelector('.aph-banner');
    var dirRow = rowOf('lang-from'), dirLab = prevLabel(dirRow), mixRow = $('ep-mix'), mixLab = prevLabel(mixRow);
    var whatHead = card.querySelector('.ep-what-head'), modeRow = rowOf('modeBtn_sentences'), listsRow = card.querySelector('.ep-lists');
    var picker = $('sec-picker-wrap'), cntRow = $('ep-counts'), cntLab = prevLabel(cntRow);
    var tmRow = $('timer-display') ? $('timer-display').closest('.aph-row') : null, tmLab = prevLabel(tmRow);
    var stack = card.querySelector('.aph-stack'), keys = card.querySelector('.aph-keys'), audio = card.querySelector('.ep-audio');
    var auto = $('autotimeBtn'), viewBtn = stack && stack.querySelector('[onclick^="openStudyView"]'), vocBtn = stack && stack.querySelector('[onclick^="showVocabApp"]');
    var editBtn = $('igcseEditBtn'), editTools = $('ep-edit-tools');
    if (!h2 || !picker || !stack || !dirRow || !mixRow || !cntRow || !tmRow) { card.removeAttribute('data-gep'); return; }

    var legacy = document.createElement('div'); legacy.style.display = 'none'; legacy.id = 'gep-legacy';
    [banner, listsRow, whatHead && whatHead.querySelector('.aph-label')].forEach(function (e) { if (e) legacy.appendChild(e); });
    // old Start / Leisure / Generate Test buttons live on in the hidden box (the tiles call the same functions)
    [].slice.call(stack.children).forEach(function (e) { if (e.classList.contains('aph-btn') && /epStart|startLeisureMode/.test(e.getAttribute('onclick') || '')) legacy.appendChild(e); });
    var t3 = stack.querySelector('.ep-tools3'); var gen = t3 && t3.querySelector('[onclick^="showIGCSETestPanel"]'); if (gen) legacy.appendChild(gen);
    var chooseBtn = whatHead && whatHead.querySelector('button'); if (chooseBtn) chooseBtn.parentNode.removeChild(chooseBtn);

    var det = document.createElement('details'); det.className = 'ms-opts'; det.id = 'gep-opts'; det.open = setOpen;
    det.addEventListener('toggle', function () { setOpen = det.open; });
    det.innerHTML = '<summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small id="gep-sum"></small><span class="ms-chg"></span></summary>';
    [cntLab, cntRow, tmLab, tmRow].forEach(function (e) { if (e) det.appendChild(e); });
    if (auto) {
      var ar = document.createElement('div'); ar.className = 'aph-row'; ar.appendChild(auto); det.appendChild(ar);
      det.insertAdjacentHTML('beforeend', '<div class="aph-note" style="margin:0 0 4px">Autotime: Leisure Mode moves on by itself, with no timer bar.</div>');
    }
    [dirLab, dirRow, mixLab, mixRow].forEach(function (e) { if (e) det.appendChild(e); });
    det.insertAdjacentHTML('beforeend', '<div class="aph-note" style="margin:6px 0 4px;line-height:1.45"><b>Direction</b> is which language you see and which you answer in. <b>Mix both ways</b>: Off = every card goes the way round chosen above. 50–50 = half the cards go English → foreign and half the other way, each card showing its own direction. 70–30 = seven in ten English → foreign, three in ten the other way.</div>');

    var extras = document.createElement('div'); extras.className = 'gep-extras';
    if (vocBtn) extras.appendChild(vocBtn);
    if (editBtn) extras.appendChild(editBtn);
    if (editTools) extras.appendChild(editTools);

    while (card.firstChild) card.removeChild(card.firstChild);
    card.appendChild(h2);
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">1</span>What do you want to practise?</div>');
    var s1 = document.createElement('div'); s1.id = 'gep-s1';
    if (modeRow) s1.appendChild(modeRow);
    s1.insertAdjacentHTML('beforeend', '<div class="aph-label">Pick a whole level</div><div class="aph-row" id="gep-levels"></div><div class="aph-label">Or choose lists one by one</div><div class="aph-row"><button class="aph-btn aph-btn-sm" onclick="openTopicOverview()">📚 Choose lists</button></div>');
    s1.appendChild(picker);
    s1.insertAdjacentHTML('beforeend', '<div id="gep-my"></div><div class="ms-now" id="gep-now"></div>');
    card.appendChild(s1);
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">2</span>How do you want to practise it?</div>');
    card.appendChild(det);
    card.insertAdjacentHTML('beforeend', '<div class="aph-tools ms-tiles" id="gep-tiles"></div>');
    var vr = document.createElement('div'); vr.className = 'ms-viewrow'; vr.id = 'gep-view';
    vr.insertAdjacentHTML('beforeend', '<span class="aph-note" style="margin:0">Just want to read or print the list?</span>');
    if (viewBtn) vr.appendChild(viewBtn);
    card.appendChild(vr);
    card.appendChild(extras);
    if (keys) card.appendChild(keys); if (audio) card.appendChild(audio);
    card.appendChild(legacy);
    wired = true;
  }

  // ---- paint the parts that change
  function sumLine() {
    var f = getLangFrom(), t = getLangTo();
    return (_epCount === -1 ? 'All cards' : _epCount + ' cards') + ' · ' + timerSecs + 's a card · ' + LANG_NAMES[f] + ' → ' + LANG_NAMES[t] + (mixOn() ? ' · mixed ' + epMix + '–' + (100 - epMix) : '') + (isAutotime ? ' · Autotime on' : '');
  }
  function myBox(n, dc) {
    var fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']], on = my;
    var tot = ids().length;
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (tot || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apMySetUse()" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note" style="min-width:auto">' + (on ? myPool().length + ' of ' : '') + n + ' phrase' + (n === 1 ? '' : 's') + (isV() ? ' (vocab items)' : '') + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apMySetHelp()">? How does this work?</button></div>'
      + (tot || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apMySetEdit()">✎ Edit</button><button class="ms-b sm" onclick="apMySetLink()">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (S.f === x[0] ? ' on' : '') + '" onclick="apMySetFilter(\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (note || !tot ? '<div class="ms-note">' + (note ? '<b>' + esc(note) + '</b> ' : '') + (!tot ? 'Empty so far. Phrases you mark ✗ Major error in any drill join it automatically.' : '') + '</div>' : '') + '</div>';
  }
  function levels() {
    var box = $('gep-levels'); if (!box) return;
    var cnt = {}, order = []; getActivePhrases().forEach(function (p) { var f = fam(p.sec); if (!cnt[f]) { cnt[f] = 0; order.push(f); } cnt[f]++; });
    var cbs = [].slice.call(document.querySelectorAll('.sec-checkbox')), seen = {}, fams = [];
    cbs.forEach(function (c) { var f = fam(c.value); if (!seen[f]) { seen[f] = 1; fams.push(f); } });
    var ck = getCheckedSections();
    box.innerHTML = fams.map(function (f) {
      var all = cbs.filter(function (c) { return fam(c.value) === f; }).map(function (c) { return c.value; });
      var on = !my && ck.length === all.length && all.every(function (v) { return ck.indexOf(v) >= 0; });
      var n = cnt[f] || 0;
      return '<button class="aph-chip' + (on ? ' on' : '') + '"' + (n ? '' : ' disabled style="opacity:.45"') + ' onclick="apGepLevel(\'' + f + '\')">' + esc(famName(f)) + ' <small style="opacity:.7">· ' + n + '</small></button>';
    }).join('');
  }
  window.apGepLevel = function (f) {
    var cbs = [].slice.call(document.querySelectorAll('.sec-checkbox')), all = cbs.filter(function (c) { return fam(c.value) === f; }), ck = getCheckedSections();
    var same = !my && ck.length === all.length && all.every(function (c) { return c.checked; });
    my = false; cbs.forEach(function (c) { c.checked = !same && fam(c.value) === f; });
    onSectionChange();
    var sum = $('ep-dl-sum'), lst = $('sec-picker-list'); if (sum) sum.style.display = 'none'; if (lst) lst.style.display = '';
  };
  function refresh() {
    if (!wired) return;
    var n = inSet().length, dc = dueCount(), p = pool(), ok = p.length > 0;
    var sel = chosen();
    levels();
    var mb = $('gep-my'); if (mb) mb.innerHTML = myBox(n, dc);
    var lab = '';
    if (my) lab = 'my personalised set';
    else { var ck = getCheckedSections(), tot = document.querySelectorAll('.sec-checkbox').length; lab = ck.length === tot ? 'all lists' : (function () { var f0 = fam(ck[0]); var all = [].slice.call(document.querySelectorAll('.sec-checkbox')).filter(function (c) { return fam(c.value) === f0; }); return all.length === ck.length && ck.every(function (v) { return fam(v) === f0; }) ? famName(f0) : ''; })() || (ck.length === 1 ? (function () { var it = document.querySelector('.sec-cb-item[data-sec="' + ck[0] + '"] .sec-cb-title'); return ck[0] + (it ? ' ' + it.textContent.trim() : ''); })() : ck.length + ' lists'); }
    var now = $('gep-now');
    if (now) now.innerHTML = !sel ? 'Choose a level or lists above to unlock the ways to practise them.' : (!ok ? (my ? 'Nothing in the personalised set matches this view yet.' : 'This choice has no ' + (isV() ? 'vocab items' : 'practice sentences') + ' yet. Try the other choice at the top of step 1.') : 'Practising: <b>' + esc(lab) + '</b> · ' + p.length + ' phrases');
    var tl = $('gep-tiles');
    if (tl) tl.innerHTML = TILES.map(function (x) {
      var off = !ok || (my && x[1] === 'speed'), d = x[3];
      if (x[1] === 'match') d = 'Pair six English and ' + LANG_NAMES[foreign()] + ' phrases against the clock.';
      if (my && x[1] === 'speed') d = 'Works on whole lists, so not on a personalised set.';
      return '<button class="ms-tile ' + x[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + x[4] + '"><img class="ms-img" alt="" src="' + iconFor(x[1]) + '"><span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + d + '</span></span></button>';
    }).join('');
    var vb = document.querySelector('#gep-view button'); if (vb) vb.disabled = !ok;
    var sm = $('gep-sum'); if (sm) sm.textContent = sumLine();
  }
  window.apGepRefresh = refresh;

  // ---- keep everything in step with the page's own controls
  wrapPre('onSectionChange', function () { my = false; });
  wrapPre('selectTopic', function () { my = false; });
  wrap('onSectionChange', refresh); wrap('selectTopic', refresh);
  wrap('renderIntro', refresh); wrap('updatePhraseCount', refresh);
  wrap('epSetCount', refresh); wrap('adjustTimer', refresh); wrap('toggleAutotime', refresh);
  wrap('setVocabMode', refresh);

  window.apMySetUse = function () { my = !my; if (my) note = ''; restart(); };
  window.apMySetFilter = function (f) { S.f = f; save(); restart(); };

  // ---- overlays
  var keyH = null, mt = null;
  function ov(inner) { closeOv(true); var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ms-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild; }
  function closeOv(keep) { var o = $('ms-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } if (!keep) { try { speechSynthesis.cancel(); } catch (e) { } } }
  window.apMsClose = function () { closeOv(); restart(); };
  function head(t, sub) { return '<div class="ms-head"><h2>' + t + '</h2><button class="ms-x" onclick="apMsClose()" aria-label="Back">✕</button></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apMsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }
  function show(p, l) { return plain(p[l]); }
  function say(p, l) { return plain(cleanForTTS(p[l])); }

  window.apMySetHelp = function () {
    ov(head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the phrases you find hardest. You do not have to build it: the app does it for you.</p>'
      + '<p><b>How do phrases get in?</b> Do any drill or Spell. Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> tap <b>★ My personalised set</b>. Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell, Match, Leisure Mode or Test, exactly as normal but only on your tricky phrases. Speed Challenge needs whole lists, so it is switched off for this set.</p>'
      + '<p><b>Hard, Tricky, Easier.</b> Every ✗ card goes in as Hard. Press <b>✎ Edit</b> to change a level or take a phrase out. Then you can practise just the Hard ones.</p>'
      + '<p><b>Due today.</b> A phrase you missed comes back after 1 day, then 3 days, then 7. Get it right each time and it stops coming back.</p>'
      + '<p><b>Keep it safe.</b> Press <b>🔗 Save my personalised set</b>, copy the link and paste it into OneNote. Tap that link on any device and your set is back. It is also kept on this iPad, but the link is the safe copy.</p></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apMsClose()">Got it</button></div>');
    keys(function () { return false; });
  };

  // ---- Edit
  window.apMySetEdit = function () { editView(); };
  function allSet() {   // every phrase in the set, both kinds
    var out = []; [[ALL_PHRASES, false], [VOCAB_PHRASES, true]].forEach(function (x) { x[0].forEach(function (p) { if (S.c[kOf(p, x[1])]) out.push({ p: p, v: x[1] }); }); }); return out;
  }
  function editView() {
    var rows = allSet().sort(function (a, b) { return (S.c[kOf(b.p, b.v)].l || 2) - (S.c[kOf(a.p, a.v)].l || 2); }), L = foreign();
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' };
    ov(head('✎ Personalised set', 'Tap a level to change it. ✕ takes a phrase out. ' + rows.length + ' phrases.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (r) { var k = kOf(r.p, r.v), l = S.c[k].l || 2; return '<div class="ms-li"><div><div class="f">' + esc(show(r.p, L)) + '</div><div class="e">' + esc(show(r.p, 'en')) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" onclick="apMsLv(\'' + k + '\')">' + lv[l] + '</button><button class="ms-lv" onclick="apMsDel(\'' + k + '\')" aria-label="Remove">✕</button></div></div>'; }).join('') : '<div class="ms-note">No phrases yet.</div>') + '</div>');
    keys(function () { return false; });
  }
  function redo() { var y = $('ms-ov').scrollTop; editView(); $('ms-ov').scrollTop = y; }
  window.apMsLv = function (k) { var l = S.c[k].l || 2; S.c[k].l = l === 3 ? 1 : l + 1; save(); redo(); };
  window.apMsDel = function (k) { delete S.c[k]; delete S.due[k]; save(); redo(); };

  // ---- Save / open link
  function linkText() { return location.href.replace(/[#?].*$/, '') + '#gepset=' + ids().map(function (k) { return k + '~' + (S.c[k].l || 2); }).join('_'); }
  window.apMySetLink = function () {
    var n = ids().length;
    ov(head('🔗 Save my personalised set') + (n ? '<p class="ms-note" style="font-size:1rem">Paste this link into OneNote. Opening it, on any device, brings back these ' + n + ' phrases. It is also kept on this iPad automatically.</p><textarea id="ms-link" class="ms-ta" readonly>' + esc(linkText()) + '</textarea><div class="ms-cen"><button class="ms-b pri" onclick="apMsCopy()">Copy link</button></div><div class="ms-note" id="ms-copied" style="text-align:center"></div>' : '<p class="ms-note" style="font-size:1rem">Nothing to save yet. Mark some cards ✗ in a drill first.</p>'));
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
    var m = /^#gepset=([^&]*)/.exec(location.hash || ''); if (!m || !wired) return;
    var got = 0, miss = 0, have = {}, anyV = false;
    ALL_PHRASES.forEach(function (p) { have[kOf(p, false)] = 1; }); VOCAB_PHRASES.forEach(function (p) { have[kOf(p, true)] = 1; });
    m[1].split('_').forEach(function (x) {
      var a = x.split('~'); if (a.length < 3) return; var l = parseInt(a[a.length - 1], 10); if (!(l >= 1 && l <= 3)) l = 2;
      var k = a.slice(0, a.length - 1).join('~');
      if (!have[k]) { miss++; return; } var o = S.c[k]; S.c[k] = { l: Math.max(o ? o.l || 1 : 1, l) }; if (!S.due[k]) S.due[k] = { b: 0, d: today() }; got++;
      if (a[2] === 'v') anyV = true;
    });
    S.f = 'all'; save();
    note = got + ' phrase' + (got === 1 ? '' : 's') + ' loaded' + (miss ? ' (' + miss + ' no longer in the list)' : '') + '.';
    var wantV = anyV && !allSet().some(function (r) { return !r.v; });
    if (wantV !== isV() && (anyV || isV())) { try { setVocabMode(wantV ? 'vocab' : 'sentences'); } catch (e) { } }
    my = true; restart(); landScroll();
  }
  if (document.readyState === 'complete') setTimeout(openFromHash, 400); else window.addEventListener('load', function () { setTimeout(openFromHash, 400); });
  window.addEventListener('hashchange', openFromHash);

  // ---- deep link landing (#ep= keeps working): the chosen lists on one line, steps 1 and 2 on one screen
  function landScroll() {
    var stop = false, t0 = Date.now();
    function cancel() { stop = true; }
    window.addEventListener('wheel', cancel, { once: true, passive: true }); window.addEventListener('touchstart', cancel, { once: true, passive: true });
    function place() {
      if (stop) return;
      var s1 = document.querySelector('#phrases-app .ms-step'), tl = $('gep-tiles'), vw = $('gep-view');
      if (s1 && tl) {
        var sy = window.pageYOffset, top = s1.getBoundingClientRect().top + sy, bot = (vw || tl).getBoundingClientRect().bottom + sy, ih = window.innerHeight;
        var y = Math.max(0, top - 8);
        if (bot - y > ih - 8) y = bot - ih + 12;
        if (Math.abs(y - sy) > 1) window.scrollTo(0, y);
      }
      if (Date.now() - t0 < 1500) setTimeout(function () { requestAnimationFrame(place); }, 150);
    }
    requestAnimationFrame(place);
  }
  window.gepLand = function () {
    refresh();
    var lst = $('sec-picker-list'), wrapEl = $('sec-picker-wrap'), sum = $('ep-dl-sum');
    if (lst && wrapEl && !my) {
      var ck = document.querySelectorAll('.sec-checkbox:checked'), tot = document.querySelectorAll('.sec-checkbox').length, txt = '', j;
      if (ck.length === tot) txt = 'All ' + tot + ' lists';
      else if (ck.length <= 3) { var a = []; for (j = 0; j < ck.length; j++) { var it = ck[j].closest('.sec-cb-item'); a.push(((it.querySelector('.sec-cb-code') || {}).textContent || ck[j].value) + ' ' + ((it.querySelector('.sec-cb-title') || {}).textContent || '')); } txt = a.join(' · '); }
      else { var c = []; for (j = 0; j < ck.length; j++) c.push(ck[j].value); txt = ck.length + ' lists: ' + c.join(', '); }
      if (!sum) {
        sum = document.createElement('div'); sum.id = 'ep-dl-sum';
        sum.style.cssText = 'font-size:.8125rem;font-weight:700;color:var(--navy);border:1.5px solid var(--border);border-radius:10px;background:#fff;padding:6px 12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
        sum.title = 'Tap to show the full list picker';
        sum.onclick = function () { lst.style.display = ''; sum.style.display = 'none'; var pc = wrapEl.querySelector('.sec-picker-controls'); if (pc) pc.style.display = ''; };
        wrapEl.appendChild(sum);
      }
      sum.textContent = '✓ ' + txt; sum.style.display = ''; lst.style.display = 'none'; var pc2 = wrapEl.querySelector('.sec-picker-controls'); if (pc2) pc2.style.display = 'none';
    }
    landScroll();
  };

  // ---- Spell
  var sp = null;
  function spPool() {
    var p = pool(); if (!p.length) { alert('Choose a level or lists under step 1 first.'); return null; }
    return { pool: p, n: _epCount > 0 ? Math.min(_epCount, p.length) : p.length };
  }
  function label() { if (my) return 'My personalised set'; var ck = getCheckedSections(), tot = document.querySelectorAll('.sec-checkbox').length; return ck.length === tot ? 'All lists' : ck.length === 1 ? (SECTION_TITLES[ck[0]] || ck[0]) : ck.length + ' lists'; }
  window.apSpell = function () {
    var p = spPool(); if (!p) return;
    sp = { d: shuf(p.pool).slice(0, p.n), i: 0, ok: 0, near: 0, bad: 0, miss: [], rev: false, label: label(), L: foreign(), v: isV() };
    spCard();
  };
  function spCard() {
    if (sp.i >= sp.d.length) return spEnd();
    var c = sp.d[sp.i]; sp.rev = false;
    ov(head('✍ Spell', esc(sp.label) + ' · card ' + (sp.i + 1) + ' of ' + sp.d.length) + '<div class="ms-bar"><div style="width:' + Math.round(sp.i / sp.d.length * 100) + '%"></div></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpListen()">🔊 Listen</button><button class="ms-b" onclick="apSpHint()">Show meaning</button></div>'
      + '<div class="ms-big" id="ms-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(show(c, 'en')) + '</div>'
      + '<textarea id="ms-in" class="ms-in" rows="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="' + sp.L + '" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpCheck()">Check</button></div><div id="ms-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apSpCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apSpMark('bad'); return true; } if (e.key === 'ArrowDown') { apSpMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apSpMark('ok'); return true; }
      return false;
    });
    apSpListen(); var i = $('ms-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  }
  window.apSpListen = function () { var c = sp.d[sp.i]; speak(say(c, sp.L), LANG_CODES[sp.L]); };
  window.apSpHint = function () { var m = $('ms-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  window.apSpCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm($('ms-in').value), ans = say(c, sp.L).replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/) : [], bad = 0, acc = 0;
    var words = ans.split(/\s+/).map(function (w) {
      var k = w.toLowerCase(); if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      var kw = k.replace(/[,.;:!?¿¡]+$/, '').replace(/^[¿¡]+/, '');
      if (tw.indexOf(k) >= 0 || tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(k) || noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc && tw.length === ans.split(/\s+/).length ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    $('ms-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + '<div class="ms-note" style="text-align:center">' + esc(show(c, 'en')) + '</div>'
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apSpMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apSpMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apSpMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = $('ms-in'); if (i) i.blur();
  };
  window.apSpMark = function (r) {
    var c = sp.d[sp.i]; record(c, r, sp.v); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length;
    ov(head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(show(c, sp.L)) + '</div><div class="e">' + esc(show(c, 'en')) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apSpell()">↻ Again</button><button class="ms-b" onclick="apMsClose()">Back</button></div>');
    keys(function () { return false; });
  }

  // ---- Match (six pairs: the phrases are long)
  var mm = null;
  window.apMatch = function () {
    var p0 = pool(); if (!p0.length) { alert('Choose a level or lists under step 1 first.'); return; }
    var L = foreign(), seen = {}, u = [];
    p0.forEach(function (c) { var a = say(c, 'en').toLowerCase(), b = say(c, L).toLowerCase(); if (seen[a] || seen[b]) return; seen[a] = seen[b] = 1; u.push(c); });
    if (u.length < 3) { alert('Match needs at least 3 different phrases in the selection.'); return; }
    var d = shuf(u).slice(0, 6);
    mm = { d: d, L: L, en: shuf(d.map(function (_, i) { return i; })), fr: shuf(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: label() };
    ov(head('🧩 Match', esc(mm.label) + ' · tap an English phrase, then its ' + LANG_NAMES[L]) + '<div class="ms-time" id="ms-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-e' + i + '" onclick="apMatchTap(\'e\',' + i + ')">' + esc(say(d[i], 'en')) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-f' + i + '" onclick="apMatchTap(\'f\',' + i + ')">' + esc(say(d[i], L)) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" id="ms-mnote" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = $('ms-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apMatchTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = $('ms-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') { try { speak(say(mm.d[i], mm.L), LANG_CODES[mm.L]); } catch (e) { } }
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
        + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apMatch()">↻ Another 6</button><button class="ms-b" onclick="apMsClose()">Back</button></div>');
      keys(function () { return false; });
    }, 500);
  }

  build(); refresh();
  try { restart(); } catch (e) { }
})();
