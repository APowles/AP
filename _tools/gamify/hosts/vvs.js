/* Gamify it host: A Level VVs, Gr EWs & Translation. The games take whatever the boy has chosen on the page he is on. */
(function () {
  var PAIRS = ['clock', 'streak', 'odd', 'letter', 'gender', 'roll', 'catch', 'lane', 'pairs', 'deal'], SENT = ['clock', 'streak', 'odd', 'letter', 'roll', 'catch', 'lane', 'pairs', 'deal'];
  var BOX = [['drillContainer', 'vv'], ['sdContainer', 'sd'], ['grEwsContainer', 'e'], ['grammarContainer', 'd'], ['mlfContainer', 'm']];
  function ctx() { for (var i = 0; i < BOX.length; i++) { var e = document.getElementById(BOX[i][0]); if (e && e.getClientRects().length) return BOX[i][1]; } return 'vv'; }
  var idx = null;
  function setOf(en) {
    if (!idx) { idx = {}; ['TV', 'VS', 'TVE'].forEach(function (pre) { Object.keys(VV_DATA).forEach(function (k) { if (new RegExp('^' + pre + '\\d+[abc]$').test(k)) VV_DATA[k].forEach(function (p) { if (!(p[0] in idx)) idx[p[0]] = k; }); }); }); }
    return idx[en] || 'x';
  }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'); }
  function models() { return window.__apPsModels || {}; }
  function sentences(m, secOf) {
    var M = models()[m], out = []; if (!M) return out;
    try { M.pairPool().forEach(function (x) { out.push({ en: M.eText(x), fr: M.fText(x), sec: secOf(x) }); }); } catch (e) { }
    return out;
  }
  function chapOf(it) { var m = /^GR(\d+)_/i.exec(it.id || ''); return m ? 'gr' + m[1] : 'gr'; }
  window.APBZ_HOST = {
    phrases: function () {
      var c = ctx(), out = [];
      if (c === 'vv') { try { if (typeof syncSel === 'function') syncSel(); } catch (e) { } (getPool() || []).forEach(function (p) { out.push({ en: p.en, fr: p.fr, sec: setOf(p.en) }); }); return out; }
      if (c === 'sd') { var cs = (sdState && sdState.currentSet) || 'sd'; getSdPool().forEach(function (p) { out.push({ fr: p[0], en: p[1], sec: cs }); }); return out; }
      if (c === 'e') return sentences('e', chapOf);
      if (c === 'd') return sentences('d', function (s) { return models().d.setOf(s) || 'gd'; });
      return sentences('m', function () { return 'mlf'; });
    },
    from: function () { return (ctx() === 'vv' && typeof fromLang === 'string') ? fromLang : 'en'; }, to: function () { return (ctx() === 'vv' && typeof toLang === 'string') ? toLang : 'fr'; },
    say: function (t, l) { speak(plain(t).replace(/[*_]/g, ''), 'fr'); },
    names: { en: 'English', fr: 'French' },
    titles: (typeof Proxy === 'function') ? new Proxy({}, { get: function (t, k) {
      var m = /^(TVE|TV|VS)(\d+)([abc])$/.exec(k); if (m) return (m[1] === 'VS' ? 'Verb structures ' : m[1] === 'TV' ? 'Topic vocab ' : 'Topic vocab + essentials ') + m[2] + m[3];
      m = /^gr(\d+)$/.exec(k); if (m) return 'Gr ' + m[1]; return typeof k === 'string' ? k : ''; } }) : null,
    pics: false
  };
  Object.defineProperty(window.APBZ_HOST, 'games', { get: function () { var c = ctx(); return c === 'vv' ? PAIRS : SENT; }, set: function () { }, enumerable: true });
  try { Object.defineProperty(window.APBZ_HOSTCFG, 'games', { get: function () { return window.APBZ_HOST.games; }, set: function () { }, configurable: true }); } catch (e) { }
  /* the games are not offered on the Metalanguage page or on Translation Practice */
  var st = document.createElement('style'); st.textContent = '#mlfContainer .ms-blitz,#translationContainer .ms-blitz{display:none!important}'; document.head.appendChild(st);
})();
