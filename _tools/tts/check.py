#!/usr/bin/env python3 -I
"""Checks that every AP app that speaks uses the approved placeholder spellings (placeholders.json).
Run from the repo root:  python3 -I _tools/tts/check.py   (exit code 1 = problem)"""
import json,re,glob,os,sys
M=json.load(open(os.path.join(os.path.dirname(__file__),'placeholders.json'),encoding='utf8'))
T=M['table']
# apps that legitimately have no placeholder speech
SKIP={'Eton Gen Essential Phrases.html':'private, never touched','AP Gen Essential Phrases.html':'private',
 'Eton IGCSE French Listening.html':'recorded/past-paper listening, no placeholders','Eton IGCSE Italian Listening.html':'same',
 'Eton IPA Studio.html':'single sounds only','Eton Tests.html':'test hub, no card speech','Eton A Level Oxbridge Grammar Checklist.html':'no speech of placeholders'}
KNOWN=re.compile(r'amPhSay|AM_PH_SAY|PH_SAY_APP|PH_SAY_FR|PH_SAY_ES|PH_SAY_IT|\bPH_SAY\b|_phSayT|_phSayEs|_phSay\b')
nested=re.compile(r"\b(INF|ADJ|NOUNS|NOUN|TIME|X|Y|SUBJ|INDIC|IMP):\s*\{([^}]*)\}")
flat=re.compile(r"var\s+PH_SAY_(FR|ES|IT)\s*=\s*\{([^}]*)\}")
bad=[];ok=0;files=[f for f in sorted(glob.glob('*.html')) if not (f.startswith('AP ') and not f.startswith('AP All Languages'))]
for f in files:
    s=open(f,encoding='utf8').read()
    if 'speechSynthesis' not in s: continue
    if f in SKIP: continue
    if not KNOWN.search(s):
        bad.append(f'{f}: speaks but has NO placeholder-speech table'); continue
    for tok,body in nested.findall(s):
        for lang,sp in re.findall(r"\b(fr|it|es):\s*'([^']*)'",body):
            want=T[tok].get(lang)
            if want is not None and sp!=want and f'{tok}.{lang}' not in M['guesses']: bad.append(f'{f}: {tok}.{lang} is "{sp}", approved is "{want}"')
    for lang,body in flat.findall(s):
        for tok,sp in re.findall(r"\b([A-Z]+):\s*'([^']*)'",body):
            want=T.get(tok,{}).get(lang.lower())
            if want is not None and sp!=want and f'{tok}.{lang.lower()}' not in M['guesses']: bad.append(f'{f}: {tok}.{lang.lower()} is "{sp}", approved is "{want}"')
    ok+=1
print(f'{ok} speaking apps checked')
for b in bad: print('PROBLEM',b)
if not bad: print('All good: every speaking app uses the approved placeholder table.')
sys.exit(1 if bad else 0)
