const { chromium } = require('playwright');
const U='file:///home/claude/ap/Eton Gen Essential Phrases.html';
(async()=>{
 const b=await chromium.launch();
 for (const [name,vp] of [['land',{width:1024,height:1366}],['landL',{width:1366,height:768}]]){
 const p=await b.newPage({viewport:vp});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL/.test(m.text()))errs.push('C:'+m.text())});
 p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
 await p.goto(U+'#ep=L2.01+L2.02&f=en&t=it'); await p.waitForTimeout(3500);
 console.log(name, await p.evaluate(()=>({y:scrollY, dis:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled), now:document.getElementById('gep-now').textContent, img:document.querySelector('.ms-spell img').src.length, tb:document.getElementById('gep-tiles').getBoundingClientRect().bottom, ih:innerHeight})));
 await p.screenshot({path:'shots/'+name+'.png'});
 console.log(errs);
 await p.close();}
 const p=await b.newPage({viewport:{width:1024,height:1366}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL/.test(m.text()))errs.push('C:'+m.text())});
 p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
 await p.goto(U); await p.waitForTimeout(2000);
 await p.click('#modeBtn_vocab'); await p.waitForTimeout(300);
 console.log('vocab', await p.evaluate(()=>[...document.querySelectorAll('#gep-levels .aph-chip')].map(c=>c.textContent+(c.disabled?'(x)':'')).join(',')));
 await p.click('#gep-levels .aph-chip:nth-child(6)'); await p.waitForTimeout(300);
 console.log('vocab sel', await p.evaluate(()=>document.getElementById('gep-now').textContent));
 await p.click('.ms-tile.ms-speed'); await p.waitForTimeout(800);
 await p.screenshot({path:'shots/sp1.png'});
 console.log('speed', await p.evaluate(()=>document.body.innerText.slice(0,0)+ (document.getElementById('vocabChallengeOverlay')?'ov':'?')));
 console.log(errs);
 await b.close();
})();
