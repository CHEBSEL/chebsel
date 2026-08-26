/* CHEBSEL v1.12.0 — Role-priority synchronization policy */
'use strict';
(function(){
 const POLICY=Object.freeze({
   president:{attendance:100,finance:100,admin:100},
   secretary:{attendance:80,finance:10,admin:10},
   treasurer:{attendance:10,finance:80,admin:10}
 });
 window.CHEBSEL_SYNC_POLICY=POLICY;
 window.chebselWriterPriority=function(domain,role){return Number(POLICY[role]?.[domain]||10)};
 window.rolePriorityReconcile=async function(reason='priority-reconcile'){
   if(!navigator.onLine||typeof isVisitor==='function'&&isVisitor())return false;
   try{
     const ss=await cloudSessionInfo();if(!ss)return false;
     const p=await getCloudProfile(),org=p?.organization_id||p?.org_id;if(!org)return false;
     await pullCloudMembers(org);await pullCloudCalendar(org);await pullCloudAttendance(org);await pullCloudFinance(org);
     try{if(['president','treasurer'].includes(String(p?.role||'').toLowerCase()))await pullCloudExpenses(org)}catch(e){}
     if(typeof syncReadyReconcilePilot==='function')await syncReadyReconcilePilot(false);
     if(typeof refreshHome==='function')refreshHome();
     return true;
   }catch(e){console.warn('CHEBSEL priority reconcile ['+reason+']:',e);return false}
 };
 // The server trigger is authoritative. Always pull after a completed automatic sync,
 // so a lower-priority local edit that lost a close conflict is immediately reconciled.
 if(typeof autoCloudSync==='function'){
   const baseAutoCloudSync=autoCloudSync;
   window.autoCloudSync=autoCloudSync=async function(reason='auto'){
     const out=await baseAutoCloudSync(reason);
     if(navigator.onLine)await window.rolePriorityReconcile(reason);
     return out;
   };
 }
})();
