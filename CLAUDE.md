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

## F Block Spanish: two stand-alone files, never rebuilt from other files

`Eton F Block Spanish.html` (boys and colleagues: all F Block vocab, only the 100 core verbs) and `AP F Block Spanish.html` (the same plus every verb, the extra tenses and the E Block trials tile; AP only) are edited directly. The old twins (`Eton F Spanish Vocab.html`, `Eton Spanish Verbs.html`) were deleted on 3 Nov 2026 and `_tools/fblock/build.py` is disabled. Never rebuild either file from other pages, and never put the full verb list into the Eton file (it must hold 309 verb entries). Any change to one file goes into the other in the same piece of work. The old addresses `AP F Spanish Vocab.html` and `AP Spanish Verbs.html` are redirect stubs to the Eton file.
