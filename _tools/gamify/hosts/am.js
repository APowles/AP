/* Gamify it host: Approved Material Practice Sentences (full model sentences, FR/IT/EN). */
window.APBZ_HOST = {
  phrases: function () {
    var out = []; getPool().forEach(function (c) { out.push({ en: c.en, fr: c.fr, it: c.it, sec: c.subsection }); });
    return out;
  },
  from: function () { return fromLang; }, to: function () { return toLang; },
  say: function (t, l) { speak(t, l); },
  names: { en: 'English', fr: 'French', it: 'Italian', es: 'Spanish' },
  titles: null
};
