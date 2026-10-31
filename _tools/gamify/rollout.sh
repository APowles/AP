#!/bin/bash
# Re-inject / refresh the Gamify it games in every app that has them. Run from the repo root after editing blitz.js.
cd "$(dirname "$0")/../.."; I=_tools/gamify/inject.py
python3 $I "Eton IGCSE Vocab Essentials.html" --pics --games clock,streak,odd,letter,gender,roll,catch,lane,pairs,deal
python3 $I "AP All Languages - IGCSE Vocab Essentials.html" --pics --games clock,streak,odd,letter,gender,roll,catch,lane,pairs,deal
python3 $I "Eton IGCSE Vocab and Gr EWs.html" --games clock,streak,odd,letter,gender,roll,catch,lane,pairs,deal   # Deal it: trial file
python3 $I "AP All Languages - IGCSE Vocab and Gr EWs.html" --games clock,streak,odd,letter,gender,roll,catch,lane,pairs,deal
python3 $I "Eton F Spanish Vocab.html" --games clock,streak,odd,letter,gender,roll,catch,lane,pairs,deal
python3 $I "Eton Gen Essential Phrases.html" --noun phrases --short 4 --games clock,streak,odd,letter,roll,catch,lane,pairs,deal
python3 $I "Eton IGCSE Structures & Oral and Writing Practice.html" --host _tools/gamify/hosts/structures.js --noun phrases --short 4 --games clock,streak,odd,letter,roll,catch,lane,pairs,deal
python3 $I "AP All Languages - IGCSE Structures & Oral and Writing Practice.html" --host _tools/gamify/hosts/structures.js --noun phrases --short 4 --games clock,streak,odd,letter,roll,catch,lane,pairs,deal
python3 $I "Eton IGCSE Approved Material Practice Sentences.html" --host _tools/gamify/hosts/am.js --noun sentences --games clock,streak,letter,roll,pairs,deal
python3 $I "AP All Languages - IGCSE Approved Material Practice Sentences.html" --host _tools/gamify/hosts/am.js --noun sentences --games clock,streak,letter,roll,pairs,deal
python3 $I "Eton A Level French Oral Topics & Paper 1 Practice.html" --host _tools/gamify/hosts/ktr.js --noun sentences --short 4 --games clock,streak,letter,roll,catch,lane,pairs,deal
python3 _tools/gamify/hosts/verbs-export.py "Eton French Verbs.html" "Eton Italian Verbs.html" "Eton Spanish Verbs.html"
python3 $I "Eton French Verbs.html" --host _tools/gamify/hosts/french-verbs.js --noun forms --short 4 --games clock,streak,letter,roll,catch,lane,pairs,deal
python3 $I "Eton Italian Verbs.html" --host _tools/gamify/hosts/italian-verbs.js --noun forms --short 4 --games clock,streak,letter,roll,catch,lane,pairs,deal
python3 $I "Eton Spanish Verbs.html" --host _tools/gamify/hosts/spanish-verbs.js --noun forms --short 4 --games clock,streak,letter,roll,catch,lane,pairs,deal
for f in "Eton A Level French VVs & Gr EWs & Grammar Translation Practice and Drills.html" "AP All Languages - A Level French VVs & Gr EWs & Grammar Translation Practice and Drills.html"; do
  python3 $I "$f" --host _tools/gamify/hosts/vvs.js --noun items --short 4 --games clock,streak,odd,letter,gender,roll,catch,lane,pairs,deal   # needs window.__apPsModels = MODELS in the ap-ps script (already added)
done
for f in "Eton A Level Oral Phrase Bank.html" "AP All Languages - A Level Oral Phrase Bank.html"; do
  python3 $I "$f" --host _tools/gamify/hosts/phrasebank.js --noun phrases --short 4 --games clock,streak,odd,letter,roll,catch,lane,pairs,deal
done
# F Block Spanish is built from Eton F Spanish Vocab + Eton Spanish Verbs, so it gets Gamify it (all games) in both sections by rebuilding it last:
python3 _tools/fblock/build.py
