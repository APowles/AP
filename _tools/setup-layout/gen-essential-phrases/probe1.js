const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1024,height:1366}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text())});
 await p.goto('file:///home/claude/ap/Eton Gen Essential Phrases.html'); await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>({ck:[...document.querySelectorAll('.sec-checkbox:checked')].map(c=>c.value), tot:document.querySelectorAll('.sec-checkbox').length, mode:vocabMode, cnt:document.getElementById('phrase-count').textContent, start:document.getElementById('startCount').textContent, sp:document.getElementById('sec-pick-count').textContent, lf:getLangFrom(), lt:getLangTo(), sel:getSelectedPhrases().length, all:ALL_PHRASES.length, voc:VOCAB_PHRASES.length}));
 console.log(JSON.stringify(r)); console.log(errs);
 await p.screenshot({path:'/tmp/claude-0/-home-claude/9c4dbe2e-b9a1-5b06-b679-000e2edc1652/scratchpad/s0.png',fullPage:true});
 await b.close();
})();
