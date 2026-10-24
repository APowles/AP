const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/Eton%20Italian%20Verbs.html');await p.waitForTimeout(2500);
const W=ms=>p.waitForTimeout(ms);
await p.evaluate(()=>{hmOpen('core');msGrpSet('ALL');msTense('PRESENT');msTense('PP');msTense('INFINITIVE')});await W(300);
async function seed(kind,n){ await p.evaluate(k=>{msKind(k)},kind); await W(150); await p.click('.ms-drill'); await W(300);
  for(let i=0;i<n;i++){ await p.evaluate(()=>{ if(!revealed) mark('got'); mark('error'); }); await W(80);}
  await p.evaluate(()=>goHome()); await W(300);}
await p.evaluate(()=>{setSelectedCount(5)});
await seed('single',5);await seed('full',3);await seed('infinitives',3);
await p.evaluate(()=>msKind('sentences'));await W(150);await p.click('.ms-drill');await W(300);
for(let i=0;i<3;i++){await p.evaluate(()=>{sentReveal();sentMark('error')});await W(80)}
await p.evaluate(()=>goHome());await W(300);
console.log('stored',await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('apiv_myset_v1')).c).length), await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('apiv_myset_v1')).c).slice(0,14)));
await p.evaluate(()=>{msKind('single')});await W(200);
await p.screenshot({path:'shots/m_pre.png',fullPage:true});
await p.evaluate(()=>apMySetUse());await W(300);
await p.screenshot({path:'shots/m_my.png',fullPage:true});
console.log('MY tiles', await p.evaluate(()=>[...document.querySelectorAll('.ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+(b.disabled?'(off)':''))), await p.evaluate(()=>document.querySelector('.ms-now').textContent));
for(const k of ['full','infinitives','sentences','single']){ await p.evaluate(k=>msKind(k),k);await W(150); console.log(k, await p.evaluate(()=>document.querySelector('.ms-now').textContent)); }
for(const f of ['3','23','due','all']){ await p.evaluate(f=>apMySetFilter(f),f); console.log(f, await p.evaluate(()=>document.querySelector('.ms-now').textContent)); }
for(const k of ['single','full','infinitives','sentences']){
 await p.evaluate(k=>msKind(k),k);await W(150);
 await p.click('.ms-drill');await W(400);
 console.log('drill',k, await p.evaluate(()=>[deck.length, mode, !!document.querySelector('.aph-qcard,.vb-sent-q')]));
 await p.screenshot({path:'shots/m_drill_'+k+'.png'});
 await p.keyboard.press('ArrowLeft'); await W(100); await p.keyboard.press('ArrowRight'); await W(150);
 await p.evaluate(()=>goHome());await W(300);
}
await p.evaluate(()=>msKind('single'));
await p.click('.ms-spell');await W(500);
await p.screenshot({path:'shots/m_spell.png'});
await p.fill('#ms-in','xx');await p.click('text=Check');await W(200);
await p.screenshot({path:'shots/m_spell2.png'});
await p.click('.aph-mark-btn.bad');await W(200);
await p.keyboard.press('Escape');await W(300);
console.log('after esc', await p.evaluate(()=>!!document.getElementById('ms-ov')));
await p.click('.ms-match');await W(500);
await p.screenshot({path:'shots/m_match.png'});
await p.evaluate(()=>aphBack());await W(300);
console.log('overlay closed by Back', await p.evaluate(()=>!document.getElementById('ms-ov')));
await p.click('.ms-leis');await W(800);
await p.screenshot({path:'shots/m_leis.png'});
await p.evaluate(()=>aphBack());await W(400);
console.log('after leisure back', await p.evaluate(()=>[apHome,!!document.querySelector('.ms-card')]));
await p.evaluate(()=>apMySetEdit());await W(300);
await p.screenshot({path:'shots/m_edit.png'});
await p.evaluate(()=>apMsClose());
await p.evaluate(()=>apMySetLink());await W(300);
const link=await p.evaluate(()=>document.getElementById('ms-link').value);console.log('LINK',link.slice(0,300));
await p.evaluate(()=>apMsClose());
await p.evaluate(()=>apMySetHelp());await W(200);await p.screenshot({path:'shots/m_help.png'});await p.evaluate(()=>apMsClose());
require('fs').writeFileSync('link.txt',link);
await b.close()})();
