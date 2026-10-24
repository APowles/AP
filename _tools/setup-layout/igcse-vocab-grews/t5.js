const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file:///home/claude/ap/Eton IGCSE Vocab and Gr EWs.html');await p.waitForTimeout(1500);
await p.evaluate(()=>ggGoGr('fr'));await p.waitForTimeout(600);
await p.click('#ggApp input[data-k="fm01"]');await p.waitForTimeout(300);
await p.click('#ggApp .ms-spell');await p.waitForTimeout(400);
await p.fill('#ms-in','test');await p.keyboard.press('Enter');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>document.getElementById('ms-res').innerText.slice(0,100)));
await p.keyboard.press('ArrowLeft');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>document.querySelector('.ms-ov').innerText.slice(0,80)));
await p.keyboard.press('ArrowLeft');await p.waitForTimeout(200);
console.log(await p.evaluate(()=>localStorage.getItem('apigg_myset_v1')));
await b.close();})();
