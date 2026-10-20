#!/usr/bin/env python3
"""Build the 'No Spanish' twin of 'Eton IGCSE Vocab and Gr EWs.html'.

usage: python3 make_vocabgr.py <original.html> <twin.html>

Pattern-based; every edit asserts how many times it matched and the script
fails loudly (SystemExit 1) if an expected pattern is missing.
The build id line  var B = '...'  is left untouched.
"""
import re, sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
LOG = []


def sub(pat, rep, lo=1, hi=None, flags=0, label=None):
    """regex substitution; require lo <= matches <= hi (hi defaults to lo)."""
    global s
    hi = lo if hi is None else hi
    s, n = re.subn(pat, rep, s, flags=flags)
    LOG.append((label or pat[:60], n))
    if not (lo <= n <= hi):
        sys.exit('FAIL: pattern %r matched %d times, expected %d..%d' % (pat, n, lo, hi))


def lit(old, new, lo=1, hi=None, label=None):
    global s
    hi = lo if hi is None else hi
    n = s.count(old)
    LOG.append((label or old[:60], n))
    if not (lo <= n <= hi):
        sys.exit('FAIL: literal %r found %d times, expected %d..%d' % (old[:80], n, lo, hi))
    s = s.replace(old, new)


# ---------------------------------------------------------------- 1. page chrome / home screen text
sub(r'\.chip-es\{[^}]*\}', '', 1)                                   # Spanish chip colour
lit('Vocab &amp; grammar EWs · French · Italian · Spanish · Audio',
    'Vocab &amp; grammar EWs · French · Italian · Audio')
lit("AP_VOICE.check(['fr','it','es','en'])", "AP_VOICE.check(['fr','it','en'])")
sub(r'[ \t]*<option value="es">🇪🇸 Spanish</option>\n', '', 2)       # From / To selects
lit('Vocab lists &amp; EWs · 4 languages', 'Vocab lists &amp; EWs · 3 languages')
lit('<small>Grammar · French · Italian · Spanish</small>', '<small>Grammar · French · Italian</small>')

# ---------------------------------------------------------------- 2. language lists / dictionaries in code (page + pop-out templates)
sub(r"\['en',\s*'fr',\s*'it',\s*'es'\]", "['en','fr','it']", 15, 40)
sub(r"\['fr', 'it', 'es'\]", "['fr', 'it']", 4, 10)
sub(r"\['fr', 'es', 'it'\]", "['fr', 'it']", 2, 4)                  # voice-check default list (page + templates)
lit('LANG_NAMES  = { en:"English", fr:"French", it:"Italian", es:"Spanish" }',
    'LANG_NAMES  = { en:"English", fr:"French", it:"Italian" }')
lit('LANG_CODES  = { en:"en-GB", fr:"fr-FR", it:"it-IT", es:"es-ES" }',
    'LANG_CODES  = { en:"en-GB", fr:"fr-FR", it:"it-IT" }')
lit('LANG_CHIPS  = { en:"chip-en", fr:"chip-fr", it:"chip-it", es:"chip-es" }',
    'LANG_CHIPS  = { en:"chip-en", fr:"chip-fr", it:"chip-it" }')
lit('LANG_FLAGS  = { en:"🇬🇧", fr:"🇫🇷", it:"🇮🇹", es:"🇪🇸" }',
    'LANG_FLAGS  = { en:"🇬🇧", fr:"🇫🇷", it:"🇮🇹" }')
lit("const flags = {en:'🇬🇧',fr:'🇫🇷',it:'🇮🇹',es:'🇪🇸'};", "const flags = {en:'🇬🇧',fr:'🇫🇷',it:'🇮🇹'};")
lit(", es:LANG_FLAGS.es+' Spanish'}", "}")
lit("var LN={en:'English',fr:'French',it:'Italian',es:'Spanish'};", "var LN={en:'English',fr:'French',it:'Italian'};")
lit("it: 'Italian', es: 'Spanish' }", "it: 'Italian' }", 8, 30)  # LN / LNAME / OV_* / NM / L dictionaries
lit("{ en: '🇬🇧 English', fr: '🇫🇷 French', it: '🇮🇹 Italian', es: '🇪🇸 Spanish' }",
    "{ en: '🇬🇧 English', fr: '🇫🇷 French', it: '🇮🇹 Italian' }")
lit("it: '🇮🇹', es: '🇪🇸' }", "it: '🇮🇹' }", 1, 4)                  # MXF flags in the Speed Challenge templates
lit("{ fr: 'F', es: 'S', it: 'I' }[lg]", "{ fr: 'F', it: 'I' }[lg]")
lit("{ French: 'F', Italian: 'I', Spanish: 'S' }", "{ French: 'F', Italian: 'I' }")
lit("{ F: 'French', S: 'Spanish', I: 'Italian' }[L]", "{ F: 'French', I: 'Italian' }[L]")
lit("{ F: 'French', S: 'Spanish', I: 'Italian' }[langOf(m)]", "{ F: 'French', I: 'Italian' }[langOf(m)]")
lit("{ French: 'F', Spanish: 'S', Italian: 'I' }[m.lang]", "{ French: 'F', Italian: 'I' }[m.lang]")
lit("{ fr: 'fr-FR', it: 'it-IT', es: 'es-ES' }", "{ fr: 'fr-FR', it: 'it-IT' }", 1, 12)   # Gr/Vocab pop-out speech codes
lit("cards: { fr: [], it: [], es: [] }, prompts: { fr: {}, it: {}, es: {} }",
    "cards: { fr: [], it: [] }, prompts: { fr: {}, it: {} }", 1, 4)
lit("COG_LI = { fr: 0, it: 1, es: 2 }", "COG_LI = { fr: 0, it: 1 }")
lit("{ fr: 0, it: 1, es: 2 }[lang]", "{ fr: 0, it: 1 }[lang]")
lit("var ok = { fr: 1, it: 1, es: 1 };", "var ok = { fr: 1, it: 1 };")
lit("// Tags per word for fr, it, es:", "// Tags per word for fr, it:")
lit("the same in French, Italian and Spanish.", "the same in French and Italian.")
# stop-word list for the Spanish level grader (AP_LEVEL)
sub(r",\n(\s*)es: 'el la los las lo un una unos unas[^'\n]*'", '', 1)
# regexes in the link parsers
lit("(?:&l=(fr|it|es))?", "(?:&l=(fr|it))?")
lit("(?:&f=(en|fr|it|es))?(?:&t=(en|fr|it|es))?", "(?:&f=(en|fr|it))?(?:&t=(en|fr|it))?")
lit("(or  &l=it / &l=es)", "(or  &l=it)")
lit("(Vocab drill; Gr EWs drill in French, Italian, Spanish)", "(Vocab drill; Gr EWs drill in French, Italian)")
lit("(IGCSE Gr EWs: French / Italian / Spanish)", "(IGCSE Gr EWs: French / Italian)")

# ---------------------------------------------------------------- 3. vocabulary rows: drop the es field
sub(r',es:"(?:[^"\\\n]|\\.)*"\}', '}', 3000, 5000, label='vocab rows es field')
# the colleague-facing per-word tags: PPP -> PP (fr, it)
m = re.search(r'var VOCAB_COG = (\{[^\n]*?\});', s)
if not m:
    sys.exit('FAIL: VOCAB_COG not found')
cog = m.group(1)
vals = re.findall(r':"([PLDN]{3})"', cog)
if len(vals) < 1000 or len(vals) != cog.count(':"'):
    sys.exit('FAIL: VOCAB_COG values are not all 3-letter tags (%d)' % len(vals))
cog2 = re.sub(r':"([PLDN])([PLDN])[PLDN]"', r':"\1\2"', cog)
s = s.replace(cog, cog2, 1)
LOG.append(('VOCAB_COG 3->2 tags', len(vals)))

# ---------------------------------------------------------------- 4. Gr EWs: remove the whole Spanish course + language switch entry
sub(r'<script>\n// ── Spanish Gr EWs \(IGCSE[^\n]*\nconst GCSE_ES_DATA = [^\n]*\n//GS_DATA_END\n</script>\n', '', 1,
    label='Spanish Gr EWs data block')
sub(r",\n  es: \{ data: GCSE_ES_DATA,[^\n]*\n[^\n]*\n[^\n]*sayT: 'Transforma', file: '[^']*' \}\n\};",
    "\n};", 1, label='GG_LANGS es entry')
lit("[GCSE_GR_DATA, GCSE_IT_DATA, GCSE_ES_DATA].forEach", "[GCSE_GR_DATA, GCSE_IT_DATA].forEach")
sub(r"\n  if \(out\) out = put\(out, 'GCSE_ES_' \+ 'DATA', 'GS_' \+ 'DATA_END', GCSE_ES_DATA\);", '', 1)
lit("Italian / Spanish only when their own button is pressed", "Italian only when its own button is pressed")

# ---------------------------------------------------------------- 5. teacher test-maker: nothing Spanish may surface
sub(r"\n    'IGCSE Spanish ▸ Top Structures', 'IGCSE Spanish ▸ Vocab', 'IGCSE Spanish ▸ Verbs', 'IGCSE Spanish ▸ Approved Material', 'IGCSE Spanish ▸ Essential Phrases',", '', 1,
    label='Spanish library folders')
sub(r"\n    if \(/\\uD83C\\uDDEA\\uD83C\\uDDF8\|Spanish\|Español/i\.test\(t\)\) return 'S';", '', 1, label='langOf Spanish sniff')
lit("(/Spanish/i.test(document.title + ' ' + sum) ? 'S' : /Italian/i.test(sum) ? 'I' : 'F')",
    "(/Italian/i.test(sum) ? 'I' : 'F')")

# ---------------------------------------------------------------- 6. sibling-app links (none expected in this app; checked, rewritten if present)
TWINNED = ['Eton A Level French VVs & Gr EWs & Grammar Translation Practice and Drills', 'Eton A Level Oral Phrase Bank',
           'Eton IGCSE Approved Material Practice Sentences', 'Eton IGCSE Structures & Oral and Writing Practice',
           'Eton IGCSE Vocab Essentials', 'Eton IGCSE Vocab and Gr EWs']
for name in TWINNED:
    for enc_amp in (False, True):
        base = name.replace('&', '&amp;') if enc_amp else name
        for plain, rep in ((base + '.html', base + ' (No Spanish).html'),
                           (base.replace(' ', '%20') + '.html', base.replace(' ', '%20') + '%20(No%20Spanish).html'),
                           (base.replace(' ', '%20').replace('&', '%26') + '.html', base.replace(' ', '%20').replace('&', '%26') + '%20(No%20Spanish).html')):
            if plain in s:
                LOG.append(('sibling link rewritten', plain))
                s = s.replace(plain, rep)

open(dst, 'w', encoding='utf-8').write(s)
for k, v in LOG:
    print('%6d  %s' % (v, k))
print('wrote', dst, len(s.encode('utf-8')), 'bytes')
