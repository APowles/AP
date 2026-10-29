/* Je peux · I can: final checklist stage (tiers, shuffle, saved marks), compact layout */
(function(){
var IC_KEY='ktr-ican',IC_GV='ktr-ican-glossvoice';
var M={};try{M=JSON.parse(localStorage.getItem(IC_KEY)||'{}')}catch(e){M={}}
var ORD={},OPEN={},TIER={},GV=false,MENU=false,AUTO=true;try{GV=localStorage.getItem(IC_GV)==='1';AUTO=localStorage.getItem('ktr-ican-auto')!=='0'}catch(e){}
function save(){try{localStorage.setItem(IC_KEY,JSON.stringify(M))}catch(e){}}
function k0(){return ktr()}
function ord(k){var o=ORD[k.n];if(!o||o.length!==k.ican.length){o=ORD[k.n]=k.ican.map(function(_,i){return i})}return o}
function mk(k,i){return (M[k.n]||{})[i]||''}
var GL={x:'✗',tilde:'~',v:'✓'};function glyph(m){return m==='v'?'✓':m==='~'?'~':m==='x'?'✗':''}
var css=document.createElement('style');css.id='ican-css';css.textContent=
'.stages{flex-wrap:nowrap!important;gap:6px!important}.stg{flex:1 1 0!important;min-width:0!important;flex-direction:column!important;align-items:center!important;text-align:center!important;gap:0!important;padding:6px 12px 6px 6px!important;position:relative}.stg b{font-size:clamp(.6rem,1.25vw,.92rem)!important;white-space:nowrap}.stg span{font-size:clamp(.54rem,.9vw,.7rem)!important;white-space:nowrap}.stg .pip{position:absolute!important;top:5px;right:5px;margin:0!important;width:6px;height:6px}'+
'.ic-t-Essential{--ic:#b8902b;--it:rgba(184,144,43,.17)}.ic-t-Important{--ic:#3f5f8a;--it:rgba(63,95,138,.13)}.ic-t-Bonus{--ic:#6b4f9a;--it:rgba(107,79,154,.14)}'+
'.ic-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:14px 0 6px}.ic-head .ic-ttl{font-weight:800;font-size:1.45rem;color:#1a2744;flex:1;min-width:180px}.ic-cnt{font-weight:700;font-size:1rem;color:#1a2744;background:#fff;border:1.5px solid rgba(26,39,68,.25);border-radius:999px;padding:4px 14px;white-space:nowrap}.ic-head .ic-ttl small{font-weight:500;opacity:.75;margin-left:6px}'+
'.ic-sm{min-height:36px;padding:4px 14px;border-radius:999px;border:1.5px solid rgba(26,39,68,.3);background:#fff;font:600 .9rem inherit;cursor:pointer;color:#1a2744}.ic-sm.on{background:#1a2744;color:#fff}'+
'.ic-menu{position:relative}.ic-pop{position:absolute;right:0;top:40px;z-index:5;background:#fff;border:1.5px solid rgba(26,39,68,.25);border-radius:12px;padding:6px;display:flex;flex-direction:column;gap:4px;min-width:210px;box-shadow:0 6px 18px rgba(0,0,0,.12)}.ic-pop .ic-sm{border-radius:8px;text-align:left}'+
'.ic-bar{display:flex;gap:8px;margin:2px 0 10px}.ic-seg{flex:1;min-width:0;background:none;border:0;padding:0;text-align:left;cursor:pointer;font:inherit;color:inherit}.ic-seg i{display:block;height:10px;border-radius:5px;background:rgba(26,39,68,.12);overflow:hidden}.ic-seg i b{display:block;height:100%;width:0;background:var(--ic);transition:width .25s}.ic-seg small{display:flex;align-items:center;gap:5px;font-size:.8rem;margin-top:3px}.ic-seg small:before{content:"";width:9px;height:9px;border-radius:3px;background:var(--ic)}.ic-seg.on small{font-weight:700}.ic-seg.on i{outline:2px solid var(--ic);outline-offset:1px}'+
'.ic-p{border:1.5px solid rgba(26,39,68,.16);border-left:9px solid var(--ic);border-radius:11px;padding:6px 10px 6px 8px;margin:6px 0;background:var(--it)}.ic-p.done{opacity:.6}'+
'.ic-h{display:flex;align-items:center;gap:10px;min-height:44px}.ic-q{flex:1;min-width:0;font-size:1.05rem;line-height:1.3;color:#1a2744}.ic-q b{font-weight:800}.ic-bx{flex:none;width:34px;height:34px;border-radius:9px;border:2.5px solid var(--ic);background:#fff;cursor:pointer;padding:0;font:800 1.1rem/1 inherit;color:#fff;display:flex;align-items:center;justify-content:center}.ic-p[data-m=v] .ic-bx{background:var(--ic)}.ic-p[data-m="~"] .ic-bx{background:#fff;color:var(--ic)}.ic-p[data-m=x] .ic-bx{background:#fff;color:#1a2744;border-color:#1a2744}.ic-ins{margin:0 0 8px;font-size:.92rem;opacity:.85}.ic-ins b{font-weight:800}.ic-chk{flex:none;min-height:34px;padding:3px 14px!important;font-size:.9rem!important}'+
'.ic-a{display:none;margin:6px 0 4px;padding-top:6px;border-top:1px dashed rgba(26,39,68,.22)}.ic-p.open .ic-a{display:block}.ic-p.open .ic-chk{display:none}'+
'.ic-fr{font-family:"Playfair Display",serif;font-size:1.15rem;font-weight:700;color:#1a2744;line-height:1.3}.ic-en{margin-top:4px;font-size:.95rem;opacity:.85;line-height:1.35}'+
'.ic-m{display:flex;gap:8px;margin-top:8px}.ic-m button{width:44px;height:36px;font-size:1rem;border-radius:999px;border:1.5px solid rgba(26,39,68,.3);background:#fff;cursor:pointer}.ic-p[data-m="x"] .ic-m [data-v="x"],.ic-p[data-m="~"] .ic-m [data-v="~"],.ic-p[data-m="v"] .ic-m [data-v="v"]{background:#1a2744;color:#fff}';
document.head.appendChild(css);
window.hasIcan=function(n){for(var s=0;s<DATA.subs.length;s++)for(var j=0;j<DATA.subs[s].ktrs.length;j++){var k=DATA.subs[s].ktrs[j];if(k.n===n)return !!k.ican}return false};
function cnt(k){var n=0;k.ican.forEach(function(p,i){if(mk(k,i)==='v')n++});return n+' of '+k.ican.length+' ✓'}
function qh(t){var m=/^(\S+)(\s[\s\S]*)?$/.exec(t);return m?'<b>'+esc(m[1])+'</b>'+esc(m[2]||''):esc(t)}
function row(k,i){
  var p=k.ican[i],m=mk(k,i),o=OPEN[k.n+'.'+i];
  return '<div class="ic-p ic-t-'+p.tier+(o?' open':'')+(m==='v'?' done':'')+'" data-i="'+i+'" data-m="'+m+'" title="'+p.tier+'">'+
   '<div class="ic-h"><button class="ic-bx" onclick="icCycle('+i+')" aria-label="Mark: I can / nearly / not yet">'+glyph(m)+'</button><div class="ic-q">'+qh(p.prompt)+'</div>'+
   '<button class="btn ic-chk" onclick="icCheck('+i+')">Check</button></div>'+
   '<div class="ic-a"><div class="ic-fr">'+esc(p.fr)+' <button class="spk" data-t="'+esc(p.fr)+'" onclick="spk(this)" aria-label="Hear it in French">'+SPK+'</button></div>'+
   '<div class="ic-en">'+esc(p.en)+(GV?' <button class="spk" onclick="icGloss('+i+')" aria-label="Hear the English gloss">'+SPK+'</button>':'')+'</div>'+
   '<div class="ic-m"><button data-v="x" onclick="icMark('+i+',\'x\')" aria-label="Not yet">✗</button><button data-v="~" onclick="icMark('+i+',\'~\')" aria-label="Nearly">~</button><button data-v="v" onclick="icMark('+i+',\'v\')" aria-label="I can">✓</button></div></div></div>';
}
function bars(k){
  var t={Essential:[0,0],Important:[0,0],Bonus:[0,0]};
  k.ican.forEach(function(p,i){t[p.tier][1]++;if(mk(k,i)==='v')t[p.tier][0]++});
  return ['Essential','Important','Bonus'].map(function(n){var a=t[n],on=TIER[k.n]===n;return '<button class="ic-seg ic-t-'+n+(on?' on':'')+'" onclick="icTier(\''+n+'\')" title="Show only '+n+' points (tap again for all)"><i><b style="width:'+(a[1]?Math.round(100*a[0]/a[1]):0)+'%"></b></i><small>'+n+' '+a[0]+'/'+a[1]+'</small></button>'}).join('');
}
function list(k){var o=ord(k),f=TIER[k.n];return o.filter(function(i){return !f||k.ican[i].tier===f}).map(function(i){return row(k,i)}).join('')}
function head(k){
  var sub=k.icanSub?'<small>'+esc(k.icanSub.fr)+' = '+esc(k.icanSub.en)+'</small>':'';
  return '<div class="ic-head"><div class="ic-ttl">Now I can…'+sub+'</div>'+
   '<span class="ic-cnt" id="ic-cnt">'+cnt(k)+'</span><button class="ic-sm'+(AUTO?' on':'')+'" onclick="icAuto()" aria-pressed="'+AUTO+'" title="Play the French automatically when you press Check">🔊 French auto-play: '+(AUTO?'On':'Off')+'</button><button class="ic-sm" onclick="icShuffle()">Shuffle</button>'+
   '<span class="ic-menu"><button class="ic-sm" onclick="icMenu()" aria-label="More options">⋯</button>'+(MENU?'<div class="ic-pop"><button class="ic-sm" onclick="icLogical()">Back to logical order</button><button class="ic-sm" onclick="icUnticked()">Unticked first</button><button class="ic-sm'+(GV?' on':'')+'" onclick="icGV()">Hear the English too</button></div>':'')+'</span></div>';
}
window.sIcan=function(k){
  mark(k.n,'i');
  return '<div id="ic-top">'+head(k)+'</div><div class="ic-ins">Tap the box when you can do it (again for nearly, not yet). Press <b>Check</b> to see the French.</div><div class="ic-bar" id="ic-bar">'+bars(k)+'</div><div id="ic-list">'+list(k)+'</div>';
};
function again(){var k=k0();document.getElementById('ic-list').innerHTML=list(k);document.getElementById('ic-bar').innerHTML=bars(k);document.getElementById('ic-top').innerHTML=head(k)}
window.icMenu=function(){MENU=!MENU;again()};
window.icCheck=function(i){var k=k0();OPEN[k.n+'.'+i]=1;var e=document.querySelector('.ic-p[data-i="'+i+'"]');if(e){e.classList.add('open');if(AUTO){var b=e.querySelector('.ic-fr .spk');if(b)spk(b)}}};
window.icAuto=function(){AUTO=!AUTO;try{localStorage.setItem('ktr-ican-auto',AUTO?'1':'0')}catch(e){}if(!AUTO){try{svStop()}catch(e){}}again()};
window.icMark=function(i,v){var k=k0();(M[k.n]=M[k.n]||{})[i]=(M[k.n][i]===v?'':v);save();var e=document.querySelector('.ic-p[data-i="'+i+'"]');if(e){e.dataset.m=M[k.n][i];e.classList.toggle('done',M[k.n][i]==='v');var g=e.querySelector('.ic-bx');if(g)g.textContent=glyph(M[k.n][i]);if(M[k.n][i]){setTimeout(function(){delete OPEN[k.n+'.'+i];e.classList.remove('open')},450)}}document.getElementById('ic-bar').innerHTML=bars(k);var c=document.getElementById('ic-cnt');if(c)c.textContent=cnt(k)};
window.icCycle=function(i){var k=k0(),c=mk(k,i),n=c===''?'v':c==='v'?'~':c==='~'?'x':'';(M[k.n]=M[k.n]||{})[i]=n;save();var e=document.querySelector('.ic-p[data-i="'+i+'"]');if(e){e.dataset.m=n;e.classList.toggle('done',n==='v');e.querySelector('.ic-bx').textContent=glyph(n)}document.getElementById('ic-bar').innerHTML=bars(k);var c=document.getElementById('ic-cnt');if(c)c.textContent=cnt(k)};
window.icShuffle=function(){var k=k0(),o=ord(k).slice();for(var j=o.length-1;j>0;j--){var r=Math.floor(Math.random()*(j+1)),t=o[j];o[j]=o[r];o[r]=t}ORD[k.n]=o;OPEN={};MENU=false;again()};
window.icLogical=function(){var k=k0();ORD[k.n]=k.ican.map(function(_,i){return i});MENU=false;again()};
window.icUnticked=function(){var k=k0(),o=ord(k).slice();ORD[k.n]=o.filter(function(i){return mk(k,i)!=='v'}).concat(o.filter(function(i){return mk(k,i)==='v'}));MENU=false;again()};
window.icTier=function(t){var k=k0();TIER[k.n]=(TIER[k.n]===t?'':t);again()};
window.icGV=function(){GV=!GV;try{localStorage.setItem(IC_GV,GV?'1':'0')}catch(e){}again()};
window.icGloss=function(i){var k=k0();fsSayEn(k.ican[i].en)};
})();
