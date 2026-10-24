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
  await p.evaluate(() => { amMultiTopics = [DATA()[0].subsection_en, DATA()[1].subsection_en]; currentSection = '__MULTI__'; currentSubsection = 'all'; renderIntro(); }); await p.waitForTimeout(300);
  // Spell
  await p.click('.ms-spell'); await p.waitForTimeout(300);
  await p.screenshot({ path: S('10spell') });
  await p.fill('#ms-in', 'bonjour'); await p.click('text=Check'); await p.waitForTimeout(200);
  await p.screenshot({ path: S('11spellres') });
  await p.click('#ms-res .aph-mark-btn.bad'); await p.waitForTimeout(200);
  console.log('after spell bad:', await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('apam_myset_v1')).c)));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  console.log('overlay gone:', !(await p.$('#ms-ov')), 'intro back:', !!(await p.$('.ms-tile')));
  // Match
  await p.click('.ms-match'); await p.waitForTimeout(300);
  await p.screenshot({ path: S('12match') });
  const n = (await p.$$('.ms-grid > div:first-child .ms-t')).length; 
  for (let i = 0; i < n; i++) { await p.click('#ms-e' + i); await p.click('#ms-f' + i); await p.waitForTimeout(60); }
  await p.waitForTimeout(800);
  console.log('match done text:', (await p.textContent('.ms-sheet')).slice(0, 120));
  await p.screenshot({ path: S('13matchend') });
  await p.click('#ms-ov .ms-cen .ms-b:not(.pri)'); await p.waitForTimeout(200);
  // Test
  await p.click('.ms-test'); await p.waitForTimeout(800);
  await p.screenshot({ path: S('14testpanel') });
  await p.evaluate(() => generateAMTest()); await p.waitForTimeout(300);
  console.log('answers visible by default:', await p.evaluate(() => { const e = document.getElementById('amAnsBox'); return e && getComputedStyle(e).display; }));
  await p.click('#amShowAnsBtn'); console.log('after click:', await p.evaluate(() => getComputedStyle(document.getElementById('amAnsBox')).display));
  await p.evaluate(() => toggleAMTestPanel()); await p.waitForTimeout(200);
  // Speed
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.click('.ms-speed'); await p.waitForTimeout(1200);
  console.log('speed overlay:', !!(await p.$('#apvoc-overlay')));
  await p.screenshot({ path: S('15speed') });
  await p.evaluate(() => closeVocabChallenge()); await p.waitForTimeout(200);
  // Leisure
  await p.click('.ms-leis'); await p.waitForTimeout(800);
  console.log('leisure on:', await p.evaluate(() => isLeisureMode));
  await p.screenshot({ path: S('16leisure') });
  console.log('errs', errs);
  await b.close();
})();
