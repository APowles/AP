const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
p.on('console',m=>console.log('LOG',m.text()));
await p.goto('file:///home/claude/ap/Eton IGCSE Vocab and Gr EWs.html');await p.waitForTimeout(1500);
await p.evaluate(()=>{window.addEventListener('keydown',e=>console.log('KD',e.key,e.defaultPrevented),true);});
await p.evaluate(()=>ggGoGr('fr'));await p.waitForTimeout(600);
await p.click('#ggApp input[data-k="fm01"]');await p.waitForTimeout(300);
await p.click('#ggApp .ms-spell');await p.waitForTimeout(400);
await p.fill('#ms-in','test');await p.keyboard.press('Enter');await p.waitForTimeout(300);
console.log('ACT',await p.evaluate(()=>document.activeElement.tagName+' '+document.hasFocus()));await p.keyboard.press('x');await p.keyboard.press('ArrowLeft');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>document.querySelector('.ms-ov').innerText.slice(0,60)));
await b.close();})();
