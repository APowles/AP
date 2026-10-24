const {chromium}=require('playwright');
const F=process.argv[2]||'Eton IGCSE Vocab and Gr EWs.html';
async function run(hash,label,sel){
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log(label,'PAGEERR',e.message));
await p.goto('file:///home/claude/ap/'+F+hash);await p.waitForTimeout(2500);
console.log(label,await p.evaluate((sel)=>{const t=[...document.querySelectorAll(sel+' .ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+(b.disabled?'(off)':'')).join(',');const r=document.querySelector(sel+' .ms-tile:not([disabled])');const y=r?Math.round(r.getBoundingClientRect().bottom):-1;return t+' firstTileBottom='+y+' modal='+(document.getElementById('ov-modal')||{style:{}}).style.display},sel));
await p.screenshot({path:'shots/k_'+label+'.png'});
await b.close();}
(async()=>{
await run('#voc=V2+V4&f=en&t=fr','voc','#app');
await run('#vset=V2~6~3,V4~55~3','vset','#app');
await run('#gset=FM01_052~3,FM03_002~3&l=fr','gset','#ggApp');
await run('#gset=FM01_052~3&l=it','gsetit','#ggApp');
await run('#recap=fm01&l=fr','recap','#ggApp');
})();
