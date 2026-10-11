# Content review — state at Sun 11 Oct 2026, ~10:00

All 196 sections are now reviewed twice and applied. Verb apps (French, Italian, Spanish) were excluded by decision.

- First pass: applied (branch overnight-review-2026-10-10, 1,784 fixes, merged to main).
- Second pass: 164 sections applied (apply-pass2, 1,689 fixes + 9 from the independent check), on main.
- Third pass (this run): the last 32 sections (IGCSE FR oral cards 6, translation sheets 11, Vocab Essentials 9, VV vocab pairs 6), each reviewed by BOTH Opus and Sonnet plus scripted checks. 125 fixes applied on main (branch apply-pass3, commit 542d4cd), independent Sonnet language check passed (1 correction included), apps reloaded in a browser with 0 page errors, only intended items changed, build stamps and versions.json updated for the 3 changed apps.

Files: _review/pass2/out_calib (reviewer outputs), out_script (scripted flags), pass3/merged.json (all 192 distinct proposals), decisions.json (accept / ask / dupe / drop), fixes_pass3.json + fixes_pass3b.json (what was applied), check_in/out (independent check).

Held-back questions: ALL DECIDED by AP on Sun 11 Oct 2026.
- A "After finishing our meal" -> "After finishing eating" (Structures TM_FR): APPLIED.
- B #BalanceTonPorc "launched after #MeToo": LEFT as it is.
- C VE 2607 "got stuck in heavy traffic": FR/IT changed to passé composé / passato prossimo to match the English: APPLIED.
- D VE 3018 Spanish "prometieron" -> "han prometido": APPLIED.
- E "loi" lower-case in law names (15 VV leaves): APPLIED.
- F "non seulement ... mais aussi il est beau": LEFT as it is.
- G Libération "founded after WWII": LEFT as it is.
- H SMIC EUR1,426.40 (Feb 2025): LEFT (about ten cents off 1,426.30).
- I "d'abord," added to the French "at first" example in ALL 7 VV copies (VV1_Entire, VV1b, Michaelmas_Trials, VV7_Entire, VV7a, VV12_Entire, VV12b): APPLIED.
- Pinstriped trousers in every language, all apps: FR "pantalon à fines rayures", IT "pantaloni a righe sottili", ES "pantalones de rayas finas", EN "pinstriped trousers" (the "de rayas (striped)" pattern list in Vocab and Gr EWs deliberately unchanged): APPLIED. Closes the old pantalon noir/gris question.
Main at 9d2afb2; all 14 build stamps in versions.json match their files; every page loads with no errors.
Lesson: read versions.json before writing it (a truncating write once left it empty on main for ~3 minutes, 10:19-10:22). Another chat also pushes to main: fetch before pushing.

## 2026-10-11 — Verb apps (French, Italian, Spanish Verbs) — DONE
- Sentences: ~820 corrected (grammar, tense/mood, agreement, Castilian usage, "que il"/"à le" contractions); 557 Italian subjunctive gap-fills given a meaning-matched trigger clause; 39 held structure-group sentences decided (28 corrected, 3 left by AP: fr2668 "À ta place,", fr4011/4012 "se fier à X de faire Y").
- Tables (VERBS ~20k rows) reviewed: haïr (je hais/haïrai), vivre subj typo, ~240 wrong notes/glosses (ES conditional notes, introducir, escuchar, esserci, morire, envoyer, s'ensuivre, se garder).
- French app code fixes: compound-tense generator (multi-word participle e.g. "rendre visite à", "mort" plural agreement, impersonal "il y avait eu"/"il avait fallu"/"il avait plu"); no space after apostrophe in sentence display (87 sentences).
- Structure labels: soupçonner que (+ INDIC) + 3 sentences in indicative; attendre que (+ SUBJ); label typos (faire Y, dans une serrure, me joindre, deux heures). IT future-perfect rows of 4 "faccia (facesse)" structures -> faccia.
- Standing instruction from AP: decide easy, clear-cut fixes myself; ask only about genuine judgement calls / set structures.
- Left alone: "laissé(e) convaincre" (both agreements accepted); 216 French sentence infs not matching table row names (no code links them; cosmetic); version-stamp mismatch in Oral Topics + Structures files edited by the other chat (harmless).
- Tools: _review/verbs/{dump.js,vapply.py,tapply.py,checkA.py,hold_apply.sh}.
