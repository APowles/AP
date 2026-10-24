const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1024,height:1366}})).newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/AP All Languages - IGCSE Vocab and Gr EWs.html');await p.waitForTimeout(1500);
await p.evaluate(()=>{document.getElementById('lang-from').value='en';document.getElementById('lang-to').value='es';_ovSecs=['V2'];_ovSave();_ovSelOption();renderIntro()});await p.waitForTimeout(300);
await p.click('#app .ms-match');await p.waitForTimeout(400);await p.screenshot({path:'shots/es.png'});await p.keyboard.press('Escape');
await p.evaluate(()=>ggGoGr('it'));await p.waitForTimeout(500);
await p.click('#ggApp input[type=checkbox]');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>[...document.querySelectorAll('#ggApp .ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+(b.disabled?'(off)':'')).join(',')));
await p.click('#ggApp .ms-spell');await p.waitForTimeout(400);console.log(await p.evaluate(()=>document.querySelector('.ms-ov').innerText.slice(0,60)));
await b.close();})();
