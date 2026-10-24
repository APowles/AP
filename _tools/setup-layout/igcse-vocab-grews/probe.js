const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/ap/'+process.argv[2]);await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{
 const o={};const seen={};let dup=0;ALL_PHRASES.forEach(x=>{const k=x.sec+'~'+x.n;if(seen[k])dup++;seen[k]=1});
 o.vocab=ALL_PHRASES.length;o.dup=dup;o.keys=Object.keys(ALL_PHRASES[0]);
 const ids={};let d2=0,n=0,bad=0;[GCSE_GR_DATA,GCSE_IT_DATA].forEach(D=>Object.keys(D).forEach(k=>D[k].items.forEach(it=>{n++;if(ids[it.id])d2++;ids[it.id]=1;if(!/^[A-Za-z0-9_]+$/.test(it.id))bad++;})));
 o.gr=n;o.grdup=d2;o.badid=bad;o.sample=GCSE_GR_DATA.fm01.items[0];
 const tc={};Object.keys(GCSE_GR_DATA).forEach(k=>GCSE_GR_DATA[k].items.forEach(it=>tc[it.type]=(tc[it.type]||0)+1));o.types=tc;
 o.langs=Object.keys(LANG_NAMES);
 return JSON.stringify(o,null,1).slice(0,2500);}));
await b.close();})();
