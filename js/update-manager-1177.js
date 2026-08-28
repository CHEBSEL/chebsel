/* CHEBSEL v1.17.11 — controller-aware in-app PWA update manager */
'use strict';
(function(){
 const VERSION='1.17.11';
 let registration=null,waitingWorker=null,applying=false,lastCheck=0,reloadTimer=null;
 function setVisibleVersion(){
  try{const chip=document.querySelector('.versionChip');if(chip)chip.textContent='v'+VERSION}catch(e){}
  try{document.title=document.title.replace(/CHEBSEL v\d+(?:\.\d+){1,2}/g,'CHEBSEL v'+VERSION)}catch(e){}
 }
 function banner(){
  let b=document.getElementById('chebselUpdateBanner1177');if(b)return b;
  b=document.createElement('div');b.id='chebselUpdateBanner1177';
  b.style.cssText='display:none;position:fixed;left:12px;right:12px;bottom:16px;z-index:2147483647;background:#102644;color:#fff;border:1px solid #c59d3f;border-radius:14px;padding:12px 14px;box-shadow:0 12px 34px rgba(0,0,0,.34);font-family:inherit;transform:none!important;animation:none!important;transition:none!important;pointer-events:auto';
  b.innerHTML='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:190px"><b>Mizajou CHEBSEL disponib</b><div id="chebselUpdateText1177" style="font-size:.82rem;opacity:.84;margin-top:3px">Yon nouvo vèsyon pare.</div></div><button id="chebselApplyUpdate1177" type="button" style="border:0;border-radius:10px;padding:10px 14px;font-weight:800;background:#c59d3f;color:#102644;cursor:pointer;touch-action:manipulation">Mizajou</button><button id="chebselLaterUpdate1177" type="button" style="border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:10px 12px;font-weight:700;background:transparent;color:#fff;cursor:pointer;touch-action:manipulation">Pita</button></div>';
  document.body.appendChild(b);
  document.getElementById('chebselApplyUpdate1177').onclick=applyUpdate;
  document.getElementById('chebselLaterUpdate1177').onclick=()=>hideBanner();
  return b
 }
 function hideBanner(){const b=document.getElementById('chebselUpdateBanner1177');if(b)b.style.display='none';waitingWorker=null}
 function showBanner(w){waitingWorker=w||waitingWorker;banner().style.display='block'}
 function workerVersion(worker,timeout=700){return new Promise(resolve=>{
  if(!worker)return resolve('');let done=false;const ch=new MessageChannel();const finish=v=>{if(done)return;done=true;resolve(String(v||''))};
  ch.port1.onmessage=e=>finish(e.data?.version||'');try{worker.postMessage({type:'CHEBSEL_GET_VERSION'},[ch.port2])}catch(e){finish('')};setTimeout(()=>finish(''),timeout)
 })}
 async function controllerIsCurrent(){return (await workerVersion(navigator.serviceWorker?.controller))===VERSION}
 async function hardRefresh(){if(reloadTimer)clearTimeout(reloadTimer);const u=new URL(location.href);u.searchParams.set('_chebsel_update',Date.now().toString());location.replace(u.toString())}
 function applyingUi(){const btn=document.getElementById('chebselApplyUpdate1177'),txt=document.getElementById('chebselUpdateText1177');if(btn){btn.disabled=true;btn.textContent='Mizajou...';btn.style.opacity='.7'}if(txt)txt.textContent='Aktivasyon nouvo vèsyon an...'}
 async function applyUpdate(e){try{e?.preventDefault?.();e?.stopPropagation?.()}catch(_){}if(applying)return;applying=true;applyingUi();
  try{registration=registration||await navigator.serviceWorker.getRegistration('./');let w=waitingWorker||registration?.waiting;if(!w){await registration?.update?.();w=registration?.waiting}
   if(w){w.postMessage({type:'SKIP_WAITING'});reloadTimer=setTimeout(hardRefresh,1800);return}await hardRefresh()
  }catch(_){await hardRefresh()}
 }
 async function checkForUpdate(force=false){
  if(!('serviceWorker' in navigator))return;const now=Date.now();if(!force&&now-lastCheck<90000)return;lastCheck=now;
  try{
   registration=await navigator.serviceWorker.getRegistration('./')||await navigator.serviceWorker.register('./sw.js?v=11711',{scope:'./',updateViaCache:'none'});
   if(await controllerIsCurrent()){hideBanner();return}
   if(registration.waiting){const v=await workerVersion(registration.waiting);if(v&&v===VERSION){showBanner(registration.waiting);return}}
   await registration.update();
   if(await controllerIsCurrent()){hideBanner();return}
   if(registration.waiting){showBanner(registration.waiting);return}
   const installing=registration.installing;if(installing&&!installing.__chebsel11711){installing.__chebsel11711=true;installing.addEventListener('statechange',async()=>{if(installing.state==='installed'&&navigator.serviceWorker.controller){if(await controllerIsCurrent())hideBanner();else showBanner(installing)}})}
  }catch(err){console.warn('CHEBSEL update check:',err)}
 }
 navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(applying)hardRefresh();else setTimeout(()=>checkForUpdate(true),250)});
 navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='CHEBSEL_UPDATE_ACTIVE'&&String(e.data.version)===VERSION)hideBanner()});
 window.chebselCheckForUpdate=()=>checkForUpdate(true);window.chebselForceUpdate=applyUpdate;
 setVisibleVersion();window.addEventListener('load',()=>{setVisibleVersion();setTimeout(()=>checkForUpdate(true),800)});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkForUpdate(false)});window.addEventListener('online',()=>checkForUpdate(false));
})();
