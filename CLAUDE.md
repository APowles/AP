# AP teaching apps: rules for every session

## Always restamp before committing (the gold "AP has updated this app" strip depends on it)

Every `Eton *.html` and `AP All Languages - *.html` page carries a build id. The gold strip appears for a boy (or AP) only when that id differs from the one in `version.json`. If a page is changed and not restamped, the strip never appears and open copies stay out of date.

Before every commit that changes any of those pages, from the repo root run:

    python3 -I _tools/version/stamp.py

then commit the changed pages and `version.json` together. Do this even for a one-word change. Git hooks are not copied when the repo is cloned, so nothing does this for you in a fresh session.

A GitHub Action (`.github/workflows/stamp.yml`) also restamps after every push as a safety net, but do not rely on it: restamp yourself first.
