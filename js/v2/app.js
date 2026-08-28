import {APP_VERSION,AppState,setState,updateState,subscribe} from './app-state.js';
import {initRouter,registerRoute,navigate,resetTo,renderCurrent,back} from './router.js';
import {getRoleConfig} from './role-config.js';
import {loadLocalData} from './storage.js';
import {initAuth,signIn,signOut} from './auth.js';
import {initUpdates} from './updates.js';

let initialized=false;
const $=(s,r=document)=>r.querySelector(s);
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}

function card(route,icon,label){
  const b=el('button','menu-card');b.type='button';b.dataset.route=route;
  b.append(el('span','menu-icon',icon),el('span','menu-label',label));
  b.addEventListener('click',()=>navigate(route));return b;
}
function page(title,subtitle=''){
  const wrap=el('section','page');const h=el('div','page-head');h.append(el('h1','',title));if(subtitle)h.append(el('p','muted',subtitle));wrap.append(h);return wrap;
}
function placeholder(title){const w=page(title,'Modil sa a ap migre nan CHEBSEL v2 Clean Core.');w.append(el('div','panel','Fonksyon v1 yo pa chaje isit la; y ap transfere dirèkteman san iframe ni wrappers.'));return w}

function home(){
  const cfg=getRoleConfig(AppState.role),w=page(cfg.label,'CHEBSEL v2 Clean Core');
  const grid=el('div','menu-grid');cfg.menus.forEach(([r,i,l])=>grid.append(card(r,i,l)));w.append(grid);return w;
}
function hub(title,items){const w=page(title);const grid=el('div','menu-grid');items.forEach(x=>grid.append(card(...x)));w.append(grid);return w}

function registerCoreRoutes(){
  registerRoute('home',home);
  registerRoute('secretariat',()=>hub('Secrétariat', [['attendance','✅','Appel'],['attendance-settings','⚙️','Paramètres'],['attendance-history','📈','Historique']]));
  registerRoute('treasury',()=>hub('Trésorerie',[['payments','💰','Paiements'],['debtors','📋','Débiteurs'],['expenses','💸','Dépenses'],['finance-history','📈','Historique']]));
  registerRoute('payments',()=>hub('Paiements',[['payment-entry','💵','Saisir'],['finance-settings','⚙️','Paramètres']]));
  ['members','attendance','attendance-settings','attendance-history','punctuality-reports','debtors','expenses','finance-history','finance-reports','payment-entry','finance-settings','reports','archives','conflicts','settings','privacy','about'].forEach(id=>registerRoute(id,()=>placeholder(id.replaceAll('-',' '))));
}

function renderHeader(){
  $('#versionChip').textContent=`v${APP_VERSION}`;
  $('#roleLabel').textContent=getRoleConfig(AppState.role).label;
  $('#userLabel').textContent=AppState.user?.name||'Mode visiteur';
  const b=$('#globalBackBtn');if(b)b.disabled=AppState.navigationStack.length<=1;
}

function showRolePicker(){
  const modal=$('#rolePicker');if(!modal)return;modal.hidden=false;
  modal.querySelectorAll('[data-role]').forEach(btn=>btn.onclick=()=>{
    const role=btn.dataset.role;signIn({role,user:{name:btn.dataset.name||getRoleConfig(role).label}});modal.hidden=true;resetTo('home');renderHeader();
  });
}

async function startBackgroundServices(){
  window.addEventListener('online',()=>updateState('syncStatus',{online:true}));
  window.addEventListener('offline',()=>updateState('syncStatus',{online:false}));
  try{await initUpdates()}catch(e){console.warn('Update manager',e)}
}

export async function initApp(){
  if(initialized)return;initialized=true;
  const splash=$('#splash');
  try{
    initAuth();
    loadLocalData();
    initRouter();
    registerCoreRoutes();
    subscribe(renderHeader);
    renderHeader();renderCurrent();
    if(!AppState.user)showRolePicker();
    setState({boot:{ready:true,error:null}});
    requestAnimationFrame(()=>{document.body.classList.add('app-ready');if(splash)splash.hidden=true});
    void startBackgroundServices();
  }catch(error){
    console.error(error);setState({boot:{ready:false,error:String(error?.message||error)}});
    if(splash){splash.innerHTML='<div class="splash-card"><h1>CHEBSEL</h1><p>Erreur de démarrage.</p></div>'}
  }
}

window.CHEBSEL={navigate,back,signOut,state:AppState};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initApp,{once:true});else initApp();
