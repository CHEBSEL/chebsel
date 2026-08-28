/* CHEBSEL v1.17.13 — universal internal Back + fixed header safe layout */
'use strict';
(function(){
 const ROOT_ID='chebsel-shell-nav-11713';
 if(window[ROOT_ID])return;window[ROOT_ID]=true;

 function header(){return document.querySelector('.top')}
 function setHeaderHeight(){
  const h=header();if(!h)return;
  const px=Math.max(0,Math.ceil(h.getBoundingClientRect().height));
  document.documentElement.style.setProperty('--chebsel-header-h',px+'px');
 }
 function isFullScreenLayer(el){
  if(!el||el===header()||el.id==='chebselUpdateBanner1177')return false;
  if(el.classList?.contains('modal'))return false;
  const id=String(el.id||'');
  const cls=String(el.className||'');
  if(el.id==='viewer'||el.classList?.contains('membersView'))return true;
  if(/View$/.test(id)||/\b[a-zA-Z]+View\b/.test(cls))return true;
  return false;
 }
 function markLayers(){
  document.querySelectorAll('body *').forEach(el=>{
   if(isFullScreenLayer(el))el.classList.add('chebsel-below-header');
  });
 }
 function installStyle(){
  if(document.getElementById('chebsel-shell-layout-11713'))return;
  const s=document.createElement('style');s.id='chebsel-shell-layout-11713';
  s.textContent=`
   :root{--chebsel-header-h:96px}
   body{padding-top:var(--chebsel-header-h)!important}
   .top{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:10000!important}
   .shell{min-height:calc(100dvh - var(--chebsel-header-h))!important}
   .chebsel-below-header{top:var(--chebsel-header-h)!important;height:calc(100dvh - var(--chebsel-header-h))!important;max-height:calc(100dvh - var(--chebsel-header-h))!important}
   .chebsel-below-header .floating-back{bottom:max(18px,env(safe-area-inset-bottom))!important}
   @media(max-width:520px){body{padding-top:var(--chebsel-header-h)!important}.brandtext{max-width:min(54vw,360px)}.toprow{align-items:center}.authStrip{margin-top:5px}}
  `;
  document.head.appendChild(s);
 }

 function visible(el){
  if(!el)return false;
  const cs=getComputedStyle(el);
  if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0)return false;
  return el.classList.contains('open')||el.matches('.modal.open,[role="dialog"].open');
 }
 function z(el){const v=parseInt(getComputedStyle(el).zIndex,10);return Number.isFinite(v)?v:0}
 function openLayers(){
  const set=new Set();
  document.querySelectorAll('.open,.viewer.open,.membersView.open,.modal.open,[role="dialog"].open').forEach(el=>{
   if(!visible(el)||el===header())return;
   // Do not treat small child cards/panels inside another open page as navigation layers.
   const p=el.parentElement?.closest?.('.open,.viewer.open,.membersView.open,.modal.open,[role="dialog"].open');
   if(p&&visible(p)&&z(p)>=z(el))return;
   set.add(el);
  });
  return [...set].sort((a,b)=>z(b)-z(a));
 }
 function clickClose(layer){
  if(!layer)return false;
  const selectors=[
   '.floating-back','button.back','[data-action="back"]','[data-action="close"]',
   'button[aria-label*="Retour" i]','button[title*="Retour" i]','button[aria-label*="Fermer" i]','button[title*="Fermer" i]'
  ];
  for(const sel of selectors){
   const btn=layer.querySelector(sel);
   if(btn&&btn.id!=='globalBackBtn'&&!btn.disabled){btn.click();return true}
  }
  const withClose=[...layer.querySelectorAll('button[onclick]')].find(b=>/close[A-Za-z0-9_]*\s*\(/.test(b.getAttribute('onclick')||''));
  if(withClose){withClose.click();return true}
  return false;
 }
 function safeClose(layer){
  if(clickClose(layer))return true;
  if(layer.id==='viewer'&&typeof window.closeViewer==='function'){window.closeViewer();return true}
  if(layer.classList.contains('membersView')&&typeof window.closeMembers==='function'){window.closeMembers();return true}
  if(layer.classList.contains('modal')){layer.classList.remove('open');return true}
  // Generic final internal fallback: close only this visible application layer.
  layer.classList.remove('open');
  try{window.refreshHome?.()}catch(e){}
  return true;
 }
 function universalBack(ev){
  try{ev?.preventDefault?.();ev?.stopPropagation?.()}catch(e){}
  const layers=openLayers();
  if(layers.length){safeClose(layers[0]);return false}
  // Absolute root guard: never browser-back, never logout, never open login.
  return false;
 }
 window.globalBack=universalBack;

 // Capture every shell-level Back click so older inline handlers cannot escape the app.
 document.addEventListener('click',e=>{
  const b=e.target?.closest?.('#globalBackBtn');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();universalBack(e);
 },true);

 installStyle();markLayers();setHeaderHeight();
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>setHeaderHeight()):null;
 if(ro&&header())ro.observe(header());
 window.addEventListener('resize',setHeaderHeight,{passive:true});
 window.addEventListener('orientationchange',()=>setTimeout(setHeaderHeight,100),{passive:true});
 new MutationObserver(()=>{markLayers();setHeaderHeight()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
 setTimeout(()=>{markLayers();setHeaderHeight()},120);
 setTimeout(()=>{markLayers();setHeaderHeight()},700);
})();
