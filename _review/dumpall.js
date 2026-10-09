const {chromium}=require('playwright');const fs=require('fs');
const SP=process.argv[2];
const plan={
"AP A Level French Oral Topics & Paper 1 Practice.html":['ALL_TOPICS'],
"AP A Level French VVs & Gr EWs & Grammar Translation Practice and Drills.html":['TR_PASSAGES','MLF_DATA'],
"AP A Level Oral Phrase Bank.html":['ALL_PHRASES'],
"AP F Spanish Vocab.html":['ALL_PHRASES'],
"AP French Verbs.html":['SENTENCES','SPECIALIST_VERBS','VERBS'],
"AP Gen Essential Phrases.html":['ALL_PHRASES','VOCAB_PHRASES'],
"AP IGCSE AP Structures & Oral and Writing Practice.html":['CARDS','IGCSE_CARDS','IGCSE_CARDS_ES','IGCSE_CARDS_IT'],
"AP IGCSE Approved Material Practice Sentences.html":['AM_DATA'],
"AP IGCSE French Listening.html":['PAPERS'],
"AP IGCSE Vocab Essentials.html":['ALL_PHRASES','VOCAB_PHRASES'],
"AP IGCSE Vocab and Gr EWs.html":['GG_TERMS_FR','GG_BLOCKS_FR'],
"AP Italian Verbs.html":['SENTENCES','VERBS'],
"AP Spanish Verbs.html":['SENTENCES','VERBS']};
(async()=>{const b=await chromium.launch();
for(const [f,ns] of Object.entries(plan)){const p=await b.newPage();await p.goto('file://'+process.cwd()+'/'+f);await p.waitForTimeout(1200);
 for(const n of ns){const v=await p.evaluate(n=>{try{return JSON.stringify(eval(n))}catch(e){return null}},n);
  const tag=f.replace(/^AP /,'').replace(/\.html$/,'').replace(/[^A-Za-z0-9]+/g,'_').slice(0,30);
  if(v){fs.writeFileSync(`${SP}/all/${tag}__${n}.json`,v);console.log(tag,n,v.length);}}
 await p.close();}
await b.close();})();
