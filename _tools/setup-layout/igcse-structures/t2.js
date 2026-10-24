const { chromium } = require('playwright');
const F=process.argv[2], tag=process.argv[3];
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1024,height:1366}}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
 await p.goto('file://'+F); await p.waitForTimeout(1200);
 await p.evaluate(()=>{launchStructures(); currentSection='ess_when|ess_where'; renderIntro();}); await p.waitForTimeout(300);
 // mark 4 errors in drill
 await p.click('.ms-drill'); await p.waitForTimeout(400);
 for(let i=0;i<4;i++){ await p.evaluate(()=>reveal()); await p.evaluate(()=>mark('end')); }
 await p.waitForTimeout(200);
 console.log('summary errors', await p.$$eval('.aph-revisit-item',e=>e.length), await p.evaluate(()=>majorErrors.length));
 await p.screenshot({path:`shots/${tag}_t2_a.png`});
 await p.evaluate(()=>{ goHome(); launchStructures(); }); await p.waitForTimeout(300);
 await p.click('.ms-mybox .aph-chip'); await p.waitForTimeout(300);
 console.log('cs',await p.evaluate(()=>currentSection), await p.$$eval('.ms-tile[disabled]',e=>e.map(x=>x.className)));
 await p.screenshot({path:`shots/${tag}_t2_b_myset.png`});
 // filters
 for (const f of ['3','23','due','all']) { await p.evaluate(f=>apMySetFilter(f),f); console.log('filter',f, await p.$eval('.ms-now',e=>e.textContent)); }
 // edit
 await p.click('.ms-mybox button >> text=Edit'); await p.waitForTimeout(200); await p.screenshot({path:`shots/${tag}_t2_c_edit.png`});
 await p.click('.ms-lv >> nth=0'); await p.click('.ms-lv >> nth=2'); await p.waitForTimeout(100);
 console.log('after edit', await p.$$eval('.ms-lv',e=>e.map(x=>x.textContent)).then(a=>a.join(',')));
 await p.click('#ms-ov >> text=Done'); await p.waitForTimeout(200);
 // help
 await p.click('text=? How does this work?'); await p.waitForTimeout(150); await p.screenshot({path:`shots/${tag}_t2_d_help.png`}); await p.click('#ms-ov >> text=Got it');
 // link
 await p.click('text=🔗 Save my personalised set'); await p.waitForTimeout(150); const link=await p.$eval('#ms-link',e=>e.value); console.log('link',link.slice(0,200)); await p.screenshot({path:`shots/${tag}_t2_e_link.png`}); await p.click('#ms-ov >> text=Close');
 // spell
 await p.click('.ms-spell'); await p.waitForTimeout(300); await p.fill('#ms-in','hello'); await p.click('#ms-ov >> text=Check'); await p.waitForTimeout(100); await p.screenshot({path:`shots/${tag}_t2_f_spell.png`});
 await p.click('.aph-mark-btn.ok'); await p.waitForTimeout(100); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
 // match
 await p.evaluate(()=>{currentSection='ess_when|ess_where'; renderIntro();});
 await p.click('.ms-match'); await p.waitForTimeout(300); await p.screenshot({path:`shots/${tag}_t2_g_match.png`});
 // solve match
 await p.evaluate(()=>{ for(let i=0;i<mm_len();i++){} function mm_len(){return 0} });
 await p.keyboard.press('Escape'); await p.waitForTimeout(200);
 // leisure
 await p.click('.ms-leis'); await p.waitForTimeout(500); await p.screenshot({path:`shots/${tag}_t2_h_leis.png`}); console.log('leisure', await p.$eval('.aph-qmeta',e=>e.textContent)); await p.evaluate(()=>exitLeisure()); await p.waitForTimeout(200);
 await p.evaluate(()=>launchStructures()); await p.waitForTimeout(200);
 // speed
 await p.click('.ms-speed'); await p.waitForTimeout(800); console.log('apc', await p.$$eval('#apc-overlay',e=>e.length)); await p.screenshot({path:`shots/${tag}_t2_i_speed.png`}); await p.evaluate(()=>closeStructureChallenge());
 // test
 await p.click('.ms-test'); await p.waitForTimeout(400);
 await p.evaluate(()=>generateMSTest()); await p.waitForTimeout(300);
 await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:`shots/${tag}_t2_j_test.png`});
 console.log('answers visible?', await p.evaluate(()=>{const d=document.querySelector('.ms-ansdet'); return d? d.open : 'nodet'}));
 console.log(errs);
 await b.close();
})();
