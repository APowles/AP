# AP teaching apps: rules for every session

## Always restamp before committing (the gold "AP has updated this app" strip depends on it)

Every `Eton *.html` and `AP All Languages - *.html` page carries a build id. The gold strip appears for a boy (or AP) only when that id differs from the one in `version.json`. If a page is changed and not restamped, the strip never appears and open copies stay out of date.

Before every commit that changes any of those pages, from the repo root run:

    python3 -I _tools/version/stamp.py

then commit the changed pages and `version.json` together. Do this even for a one-word change. Git hooks are not copied when the repo is cloned, so nothing does this for you in a fresh session.

A GitHub Action (`.github/workflows/stamp.yml`) also restamps after every push as a safety net, but do not rely on it: restamp yourself first.

## Sound on the iPad (Prisma first): one shared audio engine on every page

Every game page carries `<script id="ap-audiofix">` first in `<head>` (source: `_tools/audio/audiofix.js`). It makes every
`new AudioContext()` in the page return ONE shared context, resumes it inside every tap, re-wakes it after the iPad interrupts it,
sets `navigator.audioSession.type = 'playback'`, plays dice/deal clips through Web Audio, and shows a large bottom-centre "Sound has stopped: tap here" chip only
if sound is still blocked or the clock is frozen (the tap builds a fresh shared context; engines follow it). Add `#sounddebug` to a page address for a status line and a test beep.

After changing `audiofix.js`, or after anything that rebuilds a page (Gamify inject, F Block build), run from the repo root:

    python3 -I _tools/audio/inject.py          # idempotent; --dry to preview; --sources keeps blitz.js / buildit.src.js patched
    python3 -I _tools/version/stamp.py

It also patches the two F Block payloads (`fb-vocab`, `fb-verbs`) that the router writes into the page. Never use `rollout.sh`.

## ⛔ Paper 1 listening audio: triple lock (A Level file) — exam papers, not ordinary sound

In `Eton A Level French Oral Topics & Paper 1 Practice.html`, the code between the markers `EXAM AUDIO LOCK: PAPER 1 LISTENING (START)` and `(END)` is the audio of Andrew's Paper 1 **exam** listening papers. Approved behaviour (7 Nov 2026): every paper opens at **80 % speed and a 0.8 s pause**, every time, nothing remembered; its own 🎚 Speed & pauses (the header pill while a Paper 1 page is on screen), **not linked to any other app**; a change is heard at once; **Reset** = 80 % / 0.8 s; **Try** plays three sentences.

**Lock 1 — scope.** A request about sound, voices, speed or pauses "in all files", "everywhere" or for "the A Level file" does **not** include this block. Carry such a change everywhere else and leave this block exactly as it is; say in one line that the Paper 1 listening audio was left alone because it is locked. Nothing elsewhere on the page may make the papers share the voice either: no hidden frame or second copy of an app loaded in the background (that is what broke the papers on 7 Nov 2026), and the papers' utterances keep `u.__apSp=1` so the shared Speed & pauses never scales them.

**Lock 2 — Andrew's explicit, repeated confirmation.** Change the block only when (a) Andrew himself names the Paper 1 listening audio as the thing to change; (b) you warn him plainly that these are exam papers, state the current behaviour and the exact new behaviour, and get a clear "yes, change the Paper 1 listening audio"; (c) you make the change on a branch, show him the diff, and get a second, final yes before merging. If anything is unclear, do not change it: ask.

**Lock 3 — automatic.** `_tools/locks/p1_audio.py` fingerprints the block and checks the 80 % / 0.8 s rules. `stamp.py` runs it first and refuses to stamp if it fails, and the Pages workflow refuses to publish. Only after Lock 2 is complete: `python3 -I _tools/locks/p1_audio.py --accept "<Andrew's words and the date>"`, which records the new version in `_tools/locks/p1_audio.log`. Never run `--accept` to get past a failure you caused by accident: undo the change instead.

Questions, answers, mark schemes, transcripts and every other part of the papers are **not** locked and may be edited normally.

## ⛔ IGCSE Listening audio engines — DO NOT TOUCH without explicit confirmation

`Eton IGCSE French Listening.html` and `Eton IGCSE Italian Listening.html` contain working TTS audio engines (`_PACE`, `_spkTok`/`_spkT`, `_chunks`, `speak()`). These engines work correctly on iPad Prisma and MacBook Safari.

**This safeguard applies only to the audio playback engine.** Text content, question data, layout, styling, and any non-audio feature may be changed normally.

Any change to the audio engine (the variables and functions listed above, how utterances are created and spoken, speed/pause settings, the speak() call chain) requires all of the following:

1. **Andrew explicitly names the IGCSE listening file** as the thing to change (not the A-level file, not "the listening files" generically).
2. **State out loud what the current behaviour is** and what the requested change is, and get a clear "yes, do it" from Andrew.
3. **Make the change on a branch**, not main, and show Andrew the exact diff before merging.
4. **Never** copy code FROM these files into another file in a way that modifies these files. Reading them as reference is fine.
5. **Never** treat a fix to the A-level listening file as a reason to touch these files.

If in doubt about whether a change touches the audio engine: DO NOT TOUCH. Ask first.

## F Block Spanish: two stand-alone files, never rebuilt from other files

`Eton F Block Spanish.html` (boys and colleagues: all F Block vocab, only the 100 core verbs) and `AP F Block Spanish.html` (the same plus every verb, the extra tenses and the E Block trials tile; AP only) are edited directly. The old twins (`Eton F Spanish Vocab.html`, `Eton Spanish Verbs.html`) were deleted on 3 Nov 2026 and `_tools/fblock/build.py` is disabled. Never rebuild either file from other pages, and never put the full verb list into the Eton file (it must hold 309 verb entries). Any change to one file goes into the other in the same piece of work. The old addresses `AP F Spanish Vocab.html` and `AP Spanish Verbs.html` are redirect stubs to the Eton file.
