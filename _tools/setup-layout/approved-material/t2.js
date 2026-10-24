const { chromium } = require('playwright');
const which = process.argv[2] || 'eton';
const url = 'file:///home/claude/ap/' + (which === 'eton' ? 'Eton%20IGCSE%20Approved%20Material%20Practice%20Sentences.html' : 'AP%20All%20Languages%20-%20IGCSE%20Approved%20Material%20Practice%20Sentences.html');
const set = process.argv[3] || 'ps';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1024, height: 1366 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('dialog', d => { errs.push('DIALOG ' + d.message()); d.dismiss(); });
  await ctx.route(/^https?:/, r => r.abort());
  await p.addInitScript(() => { try { speechSynthesis.speak = () => {}; } catch (e) { } });
  await p.goto(url); await p.waitForTimeout(600);
  const S = n => `shots/${which}_${set}_${n}.png`;
  await p.evaluate(s => amOpenMode(s), set); await p.waitForTimeout(300);
  // choose topics through the overview
  await p.click('#amTopicBox'); await p.waitForTimeout(300);
  await p.screenshot({ path: S('2overview') });
  await p.evaluate(() => { amOverviewTicks = [DATA()[0].subsection_en, DATA()[1].subsection_en]; amOverviewUse(); }); await p.waitForTimeout(300);
  console.log('disabled after choose:', await p.$$eval('.ms-tile', a => a.map(x => x.disabled)), await p.textContent('.ms-now'));
  await p.screenshot({ path: S('3chosen') });
  // drill
  await p.click('.ms-drill'); await p.waitForTimeout(300);
  await p.screenshot({ path: S('4drill') });
  for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150); await p.click('.aph-mark-btn.bad'); await p.waitForTimeout(150); }
  console.log('S after 3 errors:', await p.evaluate(() => localStorage.getItem('apam_myset_v1')));
  await p.evaluate(() => goHome()); await p.waitForTimeout(300);
  console.log('my box:', await p.textContent('.ms-mybox'));
  await p.screenshot({ path: S('5afterdrill') });
  await p.click('.ms-mybox .aph-chip'); await p.waitForTimeout(300);
  console.log('my now:', await p.textContent('.ms-now'), await p.$$eval('.ms-tile', a => a.map(x => x.disabled)));
  await p.screenshot({ path: S('6my') });
  console.log('errs', errs);
  await b.close();
})();
