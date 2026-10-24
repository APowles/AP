const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
const W=ms=>p.waitForTimeout(ms);
await p.goto('file:///home/claude/ap/Eton%20Italian%20Verbs.html');await W(2500);
await p.evaluate(()=>{hmOpen('core');msGrp('E1');msKind('full');msTense('PRESENT')});await W(300);
await p.click('.ms-test');await W(700);
console.log('ans hidden', await p.evaluate(()=>{var l=document.querySelectorAll('.vb-out-label');return [l.length,l[1].style.display,!!document.getElementById('ms-showans')]}));
await p.click('#ms-showans');await W(200);await p.screenshot({path:'shots/t_test_show.png'});
console.log('shown', await p.evaluate(()=>document.querySelectorAll('.vb-out-label')[1].style.display));
// Generate Test via panel button
await p.evaluate(()=>generateTest());await W(300);
console.log('regen hidden', await p.evaluate(()=>document.querySelectorAll('.vb-out-label')[1].style.display));
await p.evaluate(()=>aphBack());await W(300);
// full drill + keyboard before reveal and mark flows
await p.click('.ms-drill');await W(400);
await p.screenshot({path:'shots/t_full.png'});
await p.keyboard.press('ArrowRight');await W(200);
console.log('revealed',await p.evaluate(()=>revealed));
await p.keyboard.press('ArrowLeft');await W(300);
await p.evaluate(()=>{ while(document.querySelector('.aph-qcard')){ if(!revealed) mark('got'); mark('got'); } });await W(300);
console.log('end?',await p.evaluate(()=>!!document.querySelector('.aph-results')));
await p.screenshot({path:'shots/t_end.png'});
await p.evaluate(()=>startQuickDrill(-1));await W(300);console.log('same set again',await p.evaluate(()=>deck.length));
await p.evaluate(()=>aphBack());await W(300);console.log('back->',await p.evaluate(()=>[apHome,!!document.querySelector('.ms-card')]));
// popups: paper spot / practice paper / view&print
const [pp]=await Promise.all([ctx.waitForEvent('page',{timeout:5000}).catch(()=>null), p.evaluate(()=>hmPracticePaper('F'))]);
console.log('practice paper popup',!!pp);
await p.evaluate(()=>hmPaperSpot());await W(500);
console.log('paper spot panel',await p.evaluate(()=>!!document.getElementById('ttab-conj')));
await p.evaluate(()=>aphBack());await W(300);
await p.evaluate(()=>showVerbList());await W(300);console.log('verblist',await p.evaluate(()=>getComputedStyle(document.getElementById('verbListModal')).display));
await b.close()})();
