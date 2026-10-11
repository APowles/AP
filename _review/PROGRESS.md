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
