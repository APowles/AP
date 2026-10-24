const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1024, height: 1366 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file:///home/claude/ap/AP%20All%20Languages%20-%20IGCSE%20Vocab%20Essentials.html'); await p.waitForTimeout(500);
  await p.selectOption('#sel-area', 'A'); await p.click('.ms-opts summary'); await p.selectOption('#lang-to', 'es'); await p.waitForTimeout(200);
  await p.click('.ms-opts summary');
  await p.click('.ms-spell'); await p.waitForTimeout(300);
  const ans = await p.evaluate(() => sp && 0).catch(()=>0);
  await p.fill('#ms-in', '¿Qué hora es?'); await p.click('button:has-text("Check")');
  console.log(await p.evaluate(() => document.getElementById('ms-res').innerText.replace(/\n/g,' | ')));
  await p.screenshot({ path: 'shots/q_es.png' });
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
