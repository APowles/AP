/* ===== AP LEARN FROM THIS DEMO (A Level Oral Topics) =====
   The old "Translation sheet" button on a card with a demo becomes "Learn from this demo": listen first, then choose what to practise
   (Phrases, Gaps, Word order, Spot the mistake, Translate, Facts) and how (Drill, Speed Challenge, Test, Print a sheet, Read it again, Have a go).
   Data: DEMO_LEARN[id] (injected separately, id = ORAL_CARDS index + side, e.g. "12A"):  {en:{p1,p2}, chunks, gaps, errors}.
   Engines reused: the Speed Challenge (window.__ktr sources registered for the demo), the Spot Test sheets (openAPSpotTestPDF), KTR Studio "Know it" facts (apStudioPairs),
   speak(), apErrMark(), and the old Translation sheet (kept as its own option). */
(function () {
  'use strict';
  if (window.APOD) return;
  var ICONS = {};   // filled in by the build script: drill, speed, test
  var SKEY = 'apod_set_v1';
  var ORDER = 'QPSEAIOHC';
  var ST = { Q: ['Question', '#c0392b'], P: ['Point', '#e67e22'], S: ['Source', '#2980b9'], E: ['Example', '#27ae60'], A: ['Analysis', '#f39c12'], I: ['Interact', '#16a085'], O: ['Opinion', '#8e44ad'], H: ['Hypothesis', '#b5392b'], C: ['Conclusion', '#2e4a6e'] };
  // the ladder, easy to hard
  var ACTS = [
    { k: 'P', name: 'Phrases', lv: 1, src: 'dmP', desc: 'The reusable frames from this answer, English ↔ French.' },
    { k: 'G', name: 'Gaps', lv: 2, src: 'dmG', desc: 'A phrase is missing from a sentence of the demo. Fill it in.' },
    { k: 'O', name: 'Word order', lv: 2, src: 'dmO', desc: 'Put the jumbled words of a demo sentence back in order.' },
    { k: 'E', name: 'Spot the mistake', lv: 3, src: 'dmE', desc: 'One grammar slip in a sentence from the demo. Find it and correct it.' },
    { k: 'T', name: 'Translate', lv: 4, src: 'dmT', desc: 'Single sentences from the demo, short and long, in any order.' },
    { k: 'K', name: 'Facts', lv: 2, src: 'dmK', desc: 'Names, dates and figures from the KTRs this answer uses.' }
  ];
  var SRC_SUB = { dmP: 'The reusable frames, English → French', dmG: 'Fill the gap in a demo sentence', dmO: 'Put the jumbled words in order', dmE: 'Correct the grammar error', dmT: 'Single sentences, English → French', dmK: 'Names, dates and figures: just answer the question' };
  var DIRS = { en: 'English → French', fr: 'French → English', mix: 'Mixed' };
  var SET = { per: 6, test: 15, dir: 'en', tiles: 12, tt: 20 };
  try { var raw = JSON.parse(localStorage.getItem(SKEY) || 'null'); if (raw) for (var k in SET) if (raw[k] != null) SET[k] = raw[k]; } catch (e) { }
  function saveSet() { try { localStorage.setItem(SKEY, JSON.stringify(SET)); } catch (e) { } }
  var W = null, keyH = null, setOpen = false;

  // ---------- small helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function wc(t) { return String(t).trim().split(/\s+/).length; }
  function dots(n) { return new Array(n + 1).join('●') + new Array(6 - n).join('○'); }
  // the sentences of a demo part: the same split the data was made with (written without look-behind)
  function splitFr(t) { t = String(t || '').trim(); return t ? t.replace(/([.!?])\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ])/g, '$1\u0001').split('\u0001') : []; }
  function ph(s) { return esc(s).replace(/\b(X|Y|INF|PP|ADJ)\b/g, '<span style="color:#b3261e;font-weight:700;font-variant:small-caps">$1</span>'); }
  var GAP = '<span style="display:inline-block;min-width:5.5em;border-bottom:2px solid #1a2744;vertical-align:baseline">&nbsp;</span>';
  function hl(s) { return '<b style="background:#f3e9cc;font-weight:700">' + esc(s) + '</b>'; }
  function say(t, l) { try { var s = String(t).replace(/\b(X|Y|INF|PP|ADJ)\b/g, ' … '); speak(cleanForSpeech(s, l === 'en' ? 'en-GB' : 'fr-FR'), l === 'en' ? 'en-GB' : 'fr-FR'); } catch (e) { } }
  function hush() { try { speechSynthesis.cancel(); } catch (e) { } }
  function ktrTerm(n) { try { var t = ALL_TOPICS.filter(function (x) { return x.n === n; })[0]; return t ? t.term : ''; } catch (e) { return ''; } }

  function demoLearn() { try { return DEMO_LEARN; } catch (e) { return null; } }   // a const in its own data block
  // ---------- the demo in hand ----------
  function ctxFor(uid, choice) {
    var card = window['_ocard_' + uid]; if (!card) return null;
    var demo = card['demo' + choice]; if (!demo) return null;
    var idx = ORAL_CARDS.indexOf(card), code = card['code' + choice] || '';
    if (idx < 0) for (var i = 0; i < ORAL_CARDS.length; i++) if (code && (ORAL_CARDS[i]['code' + choice] || '') === code) { idx = i; break; }
    var id = idx >= 0 ? idx + choice : '';
    var DL = demoLearn(), L = (id && DL && DL[id]) || null;
    var old = (code && typeof TOPICS_DEMO_EN !== 'undefined') ? TOPICS_DEMO_EN[code] : null;
    var c = { uid: uid, choice: choice, card: card, id: id, code: code, L: L, fr: { 1: splitFr(demo.part1), 2: splitFr(demo.part2) }, en: { 1: [], 2: [] }, st: { 1: [], 2: [] }, frames: { 1: [], 2: [] }, q: { 1: card['q1' + choice], 2: card['q2' + choice] } };
    [1, 2].forEach(function (n) {
      var nw = L && L.en && L.en['p' + n], rows = old && old['p' + n] && old['p' + n].length === c.fr[n].length ? old['p' + n] : null;
      var useNew = nw && nw.length === c.fr[n].length;
      c.fr[n].forEach(function (s, i) {
        c.en[n][i] = useNew && typeof nw[i] === 'string' ? nw[i] : (rows && typeof rows[i][0] === 'string' ? rows[i][0] : '');
        c.st[n][i] = rows && rows[i][1] ? rows[i][1] : (n === 1 && c.fr[1].length === 9 ? ORDER.charAt(i) : '');
        c.frames[n][i] = rows && rows[i][2] ? rows[i][2] : [];
      });
    });
    c.base = baseItems(c);
    c.avail = {}; ACTS.forEach(function (a) { c.avail[a.k] = c.base[a.k].length; });
    c.nActs = ACTS.filter(function (a) { return c.avail[a.k] > 0; }).length;
    return c;
  }

  // ---------- items for each activity ----------
  function studioReady() {
    try {
      if (typeof _studioData !== 'undefined' && _studioData) return true;
      var s = $('ktr-studio-src').textContent, a = s.indexOf('const DATA='), b = s.indexOf(';\nconst IMGS=');
      _studioData = JSON.parse(s.slice(a + 11, b)); return true;
    } catch (e) { return false; }
  }
  function ktrList(c) {
    var k = c.card, ch = c.choice, ns = k['demo' + ch + 'KTRs'];
    if (!ns || !ns.length) ns = [].concat(k['demo' + ch + 'KTRs1'] || [], k['demo' + ch + 'KTRs2'] || []);
    var seen = {}; return (ns || []).filter(function (n) { if (seen[n]) return false; seen[n] = 1; return true; });
  }
  function properSet(c) {   // capitalised in the middle of a sentence, and never seen in lower case: a name, so it keeps its capital
    var low = {}, cap = {};
    [1, 2].forEach(function (n) { c.fr[n].forEach(function (s) { s.split(/\s+/).forEach(function (t, i) { var w = t.replace(/^[«"'’(]+|[.,;:!?…»")]+$/g, ''); if (!w) return; if (/^[a-zàâéèêëîïôûùç]/.test(w)) low[w] = 1; else if (i > 0 && /^[A-ZÀÂÉÈÊÎÔÛÇ]/.test(w)) cap[w.toLowerCase()] = 1; }); }); });
    return function (w) { w = w.replace(/^[«"'’(]+|[.,;:!?…»")]+$/g, ''); return !!cap[w.toLowerCase()] && !low[w.toLowerCase()]; };
  }
  function jumble(fr, isProper) {
    var toks = fr.trim().split(/\s+/), m = [], pre = '';
    toks.forEach(function (t) {
      if (/^[«]+$/.test(t)) { pre += t + ' '; return; }
      if (m.length && /^[?!:;»]+$/.test(t)) { m[m.length - 1] += ' ' + t; return; }
      m.push(pre + t); pre = '';
    });
    var j = m.slice(), f = j[0];
    if (f && f.length > 1 && /^[A-ZÀÂÉÈÊÎÔÛÇ][a-zàâéèêëîïôûùç'’]/.test(f) && !isProper(f)) j[0] = f.charAt(0).toLowerCase() + f.slice(1);
    var r = j.slice(), n = 0;
    do { r = shuffle(j); n++; } while (r.join('|') === j.join('|') && n < 30 && j.length > 2);
    return r;
  }
  function baseItems(c) {
    var B = { P: [], G: [], O: [], E: [], T: [], K: [] }, L = c.L;
    if (L) {
      (L.chunks || []).forEach(function (x, i) { if (x && x.fr && x.en) B.P.push({ act: 'P', id: 'P' + i, en: x.en, fr: x.fr }); });
      (L.gaps || []).forEach(function (g, i) {
        var S = c.fr[g.part] && c.fr[g.part][g.s]; if (!S || !g.cut) return;
        var p = S.indexOf(g.cut); if (p < 0) return;
        B.G.push({ act: 'G', id: 'G' + i, pre: S.slice(0, p), cut: g.cut, post: S.slice(p + g.cut.length), hint: g.hint || '', full: S });
      });
      (L.errors || []).forEach(function (e, i) { if (e && e.wrong && e.right && e.wrong !== e.right) B.E.push({ act: 'E', id: 'E' + i, wrong: e.wrong, right: e.right, why: e.why || '' }); });
      var pr = properSet(c);
      [1, 2].forEach(function (n) {
        c.fr[n].forEach(function (S, i) {
          var w = wc(S), e = c.en[n][i];
          if (w >= 6 && w <= 25 && e) B.O.push({ act: 'O', id: 'O' + n + '_' + i, fr: S, en: e, pr: pr });
          if (e) B.T.push({ act: 'T', id: 'T' + n + '_' + i, en: e, fr: S });
        });
      });
    }
    if (studioReady()) ktrList(c).forEach(function (n) {
      var pairs = []; try { pairs = apStudioPairs(n, 'stK'); } catch (e) { }
      pairs.forEach(function (p, i) { if (p.en && p.fr) B.K.push({ act: 'K', id: 'K' + n + '_' + i, q: p.en, a: p.fr, n: n, term: ktrTerm(n) }); });
    });
    return B;
  }
  // short, medium and long sentences mixed in no predictable order
  function mixLengths(a) {
    var s = a.slice().sort(function (x, y) { return wc(x.fr) - wc(y.fr); }), n = s.length, c1 = Math.ceil(n / 3), c2 = Math.ceil(2 * n / 3);
    var bins = [shuffle(s.slice(0, c1)), shuffle(s.slice(c1, c2)), shuffle(s.slice(c2))], out = [];
    while (bins.some(function (b) { return b.length; })) shuffle([0, 1, 2]).forEach(function (i) { if (bins[i].length) out.push(bins[i].pop()); });
    return out;
  }
  function drawAct(c, k, per) {
    var b = c.base[k] || []; if (!b.length) return [];
    var a = k === 'T' ? mixLengths(b) : shuffle(b);
    return per > 0 ? a.slice(0, per) : a;
  }

  // ---------- one item, ready to show: {tag, tagc, qh, clue, ah, say, spk, spl, act, from} ----------
  var TAGC = { P: ['#1a2744', '#fff'], G: ['#6b3fa0', '#fff'], O: ['#1a6b3a', '#fff'], E: ['#b03a2e', '#fff'], T: ['#1a2744', '#fff'], K: ['#c9a84c', '#1a2744'] };
  function view(b, dir) {
    var rev = dir === 'fr' || (dir === 'mix' && Math.random() < .5), o = { act: b.act, key: b.id, tagc: TAGC[b.act], spk: '', spl: 'en', say: '', clue: '', from: '' };
    if (b.act === 'P') {
      o.tag = rev ? 'Translate the frame into English' : 'Translate the frame';
      if (rev) { o.qh = ph(b.fr); o.ah = ph(b.en); o.spk = b.fr; o.spl = 'fr'; o.plainA = b.en; } else { o.qh = ph(b.en); o.ah = ph(b.fr); o.say = b.fr; o.plainA = b.fr; }
    } else if (b.act === 'T') {
      o.tag = rev ? 'Translate into English' : 'Translate into French';
      if (rev) { o.qh = esc(b.fr); o.ah = esc(b.en); o.spk = b.fr; o.spl = 'fr'; o.plainA = b.en; } else { o.qh = esc(b.en); o.ah = esc(b.fr); o.spk = b.en; o.say = b.fr; o.plainA = b.fr; }
    } else if (b.act === 'G') {
      o.tag = 'Fill the gap'; o.qh = esc(b.pre) + GAP + esc(b.post); o.clue = b.hint ? 'meaning: ' + esc(b.hint) : '';
      o.ah = esc(b.pre) + hl(b.cut) + esc(b.post); o.say = b.full; o.plainA = b.cut;
    } else if (b.act === 'O') {
      o.tag = 'Put the words in order'; o.jum = jumble(b.fr, b.pr);
      o.qh = '<span style="font-weight:700">' + esc(o.jum.join('  /  ')) + '</span>'; o.clue = b.en ? esc(b.en) : ''; o.ah = esc(b.fr); o.say = b.fr; o.plainA = b.fr;
    } else if (b.act === 'E') {
      o.tag = 'Correct the grammar error'; o.qh = esc(b.wrong);
      var mk = (typeof apErrMark === 'function') ? apErrMark(b.wrong, b.right) : esc(b.right);
      o.ah = mk + (b.why ? '<span class="why">' + esc(b.why) + '</span>' : ''); o.say = b.right; o.plainA = b.right;
    } else {
      o.tag = 'Just answer the question'; o.qh = esc(b.q); o.ah = esc(b.a); o.spk = b.q; o.from = b.n ? 'KTR ' + b.n + (b.term ? ' · ' + b.term : '') : ''; o.say = b.a; o.plainA = b.a;
    }
    return o;
  }
  function tagHtml(o) { return '<span class="od-tag" style="background:' + o.tagc[0] + ';color:' + o.tagc[1] + '">' + esc(o.tag).toUpperCase() + '</span>'; }
  function actName(k) { for (var i = 0; i < ACTS.length; i++) if (ACTS[i].k === k) return ACTS[i].name; return ''; }
  function selActs() { return ACTS.filter(function (a) { return W.sel[a.k] && W.ctx.avail[a.k] > 0; }); }
  function selTotal() { return selActs().reduce(function (n, a) { return n + W.ctx.avail[a.k]; }, 0); }
  // a whole practice set: the ticked activities in ladder order, each with its own items
  function sessionViews() {
    var out = [];
    selActs().forEach(function (a) { drawAct(W.ctx, a.k, SET.per).forEach(function (b) { out.push(view(b, SET.dir)); }); });
    return out;
  }

  // ---------- the overlay ----------
  function lockKeys(fn) { unkey(); keyH = function (e) { if ($('apktr-overlay') || !$('od-ov')) return; if (fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); } else if (/^Arrow(Left|Right|Down|Up)$/.test(e.key)) e.stopImmediatePropagation(); }; window.addEventListener('keydown', keyH, true); }
  function unkey() { if (keyH) { window.removeEventListener('keydown', keyH, true); keyH = null; } }
  function openOv() {
    closeOv(true);
    var o = document.createElement('div'); o.id = 'od-ov'; o.className = 'od-ov'; o.setAttribute('role', 'dialog');
    o.addEventListener('click', onClick);
    document.body.appendChild(o); document.documentElement.style.overflow = 'hidden';
    return o;
  }
  function closeOv(quiet) {
    var o = $('od-ov'); if (o) o.remove();
    document.documentElement.style.overflow = ''; unkey(); hush();
    if (!quiet) W = null;
  }
  function paint(html, keep) {
    var o = $('od-ov'); if (!o) return;
    var y = keep ? o.scrollTop : 0;
    o.innerHTML = html; o.scrollTop = y;
  }
  function top(title, sub, backTxt, extra) {
    return '<div class="od-top"><button type="button" class="od-back" data-a="back">← ' + (backTxt || 'Back') + '</button><h2 class="od-title">' + title + (sub ? '<small>' + sub + '</small>' : '') + '</h2>' + (extra || '') + '</div>';
  }
  function codeBadge() { return W.ctx.code ? '<span class="od-code">' + esc(W.ctx.code) + '</span>' : ''; }
  function step(n, t) { return '<div class="ms-step"><span class="ms-num">' + n + '</span>' + t + '</div>'; }

  // ---------- page 1: the set-up ----------
  function pageSetup() {
    var c = W.ctx, card = c.card, ch = c.choice, na = selActs().length, tot = selTotal(), has = c.nActs > 0;
    var h = '<div class="od-page">' + top('Learn from this demo ' + codeBadge(), esc(card.topicName), 'Back to the card');
    h += '<div class="od-decl"><b>' + esc(card['decl' + ch]) + '</b><ol><li>' + esc(card['q1' + ch]) + '</li><li>' + esc(card['q2' + ch]) + '</li></ol></div>';
    h += '<div class="od-listen"><span>🎧 <b>First, listen to the demo</b> and make your notes. Then come back and make it yours.</span><button type="button" data-a="listen">▶ Demo Mode</button></div>';
    h += '<div class="od-cyc">' + ORDER.split('').map(function (s) { return '<div class="od-cy" style="background:' + ST[s][1] + '"><b>' + s + '</b>' + ST[s][0] + '</div>'; }).join('') + '</div>';
    if (has) {
      h += step(1, 'What do you want to practise from this demo?');
      h += '<div class="od-acts">' + ACTS.filter(function (a) { return c.avail[a.k] > 0; }).map(function (a) {
        var on = !!W.sel[a.k], n = c.avail[a.k];
        return '<button type="button" class="od-act' + (on ? ' on' : '') + '" role="checkbox" aria-checked="' + on + '" data-a="tog" data-k="' + a.k + '"><span class="od-chk"></span><span class="od-lv" title="Easy to hard">' + dots(a.lv) + '</span><b>' + a.name + '</b><small>' + a.desc + '</small><i>' + n + ' item' + (n === 1 ? '' : 's') + '</i></button>';
      }).join('') + '</div>';
      h += '<div class="od-selrow"><span>Tick one, several or all. They run from easy to hard.</span><button type="button" class="od-link" data-a="all">Tick all</button><button type="button" class="od-link" data-a="none">Clear</button></div>';
    } else {
      h += '<div class="od-none">The extra activities (Phrases, Gaps, Word order, Spot the mistake, Translate) are not ready for this demo yet. You can still read it again, have a go yourself, or open the whole-answer translation sheet.</div>';
    }
    var sum = SET.per + ' items an activity · ' + DIRS[SET.dir] + ' · Speed: ' + SET.tiles + ' tiles, ' + SET.tt + ' s a turn';
    h += step(has ? 2 : 1, has ? 'How do you want to practise it?' : 'How do you want to use this demo?');
    if (has) {
      h += '<details class="ms-opts" id="od-set"' + (setOpen ? ' open' : '') + '><summary><span class="ms-gear">⚙</span><span class="ms-st">Settings</span><small>' + sum + '</small><span class="ms-chg"></span></summary>'
        + optRow('Items in each activity', 'per', [[4, '4'], [6, '6'], [8, '8'], [0, 'All']])
        + optRow('Items in a test', 'test', [[10, '10'], [15, '15'], [20, '20']])
        + optRow('Direction (Phrases, Translate)', 'dir', [['en', DIRS.en], ['fr', DIRS.fr], ['mix', DIRS.mix]])
        + optRow('Speed Challenge: tiles', 'tiles', [[9, '9'], [12, '12'], [16, '16']])
        + optRow('Timer: seconds a turn (Speed Challenge)', 'tt', [[10, '10'], [20, '20'], [30, '30'], [45, '45']])
        + '</details>';
    }
    var ok = na > 0 && tot > 0;
    h += '<div class="ms-now">' + (!has ? '' : !na ? 'Choose at least one activity above to unlock the ways to practise it. (Read it again and Have a go are always open.)' : 'Practising: <b>' + selActs().map(function (a) { return a.name; }).join(', ') + '</b> · ' + tot + ' items') + '</div>';
    var T = [
      ['ms-drill', 'drill', 'Drill', 'Items one at a time. You mark yourself ✗ ~ ✓.', 'drill', !ok],
      ['ms-speed', 'speed', 'Speed Challenge', 'Race the clock, solo or in teams.', 'speed', !ok],
      ['ms-test', 'test', 'Test', 'A short test to print or do on screen. Answers stay hidden.', 'test', !ok],
      ['ms-print', '🖨', 'Print a sheet', 'The same activities as a sheet to write on.', 'print', !ok],
      ['ms-read', '📖', 'Read it again', 'The demo sentence by sentence, with each stage of the cycle.', 'read', false],
      ['ms-go', '🎙', 'Have a go', 'Answer the question yourself, then reuse the phrases on a new topic.', 'go', false]
    ];
    if (!has) T = T.filter(function (x) { return x[4] === 'read' || x[4] === 'go'; });
    h += '<div class="aph-tools ms-tiles">' + T.map(function (x) {
      var img = ICONS[x[1]] ? '<img class="ms-img" alt="" src="' + ICONS[x[1]] + '">' : '<span class="ms-img od-ic">' + x[1] + '</span>';
      return '<button type="button" class="ms-tile ' + x[0] + '"' + (x[5] ? ' disabled' : '') + ' data-a="' + x[4] + '">' + img + '<span class="ms-tx"><span class="ms-tt">' + x[2] + '</span><span class="ms-td">' + x[3] + '</span></span></button>';
    }).join('') + '</div>';
    var hasOld = typeof TOPICS_DEMO_EN !== 'undefined' && c.code && TOPICS_DEMO_EN[c.code];
    h += '<div class="od-extra"><p>' + (hasOld ? '<b>Translation sheet.</b> The whole answer, Part 1 and Part 2, to translate either way, with the phrase glossary and the answer key. ' : '') + '<b>A link to this page</b> can be pasted into OneNote: it opens straight here.</p>'
      + (hasOld ? '<button type="button" class="ms-b sm" data-a="sheet">🖨 Translation sheet</button>' : '') + '<button type="button" class="ms-b sm" data-a="link">🔗 Copy link to this demo</button></div>';
    h += '</div>';
    return h;
  }
  function optRow(label, key, opts) {
    return '<div class="od-set"><span>' + label + '</span>' + opts.map(function (o) { return '<button type="button" class="ms-b sm' + (SET[key] === o[0] ? ' on' : '') + '" data-a="opt" data-o="' + key + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
  }
  function showSetup(keep) {
    W.view = 'setup'; unkey(); hush();
    paint(pageSetup(), keep);
    var d = $('od-set'); if (d) d.addEventListener('toggle', function () { setOpen = d.open; });
  }

  // ---------- Drill ----------
  function goDrill() {
    var q = sessionViews(); if (!q.length) return;
    W.dr = { q: q, i: 0, ok: 0, near: 0, bad: [], shown: false, n: q.length, n0: q.length };
    W.view = 'drill'; drillCard();
  }
  function drillCard() {
    var d = W.dr; if (d.i >= d.q.length) return drillEnd();
    var o = d.q[d.i]; d.shown = false;
    paint('<div class="od-page od-narrow">' + top('Drill ' + codeBadge(), '', 'Back', '<div class="od-score"><span class="ok">✓ ' + d.ok + '</span><span class="bad">✗ ' + d.bad.length + '</span></div>')
      + '<div class="ms-bar"><div style="width:' + Math.round(Math.min(1, d.i / d.n) * 100) + '%"></div></div>'
      + '<div class="od-card">' + tagHtml(o) + '<div class="od-meta">' + actName(o.act) + ' · item ' + Math.min(d.i + 1, d.n0) + ' of ' + d.n0 + (o.from ? ' · ' + esc(o.from) : '') + '</div>'
      + '<div class="od-q">' + o.qh + '</div>' + (o.clue ? '<div class="od-clue">' + o.clue + '</div>' : '') + '<div id="od-a"></div></div>'
      + '<div id="od-btns"><button type="button" class="ms-b pri od-block" data-a="show">Show answer</button></div>'
      + '<div class="od-keys"><span>← major error</span><span>↓ nearly</span><span>→ show answer / got it</span></div></div>');
    lockKeys(function (e) {
      if (e.key === 'Escape') { back(); return true; }
      if (!W.dr || W.view !== 'drill') return false;
      if (!W.dr.shown) { if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { drillShow(); return true; } return false; }
      if (e.key === 'ArrowLeft') { drillMark('bad'); return true; } if (e.key === 'ArrowDown') { drillMark('near'); return true; } if (e.key === 'ArrowRight' || e.key === 'Enter') { drillMark('ok'); return true; }
      return false;
    });
    if (o.spk && o.act !== 'P') setTimeout(function () { if (W && W.view === 'drill' && W.dr.q[W.dr.i] === o) say(o.spk, o.spl); }, 250);
  }
  function drillShow() {
    var d = W.dr, o = d.q[d.i]; if (d.shown) return; d.shown = true;
    $('od-a').innerHTML = '<div class="od-ans">' + o.ah + '</div>';
    $('od-btns').innerHTML = '<div class="aph-mark"><button type="button" class="aph-mark-btn bad" data-a="mark" data-r="bad">✗ Major error<small>← key</small></button><button type="button" class="aph-mark-btn near" data-a="mark" data-r="near">~ Nearly<small>↓ key</small></button><button type="button" class="aph-mark-btn ok" data-a="mark" data-r="ok">✓ Got it<small>→ key</small></button></div>'
      + (o.say ? '<div class="ms-cen"><button type="button" class="ms-b sm" data-a="replay">🔊 Replay</button></div>' : '');
    if (o.say) say(o.say, 'fr');
  }
  function drillMark(r) {
    var d = W.dr, o = d.q[d.i]; if (!d.shown) return;
    if (r === 'ok') d.ok++;
    else if (r === 'near') { d.near++; d.q.splice(Math.min(d.i + 2 + Math.floor(Math.random() * 2), d.q.length), 0, o); d.n++; }
    else if (d.bad.indexOf(o) < 0) d.bad.push(o);
    d.i++; drillCard();
  }
  function drillEnd() {
    var d = W.dr, tot = d.n0, pct = tot ? Math.round(d.ok / tot * 100) : 0;
    unkey();
    paint('<div class="od-page od-narrow">' + top('Drill · done', '', 'Back')
      + '<div class="od-card" style="text-align:center"><div style="font:700 2.2rem \'Playfair Display\',serif">' + d.ok + ' / ' + tot + '</div><div class="od-note" style="margin:4px 0 0">' + pct + '% · ' + (pct === 100 ? 'Every item right. Now try the Speed Challenge or a Test.' : pct >= 80 ? 'Excellent work, nearly there.' : pct >= 60 ? 'Good effort. Keep practising.' : 'Keep at it: repetition is the key.') + '</div></div>'
      + (d.bad.length ? '<div class="od-note"><b>' + d.bad.length + ' to revisit</b></div><div class="od-sum">' + d.bad.map(function (o) { return '<div class="it">' + esc(actName(o.act)) + ': ' + o.qh + '<small style="color:#1f6b45;font-weight:600">' + o.ah + '</small></div>'; }).join('') + '</div>' : '<div class="od-none">No major errors: a clean sweep.</div>')
      + '<div class="ms-cen">' + (d.bad.length ? '<button type="button" class="ms-b pri" data-a="dagain">▶ Drill the ✗ ones again (' + d.bad.length + ')</button>' : '') + '<button type="button" class="ms-b" data-a="drill">↻ Do it again</button><button type="button" class="ms-b" data-a="back">← Back</button></div></div>');
  }
  function drillAgain() {
    var d = W.dr, q = d.bad.slice(); W.dr = { q: q, i: 0, ok: 0, near: 0, bad: [], shown: false, n: q.length, n0: q.length }; drillCard();
  }

  // ---------- Speed Challenge: the app's own Speed engine, with the demo registered as a source ----------
  var K = window.__ktr, k0 = null;
  function speedItems(c) {
    var out = { dmP: [], dmG: [], dmO: [], dmE: [], dmT: [], dmK: [] }, B = c.base;
    B.P.forEach(function (b) { out.dmP.push({ en: b.en, fr: b.fr, say: b.fr.replace(/\b(X|Y|INF|PP|ADJ)\b/g, ' … '), task: '', lvl: function () { return null; } }); });
    B.G.forEach(function (b) { out.dmG.push({ en: '\u0003' + b.pre + ' _____ ' + b.post + '\u0004' + (b.hint ? '\u0005(meaning: ' + b.hint + ')\u0006' : ''), fr: b.cut, say: b.full, task: 'gap', lvl: function () { return null; } }); });
    B.O.forEach(function (b) { var j = jumble(b.fr, b.pr); out.dmO.push({ en: '\u0003' + j.join('  /  ') + '\u0004' + (b.en ? '\u0005(' + b.en + ')\u0006' : ''), fr: b.fr, say: b.fr, task: 'order', lvl: function () { return null; } }); });
    B.E.forEach(function (b) {
      var m = (typeof apErrMark === 'function') ? apErrMark(b.wrong, b.right) : esc(b.right);
      m = m.replace(/<u[^>]*>/g, '\u0007').replace(/<\/u>/g, '\u0008').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      out.dmE.push({ en: b.wrong, fr: m + (b.why ? ' (' + b.why + ')' : ''), say: b.right, task: 'err', lvl: function () { return null; } });
    });
    B.T.forEach(function (b) { out.dmT.push({ en: b.en, fr: b.fr, say: b.fr, task: '', lvl: function () { return null; } }); });
    B.K.forEach(function (b) { out.dmK.push({ en: b.q, fr: b.a, say: b.a, task: 'know', lvl: function () { return null; } }); });
    return out;
  }
  function hookKtr() {
    K = window.__ktr; if (!K || K.__od) return; K.__od = 1;
    k0 = { data: K.data, groups: K.groups, srcs: K.srcs, items: K.items };
    K.data = function () { var d = K.demo; if (!d) return k0.data(); var o = {}; o[d.key] = { label: d.label, phrases: [], demo: true }; return o; };
    K.groups = function () { return K.demo ? [] : k0.groups(); };
    K.srcs = function () { return K.demo ? K.demo.srcList.slice() : k0.srcs(); };
    K.items = function (s, k) { if (K.demo && /^dm[PGOETK]$/.test(s)) return K.demo.items[s] || []; return k0.items(s, k); };
    if (typeof closeKTRChallenge === 'function') { var cc = closeKTRChallenge; window.closeKTRChallenge = function () { var r = cc.apply(this, arguments); if (K) K.demo = null; return r; }; }
    // the Speed Challenge page itself: three small changes so the demo's questions read properly and nothing about the demo is remembered for the ordinary game
    if (typeof APKTR_TPL === 'string') {
      var T = APKTR_TPL, R = function (a, b) { if (T.indexOf(a) >= 0) T = T.replace(a, function () { return b; }); };
      R("function oTask(o) { return ", "function oTask(o) { if (o.task === 'gap') return 'Fill the gap'; if (o.src === 'dmP') return 'Translate the frame'; return ");
      R("fixed: tk === 'know' ||", "fixed: tk === 'gap' || tk === 'know' ||");
      R("return d ? 'KTR ' + k + ' · ' + d.label : 'KTR ' + k; }", "return d ? (d.demo ? d.label : 'KTR ' + k + ' · ' + d.label) : 'KTR ' + k; }");
      R("if (_oc) OC = _oc;", "if (_oc && !(API && API.demo)) OC = _oc;");
      R("if (!OC.secs || !OC.secs.length) OC.secs = oKeys();", "if (!OC.secs || !OC.secs.length) OC.secs = oKeys();\ntry { OC.secs = OC.secs.filter(function (k) { return oData()[k]; }); if (!OC.secs.length) OC.secs = oKeys(); var _ks = {}; (API.srcs ? API.srcs() : [['words']]).forEach(function (x) { _ks[x[0]] = 1; }); OC.srcs = OC.srcs.filter(function (x) { return _ks[x]; }); if (!OC.srcs.length) OC.srcs = ['words']; } catch (e) { }");
      R("try { localStorage.setItem('apktr_cfg', JSON.stringify(OC)); } catch (e) {}", "try { if (!(API && API.demo)) localStorage.setItem('apktr_cfg', JSON.stringify(OC)); } catch (e) {}");
      R("if (API && API.useSrcs && typeof Q === 'object') Q.teams = 0;", "if (API && API.useSrcs && typeof Q === 'object') Q.teams = 0;\nif (API && API.demo && API.demo.cfg && typeof Q === 'object') { Q.n = API.demo.cfg.n; Q.tt = API.demo.cfg.tt; }");
      R("'</div></div><h3>📚 Which KTRs?</h3><div class=\"sec\">'", "'</div></div><h3>' + (API.demo ? '📚 This demo' : '📚 Which KTRs?') + '</h3><div class=\"sec\">'");
      R("'<div class=\"ft\"><button class=\"sec2\" onclick=\"oAll(1)\">All 70</button><button class=\"sec2\" onclick=\"oAll(0)\">Clear</button>", "'<div class=\"ft\">' + (API.demo ? '' : '<button class=\"sec2\" onclick=\"oAll(1)\">All 70</button><button class=\"sec2\" onclick=\"oAll(0)\">Clear</button>') + '");
      R("OC.secs.length + ' KTRs · ' + n", "(API.demo ? 'This demo' : OC.secs.length + ' KTRs') + ' · ' + n");
      R("oLabelTop();\nqfNew();\n(function () {", "oLabelTop();\nqfNew();\nif (API && API.demo) { try { [].forEach.call(document.querySelectorAll('button'), function (b) { if (/Choose KTRs/.test(b.textContent)) b.textContent = b.textContent.replace('Choose KTRs', 'Choose activities'); }); var h = document.querySelector('.qftitle h1,.qftitle h2,h1'); if (h && /KTR words fast/.test(h.textContent)) h.textContent = 'Speed Challenge'; [].forEach.call(document.querySelectorAll('.top *'), function (x) { if (!x.children.length && /KTR WORDS/i.test(x.textContent)) x.textContent = x.textContent.replace(/KTR WORDS/i, 'LEARN FROM THIS DEMO'); }); } catch (e) { } }\n(function () {");
      window.APKTR_TPL = T;
    }
  }
  function goSpeed() {
    var c = W.ctx, ks = selActs(); if (!ks.length) return;
    if (typeof openKTRChallenge !== 'function' || !window.__ktr) { alert('The Speed Challenge is not available here.'); return; }
    hookKtr();
    var items = speedItems(c), key = 'd' + (c.id || c.code), rev = SET.dir === 'fr' ? true : SET.dir === 'en' ? false : null;
    var list = ACTS.filter(function (a) { return c.avail[a.k] > 0; }).map(function (a) { return [a.src, a.name, SRC_SUB[a.src]]; });
    openKTRChallenge([key], true, rev, ks.map(function (a) { return a.src; }));
    window.__ktr.demo = { key: key, label: 'Demo ' + (c.code || c.id), items: items, srcList: list, cfg: { n: SET.tiles, tt: SET.tt } };
  }

  // ---------- Test: a short test on screen (answers behind a button), printed with the app's own Spot Test sheets ----------
  function goTest(again) {
    var ks = selActs(); if (!ks.length) return;
    var pools = ks.map(function (a) { return drawAct(W.ctx, a.k, 0); }), avail = pools.reduce(function (n, p) { return n + p.length; }, 0);
    var fit = (typeof apSpotFit === 'function') ? apSpotFit(avail, Math.max(1, Math.round(SET.test / 5))) : { per: Math.max(1, Math.min(3, Math.floor(avail / 5))) };
    if (!fit || avail < 5) { alert('A test needs at least 5 items. Tick more activities.'); return; }
    var want = 5 * fit.per, got = [], r = 0;
    while (got.length < want && pools.some(function (p) { return p.length > r; })) { pools.forEach(function (p, i) { if (got.length < want && p[r]) got.push({ b: p[r], i: i }); }); r++; }
    got.sort(function (a, b) { return a.i - b.i; });   // easy to hard
    var vs = got.map(function (g) { return view(g.b, SET.dir); }), rows = [];
    for (var i = 0; i < 5; i++) rows.push(vs.slice(i * fit.per, i * fit.per + fit.per).map(function (o) { return { term: o.qh + (o.clue ? '<div style="font-size:.9em;color:#56607a;font-style:italic;margin-top:4px">' + o.clue + '</div>' : ''), _modeLabel: o.tag, _answer: o.ah.replace(/<span class="why">(.*?)<\/span>/g, ' <span style="color:#56607a;font-size:.9em">($1)</span>') }; }));
    W.view = 'test'; W.test = { vs: vs, rows: rows, per: fit.per, show: false, note: fit.note || '' }; pageTest();
  }
  function pageTest() {
    var t = W.test, k = 0; unkey();
    lockKeys(function (e) { if (e.key === 'Escape') { back(); return true; } return false; });
    var h = '<div class="od-page od-narrow">' + top('Test ' + codeBadge(), '5 × ' + t.per + ' = ' + (5 * t.per) + ' items · ' + selActs().map(function (a) { return a.name; }).join(', '), 'Back');
    h += '<div class="od-note">Do each item on paper or type in the box. Read the tag on each item to see what to do. Check your answers at the end with <b>Show answers</b>.</div>';
    if (t.note) h += '<div class="od-none">' + esc(t.note) + '</div>';
    h += '<div class="od-bar"><button type="button" class="ms-b sm pri" data-a="tshow">' + (t.show ? 'Hide answers' : 'Show answers') + '</button><button type="button" class="ms-b sm" data-a="tprint" data-t="0">🖨 Print the test</button><button type="button" class="ms-b sm" data-a="tprint" data-t="1">🖨 Print with answers</button><button type="button" class="ms-b sm" data-a="test2">🔀 New test</button></div>';
    t.vs.forEach(function (o, i) {
      h += '<div class="od-testrow"><span class="n">' + (i + 1) + '</span>' + tagHtml(o) + '<div class="od-q" style="font-size:1.1875rem;margin-top:8px">' + o.qh + '</div>' + (o.clue ? '<div class="od-clue">' + o.clue + '</div>' : '') + '<textarea rows="2" aria-label="Your answer" placeholder="Your answer (optional: you can write it on paper)"></textarea>' + (t.show ? '<div class="od-ans">' + o.ah + '</div>' : '') + '</div>';
    });
    h += '<div class="ms-cen"><button type="button" class="ms-b" data-a="back">← Back</button></div></div>';
    var keepVals = [].map.call(($('od-ov') || { querySelectorAll: function () { return []; } }).querySelectorAll('.od-testrow textarea'), function (x) { return x.value; });
    paint(h, true);
    [].forEach.call($('od-ov').querySelectorAll('.od-testrow textarea'), function (x, i) { if (keepVals[i]) x.value = keepVals[i]; });
  }
  function printTest(teacher) {
    var t = W.test; if (typeof openAPSpotTestPDF !== 'function') { alert('Printing is not available here.'); return; }
    var keep = [apSpotRows, apSpotLabel, apSpotQFlag, apSpotAFlag, apSpotBrand];
    apSpotRows = t.rows; apSpotLabel = 'Demo ' + (W.ctx.code || W.ctx.id); apSpotQFlag = ''; apSpotAFlag = '&#127467;&#127479;'; apSpotBrand = 'A Level Oral &middot; Learn from this demo';
    try { openAPSpotTestPDF(null, teacher ? 1 : 0); } finally { apSpotRows = keep[0]; apSpotLabel = keep[1]; apSpotQFlag = keep[2]; apSpotAFlag = keep[3]; apSpotBrand = keep[4]; }
  }

  // ---------- Print a sheet ----------
  function printSheet() {
    var c = W.ctx, ks = selActs(); if (!ks.length) return;
    var sets = ks.map(function (a) { return { a: a, vs: drawAct(c, a.k, SET.per).map(function (b) { return view(b, SET.dir); }) }; });
    var css = '@page{size:A4;margin:12mm 13mm}*{box-sizing:border-box}body{margin:0;font:9.5pt/1.4 "DM Sans",Helvetica,Arial,sans-serif;color:#1a2744;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
      + '.toolbar{position:sticky;top:0;background:#1a2744;color:#fff;padding:10px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-size:13px;z-index:5}.toolbar button{background:#c9a84c;color:#1a2744;border:0;border-radius:6px;padding:8px 14px;font-weight:700;cursor:pointer;font-family:inherit}.toolbar label{display:flex;gap:6px;align-items:center;cursor:pointer}'
      + '.sheet{max-width:184mm;margin:0 auto;padding:6mm 0}@media print{.toolbar{display:none}.sheet{padding:0;max-width:none}}'
      + '.decl{border:1.5px solid #1a2744;border-radius:2mm;padding:2mm 3mm;font-weight:700;margin:2mm 0}.intro{font-size:9pt;color:#3d4866;background:#f7f3e8;border-left:3px solid #c9a84c;padding:2mm 3mm;margin:0 0 3mm}'
      + '.act{border:1.5px solid #c9a84c;border-radius:3mm;margin:0 0 4mm;break-inside:avoid;overflow:hidden}.ah{background:#1a2744;color:#fff;padding:2mm 3.5mm;display:flex;justify-content:space-between;align-items:baseline}.ah b{font-size:10.5pt}.ah span{font-size:7.5pt;letter-spacing:.06em;text-transform:uppercase;color:#e6d8ad}'
      + '.ab{padding:2mm 3.5mm 2.5mm}.how{font-size:8.5pt;color:#56607a;margin:0 0 1.5mm}.it{margin:1.8mm 0}.it .n{display:inline-block;width:5mm;font-weight:700;color:#a8862e}.ln{height:7.5mm;border-bottom:1px solid #b9c0cf}.sm{font-size:8pt;color:#8a93a8;font-style:italic}'
      + '.key{display:none}body.showkey .key{display:block}.pb{break-before:page}h1{font:700 19pt Georgia,serif;margin:3mm 0 1mm}h1 em{color:#a8862e;font-style:normal}.sub{color:#56607a;font-size:9pt}';
    var how = { P: 'Write the French (or English) for each frame. X, Y, INF, PP and ADJ are the bits you change when you use it.', G: 'Write the missing words in the gap. The English tells you what they mean.', O: 'Write the sentence with the words in the right order.', E: 'There is one grammar mistake in each sentence. Underline it and write the sentence correctly.', T: 'One sentence at a time. Write your translation.', K: 'Just answer the question: a name, a date or a figure.' };
    var body = '', keyH2 = '';
    sets.forEach(function (s) {
      body += '<div class="act"><div class="ah"><b>' + s.a.name + '</b><span>Level ' + dots(s.a.lv) + '</span></div><div class="ab"><p class="how">' + how[s.a.k] + '</p>'
        + s.vs.map(function (o, i) {
          var lines = (o.act === 'T' || o.act === 'O' || o.act === 'E') ? 2 : 1;
          return '<div class="it"><span class="n">' + (i + 1) + '</span>' + o.qh + (o.clue ? '<div class="sm">' + o.clue + '</div>' : '') + (o.from ? ' <span class="sm">(' + esc(o.from) + ')</span>' : '') + new Array(lines + 1).join('<div class="ln"></div>') + '</div>';
        }).join('') + '</div></div>';
      keyH2 += '<div class="act"><div class="ah"><b>' + s.a.name + '</b></div><div class="ab">' + s.vs.map(function (o, i) { return '<div class="it"><span class="n">' + (i + 1) + '</span>' + o.ah.replace(/<span class="why">(.*?)<\/span>/g, ' <span class="sm">($1)</span>') + '</div>'; }).join('') + '</div></div>';
    });
    var code = esc(c.code || c.id), head = (typeof aphPrintHead === 'function') ? aphPrintHead({ kicker: 'Eton A Level &middot; Oral (Paper 3) &middot; Learn from this demo', title: 'Learn from this demo &mdash; <em>' + code + '</em>', meta: esc(c.card.topicName), print: false }) : '<h1>Learn from this demo &middot; <em>' + code + '</em></h1>';
    var html = '<!doctype html><html><head><meta charset="utf-8"><title>' + code + ' · Learn from this demo</title><style>' + (typeof aphCSS === 'function' ? aphCSS() : '') + '</style><style>' + css + '</style></head><body>'
      + '<div class="toolbar"><button onclick="window.print()">&#128424; Print / PDF</button><label><input type="checkbox" onchange="document.body.classList.toggle(\'showkey\',this.checked)"> Include the answer pages</label><span>Answers stay hidden unless you tick the box.</span></div><div class="sheet">'
      + head + '<div class="decl">' + esc(c.card['decl' + c.choice]) + '</div><div class="intro">You have listened to the demo and made your notes. Now make it yours: do the activities in order, from easy to hard.</div>' + body
      + '<div class="key"><div class="pb"></div><h1>Answers &mdash; <em>' + code + '</em></h1><p class="sub">Check your work, then correct anything wrong in a different colour.</p>' + keyH2 + '</div></div></body></html>';
    var w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups for this page so the sheet can open in a new tab.'); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  // ---------- Read it again ----------
  function pageRead() {
    var c = W.ctx, h = '<div class="od-page">' + top('Read it again ' + codeBadge(), esc(c.card.topicName), 'Back');
    h += '<div class="od-bar"><button type="button" class="ms-b sm' + (W.showEn ? ' on' : '') + '" data-a="en">' + (W.showEn ? 'Hide English' : 'Show English') + '</button><button type="button" class="ms-b sm" data-a="listen">🎧 Listen to the whole demo</button></div>';
    [1, 2].forEach(function (n) {
      if (!c.fr[n].length) return;
      h += '<div class="od-qbox">Part ' + n + ' · ' + esc(c.q[n]) + '</div><table class="od-tbl">';
      c.fr[n].forEach(function (s, i) {
        var st = c.st[n][i], T = ST[st];
        h += '<tr><td class="b">' + (T ? '<span style="background:' + T[1] + '">' + st + '</span><small>' + T[0] + '</small>' : '') + '</td><td>' + boldFrames(s, c.frames[n][i]) + (W.showEn && c.en[n][i] ? '<span class="en">' + esc(c.en[n][i]) + '</span>' : '') + '</td><td class="s"><button type="button" data-a="say" data-n="' + n + '" data-i="' + i + '" aria-label="Listen">🔊</button></td></tr>';
      });
      h += '</table>';
    });
    var ns = ktrList(c); if (ns.length) h += '<div class="od-note"><b>Key Topic References this answer uses</b></div><div class="od-chips">' + ns.map(function (n) { return '<span>KTR ' + n + ' · ' + esc(ktrTerm(n)) + '</span>'; }).join('') + '</div>';
    h += '<div class="ms-cen"><button type="button" class="ms-b" data-a="back">← Back</button></div></div>';
    W.view = 'read'; unkey(); lockKeys(function (e) { if (e.key === 'Escape') { back(); return true; } return false; });
    paint(h, true);
  }
  function boldFrames(s, frames) {
    var marks = new Array(s.length), used = 0;
    (frames || []).forEach(function (f) { var k = s.indexOf(f, used); if (k < 0) k = s.indexOf(f); if (k < 0) return; for (var j = 0; j < f.length; j++) marks[k + j] = 1; used = k + f.length; });
    var out = '', i = 0;
    while (i < s.length) { var b = !!marks[i], j = i; while (j < s.length && !!marks[j] === b) j++; var t = esc(s.slice(i, j)); out += b ? '<b class="cy">' + t + '</b>' : t; i = j; }
    return out;
  }

  // ---------- Have a go (and Reuse it) ----------
  function pickFrames(c) { var a = shuffle(c.base.P.length ? c.base.P : []).slice(0, 3); return a; }
  function otherTopics(c) {
    var seen = {}, out = [];
    ORAL_CARDS.forEach(function (k) { if (k.topic !== c.card.topic && !seen[k.topic]) { seen[k.topic] = 1; out.push(k.topicName); } });
    return shuffle(out);
  }
  function pageGo() {
    var c = W.ctx, ch = c.choice;
    if (!W.frames) { W.frames = pickFrames(c); W.topics = otherTopics(c); }
    var h = '<div class="od-page od-narrow">' + top('Have a go ' + codeBadge(), esc(c.card.topicName), 'Back');
    h += '<div class="od-card"><div class="od-meta" style="margin-top:0">Now answer it yourself, with the demo closed</div><div class="od-q" style="font-size:1.25rem">' + esc(c.card['decl' + ch]) + '</div><div class="od-clue" style="font-style:normal">1. ' + esc(c.card['q1' + ch]) + '<br>2. ' + esc(c.card['q2' + ch]) + '</div></div>';
    h += '<p class="od-note">Use the nine stages of the cycle (Q P S E A I O H C). Include at least three phrases you have learned and one fact from the KTRs. Then record it.</p>';
    h += '<div class="od-bar"><button type="button" class="ms-b sm" data-a="prep">⏱ Start 5-minute preparation</button>' + ((window.APAL && APAL.supported && APAL.supported()) ? '<button type="button" class="ms-b sm pri" data-a="rec">🎙 Record my oral</button>' : '') + '</div>';
    if (W.frames.length) {
      h += '<div class="ms-step" style="margin-top:20px"><span class="ms-num">★</span>Reuse it</div><p class="od-note">Use each frame below in a sentence of your own on a <b>different topic</b>, replacing X, Y, INF, PP and ADJ.</p>';
      W.frames.forEach(function (f, i) { h += '<div class="od-fr"><b>' + ph(f.fr) + '</b><em>' + esc(f.en) + '</em><div style="flex:1 1 100%;font-size:.875rem;font-weight:700;color:#8a6d1f">Topic to try: ' + esc(W.topics[i % W.topics.length] || '') + '</div><textarea class="od-ta" rows="2" aria-label="Your sentence"></textarea></div>'; });
      h += '<div class="od-bar"><button type="button" class="ms-b sm" data-a="frames">🔀 Three different frames</button></div>';
    }
    h += '<div class="ms-cen"><button type="button" class="ms-b" data-a="back">← Back</button></div></div>';
    W.view = 'go'; unkey(); lockKeys(function (e) { if (e.key === 'Escape') { back(); return true; } return false; });
    paint(h, true);
  }

  // ---------- link, old sheet, listen ----------
  function linkText() { var c = W.ctx; return location.href.replace(/[#?].*$/, '') + '#learn=' + encodeURIComponent(c.code || c.id); }
  function copyLink() {
    var url = linkText(), done = function () { alert('Link copied. Paste it into OneNote: it opens straight on this demo.'); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); }); return; } } catch (e) { }
    fallbackCopy(url);
  }
  function fallbackCopy(url) {
    var t = document.createElement('textarea'); t.value = url; t.style.cssText = 'position:fixed;left:0;top:0;opacity:0'; document.body.appendChild(t); t.focus(); t.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) { } t.remove();
    if (ok) alert('Link copied. Paste it into OneNote: it opens straight on this demo.'); else prompt('Copy this link:', url);
  }

  // ---------- navigation: Back goes back exactly one stage ----------
  function back() {
    if (!W) return;
    if (W.view === 'setup') { closeOv(); return; }
    showSetup();
  }
  function onClick(e) {
    var t = e.target.closest('[data-a]'); if (!t || t.disabled) return;
    var a = t.getAttribute('data-a'), c = W && W.ctx;
    switch (a) {
      case 'back': back(); break;
      case 'tog': var k = t.getAttribute('data-k'); W.sel[k] = !W.sel[k]; showSetup(true); break;
      case 'all': ACTS.forEach(function (x) { if (c.avail[x.k] > 0) W.sel[x.k] = true; }); showSetup(true); break;
      case 'none': ACTS.forEach(function (x) { W.sel[x.k] = false; }); showSetup(true); break;
      case 'opt': var key = t.getAttribute('data-o'), v = t.getAttribute('data-v'); SET[key] = (key === 'dir') ? v : parseInt(v, 10); saveSet(); showSetup(true); break;
      case 'drill': goDrill(); break;
      case 'speed': goSpeed(); break;
      case 'test': goTest(); break;
      case 'test2': goTest(true); break;
      case 'tshow': W.test.show = !W.test.show; pageTest(); break;
      case 'tprint': printTest(t.getAttribute('data-t') === '1'); break;
      case 'print': printSheet(); break;
      case 'read': pageRead(); break;
      case 'en': W.showEn = !W.showEn; pageRead(); break;
      case 'say': say(c.fr[+t.getAttribute('data-n')][+t.getAttribute('data-i')], 'fr'); break;
      case 'go': pageGo(); break;
      case 'frames': W.frames = null; pageGo(); break;
      case 'show': drillShow(); break;
      case 'mark': drillMark(t.getAttribute('data-r')); break;
      case 'replay': var o = W.dr.q[W.dr.i]; if (o && o.say) say(o.say, 'fr'); break;
      case 'dagain': drillAgain(); break;
      case 'sheet': try { openTopicsTranslationSheet(c.uid, c.choice); } catch (er) { alert('No translation sheet is available for this demo yet.'); } break;
      case 'link': copyLink(); break;
      case 'listen': var uid = c.uid, ch = c.choice; closeOv(); setTimeout(function () { try { playDemoAnswer(uid, ch); } catch (er) { } }, 80); break;
      case 'prep': var u2 = c.uid, c2 = c.choice; closeOv(); setTimeout(function () { try { startPrepTimer(u2, c2); } catch (er) { } }, 80); break;
      case 'rec': var u3 = c.uid, c3 = c.choice; closeOv(); setTimeout(function () { try { APAL.start(u3, c3); } catch (er) { } }, 80); break;
    }
  }

  // ---------- public ----------
  function open(uid, choice) {
    var c = ctxFor(uid, choice); if (!c) { alert('No demo found for this card.'); return; }
    hookKtr();
    W = { ctx: c, sel: {}, view: 'setup', showEn: false, frames: null };
    openOv(); showSetup();
    lockKeys(function (e) { if (e.key === 'Escape') { back(); return true; } return false; });
    var o = $('od-ov'); if (o) o.scrollTop = 0;
  }
  window.apDemoLearn = open;
  window.APOD = { open: open, state: function () { return W; }, set: SET };

  // old Translation sheet: refresh its English with the new English where the sentences line up
  function refreshOld() {
    try {
      var DL = demoLearn(); if (!DL || typeof TOPICS_DEMO_EN === 'undefined') return;
      ORAL_CARDS.forEach(function (card, i) {
        ['A', 'B'].forEach(function (k) {
          var L = DL[i + k], code = card['code' + k], old = code && TOPICS_DEMO_EN[code], demo = card['demo' + k];
          if (!L || !L.en || !old || !demo) return;
          [1, 2].forEach(function (n) {
            var rows = old['p' + n], nw = L.en['p' + n], fr = splitFr(demo['part' + n]);
            if (rows && nw && rows.length === nw.length && rows.length === fr.length) for (var j = 0; j < rows.length; j++) if (typeof nw[j] === 'string' && nw[j]) rows[j][0] = nw[j];
          });
        });
      });
    } catch (e) { }
  }
  refreshOld();

  // a link #learn=FR001 opens the card and this page
  function fromHash() {
    var m = /^#learn=([A-Za-z0-9]+)/.exec(location.hash || ''); if (!m || !window.ORAL_CARDS) return;
    var code = m[1].toUpperCase(), card = null, ch = '';
    for (var i = 0; i < ORAL_CARDS.length && !card; i++) {
      var x = ORAL_CARDS[i];
      if ((x.codeA || '').toUpperCase() === code) { card = x; ch = 'A'; } else if ((x.codeB || '').toUpperCase() === code) { card = x; ch = 'B'; }
      else if (code === (i + 'A') && x.demoA) { card = x; ch = 'A'; } else if (code === (i + 'B') && x.demoB) { card = x; ch = 'B'; }
    }
    if (!card) { alert('Sorry, this link does not match a demo.'); return; }
    try {
      showOralCards(); renderOralCardView([card], 'Topic ' + card.topic + ' · ' + card.year, false);
      var uid = 'card_' + card.topic + '_' + card.year; pickDeclaration(uid, ch); open(uid, ch);
    } catch (e) { }
  }
  if (document.readyState === 'complete') setTimeout(fromHash, 500); else window.addEventListener('load', function () { setTimeout(fromHash, 500); });
  window.addEventListener('hashchange', function () { if (/^#learn=/.test(location.hash)) fromHash(); });
})();
