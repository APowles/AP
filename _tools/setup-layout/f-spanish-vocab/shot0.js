const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/ap/Eton%20F%20Spanish%20Vocab.html'+(process.argv[3]||''));await p.waitForTimeout(2500);
await p.screenshot({path:'shots/'+(process.argv[2]||'o_start')+'.png'});
console.log(await p.evaluate(()=>[...document.querySelector('.intro-card').children].map(e=>e.tagName+'.'+e.className+':'+e.textContent.trim().slice(0,30))));
await b.close()})();
