#!/usr/bin/env python3
"""Make the 'No Spanish' twin of Eton A Level Oral Phrase Bank.html.
Usage: python3 make_opb.py <original.html> <twin.html>
Pattern-based; fails loudly if an expected pattern is missing."""
import re, sys
src, dst = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8').read()
log = []

def sub(pat, rep, name, minc=1, maxc=None, flags=0):
    global t
    t, c = re.subn(pat, rep, t, flags=flags)
    log.append((name, c))
    if c < minc or (maxc is not None and c > maxc):
        sys.exit('FAIL: pattern %r matched %d times (expected %s..%s)' % (name, c, minc, maxc))

def lit(old, new, name, minc=1, maxc=None):
    sub(re.escape(old), new.replace('\\', '\\\\'), name, minc, maxc)

# --- data / table columns (first-pass stripper) ---
sub(r'[ \t]*<option value="es">[^<]*</option>\n?', '', 'option es', 0)
sub(r'<th[^>]*>\s*🇪🇸 ES\s*</th>', '', 'ES table header')
sub(r'[ \t]*<td[^>]*>\s*<input[^>]*data-lang="es"[^>]*>\s*</td>\n?', '', 'ES table cells')
sub(r',\s*"es"\s*:\s*"(?:[^"\\]|\\.)*"', '', 'json es values')
sub(r'"es"\s*:\s*"(?:[^"\\]|\\.)*"\s*,\s*', '', 'json es first', 0)
sub(r',\s*es\s*:\s*\'(?:[^\'\\\n]|\\.)*\'', '', 'js es single-quoted (LANG_NAMES etc)')
sub(r',\s*es\s*:\s*"(?:[^"\\\n]|\\.)*"', '', 'js es double-quoted', 0)
# nested Spanish {SRC} object
sub(r',"es":\{"fr":"[^"]*","it":"[^"]*"\}', '', 'nested src es')

# --- UI ---
lit(' 🇮🇹 🇪🇸 · Audio', ' 🇮🇹 · Audio', 'header flags')
lit("AP_VOICE.check(['fr', 'it', 'es', 'en'])", "AP_VOICE.check(['fr', 'it', 'en'])", 'voice button')
sub(r'[ \t]*<label[^>]*><input type="checkbox" class="printLangCk" value="es">[^\n]*</label>\n', '', 'print checkbox')
sub(r'<span style="font-size:0\.7rem;color:var\(--text3\);opacity:0\.65">🇪🇸 [^<]*</span>', '', 'ES example line')

# --- code ---
sub(r"\['en',\s*'fr',\s*'it',\s*'es'\]", "['en','fr','it']", 'lang list en fr it es')
sub(r"\['fr','it','es','en'\]", "['fr','it','en']", 'lang list fr it es en')
sub(r"\['fr', 'it', 'es'\]", "['fr', 'it']", 'lang list fr it es')
sub(r"[ \t]*\+ '<div class=\"lang-es\">'\+resolveText\(p,'es'\)\+'</div>'\n", '', 'print lang-es div')
sub(r"[ \t]*'\.lang-es\{[^}]*\}',\n", '', 'print lang-es css')
lit(", es: sub(p.es, p, 'es') }", " }", 'vocab drill es card')
lit("{ fr: [], it: [], es: [] }", "{ fr: [], it: [] }", 'tpl cards')
lit("{ fr: {}, it: {}, es: {} }", "{ fr: {}, it: {} }", 'tpl prompts')
sub(r"[ \t]*'IGCSE Spanish ▸ Top Structures'[^\n]*\n", '', 'test-maker Spanish folders')

open(dst, 'w', encoding='utf-8').write(t)
for n, c in log: print('%4d  %s' % (c, n))
