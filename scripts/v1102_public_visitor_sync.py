from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.10.1' in s
assert "const APP_VERSION='1.10.1';" in s

s=s.replace('CHEBSEL v1.10.1 — Centre de gestion','CHEBSEL v1.10.2 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.10.1</span>','<span class="versionChip">v1.10.2</span>')
s=s.replace("const APP_VERSION='1.10.1';","const APP_VERSION='1.10.2';\nconst PUBLIC_SNAPSHOT_KEY='chebsel_public_snapshot_v1';\nlet VISITOR_PUBLIC_SYNC_RUNNING=false;",1)

old="function enterVisitorMode(){sessionStorage.removeItem(SESSION_KEY);sessionStorage.setItem(VISITOR_KEY,'1');audit('Accès visiteur','Ouverture de CHEBSEL en lecture seule',{entity:'security'});loginModal.classList.remove('open');updateAuthUI();refreshHome()}"
new="function enterVisitorMode(){sessionStorage.removeItem(SESSION_KEY);sessionStorage.setItem(VISITOR_KEY,'1');audit('Accès visiteur','Ouverture de CHEBSEL en lecture seule',{entity:'security'});loginModal.classList.remove('open');updateAuthUI();refreshHome();syncVisitorPublicSnapshot(true)}"
assert old in s
s=s.replace(old,new,1)

marker="function cloudEl(id){return document.getElementById(id)}"
public_sync=r'''function publicVisitorSnapshot(){const x=safeParse(PUBLIC_SNAPSHOT_KEY);return x&&typeof x==='object'?x:null}
async function syncVisitorPublicSnapshot(silent=true){
 if(!isVisitor()||!navigator.onLine||VISITOR_PUBLIC_SYNC_RUNNING)return false;
 VISITOR_PUBLIC_SYNC_RUNNING=true;
 try{
  const cfg=getCloudConfig();if(!cfg.url||!cfg.anonKey)throw new Error('Configuration cloud absente.');
  const r=await fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/chebsel_public_snapshot',{method:'POST',headers:{apikey:cfg.anonKey,'Content-Type':'application/json'},body:'{}',cache:'no-store'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const data=await r.json();if(!data||typeof data!=='object'||data.error)throw new Error(data?.error||'Snapshot invalide');
  saveJSON(PUBLIC_SNAPSHOT_KEY,data);
  refreshHome();if(debtorsView?.classList.contains('open'))renderDebtors();
  return true;
 }catch(e){if(!silent)alert('Impossible de mettre à jour les informations publiques : '+e.message);console.warn('Visitor public sync:',e);return false}
 finally{VISITOR_PUBLIC_SYNC_RUNNING=false}
}
function visitorPublicCalendarEvents(year){
 const snap=publicVisitorSnapshot(),recurring=annualRecurringEvents(year);
 const custom=(snap?.calendar_events||[]).map(x=>({id:x.legacy_id||x.id,auto:false,title:x.title||'Activité',date:String(x.date||''),time:String(x.start_time||'').slice(0,5),location:x.location||'',note:'',status:x.status||'active',overrideReason:x.reason||''}));
 return [...recurring,...custom].sort((a,b)=>(a.date+' '+(a.time||'')).localeCompare(b.date+' '+(b.time||'')))
}
'''
assert marker in s
s=s.replace(marker,public_sync+marker,1)

old="function renderCurrentMonthCalendar(){const n=new Date(),ym=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`,events=allCalendarEvents(n.getFullYear()).filter(x=>x.date.startsWith(ym));calendarCurrentTitle.textContent='Activités de '+monthNameFR(ym);calendarCurrentEvents.innerHTML=events.length?events.map(eventCard).join(''):'<div class=\"empty\">Aucune activité enregistrée pour ce mois.</div>'}"
new="function renderCurrentMonthCalendar(){const n=new Date(),ym=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`,events=(isVisitor()&&publicVisitorSnapshot()?visitorPublicCalendarEvents(n.getFullYear()):allCalendarEvents(n.getFullYear())).filter(x=>x.date.startsWith(ym));calendarCurrentTitle.textContent='Activités de '+monthNameFR(ym);calendarCurrentEvents.innerHTML=events.length?events.map(eventCard).join(''):'<div class=\"empty\">Aucune activité enregistrée pour ce mois.</div>'}"
assert old in s
s=s.replace(old,new,1)

old="function renderMonthlyDashboard(){const month=new Date().toISOString().slice(0,7),s=monthlySnapshot(month);monthlyDashboardTitle.textContent=new Date(month+'-01T12:00:00').toLocaleDateString('fr-FR',{month:'long',year:'numeric'});monthlyDashboard.innerHTML=[['Activités',s.calls],['Présence',s.attendanceRate+' %'],['Retards',s.late],['Absences',s.absent],['Dû',money(s.due)],['Encaissé',money(s.paid)],['Créances',money(s.balance)],['Recouvrement',s.recovery+' %']].map(x=>`<div class=\"diagItem\"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}"
new="function renderMonthlyDashboard(){const month=new Date().toISOString().slice(0,7),pub=isVisitor()?publicVisitorSnapshot()?.monthly_dashboard:null,s=pub?{calls:Number(pub.activities||0),attendanceRate:Number(pub.attendance_rate||0),late:Number(pub.late||0),absent:Number(pub.absent||0),due:Number(pub.due||0),paid:Number(pub.paid||0),balance:Number(pub.balance||0),recovery:Number(pub.recovery||0)}:monthlySnapshot(month);monthlyDashboardTitle.textContent=new Date(month+'-01T12:00:00').toLocaleDateString('fr-FR',{month:'long',year:'numeric'});monthlyDashboard.innerHTML=[['Activités',s.calls],['Présence',s.attendanceRate+' %'],['Retards',s.late],['Absences',s.absent],['Dû',money(s.due)],['Encaissé',money(s.paid)],['Créances',money(s.balance)],['Recouvrement',s.recovery+' %']].map(x=>`<div class=\"diagItem\"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}"
assert old in s
s=s.replace(old,new,1)

s=s.replace("function openDebtors(){syncBridge();debtorsView.classList.add('open');renderDebtors()}","function openDebtors(){if(!isVisitor())syncBridge();debtorsView.classList.add('open');renderDebtors()}",1)

old="function renderDebtors(){\n const q=(debtSearch.value||'').toLowerCase().trim(),bucket=debtAge.value,f=safeParse(FIN_KEY)||{},members=centralMembers();"
new="""function renderDebtors(){
 const q=(debtSearch.value||'').toLowerCase().trim(),bucket=debtAge.value;
 if(isVisitor()&&publicVisitorSnapshot()){
  let rows=(publicVisitorSnapshot().debtors||[]).map(x=>({name:x.name||'—',balance:Number(x.debt||0),count:Number(x.debt_count||0),days:x.oldest_date?daysOld(x.oldest_date):0}));
  rows=rows.filter(x=>(!q||x.name.toLowerCase().includes(q))&&(bucket==='all'||ageBucket(x.days)===bucket)).sort((a,b)=>b.balance-a.balance);
  debtorsList.innerHTML=rows.length?rows.map(x=>`<div class=\"memberCard\"><div class=\"memberHead\"><div><div class=\"memberName\">${escapeHtml(x.name)}</div><div class=\"memberMeta\">${x.count} dette(s) • plus ancienne : ${x.days} jour(s)</div></div><span class=\"debtTag\">${money(x.balance)}</span></div></div>`).join(''):'<div class=\"empty\">Aucun débiteur dans ce filtre.</div>';return
 }
 const f=safeParse(FIN_KEY)||{},members=centralMembers();"""
assert old in s
s=s.replace(old,new,1)

old_prefix="function refreshHome(){syncBridge();"
new_prefix="""function refreshHome(){if(isVisitor()){
 const ps=publicVisitorSnapshot();renderBackupHealth();renderMonthlyDashboard();renderCurrentMonthCalendar();updateAuthUI();
 if(ps){homeStats.innerHTML=[[\"Membres actifs\",Number(ps.active_members||0)],[\"Présents dernier appel\",Number(ps.last_attendance?.present||0)],[\"Dette totale\",money(Number(ps.total_debt||0))],[\"Amendes liées\",Number(ps.linked_fines||0)]].map(x=>`<div class=\"stat\"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');return}
 }
 syncBridge();"""
assert old_prefix in s
s=s.replace(old_prefix,new_prefix,1)

extra=r'''
window.addEventListener('online',()=>{if(isVisitor())syncVisitorPublicSnapshot(true)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&isVisitor()&&navigator.onLine)syncVisitorPublicSnapshot(true)});
setInterval(()=>{if(isVisitor()&&navigator.onLine)syncVisitorPublicSnapshot(true)},60000);
setTimeout(()=>{if(isVisitor()&&navigator.onLine)syncVisitorPublicSnapshot(true)},700);
'''
idx=s.rfind('</script>')
assert idx!=-1
s=s[:idx]+extra+s[idx:]

p.write_text(s,encoding='utf-8')
print('v1.10.2 public visitor sync applied')
