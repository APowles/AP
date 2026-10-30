#!/bin/bash
# Re-inject / refresh the Gamify it games in every app that has them. Run from the repo root after editing blitz.js.
cd "$(dirname "$0")/../.."; I=_tools/gamify/inject.py
python3 $I "Eton IGCSE Vocab Essentials.html" --pics
python3 $I "AP All Languages - IGCSE Vocab Essentials.html" --pics
python3 $I "Eton IGCSE Vocab and Gr EWs.html"
python3 $I "AP All Languages - IGCSE Vocab and Gr EWs.html"
python3 $I "Eton F Spanish Vocab.html"
python3 $I "Eton F Block Spanish.html" --inside fb-vocab
python3 $I "Eton Gen Essential Phrases.html" --noun phrases --short 4 --games clock,streak,odd,letter,roll,catch,lane,pairs
