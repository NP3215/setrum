/* Setrum – mobile app UI prototype. Front end only: all numbers are simulated. */
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k,d){try{const v=localStorage.getItem('setrum.'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('setrum.'+k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const num=(n,d=0)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const kw=n=>n>=100?num(n,0):n>=10?num(n,1):num(n,2);
const rp=n=>'Rp '+num(Math.round(n));
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ---------- icons ---------- */
const IC={
 ac:'<rect x="3" y="5" width="18" height="8" rx="2"/><path d="M6 9h12M7 16v2M12 16v3M17 16v2"/>',
 tv:'<rect x="2.500" y="4.500" width="19" height="12.500" rx="2"/><path d="M8 21h8M12 17v4"/>',
 pc:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 lamp:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.500 1 1.200 1 2.100h5c0-.9.400-1.600 1-2.100A6 6 0 0 0 12 3z"/>',
 fridge:'<rect x="6" y="2.500" width="12" height="19" rx="2.500"/><path d="M6 10h12M9 6v1.500M9 13v3"/>',
 fryer:'<path d="M5 9h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM8 9V7.500a4 4 0 0 1 8 0V9M19 12.500h2"/>',
 heater:'<path d="M7 3h10a1 1 0 0 1 1 1v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1zM10 8h4M10 12h4"/>',
 washer:'<rect x="4" y="2.500" width="16" height="19" rx="2.500"/><circle cx="12" cy="13.500" r="4.500"/><path d="M7.500 6h2"/>',
 router:'<rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 17h.01M11 17h.01M8.500 10.500a5 5 0 0 1 7 0M6 8a8.500 8.500 0 0 1 12 0"/>',
 cooker:'<path d="M4 11h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM2 11h20M9 8h6"/>',
 bolt:'<path d="M13 2 5 13.500h6L10 22l8-11.500h-6z"/>',
 warn:'<path d="M12 3 2 20h20zM12 10v4.500M12 17.500h.01"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
 plug:'<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5"/>',
 leaf:'<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l7-7"/>',
 flame:'<path d="M12 22a6.500 6.500 0 0 0 6.500-6.500c0-4-3-6-4-10-2 1.500-3 3.500-3 5.500-1.500-.5-2-2-2-3C7 10 5.500 12.500 5.500 15.500A6.500 6.500 0 0 0 12 22z"/>',
 wallet:'<path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-1zM16 14h.01"/>'
};
const svgI=(k,extra='')=>`<svg viewBox="0 0 24 24" ${extra}>${IC[k]||IC.plug}</svg>`;

/* ---------- device model ---------- */
const ALL=[...Array(24).keys()];
const TYPES={
 ac:{w:1400,color:'#5AB0FF',season:1,seg:[{h:[22,23,0,1,2,3,4,5],p:.75,d:[.5,.8]},{h:[12,13,14,15,16],p:.35,d:[.55,.85]},{h:[18,19,20,21],p:.3,d:[.5,.8]}]},
 tv:{w:120,color:'#FF8AD8',seg:[{h:[18,19,20,21,22,23],p:.6,d:[.85,1]},{h:[12,13],p:.1,d:[.85,1]}]},
 pc:{w:300,color:'#B58CFF',seg:[{h:[9,10,11,12,13,14,15,16,17],p:.85,d:[.6,.9],wk:1},{h:[19,20,21,22],p:.3,d:[.6,.9]}]},
 lamp:{w:9,color:'#FFD600',seg:[{h:[18,19,20,21,22,23],p:.9,d:[1,1]},{h:[5,6],p:.5,d:[1,1]}]},
 fridge:{w:150,color:'#3DDC97',seg:[{h:ALL,p:1,d:[.28,.45]}]},
 fryer:{w:1400,color:'#FF9F43',seg:[{h:[7],p:.15,d:[.15,.35]},{h:[12],p:.2,d:[.15,.35]},{h:[18,19],p:.3,d:[.2,.4]}]},
 heater:{w:1200,color:'#FF6B6B',seg:[{h:[5,6,7],p:.55,d:[.4,.7]},{h:[18,19,20],p:.45,d:[.4,.7]}]},
 washer:{w:500,color:'#4FD1C5',seg:[{h:[9,10,11,16],p:.18,d:[.5,.9]}]},
 router:{w:12,color:'#8AA4FF',seg:[{h:ALL,p:1,d:[.9,1]}]},
 cooker:{w:400,color:'#F6C177',seg:[{h:[6,17,18],p:.5,d:[.25,.5]}]}
};
const SEASON=[.8,.82,.92,1,1,.95,.95,1.05,1.15,1.15,1,.88];
const TARIFFS=[{id:'r1-1300',name:'R1 · 1,300 VA',rate:1444.7,cap:1300},{id:'r1-2200',name:'R1 · 2,200 VA',rate:1444.7,cap:2200},{id:'r2-3500',name:'R2 · 3,500 VA and up',rate:1699.53,cap:3500}];
const TEMPLATES={
 House:[['WindFree Air Conditioner','Samsung','ac'],['Smart TV QLED','Samsung','tv'],['Work PC','','pc'],['Living Room Lamp','PHILIPS','lamp'],['BESPOKE Refrigerator','Samsung','fridge'],['Air Fryer','PHILIPS','fryer']],
 Shop:[['Split Air Conditioner','','ac'],['Display Refrigerator','','fridge'],['Wi-Fi Router','','router'],['Shop Lamp','PHILIPS','lamp'],['Rice Cooker','','cooker']],
 Apartment:[['Air Conditioner','','ac'],['Smart TV','','tv'],['Refrigerator','','fridge'],['Wi-Fi Router','','router'],['Washing Machine','','washer'],['Water Heater','','heater']]
};
let uid=0;
function makeProp(name,kind,tariff){
 const id='p'+(++uid);
 const devices=TEMPLATES[kind].map(([n,b,t],i)=>({id:`${id}-${i}`,name:(b?b+' ':'')+n,type:t,manual:null,watts:0}));
 return {id,name,kind,tariff,devices};
}
const S={
 tab:'home',prop:0,mode:'day',offset:0,query:'',sort:'usage',sel:null,
 theme:store.get('theme','dark'),budget:store.get('budget',400),
 user:store.get('user',{name:'User',email:'user@example.com',phone:'+62 800 0000 0000'}),
 tariff:store.get('tariff','r1-2200'),
 prefs:store.get('prefs',{outage:true,fault:true,usage:true}),
 billMonth:0,billMode:'actual',alertFilter:'all',
 props:[makeProp('Jl. Nangka 55','House'),makeProp('Jl. Rambutan 33','Shop')],
 alerts:[],lastChecked:Date.now(),live:[],liveT:0
};
const cur=()=>S.props[S.prop];
const tariff=()=>TARIFFS.find(t=>t.id===S.tariff)||TARIFFS[1];

/* ---------- consumption generator (deterministic, seeded) ---------- */
const dayCache=new Map();
function hourSample(dev,key,h){
 const T=TYPES[dev.type],seg=T.seg.find(s=>s.h.includes(h));
 if(!seg)return{on:0,duty:0};
 const dt=new Date(key+'T00:00:00'),wkend=dt.getDay()===0||dt.getDay()===6;
 if(seg.wk&&wkend)return{on:0,duty:0};
 const r=rng(hash(dev.id.replace(/^p\d+-/,'')+dev.type+'|'+key+'|'+h+'|'+(dev.pid||'')));
 const p=Math.min(1,seg.p*(T.season?SEASON[dt.getMonth()]:1));
 const on=r()<p?1:0,duty=seg.d[0]+r()*(seg.d[1]-seg.d[0]);
 return{on,duty};
}
function dayData(prop,key){
 const ck=prop.id+'|'+key;let v=dayCache.get(ck);if(v)return v;
 const perDev=prop.devices.map(d=>{d.pid=prop.id;return ALL.map(h=>{const s=hourSample(d,key,h);return TYPES[d.type].w/1000*s.on*s.duty})});
 const total=ALL.map(h=>perDev.reduce((a,x)=>a+x[h],0));
 v={perDev,total};dayCache.set(ck,v);return v;
}
const sum=a=>a.reduce((x,y)=>x+y,0);
function period(prop,mode,offset,cutLike){
 const now=new Date(),n=prop.devices.length;
 let labels=[],values=[],perDev=Array(n).fill(0),title='',cut=null;
 if(mode==='day'){
  const d=new Date(now);d.setDate(d.getDate()-offset);const dd=dayData(prop,dkey(d));
  const lim=offset===0?now.getHours():23;
  labels=ALL.map(h=>pad(h)+':00');values=ALL.map(h=>h<=lim?dd.total[h]:null);
  dd.perDev.forEach((a,i)=>{perDev[i]=sum(a.slice(0,lim+1))});
  title=offset===0?'Today':offset===1?'Yesterday':`${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()].slice(0,3)}`;
  cut=lim;
 }else if(mode==='month'){
  const m=new Date(now.getFullYear(),now.getMonth()-offset,1),dim=new Date(m.getFullYear(),m.getMonth()+1,0).getDate();
  const lim=offset===0?now.getDate():dim;
  for(let i=1;i<=dim;i++){
   labels.push(String(i));
   if(i>lim){values.push(null);continue}
   const dd=dayData(prop,dkey(new Date(m.getFullYear(),m.getMonth(),i)));
   values.push(sum(dd.total));dd.perDev.forEach((a,j)=>{perDev[j]+=sum(a)});
  }
  title=offset===0?MON[m.getMonth()]:`${MON[m.getMonth()].slice(0,3)} ${m.getFullYear()}`;
  if(offset===0)title=MON[m.getMonth()]+' '+m.getFullYear();
  cut=lim;
 }else{
  const y=now.getFullYear()-offset,lim=offset===0?now.getMonth():11;
  for(let mo=0;mo<12;mo++){
   labels.push(MON[mo].slice(0,3));
   if(mo>lim){values.push(null);continue}
   let t=0;const dim=new Date(y,mo+1,0).getDate();
   for(let i=1;i<=dim;i++){if(offset===0&&mo===lim&&i>now.getDate())break;const dd=dayData(prop,dkey(new Date(y,mo,i)));t+=sum(dd.total);dd.perDev.forEach((a,j)=>{perDev[j]+=sum(a)})}
   values.push(t);
  }
  title=String(y);cut=lim;
 }
 const vals=values.filter(v=>v!=null);
 return{labels,values,perDev,total:sum(vals),title,mode,offset,avg:vals.length?sum(vals)/vals.length:0,cut};
}
/* like-for-like previous period total */
function prevTotal(prop,mode,offset){
 const now=new Date(),p=period(prop,mode,offset+1);
 if(offset!==0)return p.total;
 const k=mode==='day'?now.getHours()+1:mode==='month'?now.getDate():now.getMonth()+1;
 return sum(p.values.slice(0,k).filter(v=>v!=null));
}

/* ---------- live simulation ---------- */
function autoOn(dev){const n=new Date(),s=hourSample(Object.assign(dev,{pid:cur().id}),dkey(n),n.getHours());return s}
function devWatts(d,s,t){
 const T=TYPES[d.type],on=d.manual===null?!!s.on:d.manual;
 if(!on)return{on,w:0};
 const base=T.w*(d.manual===true&&!s.on?.55:(s.duty||.6)),ph=hash(d.id)%628/100;
 const wob=T.w<50?.04:d.type==='ac'?.28:d.type==='fridge'?.18:.14;
 const w=base*(1+wob*Math.sin(t/9+ph)+wob*.5*Math.sin(t/2.7+ph*2.1)+(Math.random()-.5)*.03);
 return{on,w:Math.max(0,w)};
}
function liveTick(){
 const now=new Date(),t=Date.now()/1000,key=dkey(now),hr=now.getHours();
 S.props.forEach(p=>p.devices.forEach(d=>{const r=devWatts(d,hourSample(Object.assign(d,{pid:p.id}),key,hr),t);d.on=r.on;d.watts=r.w}));
 S.live.push(liveTotal());if(S.live.length>60)S.live.shift();
}
function liveHistory(){
 const now=new Date(),key=dkey(now),hr=now.getHours(),p=cur(),t=Date.now()/1000;S.live=[];
 for(let k=59;k>=1;k--)S.live.push(sum(p.devices.map(d=>devWatts(d,hourSample(Object.assign(d,{pid:p.id}),key,hr),t-k).w)));
 liveTick();
}
const liveTotal=p=>sum((p||cur()).devices.map(d=>d.watts));

/* ---------- helpers ---------- */
function countUp(el,to,fmt,dur=800){
 if(!el)return;const from=el._v||0;el._v=to;
 if(reduce||Math.abs(to-from)<1e-9){el.textContent=fmt(to);return}
 const t0=performance.now();cancelAnimationFrame(el._r);
 const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)el._r=requestAnimationFrame(step)};
 el._r=requestAnimationFrame(step);
}
function niceMax(v){if(v<=0)return 1;const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e}
function toast(msg,undo){
 const t=$('#toast');t.innerHTML=`<span>${esc(msg)}</span>${undo?'<button>Undo</button>':''}`;t.classList.add('on');
 clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),undo?4200:2200);
 if(undo)$('button',t).onclick=()=>{undo();t.classList.remove('on')};
}
function relTime(ts){const m=Math.round((Date.now()-ts)/60000);if(m<1)return'Just now';if(m<60)return m+' min ago';const h=Math.round(m/60);if(h<24)return h+' h ago';return Math.round(h/24)+' d ago'}

/* ---------- sheet ---------- */
function openSheet(html,mount){
 $('#sheetBody').innerHTML=html;$('#scrim').classList.add('on');$('#sheet').classList.add('on');$('#sheet').style.transform='';
 if(mount)mount($('#sheetBody'));
}
function closeSheet(){$('#scrim').classList.remove('on');$('#sheet').classList.remove('on');$('#sheet').style.transform='';S.devSheet=null}
$('#scrim').onclick=closeSheet;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
(function(){const g=$('#grab'),s=$('#sheet');let y0=null,dy=0;
 g.addEventListener('pointerdown',e=>{y0=e.clientY;dy=0;s.classList.add('drag');g.setPointerCapture(e.pointerId)});
 g.addEventListener('pointermove',e=>{if(y0==null)return;dy=Math.max(0,e.clientY-y0);s.style.transform=`translateY(${dy}px)`});
 const end=()=>{if(y0==null)return;y0=null;s.classList.remove('drag');if(dy>110)closeSheet();else s.style.transform=''};
 g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end)})();

/* ---------- navigation ---------- */
const TABS=['home','bill','alerts','profile'];
function go(tab,instant){
 if(!TABS.includes(tab))tab='home';
 const from=TABS.indexOf(S.tab),to=TABS.indexOf(tab);
 $$('.view').forEach(v=>{
  const t=v.dataset.tab,active=t===tab;
  v.style.setProperty('--dx',active?'0':(TABS.indexOf(t)<to?'-28px':'28px'));
  if(active&&!v.classList.contains('active')){v.scrollTop=0;v.style.setProperty('--dx',to>from?'28px':'-28px');void v.offsetWidth;v.style.setProperty('--dx','0')}
  v.classList.toggle('active',active);
 });
 $$('.tabbar button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
 $('#tabbar').style.setProperty('--ti',to);
 S.tab=tab;history.replaceState(null,'','#'+tab);
 if(tab==='home')renderHome(true);if(tab==='bill')renderBill(true);if(tab==='alerts')renderAlerts();if(tab==='profile')renderProfile();
}
$$('.tabbar button').forEach(b=>b.onclick=()=>go(b.dataset.tab));
$('#bellBtn').onclick=()=>go('alerts');

/* ---------- HOME ---------- */
function greeting(){const h=new Date().getHours();return h<11?'Good morning':h<15?'Good afternoon':h<19?'Good evening':'Good night'}
function renderHeader(){
 const n=new Date();$('#greetDate').textContent=`${DOW[n.getDay()]}, ${n.getDate()} ${MON[n.getMonth()]}`;
 $('#greetHi').textContent=`${greeting()}, ${S.user.name||'there'}`;
 $('#propName').textContent=cur().name;
}
function heroData(){
 const p=cur(),t=tariff();
 if(S.mode==='live'){
  const w=liveTotal(p);return{label:'Right now',val:w,unit:'W',fmt:v=>num(v),delta:null,cost:w/1000*t.rate,costLbl:'Cost / hour',a:['Today so far',kw(period(p,'day',0).total)+' kWh'],b:['Devices on',p.devices.filter(d=>d.on).length+' of '+p.devices.length]};
 }
 const per=period(p,S.mode,S.offset),prev=prevTotal(p,S.mode,S.offset);
 const d=prev>0?(per.total-prev)/prev*100:0;
 const pk=Math.max(...per.values.filter(v=>v!=null),0),pi=per.values.indexOf(pk);
 const unit=S.mode==='day'?'/ h':S.mode==='month'?'/ day':'/ month';
 return{label:per.title,val:per.total,unit:'kWh',fmt:v=>kw(v),delta:d,deltaLbl:S.offset===0?(S.mode==='day'?'vs yesterday':S.mode==='month'?'vs last month':'vs last year'):'vs previous',
  cost:per.total*t.rate,costLbl:'Est. cost',a:[pk>0?`Peak · ${S.mode==='month'?'day '+per.labels[pi]:per.labels[pi]}`:'Peak',pk>0?`${kw(pk)} kWh`:'–'],b:['Average',`${kw(per.avg)} kWh/${S.mode==='day'?'h':S.mode==='month'?'day':'mo'}`]};
}
function renderHero(first){
 const hd=heroData(),el=$('#hero'),cap=tariff().cap,w=liveTotal(),pct=Math.min(1.1,w/cap),C=2*Math.PI*44;
 const co2=S.mode==='live'?w/1000*.87:hd.val*.87;
 if(!el.dataset.built||first){
  el.dataset.built=1;
  el.innerHTML=`<div class="hero-top"><span class="live-dot"></span><span id="hLabel"></span><span style="margin-left:auto" id="hProp"></span></div>
  <div class="hero-main"><div><div class="hero-num"><b id="hNum">0</b><small id="hUnit">kWh</small></div><div id="hChip"></div></div>
  <div class="ring" id="ring"><svg viewBox="0 0 104 104"><circle class="tr" cx="52" cy="52" r="44" fill="none" stroke-width="9"/><circle class="pr" cx="52" cy="52" r="44" fill="none" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><div class="ring-c"><b id="rW">0</b><small>W load</small></div></div></div>
  <div class="hero-stats"><div><small id="hs0"></small><b id="hv0"></b></div><div><small id="hs1"></small><b id="hv1"></b></div><div><small id="hs2"></small><b id="hv2"></b></div></div>`;
  el._v=0;$('#hNum')._v=0;
 }
 $('#hLabel').textContent=hd.label;$('#hProp').textContent=cur().name;$('#hUnit').textContent=hd.unit;
 const n=$('#hNum');
 if(S.mode==='live'){n._v=hd.val;n.textContent=hd.fmt(hd.val)}else countUp(n,hd.val,hd.fmt,first?900:600);
 let chip='';
 if(hd.delta!=null){const d=hd.delta,cls=Math.abs(d)<1?'flat':d>0?'up':'';chip=`<span class="chip ${cls}">${d>0?'▲':d<0?'▼':'■'} ${num(Math.abs(d),0)}% <span style="font-weight:500;opacity:.85">${hd.deltaLbl}</span></span>`}
 else{const over=w/cap;chip=`<span class="chip ${over>.9?'bad':over>.7?'up':''}">${num(over*100,0)}% of ${num(cap)} VA capacity</span>`}
 $('#hChip').innerHTML=chip;
 const ring=$('#ring');ring.className='ring'+(pct>.9?' bad':pct>.7?' warn':'');
 $('.pr',ring).style.strokeDashoffset=C*(1-Math.min(1,pct));$('#rW').textContent=num(w);
 [[hd.costLbl,rp(hd.cost)],hd.a,hd.b].forEach((r,i)=>{$('#hs'+i).textContent=r[0];$('#hv'+i).textContent=r[1]});
}
function renderSeg(){
 const seg=$('#seg'),ms=['live','day','month','year'];seg.style.setProperty('--i',ms.indexOf(S.mode));
 $$('button',seg).forEach(b=>b.setAttribute('aria-selected',b.dataset.m===S.mode));
}
$$('#seg button').forEach(b=>b.onclick=()=>{S.mode=b.dataset.m;S.offset=0;S.sel=null;renderSeg();renderHero();renderChartCard(true);renderInsights();renderDevices(false)});

/* charts */
function barChart(host,per,opts={}){
 const W=host.clientWidth||320,H=190,L=30,R=2,T=14,B=22,n=per.values.length;
 const vals=per.values.map(v=>v==null?0:v),max=niceMax(Math.max(...vals,.0001));
 const bw=(W-L-R)/n,gap=Math.max(1.5,Math.min(5,bw*.28)),w=bw-gap,iH=H-T-B,rx=Math.min(w/2,5);
 const y=v=>T+iH-(v/max)*iH,every=n>20?5:n>12?3:n>10?2:1;
 const labEvery=per.mode==='day'?6:per.mode==='month'?5:1;
 let g='';
 for(let i=0;i<=3;i++){const v=max/3*i,yy=y(v);g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}"/><text x="${L-6}" y="${yy+3.5}" text-anchor="end">${v>=10?num(v,0):num(v,v%1?1:0)}</text>`}
 let bars='',xl='';
 per.values.forEach((v,i)=>{
  const x=L+i*bw+gap/2,fut=v==null,hh=fut?2:Math.max(2,(v/max)*iH);
  bars+=`<rect class="bar${fut?' fut':''}" data-i="${i}" x="${x.toFixed(1)}" y="${(T+iH-hh).toFixed(1)}" width="${w.toFixed(1)}" height="${hh.toFixed(1)}" rx="${rx.toFixed(1)}" style="--d:${reduce?0:(i*(n>20?14:28))}ms"/>`;
  if(i%labEvery===0||(per.mode==='month'&&i===n-1&&n-1-Math.floor((n-1)/labEvery)*labEvery>2))xl+=`<text x="${(x+w/2).toFixed(1)}" y="${H-5}" text-anchor="middle">${per.mode==='day'?per.labels[i].slice(0,2):per.labels[i]}</text>`;
 });
 const avgY=y(per.avg),avg=per.avg>0?`<line class="avg" x1="${L}" x2="${W-R}" y1="${avgY}" y2="${avgY}"/>`:'';
 host.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Usage chart">${g}${avg}${bars}${xl}</svg><div class="tip"></div>`;
 const tip=$('.tip',host),svg=$('svg',host),unit=per.mode==='day'?'kWh':'kWh';
 const pick=e=>{
  const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)*(W/r.width),i=Math.max(0,Math.min(n-1,Math.floor((x-L)/bw)));
  if(per.values[i]==null){clear();return}
  host.classList.add('sel');$$('.bar',host).forEach(b=>b.classList.toggle('on',+b.dataset.i===i));
  tip.textContent=`${kw(per.values[i])} ${unit}`;tip.style.left=Math.max(34,Math.min(W-34,L+i*bw+bw/2))+'px';
  const ro=$('#readout');if(ro)ro.innerHTML=`<b>${kw(per.values[i])} kWh</b><small>${per.mode==='day'?per.labels[i]:per.mode==='month'?'Day '+per.labels[i]:per.labels[i]} · ${rp(per.values[i]*tariff().rate)}</small>`;
 };
 const clear=()=>{host.classList.remove('sel');$$('.bar',host).forEach(b=>b.classList.remove('on'));setReadout(per)};
 svg.addEventListener('pointerdown',pick);svg.addEventListener('pointermove',e=>{if(e.pressure>0||e.pointerType==='mouse')pick(e)});
 svg.addEventListener('pointerleave',clear);svg.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')setTimeout(clear,900)});
}
function setReadout(per){const ro=$('#readout');if(!ro)return;const unit=per.mode==='day'?'kWh per hour':per.mode==='month'?'kWh per day':'kWh per month';ro.innerHTML=`<b>${kw(per.total)} kWh</b><small>Total · avg ${kw(per.avg)} ${unit}</small>`}
function liveChart(host){
 const W=host.clientWidth||320,H=190,L=34,R=4,T=14,B=22;
 host.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Live power chart"><defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFD600" stop-opacity=".38"/><stop offset="1" stop-color="#FFD600" stop-opacity="0"/></linearGradient></defs><g id="lgrid"></g><path id="lArea" fill="url(#lg)"/><path id="lLine" class="area-l"/><circle id="lDot" r="4.500" fill="#FFD600"/><text x="${L}" y="${H-5}">60 s ago</text><text x="${W-R}" y="${H-5}" text-anchor="end">now</text></svg>`;
 host._d={W,H,L,R,T,B};drawLive();
}
function drawLive(){
 const host=$('#chart');if(!host||S.mode!=='live'||!host._d)return;
 const {W,H,L,R,T,B}=host._d,d=S.live.length?S.live:[0],max=niceMax(Math.max(...d,200)*1.1),iH=H-T-B,n=60,step=(W-L-R)/(n-1);
 const pts=d.map((v,i)=>[L+(n-d.length+i)*step,T+iH-v/max*iH]);
 let p=`M${pts[0][0]},${pts[0][1]}`;for(let i=1;i<pts.length;i++){const m=[(pts[i-1][0]+pts[i][0])/2,(pts[i-1][1]+pts[i][1])/2];p+=` Q${pts[i-1][0]},${pts[i-1][1]} ${m[0]},${m[1]}`}
 const last=pts[pts.length-1];p+=` T${last[0]},${last[1]}`;
 $('#lLine').setAttribute('d',p);$('#lArea').setAttribute('d',`${p} L${last[0]},${T+iH} L${pts[0][0]},${T+iH}Z`);
 $('#lDot').setAttribute('cx',last[0]);$('#lDot').setAttribute('cy',last[1]);
 let g='';for(let i=0;i<=3;i++){const v=max/3*i,yy=T+iH-v/max*iH;g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}"/><text x="${L-6}" y="${yy+3.5}" text-anchor="end">${num(v,0)}</text>`}
 $('#lgrid').innerHTML=g;
 const ro=$('#readout');if(ro)ro.innerHTML=`<b>${num(liveTotal())} W</b><small>Power draw · updates every second</small>`;
}
function renderChartCard(anim){
 const card=$('#chartCard'),p=cur();let navHtml='';
 if(S.mode!=='live'){
  const per=period(p,S.mode,S.offset);
  navHtml=`<div class="nav-period"><button class="icon-btn" id="pPrev" aria-label="Previous">‹</button><b>${esc(per.title)}</b><button class="icon-btn" id="pNext" aria-label="Next" ${S.offset===0?'disabled':''}>›</button></div>`;
 }
 const title=S.mode==='live'?'Live power':S.mode==='day'?'Hourly usage':S.mode==='month'?'Daily usage':'Monthly usage';
 card.innerHTML=`<div class="chart-top"><h3 style="margin:0">${title}</h3>${navHtml}</div><div class="readout" id="readout"></div><div class="chart" id="chart"></div>`;
 const host=$('#chart');
 if(S.mode==='live')liveChart(host);else{const per=period(p,S.mode,S.offset);barChart(host,per);setReadout(per)}
 if(S.mode!=='live'){
  $('#pPrev').onclick=()=>{S.offset++;S.sel=null;renderHero();renderChartCard();renderInsights();renderDevices(false)};
  $('#pNext').onclick=()=>{if(S.offset>0){S.offset--;renderHero();renderChartCard();renderInsights();renderDevices(false)}};
 }
}
function renderInsights(){
 const p=cur(),per=period(p,S.mode==='live'?'day':S.mode,S.mode==='live'?0:S.offset),t=tariff();
 const tot=per.total||1,ti=per.perDev.indexOf(Math.max(...per.perDev)),top=p.devices[ti];
 const mtd=period(p,'month',0),now=new Date(),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
 const proj=mtd.total/Math.max(1,(now.getDate()-1+now.getHours()/24))*dim,bp=Math.min(1,mtd.total/S.budget),pp=proj/S.budget;
 const cards=[
  {c:TYPES[top.type].color,ic:top.type,s:'Top consumer',b:top.name.replace(/^(Samsung|PHILIPS)\s/,''),p:`${num(per.perDev[ti]/tot*100,0)}% of usage in this period.`,m:per.perDev[ti]/tot},
  {c:pp>1?'#FF5C6C':pp>.85?'#FF9F43':'#3DDC97',ic:'wallet',s:'Monthly budget',b:`${kw(mtd.total)} / ${S.budget} kWh`,p:pp>1?`On track to pass it by ${num((pp-1)*100,0)}%.`:`Projected ${kw(proj)} kWh this month.`,m:bp},
  {c:'#FFD600',ic:'bolt',s:'Right now',b:`${num(liveTotal())} W`,p:`${p.devices.filter(d=>d.on).length} of ${p.devices.length} devices are drawing power.`,m:Math.min(1,liveTotal()/tariff().cap)},
  {c:'#3DDC97',ic:'leaf',s:'Carbon estimate',b:`${kw(per.total*.87)} kg CO₂`,p:'About 0.87 kg per kWh (grid average).'},
  {c:'#FF9F43',ic:'flame',s:'Tip',b:top.type==='ac'?'Raise AC by 1°C':'Cut standby power',p:top.type==='ac'?'Each degree can trim roughly 6% off cooling use.':'Switch off devices you are not using.'}
 ];
 $('#insights').innerHTML=cards.map((c,i)=>`<div class="ins" style="--c:${c.c};animation-delay:${i*70}ms"><span class="ic">${svgI(c.ic,'width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')}</span><small>${c.s}</small><b>${esc(c.b)}</b><p>${esc(c.p)}</p>${c.m!=null?`<div class="meter"><i style="width:0" data-w="${Math.round(c.m*100)}"></i></div>`:''}</div>`).join('');
 requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.meter i',$('#insights')).forEach(i=>i.style.width=i.dataset.w+'%')));
}
function devUse(p,mode,offset){return period(p,mode==='live'?'day':mode,mode==='live'?0:offset)}
function renderDevices(anim=true){
 const p=cur(),per=devUse(p,S.mode,S.offset),tot=sum(per.perDev)||1,max=Math.max(...per.perDev,.0001);
 let list=p.devices.map((d,i)=>({d,i,use:per.perDev[i]}));
 const q=S.query.trim().toLowerCase();if(q)list=list.filter(x=>x.d.name.toLowerCase().includes(q)||x.d.type.includes(q));
 list.sort((a,b)=>S.sort==='name'?a.d.name.localeCompare(b.d.name):S.sort==='live'?b.d.watts-a.d.watts:b.use-a.use);
 $('#devCount').textContent=`${p.devices.filter(d=>d.on).length} on · ${p.devices.length} total`;
 $$('#devSort button').forEach(b=>b.classList.toggle('on',b.dataset.s===S.sort));
 const lbl=S.mode==='live'?'today':S.mode==='day'?(S.offset?'that day':'today'):S.mode==='month'?'this month':'this year';
 $('#devList').innerHTML=list.length?list.map((x,k)=>{const d=x.d,c=TYPES[d.type].color;
  return `<li class="dev${d.on?'':' off'}" data-id="${d.id}" style="--c:${c};--i:${anim?k:0}">
  <button class="dev-main" data-open="${d.id}"><span class="dev-ico">${svgI(d.type)}</span><span class="dev-txt"><b>${esc(d.name)}</b><small class="${d.on?(d.watts>800?'hot':'on'):''}" data-live="${d.id}">${devLive(d)}</small></span></button>
  <button class="sw" role="switch" aria-checked="${d.on}" aria-label="Power ${esc(d.name)}" data-sw="${d.id}"></button>
  <div class="dev-bar"><span class="m"><i data-w="${Math.round(x.use/max*100)}"></i></span><b>${kw(x.use)} kWh</b><span>${num(x.use/tot*100,0)}% ${lbl}</span></div></li>`}).join(''):'<div class="empty">No devices match your search.</div>';
 requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.dev-bar .m i').forEach(i=>i.style.width=i.dataset.w+'%')));
}
const devLive=d=>d.on?`Drawing ${num(d.watts)} W`:(d.manual===false?'Switched off':'Off right now');
$('#devSearch').oninput=e=>{S.query=e.target.value;renderDevices(false)};
$('#devSort').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.sort=b.dataset.s;renderDevices(false)};
$('#devList').onclick=e=>{
 const sw=e.target.closest('[data-sw]');
 if(sw){const d=cur().devices.find(x=>x.id===sw.dataset.sw);toggleDev(d);return}
 const o=e.target.closest('[data-open]');if(o)devSheet(o.dataset.open);
};
function toggleDev(d){
 d.manual=!d.on;d.on=d.manual;
 liveTick();
 toast(`${d.name} ${d.on?'switched on':'switched off'}`);
 renderDevices(false);renderHero();renderInsights();
 if(S.devSheet===d.id)devSheet(d.id,true);
}
function devSheet(id,keep){
 const p=cur(),d=p.devices.find(x=>x.id===id),i=p.devices.indexOf(d),c=TYPES[d.type].color,t=tariff();
 const day=dayData(p,dkey(new Date())),m=period(p,'month',0),dayUse=sum(day.perDev[i].slice(0,new Date().getHours()+1)),mu=m.perDev[i];
 S.devSheet=id;
 const html=`<div class="sheet-ico" style="--c:${c}"><span class="dev-ico" style="width:56px;height:56px">${svgI(d.type)}</span><div style="flex:1"><h2>${esc(d.name)}</h2><small style="color:var(--mu)">${esc(p.name)}</small></div><button class="sw" role="switch" aria-checked="${d.on}" id="sSw" aria-label="Power"></button></div>
 <div class="kv"><div><small>Now</small><b>${d.on?num(d.watts)+' W':'Off'}</b></div><div><small>Today</small><b>${kw(dayUse)} kWh</b></div><div><small>This month</small><b>${kw(mu)} kWh</b></div></div>
 <div class="card" style="margin:0 0 14px;background:var(--s2);border:0"><h3 style="font-size:14px">Today, hour by hour</h3><div class="chart" id="miniChart" style="height:110px"></div></div>
 <div class="tip-box"><span style="color:#FFD600">${svgI('flame','width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"')}</span><span>This month it adds about <b>${rp(mu*t.rate)}</b> to your bill. ${tipFor(d)}</span></div>
 <button class="btn ghost big" id="sClose">Done</button>`;
 openSheet(html,body=>{
  const per={values:day.perDev[i].map((v,h)=>h<=new Date().getHours()?v:null),labels:ALL.map(h=>pad(h)+':00'),mode:'day',avg:0};
  const mc=$('#miniChart'),W=mc.clientWidth||320,H=110,n=24,bw=W/n,mx=niceMax(Math.max(...day.perDev[i],.001));
  mc.innerHTML=`<svg viewBox="0 0 ${W} ${H}">${per.values.map((v,h)=>{const hh=v==null?2:Math.max(2,v/mx*(H-18)),x=h*bw+1.5;return `<rect class="bar${v==null?' fut':''}" x="${x}" y="${H-14-hh}" width="${bw-3}" height="${hh}" rx="2.500" style="fill:${v==null?'':c};--d:${h*14}ms"/>`}).join('')}<text x="0" y="${H-1}">00</text><text x="${W/2}" y="${H-1}" text-anchor="middle">12</text><text x="${W}" y="${H-1}" text-anchor="end">23</text></svg>`;
  $('#sSw').onclick=()=>toggleDev(d);$('#sClose').onclick=closeSheet;
 });
}
function tipFor(d){return({ac:'Set it to 25–26°C and use the timer at night.',fridge:'Keep the door closed and leave space around the back.',fryer:'Preheating less saves a little on every cook.',tv:'Use the sleep timer and cut standby power.',pc:'Enable sleep mode after 10 minutes idle.',lamp:'LED bulbs like this one are already efficient.',heater:'Lower the thermostat a notch to save energy.',washer:'Cold washes use far less energy.',router:'Always-on devices like this cost very little.',cooker:'Switch off keep-warm when the meal is done.'})[d.type]||''}

/* property switcher */
$('#propPill').onclick=()=>{
 const html=`<h2>Properties</h2><p class="lead">Pick which place you want to look at.</p><ul class="plist">${S.props.map((p,i)=>`<li class="${i===S.prop?'on':''}"><button data-p="${i}"><span style="flex:1"><b>${esc(p.name)}</b><small>${p.kind} · ${p.devices.length} devices · ${num(liveTotal(p))} W now</small></span>${i===S.prop?'<span style="color:var(--ac-tx);font-weight:800">✓</span>':''}</button></li>`).join('')}</ul><button class="btn primary big" id="addProp">+ Add property</button>`;
 openSheet(html,b=>{
  $$('[data-p]',b).forEach(x=>x.onclick=()=>{S.prop=+x.dataset.p;S.sel=null;liveHistory();closeSheet();renderHome(true);toast('Switched to '+cur().name)});
  $('#addProp',b).onclick=addPropSheet;
 });
};
function addPropSheet(){
 const html=`<h2>Add property</h2><p class="lead">Give it a name and pick a type. Setrum adds typical devices so you can try it out.</p>
 <label class="field"><span>Name</span><input id="apName" placeholder="e.g. Jl. Melati 12" maxlength="28"></label>
 <label class="field"><span>Type</span><select id="apKind"><option>House</option><option>Apartment</option><option>Shop</option></select></label>
 <button class="btn primary big" id="apGo">Add property</button>`;
 openSheet(html,b=>{$('#apGo',b).onclick=()=>{
  const name=$('#apName',b).value.trim()||'New property '+(S.props.length+1);
  S.props.push(makeProp(name,$('#apKind',b).value));S.prop=S.props.length-1;liveHistory();
  closeSheet();renderHome(true);toast(name+' added')};});
}

function renderHome(first){renderHeader();renderSeg();renderHero(first);renderChartCard(true);renderInsights();renderDevices(true)}

/* ---------- BILL ---------- */
function billMonthPeriod(off){return period(cur(),'month',off)}
function renderBill(anim){
 const p=cur(),t=tariff(),now=new Date();
 $('#billSub').textContent=p.name;
 $('#billMonths').innerHTML=[0,1,2,3,4,5].map(o=>{const m=new Date(now.getFullYear(),now.getMonth()-o,1);return `<button data-o="${o}" class="${o===S.billMonth?'on':''}">${MON[m.getMonth()].slice(0,3)} ${m.getFullYear()}</button>`}).join('');
 $('#tariffSel').innerHTML=TARIFFS.map(x=>`<option value="${x.id}" ${x.id===S.tariff?'selected':''}>${x.name} · Rp ${num(x.rate,2)}/kWh</option>`).join('');
 const per=billMonthPeriod(S.billMonth),isCur=S.billMonth===0;
 const dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),elapsed=Math.max(1,now.getDate()-1+now.getHours()/24);
 const proj=isCur&&S.billMode==='proj';
 const bm=$('#billMode');bm.style.display=isCur?'':'none';bm.style.setProperty('--i',proj?1:0);$$('button',bm).forEach(b=>b.setAttribute('aria-selected',b.dataset.b===S.billMode));
 const factor=proj?dim/elapsed:1,kwh=per.total*factor,fee=kwh*t.rate,tax=fee*.03,stamp=fee>0?3000:0,total=fee+tax+stamp;
 const prev=billMonthPeriod(S.billMonth+1),pk=(isCur&&!proj)?sum(prev.values.slice(0,now.getDate()).filter(v=>v!=null)):prev.total,pfee=pk*t.rate,ptot=pfee*1.03+(pfee>0?3000:0),d=ptot>0?(total-ptot)/ptot*100:0;
 $('#billTotal').innerHTML=`<small>${proj?'Projected bill for':'Estimated bill for'} ${MON[new Date(now.getFullYear(),now.getMonth()-S.billMonth,1).getMonth()]}${isCur&&!proj?' (so far)':''}</small><div class="amt" id="billAmt">Rp 0</div><span class="chip ${d>2?'up':d<-2?'':'flat'}" style="margin:0">${d>0?'▲':d<0?'▼':'■'} ${num(Math.abs(d),0)}% vs ${MON[new Date(now.getFullYear(),now.getMonth()-S.billMonth-1,1).getMonth()].slice(0,3)}</span>`;
 countUp($('#billAmt'),total,v=>rp(v),900);$('#billAmt')._v=total;
 $('#billLines').innerHTML=`<table class="lines"><tr><td>kWh usage</td><td>${num(kwh,1)}</td></tr><tr><td>Rate per kWh</td><td>Rp ${num(t.rate,2)}</td></tr><tr><td>Usage fee</td><td>${rp(fee)}</td></tr><tr><td>Street lighting tax <small>(3%, assumed)</small></td><td>${rp(tax)}</td></tr><tr><td>Stamp duty <small>(assumed)</small></td><td>${rp(stamp)}</td></tr><tr class="tot"><td>Bill estimation</td><td>${rp(total)}</td></tr></table>`;
 // split donut
 const C=2*Math.PI*45,tot=sum(per.perDev)||1;let off=0;
 const items=p.devices.map((d,i)=>({d,v:per.perDev[i]*factor,c:TYPES[d.type].color})).sort((a,b)=>b.v-a.v);
 const segs=items.map(it=>{const len=it.v/(tot*factor)*C,s=`<circle class="seg-c" cx="60" cy="60" r="45" stroke="${it.c}" stroke-dasharray="0 ${C}" data-len="${Math.max(0,len-2)}" stroke-dashoffset="${-off}"/>`;off+=len;return s}).join('');
 $('#billSplit').innerHTML=`<h3>Where the money goes</h3><div class="split"><div class="donut"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="45" stroke="var(--s3)"/>${segs}</svg><div class="donut-c"><b>${rp(fee).replace('Rp ','')}</b><small>fee, Rp</small></div></div><ul class="legend">${items.map(it=>`<li style="--c:${it.c}"><i></i><span>${esc(it.d.name.replace(/^(Samsung|PHILIPS)\s/,''))}</span><b>${num(it.v/(tot*factor)*100,0)}%</b></li>`).join('')}</ul></div>`;
 requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.seg-c',$('#billSplit')).forEach((c,i)=>{c.style.transitionDelay=i*90+'ms';c.setAttribute('stroke-dasharray',`${c.dataset.len} ${C}`)})));
 renderBill.data={per,kwh,fee,tax,stamp,total,items,proj,t};
}
$('#billMonths').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.billMonth=+b.dataset.o;if(S.billMonth>0)S.billMode='actual';renderBill()};
$('#billMode').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.billMode=b.dataset.b;renderBill()};
$('#tariffSel').onchange=e=>{S.tariff=e.target.value;store.set('tariff',S.tariff);renderBill();renderHome(false)};
$('#billSave').onclick=()=>{
 const d=renderBill.data,now=new Date(),m=new Date(now.getFullYear(),now.getMonth()-S.billMonth,1),label=`${MON[m.getMonth()]} ${m.getFullYear()}`;
 const html=`<!doctype html><meta charset="utf-8"><title>Setrum bill estimation ${label}</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:560px;margin:40px auto;padding:0 20px;color:#14141a}h1{margin:0}table{width:100%;border-collapse:collapse;margin:18px 0}td{padding:8px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}.t td{font-weight:700;font-size:18px}small{color:#666}</style><h1>Setrum</h1><p><b>Bill estimation · ${label}${d.proj?' (projected)':''}</b><br>${esc(cur().name)} · ${esc(d.t.name)}</p><table><tr><td>kWh usage</td><td>${num(d.kwh,1)}</td></tr><tr><td>Rate per kWh</td><td>Rp ${num(d.t.rate,2)}</td></tr><tr><td>Usage fee</td><td>${rp(d.fee)}</td></tr><tr><td>Street lighting tax (3%, assumed)</td><td>${rp(d.tax)}</td></tr><tr><td>Stamp duty (assumed)</td><td>${rp(d.stamp)}</td></tr><tr class="t"><td>Bill estimation</td><td>${rp(d.total)}</td></tr></table><h3>By device</h3><table>${d.items.map(i=>`<tr><td>${esc(i.d.name)}</td><td>${num(i.v,1)} kWh</td></tr>`).join('')}</table><small>Generated by the Setrum UI prototype from simulated data. This is not an official bill.</small>`;
 try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=`Setrum-bill-${m.getFullYear()}-${pad(m.getMonth()+1)}.html`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}catch(e){}
 const mo=$('#modal');$('#modalTxt').textContent='Check your downloads folder.';mo.classList.add('on');setTimeout(()=>mo.classList.remove('on'),2200);
};

/* ---------- ALERTS ---------- */
const POOL=[
 {level:'info',cat:'usage',ic:'plug',title:'Standby power detected',detail:'The TV drew power for 6 hours while idle.',dev:'tv'},
 {level:'warn',cat:'outage',ic:'bolt',title:'Voltage fluctuation',detail:'Supply dipped below 200 V for a few seconds.'},
 {level:'warn',cat:'fault',ic:'warn',title:'Refrigerator running longer',detail:'The compressor has been on 40% longer than usual today.',dev:'fridge'},
 {level:'info',cat:'usage',ic:'leaf',title:'Great job this week',detail:'You used less energy than your weekly average.'}
];
function seedAlerts(){
 const M=60000;
 S.alerts=[
  {id:1,level:'critical',cat:'fault',ic:'lamp',title:'PHILIPS Living Room Lamp',detail:'The lamp stopped responding and is reported as broken. Consider replacing it.',prop:'Jl. Nangka 55',ts:Date.now()-45*M,unread:true,act:'Consider replacing'},
  {id:2,level:'warn',cat:'outage',ic:'bolt',title:'Power outage detected',detail:'The meter lost supply and then recovered. Check your appliances.',prop:'Jl. Rambutan 33',ts:Date.now()-4*60*M,unread:true},
  {id:3,level:'info',cat:'usage',ic:'ac',title:'Air conditioner ran longer than usual',detail:'It ran about 3 hours longer than your normal night pattern.',prop:'Jl. Nangka 55',ts:Date.now()-20*60*M,unread:false},
  {id:4,level:'info',cat:'usage',ic:'leaf',title:'Weekly summary is ready',detail:'See how this week compares with the one before on the Home tab.',prop:'Jl. Nangka 55',ts:Date.now()-50*60*M,unread:false}
 ];S.aid=10;
}
const LV={critical:['#FF5C6C','Critical'],warn:['#FF9F43','Warning'],info:['#5AB0FF','Info']};
const prefOf=a=>S.prefs[a.cat]!==false;
function visibleAlerts(){return S.alerts.filter(a=>prefOf(a)&&(S.alertFilter==='all'||(S.alertFilter==='unread'&&a.unread)||(S.alertFilter==='critical'&&a.level==='critical')))}
function updateBadge(){const n=S.alerts.filter(a=>a.unread&&prefOf(a)).length,b=$('#tabBadge');b.hidden=!n;b.textContent=n;$('#bellDot').hidden=!n}
function renderAlerts(){
 $('#lastChecked').textContent='Last checked '+relTime(S.lastChecked).toLowerCase();
 $$('#alertFilter button').forEach(b=>b.classList.toggle('on',b.dataset.f===S.alertFilter));
 const list=visibleAlerts();
 $('#alertList').innerHTML=list.length?list.map((a,i)=>{const [c,l]=LV[a.level];return `<li class="alert-wrap" data-id="${a.id}"><div class="acard${a.unread?' unread':''}" style="--c:${c};--i:${i}"><span class="ico">${svgI(a.ic)}</span><div><small><span class="lvl">${l}</span>${esc(a.prop)} · ${relTime(a.ts)}</small><b>${esc(a.title)}</b><p>${esc(a.detail)}</p></div><div class="act"><button class="btn ghost" data-a="read">${a.unread?'Mark as read':'Mark unread'}</button><button class="btn danger" data-a="del">Dismiss</button></div></div></li>`}).join(''):`<div class="empty"><div style="font-size:42px">✨</div>You're all caught up.</div>`;
 updateBadge();
}
$('#alertFilter').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.alertFilter=b.dataset.f;renderAlerts()};
function dismissAlert(id,wrap){
 const a=S.alerts.find(x=>x.id===id),idx=S.alerts.indexOf(a);
 const done=()=>{S.alerts=S.alerts.filter(x=>x.id!==id);renderAlerts();toast('Alert dismissed',()=>{S.alerts.splice(idx,0,a);renderAlerts()})};
 if(wrap){wrap.style.height=wrap.offsetHeight+'px';void wrap.offsetHeight;wrap.style.height='0';wrap.style.marginBottom='0';wrap.style.opacity='0';setTimeout(done,320)}else done();
}
(function(){
 const L=$('#alertList');let st=null;
 L.addEventListener('pointerdown',e=>{const c=e.target.closest('.acard');if(!c||e.target.closest('button'))return;st={c,x:e.clientX,y:e.clientY,dx:0,moved:false,id:e.pointerId}});
 L.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;if(!st.moved&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){st=null;return}
  if(Math.abs(dx)>8){st.moved=true;st.c.classList.add('drag');try{st.c.setPointerCapture(e.pointerId)}catch(_){}}
  if(st.moved){st.dx=Math.min(0,dx);st.c.style.transform=`translateX(${st.dx}px)`}});
 const end=()=>{if(!st)return;const {c,dx,moved}=st;st=null;c.classList.remove('drag');
  if(moved&&dx<-90){c.style.transform='translateX(-110%)';dismissAlert(+c.parentElement.dataset.id,c.parentElement)}
  else{c.style.transform='';if(!moved){const a=S.alerts.find(x=>x.id===+c.parentElement.dataset.id);c.classList.toggle('open');if(a&&a.unread){a.unread=false;c.classList.remove('unread');updateBadge()}}}};
 L.addEventListener('pointerup',end);L.addEventListener('pointercancel',end);
 L.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const w=b.closest('.alert-wrap'),id=+w.dataset.id,a=S.alerts.find(x=>x.id===id);
  if(b.dataset.a==='read'){a.unread=!a.unread;renderAlerts()}else dismissAlert(id,w)});
})();
$('#recheck').onclick=()=>{
 const b=$('#recheck');b.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}],{duration:800,easing:'ease-in-out'});
 $('#lastChecked').textContent='Checking…';
 setTimeout(()=>{
  S.lastChecked=Date.now();const have=new Set(S.alerts.map(a=>a.title)),fresh=POOL.filter(x=>!have.has(x.title));
  if(fresh.length&&Math.random()<.7){const x=fresh[0];S.alerts.unshift({id:++S.aid,level:x.level,cat:x.cat,ic:x.ic,title:x.title,detail:x.detail,prop:cur().name,ts:Date.now(),unread:true});toast('1 new alert')}
  else toast('No new alerts');
  renderAlerts();
 },850);
};

/* ---------- PROFILE ---------- */
const PREFS=[['outage','Power outages','Supply loss and voltage problems'],['fault','Device faults','Broken or failing devices'],['usage','Usage insights','Tips and unusual usage']];
function renderProfile(){
 const u=S.user,ini=(u.name||'U').trim().slice(0,1).toUpperCase();
 $('#profCard').innerHTML=`<span class="avatar">${esc(ini)}</span><div><b>${esc(u.name)}</b><small>${esc(u.email)}<br>${esc(u.phone)}</small></div><button class="edit" id="editProf">Edit</button>`;
 let st=$('#profStats');if(!st){st=document.createElement('div');st.id='profStats';st.className='prof-stats';$('#profCard').after(st)}
 st.innerHTML=`<div><b>${S.props.length}</b><small>Properties</small></div><div><b>${S.props.reduce((a,p)=>a+p.devices.length,0)}</b><small>Devices</small></div><div><b>${S.alerts.filter(a=>a.unread).length}</b><small>Unread</small></div>`;
 $('#budVal').textContent=S.budget;
 const ts=$('#themeSeg'),ti=['auto','light','dark'].indexOf(S.theme);ts.style.setProperty('--i',ti);$$('button',ts).forEach(b=>b.setAttribute('aria-selected',b.dataset.t===S.theme));
 $('#prefRows').innerHTML=PREFS.map(([k,t,s])=>`<div><span>${t}<small>${s}</small></span><button class="sw" role="switch" aria-checked="${S.prefs[k]!==false}" data-pref="${k}" aria-label="${t}"></button></div>`).join('');
 $('#editProf').onclick=editProfile;
}
function editProfile(){
 openSheet(`<h2>Edit profile</h2><p class="lead">Saved on this device only.</p><label class="field"><span>Name</span><input id="epN" value="${esc(S.user.name)}" maxlength="24"></label><label class="field"><span>Email</span><input id="epE" type="email" value="${esc(S.user.email)}"></label><label class="field"><span>Phone</span><input id="epP" value="${esc(S.user.phone)}"></label><button class="btn primary big" id="epS">Save</button>`,b=>{
  $('#epS',b).onclick=()=>{S.user={name:$('#epN',b).value.trim()||'User',email:$('#epE',b).value.trim(),phone:$('#epP',b).value.trim()};store.set('user',S.user);closeSheet();renderProfile();renderHeader();toast('Profile updated')}});
}
$('#themeSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.theme=b.dataset.t;store.set('theme',S.theme);applyTheme();renderProfile()};
function applyTheme(){
 const dark=S.theme==='auto'?matchMedia('(prefers-color-scheme: dark)').matches:S.theme==='dark';
 document.documentElement.dataset.theme=dark?'dark':'light';
 $('meta[name=theme-color]').content=dark?'#0A0A0E':'#F3F3EF';
 if(S.tab==='home'){renderChartCard();}
}
$('#budMinus').onclick=()=>{S.budget=Math.max(50,S.budget-25);store.set('budget',S.budget);renderProfile();bump($('#budVal'))};
$('#budPlus').onclick=()=>{S.budget=Math.min(2000,S.budget+25);store.set('budget',S.budget);renderProfile();bump($('#budVal'))};
function bump(el){el.animate([{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'})}
$('#prefRows').onclick=e=>{const b=e.target.closest('[data-pref]');if(!b)return;const k=b.dataset.pref;S.prefs[k]=S.prefs[k]===false;store.set('prefs',S.prefs);renderProfile();updateBadge()};
$$('.menu button').forEach(b=>b.onclick=()=>{
 const k=b.dataset.open;
 if(k==='meters')openSheet(`<h2>Devices &amp; meters</h2><p class="lead">The meters linked to your properties (sample data).</p><ul class="plist">${S.props.map((p,i)=>`<li><span><b>${esc(p.name)}</b><small>Meter SMT-${(1000+hash(p.name)%9000)} · ${p.devices.length} devices · ${tariff().name}</small></span></li>`).join('')}</ul>`);
 if(k==='privacy')openSheet(`<h2>Privacy</h2><p class="lead">This prototype keeps everything in your browser. Your name, theme and budget are saved only on this device, and nothing is sent to a server. The usage numbers are simulated.</p>`);
 if(k==='support')openSheet(`<h2>Support</h2><p class="lead">This is a UI prototype, so there is no live support. In a real app, this screen would offer chat, a help centre and a way to report a meter problem.</p><button class="btn ghost big" onclick="document.getElementById('scrim').click()">Close</button>`);
});
$('#logout').onclick=()=>{const l=$('#login');l.hidden=false;l.animate([{opacity:0},{opacity:1}],{duration:300})};
$('#lgBtn').onclick=()=>{const l=$('#login');const a=l.animate([{opacity:1},{opacity:0}],{duration:300});a.onfinish=()=>{l.hidden=true;go('home')};};

/* ---------- boot ---------- */
function clock(){const n=new Date();$('#clock').textContent=`${n.getHours()}:${pad(n.getMinutes())}`}
function boot(){
 seedAlerts();clock();setInterval(clock,20000);
 liveHistory();
 applyTheme();matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(S.theme==='auto')applyTheme()});
 const start=(location.hash||'#home').slice(1);
 go(TABS.includes(start)?start:'home');
 setTimeout(()=>$('#splash').classList.add('hide'),reduce?200:1500);
 setInterval(()=>{
  if(document.hidden)return;
  liveTick();
  if(S.tab==='home'){
   const hv=$('#hNum');
   $$('[data-live]').forEach(el=>{const d=cur().devices.find(x=>x.id===el.dataset.live);if(!d)return;el.textContent=devLive(d);el.className=d.on?(d.watts>800?'hot':'on'):''});
   renderHeroLive();drawLive();
  }
 },1000);
 addEventListener('resize',()=>{if(S.tab==='home')renderChartCard()});
}
function renderHeroLive(){
 const cap=tariff().cap,w=liveTotal(),pct=Math.min(1.1,w/cap),C=2*Math.PI*44,ring=$('#ring');if(!ring)return;
 ring.className='ring'+(pct>.9?' bad':pct>.7?' warn':'');$('.pr',ring).style.strokeDashoffset=C*(1-Math.min(1,pct));$('#rW').textContent=num(w);
 if(S.mode==='live'){$('#hNum').textContent=num(w);$('#hNum')._v=w;const t=tariff();$('#hv0').textContent=rp(w/1000*t.rate);
  const over=w/cap;$('#hChip').innerHTML=`<span class="chip ${over>.9?'bad':over>.7?'up':''}">${num(over*100,0)}% of ${num(cap)} VA capacity</span>`;
  $('#hv2').textContent=cur().devices.filter(d=>d.on).length+' of '+cur().devices.length}
}
boot();
