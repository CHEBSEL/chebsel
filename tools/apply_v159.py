from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

s=s.replace("SYNC_RECONCILE_TIMER=setTimeout(()=>syncReadyReconcile(true),350)","SYNC_RECONCILE_TIMER=setTimeout(()=>syncReadyReconcilePilot(true),350)",1)

old_ui="const pending=await idbCountByStatus('outbox','pending'),conflicts=await idbCountByStatus('conflicts','open'),meta=await idbGet('meta','state');"
new_ui="const pending=(await idbAll('outbox')).filter(x=>x.status==='pending'&&['members','calendar_events'].includes(x.entity)).length,conflicts=await idbCountByStatus('conflicts','open'),meta=await idbGet('meta','state');"
if old_ui not in s:
    raise SystemExit('updateSyncReadyUI pending line not found')
s=s.replace(old_ui,new_ui,1)

start=s.find("async function repairV158Outbox(){")
end=s.find("async function cloudPilotSync(){",start)
if start<0 or end<0:
    raise SystemExit('v158 repair block not found')

new_block=r'''function canonicalV159Members(){
 const src=Array.isArray(safeParse(MASTER_KEY))?safeParse(MASTER_KEY):[];
 const ordered=[...src].sort((a,b)=>(String(a.id||'').startsWith('cloud_')?1:0)-(String(b.id||'').startsWith('cloud_')?1:0));
 const seenSync=new Set(),seenId=new Set(),seenName=new Set(),clean=[];
 for(const x of ordered){
  const sid=String(x.syncId||''),lid=String(x.id||''),name=`${String(x.first||'').trim().toLowerCase()}|${String(x.last||'').trim().toLowerCase()}|${String(x.no||'').trim()}`;
  if((sid&&seenSync.has(sid))||(lid&&seenId.has(lid))||(name!=='||'&&seenName.has(name)))continue;
  if(sid)seenSync.add(sid);if(lid)seenId.add(lid);if(name!=='||')seenName.add(name);
  clean.push(x);
 }
 if(clean.length!==src.length){localStorage.setItem(MASTER_KEY,JSON.stringify(clean));syncMembersToApps()}
 return clean
}
function canonicalV159Calendar(){
 const src=Array.isArray(safeParse(CALENDAR_KEY))?safeParse(CALENDAR_KEY):[];
 const ordered=[...src].sort((a,b)=>(String(a.id||'').startsWith('cloud_')?1:0)-(String(b.id||'').startsWith('cloud_')?1:0));
 const seenSync=new Set(),seenId=new Set(),seenNatural=new Set(),clean=[];
 for(const x of ordered){
  const sid=String(x.syncId||''),lid=String(x.id||''),nat=`${String(x.title||'').trim().toLowerCase()}|${x.date||''}|${x.time||''}`;
  if((sid&&seenSync.has(sid))||(lid&&seenId.has(lid))||(nat!=='||'&&seenNatural.has(nat)))continue;
  if(sid)seenSync.add(sid);if(lid)seenId.add(lid);if(nat!=='||')seenNatural.add(nat);
  clean.push(x)
 }
 if(clean.length!==src.length)localStorage.setItem(CALENDAR_KEY,JSON.stringify(clean));
 return clean
}
async function syncReadyReconcilePilot(enqueueChanges=true){
 await syncDBOpen();
 const all=syncSourceRecords();
 await mirrorStore('members',all.members,enqueueChanges);
 await mirrorStore('calendar_events',all.calendar_events,enqueueChanges);
 const meta=await idbGet('meta','state')||{id:'state'};
 meta.lastPreparedAt=syncNowISO();meta.lastPilotPreparedAt=meta.lastPreparedAt;await idbPut('meta',meta);
 await updateSyncReadyUI();
}
async function repairV159LocalState(){
 await syncDBOpen();
 const members=canonicalV159Members();
 canonicalV159Calendar();
 for(const row of await idbAll('members'))await idbDelete('members',row.syncId);
 for(const m of members){
  if(!m.syncId)m.syncId=uuidv4();
  await idbPut('members',{...m,_syncStatus:'synced',_localUpdatedAt:syncNowISO(),_serverUpdatedAt:m._serverUpdatedAt||null,_version:Number(m._version||0),_deletedAt:null})
 }
 const out=await idbAll('outbox');
 for(const op of out){if(['members','calendar_events'].includes(op.entity))await idbDelete('outbox',op.id)}
 await syncReadyReconcilePilot(false);
 localStorage.setItem('chebsel_v159_repaired','1');
 await updateSyncReadyUI();refreshHome();
}
async function manualSyncReadyPrepare(){
 try{
  await repairV159LocalState();
  const before=(await idbAll('outbox')).filter(x=>x.status==='pending'&&['members','calendar_events'].includes(x.entity)).length;
  await syncReadyReconcilePilot(true);
  const after=(await idbAll('outbox')).filter(x=>x.status==='pending'&&['members','calendar_events'].includes(x.entity)).length;
  await updateSyncReadyUI();
  alert(`Préparation terminée : ${Math.max(0,after-before)} nouvelle(s) opération(s) pilote. ${after} opération(s) pilote en attente.`)
 }catch(e){alert('Préparation locale impossible : '+e.message)}
}
setTimeout(()=>repairV159LocalState().catch(console.warn),1200);
'''

s=s[:start]+new_block+s[end:]

s=s.replace("async function cloudPilotSync(){if(isVisitor())","async function cloudPilotSync(){await repairV159LocalState();if(isVisitor())",1)
s=s.replace("await syncReadyReconcile(true);const p=await getCloudProfile()","await syncReadyReconcilePilot(true);const p=await getCloudProfile()",1)
s=s.replace("await pullCloudMembers(org),rc=await pullCloudCalendar(org);await syncReadyReconcile(false);","await pullCloudMembers(org),rc=await pullCloudCalendar(org);await syncReadyReconcilePilot(false);",1)

s=s.replace('CHEBSEL v1.5.8 — Centre de gestion','CHEBSEL v1.5.9 — Centre de gestion')
s=s.replace('>v1.5.8<','>v1.5.9<')
p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
x=sw.read_text(encoding='utf-8').replace('chebsel-pwa-stable-v158','chebsel-pwa-stable-v159')
sw.write_text(x,encoding='utf-8')
