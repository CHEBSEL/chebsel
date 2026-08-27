/* CHEBSEL v1.17.0 — clean role shell: one menu, no duplicates */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'visitor').toLowerCase()}catch(e){return 'visitor'}};
 const esc=s=>{try{return escapeHtml(String(s??''))}catch(e){return String(s??'')}};
 const labels={president:'Président',secretary:'Secrétaire',treasurer:'Trésorier',visitor:'Visiteur'};
 const allowedCalendarEdit=new Set(['president','secretary']);

 function btn(icon,title,fn){return `<button class="cleanNavCard" onclick="${fn}" aria-label="${esc(title)}"><span class="cleanNavIcon">${icon}</span><span class="cleanNavTitle">${esc(title)}</span></button>`}

 function hideLegacyHome(){
  const home=document.querySelector('main.home');if(!home)return;
  // Preserve only the four intended home areas: overview stats, calendar, monthly dashboard, clean role menu.
  const monthlyPanel=document.getElementById('monthlyDashboard')?.closest('.profilePanel');
  [...home.children].forEach(x=>{
   const keep=x.classList?.contains('stats')||x.id==='calendarHomePanel'||x===monthlyPanel||x.id==='cleanRoleRoot';
   if(!keep)x.style.display='none';
  });
  ['strictRoleArea','roleShellGrid','reportsCenterLaunch','presidentUtilityCards','backupHealth','installCard','syncMessage'].forEach(id=>{
   const x=document.getElementById(id);if(x){x.style.display='none';x.hidden=true;}
  });
  home.querySelectorAll('.hero,.old-tech-panel,.smallnote,.visitorOnlyNote,.treasury-launch-grid').forEach(x=>x.style.display='none');
 }

 function ensureCleanRoot(){
  const home=document.querySelector('main.home');if(!home)return null;
  let root=document.getElementById('cleanRoleRoot');
  if(!root){
   root=document.createElement('section');root.id='cleanRoleRoot';root.className='cleanRoleRoot';
   const dash=document.getElementById('monthlyDashboard')?.closest('.profilePanel');
   if(dash?.parentNode)dash.parentNode.insertBefore(root,dash.nextSibling);else home.appendChild(root);
  }
  root.style.display='block';root.hidden=false;
  return root
 }

 function menuFor(r){
  if(r==='secretary')return [
   ['👥','Membres','openMembers()'],['✅','Fiche d’Appel','openSecretariatHub()'],['🕘','Historique','openAttendanceHistory()'],['📊','Rapport ponctualité','openReportsCenter()'],['📋','Débiteurs','openDebtors()'],['🗂️','Sauvegarde & Archives','openScopedArchiveHub()']
  ];
  if(r==='treasurer')return [
   ['👥','Membres','openMembers()'],['💰','Paiements','openTreasuryPaymentHub()'],['📋','Débiteurs','openDebtors()'],['💸','Dépenses','openTreasuryExpenses()'],['📈','Historique / Histogramme','openFinanceHistory()'],['📊','Rapport financier','openReportsCenter()'],['🗂️','Sauvegarde & Archives','openScopedArchiveHub()']
  ];
  if(r==='president')return [
   ['👥','Membres','openMembers()'],['🗃️','Secrétariat','openSecretariatHub()'],['💼','Trésorerie','openTreasuryHub()'],['📚','Rapports','openReportsCenter()'],['🗂️','Archive générale','openScopedArchiveHub()'],['⚖️','Journal des conflits','openConflictJournal()'],['⚙️','Paramètres','openSettingsHub()'],['🔒','Confidentialités','openPrivacyHub()'],['ℹ️','À propos','openAboutHub()']
  ];
  return [['👥','Membres','openVisitorMembers()'],['📋','Débiteurs','openDebtors()']];
 }

 function renderCleanRole(){
  const root=ensureCleanRoot();if(!root)return;
  hideLegacyHome();
  const r=role();
  root.innerHTML=`<div class="cleanRoleHeader"><h2>${esc(labels[r]||'Visiteur')}</h2></div><div class="cleanRoleGrid">${menuFor(r).map(x=>btn(...x)).join('')}</div>`;
  applyCalendarPermissions(r);
  if(r==='visitor'){
   // Visitor can never see member contributions, payments, receipts or finance configuration.
   document.querySelectorAll('[onclick*="openFinance"],[onclick*="openTreasury"],[onclick*="openVisitorFinance"],#treasuryPaymentHub,#treasuryHub,#treasuryExpensesView,#treasuryReportView').forEach(x=>x.style.display='none');
  }
 }
 window.renderCleanRole=renderCleanRole;

 function applyCalendarPermissions(r){
  const canEdit=allowedCalendarEdit.has(r),panel=document.getElementById('calendarHomePanel');
  if(panel){
   panel.style.display='block';
   panel.querySelectorAll('button').forEach(b=>{
    const oc=b.getAttribute('onclick')||'',txt=(b.textContent||'').toLowerCase();
    const editish=/edit|delete|remove|cancel|modifier|supprimer|annuler|ajouter|créer|creer/.test(oc+' '+txt);
    if(editish)b.style.display=canEdit?'':'none';
    if(oc.includes('openCalendar')&&!editish)b.style.display='';
   });
  }
 }
 function guardCalendarMutation(){
  if(allowedCalendarEdit.has(role()))return;
  document.querySelectorAll('#calendarView button,[data-calendar-action]').forEach(b=>{
   const oc=b.getAttribute('onclick')||'',txt=(b.textContent||'').toLowerCase();
   if(/edit|delete|remove|cancel|modifier|supprimer|annuler|ajouter|add/.test(oc+' '+txt))b.style.display='none';
  });
 }

 function enforceExclusiveShell(){
  hideLegacyHome();
  const root=document.getElementById('cleanRoleRoot');if(root){root.style.display='block';root.hidden=false;}
  const strict=document.getElementById('strictRoleArea');if(strict){strict.style.display='none';strict.hidden=true;}
  const old=document.getElementById('roleShellGrid');if(old){old.style.display='none';old.hidden=true;}
  guardCalendarMutation();
 }

 document.addEventListener('DOMContentLoaded',()=>{renderCleanRole();setTimeout(renderCleanRole,250)});
 window.addEventListener('load',()=>setTimeout(renderCleanRole,150));
 const obs=new MutationObserver(()=>enforceExclusiveShell());
 document.addEventListener('DOMContentLoaded',()=>obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','hidden']}));

 if(typeof window.refreshHome==='function'&&!window.__cleanShellRefreshWrapped){
  window.__cleanShellRefreshWrapped=true;const base=window.refreshHome;
  window.refreshHome=function(){const out=base.apply(this,arguments);setTimeout(renderCleanRole,0);return out};
 }
 window.addEventListener('storage',e=>{if(e.key&&/session|role|auth/i.test(e.key))setTimeout(renderCleanRole,50)});
})();
