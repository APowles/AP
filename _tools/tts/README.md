# Placeholder speech (TTS)

`placeholders.json` is the single source of truth for how the French / Italian / Spanish voices say grammar placeholders (INF, ADJ, NOUN, NOUNS, X, Y, TIME, SUBJ, INDIC, IMP) and "+" ("pluss" in French).
Verb placeholders (VERBE, VERBO...) stay as target-language words.

**Before any push, and whenever an app gets new or changed speech code:**

    python3 -I _tools/tts/check.py

It fails if a speaking app has no placeholder table, or if any table disagrees with `placeholders.json`.
To change a spelling, edit `placeholders.json`, then update the tables the checker names (the apps keep their own copy because each is a single file).
Apps that legitimately do not need the table are listed in `SKIP` in `check.py`, each with a reason.
Not yet approved (guesses): Spanish TIME ("taim"), Italian INDIC/IMP; Z is still read as a letter.
