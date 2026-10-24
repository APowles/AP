const {chromium}=require('playwright');
const link=require('fs').readFileSync('link.txt','utf8');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1024,height:1366}});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
p.on('dialog',d=>{console.log('DIALOG',d.message());d.dismiss()});
const W=ms=>p.waitForTimeout(ms);
await p.goto(link);await W(2500);
console.log('link landing', await p.evaluate(()=>[apHome,document.querySelector('.ms-now')&&document.querySelector('.ms-now').textContent, [...document.querySelectorAll('.ms-tile')].filter(b=>!b.disabled).length, document.querySelector('.ms-mybox .ms-note')&&document.querySelector('.ms-mybox .ms-note').textContent]));
const r=await p.evaluate(()=>{const t=document.querySelector('.ms-tiles').getBoundingClientRect();return [t.top,t.bottom,innerHeight]});console.log('tiles rect',r);
await p.screenshot({path:'shots/l_link.png'});
// back from link page: setup -> landing -> hub
await p.evaluate(()=>aphBack());await W(300);console.log('1st back',await p.evaluate(()=>apHome+':'+!!document.querySelector('.ap-landing')));
await p.evaluate(()=>aphBack());await W(300);console.log('2nd back',await p.evaluate(()=>!!document.querySelector('.gh-hub')));
// core flow Test tile
await p.evaluate(()=>{goHome();hmOpen('core');msGrpSet('E');msTense('PRESENT')});await W(300);
await p.click('.ms-test');await W(800);
await p.screenshot({path:'shots/t_test.png'});
await p.evaluate(()=>{document.getElementById('testPanel').style.display='none'});
await p.click('.ms-speed');await W(1200);
await p.screenshot({path:'shots/t_speed.png'});
console.log('speed overlay?', await p.evaluate(()=>document.body.innerText.slice(0,200)));
await b.close()})();
