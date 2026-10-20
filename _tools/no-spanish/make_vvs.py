#!/usr/bin/env python3
"""Make the 'No Spanish' twin of the A Level French VVs & Gr EWs & Grammar Translation app.
usage: python3 make_vvs.py <original.html> <twin.html>
Pattern-based; fails loudly (SystemExit) if an expected pattern is missing."""
import re, sys, json

def main(src, dst):
    s = open(src, encoding='utf-8', newline='').read()
    log = {}

    def sub(name, pat, rep, count, flags=0):
        nonlocal s
        s, n = re.subn(pat, rep, s, flags=flags)
        if isinstance(count, int) and n != count or (isinstance(count, tuple) and not (count[0] <= n <= count[1])):
            raise SystemExit('PATTERN COUNT MISMATCH %s: expected %s got %d' % (name, count, n))
        log[name] = n

    def lit(name, old, new, count):
        nonlocal s
        n = s.count(old)
        if n != count:
            raise SystemExit('LITERAL COUNT MISMATCH %s: expected %d got %d' % (name, count, n))
        s = s.replace(old, new); log[name] = n

    # 1. MLF_DATA: drop the 'es' side of every formula and the two Spanish-only formulae
    m = re.search(r'^const MLF_DATA = (\[.*\]);$', s, re.M)
    if not m: raise SystemExit('MLF_DATA not found')
    data = json.loads(m.group(1))
    comp = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    if comp(data) != m.group(1): raise SystemExit('MLF_DATA does not round-trip')
    keep = [it for it in data if not any('Only affects Spanish' in (it.get(k) or {}).get('original', '') for k in ('en', 'fr', 'it'))]
    if len(data) - len(keep) != 2: raise SystemExit('expected 2 Spanish-only formulae, got %d' % (len(data) - len(keep)))
    for it in keep:
        if 'es' not in it: raise SystemExit('formula without es side?')
        del it['es']
    s = s[:m.start(1)] + comp(keep) + s[m.end(1):]
    log['mlf_items_removed'] = len(data) - len(keep)

    # 2. MLF_BONUS_UNUSED: drop 'es'
    m = re.search(r'^const MLF_BONUS_UNUSED = (\{.*\});$', s, re.M)
    if not m: raise SystemExit('MLF_BONUS_UNUSED not found')
    b = json.loads(m.group(1))
    if json.dumps(b, ensure_ascii=False) != m.group(1): raise SystemExit('MLF_BONUS_UNUSED does not round-trip')
    del b['es']
    s = s[:m.start(1)] + json.dumps(b, ensure_ascii=False) + s[m.end(1):]

    # 3. language table + state
    sub('MLF_LANGS', r"^  es: \{ label: 'Spanish', flag: '🇪🇸', key: 'es' \},\n", '', 1, re.M)
    sub('showBonus', r"showBonus: \{ fr: false, es: false, it: false \}", "showBonus: { fr: false, it: false }", 1)

    # 4. static markup: flag buttons, edit-table header, cells, Spanish-only rows
    sub('flag buttons', r"<button onclick=\"mlfSetLang\('(?:from|to)','es'\)\" class=\"tr-filter-btn \" style=\"[^\"]*\">🇪🇸</button>", '', 2)
    sub('static rows (Spanish-only)', r'<tr[^>]*data-idx="\d+">(?:(?!</tr>).)*?Only affects Spanish(?:(?!</tr>).)*?</tr>', '', (0, 4), re.S)
    sub('th', r"[ \t]*<th[^>]*>🇪🇸 Spanish</th>\n", '', 1)
    sub('static td', r"[ \t]*<td[^>]*><textarea[^>]*saveMlfCell\(\d+,'es',this\.value\)[^>]*>[^<]*</textarea></td>\n", '', (1, 200))

    # 5. MLF page / drill code
    sub('tts pick', r"(mlfState\.(?:from|to)Lang) === 'es' \? 'es' : 'it'", "'it'", 3)
    lit('edit es getter', "    const es = getMlfDisplay(idx, 'es');\n", '', 1)
    lit('edit filter', "[en,fr,es,it].some", "[en,fr,it].some", 1)
    sub('edit es cell', r"[ \t]*<td style=\"\$\{cellStyle\}\"><textarea style=\"\$\{inputStyle\}\" onchange=\"saveMlfCell\(\$\{idx\},'es',this\.value\)\" rows=\"1\">\$\{es\}</textarea></td>\n", '', 1)
    lit('export langs', "['en','fr','es','it'].forEach", "['en','fr','it'].forEach", 1)

    # 6. AP_LEVEL stop-word list for Spanish
    sub('stopwords', r"(    it: '(?:[^'\\\n]|\\.)*'),\n    es: '[^'\n]*'\n", r"\1\n", 1)

    # 7. voice-check default list, Speed Challenge help text
    lit('voice check default', "['fr', 'es', 'it']", "['fr', 'it']", 5)
    lit('mlf help text', "any of English, French, Spanish and Italian, either way round", "any of English, French and Italian, either way round", 1)

    # 8. teacher test-maker: Library heading folders + Spanish confirm dialog
    sub('CATS Spanish', r"    'IGCSE Spanish ▸ Top Structures', 'IGCSE Spanish ▸ Vocab', 'IGCSE Spanish ▸ Verbs', 'IGCSE Spanish ▸ Approved Material', 'IGCSE Spanish ▸ Essential Phrases',\n", '', 1)
    sub('askSpanish', r"(  function askSpanish\(cat\) \{\n)    var c = String\(cat \|\| ''\); if \(!/\^\(IGCSE\|F Block\) Spanish ▸ /\.test\(c\)\) return c;\n(?:.*\n)*?    return window\.confirm\('This is a Spanish test\.[^\n]*\n(  \})",
        r"\1    return String(cat || '');\n\2", 1)
    sub('langOf Spanish', r"    if \(/\\uD83C\\uDDEA\\uD83C\\uDDF8\|Spanish\|Español/i\.test\(t\)\) return 'S';\n", '', 1)

    # 9. sibling-app links: none in this file (self links all use location); nothing to rewrite.
    for nm in ('Eton A Level Oral Phrase Bank', 'Eton IGCSE Approved Material Practice Sentences', 'Eton IGCSE Structures & Oral and Writing Practice',
               'Eton IGCSE Vocab Essentials', 'Eton IGCSE Vocab and Gr EWs', 'Eton A Level French VVs & Gr EWs & Grammar Translation Practice and Drills'):
        for form in (nm, nm.replace(' ', '%20'), nm.replace('&', '&amp;')):
            if form + '.html' in s or form + '%20' in s:
                raise SystemExit('sibling link found, needs rewriting: ' + form)

    open(dst, 'w', encoding='utf-8', newline='').write(s)
    print(log)

if __name__ == '__main__':
    if len(sys.argv) != 3: raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
