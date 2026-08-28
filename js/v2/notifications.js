import {AppState,updateState} from './app-state.js';
import {KEYS,readRaw,save} from './storage.js';

let initialized=false;
const money=v=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Number(v||0))+' G';
const fullName=m=>[m?.first,m?.last].filter(Boolean).join(' ').trim()||m?.name||'Membre';
function readSet(){const a=readRaw(KEYS.notificationRead,[]);return new Set(Array.isArray(a)?a:[])}
function writeSet(s){save(KEYS.notificationRead,[...s].slice(-500))}

function debtSummary(){
  const balances=new Map((AppState.data.members||[]).map(m=>[String(m.id),0]));
  for(const e of AppState.data.finance||[]){if(e?.voided||e?.cancelled||e?.status==='cancelled')continue;const id=String(e?.memberId??e?.member_id??'');if(!id)continue;balances.set(id,(balances.get(id)||0)+Math.max(0,(Number(e?.due??e?.amountDue??0)||0)-(Number(e?.paid??e?.amountPaid??0)||0)))}
  const debtors=[...balances.entries()].filter(([,v])=>v>0),total=debtors.reduce((s,[,v])=>s+v,0);
  if(!debtors.length)return null;
  return {id:`debt:${debtors.length}:${Math.round(total)}`,type:'finance',title:'Créances à suivre',text:`${debtors.length} membre(s) ont une dette totale de ${money(total)}.`,route:'debtors',createdAt:new Date().toISOString()};
}
function attendanceAlerts(){
  const out=[];const cutoff=Date.now()-30*864e5;
  for(const c of AppState.data.attendance||[]){const t=Date.parse(c?.date||'');if(!t||t<cutoff)continue;const bad=[];for(const [mid,r] of Object.entries(c?.records||{})){const s=String(r?.status||'').toUpperCase();if(['RNM','ANM','ANMP'].includes(s))bad.push(mid)}if(!bad.length)continue;out.push({id:`att:${c.id||c.date}:${bad.length}`,type:'attendance',title:'Ponctualité à suivre',text:`${bad.length} cas non motivé(s) — ${c.activity||'Activité'} (${c.date||''}).`,route:'attendance-history',createdAt:c.date||new Date().toISOString()})}
  return out.slice(-8).reverse();
}
function conflictAlerts(){return (AppState.data.conflicts||[]).filter(x=>x?.status!=='resolved').map(x=>({id:`conflict:${x.id}:${x.updatedAt||x.createdAt||''}`,type:'conflict',title:'Conflit ouvert',text:x.subject||x.title||'Dossier à suivre',route:'conflicts',createdAt:x.updatedAt||x.createdAt||new Date().toISOString()})).slice(-8).reverse()}

export function refreshNotifications(){
  const items=[debtSummary(),...attendanceAlerts(),...conflictAlerts()].filter(Boolean);
  const read=readSet();const unread=items.filter(x=>!read.has(x.id)).length;
  updateState('notifications',{items,unread});return items;
}
export function markAllNotificationsRead(){const s=readSet();for(const x of AppState.notifications.items||[])s.add(x.id);writeSet(s);refreshNotifications()}
export function markNotificationRead(id){const s=readSet();s.add(id);writeSet(s);refreshNotifications()}

export function renderNotificationsPage(){
  refreshNotifications();const w=document.createElement('section');w.className='page';
  const h=document.createElement('div');h.className='page-head split-head';const c=document.createElement('div');c.innerHTML='<h1>Notifications</h1><p class="muted">Alertes calculées à partir des données CHEBSEL, sans polling.</p>';h.append(c);
  if(AppState.notifications.unread){const b=document.createElement('button');b.className='btn secondary';b.textContent='Tout marquer comme lu';b.onclick=()=>{markAllNotificationsRead();window.CHEBSEL?.rerender?.()};h.append(b)}w.append(h);
  const list=document.createElement('div');list.className='admin-list';
  const items=AppState.notifications.items||[];const read=readSet();
  if(!items.length){const e=document.createElement('div');e.className='panel empty-state';e.textContent='Aucune alerte active.';list.append(e)}
  for(const x of items){const card=document.createElement('article');card.className=`panel notification-card ${read.has(x.id)?'is-read':'is-unread'}`;const top=document.createElement('div');top.className='split-head';const text=document.createElement('div');const title=document.createElement('h3');title.textContent=x.title;const p=document.createElement('p');p.className='muted';p.textContent=x.text;text.append(title,p);top.append(text);const b=document.createElement('button');b.className='btn secondary';b.textContent='Ouvrir';b.onclick=()=>{markNotificationRead(x.id);window.CHEBSEL?.navigate?.(x.route)};top.append(b);card.append(top);list.append(card)}w.append(list);return w;
}

export function initNotifications(){if(initialized)return;initialized=true;refreshNotifications()}
