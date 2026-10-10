# Tolerant JS/JSON literal parser that keeps source spans.
import re, json

WS = re.compile(r'(\s+|//[^\n]*|/\*.*?\*/)+', re.S)

class Node:
    __slots__ = ('kind', 'start', 'end', 'val', 'quote', 'items')
    def __init__(s, kind, start, end, val=None, quote=None, items=None):
        s.kind, s.start, s.end, s.val, s.quote, s.items = kind, start, end, val, quote, items

def skip(s, i):
    m = WS.match(s, i)
    return m.end() if m else i

ESC = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0'}

def parse_str(s, i):
    q = s[i]; j = i + 1; out = []
    while True:
        c = s[j]
        if c == q:
            return Node('str', i, j + 1, ''.join(out), q), j + 1
        if c == '\\':
            d = s[j + 1]
            if d in ESC: out.append(ESC[d]); j += 2
            elif d == 'u':
                if s[j + 2] == '{':
                    k = s.index('}', j); out.append(chr(int(s[j + 3:k], 16))); j = k + 1
                else:
                    cp = int(s[j + 2:j + 6], 16); j += 6
                    if 0xD800 <= cp < 0xDC00 and s[j:j + 2] == '\\u':
                        lo = int(s[j + 2:j + 6], 16); cp = 0x10000 + ((cp - 0xD800) << 10) + (lo - 0xDC00); j += 6
                    out.append(chr(cp))
            elif d == 'x': out.append(chr(int(s[j + 2:j + 4], 16))); j += 4
            elif d == '\n': j += 2
            else: out.append(d); j += 2
        else:
            out.append(c); j += 1

IDENT = re.compile(r'[A-Za-z_$][\w$]*')
NUM = re.compile(r'-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?')

def parse(s, i):
    i = skip(s, i); c = s[i]
    if c in '"\'`':
        return parse_str(s, i)
    if c == '[':
        items = []; j = skip(s, i + 1)
        while s[j] != ']':
            if s[j] == ',':
                items.append(Node('hole', j, j)); j = skip(s, j + 1); continue
            n, j = parse(s, j); items.append(n); j = skip(s, j)
            if s[j] == ',': j = skip(s, j + 1)
        return Node('arr', i, j + 1, items=items), j + 1
    if c == '{':
        items = []; j = skip(s, i + 1)
        while s[j] != '}':
            if s[j] in '"\'':
                k, j = parse_str(s, j); key = k.val
            else:
                m = IDENT.match(s, j) or NUM.match(s, j); key = m.group(0); j = m.end()
            j = skip(s, j); assert s[j] == ':', (j, s[j-30:j+30]); j = skip(s, j + 1)
            n, j = parse(s, j); items.append((key, n)); j = skip(s, j)
            if s[j] == ',': j = skip(s, j + 1)
        return Node('obj', i, j + 1, items=items), j + 1
    m = NUM.match(s, i)
    if m: return Node('num', i, m.end(), val=m.group(0)), m.end()
    m = IDENT.match(s, i)
    return Node('id', i, m.end(), val=m.group(0)), m.end()

def leaves(n):
    if n.kind == 'str': yield n
    elif n.kind == 'arr':
        for x in n.items: yield from leaves(x)
    elif n.kind == 'obj':
        for k, x in n.items: yield from leaves(x)

def get(n, key):
    for k, x in n.items:
        if k == key: return x

def to_py(n):
    if n.kind == 'str': return n.val
    if n.kind == 'arr': return [to_py(x) for x in n.items]
    if n.kind == 'obj': return {k: to_py(x) for k, x in n.items}
    if n.kind == 'num': return json.loads(n.val)
    return {'true': True, 'false': False, 'null': None}.get(n.val, n.val)

def encode(v, q):
    if q == '"':
        r = json.dumps(v, ensure_ascii=False)[1:-1]
    else:
        r = v.replace('\\', '\\\\').replace(q, '\\' + q).replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
        if q == '`': r = r.replace('${', '\\${')
    r = r.replace('</', '<\\/')
    return q + r + q
