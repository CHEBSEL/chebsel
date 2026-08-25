from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')

helpers=r'''
function ensureAttendancePersistentSyncIds(){
 const a=safeParse(ATT_KEY)||{};
 if(!Array.isArray(a.calls))a.calls=[];
 let changed=false;
 for(const c of a.calls){
  if(!c.syncId){c.syncId=uuidv4();changed=true}
  if(!c.records||typeof c.records!=='object')c.records={};
  for(const r of Object.values(c.records))if(r&&!r.syncId){r.syncId=uuidv4();changed=true}
 }
 if(changed)localStorage.setItem(ATT_KEY,JSON.stringify(a));
 return a
}
function cloudAttendanceLocalStatus(status,isPerf=false){
 const s=normalizeAttendanceStatus(status,isPerf);
 if(s==='RM')return 'R';
 if(s==='AM')return 'A';
 if(s==='ANMP')return 'ANM';
 return s
}
function cloudAttendanceTime(v){
 const x=String(v||'').trim();
 if(!x)return null;
 const m=x.match(/^(\d{1,2}):(\d{2})/);
 return m?String(m[1]).padStart(2,'0')+':'+m[2]+':00':null
}
async function cloudAttendanceMemberMaps(org){
 const c=await getCloudClient(),{data,error}=await c.from('members').select('id,legacy_id').eq('organization_id',org).is('deleted_at',null);
 if(error)throw error;
 return {byLegacy:new Map((data||[]).filter(x=>x.legacy_id).map(x=>[String(x.legacy_id),x.id])),byCloud:new Map((data||[]).map(x=>[x.id,String(x.legacy_id||'')]))}
}
async function pushCloudAttendance(org,userId){
 const a=ensureAttendancePersistentSyncIds(),calls=a.calls||[],client=await getCloudClient();
 const events=[];
 for(const c of calls){
  if(!c.date)continue;
  events.push({id:c.syncId,organization_id:org,title:c.activity||c.title||'Activité CHEBSEL',event_type:c.type||'attendance',event_date:c.date,start_time:cloudAttendanceTime(c.time||c.startTime),is_performance:isPerformance(c),version:Number(c._version||1),created_by:userId||null,updated_at:syncNowISO(),deleted_at:null})
 }
 if(events.length){const {error}=await client.from('attendance_events').upsert(events,{onConflict:'id'});if(error)throw error}
 const maps=await cloudAttendanceMemberMaps(org),records=[];
 for(const call of calls){
  const perf=isPerformance(call);
  for(const [legacyMemberId,r] of Object.entries(call.records||{})){
   if(!r||!r.status)continue;
   const memberId=maps.byLegacy.get(String(legacyMemberId));
   if(!memberId)continue;
   const status=normalizeAttendanceStatus(r.status,perf);
   records.push({id:r.syncId,organization_id:org,attendance_event_id:call.syncId,member_id:memberId,status,reason:r.reason||r.note||null,arrival_time:cloudAttendanceTime(r.arrivalTime||r.time),fine_amount:fineForAttendanceStatus(status,perf),version:Number(r._version||1),created_by:userId||null,updated_at:syncNowISO(),deleted_at:null})
  }
 }
 if(records.length){const {error}=await client.from('attendance_records').upsert(records,{onConflict:'id'});if(error)throw error}
 return {events:events.length,records:records.length}
}
async function pullCloudAttendance(org){
 const client=await getCloudClient();
 const [{data:events,error:ee},{data:records,error:re}]=await Promise.all([
  client.from('attendance_events').select('*').eq('organization_id',org).is('deleted_at',null).order('event_date',{ascending:true}),
  client.from('attendance_records').select('*').eq('organization_id',org).is('deleted_at',null)
 ]);
 if(ee)throw ee;if(re)throw re;
 const maps=await cloudAttendanceMemberMaps(org),a=ensureAttendancePersistentSyncIds(),local=a.calls||[],bySync=new Map(local.filter(x=>x.syncId).map(x=>[x.syncId,x]));
 for(const e of events||[]){
  let call=bySync.get(e.id);
  if(!call){call={id:'cloud_'+e.id.slice(0,8),syncId:e.id,date:e.event_date||'',time:e.start_time?String(e.start_time).slice(0,5):'',activity:e.title||'Activité CHEBSEL',records:{},createdAt:e.created_at||syncNowISO(),updatedAt:e.updated_at||syncNowISO()};local.push(call);bySync.set(e.id,call)}
  else{call.date=e.event_date||call.date;call.time=e.start_time?String(e.start_time).slice(0,5):(call.time||'');call.activity=e.title||call.activity||'Activité CHEBSEL';call.updatedAt=e.updated_at||call.updatedAt}
  if(!call.records||typeof call.records!=='object')call.records={}
 }
 const eventById=new Map(local.filter(x=>x.syncId).map(x=>[x.syncId,x]));
 for(const r of records||[]){
  const call=eventById.get(r.attendance_event_id),legacy=maps.byCloud.get(r.member_id);
  if(!call||!legacy)continue;
  const perf=isPerformance(call),prev=call.records[legacy]||{};
  call.records[legacy]={...prev,syncId:r.id,status:cloudAttendanceLocalStatus(r.status,perf),reason:r.reason||'',arrivalTime:r.arrival_time?String(r.arrival_time).slice(0,5):(prev.arrivalTime||''),_serverUpdatedAt:r.updated_at};
 }
 localStorage.setItem(ATT_KEY,JSON.stringify({...a,calls:local}));
 syncBridge();
 return {events:(events||[]).length,records:(records||[]).length}
}
'''

new_sync=r'''async function cloudPilotSync(){
 if(isVisitor()){alert('Accès réservé aux responsables.');return}
 if(!navigator.onLine){alert('Pas d’Internet. Les modifications restent locales.');return}
 try{
  cloudState.textContent='Préparation locale…';
  await repairV159LocalState();
  ensureAttendancePersistentSyncIds();
  cloudState.textContent='Vérification du profil…';
  const p=await getCloudProfile(),org=p.organization_id,userId=p.auth_user_id;
  cloudState.textContent='Envoi des membres…';
  await syncReadyReconcilePilot(true);
  const pm=await pushPilotEntity('members','members',cloudMemberPayload,org);
  cloudState.textContent='Envoi du calendrier…';
  const pc=await pushPilotEntity('calendar_events','calendar_events',cloudCalendarPayload,org);
  cloudState.textContent='Réception membres/calendrier…';
  const rm=await pullCloudMembers(org),rc=await pullCloudCalendar(org);
  cloudState.textContent='Réception des appels…';
  const ra=await pullCloudAttendance(org);
  cloudState.textContent='Envoi des appels…';
  const pa=await pushCloudAttendance(org,userId);
  await syncReadyReconcilePilot(false);
  const out=await idbAll('outbox');
  for(const op of out){if(['members','calendar_events','attendance_events','attendance_records'].includes(op.entity)&&op.status==='pending'){op.status='synced';op.syncedAt=syncNowISO();await idbPut('outbox',op)}}
  saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),lastSyncAt:syncNowISO(),lastSummary:{pm,pc,rm,rc,attendancePush:pa,attendancePull:ra}});
  refreshHome();await updateCloudUI();await updateSyncReadyUI();
  cloudState.textContent='🟢 Synchronisé';
  alert(`Synchronisation terminée. Membres: ${rm}. Calendrier: ${rc}. Appels cloud: ${ra.events}; présences cloud: ${ra.records}. Envoyés: ${pa.events} appel(s), ${pa.records} présence(s).`)
 }catch(e){
  cloudState.textContent='🔴 Erreur de synchronisation';
  alert('Synchronisation cloud impossible : '+e.message);
  updateCloudUI()
 }
}
'''

if 'function ensureAttendancePersistentSyncIds()' not in s:
    s=s.replace('async function cloudPilotSync(){',helpers+'\nasync function cloudPilotSync(){',1)

pattern=r'async function cloudPilotSync\(\)\{.*?\}\nasync function updateCloudUI\(\)'
m=re.search(pattern,s,re.S)
if not m:
    raise SystemExit('cloudPilotSync function block not found')
s=s[:m.start()]+new_sync+'\nasync function updateCloudUI()'+s[m.end():]

s=s.replace('CHEBSEL v1.5.10 — Centre de gestion','CHEBSEL v1.6.0 — Centre de gestion')
s=s.replace('>v1.5.10<','>v1.6.0<')
s=re.sub(r"const APP_VERSION='[^']+';","const APP_VERSION='1.6.0';",s,count=1)
p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
x=sw.read_text(encoding='utf-8')
x=re.sub(r"const CACHE_NAME='[^']+';","const CACHE_NAME='chebsel-pwa-stable-v160';",x,count=1)
sw.write_text(x,encoding='utf-8')
