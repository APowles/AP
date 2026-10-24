const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('dialog',d=>{console.log('  DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/Eton%20French%20Verbs.html');await p.waitForTimeout(2500);
// simulate drill link adapter: from landing
await p.evaluate(()=>{verbMode='specialist';mode='single';selectedTenses.clear();selectedTenses.add('PRESENT');_selectedCount=10;startQuickDrill(10)});await p.waitForTimeout(400);
console.log('drill',await p.evaluate(()=>!!document.querySelector('.aph-qcard')));
await p.evaluate(()=>aphBack());await p.waitForTimeout(300);
console.log('back',await p.evaluate(()=>({now:document.querySelector('.ms-now').innerText,tiles:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled?0:1).join('')})));
await p.screenshot({path:'shots/linkland.png'});
// back chain: setup -> landing
await p.evaluate(()=>aphBack());await p.waitForTimeout(300);console.log('landing',await p.evaluate(()=>!!document.querySelector('.hm-door')));
// core link
await p.evaluate(()=>{verbMode='quizlet';mode='full';vqSel=new Set(['E1','E2','I','U']);selectedTenses.clear();selectedTenses.add('FUTURE');startQuickDrill(10)});await p.waitForTimeout(400);
await p.evaluate(()=>aphBack());await p.waitForTimeout(300);
console.log('core back',await p.evaluate(()=>({now:document.querySelector('.ms-now').innerText,tiles:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled?0:1).join('')})));
// settings open + summary
await p.click('.ms-opts summary');await p.waitForTimeout(200);await p.screenshot({path:'shots/settings.png',fullPage:true});
// trial via UI
await p.evaluate(()=>{hmLand();hmOpen('quizlet');});await p.evaluate(()=>msTrial('etrials'));await p.waitForTimeout(200);await p.screenshot({path:'shots/trial.png',fullPage:true});
await p.evaluate(()=>msOwn());console.log('own',await p.evaluate(()=>document.querySelector('.ms-now').innerText));
// APDL visible check
console.log('apdl visible', await p.evaluate(()=>{var c=document.querySelector('.intro-card');return !!(c&&!c.classList.contains('ap-landing'))}));
await b.close()})();
