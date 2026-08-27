let deferredInstallPrompt=null;
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function updateInstallUI(){const show=!!deferredInstallPrompt&&!isStandalone(),b=document.getElementById('installBtn'),c=document.getElementById('installCard');if(b)b.style.display=show?'grid':'none';if(c)c.style.display=show?'block':'none'}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;updateInstallUI()});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;updateInstallUI();if(typeof audit==='function')audit('Application installée','CHEBSEL installé comme PWA')});
async function installPWA(){if(deferredInstallPrompt){deferredInstallPrompt.prompt();try{await deferredInstallPrompt.userChoice}catch(e){}deferredInstallPrompt=null;updateInstallUI();return}if(isStandalone())alert('CHEBSEL est déjà installé sur cet appareil.');else alert("Utilisez le menu du navigateur puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».")}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
window.addEventListener('DOMContentLoaded',updateInstallUI);



const ATT_KEY='chebsel_attendance_app_v1';
const FIN_KEY='chebsel_finance_app_v1';
const MASTER_KEY='chebsel_master_members_v1';
const CALENDAR_KEY='chebsel_calendar_v1';
const CALENDAR_OVERRIDE_KEY='chebsel_calendar_overrides_v1';

const CHEBSEL_DEFAULT_MEMBERS=[
 {id:"m1",no:"1",first:"Osnel",last:"Ulysse",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m2",no:"2",first:"Guy-Mary",last:"Bien-Aime",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m3",no:"3",first:"Guidmond",last:"Garcon",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m4",no:"4",first:"Anias",last:"Chery",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m5",no:"5",first:"Lubérus Wilfrid",last:"Wildly",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m6",no:"6",first:"Jose",last:"Sterlin",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m7",no:"7",first:"Jackson",last:"Chery",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m8",no:"8",first:"Jacques",last:"Sinsurin",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m9",no:"9",first:"Arold",last:"Pierre-Louis",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m10",no:"10",first:"Pierre",last:"Philidor",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m11",no:"11",first:"Lucson",last:"Louis",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m12",no:"12",first:"Jimmy",last:"Nortila",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""},
 {id:"m13",no:"13",first:"Jean-René",last:"Saintil",sex:"",function:"",category:"Membre",group:"Chœur d’Homme",phone:"",active:true,note:""}
];

const SHELL_THEME='chebsel_portail_theme_v2';
let activeApp=null;

function decode64(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new TextDecoder('utf-8').decode(u)}
function safeParse(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function saveJSON(k,v){localStorage.setItem(k,JSON.stringify(v));try{syncReadyOnLocalWrite(k,v)}catch(e){}}
function fullName(m){return [m?.first,m?.last].filter(Boolean).join(' ').trim()||'Sans nom'}
function money(v){return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Number(v||0))+' G'}
function uid(){return (globalThis.crypto?.randomUUID?crypto.randomUUID():'id_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8))}
function toggleShellTheme(){applyShellTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')}
function propagateThemeToFrame(t){
 const f=document.getElementById('appFrame');if(!f)return;
 try{
  const d=f.contentDocument;if(!d)return;
  d.documentElement.dataset.theme=t;
  d.documentElement.classList.toggle('dark',t==='dark');
  d.body?.classList.toggle('dark',t==='dark');
  let st=d.getElementById('chebsel-parent-theme');
  if(!st){st=d.createElement('style');st.id='chebsel-parent-theme';d.head?.appendChild(st)}
  st.textContent=t==='dark'?`:root{color-scheme:dark}html,body{background:#0d1117!important;color:#f0f3f7!important}body,.container,.app,.page,.card,.panel,.modal-content,.sheet,.table-wrap{color:#f0f3f7}input,select,textarea{background:#0f141b!important;color:#f0f3f7!important;border-color:#30363d!important}`:`:root{color-scheme:light}`;
 }catch(e){console.warn('Theme iframe CHEBSEL:',e)}
}
function applyShellTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(SHELL_THEME,t);themeBtn.textContent=t==='dark'?'☀️':'🌙';themeMeta.setAttribute('content',t==='dark'?'#05080d':'#0b1220');propagateThemeToFrame(t)}

const _chebselThemeFrame=document.getElementById('appFrame');
if(_chebselThemeFrame)_chebselThemeFrame.addEventListener('load',()=>propagateThemeToFrame(localStorage.getItem(SHELL_THEME)==='dark'?'dark':'light'));

function normalizeMember(m){return {id:m.id||uid(),no:m.no||'',first:m.first||'',last:m.last||'',sex:m.sex||'',function:m.function||'',category:m.category||'Membre',group:m.group||'Chœur d’Homme',phone:m.phone||'',active:m.active!==false,note:m.note||''}}

function initializeMasterMembers(){
 let master=safeParse(MASTER_KEY);
 if(Array.isArray(master)&&master.length)return master.map(normalizeMember);
 const a=safeParse(ATT_KEY),f=safeParse(FIN_KEY);
 let source=Array.isArray(a?.members)&&a.members.length?a.members:(Array.isArray(f?.members)&&f.members.length?f.members:CHEBSEL_DEFAULT_MEMBERS);
 master=source.map(normalizeMember);
 saveJSON(MASTER_KEY,master);
 return master;
}

function centralMembers(){return initializeMasterMembers()}
function writeCentralMembers(list){
 const normalized=list.map(normalizeMember);
 saveJSON(MASTER_KEY,normalized);
 const a=safeParse(ATT_KEY); if(a){a.members=normalized.map(x=>({...x}));saveJSON(ATT_KEY,a)}
 const f=safeParse(FIN_KEY); if(f){f.members=normalized.map(x=>({...x}));saveJSON(FIN_KEY,f)}
}
function syncMembersToApps(){
 const members=centralMembers();
 const a=safeParse(ATT_KEY);if(a){a.members=members.map(x=>({...x}));saveJSON(ATT_KEY,a)}
 const f=safeParse(FIN_KEY);if(f){f.members=members.map(x=>({...x}));saveJSON(FIN_KEY,f)}
}

function openMembers(){if(isVisitor()){alert('Accès réservé aux responsables.');return}syncMembersToApps();membersView.classList.add('open');renderCentralMembers()}
function closeMembers(){membersView.classList.remove('open');syncMembersToApps();refreshHome()}

function memberFinancial(mid){
 const f=safeParse(FIN_KEY)||{},es=Array.isArray(f.entries)?f.entries.filter(e=>e.memberId===mid):[];
 const due=es.reduce((s,e)=>s+Number(e.due||0),0),paid=es.reduce((s,e)=>s+Number(e.paid||0),0);
 return {due,paid,balance:Math.max(0,due-paid)}
}
function memberAttendance(mid){
 const a=safeParse(ATT_KEY)||{},calls=Array.isArray(a.calls)?a.calls:[];
 const rel=calls.filter(c=>c.records&&c.records[mid]),rs=rel.map(c=>c.records[mid]);
 return {activities:rel.length,present:rs.filter(r=>r.status==='P').length,absent:rs.filter(r=>r.status==='A'||r.status==='ANM').length,late:rs.filter(r=>r.status==='R'||r.status==='RNM').length}
}
function renderCentralMembers(){
 const q=(memberSearch.value||'').toLowerCase().trim(),filter=memberFilter.value;
 let list=centralMembers().filter(m=>(filter==='all'||(filter==='active'?m.active:!m.active))&&(!q||fullName(m).toLowerCase().includes(q)||(m.no||'').toLowerCase().includes(q)||(m.phone||'').includes(q))).sort((a,b)=>fullName(a).localeCompare(fullName(b),'fr'));
 centralMembersList.innerHTML=list.length?list.map(m=>{
   const a=memberAttendance(m.id),f=memberFinancial(m.id);
   return `<div class="memberCard"><div class="memberHead"><div><div class="memberName">${escapeHtml(fullName(m))}</div><div class="memberMeta">N° ${escapeHtml(m.no||'—')} ${m.function?'• '+escapeHtml(m.function):''} ${m.group?'• '+escapeHtml(m.group):''}</div></div><span class="status ${m.active?'active':''}">${m.active?'Actif':'Inactif'}</span></div>
   <div class="memberStats"><div class="mini"><b>${a.activities}</b><span>Activités</span></div><div class="mini"><b>${a.present}</b><span>Présences</span></div><div class="mini"><b>${a.late}</b><span>Retards</span></div><div class="mini"><b>${money(f.balance)}</b><span>Dette</span></div></div>
   <div class="memberActions"><button class="secondaryQuick" onclick="openProfile('${m.id}')">Fiche</button><button class="edit" onclick="openMemberModal('${m.id}')">Modifier</button><button class="inactiveBtn" onclick="toggleMemberActive('${m.id}')">${m.active?'Désactiver':'Réactiver'}</button><button class="delete" onclick="deleteCentralMember('${m.id}')">Supprimer</button></div></div>`
 }).join(''):'<div class="empty">Aucun membre trouvé.</div>'
}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function openMemberModal(mid=''){
 const m=centralMembers().find(x=>x.id===mid);
 modalTitle.textContent=m?'Modifier le membre':'Ajouter un membre';
 mId.value=m?.id||'';mNo.value=m?.no||String(centralMembers().length+1);mFirst.value=m?.first||'';mLast.value=m?.last||'';mSex.value=m?.sex||'';mFunction.value=m?.function||'';mCategory.value=m?.category||'Membre';mGroup.value=m?.group||'Chœur d’Homme';mPhone.value=m?.phone||'';mContributionStart.value=m?.contributionStartMonth||String(m?.joinedAt||'').slice(0,7)||new Date().toISOString().slice(0,7);mActive.value=String(m?.active??true);mNote.value=m?.note||'';
 memberModal.classList.add('open')
}
function closeMemberModal(){memberModal.classList.remove('open')}
function saveCentralMember(){
 if(!mFirst.value.trim()&&!mLast.value.trim()){alert('Saisissez au moins un prénom ou un nom.');return}
 const list=centralMembers(),obj={id:mId.value||uid(),no:mNo.value.trim(),first:mFirst.value.trim(),last:mLast.value.trim(),sex:mSex.value,function:mFunction.value.trim(),category:mCategory.value.trim()||'Membre',group:mGroup.value.trim()||'Chœur d’Homme',phone:mPhone.value.trim(),contributionStartMonth:mContributionStart.value||new Date().toISOString().slice(0,7),active:mActive.value==='true',note:mNote.value.trim()};
 const i=list.findIndex(x=>x.id===obj.id);if(i>=0)list[i]=obj;else list.push(obj);
 writeCentralMembers(list);audit(i>=0?'Membre modifié':'Membre ajouté',fullName(obj));closeMemberModal();renderCentralMembers();refreshHome()
}
function toggleMemberActive(mid){const list=centralMembers(),m=list.find(x=>x.id===mid);if(!m)return;m.active=!m.active;writeCentralMembers(list);audit(m.active?'Membre réactivé':'Membre désactivé',fullName(m));renderCentralMembers();refreshHome()}
function deleteCentralMember(mid){
 const a=safeParse(ATT_KEY)||{},f=safeParse(FIN_KEY)||{};
 const hasAttendance=(a.calls||[]).some(c=>c.records&&c.records[mid]),hasFinance=(f.entries||[]).some(e=>e.memberId===mid);
 if(hasAttendance||hasFinance){alert("Ce membre possède déjà un historique. Pour conserver les données, utilisez « Désactiver » au lieu de le supprimer.");return}
 const m=centralMembers().find(x=>x.id===mid);if(!m||!confirm(`Supprimer définitivement ${fullName(m)} ?`))return;
 writeCentralMembers(centralMembers().filter(x=>x.id!==mid));audit('Membre supprimé',fullName(m));renderCentralMembers();refreshHome()
}

function openAttendance(page){if(isVisitor()){alert('Accès réservé aux responsables.');return}syncMembersToApps();activeApp='attendance';viewerTitle.textContent='Fiche d’appel';viewer.classList.add('open');appFrame.onload=()=>{try{const w=appFrame.contentWindow;if(typeof w.goPage==='function')w.goPage(page)}catch(e){}};appFrame.srcdoc=decode64(ATT_B64)}
function openFinance(page){if(isVisitor()){alert('Accès réservé aux responsables.');return}syncMembersToApps();activeApp='finance';viewerTitle.textContent='Cotisations & Amendes';viewer.classList.add('open');appFrame.onload=()=>{try{const w=appFrame.contentWindow;if(typeof w.goPage==='function')w.goPage(page)}catch(e){}};appFrame.srcdoc=decode64(FIN_B64)}
function closeViewer(){viewer.classList.remove('open');appFrame.srcdoc='';activeApp=null;syncBridge();refreshHome()}

function isPerformance(call){const s=String(call?.activity||'').toLowerCase();return s.includes('prestation')||s.includes('concert')}

function fineForAttendanceStatus(status,isPerformance=false){
 const st=normalizeAttendanceStatus(status,isPerformance);
 if(st==='RNM')return 25;
 if(st==='ANMP')return 250;
 if(st==='ANM')return isPerformance?250:50;
 return 0
}

function repairLegacyPerformanceFines(){
 const f=safeParse(FIN_KEY);if(!f||!Array.isArray(f.entries))return;
 let changed=false;
 for(const e of f.entries){
  const lbl=String(e.typeLabel||'').toLowerCase();
  const isPerf=e.type==='performance'||lbl.includes('prestation');
  if(isPerf&&e.bridgeAuto===true&&Number(e.due||0)===100){e.due=250;e.updatedAt=new Date().toISOString();changed=true}
 }
 if(changed)saveJSON(FIN_KEY,f)
}
function syncBridge(){
 syncMembersToApps();
 const a=safeParse(ATT_KEY),f=safeParse(FIN_KEY);if(!a||!f)return;
 let changed=false;if(!Array.isArray(f.entries))f.entries=[];
 const rates={rnm:Number(f.settings?.rnm??25),anm:Number(f.settings?.anm??50),performance:Number(f.settings?.performance??250)},wanted=new Map();
 for(const c of (a.calls||[]))for(const [mid,r] of Object.entries(c.records||{})){
   if(r.status==='RNM'){const k=`bridge_${c.id}_${mid}_RNM`;wanted.set(k,{id:k,memberId:mid,date:c.date,type:'rnm',typeLabel:'Retard non motivé',due:rates.rnm,paid:0,paidDate:'',note:`Dette générée automatiquement depuis la fiche d’appel : ${c.activity||'activité'} du ${c.date}.`,bridgeAuto:true,sourceCallId:c.id,sourceStatus:'RNM',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}
   if(r.status==='ANM'){const perf=isPerformance(c),k=`bridge_${c.id}_${mid}_ANM`;wanted.set(k,{id:k,memberId:mid,date:c.date,type:perf?'performance':'anm',typeLabel:perf?'Appel non motivé lors d’une prestation':'Absence non motivée',due:perf?rates.performance:rates.anm,paid:0,paidDate:'',note:`Dette générée automatiquement depuis la fiche d’appel : ${c.activity||'activité'} du ${c.date}.`,bridgeAuto:true,sourceCallId:c.id,sourceStatus:'ANM',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}
 }
 const byId=new Map(f.entries.map(e=>[e.id,e]));
 for(const [k,w] of wanted){const e=byId.get(k);if(e){if(Number(e.due)!==Number(w.due)||e.type!==w.type||e.typeLabel!==w.typeLabel||e.date!==w.date){e.due=w.due;e.type=w.type;e.typeLabel=w.typeLabel;e.date=w.date;e.updatedAt=new Date().toISOString();changed=true}}else{f.entries.push(w);changed=true}}
 const kept=[];for(const e of f.entries){if(e.bridgeAuto===true&&!wanted.has(e.id)){if(Number(e.paid||0)>0){e.note=(e.note||'')+' ⚠️ Le statut correspondant dans la fiche d’appel a été corrigé après paiement; vérifier manuellement.';e.bridgeAuto=false;kept.push(e)}else{changed=true}}else kept.push(e)}f.entries=kept;
 if(changed)saveJSON(FIN_KEY,f);
 syncMessage.textContent='🔗 Liaison active — membres centralisés + dettes RNM/ANM synchronisées : '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
}

const AUDIT_KEY='chebsel_audit_log_v1';
const CLOSE_KEY='chebsel_monthly_close_v1';
const BACKUP_KEY='chebsel_last_backup_v1';

function audit(action,details=''){
 const log=safeParse(AUDIT_KEY)||[];
 log.unshift({id:uid(),at:new Date().toISOString(),action,details});
 saveJSON(AUDIT_KEY,log.slice(0,1000));
}
function daysOld(dateStr){
 if(!dateStr)return 0;
 const d=new Date(dateStr+'T12:00:00'),now=new Date();
 return Math.max(0,Math.floor((now-d)/86400000));
}
function ageBucket(days){return days<=30?'0-30':days<=60?'31-60':days<=90?'61-90':'90+'}

function openProfile(mid){if(isVisitor()){openVisitorDebtorProfile(mid);return}syncBridge();profileView.classList.add('open');renderProfile(mid)}
function closeProfile(){profileView.classList.remove('open');refreshHome()}
function renderProfile(mid){
 const m=centralMembers().find(x=>x.id===mid);if(!m)return;
 const a=safeParse(ATT_KEY)||{},f=safeParse(FIN_KEY)||{},calls=(a.calls||[]).filter(c=>c.records&&c.records[mid]).sort((x,y)=>(y.date||'').localeCompare(x.date||'')),es=(f.entries||[]).filter(e=>e.memberId===mid).sort((x,y)=>(y.date||'').localeCompare(x.date||''));
 const rs=calls.map(c=>c.records[mid]),P=rs.filter(r=>r.status==='P').length,A=rs.filter(r=>r.status==='A'||r.status==='ANM').length,R=rs.filter(r=>r.status==='R'||r.status==='RNM').length,E=rs.filter(r=>r.status==='E').length;
 const due=es.reduce((s,e)=>s+Number(e.due||0),0),paid=es.reduce((s,e)=>s+Number(e.paid||0),0),balance=Math.max(0,due-paid),rate=calls.length?((P/calls.length)*100).toFixed(1).replace('.',',')+' %':'0,0 %';
 profileBody.innerHTML=`<div class="profilePanel"><div class="profileTitle"><div><h3>${escapeHtml(fullName(m))}</h3><div class="memberMeta">N° ${escapeHtml(m.no||'—')} ${m.function?'• '+escapeHtml(m.function):''} ${m.group?'• '+escapeHtml(m.group):''}</div></div><span class="status ${m.active?'active':''}">${m.active?'Actif':'Inactif'}</span></div>
 <div class="memberStats"><div class="mini"><b>${calls.length}</b><span>Activités</span></div><div class="mini"><b>${P}</b><span>Présences</span></div><div class="mini"><b>${R}</b><span>Retards</span></div><div class="mini"><b>${rate}</b><span>Taux</span></div><div class="mini"><b>${A}</b><span>Absences</span></div><div class="mini"><b>${money(due)}</b><span>Dû</span></div><div class="mini"><b>${money(paid)}</b><span>Payé</span></div><div class="mini"><b>${money(balance)}</b><span>Dette</span></div></div>
 <div class="memberActions" style="margin-top:12px"><button class="quickBtn" onclick="openPaymentModal('${m.id}')">Enregistrer un paiement</button></div></div>
 <div class="profilePanel"><h3>Historique financier</h3>${es.length?es.map(e=>`<div class="ledgerRow"><div><div class="ledgerMain">${escapeHtml(e.typeLabel||e.type||'Écriture')}</div><div class="ledgerMeta">${escapeHtml(e.date||'')} • Dû ${money(e.due)} • Payé ${money(e.paid||0)}</div></div><div>${Math.max(0,Number(e.due||0)-Number(e.paid||0))>0?'<span class="debtTag">Solde '+money(Math.max(0,Number(e.due||0)-Number(e.paid||0)))+'</span>':'<span class="paidTag">Soldé</span>'}</div></div>`).join(''):'<div class="empty">Aucune écriture financière.</div>'}</div>
 <div class="profilePanel"><h3>Paiements enregistrés</h3>${renderMemberPaymentHistory(mid)}</div>
 <div class="profilePanel"><h3>Historique de présence</h3>${calls.length?calls.map(c=>{const r=c.records[mid];return `<div class="ledgerRow"><div><div class="ledgerMain">${escapeHtml(c.activity||'Activité')}</div><div class="ledgerMeta">${escapeHtml(c.date||'')} • ${escapeHtml(({P:'Présent',A:'Absent motivé',R:'Retard motivé',E:'Excusé',RNM:'Retard non motivé',ANM:'Absence non motivée'})[r.status]||'Non renseigné')}</div></div></div>`}).join(''):'<div class="empty">Aucun historique de présence.</div>'}</div>`
}

function openPaymentModal(mid){
 if(!requirePermission('finance.payment'))return;
 payMemberId.value=mid;payAmount.value='';payDate.value=new Date().toISOString().slice(0,10);payRef.value='';paymentModal.classList.add('open')
}
function closePaymentModal(){paymentModal.classList.remove('open')}

function getPaymentLog(){const x=safeParse(PAYMENT_LOG_KEY);return Array.isArray(x)?x:[]}
function savePaymentLog(log){saveJSON(PAYMENT_LOG_KEY,log.slice(0,5000))}
function paymentById(id){return getPaymentLog().find(p=>p.id===id)}

function applyPaymentToMember(mid,amount,date,ref,opts={}){
 const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];
 const debts=f.entries.filter(e=>e.memberId===mid&&Math.max(0,Number(e.due||0)-Number(e.paid||0))>0).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
 if(!debts.length)return {ok:false,error:'Ce membre ne possède aucune dette ouverte.'};
 let remain=Number(amount),applied=0,alloc=[];
 for(const e of debts){
   if(remain<=0)break;
   const bal=Math.max(0,Number(e.due||0)-Number(e.paid||0)),x=Math.min(bal,remain),beforePaid=Number(e.paid||0);
   e.paid=beforePaid+x;e.paidDate=date;e.updatedAt=new Date().toISOString();remain-=x;applied+=x;
   alloc.push({entryId:e.id,label:e.typeLabel||e.type,amount:x,beforePaid,afterPaid:e.paid})
 }
 saveJSON(FIN_KEY,f);
 const id=opts.id||('PAY-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase());
 const rec={
   id,receiptNo:opts.receiptNo||('REC-'+Date.now().toString().slice(-8)),
   memberId:mid,date,amount:Number(amount),applied,unapplied:remain,ref:ref||'',alloc,
   status:'active',createdAt:new Date().toISOString(),createdBy:currentUser()?.name||'',
   correctsPaymentId:opts.correctsPaymentId||'',note:opts.note||''
 };
 const log=getPaymentLog();log.unshift(rec);savePaymentLog(log);
 return {ok:true,payment:rec}
}

async function applySmartPayment(){
 if(!requirePermission('finance.payment'))return;
 if(!(await criticalGuard('finance.payment','Enregistrement d’un paiement')))return;
 const mid=payMemberId.value,amount=Number(payAmount.value||0),date=payDate.value||new Date().toISOString().slice(0,10),ref=(payRef.value||'').trim();
 if(amount<=0){alert('Saisissez un montant valide.');return}
 const dup=getPaymentLog().find(p=>p.status==='active'&&p.memberId===mid&&p.date===date&&Number(p.amount)===amount&&(p.ref||'')===ref);
 if(dup){alert('Paiement en double détecté : même membre, même date, même montant et même référence.');return}
 const result=applyPaymentToMember(mid,amount,date,ref);
 if(!result.ok){alert(result.error);return}
 const rec=result.payment,m=centralMembers().find(x=>x.id===mid);
 audit('Paiement enregistré',`${fullName(m)} : ${money(rec.applied)}${rec.unapplied>0?' • excédent non affecté '+money(rec.unapplied):''}`,{entity:'payment',entityId:rec.id,before:null,after:rec});
 closePaymentModal();syncBridge();renderProfile(mid);refreshHome();showReceipt(mid,rec.applied,date,ref,rec.alloc,rec.unapplied,rec.receiptNo)
}

function renderMemberPaymentHistory(mid){
 const rows=getPaymentLog().filter(p=>p.memberId===mid);
 if(!rows.length)return '<div class="empty">Aucun paiement traçable enregistré depuis la v1.2.2.</div>';
 return rows.map(p=>{
   const active=p.status!=='cancelled',status=active?'<span class="paidTag">Actif</span>':'<span class="debtTag">Annulé / rectifié</span>';
   const actions=active&&can('finance.payment')?`<div class="memberActions" style="margin-top:8px"><button class="secondaryQuick" onclick="openPaymentCorrectionModal('${p.id}')">Corriger</button><button class="delete" onclick="cancelPayment('${p.id}')">Annuler le paiement</button></div>`:'';
   const corr=p.correctsPaymentId?`<div class="ledgerMeta">Correction du paiement ${escapeHtml(p.correctsPaymentId)}</div>`:'';
   const cancelled=p.status==='cancelled'?`<div class="ledgerMeta">Annulé le ${p.cancelledAt?new Date(p.cancelledAt).toLocaleString('fr-FR'):'—'} • ${escapeHtml(p.correctionReason||'')}</div>`:'';
   return `<div class="ledgerRow" style="display:block"><div style="display:flex;justify-content:space-between;gap:10px"><div><div class="ledgerMain">${escapeHtml(p.receiptNo||p.id)} • ${money(p.amount)}</div><div class="ledgerMeta">${escapeHtml(p.date||'')} • ${escapeHtml(p.ref||'Sans référence')} • Affecté ${money(p.applied||0)}</div>${corr}${cancelled}</div><div>${status}</div></div>${actions}</div>`
 }).join('')
}

function reversePaymentAllocations(payment){
 const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];
 const problems=[];
 for(const a of payment.alloc||[]){
   const e=f.entries.find(x=>x.id===a.entryId);
   if(!e){problems.push('Écriture introuvable : '+(a.label||a.entryId));continue}
   const current=Number(e.paid||0),reverse=Number(a.amount||0);
   if(current<reverse-0.001){problems.push('Montant déjà modifié sur '+(a.label||e.id));continue}
   e.paid=Math.max(0,current-reverse);e.updatedAt=new Date().toISOString();
   if(e.paid===0)e.paidDate='';
 }
 if(problems.length)return {ok:false,problems};
 saveJSON(FIN_KEY,f);return {ok:true}
}

function toggleCorrectionFields(){
 const replace=correctionMode.value==='replace';
 ['correctionMemberWrap','correctionAmountWrap','correctionDateWrap','correctionRefWrap'].forEach(id=>{
   const el=document.getElementById(id);if(el)el.style.display=replace?'':'none'
 });
 correctionHelp.textContent=replace
  ?"CHEBSEL annulera comptablement le paiement d’origine, restaurera les dettes qu’il avait soldées, puis enregistrera immédiatement le paiement corrigé. L’ancienne opération restera visible dans le journal d’audit."
  :"CHEBSEL annulera uniquement le paiement d’origine et restaurera les dettes concernées. Aucun nouveau paiement ne sera créé. Vous pourrez l’enregistrer plus tard.";
}
function openPaymentCorrectionModal(pid){
 if(!requirePermission('finance.payment'))return;
 const p=paymentById(pid);if(!p||p.status==='cancelled'){alert('Paiement introuvable ou déjà annulé.');return}
 correctionPaymentId.value=pid;
 const m=centralMembers().find(x=>x.id===p.memberId);
 correctionOriginal.innerHTML=`<b>Paiement d’origine</b><div class="memberMeta">${escapeHtml(p.receiptNo||p.id)} • ${escapeHtml(fullName(m))} • ${money(p.amount)} • ${escapeHtml(p.date||'')} • ${escapeHtml(p.ref||'Sans référence')}</div>`;
 correctionMember.innerHTML=centralMembers().filter(x=>x.active!==false).map(x=>`<option value="${x.id}" ${x.id===p.memberId?'selected':''}>${escapeHtml(fullName(x))}</option>`).join('');
 correctionAmount.value=p.amount;correctionDate.value=p.date||new Date().toISOString().slice(0,10);correctionRef.value=p.ref||'';correctionReason.value='';
 correctionMode.value='replace';toggleCorrectionFields();
 paymentCorrectionModal.classList.add('open')
}
function closePaymentCorrectionModal(){paymentCorrectionModal.classList.remove('open')}

async function savePaymentCorrection(){
 if(!requirePermission('finance.payment'))return;
 if(!(await criticalGuard('finance.payment','Correction / annulation d’un paiement')))return;

 const pid=correctionPaymentId.value,p=paymentById(pid);
 if(!p||p.status==='cancelled'){alert('Ce paiement n’est plus disponible pour correction.');return}

 const mode=correctionMode.value,reason=(correctionReason.value||'').trim();
 if(!reason){alert('Indiquez le motif de la correction ou de l’annulation.');return}

 let mid='',amount=0,date='',ref='';
 if(mode==='replace'){
   mid=correctionMember.value;
   amount=Number(correctionAmount.value||0);
   date=correctionDate.value;
   ref=(correctionRef.value||'').trim();
   if(amount<=0){alert('Saisissez un montant correct.');return}
   if(!date){alert('Indiquez la date du paiement corrigé.');return}
 }

 const before=JSON.parse(JSON.stringify(p));
 const rev=reversePaymentAllocations(p);
 if(!rev.ok){
   alert('Opération impossible automatiquement : '+rev.problems.join(' ; ')+'. Vérifiez le journal et les écritures concernées.');
   return
 }

 let log=getPaymentLog(),idx=log.findIndex(x=>x.id===pid);
 if(idx<0){alert('Journal de paiement introuvable.');return}

 log[idx]={
   ...log[idx],
   status:'cancelled',
   cancelledAt:new Date().toISOString(),
   cancelledBy:currentUser()?.name||'',
   correctionReason:reason,
   correctionMode:mode
 };
 savePaymentLog(log);

 // Option 1: cancel only, no replacement payment
 if(mode==='cancelOnly'){
   const oldMember=centralMembers().find(x=>x.id===p.memberId);
   audit(
     'Paiement annulé sans remplacement',
     `${fullName(oldMember)} • ${money(p.amount)} • ${reason}`,
     {entity:'payment',entityId:pid,before,after:paymentById(pid)}
   );
   closePaymentCorrectionModal();
   syncBridge();renderProfile(p.memberId);refreshHome();
   alert('Paiement annulé. Les dettes concernées ont été restaurées. Aucun nouveau paiement n’a été créé.');
   return
 }

 // Option 2: cancel and immediately create corrected payment
 const result=applyPaymentToMember(mid,amount,date,ref,{correctsPaymentId:pid,note:reason});
 if(!result.ok){
   // Roll back original cancellation if replacement fails
   const f=safeParse(FIN_KEY)||{};
   for(const a of p.alloc||[]){
     const e=(f.entries||[]).find(x=>x.id===a.entryId);
     if(e)e.paid=Number(e.paid||0)+Number(a.amount||0)
   }
   saveJSON(FIN_KEY,f);
   log=getPaymentLog();idx=log.findIndex(x=>x.id===pid);
   if(idx>=0)log[idx]=before;
   savePaymentLog(log);
   alert('Le paiement original a été restauré. Correction non enregistrée : '+result.error);
   return
 }

 const replacement=result.payment;
 log=getPaymentLog();idx=log.findIndex(x=>x.id===pid);
 if(idx>=0){
   log[idx].replacementPaymentId=replacement.id;
   savePaymentLog(log)
 }

 const oldMember=centralMembers().find(x=>x.id===p.memberId),
       newMember=centralMembers().find(x=>x.id===mid);

 audit(
   'Paiement corrigé avec remplacement',
   `${fullName(oldMember)} ${money(p.amount)} → ${fullName(newMember)} ${money(amount)} • ${reason}`,
   {entity:'payment',entityId:pid,before,after:{cancelledOriginal:paymentById(pid),replacement}}
 );

 closePaymentCorrectionModal();
 syncBridge();renderProfile(mid);refreshHome();
 showReceipt(mid,replacement.applied,date,ref,replacement.alloc,replacement.unapplied,replacement.receiptNo)
}
async function cancelPayment(pid){
 if(!requirePermission('finance.payment'))return;
 if(!(await criticalGuard('finance.payment','Annulation d’un paiement')))return;
 const p=paymentById(pid);if(!p||p.status==='cancelled'){alert('Paiement introuvable ou déjà annulé.');return}
 const reason=prompt('Motif de l’annulation :');if(reason===null)return;if(!reason.trim()){alert('Le motif est obligatoire.');return}
 const before=JSON.parse(JSON.stringify(p)),rev=reversePaymentAllocations(p);
 if(!rev.ok){alert('Annulation automatique impossible : '+rev.problems.join(' ; '));return}
 const log=getPaymentLog(),idx=log.findIndex(x=>x.id===pid);
 log[idx]={...log[idx],status:'cancelled',cancelledAt:new Date().toISOString(),cancelledBy:currentUser()?.name||'',correctionReason:reason.trim()};
 savePaymentLog(log);
 const m=centralMembers().find(x=>x.id===p.memberId);
 audit('Paiement annulé',`${fullName(m)} • ${money(p.amount)} • ${reason.trim()}`,{entity:'payment',entityId:pid,before,after:log[idx]});
 syncBridge();renderProfile(p.memberId);refreshHome()
}
function showReceipt(mid,amount,date,ref,alloc,remain,receiptNo=''){
 const m=centralMembers().find(x=>x.id===mid),n=receiptNo||('REC-'+Date.now().toString().slice(-8));
 const f=safeParse(FIN_KEY)||{},es=(f.entries||[]).filter(e=>e.memberId===mid),bal=es.reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0);
 receiptContent.innerHTML=`<div class="receipt" id="receiptPrint"><h2>CHŒUR D’HOMME DE L’ÉGLISE BAPTISTE SEL ET LUMIÈRE</h2><div style="text-align:center;font-weight:800">REÇU DE PAIEMENT</div><div class="rmeta" style="text-align:center">${n}</div><table><tr><td>Date</td><td>${escapeHtml(date)}</td></tr><tr><td>Membre</td><td>${escapeHtml(fullName(m))}</td></tr><tr><td>Montant reçu</td><td class="total">${money(amount)}</td></tr><tr><td>Référence</td><td>${escapeHtml(ref||'—')}</td></tr><tr><td>Solde restant</td><td>${money(bal)}</td></tr></table><div style="margin-top:12px;font-size:12px"><b>Affectation :</b>${alloc.map(x=>`<div>${escapeHtml(x.label)} : ${money(x.amount)}</div>`).join('')}${remain>0?`<div>Excédent non affecté : ${money(remain)}</div>`:''}</div><div class="sign"><span>Signature du payeur</span><span>Signature du trésorier</span></div></div>`;
 receiptModal.classList.add('open')
}
function closeReceipt(){receiptModal.classList.remove('open')}
function printReceipt(){const w=window.open('','_blank');w.document.write('<html><head><title>Reçu CHEBSEL</title></head><body>'+document.getElementById('receiptPrint').outerHTML+'</body></html>');w.document.close();w.focus();w.print()}


function treasuryRoleAllowed(){return ['president','treasurer'].includes(currentRoleView())}
function treasuryExpenses(){const x=safeParse(EXPENSE_KEY);return Array.isArray(x)?x:[]}
function saveTreasuryExpenses(rows){localStorage.setItem(EXPENSE_KEY,JSON.stringify(rows));try{scheduleAutoCloudSync('expense-write',350)}catch(e){}}
function openTreasuryExpenses(){
 if(!treasuryRoleAllowed()){alert('Accès réservé au Trésorier et au Président.');return}
 expenseDate.value=new Date().toISOString().slice(0,10);expenseAmount.value='';expenseCategory.value='';expenseReference.value='';expenseReason.value='';expenseNotes.value='';
 treasuryExpensesView.classList.add('open');renderTreasuryExpenses()
}
function closeTreasuryExpenses(){treasuryExpensesView.classList.remove('open');refreshHome()}
function saveTreasuryExpense(){
 if(!treasuryRoleAllowed()){alert('Accès non autorisé.');return}
 const amount=Number(expenseAmount.value),reason=(expenseReason.value||'').trim(),date=expenseDate.value;
 if(!date){alert('Indiquez la date de la dépense.');return}
 if(!(amount>0)){alert('Indiquez un montant supérieur à zéro.');return}
 if(!reason){alert('Indiquez le motif de la dépense.');return}
 const rows=treasuryExpenses(),row={id:'EXP-'+Date.now().toString(36),syncId:uuidv4(),date,amount,category:(expenseCategory.value||'').trim(),reason,reference:(expenseReference.value||'').trim(),notes:(expenseNotes.value||'').trim(),createdAt:syncNowISO(),createdBy:currentUser()?.name||'',deletedAt:null};
 rows.push(row);saveTreasuryExpenses(rows);audit('Dépense enregistrée',`${date} • ${reason} • ${money(amount)}`,{entity:'expense',entityId:row.syncId,after:row});
 expenseAmount.value='';expenseCategory.value='';expenseReference.value='';expenseReason.value='';expenseNotes.value='';renderTreasuryExpenses()
}
function cancelTreasuryExpense(syncId){
 if(!treasuryRoleAllowed())return;const rows=treasuryExpenses(),x=rows.find(r=>r.syncId===syncId&&!r.deletedAt);if(!x)return;
 if(!confirm('Annuler cette dépense ? Elle restera traçable dans le journal.'))return;
 x.deletedAt=syncNowISO();x.updatedAt=syncNowISO();saveTreasuryExpenses(rows);audit('Dépense annulée',`${x.date} • ${x.reason} • ${money(x.amount)}`,{entity:'expense',entityId:x.syncId,before:{...x,deletedAt:null},after:x});renderTreasuryExpenses()
}
function renderTreasuryExpenses(){
 const rows=treasuryExpenses().filter(x=>!x.deletedAt).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.createdAt||'').localeCompare(a.createdAt||''));
 const total=rows.reduce((n,x)=>n+Number(x.amount||0),0);expenseListSummary.textContent=`${rows.length} dépense(s) • Total : ${money(total)}`;
 expenseList.innerHTML=rows.length?rows.map(x=>`<div class="memberCard"><div class="memberHead"><div><div class="memberName">${escapeHtml(x.reason||'Dépense')}</div><div class="memberMeta">${escapeHtml(x.date||'—')} ${x.category?'• '+escapeHtml(x.category):''} ${x.reference?'• Réf. '+escapeHtml(x.reference):''}</div>${x.notes?`<div class="memberMeta">${escapeHtml(x.notes)}</div>`:''}</div><span class="debtTag">${money(x.amount)}</span></div><div class="memberActions"><button class="delete" onclick="cancelTreasuryExpense('${x.syncId}')">Annuler</button></div></div>`).join(''):'<div class="empty">Aucune dépense enregistrée.</div>'
}
function treasuryIncomeRows(from,to){
 const ps=safeParse(PAYMENT_LOG_KEY)||[];return (Array.isArray(ps)?ps:[]).filter(p=>p.status!=='cancelled'&&p.date&&p.date>=from&&p.date<=to&&Number(p.amount||0)>0).map(p=>{const m=centralMembers().find(x=>x.id===p.memberId);return {date:p.date,label:fullName(m)||'Paiement',reference:p.ref||p.id||'',amount:Number(p.amount||0)}}).sort((a,b)=>a.date.localeCompare(b.date))
}
function treasuryExpenseRows(from,to){return treasuryExpenses().filter(x=>!x.deletedAt&&x.date>=from&&x.date<=to).sort((a,b)=>a.date.localeCompare(b.date))}
function openTreasuryReport(){
 if(!treasuryRoleAllowed()){alert('Accès réservé au Trésorier et au Président.');return}
 const d=new Date(),today=d.toISOString().slice(0,10),first=today.slice(0,8)+'01';treasuryReportFrom.value=first;treasuryReportTo.value=today;treasuryReportView.classList.add('open');renderTreasuryReport()
}
function closeTreasuryReport(){treasuryReportView.classList.remove('open')}
function treasuryReportData(){let from=treasuryReportFrom.value,to=treasuryReportTo.value;if(!from||!to)return null;if(from>to)[from,to]=[to,from];const income=treasuryIncomeRows(from,to),expenses=treasuryExpenseRows(from,to),totalIn=income.reduce((n,x)=>n+x.amount,0),totalOut=expenses.reduce((n,x)=>n+Number(x.amount||0),0);return {from,to,income,expenses,totalIn,totalOut,net:totalIn-totalOut}}
function renderTreasuryReport(){
 const r=treasuryReportData();if(!r){treasuryReportBody.innerHTML='<div class="empty">Choisissez une période valide.</div>';return}
 const incomeRows=r.income.length?r.income.map(x=>`<tr><td>${escapeHtml(x.date)}</td><td>${escapeHtml(x.label)}</td><td>${escapeHtml(x.reference||'—')}</td><td class="amount treasuryAmountIn">${money(x.amount)}</td></tr>`).join(''):'<tr><td colspan="4">Aucune entrée.</td></tr>';
 const expenseRows=r.expenses.length?r.expenses.map(x=>`<tr><td>${escapeHtml(x.date)}</td><td>${escapeHtml(x.reason||'Dépense')}</td><td>${escapeHtml(x.category||x.reference||'—')}</td><td class="amount treasuryAmountOut">${money(x.amount)}</td></tr>`).join(''):'<tr><td colspan="4">Aucune dépense.</td></tr>';
 treasuryReportBody.innerHTML=`<div class="profilePanel" id="treasuryReportPrintable"><h2 style="margin-top:0">Rapport financier CHEBSEL</h2><div class="memberMeta">Période : ${escapeHtml(r.from)} au ${escapeHtml(r.to)}</div><div class="treasurySummary"><div class="mini"><b class="treasuryAmountIn">${money(r.totalIn)}</b><span>Entrées</span></div><div class="mini"><b class="treasuryAmountOut">${money(r.totalOut)}</b><span>Dépenses</span></div><div class="mini"><b>${money(r.net)}</b><span>Solde net</span></div></div><h3>Entrées</h3><div class="table-wrap"><table class="treasuryTable"><thead><tr><th>Date</th><th>Source</th><th>Référence</th><th>Montant</th></tr></thead><tbody>${incomeRows}</tbody></table></div><h3 style="margin-top:18px">Dépenses</h3><div class="table-wrap"><table class="treasuryTable"><thead><tr><th>Date</th><th>Motif</th><th>Catégorie / Réf.</th><th>Montant</th></tr></thead><tbody>${expenseRows}</tbody></table></div></div>`
}
function printTreasuryReport(){renderTreasuryReport();const el=document.getElementById('treasuryReportPrintable');if(!el)return;const w=window.open('','_blank');w.document.write(`<html><head><title>Rapport financier CHEBSEL</title></head><body>${el.outerHTML}</body></html>`);w.document.close();w.focus();w.print()}
function exportTreasuryReportCSV(){
 const r=treasuryReportData();if(!r)return;const lines=[['RAPPORT FINANCIER CHEBSEL'],['Période',r.from,r.to],[],['SYNTHÈSE'],['Entrées',r.totalIn],['Dépenses',r.totalOut],['Solde net',r.net],[],['ENTRÉES'],['Date','Source','Référence','Montant'],...r.income.map(x=>[x.date,x.label,x.reference,x.amount]),[],['DÉPENSES'],['Date','Motif','Catégorie','Référence','Montant'],...r.expenses.map(x=>[x.date,x.reason,x.category||'',x.reference||'',x.amount])];
 const csv='\ufeff'+lines.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\n'),b=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`Rapport_financier_CHEBSEL_${r.from}_${r.to}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
}
async function pushCloudExpenses(org,userId){
 const rows=treasuryExpenses();if(!rows.length)return 0;const c=await getCloudClient(),payload=rows.map(x=>({id:x.syncId,organization_id:org,expense_date:x.date,amount:Number(x.amount||0),category:x.category||null,reason:x.reason||'Dépense',reference:x.reference||null,notes:x.notes||null,created_by:userId||null,updated_at:x.updatedAt||x.createdAt||syncNowISO(),deleted_at:x.deletedAt||null}));const {error}=await c.from('expenses').upsert(payload,{onConflict:'id'});if(error)throw error;return payload.length
}
async function pullCloudExpenses(org){
 const c=await getCloudClient(),{data,error}=await c.from('expenses').select('*').eq('organization_id',org);if(error)throw error;const local=treasuryExpenses(),by=new Map(local.filter(x=>x.syncId).map(x=>[x.syncId,x]));for(const r of data||[]){let x=by.get(r.id);if(!x){x={id:'EXP-'+r.id.slice(0,8),syncId:r.id};local.push(x);by.set(r.id,x)}Object.assign(x,{date:r.expense_date,amount:Number(r.amount||0),category:r.category||'',reason:r.reason||'',reference:r.reference||'',notes:r.notes||'',createdAt:r.created_at||x.createdAt||syncNowISO(),updatedAt:r.updated_at||'',deletedAt:r.deleted_at||null})}localStorage.setItem(EXPENSE_KEY,JSON.stringify(local));return (data||[]).length
}

function openDebtors(){if(!isVisitor())syncBridge();debtorsView.classList.add('open');renderDebtors()}
function closeDebtors(){debtorsView.classList.remove('open');refreshHome()}
function renderDebtors(){
 const q=(debtSearch.value||'').toLowerCase().trim(),bucket=debtAge.value;
 if(isVisitor()&&publicVisitorSnapshot()){
  let rows=(publicVisitorSnapshot().debtors||[]).map(x=>({memberId:x.member_id||'',name:x.name||'—',balance:Number(x.debt||0),days:x.oldest_date?daysOld(x.oldest_date):0,oldestDate:x.oldest_date||''}));
  rows=rows.filter(x=>(!q||x.name.toLowerCase().includes(q))&&(bucket==='all'||ageBucket(x.days)===bucket)).sort((a,b)=>b.balance-a.balance);
  debtorsList.innerHTML=rows.length?rows.map(x=>`<div class="memberCard"><div class="memberHead"><div><div class="memberName">${escapeHtml(x.name)}</div><div class="memberMeta">Dette depuis ${x.days} jour(s)</div></div><span class="debtTag">${money(x.balance)}</span></div><div class="memberActions"><button class="secondaryQuick" onclick="openVisitorDebtorProfile('${x.memberId}')">Voir fiche</button></div></div>`).join(''):'<div class="empty">Aucun débiteur dans ce filtre.</div>';return
 }
 const f=safeParse(FIN_KEY)||{},members=centralMembers();
 const rows=[];
 for(const m of members){
   const debts=(f.entries||[]).filter(e=>e.memberId===m.id&&Math.max(0,Number(e.due||0)-Number(e.paid||0))>0);
   if(!debts.length)continue;
   const balance=debts.reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0),oldest=[...debts].sort((a,b)=>(a.date||'').localeCompare(b.date||''))[0],days=daysOld(oldest.date);
   if(q&&!fullName(m).toLowerCase().includes(q))continue;if(bucket!=='all'&&ageBucket(days)!==bucket)continue;
   rows.push({m,balance,days,count:debts.length})
 }
 rows.sort((a,b)=>b.balance-a.balance);
 debtorsList.innerHTML=rows.length?rows.map(x=>`<div class="memberCard"><div class="memberHead"><div><div class="memberName">${escapeHtml(fullName(x.m))}</div><div class="memberMeta">${x.count} dette(s) • plus ancienne : ${x.days} jour(s)</div></div><span class="debtTag">${money(x.balance)}</span></div><div class="memberActions"><button class="secondaryQuick" onclick="openProfileFromDebtors('${x.m.id}')">Voir fiche</button><button class="quickBtn" onclick="openPaymentModal('${x.m.id}')">Paiement</button></div></div>`).join(''):'<div class="empty">Aucun débiteur dans ce filtre.</div>'
}
function openVisitorDebtorProfile(mid){
 const x=(publicVisitorSnapshot()?.debtors||[]).find(d=>String(d.member_id||'')===String(mid||''));if(!x)return;
 const a=x.attendance_stats||{},ah=x.attendance_history||[],fh=x.financial_history||[],ph=x.payment_history||[];
 const due=fh.reduce((t,e)=>t+Number(e.due||0),0),paid=fh.reduce((t,e)=>t+Number(e.paid||0),0),activities=Number(a.activities||0),present=Number(a.present||0),late=Number(a.late||0),absent=Number(a.absent||0),rate=activities?((present/activities)*100).toFixed(1).replace('.',',')+' %':'0,0 %';
 debtorsView.classList.remove('open');profileView.classList.add('open');
 profileBody.innerHTML=`<div class="profilePanel"><div class="profileTitle"><div><h3>${escapeHtml(x.name||'—')}</h3><div class="memberMeta">N° ${escapeHtml(x.member_no||'—')} • Fiche membre — lecture seule</div></div><span class="status ${x.active!==false?'active':''}">${x.active!==false?'Actif':'Inactif'}</span></div><div class="memberStats"><div class="mini"><b>${activities}</b><span>Activités</span></div><div class="mini"><b>${present}</b><span>Présences</span></div><div class="mini"><b>${late}</b><span>Retards</span></div><div class="mini"><b>${rate}</b><span>Taux</span></div><div class="mini"><b>${absent}</b><span>Absences</span></div><div class="mini"><b>${money(due)}</b><span>Dû</span></div><div class="mini"><b>${money(paid)}</b><span>Payé</span></div><div class="mini"><b>${money(Number(x.debt||0))}</b><span>Dette</span></div></div></div><div class="profilePanel"><h3>Historique financier</h3>${fh.length?fh.map(e=>`<div class="ledgerRow"><div><div class="ledgerMain">${escapeHtml(e.label||e.type||'Écriture')}</div><div class="ledgerMeta">${escapeHtml(e.date||'')} • Dû ${money(e.due||0)} • Payé ${money(e.paid||0)}</div></div><div>${Number(e.balance||0)>0?'<span class="debtTag">Solde '+money(e.balance)+'</span>':'<span class="paidTag">Soldé</span>'}</div></div>`).join(''):'<div class="empty">Aucune écriture financière.</div>'}</div><div class="profilePanel"><h3>Paiements enregistrés</h3>${ph.length?ph.map(e=>`<div class="ledgerRow"><div><div class="ledgerMain">${money(e.amount||0)}</div><div class="ledgerMeta">${escapeHtml(e.date||'')} ${e.receipt_number?'• Reçu '+escapeHtml(e.receipt_number):''}</div></div></div>`).join(''):'<div class="empty">Aucun paiement enregistré.</div>'}</div><div class="profilePanel"><h3>Historique de présence</h3>${ah.length?ah.map(e=>`<div class="ledgerRow"><div><div class="ledgerMain">${escapeHtml(e.activity||'Activité')}</div><div class="ledgerMeta">${escapeHtml(e.date||'')} • ${escapeHtml(({P:'Présent',RM:'Retard motivé',R:'Retard motivé',RNM:'Retard non motivé',AM:'Absence motivée',A:'Absence motivée',ANM:'Absence non motivée',ANMP:'Absence non motivée — prestation'})[String(e.status||'').toUpperCase()]||e.status||'Non renseigné')}</div></div></div>`).join(''):'<div class="empty">Aucun historique de présence.</div>'}</div>`;
}
function openProfileFromDebtors(mid){debtorsView.classList.remove('open');if(isVisitor()){openVisitorDebtorProfile(mid);return}openProfile(mid)}

function openMonthlyClose(){closeMonth.value=new Date().toISOString().slice(0,7);monthlyView.classList.add('open');renderMonthlyClose()}
function closeMonthlyClose(){monthlyView.classList.remove('open');refreshHome()}
function renderMonthlyClose(){
 const month=closeMonth.value||new Date().toISOString().slice(0,7),f=safeParse(FIN_KEY)||{},members=centralMembers(),es=(f.entries||[]).filter(e=>String(e.date||'').startsWith(month));
 const due=es.reduce((s,e)=>s+Number(e.due||0),0),paid=es.reduce((s,e)=>s+Number(e.paid||0),0),bal=es.reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0);
 let current=0,debtors=0;for(const m of members.filter(x=>x.active)){const b=es.filter(e=>e.memberId===m.id).reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0);if(b>0)debtors++;else current++}
 const closes=safeParse(CLOSE_KEY)||{},saved=closes[month];
 monthlyCloseBody.innerHTML=`<div class="profilePanel"><div class="memberStats"><div class="mini"><b>${money(due)}</b><span>Dû</span></div><div class="mini"><b>${money(paid)}</b><span>Payé</span></div><div class="mini"><b>${money(bal)}</b><span>Solde</span></div><div class="mini"><b>${due?Math.round(paid/due*100):0}%</b><span>Recouvrement</span></div><div class="mini"><b>${current}</b><span>Membres à jour</span></div><div class="mini"><b>${debtors}</b><span>Débiteurs</span></div></div>${saved?`<div class="small" style="margin-top:12px">Clôture enregistrée le ${new Date(saved.at).toLocaleString('fr-FR')} • ${escapeHtml(saved.note||'')}</div>`:''}</div>`
}
function saveMonthlyClose(){const month=closeMonth.value;if(!month)return;ensureMonthBeforeClosing(month);const closes=safeParse(CLOSE_KEY)||{};closes[month]={at:new Date().toISOString(),note:closeNote.value||''};saveJSON(CLOSE_KEY,closes);audit('Clôture mensuelle',`${month} • ${closeNote.value||'sans observation'}`);renderMonthlyClose();scheduleAutoCloudSync('cloture-mensuelle',120)}

function openAudit(){auditView.classList.add('open');renderAudit()}
function closeAudit(){auditView.classList.remove('open')}
function renderAudit(){const log=safeParse(AUDIT_KEY)||[];auditList.innerHTML=log.length?log.map(x=>`<div class="auditRow"><b>${escapeHtml(x.action)}</b><div class="memberMeta">${new Date(x.at).toLocaleString('fr-FR')} • ${escapeHtml(x.details||'')}</div></div>`).join(''):'<div class="empty">Journal vide.</div>'}
function clearAudit(){if(!confirm('Effacer le journal local ?'))return;localStorage.removeItem(AUDIT_KEY);renderAudit()}
function exportAuditCSV(){const log=safeParse(AUDIT_KEY)||[],lines=[['Date','Action','Détails'],...log.map(x=>[x.at,x.action,x.details])];const csv='\\ufeff'+lines.map(r=>r.map(v=>'\"'+String(v??'').replace(/\"/g,'\"\"')+'\"').join(';')).join('\\n');const b=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='Journal_CHEBSEL.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}



function globalBack(){
 if(treasuryExpensesView?.classList.contains('open')){closeTreasuryExpenses();return}
 if(treasuryReportView?.classList.contains('open')){closeTreasuryReport();return}
 if(settingsHub?.classList.contains('open')){closeSettingsHub();return}
 if(privacyHub?.classList.contains('open')){closePrivacyHub();return}
 if(aboutHub?.classList.contains('open')){closeAboutHub();return}
 if(receiptModal?.classList.contains('open')){closeReceipt();return}
 if(paymentModal?.classList.contains('open')){closePaymentModal();return}
 if(memberModal?.classList.contains('open')){closeMemberModal();return}
 if(cloudConfigModal?.classList.contains('open')){closeCloudConfigModal();return}
 if(recurringOverrideModal?.classList.contains('open')){closeRecurringOverrideModal();return}
 if(activityModal?.classList.contains('open')){closeActivityModal();return}
 if(paymentCorrectionModal?.classList.contains('open')){closePaymentCorrectionModal();return}
 if(restoreTestModal?.classList.contains('open')){closeRestoreTestModal();return}
 if(pinModal?.classList.contains('open')){closePinModal();return}
 if(loginModal?.classList.contains('open')){if(currentUser()||isVisitor()){closeLoginModal();return}else{history.back();return}}
 if(restoreModal?.classList.contains('open')){closeRestoreModal();return}
 if(calendarView?.classList.contains('open')){closeCalendar();return}
 if(diagnosticsView?.classList.contains('open')){closeDiagnostics();return}
 if(securityView?.classList.contains('open')){closeSecurity();return}
 if(handoverView?.classList.contains('open')){closeHandover();return}
 if(helpView?.classList.contains('open')){closeHelp();return}
 if(profileView?.classList.contains('open')){closeProfile();return}
 if(debtorsView?.classList.contains('open')){closeDebtors();return}
 if(monthlyView?.classList.contains('open')){closeMonthlyClose();return}
 if(auditView?.classList.contains('open')){closeAudit();return}
 if(membersView?.classList.contains('open')){closeMembers();return}
 if(viewer?.classList.contains('open')){closeViewer();return}
 history.back()
}

function openRestoreModal(){restoreFile.value='';restoreModal.classList.add('open')}
function closeRestoreModal(){restoreModal.classList.remove('open')}

function restorePortalBackup(){
 const file=restoreFile.files[0];
 if(!file){alert('Veuillez sélectionner un fichier JSON de sauvegarde.');return}
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const p=JSON.parse(reader.result);
   if(!p || typeof p!=='object')throw new Error('Format invalide');
   const hasMaster=Array.isArray(p.masterMembers);
   const hasAttendance=p.attendance && typeof p.attendance==='object';
   const hasFinance=p.finance && typeof p.finance==='object';
   if(!hasMaster || !hasAttendance || !hasFinance)throw new Error('Sauvegarde CHEBSEL incomplète ou incompatible');
   if(!confirm('Cette restauration remplacera les données actuelles du portail. Continuer ?'))return;
   if(!confirm('Dernière confirmation : avez-vous sauvegardé les données actuelles si nécessaire ?'))return;
   saveJSON(MASTER_KEY,p.masterMembers.map(normalizeMember));
   saveJSON(ATT_KEY,p.attendance);
   saveJSON(FIN_KEY,p.finance);
   if(Array.isArray(p.audit))saveJSON(AUDIT_KEY,p.audit);else localStorage.removeItem(AUDIT_KEY);
   if(p.monthlyClosings && typeof p.monthlyClosings==='object')saveJSON(CLOSE_KEY,p.monthlyClosings);else localStorage.removeItem(CLOSE_KEY);
   if(Array.isArray(p.expenses))localStorage.setItem(EXPENSE_KEY,JSON.stringify(p.expenses));
   localStorage.setItem(BACKUP_KEY,new Date().toISOString());
   audit('Restauration complète','Sauvegarde importée depuis '+file.name);
   syncMembersToApps();syncBridge();closeRestoreModal();refreshHome();
   alert('Restauration terminée avec succès. Les données CHEBSEL ont été rétablies.')
  }catch(err){
   alert('Impossible de restaurer ce fichier : '+err.message)
  }
 };
 reader.readAsText(file)
}

function portalBackup(){
 syncBridge();
 const payload={app:'CHEBSEL Portal Pro',version:2,exportedAt:new Date().toISOString(),group:'Chœur d’Homme de l’Église Baptiste Sel et Lumière',sigle:'CHEBSEL',masterMembers:centralMembers(),attendance:safeParse(ATT_KEY),finance:safeParse(FIN_KEY),audit:safeParse(AUDIT_KEY)||[],monthlyClosings:safeParse(CLOSE_KEY)||{},expenses:treasuryExpenses(),calendar:customActivities(),calendarOverrides:calendarOverrides(),syncReady:{schemaVersion:1,cloudConnected:false,dbName:SYNC_DB_NAME}};
 const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='Sauvegarde_CHEBSEL_Portail_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
 localStorage.setItem(BACKUP_KEY,new Date().toISOString());audit('Sauvegarde portail','Export JSON complet');refreshHome()
}
function renderBackupHealth(){
 const raw=localStorage.getItem(BACKUP_KEY);
 if(!raw){backupHealth.innerHTML='🔴 <b>Aucune sauvegarde du portail enregistrée.</b> Utilisez le bouton 💾 en haut.';return}
 const days=Math.floor((Date.now()-new Date(raw).getTime())/86400000),icon=days<=7?'🟢':days<=14?'🟠':'🔴';
 backupHealth.innerHTML=`${icon} Dernière sauvegarde du portail : <b>${new Date(raw).toLocaleString('fr-FR')}</b>${days>7?' — une nouvelle sauvegarde est recommandée.':''}`
}

function refreshHome(){
 syncBridge();const members=centralMembers(),a=safeParse(ATT_KEY)||{},f=safeParse(FIN_KEY)||{},calls=Array.isArray(a.calls)?a.calls:[],entries=Array.isArray(f.entries)?f.entries:[];
 const active=members.filter(m=>m.active).length,last=[...calls].sort((x,y)=>(y.date||'').localeCompare(x.date||''))[0];let present='—';if(last?.records)present=Object.values(last.records).filter(r=>r.status==='P').length;
 const debt=entries.reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0),auto=entries.filter(e=>e.bridgeAuto===true).length;
 renderBackupHealth();homeStats.innerHTML=[["Membres actifs",active],["Présents dernier appel",present],["Dette totale",money(debt)],["Amendes liées",auto]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')
}


const APP_VERSION='1.12.0';
const PUBLIC_SNAPSHOT_KEY='chebsel_public_snapshot_v1';
let VISITOR_PUBLIC_SYNC_RUNNING=false;
const EXPENSE_KEY='chebsel_expenses_v1';
const AUTH_KEY='chebsel_auth_v1',SESSION_KEY='chebsel_session_v1',VISITOR_KEY='chebsel_visitor_v1',PAYMENT_LOG_KEY='chebsel_payment_log_v1',REG_APPLIED_KEY='chebsel_regulation_defaults_v1';
const GLOBAL_ACCESS={president:{salt:'c9602285b2fe25e11a4a1dc8d0eb8a68',hash:'1a3f792f829c9fb9ff340777bc30bd794980fff8c84c8beb363a5a526ecb46a4',iterations:310000},secretary:{salt:'79b8172bd315e8aba8cd5a27060de4a0',hash:'226e33148f63e79800c5f8d8ab0410e20f887ce2b556dea81b6d7eeda94cdea3',iterations:310000},treasurer:{salt:'86e8d3c0386a4b60243aaef861d5728b',hash:'bd2f03dbc65ee42ea9c1df23f2dec84e0c481d799cd429e01078f40d74f1f513',iterations:310000}};
const COMMITTEE={president:{key:'president',name:'Sinsurin Jacques',role:'Administrateur / Président'},secretary:{key:'secretary',name:'Jose Sterlin',role:'Secrétaire'},treasurer:{key:'treasurer',name:'Chery Agnace',role:'Trésorier'}};
const PERMISSIONS={president:['members.write','members.delete','attendance.write','finance.write','finance.payment','month.close','month.reopen','restore','audit.clear','security.manage'],secretary:['members.write','attendance.write'],treasurer:['finance.write','finance.payment','month.close']};
function getAuth(){
 let a=safeParse(AUTH_KEY);
 if(!a||typeof a!=='object')a={version:1,users:{}};
 if(!a.users||typeof a.users!=='object')a.users={};
 for(const [k,p] of Object.entries(COMMITTEE)){
   const old=a.users[k]||{};
   a.users[k]={...p,pinHash:old.pinHash||'',salt:old.salt||'',configuredAt:old.configuredAt||''};
 }
 a.version=1;saveJSON(AUTH_KEY,a);return a
}
function currentSession(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
function isVisitor(){return sessionStorage.getItem(VISITOR_KEY)==='1'}

// =======================
// CHEBSEL v1.4 Sync-Ready
// =======================
var SYNC_DB_NAME='chebsel_sync_ready_v1';
var SYNC_DB_VERSION=1;
var SYNC_META_KEY='chebsel_sync_ready_meta_v1';
var SYNC_TRACKED_KEYS=new Set([
 MASTER_KEY,ATT_KEY,FIN_KEY,PAYMENT_LOG_KEY,AUDIT_KEY,CLOSE_KEY,CALENDAR_KEY,CALENDAR_OVERRIDE_KEY
]);
var SYNC_DB=null;
var SYNC_READY_BOOTING=true;
var SYNC_RECONCILE_TIMER=null;
var SYNC_QUEUE_VISIBLE=false;

function uuidv4(){
 if(globalThis.crypto?.randomUUID)return crypto.randomUUID();
 const a=crypto?.getRandomValues?crypto.getRandomValues(new Uint8Array(16)):Array.from({length:16},()=>Math.floor(Math.random()*256));
 a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
 const h=[...a].map(x=>x.toString(16).padStart(2,'0')).join('');
 return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`
}
function syncNowISO(){return new Date().toISOString()}
function syncComparable(obj){
 const c=JSON.parse(JSON.stringify(obj||{}));
 delete c._syncStatus;delete c._localUpdatedAt;delete c._serverUpdatedAt;delete c._version;delete c._deletedAt;
 return JSON.stringify(c)
}
function syncDBOpen(){
 if(SYNC_DB)return Promise.resolve(SYNC_DB);
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(SYNC_DB_NAME,SYNC_DB_VERSION);
  req.onupgradeneeded=()=>{
   const db=req.result;
   const defs=[
    ['members','syncId'],['attendance_events','syncId'],['attendance_records','syncId'],
    ['financial_entries','syncId'],['payments','syncId'],['payment_allocations','syncId'],
    ['calendar_events','syncId'],['calendar_overrides','syncId'],['monthly_closings','syncId'],
    ['audit_logs','syncId'],['outbox','id'],['conflicts','id'],['meta','key'],['devices','id']
   ];
   for(const [name,keyPath] of defs){
    if(!db.objectStoreNames.contains(name)){
     const s=db.createObjectStore(name,{keyPath});
     if(name==='outbox'){
      s.createIndex('status','status',{unique:false});
      s.createIndex('entity','entity',{unique:false});
     }
     if(name==='conflicts')s.createIndex('status','status',{unique:false});
    }
   }
  };
  req.onsuccess=()=>{SYNC_DB=req.result;resolve(SYNC_DB)};
  req.onerror=()=>reject(req.error)
 })
}
async function idbAll(store){
 const db=await syncDBOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,'readonly'),req=tx.objectStore(store).getAll();
  req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)
 })
}
async function idbGet(store,key){
 const db=await syncDBOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,'readonly'),req=tx.objectStore(store).get(key);
  req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)
 })
}
async function idbPut(store,value){
 const db=await syncDBOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);
  tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error)
 })
}
async function idbDelete(store,key){
 const db=await syncDBOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(key);
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)
 })
}
async function idbCountByStatus(store,status){
 const db=await syncDBOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,'readonly'),s=tx.objectStore(store);
  if(!s.indexNames.contains('status')){const r=s.count();r.onsuccess=()=>resolve(r.result||0);r.onerror=()=>reject(r.error);return}
  const r=s.index('status').count(IDBKeyRange.only(status));
  r.onsuccess=()=>resolve(r.result||0);r.onerror=()=>reject(r.error)
 })
}
function ensureSyncId(obj,prefix='rec'){
 if(!obj.syncId)obj.syncId=uuidv4();
 return obj.syncId
}
function syncLegacyMigrateIds(){
 // Keep legacy IDs for current app references, add stable syncId for future cloud records.
 const members=safeParse(MASTER_KEY);
 if(Array.isArray(members)){
  let changed=false;for(const m of members){if(!m.syncId){m.syncId=uuidv4();changed=true}}
  if(changed)localStorage.setItem(MASTER_KEY,JSON.stringify(members))
 }
 const a=safeParse(ATT_KEY);
 if(a&&Array.isArray(a.calls)){
  let changed=false;
  for(const c of a.calls){
   if(!c.syncId){c.syncId=uuidv4();changed=true}
   if(c.records)for(const [mid,r] of Object.entries(c.records)){if(r&&!r.syncId){r.syncId=uuidv4();changed=true}}
  }
  if(changed)localStorage.setItem(ATT_KEY,JSON.stringify(a))
 }
 const f=safeParse(FIN_KEY);
 if(f&&Array.isArray(f.entries)){
  let changed=false;for(const e of f.entries){if(!e.syncId){e.syncId=uuidv4();changed=true}}
  if(changed)localStorage.setItem(FIN_KEY,JSON.stringify(f))
 }
 const p=safeParse(PAYMENT_LOG_KEY);
 if(Array.isArray(p)){
  let changed=false;
  for(const x of p){
   if(!x.syncId){x.syncId=uuidv4();changed=true}
   for(const al of x.alloc||[]){if(!al.syncId){al.syncId=uuidv4();changed=true}}
  }
  if(changed)localStorage.setItem(PAYMENT_LOG_KEY,JSON.stringify(p))
 }
 const cal=safeParse(CALENDAR_KEY);
 if(Array.isArray(cal)){
  let changed=false;for(const e of cal){if(!e.syncId){e.syncId=uuidv4();changed=true}}
  if(changed)localStorage.setItem(CALENDAR_KEY,JSON.stringify(cal))
 }
 const ov=safeParse(CALENDAR_OVERRIDE_KEY);
 if(ov&&typeof ov==='object'){
  let changed=false;for(const v of Object.values(ov)){if(v&&!v.syncId){v.syncId=uuidv4();changed=true}}
  if(changed)localStorage.setItem(CALENDAR_OVERRIDE_KEY,JSON.stringify(ov))
 }
}
function syncSourceRecords(){
 const members=(safeParse(MASTER_KEY)||[]).map(m=>({...m,syncId:m.syncId||uuidv4()}));
 const a=safeParse(ATT_KEY)||{}, calls=Array.isArray(a.calls)?a.calls:[];
 const attendance_events=[],attendance_records=[];
 for(const c0 of calls){
  const c={...c0};const records=c.records||{};delete c.records;
  c.syncId=c.syncId||uuidv4();attendance_events.push(c);
  for(const [memberId,r0] of Object.entries(records)){
   if(!r0)continue;
   attendance_records.push({...r0,syncId:r0.syncId||uuidv4(),attendanceEventSyncId:c.syncId,legacyEventId:c0.id||'',memberId})
  }
 }
 const f=safeParse(FIN_KEY)||{},financial_entries=(Array.isArray(f.entries)?f.entries:[]).map(e=>({...e,syncId:e.syncId||uuidv4()}));
 const payments=(safeParse(PAYMENT_LOG_KEY)||[]).map(p=>({...p,syncId:p.syncId||uuidv4()}));
 const payment_allocations=[];
 for(const p of payments)for(const al of p.alloc||[])payment_allocations.push({...al,syncId:al.syncId||uuidv4(),paymentSyncId:p.syncId,paymentLegacyId:p.id||''});
 const calendar_events=(safeParse(CALENDAR_KEY)||[]).map(e=>({...e,syncId:e.syncId||uuidv4()}));
 const ovs=safeParse(CALENDAR_OVERRIDE_KEY)||{},calendar_overrides=Object.entries(ovs).map(([eventId,o])=>({...o,syncId:o.syncId||uuidv4(),eventId}));
 const cls=safeParse(CLOSE_KEY)||{},monthly_closings=Object.entries(cls).map(([month,v])=>({...(v&&typeof v==='object'?v:{value:v}),syncId:(v&&v.syncId)||`close-${month}`,month}));
 const audit_logs=(safeParse(AUDIT_KEY)||[]).map(x=>({...x,syncId:x.syncId||x.id||uuidv4()}));
 return {members,attendance_events,attendance_records,financial_entries,payments,payment_allocations,calendar_events,calendar_overrides,monthly_closings,audit_logs}
}
async function queueOutbox(entity,entityId,operation,payload){
 if(SYNC_READY_BOOTING)return;
 const id=`${entity}:${entityId}`;
 const prev=await idbGet('outbox',id);
 await idbPut('outbox',{
  id,operationId:prev?.operationId||uuidv4(),entity,entityId,operation,payload,
  status:'pending',retryCount:prev?.retryCount||0,createdAt:prev?.createdAt||syncNowISO(),updatedAt:syncNowISO()
 });
}
async function mirrorStore(storeName,records,enqueueChanges=false){
 const current=await idbAll(storeName),existing=new Map(current.map(x=>[x.syncId,x])),incoming=new Map(records.map(x=>[x.syncId,x]));
 for(const rec of records){
  const old=existing.get(rec.syncId);
  const changed=!old||syncComparable(old)!==syncComparable(rec);
  const next={...rec,_syncStatus:changed&&enqueueChanges?'pending':(old?old._syncStatus||'synced':'synced'),_localUpdatedAt:changed?syncNowISO():(old?old._localUpdatedAt||syncNowISO():syncNowISO()),_serverUpdatedAt:old?old._serverUpdatedAt||null:null,_version:(old?Number(old._version||0):0)+(changed&&enqueueChanges?1:0),_deletedAt:null};
  await idbPut(storeName,next);
  if(changed&&enqueueChanges)await queueOutbox(storeName,rec.syncId,'UPSERT',rec)
 }
 for(const [id,old] of existing){
  if(!incoming.has(id)&&!old._deletedAt){
   const tomb={...old,_syncStatus:enqueueChanges?'pending':'synced',_deletedAt:syncNowISO(),_localUpdatedAt:syncNowISO(),_version:Number(old._version||0)+(enqueueChanges?1:0)};
   await idbPut(storeName,tomb);
   if(enqueueChanges)await queueOutbox(storeName,id,'DELETE',{syncId:id,_deletedAt:tomb._deletedAt})
  }
 }
}
async function syncReadyReconcile(enqueueChanges=true){
 try{
  await syncDBOpen();
  if(!SYNC_READY_BOOTING)document.getElementById('syncReadyState')&&(syncReadyState.textContent='Préparation…');
  const all=syncSourceRecords();
  for(const [store,records] of Object.entries(all))await mirrorStore(store,records,enqueueChanges);
  const meta={key:'state',schemaVersion:1,appVersion:APP_VERSION,lastPreparedAt:syncNowISO(),cloudConnected:false};
  await idbPut('meta',meta);
  await updateSyncReadyUI();
  return true
 }catch(err){
  console.error('Sync-ready reconcile',err);
  const el=document.getElementById('syncReadyState');if(el)el.textContent='Erreur locale';
  return false
 }
}
function syncReadySchedule(){
 clearTimeout(SYNC_RECONCILE_TIMER);
 SYNC_RECONCILE_TIMER=setTimeout(()=>syncReadyReconcilePilot(true),350)
}
function syncReadyOnLocalWrite(k,v){
 if(SYNC_TRACKED_KEYS.has(k)&&!SYNC_READY_BOOTING){syncReadySchedule();scheduleAutoCloudSync('local-write')}
}
async function updateSyncReadyUI(){
 if(!document.getElementById('syncReadyPanel'))return;
 try{
  await syncDBOpen();
  const pending=(await idbAll('outbox')).filter(x=>x.status==='pending'&&['members','calendar_events'].includes(x.entity)).length,conflicts=await idbCountByStatus('conflicts','open'),meta=await idbGet('meta','state');
  syncOnlineState.textContent=navigator.onLine?'🟢 En ligne':'🔴 Hors connexion';
  syncPendingCount.textContent=String(pending);
  syncConflictCount.textContent=String(conflicts);
  syncLastPrepared.textContent=meta?.lastPreparedAt?new Date(meta.lastPreparedAt).toLocaleString('fr-FR'):'—';
  syncReadyState.textContent=pending?`🟡 ${pending} en attente`:'🟢 Base locale prête';
  if(SYNC_QUEUE_VISIBLE)await renderSyncQueue()
 }catch(e){syncReadyState.textContent='⚠ IndexedDB indisponible'}
}
async function renderSyncQueue(){
 const rows=(await idbAll('outbox')).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
 syncQueueList.innerHTML=rows.length?rows.slice(0,100).map(x=>`<div class="syncQueueRow"><b>${escapeHtml(x.operation)} • ${escapeHtml(x.entity)}</b><div class="memberMeta">${escapeHtml(x.entityId)} • ${escapeHtml(x.status)} • ${x.updatedAt?new Date(x.updatedAt).toLocaleString('fr-FR'):''}</div></div>`).join(''):'<div class="empty">Aucune modification locale en attente.</div>'
}
async function toggleSyncQueue(){
 SYNC_QUEUE_VISIBLE=!SYNC_QUEUE_VISIBLE;syncQueueList.style.display=SYNC_QUEUE_VISIBLE?'block':'none';
 if(SYNC_QUEUE_VISIBLE)await renderSyncQueue()
}
async function exportSyncReadyDiagnostic(){
 await syncReadyReconcile(true);
 const stores=['members','attendance_events','attendance_records','financial_entries','payments','payment_allocations','calendar_events','calendar_overrides','monthly_closings','audit_logs','outbox','conflicts','meta'];
 const counts={};for(const s of stores)counts[s]=(await idbAll(s)).length;
 const pending=(await idbAll('outbox')).filter(x=>x.status==='pending');
 const payload={app:'CHEBSEL',version:APP_VERSION,mode:'sync-ready-local-only',exportedAt:syncNowISO(),online:navigator.onLine,counts,pendingOperations:pending.map(x=>({operationId:x.operationId,entity:x.entity,entityId:x.entityId,operation:x.operation,status:x.status,updatedAt:x.updatedAt}))};
 const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`Diagnostic_SyncReady_CHEBSEL_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
}
async function initSyncReady(){
 try{
  await syncDBOpen();
  syncLegacyMigrateIds();
  // First migration is a clean baseline: existing data are mirrored but not queued for upload.
  const first=!(await idbGet('meta','state'));
  await syncReadyReconcile(!first);
  SYNC_READY_BOOTING=false;
  if(first){
   await idbPut('meta',{key:'state',schemaVersion:1,appVersion:APP_VERSION,lastPreparedAt:syncNowISO(),cloudConnected:false,migratedFrom:'localStorage'});
  }
  await updateSyncReadyUI()
 }catch(e){SYNC_READY_BOOTING=false;console.error(e);updateSyncReadyUI()}
}
window.addEventListener('online',()=>{updateSyncReadyUI();syncReadyReconcile(true)});
window.addEventListener('offline',updateSyncReadyUI);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncReadyReconcile(true)});
setInterval(()=>{if(!SYNC_READY_BOOTING)syncReadyReconcile(true)},15000);


var CLOUD_CONFIG_KEY='chebsel_cloud_config_v1',CLOUD_META_KEY='chebsel_cloud_meta_v1';
var CLOUD_DEFAULT_URL="https://obgpocmsmtlpvfwblqvi.supabase.co";
var CLOUD_DEFAULT_PUBLISHABLE_KEY="sb_publishable_-EcBi0HIvojuaEuzqvORRA_xwAnRFYV";
var CLOUD_CLIENT=null,CLOUD_SDK_LOADING=null;
function getCloudConfig(){const x=safeParse(CLOUD_CONFIG_KEY),c=x&&typeof x==='object'?x:{};return {url:c.url||CLOUD_DEFAULT_URL,anonKey:c.anonKey||CLOUD_DEFAULT_PUBLISHABLE_KEY,email:c.email||'',configuredAt:c.configuredAt||''}}
function cloudConfigured(){const c=getCloudConfig();return !!(c.url&&c.anonKey)}
async function loadSupabaseSDK(){if(globalThis.supabase?.createClient)return globalThis.supabase;if(CLOUD_SDK_LOADING)return CLOUD_SDK_LOADING;CLOUD_SDK_LOADING=new Promise((resolve,reject)=>{if(!navigator.onLine){reject(new Error('Internet requis pour charger Supabase la première fois.'));return}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.onload=()=>resolve(globalThis.supabase);s.onerror=()=>reject(new Error('Impossible de charger supabase-js.'));document.head.appendChild(s)});return CLOUD_SDK_LOADING}
async function getCloudClient(){if(CLOUD_CLIENT)return CLOUD_CLIENT;if(!cloudConfigured())throw new Error('CHEBSEL Cloud n’est pas configuré.');const sdk=await loadSupabaseSDK(),c=getCloudConfig();CLOUD_CLIENT=sdk.createClient(c.url,c.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return CLOUD_CLIENT}
function publicVisitorSnapshot(){const x=safeParse(PUBLIC_SNAPSHOT_KEY);return x&&typeof x==='object'?x:null}
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
function cloudEl(id){return document.getElementById(id)}
function openCloudConfigModal(){if(isVisitor()){alert('Accès réservé aux responsables.');return}try{const modal=cloudEl('cloudConfigModal'),urlEl=cloudEl('cloudUrl'),keyEl=cloudEl('cloudAnonKey'),emailEl=cloudEl('cloudEmail'),passEl=cloudEl('cloudPassword');if(!modal||!urlEl||!keyEl||!emailEl||!passEl)throw new Error('Formulaire Cloud introuvable dans cette version.');const c=getCloudConfig();urlEl.value=c.url||'';keyEl.value=c.anonKey||'';emailEl.value=c.email||'';passEl.value='';modal.classList.add('open')}catch(e){alert('Impossible d’ouvrir la configuration Cloud : '+e.message)}}
function closeCloudConfigModal(){const modal=cloudEl('cloudConfigModal');if(modal)modal.classList.remove('open')}
function saveCloudConfig(){if(!requirePermission('security.manage'))return;const urlEl=cloudEl('cloudUrl'),keyEl=cloudEl('cloudAnonKey'),emailEl=cloudEl('cloudEmail');if(!urlEl||!keyEl||!emailEl){alert('Formulaire Cloud introuvable.');return}const url=(urlEl.value||'').trim(),anonKey=(keyEl.value||'').trim(),email=(emailEl.value||'').trim();if(!url||!anonKey){alert('URL Supabase et clé publique obligatoires.');return}saveJSON(CLOUD_CONFIG_KEY,{url,anonKey,email,configuredAt:syncNowISO()});CLOUD_CLIENT=null;closeCloudConfigModal();updateCloudUI();audit('Configuration cloud mise à jour','Supabase configuré localement',{entity:'cloud_config'})}
async function cloudSessionInfo(){if(!cloudConfigured())return null;try{const c=await getCloudClient(),{data}=await c.auth.getSession();return data?.session||null}catch(e){return null}}
const CLOUD_AUTHORIZED_EMAILS=new Set(['presidanchebsel@outlook.fr','secretairechebsel@gmail.com','tresorierdugroupe@outlook.com']);
function saveCloudEmail(email){const c=getCloudConfig();saveJSON(CLOUD_CONFIG_KEY,{url:c.url,anonKey:c.anonKey,email:(email||'').trim().toLowerCase(),configuredAt:syncNowISO()})}
async function ensureAuthorizedCloudProfile(){const c=await getCloudClient(),s=await cloudSessionInfo();if(!s)throw new Error('Connexion cloud requise.');const {data:existing}=await c.from('user_profiles').select('auth_user_id,organization_id,role,active').eq('auth_user_id',s.user.id).maybeSingle();if(existing?.active)return existing;const {data,error}=await c.rpc('activate_authorized_account');if(error)throw error;return data}
async function cloudSignUp(){if(isVisitor()){alert('Accès réservé aux responsables.');return}try{const cfg=getCloudConfig();const email=(prompt('Email officiel CHEBSEL à activer :',(cfg.email||'').trim())||'').trim().toLowerCase();if(!email)return;if(!CLOUD_AUTHORIZED_EMAILS.has(email))throw new Error('Cet email ne fait pas partie des trois comptes CHEBSEL autorisés.');const password=prompt('Choisissez votre mot de passe CHEBSEL Cloud (8 caractères minimum) :')||'';if(password.length<8)throw new Error('Le mot de passe doit contenir au moins 8 caractères.');const confirm=prompt('Confirmez le même mot de passe :')||'';if(password!==confirm)throw new Error('Les deux mots de passe ne correspondent pas.');saveCloudEmail(email);const c=await getCloudClient(),{data,error}=await c.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;if(data?.session){await ensureAuthorizedCloudProfile();await registerCloudDevice();saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),signedInAt:syncNowISO(),userId:data.user?.id||''});await updateCloudUI();alert('Compte CHEBSEL Cloud activé et connecté.')}else{await updateCloudUI();alert('Compte créé. Vérifiez la boîte email de '+email+' pour confirmer l’adresse, puis revenez dans CHEBSEL et appuyez sur « Connexion cloud ».')}}catch(e){alert('Activation du compte impossible : '+e.message);updateCloudUI()}}
async function cloudSignIn(){if(isVisitor()){alert('Accès réservé aux responsables.');return}try{const cfg=getCloudConfig();if(!cfg.url||!cfg.anonKey){openCloudConfigModal();return}const email=(prompt('Email CHEBSEL Cloud :',(cfg.email||'').trim())||'').trim().toLowerCase();if(!email)return;const password=prompt('Mot de passe Supabase pour '+email+':')||'';if(!password)return;saveCloudEmail(email);const c=await getCloudClient(),{data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;const profile=await ensureAuthorizedCloudProfile();saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),signedInAt:syncNowISO(),userId:data.user?.id||'',role:profile?.role||'',deviceBoundRole:profile?.role||'',deviceBoundAt:syncNowISO()});await registerCloudDevice();updateCloudUI();alert('Connexion CHEBSEL Cloud réussie — rôle : '+(profile?.role||'responsable')+'.')}catch(e){alert('Connexion cloud impossible : '+e.message);updateCloudUI()}}
async function cloudSignOut(){try{if(CLOUD_CLIENT)await CLOUD_CLIENT.auth.signOut();CLOUD_CLIENT=null;updateCloudUI()}catch(e){alert(e.message)}}
async function registerCloudDevice(){try{const c=await getCloudClient(),session=await cloudSessionInfo();if(!session)return;let id=localStorage.getItem('chebsel_device_id_v1');if(!id){id=uuidv4();localStorage.setItem('chebsel_device_id_v1',id)}const {error}=await c.from('devices').upsert({id,auth_user_id:session.user.id,device_name:navigator.userAgent.slice(0,180),platform:navigator.platform||'',last_seen_at:syncNowISO(),active:true},{onConflict:'id'});if(error)throw error}catch(e){console.warn(e)}}
async function getCloudProfile(){const c=await getCloudClient(),s=await cloudSessionInfo();if(!s)throw new Error('Connexion cloud requise.');const {data,error}=await c.from('user_profiles').select('auth_user_id,organization_id,role,active').eq('auth_user_id',s.user.id).single();if(error)throw error;if(!data?.active)throw new Error('Compte cloud inactif.');return data}
function cloudMemberPayload(m,org){return {id:m.syncId,organization_id:org,legacy_id:m.id||null,member_no:m.no||null,first_name:m.first||'',last_name:m.last||'',phone:m.phone||null,active:m.active!==false,notes:m.note||null,contribution_start_month:m.contributionStartMonth||null,updated_at:syncNowISO(),deleted_at:m._deletedAt||null}}
function cloudCalendarPayload(e,org){return {id:e.syncId,organization_id:org,legacy_id:e.id||null,title:e.title||'',event_date:e.date||null,start_time:e.time||null,location:e.location||null,event_type:'custom',status:e.status||'scheduled',reason:e.note||null,updated_at:syncNowISO(),deleted_at:e._deletedAt||null}}
async function alignCloudMemberIds(org){
 const c=await getCloudClient(),{data,error}=await c.from('members').select('id,legacy_id').eq('organization_id',org).is('deleted_at',null);
 if(error)throw error;
 const byLegacy=new Map((data||[]).filter(x=>x.legacy_id).map(x=>[String(x.legacy_id),x.id]));
 const local=centralMembers();let changed=0;
 for(const m of local){const cloudId=byLegacy.get(String(m.id||''));if(cloudId&&m.syncId!==cloudId){m.syncId=cloudId;changed++}}
 if(changed){localStorage.setItem(MASTER_KEY,JSON.stringify(local));syncMembersToApps();await syncReadyReconcilePilot(false)}
 return changed
}
async function pushPilotEntity(store,table,payloadFn,org){const rows=(await idbAll(store)).filter(x=>!x._deletedAt);if(!rows.length)return 0;const c=await getCloudClient(),{error}=await c.from(table).upsert(rows.map(x=>payloadFn(x,org)),{onConflict:'id'});if(error)throw error;return rows.length}
async function pullCloudMembers(org){const c=await getCloudClient(),{data,error}=await c.from('members').select('*').eq('organization_id',org).is('deleted_at',null);if(error)throw error;const local=centralMembers(),bySync=new Map(local.filter(x=>x.syncId).map(x=>[x.syncId,x])),byLegacy=new Map(local.filter(x=>x.id).map(x=>[String(x.id),x]));let changed=false;for(const r of data||[]){const cur=(r.legacy_id&&byLegacy.get(String(r.legacy_id)))||bySync.get(r.id);if(cur){Object.assign(cur,{syncId:r.id,no:r.member_no||cur.no,first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',contributionStartMonth:r.contribution_start_month||cur.contributionStartMonth||'',_serverUpdatedAt:r.updated_at});changed=true}else{const n={id:r.legacy_id||('cloud_'+r.id.slice(0,8)),syncId:r.id,no:r.member_no||'',first:r.first_name||'',last:r.last_name||'',phone:r.phone||'',active:r.active!==false,note:r.notes||'',contributionStartMonth:r.contribution_start_month||'',category:'Membre',group:'Chœur d’Homme',_serverUpdatedAt:r.updated_at};local.push(n);bySync.set(r.id,n);if(r.legacy_id)byLegacy.set(String(r.legacy_id),n);changed=true}}const seenSync=new Set(),seenId=new Set(),clean=[];for(const x of local){const sid=x.syncId||'',lid=String(x.id||'');if((sid&&seenSync.has(sid))||(lid&&seenId.has(lid)))continue;if(sid)seenSync.add(sid);if(lid)seenId.add(lid);clean.push(x)}if(clean.length!==local.length)changed=true;if(changed){localStorage.setItem(MASTER_KEY,JSON.stringify(clean));syncMembersToApps()}return (data||[]).length}
async function pullCloudCalendar(org){const c=await getCloudClient(),{data,error}=await c.from('calendar_events').select('*').eq('organization_id',org).is('deleted_at',null);if(error)throw error;const local=customActivities(),bySync=new Map(local.filter(x=>x.syncId).map(x=>[x.syncId,x])),byLegacy=new Map(local.filter(x=>x.id).map(x=>[String(x.id),x]));let changed=false;for(const r of data||[]){const cur=(r.legacy_id&&byLegacy.get(String(r.legacy_id)))||bySync.get(r.id);if(cur){Object.assign(cur,{syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',_serverUpdatedAt:r.updated_at});changed=true}else{const n={id:r.legacy_id||('cloud_'+r.id.slice(0,8)),syncId:r.id,title:r.title||'',date:r.event_date||'',time:r.start_time||'',location:r.location||'',status:r.status||'active',note:r.reason||'',auto:false,_serverUpdatedAt:r.updated_at};local.push(n);bySync.set(r.id,n);if(r.legacy_id)byLegacy.set(String(r.legacy_id),n);changed=true}}const seenSync=new Set(),seenId=new Set(),clean=[];for(const x of local){const sid=x.syncId||'',lid=String(x.id||'');if((sid&&seenSync.has(sid))||(lid&&seenId.has(lid)))continue;if(sid)seenSync.add(sid);if(lid)seenId.add(lid);clean.push(x)}if(clean.length!==local.length)changed=true;if(changed)localStorage.setItem(CALENDAR_KEY,JSON.stringify(clean));return (data||[]).length}

function canonicalV159Members(){
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
 const cancelledPaymentIds=payments.filter(p=>p.syncId&&p.status==='cancelled').map(p=>p.syncId);
 if(cancelledPaymentIds.length){const {error}=await client.from('payment_allocations').delete().in('payment_id',cancelledPaymentIds);if(error)throw error}
 const allocRows=[];
 for(const p of payments){if(!p.syncId||p.status==='cancelled')continue;for(const al of p.alloc||[]){const e=entryByLegacy.get(String(al.entryId||''));if(!e||!e.syncId||Number(al.amount||0)<=0)continue;allocRows.push({id:al.syncId,organization_id:org,payment_id:p.syncId,financial_entry_id:e.syncId,amount:Number(al.amount||0)})}}
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
 const activePaymentIds=new Set((payments||[]).filter(p=>p.status!=='cancelled').map(p=>p.id));const paidByEntry=new Map();for(const a of allocs||[]){if(!activePaymentIds.has(a.payment_id))continue;paidByEntry.set(a.financial_entry_id,(paidByEntry.get(a.financial_entry_id)||0)+Number(a.amount||0))}
 const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const bySync=new Map(f.entries.filter(x=>x.syncId).map(x=>[x.syncId,x]));const byMonthly=new Map(f.entries.filter(x=>isMonthlyEntry(x)).map(x=>[String(x.memberId||'')+'|'+String(entryMonth(x)||''),x]));
 for(const r of entries||[]){const legacyMember=maps.byCloud.get(r.member_id);if(!legacyMember)continue;let e=bySync.get(r.id);const monthlyKey=String(legacyMember)+'|'+String(r.month_reference||'');if(!e&&r.entry_type==='monthly'&&r.month_reference)e=byMonthly.get(monthlyKey);if(!e){e={id:'cloudfin_'+r.id.slice(0,8),memberId:legacyMember};f.entries.push(e)}e.syncId=r.id;bySync.set(r.id,e);if(r.entry_type==='monthly'&&r.month_reference)byMonthly.set(monthlyKey,e);Object.assign(e,{memberId:legacyMember,type:r.entry_type||'other',typeLabel:r.description||r.entry_type||'Écriture',due:Number(r.due_amount||0),paid:Number(paidByEntry.get(r.id)||0),date:r.entry_date||'',sourceMonth:r.month_reference||e.sourceMonth||'',note:r.description||'',updatedAt:r.updated_at||syncNowISO()})}
 const seenMonthly=new Set();f.entries=f.entries.filter(e=>{if(!isMonthlyEntry(e))return true;const k=String(e.memberId||'')+'|'+String(entryMonth(e)||'');if(seenMonthly.has(k))return false;seenMonthly.add(k);return true});
 localStorage.setItem(FIN_KEY,JSON.stringify(f));
 const localP=safeParse(PAYMENT_LOG_KEY)||[],pBySync=new Map((Array.isArray(localP)?localP:[]).filter(x=>x.syncId).map(x=>[x.syncId,x])),entryLegacyByCloud=new Map(f.entries.filter(x=>x.syncId).map(x=>[x.syncId,x.id]));
 for(const r of payments||[]){const legacyMember=maps.byCloud.get(r.member_id);if(!legacyMember)continue;let p=pBySync.get(r.id);if(!p){p={id:r.receipt_number||('cloudpay_'+r.id.slice(0,8)),syncId:r.id,memberId:legacyMember,alloc:[]};localP.push(p);pBySync.set(r.id,p)}Object.assign(p,{memberId:legacyMember,date:r.payment_date||'',amount:Number(r.amount||0),ref:r.reference||'',status:r.status||'posted',at:r.created_at||syncNowISO()});p.alloc=(allocs||[]).filter(a=>a.payment_id===r.id).map(a=>({syncId:a.id,entryId:entryLegacyByCloud.get(a.financial_entry_id)||'',amount:Number(a.amount||0)}))}
 localStorage.setItem(PAYMENT_LOG_KEY,JSON.stringify(localP));
 const cls=safeParse(CLOSE_KEY)||{};for(const r of closings||[]){const old=cls[r.month_reference]||{};cls[r.month_reference]={...old,syncId:r.id,at:r.closed_at,note:r.notes||'',locked:!r.reopened_at,by:old.by||'Cloud'}}localStorage.setItem(CLOSE_KEY,JSON.stringify(cls));
 syncBridge();
 return {entries:(entries||[]).length,payments:(payments||[]).length,allocations:(allocs||[]).length,closings:(closings||[]).length}
}

async function cloudPilotSync(silent=false){
 if(isVisitor()){if(!silent)alert('Accès réservé aux responsables.');return false}
 if(!navigator.onLine){if(!silent)alert('Pas d’Internet. Les modifications restent locales.');return false}
 try{
  cloudState.textContent='Préparation locale…';
  await repairV159LocalState();
  ensureAttendancePersistentSyncIds();
  cloudState.textContent='Vérification du profil…';
  const p=await getCloudProfile(),org=p.organization_id,userId=p.auth_user_id;
  cloudState.textContent='Alignement des identifiants membres…';
  await alignCloudMemberIds(org);
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
  cloudState.textContent='Réception des finances…';
  const rfBefore=await pullCloudFinance(org);
  let pf={entries:0,payments:0,allocations:0,closings:0};
  if(['president','treasurer'].includes(p.role)){
   cloudState.textContent='Envoi des finances…';
   pf=await pushCloudFinance(org,userId);
  }
  cloudState.textContent='Vérification des finances…';
  const rf=await pullCloudFinance(org);
  await syncReadyReconcilePilot(false);
  const out=await idbAll('outbox');
  for(const op of out){if(['members','calendar_events','attendance_events','attendance_records','financial_entries','payments','payment_allocations','monthly_closings'].includes(op.entity)&&op.status==='pending'){op.status='synced';op.syncedAt=syncNowISO();await idbPut('outbox',op)}}
  saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),lastSyncAt:syncNowISO(),lastSummary:{pm,pc,rm,rc,attendancePush:pa,attendancePull:ra,financePush:pf,financePullBefore:rfBefore,financePull:rf}});
  refreshHome();await updateCloudUI();await updateSyncReadyUI();
  cloudState.textContent='🟢 Synchronisé';
  if(!silent)alert(`Synchronisation terminée. Membres: ${rm}. Calendrier: ${rc}. Appels cloud: ${ra.events}; présences cloud: ${ra.records}. Finances cloud APRÈS sync: ${rf.entries} écriture(s)/dette(s), ${rf.payments} paiement(s), ${rf.allocations} allocation(s), ${rf.closings} clôture(s). Envoyés: ${pa.events} appel(s), ${pa.records} présence(s), ${pf.entries} écriture(s), ${pf.payments} paiement(s), ${pf.allocations} allocation(s), ${pf.closings} clôture(s).`);
  return true
 }catch(e){
  cloudState.textContent='🔴 Erreur de synchronisation';
  if(!silent)alert('Synchronisation cloud impossible : '+e.message);else console.warn('Synchronisation cloud impossible :',e);
  updateCloudUI();return false
 }
}

async function updateCloudUI(){if(!document.getElementById('cloudFoundationPanel'))return;const cfg=cloudConfigured(),meta=safeParse(CLOUD_META_KEY)||{},session=cfg?await cloudSessionInfo():null;cloudState.textContent=!cfg?'⚪ Non configuré':(!navigator.onLine?'🔴 Hors connexion':(session?'🟢 Connecté':'🟡 Configuré'));cloudSession.textContent=session?(session.user?.email||'Session active'):'Aucune';cloudLastSync.textContent=meta.lastSyncAt?new Date(meta.lastSyncAt).toLocaleString('fr-FR'):'—'}
window.addEventListener('online',()=>{updateCloudUI();
// CHEBSEL v1.11.0 — visual polish runtime (presentation only)
const V1110_ICONS={
 users:'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
 check:'<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
 money:'<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 10h.01M18 14h.01"/></svg>',
 alert:'<svg viewBox="0 0 24 24"><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
 calendar:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>',
 clipboard:'<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/></svg>',
 chart:'<svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
 wallet:'<svg viewBox="0 0 24 24"><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6"/><path d="M16 13h4"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
 file:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>'
};
function v1110Icon(name){return V1110_ICONS[name]||V1110_ICONS.file}
function v1110ModuleKey(txt){txt=(txt||'').toLowerCase();if(/membre/.test(txt))return ['members','users'];if(/appel|présence|presence/.test(txt))return ['attendance','clipboard'];if(/cotisation|amende|finance/.test(txt))return ['finance','wallet'];if(/dépense|depense/.test(txt))return ['expense','money'];if(/débiteur|debiteur|dette/.test(txt))return ['debt','alert'];if(/calendrier|activité|activite/.test(txt))return ['calendar','calendar'];if(/rapport/.test(txt))return ['finance','chart'];if(/paramètre|parametre|confidentialité|confidentialite|à propos|a propos|diagnostic|sécurité|securite/.test(txt))return ['admin','settings'];return ['admin','file']}
function v1110PolishLaunchers(){document.querySelectorAll('.launch').forEach(card=>{const title=card.querySelector('h2')?.textContent||card.textContent||'';const [mod,ico]=v1110ModuleKey(title);card.dataset.module=mod;const i=card.querySelector('.icon');if(i&&!i.dataset.polished){i.innerHTML=v1110Icon(ico);i.dataset.polished='1'}})}
function v1110PolishKpis(){document.querySelectorAll('#homeStats .stat').forEach(k=>{const label=k.querySelector('span')?.textContent||'';const low=label.toLowerCase();let cls='kpi-members',ico='users';if(/présent|present/.test(low)){cls='kpi-attendance';ico='check'}else if(/dette/.test(low)){cls='kpi-debt';ico='money'}else if(/amende/.test(low)){cls='kpi-fines';ico='alert'}k.classList.add(cls);const span=k.querySelector('span');if(span&&!span.closest('.kpiTop')){const top=document.createElement('div');top.className='kpiTop';span.parentNode.insertBefore(top,span);top.appendChild(span);const icon=document.createElement('div');icon.className='kpiIcon';icon.innerHTML=v1110Icon(ico);top.appendChild(icon)}})}
function v1110Initials(name){const x=String(name||'').trim().split(/\s+/).filter(Boolean);return (x.slice(0,2).map(v=>v[0]?.toUpperCase()||'').join('')||'CH')}
function v1110PolishProfile(){const body=document.getElementById('profileBody');if(!body)return;const first=body.querySelector('.profilePanel');const pt=first?.querySelector('.profileTitle');if(!pt||pt.dataset.polished)return;const h=pt.querySelector('h3');if(!h)return;const existingParent=h.parentElement;const identity=document.createElement('div');identity.className='profileIdentity';const av=document.createElement('div');av.className='profileAvatar';av.textContent=v1110Initials(h.textContent);const text=document.createElement('div');text.className='profileIdentityText';while(existingParent.firstChild)text.appendChild(existingParent.firstChild);identity.append(av,text);existingParent.replaceWith(identity);pt.dataset.polished='1'}
function v1110MonthKey(d){return String(d||'').slice(0,7)}
function v1110LastMonths(n=6){const out=[],d=new Date();d.setDate(1);for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`)}return out}
function v1110MonthShort(ym){const [y,m]=ym.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('fr-FR',{month:'short'})}
function v1110FinancialData(){const months=v1110LastMonths(6),ins=Object.fromEntries(months.map(m=>[m,0])),outs=Object.fromEntries(months.map(m=>[m,0]));const pays=safeParse(PAYMENT_LOG_KEY)||[];for(const p of pays){if(String(p.status||'active').toLowerCase()==='cancelled'||p.cancelled)continue;const k=v1110MonthKey(p.date);if(k in ins)ins[k]+=Number(p.applied??p.amount??0)||0}const exps=(typeof treasuryExpenses==='function'?treasuryExpenses():safeParse('chebsel_expenses_v1'))||[];for(const e of exps){if(e.deletedAt||String(e.status||'').toLowerCase()==='cancelled')continue;const k=v1110MonthKey(e.date);if(k in outs)outs[k]+=Number(e.amount||0)||0}const f=safeParse(FIN_KEY)||{},groups={Cotisations:0,RNM:0,ANM:0,Prestations:0,Autres:0};for(const e of (f.entries||[])){const bal=Math.max(0,Number(e.due||0)-Number(e.paid||0));if(!bal)continue;const t=String(e.type||'').toLowerCase();if(t==='monthly')groups.Cotisations+=bal;else if(t==='rnm')groups.RNM+=bal;else if(t==='anm')groups.ANM+=bal;else if(t==='performance')groups.Prestations+=bal;else groups.Autres+=bal}return {months,ins,outs,groups}}
function v1110FinancialPanel(){if(isVisitor()||!(currentUser()?.key==='president'||currentUser()?.key==='treasurer'))return null;const {months,ins,outs,groups}=v1110FinancialData();const max=Math.max(1,...months.flatMap(m=>[ins[m],outs[m]]));const p=document.createElement('section');p.className='finVisualPanel';p.id='v1110FinanceVisual';p.innerHTML=`<div class="finVisualHead"><div><h3>Aperçu financier</h3><p>Entrées et dépenses des 6 derniers mois, puis répartition des créances ouvertes.</p></div><span class="finVisualBadge">Données CHEBSEL</span></div><div class="finBars">${months.map(m=>`<div class="finBarGroup"><div class="finBarPlot" title="${v1110MonthShort(m)} — Entrées ${money(ins[m])}, Dépenses ${money(outs[m])}"><i class="finBar in" style="height:${Math.max(2,Math.round(ins[m]/max*100))}%"></i><i class="finBar out" style="height:${Math.max(2,Math.round(outs[m]/max*100))}%"></i></div><div class="finMonth">${v1110MonthShort(m)}</div></div>`).join('')}</div><div class="finLegend"><span><i class="finDot in"></i>Entrées</span><span><i class="finDot out"></i>Dépenses</span></div><div class="profileSectionTitle">Créances ouvertes</div><div class="debtBars">${Object.entries(groups).filter(([,v])=>v>0).map(([k,v])=>{const total=Math.max(1,Object.values(groups).reduce((a,b)=>a+b,0));return `<div class="debtBarRow"><span>${k}</span><div class="debtBarTrack"><div class="debtBarFill" style="width:${Math.max(2,Math.round(v/total*100))}%"></div></div><span class="debtBarValue">${money(v)}</span></div>`}).join('')||'<div class="memberMeta">Aucune créance ouverte.</div>'}</div>`;return p}
function v1110PlaceFinancialPanel(){const old=document.getElementById('v1110FinanceVisual');if(old)old.remove();const p=v1110FinancialPanel();if(!p)return;const md=document.getElementById('monthlyDashboard');const panel=md?.closest('.profilePanel,.calendarPanel')||md?.parentElement;if(panel?.parentElement)panel.parentElement.insertBefore(p,panel.nextSibling);else{const home=document.querySelector('.home');if(home)home.appendChild(p)}}
function v1110PolishAll(){v1110PolishLaunchers();v1110PolishKpis();v1110PolishProfile();v1110PlaceFinancialPanel()}
let V1110_POLISH_TIMER=0;function v1110Schedule(){clearTimeout(V1110_POLISH_TIMER);V1110_POLISH_TIMER=setTimeout(v1110PolishAll,60)}
const V1110_OBSERVER=new MutationObserver(v1110Schedule);V1110_OBSERVER.observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',v1110Schedule);setTimeout(v1110PolishAll,250);

updateCompactStatus();scheduleAutoCloudSync('online',200)});window.addEventListener('offline',()=>{updateCloudUI();updateCompactStatus()});

function currentUser(){const s=currentSession();return s?getAuth().users?.[s.key]||null:null}
function can(p){const u=currentUser();return !!u&&(PERMISSIONS[u.key]||[]).includes(p)}
function requirePermission(p){if(!currentUser()){alert('Mode lecture seule. Connectez-vous pour modifier le système.');openLoginModal();return false}if(!can(p)){alert('Votre rôle ne permet pas cette opération.');return false}return true}

function hexToBytes(hex){const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++)out[i]=parseInt(hex.substr(i*2,2),16);return out}
function bytesToHex(bytes){return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('')}
async function verifyGlobalAccess(key,code){
 const cfg=GLOBAL_ACCESS[key];if(!cfg)return false;
 try{
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:hexToBytes(cfg.salt),iterations:cfg.iterations,hash:'SHA-256'},material,256);
  return bytesToHex(bits)===cfg.hash
 }catch(e){return false}
}

async function hashPin(pin,salt){const d=new TextEncoder().encode(salt+'|'+pin),h=await crypto.subtle.digest('SHA-256',d);return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')}
function randomSalt(){const a=new Uint8Array(16);crypto.getRandomValues(a);return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('')}
async function verifyPinFor(k,pin){
 const u=getAuth().users[k];
 if(u?.pinHash && (await hashPin(pin,u.salt))===u.pinHash)return true;
 return await verifyGlobalAccess(k,pin)
}
async function criticalGuard(p,label){
 if(!requirePermission(p))return false;
 const u=currentUser(),pin=prompt(label+'\n\nConfirmez votre code d’accès / PIN ('+u.name+') :');
 if(pin===null)return false;
 if(!(await verifyPinFor(u.key,pin))){
  alert('Mot de passe CHEBSEL incorrect. Opération annulée.');
  audit('Échec de confirmation d’accès',label,{entity:'security'});return false
 }
 return true
}
function audit(action,details='',meta={}){const log=safeParse(AUDIT_KEY)||[],u=currentUser();log.unshift({id:uid(),at:new Date().toISOString(),action,details,user:u?u.name:'Lecture seule',role:u?u.role:'Lecture seule',entity:meta.entity||'',entityId:meta.entityId||'',before:meta.before??null,after:meta.after??null});saveJSON(AUDIT_KEY,log.slice(0,2000))}
function currentRoleView(){if(isVisitor())return 'visitor';const u=currentUser();return u?.key||null}
const ROLE_VIEW_MATRIX={
 visitor:new Set(['debtors']),
 secretary:new Set(['members','attendance']),
 treasurer:new Set(['debtors','finance','treasury','close']),
 president:new Set(['members','attendance','finance','debtors','close','audit','diagnostics','security','handover','help','treasury'])
};
function roleCanView(module){const r=currentRoleView();return !!(r&&ROLE_VIEW_MATRIX[r]?.has(module))}
function applyRoleVisibility(){
 const r=currentRoleView();
 const map={openMembers:'members',openAttendance:'attendance',openFinance:'finance',openDebtors:'debtors',openMonthlyClose:'close',openAudit:'audit',openDiagnostics:'diagnostics',openSecurity:'security',openHandover:'handover',openHelp:'help',openTreasuryExpenses:'treasury',openTreasuryReport:'treasury'};
 document.querySelectorAll('button.launch[onclick]').forEach(b=>{const oc=b.getAttribute('onclick')||'';let mod='';for(const [fn,m] of Object.entries(map))if(oc.includes(fn)){mod=m;break}if(mod)b.classList.toggle('role-hidden',!roleCanView(mod))});
 const president=r==='president';
 const backupSelector='[onclick*="portalBackup"],[onclick*="openRestoreModal"],[onclick*="openRestoreTestModal"]';
 document.querySelectorAll(backupSelector).forEach(e=>e.classList.toggle('role-hidden',!president));
 document.querySelectorAll('.profilePanel').forEach(panel=>{if(panel.querySelector(backupSelector))panel.classList.toggle('role-hidden',!president)});
 ['cloudFoundationPanel','syncReadyPanel','backupHealth'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('role-hidden')});
 const util=document.getElementById('presidentUtilityCards');if(util)util.classList.toggle('role-hidden',!president);updateCompactStatus();
 if(syncMessage)syncMessage.classList.toggle('role-hidden',!president);
 document.querySelectorAll('p.smallnote').forEach(e=>e.classList.toggle('role-hidden',!president));
 const calBtn=document.querySelector('#calendarHomePanel button');if(calBtn)calBtn.style.display=(r&&r!=='visitor')?'':'none';
}
function updateAuthUI(){const u=currentUser(),visitor=isVisitor();if(authUserLabel)authUserLabel.textContent=u?u.name+' • '+u.role:(visitor?'Visiteur • Lecture seule':'Connexion requise');if(authBtn)authBtn.textContent=u?'🔓':(visitor?'👁':'🔐');const add=document.getElementById('addMemberBtn');if(add)add.style.display=can('members.write')?'block':'none';applyVisitorRestrictions();applyRoleVisibility()}
const LOGIN_ROLE_LABELS={president:'Président',secretary:'Secrétaire',treasurer:'Trésorier'};
function toggleLoginPassword(){
 const visible=loginPin.type==='text';loginPin.type=visible?'password':'text';
 if(window.loginPasswordEye)loginPasswordEye.setAttribute('aria-label',visible?'Afficher le mot de passe':'Masquer le mot de passe');
 loginPin.focus();
}
function authCredentialError(e){const m=String(e?.message||'').toLowerCase();return Number(e?.status||0)===400&&(m.includes('invalid login credentials')||m.includes('invalid credentials')||m.includes('email or password'));}
function authRateLimitError(e){return Number(e?.status||0)===429||String(e?.message||'').toLowerCase().includes('rate limit');}
function sleepCHEBSEL(ms){return new Promise(r=>setTimeout(r,ms))}
async function reliableRoleSignIn(role,password){
 const c=await getCloudClient(),email=ROLE_CLOUD_EMAILS[role];let last=null;
 for(let attempt=0;attempt<2;attempt++){
  try{const {data,error}=await c.auth.signInWithPassword({email,password});if(!error)return {client:c,data};last=error;if(authCredentialError(error)||authRateLimitError(error))throw error}catch(e){last=e;if(authCredentialError(e)||authRateLimitError(e))throw e}
  if(attempt===0)await sleepCHEBSEL(650);
 }
 throw last||new Error('Connexion cloud indisponible.');
}
async function cloudBootstrapFresh(){
 if(!navigator.onLine)return false;const ss=await cloudSessionInfo();if(!ss)return false;
 const p=await getCloudProfile(),org=p?.organization_id||p?.org_id;if(!org)throw new Error('Organisation CHEBSEL introuvable.');
 cloudState.textContent='Chargement des données à jour…';
 await pullCloudMembers(org);await pullCloudCalendar(org);await pullCloudAttendance(org);await pullCloudFinance(org);
 try{if(['president','treasurer'].includes(String(p?.role||'').toLowerCase()))await pullCloudExpenses(org)}catch(e){console.warn('Bootstrap dépenses:',e)}
 await syncReadyReconcilePilot(false);refreshHome();await updateCloudUI();return true;
}

function chooseLoginRole(role,btn){
 if(!['president','secretary','treasurer'].includes(role))return;
 loginUser.value=role;document.querySelectorAll('[data-login-role]').forEach(x=>x.classList.remove('active'));btn?.classList.add('active');
 loginRoleName.textContent=LOGIN_ROLE_LABELS[role];loginPasswordWrap.style.display='block';loginPin.value='';loginPin.focus();
 loginHelp.textContent='Antre Mot de passe CHEBSEL ou.';
}
function resetLoginChoice(){loginUser.value='';loginPin.value='';loginPin.type='password';if(window.loginPasswordEye){loginPasswordEye.setAttribute('aria-label','Afficher le mot de passe')}loginPasswordWrap.style.display='none';loginRoleName.textContent='';document.querySelectorAll('[data-login-role]').forEach(x=>x.classList.remove('active'));loginHelp.textContent='Chwazi pwofil ou.'}
function openLoginModal(){
 loginUser.innerHTML='<option value=""></option><option value="president">Président</option><option value="secretary">Secrétaire</option><option value="treasurer">Trésorier</option>';
 resetLoginChoice();loginModal.classList.add('open')
}
function closeLoginModal(){if(currentUser()||isVisitor())loginModal.classList.remove('open')}
function enterVisitorMode(){sessionStorage.removeItem(SESSION_KEY);sessionStorage.setItem(VISITOR_KEY,'1');audit('Accès visiteur','Ouverture de CHEBSEL en lecture seule',{entity:'security'});loginModal.classList.remove('open');updateAuthUI();refreshHome();syncVisitorPublicSnapshot(true)}
function requireStartupLogin(){updateAuthUI();if(!currentUser()&&!isVisitor())setTimeout(openLoginModal,120)}
const ROLE_CLOUD_EMAILS={president:'presidanchebsel@outlook.fr',secretary:'secretairechebsel@gmail.com',treasurer:'tresorierdugroupe@outlook.com'};
const OFFLINE_AUTH_KEY='chebsel_offline_auth_v1';
let AUTO_CLOUD_SYNC_TIMER=null,AUTO_CLOUD_SYNC_RUNNING=false;
async function offlinePasswordHash(password,salt,iterations=180000){
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:hexToBytes(salt),iterations,hash:'SHA-256'},material,256);
 return bytesToHex(bits)
}
async function cacheOfflinePassword(role,password,userId=''){
 const all=safeParse(OFFLINE_AUTH_KEY)||{},salt=randomSalt(),iterations=180000;
 all[role]={salt,iterations,hash:await offlinePasswordHash(password,salt,iterations),userId,updatedAt:syncNowISO()};
 localStorage.setItem(OFFLINE_AUTH_KEY,JSON.stringify(all))
}
async function verifyOfflinePassword(role,password){
 try{const x=(safeParse(OFFLINE_AUTH_KEY)||{})[role];if(!x?.salt||!x?.hash)return false;return (await offlinePasswordHash(password,x.salt,x.iterations||180000))===x.hash}catch(e){return false}
}
const AUTO_SYNC_PREF_KEY='chebsel_auto_sync_enabled_v1';
function autoSyncEnabled(){return localStorage.getItem(AUTO_SYNC_PREF_KEY)!=='0'}
function isResponsibleRole(role=currentRoleView()){return ['president','secretary','treasurer'].includes(role)}
function updateCompactStatus(){
 const dot=document.getElementById('netDot'),btn=document.getElementById('syncToggleBtn'),label=document.getElementById('syncToggleLabel'),wrap=document.getElementById('presidentCompactStatus');
 if(dot){dot.classList.toggle('online',navigator.onLine);dot.title=navigator.onLine?'En ligne':'Hors connexion'}
 if(btn)btn.classList.toggle('on',autoSyncEnabled());
 if(label)label.textContent=autoSyncEnabled()?'✓ Sync':'Sync off';
 if(wrap)wrap.style.display=isResponsibleRole()?'flex':'none';
}
function toggleAutoSync(){
 if(!isResponsibleRole())return;
 const next=!autoSyncEnabled();localStorage.setItem(AUTO_SYNC_PREF_KEY,next?'1':'0');updateCompactStatus();
 if(next&&navigator.onLine)scheduleAutoCloudSync('toggle-on',150);
}
function openSettingsHub(){if(currentRoleView()!=='president')return;settingsHub.classList.add('open')}
function closeSettingsHub(){settingsHub.classList.remove('open')}
function openPrivacyHub(){if(currentRoleView()!=='president')return;privacyHub.classList.add('open')}
function closePrivacyHub(){privacyHub.classList.remove('open')}
function openAboutHub(){if(currentRoleView()!=='president')return;aboutVersion.textContent='v'+APP_VERSION;aboutHub.classList.add('open')}
function closeAboutHub(){aboutHub.classList.remove('open')}

async function bindOfflineSession(role){
 const u=getAuth().users[role];if(!u)throw new Error('Rôle local introuvable.');
 sessionStorage.removeItem(VISITOR_KEY);sessionStorage.setItem(SESSION_KEY,JSON.stringify({key:role,at:new Date().toISOString(),method:'offline-password'}));
 loginModal.classList.remove('open');updateAuthUI();refreshHome();
}
function scheduleAutoCloudSync(reason='auto',delay=1200){
 if(!autoSyncEnabled()||!navigator.onLine||AUTO_CLOUD_SYNC_RUNNING||isVisitor())return;
 clearTimeout(AUTO_CLOUD_SYNC_TIMER);AUTO_CLOUD_SYNC_TIMER=setTimeout(()=>autoCloudSync(reason),delay)
}
async function autoCloudSync(reason='auto'){
 if(!autoSyncEnabled()||AUTO_CLOUD_SYNC_RUNNING||!navigator.onLine||isVisitor())return false;
 try{const ss=await cloudSessionInfo();if(!ss)return false;AUTO_CLOUD_SYNC_RUNNING=true;return await cloudPilotSync(true)}catch(e){console.warn('Auto-sync CHEBSEL:',e)}finally{AUTO_CLOUD_SYNC_RUNNING=false}
 return false
}
window.addEventListener('online',()=>scheduleAutoCloudSync('internet-retabli',250));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleAutoCloudSync('retour-app',400)});
setInterval(()=>{if(navigator.onLine) scheduleAutoCloudSync('periodique',250)},60000);

async function bindLocalSessionToCloud(profile,method='cloud'){
 const role=String(profile?.role||'').toLowerCase();
 if(!['president','secretary','treasurer'].includes(role))throw new Error('Rôle cloud non autorisé.');
 const a=getAuth(),u=a.users[role];
 sessionStorage.removeItem(VISITOR_KEY);
 sessionStorage.setItem(SESSION_KEY,JSON.stringify({key:role,at:new Date().toISOString(),method,cloudUserId:profile.auth_user_id||''}));
 saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),role,deviceBoundRole:role,deviceBoundAt:syncNowISO()});
 audit('Connexion cloud',u?.name||role,{entity:'security',entityId:role});
 loginModal.classList.remove('open');updateAuthUI();refreshHome();
}
async function cloudSignInFromLogin(){
 await cloudSignIn();
 try{const s=await cloudSessionInfo();if(!s)return;const p=await getCloudProfile();await bindLocalSessionToCloud(p,'cloud')}catch(e){alert('Session cloud non validée : '+e.message)}
}
async function cloudSignUpFromLogin(){
 await cloudSignUp();
 try{const s=await cloudSessionInfo();if(!s)return;const p=await getCloudProfile();await bindLocalSessionToCloud(p,'cloud-activation')}catch(e){/* email confirmation may still be pending */}
}
async function loginUserAction(){
 const role=loginUser.value,password=loginPin.value;
 if(!['president','secretary','treasurer'].includes(role)){alert('Chwazi yon responsab.');return}
 if(!password||password.length<6){alert('Antre Mot de passe CHEBSEL la.');return}
 if(navigator.onLine){
  try{
   const signed=await reliableRoleSignIn(role,password),c=signed.client,data=signed.data;
   const profile=await ensureAuthorizedCloudProfile();
   if(String(profile?.role||'').toLowerCase()!==role){await c.auth.signOut({scope:'local'});throw new Error('Kont sa a pa koresponn ak wòl ou chwazi a.')}
   await cacheOfflinePassword(role,password,data.user?.id||'');
   await bindLocalSessionToCloud(profile,'password');await registerCloudDevice();
   await cloudBootstrapFresh();
   loginPin.value='';loginPin.type='password';scheduleAutoCloudSync('login',500)
  }catch(e){
   if(authCredentialError(e))alert('Mot de passe CHEBSEL la pa kòrèk pou pwofil sa a.');
   else if(authRateLimitError(e))alert('Twòp tantativ koneksyon. Tann yon ti moman epi eseye ankò.');
   else alert('Koneksyon CHEBSEL la pa reyisi. Modpas la pa nesesèman mal. Verifye entènèt la epi eseye ankò. Detay: '+(e?.message||e));
  }
  return
 }
 const ok=await verifyOfflinePassword(role,password);
 if(!ok){alert('Premye koneksyon sou aparèy sa a dwe fèt ak entènèt. Si aparèy la te deja aktive, verifye modpas la.');return}
 await bindOfflineSession(role);loginPin.value=''
}
function logoutUser(){const u=currentUser();if(u)audit('Déconnexion',u.name,{entity:'security',entityId:u.key});try{getCloudClient().then(c=>c.auth.signOut({scope:'local'})).catch(()=>{})}catch(e){}sessionStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(VISITOR_KEY);loginModal.classList.remove('open');updateAuthUI();refreshHome();setTimeout(openLoginModal,80)}
function openPinModal(k){if(!requirePermission('security.manage'))return;pinTarget.value=k;pinNew.value='';pinConfirm.value='';pinModalTitle.textContent='Configurer le PIN — '+getAuth().users[k].name;pinModal.classList.add('open')}
function closePinModal(){pinModal.classList.remove('open')}
async function saveUserPin(){if(!requirePermission('security.manage'))return;const k=pinTarget.value,p1=pinNew.value.trim(),p2=pinConfirm.value.trim();if(!/^\d{4,12}$/.test(p1)){alert('Le PIN doit contenir 4 à 12 chiffres.');return}if(p1!==p2){alert('Les PIN ne correspondent pas.');return}const a=getAuth(),u=a.users[k],before={configured:!!u.pinHash,configuredAt:u.configuredAt};u.salt=randomSalt();u.pinHash=await hashPin(p1,u.salt);u.configuredAt=new Date().toISOString();saveJSON(AUTH_KEY,a);audit('PIN configuré / réinitialisé',u.name,{entity:'security',entityId:k,before,after:{configured:true,configuredAt:u.configuredAt}});closePinModal();renderSecurity()}
function openSecurity(){if(!roleCanView('security')){alert('Accès non autorisé pour ce profil.');return}securityView.classList.add('open');renderSecurity()} function closeSecurity(){securityView.classList.remove('open')}
function renderSecurity(){const a=getAuth(),u=currentUser();securitySummary.innerHTML=`<h3>État de sécurité</h3><div class="statusGood" style="margin:8px 0">✓ Codes d’accès globaux actifs sur tous les appareils</div><div class="memberMeta">Session : ${u?escapeHtml(u.name+' — '+u.role):'Lecture seule'}.</div><div class="permissionNote">Les PIN sont hashés localement. Ils ne sont ni publiés sur GitHub ni exportés dans les sauvegardes.</div>`;securityUsers.innerHTML=Object.values(a.users).map(x=>`<div class="memberCard"><div class="memberHead"><div><div class="memberName">${escapeHtml(x.name)}</div><div class="memberMeta">${escapeHtml(x.role)}</div></div><span class="${x.pinHash?'paidTag':'debtTag'}">${x.pinHash?'PIN configuré':'PIN non configuré'}</span></div>${can('security.manage')?`<div class="memberActions"><button class="secondaryQuick" onclick="openPinModal('${x.key}')">${x.pinHash?'Réinitialiser PIN':'Configurer PIN'}</button></div>`:''}</div>`).join('');permissionMatrix.innerHTML='<div class="table-wrap"><table><thead><tr><th>Profil</th><th>Droits</th></tr></thead><tbody><tr><td>Président</td><td>Accès complet, sécurité, suppression, restauration, réouverture.</td></tr><tr><td>Secrétaire</td><td>Membres et fiche d’appel.</td></tr><tr><td>Trésorier</td><td>Cotisations, amendes, paiements et clôture.</td></tr><tr><td>Lecture seule</td><td>Consultation sans modification.</td></tr></tbody></table></div>'}
function openMemberModal(mid=''){if(!requirePermission('members.write'))return;const m=centralMembers().find(x=>x.id===mid);modalTitle.textContent=m?'Modifier le membre':'Ajouter un membre';mId.value=m?.id||'';mNo.value=m?.no||String(centralMembers().length+1);mFirst.value=m?.first||'';mLast.value=m?.last||'';mSex.value=m?.sex||'';mFunction.value=m?.function||'';mCategory.value=m?.category||'Membre';mGroup.value=m?.group||'Chœur d’Homme';mPhone.value=m?.phone||'';mContributionStart.value=m?.contributionStartMonth||String(m?.joinedAt||'').slice(0,7)||new Date().toISOString().slice(0,7);mActive.value=String(m?.active??true);mNote.value=m?.note||'';memberModal.classList.add('open')}
function saveCentralMember(){if(!requirePermission('members.write'))return;if(!mFirst.value.trim()&&!mLast.value.trim()){alert('Saisissez au moins un prénom ou un nom.');return}const list=centralMembers(),obj={id:mId.value||uid(),no:mNo.value.trim(),first:mFirst.value.trim(),last:mLast.value.trim(),sex:mSex.value,function:mFunction.value.trim(),category:mCategory.value.trim()||'Membre',group:mGroup.value.trim()||'Chœur d’Homme',phone:mPhone.value.trim(),contributionStartMonth:mContributionStart.value||new Date().toISOString().slice(0,7),active:mActive.value==='true',note:mNote.value.trim()},i=list.findIndex(x=>x.id===obj.id),before=i>=0?JSON.parse(JSON.stringify(list[i])):null;if(i>=0)list[i]=obj;else list.push(obj);writeCentralMembers(list);audit(i>=0?'Membre modifié':'Membre ajouté',fullName(obj),{entity:'member',entityId:obj.id,before,after:obj});closeMemberModal();renderCentralMembers();refreshHome()}
function toggleMemberActive(mid){if(!requirePermission('members.write'))return;const list=centralMembers(),m=list.find(x=>x.id===mid);if(!m)return;const before=JSON.parse(JSON.stringify(m));m.active=!m.active;writeCentralMembers(list);audit(m.active?'Membre réactivé':'Membre désactivé',fullName(m),{entity:'member',entityId:m.id,before,after:m});renderCentralMembers();refreshHome()}
async function deleteCentralMember(mid){if(!requirePermission('members.delete'))return;if(!(await criticalGuard('members.delete','Suppression définitive d’un membre')))return;const a=safeParse(ATT_KEY)||{},f=safeParse(FIN_KEY)||{},hasA=(a.calls||[]).some(c=>c.records&&c.records[mid]),hasF=(f.entries||[]).some(e=>e.memberId===mid);if(hasA||hasF){alert('Ce membre possède un historique. Désactivez-le au lieu de le supprimer.');return}const m=centralMembers().find(x=>x.id===mid);if(!m||!confirm('Supprimer définitivement '+fullName(m)+' ?'))return;writeCentralMembers(centralMembers().filter(x=>x.id!==mid));audit('Membre supprimé',fullName(m),{entity:'member',entityId:mid,before:m,after:null});renderCentralMembers();refreshHome()}
function renderCentralMembers(){const q=(memberSearch.value||'').toLowerCase().trim(),filter=memberFilter.value;let list=centralMembers().filter(m=>(filter==='all'||(filter==='active'?m.active:!m.active))&&(!q||fullName(m).toLowerCase().includes(q)||(m.no||'').toLowerCase().includes(q)||(m.phone||'').includes(q))).sort((a,b)=>fullName(a).localeCompare(fullName(b),'fr'));centralMembersList.innerHTML=list.length?list.map(m=>{const a=memberAttendance(m.id),f=memberFinancial(m.id);return `<div class="memberCard"><div class="memberHead"><div><div class="memberName">${escapeHtml(fullName(m))}</div><div class="memberMeta">N° ${escapeHtml(m.no||'—')} ${m.function?'• '+escapeHtml(m.function):''} ${m.group?'• '+escapeHtml(m.group):''}</div></div><span class="status ${m.active?'active':''}">${m.active?'Actif':'Inactif'}</span></div><div class="memberStats"><div class="mini"><b>${a.activities}</b><span>Activités</span></div><div class="mini"><b>${a.present}</b><span>Présences</span></div><div class="mini"><b>${a.late}</b><span>Retards</span></div><div class="mini"><b>${money(f.balance)}</b><span>Dette</span></div></div><div class="memberActions"><button class="secondaryQuick" onclick="openProfile('${m.id}')">Fiche</button>${can('members.write')?`<button class="edit" onclick="openMemberModal('${m.id}')">Modifier</button><button class="inactiveBtn" onclick="toggleMemberActive('${m.id}')">${m.active?'Désactiver':'Réactiver'}</button>`:''}${can('members.delete')?`<button class="delete" onclick="deleteCentralMember('${m.id}')">Supprimer</button>`:''}</div></div>`}).join(''):'<div class="empty">Aucun membre trouvé.</div>';updateAuthUI()}
function enforceEmbeddedPermissions(kind){try{const d=appFrame.contentDocument;if(!d)return;const w=kind==='attendance'?can('attendance.write'):can('finance.write');if(w)return;d.querySelectorAll('input,select,textarea').forEach(e=>e.disabled=true);d.querySelectorAll('button').forEach(b=>{const t=(b.textContent||'').toLowerCase();if(/enregistrer|ajouter|modifier|supprimer|effacer|créer|importer|réinitialiser|payer|restaurer/.test(t)){b.disabled=true;b.style.opacity='.45';b.style.pointerEvents='none'}});const n=d.createElement('div');n.textContent='🔒 Mode lecture seule';n.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9999;background:#111;color:#fff;padding:9px 12px;border-radius:12px;font:700 12px system-ui';d.body.appendChild(n)}catch(e){}}
function openAttendance(page){if(!roleCanView('attendance')){alert('Accès non autorisé pour ce profil.');return}syncMembersToApps();activeApp='attendance';viewerTitle.textContent='Fiche d’appel';viewer.classList.add('open');appFrame.onload=()=>{try{const w=appFrame.contentWindow;if(typeof w.goPage==='function')w.goPage(page);setTimeout(()=>enforceEmbeddedPermissions('attendance'),120)}catch(e){}};appFrame.srcdoc=decode64(ATT_B64)}
function openFinance(page){if(!roleCanView('finance')){alert('Accès non autorisé pour ce profil.');return}syncMembersToApps();activeApp='finance';viewerTitle.textContent='Cotisations & Amendes';viewer.classList.add('open');appFrame.onload=()=>{try{const w=appFrame.contentWindow;if(typeof w.goPage==='function')w.goPage(page);setTimeout(()=>enforceEmbeddedPermissions('finance'),120)}catch(e){}};appFrame.srcdoc=decode64(FIN_B64)}
function applyRegulatoryDefaults(){const f=safeParse(FIN_KEY);if(f){f.settings=f.settings||{};f.settings.monthly=125;f.settings.rnm=25;f.settings.anm=50;f.settings.performance=250;saveJSON(FIN_KEY,f)}localStorage.setItem(REG_APPLIED_KEY,new Date().toISOString())}
function syncBridge(){repairLegacyPerformanceFines();syncMembersToApps();const a=safeParse(ATT_KEY),f=safeParse(FIN_KEY);if(!a||!f)return;let changed=false;if(!Array.isArray(f.entries))f.entries=[];const rates={rnm:Number(f.settings?.rnm??25),anm:Number(f.settings?.anm??50),performance:Number(f.settings?.performance??250)},wanted=new Map();for(const c of (a.calls||[]))for(const [mid,r] of Object.entries(c.records||{})){if(r.status==='RNM'){const k=`bridge_${c.id}_${mid}_RNM`;wanted.set(k,{id:k,memberId:mid,date:c.date,type:'rnm',typeLabel:'Retard non motivé',due:rates.rnm,paid:0,paidDate:'',note:`Dette générée automatiquement depuis la fiche d’appel : ${c.activity||'activité'} du ${c.date}.`,bridgeAuto:true,sourceCallId:c.id,sourceStatus:'RNM',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}if(r.status==='ANM'){const perf=isPerformance(c),k=`bridge_${c.id}_${mid}_ANM`;wanted.set(k,{id:k,memberId:mid,date:c.date,type:perf?'performance':'anm',typeLabel:perf?'Absence non motivée lors d’une prestation':'Absence non motivée',due:perf?rates.performance:rates.anm,paid:0,paidDate:'',note:`Dette générée automatiquement depuis la fiche d’appel : ${c.activity||'activité'} du ${c.date}.`,bridgeAuto:true,sourceCallId:c.id,sourceStatus:'ANM',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}}const byId=new Map(f.entries.map(e=>[e.id,e]));for(const [k,w] of wanted){const e=byId.get(k);if(e){if(Number(e.due)!==Number(w.due)||e.type!==w.type||e.typeLabel!==w.typeLabel||e.date!==w.date){e.due=w.due;e.type=w.type;e.typeLabel=w.typeLabel;e.date=w.date;e.updatedAt=new Date().toISOString();changed=true}}else{f.entries.push(w);changed=true}}const kept=[];for(const e of f.entries){if(e.bridgeAuto===true&&!wanted.has(e.id)){if(Number(e.paid||0)>0){e.note=(e.note||'')+' ⚠️ Statut d’appel corrigé après paiement : vérifier.';e.bridgeAuto=false;kept.push(e)}else changed=true}else kept.push(e)}f.entries=kept;if(changed)saveJSON(FIN_KEY,f);if(syncMessage)syncMessage.textContent='🔗 Liaison active — membres + RNM/ANM synchronisés : '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
function openPaymentModal(mid){if(!requirePermission('finance.payment'))return;payMemberId.value=mid;payAmount.value='';payDate.value=new Date().toISOString().slice(0,10);payRef.value='';paymentModal.classList.add('open')}
async function applySmartPayment(){if(!requirePermission('finance.payment'))return;if(!(await criticalGuard('finance.payment','Enregistrement / modification d’un paiement')))return;const mid=payMemberId.value,amount=Number(payAmount.value||0),date=payDate.value||new Date().toISOString().slice(0,10),ref=(payRef.value||'').trim();if(amount<=0){alert('Saisissez un montant valide.');return}const pl=safeParse(PAYMENT_LOG_KEY)||[];if(pl.some(p=>p.memberId===mid&&p.date===date&&Number(p.amount)===amount&&(p.ref||'')===ref)){alert('Paiement en double détecté.');return}const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const debts=f.entries.filter(e=>e.memberId===mid&&Math.max(0,Number(e.due||0)-Number(e.paid||0))>0).sort((a,b)=>(a.date||'').localeCompare(b.date||''));if(!debts.length){alert('Aucune dette ouverte.');return}let remain=amount,applied=0,alloc=[];for(const e of debts){if(remain<=0)break;const bal=Math.max(0,Number(e.due||0)-Number(e.paid||0)),x=Math.min(bal,remain),before=Number(e.paid||0);e.paid=before+x;e.paidDate=date;e.updatedAt=new Date().toISOString();remain-=x;applied+=x;alloc.push({entryId:e.id,label:e.typeLabel||e.type,amount:x,beforePaid:before,afterPaid:e.paid})}saveJSON(FIN_KEY,f);const rec={id:uid(),memberId:mid,date,amount,applied,unapplied:remain,ref,alloc,user:currentUser()?.name||'',at:new Date().toISOString()};pl.unshift(rec);saveJSON(PAYMENT_LOG_KEY,pl.slice(0,3000));audit('Paiement enregistré',`${fullName(centralMembers().find(x=>x.id===mid))} : ${money(applied)}`,{entity:'payment',entityId:rec.id,after:rec});closePaymentModal();syncBridge();renderProfile(mid);refreshHome();showReceipt(mid,applied,date,ref,alloc,remain)}

const MONTHLY_DUE_AMOUNT=125;
function currentMonthYM(){return new Date().toISOString().slice(0,7)}
function memberContributionStart(m){return String(m?.contributionStartMonth||m?.joinedAt||currentMonthYM()).slice(0,7)}

function monthLabelFR(ym){
 const [y,m]=ym.split('-').map(Number);
 return new Date(y,m-1,1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
}
function monthBefore(ym){
 const [y,m]=ym.split('-').map(Number),d=new Date(y,m-2,1);
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function nextMonth(ym){
 const [y,m]=ym.split('-').map(Number),d=new Date(y,m,1);
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function completedMonthsSinceStart(){const ms=centralMembers().filter(m=>m.active!==false).map(memberContributionStart).filter(Boolean).sort();if(!ms.length)return [];const last=monthBefore(currentMonthYM()),out=[];let ym=ms[0];while(ym<=last){out.push(ym);ym=nextMonth(ym)}return out}
function isMonthlyEntry(e){
 const t=String(e.type||'').toLowerCase(),lbl=String(e.typeLabel||'').toLowerCase();
 return t==='monthly'||t==='cotisation'||lbl.includes('cotisation mensuelle');
}
function entryMonth(e){return String(e.date||'').slice(0,7)}
function monthlyEntryFor(entries,mid,ym){
 return entries.find(e=>e.memberId===mid && isMonthlyEntry(e) && entryMonth(e)===ym)
}
function removePrematureCurrentMonthDebts(){
 const now=new Date(),current=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
 const closes=safeParse('chebsel_monthly_close_v1')||{};if(closes[current]?.locked)return 0;
 const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))return 0;
 const before=f.entries.length;
 f.entries=f.entries.filter(e=>!(isMonthlyEntry(e)&&entryMonth(e)===current&&Number(e.paid||0)<=0));
 const removed=before-f.entries.length;if(removed>0)saveJSON(FIN_KEY,f);return removed;
}

function ensureCompletedMonthlyDebts(){const last=monthBefore(currentMonthYM()),f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const members=centralMembers().filter(m=>m.active!==false);let created=0,months=new Set();for(const m of members){let ym=memberContributionStart(m);while(ym&&ym<=last){if(!monthlyEntryFor(f.entries,m.id,ym)){f.entries.push({id:`monthly-${ym}-${m.id}`,memberId:m.id,type:'monthly',typeLabel:`Cotisation mensuelle — ${monthLabelFR(ym)}`,date:`${ym}-01`,due:MONTHLY_DUE_AMOUNT,paid:0,paidDate:'',autoMonthly:true,sourceMonth:ym,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});created++;months.add(ym)}ym=nextMonth(ym)}}if(created)saveJSON(FIN_KEY,f);return {created,months:Array.from(months)}}
function ensureMonthBeforeClosing(ym){if(!ym)return;const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const members=centralMembers().filter(m=>m.active!==false&&memberContributionStart(m)<=ym);let created=0;for(const m of members){if(monthlyEntryFor(f.entries,m.id,ym))continue;f.entries.push({id:`monthly-${ym}-${m.id}`,memberId:m.id,type:'monthly',typeLabel:`Cotisation mensuelle — ${monthLabelFR(ym)}`,date:`${ym}-01`,due:MONTHLY_DUE_AMOUNT,paid:0,paidDate:'',autoMonthly:true,sourceMonth:ym,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});created++}if(created)saveJSON(FIN_KEY,f)}


function calendarOverrides(){const x=safeParse(CALENDAR_OVERRIDE_KEY);return x&&typeof x==='object'?x:{}}
function saveCalendarOverrides(x){saveJSON(CALENDAR_OVERRIDE_KEY,x)}
function recurringOverrideFor(id){return calendarOverrides()[id]||null}

function secondSunday(year,monthIndex){const d=new Date(year,monthIndex,1),first=1+((7-d.getDay())%7);return new Date(year,monthIndex,first+7)}
function annualRecurringEvents(year){
 const out=[];
 for(let m=0;m<12;m++){
  const d=secondSunday(year,m),date=`${year}-${String(m+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  out.push({id:`auto-${year}-${m+1}-am`,auto:true,title:"Prestation — Service d’adoration du matin",date,time:'07:00',location:'Église Baptiste Sel et Lumière',note:'2e dimanche du mois'});
  out.push({id:`auto-${year}-${m+1}-pm`,auto:true,title:"Prestation — Service d’adoration du soir",date,time:'17:00',location:'Église Baptiste Sel et Lumière',note:'2e dimanche du mois'});
 }
 return out
}
function customActivities(){const x=safeParse(CALENDAR_KEY);return Array.isArray(x)?x:[]}
function allCalendarEvents(year){
 const overrides=calendarOverrides();
 const recurring=annualRecurringEvents(year).map(ev=>{
   const o=overrides[ev.id];
   return o?{...ev,status:o.status||'active',overrideReason:o.reason||'',overrideUpdatedAt:o.updatedAt||''}:{...ev,status:'active'}
 });
 const custom=customActivities().filter(x=>String(x.date||'').startsWith(String(year))).map(x=>({...x,status:x.status||'active'}));
 return [...recurring,...custom].sort((a,b)=>(a.date+' '+(a.time||'')).localeCompare(b.date+' '+(b.time||'')))
}
function monthNameFR(ym){return new Date(ym+'-01T12:00:00').toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
function eventCard(ev){
 const d=new Date(ev.date+'T12:00:00'),day=String(d.getDate()).padStart(2,'0'),mon=d.toLocaleDateString('fr-FR',{month:'short'}).replace('.','');
 const cancelled=ev.status==='cancelled';
 let actions='';
 if(can('attendance.write')){
   if(ev.auto){
     actions=`<div class="memberActions visitor-hidden" style="margin-top:7px"><button class="secondaryQuick" onclick="openRecurringOverrideModal('${ev.id}')">${cancelled?'Réactiver / modifier':'Modifier / annuler'}</button></div>`;
   }else{
     actions=`<div class="memberActions visitor-hidden" style="margin-top:7px"><button class="secondaryQuick" onclick="openActivityModal('${ev.id}')">Modifier</button><button class="delete" onclick="deleteActivity('${ev.id}')">Supprimer</button></div>`;
   }
 }
 const tags=`${cancelled?'<span class="cancelTag">ANNULÉE</span>':''}${ev.auto&&ev.overrideReason?'<span class="overrideTag">modifiée</span>':''}`;
 const reason=ev.overrideReason?`<br><b>Motif :</b> ${escapeHtml(ev.overrideReason)}`:'';
 return `<div class="calendarEvent ${cancelled?'cancelled':''}"><div class="dateBadge">${day}<br><span style="font-size:.7rem">${escapeHtml(mon)}</span></div><div style="flex:1"><div class="eventTitle">${escapeHtml(ev.title)} ${tags}</div><div class="eventMeta">${ev.time?escapeHtml(ev.time)+' • ':''}${escapeHtml(ev.location||'')}${ev.note?'<br>'+escapeHtml(ev.note):''}${reason}</div>${actions}</div></div>`
}
function renderCurrentMonthCalendar(){const n=new Date(),ym=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`,events=(isVisitor()&&publicVisitorSnapshot()?visitorPublicCalendarEvents(n.getFullYear()):allCalendarEvents(n.getFullYear())).filter(x=>x.date.startsWith(ym));calendarCurrentTitle.textContent='Activités de '+monthNameFR(ym);calendarCurrentEvents.innerHTML=events.length?events.map(eventCard).join(''):'<div class="empty">Aucune activité enregistrée pour ce mois.</div>'}
function openCalendar(){if(isVisitor()){alert('Le mode visiteur affiche uniquement le calendrier du mois en cours.');return}calendarView.classList.add('open');renderAnnualCalendar()}
function closeCalendar(){calendarView.classList.remove('open')}
function renderAnnualCalendar(selectedYm=''){const n=new Date(),year=selectedYm?Number(selectedYm.slice(0,4)):n.getFullYear(),evs=allCalendarEvents(year);calendarYearTitle.textContent='Calendrier '+year;calendarYearGrid.innerHTML=Array.from({length:12},(_,i)=>{const ym=`${year}-${String(i+1).padStart(2,'0')}`,count=evs.filter(e=>e.date.startsWith(ym)).length;return `<button class="monthBox" onclick="renderCalendarMonth('${ym}')"><b>${escapeHtml(new Date(year,i,1).toLocaleDateString('fr-FR',{month:'long'}))}</b><span>${count} activité(s)</span></button>`}).join('');renderCalendarMonth(selectedYm||`${year}-${String(n.getMonth()+1).padStart(2,'0')}`)}
function renderCalendarMonth(ym){const year=Number(ym.slice(0,4)),events=allCalendarEvents(year).filter(x=>x.date.startsWith(ym));calendarSelectedMonthTitle.textContent='Activités — '+monthNameFR(ym);calendarSelectedEvents.innerHTML=events.length?events.map(eventCard).join(''):'<div class="empty">Aucune activité ce mois.</div>'}

function openRecurringOverrideModal(id){
 if(!requirePermission('attendance.write'))return;
 const ev=allCalendarEvents(Number(id.split('-')[1])).find(x=>x.id===id);
 if(!ev)return;
 overrideEventId.value=id;
 overrideOriginal.innerHTML=`<b>${escapeHtml(ev.title)}</b><div class="memberMeta">${escapeHtml(ev.date)} • ${escapeHtml(ev.time||'')} • ${escapeHtml(ev.location||'')}</div>`;
 overrideStatus.value=ev.status==='cancelled'?'cancelled':'active';
 overrideReason.value=ev.overrideReason||'';
 recurringOverrideModal.classList.add('open')
}
function closeRecurringOverrideModal(){recurringOverrideModal.classList.remove('open')}
function saveRecurringOverride(){
 if(!requirePermission('attendance.write'))return;
 const id=overrideEventId.value,status=overrideStatus.value,reason=(overrideReason.value||'').trim(),overrides=calendarOverrides(),before=overrides[id]||null;
 if(status==='cancelled'&&!reason){alert('Indiquez le motif de l’annulation.');return}
 if(status==='active'&&!reason){
   delete overrides[id];
   saveCalendarOverrides(overrides);
   audit('Prestation régulière rétablie',id,{entity:'calendar_override',entityId:id,before,after:null});
 }else{
   overrides[id]={status,reason,updatedAt:new Date().toISOString(),updatedBy:currentUser()?.name||''};
   saveCalendarOverrides(overrides);
   audit(status==='cancelled'?'Prestation régulière annulée':'Prestation régulière modifiée',`${id} • ${reason}`,{entity:'calendar_override',entityId:id,before,after:overrides[id]});
 }
 closeRecurringOverrideModal();renderCurrentMonthCalendar();if(calendarView.classList.contains('open'))renderAnnualCalendar();refreshHome()
}

function openActivityModal(id=''){if(!requirePermission('attendance.write'))return;const a=customActivities().find(x=>x.id===id);activityId.value=a?.id||'';activityTitle.value=a?.title||'';activityDate.value=a?.date||new Date().toISOString().slice(0,10);activityTime.value=a?.time||'';activityLocation.value=a?.location||'';activityNote.value=a?.note||'';activityStatus.value=a?.status||'active';activityModal.classList.add('open')}
function closeActivityModal(){activityModal.classList.remove('open')}
function saveActivity(){if(!requirePermission('attendance.write'))return;if(!activityTitle.value.trim()||!activityDate.value){alert('Titre et date obligatoires.');return}const list=customActivities(),obj={id:activityId.value||uid(),auto:false,title:activityTitle.value.trim(),date:activityDate.value,time:activityTime.value,location:activityLocation.value.trim(),note:activityNote.value.trim(),status:activityStatus.value||'active',updatedAt:new Date().toISOString()},i=list.findIndex(x=>x.id===obj.id),before=i>=0?JSON.parse(JSON.stringify(list[i])):null;if(i>=0)list[i]=obj;else list.push(obj);saveJSON(CALENDAR_KEY,list);audit(i>=0?'Activité modifiée':'Activité ajoutée',obj.title,{entity:'calendar',entityId:obj.id,before,after:obj});closeActivityModal();renderCurrentMonthCalendar();if(calendarView.classList.contains('open'))renderAnnualCalendar(obj.date.slice(0,7));refreshHome()}
async function deleteActivity(id){if(!requirePermission('attendance.write'))return;const list=customActivities(),a=list.find(x=>x.id===id);if(!a)return;if(!confirm('Supprimer cette activité ?'))return;saveJSON(CALENDAR_KEY,list.filter(x=>x.id!==id));audit('Activité supprimée',a.title,{entity:'calendar',entityId:id,before:a,after:null});renderCurrentMonthCalendar();if(calendarView.classList.contains('open'))renderAnnualCalendar(a.date.slice(0,7));refreshHome()}
function applyVisitorRestrictions(){const visitor=isVisitor();document.body.classList.toggle('visitor-mode',visitor);if(visitor){[viewer,membersView,diagnosticsView,securityView,handoverView,helpView,settingsHub,privacyHub,aboutHub].forEach(v=>{try{v?.classList.remove('open')}catch(e){}})}}


const ATTENDANCE_STATUS_RULES={
 P:{label:'Présent',fine:0,countsAs:'present',motivated:true},
 RM:{label:'Retard motivé',fine:0,countsAs:'late',motivated:true},
 RNM:{label:'Retard non motivé',fine:25,countsAs:'late',motivated:false},
 AM:{label:'Absence motivée',fine:0,countsAs:'absent',motivated:true},
 ANM:{label:'Absence non motivée',fine:50,countsAs:'absent',motivated:false},
 ANMP:{label:'Absence non motivée — prestation',fine:250,countsAs:'absent',motivated:false}
};
function normalizeAttendanceStatus(raw,isPerformance=false){
 const s=String(raw||'').trim().toUpperCase();
 if(['P','PRESENT','PRÉSENT'].includes(s))return 'P';
 if(['RM','RETARD MOTIVE','RETARD MOTIVÉ','R','RETARD EXCUSE','RETARD EXCUSÉ'].includes(s))return 'RM';
 if(['RNM','RETARD NON MOTIVE','RETARD NON MOTIVÉ'].includes(s))return 'RNM';
 if(['AM','ABSENCE MOTIVEE','ABSENCE MOTIVÉE','A','ABSENCE EXCUSEE','ABSENCE EXCUSÉE'].includes(s))return 'AM';
 if(['ANMP','ANM PRESTATION','ABSENCE NON MOTIVEE PRESTATION','ABSENCE NON MOTIVÉE PRESTATION'].includes(s))return 'ANMP';
 if(['ANM','ABSENCE NON MOTIVEE','ABSENCE NON MOTIVÉE'].includes(s))return isPerformance?'ANMP':'ANM';
 return s
}

function monthlySnapshot(month){const f=safeParse(FIN_KEY)||{},a=safeParse(ATT_KEY)||{},members=centralMembers(),es=(f.entries||[]).filter(e=>String(e.date||'').startsWith(month)),calls=(a.calls||[]).filter(c=>String(c.date||'').startsWith(month));const due=es.reduce((s,e)=>s+Number(e.due||0),0),paid=es.reduce((s,e)=>s+Number(e.paid||0),0),balance=es.reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0);let current=0,debtors=0;for(const m of members.filter(x=>x.active)){const b=es.filter(e=>e.memberId===m.id).reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0);if(b>0)debtors++;else current++}let P=0,R=0,A=0,total=0;for(const c of calls)for(const r of Object.values(c.records||{})){if(!r.status)continue;total++;if(r.status==='P')P++;if(r.status==='R'||r.status==='RNM')R++;if(r.status==='A'||r.status==='ANM')A++}return {month,due,paid,balance,recovery:due?Math.round(paid/due*100):0,current,debtors,calls:calls.length,present:P,late:R,absent:A,attendanceRate:total?Math.round(P/total*100):0}}
function renderMonthlyDashboard(){const month=new Date().toISOString().slice(0,7),pub=isVisitor()?publicVisitorSnapshot()?.monthly_dashboard:null,s=pub?{calls:Number(pub.activities||0),attendanceRate:Number(pub.attendance_rate||0),late:Number(pub.late||0),absent:Number(pub.absent||0),due:Number(pub.due||0),paid:Number(pub.paid||0),balance:Number(pub.balance||0),recovery:Number(pub.recovery||0)}:monthlySnapshot(month);monthlyDashboardTitle.textContent=new Date(month+'-01T12:00:00').toLocaleDateString('fr-FR',{month:'long',year:'numeric'});monthlyDashboard.innerHTML=[['Activités',s.calls],['Présence',s.attendanceRate+' %'],['Retards',s.late],['Absences',s.absent],['Dû',money(s.due)],['Encaissé',money(s.paid)],['Créances',money(s.balance)],['Recouvrement',s.recovery+' %']].map(x=>`<div class="diagItem"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}
function renderMonthlyClose(){const month=closeMonth.value||new Date().toISOString().slice(0,7),s=monthlySnapshot(month),cl=safeParse(CLOSE_KEY)||{},saved=cl[month];monthlyCloseBody.innerHTML=`<div class="profilePanel"><div class="memberStats"><div class="mini"><b>${money(s.due)}</b><span>Dû actuel</span></div><div class="mini"><b>${money(s.paid)}</b><span>Payé actuel</span></div><div class="mini"><b>${money(s.balance)}</b><span>Solde actuel</span></div><div class="mini"><b>${s.recovery}%</b><span>Recouvrement</span></div><div class="mini"><b>${s.current}</b><span>À jour</span></div><div class="mini"><b>${s.debtors}</b><span>Débiteurs</span></div></div>${saved?`<div style="margin-top:12px"><span class="lockTag">🔒 Mois clôturé</span><div class="small" style="margin-top:8px">Clôturé le ${new Date(saved.at).toLocaleString('fr-FR')} par ${escapeHtml(saved.by||'—')} • snapshot : dû ${money(saved.snapshot?.due||0)}, payé ${money(saved.snapshot?.paid||0)}, solde ${money(saved.snapshot?.balance||0)}</div>${can('month.reopen')?`<div class="memberActions" style="margin-top:8px"><button class="secondaryQuick" onclick="reopenMonth('${month}')">Réouvrir le mois</button></div>`:''}</div>`:'<div class="small" style="margin-top:12px">Ce mois n’est pas clôturé.</div>'}</div>`}
async function saveMonthlyClose(){if(!requirePermission('month.close'))return;if(!(await criticalGuard('month.close','Clôture mensuelle')))return;const month=closeMonth.value;if(!month)return;const cl=safeParse(CLOSE_KEY)||{};if(cl[month]?.locked){alert('Ce mois est déjà clôturé.');return}const s=monthlySnapshot(month),u=currentUser();cl[month]={at:new Date().toISOString(),note:closeNote.value||'',locked:true,by:u?.name||'',snapshot:s};saveJSON(CLOSE_KEY,cl);audit('Clôture mensuelle',`${month} • solde ${money(s.balance)}`,{entity:'monthly_close',entityId:month,after:cl[month]});renderMonthlyClose();refreshHome()}
function reopenMonth(month){(async()=>{if(!requirePermission('month.reopen'))return;if(!(await criticalGuard('month.reopen','Réouverture du mois '+month)))return;const cl=safeParse(CLOSE_KEY)||{},before=cl[month];if(!before)return;delete cl[month];saveJSON(CLOSE_KEY,cl);audit('Mois réouvert',month,{entity:'monthly_close',entityId:month,before,after:null});renderMonthlyClose();refreshHome()})()}
function diagnosticData(){const members=centralMembers(),ids=new Set(members.map(m=>m.id)),a=safeParse(ATT_KEY)||{},f=safeParse(FIN_KEY)||{},entries=f.entries||[],calls=a.calls||[],payments=safeParse(PAYMENT_LOG_KEY)||[],issues=[],monthly=new Map();for(const e of entries){if(!ids.has(e.memberId))issues.push({severity:'critical',msg:'Écriture sans membre valide : '+e.id});if(Number(e.paid||0)>Number(e.due||0))issues.push({severity:'critical',msg:'Paiement supérieur au dû : '+(e.typeLabel||e.id)});if(Number(e.due||0)<0||Number(e.paid||0)<0)issues.push({severity:'critical',msg:'Montant négatif : '+e.id});if(e.type==='monthly'){const k=e.memberId+'|'+String(e.date||'').slice(0,7);monthly.set(k,(monthly.get(k)||0)+1)}if((e.bridgeAuto||e.auto)&&e.sourceCallId&&!calls.some(c=>c.id===e.sourceCallId))issues.push({severity:'warn',msg:'Amende automatique sans appel source : '+(e.typeLabel||e.id)})}let duplicates=0;for(const [k,n] of monthly)if(n>1){duplicates++;issues.push({severity:'warn',msg:'Cotisation mensuelle en double : '+k+' ('+n+')'})}const ps=new Map();for(const p of payments){const k=[p.memberId,p.date,p.amount,p.ref||''].join('|');ps.set(k,(ps.get(k)||0)+1)}for(const [k,n] of ps)if(n>1){duplicates++;issues.push({severity:'warn',msg:'Paiement potentiellement en double : '+k})}for(const c of calls)for(const [mid,r] of Object.entries(c.records||{})){if(!ids.has(mid))issues.push({severity:'warn',msg:'Présence liée à un membre absent : '+c.date});if((r.status==='R'||r.status==='RNM')&&Number(r.minutes||0)>15)issues.push({severity:'warn',msg:`Retard de ${r.minutes} min le ${c.date} : le règlement prévoit une absence.`})}return {members:members.length,calls:calls.length,entries:entries.length,duplicates,critical:issues.filter(x=>x.severity==='critical').length,issues}}
function openDiagnostics(){if(!roleCanView('diagnostics')){alert('Accès non autorisé pour ce profil.');return}diagnosticsView.classList.add('open');renderDiagnostics()} function closeDiagnostics(){diagnosticsView.classList.remove('open')}
function renderDiagnostics(){const d=diagnosticData(),b=localStorage.getItem(BACKUP_KEY),healthy=d.critical===0&&d.duplicates===0;diagSummary.innerHTML=[['Membres',d.members],['Appels',d.calls],['Écritures',d.entries],['Doublons',d.duplicates],['Critiques',d.critical],['Dernière sauvegarde',b?new Date(b).toLocaleDateString('fr-FR'):'Aucune'],['Statut',healthy?'Système sain':'À vérifier']].map(x=>`<div class="diagItem"><b>${escapeHtml(String(x[1]))}</b><span>${x[0]}</span></div>`).join('');diagIssues.innerHTML=d.issues.length?d.issues.map(i=>`<div class="issueItem ${i.severity==='critical'?'critical':''}">${escapeHtml(i.msg)}</div>`).join(''):'<div class="statusGood">✓ Aucune incohérence détectée.</div>'}
function validateBackupPayload(p){const e=[];if(!p||typeof p!=='object')e.push('JSON invalide');if(!Array.isArray(p?.masterMembers))e.push('Membres absents');if(!p?.attendance||typeof p.attendance!=='object')e.push('Module appel absent');if(!p?.finance||typeof p.finance!=='object')e.push('Module finances absent');return {ok:e.length===0,errors:e,members:Array.isArray(p?.masterMembers)?p.masterMembers.length:0,calls:Array.isArray(p?.attendance?.calls)?p.attendance.calls.length:0,entries:Array.isArray(p?.finance?.entries)?p.finance.entries.length:0}}
function openRestoreTestModal(){restoreTestFile.value='';restoreTestResult.innerHTML='Sélectionnez un fichier.';restoreTestModal.classList.add('open')} function closeRestoreTestModal(){restoreTestModal.classList.remove('open')}
function testBackupFile(){const file=restoreTestFile.files[0];if(!file){alert('Choisissez un fichier JSON.');return}const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result),v=validateBackupPayload(p);restoreTestResult.innerHTML=v.ok?`<div class="statusGood">✓ Sauvegarde valide</div><div class="memberMeta">${v.members} membres • ${v.calls} appels • ${v.entries} écritures</div>`:`<div class="statusBad">Sauvegarde invalide</div><div class="memberMeta">${escapeHtml(v.errors.join(' • '))}</div>`}catch(e){restoreTestResult.innerHTML='<div class="statusBad">JSON illisible ou corrompu.</div>'}};r.readAsText(file)}
async function restorePortalBackup(){if(!requirePermission('restore'))return;if(!(await criticalGuard('restore','Restauration complète')))return;const file=restoreFile.files[0];if(!file){alert('Sélectionnez un JSON.');return}const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result),v=validateBackupPayload(p);if(!v.ok)throw new Error(v.errors.join(' ; '));if(!confirm(`Sauvegarde valide : ${v.members} membres, ${v.calls} appels, ${v.entries} écritures. Restaurer ?`))return;saveJSON(MASTER_KEY,p.masterMembers.map(normalizeMember));saveJSON(ATT_KEY,p.attendance);saveJSON(FIN_KEY,p.finance);if(Array.isArray(p.audit))saveJSON(AUDIT_KEY,p.audit);if(p.monthlyClosings)saveJSON(CLOSE_KEY,p.monthlyClosings);if(Array.isArray(p.paymentLog))saveJSON(PAYMENT_LOG_KEY,p.paymentLog);localStorage.setItem(BACKUP_KEY,new Date().toISOString());audit('Restauration complète',file.name,{entity:'backup',after:{members:v.members,calls:v.calls,entries:v.entries}});syncMembersToApps();syncBridge();closeRestoreModal();refreshHome();alert('Restauration terminée.')}catch(e){alert('Restauration impossible : '+e.message)}};r.readAsText(file)}
function portalBackup(){syncBridge();const a=getAuth(),payload={app:'CHEBSEL Portal Stable',version:'1.5.0',exportedAt:new Date().toISOString(),group:'Chœur d’Homme de l’Église Baptiste Sel et Lumière',sigle:'CHEBSEL',committee:Object.values(a.users).map(x=>({key:x.key,name:x.name,role:x.role,configured:!!x.pinHash})),masterMembers:centralMembers(),attendance:safeParse(ATT_KEY),finance:safeParse(FIN_KEY),audit:safeParse(AUDIT_KEY)||[],paymentLog:safeParse(PAYMENT_LOG_KEY)||[],monthlyClosings:safeParse(CLOSE_KEY)||{},syncReady:{schemaVersion:1,cloudConnected:false,dbName:SYNC_DB_NAME}};const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),ln=document.createElement('a');ln.href=URL.createObjectURL(b);ln.download='Sauvegarde_CHEBSEL_v1_'+new Date().toISOString().slice(0,10)+'.json';ln.click();setTimeout(()=>URL.revokeObjectURL(ln.href),500);localStorage.setItem(BACKUP_KEY,new Date().toISOString());audit('Sauvegarde complète','Export JSON v1.3.0',{entity:'backup'});refreshHome()}
function renderAudit(){const log=safeParse(AUDIT_KEY)||[];auditList.innerHTML=log.length?log.map(x=>`<div class="auditRow"><b>${escapeHtml(x.action)}</b><div class="memberMeta">${new Date(x.at).toLocaleString('fr-FR')} • ${escapeHtml(x.user||'')} • ${escapeHtml(x.role||'')} ${x.details?'• '+escapeHtml(x.details):''}</div>${x.before!==null&&x.before!==undefined?`<details><summary class="memberMeta">Ancien / nouveau</summary><pre style="white-space:pre-wrap;font-size:.72rem">${escapeHtml(JSON.stringify({avant:x.before,apres:x.after},null,2))}</pre></details>`:''}</div>`).join(''):'<div class="empty">Journal vide.</div>'}
async function clearAudit(){if(!requirePermission('audit.clear'))return;if(!(await criticalGuard('audit.clear','Effacement du journal')))return;if(!confirm('Effacer le journal local ?'))return;localStorage.removeItem(AUDIT_KEY);renderAudit()}
function openHandover(){if(!roleCanView('handover')){alert('Accès non autorisé pou pwofil sa a.');return}handoverDate.value=new Date().toISOString().slice(0,10);handoverView.classList.add('open');renderHandover()} function closeHandover(){handoverView.classList.remove('open')}
function renderHandover(){const f=safeParse(FIN_KEY)||{},cl=safeParse(CLOSE_KEY)||{},members=centralMembers(),debt=(f.entries||[]).reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0),last=Object.keys(cl).sort().pop(),b=localStorage.getItem(BACKUP_KEY);handoverBody.innerHTML=`<div class="profilePanel" id="handoverPrint"><h2>FICHE DE PASSATION — CHEBSEL</h2><div class="memberMeta">Chœur d’Homme de l’Église Baptiste Sel et Lumière • v${APP_VERSION}</div><div class="helpSection"><h4>Comité</h4><p>Président : Sinsurin Jacques<br>Secrétaire : Jose Sterlin<br>Trésorier : Chery Agnace</p></div><div class="helpSection"><h4>État</h4><p>Date : ${escapeHtml(handoverDate.value||'—')}<br>Membres : ${members.length}<br>Créances : ${money(debt)}<br>Dernière clôture : ${last||'Aucune'}<br>Dernière sauvegarde : ${b?new Date(b).toLocaleString('fr-FR'):'Aucune'}<br>Observation : ${escapeHtml(handoverNote.value||'—')}</p></div><div class="helpSection"><h4>Avant transfert</h4><p>Faire une sauvegarde JSON, la tester, lancer le diagnostic, remettre le fichier au nouveau comité, puis restaurer et configurer de nouveaux PIN sur le nouvel appareil.</p></div><div style="margin-top:36px;display:flex;justify-content:space-between"><span>Président sortant : __________</span><span>Président entrant : __________</span></div></div>`}
function printHandover(){const e=document.getElementById('handoverPrint');if(!e)return;const w=window.open('','_blank');w.document.write('<html><head><title>Passation CHEBSEL</title></head><body>'+e.outerHTML+'</body></html>');w.document.close();w.print()}
function openHelp(){if(!roleCanView('help')){alert('Accès non autorisé pou pwofil sa a.');return}helpView.classList.add('open');renderHelp()} function closeHelp(){helpView.classList.remove('open')}
function renderHelp(){helpBody.innerHTML=`<h2>CHEBSEL v1.5.1 — Manuel</h2><div class="helpSection"><h4>Connexion</h4><p>Lecture seule par défaut. Le Président initialise le premier PIN; il configure ensuite les PIN du Secrétaire et du Trésorier.</p></div><div class="helpSection"><h4>Rôles</h4><p>Président : accès complet. Secrétaire : membres et appel. Trésorier : finances, paiements et clôture.</p></div><div class="helpSection"><h4>Règles financières</h4><p>Cotisation mensuelle 125 G; RNM 25 G; ANM 50 G; ANM pendant une prestation 250 G.</p></div><div class="helpSection"><h4>Discipline</h4><p>Le règlement prévoit qu’un retard jusqu’à 15 minutes reste un retard; au-delà, il est considéré comme une absence.</p></div><div class="helpSection"><h4>Sauvegarde</h4><p>Sauvegarder après les saisies importantes et au minimum chaque mois. Tester le JSON avant passation/restauration.</p></div><div class="helpSection"><h4>Journal des mises à jour</h4><p><b>v1.5.1 :</b> projet Supabase CHEBSEL préconfiguré avec Project URL et clé publishable publique ; aucun secret serveur n’est intégré. <br><b>v1.5.0 :</b> Cloud Foundation : configuration Supabase, authentification cloud, registre d’appareil et synchronisation pilote Membres + Calendrier. Appels et finances restent locaux. <br><b>v1.4.0 :</b> fondation Sync-Ready hors cloud : IndexedDB locale normalisée, UUID pour les nouveaux enregistrements, migration des données existantes, file d’opérations en attente, tombstones de suppression, métadonnées de version, diagnostic de synchronisation et indicateur en ligne/hors ligne. <br><b>v1.3.2 :</b> normalisation des statuts d’appel : Présent, Retard motivé, RNM, Absence motivée, ANM et ANM prestation ; seules les situations non motivées génèrent une amende. <br><b>v1.3.1 :</b> calendrier entièrement administrable : ajout/modification/suppression d’activités, annulation motivée ou réactivation d’une prestation régulière du 2e dimanche sans supprimer la règle récurrente. <br><b>v1.3.0 :</b> calendrier annuel d’activités avec prestations automatiques tous les 2e dimanches à 7h00 et 17h00 ; mode visiteur limité aux indicateurs synthétiques, calendrier du mois, tableau de bord mensuel et débiteurs. <br><b>v1.2.3 :</b> correction des paiements rendue flexible : remplacement immédiat facultatif ou simple annulation avec réenregistrement ultérieur. <br><b>v1.2.2 :</b> correction et annulation sécurisées des paiements, traçabilité des affectations, restauration automatique des dettes et audit avant/après. <br><b>v1.2.1 :</b> ANM prestation portée à 250 G ; cotisation mensuelle obligatoire de 125 G automatiquement comptabilisée en dette pour chaque mois civil non payé à partir d’août 2026. <br><b>Correctifs v1.1.2 :</b> version visible uniformisée, bug VISITOR_KEY corrigé, connexion forcée à chaque lancement, conservation des PIN déjà enregistrés dans chebsel_auth_v1. <br><b>v1.1.2 :</b> PIN, rôles, lecture seule, verrouillage critique, audit enrichi, détection des doublons, diagnostic, tableau mensuel, clôture verrouillée, passation et test de sauvegarde.</p></div>`}
function refreshHome(){if(isVisitor()){
 const ps=publicVisitorSnapshot();renderBackupHealth();renderMonthlyDashboard();renderCurrentMonthCalendar();updateAuthUI();
 if(ps){homeStats.innerHTML=[["Membres actifs",Number(ps.active_members||0)],["Présents dernier appel",Number(ps.last_attendance?.present||0)],["Dette totale",money(Number(ps.total_debt||0))],["Amendes liées",Number(ps.linked_fines||0)]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');return}
 }
 syncBridge();const members=centralMembers(),a=safeParse(ATT_KEY)||{},f=safeParse(FIN_KEY)||{},calls=Array.isArray(a.calls)?a.calls:[],entries=Array.isArray(f.entries)?f.entries:[],active=members.filter(m=>m.active).length,last=[...calls].sort((x,y)=>(y.date||'').localeCompare(x.date||''))[0];let present='—';if(last?.records)present=Object.values(last.records).filter(r=>r.status==='P').length;const debt=entries.reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0),auto=entries.filter(e=>e.bridgeAuto===true).length;renderBackupHealth();renderMonthlyDashboard();renderCurrentMonthCalendar();updateAuthUI();homeStats.innerHTML=[["Membres actifs",active],["Présents dernier appel",present],["Dette totale",money(debt)],["Amendes liées",auto]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}

cloudConfigModal.addEventListener('click',e=>{if(e.target===cloudConfigModal)closeCloudConfigModal()});memberModal.addEventListener('click',e=>{if(e.target===memberModal)closeMemberModal()});paymentModal.addEventListener('click',e=>{if(e.target===paymentModal)closePaymentModal()});receiptModal.addEventListener('click',e=>{if(e.target===receiptModal)closeReceipt()});restoreModal.addEventListener('click',e=>{if(e.target===restoreModal)closeRestoreModal()});loginModal.addEventListener('click',e=>{if(e.target===loginModal&&(currentUser()||isVisitor()))closeLoginModal()});pinModal.addEventListener('click',e=>{if(e.target===pinModal)closePinModal()});restoreTestModal.addEventListener('click',e=>{if(e.target===restoreTestModal)closeRestoreTestModal()});paymentCorrectionModal.addEventListener('click',e=>{if(e.target===paymentCorrectionModal)closePaymentCorrectionModal()});activityModal.addEventListener('click',e=>{if(e.target===activityModal)closeActivityModal()});recurringOverrideModal.addEventListener('click',e=>{if(e.target===recurringOverrideModal)closeRecurringOverrideModal()});
window.addEventListener('storage',()=>{syncBridge();refreshHome();if(membersView.classList.contains('open'))renderCentralMembers()});
setInterval(()=>{syncBridge();if(!viewer.classList.contains('open')){refreshHome();if(membersView.classList.contains('open'))renderCentralMembers()}},1400);

const _chebselPortalBackup=portalBackup;
portalBackup=function(){if(currentRoleView()!=='president'){alert('Sauvegarde réservée au Président.');return false}return _chebselPortalBackup.apply(this,arguments)};
const _chebselOpenRestoreModal=openRestoreModal;
openRestoreModal=function(){if(currentRoleView()!=='president'){alert('Restauration réservée au Président.');return false}return _chebselOpenRestoreModal.apply(this,arguments)};
const _chebselOpenRestoreTestModal=openRestoreTestModal;
openRestoreTestModal=function(){if(currentRoleView()!=='president'){alert('Test de sauvegarde réservé au Président.');return false}return _chebselOpenRestoreTestModal.apply(this,arguments)};

const _chebselCloudPilotSyncWithFinance=cloudPilotSync;
cloudPilotSync=async function(silent=false){
 const ok=await _chebselCloudPilotSyncWithFinance(silent);
 try{
  if(navigator.onLine&&treasuryRoleAllowed()){
   const ss=await cloudSessionInfo();if(ss){const prof=await getCloudProfile(),org=prof?.organization_id||prof?.org_id,userId=prof?.auth_user_id||ss?.user?.id||'';if(org){await pullCloudExpenses(org);await pushCloudExpenses(org,userId);await pullCloudExpenses(org)}}
  }
 }catch(e){if(!silent)console.warn('Synchronisation dépenses:',e);else console.warn('Auto-sync dépenses:',e)}
 return ok
};

updateCompactStatus();
applyShellTheme(localStorage.getItem(SHELL_THEME)==='dark'?'dark':'light');
initializeMasterMembers();getAuth();syncMembersToApps();applyRegulatoryDefaults();removePrematureCurrentMonthDebts();ensureCompletedMonthlyDebts();syncBridge();updateAuthUI();refreshHome();requireStartupLogin();initSyncReady();updateCloudUI();

window.addEventListener('online',()=>{if(isVisitor())syncVisitorPublicSnapshot(true)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&isVisitor()&&navigator.onLine)syncVisitorPublicSnapshot(true)});
setInterval(()=>{if(isVisitor()&&navigator.onLine)syncVisitorPublicSnapshot(true)},60000);
setTimeout(()=>{if(isVisitor()&&navigator.onLine)syncVisitorPublicSnapshot(true)},700);

// v1.11.2 — proactive PWA update recovery. Never clears CHEBSEL local data.
(function initPwaUpdateRecovery(){
 if(!('serviceWorker' in navigator))return;
 const reloadKey='chebsel_sw_reload_v1111';
 let refreshing=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(refreshing)return;
  refreshing=true;
  if(sessionStorage.getItem(reloadKey)!=='1'){
   sessionStorage.setItem(reloadKey,'1');
   location.reload();
  }
 });
 window.addEventListener('load',async()=>{
  try{
   const reg=await navigator.serviceWorker.register('./sw.js?v=1111',{scope:'./',updateViaCache:'none'});
   await reg.update();
   if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
   reg.addEventListener('updatefound',()=>{
    const nw=reg.installing;
    if(!nw)return;
    nw.addEventListener('statechange',()=>{
     if(nw.state==='installed'&&navigator.serviceWorker.controller){
      nw.postMessage({type:'SKIP_WAITING'});
     }
    });
   });
   setTimeout(()=>reg.update().catch(()=>{}),4000);
  }catch(e){console.warn('CHEBSEL PWA update:',e)}
 });
})();
