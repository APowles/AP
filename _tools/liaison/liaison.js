/* AP LIAISON v1: obligatory liaison in inverted questions, said by every French voice.
   Voices drop the t of "fait-il", "dit-on", "sont-ils" and the z of "allez-y". This respells them for the voice only
   (fait-il -> fait-til, dit-on -> dit-ton, vont-elles -> vont-telles, allez-y -> allez-zy, parlez-en -> parlez-zen).
   Also keeps Match silent unless Voice is switched on (here because this script runs before the apps' own code).
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
  // English voices say "live" to rhyme with "give" before these nouns; the adjective rhymes with "five"
  function enFix(t) { return String(t).replace(/P[ée]tain/gi, 'Pay-tan').replace(/\b(I|we|they|you|he|she|have|has|had|I've|we've|they've|you've|I'd|we'd|they'd|you'd|he's|she's) read(?= (?:in|on|about|that|an|a|the|it|them|this|these|those|some|several|many|one)\b)/gi, '$1 red').replace(/\blive(?=[ -](?:broadcast|stream|tv\b|television|coverage|music|event|performance|show|concert|news|audience|debate|sport|football|match|report|feed|video|radio|interview|commentary|reporting|transmission))/gi, 'lyve'); }
  try {
    var P = window.SpeechSynthesis && window.SpeechSynthesis.prototype; if (!P || P.__apLia) return; P.__apLia = 1;
    var orig = P.speak;
    P.speak = function (u) {
      try { if (document.querySelector('.ms-ov .ms-grid') && localStorage.getItem('ap_match_tts') !== 'on') return; } catch (e) { }   // Match is silent unless the boy switches Voice on
      try { if (u && !u.__apLia && /^fr/i.test(u.lang || (u.voice && u.voice.lang) || '')) { u.__apLia = 1; var n = fix(u.text); if (n !== u.text) u.text = n; } else if (u && !u.__apEn && /^en/i.test(u.lang || (u.voice && u.voice.lang) || '')) { u.__apEn = 1; var e2 = enFix(u.text); if (e2 !== u.text) u.text = e2; } } catch (e) { }
      return orig.call(this, u);
    };
  } catch (e) { }
})();
