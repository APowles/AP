/*SHX-BEGIN*/
var apShuffle=(function(){
  var O=null,ANIMS=[],lastIdx=-1;
  var CSS='.shx-st{position:relative;width:min(96%,960px);aspect-ratio:16/9;margin:8px auto;overflow:hidden;border-radius:14px;perspective:1400px;background:url(icons/table_green.webp) center/100% 100% no-repeat,#0f3d2e;box-shadow:0 8px 22px rgba(0,0,0,.55),inset 0 0 40px rgba(0,0,0,.45)}'
   +'.shx-c{position:absolute;left:0;top:0;transform-style:preserve-3d;will-change:transform}'
   +'.shx-c>div{position:absolute;left:0;top:0;width:100%;height:100%;box-sizing:border-box;border-radius:calc(var(--cw)*.07);backface-visibility:hidden;-webkit-backface-visibility:hidden;border:var(--bw) solid #f7f3e8;box-shadow:0 2px 6px rgba(0,0,0,.5);background-size:cover;background-position:center}'
   +'.shx-c>.shx-b{background:var(--shx-bk)}.shx-c>.shx-b:after{content:"";position:absolute;inset:calc(var(--bw)*1.1);border:max(1px,calc(var(--bw)*.33)) solid #c9a84c;border-radius:calc(var(--cw)*.05)}'
   +'.shx-c>.shx-f{transform:rotateY(180deg);background-color:#14203a;background-image:linear-gradient(160deg,#1c2c52,#0e1830)}';
  function css(){if(document.getElementById('shx-css'))return;var s=document.createElement('style');s.id='shx-css';s.textContent=CSS;document.head.appendChild(s)}
  var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
  var rnd=function(a,b){return a+Math.random()*(b-a)};
  var dk=function(){return 'd'+(1+Math.floor(Math.random()*7))};
  function S(k,ms,v){O.later(function(){O.play(k,v)},ms||0)}
  function deal(){return sleep(120)}
  var CEN=function(m){return{x:.5*m.W,y:.58*m.H}};
function M(el){const W=el.clientWidth,H=el.clientHeight,cw=W*.17,ch=cw*O.ar;el.style.setProperty('--cw',cw+'px');el.style.setProperty('--bw',Math.max(2,cw*.035)+'px');return{W,H,cw,ch}}
function tf(m,p){return 'translate('+(p.x-m.cw/2)+'px,'+(p.y-m.ch/2)+'px) rotate('+(p.r||0)+'deg) rotateY('+(p.ry||0)+'deg) scale('+(p.s||1)+')'}
function clear(el){el.getAnimations({subtree:true}).forEach(a=>a.cancel());el.querySelectorAll('.shx-c').forEach(c=>c.remove())}
function mk(el,m,face){const c=document.createElement('div');c.className='shx-c';c.style.width=m.cw+'px';c.style.height=m.ch+'px';c.innerHTML='<div class="shx-b"></div><div class="shx-f"></div>';if(face!=null&&O.faces&&O.faces.length)c.querySelector('.shx-f').style.backgroundImage='url('+O.faces[face%O.faces.length]+')';el.appendChild(c);return c}
function put(c,m,p,z){c._p=Object.assign({r:0,ry:0,s:1},p);c.style.transform=tf(m,c._p);if(z!=null)c.style.zIndex=z}
function fly(c,m,pts,o){o=o||{};
  const start=c._p,all=[start].concat(pts.map(p=>Object.assign({r:0,ry:0,s:1},p)));
  const kfs=all.map(p=>{const k={transform:tf(m,p)};if(p.o!=null)k.offset=p.o;return k});
  if(o.z!=null)c.style.zIndex=o.z;
  const a=c.animate(kfs,{duration:o.dur||600,delay:o.delay||0,easing:o.ease||'ease-in-out',fill:'both'});
  c._p=all[all.length-1];
  return a.finished.then(()=>{c.style.transform=tf(m,c._p);a.cancel();if(o.zEnd!=null)c.style.zIndex=o.zEnd}).catch(()=>{});
}
function deck(el,m,n,x,y,face,gap){clear(el);const cs=[];for(let i=0;i<n;i++){const c=mk(el,m,face?face(i):null);put(c,m,{x:x,y:y-i*(gap||1.2),r:0},i);cs.push(c)}return cs}

  function wire(btn,stage,build,run){ANIMS.push({build:build,run:run})}
/* ---------- riffle (shared by 1 and 3) ---------- */
  async function riffle(m,cs,C,L,R,step){
    const n=cs.length,h=n/2,LH=cs.slice(0,h),RH=cs.slice(h);let ps=[];S('p4',0);
    LH.forEach(c=>ps.push(fly(c,m,[{x:L.x,y:L.y-.05*m.H,r:7,s:1.03}],{dur:300})));
    RH.forEach(c=>ps.push(fly(c,m,[{x:R.x,y:R.y-.05*m.H,r:-7,s:1.03}],{dur:300})));
    await Promise.all(ps);await sleep(100);
    const seq=[];let l=h-1,r=h-1;
    while(l>=0||r>=0){const pickL=l<0?false:r<0?true:Math.random()<.5;const run=Math.random()<.3?2:1;for(let q=0;q<run;q++){if(pickL&&l>=0)seq.push(LH[l--]);else if(!pickL&&r>=0)seq.push(RH[r--])}}
    S('fan2',0);ps=[];
    seq.forEach((c,k)=>{const side=LH.includes(c)?-1:1;if(k%4==0)S(dk(),k*step+200,.45);
      ps.push(fly(c,m,[{x:(c._p.x+C.x)/2,y:c._p.y-.08*m.H,r:side*9,s:1.04},{x:C.x,y:C.y-k*1.4,r:0,s:1}],{dur:260,delay:k*step,z:500+k,ease:'ease-in'}))});
    await Promise.all(ps);seq.forEach((c,k)=>{c._p.x=C.x;c._p.y=C.y-k*1.4});return seq}
  const rfP=m=>({C:{x:.5*m.W,y:.6*m.H},L:{x:.33*m.W,y:.6*m.H},R:{x:.67*m.W,y:.6*m.H}});
  const rfBuild=n=>el=>{const m=M(el),p=rfP(m),cs=deck(el,m,n,p.C.x,p.C.y,null,1.4);cs.forEach((c,i)=>{const Lh=i<n/2;put(c,m,{x:Lh?p.L.x:p.R.x,y:p.C.y-(Lh?i:i-n/2)*1.4,r:0},i)});return{m:m,cs:cs}};
  /* ---------- 1 Bridge shuffle ---------- */
  wire('b1','s1',rfBuild(24),async(el,ctx)=>{
    const m=ctx.m,p=rfP(m),C=p.C;const seq=await riffle(m,ctx.cs,C,p.L,p.R,32);const n=seq.length;
    S('p4',0);S('fan1',100);let ps=[];
    seq.forEach((c,i)=>{const u=i/(n-1)-.5;ps.push(fly(c,m,[{x:C.x+u*.56*m.W,y:C.y-.08*m.H-.26*m.H*(1-4*u*u),r:u*80,s:1.05}],{dur:600,delay:Math.abs(u)*160,z:600+i,ease:'cubic-bezier(.3,.7,.3,1)'}))});
    await Promise.all(ps);await sleep(150);S('fan2',0);ps=[];
    seq.forEach((c,i)=>{if(i%3==0)S(dk(),i*26+150,.45);ps.push(fly(c,m,[{x:(c._p.x+C.x)/2,y:C.y-.2*m.H,r:c._p.r*.4,s:1.08},{x:C.x,y:C.y-i*1.4,r:0,s:1}],{dur:330,delay:i*26,z:700+i,ease:'ease-in'}))});
    await Promise.all(ps);S('p2',0);await deal(m,seq);
  });
  /* ---------- 2 Card spring ---------- */
  const N2=22;
  wire('b2','s2',el=>{const m=M(el);return{m:m,cs:deck(el,m,N2,.2*m.W,.64*m.H)}},async(el,ctx)=>{
    const m=ctx.m,cs=ctx.cs,L={x:.2*m.W,y:.64*m.H},R={x:.8*m.W,y:.64*m.H};
    function arch(c,from,to,h,dir,dur,delay,z,landIdx){
      const sy=c._p.y,ey=to.y-landIdx*1.3,pts=[];
      for(let s=1;s<=12;s++){const u=s/12,x=from.x+(to.x-from.x)*u,y=sy+(ey-sy)*u-4*h*u*(1-u);
        pts.push({x:x,y:y,r:dir*(-34+68*u),ry:28*Math.sin(Math.PI*u)*dir,s:1+.1*Math.sin(Math.PI*u)})}
      pts[pts.length-1].r=0;pts[pts.length-1].ry=0;pts[pts.length-1].s=1;
      return fly(c,m,pts,{dur:dur,delay:delay,ease:'linear',z:z})}
    let ps=[];S('p4',0);S('fan2',100);
    for(let k=0;k<N2;k++){const c=cs[N2-1-k];if(k%2==0)S(dk(),k*40+520,.5);ps.push(arch(c,L,R,.55*m.H,1,650,k*40,200+k,k))}
    await Promise.all(ps);await sleep(120);ps=[];S('fan1',0);
    for(let k=0;k<N2;k++){const c=cs[k];if(k%2==0)S(dk(),k*28+400,.5);ps.push(arch(c,R,L,.4*m.H,-1,520,k*28,300+k,k))}
    await Promise.all(ps);S('p2',0);ps=[];const C=CEN(m);
    for(let k=0;k<N2;k++){const c=cs[k];ps.push(fly(c,m,[{x:C.x,y:C.y-k*1.2,r:0}],{dur:450,delay:k*8,z:k}))}
    await Promise.all(ps);await deal(m,cs);
  });
  /* ---------- 3 Riffle shuffle ---------- */
  wire('b3','s3',rfBuild(24),async(el,ctx)=>{
    const m=ctx.m,p=rfP(m),C=p.C;const seq=await riffle(m,ctx.cs,C,p.L,p.R,40);
    S('p2',0);await Promise.all(seq.map((c,k)=>fly(c,m,[{x:C.x+(k%2?6:-6),y:C.y-k*1.4},{x:C.x,y:C.y-k*1.4}],{dur:260,z:k})));
    S('p2',280);await Promise.all(seq.map((c,k)=>fly(c,m,[{x:C.x,y:C.y-k*1.4-.05*m.H,s:1.03},{x:C.x,y:C.y-k*1.4,s:1}],{dur:340,z:k})));
    await deal(m,seq);
  });
  /* ---------- 4 Faro shuffle ---------- */
  wire('b4','s4',el=>{const m=M(el);return{m:m,cs:deck(el,m,24,.5*m.W,.6*m.H,null,1.4)}},async(el,ctx)=>{
    const m=ctx.m,C={x:.5*m.W,y:.6*m.H},L={x:.33*m.W,y:.6*m.H},R={x:.67*m.W,y:.6*m.H},h=12;let arr=ctx.cs.slice();
    async function faro(step,dur){
      const LH=arr.slice(0,h),RH=arr.slice(h);let ps=[];S('p4',0);
      LH.forEach((c,i)=>ps.push(fly(c,m,[{x:L.x,y:L.y-i*1.4,r:0}],{dur:380,z:i})));RH.forEach((c,i)=>ps.push(fly(c,m,[{x:R.x,y:R.y-i*1.4,r:0}],{dur:380,z:i})));
      await Promise.all(ps);await sleep(120);ps=[];
      for(let i=0;i<h;i++){if(i%2==0)S(dk(),i*step+100,.55);
        ps.push(fly(LH[i],m,[{x:(L.x+C.x)/2,y:C.y-.06*m.H-i*2.8,r:3},{x:C.x-7,y:C.y-(2*i)*1.4,r:0}],{dur:dur,delay:i*step,z:2*i,ease:'ease-in'}));
        ps.push(fly(RH[i],m,[{x:(R.x+C.x)/2,y:C.y-.06*m.H-i*2.8,r:-3},{x:C.x+7,y:C.y-(2*i+1)*1.4,r:0}],{dur:dur,delay:i*step,z:2*i+1,ease:'ease-in'}))}
      await Promise.all(ps);const next=[];for(let i=0;i<h;i++){next.push(LH[i]);next.push(RH[i])}arr=next;
      S('p2',0);await Promise.all(arr.map((c,n)=>fly(c,m,[{x:C.x,y:C.y-n*1.4}],{dur:200,z:n})))}
    await faro(70,300);await faro(40,240);
    await deal(m,arr);
  });
  /* ---------- 5 Ribbon spread and turnover ---------- */
  const N5=8;
  wire('b5','s5',el=>{const m=M(el);return{m:m,cs:deck(el,m,N5,.5*m.W,.5*m.H,i=>i,1.6)}},async(el,ctx)=>{
    const m=ctx.m,cs=ctx.cs,x0=.5*m.cw+.1*m.W,sp=(.8*m.W-m.cw)/(N5-1),Y=.5*m.H;
    let ps=[];S('fan1',0);S('fan2',250);
    for(let i=0;i<N5;i++){const c=cs[N5-1-i];ps.push(fly(c,m,[{x:(c._p.x+x0+i*sp)/2,y:Y-.1*m.H,r:-6,s:1.07},{x:x0+i*sp,y:Y,r:0}],{dur:600,delay:i*55,z:i,ease:'cubic-bezier(.2,.7,.3,1)'}))}
    await Promise.all(ps);await sleep(200);ps=[];
    for(let i=0;i<N5;i++){const c=cs[N5-1-i],x=c._p.x;S(i%2?'p2':'p4',i*85+220,.8);ps.push(fly(c,m,[{x:x,y:Y-.16*m.H,ry:90,s:1.16},{x:x,y:Y,ry:180,s:1}],{dur:520,delay:i*85,z:100+i,zEnd:i}))}
    await Promise.all(ps);await sleep(350);ps=[];S('fan1',0);const C={x:.5*m.W,y:.5*m.H};
    for(let i=0;i<N5;i++){const c=cs[N5-1-i];ps.push(fly(c,m,[{x:(c._p.x+C.x)/2,y:Y-.12*m.H,ry:90,s:1.1},{x:C.x,y:C.y-(N5-1-i)*1.6,ry:0,s:1}],{dur:600,delay:i*50,z:(N5-i)}))}
    await Promise.all(ps);S('p2',0);await deal(m,cs);
  });
  /* ---------- 6 Thumb fan ---------- */
  const N6=12;
  wire('b6','s6',el=>{const m=M(el);return{m:m,cs:deck(el,m,N6,.5*m.W,.5*m.H,null,1.6)}},async(el,ctx)=>{
    const m=ctx.m,cs=ctx.cs,S0=1.7,P={x:.5*m.W,y:.9*m.H},d=m.cw*S0*.5*.92,span=64;
    const pos=a=>{const q=a*Math.PI/180;return{x:P.x+d*Math.sin(q),y:P.y-d*Math.cos(q),r:90+a,s:S0}};
    S('p4',0);
    await Promise.all(cs.map((c,i)=>fly(c,m,[pos(0)],{dur:450,delay:i*6,z:i})));
    await sleep(150);let ps=[];S('fan2',0);
    for(let i=N6-1;i>=0;i--){const a=-span+2*span*i/(N6-1),k=N6-1-i,pts=[];
      for(let s=1;s<=10;s++){const u=s/10,e=u*u*(3-2*u);pts.push(pos(a*e))}
      ps.push(fly(cs[i],m,pts,{dur:550,delay:k*55,ease:'ease-out',z:i}))}
    await Promise.all(ps);await sleep(300);ps=[];S('fan1',0);const C={x:.5*m.W,y:.58*m.H};
    for(let i=0;i<N6;i++){const a=-span+2*span*i/(N6-1);ps.push(fly(cs[i],m,[pos(a*.15),{x:C.x,y:C.y-i*1.6,r:0,s:1}],{dur:600,delay:i*30,ease:'ease-in-out',z:i}))}
    await Promise.all(ps);S('p2',0);await deal(m,cs);
  });
  /* ---------- 7 Sybil cut ---------- */
  const N7=24;
  wire('b7','s7',el=>{const m=M(el);return{m:m,cs:deck(el,m,N7,.5*m.W,.58*m.H,null,1.4)}},async(el,ctx)=>{
    const m=ctx.m,C={x:.5*m.W,y:.62*m.H};let arr=ctx.cs.slice(),z=1000;
    async function cut(dir,dur){
      const h=N7/2,B=arr.slice(0,h),T=arr.slice(h),ps=[];
      S('p4',0);S('fan2',100);S('d3',dur+h*20-100);
      T.forEach((c,q)=>{const pts=[];
        for(let s=1;s<=16;s++){const u=s/16,th=Math.PI*u;pts.push({x:C.x+dir*.24*m.W*Math.sin(th),y:C.y-.34*m.H*Math.sin(th)-(1-u)*(h+q)*1.4-u*q*1.4,r:dir*360*u,s:1+.14*Math.sin(th)})}
        ps.push(fly(c,m,pts,{dur:dur,delay:q*20,ease:'ease-in-out',z:z+q}))});
      B.forEach((c,i)=>{ps.push(fly(c,m,[{x:C.x,y:C.y-(i+h)*1.4-.05*m.H,r:0,s:1.04},{x:C.x,y:C.y-(i+h)*1.4,r:0}],{dur:dur*.8,delay:dur*.28+i*16,z:i+h}))});
      await Promise.all(ps);z+=100;arr=T.concat(B);
      arr.forEach((c,i)=>{c._p=Object.assign({},c._p,{x:C.x,y:C.y-i*1.4,r:0,s:1});c.style.transform=tf(m,c._p);c.style.zIndex=i})}
    await Promise.all(arr.map((c,i)=>fly(c,m,[{x:C.x,y:C.y-i*1.4,r:0}],{dur:250,z:i})));
    await cut(1,1000);await sleep(120);await cut(-1,800);S('p2',0);await deal(m,arr);
  });
  /* ---------- 8 Overhand shuffle ---------- */
  const N8=24;
  wire('b8','s8',el=>{const m=M(el);return{m:m,cs:deck(el,m,N8,.3*m.W,.64*m.H,null,1.4)}},async(el,ctx)=>{
    const m=ctx.m,A={x:.3*m.W,y:.64*m.H},B={x:.7*m.W,y:.64*m.H};let z=1000;
    let src=ctx.cs.slice(),dst=[];
    async function round(from,to,fromP,toP,packs,per,dur){
      let t=0;const ps=[];
      for(const k of packs){const grp=from.splice(from.length-k,k),base=to.length;S(Math.random()<.5?'p2':'p4',t,.7);S(dk(),t+dur*.8,.8);
        grp.forEach((c,q)=>{const ty=toP.y-(base+q)*1.4,lift=.26*m.H;
          ps.push(fly(c,m,[{x:fromP.x,y:fromP.y-lift,r:-10+q*.6,s:1.06},{x:(fromP.x+toP.x)/2,y:Math.min(fromP.y,toP.y)-lift*1.25,r:0,s:1.08},{x:toP.x,y:toP.y-lift,r:9-q*.5,s:1.06},{x:toP.x,y:ty,r:0}],{dur:dur,delay:t+q*20,z:z++}))});
        grp.forEach(c=>to.push(c));t+=per}
      await Promise.all(ps)}
    await round(src,dst,A,B,[6,5,7,6],300,430);await sleep(120);
    await round(dst,src,B,A,[7,5,6,6],230,340);
    S('fan1',0);const C={x:.5*m.W,y:.58*m.H},ps=[];
    src.forEach((c,i)=>ps.push(fly(c,m,[{x:C.x,y:C.y-i*1.4,r:0}],{dur:450,delay:i*8,z:i})));
    await Promise.all(ps);S('p2',0);await deal(m,src);
  });
  /* ---------- 9 Anaconda dribble ---------- */
  const N9=20;
  function snake(m,t,ph){const ang=Math.PI*2*1.25*t-ph,A=.27*m.H,x=.1*m.W+.8*m.W*t,y=.5*m.H+A*Math.sin(ang);const r=Math.atan2(A*Math.cos(ang)*Math.PI*2*1.25,.8*m.W)*180/Math.PI;return{x:x,y:y,r:r}}
  wire('b9','s9',el=>{const m=M(el);return{m:m,cs:deck(el,m,N9,.14*m.W,.5*m.H)}},async(el,ctx)=>{
    const m=ctx.m,cs=ctx.cs,D={x:.14*m.W,y:.5*m.H},ps=[];
    S('fan1',0);
    for(let j=0;j<N9;j++){const c=cs[N9-1-j],t=j/(N9-1),tg=snake(m,t,0);if(j%3==0)S(dk(),350+j*38,.55);
      ps.push(fly(c,m,[{x:(D.x+tg.x)/2,y:Math.min(D.y,tg.y)-.2*m.H,r:-25+tg.r*.5,s:1.08},{x:tg.x,y:tg.y,r:tg.r}],{dur:500,delay:j*38,ease:'cubic-bezier(.2,.7,.3,1)',z:j+1}))}
    await Promise.all(ps);S('fan2',0);
    const sl=[];for(let j=0;j<N9;j++){const c=cs[N9-1-j],t=j/(N9-1),pts=[];
      for(let s=1;s<=40;s++){const q=snake(m,t,s/40*Math.PI*2);pts.push({x:q.x,y:q.y,r:q.r,s:1+.04*Math.sin(s/40*Math.PI*6+t*6)})}
      sl.push(fly(c,m,pts,{dur:1300,ease:'linear'}))}
    await Promise.all(sl);
    S('fan1',0);const g=[],C=CEN(m);
    for(let j=0;j<N9;j++){const c=cs[N9-1-j];if(j%4==0)S(dk(),300+j*26,.5);g.push(fly(c,m,[{x:(c._p.x+C.x)/2,y:C.y-.18*m.H,r:rnd(-18,18)},{x:C.x,y:C.y-(N9-1-j)*1.2,r:0}],{dur:450,delay:j*26,z:100+(N9-j)}))}
    await Promise.all(g);S('p2',0);await deal(m,cs);
  });
  
  function run(stage,o){
    O=o;css();
    var fin=false,finish=function(){if(fin)return;fin=true;if(o.alive())o.done()};
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){setTimeout(finish,300);return}
    var i=o.pick;if(i==null){do{i=Math.floor(Math.random()*ANIMS.length)}while(ANIMS.length>1&&i===lastIdx)}lastIdx=i;
    stage.style.setProperty('--shx-bk',o.back);
    var m=M(stage),A=ANIMS[i],ctx=A.build(stage);
    setTimeout(finish,9000);
    sleep(250).then(function(){return A.run(stage,ctx)}).then(function(){return sleep(150)}).then(finish).catch(finish);
  }
  return{run:run,count:function(){return ANIMS.length}};
})();
/*SHX-END*/
