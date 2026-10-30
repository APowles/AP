/* Gamify it host: Eton French Verbs. Feeds the games with the conjugation forms the app's own Spell it / Match it use. */
window.APBZ_HOST = {
  phrases: function () {
    var a = window.alert; window.alert = function () { }; var out = [], seen = {};
    try {
      (window.apPickItems ? apPickItems() || [] : []).forEach(function (c) {
        var f = c.fr || c.fr || c.es || c.it || c.fr, e = c.en; if (!f || !e) return;
        var k = e + '|' + f; if (seen[k]) return; seen[k] = 1;
        out.push({ sec: c.lab || 'verbs', en: e, fr: f });
      });
    } catch (e) { } finally { window.alert = a; }
    return out;
  },
  from: function () { return 'en'; }, to: function () { return 'fr'; },
  say: function (t) { try { speakIt(t); } catch (e) { } },
  names: { en: 'English', fr: 'French' }, titles: null, pics: false
};
