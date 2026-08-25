from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Version/cache/UI text
s=s.replace('CHEBSEL v1.6.1 — Centre de gestion','CHEBSEL v1.7.0 — Centre de gestion')
s=s.replace("const APP_VERSION='1.6.0';","const APP_VERSION='1.7.0';")
s=s.replace('chebsel-pwa-stable-v161','chebsel-pwa-stable-v170')
s=s.replace('Projet Supabase CHEBSEL préconfiguré • pilote Membres + Calendrier uniquement.','CHEBSEL Cloud • Membres + Calendrier + Appels + Finances.')
s=s.replace('Pilot sync</span>','Cloud sync</span>')
s=s.replace('Membres +<br>Calendrier','Membres + Appels<br>+ Finances')
s=s.replace("Appels et finances restent locaux en v1.5.0. N’utilisez jamais une clé service_role dans l’application.","Cloud actif pour Membres, Calendrier, Appels et Finances. Les droits d’écriture dépendent du rôle. N’utilisez jamais une clé service_role dans l’application.")

marker='async function cloudPilotSync(){'
if marker not in s:
    raise SystemExit('cloudPilotSync marker missing')

finance_code=r'''
function ensureFinancePersistentSyncIds(){
 const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];let changed=false;
 for(const e of f.entries){if(!e.syncId){e.syncId=uuidv4();changed=true}}
 if(changed)localStorage.setItem(FIN_KEY,JSON.stringify(f));
 const ps=safeParse(PAYMENT_LOG_KEY)||[];let pc=false;
 if(Array.isArray(ps))for(const p of ps){if(!p.syncId){p.syncId=uuidv4();pc=true}for(const al of p.alloc||[]){if(!al.syncId){al.syncId=uuidv4();pc=true}}}
 if(pc)localStorage.setItem(PAYMENT_LOG_KEY,JSON.stringify(ps));
 const cls=safeParse(CLOSE_KEY)||{};let cc=false;
 for(const [month,v0] of Object.entries(cls)){const v=(v0&&typeof v0==='object')?v0:{value:v0};if(!v.syncId){v.syncId=uuidv4();cc=true}cls[month]=v}
 if(cc)localStorage.setItem(CLOSE_KEY,JSON.stringify(cls));
 return {finance:f,payments:Array.isArray(ps)?ps:[],closings:cls}
}
function financeCloudMemberId(maps,legacyId){return maps.byLegacy.get(String(legacyId||''))||null}
function financeEntryStatus(e){return Number(e.paid||0)>=Number(e.due||0)&&Number(e.due||0)>0?'paid':'open'}
async function pushCloudFinance(org,userId){
 const client=await getCloudClient(),maps=await cloudAttendanceMemberMaps(org),src=ensureFinancePersistentSyncIds(),entries=src.finance.entries||[],payments=src.payments||[];
 const entryRows=[],entryByLegacy=new Map();
 for(const e of entries){
  const memberId=financeCloudMemberId(maps,e.memberId);if(!memberId||Number(e.due||0)<0)continue;
  entryByLegacy.set(String(e.id||''),e);
  entryRows.push({id:e.syncId,organization_id:org,member_id:memberId,entry_type:e.type||'other',source_type:e.bridgeAuto?'attendance':(e.type==='monthly'?'monthly':'manual'),source_id:null,description:e.typeLabel||e.note||e.type||'Écriture CHEBSEL',due_amount:Number(e.due||0),entry_date:e.date||new Date().toISOString().slice(0,10),month_reference:e.type==='monthly'?String(e.date||'').slice(0,7):null,status:financeEntryStatus(e),version:Number(e._version||1),updated_at:syncNowISO(),deleted_at:null})
 }
 if(entryRows.length){const {error}=await client.from('financial_entries').upsert(entryRows,{onConflict:'id'});if(error)throw error}
 const paymentRows=[];
 for(const p of payments){const memberId=financeCloudMemberId(maps,p.memberId);if(!memberId||Number(p.amount||0)<=0)continue;paymentRows.push({id:p.syncId,organization_id:org,member_id:memberId,receipt_number:p.id||null,payment_date:p.date||new Date().toISOString().slice(0,10),amount:Number(p.amount||0),payment_method:p.method||'cash',reference:p.ref||null,status:p.status||'posted',corrects_payment_id:null,created_by:userId||null,updated_at:syncNowISO()})}
 if(paymentRows.length){const {error}=await client.from('payments').upsert(paymentRows,{onConflict:'id'});if(error)throw error}
 const allocRows=[];
 for(const p of payments){if(!p.syncId)continue;for(const al of p.alloc||[]){const e=entryByLegacy.get(String(al.entryId||''));if(!e||!e.syncId||Number(al.amount||0)<=0)continue;allocRows.push({id:al.syncId,organization_id:org,payment_id:p.syncId,financial_entry_id:e.syncId,amount:Number(al.amount||0)})}}
 if(allocRows.length){const {error}=await client.from('payment_allocations').upsert(allocRows,{onConflict:'id'});if(error)throw error}
 const {data:cloudCls,error:ce}=await client.from('monthly_closings').select('id,month_reference').eq('organization_id',org);if(ce)throw ce;
 const byMonth=new Map((cloudCls||[]).map(x=>[x.month_reference,x.id])),closeRows=[];let closeChanged=false;
 for(const [month,v] of Object.entries(src.closings||{})){if(!v||!v.locked)continue;if(byMonth.has(month)&&v.syncId!==byMonth.get(month)){v.syncId=byMonth.get(month);closeChanged=true}closeRows.push({id:v.syncId,organization_id:org,month_reference:month,closed_by:userId||null,closed_at:v.at||syncNowISO(),reopened_by:null,reopened_at:null,notes:v.note||null})}
 if(closeChanged)localStorage.setItem(CLOSE_KEY,JSON.stringify(src.closings));
 if(closeRows.length){const {error}=await client.from('monthly_closings').upsert(closeRows,{onConflict:'id'});if(error)throw error}
 return {entries:entryRows.length,payments:paymentRows.length,allocations:allocRows.length,closings:closeRows.length}
}
async function pullCloudFinance(org){
 const client=await getCloudClient(),maps=await cloudAttendanceMemberMaps(org);
 const [{data:entries,error:ee},{data:payments,error:pe},{data:allocs,error:ae},{data:closings,error:ce}]=await Promise.all([
  client.from('financial_entries').select('*').eq('organization_id',org).is('deleted_at',null),
  client.from('payments').select('*').eq('organization_id',org),
  client.from('payment_allocations').select('*').eq('organization_id',org),
  client.from('monthly_closings').select('*').eq('organization_id',org)
 ]);if(ee)throw ee;if(pe)throw pe;if(ae)throw ae;if(ce)throw ce;
 const paidByEntry=new Map();for(const a of allocs||[])paidByEntry.set(a.financial_entry_id,(paidByEntry.get(a.financial_entry_id)||0)+Number(a.amount||0));
 const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const bySync=new Map(f.entries.filter(x=>x.syncId).map(x=>[x.syncId,x]));
 for(const r of entries||[]){const legacyMember=maps.byCloud.get(r.member_id);if(!legacyMember)continue;let e=bySync.get(r.id);if(!e){e={id:'cloudfin_'+r.id.slice(0,8),syncId:r.id,memberId:legacyMember};f.entries.push(e);bySync.set(r.id,e)}Object.assign(e,{memberId:legacyMember,type:r.entry_type||'other',typeLabel:r.description||r.entry_type||'Écriture',due:Number(r.due_amount||0),paid:Number(paidByEntry.get(r.id)||0),date:r.entry_date||'',note:r.description||'',updatedAt:r.updated_at||syncNowISO()})}
 localStorage.setItem(FIN_KEY,JSON.stringify(f));
 const localP=safeParse(PAYMENT_LOG_KEY)||[],pBySync=new Map((Array.isArray(localP)?localP:[]).filter(x=>x.syncId).map(x=>[x.syncId,x])),entryLegacyByCloud=new Map(f.entries.filter(x=>x.syncId).map(x=>[x.syncId,x.id]));
 for(const r of payments||[]){const legacyMember=maps.byCloud.get(r.member_id);if(!legacyMember)continue;let p=pBySync.get(r.id);if(!p){p={id:r.receipt_number||('cloudpay_'+r.id.slice(0,8)),syncId:r.id,memberId:legacyMember,alloc:[]};localP.push(p);pBySync.set(r.id,p)}Object.assign(p,{memberId:legacyMember,date:r.payment_date||'',amount:Number(r.amount||0),ref:r.reference||'',status:r.status||'posted',at:r.created_at||syncNowISO()});p.alloc=(allocs||[]).filter(a=>a.payment_id===r.id).map(a=>({syncId:a.id,entryId:entryLegacyByCloud.get(a.financial_entry_id)||'',amount:Number(a.amount||0)}))}
 localStorage.setItem(PAYMENT_LOG_KEY,JSON.stringify(localP));
 const cls=safeParse(CLOSE_KEY)||{};for(const r of closings||[]){const old=cls[r.month_reference]||{};cls[r.month_reference]={...old,syncId:r.id,at:r.closed_at,note:r.notes||'',locked:!r.reopened_at,by:old.by||'Cloud'}}localStorage.setItem(CLOSE_KEY,JSON.stringify(cls));
 syncBridge();
 return {entries:(entries||[]).length,payments:(payments||[]).length,allocations:(allocs||[]).length,closings:(closings||[]).length}
}
'''

s=s.replace(marker,finance_code+'\n'+marker,1)

# Extend cloudPilotSync after attendance push
old="""  cloudState.textContent='Envoi des appels…';
  const pa=await pushCloudAttendance(org,userId);
  await syncReadyReconcilePilot(false);"""
new="""  cloudState.textContent='Envoi des appels…';
  const pa=await pushCloudAttendance(org,userId);
  cloudState.textContent='Réception des finances…';
  const rf=await pullCloudFinance(org);
  let pf={entries:0,payments:0,allocations:0,closings:0};
  if(['president','treasurer'].includes(p.role)){
   cloudState.textContent='Envoi des finances…';
   pf=await pushCloudFinance(org,userId);
   cloudState.textContent='Vérification des finances…';
   await pullCloudFinance(org);
  }
  await syncReadyReconcilePilot(false);"""
if old not in s: raise SystemExit('attendance push block missing')
s=s.replace(old,new,1)

# Include finance outbox entities as synced
s=s.replace("['members','calendar_events','attendance_events','attendance_records'].includes(op.entity)","['members','calendar_events','attendance_events','attendance_records','financial_entries','payments','payment_allocations','monthly_closings'].includes(op.entity)")

# Extend summary and final alert
s=s.replace("lastSummary:{pm,pc,rm,rc,attendancePush:pa,attendancePull:ra}","lastSummary:{pm,pc,rm,rc,attendancePush:pa,attendancePull:ra,financePush:pf,financePull:rf}")
s=s.replace("alert(`Synchronisation terminée. Membres: ${rm}. Calendrier: ${rc}. Appels cloud: ${ra.events}; présences cloud: ${ra.records}. Envoyés: ${pa.events} appel(s), ${pa.records} présence(s).`)","alert(`Synchronisation terminée. Membres: ${rm}. Calendrier: ${rc}. Appels cloud: ${ra.events}; présences cloud: ${ra.records}. Finances cloud: ${rf.entries} écriture(s), ${rf.payments} paiement(s), ${rf.closings} clôture(s). Envoyés: ${pa.events} appel(s), ${pa.records} présence(s), ${pf.entries} écriture(s), ${pf.payments} paiement(s).`)")

p.write_text(s,encoding='utf-8')
