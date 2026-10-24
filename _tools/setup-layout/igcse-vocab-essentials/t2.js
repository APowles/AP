const { chromium } = require('playwright');
const FILE = process.argv[2] || '/home/claude/ap/Eton IGCSE Vocab Essentials.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1024, height: 1366 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/TUNNEL/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  p.on('dialog', d => { console.log('DIALOG', d.message()); d.dismiss(); });
  await p.goto('file://' + FILE); await p.waitForTimeout(600);
  const ev = f => p.evaluate(f);
  await p.selectOption('#sel-area', 'A'); await p.selectOption('#sel-section', 'A1.2');
  // set cards 10
  await p.click('.ms-opts summary'); await p.click('#ve-counts [data-n="10"]'); await p.screenshot({path:'shots/k_settings.png',fullPage:true}); await p.click('.ms-opts summary');
  // DRILL
  await p.click('.ms-drill'); await p.waitForTimeout(400);
  console.log('drill card', await ev(() => document.querySelector('.aph-qmeta') && document.querySelector('.aph-qmeta').textContent));
  await p.screenshot({ path: 'shots/c_drill.png' });
  // mark: reveal then ✗ x3, ✓ x2
  for (let i = 0; i < 5; i++) {
    await p.click('#showAnswerBtn'); await p.waitForTimeout(100);
    await p.click(i < 3 ? '.aph-mark-btn.bad' : '.aph-mark-btn.ok'); await p.waitForTimeout(100);
  }
  console.log('set after marks', await ev(() => localStorage.getItem('apve_myset_v1')));
  console.log('title', await ev(() => document.title), 'dbar', await ev(()=>document.querySelector('.aph-dbar-score')&&document.querySelector('.aph-dbar-score').textContent));
  // back to home through reload
  await p.goto('file://' + FILE); await p.waitForTimeout(500);
  console.log('after reload', await ev(() => ({ now: document.getElementById('ms-now').textContent, my: document.getElementById('ms-my').innerText.replace(/\n/g,' | ') })));
  await p.click('#ms-my .aph-chip'); await p.waitForTimeout(300);
  console.log('my chosen', await ev(() => ({ dis: [...document.querySelectorAll('.ms-tile')].map(t => t.disabled), now: document.getElementById('ms-now').textContent, area: document.getElementById('sel-area').selectedOptions[0].text, sec: document.getElementById('sel-section').selectedOptions[0].text })));
  await p.screenshot({ path: 'shots/d_my.png', fullPage: true });
  // my filters
  for (const f of ['Hard only', 'Tricky + hard', 'Due today', 'All']) { await p.click('#ms-my button:has-text("' + f + '")'); console.log(f, await ev(() => document.getElementById('ms-now').textContent)); }
  // Drill on my set
  await p.click('.ms-drill'); await p.waitForTimeout(300);
  console.log('my drill', await ev(() => document.querySelector('.aph-qmeta').textContent));
  await p.goto('file://' + FILE); await p.waitForTimeout(400);
  await p.click('#ms-my .aph-chip'); await p.waitForTimeout(200);
  // Edit
  await p.click('#ms-my button:has-text("Edit")'); await p.waitForTimeout(200);
  await p.screenshot({ path: 'shots/e_edit.png' });
  await p.click('.ms-lv.l3 >> nth=0'); console.log('lvl changed', await ev(() => document.querySelectorAll('.ms-lv.l2').length));
  await p.click('.ms-x'); await p.waitForTimeout(100);
  // Help
  await p.click('#ms-my button:has-text("How does")'); await p.waitForTimeout(100); await p.click('.ms-x');
  // Link
  await p.click('#ms-my button:has-text("Save my")'); await p.waitForTimeout(200);
  const link = await ev(() => document.getElementById('ms-link').value); console.log('link', link);
  await p.screenshot({ path: 'shots/f_link.png' }); await p.click('.ms-x');
  // Spell on my set
  await p.click('.ms-spell'); await p.waitForTimeout(300);
  await p.fill('#ms-in', 'abc'); await p.click('button:has-text("Check")'); await p.waitForTimeout(100);
  await p.screenshot({ path: 'shots/g_spell.png' });
  await p.click('.aph-mark-btn.bad'); await p.waitForTimeout(100);
  await p.click('button:has-text("Check")').catch(()=>{});
  await p.click('.ms-x'); await p.waitForTimeout(100);
  // Match on my set
  await p.click('.ms-match'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/h_match.png' });
  await p.click('.ms-x');
  // Speed disabled in my
  console.log('speed disabled in my', await ev(() => document.querySelector('.ms-speed').disabled));
  // Leisure on my
  await p.click('.ms-leis'); await p.waitForTimeout(300);
  console.log('leisure', await ev(() => document.querySelector('.lz-intro strong').textContent));
  await p.goto('file://' + FILE); await p.waitForTimeout(400);
  // Test on lists
  await p.selectOption('#sel-area', 'C'); await p.click('.ms-test'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/i_test.png' });
  await p.click('#igcseTestPanel button:has-text("Generate Test") >> nth=0'); await p.waitForTimeout(300);
  console.log('test out', await ev(() => document.getElementById('igcseTestOutput').innerText.slice(0, 300).replace(/\n/g, ' | ')));
  // Speed lists
  await p.goto('file://' + FILE); await p.waitForTimeout(400);
  await p.selectOption('#sel-area', 'C'); await p.click('.ms-speed'); await p.waitForTimeout(800);
  console.log('speed overlay', await ev(() => !!document.getElementById('apvoc-overlay')));
  await p.screenshot({ path: 'shots/j_speed.png' });
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
