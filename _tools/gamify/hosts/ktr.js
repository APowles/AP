/* Gamify it host: A Level Oral Topics: each KTR gives its definition, example and analysis sentences (FR/EN). */
window.APBZ_HOST = {
  phrases: function () {
    var out = [];
    try {   // Oral Cycle Practice set-up on screen: use the phrases of the section(s) the boy chose
      var ocs = window.__ocSelGet && document.querySelector('#app .intro-card[data-ms]') ? window.__ocSelGet() : null;
      if (ocs) { Object.keys(ORAL_CYCLE_EXPRS).forEach(function (k) { if (ocs !== 'ALL' && ocs !== k) return; ORAL_CYCLE_EXPRS[k].phrases.forEach(function (p) { if (p.fr && p.en) out.push({ fr: p.fr, en: p.en, sec: k }); }); }); if (out.length) return out; }
    } catch (e) { }
    if (window.__apKtrItems && window.__apKtrItems.length && !document.body.classList.contains('od-on')) return window.__apKtrItems.slice();   // opened from the KTR Studio panel: that KTR's own sentences
    getFiltered().forEach(function (t) {
      [['def_fr', 'def_en'], ['ex_fr', 'ex_en'], ['an_fr', 'an_en']].forEach(function (k) { if (t[k[0]] && t[k[1]]) out.push({ fr: t[k[0]], en: t[k[1]], sec: t.theme }); });
      (t.tp_list || []).forEach(function (x) { if (x.fr && x.en) out.push({ fr: x.fr, en: x.en, sec: t.theme }); });
    });
    return out;
  },
  from: function () { return getLangFrom(); }, to: function () { return getLangTo(); },
  say: function (t, l) { speak(t, l === 'fr' ? 'fr-FR' : 'en-GB'); },
  names: { en: 'English', fr: 'French' },
  titles: null
};
