/* CHEBSEL v1.14.1 — Durable cloud deletion for members and calendar */
'use strict';
(function(){
 const now=()=>new Date().toISOString();
 async function ctx(){const c=await getCloudClient(),p=await getCloudProfile(),org=p?.organization_id||p?.org_id;if(!org)throw new Error('Organisation CHEBSEL introuvable.');return {c,org}}
 async function resolveCloudRow(table,item){
  if(!navigator.onLine)return null;const {c,org}=await ctx();
  if(item?.syncId){const q=await c.from(table).select('id,legacy_id,deleted_at').eq('organization_id',org).eq('id',item.syncId).maybeSingle();if(q.error)throw q.error;if(q.data)return q.data}
  if(item?.id){const q=await c.from(table).select('id,legacy_id,deleted_at').eq('organization_id',org).eq('legacy_id',String(item.id)).maybeSingle();if(q.error)throw q.error;if(q.data)return q.data}
  return null;
 }
 async function cloudTombstone(table,item,extra={}){
  if(!navigator.onLine)return false;const {c,org}=await ctx();const r=await resolveCloudRow(table,item);if(!r)return false;const t=now();
  const q=await c.from(table).update({...extra,deleted_at:t,updated_at:t}).eq('organization_id',org).eq('id',r.id).select('id,deleted_at').single();if(q.error)throw q.error;return !!q.data?.deleted_at;
 }
 async function markLocalTombstone(store,item){
  try{await syncDBOpen();let row=item?.syncId?await idbGet(store,item.syncId):null;if(!row&&item?.syncId)row={...item,syncId:item.syncId};if(row){const t=now();row={...row,_deletedAt:t,_syncStatus:'pending',_localUpdatedAt:t};await idbPut(store,row);if(typeof queueOutbox==='function')await queueOutbox(store,row.syncId,'DELETE',{syncId:row.syncId,_deletedAt:t})}}
  catch(e){console.warn('Local tombstone',store,e)}
 }

 // Tombstones MUST be pushed. The old implementation filtered them out, so cloud rows survived.
 if(typeof pushPilotEntity==='function'){
  window.pushPilotEntity=pushPilotEntity=async function(store,table,payloadFn,org){
   const rows=await idbAll(store);if(!rows.length)return 0;const c=await getCloudClient();
   const payload=rows.filter(x=>x?.syncId).map(x=>payloadFn(x,org));if(!payload.length)return 0;
   const {error}=await c.from(table).upsert(payload,{onConflict:'id'});if(error)throw error;return payload.length;
  };
 }

 // Cloud is authoritative for tombstones. Pull all rows, remove deleted records locally,
 // and keep unsynced local-only records until they are pushed.
 window.pullCloudMembers=pullCloudMembers=async function(org){
  const c=await getCloudClient(),q=await c.from('members').select('*').eq('organization_id',org);if(q.error)throw q.error;
  const rows=q.data||[],local=centralMembers(),cloudIds=new Set(rows.map(r=>r.id)),deletedIds=new Set(rows.filter(r=>r.deleted_at).map(r=>r.id)),deletedLegacy=new Set(rows.filter(r=>r.deleted_at&&r.legacy_id).map(r=>String(r.legacy_id)));
  const active=rows.filter(r=>!r.deleted_at),activeById=new Map(active.map(r=>[r.id,r])),activeByLegacy=new Map(active.filter(r=>r.legacy_id).map(r=>[String(r.legacy_id),r]));
  const kept=[];
  for(const x of local){
   if((x.syncId&&deletedIds.has(x.syncId))||deletedLegacy.has(String(x.id||'')))continue;
   if(x.syncId&&cloudIds.has(x.syncId)){const r=activeById.get(x.syncId);if(!r)continue;Object.assign(x,{syncId:r.id,no:r.member_no||x.no,first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',contributionStartMonth:r.contribution_start_month||x.contributionStartMonth||'',_serverUpdatedAt:r.updated_at});kept.push(x);continue}
   const r=activeByLegacy.get(String(x.id||''));if(r){Object.assign(x,{syncId:r.id,no:r.member_no||x.no,first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',contributionStartMonth:r.contribution_start_month||x.contributionStartMonth||'',_serverUpdatedAt:r.updated_at});kept.push(x);continue}
   if(!x.syncId)kept.push(x);
  }
  const known=new Set(kept.map(x=>x.syncId).filter(Boolean));
  for(const r of active){if(known.has(r.id))continue;kept.push({id:r.legacy_id||('cloud_'+r.id.slice(0,8)),syncId:r.id,no:r.member_no||'',first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',contributionStartMonth:r.contribution_start_month||'',category:'Membre',group:'Chœur d’Homme',_serverUpdatedAt:r.updated_at})}
  localStorage.setItem(MASTER_KEY,JSON.stringify(kept));syncMembersToApps();try{await syncReadyReconcilePilot(false)}catch(e){};return active.length;
 };
 window.pullCloudCalendar=pullCloudCalendar=async function(org){
  const c=await getCloudClient(),q=await c.from('calendar_events').select('*').eq('organization_id',org);if(q.error)throw q.error;
  const rows=q.data||[],local=customActivities(),cloudIds=new Set(rows.map(r=>r.id)),deletedIds=new Set(rows.filter(r=>r.deleted_at).map(r=>r.id)),deletedLegacy=new Set(rows.filter(r=>r.deleted_at&&r.legacy_id).map(r=>String(r.legacy_id)));
  const active=rows.filter(r=>!r.deleted_at),activeById=new Map(active.map(r=>[r.id,r])),activeByLegacy=new Map(active.filter(r=>r.legacy_id).map(r=>[String(r.legacy_id),r]));const kept=[];
  for(const x of local){
   if((x.syncId&&deletedIds.has(x.syncId))||deletedLegacy.has(String(x.id||'')))continue;
   if(x.syncId&&cloudIds.has(x.syncId)){const r=activeById.get(x.syncId);if(!r)continue;Object.assign(x,{syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',_serverUpdatedAt:r.updated_at});kept.push(x);continue}
   const r=activeByLegacy.get(String(x.id||''));if(r){Object.assign(x,{syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',_serverUpdatedAt:r.updated_at});kept.push(x);continue}
   if(!x.syncId)kept.push(x);
  }
  const known=new Set(kept.map(x=>x.syncId).filter(Boolean));for(const r of active){if(known.has(r.id))continue;kept.push({id:r.legacy_id||('cloud_'+r.id.slice(0,8)),syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',auto:false,_serverUpdatedAt:r.updated_at})}
  localStorage.setItem(CALENDAR_KEY,JSON.stringify(kept));try{await syncReadyReconcilePilot(false)}catch(e){};return active.length;
 };

 window.deleteCentralMember=deleteCentralMember=async function(mid){
  const a=safeParse(ATT_KEY)||{},f=safeParse(FIN_KEY)||{},m=centralMembers().find(x=>x.id===mid);if(!m)return;
  const hasAttendance=(a.calls||[]).some(c=>c.records&&c.records[mid]),hasFinance=(f.entries||[]).some(e=>e.memberId===mid);
  if(hasAttendance||hasFinance){alert("Ce membre possède déjà un historique. Pour conserver les données, utilisez « Désactiver » au lieu de le supprimer.");return}
  if(!confirm(`Supprimer définitivement ${fullName(m)} ?`))return;
  try{
   if(navigator.onLine)await cloudTombstone('members',m,{active:false});
   await markLocalTombstone('members',m);writeCentralMembers(centralMembers().filter(x=>x.id!==mid));
   audit('Membre supprimé définitivement',fullName(m),{entity:'member',entityId:m.syncId||m.id,before:m,after:null});renderCentralMembers();refreshHome(true);
   try{if(typeof scheduleAutoCloudSync==='function')scheduleAutoCloudSync('member-delete')}catch(e){}
  }catch(e){alert('Suppression impossible : '+(e?.message||e));try{if(navigator.onLine){const p=await getCloudProfile();await pullCloudMembers(p.organization_id||p.org_id)}}catch(_){} }
 };
 window.deleteActivity=deleteActivity=async function(id){
  if(!requirePermission('attendance.write'))return;const list=customActivities(),ev=list.find(x=>x.id===id);if(!ev||!confirm('Supprimer cette activité ?'))return;
  try{
   if(navigator.onLine)await cloudTombstone('calendar_events',ev,{status:'cancelled'});
   await markLocalTombstone('calendar_events',ev);saveJSON(CALENDAR_KEY,list.filter(x=>x.id!==id));
   audit('Activité supprimée définitivement',ev.title,{entity:'calendar',entityId:ev.syncId||id,before:ev,after:null});renderCurrentMonthCalendar();if(calendarView.classList.contains('open'))renderAnnualCalendar(ev.date.slice(0,7));refreshHome(true);
   try{if(typeof scheduleAutoCloudSync==='function')scheduleAutoCloudSync('calendar-delete')}catch(e){}
  }catch(e){alert('Suppression activité impossible : '+(e?.message||e));try{if(navigator.onLine){const p=await getCloudProfile();await pullCloudCalendar(p.organization_id||p.org_id)}}catch(_){} }
 };
})();
