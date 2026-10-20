#!/usr/bin/env python3
"""Make the 'no Spanish' twin of Eton IGCSE Approved Material Practice Sentences.html

usage: python3 make_approved.py <original.html> <twin.html>

Pattern-based (no line numbers). Every edit asserts that its pattern was found
(and, where it matters, how many times); the script fails loudly otherwise.
Leaves the `var B = '...'` build id alone.
"""
import sys, re, json

ES_FLAG = '\U0001F1EA\U0001F1F8'  # Spanish flag emoji

def die(msg):
    sys.exit('make_approved: FAILED: ' + msg)

class Ed:
    def __init__(self, t):
        self.t = t
        self.log = []

    def lit(self, old, new, min_n=1, max_n=None, label=None):
        n = self.t.count(old)
        if n < min_n or (max_n is not None and n > max_n):
            die('literal found %d times (expected %s..%s): %r' % (n, min_n, max_n, old[:90]))
        self.t = self.t.replace(old, new)
        self.log.append((label or old[:50], n))

    def rx(self, pat, new, min_n=1, max_n=None, flags=0, label=None):
        self.t, n = re.subn(pat, new, self.t, flags=flags)
        if n < min_n or (max_n is not None and n > max_n):
            die('regex matched %d times (expected %s..%s): %r' % (n, min_n, max_n, pat[:90]))
        self.log.append((label or pat[:50], n))


def dumper_for(orig, what):
    """json.dumps with whichever separators reproduce `orig` byte for byte."""
    for sep in ((',', ':'), (', ', ': ')):
        if json.dumps(json.loads(orig), ensure_ascii=False, separators=sep) == orig:
            return lambda x, sep=sep: json.dumps(x, ensure_ascii=False, separators=sep)
    die('cannot round-trip JSON for ' + what)


def strip_es_keys(o):
    """remove Spanish keys (es / *_es) from nested data, return how many"""
    n = 0
    if isinstance(o, dict):
        for k in list(o):
            if k == 'es' or k.endswith('_es'):
                del o[k]; n += 1
            else:
                n += strip_es_keys(o[k])
    elif isinstance(o, list):
        for v in o:
            n += strip_es_keys(v)
    return n


def main(src, dst):
    t = open(src, encoding='utf-8').read()
    E = Ed(t)

    # ------------------------------------------------------------------ DATA
    # 1) AM_DATA: one JSON object per line between 'const AM_DATA = [' and '];'
    m = re.search(r'const AM_DATA = \[\n(.*?)\n\];\n/\* ===== END AM_DATA', E.t, re.S)
    if not m:
        die('AM_DATA block not found')
    out = []; removed = 0
    for l in m.group(1).split('\n'):
        if not l.startswith('{"section_en"'):
            die('unexpected AM_DATA line: ' + l[:60])
        comma = ',' if l.endswith(',') else ''
        body = l[:-1] if comma else l
        d = dumper_for(body, 'AM_DATA line')
        o = json.loads(body)
        removed += strip_es_keys(o)
        out.append(d(o) + comma)
    if removed < 100:
        die('too few Spanish keys removed from AM_DATA: %d' % removed)
    E.t = E.t[:m.start(1)] + '\n'.join(out) + E.t[m.end(1):]
    E.log.append(('AM_DATA es keys', removed))

    # 2) allData (Practice Sentences)
    m = re.search(r'^const allData = (\[.*\]);$', E.t, re.M)
    if not m:
        die('allData not found')
    body = m.group(1)
    d = dumper_for(body, 'allData')
    o = json.loads(body)
    removed = strip_es_keys(o)
    if removed < 100:
        die('too few Spanish keys removed from allData: %d' % removed)
    E.t = E.t[:m.start(1)] + d(o) + E.t[m.end(1):]
    E.log.append(('allData es keys', removed))

    # 3) Studio JSON blocks
    E.rx(r'<script type="application/json" id="am-studio-data-es">.*?</script>\n', '', 1, 1, re.S, 'studio data es block')
    E.rx(r'<script type="application/json" id="am-studio-lm-es">.*?</script>\n', '', 1, 1, re.S, 'studio lm es block')
    for bid in ('am-studio-pics', 'am-studio-cmb'):
        m = re.search(r'(<script type="application/json" id="%s">)(.*?)(</script>)' % bid, E.t, re.S)
        if not m:
            die('block ' + bid + ' not found')
        d = dumper_for(m.group(2), bid)
        o = json.loads(m.group(2))
        removed = strip_es_keys(o)
        if removed < 1:
            die('no es keys in ' + bid)
        E.t = E.t[:m.start(2)] + d(o) + E.t[m.end(2):]
        E.log.append((bid + ' es keys', removed))

    # ------------------------------------------------------------------ STATIC HTML
    E.rx(r'[ \t]*<option value="es">' + ES_FLAG + r' Spanish</option>\n', '', 2, 2, label='language options')
    E.rx(r'<th style="[^"]*">' + ES_FLAG + r' ES</th>', '', 1, 1, label='ES table header')
    E.rx(r'<td style="padding:3px 6px;">\s*<input [^>]*data-lang="es"[^>]*>\s*</td>', '', 50, label='ES table cells')
    E.rx(r'<span style="[^"]*">' + ES_FLAG + r' [^<]*</span>', '', 1, label='ES line in static card snapshot')

    # ------------------------------------------------------------------ JS: lists / maps
    E.rx(r"\[\s*'en',\s*'fr',\s*'it',\s*'es'\s*\]", "['en','fr','it']", 5, label="['en','fr','it','es']")
    E.rx(r"\[\s*'fr',\s*'it',\s*'es',\s*'en'\s*\]", "['fr','it','en']", 1, label="voice check button list")
    E.rx(r"\[\s*'fr',\s*'it',\s*'es'\s*\]", "['fr', 'it']", 3, label="['fr','it','es']")
    E.rx(r"\[\s*'fr',\s*'es',\s*'it'\s*\]", "['fr', 'it']", 1, label="voice check default list")
    E.lit("['it', 'es'].filter(function (l) { return amSetLangs()", "['it'].filter(function (l) { return amSetLangs()", 1, 1, label='amSoonNote')
    E.rx(r",\s*es\s*:\s*'" + ES_FLAG + "'", '', 8, label='es flag map entries')
    E.rx(r",\s*es\s*:\s*'&#127466;&#127480;(?: Spanish)?'", '', 2, label='es flag entity entries')
    E.rx(r",\s*es\s*:\s*'Spanish'", '', 5, label='es name entries')
    E.lit(", es: sub.phrases_es || []", "", 1, 1)
    E.lit(", P.es.length", "", 1, 1)
    E.lit(", es: P.es[i]||''", "", 1, 1)
    E.lit(", es: phrase.es", "", 1, 1)
    E.lit(", es: card.es", "", 1, 1)
    E.lit(", subsection_es: x.q_es || x.q_en", "", 1, 1)
    E.lit(", phrases_es: list(x.es || x.phrases_es)", "", 1, 1)
    E.lit("phrases_en_es: list(x.en_es), ", "", 1, 1)
    E.lit(", subsection_en_es: x.q_en_es || null", "", 1, 1)
    E.lit(", es: ['am-studio-data-es', 'am-studio-lm-es']", "", 1, 1)
    E.lit(",es:'Estructuras Eton'", "", 1, 1)
    E.lit(",es:'Mira. Localiza. Habla.'", "", 1, 1)
    E.rx(r"\},\n  es: \{ code: 'es', name: 'Spanish'.*?\] \}\n\};", "}\n};", 1, 1, re.S, 'AM_STUDIO_LANGS es entry')
    # speed-challenge page template (a JS string in this file): LN / LNAME name maps are covered by the
    # "es name entries" rule above; the language chip row is covered by the ['fr','it','es'] rule.

    # ------------------------------------------------------------------ visible wording
    E.lit("then drill them in French, Italian or Spanish", "then drill them in French or Italian", 1, 1)
    E.lit("gaps, errors, word order · French, Italian, Spanish", "gaps, errors, word order · French, Italian", 1, 1)
    E.lit('"q_it": "…", "it": […], "q_es": "…", "es": […]  (a language', '"q_it": "…", "it": […]  (a language', 1, 1, label='AM_DATA comment')

    # ------------------------------------------------------------------ teacher test-maker folders (a dropdown colleagues can open)
    E.rx(r"\n    'IGCSE Spanish ▸ Top Structures', 'IGCSE Spanish ▸ Vocab', 'IGCSE Spanish ▸ Verbs', 'IGCSE Spanish ▸ Approved Material', 'IGCSE Spanish ▸ Essential Phrases',",
         '', 1, 1, label='Spanish test folders')

    # ------------------------------------------------------------------ sibling app links -> twins
    names = ['Eton A Level French VVs & Gr EWs & Grammar Translation Practice and Drills',
             'Eton A Level Oral Phrase Bank',
             'Eton IGCSE Approved Material Practice Sentences',
             'Eton IGCSE Structures & Oral and Writing Practice',
             'Eton IGCSE Vocab Essentials',
             'Eton IGCSE Vocab and Gr EWs']
    cnt = 0
    for nm in names:
        forms = {nm, nm.replace(' ', '%20'), nm.replace('&', '&amp;'), nm.replace(' ', '%20').replace('&', '%26'),
                 nm.replace(' ', '%20').replace('&', '&amp;')}
        for f in forms:
            sfx = '%20(No%20Spanish)' if '%20' in f else ' (No Spanish)'
            cnt += E.t.count(f + '.html')
            E.t = E.t.replace(f + '.html', f + sfx + '.html')
    E.log.append(('sibling links rewritten (none expected in this app)', cnt))

    # ------------------------------------------------------------------ final audit
    for pat in ('Spanish</option>', "name: 'Spanish'", 'am-studio-data-es', 'phrases_es', 'subsection_es', 'q_es"'):
        if pat in E.t:
            die('leftover pattern after edits: ' + pat)

    open(dst, 'w', encoding='utf-8').write(E.t)
    for k, n in E.log:
        print('%6d  %s' % (n, k))
    print('wrote', dst, len(E.t.encode('utf-8')), 'bytes')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
