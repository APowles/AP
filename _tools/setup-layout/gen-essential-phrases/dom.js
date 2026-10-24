const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1024,height:1366}});
 await p.goto('file:///home/claude/ap/Eton Gen Essential Phrases.html'); await p.waitForTimeout(2500);
 const h=await p.evaluate(()=>{const a=document.getElementById('app');return a.outerHTML.slice(0,300)+'\n-----\n'+document.getElementById('home-controls').outerHTML.replace(/<div id="sec-picker-list"[\s\S]*?<\/div>\s*<\/div>/,'[LIST]').slice(0,9000)});
 console.log(h);
 await b.close();
})();
