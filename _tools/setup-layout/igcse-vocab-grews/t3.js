const {chromium}=require('playwright');
const F=process.argv[2]||'Eton IGCSE Vocab and Gr EWs.html';
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/'+F);await p.waitForTimeout(1500);
await p.evaluate(()=>ggGoGr('fr'));await p.waitForTimeout(600);
await p.screenshot({path:'shots/g0.png',fullPage:true});
console.log(await p.evaluate(()=>[...document.querySelectorAll('#ggApp .ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+':'+b.disabled).join(' | ')));
await p.click('input[data-k="fm01"]');await p.click('input[data-k="fm03"]');await p.waitForTimeout(400);
await p.screenshot({path:'shots/g1.png',fullPage:true});
console.log(await p.evaluate(()=>[...document.querySelectorAll('#ggApp .ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+':'+b.disabled).join(' | ')));
await p.click('#ggApp .ms-drill');await p.waitForTimeout(500);
await p.screenshot({path:'shots/g2.png'});
for(let i=0;i<4;i++){await p.click('#ggApp .gg-btns .aph-btn-primary');await p.waitForTimeout(200);await p.click('#ggApp .aph-mark-btn.bad');await p.waitForTimeout(200);}
console.log('set',await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('apigg_myset_v1')).c).join(',')));
await p.evaluate(()=>ggHome());await p.waitForTimeout(400);
await p.click('#ggApp .ms-mybox .aph-chip');await p.waitForTimeout(400);
await p.screenshot({path:'shots/g3.png',fullPage:true});
console.log(await p.evaluate(()=>[...document.querySelectorAll('#ggApp .ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+':'+b.disabled).join(' | ')+' // '+document.querySelector('#ggSelBar').innerText));
await b.close();})();
