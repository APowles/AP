/* Gamify it host: Structures & Oral and Writing Practice (short phrases, FR/IT/EN). */
window.APBZ_HOST = {
  phrases: function () {
    var out = [], bad = /\b[A-Z]{3,}\b/;
    stPool(currentSection || 'all').forEach(function (c) {
      var t = (c.en || '') + ' ' + (c.fr || '') + ' ' + (c.it || ''); if (bad.test(t)) return;   // placeholder cards (VERB, SOMEONE…) stay out
      out.push({ en: c.en, fr: c.fr, it: c.it, sec: c.section });
    });
    return out;
  },
  from: function () { return fromLang; }, to: function () { return toLang; },
  say: function (t, l) { speak(t, LANG_CODES[l]); },
  get names() { return LANG_NAMES; },
  get titles() { var m = {}; try { [].forEach.call(document.querySelectorAll('select option'), function (o) { if (o.value && !m[o.value]) m[o.value] = o.textContent.replace(/[?]$/, '').trim(); }); } catch (e) { } return m; }
};
