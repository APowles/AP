# Second independent check of teaching-app content (Eton College, Head of French)

This content has ALREADY been reviewed and corrected once. You are the fresh second pair of eyes: look hard for whatever was missed, especially in ANSWERS (anything a boy is marked against or learns as the right answer). You are a native-level examiner in French, and in Spanish/Italian/English where they appear. Genuine problems only: do not restyle, do not "improve" correct content, do not undo deliberate house choices.

Input: JSONL, one item per line with "ds" (dataset) and "key" (item id — may be a number, a string, or a LIST path such as ["gr3","items",4]; copy it exactly) plus the content. Some items embed a sub-object with its own ds/key (EN_DEMO_* has ds TOPICS_DEMO_EN, key = code): fixes to it use THAT ds/key.

## What counts as a problem
1. Target language wrong: grammar, agreement, spelling, accents, gender, prepositions, non-native phrasing, wrong register. Spanish is Castilian (Peninsular), keep "sólo" with its accent (Spanish only — never accent Italian "solo").
2. Pairs that must match (en/fr/es/it columns, sentence + translation, prompt + model answer): same meaning, tense, person, number, placeholders (X, Y, INF, PP, ADJ, SUBJ, VERB…) and bracketed notes.
3. Facts plainly false.
4. ANSWERS / mark schemes: the model answer is correct; every correct answer a strong pupil would realistically give is accepted (add missing alternatives); nothing correct is rejected; nothing wrong is accepted.
5. Broken text: truncation, typos, doubled words, stray HTML/markup, wrong placeholders.
House rules to KEEP: FR "d'un autre côté", "plus âgé", the structure "celui/celle que je préfère … serait …", "Je n'ai pas été impressionné par…", "j'envisagerais certainement de…", "Quand je quitterai l'école"; IT "X non mi ha colpito", "ci metto mezz'ora a + INF"; Eton uniform: black tailcoat, PINSTRIPED trousers; the 40% radio quota came from the 1994 radio-quota law (loi Carignon), not the loi Toubon; bracketed teaching notes; "…" pauses; asterisks around English explanations in VV info cards; AP Oral Cycle tags.

## Dataset notes
- GRAMMAR TESTS (GR_SETS sentences, GR_EWS_DATA, GCSE_GR_DATA / GCSE_IT_DATA / GCSE_ES_DATA items): AP's standing rule — grammar tests test GRAMMAR only: any niche vocabulary a good boy might not know must be given in the prompt (nouns with gender, verbs as infinitives, never giving away the structure tested), and every correct alternative answer must be accepted. Follow the existing conventions in the data you see: A Level GR_SETS alternatives at the START of "note" as "or <full sentence>; rest" and hints in the English as " (word = le mot, m)"; IGCSE GCSE_* alternatives in the note as "also: <i>ALT</i> · <i>ALT2</i> — rest" and hints as " (word = <i>le mot</i> (m))". <mark> in GR_SETS fr must sit on the structure tested. Chapter/set "recap"/"rules" items are teaching explanations: check correctness only.
- VOCAB LISTS (VV_DATA pairs, SD_DATA sentence pairs, IGV_PHRASES, VE_*, GEP_*, GEPV_PHRASES (Spanish vocab with English), FSV_PHRASES, CARDS, ALL_PHRASES_PB, MLF_DATA): errors only, no new alternatives, no hints.
- P1 (Edexcel A Level French Paper 1 practice, key ["q", id]): types l1/q5 MCQ (items[].answer letter, why{}), l2/l3/q7/q8/q9 open answers (answer, accept[], reject[], gist, tip), l4 (partA items + partB summary bullets with answer/accept/reject), q6 (statements A–I; exactly four true), q10 translation into English (sections[] fr/answer/accept/reject/tip; model). Mark schemes are deliberately STRICT ("better they learn now"): two elements on one line score 1; lifts only if targeted. No vocabulary glosses (comprehension). Check keys, answers, accept/reject fairness, French texts, English in Q10.
- TR_PASSAGES (translation practice): chunks[] en (source) / main (model) / alts / rejects / notes.
- ORAL_CARDS + EN_DEMO (A Level oral model answers + English), IGCSE_CARDS* (IGCSE oral cards: questions, demo answers, demoEn, demoHL highlight snippets that must appear word for word in the demo), TM_* (IGCSE translation sheets: en ⇄ target sentence; "s" structure must appear in the sentence), AM_DATA (Approved Material model answers), AM_PRACTICE (Practice Sentences boys test themselves on: phrases_en/fr/it/es aligned lists, subsections), PAPERS (AI IGCSE listening papers: transcripts, questions, keys), ALL_TOPICS (A Level KTRs), APT_DEMO / DEMO_ITEMS (demo test).

## Output
JSON array at your output path. Each element:
{"ds": "...", "key": <exactly as given>, "field": "where", "op": "replace", "old": "<exact substring of the current value, unambiguous within the item>", "new": "...", "reason": "short", "kind": "french"|"spanish"|"italian"|"english"|"match"|"fact"|"answer"|"alt"|"reject"|"hint"|"typo"|"other"}
Other ops:
- add an item to a list (accept[], reject[], alts…): {"op":"list_add","path":[...path from the item to the list...],"new":"..."} e.g. P1 path ["items",2,"accept"], TR path ["chunks",5,"alts"].
- remove an item from a list: {"op":"list_remove","path":[...],"old":"<exact element>"}.
A "replace" is applied to every string inside the item that contains "old" (set "all": true only if the same error must be fixed in every item of the dataset). Check with a script that every "old" occurs in the item and every path exists. Do not edit any other file. Keep scratch files in your own subfolder r3/work2_<chunk>/.
Final message: items checked, counts per kind, the most important findings in plain English. Brief.
