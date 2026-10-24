const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/ap/Eton%20F%20Spanish%20Vocab.html');await p.waitForTimeout(2000);
console.log(await p.evaluate(()=>{document.getElementById('sel-unit').value='2A';onUnitChange();startDrill(10);return deck.length}));
await p.evaluate(()=>{goHome()});await p.waitForTimeout(200);
console.log(await p.evaluate(()=>document.querySelector('.ms-now').textContent+' '+[...document.querySelectorAll('.ms-tile')].filter(t=>t.disabled).length));
// leisure from home then Home button
await p.click('.ms-leis');await p.waitForTimeout(500);await p.evaluate(()=>lzHome());await p.waitForTimeout(200);
console.log(await p.evaluate(()=>!!document.querySelector('.ms-tile')));
await b.close()})();
