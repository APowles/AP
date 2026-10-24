const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('dialog',d=>{console.log('  DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/Eton%20French%20Verbs.html');await p.waitForTimeout(2500);
const info=async()=>await p.evaluate(()=>({tiles:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled?0:1).join(''),now:((document.querySelector('.ms-now')||{}).innerText||'').slice(0,110),ov:!!document.getElementById('ms-ov'),qc:!!document.querySelector('.aph-qcard,.vb-sent-q,#lzCard'),tp:!!document.getElementById('testPanelMarker')}));
async function tryTile(name,sel,kind){
  await p.click(sel);await p.waitForTimeout(500);const i=await info();
  console.log('   ',kind,name,JSON.stringify({ov:i.ov,qc:i.qc,tp:i.tp}));
  if(i.ov)await p.evaluate(()=>apMsClose());
  else if(name==='speed'){await p.evaluate(()=>closeConjChallenge());}
  else { await p.evaluate(()=>aphBack()); await p.waitForTimeout(300);}
  const j=await info(); if(!j.tiles.includes('1')&&i.tiles!=='000000')console.log('   BACK BROKE',JSON.stringify(j));
}
for (const door of ['all','quizlet']){
  await p.evaluate(d=>{hmLand&&hmLand();hmOpen(d)},door);
  if(door==='all'){ await p.evaluate(()=>{msPickSet('both');msTense('PRESENT');msTense('PASSE_COMPOSE');msTense('INFINITIVE')}); }
  else await p.evaluate(()=>{msGrp('E2');msTense('INFINITIVE');msTense('PRESENT');msTense('PASSE_COMPOSE')});
  const kinds=door==='all'?['full','single','infinitives','sentences']:['exer','full','infinitives','sentences'];
  for(const k of kinds){
    await p.evaluate(k=>msKind(k),k);const i=await info();console.log(door,k,JSON.stringify(i));
    for(const [n,s] of [['drill','.ms-drill'],['spell','.ms-spell'],['match','.ms-match'],['leis','.ms-leis'],['test','.ms-test']]){
      const dis=await p.evaluate(s=>document.querySelector(s).disabled,s); if(dis){console.log('   (disabled)',n);continue;}
      await tryTile(n,s,k);
    }
  }
}
await b.close()})();
