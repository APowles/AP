const { chromium } = require('playwright');
const which = process.argv[2] || 'eton';
const base = 'file:///home/claude/ap/' + (which === 'eton' ? 'Eton%20IGCSE%20Approved%20Material%20Practice%20Sentences.html' : 'AP%20All%20Languages%20-%20IGCSE%20Approved%20Material%20Practice%20Sentences.html');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1024, height: 1366 } }); const p = await ctx.newPage();
  await ctx.route(/^https?:/, r => r.abort());
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('dialog', d => { errs.push('DIALOG ' + d.message()); d.dismiss(); });
  await p.addInitScript(() => { try { speechSynthesis.speak = () => {}; } catch (e) { } });
  await p.goto(base); await p.waitForTimeout(500);
  const S = n => `shots/${which}_t4_${n}.png`;
  await p.evaluate(() => amOpenMode('ps'));
  await p.evaluate(() => { amMultiTopics = [DATA()[0].subsection_en, DATA()[1].subsection_en]; currentSection = '__MULTI__'; currentSubsection = 'all'; renderIntro(); });
  // drill 6 cards marking 4 bad, 1 nearly, then error round and summary
  await p.click('.ms-drill'); await p.waitForTimeout(200);
  for (let i = 0; i < 4; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(100); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(100); }
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(100);
  await p.click('.aph-dbar-btn:has-text("Adjust")'); await p.waitForTimeout(200); console.log('adjust ok', !!(await p.$('text=Apply')));
  await p.evaluate(() => applyAndResume()); await p.waitForTimeout(200);
  await p.click('.aph-dbar-btn:has-text("Errors")'); await p.waitForTimeout(200); console.log('error review:', (await p.textContent('.aph-h')));
  await p.evaluate(() => goHome()); await p.waitForTimeout(200);
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('apam_myset_v1')));
  console.log('stored', Object.keys(st.c).length);
  // MY set views
  await p.click('.ms-mybox .aph-chip'); await p.waitForTimeout(200);
  for (const f of ['Hard only', 'Tricky + hard', 'Due today', 'All']) { await p.click('.ms-mybox .ms-b:has-text("' + f + '")'); await p.waitForTimeout(150); console.log(f, '->', await p.textContent('.ms-now')); }
  // drill of MY set: cards = n
  await p.click('.ms-drill'); await p.waitForTimeout(200); console.log('drill my:', await p.textContent('.aph-qmeta'));
  await p.evaluate(() => goHome()); await p.waitForTimeout(200);
  await p.click('.ms-leis'); await p.waitForTimeout(600); console.log('leisure my:', await p.evaluate(() => isLeisureMode && _lz.deck.length)); await p.evaluate(() => exitLeisure()); await p.waitForTimeout(300);
  console.log('after leisure intro:', !!(await p.$('.ms-tile')));
  // test on MY set
  await p.click('.ms-test'); await p.waitForTimeout(400); await p.evaluate(() => generateAMTest()); await p.waitForTimeout(200);
  console.log('test my first line:', (await p.textContent('#amTestOutput')).slice(0, 160).replace(/\s+/g, ' '));
  await p.evaluate(() => { try { generateAMSpotTest(); } catch (e) { } }); 
  await p.evaluate(() => toggleAMTestPanel());
  // overlays
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.click('.ms-mybox .ms-b:has-text("How does")'); await p.waitForTimeout(200); await p.screenshot({ path: S('help') }); await p.click('#ms-ov .ms-b.pri');
  await p.click('.ms-mybox .ms-b:has-text("Edit")'); await p.waitForTimeout(200); await p.screenshot({ path: S('edit') });
  await p.click('#ms-ov .ms-lv.l3 >> nth=0'); await p.waitForTimeout(100); console.log('level cycled:', await p.textContent('#ms-ov .ms-li >> nth=0'));
  await p.click('#ms-ov .ms-x'); await p.waitForTimeout(200);
  await p.click('.ms-mybox .ms-b:has-text("Save my")'); await p.waitForTimeout(200);
  const link = await p.inputValue('#ms-link'); console.log('link:', link.slice(-90)); await p.screenshot({ path: S('link') }); await p.click('#ms-ov .ms-x');
  // Speed tile disabled on MY
  console.log('speed disabled on MY:', await p.$eval('.ms-speed', e => e.disabled));
  // choose topics while MY: overview opens empty; cancel keeps MY
  await p.click('#amTopicBox'); await p.waitForTimeout(200); console.log('overview ticks:', await p.evaluate(() => amOverviewTicks.length), 'section still', await p.evaluate(() => currentSection));
  await p.evaluate(() => { document.getElementById('amTopicOverviewModal').style.display = 'none'; });
  // Back goes to hub
  await p.click('.am-home .aph-btn-sm:has-text("Back")'); await p.waitForTimeout(200); console.log('hub:', !!(await p.$('.ot-modes')));
  // link landing in a fresh context (other device)
  const ctx2 = await b.newContext({ viewport: { width: 1024, height: 1366 } }); await ctx2.route(/^https?:/, r => r.abort()); const q = await ctx2.newPage(); q.on('pageerror', e => errs.push('PAGEERR2 ' + e.message));
  await q.goto(link); await q.waitForTimeout(1500);
  console.log('landed:', await q.textContent('.ms-now'), await q.$$eval('.ms-tile', a => a.map(x => x.disabled)), 'tile y:', await q.$eval('.ms-drill', e => Math.round(e.getBoundingClientRect().top)), 'note:', (await q.textContent('.ms-mybox')).slice(0, 120));
  await q.screenshot({ path: S('landed') });
  // the old Practice hub still works with no link (fresh: nothing chosen)
  console.log('errs', errs);
  await b.close();
})();
