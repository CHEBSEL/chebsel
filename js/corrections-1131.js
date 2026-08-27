/* CHEBSEL v1.13.1 — corrective integration: payments, receipts, closing, global back */
'use strict';
(function(){
 const processedPayments=new Set();
 let financePaidSnapshot=new Map();
 let financeMonitorBusy=false;
 const nowDate=()=>new Date().toISOString().slice(0,10);
 const num=v=>Number(v||0);
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const posted=p=>p&&p.status!=='cancelled'&&num(p.amount)>0;
 function activePayments(){const x=safeParse(PAYMENT_LOG_KEY);return Array.isArray(x)?x.filter(posted):[]}
 function financeState(){const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];return f}
 function allocId(){try{return uid()}catch(e){return crypto.randomUUID?.()||('alloc_'+Date.now()+'_'+Math.random().toString(36).slice(2))}}
 function captureFinancePaid(){financePaidSnapshot=new Map((financeState().entries||[]).map(e=>[String(e.id),num(e.paid)]))}
 function allocationLabel(e){return e?.typeLabel||e?.type||'Affectation'}

 function repairPaymentAllocationIntegrity(){
  const f=financeState(),payments=activePayments();
  if(!payments.length||!f.entries.length){captureFinancePaid();return {changed:false,repaired:0}}
  const entriesByMember=new Map();
  for(const e of f.entries){const k=String(e.memberId||'');if(!entriesByMember.has(k))entriesByMember.set(k,[]);entriesByMember.get(k).push(e)}
  for(const rows of entriesByMember.values())rows.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||String(a.id).localeCompare(String(b.id)));
  const knownByEntry=new Map();
  for(const p of payments)for(const a of (p.alloc||[])){if(num(a.amount)<=0)continue;knownByEntry.set(String(a.entryId||''),(knownByEntry.get(String(a.entryId||''))||0)+num(a.amount))}
  let changed=false,repaired=0;
  const ordered=[...payments].sort((a,b)=>(a.date||'').localeCompare(b.date||'')||(a.at||'').localeCompare(b.at||''));
  for(const p of ordered){
   if(!Array.isArray(p.alloc))p.alloc=[];
   let remain=Math.max(0,num(p.amount)-p.alloc.reduce((s,a)=>s+num(a.amount),0));
   if(remain<=0)continue;
   const rows=entriesByMember.get(String(p.memberId||''))||[];
   // First convert already-recorded local paid values into explicit allocations.
   for(const e of rows){if(remain<=0)break;const known=knownByEntry.get(String(e.id))||0,gap=Math.max(0,num(e.paid)-known);if(gap<=0)continue;const x=Math.min(gap,remain);p.alloc.push({syncId:allocId(),entryId:e.id,label:allocationLabel(e),amount:x});knownByEntry.set(String(e.id),known+x);remain-=x;changed=true;repaired+=x}
   // Then allocate any genuinely unallocated remainder to oldest open debts.
   for(const e of rows){if(remain<=0)break;const known=knownByEntry.get(String(e.id))||0,effective=Math.max(num(e.paid),known),open=Math.max(0,num(e.due)-effective);if(open<=0)continue;const x=Math.min(open,remain);p.alloc.push({syncId:allocId(),entryId:e.id,label:allocationLabel(e),amount:x});knownByEntry.set(String(e.id),known+x);e.paid=effective+x;e.paidDate=p.date||nowDate();e.updatedAt=new Date().toISOString();remain-=x;changed=true;repaired+=x}
   p.applied=Math.max(0,num(p.amount)-remain);p.unapplied=remain;
  }
  for(const e of f.entries){const known=knownByEntry.get(String(e.id))||0;if(known>num(e.paid)){e.paid=known;e.updatedAt=new Date().toISOString();changed=true}}
  if(changed){localStorage.setItem(FIN_KEY,JSON.stringify(f));localStorage.setItem(PAYMENT_LOG_KEY,JSON.stringify((safeParse(PAYMENT_LOG_KEY)||[])));try{syncReadyOnLocalWrite(FIN_KEY,f);syncReadyOnLocalWrite(PAYMENT_LOG_KEY,safeParse(PAYMENT_LOG_KEY)||[])}catch(e){}}
  captureFinancePaid();
  return {changed,repaired};
 }
 window.repairPaymentAllocationIntegrity=repairPaymentAllocationIntegrity;

 function refreshAllPaymentSurfaces(mid){
  try{syncBridge()}catch(e){}
  try{refreshHome()}catch(e){}
  try{if(document.getElementById('debtorsView')?.classList.contains('open'))renderDebtors()}catch(e){}
  try{if(mid&&document.getElementById('profileView')?.classList.contains('open'))renderProfile(mid)}catch(e){}
  try{if(document.getElementById('monthlyView')?.classList.contains('open'))renderMonthlyClose()}catch(e){}
  try{if(typeof renderTreasuryReport==='function'&&document.getElementById('treasuryReportView')?.classList.contains('open'))renderTreasuryReport()}catch(e){}
  try{if(typeof refreshInstitutionalAlerts==='function')refreshInstitutionalAlerts()}catch(e){}
 }
 async function syncPaymentNow(){if(!navigator.onLine)return;try{if(typeof cloudPilotSync==='function')await cloudPilotSync(true)}catch(e){console.warn('CHEBSEL payment sync:',e)}}
 window.refreshAllPaymentSurfaces=refreshAllPaymentSurfaces;

 function receiptForPayment(p){
  if(!p||processedPayments.has(p.id))return;
  processedPayments.add(p.id);
  const alloc=(p.alloc||[]).map(a=>{const e=financeState().entries.find(x=>String(x.id)===String(a.entryId));return {...a,label:a.label||allocationLabel(e)}});
  try{showReceipt(p.memberId,num(p.applied||p.amount),p.date||nowDate(),p.ref||'Paiement CHEBSEL',alloc,num(p.unapplied||0),p.id||'')}catch(e){console.warn('Reçu universel:',e)}
 }
 function findRecentMatchingPayment(mid,amount,date){const list=activePayments();return list.find(p=>String(p.memberId)===String(mid)&&Math.abs(num(p.amount)-num(amount))<0.001&&String(p.date||'')===String(date||'')&&!processedPayments.has(p.id))}

 function detectExternalFinancePayment(){
  if(financeMonitorBusy)return;financeMonitorBusy=true;
  try{
   const f=financeState(),changes=[];
   for(const e of f.entries){const old=financePaidSnapshot.get(String(e.id));if(old===undefined)continue;const delta=num(e.paid)-old;if(delta>0.0001)changes.push({entry:e,delta})}
   captureFinancePaid();
   if(!changes.length)return;
   const byMember=new Map();
   for(const c of changes){const k=String(c.entry.memberId||'');if(!byMember.has(k))byMember.set(k,[]);byMember.get(k).push(c)}
   for(const [mid,rows] of byMember){
    const amount=rows.reduce((s,x)=>s+x.delta,0),date=rows.map(x=>x.entry.paidDate||'').filter(Boolean).sort().at(-1)||nowDate();
    let p=findRecentMatchingPayment(mid,amount,date);
    if(!p){
     p={id:'REC-'+Date.now().toString().slice(-8)+'-'+Math.random().toString(36).slice(2,5).toUpperCase(),memberId:mid,date,amount,applied:amount,unapplied:0,ref:'Paiement enregistré dans Cotisations & Amendes',alloc:rows.map(x=>({syncId:allocId(),entryId:x.entry.id,label:allocationLabel(x.entry),amount:x.delta})),user:currentUser()?.name||'',at:new Date().toISOString(),status:'posted'};
     const log=safeParse(PAYMENT_LOG_KEY)||[];log.unshift(p);localStorage.setItem(PAYMENT_LOG_KEY,JSON.stringify(log.slice(0,5000)));try{syncReadyOnLocalWrite(PAYMENT_LOG_KEY,log)}catch(e){};try{audit('Paiement enregistré',`${fullName(centralMembers().find(x=>String(x.id)===mid))} : ${money(amount)}`,{entity:'payment',entityId:p.id,after:p})}catch(e){}
    }
    repairPaymentAllocationIntegrity();refreshAllPaymentSurfaces(mid);receiptForPayment(p);syncPaymentNow();
   }
  } finally {financeMonitorBusy=false}
 }
 window.detectExternalFinancePayment=detectExternalFinancePayment;

 if(typeof applySmartPayment==='function'){
  const basePay=applySmartPayment;
  window.applySmartPayment=applySmartPayment=async function(){
   const before=new Set((safeParse(PAYMENT_LOG_KEY)||[]).map(x=>x.id));
   const out=await basePay.apply(this,arguments);
   repairPaymentAllocationIntegrity();
   const created=(safeParse(PAYMENT_LOG_KEY)||[]).find(x=>!before.has(x.id));if(created)processedPayments.add(created.id);
   captureFinancePaid();refreshAllPaymentSurfaces(created?.memberId||payMemberId?.value||'');syncPaymentNow();return out;
  };
 }

 // Ensure payment/debt integrity is repaired on existing data and after cloud pulls.
 setTimeout(()=>{const r=repairPaymentAllocationIntegrity();if(r.changed){refreshAllPaymentSurfaces();syncPaymentNow()}for(const p of activePayments())processedPayments.add(p.id)},350);
 window.addEventListener('storage',e=>{if(e.key===FIN_KEY)setTimeout(detectExternalFinancePayment,180);if(e.key===PAYMENT_LOG_KEY)setTimeout(()=>{repairPaymentAllocationIntegrity();refreshAllPaymentSurfaces()},220)});
 setInterval(()=>{try{detectExternalFinancePayment()}catch(e){}},1200);

 // One global back button, bottom-left, for every application view.
 const closeMap=[
  ['notificationsView','closeNotifications'],['archivesView','closeArchives'],['conflictJournalView','closeConflictJournal'],['punctualityReportView','closePunctualityReport'],['treasuryExpensesView','closeTreasuryExpenses'],['treasuryReportView','closeTreasuryReport'],['settingsHub','closeSettingsHub'],['privacyHub','closePrivacyHub'],['aboutHub','closeAboutHub'],['diagnosticsView','closeDiagnostics'],['securityView','closeSecurity'],['handoverView','closeHandover'],['auditView','closeAudit'],['calendarView','closeCalendar'],['monthlyView','closeMonthlyClose'],['debtorsView','closeDebtors'],['profileView','closeProfile'],['membersView','closeMembers'],['viewer','closeViewer']
 ];
 const modalClosers=[['receiptModal','closeReceipt'],['paymentModal','closePaymentModal'],['memberModal','closeMemberModal'],['cloudConfigModal','closeCloudConfigModal'],['recurringOverrideModal','closeRecurringOverrideModal'],['activityModal','closeActivityModal'],['paymentCorrectionModal','closePaymentCorrectionModal'],['restoreModal','closeRestoreModal'],['restoreTestModal','closeRestoreTestModal']];
 function callCloser(name,id){try{if(typeof window[name]==='function'){window[name]();return true}}catch(e){}const el=document.getElementById(id);if(el){el.classList.remove('open');return true}return false}
 window.globalBack=function(){
  for(const [id,fn] of modalClosers){const el=document.getElementById(id);if(el?.classList.contains('open'))return callCloser(fn,id)}
  for(const [id,fn] of closeMap){const el=document.getElementById(id);if(el?.classList.contains('open'))return callCloser(fn,id)}
  const generic=document.querySelector('.membersView.open,.viewer.open,.modal.open');if(generic){generic.classList.remove('open');return}
 };
 function updateGlobalBack(){const b=document.getElementById('globalBackBtn');if(!b)return;const open=!!document.querySelector('.membersView.open,.viewer.open,.modal.open');b.style.display=open?'grid':'none';b.title='Retour';b.setAttribute('aria-label','Retour')}
 const observer=new MutationObserver(updateGlobalBack);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});setTimeout(updateGlobalBack,0);
})();
