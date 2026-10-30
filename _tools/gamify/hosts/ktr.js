/* Gamify it host: A Level Oral Topics: each KTR gives its definition, example and analysis sentences (FR/EN). */
window.APBZ_HOST = {
  phrases: function () {
    var out = [];
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
