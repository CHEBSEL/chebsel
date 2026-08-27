/* CHEBSEL v1.16.1 — strict role distribution and role-shell visibility fix */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const roleLabel=r=>({president:'Président',secretary:'Secrétaire',treasurer:'Trésorier',visitor:'Visiteur'})[r]||'Visiteur';
 function dashboardAnchor(){
  const d=document.getElementById('monthlyDashboard');
  return d?.closest('.profilePanel,.monthlyDashboardPanel,.panel')||d?.parentElement||null;
 }
 function ensureRoleArea(){
  let grid=document.getElementById('roleShellGrid');
  if(!grid&&typeof window.renderRoleShell==='function'){try{window.renderRoleShell()}catch(e){}}
  grid=document.getElementById('roleShellGrid');
  if(!grid)return null;
  let area=document.getElementById('strictRoleArea');
  if(!area){
   area=document.createElement('section');area.id='strictRoleArea';area.className='strictRoleArea';
   area.innerHTML='<div class="strictRoleHead"><div><span class="strictRoleEyebrow">ESPACE DE TRAVAIL</span><h2 id="strictRoleTitle"></h2><p id="strictRoleSubtitle"></p></div><span class="strictRoleBadge" id="strictRoleBadge"></span></div>';
  }
  if(grid.parentElement!==area)area.appendChild(grid);
  const anchor=dashboardAnchor();
  if(anchor?.parentNode&&area.previousElementSibling!==anchor)anchor.parentNode.insertBefore(area,anchor.nextSibling);
  grid.style.display='grid';grid.hidden=false;
  return area;
 }
 function setRoleCopy(r){
  const title=document.getElementById('strictRoleTitle'),sub=document.getElementById('strictRoleSubtitle'),badge=document.getElementById('strictRoleBadge');
  if(title)title.textContent='Espace '+roleLabel(r);
  if(badge)badge.textContent=roleLabel(r);
  const map={
   president:'Administration complète : membres, secrétariat, trésorerie, rapports, archives et gouvernance.',
   secretary:'Secrétariat : membres, appel, historique, ponctualité, débiteurs et archives du secrétariat.',
   treasurer:'Trésorerie : membres, paiements, débiteurs, dépenses, historique, rapports et archives financières.',
   visitor:'Consultation uniquement : membres, cotisations/amendes et débiteurs, sans modification.'
  };
  if(sub)sub.textContent=map[r]||map.visitor;
 }
 function enforceCalendarRole(){
  const r=role(),editable=['president','secretary'].includes(r),panel=document.getElementById('calendarHomePanel');
  if(!panel)return;
  panel.dataset.roleAccess=editable?'editable':'readonly';
  panel.querySelectorAll('button').forEach(btn=>{
   const t=(btn.textContent||'').toLowerCase();
   const editAction=/modifier|supprimer|annuler|ajouter|créer|creer/.test(t);
   if(editAction){btn.style.display=editable?'':'none';btn.disabled=!editable}
  });
  let note=panel.querySelector('.calendarRoleNote');
  if(!note){note=document.createElement('div');note.className='memberMeta calendarRoleNote';panel.appendChild(note)}
  note.textContent=editable?'Calendrier modifiable par '+roleLabel(r)+'.':'Calendrier en lecture seule pour '+roleLabel(r)+'.';
 }
 function hideLegacyRoleCards(){
  document.querySelectorAll('main.home > section.grid:not(#strictRoleArea),main.home > .treasury-launch-grid,#presidentUtilityCards').forEach(x=>{
   if(x.id!=='roleShellGrid'&&!x.closest('#strictRoleArea'))x.style.display='none';
  });
 }
 function syncRoleUI(){
  const r=role();
  try{if(typeof window.renderRoleShell==='function')window.renderRoleShell()}catch(e){}
  const area=ensureRoleArea();
  if(area){area.style.display='block';area.dataset.role=r||'visitor'}
  const grid=document.getElementById('roleShellGrid');if(grid){grid.style.display='grid';grid.hidden=false}
  setRoleCopy(r||'visitor');
  enforceCalendarRole();
  hideLegacyRoleCards();
 }
 window.syncStrictRoleUI=syncRoleUI;
 const wrap=name=>{const base=window[name];if(typeof base!=='function'||base.__strictRoleWrapped)return;const fn=function(){const out=base.apply(this,arguments);Promise.resolve(out).finally(()=>setTimeout(syncRoleUI,0));return out};fn.__strictRoleWrapped=true;window[name]=fn};
 wrap('refreshHome');wrap('updateAuthUI');
 document.addEventListener('DOMContentLoaded',()=>setTimeout(syncRoleUI,120));
 window.addEventListener('load',()=>setTimeout(syncRoleUI,220));
 const obs=new MutationObserver(()=>{const g=document.getElementById('roleShellGrid');if(g&&g.style.display==='none')g.style.display='grid'});
 obs.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['style','class']});
 setInterval(syncRoleUI,5000);
})();
