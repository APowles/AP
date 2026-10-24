const {chromium}=require('playwright');
const F=process.argv[2]||'Eton IGCSE Vocab and Gr EWs.html';
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/'+F);await p.waitForTimeout(1500);
await p.evaluate(()=>ggGoGr('fr'));await p.waitForTimeout(600);
await p.click('#ggApp input[data-k="fm01"]');await p.waitForTimeout(300);
await p.screenshot({path:'shots/h1.png'});
await p.click('#ggApp .ms-spell');await p.waitForTimeout(400);await p.screenshot({path:'shots/h2.png'});
await p.fill('#ms-in','test');await p.keyboard.press('Enter');await p.waitForTimeout(300);await p.screenshot({path:'shots/h3.png'});
await p.keyboard.press('ArrowLeft');await p.waitForTimeout(200);await p.keyboard.press('Escape');await p.waitForTimeout(300);
console.log('set after spell',await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('apigg_myset_v1')||'{"c":{}}').c).length));
await p.click('#ggApp .ms-match');await p.waitForTimeout(400);await p.screenshot({path:'shots/h4.png'});
for(let i=0;i<6;i++){await p.click('#ms-e'+i);await p.click('#ms-f'+i);}
await p.waitForTimeout(900);await p.screenshot({path:'shots/h5.png'});
await p.keyboard.press('Escape');await p.waitForTimeout(300);
// Test tile
await p.click('#ggApp .ms-test');await p.waitForTimeout(400);await p.screenshot({path:'shots/h6.png'});
await p.click('#ggTestRow >> text=Generate Test');await p.waitForTimeout(800);await p.screenshot({path:'shots/h7.png',fullPage:true});
await p.click('#ggTestRow >> text=Paper Spot Test');await p.waitForTimeout(800);await p.screenshot({path:'shots/h8.png',fullPage:true});
console.log('testout',await p.evaluate(()=>document.getElementById('ggTestOut').innerText.slice(0,200)));
// Speed
await p.click('#ggApp .ms-speed');await p.waitForTimeout(1500);await p.screenshot({path:'shots/h9.png'});
console.log('speed overlay',await p.evaluate(()=>!!document.getElementById('apgg-overlay')));
await b.close();})();
