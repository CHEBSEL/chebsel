from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('CHEBSEL v1.11.0 — Centre de gestion','CHEBSEL v1.11.1 — Centre de gestion')
s=s.replace("const APP_VERSION='1.11.0';","const APP_VERSION='1.11.1';")

marker="setTimeout(()=>{if(isVisitor()&&navigator.onLine)syncVisitorPublicSnapshot(true)},700);"
patch=r'''

// v1.11.1 — proactive PWA update recovery. Never clears CHEBSEL local data.
(function initPwaUpdateRecovery(){
 if(!('serviceWorker' in navigator))return;
 const reloadKey='chebsel_sw_reload_v1111';
 let refreshing=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(refreshing)return;
  refreshing=true;
  if(sessionStorage.getItem(reloadKey)!=='1'){
   sessionStorage.setItem(reloadKey,'1');
   location.reload();
  }
 });
 window.addEventListener('load',async()=>{
  try{
   const reg=await navigator.serviceWorker.register('./sw.js?v=1111',{scope:'./',updateViaCache:'none'});
   await reg.update();
   if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
   reg.addEventListener('updatefound',()=>{
    const nw=reg.installing;
    if(!nw)return;
    nw.addEventListener('statechange',()=>{
     if(nw.state==='installed'&&navigator.serviceWorker.controller){
      nw.postMessage({type:'SKIP_WAITING'});
     }
    });
   });
   setTimeout(()=>reg.update().catch(()=>{}),4000);
  }catch(e){console.warn('CHEBSEL PWA update:',e)}
 });
})();
'''
if 'initPwaUpdateRecovery' not in s:
    if marker not in s:
        raise SystemExit('visitor timeout marker not found')
    s=s.replace(marker, marker+patch)

p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
w=sw.read_text(encoding='utf-8')
w=w.replace("const CACHE_NAME='chebsel-pwa-stable-v1110';","const CACHE_NAME='chebsel-pwa-stable-v1111';")
w=w.replace('fetch(event.request)',"fetch(event.request,{cache:'no-store'})")
if "self.addEventListener('message'" not in w:
    w += "\nself.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});\n"
sw.write_text(w,encoding='utf-8')
