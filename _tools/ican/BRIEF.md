# Brief: "Je peux · I can" checklist for A Level French KTRs (Eton College)

You are writing a self-assessment checklist for one KTR (Key Topic Reference) at a time. Readers are very able Eton A Level French pupils (nearly all will get a 9 at GCSE). The checklist is the last stage of the KTR Studio. The boy sees a plain-English prompt, says his answer aloud in French, presses Check, sees the model French sentence plus an English gloss, then marks himself ✓ / ~ / ✗.

Scratchpad: /tmp/claude-0/-home-claude/5d1c4334-7c31-5c63-bb77-7f8672935c5f/scratchpad/
- Your input for KTR N: `in/ktrN.json`  (read it fully)
- Finished examples (study all three, input then output): `ref/ktr1_*.json`, `ref/ktr4_*.json`, `ref/ktr7_*.json`
- Your output for KTR N: `out/ktrN.json`
- Self-check: `python3 /tmp/claude-0/-home-claude/5d1c4334-7c31-5c63-bb77-7f8672935c5f/scratchpad/validate.py N [N2 N3]`  (run it; fix every problem it reports)

## Output format (JSON, UTF-8, no ASCII escaping of accents)
```
{"n": N,
 "icanSub": {"fr": "...", "en": "..."},      // OPTIONAL: only when the KTR title contains an abbreviation or two terms the boy needs explained (e.g. "PMA and GPA"), else omit
 "ican": [ {"tier": "Essential|Important|Bonus", "prompt": "...", "fr": "...", "en": "..."}, ... 15 items ... ],
 "tense": [ {"old": "...", "new": "..."}, ... ],   // see section 8
 "flags": ["..."]                                  // see section 9
}
```

## The rules (all agreed with the teacher; follow them exactly)

1. **Exactly 15 points**, tiers about 6 Essential / 5 Important / 4 Bonus (flexible by one). Essential = what every boy must be able to say about the KTR; Important = key supporting facts; Bonus = extra detail and the finer figures.

2. **Logical order** (the list opens in this order; the boy may shuffle it later): 1 definition, 2 example, 3 why it matters (analysis), then background (the "Avant" section), then who/what happened, dates, figures, and finally both sides of the debate (supporters, then critics/opponents). Points 1, 2 and 3 MUST use the KTR's `short_definition`, `short_example` and `short_analysis` French **word for word** as the `fr` (the validator checks this). Their prompts: point 1 "Say what X is/means." (or the natural form), point 2 asks for the short example (look at how ref KTRs 1, 4, 7 do it), point 3 "Explain why X matters when discussing <the theme>." or the equivalent.

3. **Coverage**: every fact in `facts` and every `overview_sections` item must be covered by exactly one point (a point may combine two closely linked facts if the answer is still one sentence). The `hook` question is answered by the both-sides points, so do not make a separate hook point. `remember` (dates, figures) must also be covered where it is not already in a fact. Do NOT use outside knowledge: every fact in your French and English must be in the input. If the input is wrong, unclear or contradictory, do not guess: write what the input says and add a note to `flags`.

4. **Prompts**: plain English, one cue verb first, then a clear question with exactly ONE possible answer. The prompt must name its subject (a boy meets the points in shuffled order, so each prompt must stand alone) and must not give the answer away or contain another point's answer. Cue verbs and when to use them:
   - **Give** for a figure, percentage, count, date, rank ("Give the share of ... in 2020.")
   - **Name** for a thing, term, person, institution or list ("Name the three conditions ...")
   - **Define** is not needed; use "Say what X is/means."
   - **Explain** for why something matters, what something shows, what caused something (the answer contains the reasoning)
   - **Describe** for an event or a change over time
   - **Compare** for before/after or two things set against each other
   - **Outline** for what supporters, critics or opponents argue
   - **Say** for what is left (what something is or shows, a rule, a simple fact)
   Aim for variety; use Explain and Compare wherever the French answer genuinely contains a reason or a comparison, but NEVER label a plain fact "Explain": the verb must describe what the answer really is. Prompts are never about language ("translate", "use the subjunctive", "which tense") and never ask the boy to give an opinion. Use "Give" with the thing wanted: "Give the percentage ...". Keep prompts short and natural; at most about 30 words.

4b. **Exact-match test (compulsory, do it for every point before you write it down)**: (a) list every element the prompt demands ("who he is AND his role AND the years" = 3 elements; "what X is" = the category X belongs to plus its key identifying fact; "give the date AND say where" = 2; "compare A with B" = both sides and the comparison; "explain why" = an actual reason; "outline what critics argue" = their actual argument; "name the three..." = all three); (b) check that the French supplies EVERY element and answers THIS prompt, not a neighbouring one, and is not merely relevant or contextual (e.g. "Say what the armistice was" must say what an armistice IS, not when it was signed); (c) check the French stands alone when the points are shuffled: no "Il/Elle/Ils/Ces/Cette/Celui" and no "le parti / la loi" without its noun in the sentence; (d) check each English cue verb honestly matches (Give = figure/date, Name = things, Explain = reason, Describe = event/change, Compare = a real comparison, Outline = what supporters or critics argue, Say = simple fact or definition); (e) if the French fails any of these, rewrite the French (or the prompt if the prompt is the faulty one) before moving on. A point that is only relevant is a failed point.

5. **French (`fr`)**: the shortest complete spoken sentence that answers the prompt fully, in correct, natural French that a very able boy could say aloud in the oral. It must keep the key information (who/what/when/how many); never trim until a fact is lost. Reuse the wording of the input facts wherever you can. **Tenses**: dated one-off past events in the passé composé (never the historic present: write "La loi a été promulguée le 17 mai 2013", not "La loi est promulguée"); background in the imparfait; things still true in the present. Write relative clauses instead of written participles ("qui permet de", not "permettant"). Numbers as in the input ("25 %" with a space before %; "1,4 million"). There must NEVER be an error in the French (accents, agreement, elision, gender, spelling of names): check each sentence twice.

6. **Gloss (`en`)**: always present, at least one full sentence, never blank, and it must NEVER merely translate the French. It must do one of these: explain a term or a name the boy may not know; show what a statistic proves; give the trend or significance; or add a detail derived from the KTR data. Plain English, no jargon, no "the French says". NEVER refer to another point ("see point 5", "above", "below", "as in the previous"): points are shuffled. Do not repeat the prompt. Do not put facts in the gloss that are not in the input. No slashes between pronouns ("he/she"): write "he (she)". Written as support for the boy who got it wrong, so it should teach.

7. **Same question never twice**: no two points may ask for the same fact, and a fact must not be the answer of two points.

8. **Tenses in the KTR itself (`tense`)**: the KTR source text uses the historic present for dated one-off past events in places ("Le projet de loi est présenté ... le 7 novembre 2012", "crée le PACS", "épouse"). The teacher wants these converted to the passé composé (or imparfait for background) in the Overview sections (Avant, Ce qui s'est passé, Après ...), facts and remember/dates. List each as {"old","new"} pairs of EXACT substrings copied character for character from the input (French pairs and, separately, the matching English pairs: "is presented" -> "was presented", "creates" -> "created"). Keep each substring short but unique enough (the verb phrase plus a few words). Convert ONLY historic-present narration of dated past events. Do NOT convert: present statements still true ("reste interdite", "les épreuves finales comptent pour 60 %"), figures stated for a year in the present perfect sense, or text in timelines. If the highlighted chunk (not in your input) is the verb phrase, the same pair will be applied to it automatically as long as your `old` is a substring of it. If nothing needs converting, give an empty list.

9. **`flags`**: short notes for the teacher about anything in the KTR source that looks wrong, ambiguous, internally inconsistent, a likely error in the French, or a wording that should be improved at source (give the exact quote). Also note if `short_definition`/`short_example`/`short_analysis` looks trimmed so far that it lost key information. Empty list if none.

## Quality bar
- Re-read all 15 prompts together: could a boy answer each in one sentence without seeing the others? Is each answer unambiguous?
- Re-read all 15 French sentences: any error at all is unacceptable.
- Re-read all 15 glosses: each must teach something beyond the French.
- Run the validator, fix everything, and run it again until it says ok.
- Reply with ONE short line per KTR (n, the number of flags, "ok"). Do not paste the data in your reply.
