const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
async function pg(url){const c=await b.newContext({viewport:{width:1024,height:1366}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});await p.goto(url);await p.waitForTimeout(2200);return p;}
const base='file:///home/claude/ap/Eton%20F%20Spanish%20Vocab.html';
// 1 personalised link on fresh browser
let p=await pg(base+'#fvset=1A.1~27~3,1A.1~4~2,9Z.9~1~3');
console.log('fvset', await p.evaluate(()=>[document.querySelector('.ms-now').textContent, [...document.querySelectorAll('.ms-tile')].map(t=>t.disabled).join(), document.querySelector('.ms-mybox').textContent.slice(0,200)]));
await p.screenshot({path:'shots/l1.png'});
// generate test on my set
await p.click('.ms-test');await p.waitForTimeout(400);
await p.evaluate(()=>generateSVTest());await p.waitForTimeout(500);
console.log('test out',await p.evaluate(()=>document.body.innerText.includes('My personalised set')));
await p.screenshot({path:'shots/l2.png'});
// 2 #sv= link
p=await pg(base+'#sv=0.1+0.2&d=es&mx=50');
console.log('sv', await p.evaluate(()=>[typeof selectedSections!=='undefined'&&selectedSections.size, !!document.querySelector('#svTopicOverviewModal') && document.getElementById('svTopicOverviewModal').style.display]));
await p.screenshot({path:'shots/l3.png'});
await p.evaluate(()=>ovCloseModal());await p.waitForTimeout(300);
console.log('after close', await p.evaluate(()=>[document.querySelector('.ms-now').textContent,[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled).join()]));
await p.screenshot({path:'shots/l4.png'});
// speed tile
await p.click('.ms-speed');await p.waitForTimeout(1500);await p.screenshot({path:'shots/sp.png'});
console.log('speed overlay',await p.evaluate(()=>!!document.getElementById('apspv-overlay')));
await p.evaluate(()=>closeSpanishChallenge());
// level chips + section
p=await pg(base);
await p.selectOption('#intro-sel-unit','3A');await p.waitForTimeout(200);
await p.selectOption('#intro-sel-section','ALL_3A');await p.waitForTimeout(200);
console.log('3A all', await p.evaluate(()=>document.querySelector('.ms-now').textContent));
await p.click('.cog-row >> text=Hard');await p.waitForTimeout(200);
console.log('hard', await p.evaluate(()=>document.querySelector('.ms-now').textContent));
await p.click('.cog-row >> text=Mixed');
await p.click('.ms-opts summary');await p.waitForTimeout(200);await p.screenshot({path:'shots/set.png'});
await p.click('.ms-opts >> text=50–50');await p.waitForTimeout(200);
console.log('sum',await p.evaluate(()=>document.querySelector('.ms-opts small').textContent+' open='+document.querySelector('.ms-opts').open));
await p.click('.ms-opts >> text=20');
await p.click('.ms-opts #autotimeBtn');console.log('sum',await p.evaluate(()=>document.querySelector('.ms-opts small').textContent));
// choose several topics
await p.click('text=Choose several topics');await p.waitForTimeout(400);await p.screenshot({path:'shots/ov.png'});
await b.close()})();
