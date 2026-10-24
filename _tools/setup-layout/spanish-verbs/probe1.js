const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1366}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/ap/Eton%20Spanish%20Verbs.html');await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(()=>{
 const idx={},dup=[];VERBS.forEach(v=>{const k=(v.group==='structures'?'S':'V')+'|'+v.inf+'|'+v.tense;if(idx[k])dup.push(k);idx[k]=1});
 const v=VERBS[0];
 return {n:VERBS.length,dup:dup.length,dupEx:dup.slice(0,5),tenses:[...new Set(VERBS.map(v=>v.tense))],ex:[conjugateEnglish(v.en,3,v.tense),conjugateEnglish('to be',2,'PRESENT_SUBJ'),conjugateEnglish('to speak',4,'IMP_SUBJ')],groups:[...new Set(VERBS.map(v=>v.group))],sent:SENTENCES.length,sk:Object.keys(SENTENCES[0]),spk:speak.toString().slice(0,200),noPre:VERBS.filter(v=>v.group==='structures').slice(0,2).map(v=>JSON.stringify(v).slice(0,300))}})));
await b.close()})();
