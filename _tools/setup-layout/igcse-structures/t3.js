const { chromium } = require('playwright');
const F=process.argv[2], tag=process.argv[3];
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1024,height:1366}}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
 await p.goto('file://'+F); await p.waitForTimeout(1200);
 await p.evaluate(()=>{launchStructures(); introOnDirChange; fromLang='en'; toLang='es'; currentSection='ess_when'; renderIntro();}); await p.waitForTimeout(300);
 console.log('sel opts', await p.$$eval('#intro-lang-to option',o=>o.map(x=>x.value)));
 console.log('tiles disabled', await p.$$eval('.ms-tile[disabled]',e=>e.map(x=>x.className)));
 console.log('icons', await p.$$eval('.ms-img',e=>e.map(x=>x.src.length)));
 await p.screenshot({path:`shots/${tag}_t3_es.png`});
 await p.click('.ms-match'); await p.waitForTimeout(300); await p.screenshot({path:`shots/${tag}_t3_es_match.png`}); await p.keyboard.press('Escape');
 await p.click('.ms-spell'); await p.waitForTimeout(300); console.log('spell lang', await p.$eval('#ms-in',e=>e.lang)); await p.keyboard.press('Escape');
 await p.click('.ms-drill'); await p.waitForTimeout(300); console.log('drill', await p.$eval('.aph-qmeta',e=>e.textContent)); 
 await p.evaluate(()=>{goHome();}); 
 // swap to Italian + Back button
 await p.evaluate(()=>{launchStructures(); fromLang='it'; toLang='en'; renderIntro();}); await p.waitForTimeout(200);
 console.log('it speed disabled', await p.$$eval('.ms-speed[disabled]',e=>e.length), await p.$$eval('.ms-img',e=>e[2].src.slice(0,40)));
 // direction change within settings
 await p.click('.ms-opts summary'); await p.selectOption('#intro-lang-from','fr'); await p.waitForTimeout(200); console.log('settings still open', await p.$eval('.ms-opts',e=>e.open), await p.$eval('.ms-opts summary small',e=>e.textContent));
 await p.click('text=⇄ Swap'); await p.waitForTimeout(200); console.log(await p.$eval('.ms-opts summary small',e=>e.textContent));
 console.log(errs);
 await b.close();
})();
