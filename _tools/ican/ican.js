/* Je peux · I can: final checklist stage (tiers, shuffle, saved marks) */
(function(){
var IC_KEY='ktr-ican',IC_GV='ktr-ican-glossvoice';
var TIERS={Essential:['Essential','Essentiel'],Important:['Important','Important'],Bonus:['Bonus','Bonus']};
var M={};try{M=JSON.parse(localStorage.getItem(IC_KEY)||'{}')}catch(e){M={}}
var ORD={},OPEN={},ONLY={},GV=false;try{GV=localStorage.getItem(IC_GV)==='1'}catch(e){}
function save(){try{localStorage.setItem(IC_KEY,JSON.stringify(M))}catch(e){}}
function k0(){return ktr()}
function ord(k){var o=ORD[k.n];if(!o||o.length!==k.ican.length){o=ORD[k.n]=k.ican.map(function(_,i){return i})}return o}
function mk(k,i){return (M[k.n]||{})[i]||''}
var css=document.createElement('style');css.id='ican-css';css.textContent=
'.stages{flex-wrap:nowrap!important;gap:6px!important}.stg{flex:1 1 0!important;min-width:0!important;flex-direction:column!important;align-items:center!important;text-align:center!important;gap:0!important;padding:6px 12px 6px 6px!important;position:relative}.stg b{font-size:clamp(.6rem,1.25vw,.92rem)!important;white-space:nowrap}.stg span{font-size:clamp(.54rem,.9vw,.7rem)!important;white-space:nowrap}.stg .pip{position:absolute!important;top:5px;right:5px;margin:0!important;width:6px;height:6px}'+
'.ic-bar{display:flex;gap:6px;margin:10px 0 4px}.ic-seg{flex:1;min-width:0}.ic-seg i{display:block;height:9px;border-radius:5px;background:rgba(26,39,68,.12);overflow:hidden}.ic-seg i b{display:block;height:100%;width:0;transition:width .25s}.ic-seg small{display:block;font-size:12px;margin-top:3px;opacity:.75}'+
'.ic-t-Essential{--ic:#b8902b}.ic-t-Important{--ic:#3f5f8a}.ic-t-Bonus{--ic:#7d6f94}.ic-seg i b{background:var(--ic)}'+
'.ic-tools{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.ic-tools .btn.on{outline:2px solid #c9a84c}'+
'.ic-p{border:1.5px solid rgba(26,39,68,.18);border-left:6px solid var(--ic);border-radius:14px;padding:12px 14px;margin:10px 0;background:#fff}'+
'.ic-p.done{background:#f4f1e4}.ic-tag{display:inline-block;font:700 11px/1 inherit;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--ic);border-radius:999px;padding:4px 9px}'+
'.ic-q{font-size:1.05rem;margin:8px 0;line-height:1.35}.ic-a{display:none;margin-top:8px;padding-top:8px;border-top:1px dashed rgba(26,39,68,.25)}.ic-p.open .ic-a{display:block}.ic-p.open .ic-chk{display:none}'+
'.ic-fr{font-size:1.1rem;font-weight:600}.ic-en{margin-top:4px;opacity:.85}.ic-m{display:flex;gap:8px;margin-top:10px}.ic-m button{min-width:52px;min-height:44px;font-size:1.1rem;border-radius:10px;border:1.5px solid rgba(26,39,68,.3);background:#fff;cursor:pointer}'+
'.ic-p[data-m="x"] .ic-m [data-v="x"],.ic-p[data-m="~"] .ic-m [data-v="~"],.ic-p[data-m="v"] .ic-m [data-v="v"]{background:#1a2744;color:#fff}';
document.head.appendChild(css);
window.hasIcan=function(n){for(var s=0;s<DATA.subs.length;s++)for(var j=0;j<DATA.subs[s].ktrs.length;j++){var k=DATA.subs[s].ktrs[j];if(k.n===n)return !!k.ican}return false};
function row(k,i){
  var p=k.ican[i],m=mk(k,i),o=OPEN[k.n+'.'+i];
  return '<div class="ic-p ic-t-'+p.tier+(o?' open':'')+(m==='v'?' done':'')+'" data-i="'+i+'" data-m="'+m+'">'+
   '<span class="ic-tag">'+TIERS[p.tier][0]+'</span>'+
   '<div class="ic-q">I can… '+esc(p.prompt)+'</div>'+
   '<button class="btn ic-chk" onclick="icCheck('+i+')">Check</button>'+
   '<div class="ic-a"><div class="ic-fr">'+esc(p.fr)+' <button class="spk" data-t="'+esc(p.fr)+'" onclick="spk(this)" aria-label="Hear it in French">'+SPK+'</button></div>'+
   '<div class="ic-en">'+esc(p.en)+(GV?' <button class="spk" onclick="icGloss('+i+')" aria-label="Hear the English gloss">'+SPK+'</button>':'')+'</div>'+
   '<div class="ic-m"><button data-v="x" onclick="icMark('+i+',\'x\')" aria-label="Not yet">✗</button><button data-v="~" onclick="icMark('+i+',\'~\')" aria-label="Nearly">~</button><button data-v="v" onclick="icMark('+i+',\'v\')" aria-label="I can">✓</button></div></div></div>';
}
function bars(k){
  var t={Essential:[0,0],Important:[0,0],Bonus:[0,0]};
  k.ican.forEach(function(p,i){t[p.tier][1]++;if(mk(k,i)==='v')t[p.tier][0]++});
  return ['Essential','Important','Bonus'].map(function(n){var a=t[n];return '<div class="ic-seg ic-t-'+n+'"><i><b style="width:'+(a[1]?Math.round(100*a[0]/a[1]):0)+'%"></b></i><small>'+n+' '+a[0]+'/'+a[1]+'</small></div>'}).join('');
}
function list(k){
  var o=ord(k);return o.filter(function(i){return !ONLY[k.n]||k.ican[i].tier==='Essential'}).map(function(i){return row(k,i)}).join('');
}
window.sIcan=function(k){
  mark(k.n,'i');
  return '<div class="label" style="margin-top:20px">Je peux · I can</div>'+
   '<div class="rem-intro">Read each point, say your answer aloud, press Check, then mark yourself: ✗ not yet, ~ nearly, ✓ I can.</div>'+
   '<div class="ic-bar" id="ic-bar">'+bars(k)+'</div>'+
   '<div class="ic-tools"><button class="btn" onclick="icShuffle()">Shuffle</button><button class="btn" onclick="icLogical()">Back to logical order</button><button class="btn" onclick="icUnticked()">Unticked first</button><button class="btn'+(ONLY[k.n]?' on':'')+'" onclick="icOnly()">Essentials only</button><button class="btn'+(GV?' on':'')+'" onclick="icGV()">Hear the English too</button></div>'+
   '<div id="ic-list">'+list(k)+'</div>';
};
function again(){var k=k0();document.getElementById('ic-list').innerHTML=list(k);document.getElementById('ic-bar').innerHTML=bars(k)}
window.icCheck=function(i){var k=k0();OPEN[k.n+'.'+i]=1;var e=document.querySelector('.ic-p[data-i="'+i+'"]');if(e)e.classList.add('open')};
window.icMark=function(i,v){var k=k0();(M[k.n]=M[k.n]||{})[i]=(M[k.n][i]===v?'':v);save();var e=document.querySelector('.ic-p[data-i="'+i+'"]');if(e){e.dataset.m=M[k.n][i];e.classList.toggle('done',M[k.n][i]==='v')}document.getElementById('ic-bar').innerHTML=bars(k)};
window.icShuffle=function(){var k=k0(),o=ord(k).slice();for(var j=o.length-1;j>0;j--){var r=Math.floor(Math.random()*(j+1)),t=o[j];o[j]=o[r];o[r]=t}ORD[k.n]=o;OPEN={};again()};
window.icLogical=function(){var k=k0();ORD[k.n]=k.ican.map(function(_,i){return i});again()};
window.icUnticked=function(){var k=k0(),o=ord(k).slice();ORD[k.n]=o.filter(function(i){return mk(k,i)!=='v'}).concat(o.filter(function(i){return mk(k,i)==='v'}));again()};
window.icOnly=function(){var k=k0();ONLY[k.n]=!ONLY[k.n];render()};
window.icGV=function(){GV=!GV;try{localStorage.setItem(IC_GV,GV?'1':'0')}catch(e){}render()};
window.icGloss=function(i){var k=k0();fsSayEn(k.ican[i].en)};
})();
