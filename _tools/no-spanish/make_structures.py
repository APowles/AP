#!/usr/bin/env python3
"""Build the 'No Spanish' twin of Eton IGCSE Structures & Oral and Writing Practice.html
usage: python3 make_structures.py <original.html> <twin.html>
Pattern-based; fails loudly (SystemExit) if an expected pattern is missing or occurs a different number of times."""
import re, sys, json

def build(t):
    log = []

    def R(old, new, count=1, why=''):
        nonlocal t
        n = t.count(old)
        if n != count:
            raise SystemExit('PATTERN COUNT MISMATCH (%d != %d): %s' % (n, count, old[:100]))
        t = t.replace(old, new)

    def RX(pat, new, count=1, flags=re.S, why=''):
        nonlocal t
        t, n = re.subn(pat, new, t, flags=flags)
        if count is not None and n != count:
            raise SystemExit('REGEX COUNT MISMATCH (%d != %s): %s' % (n, count, pat[:100]))
        log.append((pat[:50], n))

    def cut_balanced(start_pat, open_ch, close_ch):
        """delete from match of start_pat (inclusive) through the matching close_ch (and a following ';' and newline)"""
        nonlocal t
        m = re.search(start_pat, t)
        if not m:
            raise SystemExit('START NOT FOUND: ' + start_pat)
        i = t.index(open_ch, m.end() - 1) if t[m.end() - 1] != open_ch else m.end() - 1
        depth = 0; j = i; q = None
        while j < len(t):
            c = t[j]
            if q:
                if c == '\\': j += 1
                elif c == q: q = None
            elif c in '"\'`': q = c
            elif c == open_ch: depth += 1
            elif c == close_ch:
                depth -= 1
                if depth == 0: break
            j += 1
        end = j + 1
        if t[end:end + 1] == ';': end += 1
        if t[end:end + 1] == '\n': end += 1
        t = t[:m.start()] + t[end:]

    # ---------------------------------------------------------------- Spanish theme names / card codes inside the oral-cards dropdown tables
    def _cards(name, tail):
        mm = re.search(r'const ' + name + r' = (\[.*?\])' + tail, t, re.S)
        if not mm: raise SystemExit('cards not found: ' + name)
        return json.loads(mm.group(1))
    es_cards = _cards('IGCSE_CARDS_ES', r';?\n</script>')
    th = lambda a: {c['theme'] for c in a}
    es_only = th(es_cards) - th(_cards('IGCSE_CARDS', r';\n')) - th(_cards('IGCSE_CARDS_IT', r';\n'))
    es_only |= {'Los teléfonos móviles', 'Las tradiciones y las fiestas'}   # Spanish theme names that are in the dropdown tables but on no card
    if len(es_only) < 40: raise SystemExit('unexpected number of Spanish-only themes: %d' % len(es_only))
    a = t.index('const ORAL_THEME_GROUPS = ['); b = a + re.search(r'\n[ \t]*\];', t[a:]).start()
    if b - a > 20000: raise SystemExit('ORAL_THEME_GROUPS block looks too long')
    newlines = []
    for ln in t[a:b].split('\n'):
        ln2 = ln
        for x in sorted(es_only, key=len, reverse=True):
            ln2 = re.sub(r"(['\"])" + re.escape(x) + r"\1,?[ \t]*", '', ln2)
        if ln2 != ln and not ln2.strip(): continue      # the line held only Spanish themes
        newlines.append(ln2 if ln2 == ln else ln2.rstrip())
    blk = '\n'.join(newlines)
    left = [x for x in es_only if ("'" + x + "'") in blk or ('"' + x + '"') in blk]
    if left: raise SystemExit('Spanish themes left: %s' % left[:3])
    if re.search(r"['\"](?:Los|Las|El|Tus|Tú|Comer|Viajar|Celebraciones) ", blk): raise SystemExit('unlisted Spanish theme left in ORAL_THEME_GROUPS')
    t = t[:a] + blk + t[b:]
    RX(r" ?\bSP\d{3}:'[^']*',", '', None)
    if re.search(r'\bSP\d{3}:', t): raise SystemExit('SP card codes left in ORAL_CARD_GROUP')

    # ---------------------------------------------------------------- big Spanish data
    # 1. Spanish oral cards (own <script> block)
    RX(r'<script>\n// ═+\n// ORAL PRACTICE — SPANISH CARDS\n// ═+\n// ═+\n// SPANISH ORAL CARDS — Cambridge IGCSE Spanish 7160/03\n// ═+\nconst IGCSE_CARDS_ES = \[.*?\];?\n</script>\n', '', 1)
    # 2. Spanish prompts/structure hints
    cut_balanced(r'var IGCSE_PROMPTS_ES = \{', '{', '}')
    # 3. Translate & mark data: drop the top-level "es" key
    m = re.search(r'(<script type="application/json" id="tm-data">)(.*?)(</script>)', t, re.S)
    if not m: raise SystemExit('tm-data not found')
    body = m.group(2)
    k = body.index(',"es":{')
    d = json.loads(body[:k] + '}')
    if set(d) != {'fr', 'it'}: raise SystemExit('tm-data keys: %s' % list(d))
    assert set(json.loads(body)) == {'fr', 'it', 'es'}
    t = t[:m.start(2)] + body[:k] + '}' + t[m.end(2):]


    # ---------------------------------------------------------------- UI / logic (before the generic pass)
    # header + voice check + language selects
    R('Oral exam cards · 🇫🇷 🇮🇹 🇪🇸 · Audio', 'Oral exam cards · 🇫🇷 🇮🇹 · Audio')
    R("AP_VOICE.check(['fr','it','es','en'])", "AP_VOICE.check(['fr','it','en'])")
    R("langs && langs.length ? langs : ['fr', 'es', 'it']", "langs && langs.length ? langs : ['fr', 'it']", 2)   # page + embedded challenge template
    R('    <option value="es">🇪🇸 Spanish</option>\n', '', 2)
    # static landing-page markup + renderLanding()
    R('&nbsp;·&nbsp; 🇪🇸 Spanish</div>', '</div>')
    R('&nbsp;·&nbsp; 🇪🇸 150 cards</div>', ' cards</div>')
    R("  var esCount = typeof IGCSE_CARDS_ES !== 'undefined' ? IGCSE_CARDS_ES.length : 0;\n", '')
    R("🇫🇷 French &middot; 🇮🇹 Italian &middot; 🇪🇸 Spanish</div>", "🇫🇷 French &middot; 🇮🇹 Italian</div>", 2)
    R("' &middot; 🇮🇹 ' + itCount + ' &middot; 🇪🇸 ' + esCount + ' cards</div>'", "' &middot; 🇮🇹 ' + itCount + ' cards</div>'")
    # AP_LEVEL stop-word list
    RX(r"\n    es: 'el la los las lo un una unos unas[^\n]*'\n  \};", "\n  };")
    # language tables
    RX(r',\n  es: "(?:Spanish|🇪🇸|es-ES)"\n\}', '\n}', 3)
    RX(r"\['en',\s?'fr',\s?'it',\s?'es'\]", "['en','fr','it']", 13)
    RX(r"\+opt\('es',L\.es,\w+\)", '', 4)
    R("st.value = sf.value === 'en' ? 'fr' : 'es';", "st.value = sf.value === 'en' ? 'fr' : (sf.value === 'fr' ? 'it' : 'fr');")
    # Spanish speed slider in the structures drill
    R("// is the drill's target language (the non-English side) Spanish? then the speed slider sets the Spanish speed\nfunction _stRateEs() { return (toLang === 'en' ? fromLang : toLang) === 'es'; }\n", '')
    R("(_stRateEs()?window._spkRateEs:(window._spkRate||0.92))", "(window._spkRate||0.92)", 2)
    R("if(_stRateEs())window._spkRateEs=parseFloat(this.value);else window._spkRate=", "window._spkRate=")
    R("/^es/i.test(langCode) ? (window._spkRateEs || 0.75) : ", "")
    R("u.lang = /^es/i.test(langCode) ? 'es-ES' : langCode;", "u.lang = langCode;")
    R("// generous safety net (slow Spanish voice ≈ 0.75×)", "// generous safety net (slow voice ≈ 0.75×)")
    # printed phrase list: Spanish column
    R("        + '<div class=\"l-es\">'+(p.es||'')+'</div>'\n", '')
    R(".l-es{font-size:0.7rem;color:#8a6d1e;}", '')
    # oral practice: state, export, master arrays, header, filters
    R("let _filterSource = 'all';   // 'all' | 'fr' | 'it' | 'es'", "let _filterSource = 'all';   // 'all' | 'fr' | 'it'")
    R("let _lang = 'fr';            // 'fr' | 'it' | 'es'", "let _lang = 'fr';            // 'fr' | 'it'")
    R("  newHtml = replaceArray(newHtml, 'IGCSE_CARDS_ES', IGCSE_CARDS_ES);\n", '')
    RX(r"(?:_lang|lang|l) === 'es' \? IGCSE_CARDS_ES : ", '', 6)
    RX(r"_lang === 'es' \? IGCSE_PROMPTS_ES : ", '', 2)
    R("  if (_lang === 'es') return IGCSE_PROMPTS_ES;\n", '')
    R(" : _lang === 'es' ? 'es-ES' : 'fr-FR'", " : 'fr-FR'")
    R("window._spkRateEs = 0.75;   // Spanish has its own speed (default 0.75×); French / Italian keep window._spkRate\n", '')
    R(" && base !== 'es') return text;", ") return text;")
    R("u.lang = /^es/i.test(lang || '') ? 'es-ES' : (lang || 'fr-FR');", "u.lang = (lang || 'fr-FR');")
    R(" : u.lang === 'es-ES' ? (window._spkRateEs || 0.75) : (window._spkRate || 0.85);", " : (window._spkRate || 0.85);")
    R(" : lang === 'es' ? 'Cambridge 7160/03'", "")
    R("['all','fr','it','es'].forEach(src => {", "['all','fr','it'].forEach(src => {")
    R("src === 'fr' ? '🇫🇷' : src === 'it' ? '🇮🇹' : '🇪🇸'", "src === 'fr' ? '🇫🇷' : '🇮🇹'")
    R("src === 'fr' ? 'French' : src === 'it' ? 'Italian' : 'Spanish'", "src === 'fr' ? 'French' : 'Italian'")
    R("['fsrc-all','fsrc-fr','fsrc-it','fsrc-es']", "['fsrc-all','fsrc-fr','fsrc-it']")
    RX(r'        <button id="hlang-es"[^\n]*\n', '')
    R("  else if (code.startsWith('SP')) { pool = IGCSE_CARDS_ES; lang = 'es'; }\n", '')
    R(",{arr:IGCSE_CARDS_ES,l:'es'}", '')
    n_es = t.count('"origin":"es"')
    if n_es != 80 or t.count('"year":"Translated from Spanish — ') != 80: raise SystemExit('translated-from-Spanish card count %d' % n_es)
    # spoken years: Spanish season names
    RX(r"  if \(_lang === 'es'\) \{\n    const s = season === 'summer' \? 'Verano'[^\n]*\n    return s \+ ' ' \+ yr \+ '\.';\n  \}\n", '')
    # demo mode / simulation
    R("value=\"${_lang==='es' ? 0.75 : (window._spkRate||0.85)}\"", "value=\"${window._spkRate||0.85}\"")
    R("oninput=\"if(_lang==='es')window._spkRateEs=parseFloat(this.value);else window._spkRate=", "oninput=\"window._spkRate=", 2)
    R("${_lang==='es' ? '0.75×' : (window._spkRate||0.85).toFixed(2)+'×'}", "${(window._spkRate||0.85).toFixed(2)+'×'}")
    R("    : _lang === 'es' ? 'Modo demostración. Escucha las preguntas y las respuestas modelo.'\n", '')
    R("  if (_lang === 'es') window._spkRateEs = 0.75;\n", '')
    R(" : _lang === 'es' ? 'Demo completada.'", "")
    R("value=\"${_lang==='es' ? (window._spkRateEs||0.75) : 0.85}\"", "value=\"0.85\"")
    R("${_lang==='es' ? (window._spkRateEs||0.75).toFixed(2) : '0.85'}×", "0.85×")
    R(" : _lang === 'es' ? 'Tarjeta generada por inteligencia artificial.'", "")
    R(" : _lang === 'es' ? 'Tarjeta de prueba.'", "")
    R(" : _lang === 'es' ? 'Vamos a empezar la primera conversación.'", "")
    R("    : _lang === 'es' ? 'Vamos a hablar de ' + card.theme + '.'\n", '')
    R(" : _lang === 'es' ? 'Bien.'", "")
    R("_lang === 'it' ? 'Italian' : _lang === 'es' ? 'Spanish' : 'French'", "_lang === 'it' ? 'Italian' : 'French'", 2)
    R("_lang === 'it' ? '🇮🇹' : _lang === 'es' ? '🇪🇸' : '🇫🇷'", "_lang === 'it' ? '🇮🇹' : '🇫🇷'")
    # structure challenge data + embedded template
    R(", es: [IGCSE_CARDS_ES, IGCSE_PROMPTS_ES] }", " }")
    RX(r", es: \(d\.prompts\.es\[id\] \|\| \{\}\)\.hint", '')
    R('<option value=\\"es\\">🇪🇸 Spanish<\\/option>', '')
    # test maker (teacher folders / confirm dialog) and Spanish detection
    R("Spanish: 'es', Italian: 'it'", "Italian: 'it'")
    R("    if (/\\uD83C\\uDDEA\\uD83C\\uDDF8|Spanish|Español/i.test(t)) return 'S';\n", '')
    R("    'IGCSE Spanish ▸ Top Structures', 'IGCSE Spanish ▸ Vocab', 'IGCSE Spanish ▸ Verbs', 'IGCSE Spanish ▸ Approved Material', 'IGCSE Spanish ▸ Essential Phrases',\n", '')
    R("L = { F: 'French', S: 'Spanish', I: 'Italian' }[langOf(m)];", "L = { F: 'French', I: 'Italian' }[langOf(m)];")
    R("/F Block/.test(plain(m.app)) || L === 'Spanish' ? 'F Block'", "/F Block/.test(plain(m.app)) ? 'F Block'")
    R("  // AP's rule (Oct 2026): a Spanish test is most likely for F Block Spanish, even when made from an IGCSE page. Every time a Spanish link is made AP is asked to confirm the folder.\n", '')
    RX(r"  function askSpanish\(cat\) \{\n    var c = String\(cat \|\| ''\); if \(!/\^\(IGCSE\|F Block\) Spanish ▸ /\.test\(c\)\) return c;\n[^\n]*\n[^\n]*\n  \}\n", "  function askSpanish(cat) { return String(cat || ''); }   // pass-through: there is no Spanish folder in this edition\n")
    R("(/Spanish/i.test(document.title + ' ' + sum) ? 'S' : /Italian/i.test(sum) ? 'I' : 'F')", "(/Italian/i.test(sum) ? 'I' : 'F')")
    R("LN = { F: 'French', S: 'Spanish', I: 'Italian' }[L], lvl = /F Block/i.test(document.title) || LN === 'Spanish' ? 'F Block'", "LN = { F: 'French', I: 'Italian' }[L], lvl = /F Block/i.test(document.title) ? 'F Block'")
    R(", ['es', IGCSE_CARDS_ES]]", "]")
    R(", Spanish: 'ORS' }[L]", " }[L]")
    # comments in the data block
    R("French, Italian and Spanish: 10 sentences", "French and Italian: 10 sentences")
    R(',"it":{...},"es":{...}}', ',"it":{...}}')
    R(', "it": {…}, "es": {…}}', ', "it": {…}}')

    # ---------------------------------------------------------------- generic: "es" entries in JS object literals
    lines = t.split('\n')
    G = [
        (re.compile(r",[ \t]*es[ \t]*:[ \t]*'(?:[^'\\\n]|\\.)*'"), ''),          # , es:'...'
        (re.compile(r',[ \t]*es[ \t]*:[ \t]*"(?:[^"\\\n]|\\.)*"'), ''),          # , es:"..."
        (re.compile(r"(?<![\w'\"])es[ \t]*:[ \t]*'(?:[^'\\\n]|\\.)*'[ \t]*,[ \t]*"), ''),   # es:'...',  (first key)
    ]
    ng = [0, 0, 0]
    for i, ln in enumerate(lines):
        if len(ln) > 200000: continue
        for gi, (rx, rep) in enumerate(G):
            ln, n = rx.subn(rep, ln); ng[gi] += n
        lines[i] = ln
    t = '\n'.join(lines)
    log.append(('generic es entries', ng))
    return t, log

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    t = open(src, encoding='utf-8', newline='').read()
    out, log = build(t)
    open(dst, 'w', encoding='utf-8', newline='').write(out)
    print(len(t), '->', len(out))
