(function () {
  'use strict';
  /* ===== Italian Verbs: two-step set-up (1 What / 2 How), Settings bar, picture tiles, personalised set ===== */
  var KEY = 'apiv_myset_v1', BEST = 'apiv_match_best', HASH = '#ivset=';
  var S = { c: {}, due: {}, f: 'all' }, note = '', setOpen = false;
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function sh(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function $(i) { return document.getElementById(i); }
  function hash(s) { var h = 5381; s = String(s); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

  // ---- what has been chosen under step 1
  var msDoor = null;            // 'core' | 'all' (which start-screen door was opened)
  var msCore = new Set();       // the 100 Core Verbs groups the boy has ticked (none at first)
  var msSetPick = false;        // All Verbs door: has he picked a verb set yet?
  var msMy = false, tenseBak = null;
  var GRP = [['E1', 'Essential 1', 'the first 20 verbs', 20], ['E2', 'Essential 2', 'the second 20 verbs', 20], ['I', 'Important', 'the next 30 verbs', 30], ['U', 'Useful', 'the last 30 verbs', 30]];
  var SETS = [['allv', 'All Verbs', 'the 100 Core Verbs and the rest'], ['structures', 'Specialist Verb Structures', 'set phrases such as approfittare di X'], ['both', 'Both', 'all verbs and the structures']];
  var KINDS = [['single', 'Single form', 'One English form, give the Italian', 's'], ['full', 'Full (6 forms)', 'See the English, say all six persons', 'f'], ['infinitives', 'Infinitives', 'What is the Italian infinitive?', 'i'], ['sentences', 'Sentences', 'Gap-fill sentences', 'z']];
  var TNAME = { PRESENT: 'Present', FUTURE: 'Future', PP: 'Perfect', IMPERFECT: 'Imperfect', COND: 'Conditional', PRES_SUBJ: 'Pres. Subj.', IMP_SUBJ: 'Imp. Subj.', PR: 'Past Hist.', PLUPERFECT: 'Pluperfect', FUT_ANT: 'Future Perf.', COND_PASSE: 'Cond. Perf.', INFINITIVE: 'Infinitives', SET: 'Set structure' };
  function msIsMy() { return msMy && apHome === 'setup'; }
  function verbsChosen() { return msMy || (msDoor === 'core' ? msCore.size > 0 : msDoor === 'all' ? msSetPick : false); }
  function tensesOK() { return mode === 'infinitives' || selectedTenses.size > 0; }
  function kindKey(m) { for (var i = 0; i < KINDS.length; i++) if (KINDS[i][0] === m) return KINDS[i][3]; return 's'; }

  // ---- personalised set: keys, lookup
  var VIDX = null, SIDX = null, INFC = {};
  function gk(v) { return v && v.group === 'structures' ? 'S' : 'V'; }
  function vh(v) { return hash((v.en || '') + '|' + (v.usage_en || '')); }
  function buildIdx() {
    if (VIDX) return; VIDX = {}; SIDX = {};
    (typeof liveVerbs !== 'undefined' ? liveVerbs : VERBS).forEach(function (v) { var k = gk(v) + '~' + v.inf + '~' + v.tense + '~' + vh(v); if (!VIDX[k]) VIDX[k] = v; });
    SENTENCES.forEach(function (s) { var k = 'z~' + gk(s) + '~' + s.inf + '~' + s.tense + '~' + s.pi + '~' + s.answer; if (!SIDX[k]) SIDX[k] = s; });
  }
  function keyOf(it) {
    if (!it) return null;
    if (it.isInfinitive) return 'i~' + gk(it) + '~' + it.inf;
    if (it.verb && it.personIdx != null) return 's~' + gk(it.verb) + '~' + it.verb.inf + '~' + it.verb.tense + '~' + vh(it.verb) + '~' + it.personIdx;
    if (it.pre != null && it.answer != null) return 'z~' + gk(it) + '~' + it.inf + '~' + it.tense + '~' + it.pi + '~' + it.answer;
    if (it.forms && it.tense) return 'f~' + gk(it) + '~' + it.inf + '~' + it.tense + '~' + vh(it);
    return null;
  }
  function mkInf(g, inf) {
    var ck = g + '~' + inf; if (INFC[ck]) return INFC[ck];
    var any = null, pres = null, set = null;
    (typeof liveVerbs !== 'undefined' ? liveVerbs : VERBS).forEach(function (v) { if (v.inf !== inf || gk(v) !== g) return; any = any || v; if (v.tense === 'PRESENT' && !pres) pres = v; if (v.tense === 'SET' && !set) set = v; });
    var r = null;
    if (g === 'S') { var s = set || any; if (s) r = { en: s.en, tense: 'INFINITIVE', inf: inf, forms: [inf], note: s.note, usage_en: s.usage_en, usage_it: s.usage_it, isInfinitive: true, group: 'structures' }; }
    else { var p = pres || any; if (p) r = { en: p.en, tense: 'INFINITIVE', inf: inf, forms: [inf], note: p.note, usage_en: p.usage_en, usage_it: p.usage_it, isInfinitive: true }; }
    INFC[ck] = r; return r;
  }
  function resolve(k) {
    buildIdx(); var a = k.split('~'), t = a[0];
    if (t === 'i') return mkInf(a[1], a.slice(2).join('~'));
    if (t === 'z') return SIDX[k] || null;
    if (t === 'f') { return VIDX[a.slice(1).join('~')] || null; }
    if (t === 's') { var pi = parseInt(a[a.length - 1], 10), v = VIDX[a.slice(1, a.length - 1).join('~')]; return v && v.forms && v.forms[pi] ? { verb: v, personIdx: pi } : null; }
    return null;
  }
  function ids() { return Object.keys(S.c); }
  function dueNow(k) { var d = S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function dueCount() { return ids().filter(dueNow).length; }
  function passF(k) { var l = S.c[k].l || 2; return S.f === 'all' ? true : S.f === 'due' ? dueNow(k) : S.f === '3' ? l === 3 : l >= 2; }
  function myPool(kind) { return ids().filter(function (k) { return k[0] === kind && passF(k); }).map(resolve).filter(Boolean); }
  function kindCount(kind) { return ids().filter(function (k) { return k[0] === kind; }).length; }
  function curPool() {
    if (msIsMy()) return myPool(kindKey(mode));
    if (!verbsChosen() || !tensesOK()) return [];
    return HMC.pool();
  }

  // ---- marking in any drill feeds the personalised set
  function record(card, res) {
    var k = keyOf(card); if (!k) return;
    if (res === 'bad') { S.c[k] = { l: 3 }; S.due[k] = { b: 0, d: today() + 1 }; }
    else if (res === 'ok' && S.c[k] && dueNow(k)) { var b = (S.due[k].b || 0) + 1; S.due[k] = b >= 3 ? { b: 3, d: null } : { b: b, d: today() + [1, 3, 7][b] }; }
    else return;
    save();
  }
  var m0 = window.mark;
  window.mark = function (r) {
    try { if (revealed && !isLeisureMode) { var it = deck[idx]; if (it) record(it, r === 'error' ? 'bad' : r === 'got' ? 'ok' : ''); } } catch (e) { }
    // an arrow key pressed before the answer is shown, on an Infinitives card, used to look for a verb form that is not there
    try { if (!revealed && mode !== 'sentences' && deck[idx] && deck[idx].isInfinitive) { if (timerInterval) clearInterval(timerInterval); revealInf(); return; } } catch (e) { }
    return m0.apply(this, arguments);
  };
  var sm0 = window.sentMark;
  window.sentMark = function (r) {
    try { var it = deck[idx]; if (it) record(it, r === 'error' ? 'bad' : r === 'got' ? 'ok' : ''); } catch (e) { }
    return sm0.apply(this, arguments);
  };

  // ---- the personalised set feeds the app's own drill, Leisure Mode and (via buildPool) everything that asks for cards
  var bp0 = window.buildPool;
  window.buildPool = function () { return msIsMy() ? myPool(kindKey(mode)) : bp0.apply(this, arguments); };
  try { var lzp = LZ_APP.pool; LZ_APP.pool = function () { return msIsMy() ? myPool(kindKey(mode)) : lzp.apply(this, arguments); }; } catch (e) { }
  var sq0 = window.startQuickDrill;
  window.startQuickDrill = function (c) {
    if (!msIsMy() && (!verbsChosen() || apHome !== 'setup' || (msDoor === 'core') !== (verbMode === 'igcse'))) derive();
    if (msIsMy()) {
      var p = sh(myPool(kindKey(mode)));
      if (!p.length) { alert('Nothing in your personalised set for this kind of question yet.'); return; }
      sessionEditCount = 0; isLeisureMode = false;
      deck = c === -1 ? p : p.slice(0, Math.min(c, p.length)); idx = 0; got = 0; nearly = 0; errors = 0; total = 0; majorErrorDeck = []; reviewDeck = []; revealed = false; showCard(); return;
    }
    return sq0.apply(this, arguments);
  };
  // a drill opened from a teacher's link: work out what step 1 would have shown
  function derive() {
    msMy = false; tenseBak = null;
    if (verbMode === 'igcse') { msDoor = 'core'; msCore = new Set(vqSel); } else { msDoor = 'all'; msSetPick = true; }
  }
  function enterMy() { if (!msMy) { tenseBak = Array.from(selectedTenses); if (!selectedTenses.size) selectedTenses = new Set(['PRESENT']); } msMy = true; }
  function leaveMy() { if (msMy) { msMy = false; if (tenseBak) selectedTenses = new Set(tenseBak); tenseBak = null; } }

  // ---- door opening: nothing is preselected
  window.hmOpen = function (door) {
    apHome = 'setup'; msDoor = door; msMy = false; tenseBak = null; msCore = new Set(); msSetPick = false; note = '';
    selectedTenses = new Set(); mode = 'single';
    verbMode = door === 'core' ? 'igcse' : 'allv';
    try { vqSync('ALL'); } catch (e) { }
    renderIntro();
  };
  window.msGrp = function (g) {
    leaveMy();
    var n = new Set(msCore); if (n.has(g)) n.delete(g); else n.add(g); msCore = n; applyCore();
  };
  window.msGrpSet = function (w) { leaveMy(); msCore = new Set(w === 'E' ? ['E1', 'E2'] : ['E1', 'E2', 'I', 'U']); applyCore(); };
  function applyCore() {
    if (msCore.size) { vqSel = new Set(msCore); vqTier = VQ_CAN[['E1', 'E2', 'I', 'U'].filter(function (x) { return msCore.has(x); }).join(',')] || 'SEL'; }
    vqRefresh();
  }
  window.msPickSet = function (k) { leaveMy(); msSetPick = true; HMC.setSet(k); };
  window.msKind = function (m) { hmMode(m); };
  window.msTense = function (t) { introToggleTense(t); };
  window.msTg = function (d) { setOpen = d.open; };
  window.msSum = function () { var e = document.querySelector('.ms-sumtxt'); if (e) e.textContent = sumText(); };
  window.msTimer = function (d) { adjustTimer(d); msSum(); };
  window.msDrill = function () { startQuickDrill(_selectedCount); };
  window.msTest = function () {
    if (mode === 'infinitives') selectedTenses = new Set(selectedTenses).add('INFINITIVE');
    window._itSentTab = (mode === 'sentences');
    if (mode === 'sentences') {   // the sentence test starts from what step 1 chose
      var ts = new Set(); selectedTenses.forEach(function (t) { ts.add(t === 'INFINITIVE' ? 'SET' : t); });
      if (ts.size) window._sentTestTenses = ts;
      window._sentTestVerbSet = verbMode; window._sentTestReg = regFilter;
    }
    showTestPanel();
    var out = $('testOut');
    if (mode === 'sentences') generateSentenceTest(out); else generateTest();
    if (out && out.scrollIntoView) out.scrollIntoView({ behavior: 'smooth' });
  };

  // the on-screen test never shows its answer sheet until it is asked for
  var gt0 = window.generateTest;
  window.generateTest = function () {
    var r = gt0.apply(this, arguments);
    try {
      var out = $('testOut'), labs = out ? out.querySelectorAll('.vb-out-label') : [], lab = labs[1], box = lab && lab.nextElementSibling;
      if (lab && box) {
        lab.style.display = 'none'; box.style.display = 'none';
        var b = document.createElement('button'); b.className = 'aph-btn aph-btn-sm'; b.id = 'ms-showans'; b.style.marginTop = '12px'; b.textContent = '👁 Show answers';
        b.onclick = function () { var on = box.style.display === 'none'; box.style.display = on ? '' : 'none'; lab.style.display = on ? '' : 'none'; b.textContent = on ? '🙈 Hide answers' : '👁 Show answers'; };
        lab.parentNode.insertBefore(b, lab);
      }
    } catch (e) { }
    return r;
  };

  // ---- icons and tiles
  var ICONS = {};
  var TILES = [
    ['ms-drill', 'drill', 'Drill', 'Cards one at a time. You mark yourself ✗ ~ ✓.', 'msDrill()'],
    ['ms-speed', 'speed', 'Speed Challenge', 'Race the clock, solo or in teams.', 'openConjChallenge()'],
    ['ms-spell', 'spell_it', 'Spell', 'Hear the form and write it. Accents count.', 'apSpell()'],
    ['ms-match', 'match_it', 'Match', 'Pair six English and Italian forms against the clock.', 'apMatch()'],
    ['ms-leis', 'leis', 'Leisure Mode', 'Just press play and let it all wash over you.', 'startLeisureMode()'],
    ['ms-test', 'test', 'Test', 'A test to print or do on screen. Answers stay hidden.', 'msTest()']
  ];
  function chip(on, oc, label, extra) { return '<button class="aph-chip' + (on ? ' on' : '') + '"' + (extra || '') + ' onclick="' + oc + '">' + label + '</button>'; }

  function selText() {
    var parts = [];
    var kn = KINDS.filter(function (k) { return k[0] === mode; })[0]; parts.push(kn ? kn[1] : mode);
    if (msMy) parts.push('my personalised set');
    else {
      if (msDoor === 'core') parts.push(msCore.size === 4 ? 'all 100 Core Verbs' : GRP.filter(function (g) { return msCore.has(g[0]); }).map(function (g) { return g[1]; }).join(' + '));
      else parts.push(SETS.filter(function (s) { return s[0] === verbMode; }).map(function (s) { return s[1]; })[0] || '');
      if (mode !== 'infinitives') parts.push(HMC.tenses.map(function (t) { return t[0]; }).filter(function (k) { return selectedTenses.has(k); }).map(function (k) { return HMC.tn[k] || k; }).join(', '));
    }
    return parts.filter(Boolean).join(' · ');
  }
  function sumText() {
    var reg = { regular: 'Regular only', irregular: 'Irregular only', piacere: 'Piacere type only' }[regFilter];
    return (_selectedCount === -1 ? 'All cards' : _selectedCount + ' cards') + ' · ' + timerSecs + 's a card' + (reg && !msIsMy() && mode !== 'infinitives' ? ' · ' + reg : '') + (mode === 'single' && _personFilter !== 'ALL' && !msIsMy() ? ' · ' + HMC.persons.filter(function (p) { return p[0] === _personFilter; })[0][1] : '') + (isAutotime ? ' · Autotime on' : '');
  }

  function myBox(on) {
    var n = ids().length, dc = dueCount(), fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']];
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (n || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apMySetUse()" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note" style="min-width:auto">' + n + ' card' + (n === 1 ? '' : 's') + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apMySetHelp()">? How does this work?</button></div>'
      + (n || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apMySetEdit()">✎ Edit</button><button class="ms-b sm" onclick="apMySetLink()">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (S.f === x[0] ? ' on' : '') + '" onclick="apMySetFilter(\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (note || !n ? '<div class="ms-note">' + (note ? '<b>' + esc(note) + '</b> ' : '') + (!n ? 'Empty so far. Cards you mark ✗ Major error in any drill join it automatically.' : '') + '</div>' : '') + '</div>';
  }

  function renderSetup() {
    var my = msIsMy(), core = msDoor === 'core';
    var pool = curPool(), n = pool.length, usable = verbsChosen() && tensesOK() && n > 0;
    var cards = _selectedCount === -1 ? n : Math.min(_selectedCount, n);
    // ----- step 1
    var h = '<div class="hm-top"><div class="hm-tl"><button class="hm-back" onclick="hmLand()" aria-label="Back to the start screen">&#8249; ' + HMC.title + '</button><h2 class="hm-title hm-t2">' + (my ? 'My personalised set' : core ? '100 Core Verbs' : 'All Verbs') + '</h2></div></div>';
    h += '<div class="ms-step"><span class="ms-num">1</span>What do you want to practise?</div>';
    if (!my) {
      h += '<div class="aph-label">Which verbs <span class="vb-light">' + (core ? 'tick any groups' : 'choose one') + '</span></div>';
      if (core) {
        var nSel = GRP.filter(function (g) { return msCore.has(g[0]); }).reduce(function (a, g) { return a + g[3]; }, 0);
        h += '<div class="ms-tiers">' + GRP.map(function (g) { var on = msCore.has(g[0]); return '<button class="ms-pick' + (on ? ' on' : '') + '" onclick="msGrp(\'' + g[0] + '\')"><b>' + (on ? '&#10003; ' : '') + g[1] + '</b><small>' + g[2] + '</small></button>'; }).join('') + '</div>'
          + '<div class="hm-row"><button class="hm-link" onclick="msGrpSet(\'ALL\')">All 100</button><button class="hm-link" onclick="msGrpSet(\'E\')">Essential 1 + 2 (40)</button><button class="hm-link" onclick="hmToggle(\'vlist\')">' + (hmVList ? 'Hide the verbs &#9652;' : 'See the verbs in these groups &#9662;') + '</button><span class="aph-note">' + (nSel ? nSel + ' verbs chosen' : 'none chosen yet') + '</span></div>' + (hmVList && msCore.size ? hmVerbList() : '');
      } else {
        h += '<div class="ms-tiers ms-t3">' + SETS.map(function (s) { var on = msSetPick && verbMode === s[0]; return '<button class="ms-pick' + (on ? ' on' : '') + '" onclick="msPickSet(\'' + s[0] + '\')"><b>' + (on ? '&#10003; ' : '') + s[1] + '</b><small>' + s[2] + '</small></button>'; }).join('') + '</div>';
      }
    }
    h += '<div class="aph-label">Kind of question</div><div class="ms-kinds">' + KINDS.map(function (k) {
      var on = mode === k[0], c = my ? ' <i>(' + kindCount(k[3]) + ')</i>' : '';
      return '<button class="ms-pick' + (on ? ' on' : '') + '" onclick="msKind(\'' + k[0] + '\')"><b>' + (on ? '&#10003; ' : '') + k[1] + c + '</b><small>' + k[2] + '</small></button>';
    }).join('') + '</div>';
    if (!my) {
      h += '<div class="aph-label">Which tenses <span class="vb-light">' + (core ? 'in the order we learn them' : 'tap to choose') + '</span></div>';
      if (mode === 'infinitives') h += '<div class="hm-note">Infinitives only: you see the English and give the ' + HMC.lang + ' infinitive, so tenses are not needed.</div>';
      else {
        var ts = HMC.tenses.map(function (t, i) { return { k: t[0], l: (core && i < HMC.steps ? (i + 1) + '. ' : '') + t[1] }; });
        h += '<div class="aph-row">' + chip(ts.every(function (t) { return t.k === 'PR' ? !selectedTenses.has('PR') : selectedTenses.has(t.k); }), 'selectAllTenses()', 'All') + ts.map(function (t) { return chip(selectedTenses.has(t.k), "msTense('" + t.k + "')", t.l); }).join('') + '</div>';
      }
    }
    h += '<div class="ms-or">' + (my ? 'You are practising your own tricky cards.' : 'Or practise your own tricky cards:') + '</div>' + myBox(my);
    if (my) h += '<div class="ms-brow"><button class="ms-b sm" onclick="msBackToSets()">&#8249; Choose verbs and tenses instead</button></div>';
    var lab = selText();
    var msg;
    if (!verbsChosen()) msg = 'Choose the verbs above to unlock the ways to practise them.';
    else if (!tensesOK()) msg = 'Now choose at least one tense above to unlock the ways to practise.';
    else if (!n) msg = my ? 'Nothing in your personalised set for this kind of question yet.' : 'No cards match this selection. Change the verbs or tenses above.';
    else msg = 'Practising: <b>' + esc(lab) + '</b> · ' + n + ' card' + (n === 1 ? '' : 's');
    h += '<div class="ms-now">' + msg + '</div>';
    // ----- step 2
    h += '<div class="ms-step"><span class="ms-num">2</span>How do you want to practise it?</div>';
    var counts = [10, 20, 30, 50, -1].map(function (c) { return chip(_selectedCount === c, 'setSelectedCount(' + c + ')', c === -1 ? 'All' : c); }).join('');
    var reg = HMC.regs.map(function (r) { return chip(regFilter === r[0], "introSetReg('" + r[0] + "')", r[1]); }).join('');
    var pers = HMC.persons.map(function (p) { return chip(_personFilter === p[0], "setPersonFilter('" + p[0] + "')", p[1]); }).join('');
    h += '<details class="ms-opts" ' + (setOpen ? 'open' : '') + ' ontoggle="msTg(this)"><summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small class="ms-sumtxt">' + sumText() + '</small><span class="ms-chg"></span></summary>'
      + '<div class="aph-label">Cards per session <span class="vb-count">' + n + ' available</span></div><div class="aph-row">' + counts + '</div>'
      + '<div class="aph-label">Timer per card</div><div class="aph-row"><button class="aph-step" onclick="msTimer(-2)" aria-label="Less time">&#8722;</button><span class="aph-step-val" id="intro-timer-display">' + timerSecs + 's</span><button class="aph-step" onclick="msTimer(2)" aria-label="More time">+</button></div>'
      + '<div class="aph-label">Autotime</div><div class="aph-row"><button class="aph-btn' + (isAutotime ? ' on' : '') + '" onclick="toggleAutotime();renderIntro()">⏱ Autotime: ' + (isAutotime ? 'On' : 'Off') + '</button></div><div class="aph-note" style="margin:4px 0 0">Autotime: Leisure Mode moves on by itself, with no timer bar.</div>'
      + '<div class="aph-label">Hint</div><div class="aph-row"><button class="aph-btn' + (showInfHint ? ' on' : '') + '" onclick="showInfHint=!showInfHint;renderIntro()">💡 Hint (the infinitive): ' + (showInfHint ? 'On' : 'Off') + '</button></div>'
      + (my || mode === 'infinitives' || mode === 'sentences' ? '' : '<div class="aph-label">Regularity</div><div class="aph-row">' + reg + '</div>')
      + (my || mode !== 'single' ? '' : '<div class="aph-label">Person</div><div class="aph-row">' + pers + '</div>')
      + (!my && !core ? vqRowHtml() : '')
      + (editModeUnlocked ? '<div class="aph-label">Teacher</div><div class="aph-row"><button class="aph-btn" onclick="' + HMC.printContent + '">&#128424; Print Content</button></div>' : '')
      + '</details>';
    h += '<div class="aph-tools ms-tiles">' + TILES.map(function (x) {
      var off = !usable, d = x[3];
      if (my && x[1] === 'speed') { off = true; d = 'Works on whole verb sets and tenses, so not on a personalised set.'; }
      if (my && x[1] === 'test') { off = true; d = 'Tests are built from verb sets and tenses, so not from a personalised set.'; }
      if (mode === 'sentences' && x[1] === 'match_it') { off = true; d = 'Match pairs English with Italian, so it is not used for Sentences.'; }
      return '<button class="ms-tile ' + x[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + x[4] + '"><img class="ms-img" alt="" src="' + ICONS[x[1]] + '"><span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + d + '</span></span></button>';
    }).join('') + '</div>';
    var dis = (usable && !my) ? '' : ' disabled';
    h += '<div class="ms-viewrow"><span class="aph-note" style="margin:0">More ways to be tested, or to read and print the verbs:</span>'
      + '<button class="aph-btn aph-btn-sm"' + dis + ' onclick="hmPaperSpot()">&#128424; Paper Spot Test</button>'
      + '<button class="aph-btn aph-btn-sm"' + dis + ' onclick="hmSubmittedSpot()">&#9997; Submitted Spot Test</button>'
      + (core ? '<button class="aph-btn aph-btn-sm"' + dis + ' onclick="hmPracticePaper(\'F\')">&#128221; Practice F Paper</button><button class="aph-btn aph-btn-sm"' + dis + ' onclick="hmPracticePaper(\'E\')">&#128221; Practice E Paper</button>' : '')
      + '<button class="aph-btn aph-btn-sm"' + dis + ' onclick="showVerbList()">&#128214; View &amp; Print</button></div>';
    h += '<div class="hm-keys">' + vbKeysLegend() + '</div>';
    return '<div class="ms-card intro-card hm-wrap">' + h + '</div>';
  }
  var ri0 = window.renderIntro;
  window.renderIntro = function () {
    var d = $('drill'); if (!d) return;
    if (apHome !== 'setup') { return ri0.apply(this, arguments); }
    d.classList.remove('wide');
    d.innerHTML = (msIsMy() ? '<div class="intro-card ap-landing" style="display:none" aria-hidden="true"></div>' : '') + renderSetup();   // (hidden marker: the teacher's "set this drill" button is for the normal sets only)
  };
  window.msBackToSets = function () { leaveMy(); renderIntro(); };
  window.apMySetUse = function () { enterMy(); renderIntro(); };
  window.apMySetFilter = function (f) { S.f = f; save(); renderIntro(); };

  // ---- Back: always exactly one stage
  window.aphBackHook = function () {
    try {
      var o = $('ms-ov'); if (o) { apMsClose(); return true; }
      var d = $('drill'); if (!d) return false;
      if (apHome === 'setup') {
        if (isLeisureMode) { exitLeisure(); return true; }
        if (d.querySelector('#ttab-conj')) { renderIntro(); return true; }
        if (d.querySelector('.ms-card')) { hmLand(); return true; }
        var g = false; try { g = !!(window.AP_GRAM && AP_GRAM.visible()); } catch (e) { }
        if (!g && d.querySelector('.aph-dbar,.aph-qcard,.aph-results,.lz-card')) { goHome(); return true; }
      }
    } catch (e) { }
    return false;
  };

  // the header Back button: on the set-up screen it goes back to the start screen (hidden on the start screen itself)
  try { APBK.cs.forEach(function (c) { if (c.el === $('drill')) { c.up = function () { if (apHome === 'setup') hmLand(); }; c.hide = function () { return !!c.el.querySelector('.hm-mark'); }; } }); } catch (e) { }

  // ---- overlays
  var keyH = null, mt = null;
  function ov(inner) { closeOv(); var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ms-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild; }
  function closeOv() { var o = $('ms-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } try { speechSynthesis.cancel(); } catch (e) { } }
  window.apMsClose = function () { closeOv(); if (document.querySelector('#drill .ms-card')) window.renderIntro(); };
  function head(t, sub) { return '<div class="ms-head"><h2>' + t + '</h2><button class="ms-x" onclick="apMsClose()" aria-label="Close">✕</button></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apMsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }

  // ---- labels for the edit list
  function enOf(v, pi) { try { return plain(conjEn(v.en, pi, v.tense)); } catch (e) { return plain(v.en); } }
  function formOf(v, pi) { return ((v.tense === 'PRES_SUBJ' || v.tense === 'IMP_SUBJ') ? 'che ' : '') + v.forms[pi]; }
  function labelOf(k) {
    var c = resolve(k); if (!c) return null; var t = k[0];
    if (t === 's') return [PERSONS[c.personIdx] + ' ' + formOf(c.verb, c.personIdx), enOf(c.verb, c.personIdx) + ' · ' + (TNAME[c.verb.tense] || c.verb.tense) + ' · ' + c.verb.inf];
    if (t === 'f') return [c.inf + ' · ' + (TNAME[c.tense] || c.tense) + ' (all six forms)', plain(c.en)];
    if (t === 'i') return [c.inf, plain(c.en) + ' · infinitive'];
    return [plain(sentFull(c)), (TNAME[c.tense] || c.tense) + ' · ' + c.inf + ' · sentence'];
  }

  window.apMySetHelp = function () {
    ov(head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the verb cards you find hardest. You do not have to build it: it builds itself.</p>'
      + '<p><b>How do cards get in?</b> Do any drill. Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later.</p>'
      + '<p><b>One kind at a time.</b> A card is kept in the kind of question you missed it in: a Single form, a Full (6 forms) verb, an Infinitive or a Sentence. Under <b>Kind of question</b> you see how many you have of each. Choose the same kind to practise them.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> choose <b>★ My personalised set</b>. Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell, Match or Leisure Mode, exactly as normal but only on your tricky cards.</p>'
      + '<p><b>Hard, Tricky, Easier.</b> Every ✗ card goes in as Hard. Press <b>✎ Edit</b> to change a level or take a card out. Then you can practise just the Hard ones.</p>'
      + '<p><b>Due today.</b> A card you missed comes back after 1 day, then 3 days, then 7. Get it right each time and it stops coming back.</p>'
      + '<p><b>Keep it safe.</b> Press <b>🔗 Save my personalised set</b>, copy the link and paste it into OneNote. Tap that link on any device and your set is back. It is also kept on this iPad, but the link is the safe copy.</p></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apMsClose()">Got it</button></div>');
    keys(function () { return false; });
  };

  window.apMySetEdit = function () { editView(); };
  function editView() {
    var rows = ids().map(function (k) { return { k: k, l: labelOf(k) }; }).filter(function (r) { return r.l; }).sort(function (a, b) { return (S.c[b.k].l || 2) - (S.c[a.k].l || 2); });
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' };
    ov(head('✎ Personalised set', 'Tap a level to change it. ✕ takes a card out. ' + rows.length + ' cards.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (r) { var k = r.k, l = S.c[k].l || 2; return '<div class="ms-li"><div><div class="f">' + esc(r.l[0]) + '</div><div class="e">' + esc(r.l[1]) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" data-k="' + esc(k) + '" onclick="apMsLv(this)">' + lv[l] + '</button><button class="ms-lv" data-k="' + esc(k) + '" onclick="apMsDel(this)" aria-label="Remove">✕</button></div></div>'; }).join('') : '<div class="ms-note">No cards yet.</div>') + '</div>');
    keys(function () { return false; });
  }
  function redo() { var y = $('ms-ov').scrollTop; editView(); $('ms-ov').scrollTop = y; }
  window.apMsLv = function (b) { var k = b.getAttribute('data-k'), l = S.c[k].l || 2; S.c[k].l = l === 3 ? 1 : l + 1; save(); redo(); };
  window.apMsDel = function (b) { var k = b.getAttribute('data-k'); delete S.c[k]; delete S.due[k]; save(); redo(); };

  // ---- Save / open link
  function linkText() { return location.href.replace(/[#?].*$/, '') + HASH + ids().map(function (k) { return k.split('~').map(encodeURIComponent).join('~') + '~' + (S.c[k].l || 2); }).join(','); }
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
  function openFromHash() {
    if ((location.hash || '').indexOf(HASH) !== 0) return;
    buildIdx();
    var body = location.hash.slice(HASH.length).split('&')[0], got = 0, miss = 0;
    body.split(',').forEach(function (x) {
      if (!x) return;
      var a = x.split('~').map(function (p) { try { return decodeURIComponent(p); } catch (e) { return p; } }); if (a.length < 3) return;
      var l = parseInt(a.pop(), 10); if (!(l >= 1 && l <= 3)) l = 2; var k = a.join('~');
      if (!resolve(k)) { miss++; return; } var o = S.c[k]; S.c[k] = { l: Math.max(o ? o.l || 1 : 1, l) }; if (!S.due[k]) S.due[k] = { b: 0, d: today() }; got++;
    });
    S.f = 'all'; save();
    note = got + ' card' + (got === 1 ? '' : 's') + ' loaded' + (miss ? ' (' + miss + ' no longer in the list)' : '') + '.';
    if (apHome !== 'setup') { msDoor = msDoor || 'core'; mode = 'single'; selectedTenses = new Set(); verbMode = 'igcse'; }
    var kinds = ['s', 'f', 'i', 'z'], best = kinds.reduce(function (a, b) { return kindCount(b) > kindCount(a) ? b : a; }, 's');
    mode = { s: 'single', f: 'full', i: 'infinitives', z: 'sentences' }[best];
    apHome = 'setup'; enterMy(); renderIntro();
    try { window.scrollTo(0, 0); } catch (e) { }
  }
  function boot() { if ($('drill')) setTimeout(openFromHash, 200); }
  if (document.readyState === 'complete') setTimeout(boot, 600); else window.addEventListener('load', function () { setTimeout(boot, 600); });
  window.addEventListener('hashchange', openFromHash);

  // ---- form items for Spell and Match, taken from whatever the drill would have used
  function formItems(pool) {
    var out = [];
    pool.forEach(function (c) {
      if (c.isInfinitive) { out.push({ en: plain(c.en), es: c.inf, card: c, lab: 'Infinitive' }); return; }
      if (c.pre != null && c.answer != null) { out.push({ en: '', es: plain(sentFull(c)), card: c, lab: (TNAME[c.tense] || c.tense) }); return; }
      if (c.verb && c.personIdx != null) { var v = c.verb; if (v.forms[c.personIdx] && v.forms[c.personIdx] !== '—') out.push({ en: enOf(v, c.personIdx), es: formOf(v, c.personIdx), card: c, lab: (TNAME[v.tense] || v.tense) + ' · ' + PERSONS[c.personIdx] }); return; }
      if (c.forms) for (var i = 0; i < 6; i++) { if (c.forms[i] && c.forms[i] !== '—') out.push({ en: enOf(c, i), es: formOf(c, i), card: { verb: c, personIdx: i }, lab: (TNAME[c.tense] || c.tense) + ' · ' + PERSONS[i] }); }
    });
    return out;
  }
  function pickItems() {
    if (!verbsChosen()) derive();
    var pool = curPool(); if (!pool.length) { alert('No cards for this selection.'); return null; }
    var items = formItems(pool); if (!items.length) { alert('No cards for this selection.'); return null; }
    return items;
  }
  function label() { return selText(); }

  // ---- Spell
  var sp = null;
  window.apSpell = function () {
    var it = pickItems(); if (!it) return;
    var want = _selectedCount > 0 ? _selectedCount : Math.min(it.length, 60), n = Math.min(want, it.length);
    sp = { d: sh(it).slice(0, n), i: 0, ok: 0, near: 0, bad: 0, miss: [], rev: false, label: label() };
    spCard();
  };
  function spCard() {
    if (sp.i >= sp.d.length) return spEnd();
    var c = sp.d[sp.i]; sp.rev = false;
    ov(head('✍ Spell', esc(sp.label) + ' · card ' + (sp.i + 1) + ' of ' + sp.d.length) + '<div class="ms-bar"><div style="width:' + Math.round(sp.i / sp.d.length * 100) + '%"></div></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpListen()">🔊 Listen</button>' + (c.en ? '<button class="ms-b" onclick="apSpHint()">Show meaning</button>' : '') + '</div>'
      + '<div class="ms-note" style="text-align:center">' + esc(c.lab) + '</div>'
      + '<div class="ms-big" id="ms-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(c.en) + '</div>'
      + '<textarea id="ms-in" class="ms-in" rows="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="it" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpCheck()">Check</button></div><div id="ms-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apSpCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apSpMark('bad'); return true; } if (e.key === 'ArrowDown') { apSpMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apSpMark('ok'); return true; }
      return false;
    });
    apSpListen(); var i = $('ms-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  }
  window.apSpListen = function () { var c = sp.d[sp.i]; speakIt(c.es); };
  window.apSpHint = function () { var m = $('ms-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  window.apSpCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm($('ms-in').value), ans = plain(c.es).replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/) : [], bad = 0, acc = 0;
    var words = ans.split(/\s+/).map(function (w) {
      var k = w.toLowerCase(); if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      var kw = k.replace(/[,.;:!?]+$/, '');
      if (tw.indexOf(k) >= 0 || tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(k) || noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc && tw.length === ans.split(/\s+/).length ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    $('ms-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + (c.en ? '<div class="ms-note" style="text-align:center">' + esc(c.en) + '</div>' : '')
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apSpMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apSpMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apSpMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = $('ms-in'); if (i) i.blur();
  };
  window.apSpMark = function (r) {
    var c = sp.d[sp.i]; record(c.card, r); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length;
    ov(head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(c.es) + '</div><div class="e">' + esc(c.en) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apSpell()">↻ Again</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
    keys(function () { return false; });
  }

  // ---- Match (six pairs: English form against Italian form)
  var mm = null;
  window.apMatch = function () {
    var items = pickItems(); if (!items) return;
    var seen = {}, u = [];
    sh(items).slice(0, 400).forEach(function (c) { if (!c.en) return; var a = c.en.toLowerCase(), b = c.es.toLowerCase(); if (seen['e' + a] || seen['s' + b]) return; seen['e' + a] = seen['s' + b] = 1; u.push(c); });
    if (u.length < 3) { alert('Match needs at least 3 different forms in the selection.'); return; }
    var d = u.slice(0, 6);
    mm = { d: d, en: sh(d.map(function (_, i) { return i; })), fr: sh(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: label() };
    ov(head('🧩 Match', esc(mm.label) + ' · tap an English form, then its Italian') + '<div class="ms-time" id="ms-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-e' + i + '" onclick="apMatchTap(\'e\',' + i + ')">' + esc(d[i].en) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem" id="ms-f' + i + '" onclick="apMatchTap(\'f\',' + i + ')">' + esc(d[i].es) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" id="ms-mnote" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = $('ms-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apMatchTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = $('ms-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') { try { speakIt(mm.d[i].es); } catch (e) { } }
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
  window.apMySetFilterGet = function () { return S.f; };
})();
