/* CHEBSEL v1.17.12 — authoritative notification bell state */
'use strict';
(function(){
 let syncing=false;
 function unreadCountFromDom(){
  const list=document.getElementById('notificationList');
  if(!list)return null;
  const rows=[...list.querySelectorAll('.alertRow')];
  if(!rows.length)return 0;
  return rows.filter(r=>r.classList.contains('alert-unread')||r.dataset.read==='false'||r.getAttribute('data-read')==='false'||r.getAttribute('aria-read')==='false').length;
 }
 function setBellState(n){
  if(syncing)return; syncing=true;
  try{
   const badge=document.getElementById('notificationBadge');
   const bell=document.getElementById('notificationBtn');
   const count=Math.max(0,Number(n)||0);
   if(badge){
    if(count>0){
     badge.textContent=String(count);
     badge.style.removeProperty('display');
     badge.style.setProperty('display','inline-flex','important');
     badge.setAttribute('aria-hidden','false');
    }else{
     // Zero unread means absolutely no number on the bell.
     badge.textContent='';
     badge.style.setProperty('display','none','important');
     badge.setAttribute('aria-hidden','true');
    }
   }
   if(bell){
    bell.classList.toggle('has-unread',count>0);
    bell.classList.toggle('notification-active',count>0);
    bell.classList.toggle('active',count>0);
    bell.dataset.unreadCount=String(count);
    bell.setAttribute('aria-label',count>0?`Alertes — ${count} non lue${count>1?'s':''}`:'Alertes — aucune nouvelle notification');
    bell.title=count>0?`${count} nouvelle${count>1?'s':''} notification${count>1?'s':''}`:'Aucune nouvelle notification';
   }
  }finally{syncing=false}
 }
 function syncBadge(){
  const n=unreadCountFromDom();
  if(n===null){
   // If the list has not been rendered yet, never invent an unread count.
   const badge=document.getElementById('notificationBadge');
   const raw=Number(badge?.dataset?.confirmedUnread||0);
   setBellState(raw);
   return;
  }
  const badge=document.getElementById('notificationBadge');
  if(badge)badge.dataset.confirmedUnread=String(n);
  setBellState(n);
 }
 function after(fn){return function(){const out=fn&&fn.apply(this,arguments);Promise.resolve(out).finally(()=>{setTimeout(syncBadge,0);setTimeout(syncBadge,80)});return out}}
 if(typeof window.renderAlertsPanel==='function')window.renderAlertsPanel=after(window.renderAlertsPanel);
 if(typeof window.openNotifications==='function')window.openNotifications=after(window.openNotifications);
 if(typeof window.markAllAlertsRead==='function')window.markAllAlertsRead=after(window.markAllAlertsRead);
 if(typeof window.markAlertRead==='function')window.markAlertRead=after(window.markAlertRead);
 function start(){
  const badge=document.getElementById('notificationBadge');
  if(badge&&!badge.dataset.confirmedUnread)badge.dataset.confirmedUnread='0';
  syncBadge();
  const list=document.getElementById('notificationList');
  if(list)new MutationObserver(()=>syncBadge()).observe(list,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-read','aria-read']});
  if(badge)new MutationObserver(()=>{if(!syncing)queueMicrotask(syncBadge)}).observe(badge,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  // Legacy refreshHome can rewrite the badge every ~1.4s; this keeps final UI authoritative.
  setInterval(syncBadge,700);
  setTimeout(syncBadge,120);setTimeout(syncBadge,600);setTimeout(syncBadge,1600);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
 window.chebselSyncNotificationBadge=syncBadge;
})();
