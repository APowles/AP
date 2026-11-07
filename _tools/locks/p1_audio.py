#!/usr/bin/env python3
"""EXAM AUDIO LOCK for the Paper 1 listening papers in "Eton A Level French Oral Topics & Paper 1 Practice.html".

Checks that the block between the "EXAM AUDIO LOCK ... (START)" and "(END)" markers is exactly the version Andrew approved,
and that the exam defaults are still in place (80 % speed, 0.8 s pause, never remembered, not scaled by the shared Speed & pauses).
Run by _tools/version/stamp.py before every stamp and by the Pages workflow before every publish: if the check fails, both stop.

Approving a change (ONLY after Andrew has named the Paper 1 listening audio himself and confirmed, see CLAUDE.md):
    python3 -I _tools/locks/p1_audio.py --accept "Andrew's words approving the change, and the date"
This records the new fingerprint and adds a line to _tools/locks/p1_audio.log.
"""
import hashlib, os, sys, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PAGE = os.path.join(ROOT, 'Eton A Level French Oral Topics & Paper 1 Practice.html')
HERE = os.path.dirname(os.path.abspath(__file__))
SHA = os.path.join(HERE, 'p1_audio.sha'); LOG = os.path.join(HERE, 'p1_audio.log')
A = '/* ⛔⛔⛔ EXAM AUDIO LOCK: PAPER 1 LISTENING (START) ⛔⛔⛔'
B = '/* ⛔⛔⛔ EXAM AUDIO LOCK: PAPER 1 LISTENING (END) ⛔⛔⛔ */'
MUST = [  # the exam rules themselves, checked by name as well as by fingerprint
    ('80 % / 0.8 s on every open', 'P1A.rate=0.8; P1A.pause=0.8;'),
    ('default re-applied on every paper', 'function p1PaceDefault(){ P1A.rate=0.8; P1A.pause=0.8;'),
    ('not scaled by the shared Speed & pauses', 'u.__apSp=1;'),
    ('Reset goes back to 80 % / 0.8 s', "P1A.rate=0.8; P1A.pause=0.8; show(); if(ch) respeak();"),
]
NEVER = [('a remembered speed', "getItem('p1Rate')"), ('a remembered pause', "getItem('p1Pause')")]

def block():
    s = open(PAGE, encoding='utf-8').read()
    if s.count(A) != 1 or s.count(B) != 1: return None, 'the lock markers are missing or doubled'
    i = s.index(A); j = s.index(B) + len(B)
    return s[i:j], ''

def fail(why):
    bar = '⛔' * 30
    sys.stderr.write('\n%s\nEXAM AUDIO LOCK: the Paper 1 listening audio has been changed (%s).\n'
        'These are exam papers. Nothing is stamped or published until this is resolved.\n'
        'If the change was NOT asked for by Andrew, by name, for the Paper 1 listening audio: undo it.\n'
        'Only if he asked and confirmed (CLAUDE.md, "Paper 1 listening audio: triple lock"):\n'
        '    python3 -I _tools/locks/p1_audio.py --accept "<his words and the date>"\n%s\n\n' % (bar, why, bar))
    sys.exit(1)

def main():
    b, err = block()
    if b is None: fail(err)
    for what, t in MUST:
        if t not in b: fail('missing: ' + what)
    for what, t in NEVER:
        if t in b: fail('found ' + what)
    h = hashlib.sha256(b.encode('utf-8')).hexdigest()
    if len(sys.argv) > 2 and sys.argv[1] == '--accept':
        reason = ' '.join(sys.argv[2:]).strip()
        if len(reason) < 15: fail('--accept needs Andrew\'s words and the date')
        open(SHA, 'w').write(h + '\n')
        open(LOG, 'a', encoding='utf-8').write('%s  %s  %s\n' % (datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC'), h[:12], reason))
        print('EXAM AUDIO LOCK: new version approved and recorded (' + h[:12] + ')'); return
    want = open(SHA).read().strip() if os.path.exists(SHA) else ''
    if h != want: fail('the locked block differs from the approved version')
    print('EXAM AUDIO LOCK: Paper 1 listening audio unchanged (' + h[:12] + ')')

if __name__ == '__main__': main()
