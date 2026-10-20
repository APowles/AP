import re, sys
def strip(s):
    n = {}
    def sub(pat, rep, key, flags=0):
        nonlocal s
        s, c = re.subn(pat, rep, s, flags=flags); n[key] = n.get(key, 0) + c
    sub(r'[ \t]*<option value="es">[^<]*</option>\n?', '', 'option')
    sub(r'<th[^>]*>\s*🇪🇸 ES\s*</th>', '', 'th')
    sub(r'[ \t]*<td[^>]*>\s*<input[^>]*data-lang="es"[^>]*>\s*</td>\n?', '', 'td')
    sub(r',\s*"es"\s*:\s*"(?:[^"\\]|\\.)*"', '', 'json-es')
    sub(r'"es"\s*:\s*"(?:[^"\\]|\\.)*"\s*,\s*', '', 'json-es-first')
    sub(r',\s*es\s*:\s*\'(?:[^\'\\\n]|\\.)*\'', '', 'js-es-sq')
    sub(r',\s*es\s*:\s*"(?:[^"\\\n]|\\.)*"', '', 'js-es-dq')
    sub(r"\['fr', 'es', 'it', 'en'\]", "['fr', 'it', 'en']", 'voicecheck')
    return s, n
if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    t = open(src, encoding='utf-8').read()
    o, n = strip(t)
    open(dst, 'w', encoding='utf-8').write(o)
    print(n, len(t), '->', len(o))
