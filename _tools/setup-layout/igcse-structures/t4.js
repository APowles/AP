const { chromium } = require('playwright');
const F=process.argv[2], tag=process.argv[3];
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1024,height:1366}}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
 const first=await p.evaluate(()=>0);
 await p.goto('file://'+F+'#stset=ess_when~pim174~3.ess_where~1uyg7e6~2.ess_where~zzzz~3'); await p.waitForTimeout(1800);
 console.log('cs',await p.evaluate(()=>currentSection), await p.$eval('.ms-now',e=>e.textContent), await p.$$eval('.ms-tile[disabled]',e=>e.length));
 console.log('note', await p.$$eval('.ms-note',e=>e.map(x=>x.textContent)));
 const r=await p.$eval('.ms-tiles',e=>{const b=e.getBoundingClientRect();return [b.top,b.bottom,innerHeight]}); console.log('tiles rect',r);
 await p.screenshot({path:`shots/${tag}_t4_link.png`});
 // back from drill
 await p.click('.ms-drill'); await p.waitForTimeout(400); console.log('drill meta', await p.$eval('.aph-qmeta',e=>e.textContent));
 await p.click('.aph-back'); await p.waitForTimeout(300); console.log('after back: setup?', await p.$$eval('.st-setup',e=>e.length), 'tiles', await p.$$eval('.ms-tile',e=>e.length));
 // Adjust page inside drill
 console.log(errs);
 await b.close();
})();
