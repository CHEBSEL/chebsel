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
  home.querySelectorAll('.hero,.old-tech-panel,#backupHealth,#installCard,#syncMessage,.smallnote,.visitorOnlyNote,#roleShellGrid').forEach(x=>x.style.display='none');
  home.querySelectorAll(':scope > section.grid,:scope > .treasury-launch-grid,:scope > #presidentUtilityCards').forEach(x=>x.style.display='none');
  const oldReports=document.getElementById('reportsCenterLaunch');if(oldReports)oldReports.style.display='none';
 }

 function ensureCleanRoot(){
  const home=document.querySelector('main.home');if(!home)return null;
  let root=document.getElementById('cleanRoleRoot');
  if(!root){
   root=document.createElement('section');root.id='cleanRoleRoot';root.className='cleanRoleRoot';
   const dash=document.getElementById('monthlyDashboard')?.closest('.profilePanel');
   if(dash?.parentNode)dash.parentNode.insertBefore(root,dash.nextSibling);else home.appendChild(root);
  }
  return root
 }

 function menuFor(r){
  if(r==='secretary')return [
   ['👥','Membres','openMembers()'],
   ['✅','Fiche d’Appel','openSecretariatHub()'],
   ['🕘','Historique','openAttendanceHistory()'],
   ['📊','Rapport ponctualité','openReportsCenter()'],
   ['📋','Débiteurs','openDebtors()'],
   ['🗂️','Sauvegarde & Archives','openScopedArchiveHub()']
  ];
  if(r==='treasurer')return [
   ['👥','Membres','openMembers()'],
   ['💰','Paiements','openTreasuryPaymentHub()'],
   ['📋','Débiteurs','openDebtors()'],
   ['💸','Dépenses','openTreasuryExpenses()'],
   ['📈','Historique / Histogramme','openFinanceHistory()'],
   ['📊','Rapport financier','openReportsCenter()'],
   ['🗂️','Sauvegarde & Archives','openScopedArchiveHub()']
  ];
  if(r==='president')return [
   ['👥','Membres','openMembers()'],
   ['🗃️','Secrétariat','openSecretariatHub()'],
   ['💼','Trésorerie','openTreasuryHub()'],
   ['📚','Rapports','openReportsCenter()'],
   ['🗂️','Archive générale','openScopedArchiveHub()'],
   ['⚖️','Journal des conflits','openConflictJournal()'],
   ['⚙️','Paramètres','openSettingsHub()'],
   ['🔒','Confidentialités','openPrivacyHub()'],
   ['ℹ️','À propos','openAboutHub()']
  ];
  return [
   ['👥','Membres','openVisitorMembers()'],
   ['📋','Débiteurs','openDebtors()']
  ];
 }

 function renderCleanRole(){
  hideLegacyHome();
  const root=ensureCleanRoot();if(!root)return;
  const r=role();
  root.innerHTML=`<div class="cleanRoleHeader"><h2>${esc(labels[r]||'Visiteur')}</h2></div><div class="cleanRoleGrid">${menuFor(r).map(x=>btn(...x)).join('')}</div>`;
  applyCalendarPermissions(r);
  // Visitor must never see finance entry points.
  if(r==='visitor'){
   document.querySelectorAll('[onclick*="openFinance"],[onclick*="openTreasury"],[onclick*="openVisitorFinance"],#reportsCenterLaunch,#treasuryPaymentHub,#treasuryHub').forEach(x=>{if(x.closest('#cleanRoleRoot'))return;x.style.display='none'});
  }
 }
 window.renderCleanRole=renderCleanRole;

 function applyCalendarPermissions(r){
  const canEdit=allowedCalendarEdit.has(r);
  const panel=document.getElementById('calendarHomePanel');
  if(panel){
   panel.querySelectorAll('button').forEach(b=>{
    const oc=b.getAttribute('onclick')||'',txt=(b.textContent||'').toLowerCase();
    const editish=/edit|delete|remove|cancel|modifier|supprimer|annuler|openCalendar/.test(oc+' '+txt);
    if(editish){
     // full-calendar view remains available to all, but mutations only President/Secretary.
     if(oc.includes('openCalendar')){b.style.display=''}
     else b.style.display=canEdit?'':'none';
    }
   });
  }
 }

 // Enforce calendar permissions even inside the full calendar view after it renders.
 function guardCalendarMutation(){
  if(allowedCalendarEdit.has(role()))return;
  document.querySelectorAll('#calendarView button,[data-calendar-action]').forEach(b=>{
   const oc=b.getAttribute('onclick')||'',txt=(b.textContent||'').toLowerCase();
   if(/edit|delete|remove|cancel|modifier|supprimer|annuler|ajouter|add/.test(oc+' '+txt))b.style.display='none';
  });
 }
 const obs=new MutationObserver(()=>{guardCalendarMutation()});
 document.addEventListener('DOMContentLoaded',()=>{renderCleanRole();obs.observe(document.body,{subtree:true,childList:true});setTimeout(renderCleanRole,300)});

 // Re-render role shell after role/login/home refresh, without creating duplicate menus.
 if(typeof window.refreshHome==='function'&&!window.__cleanShellRefreshWrapped){
  window.__cleanShellRefreshWrapped=true;const base=window.refreshHome;
  window.refreshHome=function(){const out=base.apply(this,arguments);setTimeout(renderCleanRole,0);return out};
 }
 window.addEventListener('storage',e=>{if(e.key&&/session|role|auth/i.test(e.key))setTimeout(renderCleanRole,50)});
})();
