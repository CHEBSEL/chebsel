from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

old_members="""async function pullCloudMembers(org){const c=await getCloudClient(),{data,error}=await c.from('members').select('*').eq('organization_id',org).is('deleted_at',null);if(error)throw error;const local=centralMembers(),by=new Map(local.map(x=>[x.syncId,x]));let changed=false;for(const r of data||[]){const cur=by.get(r.id);if(cur){Object.assign(cur,{syncId:r.id,no:r.member_no||cur.no,first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',_serverUpdatedAt:r.updated_at});changed=true}else{local.push({id:'cloud_'+r.id.slice(0,8),syncId:r.id,no:r.member_no||'',first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',category:'Membre',group:'Chœur d’Homme',_serverUpdatedAt:r.updated_at});changed=true}}if(changed){localStorage.setItem(MASTER_KEY,JSON.stringify(local));syncMembersToApps()}return (data||[]).length}"""
new_members="""async function pullCloudMembers(org){const c=await getCloudClient(),{data,error}=await c.from('members').select('*').eq('organization_id',org).is('deleted_at',null);if(error)throw error;const local=centralMembers(),bySync=new Map(local.filter(x=>x.syncId).map(x=>[x.syncId,x])),byLegacy=new Map(local.filter(x=>x.id).map(x=>[String(x.id),x]));let changed=false;for(const r of data||[]){const cur=(r.legacy_id&&byLegacy.get(String(r.legacy_id)))||bySync.get(r.id);if(cur){Object.assign(cur,{syncId:r.id,no:r.member_no||cur.no,first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',_serverUpdatedAt:r.updated_at});changed=true}else{const n={id:r.legacy_id||('cloud_'+r.id.slice(0,8)),syncId:r.id,no:r.member_no||'',first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',category:'Membre',group:'Chœur d’Homme',_serverUpdatedAt:r.updated_at};local.push(n);bySync.set(r.id,n);if(r.legacy_id)byLegacy.set(String(r.legacy_id),n);changed=true}}const seenSync=new Set(),seenId=new Set(),clean=[];for(const x of local){const sid=x.syncId||'',lid=String(x.id||'');if((sid&&seenSync.has(sid))||(lid&&seenId.has(lid)))continue;if(sid)seenSync.add(sid);if(lid)seenId.add(lid);clean.push(x)}if(clean.length!==local.length)changed=true;if(changed){localStorage.setItem(MASTER_KEY,JSON.stringify(clean));syncMembersToApps()}return (data||[]).length}"""
if old_members not in s:
    raise SystemExit('pullCloudMembers base not found')
s=s.replace(old_members,new_members,1)

old_cal="""async function pullCloudCalendar(org){const c=await getCloudClient(),{data,error}=await c.from('calendar_events').select('*').eq('organization_id',org).is('deleted_at',null);if(error)throw error;const local=customActivities(),by=new Map(local.map(x=>[x.syncId,x]));let changed=false;for(const r of data||[]){const cur=by.get(r.id);if(cur){Object.assign(cur,{syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',_serverUpdatedAt:r.updated_at});changed=true}else{local.push({id:'cloud_'+r.id.slice(0,8),syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',auto:false,_serverUpdatedAt:r.updated_at});changed=true}}if(changed)localStorage.setItem(CALENDAR_KEY,JSON.stringify(local));return (data||[]).length}"""
new_cal="""async function pullCloudCalendar(org){const c=await getCloudClient(),{data,error}=await c.from('calendar_events').select('*').eq('organization_id',org).is('deleted_at',null);if(error)throw error;const local=customActivities(),bySync=new Map(local.filter(x=>x.syncId).map(x=>[x.syncId,x])),byLegacy=new Map(local.filter(x=>x.id).map(x=>[String(x.id),x]));let changed=false;for(const r of data||[]){const cur=(r.legacy_id&&byLegacy.get(String(r.legacy_id)))||bySync.get(r.id);if(cur){Object.assign(cur,{syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',_serverUpdatedAt:r.updated_at});changed=true}else{const n={id:r.legacy_id||('cloud_'+r.id.slice(0,8)),syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',auto:false,_serverUpdatedAt:r.updated_at};local.push(n);bySync.set(r.id,n);if(r.legacy_id)byLegacy.set(String(r.legacy_id),n);changed=true}}const seenSync=new Set(),seenId=new Set(),clean=[];for(const x of local){const sid=x.syncId||'',lid=String(x.id||'');if((sid&&seenSync.has(sid))||(lid&&seenId.has(lid)))continue;if(sid)seenSync.add(sid);if(lid)seenId.add(lid);clean.push(x)}if(clean.length!==local.length)changed=true;if(changed)localStorage.setItem(CALENDAR_KEY,JSON.stringify(clean));return (data||[]).length}"""
if old_cal not in s:
    raise SystemExit('pullCloudCalendar base not found')
s=s.replace(old_cal,new_cal,1)

if 'onclick="syncReadyReconcile(true)"' not in s:
    raise SystemExit('Prepare button handler not found')
s=s.replace('onclick="syncReadyReconcile(true)"','onclick="manualSyncReadyPrepare()"',1)

marker='async function cloudPilotSync(){'
if marker not in s:
    raise SystemExit('cloudPilotSync marker not found')
helpers="""
async function repairV158Outbox(){
 const key='chebsel_v158_outbox_repaired';
 if(localStorage.getItem(key)==='1')return;
 await syncDBOpen();
 const out=await idbAll('outbox');
 for(const op of out)await idbDelete('outbox',op.id);
 await syncReadyReconcile(false);
 localStorage.setItem(key,'1');
 await updateSyncReadyUI();
}
async function manualSyncReadyPrepare(){
 try{
  await repairV158Outbox();
  const before=(await idbAll('outbox')).filter(x=>x.status==='pending').length;
  await syncReadyReconcile(true);
  const after=(await idbAll('outbox')).filter(x=>x.status==='pending').length;
  await updateSyncReadyUI();
  alert('Préparation terminée : '+Math.max(0,after-before)+' nouvelle(s) opération(s). '+after+' opération(s) en attente.');
 }catch(e){alert('Préparation locale impossible : '+e.message)}
}
setTimeout(()=>repairV158Outbox().catch(console.warn),1200);
"""
s=s.replace(marker,helpers+marker,1)
s=s.replace("async function cloudPilotSync(){if(isVisitor())", "async function cloudPilotSync(){await repairV158Outbox();if(isVisitor())",1)

s=s.replace('CHEBSEL v1.5.7 — Centre de gestion','CHEBSEL v1.5.8 — Centre de gestion')
s=s.replace('>v1.5.7<','>v1.5.8<')
p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
x=sw.read_text(encoding='utf-8').replace('chebsel-pwa-stable-v157','chebsel-pwa-stable-v158')
sw.write_text(x,encoding='utf-8')
