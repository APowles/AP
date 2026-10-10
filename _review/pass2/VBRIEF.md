# Independent check of corrections to teaching-app content (Eton College, Head of French)

You did NOT make these changes. Another reviewer did. Your job: judge each change as a native-level examiner (French; also Spanish/Italian/English where they appear), and catch anything the change got wrong or made worse.

Input: JSONL, one record per changed item: ds (dataset), key (item id), changes[] = {path, before, after} for every field that changed, item_now_short_fields (context), reviewer_reasons (why the reviewer changed it).

For EVERY change decide:
- Is the AFTER text fully correct (grammar, spelling, accents, natural idiom, register) and does it still match its counterpart(s) (English ⇄ target language, same tense/person/number/placeholders X/Y/INF/PP/ADJ, bracketed notes)?
- Was the change justified (the BEFORE was genuinely wrong, or the AFTER is clearly better)? If the BEFORE was in fact correct and the change was unnecessary but harmless, leave it. If the change made things worse or wrong, revert or correct it.
- Did the change create an inconsistency in the item (e.g. French changed but English not updated; a highlighted snippet (demoHL) or structure (s) no longer appearing word for word in the text; a glossary chunk no longer in the model answer)?
- For answer keys (TR_PASSAGES alts/rejects, PAPERS answers/accept): is every added alternative genuinely creditworthy, every removed reject genuinely correct?
- Facts: is any changed fact now wrong?
House rules (keep): Spanish is Castilian, "sólo" keeps its accent; FR "d'un autre côté", "plus âgé"; IT "X non mi ha colpito", "ci metto mezz'ora a + INF"; the "celui/celle que je préfère … serait" structure is deliberate; Eton uniform trousers are pinstriped; placeholders X, Y, INF, PP, ADJ, SUBJ; bracketed teaching notes; "…" pauses.

## Output
JSON array at your output path, ONLY for changes that need further correction:
{"ds": "...", "key": <as given>, "field": "path", "op": "replace", "old": "<exact substring of the CURRENT (after) value, unambiguous within the item>", "new": "...", "reason": "short", "kind": "revert"|"wrong"|"worse"|"inconsistent"|"alt"|"fact"}
For a wrongly added TR_PASSAGES alternative use op "remove_alt", old = the exact alt string, field "chunks[N].alts". To restore a wrongly removed reject use op "add_alt"-style is NOT available — instead describe it with op "note".
Check with a script that every "old" occurs in the stated item's current value. Empty array if everything is right.
Final message: records checked, changes judged OK, number of corrections by kind, and the most important ones in plain English. Brief.
