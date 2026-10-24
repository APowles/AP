(function () {
  'use strict';
  var KEY = 'apam_myset_v1', MY = '__MY__';
  var S = { c: {}, due: {}, f: 'all' }, note = '', setOpen = false;
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.c) S = { c: raw.c, due: raw.due || {}, f: raw.f || 'all' }; } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function today() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function wc(s) { return plain(s).split(/\s+/).filter(Boolean).length; }

  // ---- a sentence is identified by its set (a = Approved Material, p = Practice Sentences), topic number and sentence number
  function keyOf(sub, i) { var ti = amData.indexOf(sub); if (ti >= 0) return 'a' + ti + '.' + i; ti = allData.indexOf(sub); return ti >= 0 ? 'p' + ti + '.' + i : null; }
  function curLetter() { return amSet === 'am' ? 'a' : 'p'; }
  function ids(letter) { letter = letter || curLetter(); return Object.keys(S.c).filter(function (k) { return k.charAt(0) === letter; }); }
  function dueNow(k) { var d = S.due[k]; return !!(d && d.d != null && d.d <= today()); }
  function dueCount() { return ids().filter(dueNow).length; }
  function subOf(k) { var m = /^([ap])(\d+)\.(\d+)$/.exec(k); if (!m) return null; var D = m[1] === 'a' ? amData : allData; return D[+m[2]] ? { sub: D[+m[2]], i: +m[3], set: m[1] } : null; }
  function foreign() { var f = fromLang, t = toLang; return t === 'en' ? f : t; }
  function textOf(k, lang) {   // the sentence in one language (English is the one written for that language, as the drill uses)
    var o = subOf(k); if (!o) return '';
    var F = foreign();
    if (lang === 'en') return plain(((o.sub['phrases_en_' + F] || o.sub.phrases_en || [])[o.i]) || '');
    return plain((o.sub['phrases_' + lang] || [])[o.i] || '');
  }
  window.amMyHas = function (sub, i) {
    var k = keyOf(sub, i); if (!k || !S.c[k]) return false;
    var l = S.c[k].l || 2;
    return S.f === 'all' ? true : S.f === 'due' ? dueNow(k) : S.f === '3' ? l === 3 : l >= 2;
  };

  // ---- marking ✗ Major error in any drill feeds the personalised set
  function record(c, res) {
    if (!c || !c._sub) return;
    var k = keyOf(c._sub, c._pi); if (!k) return;
    if (res === 'bad') { S.c[k] = { l: 3 }; S.due[k] = { b: 0, d: today() + 1 }; }
    else if (res === 'ok' && S.c[k] && dueNow(k)) { var b = (S.due[k].b || 0) + 1; S.due[k] = b >= 3 ? { b: 3, d: null } : { b: b, d: today() + [1, 3, 7][b] }; }
    else return;
    save();
  }
  var mErr = window.markError, mOk = window.markCorrect;
  window.markError = function () { try { record(deck[currentIndex], 'bad'); } catch (e) { } return mErr.apply(this, arguments); };
  window.markCorrect = function () { try { record(deck[currentIndex], 'ok'); } catch (e) { } return mOk.apply(this, arguments); };

  var ICONS = {};
  var TILES = [
    ['ms-drill', 'drill', 'Drill', 'Cards one at a time. You mark yourself ✗ ~ ✓.', 'introStartDrill()'],
    ['ms-speed', 'speed', 'Speed Challenge', 'Race the clock, solo or in teams.', 'amSpeedFromMain()'],
    ['ms-spell', 'spell', 'Spell', 'Hear the sentence and write it. Accents count.', 'apSpell()'],
    ['ms-match', 'match', 'Match', 'Pair English and foreign sentences against the clock.', 'apMatch()'],
    ['ms-leis', 'leis', 'Leisure Mode', 'Just press play and let it all wash over you.', 'introStartLeisure()'],
    ['ms-test', 'test', 'Test', 'A test to print or do on screen. Answers stay hidden.', 'showAMTestPanel()']
  ];
  function iconFor(k) { var l = foreign(); if (k === 'spell' || k === 'match') return ICONS[k + '_' + (l === 'it' || l === 'es' ? l : 'fr')]; return ICONS[k]; }
  function langName(l) { return (typeof AM_LANG_NAMES !== 'undefined' && AM_LANG_NAMES[l]) || l; }

  function myBox(n, dc, on) {
    var fl = [['all', 'All'], ['3', 'Hard only'], ['23', 'Tricky + hard'], ['due', 'Due today (' + dc + ')']];
    return '<div class="ms-mybox' + (on ? ' on' : '') + '"><div class="ms-brow"><button class="aph-chip' + (on ? ' on' : '') + '"' + (n || on ? '' : ' disabled style="opacity:.5"') + ' onclick="apMySetUse()" style="min-width:190px">★ My personalised set</button>'
      + '<span class="aph-note" style="min-width:auto">' + n + ' phrase' + (n === 1 ? '' : 's') + (dc ? ' · ' + dc + ' due today' : '') + '</span>'
      + '<button class="ms-b sm" onclick="apMySetHelp()">? How does this work?</button></div>'
      + (n || on ? '<div class="ms-brow"><button class="ms-b sm" onclick="apMySetEdit()">✎ Edit</button><button class="ms-b sm" onclick="apMySetLink()">🔗 Save my personalised set</button></div>' : '')
      + (on ? '<div class="ms-brow">' + fl.map(function (x) { return '<button class="ms-b sm' + (S.f === x[0] ? ' on' : '') + '" onclick="apMySetFilter(\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>' : '')
      + (note || !n ? '<div class="ms-note">' + (note ? '<b>' + note + '</b> ' : '') + (!n ? 'Empty so far. Sentences you mark ✗ Major error in any drill join it automatically.' : '') + '</div>' : '') + '</div>';
  }
  function sumText() {
    return (_selectedCount === -1 ? 'All cards' : _selectedCount + ' cards') + ' · ' + timerSeconds + 's a card · ' + langName(fromLang) + ' → ' + langName(toLang) + (mixMode ? ' · mixed ' + mixShare() : '') + (isAutotime ? ' · Autotime on' : '');
  }
  function refreshSum() { var s = document.querySelector('.ms-opts summary small'); if (s) s.textContent = sumText(); }
  var aT = window.adjustTimer, tA = window.toggleAutotime;
  window.adjustTimer = function () { var r = aT.apply(this, arguments); refreshSum(); return r; };
  window.toggleAutotime = function () { var r = tA.apply(this, arguments); refreshSum(); return r; };

  var ri = window.renderIntro;
  window.renderIntro = function () {
    ri.apply(this, arguments);
    var card = document.querySelector('#drillContainer .intro-card'); if (!card || card.getAttribute('data-ms')) return; card.setAttribute('data-ms', '1');
    var my = currentSection === MY, chosen = !!currentSection, n = ids().length, dc = dueCount();
    var pool = chosen ? getPool().length : 0, usable = chosen && pool > 0;
    var secSel = card.querySelector('#intro-section');
    if (secSel) { secSel.insertAdjacentHTML('afterbegin', '<option value="' + MY + '">★ My personalised set</option>'); secSel.value = currentSection || ''; }
    var tb = card.querySelector('#amTopicBox'), lab = '';
    if (tb) { lab = tb.textContent.replace(/▾/g, '').replace(/\s+/g, ' ').trim(); if (my) { tb.classList.remove('am-pick-none'); tb.innerHTML = 'Choose topics instead <span class="am-pick-car">&#9662;</span>'; } }
    var B = { head: [], note: [], dir: [], what: [], cards: [], timer: [], stack: null, keys: null }, cur = 'head';
    var kids = [];
    [].slice.call(card.children).forEach(function (e) { if (e.classList.contains('am-cols')) { [].slice.call(e.querySelectorAll('.am-col')).forEach(function (c) { [].slice.call(c.children).forEach(function (x) { kids.push(x); }); }); } else kids.push(e); });
    kids.forEach(function (e) {
      var t = e.classList.contains('aph-label') ? e.textContent.trim() : '';
      if (e.tagName === 'H2') { B.head.push(e); return; }
      if (e.classList.contains('am-linked')) { B.note.push(e); return; }
      if (e.classList.contains('aph-stack')) { B.stack = e; cur = 'x'; return; }
      if (e.classList.contains('aph-keys')) { B.keys = e; cur = 'x'; return; }
      if (/^(Direction|Mix both ways)/i.test(t)) cur = 'dir'; else if (/^Topics/i.test(t)) cur = 'what'; else if (/^Cards per session/i.test(t)) cur = 'cards'; else if (/^Timer per card/i.test(t)) cur = 'timer';
      if (B[cur]) B[cur].push(e);
    });
    if (!B.stack || !B.what.length) return;
    B.what = B.what.filter(function (e) { return !e.classList.contains('aph-label'); });
    var setDet = document.createElement('details'); setDet.className = 'ms-opts'; setDet.open = setOpen; setDet.addEventListener('toggle', function () { setOpen = setDet.open; });
    setDet.innerHTML = '<summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small>' + esc(sumText()) + '</small><span class="ms-chg"></span></summary>';
    B.cards.concat(B.timer).forEach(function (e) { setDet.appendChild(e); });
    var auto = B.stack.querySelector('#autotimeBtn'); if (auto) { var ar = document.createElement('div'); ar.className = 'aph-row'; ar.appendChild(auto); var an = document.createElement('div'); an.className = 'aph-note'; an.style.margin = '0 0 4px'; an.textContent = 'Autotime: Leisure Mode moves on by itself, with no timer bar.'; setDet.appendChild(ar); setDet.appendChild(an); }
    B.dir.forEach(function (e) { setDet.appendChild(e); });
    setDet.insertAdjacentHTML('beforeend', '<div class="aph-note" style="margin:6px 0 4px;line-height:1.45"><b>Direction</b> is which language you see and which you answer in. <b>Mix both ways</b>: Off = every card goes the way round chosen above. 50–50 = half the cards go English → foreign and half the other way, each card showing its own direction. 70–30 = seven in ten English → foreign, three in ten the other way. Spell and Match always use the foreign language.</div>');
    var read = B.stack.querySelector('[onclick^="startReadListen"]'), vp = B.stack.querySelector('[onclick^="amvpOpen"]');
    var extra = [].slice.call(B.stack.querySelectorAll('.aph-tools')).filter(function (e) { return e.querySelector('[onclick^="showAMPracticePdf"]'); });
    var speedOff = my ? 'Works on whole topics, so not on a personalised set.' : '';
    var sp = (typeof amSet !== 'undefined' && amSet === 'am');
    var tilesHtml = TILES.map(function (x) {
      var off = !usable, d = x[3];
      if (my && x[1] === 'speed') { off = true; d = speedOff; }
      return '<button class="ms-tile ' + x[0] + '"' + (off ? ' disabled' : '') + ' onclick="' + x[4] + '"><img class="ms-img" alt="" src="' + iconFor(x[1]) + '"><span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + d + '</span></span></button>';
    }).join('');
    while (card.firstChild) card.removeChild(card.firstChild);
    B.head.forEach(function (e) { card.appendChild(e); });
    B.note.forEach(function (e) { card.appendChild(e); });
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">1</span>What do you want to practise?</div>');
    var wrap = document.createElement('div'); wrap.className = 'ms-what'; B.what.forEach(function (e) { wrap.appendChild(e); }); card.appendChild(wrap);
    card.insertAdjacentHTML('beforeend', myBox(n, dc, my));
    card.insertAdjacentHTML('beforeend', '<div class="ms-now">' + (!chosen ? 'Choose topics above to unlock the ways to practise them.' : (!pool ? 'This selection has no phrases yet.' : 'Practising: <b>' + esc(my ? 'my personalised set' : lab) + '</b> · ' + pool + ' phrases')) + '</div>');
    card.insertAdjacentHTML('beforeend', '<div class="ms-step"><span class="ms-num">2</span>How do you want to practise it?</div>');
    card.appendChild(setDet);
    card.insertAdjacentHTML('beforeend', '<div class="aph-tools ms-tiles">' + tilesHtml + '</div>');
    if (read || vp) {
      var vr = document.createElement('div'); vr.className = 'ms-viewrow';
      vr.insertAdjacentHTML('beforeend', '<span class="aph-note" style="margin:0">Just want to read, listen or print?</span>');
      [read, vp].forEach(function (b) { if (!b) return; if (my) { b.disabled = true; b.title = 'Works on whole topics, so not on a personalised set.'; } b.classList.remove('aph-btn-block'); vr.appendChild(b); });
      card.appendChild(vr);
    }
    extra.forEach(function (e) { card.appendChild(e); });
    if (B.keys) card.appendChild(B.keys);
  };

  // choosing topics while the personalised set is showing: the Overview starts empty, and closing it leaves the set as it was
  var oo = window.openAMOverview;
  window.openAMOverview = function () {
    if (currentSection === MY) { var k = currentSection; currentSection = null; try { return oo.apply(this, arguments); } finally { currentSection = k; } }
    return oo.apply(this, arguments);
  };
  var gl = window.getSectionLabel;
  window.getSectionLabel = function (v) { return v === MY ? 'My personalised set' : gl.apply(this, arguments); };
  window.apMySetUse = function () { currentSection = MY; currentSubsection = 'all'; clearAMTestOutput(); window.renderIntro(); };
  window.apMySetFilter = function (f) { S.f = f; save(); clearAMTestOutput(); window.renderIntro(); };

  // ---- overlays
  var keyH = null, mt = null;
  function ov(inner) { closeOv(); var o = document.createElement('div'); o.className = 'ms-ov'; o.id = 'ms-ov'; o.innerHTML = '<div class="ms-sheet">' + inner + '</div>'; document.body.appendChild(o); document.documentElement.style.overflow = 'hidden'; return o.firstChild; }
  function closeOv() { var o = document.getElementById('ms-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } if (mt) { clearInterval(mt); mt = null; } try { speechSynthesis.cancel(); } catch (e) { } }
  window.apMsClose = function () { closeOv(); if (document.querySelector('#drillContainer .intro-card')) window.renderIntro(); };
  function head(t, sub) { return '<div class="ms-head"><h2>' + t + '</h2><button class="ms-x" onclick="apMsClose()" aria-label="Close">✕</button></div>' + (sub ? '<div class="ms-note" style="margin:0 0 8px">' + sub + '</div>' : ''); }
  function keys(fn) { keyH = function (e) { if (e.key === 'Escape') { apMsClose(); return; } if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }

  window.apMySetHelp = function () {
    ov(head('★ How your personalised set works') + '<div style="font-size:1.0625rem;line-height:1.55">'
      + '<p><b>What is it?</b> Your own list of the sentences you find hardest. You do not have to build it: the app does it for you.</p>'
      + '<p><b>How do sentences get in?</b> Do any drill (or Spell). Every card you mark <b>✗ Major error</b> is added automatically. <b>~ Nearly</b> just brings the card back a few cards later. Approved Material and Practice Sentences each keep their own set.</p>'
      + '<p><b>How do I use it?</b> Under <b>1 · What do you want to practise?</b> choose <b>★ My personalised set</b>. Then under <b>2 · How do you want to practise it?</b> choose Drill, Spell, Match, Leisure Mode or Test, exactly as normal but only on your tricky sentences. (The Speed Challenge works on whole topics, so it waits for a topic.)</p>'
      + '<p><b>Hard, Tricky, Easier.</b> Every ✗ card goes in as Hard. Press <b>✎ Edit</b> to change a level or take a sentence out. Then you can practise just the Hard ones.</p>'
      + '<p><b>Due today.</b> A sentence you missed comes back after 1 day, then 3 days, then 7. Get it right each time and it stops coming back.</p>'
      + '<p><b>Keep it safe.</b> Press <b>🔗 Save my personalised set</b>, copy the link and paste it into OneNote. Tap that link on any device and your set is back. It is also kept on this iPad, but the link is the safe copy.</p></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apMsClose()">Got it</button></div>');
    keys(function () { return false; });
  };

  // ---- Edit
  window.apMySetEdit = function () { editView(); };
  function editView() {
    var rows = ids().sort(function (a, b) { return (S.c[b].l || 2) - (S.c[a].l || 2); });
    var lv = { 1: 'Easier', 2: 'Tricky', 3: 'Hard' }, F = foreign();
    ov(head('✎ Personalised set', 'Tap a level to change it. ✕ takes a sentence out. ' + rows.length + ' sentences.') + '<div class="ms-list">'
      + (rows.length ? rows.map(function (k) { var l = S.c[k].l || 2; return '<div class="ms-li"><div><div class="f">' + esc(textOf(k, F)) + '</div><div class="e">' + esc(textOf(k, 'en')) + '</div></div><div style="display:flex;gap:6px"><button class="ms-lv l' + l + '" onclick="apMsLv(\'' + k + '\')">' + lv[l] + '</button><button class="ms-lv" onclick="apMsDel(\'' + k + '\')" aria-label="Remove">✕</button></div></div>'; }).join('') : '<div class="ms-note">No sentences yet.</div>') + '</div>');
    keys(function () { return false; });
  }
  function redo() { var y = document.getElementById('ms-ov').scrollTop; editView(); document.getElementById('ms-ov').scrollTop = y; }
  window.apMsLv = function (k) { var l = S.c[k].l || 2; S.c[k].l = l === 3 ? 1 : l + 1; save(); redo(); };
  window.apMsDel = function (k) { delete S.c[k]; delete S.due[k]; save(); redo(); };

  // ---- Save / open link
  function linkText() { return location.href.replace(/[#?].*$/, '') + '#amset=' + Object.keys(S.c).map(function (k) { return k + '.' + (S.c[k].l || 2); }).join('~'); }
  window.apMySetLink = function () {
    var n = Object.keys(S.c).length;
    ov(head('🔗 Save my personalised set') + (n ? '<p class="ms-note" style="font-size:1rem">Paste this link into OneNote. Opening it, on any device, brings back these ' + n + ' sentences. It is also kept on this iPad automatically.</p><textarea id="ms-link" class="ms-ta" readonly>' + esc(linkText()) + '</textarea><div class="ms-cen"><button class="ms-b pri" onclick="apMsCopy()">Copy link</button></div><div class="ms-note" id="ms-copied" style="text-align:center"></div>' : '<p class="ms-note" style="font-size:1rem">Nothing to save yet. Mark some cards ✗ in a drill first.</p>'));
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
    var m = /^#amset=([^&]*)/.exec(location.hash || ''); if (!m) return;
    var got = 0, miss = 0, cnt = { a: 0, p: 0 };
    m[1].split('~').forEach(function (x) {
      var a = /^([ap]\d+\.\d+)\.([123])$/.exec(x); if (!a) return;
      var o = subOf(a[1]); if (!o || !(o.sub.phrases_en || o.sub.phrases_fr || [])[o.i]) { miss++; return; }
      var l = +a[2], p = S.c[a[1]]; S.c[a[1]] = { l: Math.max(p ? p.l || 1 : 1, l) }; if (!S.due[a[1]]) S.due[a[1]] = { b: 0, d: today() }; got++; cnt[a[1].charAt(0)]++;
    });
    S.f = 'all'; save();
    note = got + ' phrase' + (got === 1 ? '' : 's') + ' loaded' + (miss ? ' (' + miss + ' no longer in the list)' : '') + '.';
    var k = cnt.p > cnt.a ? 'ps' : 'am';
    amHub = false; amSwitchSet(k); currentSection = MY; currentSubsection = 'all'; window.renderIntro();
    try { window.scrollTo(0, 0); var s2 = document.querySelectorAll('.ms-step')[1]; if (s2 && s2.getBoundingClientRect().top > 420) window.scrollBy(0, s2.getBoundingClientRect().top - 120); } catch (e) { }
  }
  if (document.readyState === 'complete') setTimeout(openFromHash, 400); else window.addEventListener('load', function () { setTimeout(openFromHash, 400); });
  window.addEventListener('hashchange', openFromHash);

  // ---- Spell: hear the sentence, write it
  var sp = null;
  function pickPool() {
    if (!currentSection) { alert('Choose topics under What to practise first.'); return null; }
    var pool = getPool(); if (!pool.length) { alert('No phrases available for this selection.'); return null; }
    return { pool: pool, n: _selectedCount > 0 ? Math.min(_selectedCount, pool.length) : pool.length };
  }
  function label() { if (currentSection === MY) return 'My personalised set'; var d = document.querySelector('.ms-now b'); return d ? d.textContent : amSetName(); }
  window.apSpell = function () {
    var p = pickPool(); if (!p) return;
    sp = { d: shuffle(p.pool).slice(0, p.n), i: 0, ok: 0, near: 0, bad: 0, miss: [], rev: false, label: label(), L: foreign() };
    spCard();
  };
  function spCard() {
    if (sp.i >= sp.d.length) return spEnd();
    var c = sp.d[sp.i]; sp.rev = false;
    ov(head('✍ Spell', esc(sp.label) + ' · card ' + (sp.i + 1) + ' of ' + sp.d.length) + '<div class="ms-bar"><div style="width:' + Math.round(sp.i / sp.d.length * 100) + '%"></div></div>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpListen()">🔊 Listen again</button><button class="ms-b" onclick="apSpHint()">Show meaning</button></div>'
      + '<div class="ms-big" id="ms-mean" style="display:none;font-weight:500;color:#4a5570;font-size:1.125rem">' + esc(plain(c.en)) + '</div>'
      + '<textarea id="ms-in" class="ms-in" rows="3" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="' + sp.L + '" placeholder="Type what you hear (or write it on paper)"></textarea>'
      + '<div class="ms-cen"><button class="ms-b pri" onclick="apSpCheck()">Check</button></div><div id="ms-res"></div>');
    keys(function (e) {
      if (!sp.rev) { if (e.key === 'Enter' && !e.shiftKey) { apSpCheck(); return true; } return false; }
      if (e.key === 'ArrowLeft') { apSpMark('bad'); return true; } if (e.key === 'ArrowDown') { apSpMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { apSpMark('ok'); return true; }
      return false;
    });
    apSpListen(); var i = document.getElementById('ms-in'); if (i) setTimeout(function () { try { i.focus(); } catch (e) { } }, 50);
  }
  window.apSpListen = function () { var c = sp.d[sp.i]; speak(plain(c[sp.L]), sp.L); };
  window.apSpHint = function () { var m = document.getElementById('ms-mean'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; };
  function norm(s) { return plain(s).replace(/[’‘`]/g, "'").replace(/\s+([,.;:!?])/g, '$1').toLowerCase(); }
  function noacc(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  window.apSpCheck = function () {
    if (sp.rev) return; sp.rev = true;
    var c = sp.d[sp.i], typed = norm(document.getElementById('ms-in').value), ans = plain(c[sp.L]).replace(/[’‘`]/g, "'"), tw = typed ? typed.split(/\s+/) : [], bad = 0, acc = 0;
    var words = ans.split(/\s+/).map(function (w) {
      var k = w.toLowerCase(); if (!tw.length) return '<span class="ms-w">' + esc(w) + '</span>';
      var kw = k.replace(/[,.;:!?]+$/, '');
      if (tw.indexOf(k) >= 0 || tw.indexOf(kw) >= 0) return '<span class="ms-w ok">' + esc(w) + '</span>';
      if (tw.some(function (t) { return noacc(t) === noacc(k) || noacc(t) === noacc(kw); })) { acc++; return '<span class="ms-w acc">' + esc(w) + '</span>'; }
      bad++; return '<span class="ms-w no">' + esc(w) + '</span>';
    }).join(' ');
    var msg = !tw.length ? '' : (!bad && !acc && tw.length === ans.split(/\s+/).length ? 'Every word right, accents included.' : (acc ? acc + ' accent slip' + (acc > 1 ? 's' : '') + ' (wavy orange). ' : '') + (bad ? bad + ' word' + (bad > 1 ? 's' : '') + ' wrong or missing (red).' : ''));
    document.getElementById('ms-res').innerHTML = '<div class="ms-ans" style="font-size:1.125rem">' + words + '</div>' + (msg ? '<div class="ms-note" style="text-align:center;font-size:1rem">' + msg + '</div>' : '') + '<div class="ms-note" style="text-align:center">' + esc(plain(c.en)) + '</div>'
      + '<div class="aph-mark" style="margin-top:12px"><button class="aph-mark-btn bad" onclick="apSpMark(\'bad\')">✗ Major error<small>← key</small></button><button class="aph-mark-btn near" onclick="apSpMark(\'near\')">~ Nearly<small>↓ key</small></button><button class="aph-mark-btn ok" onclick="apSpMark(\'ok\')">✓ Got it<small>→ key</small></button></div>';
    var i = document.getElementById('ms-in'); if (i) i.blur();
  };
  window.apSpMark = function (r) {
    var c = sp.d[sp.i]; record(c, r); sp[r === 'ok' ? 'ok' : r]++; if (r === 'bad') sp.miss.push(c); sp.i++; spCard();
  };
  function spEnd() {
    var n = sp.d.length;
    ov(head('✍ Spell · done') + '<div class="ms-big">' + sp.ok + ' of ' + n + ' got it</div><div class="ms-note" style="text-align:center;font-size:1rem">' + sp.near + ' nearly · ' + sp.bad + ' major error' + (sp.bad === 1 ? '' : 's') + (sp.miss.length ? ' · ' + sp.miss.length + ' added to my personalised set' : '') + '</div>'
      + (sp.miss.length ? '<div class="ms-list">' + sp.miss.map(function (c) { return '<div class="ms-li"><div><div class="f">' + esc(plain(c[sp.L])) + '</div><div class="e">' + esc(plain(c.en)) + '</div></div></div>'; }).join('') + '</div>' : '')
      + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apSpell()">↻ Again</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
    keys(function () { return false; });
  }

  // ---- Match: pair English and foreign sentences (six pairs of the short Practice Sentences; four pairs of the shorter Approved Material ones)
  var mm = null, BEST = 'apam_match_best';
  window.apMatch = function () {
    if (!currentSection) { alert('Choose topics under What to practise first.'); return; }
    var L = foreign(), seen = {}, u = [], long = amSet === 'am', N = long ? 4 : 6;
    getPool().forEach(function (c) { var a = plain(c.en).toLowerCase(), b = plain(c[L]).toLowerCase(); if (!a || !b || seen[a] || seen[b]) return; seen[a] = seen[b] = 1; u.push(c); });
    if (long) { var sh = u.filter(function (c) { return wc(c[L]) <= 26 && wc(c.en) <= 26; }); if (sh.length >= N) u = sh; }
    if (u.length < 3) { alert('Match needs at least 3 different sentences in the selection.'); return; }
    var d = shuffle(u).slice(0, N);
    mm = { d: d, L: L, N: d.length, en: shuffle(d.map(function (_, i) { return i; })), fr: shuffle(d.map(function (_, i) { return i; })), sel: null, done: 0, pen: 0, t0: 0, label: label() };
    ov(head('🧩 Match', esc(mm.label) + ' · tap an English sentence, then its ' + langName(L) + ' partner') + '<div class="ms-time" id="ms-time">0.0 s</div><div class="ms-grid">'
      + '<div style="display:grid;gap:10px">' + mm.en.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem;font-weight:500" id="ms-e' + i + '" onclick="apMatchTap(\'e\',' + i + ')">' + esc(plain(d[i].en)) + '</button>'; }).join('') + '</div>'
      + '<div style="display:grid;gap:10px">' + mm.fr.map(function (i) { return '<button class="ms-t" style="font-size:.9375rem;font-weight:500" id="ms-f' + i + '" onclick="apMatchTap(\'f\',' + i + ')">' + esc(plain(d[i][L])) + '</button>'; }).join('') + '</div></div>'
      + '<div class="ms-note" id="ms-mnote" style="text-align:center">A wrong pair adds 3 seconds.</div>');
    keys(function () { return false; });
    mt = setInterval(function () { if (!mm.t0) return; var t = (Date.now() - mm.t0) / 1000 + mm.pen; var el = document.getElementById('ms-time'); if (el) el.textContent = t.toFixed(1) + ' s'; }, 100);
  };
  window.apMatchTap = function (side, i) {
    if (!mm.t0) mm.t0 = Date.now();
    var el = document.getElementById('ms-' + side + i); if (!el || el.classList.contains('done')) return;
    if (side === 'f') { try { speak(plain(mm.d[i][mm.L]), mm.L); } catch (e) { } }
    if (!mm.sel || mm.sel.side === side) { if (mm.sel) { var o = document.getElementById('ms-' + mm.sel.side + mm.sel.i); if (o) o.classList.remove('sel'); } mm.sel = { side: side, i: i }; el.classList.add('sel'); return; }
    var a = mm.sel; mm.sel = null; var ae = document.getElementById('ms-' + a.side + a.i); var ei = side === 'e' ? i : a.i, fi = side === 'f' ? i : a.i;
    if (ei === fi) { ae.classList.remove('sel'); ae.classList.add('done'); el.classList.add('done'); mm.done++; if (mm.done === mm.d.length) matchEnd(); }
    else { mm.pen += 3; ae.classList.remove('sel'); ae.classList.add('bad'); el.classList.add('bad'); setTimeout(function () { ae.classList.remove('bad'); el.classList.remove('bad'); }, 600); }
  };
  function matchEnd() {
    clearInterval(mt); mt = null; var t = (Date.now() - mm.t0) / 1000 + mm.pen, best = null, nb = false, bk = BEST + '_' + amSet + mm.N;
    try { best = parseFloat(localStorage.getItem(bk)); if (isNaN(best) || t < best) { localStorage.setItem(bk, String(t)); nb = best != null && !isNaN(best); best = t; } } catch (e) { }
    setTimeout(function () {
      ov(head('🧩 Match · done') + '<div class="ms-big">' + t.toFixed(1) + ' seconds</div><div class="ms-note" style="text-align:center;font-size:1rem">' + (mm.pen ? (mm.pen / 3) + ' wrong pair' + (mm.pen === 3 ? '' : 's') + ' (+' + mm.pen + ' s). ' : 'No wrong pairs. ') + (best != null ? (nb ? 'New best time! ' : '') + 'Best on this iPad: ' + best.toFixed(1) + ' s.' : '') + '</div>'
        + '<div class="ms-cen" style="margin-top:14px"><button class="ms-b pri" onclick="apMatch()">↻ Another ' + mm.N + '</button><button class="ms-b" onclick="apMsClose()">Close</button></div>');
      keys(function () { return false; });
    }, 500);
  }
  if (document.querySelector('#drillContainer .intro-card')) window.renderIntro();
})();
