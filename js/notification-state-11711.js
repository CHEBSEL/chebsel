/* CHEBSEL v1.17.11 — notification badge state repair */
'use strict';
(function(){
 function unreadCountFromDom(){
  const list=document.getElementById('notificationList');
  if(!list)return null;
  const rows=[...list.querySelectorAll('.alertRow')];
  if(!rows.length)return 0;
  return rows.filter(r=>r.classList.contains('alert-unread')||r.dataset.read==='false'||r.getAttribute('data-read')==='false'||r.getAttribute('aria-read')==='false').length;
 }
 function syncBadge(){
  const badge=document.getElementById('notificationBadge');
  if(!badge)return;
  const n=unreadCountFromDom();
  if(n===null)return;
  badge.textContent=String(n);
  badge.style.display=n>0?'inline-flex':'none';
  badge.setAttribute('aria-hidden',n>0?'false':'true');
 }
 function after(fn){return function(){const out=fn&&fn.apply(this,arguments);Promise.resolve(out).finally(()=>setTimeout(syncBadge,0));return out}}
 if(typeof window.renderAlertsPanel==='function')window.renderAlertsPanel=after(window.renderAlertsPanel);
 if(typeof window.openNotifications==='function')window.openNotifications=after(window.openNotifications);
 if(typeof window.markAllAlertsRead==='function')window.markAllAlertsRead=after(window.markAllAlertsRead);
 if(typeof window.markAlertRead==='function')window.markAlertRead=after(window.markAlertRead);
 const start=()=>{
  syncBadge();
  const list=document.getElementById('notificationList');
  if(list)new MutationObserver(syncBadge).observe(list,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-read','aria-read']});
  setTimeout(syncBadge,250);setTimeout(syncBadge,1000);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
 window.chebselSyncNotificationBadge=syncBadge;
})();
