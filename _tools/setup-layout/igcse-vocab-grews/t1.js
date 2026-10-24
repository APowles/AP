const {chromium}=require('playwright');
const F=process.argv[2]||'Eton IGCSE Vocab and Gr EWs.html';
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));
p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await p.goto('file:///home/claude/ap/'+F);await p.waitForTimeout(1500);
await p.screenshot({path:'shots/v0.png'});
console.log(await p.evaluate(()=>[...document.querySelectorAll('.ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+':'+b.disabled).join(' | ')));
await p.evaluate(()=>{_ovSecs=['V2','V4'];_ovSave();_ovSelOption();renderIntro()});await p.waitForTimeout(500);
await p.screenshot({path:'shots/v1.png'});
console.log(await p.evaluate(()=>[...document.querySelectorAll('.ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+':'+b.disabled).join(' | ')));
await b.close();})();
