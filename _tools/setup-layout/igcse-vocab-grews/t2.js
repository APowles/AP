const {chromium}=require('playwright');
const F=process.argv[2]||'Eton IGCSE Vocab and Gr EWs.html';
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/'+F);await p.waitForTimeout(1500);
await p.evaluate(()=>{_ovSecs=['V2','V4'];_ovSave();_ovSelOption();renderIntro()});await p.waitForTimeout(300);
// Drill
await p.click('.ms-drill');await p.waitForTimeout(500);
await p.screenshot({path:'shots/d1.png'});
// mark 3 errors
for(let i=0;i<3;i++){await p.click('#showAnswerBtn');await p.waitForTimeout(200);await p.click('.aph-mark-btn.bad');await p.waitForTimeout(200);}
console.log('set size',await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('apigv_myset_v1')).c).length));
// go home
await p.evaluate(()=>goHome());await p.waitForTimeout(300);
console.log(await p.evaluate(()=>document.querySelector('.ms-mybox').innerText.replace(/\n/g,' | ')));
await p.click('.ms-mybox .aph-chip');await p.waitForTimeout(300);
await p.screenshot({path:'shots/m1.png'});
console.log(await p.evaluate(()=>[...document.querySelectorAll('.ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+':'+b.disabled).join(' | ')+' // '+document.querySelector('.vg-lists').innerText));
// Spell on my set
await p.click('.ms-spell');await p.waitForTimeout(400);
await p.fill('#ms-in','abc');await p.keyboard.press('Enter');await p.waitForTimeout(300);
await p.screenshot({path:'shots/s1.png'});
await p.keyboard.press('ArrowLeft');await p.waitForTimeout(200);
await p.keyboard.press('Escape');await p.waitForTimeout(300);
// Match on my set (3 items -> alert expected? needs >=3)
await p.click('.ms-match');await p.waitForTimeout(400);
await p.screenshot({path:'shots/mt1.png'});
await p.keyboard.press('Escape');await p.waitForTimeout(300);
// edit view
await p.click('text=✎ Edit');await p.waitForTimeout(300);await p.screenshot({path:'shots/e1.png'});await p.keyboard.press('Escape');await p.waitForTimeout(300);
await p.click('text=🔗 Save my personalised set');await p.waitForTimeout(300);
console.log('LINK',await p.inputValue('#ms-link'));
await p.keyboard.press('Escape');
// leisure
await p.click('.ms-leis');await p.waitForTimeout(600);await p.screenshot({path:'shots/l1.png'});
await p.evaluate(()=>goHome());await p.waitForTimeout(300);
// test panel
await p.click('.ms-test');await p.waitForTimeout(500);await p.screenshot({path:'shots/t1.png'});
await b.close();})();
