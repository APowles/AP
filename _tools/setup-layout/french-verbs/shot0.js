const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/ap/Eton%20French%20Verbs.html');await p.waitForTimeout(2500);
await p.screenshot({path:'shots/orig0.png'});
console.log(await p.evaluate(()=>document.body.innerText.slice(0,1500)));
await b.close()})();
