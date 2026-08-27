/* CHEBSEL v1.15.0 — Actionable notification routing + individual read state */
'use strict';
(function(){
 const esc=s=>String(s||'').trim();
 const monthFrom=s=>{const m=String(s||'').match(/\b(20\d{2}-\d{2})\b/);return m?m[1]:''};
 function closePanel(){try{window.closeNotifications?.()}catch(e){document.getElementById('notificationsView')?.classList.remove('open')}}
 function setMonth(id,month){if(!month)return;const el=document.getElementById(id);if(el){el.value=month;try{el.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){}}}
 function role(){try{return String(window.currentRoleView?.()||'').toLowerCase()}catch(e){return ''}}
 async function markRead(id){try{if(id&&typeof window.markAlertRead==='function')await window.markAlertRead(id)}catch(e){console.warn('CHEBSEL notification read:',e)}}

 async function route(title,text){
  const t=(title+' '+text).toLowerCase(),month=monthFrom(text)||monthFrom(title);
  closePanel();

  if(t.includes('rapport mensuel global')){
   if(role()==='president'){window.openReportsCenter?.();setTimeout(()=>window.openReportGlobalMonthly?.(),70)}
   return;
  }
  if(t.includes('clôture ponctualité')||t.includes('cloture ponctualite')||t.includes('ponctualité à valider')||t.includes('ponctualite a valider')){
   if(!['president','secretary'].includes(role()))return;
   window.openReportsCenter?.();
   setTimeout(()=>{window.openReportPunctualityMonthly?.();setTimeout(()=>{setMonth('punctualityCloseMonth',month);window.renderPunctualityClosing?.()},100)},70);
   return;
  }
  if(t.includes('clôture à valider')||t.includes('clôture mensuelle')||t.includes('cloture a valider')||t.includes('cloture mensuelle')){
   window.openReportsCenter?.();
   setTimeout(()=>{window.openReportFinancialMonthly?.();setTimeout(()=>{setMonth('closeMonth',month);window.renderMonthlyClose?.()},100)},70);
   return;
  }
  if(t.includes('cotisation en retard')||t.includes('dette ancienne')||t.includes('amendes ouvertes')||t.includes('débiteur')||t.includes('debiteur')){
   window.openDebtors?.();return;
  }
  if(t.includes('conflit de synchronisation')||t.includes('conflit')){
   if(role()==='president')window.openConflictJournal?.();else window.openDiagnostics?.();return;
  }
  if(t.includes('synchronisation en attente')||t.includes('échec de synchronisation')||t.includes('echec de synchronisation')||t.includes('sync')){
   if(typeof window.openDiagnostics==='function')window.openDiagnostics();else window.openSettingsHub?.();return;
  }
  try{window.globalBack?.()}catch(e){}
 }

 function decorate(){
  const list=document.getElementById('notificationList');if(!list)return;
  list.querySelectorAll('.alertRow').forEach(row=>{
   if(row.dataset.chebselRouted==='1')return;
   const title=esc(row.querySelector('b')?.textContent),text=esc(row.querySelector('.memberMeta')?.textContent),id=row.dataset.alertId||'';
   row.dataset.chebselRouted='1';row.classList.add('actionableAlert');row.setAttribute('role','button');row.setAttribute('tabindex','0');row.setAttribute('aria-label',`${title}. ${text}. Ouvrir la section concernée`);
   const hint=document.createElement('span');hint.className='alertRouteHint';hint.textContent='Ouvrir →';row.appendChild(hint);
   const go=async()=>{await markRead(id);row.classList.remove('alert-unread');row.classList.add('alert-read');await route(title,text)};
   row.addEventListener('click',go);
   row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
  });
 }
 const baseOpen=window.openNotifications;
 if(typeof baseOpen==='function')window.openNotifications=async function(){const out=await baseOpen.apply(this,arguments);decorate();return out};
 const baseRender=window.renderAlertsPanel;
 if(typeof baseRender==='function')window.renderAlertsPanel=async function(){const out=await baseRender.apply(this,arguments);decorate();return out};
 const baseMark=window.markAllAlertsRead;
 if(typeof baseMark==='function')window.markAllAlertsRead=function(){const out=baseMark.apply(this,arguments);setTimeout(decorate,0);return out};
 window.chebselDecorateActionableAlerts=decorate;
 window.chebselRouteNotification=route;
})();
