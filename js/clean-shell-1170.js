/* CHEBSEL v1.17.18 — stable clean role shell; no global DOM observer */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'visitor').toLowerCase()}catch(e){return 'visitor'}};
 const esc=s=>{try{return escapeHtml(String(s??''))}catch(e){return String(s??'')}};
 const labels={president:'Président',secretary:'Secrétaire',treasurer:'Trésorier',visitor:'Visiteur'};
 const allowedCalendarEdit=new Set(['president','secretary']);
 function btn(icon,title,fn){return `<button class="cleanNavCard" onclick="${fn}" aria-label="${esc(title)}"><span class="cleanNavIcon">${icon}</span><span class="cleanNavTitle">${esc(title)}</span></button>`}
 function hideEl(x){if(!x)return;x.style.display='none';x.hidden=true}
 function showEl(x,display='block'){if(!x)return;x.style.display=display;x.hidden=false}
 function hideLegacyHome(){
  const home=document.querySelector('main.home');if(!home)return;
  const monthlyPanel=document.getElementById('monthlyDashboard')?.closest('.profilePanel');
  [...home.children].forEach(x=>{const keep=x.classList?.contains('stats')||x.id==='calendarHomePanel'||x===monthlyPanel||x.id==='cleanRoleRoot';if(!keep)hideEl(x)});
  ['strictRoleArea','roleShellGrid','reportsCenterLaunch','presidentUtilityCards','backupHealth','installCard','syncMessage'].forEach(id=>hideEl(document.getElementById(id)));
  home.querySelectorAll('.hero,.old-tech-panel,.smallnote,.visitorOnlyNote,.treasury-launch-grid').forEach(hideEl);
 }
 function ensureCleanRoot(){
  const home=document.querySelector('main.home');if(!home)return null;
  let root=document.getElementById('cleanRoleRoot');
  if(!root){root=document.createElement('section');root.id='cleanRoleRoot';root.className='cleanRoleRoot';const dash=document.getElementById('monthlyDashboard')?.closest('.profilePanel');if(dash?.parentNode)dash.parentNode.insertBefore(root,dash.nextSibling);else home.appendChild(root)}
  showEl(root);return root;
 }
 function menuFor(r){
  if(r==='secretary')return [['👥','Membres','openMembers()'],['✅','Fiche d’Appel','openSecretaryCallHub()'],['🕘','Historique','openAttendanceHistory()'],['📊','Rapport ponctualité','openSecretaryReportsHub()'],['📋','Débiteurs','openDebtors()'],['🗂️','Sauvegarde & Archives','openScopedArchiveHub()']];
  if(r==='treasurer')return [['👥','Membres','openMembers()'],['💰','Paiements','openTreasurerPaymentHub()'],['📋','Débiteurs','openDebtors()'],['💸','Dépenses','openTreasurerExpensesScoped()'],['📈','Historique / Histogramme','openTreasurerFinanceHealth()'],['📊','Rapport financier','openTreasurerReportsHub()'],['🗂️','Sauvegarde & Archives','openScopedArchiveHub()']];
  if(r==='president')return [['👥','Membres','openMembers()'],['🗃️','Secrétariat','openPresidentSecretariatHub()'],['💼','Trésorerie','openPresidentTreasuryHub()'],['📚','Rapports','openReportsCenter()'],['🗂️','Archive générale','openScopedArchiveHub()'],['⚖️','Journal des conflits','openConflictJournal()'],['⚙️','Paramètres','openSettingsHub()'],['🔒','Confidentialités','openPrivacyHub()'],['ℹ️','À propos','openAboutHub()']];
  return [['👥','Membres','openVisitorMembers()'],['📋','Débiteurs','openDebtors()']];
 }
 function applyCalendarPermissions(r){
  const canEdit=allowedCalendarEdit.has(r),panel=document.getElementById('calendarHomePanel');if(!panel)return;showEl(panel);
  panel.querySelectorAll('button').forEach(b=>{const oc=b.getAttribute('onclick')||'',txt=(b.textContent||'').toLowerCase(),editish=/edit|delete|remove|cancel|modifier|supprimer|annuler|ajouter|créer|creer/.test(oc+' '+txt);if(editish&&!canEdit)hideEl(b);else showEl(b,'')});
 }
 function renderCleanRole(){
  const root=ensureCleanRoot();if(!root)return;hideLegacyHome();const r=role();
  root.innerHTML=`<div class="cleanRoleHeader"><h2>${esc(labels[r]||'Visiteur')}</h2></div><div class="cleanRoleGrid">${menuFor(r).map(x=>btn(...x)).join('')}</div>`;
  applyCalendarPermissions(r);
  if(r==='visitor')document.querySelectorAll('[onclick*="openFinance"],[onclick*="openTreasury"],[onclick*="openVisitorFinance"],#treasuryPaymentHub,#treasuryHub,#treasuryExpensesView,#treasuryReportView').forEach(hideEl);
 }
 window.renderCleanRole=renderCleanRole;
 function scheduleRender(){requestAnimationFrame(()=>{try{renderCleanRole()}catch(e){console.warn('CHEBSEL shell render',e)}})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleRender,{once:true});else scheduleRender();
 window.addEventListener('load',scheduleRender,{once:true});
 window.addEventListener('storage',e=>{if(!e.key||/session|role|auth/i.test(e.key))scheduleRender()});
 // Refresh Home may be called frequently; do not rebuild the shell every time unless role changed.
 if(typeof window.refreshHome==='function'&&!window.__cleanShellStableRefresh){
  window.__cleanShellStableRefresh=true;const base=window.refreshHome;let lastRole='';
  window.refreshHome=function(){const out=base.apply(this,arguments),r=role();if(r!==lastRole||!document.getElementById('cleanRoleRoot')){lastRole=r;scheduleRender()}return out};
 }
})();
