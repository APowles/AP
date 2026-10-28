# Adding Build it to an app (brief for the person doing one file)

Build it is a tile game: a sentence is cut into word tiles, some already placed, the pupil taps or drags the rest into the right order, then Check. It already exists inside "Eton IGCSE Structures & Oral and Writing Practice.html" (Learn from this demo -> Build it tile). It is now a SHARED module: `_tools/buildit/buildit.src.js`, installed into an app with

    python3 /home/claude/ap/_tools/buildit/install.py "<file.html>"

(it adds a <script> block between <!--BUILDIT:START--> and <!--BUILDIT:END--> before the last </body>; re-run it any time, it replaces itself). It defines `window.BuildIt`:

    BuildIt.open({ items:[{fr:'full correct target-language sentence', en:'English meaning (optional, shown only after a click on "Give me a clue")'}],
                   sub:'subtitle e.g. the topic/list name', code:'optional badge text', lang:'fr'|'es'|'it',
                   count:6, say:function(text){ /* optional: use the app's own voice function; if omitted browser speechSynthesis is used */ },
                   onBack:function(){ /* called when the pupil leaves; restore the app screen */ } })
    BuildIt.ICON   // data: URI of the glossy tile icon (webp)

It is a full-screen overlay with its own Back button and Escape key; it keeps its own state, level (Easy/Medium/Hard, remembered) and sound switch. Do NOT edit buildit.src.js (tell me what you need changed instead).

## Your job
1. Find, in YOUR app, where its activities are offered (the "NEXT - How do you want to practise it?" tiles, `.ms-tile` family, each with an icon, title and one line) and where complete sentences (target language + English) live in the data. Decide which sentences feed Build it for what the pupil has chosen (the chosen lists/chapters/topics: respect what is selected in FIRST; nothing downstream may ask the pupil to pick again). Sentences must be complete, correct and 4 to 40 words. Skip gap/cloze items and anything with an error. Never show or leak answers before the pupil asks.
2. Add a "Build it" tile in the same place and look as the neighbouring tiles (same classes, uniform size, glossy icon from `BuildIt.ICON` used the same way other tiles use their icons). Line under the title: "Tap or drag the tiles into the right order to rebuild sentences." Put it where it sits naturally (NOT inside Drill: Drill is the oral self-mark activity). If the app greys out tiles that need a selection, do the same (disabled until sentences are available).
3. Wire it: tile click -> collect sentences -> if none, do the app's usual "nothing to practise" message -> else `BuildIt.open({... onBack ...})`. onBack must return the pupil to exactly the screen they left (exactly one stage back). lang: 'fr', 'es' or 'it' as appropriate; pass the app's own speak function as `say` if there is one (French audio must NEVER autoplay; the module only speaks on its Hear it button).
4. Run the install script on your file.
5. TEST through the real route a pupil uses, with Playwright (chromium is installed; `require('playwright')`; fake `speechSynthesis` with addInitScript as other tests do). Serve with `cd /home/claude/ap && python3 -m http.server <YOUR PORT>` run in the background with nohup (never `pkill -f` a pattern that matches your own command). Open the app, choose content in FIRST, press the Build it tile, check the board appears with sentences from the chosen content, place tiles (tap AND a mouse drag), Check right and wrong, Show me the answer, Back returns to the right screen, Escape works, and no page errors. Take a screenshot of the tile in the NEXT grid and of the board and look at them.
6. Update the matching boy-facing user guide in /home/claude/ap/guides/ (find the right one; mirror the style, say "Div"/"School" not "class", no teacher-only features) with a short Build it description in the same piece of work.
7. Do NOT commit, push, or run stamp.py (the lead does that). Do NOT touch any other app file or the Structures file. Edit only your one app file and its guide.
8. Report back briefly: where the tile is, where the sentences come from and how many were available in a typical selection, what you tested, anything you could not test or that looks wrong, and any French/Spanish/Italian error you noticed in the sentences (do not edit sentence data; just report).

House rules to respect: iPad/Prisma browser is the key target (no risky new browser APIs beyond what the module already uses); no floating controls over content; clues only after a click; answers never on show by default; text in target language must be flawless.
