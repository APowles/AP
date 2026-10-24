const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/Eton%20Spanish%20Verbs.html');await p.waitForTimeout(2500);
const W=ms=>p.waitForTimeout(ms);
await p.evaluate(()=>{goHome();hmOpen('core');msGrpSet('ALL');msTense('PRESENT')});await W(300);
// drill single: mark errors
await p.click('.ms-drill');await W(500);
await p.screenshot({path:'shots/d_single.png'});
await p.evaluate(()=>{mark('got')});// reveal
await p.evaluate(()=>{mark('error')});await W(200);
await p.evaluate(()=>{mark('got');mark('error')});await W(200);
console.log('S',await p.evaluate(()=>localStorage.getItem('apsv_myset_v1')));
// Back from drill
await p.click('.aph-back');await W(400);
console.log('after back from drill:',await p.evaluate(()=>[apHome,!!document.querySelector('.ms-card')]));
// full mode
await p.evaluate(()=>msKind('full'));await W(200);
await p.click('.ms-drill');await W(400);
await p.evaluate(()=>{mark('got');mark('error')});await W(200);
await p.screenshot({path:'shots/d_full.png'});
await p.evaluate(()=>{goHome()});await W(300);
await p.evaluate(()=>msKind('inf'));await W(200);
await p.click('.ms-drill');await W(400);
await p.evaluate(()=>{mark('got');mark('error')});await W(200);
await p.evaluate(()=>{goHome()});await W(300);
await p.evaluate(()=>{msKind('sentences')});await W(200);
console.log('sent tiles', await p.evaluate(()=>[...document.querySelectorAll('.ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+(b.disabled?'(off)':''))));
await p.click('.ms-drill');await W(400);
await p.screenshot({path:'shots/d_sent.png'});
await p.evaluate(()=>{sentReveal()});await W(200);
await p.evaluate(()=>{sentMark('error')});await W(200);
console.log('S',await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('apsv_myset_v1')).c)));
await p.evaluate(()=>{goHome()});await W(300);
await b.close()})();
