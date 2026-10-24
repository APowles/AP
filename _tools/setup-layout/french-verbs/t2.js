const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/Eton%20French%20Verbs.html');await p.waitForTimeout(2500);
const st=async(l)=>console.log(l, await p.evaluate(()=>({tiles:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled?0:1).join(''),now:(document.querySelector('.ms-now')||{}).innerText, ov:!!document.getElementById('ms-ov'), drill:!!document.querySelector('.aph-qcard,.vb-sent-q')})));
await p.evaluate(()=>hmOpen('quizlet'));
await st('open');
await p.evaluate(()=>{msGrp('E1');msTense('PRESENT');});
await st('E1 present exer');
// Drill exer
await p.click('.ms-drill');await p.waitForTimeout(500);await st('drill');
await p.screenshot({path:'shots/d_exer.png'});
await p.evaluate(()=>{window.history.back&&0});
// back via aphBack
await p.evaluate(()=>aphBack());await p.waitForTimeout(300);await st('back from drill');
// spell
await p.click('.ms-spell');await p.waitForTimeout(500);await st('spell');
await p.screenshot({path:'shots/spell.png'});
await p.fill('#ms-in','je compte');await p.click('text=Check');await p.waitForTimeout(200);
await p.screenshot({path:'shots/spell2.png'});
await p.click('.aph-mark-btn.bad');await p.waitForTimeout(200);
await p.evaluate(()=>aphBack());await p.waitForTimeout(300);await st('after spell back');
console.log('LS',await p.evaluate(()=>localStorage.getItem('apfv_myset_v1')));
await p.click('.ms-match');await p.waitForTimeout(400);await p.screenshot({path:'shots/match.png'});
await p.evaluate(()=>apMsClose());
// test
await p.click('.ms-test');await p.waitForTimeout(500);await p.screenshot({path:'shots/test.png',fullPage:false});
console.log('testOut', await p.evaluate(()=>{const o=document.getElementById('testOut');return o?o.innerText.slice(0,400):'none'}));
await p.evaluate(()=>aphBack());await p.waitForTimeout(300);await st('after test back');
// speed
await p.click('.ms-speed');await p.waitForTimeout(1500);console.log('speed',await p.evaluate(()=>!!document.getElementById('apcj-overlay')));await p.screenshot({path:'shots/speed.png'});
await p.evaluate(()=>closeConjChallenge());
await b.close()})();
