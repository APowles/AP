# Full content review — paused Fri 9 Oct 2026, 19:30 (resume Sun 11 Oct, 09:30)

Nothing has been applied to the apps yet. This branch holds only the reviewers' proposed fixes (_review/out/*.json, format in BRIEF.md).

## Done (reviewer outputs in _review/out)
am_1 am_2 am_3 iges_1 iges_2 iges_3 iges_4 iges_5 iges_6 iges_7 iges_8 igfr_1 igfr_10 igfr_11 igfr_12 igfr_13 igfr_14 igfr_15 igfr_16 igfr_17 igfr_18 igfr_2 igfr_3 igfr_4 igfr_5 igfr_6 igfr_7 igfr_8 igfr_9 igit_1 igit_2 igit_3 igit_4 igit_5 igit_6 igs_cards_1 igs_cards_2 igs_cards_3 igs_cards_4 ktr lis_1 lis_2 lis_3 mlf oral_1 oral_2 oral_3 oral_4 oral_5 oral_6 oral_7 oral_8 phrasebank sent_es_1 sent_fr_1 sent_fr_2 sent_fr_3 sent_fr_4 sent_fr_5 sent_fr_6 sent_it_1 sent_it_2 sent_it_3 sent_it_4 sent_it_5 sent_it_6 sent_it_7 specfr_1 tm_es_1 tm_es_2 tm_fr_1 tm_fr_2 tm_fr_3 tm_fr_4 tm_fr_5 tm_it_1 tm_it_2 tr_1 tr_2 tr_3 tr_4 tr_5 ve_all_1 ve_all_2 ve_all_3 ve_all_4 ve_all_5 ve_voc_1 ve_voc_2 ve_voc_3 ve_voc_4 

## Still to review
 fsv_1 fsv_2 gep_1 gep_10 gep_11 gep_12 gep_13 gep_14 gep_15 gep_16 gep_17 gep_18 gep_19 gep_2 gep_3 gep_4 gep_5 gep_6 gep_7 gep_8 gep_9 sent_es_2 sent_es_3 sent_es_4 sent_es_5 sent_es_6 sent_es_7 sent_es_8 sent_es_9 verbs_es_1 verbs_es_2 verbs_es_3 verbs_es_4 verbs_es_5 verbs_es_6 verbs_es_7 verbs_es_8 verbs_es_9 verbs_fr_1 verbs_fr_10 verbs_fr_2 verbs_fr_3 verbs_fr_4 verbs_fr_5 verbs_fr_6 verbs_fr_7 verbs_fr_8 verbs_fr_9 verbs_it_1 verbs_it_10 verbs_it_11 verbs_it_2 verbs_it_3 verbs_it_4 verbs_it_5 verbs_it_6 verbs_it_7 verbs_it_8 verbs_it_9
(In the scratch work these were chunks of: Spanish verb sentences, FR/IT/ES conjugation tables, Gen Essential Phrases, F Spanish Vocab.)

## How to resume
1. Re-dump datasets with dumpall.js / dump2.js (Playwright) and rebuild chunks (same chunking: ~150-200 KB JSONL, items carry ds + key = array index; TM key = cardid#n; TOPICS_DEMO_EN key = code; PAPERS key = id). Verb tables compacted: forms joined " | ".
2. Review the remaining chunks with BRIEF.md.
3. Apply: item-scoped substring replacement inside each item's raw literal (all:true = whole dataset, every copy of the dataset in the file); add_alt / remove_reject for TR_PASSAGES chunks. Re-dump and compare with expected.
4. Independent verifier pass on every applied change, then restamp (stamp.py: sha1 of file with var B blanked, 10 hex) + versions.json, commit, push.

## Decisions waiting for Andrew
1. Eton trousers: model answers say pantalon noir/gris — reviewers propose pinstriped.
2. Italian (~560) and Spanish subjunctive gap-fills lack a trigger ("Io parli italiano") — add lead-in such as "È importante che…"?
3. 40% radio quota attributed to loi Toubon in KTRs + 6 demos (strictly loi Carignon 1994) — correct everywhere?
4. "celui que je préfère… serait" kept as house structure.
Also: KTR fix changes 77,000 → about 76,000 deportees; demos still say environ 77 000 (make consistent). ZEP vs QPV in politique de la ville (KTR + demo FR129).
Manual items flagged by reviewers: TR 2019 FR chunk 6 alt "de jouer"; MLF keys 114/119 (apply only there); FR sentences 2137, 2440, 2260, 2365, 2356, 2405, 2532, 3423, 3540, 3552, 3659, 3677, 3666, 3937; IT sentence 1333; VE vocab 858, 1630, 937, 633, 2187, 2650, 2695; IGCSE FR card 296 theme label; demoHL snippets cut mid-word (FR cards 6, 81, 97, 109).
