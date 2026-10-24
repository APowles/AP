(function () {
  'use strict';
  var KEY = 'apve_myset_v1';
  var S = { c: {}, due: {}, f: 'all' }, note = '', setOpen = false, SEL = '';   // SEL: '' (nothing chosen) | 'lists' | 'my'
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function $(id) { return document.getElementById(id); }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function modeCh() { return vocabMode === 'vocab' ? 'v' : 's'; }
  function arr(m) { return m === 'v' ? VOCAB_PHRASES : ALL_PHRASES; }
  var MAPS = null;
  function maps() {
    if (MAPS) return MAPS; MAPS = { s: {}, v: {} };
    ALL_PHRASES.forEach(function (p) { MAPS.s[p.sec + '~' + p.n] = p; });
    VOCAB_PHRASES.forEach(function (p) { MAPS.v[p.sec + '~' + p.n] = p; });
    return MAPS;
  }
  function kOf(p, m) { return (m || p._m || modeCh()) + '~' + p.sec + '~' + p.n; }
  function phraseOf(k) { var a = k.split('~'); return maps()[a[0]] && maps()[a[0]][a[1] + '~' + a[2]]; }
  function dueNow(k) { var d = S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function ids() { return Object.keys(S.c).filter(phraseOf); }
  function idsMode(m) { return ids().filter(function (k) { return k.charAt(0) === m; }); }
  function dueCount() { return idsMode(modeCh()).filter(dueNow).length; }
  function lvl(k) { return (S.c[k] && S.c[k].l) || 2; }
  function myPool() {
    return idsMode(modeCh()).filter(function (k) { var l = lvl(k); return S.f === 'all' ? true : S.f === 'due' ? dueNow(k) : S.f === '3' ? l === 3 : l >= 2; }).map(phraseOf);
  }

  // ---- marking in any drill feeds the personalised set
  function record(p, res) {
    if (!p || p.n == null || !p.sec) return;
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

  // ---- what is chosen
  var g0 = window.getSelectedPhrases;
  window.getSelectedPhrases = function () {
    try { if (_veSpeed) return g0.apply(this, arguments); } catch (e) { }
    if (SEL === 'my') return myPool();
    if (SEL !== 'lists') return [];
    return g0.apply(this, arguments);
  };
  function foreign() { return mixTarget(); }
  function usable() { return !!SEL && window.getSelectedPhrases().length > 0; }
  function secLabel() {
    if (SEL === 'my') return 'my personalised set';
    var s = $('sel-section'), g = $('sel-group'), a = $('sel-area'); if (!s) return '';
    var v = s.value;
    if (v === 'CUSTOM') return SECTION_TITLES.CUSTOM || 'Custom selection';
    if (v.indexOf('ALL_') === 0) return 'All of ' + v.slice(4);
    if (v === 'ALL') { if (g.value.indexOf('ALL_') === 0) return 'All of Area ' + g.value.slice(4); return a.value === 'ALL' ? 'All areas' : 'Area ' + a.value; }
    return s.selectedIndex >= 0 ? s.options[s.selectedIndex].text : v;
  }
  var ICONS = {};
  var TILES = [
    ['ms-drill', 'drill', 'Drill', 'Cards one at a time. You mark yourself ✗ ~ ✓.', 'apDrill()'],
    ['ms-speed', 'speed', 'Speed Challenge', 'Race the clock, solo or in teams.', 'openVocabChallenge()'],
    ['ms-spell', 'spell', 'Spell', 'Hear it and write it. Accents count.', 'apSpell()'],
    ['ms-match', 'match', 'Match', 'Pair six English and foreign phrases against the clock.', 'apMatch()'],
    ['ms-leis', 'leis', 'Leisure Mode', 'Just press play and let it all wash over you.', 'startLeisureMode()'],
    ['ms-test', 'test', 'Test', 'Make a test to print or do on screen.', 'showIGCSETestPanel()']
  ];
  function iconFor(k) { var l = foreign(); if (k === 'spell' || k === 'match') return ICONS[k + '_' + (l === 'it' || l === 'es' ? l : 'fr')] || ICONS[k + '_fr']; return ICONS[k]; }
  window.apDrill = function () { if (!usable()) return; startQuickDrill(_veCount === -1 ? -1 : _veCount); };

  // ---- build the new layout once
  var built = false, det = null;
  function build() {
    var card = document.querySelector('.ve-setup'); if (!card || built) return; built = true;
    card.setAttribute('data-ms', '1');
    var kids = [].slice.call(card.children), G = { dir: [], mix: [], head: null, modes: null, lists: null, cards: [], timer: [] }, cur = '';
    var h2 = card.querySelector('.aph-h'), banner = card.querySelector('.aph-banner'), stack = card.querySelector('.aph-stack'), keysEl = card.querySelector('.aph-keys'), audio = card.querySelector('.ve-audio');
    kids.forEach(function (e) {
      var t = e.classList.contains('aph-label') ? e.textContent.trim() : '';
      if (e === h2 || e === banner || e === stack || e === keysEl || e === audio) return;
      if (/^Direction/i.test(t)) cur = 'dir'; else if (/^Mix both ways/i.test(t)) cur = 'mix'; else if (/^Cards per session/i.test(t)) cur = 'cards'; else if (/^Timer per card/i.test(t)) cur = 'timer';
      if (e.classList.contains('ve-what-head')) { G.head = e; cur = ''; return; }
      if (e.querySelector && e.querySelector('#modeBtn_sentences')) { G.modes = e; cur = ''; return; }
      if (e.classList.contains('ve-lists')) { G.lists = e; cur = ''; return; }
      if (cur && G[cur]) G[cur].push(e);
    });
    // reset the list pickers: nothing is chosen until the boy chooses
    var a = $('sel-area'), gr = $('sel-group'), se = $('sel-section');
    a.insertAdjacentHTML('afterbegin', '<option value="" disabled>Choose an area…</option>'); a.value = '';
    gr.innerHTML = '<option value="" disabled selected>then a group</option>'; se.innerHTML = '<option value="" disabled selected>then a list</option>';
    var s1 = document.createElement('div'); s1.className = 'ms-step'; s1.innerHTML = '<span class="ms-num">1</span>What do you want to practise?';
    var s2 = document.createElement('div'); s2.className = 'ms-step'; s2.innerHTML = '<span class="ms-num">2</span>How do you want to practise it?';
    det = document.createElement('details'); det.className = 'ms-opts'; det.open = false; det.addEventListener('toggle', function () { setOpen = det.open; });
    var sum = document.createElement('summary'); sum.innerHTML = '<span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small id="ms-sum"></small><span class="ms-chg"></span>'; det.appendChild(sum);
    G.cards.concat(G.timer).forEach(function (e) { det.appendChild(e); });
    var auto = $('autotimeBtn');
    if (auto) { var ar = document.createElement('div'); ar.className = 'aph-row'; ar.appendChild(auto); var an = document.createElement('div'); an.className = 'aph-note'; an.style.margin = '0 0 4px'; an.textContent = 'Autotime: in Leisure Mode the pause adapts to the length of each phrase.'; det.appendChild(ar); det.appendChild(an); }
    G.dir.concat(G.mix).forEach(function (e) { det.appendChild(e); });
    det.insertAdjacentHTML('beforeend', '<div class="aph-note" style="margin:6px 0 4px;line-height:1.45"><b>Direction</b> is which language you see and which you answer in. <b>Mix both ways</b>: Off = every card goes the way round chosen above. 50–50 = half the cards go English → foreign and half the other way. 70–30 = seven in ten English → foreign, three in ten the other way.</div>');
    // hide the old buttons (they stay in the page so nothing that looks for them breaks)
    if (banner) banner.classList.add('ms-hide');
    if (stack) [].slice.call(stack.children).forEach(function (e) { if (e.matches('.aph-btn-block[onclick^="veStart"],.aph-btn-block[onclick^="startLeisure"],.ve-tools2') ) e.classList.add('ms-hide'); });
    while (card.firstChild) card.removeChild(card.firstChild);
    card.appendChild(h2);
    if (banner) card.appendChild(banner);
    card.appendChild(s1);
    if (G.modes) { G.modes.classList.add('ms-typerow'); card.appendChild(G.modes); }
    if (G.head) card.appendChild(G.head);
    if (G.lists) card.appendChild(G.lists);
    var my = document.createElement('div'); my.id = 'ms-my'; card.appendChild(my);
    var now = document.createElement('div'); now.className = 'ms-now'; now.id = 'ms-now'; card.appendChild(now);
    card.appendChild(s2); card.appendChild(det);
    var tl = document.createElement('div'); tl.className = 'aph-tools ms-tiles ve-tools2'; tl.id = 'ms-tiles'; card.appendChild(tl);
    if (stack) card.appendChild(stack);
    if (keysEl) card.appendChild(keysEl);
    if (audio) card.appendChild(audio);
  }

  function myBox() {
    var nS = idsMode('s').length, nV = idsMode('v').length, tot = nS + nV, on = SEL === 'my', dc = dueCount();
    var fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']];
    var cnt = tot ? nS + ' practice sentence' + (nS === 1 ? '' : 's') + ' · ' + nV + ' vocab item' + (nV === 1 ? '' : 's') : 'Empty so far';
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (tot || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apMySetUse()" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note">' + cnt + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apMySetHelp()">? How does this work?</button></div>'
      + (tot || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apMySetEdit()">✎ Edit</button><button class="ms-b sm" onclick="apMySetLink()">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (S.f === x[0] ? ' on' : '') + '" onclick="apMySetFilter(\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (on ? '<div class="ms-note">The Practice Sentences / Vocab Items buttons above choose which part of your set you practise.</div>' : '')
      + (note || !tot ? '<div class="ms-note">' + (note ? '<b>' + esc(note) + '</b> ' : '') + (!tot ? 'Phrases you mark ✗ Major error in any drill join it automatically.' : '') + '</div>' : '') + '</div>';
  }

  function refresh() {
    build(); if (!built) return;
    var pool = SEL ? window.getSelectedPhrases().length : 0, ok = !!SEL && pool > 0, my = SEL === 'my';
    var pc = $('phrase-count'); if (pc) pc.style.display = SEL ? '' : 'none';
    var typ = vocabMode === 'vocab' ? 'vocab items' : 'practice sentences';
    var now = $('ms-now');
    if (now) now.innerHTML = !SEL ? 'Choose a list above to unlock the ways to practise it.' : (!pool ? (my ? (S.f === 'all' ? 'Nothing in this part of your set yet (' + typ + ').' : 'No cards match this filter yet.') : 'This selection has no ' + typ + '.') : 'Practising: <b>' + esc(secLabel()) + '</b> · ' + pool + ' ' + typ);
    var mb = $('ms-my'); if (mb) mb.innerHTML = myBox();
    var f = getLangFrom(), t = getLangTo();
    var sm = $('ms-sum'); if (sm) sm.textContent = (_veCount === -1 ? 'All cards' : _veCount + ' cards') + ' · ' + timerSecs + 's a card · ' + (mixMode ? 'Mix English ↔ ' + LANG_NAMES[mixTarget()] + ' ' + mixShare() : LANG_NAMES[f] + ' → ' + LANG_NAMES[t]) + (isAutotime ? ' · Autotime on' : '');
    if (det) det.open = setOpen;
    var tl = $('ms-tiles'); if (tl) tl.innerHTML = TILES.map(function (x) {
      var off = !ok || (my && x[1] === 'speed');
      var d = x[3]; if (my && x[1] === 'speed') d = 'Works on whole lists, so not on a personalised set.';
      return '<button class="ms-tile ' + x[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + x[4] + '"><img class="ms-img" alt="" src="' + iconFor(x[1]) + '"><span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + d + '</span></span></button>';
    }).join('');
  }

  function wrap(name, fn) { var o = window[name]; if (typeof o !== 'function') return; window[name] = function () { return fn.call(this, o, arguments); }; }
  function endMy() { var o = $('sel-area').querySelector('option[value="CUSTOM"]'); if (o && SEL !== 'my') o.textContent = 'Custom'; }
  wrap('onAreaChange', function (o, a) {
    var v = $('sel-area').value;
    if (v === '') return;
    if (v === 'CUSTOM') {
      if (SEL === 'my') return;
      if (!(typeof tsSelected !== 'undefined' && tsSelected.size)) return o.apply(this, a);   // opens the Choose lists box
    }
    SEL = 'lists'; endMy(); var r = o.apply(this, a); refresh(); return r;
  });
  wrap('onGroupChange', function (o, a) { SEL = 'lists'; endMy(); var r = o.apply(this, a); refresh(); return r; });
  wrap('onSectionChange', function (o, a) { SEL = 'lists'; endMy(); var r = o.apply(this, a); refresh(); return r; });
  wrap('selectTopic', function (o, a) { SEL = 'lists'; endMy(); var r = o.apply(this, a); refresh(); return r; });
  wrap('applyCustomSelection', function (o, a) {
    if (typeof tsSelected === 'undefined' || !tsSelected.size) return o.apply(this, a);
    SEL = 'lists'; var r = o.apply(this, a); var op = $('sel-area').querySelector('option[value="CUSTOM"]'); if (op) op.textContent = 'Custom'; refresh(); return r;
  });
  ['updatePhraseCount', 'setVocabMode', 'renderIntro', 'setMix', 'onLangChange', 'swapLangs', 'veSetCount', 'adjustTimer', 'toggleAutotime'].forEach(function (n) {
    wrap(n, function (o, a) { var r = o.apply(this, a); try { refresh(); } catch (e) { } return r; });
  });

  window.apMySetUse = function () {
    SEL = 'my'; note = '';
    var a = $('sel-area'), op = a.querySelector('option[value="CUSTOM"]');
    if (!op) { op = document.createElement('option'); op.value = 'CUSTOM'; a.appendChild(op); }
    op.textContent = '★ My personalised set'; SECTION_TITLES.CUSTOM = 'My personalised set'; a.value = 'CUSTOM';
    $('sel-group').innerHTML = '<option value="CUSTOM">personalised</option>';
    $('sel-section').innerHTML = '<option value="CUSTOM">My personalised set</option>';
    updatePhraseCount(); restart();
  };
  window.apMySetFilter = function (f) { S.f = f; save(); updatePhraseCount(); restart(); };

  // ---- overlays
  var keyH = null, mt = null;
  function ov(inner) { closeOv(); var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ms-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild; }
  function closeOv() { var o = $('ms-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } try { speechSynthesis.cancel(); } catch (e) { } }
  window.apMsClose = function () { closeOv(); refresh(); };
  function head(t, sub) { return '<div class="ms-head"><h2>' + t + '</h2><button class="ms-x" style="width:auto;padding:0 16px;font-size:1rem;font-weight:700" onclick="apMsClose()" aria-label="Back">← Back</button></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apMsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }
  function say(t, L) { try { speak(t, LANG_CODES[L] || 'fr-FR'); } catch (e) { } }

  window.apMySetHelp = function () {
    ov(head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the phrases and words you find hardest. You do not have to build it: it builds itself.</p>'
      + '<p><b>How do they get in?</b> Do any drill. Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> press <b>★ My personalised set</b>. Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell, Match, Leisure Mode or Test, exactly as normal but only on your tricky ones. Your set keeps Practice Sentences and Vocab Items apart: the two buttons above the lists choose which you practise.</p>'
      + '<p><b>Hard, Tricky, Easier.</b> Every ✗ card goes in as Hard. Press <b>✎ Edit</b> to change a level or take one out. Then you can practise just the Hard ones.</p>'
      + '<p><b>Due today.</b> A card you missed comes back after 1 day, then 3 days, then 7. Get it right each time and it stops coming back.</p>'
      + '<p><b>Keep it safe.</b> Press <b>🔗 Save my personalised set</b>, copy the link and paste it into OneNote. Tap that link on any device and your set is back. It is also kept on this iPad, but the link is the safe copy.</p>'
      + '<p><b>Speed Challenge</b> works on whole lists, so it is not available for a personalised set.</p></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apMsClose()">Got it</button></div>');
    keys(function () { return false; });
  };

  // ---- Edit
  window.apMySetEdit = function () { editView(); };
  function showT(p, l) { return plain(p[l]); }
  function editView() {
    var L = foreign(), rows = ids().sort(function (a, b) { return lvl(b) - lvl(a); });
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' };
    ov(head('✎ Personalised set', 'Tap a level to change it. ✕ takes a card out. ' + rows.length + ' in all.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (k) { var p = phraseOf(k), l = lvl(k); return '<div class="ms-li"><div><div class="f">' + esc(showT(p, L)) + '</div><div class="e">' + esc(showT(p, 'en')) + ' · ' + (k.charAt(0) === 'v' ? 'vocab item' : 'practice sentence') + ' ' + esc(p.sec) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" onclick="apMsLv(\'' + k + '\')">' + lv[l] + '</button><button class="ms-lv" onclick="apMsDel(\'' + k + '\')" aria-label="Remove">✕</button></div></div>'; }).join('') : '<div class="ms-note">Nothing yet.</div>') + '</div>');
    keys(function () { return false; });
  }
  function redo() { var y = $('ms-ov').scrollTop; editView(); $('ms-ov').scrollTop = y; }
  window.apMsLv = function (k) { var l = lvl(k); S.c[k].l = l === 3 ? 1 : l + 1; save(); redo(); };
  window.apMsDel = function (k) { delete S.c[k]; delete S.due[k]; save(); redo(); };

  // ---- Save / open link
  function linkText() { return location.href.replace(/[#?].*$/, '') + '#vemy=' + ids().map(function (k) { return k + '~' + lvl(k); }).join(','); }
  window.apMySetLink = function () {
    var n = ids().length;
    ov(head('🔗 Save my personalised set') + (n ? '<p class="ms-note" style="font-size:1rem">Paste this link into OneNote. Opening it, on any device, brings back these ' + n + ' cards. It is also kept on this iPad automatically.</p><textarea id="ms-link" class="ms-ta" readonly>' + esc(linkText()) + '</textarea><div class="ms-cen"><button class="ms-b pri" onclick="apMsCopy()">Copy link</button></div><div class="ms-note" id="ms-copied" style="text-align:center"></div>' : '<p class="ms-note" style="font-size:1rem">Nothing to save yet. Mark some cards ✗ in a drill first.</p>'));
    keys(function () { return false; });
    var t = $('ms-link'); if (t) { t.focus(); t.select(); }
  };
  window.apMsCopy = function () {
    var t = $('ms-link'), m = $('ms-copied'); t.focus(); t.select();
    var done = function () { m.textContent = 'Copied. Now paste it into OneNote.'; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t.value).then(done, function () { document.execCommand('copy'); done(); }); return; } } catch (e) { }
    try { document.execCommand('copy'); done(); } catch (e) { m.textContent = 'Press and hold the link, then choose Copy.'; }
  };
  function land() {
    var stop = false, h = function () { stop = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, h, { once: true, passive: true }); });
    [0, 60, 150, 300, 500, 800, 1200].forEach(function (d) {
      setTimeout(function () {
        if (stop) return;
        try {
          var hd = document.querySelector('.ve-setup .aph-h'), tl = $('ms-tiles'); if (!hd || !tl) return;
          var sy = window.pageYOffset || 0, hT = hd.getBoundingClientRect().top + sy, tB = tl.getBoundingClientRect().bottom + sy;
          var y = Math.max(0, Math.min(tB + 4 - window.innerHeight, hT)); if (Math.abs(y - sy) > 1) window.scrollTo(0, y);
        } catch (e) { }
      }, d);
    });
  }
  function openFromHash() {
    var m = /^#vemy=([^&]*)/.exec(location.hash || ''); if (!m) return;
    var hc = $('home-controls'); if (!hc || hc.style.display === 'none') { location.reload(); return; }
    var got = 0, miss = 0, cs = 0, cv = 0;
    m[1].split(',').forEach(function (x) {
      var a = x.split('~'); if (a.length < 4) return; var k = a[0] + '~' + a[1] + '~' + a[2], l = parseInt(a[3], 10); if (!(l >= 1 && l <= 3)) l = 2;
      if (a[0] !== 's' && a[0] !== 'v') return;
      if (!phraseOf(k)) { miss++; return; } var o = S.c[k]; S.c[k] = { l: Math.max(o ? o.l || 1 : 1, l) }; if (!S.due[k]) S.due[k] = { b: 0, d: today() }; got++; if (a[0] === 's') cs++; else cv++;
    });
    S.f = 'all'; save();
    note = got + ' card' + (got === 1 ? '' : 's') + ' loaded' + (miss ? ' (' + miss + ' no longer in the lists)' : '') + '.';
    if (cv > cs && vocabMode !== 'vocab') setVocabMode('vocab'); else if (cs >= cv && vocabMode !== 'sentences') setVocabMode('sentences');
    apMySetUse(); land();
  }
  if (document.readyState === 'complete') setTimeout(openFromHash, 400); else window.addEventListener('load', function () { setTimeout(openFromHash, 400); });
  window.addEventListener('hashchange', openFromHash);

  // ---- Spell
  var sp = null;
  function poolNow(what) {
    if (!usable()) { alert('Choose a list under 1 · What do you want to practise? first.'); return null; }
    var pool = window.getSelectedPhrases(); if (!pool.length) { alert('No phrases available for this selection.'); return null; }
    return pool;
  }
  window.apSpell = function () {
    var pool = poolNow(); if (!pool) return;
    var n = _veCount > 0 ? Math.min(_veCount, pool.length) : pool.length;
    sp = { d: shuffle(pool).slice(0, n), i: 0, ok: 0, near: 0, bad: 0, miss: [], rev: false, label: secLabel(), L: foreign(), mode: modeCh() };
    spCard();
  };
  function spCard() {
    if (sp.i >= sp.d.length) return spEnd();
    var c = sp.d[sp.i]; sp.rev = false;
    ov(head('✍ Spell', esc(sp.label) + ' · card ' + (sp.i + 1) + ' of ' + sp.d.length) + '<div class="ms-bar"><div style="width:' + Math.round(sp.i / sp.d.length * 100) + '%"></div></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpListen()">🔊 Listen</button><button class="ms-b" onclick="apSpHint()">Show meaning</button></div>'
      + '<div class="ms-big" id="ms-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(showT(c, 'en')) + '</div>'
      + '<textarea id="ms-in" class="ms-in" rows="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="' + sp.L + '" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpCheck()">Check</button></div><div id="ms-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apSpCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apSpMark('bad'); return true; } if (e.key === 'ArrowDown') { apSpMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apSpMark('ok'); return true; }
      return false;
    });
    apSpListen(); var i = $('ms-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  }
  window.apSpListen = function () { var c = sp.d[sp.i]; say(plain(c[sp.L]), sp.L); };
  window.apSpHint = function () { var m = $('ms-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function strip(w) { return w.replace(/^[¿¡"'(]+|[,.;:!?…)"']+$/g, ''); }
  window.apSpCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm($('ms-in').value), ans = plain(c[sp.L]).replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/).map(strip).filter(Boolean) : [], bad = 0, acc = 0, aw = ans.split(/\s+/).filter(function (w) { return strip(w) !== ''; });
    var words = aw.map(function (w) {
      var kw = strip(w.toLowerCase()); if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      if (tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc && tw.length === aw.length ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    $('ms-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + '<div class="ms-note" style="text-align:center">' + esc(showT(c, 'en')) + '</div>'
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apSpMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apSpMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apSpMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = $('ms-in'); if (i) i.blur();
  };
  window.apSpMark = function (r) {
    var c = sp.d[sp.i]; record(Object.assign({ _m: sp.mode }, c), r); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length;
    ov(head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(showT(c, sp.L)) + '</div><div class="e">' + esc(showT(c, 'en')) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apSpell()">↻ Again</button><button class="ms-b" onclick="apMsClose()">← Back</button></div>');
    keys(function () { return false; });
  }

  // ---- Match (six pairs)
  var mm = null, BEST = 'apve_match_best';
  window.apMatch = function () {
    var pool = poolNow(); if (!pool) return;
    var L = foreign(), seen = {}, u = [];
    pool.forEach(function (c) { var a = plain(c.en).toLowerCase(), b = plain(c[L]).toLowerCase(); if (seen[a] || seen[b]) return; seen[a] = seen[b] = 1; u.push(c); });
    if (u.length < 3) { alert('Match needs at least 3 different phrases in the selection.'); return; }
    var d = shuffle(u).slice(0, 6);
    mm = { d: d, L: L, en: shuffle(d.map(function (_, i) { return i; })), fr: shuffle(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: secLabel() };
    ov(head('🧩 Match', esc(mm.label) + ' · tap an English phrase, then its ' + LANG_NAMES[L]) + '<div class="ms-time" id="ms-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-e' + i + '" onclick="apMatchTap(\'e\',' + i + ')">' + esc(plain(d[i].en)) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-f' + i + '" onclick="apMatchTap(\'f\',' + i + ')">' + esc(plain(d[i][L])) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" id="ms-mnote" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = $('ms-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apMatchTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = $('ms-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') say(plain(mm.d[i][mm.L]), mm.L);
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
        + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apMatch()">↻ Another 6</button><button class="ms-b" onclick="apMsClose()">← Back</button></div>');
      keys(function () { return false; });
    }, 500);
  }

  build(); refresh();
})();
