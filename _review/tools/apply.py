#!/usr/bin/env python3
"""Apply reviewer fixes item-by-item to the raw app files.
usage: apply.py FIXLIST.json [--dry]
FIXLIST = JSON array of fixes {ds,key,field,op,old,new,all,...}
Writes report to stdout and r3/apply_log.json."""
import sys, json, re, os, copy
sys.path.insert(0, os.path.dirname(__file__))
from jsl import parse, leaves, get, to_py, encode, Node

AP = '/home/claude/ap/'
OT = 'AP A Level French Oral Topics & Paper 1 Practice.html'
VV = 'AP A Level French VVs & Gr EWs & Grammar Translation Practice and Drills.html'
PB = 'AP A Level Oral Phrase Bank.html'
ST = 'AP IGCSE AP Structures & Oral and Writing Practice.html'
AM = 'AP IGCSE Approved Material Practice Sentences.html'
LI = 'AP IGCSE French Listening.html'
VE = 'AP IGCSE Vocab Essentials.html'
GE = 'AP Gen Essential Phrases.html'
FS = 'AP F Spanish Vocab.html'
IG = 'AP IGCSE Vocab and Gr EWs.html'
IGV = 'AP IGCSE Vocab and Gr EWs.html'
TS = 'AP Tests.html'
DM = 'AP Demo Spot Test.html'
TMRE = r'<script type="application/json" id="tm-data">'
# ds -> (file, [(regex, nth match)], sub-path inside literal)
CFG = {
 'ALL_TOPICS': (OT, [(r'const ALL_TOPICS = (?=\[\{)', 0)], None),
 'ORAL_CARDS': (OT, [(r'\nvar ORAL_CARDS = (?=\[)', 0)], None),
 'TOPICS_DEMO_EN': (OT, [(r'var TOPICS_DEMO_EN = (?=\{)', 0)], None),
 'TR_PASSAGES': (VV, [(r'\nconst TR_PASSAGES = (?=\[)', 0)], None),
 'MLF_DATA': (VV, [(r'\nconst MLF_DATA = (?=\[)', 0)], None),
 'ALL_PHRASES_PB': (PB, [(r'\nconst ALL_PHRASES = (?=\[)', 0)], None),
 'CARDS': (ST, [(r'\nconst CARDS = (?=\[)', 0)], None),
 'IGCSE_CARDS': (ST, [(r'const IGCSE_CARDS = (?=\[)', 0)], None),
 'IGCSE_CARDS_IT': (ST, [(r'const IGCSE_CARDS_IT = (?=\[)', 0)], None),
 'IGCSE_CARDS_ES': (ST, [(r'const IGCSE_CARDS_ES = (?=\[)', 0)], None),
 'TM_FR': (ST, [(TMRE, 0)], 'fr'), 'TM_IT': (ST, [(TMRE, 0)], 'it'), 'TM_ES': (ST, [(TMRE, 0)], 'es'),
 'AM_DATA': (AM, [(r'\nconst AM_DATA = (?=\[)', 0)], None),
 'PAPERS': (LI, [(r'\nconst PAPERS=(?=\[)', 0)], None),
 'VE_ALL_PHRASES': (VE, [(r'\nconst ALL_PHRASES = (?=\[)', 0)], None),
 'VE_VOCAB_PHRASES': (VE, [(r'\nconst VOCAB_PHRASES = (?=\[)', 0)], None),
 'GEP_PHRASES': (GE, [(r'\nconst ALL_PHRASES = (?=\[)', 0), (r'\nconst VOCAB_PHRASES = (?=\[)', 0)], None),
 'FSV_PHRASES': (FS, [(r'\nconst ALL_PHRASES = (?=\[)', 0)], None),
 'GEPV_PHRASES': (GE, [(r'\nconst ALL_PHRASES = (?=\[)', 1), (r'\nconst VOCAB_PHRASES = (?=\[)', 1)], None),
 'AM_PRACTICE': (AM, [(r'const allData = (?=\[)', 0)], None),
 'P1': (OT, [(r'<script id="p1-data"[^>]*>', 0)], None),
 'GR_SETS': (VV, [(r'const GR_SETS = (?=\[)', 0)], None),
 'GR_EWS_DATA': (VV, [(r'const GR_EWS_DATA = (?=\{)', 1)], None),
 'VV_DATA': (VV, [(r'const VV_DATA = (?=\{)', 0)], None),
 'SD_DATA': (VV, [(r'const SD_DATA = (?=\{)', 0)], None),
 'GCSE_GR_DATA': (IGV, [(r'const GCSE_GR_DATA = (?=\{)', 0)], None),
 'GCSE_IT_DATA': (IGV, [(r'const GCSE_IT_DATA = (?=\{)', 0)], None),
 'GCSE_ES_DATA': (IGV, [(r'const GCSE_ES_DATA = (?=\{)', 0)], None),
 'IGV_PHRASES': (IGV, [(r'const ALL_PHRASES = (?=\[)', 0)], None),
 'APT_DEMO': (TS, [(r'APT_DEMO\s*=\s*(?=\[)', 0)], None),
 'DEMO_ITEMS': (DM, [(r'const ITEMS\s*=\s*(?=\[)', 0)], None),
}

def locate(s, ds):
    f, pats, sub = CFG[ds]; roots = []
    for rx, nth in pats:
        m = list(re.finditer(rx, s))[nth]
        root, _ = parse(s, m.end())
        if sub: root = get(root, sub)
        roots.append(root)
    return roots

def nav(root, key):
    n = root
    for seg in str(key).split('/'):
        if n is None: return None
        n = n.items[int(seg)] if n.kind == 'arr' else get(n, seg)
    return n

def find_item(root, ds, key):
    if isinstance(key, str) and '/' in key or ds in PATHDS: return nav(root, key)
    if isinstance(key, list):
        n = root
        for p in key:
            if n is None: return None
            n = get(n, str(p)) if n.kind == 'obj' else n.items[int(p)]
        return n
    if ds == 'TOPICS_DEMO_EN': return get(root, str(key))
    if ds.startswith('TM_'):
        cid, n = str(key).rsplit('#', 1); lst = get(root, cid)
        for it in lst.items:
            nn = get(it, 'n')
            if nn is not None and str(nn.val) == n: return it
        return None
    if ds == 'PAPERS' and isinstance(key, str):
        for it in root.items:
            if get(it, 'id').val == key: return it
        return None
    return root.items[int(key)]

PATHDS = {'GR_EWS_DATA', 'VV_DATA', 'SD_DATA', 'P1', 'GCSE_GR_DATA', 'GCSE_IT_DATA', 'GCSE_ES_DATA'}

def py_nav(d, key):
    for seg in str(key).split('/'):
        d = d[int(seg)] if isinstance(d, list) else d[seg]
    return d

def py_item(data, ds, key):
    if isinstance(key, str) and '/' in key or ds in PATHDS: return py_nav(data, key)
    if isinstance(key, list):
        n = data
        for p in key: n = n[str(p)] if isinstance(n, dict) else n[int(p)]
        return n
    if ds == 'TOPICS_DEMO_EN': return data[str(key)]
    if ds.startswith('TM_'):
        cid, n = str(key).rsplit('#', 1)
        return next((it for it in data[cid] if str(it.get('n')) == n), None)
    if ds == 'PAPERS' and isinstance(key, str):
        return next(it for it in data if it['id'] == key)
    return data[int(key)]

CH = re.compile(r'chunks\[(\d+)\]')

def _norm(fixes):
    for fx in fixes:
        if isinstance(fx.get('key'), list): fx['key'] = '/'.join(str(x) for x in fx['key'])

def _sub(node, path):
    for seg in path:
        if node is None: return None
        node = node.items[int(seg)] if node.kind == 'arr' else get(node, str(seg))
    return node

def apply_all(fixes, dry=False):
    _norm(fixes)
    log = []
    byfile = {}
    for i, fx in enumerate(fixes): byfile.setdefault(CFG[fx['ds']][0], []).append((i, fx))
    for f, lst in byfile.items():
        s = open(AP + f).read()
        roots = {}
        cur = {}       # leaf.start -> current value  (per root copy)
        leafmap = {}   # leaf.start -> leaf
        inserts = []   # (pos_start, pos_end, text)
        for i, fx in lst:
            ds = fx['ds']
            if ds not in roots:
                roots[ds] = locate(s, ds)
            op = fx.get('op', 'replace'); old = fx.get('old', ''); new = fx.get('new', '')
            hits = 0; already = 0
            for root in roots[ds]:
                if fx.get('all'):
                    items = list(root.items) if root.kind == 'arr' else [x for k, x in root.items]
                else:
                    it = find_item(root, ds, fx['key']); items = [it] if it is not None else []
                for it in items:
                    if op in ('list_add', 'list_remove', 'set', 'add_field'):
                        if op == 'add_field' or (op == 'set' and _sub(it, fx['path']) is None):
                            fld = fx.get('path', [fx.get('field')])[-1] if op == 'set' else fx.get('field')
                            if get(it, fld) is not None:
                                lf = get(it, fld); cur[lf.start] = new; leafmap[lf.start] = lf; hits += 1; continue
                            st = [x for x in leaves(it)]
                            q = st[0].quote if st else '"'
                            quoted = s[it.items[0][1].start - 2:it.items[0][1].start].strip().startswith(('"', "'")) or s[skip_ws(s, it.start + 1)] in '"\''
                            kraw = (q + fld + q) if quoted else fld
                            last = it.items[-1][1]
                            inserts.append((last.end, last.end, ', ' + kraw + ': ' + encode(new, q))); hits += 1; continue
                        if op == 'set':
                            lf = _sub(it, fx['path'])
                            if lf is None or lf.kind != 'str': continue
                            if cur.get(lf.start, lf.val) == new: already += 1; continue
                            cur[lf.start] = new; leafmap[lf.start] = lf; hits += 1; continue
                        lst = _sub(it, fx['path'])
                        if lst is None or lst.kind != 'arr': continue
                        if op == 'list_add':
                            if any(x.kind == 'str' and cur.get(x.start, x.val) == new for x in lst.items): already += 1; continue
                            q = lst.items[0].quote if lst.items and lst.items[0].kind == 'str' else '"'
                            if lst.items: inserts.append((lst.items[-1].end, lst.items[-1].end, ', ' + encode(new, q)))
                            else: inserts.append((lst.start + 1, lst.start + 1, encode(new, q)))
                            hits += 1
                        else:
                            for k, x in enumerate(lst.items):
                                if x.kind == 'str' and x.val == old:
                                    if k + 1 < len(lst.items): inserts.append((x.start, lst.items[k + 1].start, ''))
                                    elif k > 0: inserts.append((lst.items[k - 1].end, x.end, ''))
                                    else: inserts.append((x.start, x.end, ''))
                                    hits += 1; break
                        continue
                    if op in ('add_alt', 'remove_reject', 'remove_alt'):
                        m = CH.search(fx.get('field', ''))
                        if not m: continue
                        ch = get(it, 'chunks').items[int(m.group(1))]
                        if op == 'add_alt':
                            alts = get(ch, 'alts')
                            if any(cur.get(x.start, x.val) == new for x in alts.items): already += 1; continue
                            q = alts.items[0].quote if alts.items else '"'
                            if alts.items:
                                inserts.append((alts.items[-1].end, alts.items[-1].end, ', ' + encode(new, q)))
                            else:
                                inserts.append((alts.start + 1, alts.start + 1, encode(new, q)))
                            hits += 1
                        else:
                            rj = get(ch, 'rejects' if op == 'remove_reject' else 'alts')
                            for k, x in enumerate(rj.items):
                                if x.val == old:
                                    if k + 1 < len(rj.items): inserts.append((x.start, rj.items[k + 1].start, ''))
                                    elif k > 0: inserts.append((rj.items[k - 1].end, x.end, ''))
                                    else: inserts.append((x.start, x.end, ''))
                                    hits += 1; break
                        continue
                    if op in ('list_add', 'list_remove'):
                        ln = it
                        try:
                            for pp in fx['path']:
                                ln = get(ln, str(pp)) if ln.kind == 'obj' else ln.items[int(pp)]
                        except Exception:
                            ln = None
                        if ln is None or ln.kind != 'arr': continue
                        if op == 'list_add':
                            if any(cur.get(x.start, x.val) == new for x in ln.items if x.kind == 'str'): already += 1; continue
                            q = next((x.quote for x in ln.items if x.kind == 'str'), '"')
                            if ln.items: inserts.append((ln.items[-1].end, ln.items[-1].end, ', ' + encode(new, q)))
                            else: inserts.append((ln.start + 1, ln.start + 1, encode(new, q)))
                            hits += 1
                        else:
                            for k, x in enumerate(ln.items):
                                if x.kind == 'str' and x.val == old:
                                    if k + 1 < len(ln.items): inserts.append((x.start, ln.items[k + 1].start, ''))
                                    elif k > 0: inserts.append((ln.items[k - 1].end, x.end, ''))
                                    else: inserts.append((x.start, x.end, ''))
                                    hits += 1; break
                        continue
                    for lf in leaves(it):
                        v = cur.get(lf.start, lf.val)
                        if old and old in v:
                            cur[lf.start] = v.replace(old, new); leafmap[lf.start] = lf; hits += 1
                        elif new and old and new in v and not (new in old):
                            already += 1
            log.append({'i': i, 'ds': ds, 'key': fx.get('key'), 'op': op, 'hits': hits, 'already': already, 'src': fx.get('_src')})
        # build edits
        edits = [(lf.start, lf.end, encode(cur[st], lf.quote)) for st, lf in leafmap.items() if cur[st] != lf.val]
        edits += inserts
        edits.sort(key=lambda e: (e[0], e[1]))
        for a, b in zip(edits, edits[1:]):
            assert a[1] <= b[0] or (a[0] == a[1] == b[0] == b[1]), ('overlap', a[:2], b[:2])
        out = []; p = 0
        for a, b, t in edits:
            out.append(s[p:a]); out.append(t); p = b
        out.append(s[p:]); s2 = ''.join(out)
        print(f, 'edits', len(edits))
        if not dry: open(AP + f, 'w').write(s2)
    return log

def skip_ws(s, i):
    while s[i] in ' \t\r\n': i += 1
    return i

def _psub(o, path):
    for seg in path:
        o = o[int(seg)] if isinstance(o, list) else o[str(seg)]
    return o

def expected(fixes, dumps):
    _norm(fixes)
    """Apply the same semantics to decoded dumps -> {ds: data}."""
    data = {ds: copy.deepcopy(d) for ds, d in dumps.items()}
    def strs(o, fn):
        if isinstance(o, list):
            for k, x in enumerate(o):
                if isinstance(x, str): o[k] = fn(x)
                else: strs(x, fn)
        elif isinstance(o, dict):
            for k, x in o.items():
                if isinstance(x, str): o[k] = fn(x)
                else: strs(x, fn)
    for fx in fixes:
        ds = fx['ds']; d = data[ds]; op = fx.get('op', 'replace'); old = fx.get('old', ''); new = fx.get('new', '')
        items = (list(d) if isinstance(d, list) else list(d.values())) if fx.get('all') else [py_item(d, ds, fx['key'])]
        for it in items:
            if it is None: continue
            if op in ('list_add', 'list_remove', 'set', 'add_field'):
                if op == 'add_field':
                    it[fx.get('field')] = new; continue
                if op == 'set':
                    try:
                        par = _psub(it, fx['path'][:-1]); par[fx['path'][-1] if isinstance(par, dict) else int(fx['path'][-1])] = new
                    except (KeyError, IndexError):
                        it[fx['path'][-1]] = new
                    continue
                lst = _psub(it, fx['path'])
                if op == 'list_add':
                    if new not in lst: lst.append(new)
                elif old in lst: lst.remove(old)
                continue
            if op in ('add_alt', 'remove_reject', 'remove_alt'):
                m = CH.search(fx.get('field', ''))
                if not m: continue
                ch = it['chunks'][int(m.group(1))]
                if op == 'add_alt':
                    if new not in ch['alts']: ch['alts'].append(new)
                elif op == 'remove_reject' and old in ch['rejects']: ch['rejects'].remove(old)
                elif op == 'remove_alt' and old in ch['alts']: ch['alts'].remove(old)
                continue
            if op in ('list_add', 'list_remove'):
                ln = it
                try:
                    for pp in fx['path']: ln = ln[str(pp)] if isinstance(ln, dict) else ln[int(pp)]
                except Exception: continue
                if op == 'list_add':
                    if new not in ln: ln.append(new)
                elif old in ln: ln.remove(old)
                continue
            if old: strs(it, lambda v: v.replace(old, new) if old in v else v)
    return data

if __name__ == '__main__':
    fixes = json.load(open(sys.argv[1]))
    log = apply_all(fixes, dry='--dry' in sys.argv)
    json.dump(log, open(os.path.join(os.path.dirname(__file__), 'apply_log.json'), 'w'), indent=0)
    bad = [l for l in log if l['hits'] == 0]
    print('fixes', len(log), 'applied', sum(1 for l in log if l['hits']), 'unmatched', len(bad), 'of which already-present', sum(1 for l in bad if l['already']))
