const { chromium } = require('playwright');
const F=process.argv[2], tag=process.argv[3];
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1024,height:1366}}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
 await p.goto('file://'+F); await p.waitForTimeout(1200);
 await p.evaluate(()=>launchStructures()); await p.waitForTimeout(400);
 await p.screenshot({path:`shots/${tag}_1_unchosen.png`});
 console.log('disabled tiles', await p.$$eval('.ms-tile[disabled]',e=>e.length), 'cs', await p.evaluate(()=>currentSection));
 // choose a section via picker
 await p.evaluate(()=>introPickSections()); await p.waitForTimeout(300);
 console.log('picker sel', await p.evaluate(()=>_stPick.sel.length));
 await p.screenshot({path:`shots/${tag}_2_picker.png`});
 await p.evaluate(()=>{_stPickOne('ess_when',true);_stPickOne('ess_where',true);_stPickDone();}); await p.waitForTimeout(300);
 console.log('after choose cs',await p.evaluate(()=>currentSection),'disabled', await p.$$eval('.ms-tile[disabled]',e=>e.length));
 await p.screenshot({path:`shots/${tag}_3_chosen.png`});
 await p.click('.ms-opts summary'); await p.waitForTimeout(200);
 await p.screenshot({path:`shots/${tag}_4_settings.png`});
 await p.click('.ms-opts summary');
 // drill: mark 3 errors
 await p.click('.ms-drill'); await p.waitForTimeout(500);
 for(let i=0;i<3;i++){ await p.evaluate(()=>reveal()); await p.evaluate(()=>mark('end')); await p.waitForTimeout(100);}
 await p.screenshot({path:`shots/${tag}_5_drill.png`});
 console.log('myset', await p.evaluate(()=>localStorage.getItem('apis_myset_v1')), 'majorErrors', await p.evaluate(()=>majorErrors.length));
 await p.evaluate(()=>{ idx=deck.length; renderSummary(); });
 await p.waitForTimeout(200);
 await p.screenshot({path:`shots/${tag}_6_summary.png`});
 await p.evaluate(()=>goHome()); await p.waitForTimeout(200); await p.evaluate(()=>launchStructures()); await p.waitForTimeout(300);
 await p.screenshot({path:`shots/${tag}_7_back.png`});
 console.log(errs);
 await b.close();
})();
