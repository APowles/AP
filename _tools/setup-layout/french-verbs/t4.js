const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('dialog',d=>{console.log('  DIALOG',d.message());d.dismiss()});
await p.goto('file:///home/claude/ap/Eton%20French%20Verbs.html');await p.waitForTimeout(2500);
const ls=async()=>JSON.parse(await p.evaluate(()=>localStorage.getItem('apfv_myset_v1')||'{"c":{}}')).c;
async function missOne(){ // drill, reveal, mark major error
  await p.click('.ms-drill');await p.waitForTimeout(400);
  const sent=await p.evaluate(()=>mode==='sentences');
  if(sent){ await p.evaluate(()=>{sentReveal&&sentReveal();});await p.waitForTimeout(200); await p.evaluate(()=>sentMark('error')); }
  else { await p.evaluate(()=>{document.getElementById('revealBtn')&&document.getElementById('revealBtn').click()});await p.waitForTimeout(200); await p.evaluate(()=>mark('error')); }
  await p.waitForTimeout(200);
  await p.evaluate(()=>aphBack());await p.waitForTimeout(300);
}
await p.evaluate(()=>hmOpen('all'));
await p.evaluate(()=>{msPickSet('both');msTense('PRESENT')});
for(const k of ['single','full','infinitives','sentences']){await p.evaluate(k=>msKind(k),k);await missOne();}
await p.evaluate(()=>hmOpen('quizlet'));
await p.evaluate(()=>{msGrp('E1');msTense('PRESENT')});
await p.evaluate(()=>msKind('exer'));await missOne();
await p.evaluate(()=>{msTrial('ftrials')});await p.waitForTimeout(200);console.log('trial info',await p.evaluate(()=>document.querySelector('.ms-now').innerText));await missOne();
console.log(Object.keys(await ls()));
await p.screenshot({path:'shots/trial.png',fullPage:true});
// personalised view
await p.evaluate(()=>apMySetUse());await p.waitForTimeout(300);
console.log('my',await p.evaluate(()=>({now:document.querySelector('.ms-now').innerText,tiles:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled?0:1).join(''),kinds:[...document.querySelectorAll('.ms-kinds .ms-pick')].map(x=>x.innerText.replace(/\n/g,' '))})));
await p.screenshot({path:'shots/my.png',fullPage:true});
for(const k of ['single','full','infinitives','sentences']){
  await p.evaluate(k=>msKind(k),k);
  for(const s of ['.ms-drill','.ms-spell','.ms-match','.ms-leis']){
    const dis=await p.evaluate(s=>document.querySelector(s).disabled,s);if(dis){console.log(k,s,'disabled');continue;}
    await p.click(s);await p.waitForTimeout(400);
    const i=await p.evaluate(()=>({ov:!!document.getElementById('ms-ov'),qc:!!document.querySelector('.aph-qcard,.vb-sent-q,#lzCard'),deck:typeof deck!=='undefined'?deck.length:0}));
    console.log(k,s,JSON.stringify(i));
    if(i.ov)await p.evaluate(()=>apMsClose());else if(i.qc){await p.evaluate(()=>aphBack());await p.waitForTimeout(300);}
  }
}
// edit/help/link
await p.evaluate(()=>apMySetEdit());await p.waitForTimeout(300);await p.screenshot({path:'shots/edit.png'});console.log('edit rows',await p.evaluate(()=>document.querySelectorAll('.ms-li').length));
await p.evaluate(()=>apMsClose());
await p.evaluate(()=>apMySetLink());const link=await p.evaluate(()=>document.getElementById('ms-link').value);console.log(link.length, link.slice(0,300));
await p.evaluate(()=>apMsClose());
// filters
for(const f of ['all','3','23','due']){await p.evaluate(f=>apMySetFilter(f),f);console.log('filter',f,await p.evaluate(()=>document.querySelector('.ms-now').innerText))}
// open link fresh
const q=await ctx.newPage();q.on('pageerror',e=>console.log('PAGEERR2',e.message));
await q.evaluate(()=>localStorage.clear()).catch(()=>{});
await b.close();
const b2=await chromium.launch();const c2=await b2.newContext({viewport:{width:1024,height:1366}});const r=await c2.newPage();r.on('pageerror',e=>console.log('PAGEERR3',e.message));
await r.goto(link);await r.waitForTimeout(3500);
console.log('link',await r.evaluate(()=>({now:document.querySelector('.ms-now')&&document.querySelector('.ms-now').innerText,tiles:[...document.querySelectorAll('.ms-tile')].map(t=>t.disabled?0:1).join(''),note:(document.querySelector('.ms-mybox .ms-note')||{}).innerText})));
await r.screenshot({path:'shots/linkopen.png'});
await b2.close()})();
