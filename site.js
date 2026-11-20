
const BOOKS={
  fashion:{title:'Fashion',pre:'f',spreads:['01-02','03-04','05-06','07-08','09-10','11-12','13-14','15-16','17-18','19-20'],
    groups:[
      {name:'CLO 3D',items:[{t:'CLO 3D',s:['01-02','03-04','05-06'],sub:'Personal studies'}]},
      {name:'Apparel vendor',items:[{t:'경승 R&D',s:['07-08'],sub:'3D garment R&D'}]},
      {name:'Designer brand',items:[{t:'Aesynctx',s:['09-10','11-12','13-14'],sub:'2025 S/S'}]},
      {name:'Graduation fashion show',items:[{t:'Princess',s:['15-16','17-18'],sub:'Gown'},{t:'Knight',s:['19-20'],sub:'Body suit',h:1}]}]},
  '3d':{title:'3D Creation',pre:'d',spreads:['01-02','03-04','05-06','07-08','09-10','11-12','13-14','15-16','17-18','19-20','21-22','23-24','25-26','27-28','29-30','31-32','33-34','35-36','37-38','39-40','41-42','43-44','45-46'],
    groups:[
      {name:'K-pop artist art pieces',items:[
        {t:'LE SSERAFIM',s:['01-02','03-04','05-06'],sub:'“Made My Night” performance film'},
        {t:'BABYMONSTER',s:['07-08','09-10','11-12','13-14'],sub:'“MOON” M/V',h:1},
        {t:'NewKin',s:['15-16','17-18','19-20'],sub:'LOG IN: ERROR'}]},
      {name:'Custom order',items:[
        {t:'Aesynctx',s:['21-22'],sub:'Brand collaboration',h:1},
        {t:'Crown Bag',s:['23-24'],m3d:{on:['23-24'],src:'m_cb.txt',name:'Crown Bag',yaw:.35,pitch:.12},sub:'For voguing dancer (JUJU)'},
        {t:'VP Pendant',s:['25-26'],m3d:{on:['25-26'],src:'m_vp.txt',name:'VP Pendant',yaw:0},sub:'Musician (VP)'},
        {t:'Graduation Show Accessories',s:['27-28'],sub:'Flesh and Bones'}]},
      {name:'Merchandise',items:[
        {t:'Fairy Tail Ear Cuff',s:['29-30','31-32','33-34'],m3d:{on:['31-32','33-34'],src:'m_ec.txt',name:'Fairy Tail Ear Cuff',yaw:-1.57},sub:'Personal brand'},
        {t:'Guillotine',s:['35-36','37-38'],sub:'Personal brand'}]},
      {name:'Graduation work',items:[{t:'Princess',s:['39-40','41-42'],sub:'3D armor'},{t:'Knight',s:['43-44','45-46'],sub:'3D armor'}]}]}
};
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'rnd';
for(const [k,b] of Object.entries(BOOKS)){b.key=k;b.items=[];b.owner={};
  b.groups.forEach(g=>g.items.forEach(it=>{it.id=k+'-'+slug(it.t);it.book=k;b.items.push(it);it.s.forEach(s=>b.owner[s]=it);}));}
const CATS=[
  {key:'client',col:0,title:'Client work',groups:[
    {name:'K-pop artists',hl:true,items:[['3d-le-sserafim',0,'HYBE'],['3d-babymonster',0,'YG'],['3d-newkin']]},
    {name:'Artists & brands',col:1,items:[['3d-crown-bag'],['3d-vp-pendant'],['3d-aesynctx','Aesynctx collab'],['3d-graduation-show-accessories','Fashion show accessories']]}]},
  {key:'brand',col:1,title:'Fashion brands',groups:[
    {name:null,items:[['fashion-aesynctx','Aesynctx','25 S/S'],['fashion-r-d','경승','R&D']]}]},
  {key:'personal',col:1,title:'Personal work',groups:[
    {name:null,items:[['3d-fairy-tail-ear-cuff'],['3d-guillotine'],['3d-princess','Graduation collection'],['fashion-clo-3d','CLO 3D studies']]}]}];
{const byId={};for(const b of Object.values(BOOKS))b.items.forEach(it=>byId[it.id]=it);
 CATS.forEach(c=>c.groups.forEach(g=>g.items=g.items.map(([id,l,note])=>{const it=byId[id];if(!it)throw new Error('cat '+id);return{it,label:l||it.t,note:note||''}})));}
const CAT_OF={};CATS.forEach(c=>c.groups.forEach(g=>g.items.forEach(x=>CAT_OF[x.it.id]=c.key)));
const img=(b,s,t)=>`img/${b.pre}${s}${t?'_t':''}.webp`;
const pages=s=>{const [a,c]=s.split('-');return a+'–'+c};
const range=it=>it.s[0].split('-')[0]+'–'+it.s[it.s.length-1].split('-')[1];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----- point cloud viewer ----- */
const MODELS=[
 {k:'vp',name:'VP Pendant',fr:'for VP',id:'3d-vp-pendant',f:.95},
 {k:'skull7',name:'Motorcycle Ornament',fr:'for BABYMONSTER',id:'3d-babymonster',f:.55},
 {k:'headset',name:'Headset',fr:'for LE SSERAFIM',id:'3d-le-sserafim',f:.9},
 {k:'ec',name:'Fairy Tail Ear Cuff',fr:'Personal brand',id:'3d-fairy-tail-ear-cuff',f:1}];
const ALL=Object.values(BOOKS).flatMap(b=>b.items);
const NP=50000,pos=new Float32Array(NP*3),nor=new Float32Array(NP*3),fromP=new Float32Array(NP*3),fromN=new Float32Array(NP*3);
const ox_=new Float32Array(NP),oy_=new Float32Array(NP),vx_=new Float32Array(NP),vy_=new Float32Array(NP),ph=new Float32Array(NP),ph2=new Float32Array(NP),kt=new Float32Array(NP).fill(9);for(let i=0;i<NP;i++){ph[i]=Math.random();ph2[i]=Math.random()}let lastNow=0,cvx=0,cvy=0,pmx2=-1e4,pmy2=-1e4;
const pc=document.getElementById('pc'),pctx=pc.getContext('2d');
let swayBase=0,cm=-1,mt0=-1,MDUR=RM?1:1700,rotY=0,rotX=-.1,vy=0,vx=0,drag=null,mx=-1e4,my=-1e4,auto=true,autoT=0,ready=false,W=0,H=0,DPR=1;
function pcSize(){DPR=Math.min(devicePixelRatio||1,2);W=pc.width=Math.round(pc.clientWidth*DPR);H=pc.height=Math.round(pc.clientHeight*DPR)}
new ResizeObserver(pcSize).observe(pc);
fetch('models.txt').then(r=>r.text()).then(t=>{const bs=atob(t.trim()),buf=new ArrayBuffer(bs.length),u8=new Uint8Array(buf);for(let i=0;i<bs.length;i++)u8[i]=bs.charCodeAt(i);
  let o=0;MODELS.forEach(m=>{m.p=new Float32Array(NP*3);m.n=new Float32Array(NP*3);const a=new Int16Array(buf,o,NP*3);o+=NP*6;const n=new Int8Array(buf,o,NP*3);o+=NP*3;
    for(let i=0;i<NP*3;i++){m.p[i]=a[i]/32000;m.n[i]=n[i]/127}});
  [MODELS[0],MODELS[3]]=[MODELS[3],MODELS[0]];
  ready=true;pos.set(MODELS[0].p);nor.set(MODELS[0].n);select(0,false);
  if(!RM){for(let i=0;i<NP*3;i++)fromP[i]=(Math.random()-.5)*2.6;fromN.set(MODELS[0].n);fFrom=MODELS[0].f;mt0=performance.now()}}).catch(()=>{});
const spec=document.getElementById('spec');
MODELS.forEach((m,i)=>{const b=document.createElement('button');b.className='pe';b.textContent=String(i+1).padStart(2,'0');b.title=m.name;b.setAttribute('aria-label',m.name);
  b.onclick=()=>{auto=false;select(i,true)};spec.appendChild(b)});
function select(i,anim){if(i===cm||!ready)return;const m=MODELS[i];
  if(anim&&cm>=0){fromP.set(pos);fromN.set(nor);mt0=performance.now();fFrom=fNow}else{pos.set(m.p);nor.set(m.n)}
  cm=i;spec.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',j===i));
  const it=ALL.find(x=>x.id===m.id);document.getElementById('mName').textContent=m.name;document.getElementById('mFor').textContent=m.fr;const l=document.getElementById('mLink');l.href='#'+m.id;l.textContent='view project';
  clearTimeout(autoT);if(auto)autoT=setTimeout(()=>select((cm+1)%MODELS.length,true),12000)}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const L=[-.45,.55,.7],Ln=Math.hypot(...L);L[0]/=Ln;L[1]/=Ln;L[2]/=Ln;
let acc=null,accW=0,accH=0,fFrom=1,fNow=1,pmx=-1e4,pmy=-1e4;
function frame(now){
  if(ready&&!document.getElementById('home').hidden&&W){
    if(accW!==W||accH!==H){acc=new Float32Array(W*H);accW=W;accH=H}
    if(mt0>=0){const m=MODELS[cm],T=(now-mt0)/MDUR;let done=true;
      for(let i=0;i<NP;i++){const t=Math.min(1,Math.max(0,(T-(i/NP)*.4)/.6));if(t<1)done=false;const e=ease(t),j=3*i;
        for(let c=0;c<3;c++){pos[j+c]=fromP[j+c]+(m.p[j+c]-fromP[j+c])*e;nor[j+c]=fromN[j+c]+(m.n[j+c]-fromN[j+c])*e}}
      fNow=fFrom+(m.f-fFrom)*ease(Math.min(1,T));if(done)mt0=-1}else if(cm>=0)fNow=MODELS[cm].f;
    if(!drag){rotY+=vy;rotX+=vx;vy+=((RM?0:.0026)-vy)*.02;vx*=.94;rotX+=(-.1-rotX)*.01}
    const cy=Math.cos(rotY),sy=Math.sin(rotY),cxr=Math.cos(rotX),sxr=Math.sin(rotX);
    const S_=Math.min(W,H)*.34,cam=5,ccx=W/2,ccy=H/2,R=50*DPR,R2=R*R,mxd=mx*DPR,myd=my*DPR;
    acc.fill(0);let x0=W,x1=0,y0=H,y1=0;const amp=(DPR>1.5?1.3:1.0)*fNow*(pc.clientWidth<520?1.7:1);
    lastNow=now;if(mx>-1e3&&pmx2>-1e3){cvx=cvx*.5+(mx-pmx2)*DPR*.5;cvy=cvy*.5+(my-pmy2)*DPR*.5}else{cvx*=.5;cvy*=.5}pmx2=mx;pmy2=my;const spd=Math.min(60*DPR,Math.hypot(cvx,cvy));
    const st=pc.clientWidth<520?2:1;
    for(let i=0;i<NP;i+=st){const j=3*i,x=pos[j],y=pos[j+1],z=pos[j+2];
      const xr=x*cy+z*sy,zr=-x*sy+z*cy,yr=y*cxr-zr*sxr,z2=y*sxr+zr*cxr;
      const nx=nor[j],ny=nor[j+1],nz=nor[j+2];const nx1=nx*cy+nz*sy,nz1=-nx*sy+nz*cy,ny1=ny*cxr-nz1*sxr,nz2=ny*sxr+nz1*cxr;
      const k=cam/(cam-z2);let X=ccx+xr*S_*k,Y=ccy-yr*S_*k;
      const lam=Math.abs(nx1*L[0]+ny1*L[1]+nz2*L[2]),dep=(z2+1)/2;
      let v=amp*(.10+.55*lam)*(.35+.65*dep)*(.6+.4*Math.abs(nz2));
      // cursor scatter: grains are flung free (no pull while flying), drift on a soft current, then ease straight home
      if(spd>.3){const dx=X+ox_[i]-mxd,dy=Y+oy_[i]-myd;
        if(dx*dx+dy*dy<R2*4){const ux=cvx/spd,uy=cvy/spd,al=dx*ux+dy*uy,pe=-dx*uy+dy*ux;
          const ra=al<0?R*1.9:R*.7,rp=R*(.55+.35*Math.sin(Math.atan2(dy,dx)*3+now*.004));
          const q=(al/ra)*(al/ra)+(pe/rp)*(pe/rp),edge=.35+ph2[i]*.9;
          if(q<edge&&Math.random()<.55){const w=1-q/edge,f=Math.min(1,spd/(14*DPR)),an=Math.atan2(cvy,cvx)+(ph[i]-.5)*1.6+Math.sign(pe)*.35,mg=(1.5+ph2[i]*4.5)*(.2+.8*w)*f*DPR;
            vx_[i]+=Math.cos(an)*mg;vy_[i]+=Math.sin(an)*mg;kt[i]=0}}}
      if(kt[i]<2){kt[i]+=1/60;const k_=kt[i];
        if(k_<.68){vx_[i]*=.948;vy_[i]*=.948;ox_[i]+=vx_[i];oy_[i]+=vy_[i]}
        else{vx_[i]=vy_[i]=0;const r_=.045+(k_-.68)*.1;ox_[i]*=1-Math.min(.5,r_);oy_[i]*=1-Math.min(.5,r_);if(Math.abs(ox_[i])+Math.abs(oy_[i])<.1){ox_[i]=oy_[i]=0;kt[i]=9}}
        const d_=Math.min(1,(Math.abs(ox_[i])+Math.abs(oy_[i]))/(40*DPR));v*=1-.6*d_}
      X+=ox_[i];Y+=oy_[i];
      const fx=Math.floor(X),fy=Math.floor(Y);if(fx<0||fy<0||fx>=W-1||fy>=H-1)continue;
      const ax=X-fx,ay=Y-fy,q=fy*W+fx;
      acc[q]+=v*(1-ax)*(1-ay);acc[q+1]+=v*ax*(1-ay);acc[q+W]+=v*(1-ax)*ay;acc[q+W+1]+=v*ax*ay;
      if(fx<x0)x0=fx;if(fx+1>x1)x1=fx+1;if(fy<y0)y0=fy;if(fy+1>y1)y1=fy+1}
    pctx.clearRect(0,0,W,H);
    if(x1>x0){const rw=x1-x0+1,rh=y1-y0+1,part=pctx.createImageData(rw,rh),pd=part.data;
      for(let yy=0;yy<rh;yy++){let si=(y0+yy)*W+x0,di=yy*rw*4;for(let xx=0;xx<rw;xx++,si++,di+=4){const a_=acc[si];if(a_>0){pd[di]=21;pd[di+1]=21;pd[di+2]=21;pd[di+3]=255*(1-Math.exp(-a_*2.1))}}}
      pctx.putImageData(part,x0,y0)}
  }
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
pc.addEventListener('pointerdown',e=>{zHint.down(e);drag={x:e.clientX,y:e.clientY,t:performance.now()};pc.classList.add('drag');pc.setPointerCapture(e.pointerId);auto=false;clearTimeout(autoT)});
pc.addEventListener('pointermove',e=>{const r=pc.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;
  if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;rotY+=dx*.008;rotX=Math.max(-1.4,Math.min(1.4,rotX+dy*.008));vy=dx*.008;vx=dy*.004;drag.x=e.clientX;drag.y=e.clientY}});
const zHint=(()=>{const h=document.querySelector('.z-hint');let t=0,x0=0,y0=0,real=0;
  const show=()=>{h&&h.classList.remove('off')};
  return{down(e){clearTimeout(t);if(h){h.style.animation='none';h.classList.add('off')}x0=e.clientX;y0=e.clientY},
         up(e){const d=Math.hypot((e.clientX||x0)-x0,(e.clientY||y0)-y0);if(d>50)real++;clearTimeout(t);t=setTimeout(show,real?20000:4000)}}})();
const endDrag=e=>{if(drag)zHint.up(e);drag=null;pc.classList.remove('drag')};pc.addEventListener('pointerup',endDrag);pc.addEventListener('pointercancel',endDrag);
pc.addEventListener('pointerleave',()=>{if(!drag){mx=my=-1e4}});
const MODEL_OF={};MODELS.forEach((m,i)=>{if(!(m.id in MODEL_OF))MODEL_OF[m.id]=i});
function hoverItem(it){if(it.id in MODEL_OF){auto=false;select(MODEL_OF[it.id],true)}}

/* ----- home contents ----- */
const toc=document.getElementById('toc');
const rowH=x=>`<a class="row" href="#${x.it.id}" data-id="${x.it.id}">${x.label}${x.note?`<span class="nt">${x.note}</span>`:''}</a>`;
for(const col of [0,1]){
  const sec=document.createElement('section');
  sec.innerHTML=CATS.map(c=>{const gs=c.groups.filter(g=>(g.col??c.col)===col);if(!gs.length)return '';
    const first=(c.groups[0].col??c.col)===col;
    return (first?`<h2><a href="#${c.groups[0].items[0].it.id}">${c.title.toLowerCase()}</a></h2>`:`<h2 class="sp" aria-hidden="true">&nbsp;</h2>`)+gs.map(g=>
    `<div class="top${g.hl?' hl':''}">${g.name?`<span class="sl">${g.name}</span>`:''}${g.items.map(rowH).join('')}</div>`).join('')}).join('');
  toc.appendChild(sec)}
toc.querySelectorAll('.gl').forEach(btn=>btn.onclick=()=>{const g=btn.parentElement,o=!g.classList.contains('open');toc.querySelectorAll('.grp.open').forEach(x=>{x.classList.remove('open');x.firstChild.setAttribute('aria-expanded','false')});g.classList.toggle('open',o);btn.setAttribute('aria-expanded',o)});
toc.querySelectorAll('a.row').forEach(a=>{a.onmouseenter=a.onfocus=()=>{const it=ALL.find(x=>x.id===a.dataset.id);if(it)hoverItem(it)}});

/* ----- contact ----- */
const ctBtn=document.getElementById('ctBtn'),ctBox=document.getElementById('ctBox');
document.querySelector('.z-credit').onclick=e=>{const b=e.currentTarget;b.classList.toggle('on');b.setAttribute('aria-expanded',b.classList.contains('on'))};
ctBtn.onclick=()=>{const o=ctBox.hidden;ctBox.hidden=!o;ctBtn.setAttribute('aria-expanded',o)};
ctBox.querySelectorAll('.cp').forEach(b=>b.onclick=()=>{const done=()=>{b.textContent='copied';setTimeout(()=>b.textContent='copy',1400)};
  try{navigator.clipboard.writeText(b.dataset.v).then(done,()=>{const r=document.createRange();r.selectNodeContents(b.previousElementSibling);const sel=getSelection();sel.removeAllRanges();sel.addRange(r)})}catch(e){}});

/* ----- 3d viewer (protected mesh: xor-packed, positions de-scrambled only in the vertex shader) ----- */
const V3D=(()=>{
  let ov=null,cv=null,gl=null,raf=0,state=null;
  const cache={};
  const XS=(n,seed)=>{const o=new Uint32Array(n);let x=seed>>>0;for(let i=0;i<n;i++){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;o[i]=x}return o};
  async function load(src){
    if(cache[src])return cache[src];
    const t=await (await fetch(src)).text();const bin=atob(t.trim());let u=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const w=new Uint32Array(u.buffer,0,u.length>>2),k=XS(w.length,0x9E3779B9);for(let i=0;i<w.length;i++)w[i]^=k[i];
    const zl=new DataView(u.buffer).getUint32(0,true);
    const ds=new Blob([u.subarray(4,4+zl)]).stream().pipeThrough(new DecompressionStream('deflate'));
    u=new Uint8Array(await new Response(ds).arrayBuffer());
    const dv=new DataView(u.buffer),nv=dv.getUint32(4,true),nt=dv.getUint32(8,true);
    const lo=[0,1,2].map(i=>dv.getFloat32(16+i*4,true)),ext=[0,1,2].map(i=>dv.getFloat32(28+i*4,true));
    let o=40;const q=new Uint16Array(u.buffer.slice(o,o+nv*6));o+=nv*6;const n=new Int8Array(u.buffer.slice(o,o+nv*2));o+=nv*2;
    const dd=new Int32Array(u.buffer.slice(o,o+nt*12));const idx=new Uint32Array(nt*3);let acc=0;for(let i=0;i<dd.length;i++){acc+=dd[i];idx[i]=acc}
    return cache[src]={nv,nt,lo,ext,q,n,idx,it:2};
  }
  const VS=`#version 300 es
in uvec3 aQ;in vec2 aN;uniform mat4 uP,uV;uniform mat3 uR;uniform vec3 uLo,uExt,uC;uniform float uS;uniform uint uK;out vec3 vN;out vec3 vW;
uint h(uint x){x^=x>>16;x*=0x7feb352du;x^=x>>15;x*=0x846ca68bu;x^=x>>16;return x;}
vec3 oct(vec2 e){vec3 v=vec3(e,1.-abs(e.x)-abs(e.y));if(v.z<0.)v.xy=(1.-abs(v.yx))*vec2(v.x>=0.?1.:-1.,v.y>=0.?1.:-1.);return normalize(v);}
void main(){uint i=uint(gl_VertexID)*3u;uvec3 q=(aQ-uvec3(h(i^uK),h((i+1u)^uK),h((i+2u)^uK)))&uvec3(65535u);
vec3 p=uLo+vec3(q)/65535.*uExt;p=uR*((p-uC)*uS);vN=uR*oct(aN);vW=p;gl_Position=uP*uV*vec4(p,1.);}`;
  const FS=`#version 300 es
precision highp float;in vec3 vN;in vec3 vW;uniform vec3 uEye;out vec4 o;
void main(){vec3 n=normalize(vN);vec3 v=normalize(uEye-vW);
vec3 L1=normalize(vec3(-.45,.75,.55)),L2=normalize(vec3(.7,.1,.4));
float d1=max(dot(n,L1),0.),d2=max(dot(n,L2),0.)*.35,hemi=.5+.5*n.y;
float sp=pow(max(dot(n,normalize(L1+v)),0.),48.)*.35;float rim=pow(1.-max(dot(n,v),0.),3.)*.18;
vec3 base=vec3(.80,.80,.79);vec3 c=base*(.30+.18*hemi+.62*d1+d2)+sp+rim;
o=vec4(pow(c,vec3(1./1.05)),1.);}`;
  function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(x);return x}
  const persp=(f,a,n,fa)=>{const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0]};
  const rotM=(y,x)=>{const cy=Math.cos(y),sy=Math.sin(y),cx=Math.cos(x),sx=Math.sin(x);return[cy,0,-sy, sy*sx,cx,cy*sx, sy*cx,-sx,cy*cx]};
  const mul3=(a,b)=>{const r=[];for(let c=0;c<3;c++)for(let rr=0;rr<3;rr++){let s=0;for(let k=0;k<3;k++)s+=a[k*3+rr]*b[c*3+k];r[c*3+rr]=s}return r};
  function build(){
    ov=document.createElement('div');ov.id='v3d';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
    ov.innerHTML=`<div class="v3-bar"><span class="v3-t"></span><button class="v3-x" type="button">close</button></div><canvas></canvas><div class="v3-hint">drag to rotate &middot; scroll to zoom</div><div class="v3-load">loading 3d model</div>`;
    document.body.appendChild(ov);cv=ov.querySelector('canvas');
    ov.querySelector('.v3-x').onclick=close;
    cv.addEventListener('contextmenu',e=>e.preventDefault());
    let drag=null;const pts=new Map();
    cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY};if(state)state.idle=0});
    cv.addEventListener('pointermove',e=>{if(!state||!pts.has(e.pointerId))return;const pr=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);
      if(pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(state.pd)state.dist=Math.min(7,Math.max(1.2,state.dist*state.pd/d));state.pd=d;return}
      state.vy=(e.clientX-pr[0])*.008;state.vx=(e.clientY-pr[1])*.008;state.yaw+=state.vy;state.pitch=Math.max(-1.45,Math.min(1.45,state.pitch+state.vx));state.idle=0});
    const up=e=>{pts.delete(e.pointerId);if(state)state.pd=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    cv.addEventListener('wheel',e=>{if(!state)return;e.preventDefault();state.dist=Math.min(7,Math.max(1.2,state.dist*Math.exp(e.deltaY*.0012)))},{passive:false});
  }
  async function open(m){
    if(!ov)build();ov.querySelector('.v3-t').textContent=m.name+' \u2014 3d';ov.classList.add('on');document.documentElement.style.overflow='hidden';
    ov.querySelector('.v3-x').focus({preventScroll:true});
    const ld=ov.querySelector('.v3-load');ld.hidden=false;
    gl=cv.getContext('webgl2',{antialias:true,alpha:false,preserveDrawingBuffer:false});
    if(!gl){ld.textContent='3d view needs webgl2';return}
    const d=await load(m.src);if(!ov.classList.contains('on'))return;ld.hidden=true;
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const bq=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bq);gl.bufferData(gl.ARRAY_BUFFER,d.q,gl.STATIC_DRAW);
    let l=gl.getAttribLocation(pr,'aQ');gl.enableVertexAttribArray(l);gl.vertexAttribIPointer(l,3,gl.UNSIGNED_SHORT,0,0);
    const bn=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bn);gl.bufferData(gl.ARRAY_BUFFER,d.n,gl.STATIC_DRAW);
    l=gl.getAttribLocation(pr,'aN');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.BYTE,true,0,0);
    const bi=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bi);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,d.idx,gl.STATIC_DRAW);
    const U=n=>gl.getUniformLocation(pr,n);
    const c=d.lo.map((v,i)=>v+d.ext[i]/2),s=2/Math.max(...d.ext);
    gl.uniform3fv(U('uLo'),d.lo);gl.uniform3fv(U('uExt'),d.ext);gl.uniform3fv(U('uC'),c);gl.uniform1f(U('uS'),s);gl.uniform1ui(U('uK'),0x5A17C3E9);
    gl.enable(gl.DEPTH_TEST);gl.clearColor(.969,.969,.961,1);
    const base=m.base||[1,0,0,0,1,0,0,0,1];
    state={yaw:m.yaw||0,pitch:m.pitch||0,vy:0,vx:0,dist:m.dist||3.9,idle:120,pd:0};
    const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame=()=>{raf=requestAnimationFrame(frame);
      const dpr=Math.min(devicePixelRatio||1,2),W=Math.round(cv.clientWidth*dpr),H=Math.round(cv.clientHeight*dpr);
      if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}gl.viewport(0,0,W,H);
      state.idle++;if(!RM&&state.idle>90)state.yaw+=.0025;else{state.vy*=.9;state.vx*=.9}
      const R=mul3(rotM(state.yaw,state.pitch),base);
      gl.uniformMatrix3fv(U('uR'),false,R);gl.uniformMatrix4fv(U('uP'),false,persp(.6,W/H,.1,50));
      gl.uniformMatrix4fv(U('uV'),false,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,-state.dist,1]);gl.uniform3f(U('uEye'),0,0,state.dist);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawElements(gl.TRIANGLES,d.nt*3,d.it===1?gl.UNSIGNED_SHORT:gl.UNSIGNED_INT,0)};
    frame();
  }
  function close(){if(!ov)return;ov.classList.remove('on');document.documentElement.style.overflow='';cancelAnimationFrame(raf);
    if(gl){const e=gl.getExtension('WEBGL_lose_context');e&&e.loseContext()}gl=null;state=null;
    ov.remove();ov=null;cv=null}
  addEventListener('keydown',e=>{if(e.key==='Escape'&&ov)close()});
  return{open,close};
})();

/* ----- book ----- */
const bookEl=document.getElementById('book'),nowEl=document.getElementById('now');
let current=null,currentItem=null,obs=null;
function renderBook(k){
  if(current===k)return;current=k;const b=BOOKS[k];
  bookEl.innerHTML='';
  b.spreads.forEach(s=>{const it=b.owner[s];const d=document.createElement('article');d.className='spread';
    if(it&&it.s[0]===s)d.id=it.id;
    d.innerHTML=`<img class="pg" src="${img(b,s)}" width="1190" height="842" loading="lazy" decoding="async" alt="${it?it.t+(it.sub?' — '+it.sub:''):''} · hangyoel ko portfolio, pages ${pages(s)}">
      <div class="halves"><div class="half"><img src="${img(b,s)}" loading="lazy" alt="${it?it.t:''} page ${s.split('-')[0]}"></div><div class="half r"><img src="${img(b,s)}" loading="lazy" alt="${it?it.t:''} page ${s.split('-')[1]}"></div></div>
      <div class="tag mono"><span>${it?it.t:''}</span><span>${pages(s)}</span></div>${it&&it.m3d&&it.m3d.on.includes(s)?'<div class="v3row"><button class="v3b" type="button">view in 3d</button></div>':''}`;
    const vb=d.querySelector('.v3b');if(vb)vb.onclick=()=>V3D.open(it.m3d);
    d.dataset.p=it?it.id:'';bookEl.appendChild(d)});
  const other=k==='fashion'?'3d':'fashion';
  const n=document.createElement('div');n.className='next';n.innerHTML=`<span>next</span><a href="#${other}">${BOOKS[other].title.toLowerCase()}</a>`;bookEl.appendChild(n);
  if(obs)obs.disconnect();
  obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const it=b.items.find(i=>i.id===e.target.dataset.p);if(it){currentItem=it;nowEl.textContent=it.t;markIdx()}}})},{rootMargin:'-45% 0px -50% 0px'});
  bookEl.querySelectorAll('.spread').forEach(s=>obs.observe(s));
  currentItem=b.items[0];nowEl.textContent=currentItem.t;markIdx();
}

/* ----- index drawer ----- */
const idx=document.getElementById('index'),scrim=document.getElementById('scrim'),ilist=document.getElementById('idxList');
const iRow=({it,label,note},cls)=>{const a=document.createElement('a');a.className='iproj'+(cls?' '+cls:'');a.href='#'+it.id;a.dataset.id=it.id;
  a.innerHTML=`<i></i><span>${label}${note?`<em class="nt">${note}</em>`:''}</span><span class="mono">${it.book==='3d'?'3d':'fashion'} p.${range(it)}</span>`;return a};
for(const c of CATS){
  const sec=document.createElement('div');sec.className='ibook';
  sec.innerHTML=`<a class="ibhead" href="#${c.groups[0].items[0].it.id}">${c.title}</a>`;
  c.groups.forEach(g=>{if(g.name){const h=document.createElement('div');h.className='isl';h.textContent=g.name;sec.appendChild(h)}
    g.items.forEach(x=>sec.appendChild(iRow(x,g.hl?'itop ihl':'itop')))});
  ilist.appendChild(sec);
}
function markIdx(){const ck=currentItem&&CAT_OF[currentItem.id];document.querySelectorAll('.tabs a').forEach(a=>a.setAttribute('aria-current',a.dataset.tab===ck));ilist.querySelectorAll('.iproj').forEach(p=>{const on=!!currentItem&&p.dataset.id===currentItem.id;p.setAttribute('aria-current',on);if(on){const sub=p.closest('.isub');if(sub){sub.classList.add('open');sub.previousElementSibling.setAttribute('aria-expanded','true')}}})}
function openIdx(){markIdx();idx.classList.add('on');scrim.classList.add('on');document.getElementById('closeIdx').focus();
  const c=ilist.querySelector('[aria-current="true"]');if(c)c.scrollIntoView({block:'center'})}
function closeIdx(){idx.classList.remove('on');scrim.classList.remove('on')}
document.getElementById('openIdx').onclick=openIdx;document.getElementById('closeIdx').onclick=closeIdx;scrim.onclick=closeIdx;
ilist.addEventListener('click',e=>{if(e.target.closest('a'))closeIdx()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeIdx()});

/* ----- routing ----- */
function go(id){if(location.hash==='#'+id)route();else location.hash=id}
function route(){
  const h=(location.hash||'').slice(1)||'home';
  if(h==='home'||!(h==='fashion'||h==='3d'||h.startsWith('fashion-')||h.startsWith('3d-'))){
    document.getElementById('home').hidden=false;document.getElementById('bookview').hidden=true;scrollTo(0,0);
    closeIdx();pcSize();return}
  const k=h.startsWith('fashion')?'fashion':'3d';
  document.getElementById('home').hidden=true;document.getElementById('bookview').hidden=false;
  renderBook(k);
  if(h===k)scrollTo(0,0);
  else{const el=document.getElementById(h);if(el)requestAnimationFrame(()=>el.scrollIntoView({block:'start'}))}
}
addEventListener('hashchange',route);route();

/* ----- language toggle (ui text only; project titles stay as is) ----- */
(()=>{
const KO={'3d creation':'3D 작업','fashion':'패션','contact':'연락처','3d fashion & object':'3D · 패션 · 오브제','view project':'프로젝트 보기','index':'목차','close':'닫기','next':'다음','copy':'복사','copied':'복사됨','mail':'메일','instagram':'인스타그램',
'view in 3d':'3D로 보기','loading 3d model':'3D 모델 불러오는 중','3d view needs webgl2':'이 브라우저에서는 3D 보기를 지원하지 않습니다',
'commissions open — korean / english':'3D 모델링 · 3D 프린팅 외주 문의 — 한국어 / 영어','self-built website · designed & coded in 4 days':'자체 제작 웹사이트 · 4일 만에 디자인·개발','self-built website':'자체 제작 웹사이트','designed & coded in 4 days':'4일 만에 디자인·개발','drag to rotate':'드래그해서 돌려보기','client work':'외주 작업','personal work':'개인 작업','k-pop artists':'K-pop 아티스트','artists & brands':'아티스트 · 브랜드','fashion industry':'패션 업계','graduation collection':'졸업 컬렉션','clo 3d studies':'CLO 3D 스터디','fashion brands':'패션 브랜드','graduation':'졸업 작품','garments':'의상','worked with':'함께한 아티스트','show accessories':'쇼 액세서리','fashion show accessories':'패션쇼 액세서리','princess · armor':'Princess · 갑옷','princess · gown':'Princess · 드레스','knight · armor':'Knight · 갑옷','knight · body suit':'Knight · 바디수트','drag to rotate · scroll to zoom':'드래그해서 돌리기 · 스크롤해서 확대',
'k-pop artist art pieces':'K-pop 아티스트 아트피스','custom order':'주문 제작','merchandise':'머천다이즈','graduation work':'졸업 작품','apparel vendor':'의류 벤더','designer brand':'디자이너 브랜드','graduation fashion show':'졸업 패션쇼',
'“made my night” performance film':'“Made My Night” 퍼포먼스 필름','“moon” m/v':'“MOON” 뮤직비디오','brand collaboration':'브랜드 협업','for voguing dancer (juju)':'보깅 댄서 JUJU 의뢰','musician (vp)':'뮤지션 VP 의뢰',
'personal brand':'개인 브랜드','3d armor':'3D 갑옷','personal studies':'개인 작업','3d garment r&d':'3D 의상 R&D','gown':'드레스','body suit':'바디 슈트',
'for vp':'VP 의뢰','for babymonster':'베이비몬스터 작업','for le sserafim':'르세라핌 작업',
'3d modeling & printing for artists, brands and fashion — art pieces, accessories, props and clo 3d garments. open to commissions worldwide — korean / english.':'아티스트, 브랜드, 패션을 위한 3D 모델링과 3D 프린팅 — 아트피스, 액세서리, 소품, CLO 3D 의상. 해외 의뢰도 받습니다 (한국어 / 영어).'};
let LANG='en';try{LANG=localStorage.getItem('lang')||((navigator.language||'').toLowerCase().startsWith('ko')?'ko':'en')}catch(e){LANG=(navigator.language||'').toLowerCase().startsWith('ko')?'ko':'en'}
const ORIG=new WeakMap();
const tr=n=>{const o=ORIG.has(n)?ORIG.get(n):n.nodeValue;const k=o.trim().replace(/\s+/g,' ');const hit=KO[k.toLowerCase()];if(!hit)return;if(!ORIG.has(n))ORIG.set(n,o);const v=LANG==='ko'?o.replace(o.trim(),hit):o;if(n.nodeValue!==v)n.nodeValue=v};
const walk=r=>{if(r.nodeType===3){tr(r);return}if(r.nodeType!==1||r.closest&&r.closest('.lang'))return;const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())tr(n)};
const mark=()=>{document.documentElement.lang=LANG;document.querySelectorAll('.lang-cur').forEach(c=>c.textContent=LANG==='ko'?'kr':'en');document.querySelectorAll('.lang-m button').forEach(b=>b.setAttribute('aria-current',b.dataset.l===LANG))};
const IRX=/(img\/[df]\d\d-\d\d)(?:-ko)?((?:_t)?\.webp)$/;
const imgs=r=>{(r.querySelectorAll?r.querySelectorAll('img'):[]).forEach(im=>{const a=im.getAttribute('src')||'';if(IRX.test(a)){const n=a.replace(IRX,LANG==='ko'?'$1-ko$2':'$1$2');if(n!==a)im.setAttribute('src',n)}})};
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{walk(n);if(n.nodeType===1)imgs(n.tagName==='IMG'?n.parentNode:n)}))).observe(document.body,{childList:true,subtree:true});
const closeM=()=>document.querySelectorAll('.lang-m').forEach(m=>{m.hidden=true;m.previousElementSibling.setAttribute('aria-expanded','false')});
document.addEventListener('click',e=>{const b=e.target.closest('.lang-b'),o=e.target.closest('.lang-m button');
  if(b){const m=b.nextElementSibling,op=m.hidden;closeM();m.hidden=!op;b.setAttribute('aria-expanded',op);return}
  if(o){LANG=o.dataset.l;try{localStorage.setItem('lang',LANG)}catch(_){}closeM();mark();walk(document.body);imgs(document);return}
  if(!e.target.closest('.lang'))closeM()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
mark();walk(document.body);imgs(document);
})();
