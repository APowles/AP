const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/ap/Eton IGCSE Vocab and Gr EWs.html');await p.waitForTimeout(1200);
await p.evaluate(()=>ggGoGr('fr'));await p.waitForTimeout(800);
await p.screenshot({path:'shots/orig_gg.png',fullPage:true});
await p.evaluate(()=>{ggHome&&0});
await b.close();})();
