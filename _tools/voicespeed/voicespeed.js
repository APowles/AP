/* AP VOICE SPEED: a 🔊 button in the navy drill banner slows every spoken voice (100%, 85%, 70%, 55%). Remembered on this device. */
(function () {
  if (window.__apVoiceSpeed) return; window.__apVoiceSpeed = 1;
  var LV = [1, 0.85, 0.7, 0.55], F = 1;
  try { var v = +localStorage.getItem('ap_voice_f'); if (v >= 0.4 && v <= 1) F = v; } catch (e) { }
  try {   // every utterance's rate is scaled when it is set (and when it is made), so no page code has to know about this
    var UP = window.SpeechSynthesisUtterance.prototype, d = Object.getOwnPropertyDescriptor(UP, 'rate');
    if (d && d.set && d.get) {
      Object.defineProperty(UP, 'rate', { configurable: true, enumerable: true, get: d.get, set: function (v) { d.set.call(this, Math.max(0.1, Math.min(10, (+v || 1) * F))); } });
      var Orig = window.SpeechSynthesisUtterance;
      window.SpeechSynthesisUtterance = function (t) { var u = t === undefined ? new Orig() : new Orig(t); u.rate = 1; return u; };
      window.SpeechSynthesisUtterance.prototype = UP;
    }
  } catch (e) { }
  function lab() { return '🔊 ' + Math.round(F * 100) + '%'; }
  function step() {
    F = LV[(Math.max(0, LV.indexOf(F)) + 1) % LV.length];
    try { localStorage.setItem('ap_voice_f', F); } catch (e) { }
    [].forEach.call(document.querySelectorAll('.ap-vspeed'), function (b) { b.textContent = lab(); });
  }
  function add() {
    [].forEach.call(document.querySelectorAll('.aph-dbar'), function (bar) {
      if (bar.querySelector('.ap-vspeed')) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'aph-dbar-btn ap-vspeed'; b.textContent = lab();
      b.title = 'Speed of the voice: tap to slow it down (100%, 85%, 70%, 55%)'; b.onclick = step;
      var t = bar.querySelector('.aph-dbar-title'); if (t && t.nextSibling) bar.insertBefore(b, t.nextSibling); else bar.appendChild(b);
    });
  }
  var q = 0; function sched() { if (q) return; q = setTimeout(function () { q = 0; add(); }, 60); }
  function go() { add(); try { new MutationObserver(sched).observe(document.body, { childList: true, subtree: true }); } catch (e) { } }
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})();
