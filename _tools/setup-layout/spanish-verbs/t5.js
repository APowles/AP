const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
const W=ms=>p.waitForTimeout(ms);
await p.goto('file:///home/claude/ap/Eton%20Spanish%20Verbs.html');await W(2500);
// teacher key button visibility
await p.evaluate(()=>localStorage.setItem('apTeacherKey','x'));
await p.evaluate(()=>{goHome();hmOpen('all')});await W(300);
await p.click('text=Specialist Verb Structures');await W(200);
await p.evaluate(()=>msTense('PRESENT'));await W(200);
await p.evaluate(()=>{document.querySelector('.ms-opts').open=true});
await p.evaluate(()=>msKind('single'));await W(300);
await p.screenshot({path:'shots/a_all.png',fullPage:true});
console.log('apdl btn (normal):', await p.evaluate(()=>!!document.getElementById('apdl-btn')));
await W(1200);
console.log('apdl btn (normal, after tick):', await p.evaluate(()=>!!document.getElementById('apdl-btn')));
// drill again
await p.click('.ms-drill');await W(400);
await p.evaluate(()=>{revealSingle();mark('got')});
// finish deck
await p.evaluate(()=>{for(let i=0;i<30;i++){ if(document.querySelector('.aph-results')) break; if(!revealed) { try{revealSingle()}catch(e){} } mark('got'); }});await W(300);
await p.screenshot({path:'shots/a_end.png'});
await p.click('.btn-same-set');await W(300);
console.log('same set again ok', await p.evaluate(()=>!!document.querySelector('.aph-qcard')));
await p.evaluate(()=>goHome());await W(300);
// leisure normal
await p.click('.ms-leis');await W(1000);
console.log('leisure', await p.evaluate(()=>!!document.getElementById('lzCard')));
await p.evaluate(()=>aphBack());await W(300);
console.log('back from leisure', await p.evaluate(()=>[apHome,!!document.querySelector('.ms-card'),isLeisureMode]));
// sentences test tile
await p.evaluate(()=>msKind('sentences'));await W(200);
await p.click('.ms-test');await W(800);
await p.screenshot({path:'shots/a_senttest.png'});
// spell on normal
await p.evaluate(()=>{document.getElementById('testPanel').style.display='none';msKind('single')});await W(200);
await p.click('.ms-spell');await W(400);
await p.screenshot({path:'shots/a_spell.png'});
await p.evaluate(()=>apMsClose());
// derive: simulate link apply
await p.evaluate(()=>{hmLand();});await W(200);
await p.evaluate(()=>{ verbSetFilter='Eton F Verbs'; mode='single'; selectedTenses=new Set(['PRESENT']); startQuickDrill(10)});await W(300);
await p.evaluate(()=>goHome());await W(300);
console.log('derived tiles live', await p.evaluate(()=>[apHome,[...document.querySelectorAll('.ms-tile')].filter(b=>!b.disabled).length, document.querySelector('.ms-now').textContent]));
await b.close()})();
