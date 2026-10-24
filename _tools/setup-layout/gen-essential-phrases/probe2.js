const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1024,height:1366}});
 await p.goto('file:///home/claude/ap/Eton Gen Essential Phrases.html'); await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>{
  const same=ALL_PHRASES===VOCAB_PHRASES;
  const k=a=>{const m={};let d=0;a.forEach(x=>{const q=x.sec+'~'+x.n;if(m[q])d++;m[q]=1});return d};
  return {same, dupA:k(ALL_PHRASES), dupV:k(VOCAB_PHRASES), keys:Object.keys(ALL_PHRASES[0]), s0:ALL_PHRASES[0], v0:VOCAB_PHRASES[0], ids:[...document.querySelectorAll('#phrases-app [id]')].map(e=>e.id).join(','), sp:typeof openVocabChallenge, lvl:document.querySelectorAll('.sec-level-header').length, lastTools: [...document.querySelectorAll('script[id]')].map(s=>s.id).join(',')}
 });
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
