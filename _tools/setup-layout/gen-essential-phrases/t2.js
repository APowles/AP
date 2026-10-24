const { chromium } = require('playwright');
const U='file:///home/claude/ap/Eton Gen Essential Phrases.html';
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1024,height:1366}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL/.test(m.text()))errs.push('C:'+m.text())});
 p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
 await p.goto(U); await p.waitForTimeout(2000);
 const S=async n=>p.screenshot({path:'shots/'+n+'.png'});
 await p.click('#gep-levels .aph-chip:nth-child(1)');
 await p.evaluate(()=>{epSetCount(10)});
 // Drill
 await p.click('.ms-tile.ms-drill'); await p.waitForTimeout(500);
 console.log('drill', await p.evaluate(()=>document.querySelector('.aph-qmeta')&&document.querySelector('.aph-qmeta').textContent));
 await p.keyboard.press('ArrowRight'); await p.waitForTimeout(200);
 await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300);
 await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft');await p.waitForTimeout(300);
 await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowDown');await p.waitForTimeout(300);
 await S('d1');
 console.log('myset', await p.evaluate(()=>JSON.stringify(localStorage.getItem('apgep_myset_v1'))));
 // end early -> error review -> home
 await p.evaluate(()=>endSessionEarly()); await p.waitForTimeout(300); await S('d2');
 await p.evaluate(()=>restart()); await p.waitForTimeout(300);
 console.log('after', await p.evaluate(()=>({now:document.getElementById('gep-now').textContent, my:document.getElementById('gep-my').textContent.slice(0,120)})));
 // personalised set
 await p.click('#gep-my .aph-chip'); await p.waitForTimeout(400);
 console.log('my on', await p.evaluate(()=>({now:document.getElementById('gep-now').textContent, dis:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled), cnt:getSelectedPhrases().length})));
 await S('m1');
 await p.click('text=Hard only'); await p.waitForTimeout(300);
 console.log('hard', await p.evaluate(()=>getSelectedPhrases().length));
 await p.click('#gep-my >> text=All'); 
 await p.click('#gep-my >> text=✎ Edit'); await p.waitForTimeout(300); await S('m2');
 await p.click('.ms-lv.l3'); await p.click('.ms-x'); await p.waitForTimeout(300);
 await p.click('#gep-my >> text=🔗 Save my personalised set'); await p.waitForTimeout(300); await S('m3');
 const link=await p.evaluate(()=>document.getElementById('ms-link').value); console.log(link.slice(-80));
 await p.click('.ms-x');
 await p.click('#gep-my >> text=? How does this work?'); await p.waitForTimeout(200); await S('m4'); await p.click('.ms-cen .ms-b.pri');
 // tiles on my set
 await p.click('.ms-tile.ms-leis'); await p.waitForTimeout(500); console.log('leis', await p.evaluate(()=>document.getElementById('app').innerText.slice(0,80).replace(/\n/g,' '))); await S('l1');
 await p.evaluate(()=>{lzStop&&lzStop(); restart();}); await p.waitForTimeout(300);
 await p.click('.ms-tile.ms-spell'); await p.waitForTimeout(500); await S('s1');
 await p.fill('#ms-in','hola'); await p.click('text=Check'); await p.waitForTimeout(300); await S('s2');
 await p.click('.aph-mark-btn.bad'); await p.waitForTimeout(200);
 await p.click('.ms-x'); await p.waitForTimeout(300);
 await p.click('.ms-tile.ms-match'); await p.waitForTimeout(500); await S('x1');
 await p.click('.ms-x'); await p.waitForTimeout(300);
 await p.click('.ms-tile.ms-test'); await p.waitForTimeout(600); await S('t1');
 console.log(errs);
 await b.close();
})();
