/* CHEBSEL v1.17.2 — strict Secretary scope + monthly punctuality document + contextual back */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const esc=s=>{try{return escapeHtml(String(s??''))}catch(e){return String(s??'')}};
 let attendanceScope=null;
 let reportScope=null;
 let monthlyApprovedRow=null;

 function ensureHub(id,title){let v=document.getElementById(id);if(v)return v;v=document.createElement('div');v.className='membersView';v.id=id;v.innerHTML=`<div class="viewerbar"><div class="viewtitle"><b>${esc(title)}</b></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu" id="${id}Menu"></div></div></div>`;document.body.appendChild(v);return v}
 function item(icon,title,fn){return `<button class="utilityBtn" onclick="${fn}">${icon} ${esc(title)}</button>`}
 window.closeSecretaryHub=id=>document.getElementById(id)?.classList.remove('open');

 window.openSecretaryCallHub=function(){
  if(role()!=='secretary'){if(typeof openSecretariatHub==='function')return openSecretariatHub();return}
  const v=ensureHub('secretaryCallHub','Fiche d’Appel'),m=document.getElementById('secretaryCallHubMenu');
  m.innerHTML=item('✅','Appel',"closeSecretaryHub('secretaryCallHub');openSecretaryAttendanceOnly('call')")+item('⚙️','Paramètres',"closeSecretaryHub('secretaryCallHub');openSecretaryAttendanceOnly('settings')");
  v.classList.add('open');
 };

 window.openSecretaryAttendanceOnly=function(mode){
  if(role()!=='secretary'){return openAttendance(mode)}
  attendanceScope=mode==='settings'?'settings':'call';
  openAttendance(attendanceScope);
  const frame=document.getElementById('appFrame');
  if(frame){frame.addEventListener('load',applyAttendanceScope,{once:true});setTimeout(applyAttendanceScope,120)}
 };
 function norm(s){return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
 function applyAttendanceScope(){
  if(role()!=='secretary'||!attendanceScope)return;
  const frame=document.getElementById('appFrame');let d;try{d=frame?.contentDocument}catch(e){return}if(!d)return;
  const allowed=attendanceScope==='call'?['appel']:['parametre','parametres'];
  const forbidden=['accueil','historique','rapports','rapport','sauvegarde','sauvegardes','appel','parametre','parametres'];
  d.querySelectorAll('button,a,[role="tab"]').forEach(el=>{
   const t=norm(el.textContent);if(!t)return;
   if(forbidden.some(x=>t===x||t.startsWith(x+' ')))el.style.display=allowed.some(x=>t===x||t.startsWith(x+' '))?'':'none';
  });
  d.querySelectorAll('[data-view],[data-page],[data-section]').forEach(el=>{
   const key=norm(el.getAttribute('data-view')||el.getAttribute('data-page')||el.getAttribute('data-section'));if(!key)return;
   if(['home','accueil','history','historique','reports','rapport','rapports','backup','sauvegarde','settings','parametres','call','appel'].includes(key)){
    const keep=attendanceScope==='call'?['call','appel'].includes(key):['settings','parametres'].includes(key);if(!keep)el.style.display='none';
   }
  });
 }

 window.openSecretaryReportsHub=function(){
  if(role()!=='secretary'){if(typeof openReportsCenter==='function')return openReportsCenter();return}
  const v=ensureHub('secretaryReportsHub','Rapport de ponctualité'),m=document.getElementById('secretaryReportsHubMenu');
  m.innerHTML=item('📅','Rapport mensuel de ponctualité',"closeSecretaryHub('secretaryReportsHub');openSecretaryMonthlyPunctuality()")+item('📊','Rapport de ponctualité — période libre',"closeSecretaryHub('secretaryReportsHub');openSecretaryFreePunctuality()");
  v.classList.add('open');
 };
 window.openSecretaryMonthlyPunctuality=function(){reportScope='monthly';monthlyApprovedRow=null;openPunctualityReport();setTimeout(async()=>{try{renderPunctualityClosing?.()}catch(e){};setTimeout(applyPunctualityScope,80);setTimeout(refreshSecretaryMonthlyActions,220)},50)};
 window.openSecretaryFreePunctuality=function(){reportScope='free';openPunctualityReport();setTimeout(applyPunctualityScope,80)};

 async function cloudCtx(){const c=await getCloudClient(),p=await getCloudProfile(),org=p?.organization_id||p?.org_id;if(!c||!org)throw new Error('Session CHEBSEL Cloud incomplète.');return {c,org}}
 async function monthlyRow(month){const {c,org}=await cloudCtx(),q=await c.from('punctuality_monthly_closings').select('*').eq('organization_id',org).eq('month_reference',month).maybeSingle();if(q.error)throw q.error;return q.data||null}
 function monthBounds(month){const [y,m]=month.split('-').map(Number),last=new Date(y,m,0).getDate();return {from:`${month}-01`,to:`${month}-${String(last).padStart(2,'0')}`}}
 function fmtMonth(month){try{return new Date(month+'-01T12:00:00').toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}catch(e){return month}}
 function pct(v){return `${Number(v||0)} %`}

 function ensureSecretaryMonthlyDocument(){
  const view=document.getElementById('punctualityReportView'),body=view?.querySelector('.membersBody')||view;if(!body)return null;
  let panel=document.getElementById('secretaryMonthlyReportPanel');
  if(!panel){panel=document.createElement('div');panel.className='profilePanel';panel.id='secretaryMonthlyReportPanel';panel.style.display='none';body.appendChild(panel)}
  return panel
 }
 function monthlyDocumentHTML(row){
  const s=row?.snapshot||{},members=Array.isArray(s.members)?s.members:[];
  return `<div class="profileTitle"><div><h2>Rapport mensuel de ponctualité CHEBSEL</h2><div class="memberMeta">${esc(fmtMonth(row.month_reference))} • Rapport basé sur le snapshot validé</div></div></div>
  <div class="treasurySummary"><div class="mini"><b>${Number(s.activities||0)}</b><span>Activités</span></div><div class="mini"><b>${pct(s.attendance_rate)}</b><span>Présence</span></div><div class="mini"><b>${pct(s.punctuality_rate)}</b><span>Ponctualité</span></div><div class="mini"><b>${Number(s.late||0)}</b><span>Retards</span></div><div class="mini"><b>${Number(s.absent||0)}</b><span>Absences</span></div></div>
  <div class="table-wrap"><table class="treasuryTable"><thead><tr><th>Membre</th><th>Act.</th><th>P</th><th>RM</th><th>RNM</th><th>AM</th><th>ANM</th><th>Présence</th><th>Ponctualité</th></tr></thead><tbody>${members.map(x=>`<tr><td>${esc(x.name||'')}</td><td>${Number(x.marked||0)}</td><td>${Number(x.P||0)}</td><td>${Number(x.RM||0)}</td><td>${Number(x.RNM||0)}</td><td>${Number(x.AM||0)}</td><td>${Number(x.ANM||0)+Number(x.ANMP||0)}</td><td>${pct(x.attendance_rate)}</td><td>${pct(x.punctuality_rate)}</td></tr>`).join('')}</tbody></table></div>
  <div class="memberMeta" style="margin-top:14px">Préparée : ${row.prepared_at?new Date(row.prepared_at).toLocaleString('fr-FR'):'—'} • Validée : ${row.approved_at?new Date(row.approved_at).toLocaleString('fr-FR'):'—'}</div>`;
 }

 window.generateSecretaryMonthlyPunctualityReport=async function(){
  if(role()!=='secretary')return;
  const month=document.getElementById('punctualityCloseMonth')?.value||new Date().toISOString().slice(0,7);
  try{
   const row=await monthlyRow(month);if(!row||row.status!=='approved'){alert('Rapò mansyèl la dwe valide pa Prezidan an anvan li ka jenere.');return}
   monthlyApprovedRow=row;const panel=ensureSecretaryMonthlyDocument();panel.innerHTML=monthlyDocumentHTML(row);panel.style.display='';
   try{if(typeof registerChebselArchive==='function'){const b=monthBounds(month);await registerChebselArchive('punctuality_monthly_report',b.from,b.to,`Rapport_mensuel_ponctualite_CHEBSEL_${month}`,{month,status:'approved'})}}catch(e){console.warn(e)}
   await refreshSecretaryMonthlyActions();
  }catch(e){alert('Génération impossible : '+(e?.message||e))}
 };

 window.saveSecretaryMonthlyPunctualityJPEG=async function(){
  if(role()!=='secretary')return;
  const month=document.getElementById('punctualityCloseMonth')?.value||new Date().toISOString().slice(0,7);
  try{if(!monthlyApprovedRow||monthlyApprovedRow.month_reference!==month)monthlyApprovedRow=await monthlyRow(month);if(!monthlyApprovedRow||monthlyApprovedRow.status!=='approved'){alert('Se sèlman yon rapò valide ki ka anrejistre an JPEG.');return}
   const row=monthlyApprovedRow,s=row.snapshot||{},members=Array.isArray(s.members)?s.members:[],W=1500,rowH=46,H=Math.max(1250,720+Math.max(1,members.length)*rowH),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);
   const txt=(t,px,py,size=28,bold=false,color='#111827',align='left')=>{x.font=`${bold?'700':'400'} ${size}px Arial`;x.fillStyle=color;x.textAlign=align;x.textBaseline='top';x.fillText(String(t??''),px,py)};
   txt('CHŒUR D’HOMME DE L’ÉGLISE BAPTISTE SEL ET LUMIÈRE',W/2,55,28,true,'#102644','center');txt('RAPPORT MENSUEL DE PONCTUALITÉ',W/2,105,38,true,'#111827','center');txt(fmtMonth(month),W/2,155,25,false,'#667085','center');x.fillStyle='#c59d3f';x.fillRect(70,205,W-140,4);
   const stats=[['Activités',s.activities],['Présence',pct(s.attendance_rate)],['Ponctualité',pct(s.punctuality_rate)],['Retards',s.late],['Absences',s.absent]];let sy=245;stats.forEach((a,i)=>{const bw=(W-140-4*18)/5,bx=70+i*(bw+18);x.fillStyle='#f5f7fa';x.fillRect(bx,sy,bw,105);txt(a[0],bx+15,sy+14,19,false,'#667085');txt(a[1],bx+15,sy+51,28,true,'#102644')});
   let y=390;const cols=[70,540,650,740,840,940,1040,1170,1360];x.fillStyle='#102644';x.fillRect(70,y,W-140,48);['Membre','Act.','P','RM','RNM','AM','ANM','Présence','Ponct.'].forEach((h,i)=>txt(h,cols[i]+8,y+12,18,true,'#fff'));y+=48;
   (members.length?members:[{name:'Aucune donnée'}]).forEach((m,i)=>{if(i%2===0){x.fillStyle='#f5f7fa';x.fillRect(70,y,W-140,rowH)};txt(m.name||'',cols[0]+8,y+12,18,false);txt(m.marked??'',cols[1]+8,y+12,18);txt(m.P??'',cols[2]+8,y+12,18);txt(m.RM??'',cols[3]+8,y+12,18);txt(m.RNM??'',cols[4]+8,y+12,18);txt(m.AM??'',cols[5]+8,y+12,18);txt((Number(m.ANM||0)+Number(m.ANMP||0))||'',cols[6]+8,y+12,18);txt(m.attendance_rate!=null?pct(m.attendance_rate):'',cols[7]+8,y+12,18);txt(m.punctuality_rate!=null?pct(m.punctuality_rate):'',cols[8]+8,y+12,18);y+=rowH});
   y=Math.min(H-230,y+70);x.strokeStyle='#111827';x.beginPath();x.moveTo(100,y);x.lineTo(500,y);x.moveTo(W-500,y);x.lineTo(W-100,y);x.stroke();txt('Secrétaire',100,y+12,19,false,'#667085');txt('Président',W-100,y+12,19,false,'#667085','right');txt('Validé le '+(row.approved_at?new Date(row.approved_at).toLocaleString('fr-FR'):'—'),70,H-95,18,false,'#667085');
   c.toBlob(blob=>{if(!blob)return alert('Impossible de générer le JPEG.');const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Rapport_mensuel_ponctualite_CHEBSEL_${month}.jpg`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)},'image/jpeg',0.94);
  }catch(e){alert('JPEG impossible : '+(e?.message||e))}
 };

 window.modifySecretaryMonthlyPunctuality=async function(){
  if(role()!=='secretary')return;
  const month=document.getElementById('punctualityCloseMonth')?.value||new Date().toISOString().slice(0,7),reason=prompt('Rezon obligatwa pou modifye rapò mansyèl '+month+' :');if(reason===null)return;if(!reason.trim()){alert('Ou dwe antre yon rezon pou modification an.');return}
  try{const row=await monthlyRow(month);if(!row||row.status!=='approved'){alert('Se sèlman yon rapò deja valide ki ka réouvrir pou modification.');return}if(typeof criticalGuard==='function'&&!(await criticalGuard('attendance.write','Modifier le rapport mensuel de ponctualité '+month)))return;const {c,org}=await cloudCtx(),q=await c.from('punctuality_monthly_closings').update({status:'reopened',reopened_reason:reason.trim(),updated_at:new Date().toISOString()}).eq('organization_id',org).eq('month_reference',month).select().single();if(q.error)throw q.error;monthlyApprovedRow=null;const panel=ensureSecretaryMonthlyDocument();panel.innerHTML='';panel.style.display='none';await renderPunctualityClosing?.();setTimeout(applyPunctualityScope,80);alert('Rapò a réouvert pou modification. Apre koreksyon, Sekretè a dwe reprépare li epi Prezidan an dwe valide li ankò.')}catch(e){alert('Modification impossible : '+(e?.message||e))}
 };

 async function refreshSecretaryMonthlyActions(){
  if(role()!=='secretary'||reportScope!=='monthly')return;
  const closing=document.getElementById('punctualityClosingPanel');if(!closing)return;
  let bar=document.getElementById('secretaryMonthlyReportActions');if(!bar){bar=document.createElement('div');bar.id='secretaryMonthlyReportActions';bar.className='memberActions';bar.style.marginTop='14px';closing.appendChild(bar)}
  const month=document.getElementById('punctualityCloseMonth')?.value||new Date().toISOString().slice(0,7);
  try{const row=await monthlyRow(month);if(row?.status==='approved')bar.innerHTML='<button class="quickBtn" onclick="generateSecretaryMonthlyPunctualityReport()">Générer le rapport</button><button class="secondaryQuick" onclick="saveSecretaryMonthlyPunctualityJPEG()">Enregistrer en JPEG</button><button class="secondaryQuick" onclick="modifySecretaryMonthlyPunctuality()">Modifier avec motif</button>';else bar.innerHTML='<div class="memberMeta">Après validation du Président, les options Générer, JPEG et Modifier seront disponibles ici.</div>'}catch(e){bar.innerHTML=''}
 }

 function applyPunctualityScope(){
  if(role()!=='secretary'||!reportScope)return;
  const view=document.getElementById('punctualityReportView');if(!view)return;
  const body=view.querySelector('.membersBody')||view,closing=document.getElementById('punctualityClosingPanel'),monthlyDoc=document.getElementById('secretaryMonthlyReportPanel');
  [...body.children].forEach(el=>{
   if(reportScope==='monthly')el.style.display=(el===closing||el===monthlyDoc)?'':'none';
   else el.style.display=(el===closing||el===monthlyDoc)?'none':'';
  });
  if(reportScope==='monthly'){if(closing)closing.style.display='';if(monthlyDoc&&monthlyDoc.innerHTML.trim())monthlyDoc.style.display='';refreshSecretaryMonthlyActions()}
 }

 const baseOpenPunct=window.openPunctualityReport;
 if(typeof baseOpenPunct==='function')window.openPunctualityReport=function(){if(role()!=='secretary')reportScope=null;const out=baseOpenPunct.apply(this,arguments);if(role()!=='secretary')setTimeout(()=>{const v=document.getElementById('punctualityReportView'),b=v?.querySelector('.membersBody');if(b)[...b.children].forEach(x=>x.style.display='')},40);return out};

 // Contextual back: report detail -> report hub, attendance detail -> Fiche d'Appel hub.
 const baseClosePunct=window.closePunctualityReport;
 if(typeof baseClosePunct==='function')window.closePunctualityReport=function(){const back=role()==='secretary'&&!!reportScope;const out=baseClosePunct.apply(this,arguments);if(back){reportScope=null;monthlyApprovedRow=null;setTimeout(()=>openSecretaryReportsHub(),0)}return out};
 const baseCloseViewer=window.closeViewer;
 if(typeof baseCloseViewer==='function')window.closeViewer=function(){const back=role()==='secretary'&&!!attendanceScope;const out=baseCloseViewer.apply(this,arguments);if(back){attendanceScope=null;setTimeout(()=>openSecretaryCallHub(),0)}return out};

 function enforceSecretaryDebtors(){
  if(role()!=='secretary')return;
  const view=document.getElementById('debtorsView');if(!view)return;
  view.querySelectorAll('button').forEach(b=>{if(/^paiement$/i.test((b.textContent||'').trim())||/payment/i.test(b.getAttribute('onclick')||''))b.style.display='none'});
 }
 ['openPaymentModal','openSmartPayment','startPayment'].forEach(name=>{const base=window[name];if(typeof base!=='function'||base.__secretaryGuard)return;const fn=function(){if(role()==='secretary'){alert('Sekretè a gen aksè an lekti sèlman sou débiteurs. Li pa ka anrejistre peman.');return}return base.apply(this,arguments)};fn.__secretaryGuard=true;window[name]=fn});

 const obs=new MutationObserver(()=>{enforceSecretaryDebtors();if(attendanceScope)applyAttendanceScope();if(reportScope)applyPunctualityScope()});
 document.addEventListener('DOMContentLoaded',()=>{obs.observe(document.body,{subtree:true,childList:true});setTimeout(enforceSecretaryDebtors,150)});
 if(typeof window.openDebtors==='function'){const base=window.openDebtors;window.openDebtors=function(){const out=base.apply(this,arguments);setTimeout(enforceSecretaryDebtors,60);return out}}
})();
