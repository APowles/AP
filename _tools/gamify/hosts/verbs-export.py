#!/usr/bin/env python3
"""One-line, behaviour-neutral export so Gamify it can read the same cards Spell it / Match it use."""
import sys
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read()
    if 'window.apPickItems' in s: print('already',f); continue
    a="    return items;\n  }\n  function label() { return selText(); }"
    assert s.count(a)==1,(f,s.count(a))
    s=s.replace(a,"    return items;\n  }\n  window.apPickItems = pickItems;\n  function label() { return selText(); }")
    open(f,'w',encoding='utf-8').write(s);print('exported',f)
