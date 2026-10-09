const {chromium}=require('playwright');const fs=require('fs');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.cwd()+'/AP A Level French Oral Topics & Paper 1 Practice.html');await p.waitForTimeout(1500);
for(const n of ['ORAL_CARDS','TOPICS_DEMO_EN']){const v=await p.evaluate(n=>{try{return JSON.stringify(eval(n))}catch(e){return 'ERR '+e}},n);fs.writeFileSync(`${SP}/all/A_Level_French_Oral_Topics_Pap__${n}.json`,v);console.log(n,v.length);}
await b.close();})();
