/* AP LIAISON v1: obligatory liaison in inverted questions, said by every French voice.
   Voices drop the t of "fait-il", "dit-on", "sont-ils" and the z of "allez-y". This respells them for the voice only
   (fait-il -> fait-til, dit-on -> dit-ton, vont-elles -> vont-telles, allez-y -> allez-zy, parlez-en -> parlez-zen).
   Wraps speechSynthesis.speak, so every app and pop-out page gets it; the text on screen never changes. */
(function () {
  if (window.__apLiaison) return; window.__apLiaison = 1;
  var L = 'A-Za-z\\u00C0-\\u00FF';
  var reT = new RegExp('(^|[^' + L + '\\-\'\\u2019])([' + L + ']*[' + L + '][td])-(ils?|elles?|on)(?![' + L + '])', 'g');
  var reZ = new RegExp('(^|[^' + L + '\\-\'\\u2019])([' + L + ']*[' + L + '][sz])-(y|en)(?![' + L + '\\-])', 'g');
  function fix(t) {
    t = String(t);
    t = t.replace(reT, function (m, pre, v, p) { return pre + v + '-' + (/^ils?$/i.test(p) ? 't' + p.replace(/s$/i, '') : /^elles?$/i.test(p) ? 't' + p : 't' + p); });
    t = t.replace(reZ, function (m, pre, v, p) { return pre + v + '-z' + p; });
    return t;
  }
  window.apLiaisonFix = fix;
  try {
    var P = window.SpeechSynthesis && window.SpeechSynthesis.prototype; if (!P || P.__apLia) return; P.__apLia = 1;
    var orig = P.speak;
    P.speak = function (u) {
      try { if (u && !u.__apLia && /^fr/i.test(u.lang || '')) { u.__apLia = 1; var n = fix(u.text); if (n !== u.text) u.text = n; } } catch (e) { }
      return orig.call(this, u);
    };
  } catch (e) { }
})();
