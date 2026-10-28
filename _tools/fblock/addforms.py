# adds the missing Present / Preterite / Future entries for the 100 core verbs to the private Verbs file (the public file is built from it)
import re, json
F = 'Eton Spanish Verbs.html'
s = open(F, encoding='utf-8').read()
core = json.loads(re.search(r"'Eton F Verbs': new Set\((\[.*?\])\)", s, re.S).group(1))
i0 = s.index('const VERBS = ') + len('const VERBS = ')
v, e = json.JSONDecoder().raw_decode(s[i0:])
have = {(x['inf'], x['tense']) for x in v}
info = {}
for x in v:
    info.setdefault(x['inf'], x)
RP = ['me', 'te', 'se', 'nos', 'os', 'se']
def endings(inf):
    return inf[-2:] if not inf.endswith('se') else inf[:-2][-2:]
def stem(inf):
    b = inf[:-2] if inf.endswith('se') else inf
    return b[:-2]
def refl(inf, forms):
    return [RP[k] + ' ' + f for k, f in enumerate(forms)] if inf.endswith('se') else forms
PRES = {'ar': ['o', 'as', 'a', 'amos', 'áis', 'an'], 'er': ['o', 'es', 'e', 'emos', 'éis', 'en'], 'ir': ['o', 'es', 'e', 'imos', 'ís', 'en']}
PRET = {'ar': ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'], 'er': ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'], 'ir': ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron']}
FUT = ['é', 'ás', 'á', 'emos', 'éis', 'án']
def pres_regular(inf, st=None):
    t = endings(inf); b = st or stem(inf)
    return [b + x for x in PRES[t]]
def stem_change(inf, a, b):   # change in persons 1,2,3,6
    base = stem(inf); t = endings(inf)
    ch = base.replace(a, b) if base.count(a) == 1 else (base[::-1].replace(a[::-1], b[::-1], 1))[::-1]
    f = pres_regular(inf)
    for k in (0, 1, 2, 5): f[k] = ch + PRES[t][k]
    return f
P = {}   # (inf) -> (forms, note)
def put(inf, forms, note): P[inf] = (forms, note)
for inf in ['llegar', 'pagar', 'buscar', 'practicar', 'tocar', 'sacar', 'cruzar', 'andar']:
    put(inf, pres_regular(inf), 'regular -AR')
put('lavarse', refl('lavarse', pres_regular('lavarse')), 'regular reflexive')
put('empezar', stem_change('empezar', 'ez', 'iez'), 'stem-changing e→ie')
put('pedir', stem_change('pedir', 'ed', 'id'), 'stem-changing e→i')
put('servir', stem_change('servir', 'erv', 'irv'), 'stem-changing e→i')
put('repetir', stem_change('repetir', 'et', 'it'), 'stem-changing e→i')
put('dormir', stem_change('dormir', 'orm', 'uerm'), 'stem-changing o→ue')
put('morir', stem_change('morir', 'or', 'uer'), 'stem-changing o→ue')
put('sentir', stem_change('sentir', 'ent', 'ient'), 'stem-changing e→ie')
put('mentir', stem_change('mentir', 'ent', 'ient'), 'stem-changing e→ie')
put('divertirse', refl('divertirse', stem_change('divertirse', 'ert', 'iert')), 'stem-changing e→ie, reflexive')
put('oír', ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'], 'fully irregular')
put('caer', ['caigo', 'caes', 'cae', 'caemos', 'caéis', 'caen'], 'irregular yo: caigo')
put('traer', ['traigo', 'traes', 'trae', 'traemos', 'traéis', 'traen'], 'irregular yo: traigo')
put('caber', ['quepo', 'cabes', 'cabe', 'cabemos', 'cabéis', 'caben'], 'irregular yo: quepo')
put('suponer', ['supongo', 'supones', 'supone', 'suponemos', 'suponéis', 'suponen'], 'irregular yo: supongo')
put('valer', ['valgo', 'vales', 'vale', 'valemos', 'valéis', 'valen'], 'irregular yo: valgo')
put('conducir', ['conduzco', 'conduces', 'conduce', 'conducimos', 'conducís', 'conducen'], 'spelling change: c→zc in yo')
put('reír', ['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen'], 'stem-changing e→i; accent on í')
put('sonreír', ['sonrío', 'sonríes', 'sonríe', 'sonreímos', 'sonreís', 'sonríen'], 'stem-changing e→i; accent on í')
PRES_NEW = P
def pret(inf):
    t = endings(inf); f = [stem(inf) + x for x in PRET[t]]
    return refl(inf, f)
PT = {
 'pensar': (pret('pensar'), 'regular -AR'), 'llamarse': (pret('llamarse'), 'regular reflexive'),
 'levantarse': (pret('levantarse'), 'regular reflexive'), 'acostarse': (pret('acostarse'), 'regular reflexive'),
 'ducharse': (pret('ducharse'), 'regular reflexive'),
 'ponerse': (refl('ponerse', ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron']), 'pretérito grave: no written accents; reflexive'),
 'valer': (pret('valer'), 'regular -ER'),
}
IRR_F = {'suponer': 'supondr', 'valer': 'valdr', 'caber': 'cabr', 'ponerse': 'pondr'}
def fut(inf):
    if inf in IRR_F:
        b = IRR_F[inf]; return refl(inf, [b + x for x in FUT]), 'irregular future stem: ' + b + '-'
    b = (inf[:-2] if inf.endswith('se') else inf).replace('í', 'i')
    f = [b + x for x in FUT]
    if inf.endswith('se'): return refl(inf, f), 'regular future; reflexive'
    return f, 'regular -' + inf[-2:].upper().replace('Í', 'I')
new = []
order = {'PRESENT': 0, 'PRETERITE': 1, 'FUTURE': 2}
for inf in sorted(core):
    base = info.get(inf)
    if not base: raise SystemExit('no base for ' + inf)
    for t in ('PRESENT', 'PRETERITE', 'FUTURE'):
        if (inf, t) in have: continue
        if t == 'PRESENT': forms, note = PRES_NEW[inf]
        elif t == 'PRETERITE': forms, note = PT[inf]
        else: forms, note = fut(inf)
        e_ = {'en': base['en'], 'tense': t, 'inf': inf, 'forms': forms, 'note': note}
        for k in ('usage_en', 'usage_es'):
            if k in base: e_[k] = base[k]
        new.append(e_)
for x in new: print(x['tense'][:3], x['inf'], x['forms'], '|', x['note'])
print(len(new))
if __import__('sys').argv[1:] == ['write']:
    end = i0 + e
    blob = ''.join(',' + json.dumps(x, ensure_ascii=False) for x in new)
    assert s[end - 1] == ']'
    s = s[:end - 1] + blob + s[end - 1:]
    open(F, 'w', encoding='utf-8').write(s); print('written')
