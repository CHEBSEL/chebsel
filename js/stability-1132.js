/* CHEBSEL v1.13.2 — stability, canonical truth, receipt regeneration */
'use strict';
(function(){
 const num=v=>Number(v||0);
 function financeState(){const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];return f}

 // Stop visual flicker: repeated background refreshes render only when state/role actually changed.
 if(typeof refreshHome==='function'){
  const baseRefresh=refreshHome;let lastSig='';
  function sig(){let r='';try{r=currentRoleView?.()||''}catch(e){}return [r,localStorage.getItem(MASTER_KEY)||'',localStorage.getItem(ATT_KEY)||'',localStorage.getItem(FIN_KEY)||'',localStorage.getItem(PAYMENT_LOG_KEY)||'',localStorage.getItem(CALENDAR_KEY)||'',localStorage.getItem('chebsel_public_snapshot_cache_v1')||''].join('|')}
  window.refreshHome=refreshHome=function(force=false){const s=sig();if(!force&&s===lastSig)return;const out=baseRefresh.apply(this,arguments);lastSig=sig();return out};
  window.forceRefreshHome=()=>refreshHome(true);
 }

 // Re-generate any existing receipt from payment history without changing financial data.
 window.regeneratePaymentReceipt=function(paymentId){
  const p=typeof paymentById==='function'?paymentById(paymentId):(safeParse(PAYMENT_LOG_KEY)||[]).find(x=>x.id===paymentId);
  if(!p){alert('Paiement introuvable.');return}
  const f=financeState();
  const alloc=(p.alloc||[]).map(a=>{const e=f.entries.find(x=>String(x.id)===String(a.entryId));return {...a,label:a.label||e?.typeLabel||e?.type||'Affectation'}});
  const applied=num(p.applied||alloc.reduce((s,a)=>s+num(a.amount),0));
  const remain=Math.max(0,num(p.unapplied||num(p.amount)-applied));
  showReceipt(p.memberId,num(p.amount),p.date||new Date().toISOString().slice(0,10),p.ref||'—',alloc,remain,p.receiptNo||p.id||'');
 };
 if(typeof renderMemberPaymentHistory==='function'){
  const baseHistory=renderMemberPaymentHistory;
  window.renderMemberPaymentHistory=renderMemberPaymentHistory=function(mid){
   let html=baseHistory.apply(this,arguments);
   for(const p of (typeof getPaymentLog==='function'?getPaymentLog():[]).filter(x=>String(x.memberId)===String(mid)&&x.status!=='cancelled')){
    const marker=`<button class="secondaryQuick" onclick="openPaymentCorrectionModal('${p.id}')">Corriger</button>`;
    if(html.includes(marker))html=html.replace(marker,`<button class="secondaryQuick" onclick="regeneratePaymentReceipt('${p.id}')">Rejenere resi</button>${marker}`);
   }
   return html;
  };
 }

 // After every cloud sync, reconcile posted payments with open debts on the server, then pull the canonical finance state.
 if(typeof cloudPilotSync==='function'){
  const baseSync=cloudPilotSync;let reconciling=false;
  window.cloudPilotSync=cloudPilotSync=async function(){
   const out=await baseSync.apply(this,arguments);
   if(reconciling||!navigator.onLine)return out;
   reconciling=true;
   try{
    const c=await getCloudClient(),p=await getCloudProfile(),org=p?.organization_id||p?.org_id;
    if(c&&org){const q=await c.rpc('chebsel_reconcile_unallocated_payments');if(q.error)console.warn('Canonical payment reconciliation:',q.error);if(typeof pullCloudFinance==='function')await pullCloudFinance(org);if(typeof repairPaymentAllocationIntegrity==='function')repairPaymentAllocationIntegrity();if(typeof forceRefreshHome==='function')forceRefreshHome();}
   }catch(e){console.warn('CHEBSEL canonical truth reconciliation:',e)}finally{reconciling=false}
   return out;
  };
 }
})();
