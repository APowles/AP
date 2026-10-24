const { chromium } = require('playwright');
const which = process.argv[2] || 'eton';
const url = 'file:///home/claude/ap/' + (which === 'eton' ? 'Eton%20IGCSE%20Approved%20Material%20Practice%20Sentences.html' : 'AP%20All%20Languages%20-%20IGCSE%20Approved%20Material%20Practice%20Sentences.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1366 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 200)); });
  await p.goto(url); await p.waitForTimeout(800);
  await p.screenshot({ path: `shots/${which}_0hub.png` });
  await p.evaluate(() => amOpenMode('ps')); await p.waitForTimeout(400);
  await p.screenshot({ path: `shots/${which}_1ps_blank.png`, fullPage: true });
  console.log('tiles disabled:', await p.$$eval('.ms-tile', a => a.map(x => x.disabled)));
  console.log('errs', errs);
  await b.close();
})();
