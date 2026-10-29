# Review brief: "Je peux · I can" checklists (independent check)

You are the independent reviewer. Another agent drafted a checklist for each KTR you are given. First read `BRIEF.md` in this folder in full (the rules the drafter had to follow), then for each assigned KTR N read:
- `in/ktrN.json` (the KTR's source data: the only permitted source of facts)
- `out/ktrN.json` (the draft: 15 points, a `tense` list, `flags`)
Scratchpad: /tmp/claude-0/-home-claude/5d1c4334-7c31-5c63-bb77-7f8672935c5f/scratchpad/

Your job is to find and FIX problems. Be a hard marker: the readers are very able Eton boys and the teacher will not tolerate errors.

## Check every point for
1. **French errors (zero tolerance)**: spelling, accents, agreement (gender, number, past participles with être/avoir and preceding direct objects), elision, prepositions, proper names, number formats ("25 %", "1,4 million"). Dated one-off past events must be in the passé composé (imparfait for background); present only for things still true. No participles where a relative clause is natural ("permettant" -> "qui permet de").
2. **Fidelity**: every fact, number, name and date in `fr` and `en` must be in `in/ktrN.json`. Flag/fix anything invented or altered (an abbreviation expansion in `icanSub` is the only permitted outside fact, and only if you are certain it is correct).
3. **Prompt**: cue verb first (Say, Give, Name, Explain, Describe, Compare, Outline); exactly ONE possible answer; names its subject so it stands alone when shuffled; does not leak its answer or another point's answer; not about language; not an opinion question; the verb honestly matches the answer (no "Explain" for a bare figure; "Give" for figures/dates; "Name" for things/lists; "Compare" only if the French really compares; "Outline" for what supporters/critics argue). Prompt wording must be natural English.
4. **French answer**: shortest complete spoken sentence that fully answers the prompt and keeps the key information; reuses the source wording; would a very able boy say exactly this in the oral?
4b. **Exact match (hard marker)**: list every element the prompt demands; the French must supply ALL of them and answer THIS prompt, not merely something relevant ("Say what the armistice was" answered with only the signing date FAILS). The French must stand alone when shuffled (no antecedent-less Il/Elle/Ces/Cette/Celui, no bare "le parti"). A point is OK only if a boy who says exactly the model French has fully answered the exact prompt. Fix the French first; change the prompt only when the prompt itself is faulty.
5. **Gloss**: never blank; must not merely translate the French; must explain a term, show what a statistic proves, give trend/significance, or add a KTR-derived detail; teaches something; no cross-references ("see point", "above", "below"); no he/she slashes; accurate; not repeating the prompt.
6. **Coverage and duplicates**: every item in `facts` and `overview_sections` (and `remember` figures/dates) is covered by exactly one point; the hook question is answered by the both-sides points; no two points ask the same thing.
7. **Order and tiers**: logical order (definition, example, importance, background, who/what, dates, figures, both sides); about 6 Essential / 5 Important / 4 Bonus with the key points Essential.
8. **`tense` pairs**: each `old` must be an exact substring of the input (French pairs and the matching English pairs); `new` must be correct French/English; only dated one-off past events are converted (not states still true, not timelines); no conversion that makes the sentence wrong (check agreement: "la loi est promulguée" -> "la loi a été promulguée"; "se marie" -> "s'est marié"); English must be consistent with the French. Add any missing pairs for historic-present narration of dated past events you find in the input (facts, overview sections, remember dates), and fix wrong ones.
9. **`flags`**: keep them, add any source problem you find (exact quote). Do not silently "fix" the source.

## How to work
- Fix problems DIRECTLY in `out/ktrN.json` (keep it valid JSON, keep exactly 15 points, keep UTF-8 accents unescaped). Points 1, 2 and 3 `fr` must stay equal to `short_definition.fr`, `short_example.fr`, `short_analysis.fr` word for word (if one of those source sentences itself is wrong or trimmed, leave it and add a flag instead).
- After editing, run `python3 validate.py N` until it passes.
- Write a log to `rev/ktrN.json`: {"n": N, "changes": [{"point": 1-15 or "tense" or "flag", "field": "...", "before": "...", "after": "...", "reason": "..."}], "open": ["judgement calls you did NOT apply, with your recommendation"]}.
- Reply with one short line per KTR: number of changes, number of open items, and the single most serious problem you found (if any). Do not paste data.
