/* CHEBSEL v1.17.7 — reliable in-app PWA update manager */
'use strict';
(function(){
 const VERSION='1.17.7';
 let refreshing=false;
 let registration=null;
 let waitingWorker=null;

 function setVisibleVersion(){
  try{const chip=document.querySelector('.versionChip');if(chip)chip.textContent='v'+VERSION}catch(e){}
  try{document.title=document.title.replace(/CHEBSEL v\d+(?:\.\d+){1,2}/g,'CHEBSEL v'+VERSION)}catch(e){}
 }
 function ensureBanner(){
  let b=document.getElementById('chebselUpdateBanner1177');if(b)return b;
  b=document.createElement('div');b.id='chebselUpdateBanner1177';
  b.style.cssText='display:none;position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483647;max-width:min(92vw,620px);background:#102644;color:#fff;border:1px solid #c59d3f;border-radius:14px;padding:12px 14px;box-shadow:0 12px 34px rgba(0,0,0,.28);font-family:inherit';
  b.innerHTML='<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="flex:1;min-width:220px"><b>Mizajou CHEBSEL disponib</b><div style="font-size:.82rem;opacity:.82;margin-top:3px">Yon nouvo vèsyon pare. Klike sou Mizajou pou aktive li.</div></div><button id="chebselApplyUpdate1177" style="border:0;border-radius:10px;padding:9px 13px;font-weight:800;background:#c59d3f;color:#102644;cursor:pointer">Mizajou</button><button id="chebselLaterUpdate1177" style="border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:9px 12px;font-weight:700;background:transparent;color:#fff;cursor:pointer">Pita</button></div>';
  document.body.appendChild(b);
  document.getElementById('chebselApplyUpdate1177').onclick=applyUpdate;
  document.getElementById('chebselLaterUpdate1177').onclick=()=>{b.style.display='none'};
  return b
 }
 function showBanner(worker){waitingWorker=worker||waitingWorker;ensureBanner().style.display='block'}
 function applyUpdate(){
  const w=waitingWorker||registration?.waiting;
  if(w){w.postMessage({type:'SKIP_WAITING'});return}
  forceReloadFresh();
 }
 async function forceReloadFresh(){
  try{if('caches' in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('chebsel-pwa-stable-')).map(k=>caches.delete(k)))}}catch(e){}
  const u=new URL(location.href);u.searchParams.set('_chebsel_update',Date.now().toString());location.replace(u.toString())
 }
 async function checkForUpdate(){
  if(!('serviceWorker' in navigator))return;
  try{
   registration=await navigator.serviceWorker.getRegistration('./')||await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
   if(registration.waiting){showBanner(registration.waiting);return}
   await registration.update();
   if(registration.waiting){showBanner(registration.waiting);return}
   const installing=registration.installing;
   if(installing){installing.addEventListener('statechange',()=>{if(installing.state==='installed'&&navigator.serviceWorker.controller)showBanner(installing)})}
  }catch(e){console.warn('CHEBSEL update check:',e)}
 }

 navigator.serviceWorker?.addEventListener('controllerchange',()=>{
  if(refreshing)return;refreshing=true;
  const u=new URL(location.href);u.searchParams.set('_chebsel_updated',Date.now().toString());location.replace(u.toString())
 });

 window.chebselCheckForUpdate=checkForUpdate;
 window.chebselForceUpdate=forceReloadFresh;
 setVisibleVersion();
 window.addEventListener('load',()=>{setVisibleVersion();setTimeout(checkForUpdate,400);setTimeout(checkForUpdate,4000)});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkForUpdate()});
 window.addEventListener('online',()=>checkForUpdate());
 setInterval(()=>{if(document.visibilityState==='visible'&&navigator.onLine)checkForUpdate()},5*60*1000);
})();
