const { chromium } = require('playwright');
const U='file:///home/claude/ap/Eton Gen Essential Phrases.html';
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1024,height:1366}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL/.test(m.text()))errs.push('C:'+m.text())});
 await p.goto(U); await p.waitForTimeout(2500);
 await p.screenshot({path:'shots/a0.png',fullPage:true});
 console.log(await p.evaluate(()=>({dis:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled), now:document.getElementById('gep-now').textContent, view:document.querySelector('#gep-view button').disabled})));
 await p.click('#gep-levels .aph-chip:nth-child(1)'); await p.waitForTimeout(500);
 console.log(await p.evaluate(()=>({dis:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled), now:document.getElementById('gep-now').textContent, sum:document.getElementById('gep-sum').textContent})));
 await p.screenshot({path:'shots/a1.png',fullPage:true});
 console.log(errs);
 await b.close();
})();
