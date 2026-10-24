const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
const W=ms=>p.waitForTimeout(ms);
const link=require('fs').readFileSync('link.txt','utf8');
await p.goto(link);await W(3000);
console.log('link landed', await p.evaluate(()=>[apHome,document.querySelector('.ms-now')&&document.querySelector('.ms-now').textContent]));
await p.screenshot({path:'shots/l_link.png'});
console.log('tiles visible w/o scroll', await p.evaluate(()=>{var t=document.querySelector('.ms-tile.ms-drill');var r=t.getBoundingClientRect();return [r.top,innerHeight,t.disabled]}));
// Back stages
await p.evaluate(()=>aphBack());await W(300);console.log('back1 ->',await p.evaluate(()=>[apHome,!!document.querySelector('.hm-mark')]));
// all door
await p.evaluate(()=>hmOpen('all'));await W(300);
await p.screenshot({path:'shots/a_all0.png',fullPage:true});
console.log('all tiles', await p.evaluate(()=>[...document.querySelectorAll('.ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+(b.disabled?'(off)':''))));
await p.evaluate(()=>msPickSet('structures'));await W(300);
console.log('struct', await p.evaluate(()=>document.querySelector('.ms-now').textContent));
await p.evaluate(()=>{msKind('infinitives')});await W(200);
console.log('struct inf', await p.evaluate(()=>document.querySelector('.ms-now').textContent));
await p.click('.ms-drill');await W(300);
await p.keyboard.press('ArrowRight');await W(300);
console.log('inf reveal ok', await p.evaluate(()=>revealed));
await p.keyboard.press('ArrowLeft');await W(300);
await p.evaluate(()=>aphBack());await W(300);console.log('back from drill ->',await p.evaluate(()=>[apHome,!!document.querySelector('.ms-card')]));
await p.evaluate(()=>{msKind('sentences');msTense('INFINITIVE')});await W(200);
console.log('struct sent', await p.evaluate(()=>document.querySelector('.ms-now').textContent));
// Match off for sentences
console.log('sent tiles', await p.evaluate(()=>[...document.querySelectorAll('.ms-tile')].map(b=>b.querySelector('.ms-tt').textContent+(b.disabled?'(off)':''))));
await p.click('.ms-spell');await W(500);await p.screenshot({path:'shots/a_spellsent.png'});await p.keyboard.press('Escape');await W(200);
// Test tile (sentences)
await p.click('.ms-test');await W(800);
await p.screenshot({path:'shots/a_testsent.png'});
console.log('test sentences out', await p.evaluate(()=>{var o=document.getElementById('testOut');return o?o.innerText.slice(0,200):null}));
await p.evaluate(()=>aphBack());await W(300);console.log('back from test ->',await p.evaluate(()=>[apHome,!!document.querySelector('.ms-card')]));
await p.evaluate(()=>msPickSet('allv'));await W(200);
await p.evaluate(()=>{msKind('single');msTense('PRESENT')});await W(200);
await p.click('.ms-test');await W(800);
await p.screenshot({path:'shots/a_testconj.png'});
console.log('test conj out', await p.evaluate(()=>{var o=document.getElementById('testOut');return o?o.innerText.slice(0,300):null}));
await p.evaluate(()=>aphBack());await W(300);
// speed
await p.click('.ms-speed');await W(800);
await p.screenshot({path:'shots/a_speed.png'});
console.log('speed',await p.evaluate(()=>document.body.innerText.slice(0,300).replace(/\n/g,' | ')));
await p.evaluate(()=>aphBack());await W(500);
console.log('after speed back', await p.evaluate(()=>[apHome,!!document.querySelector('.ms-card'),!!document.querySelector('.hm-mark')]));
await p.evaluate(()=>hmOpen('core'));await W(200);await p.evaluate(()=>{msGrp('E1');msTense('PRESENT')});await W(200);
await p.evaluate(()=>{var d=document.querySelector('.ms-opts');d.open=true});await W(200);
await p.screenshot({path:'shots/a_settings.png',fullPage:true});
await b.close()})();
