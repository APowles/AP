const { chromium } = require('playwright');
const FILE = process.argv[2] || '/home/claude/ap/Eton IGCSE Vocab Essentials.html';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1024, height: 1366 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/TUNNEL|autoplay/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  p.on('dialog', d => { console.log('DIALOG', d.message()); d.dismiss(); });
  const ev = f => p.evaluate(f);
  const st = () => ev(() => ({ dis: [...document.querySelectorAll('.ms-tile')].map(t => t.disabled).join(','), now: document.getElementById('ms-now').textContent, sy: window.pageYOffset, tb: Math.round(document.getElementById('ms-tiles').getBoundingClientRect().bottom), vh: innerHeight, hd: Math.round(document.querySelector('.ve-setup .aph-h').getBoundingClientRect().top) }));
  // 1. #ves link
  await p.goto('file://' + FILE + '#ves=A1.1+A1.2&m=v&f=en&t=fr'); await p.waitForTimeout(2500);
  console.log('#ves', JSON.stringify(await st())); await p.screenshot({ path: 'shots/l_ves.png' });
  // 2. #vemy link
  await p.evaluate(() => localStorage.removeItem('apve_myset_v1'));
  await p.goto('file://' + FILE + '#vemy=v~A1.1~1~3,v~A1.1~2~2,s~A1.1~5~3'); await p.waitForTimeout(1500);
  console.log('#vemy', JSON.stringify(await st()), await ev(() => document.getElementById('ms-my').innerText.replace(/\n/g, ' | ')));
  await p.screenshot({ path: 'shots/m_vemy.png' });
  // 3. choose lists modal -> custom
  await p.goto('file://' + FILE); await p.waitForTimeout(500);
  await p.click('button:has-text("Choose lists")'); await p.waitForTimeout(200);
  await p.click('#igcseTopicModal .ts-cb >> nth=0'); await p.click('#igcseTopicModal .ts-cb >> nth=1'); await p.click('#tsGo'); await p.waitForTimeout(300);
  console.log('custom', JSON.stringify(await st()), await ev(() => document.getElementById('sel-area').selectedOptions[0].text));
  // topic row click
  await p.goto('file://' + FILE); await p.waitForTimeout(500);
  await p.click('button:has-text("Choose lists")'); await p.click('#igcseTopicModal [onclick^="selectTopic(\'B\',\'B2\',\'ALL\')"]'); await p.waitForTimeout(300);
  console.log('topic', JSON.stringify(await st()));
  // vocab items toggle, swap, mix
  await p.click('#modeBtn_vocab'); await p.waitForTimeout(200); console.log('vocab', JSON.stringify(await st()));
  await p.click('.ms-opts summary'); await p.click('.aph-swap'); await p.click('#mix-row [data-m="50"]'); await p.waitForTimeout(200);
  console.log('sum', await ev(() => document.getElementById('ms-sum').textContent));
  await p.screenshot({ path: 'shots/n_set_open.png', fullPage: true });
  await p.click('.ms-opts summary');
  // drill with mix
  await p.click('.ms-drill'); await p.waitForTimeout(300); console.log('mix drill', await ev(() => document.querySelector('.aph-qmeta').textContent));
  await p.screenshot({ path: 'shots/o_drill.png' });
  // back button
  console.log('back visible', await ev(() => { const b = document.querySelector('.aph-back'); return b && getComputedStyle(b).display; }));
  // Leisure from lists
  await p.goto('file://' + FILE); await p.waitForTimeout(400);
  await p.selectOption('#sel-area', 'D'); await p.click('.ms-leis'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/p_leis.png' });
  console.log('leis', await ev(() => document.querySelector('.lz-intro strong').textContent));
  // Italian spell
  await p.goto('file://' + FILE); await p.waitForTimeout(400);
  await p.selectOption('#sel-area', 'E'); await p.click('.ms-opts summary'); await p.selectOption('#lang-to', 'it'); await p.waitForTimeout(200);
  console.log('it icons', await ev(() => [...document.querySelectorAll('.ms-img')].map(i => i.src.length)));
  await p.click('.ms-spell'); await p.waitForTimeout(200); console.log('spell it', await ev(() => document.querySelector('#ms-in').lang)); 
  // ES option (AP twin)
  console.log('has es', await ev(() => !!document.querySelector('#lang-to option[value=es]')));
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
