#!/usr/bin/env python3
"""Make the Eton (English + French only) A Level Oral Phrase Bank from the AP All Languages version.
Usage: python3 make_opb_fr.py <AP All Languages - A Level Oral Phrase Bank.html> <Eton A Level Oral Phrase Bank.html>
Step 1 strips Spanish (make_opb.py), step 2 strips Italian. Fails loudly if a pattern is missing."""
import re, sys, subprocess, tempfile, os
src, dst = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
tmp = tempfile.mktemp(suffix='.html')
subprocess.check_call([sys.executable, os.path.join(here, 'make_opb.py'), src, tmp], stdout=subprocess.DEVNULL)
t = open(tmp, encoding='utf-8').read(); os.remove(tmp)
log = []
def sub(pat, rep, name, minc=1, maxc=None, flags=0):
    global t
    t, c = re.subn(pat, rep, t, flags=flags)
    log.append((name, c))
    if c < minc or (maxc is not None and c > maxc):
        sys.exit('FAIL: %r matched %d (expected %s..%s)' % (name, c, minc, maxc))
def lit(old, new, name, minc=1, maxc=None):
    sub(re.escape(old), new.replace('\\', '\\\\'), name, minc, maxc)
S = r'"(?:[^"\\]|\\.)*"'
# data
sub(r',\s*"it"\s*:\s*' + S, '', 'json it strings', 300)
sub(r',\s*"it"\s*:\s*\{[^{}]*\}', '', 'json it objects (nested src)', 1)
sub(r'"it"\s*:\s*' + S + r'\s*,\s*', '', 'json it first', 0)
# edit table + print
sub(r'<th[^>]*>🇮🇹 IT</th>', '', 'IT header')
sub(r'[ \t]*<td[^>]*>\s*<input[^>]*data-lang="it"[^>]*>\s*</td>\n?', '', 'IT cells', 150)
sub(r'[ \t]*<label[^>]*><input type="checkbox" class="printLangCk" value="it">[^\n]*</label>\n', '', 'print Italian checkbox')
sub(r"[ \t]*\+ '<div class=\"lang-it\">'\+resolveText\(p,'it'\)\+'</div>'\n", '', 'print lang-it div')
sub(r'<span style="font-size:0\.7rem;color:var\(--text3\);opacity:0\.65">🇮🇹 [^<]*</span>', '', 'IT example line')
sub(r'Pick any two for a bilingual sheet', 'Pick one or both for the sheet', 'print note', 0)
# UI labels
lit('Multilingual · 309 phrases · 🇬🇧 🇫🇷 🇮🇹 · Audio', 'Bilingual · 309 phrases · 🇬🇧 🇫🇷 · Audio', 'header')
lit("AP_VOICE.check(['fr', 'it', 'en'])", "AP_VOICE.check(['fr', 'en'])", 'voice button')
# language lists and maps
sub(r"\['en',\s*'fr',\s*'it'\]", "['en','fr']", 'list en fr it', 5)
sub(r"\['fr',\s*'it',\s*'en'\]", "['fr','en']", 'list fr it en', 1)
sub(r"\['fr',\s*'it'\]", "['fr']", 'list fr it', 3)
sub(r",\s*it:'Italian'", '', 'LANG_NAMES it')
sub(r",\s*it:'it-IT'", '', 'LANG_CODES it')
sub(r",\s*it:'🇮🇹'", '', 'flags it')
sub(r",\s*it:'&#127470;&#127481;'", '', 'flags it entity', 1)
sub(r",\s*it: 'Italian'", '', 'names it spaced', 1)
sub(r",\s*it: '🇮🇹'", '', 'flags it spaced', 1)
lit(", it: sub(p.it, p, 'it') }", " }", 'speed cards it')
lit("{ cards: { fr: [], it: [] }, prompts: { fr: {}, it: {} } }", "{ cards: { fr: [] }, prompts: { fr: {} } }", 'tpl cards', 0)
lit("{ fr: 'fr-FR', it: 'it-IT' }", "{ fr: 'fr-FR' }", 'tpl codes', 0)
lit("{ fr: 'French', it: 'Italian' }", "{ fr: 'French' }", 'tpl names', 0)
sub(r"\['fr', 'it'\]\.indexOf", "['fr'].indexOf", 'indexOf', 0)
lit("(l === 'it' || l === 'es' ? l : 'fr')", "'fr'", 'icon language', 1)
lit("['fr', 'es', 'it']", "['fr']", 'voice-check default', 0)
open(dst, 'w', encoding='utf-8').write(t)
for n, c in log: print('%4d  %s' % (c, n))

# NOTE: after this script, also drop the unused Italian/Spanish tile icons:
#   re.sub(r',\s*"(?:spell|match)_(?:it|es)":\s*"data:image/webp;base64,[A-Za-z0-9+/=]+"', '', html)  then restamp.
