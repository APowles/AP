const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/Eton%20F%20Spanish%20Vocab.html');await p.waitForTimeout(2000);
await p.selectOption('#intro-sel-unit','1A');await p.waitForTimeout(200);
// drill: mark 3 errors
await p.click('.ms-drill');await p.waitForTimeout(500);
await p.screenshot({path:'shots/d1.png'});
for(let i=0;i<3;i++){await p.evaluate(()=>revealAnswer());await p.evaluate(()=>mark('err'));await p.waitForTimeout(150);}
await p.evaluate(()=>revealAnswer());await p.evaluate(()=>mark('got'));
console.log('set',await p.evaluate(()=>localStorage.getItem('apfsv_myset_v1')));
await p.evaluate(()=>goHome());await p.waitForTimeout(300);
console.log('home?',await p.evaluate(()=>!!document.querySelector('.ms-tile')));
// my set
await p.click('text=★ My personalised set');await p.waitForTimeout(300);
await p.screenshot({path:'shots/my1.png'});
console.log('tiles',await p.evaluate(()=>[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled)), await p.evaluate(()=>document.querySelector('.ms-now').textContent));
// filters
for(const f of ['Hard only','Tricky + hard','Due today','All']){await p.click('.ms-brow >> text='+f);console.log(f,await p.evaluate(()=>document.querySelector('.ms-now').textContent));}
// Drill on my
await p.click('.ms-drill');await p.waitForTimeout(400);console.log('deck',await p.evaluate(()=>deck.length));
await p.evaluate(()=>goHome());await p.waitForTimeout(200);
// Spell
await p.click('.ms-spell');await p.waitForTimeout(400);await p.screenshot({path:'shots/sp1.png'});
await p.fill('#ms-in','hola');await p.click('text=Check');await p.waitForTimeout(200);await p.screenshot({path:'shots/sp2.png'});
await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);
await p.keyboard.press('Escape');await p.waitForTimeout(200);
// Match
await p.click('.ms-match');await p.waitForTimeout(400);await p.screenshot({path:'shots/m1.png'});
console.log('match',await p.evaluate(()=>document.querySelectorAll('#ms-ov .ms-t').length));
await p.click('#ms-ov .ms-x');
// Leisure
await p.click('.ms-leis');await p.waitForTimeout(600);console.log('leis',await p.evaluate(()=>[isLeisureMode,lzDeck.length]));await p.evaluate(()=>lzHome());await p.waitForTimeout(300);
// Test
await p.click('.ms-test');await p.waitForTimeout(500);await p.screenshot({path:'shots/t1.png'});
await p.evaluate(()=>goHome());await p.waitForTimeout(300);
// Edit/help/link
await p.click('.ms-brow >> text=✎ Edit');await p.waitForTimeout(200);await p.screenshot({path:'shots/e1.png'});await p.click('#ms-ov .ms-x');
await p.click('.ms-brow >> text=🔗 Save my personalised set');await p.waitForTimeout(200);
const link=await p.inputValue('#ms-link');console.log(link);require('fs').writeFileSync('link.txt',link);
await p.click('#ms-ov .ms-x');
// View & print
await p.click('text=View & Print');await p.waitForTimeout(500);await p.screenshot({path:'shots/v1.png'});
await b.close()})();
