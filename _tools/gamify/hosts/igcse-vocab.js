/* Gamify it host: IGCSE Vocab and Gr EWs. Vocab selection: the chosen words. Grammar selection: the chosen chapters' translation sentences. */
window.APBZ_HOST = {
  phrases: function () {
    var ms = window.__apMS;
    if (ms && ms.isGr()) {
      var g = ms.G, f = g.foreign();
      return g.pairPool().map(function (it) { var o = { en: g.eText(it), sec: (it.point || g.label() || 'Grammar') }; o[f] = g.fText(it); return o; }).filter(function (o) { return o.en && o[f]; });
    }
    return getSelectedPhrases();
  },
  from: function () { var ms = window.__apMS; return ms && ms.isGr() ? 'en' : getLangFrom(); },
  to: function () { var ms = window.__apMS; return ms && ms.isGr() ? ms.G.foreign() : getLangTo(); },
  say: function (t, l) { speak(t, LANG_CODES[l]); },
  get names() { return LANG_NAMES; },
  get titles() { var ms = window.__apMS; return ms && ms.isGr() ? null : (typeof SECTION_TITLES !== 'undefined' ? SECTION_TITLES : null); },
  pics: true, games: null
};
