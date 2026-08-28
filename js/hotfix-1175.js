/* CHEBSEL v1.17.5 — Treasurer payment stability + financial debt chart + secretary punctuality health */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const moneyH=v=>{try{return money(v)}catch(e){return new Intl.NumberFormat('fr-FR').format(Number(v||0))+' G'}};
 let treasuryFinanceMode=null;

 function injectFinanceNavScope(mode){
  if(role()!=='treasurer'||!treasuryFinanceMode)return;
  const frame=document.getElementById('appFrame');let d,w;
  try{d=frame?.contentDocument;w=frame?.contentWindow}catch(e){return}
  if(!d?.head)return;
  let st=d.getElementById('chebsel-treasurer-nav-scope-1175');
  if(!st){st=d.createElement('style');st.id='chebsel-treasurer-nav-scope-1175';d.head.appendChild(st)}
  const page=mode==='settings'?'settings':'entry';
  st.textContent=`#nav button{display:none!important}#nav button[data-page="${page}"]{display:inline-flex!important}.nav button{display:none!important}.nav button[data-page="${page}"]{display:inline-flex!important}`;
  try{if(typeof w?.goPage==='function')w.goPage(page)}catch(e){}
 }

 window.openTreasurerFinanceOnly=function(mode){
  if(role()!=='treasurer')return typeof openFinance==='function'?openFinance(mode):undefined;
  treasuryFinanceMode=mode==='settings'?'settings':'entry';
  try{document.getElementById('treasurerPaymentHub1173')?.classList.remove('open')}catch(e){}
  if(typeof openFinance!=='function'){alert('La fiche financière est indisponible.');return}
  openFinance(treasuryFinanceMode);
  const frame=document.getElementById('appFrame');
  if(frame){
   frame.addEventListener('load',()=>{injectFinanceNavScope(treasuryFinanceMode);setTimeout(()=>injectFinanceNavScope(treasuryFinanceMode),80)},{once:true});
   [120,260,500].forEach(ms=>setTimeout(()=>injectFinanceNavScope(treasuryFinanceMode),ms));
  }
 };

 function closeTreasurerFinanceSafely(){
  const viewer=document.getElementById('viewer'),frame=document.getElementById('appFrame');
  treasuryFinanceMode=null;
  try{viewer?.classList.remove('open')}catch(e){}
  try{if(frame){frame.onload=null;frame.srcdoc=''}}catch(e){}
  try{activeApp=null}catch(e){}
  try{syncBridge?.()}catch(e){}
  try{refreshHome?.()}catch(e){}
  setTimeout(()=>{try{openTreasurerPaymentHub?.()}catch(e){}},30);
 }

 function monthBoundsH(month){const [y,m]=month.split('-').map(Number),last=new Date(y,m,0).getDate();return {from:`${month}-01`,to:`${month}-${String(last).padStart(2,'0')}`}}
 function monthListH(n=6){const out=[],d=new Date();d.setDate(1);for(let i=n-1;i>=0;i--){const x=new Date(d);x.setMonth(x.getMonth()-i);out.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`)}return out}
 function financeHealthH(){
  return monthListH().map(m=>{const b=monthBoundsH(m),ins=typeof treasuryIncomeRows==='function'?treasuryIncomeRows(b.from,b.to):[],outs=typeof treasuryExpenseRows==='function'?treasuryExpenseRows(b.from,b.to):[],snap=typeof monthlySnapshot==='function'?monthlySnapshot(m):{};const income=ins.reduce((s,x)=>s+Number(x.amount||0),0),expenses=outs.reduce((s,x)=>s+Number(x.amount||0),0);return {month:m,income,expenses,net:income-expenses,debt:Number(snap?.balance||0),due:Number(snap?.due||0),paid:Number(snap?.paid||0)}})
 }
 window.renderTreasurerFinanceHealth=function(){
  const box=document.getElementById('treasurerHealthBody');if(!box)return;const rows=financeHealthH(),max=Math.max(1,...rows.flatMap(r=>[r.income,r.expenses,Math.max(0,r.net),r.debt])),W=960,H=390,pad=58,group=(W-pad*2)/rows.length,bar=group/5;let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution de la santé financière" style="width:100%;height:auto"><line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="currentColor" opacity=".3"/>`;
  rows.forEach((r,i)=>{const x=pad+i*group+group*.10,scale=(H-pad*2)/max,vals=[r.income,r.expenses,Math.max(0,r.net),r.debt],cols=['#16794B','#B42318','#C59D3F','#2563EB'];vals.forEach((v,j)=>{const h=v>0?Math.max(2,v*scale):0;svg+=`<rect x="${x+j*bar}" y="${H-pad-h}" width="${Math.max(5,bar-4)}" height="${h}" rx="4" fill="${cols[j]}"/>`});svg+=`<text x="${x+bar*1.5}" y="${H-22}" text-anchor="middle" font-size="16" fill="currentColor">${r.month.slice(5)}</text>`});svg+='</svg>';
  const cur=rows.at(-1)||{},recovery=cur.due?Math.round((cur.paid/cur.due)*100):0;
  box.innerHTML=`<div class="profilePanel"><div class="treasurySummary"><div class="mini"><b>${moneyH(cur.income)}</b><span>Entrées mois actuel</span></div><div class="mini"><b>${moneyH(cur.expenses)}</b><span>Dépenses mois actuel</span></div><div class="mini"><b>${moneyH(cur.net)}</b><span>Solde net</span></div><div class="mini"><b>${moneyH(cur.debt)}</b><span>Dette / créances</span></div><div class="mini"><b>${recovery} %</b><span>Taux de recouvrement</span></div></div></div><div class="profilePanel"><h3>Évolution de la santé financière — 6 derniers mois</h3><div class="memberMeta">Vert = Entrées • Rouge = Dépenses • Or = Solde net positif • Bleu = Dette / créances</div>${svg}<div class="memberMeta" style="margin-top:10px">La dette est maintenant intégrée à l’évolution mensuelle afin de comparer simultanément encaissements, dépenses, résultat net et créances restant à recouvrer.</div></div>`;
 };

 function attendanceMonthH(month){
  let db={};try{db=safeParse(ATT_KEY)||{}}catch(e){try{db=JSON.parse(localStorage.getItem('chebsel_attendance_app_v1')||'{}')}catch(_){db={}}}
  const calls=(Array.isArray(db.calls)?db.calls:[]).filter(c=>String(c.date||'').slice(0,7)===month);let P=0,late=0,absent=0,marked=0;
  calls.forEach(c=>Object.values(c.records||{}).forEach(r=>{let s=String(r?.status||'').toUpperCase();if(!s)return;marked++;if(s==='P')P++;else if(['R','RM','RNM'].includes(s))late++;else if(['A','AM','ANM','ANMP','E'].includes(s))absent++}));
  const attended=P+late,presence=marked?Math.round(attended*1000/marked)/10:0,punctuality=attended?Math.round(P*1000/attended)/10:0,lateRate=marked?Math.round(late*1000/marked)/10:0,absenceRate=marked?Math.round(absent*1000/marked)/10:0;
  return {month,activities:calls.length,P,late,absent,marked,presence,punctuality,lateRate,absenceRate}
 }
 function secretaryHealthDataH(){return monthListH().map(attendanceMonthH)}
 function ensureSecretaryHealthViewH(){let v=document.getElementById('secretaryHealthView1175');if(v)return v;v=document.createElement('div');v.className='membersView';v.id='secretaryHealthView1175';v.innerHTML='<div class="viewerbar"><div class="viewtitle"><b>Santé de ponctualité CHEBSEL</b><span>Historique graphique des 6 derniers mois</span></div></div><div class="membersBody" id="secretaryHealthBody1175"></div>';document.body.appendChild(v);return v}
 window.openSecretaryPunctualityHealth=function(){if(role()!=='secretary')return;const v=ensureSecretaryHealthViewH();v.classList.add('open');renderSecretaryPunctualityHealth()};
 window.renderSecretaryPunctualityHealth=function(){
  const box=document.getElementById('secretaryHealthBody1175');if(!box)return;const rows=secretaryHealthDataH(),W=960,H=390,pad=58,group=(W-pad*2)/rows.length,bar=group/5,scale=(H-pad*2)/100;let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution de la ponctualité du groupe" style="width:100%;height:auto"><line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="currentColor" opacity=".3"/>`;
  rows.forEach((r,i)=>{const x=pad+i*group+group*.10,vals=[r.presence,r.punctuality,r.lateRate,r.absenceRate],cols=['#16794B','#2563EB','#C59D3F','#B42318'];vals.forEach((v,j)=>{const h=v>0?Math.max(2,v*scale):0;svg+=`<rect x="${x+j*bar}" y="${H-pad-h}" width="${Math.max(5,bar-4)}" height="${h}" rx="4" fill="${cols[j]}"/>`});svg+=`<text x="${x+bar*1.5}" y="${H-22}" text-anchor="middle" font-size="16" fill="currentColor">${r.month.slice(5)}</text>`});svg+='</svg>';
  const cur=rows.at(-1)||{};
  box.innerHTML=`<div class="profilePanel"><div class="treasurySummary"><div class="mini"><b>${Number(cur.activities||0)}</b><span>Activités mois actuel</span></div><div class="mini"><b>${Number(cur.presence||0)} %</b><span>Taux de présence</span></div><div class="mini"><b>${Number(cur.punctuality||0)} %</b><span>Taux de ponctualité</span></div><div class="mini"><b>${Number(cur.late||0)}</b><span>Retards</span></div><div class="mini"><b>${Number(cur.absent||0)}</b><span>Absences</span></div></div></div><div class="profilePanel"><h3>Évolution de la santé de ponctualité — 6 derniers mois</h3><div class="memberMeta">Vert = Présence • Bleu = Ponctualité • Or = Taux de retard • Rouge = Taux d’absence</div>${svg}<div class="memberMeta" style="margin-top:10px">Cette vue permet au Secrétaire d’évaluer rapidement si la présence et la ponctualité du groupe s’améliorent ou se dégradent d’un mois à l’autre.</div></div>`;
 };

 const baseAttendanceHistory=window.openAttendanceHistory;
 window.openAttendanceHistory=function(){if(role()==='secretary')return openSecretaryPunctualityHealth();return typeof baseAttendanceHistory==='function'?baseAttendanceHistory.apply(this,arguments):undefined};

 const previousBack=window.globalBack;
 window.globalBack=function(){
  const r=role();
  if(r==='treasurer'&&treasuryFinanceMode&&document.getElementById('viewer')?.classList.contains('open')){closeTreasurerFinanceSafely();return}
  if(r==='secretary'){const hv=document.getElementById('secretaryHealthView1175');if(hv?.classList.contains('open')){hv.classList.remove('open');return}}
  return typeof previousBack==='function'?previousBack.apply(this,arguments):undefined;
 };
})();
