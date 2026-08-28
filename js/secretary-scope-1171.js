/* CHEBSEL v1.17.1 — strict Secretary scope */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const esc=s=>{try{return escapeHtml(String(s??''))}catch(e){return String(s??'')}};
 let attendanceScope=null;
 let reportScope=null;

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
   const t=norm(el.textContent);
   if(!t)return;
   if(forbidden.some(x=>t===x||t.startsWith(x+' '))){el.style.display=allowed.some(x=>t===x||t.startsWith(x+' '))?'':'none'}
  });
  // Hide non-current top-level sections if the embedded app uses data-view/data-tab panels.
  d.querySelectorAll('[data-view],[data-page],[data-section]').forEach(el=>{
   const key=norm(el.getAttribute('data-view')||el.getAttribute('data-page')||el.getAttribute('data-section'));
   if(!key)return;
   if(['home','accueil','history','historique','reports','rapport','rapports','backup','sauvegarde','settings','parametres','call','appel'].includes(key)){
    const keep=attendanceScope==='call'?['call','appel'].includes(key):['settings','parametres'].includes(key);
    if(!keep)el.style.display='none';
   }
  });
 }

 window.openSecretaryReportsHub=function(){
  if(role()!=='secretary'){if(typeof openReportsCenter==='function')return openReportsCenter();return}
  const v=ensureHub('secretaryReportsHub','Rapport de ponctualité'),m=document.getElementById('secretaryReportsHubMenu');
  m.innerHTML=item('📅','Rapport mensuel de ponctualité',"closeSecretaryHub('secretaryReportsHub');openSecretaryMonthlyPunctuality()")+item('📊','Rapport de ponctualité — période libre',"closeSecretaryHub('secretaryReportsHub');openSecretaryFreePunctuality()");
  v.classList.add('open');
 };
 window.openSecretaryMonthlyPunctuality=function(){reportScope='monthly';openPunctualityReport();setTimeout(()=>{try{renderPunctualityClosing?.()}catch(e){};setTimeout(applyPunctualityScope,80)},50)};
 window.openSecretaryFreePunctuality=function(){reportScope='free';openPunctualityReport();setTimeout(applyPunctualityScope,80)};
 function applyPunctualityScope(){
  if(role()!=='secretary'||!reportScope)return;
  const view=document.getElementById('punctualityReportView');if(!view)return;
  const body=view.querySelector('.membersBody')||view;
  const closing=document.getElementById('punctualityClosingPanel');
  [...body.children].forEach(el=>{
   if(reportScope==='monthly')el.style.display=(el===closing)?'':'none';
   else el.style.display=(el===closing)?'none':'';
  });
  if(reportScope==='monthly'&&closing)closing.style.display='';
 }
 // Restore full report view for President.
 const baseOpenPunct=window.openPunctualityReport;
 if(typeof baseOpenPunct==='function')window.openPunctualityReport=function(){if(role()!=='secretary')reportScope=null;const out=baseOpenPunct.apply(this,arguments);if(role()!=='secretary')setTimeout(()=>{const v=document.getElementById('punctualityReportView'),b=v?.querySelector('.membersBody');if(b)[...b.children].forEach(x=>x.style.display='')},40);return out};

 function enforceSecretaryDebtors(){
  if(role()!=='secretary')return;
  const view=document.getElementById('debtorsView');if(!view)return;
  view.querySelectorAll('button').forEach(b=>{if(/^paiement$/i.test((b.textContent||'').trim())||/payment/i.test(b.getAttribute('onclick')||''))b.style.display='none'});
 }
 // Defense in depth: Secretary can never launch a debtor payment even through stale DOM.
 ['openPaymentModal','openSmartPayment','startPayment'].forEach(name=>{
  const base=window[name];if(typeof base!=='function'||base.__secretaryGuard)return;
  const fn=function(){if(role()==='secretary'){alert('Sekretè a gen aksè an lekti sèlman sou débiteurs. Li pa ka anrejistre peman.');return}return base.apply(this,arguments)};fn.__secretaryGuard=true;window[name]=fn;
 });

 const obs=new MutationObserver(()=>{enforceSecretaryDebtors();if(attendanceScope)applyAttendanceScope();if(reportScope)applyPunctualityScope()});
 document.addEventListener('DOMContentLoaded',()=>{obs.observe(document.body,{subtree:true,childList:true});setTimeout(enforceSecretaryDebtors,150)});
 if(typeof window.openDebtors==='function'){const base=window.openDebtors;window.openDebtors=function(){const out=base.apply(this,arguments);setTimeout(enforceSecretaryDebtors,60);return out}}
})();
