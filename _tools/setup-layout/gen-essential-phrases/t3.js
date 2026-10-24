const { chromium } = require('playwright');
const U='file:///home/claude/ap/Eton Gen Essential Phrases.html';
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1024,height:1366}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL/.test(m.text()))errs.push('C:'+m.text())});
 p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
 const S=async n=>p.screenshot({path:'shots/'+n+'.png'});
 // seeded personalised link
 await p.goto(U+'#gepset=L1.01~1~3_L1.01~2~3_L1.01~3~2_L1.02~1~3_L1.02~2~2_L1.03~1~3_L1.03~2~1'); await p.waitForTimeout(2500);
 console.log('seed', await p.evaluate(()=>({now:document.getElementById('gep-now').textContent, note:document.getElementById('gep-my').textContent.slice(0,200), dis:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled)})));
 await S('h1');
 await p.click('.ms-tile.ms-spell'); await p.waitForTimeout(500);
 await p.fill('#ms-in','xx'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); await S('s2');
 await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(200);
 await p.keyboard.press('Enter'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
 await p.click('.ms-x'); await p.waitForTimeout(300);
 await p.click('.ms-tile.ms-match'); await p.waitForTimeout(500); await S('x1');
 // solve match
 const ok = await p.evaluate(async()=>{ const es=[...document.querySelectorAll('[id^=ms-e]')]; for(const e of es){ const ph=ALL_PHRASES.find(x=>cleanForTTS(x.en)===e.textContent); const f=[...document.querySelectorAll('[id^=ms-f]')].find(x=>x.textContent===cleanForTTS(ph.es)); e.click(); f.click(); } await new Promise(r=>setTimeout(r,800)); return document.getElementById('ms-ov').innerText.slice(0,100).replace(/\n/g,' ')});
 console.log('match', ok); await S('x2'); await p.click('.ms-cen .ms-b:not(.pri)'); await p.waitForTimeout(300);
 await p.click('.ms-tile.ms-test'); await p.waitForTimeout(600); await S('t1');
 // generate test
 await p.evaluate(()=>generateIGCSETest()); await p.waitForTimeout(600);
 console.log('test', await p.evaluate(()=>document.getElementById('igcseTestOutput').innerText.slice(0,200).replace(/\n/g,' | ')));
 // View & print with my set
 await p.click('#gep-view button'); await p.waitForTimeout(600); await S('v1');
 console.log('view', await p.evaluate(()=>document.getElementById('studyViewContent').innerText.slice(0,150).replace(/\n/g,' | ')));
 console.log(errs);
 await b.close();
})();
