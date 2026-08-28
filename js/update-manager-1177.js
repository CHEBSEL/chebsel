/* CHEBSEL v1.17.10 — stable in-app PWA update manager */
'use strict';
(function(){
 const VERSION='1.17.10';
 let registration=null;
 let waitingWorker=null;
 let applying=false;
 let bannerShown=false;
 let lastCheck=0;
 let reloadTimer=null;

 function setVisibleVersion(){
  try{const chip=document.querySelector('.versionChip');if(chip)chip.textContent='v'+VERSION}catch(e){}
  try{document.title=document.title.replace(/CHEBSEL v\d+(?:\.\d+){1,2}/g,'CHEBSEL v'+VERSION)}catch(e){}
 }
 function ensureBanner(){
  let b=document.getElementById('chebselUpdateBanner1177');
  if(b)return b;
  b=document.createElement('div');b.id='chebselUpdateBanner1177';
  b.style.cssText='display:none;position:fixed;left:12px;right:12px;bottom:16px;z-index:2147483647;background:#102644;color:#fff;border:1px solid #c59d3f;border-radius:14px;padding:12px 14px;box-shadow:0 12px 34px rgba(0,0,0,.34);font-family:inherit;transform:none!important;animation:none!important;transition:none!important;pointer-events:auto';
  b.innerHTML='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:190px"><b id="chebselUpdateTitle1177">Mizajou CHEBSEL disponib</b><div id="chebselUpdateText1177" style="font-size:.82rem;opacity:.84;margin-top:3px">Yon nouvo vèsyon pare.</div></div><button id="chebselApplyUpdate1177" type="button" style="border:0;border-radius:10px;padding:10px 14px;font-weight:800;background:#c59d3f;color:#102644;cursor:pointer;touch-action:manipulation">Mizajou</button><button id="chebselLaterUpdate1177" type="button" style="border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:10px 12px;font-weight:700;background:transparent;color:#fff;cursor:pointer;touch-action:manipulation">Pita</button></div>';
  document.body.appendChild(b);
  document.getElementById('chebselApplyUpdate1177').addEventListener('click',applyUpdate,{passive:false});
  document.getElementById('chebselLaterUpdate1177').addEventListener('click',()=>{b.style.display='none';bannerShown=false});
  return b;
 }
 function showBanner(worker){
  waitingWorker=worker||waitingWorker;
  const b=ensureBanner();
  if(bannerShown&&b.style.display!=='none')return;
  bannerShown=true;b.style.display='block';
 }
 async function hardRefresh(){
  if(reloadTimer){clearTimeout(reloadTimer);reloadTimer=null}
  const u=new URL(location.href);u.searchParams.set('_chebsel_update',Date.now().toString());
  location.replace(u.toString());
 }
 function setApplyingUi(){
  const btn=document.getElementById('chebselApplyUpdate1177');
  const txt=document.getElementById('chebselUpdateText1177');
  if(btn){btn.disabled=true;btn.textContent='Mizajou...';btn.style.opacity='.7'}
  if(txt)txt.textContent='Aktivasyon nouvo vèsyon an...';
 }
 async function applyUpdate(ev){
  try{ev?.preventDefault?.();ev?.stopPropagation?.()}catch(e){}
  if(applying)return;
  applying=true;setApplyingUi();
  try{
   registration=registration||await navigator.serviceWorker?.getRegistration('./');
   const w=waitingWorker||registration?.waiting;
   if(w){
    try{w.postMessage({type:'SKIP_WAITING'})}catch(e){}
    reloadTimer=setTimeout(()=>hardRefresh(),2200);
    return;
   }
   try{await registration?.update?.()}catch(e){}
   const w2=registration?.waiting;
   if(w2){
    waitingWorker=w2;
    try{w2.postMessage({type:'SKIP_WAITING'})}catch(e){}
    reloadTimer=setTimeout(()=>hardRefresh(),2200);
    return;
   }
   await hardRefresh();
  }catch(e){
   await hardRefresh();
  }
 }
 async function checkForUpdate(force=false){
  if(!('serviceWorker' in navigator))return;
  const now=Date.now();
  if(!force&&now-lastCheck<60000)return;
  lastCheck=now;
  try{
   registration=await navigator.serviceWorker.getRegistration('./')||await navigator.serviceWorker.register('./sw.js?v=11710',{scope:'./',updateViaCache:'none'});
   if(registration.waiting){showBanner(registration.waiting);return}
   await registration.update();
   if(registration.waiting){showBanner(registration.waiting);return}
   const installing=registration.installing;
   if(installing&&!installing.__chebselBound){
    installing.__chebselBound=true;
    installing.addEventListener('statechange',()=>{
     if(installing.state==='installed'&&navigator.serviceWorker.controller)showBanner(installing);
    });
   }
  }catch(e){console.warn('CHEBSEL update check:',e)}
 }

 if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   if(!applying)return;
   hardRefresh();
  });
 }
 window.chebselCheckForUpdate=()=>checkForUpdate(true);
 window.chebselForceUpdate=applyUpdate;
 setVisibleVersion();
 window.addEventListener('load',()=>{setVisibleVersion();setTimeout(()=>checkForUpdate(true),900)});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkForUpdate(false)});
 window.addEventListener('online',()=>checkForUpdate(false));
})();
