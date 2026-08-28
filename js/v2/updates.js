import {APP_VERSION} from './app-state.js';
let initialized=false,reloading=false;

function banner(){return document.getElementById('updateBanner')}
function show(reg){
  const b=banner();if(!b||b.dataset.visible==='1')return;
  b.dataset.visible='1';b.hidden=false;
  const btn=b.querySelector('[data-update]');
  btn.onclick=()=>{
    if(!reg.waiting)return;
    btn.disabled=true;btn.textContent='Mizajou…';
    reg.waiting.postMessage({type:'SKIP_WAITING'});
  };
}

export async function initUpdates(){
  if(initialized||!('serviceWorker' in navigator))return;initialized=true;
  const reg=await navigator.serviceWorker.register('./sw.js');
  if(reg.waiting&&navigator.serviceWorker.controller)show(reg);
  reg.addEventListener('updatefound',()=>{
    const worker=reg.installing;if(!worker)return;
    worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)show(reg)});
  });
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(reloading)return;reloading=true;location.reload();
  });
  console.info('CHEBSEL',APP_VERSION,'service worker ready');
}
