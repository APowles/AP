#!/usr/bin/env python3
"""IGCSE Top Structures: the section picker and the dropdown are grouped by the four question kinds
(Easy present, Detailed opinion, Past tense anecdote, Future / conditional speculation) plus All-purpose and
Topic-specific activities; each group holds its main list and its practice sections. Old link tokens still work.
Run from /home/claude/ap. Idempotent."""
import re
FILES = ['Eton IGCSE Structures & Oral and Writing Practice.html', 'AP All Languages - IGCSE Structures & Oral and Writing Practice.html']
NOTE_AP = "A range of activities you can refer to when describing what you did in almost any situation."
NOTE_TS = "For when the topic is very narrow, such as a work experience placement or helping the environment, where you need the actual specific things rather than all-purpose ones."
GROUPS_JS = """var ST_GROUPS = [
  { label: 'Absolute Essentials', all: 'all_essentials', test: function (s) { return s.indexOf('ess_') === 0; } },
  { label: 'Easy present', all: 'all_pr', test: function (s) { return s.indexOf('pr_') === 0; } },
  { label: 'Detailed opinion', all: 'all_k_opinion', test: function (s) { return s === 'opinion' || s.indexOf('op_') === 0; } },
  { label: 'Past tense anecdote', all: 'all_k_past', test: function (s) { return s === 'anecdote' || s.indexOf('pa_') === 0; } },
  { label: 'Future / conditional speculation', all: 'all_k_future', test: function (s) { return s === 'future' || s.indexOf('fu_') === 0; } },
  { label: 'All-purpose activities', note: %r, all: 'all_k_allpurpose', test: function (s) { return s === 'allpurpose' || s.indexOf('ap_') === 0; } },
  { label: 'Topic-specific activities', note: %r, all: 'all_k_topic', test: function (s) { return s === 'topicspecific' || s.indexOf('ts_') === 0; } }
];
// Older saved links used these group names; they still work
var ST_LEGACY = [
  { all: 'all_structures', label: 'Main Top Structures', test: function (s) { return ['opinion', 'anecdote', 'future', 'allpurpose', 'topicspecific'].indexOf(s) >= 0; } },
  { all: 'all_op', label: 'Detailed opinion: practice', test: function (s) { return s.indexOf('op_') === 0; } },
  { all: 'all_pa', label: 'Past tense anecdote: practice', test: function (s) { return s.indexOf('pa_') === 0; } },
  { all: 'all_fu', label: 'Future / conditional speculation: practice', test: function (s) { return s.indexOf('fu_') === 0; } },
  { all: 'all_ap', label: 'All-purpose activities: practice', test: function (s) { return s.indexOf('ap_') === 0; } },
  { all: 'all_ts', label: 'Topic-specific activities: practice', test: function (s) { return s.indexOf('ts_') === 0; } }
];
function _stGroupOf(p) { return ST_GROUPS.concat(ST_LEGACY).filter(function (g) { return g.all === p; })[0]; }
var ST_SECNOTE = { allpurpose: %r, topicspecific: %r };""" % (NOTE_AP, NOTE_TS, NOTE_AP, NOTE_TS)
DD_JS = """  const GROUPS = [
    { label: '— Absolute Essentials —', prefix: 'ess_', allValue: 'all_essentials' },
    { label: '— Easy present —', prefix: 'pr_', allValue: 'all_pr' },
    { label: '— Detailed opinion —', prefix: 'op_', keys: ['opinion'], allValue: 'all_k_opinion' },
    { label: '— Past tense anecdote —', prefix: 'pa_', keys: ['anecdote'], allValue: 'all_k_past' },
    { label: '— Future / conditional speculation —', prefix: 'fu_', keys: ['future'], allValue: 'all_k_future' },
    { label: '— All-purpose activities —', prefix: 'ap_', keys: ['allpurpose'], allValue: 'all_k_allpurpose' },
    { label: '— Topic-specific activities —', prefix: 'ts_', keys: ['topicspecific'], allValue: 'all_k_topic' },
  ];
"""
R = [("Eton Essentials", "Absolute Essentials"), ("Structure Phrases", "Main Top Structures"), ("Structure phrases", "Main Top Structures"),
     ("Practice: Present Tense", "Easy present: practice"), ("Practice: Short Opinions", "Detailed opinion: practice"),
     ("Practice: Past Tense Anecdotes", "Past tense anecdote: practice"), ("Practice: Future &amp; Conditional", "Future / conditional speculation: practice"),
     ("Practice: All-Purpose Activities", "All-purpose activities: practice"), ("Practice: Topic-Specific Activities", "Topic-specific activities: practice"),
     ("'10 short opinion phrases'", "'10 detailed opinion phrases'"), ("'10 future/conditional phrases'", "'10 future/conditional speculation phrases'")]
def must(s, a, b, n=1):
    assert s.count(a) == n, (a[:70], s.count(a)); return s.replace(a, b)
for f in FILES:
    s = open(f, encoding='utf-8').read()
    if 'ST_LEGACY' in s: print('already', f); continue
    for a, b in R: s = s.replace(a, b)
    # 1. the groups
    i = s.index('var ST_GROUPS = ['); j = s.index('];', i) + 2
    s = s[:i] + GROUPS_JS + s[j:]
    # 2. lookups that must also know the old tokens
    s = must(s, "var g = ST_GROUPS.filter(function (g) { return g.all === p; })[0];\n    if (g) all.filter(g.test)", "var g = _stGroupOf(p);\n    if (g) all.filter(g.test)")
    s = must(s, "function one(p) { var g = ST_GROUPS.filter(function (g) { return g.all === p; })[0]; return g ? 'All ' + g.label", "function one(p) { var g = _stGroupOf(p); return g ? 'All ' + g.label")
    s = must(s, "groups = ST_GROUPS.map(function (g) { return g.all; });", "groups = ST_GROUPS.concat(ST_LEGACY).map(function (g) { return g.all; });")
    # 3. test-maker / dropdown matching
    s = must(s, "  if (filterVal === 'all_pr') return sec.startsWith('pr_');", "  if (filterVal === 'all_pr') return sec.startsWith('pr_');\n  if (filterVal === 'all_k_opinion') return sec === 'opinion' || sec.startsWith('op_');\n  if (filterVal === 'all_k_past') return sec === 'anecdote' || sec.startsWith('pa_');\n  if (filterVal === 'all_k_future') return sec === 'future' || sec.startsWith('fu_');\n  if (filterVal === 'all_k_allpurpose') return sec === 'allpurpose' || sec.startsWith('ap_');\n  if (filterVal === 'all_k_topic') return sec === 'topicspecific' || sec.startsWith('ts_');")
    # 4. dropdown
    i = s.index("  const GROUPS = [\n    { label: '— Absolute Essentials —'"); j = s.index("  ];\n", i) + 5
    s = s[:i] + DD_JS + s[j:]
    s = must(s, "      if (group.prefix) return sec.startsWith(group.prefix);\n      if (group.keys) return group.keys.includes(sec);\n      return false;", "      return !!((group.prefix && sec.startsWith(group.prefix)) || (group.keys && group.keys.includes(sec)));")
    # 5. notes under the group heading and under the item
    s = must(s, "return { label: g.label, all: g.all, secs: all.filter(g.test) }; })", "return { label: g.label, note: g.note, all: g.all, secs: all.filter(g.test) }; })")
    a = """' <span style="color:#8899bb;font-weight:600">(' + g.secs.length + ')</span></label><div class="stp-grid">'"""
    s = must(s, a, """' <span style="color:#8899bb;font-weight:600">(' + g.secs.length + ')</span></label>' + (g.note ? '<div class="stp-note">' + g.note + '</div>' : '') + '<div class="stp-grid">'""")
    a = """_stFmt(SECTION_LABELS[s] || s) + '<small>' + _stCount(s) + '</small></span></label>'"""
    s = must(s, a, """_stFmt(SECTION_LABELS[s] || s) + '<small>' + _stCount(s) + '</small>' + (ST_SECNOTE[s] ? '<em class="stp-nt">' + ST_SECNOTE[s] + '</em>' : '') + '</span></label>'""")
    a = ".stb-prev .ph,.stp-it .ph{font-style:italic;color:#8899bb}'"
    s = must(s, a, a + "\n      + '.stp-note{font-size:.8125rem;color:#4a5a7a;margin:4px 0 0;line-height:1.35}.stp-nt{display:block;font-style:normal;font-size:.75rem;color:#6b7a99;margin-top:2px;line-height:1.3}'")
    open(f, 'w', encoding='utf-8').write(s); print('patched', f)
