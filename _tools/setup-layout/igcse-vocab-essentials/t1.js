const { chromium } = require('playwright');
const FILE = process.argv[2] || '/home/claude/ap/Eton IGCSE Vocab Essentials.html';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1024, height: 1366 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + FILE); await p.waitForTimeout(800);
  await p.screenshot({ path: 'shots/a_unchosen.png', fullPage: true });
  const st = async () => p.evaluate(() => ({ dis: [...document.querySelectorAll('.ms-tile')].map(t => t.disabled), now: document.getElementById('ms-now').textContent, area: document.getElementById('sel-area').value, sum: document.getElementById('ms-sum').textContent }));
  console.log('unchosen', JSON.stringify(await st()));
  await p.selectOption('#sel-area', 'B'); await p.waitForTimeout(200);
  console.log('area B', JSON.stringify(await st()));
  await p.screenshot({ path: 'shots/b_chosen.png', fullPage: true });
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
