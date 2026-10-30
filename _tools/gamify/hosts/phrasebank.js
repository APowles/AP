/* Gamify it host: A Level Oral Phrase Bank. The games take the category (or personalised set) the boy has chosen. */
(function () {
  var titles = null;
  function T() { if (!titles) { titles = {}; try { ALL_PHRASES.forEach(function (p) { if (p.cat && !titles[p.cat]) titles[p.cat] = p.label || p.cat; }); } catch (e) { } } return titles; }
  window.APBZ_HOST = {
    phrases: function () { var out = []; try { (pbPool(_catVal) || []).forEach(function (p) { out.push({ en: p.en, fr: p.fr, sec: p.cat || 'x' }); }); } catch (e) { } return out; },
    from: function () { return getLangFrom(); }, to: function () { return getLangTo(); },
    say: function (t, l) { speak(t, LANG_CODES[l]); },
    get names() { return LANG_NAMES; },
    get titles() { return T(); },
    pics: false
  };
})();
