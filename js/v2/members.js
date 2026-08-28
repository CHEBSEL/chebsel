import {AppState,updateState} from './app-state.js';
import {navigate} from './router.js';
import {saveMembersCompatible} from './storage.js';

const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>globalThis.crypto?.randomUUID?.()||`m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const money=v=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Number(v||0))+' G';
const fullName=m=>[m?.first,m?.last].filter(Boolean).join(' ').trim()||m?.name||'Sans nom';

function normalizeMember(m={}){
  return {
    ...m,
    id:m.id||uid(),
    no:m.no??m.number??m.matricule??'',
    first:m.first??m.firstName??m.prenom??'',
    last:m.last??m.lastName??m.nom??'',
    sex:m.sex??m.gender??'',
    function:m.function??m.roleLabel??'',
    category:m.category??'Membre',
    group:m.group??'Chœur d’Homme',
    phone:m.phone??m.telephone??'',
    contributionStartMonth:m.contributionStartMonth??String(m.joinedAt||'').slice(0,7),
    active:m.active!==false,
    note:m.note??m.notes??''
  };
}

export function normalizeAllMembers(list){return (Array.isArray(list)?list:[]).map(normalizeMember)}
export function canEditMembers(){return ['president','secretary','treasurer'].includes(AppState.role)}

function attendanceStats(mid){
  const calls=Array.isArray(AppState.data.attendance)?AppState.data.attendance:[];
  const records=[];
  for(const c of calls){const r=c?.records?.[mid];if(r)records.push(r)}
  const status=r=>String(r?.status||'').toUpperCase();
  const present=records.filter(r=>status(r)==='P').length;
  const late=records.filter(r=>['R','RM','RNM'].includes(status(r))).length;
  const absent=records.filter(r=>['A','AM','ANM','ANMP'].includes(status(r))).length;
  const marked=records.length;
  const attendanceRate=marked?Math.round(((present+late)/marked)*100):0;
  const punctualityRate=(present+late)?Math.round((present/(present+late))*100):0;
  return {marked,present,late,absent,attendanceRate,punctualityRate};
}

function financeStats(mid){
  const entries=(Array.isArray(AppState.data.finance)?AppState.data.finance:[]).filter(e=>String(e?.memberId??e?.member_id??'')===String(mid));
  let due=0,paid=0;
  for(const e of entries){
    if(e?.voided===true||e?.cancelled===true||e?.status==='cancelled')continue;
    due+=Number(e?.due??e?.amountDue??0)||0;
    paid+=Number(e?.paid??e?.amountPaid??0)||0;
  }
  return {due,paid,balance:Math.max(0,due-paid),entries:entries.length};
}

function statsStrip(m){
  const a=attendanceStats(m.id),f=financeStats(m.id),wrap=el('div','member-stats');
  [['Activités',a.marked],['Présences',a.present],['Retards',a.late],['Absences',a.absent],['Dette',money(f.balance)]].forEach(([k,v])=>{const x=el('div','member-stat');x.append(el('b','',String(v)),el('span','',k));wrap.append(x)});
  return wrap;
}

function memberCard(m){
  const card=el('article','member-card');
  const head=el('div','member-card-head'),nameBox=el('div');
  nameBox.append(el('h3','',fullName(m)),el('p','muted',`N° ${m.no||'—'}${m.function?' • '+m.function:''}${m.group?' • '+m.group:''}`));
  const badge=el('span',`status-badge ${m.active?'is-active':'is-inactive'}`,m.active?'Actif':'Inactif');head.append(nameBox,badge);card.append(head,statsStrip(m));
  const actions=el('div','member-actions');
  const profile=el('button','btn secondary','Fiche');profile.onclick=()=>{updateState('ui',{selectedMemberId:m.id});navigate('member-profile')};actions.append(profile);
  if(canEditMembers()){
    const edit=el('button','btn secondary','Modifier');edit.onclick=()=>openMemberEditor(m.id);actions.append(edit);
    const toggle=el('button','btn secondary',m.active?'Désactiver':'Réactiver');toggle.onclick=()=>toggleMember(m.id);actions.append(toggle);
  }
  card.append(actions);return card;
}

export function renderMembersPage(){
  const page=el('section','page');
  const head=el('div','page-head split-head'),copy=el('div');copy.append(el('h1','','Membres'),el('p','muted','Registre central CHEBSEL v2 — compatible avec les données v1.'));
  const tools=el('div','member-actions');if(canEditMembers()){const add=el('button','btn primary','+ Ajouter');add.onclick=()=>openMemberEditor();tools.append(add)}head.append(copy,tools);page.append(head);
  const filter=el('div','panel member-toolbar');
  const search=document.createElement('input');search.type='search';search.placeholder='Rechercher nom, prénom, matricule ou téléphone…';search.id='memberSearchV2';
  const status=document.createElement('select');status.id='memberStatusV2';status.innerHTML='<option value="all">Tous les statuts</option><option value="active">Actifs</option><option value="inactive">Inactifs</option>';
  filter.append(search,status);page.append(filter);
  const summary=el('p','muted member-summary');page.append(summary);
  const list=el('div','member-list');page.append(list);
  const render=()=>{
    const q=norm(search.value),s=status.value;
    const rows=normalizeAllMembers(AppState.data.members).filter(m=>{
      if(s==='active'&&!m.active)return false;if(s==='inactive'&&m.active)return false;
      if(!q)return true;return norm([m.no,fullName(m),m.phone,m.function,m.group].join(' ')).includes(q);
    }).sort((a,b)=>fullName(a).localeCompare(fullName(b),'fr'));
    summary.textContent=`${rows.length} membre(s) affiché(s) • ${AppState.data.members.filter(x=>x?.active!==false).length} actif(s)`;
    list.replaceChildren(...(rows.length?rows.map(memberCard):[el('div','panel empty-state','Aucun membre trouvé.')]))
  };
  search.addEventListener('input',render);status.addEventListener('change',render);render();
  return page;
}

export function renderMemberProfile(){
  const id=AppState.ui?.selectedMemberId,m=normalizeAllMembers(AppState.data.members).find(x=>String(x.id)===String(id));
  if(!m){const w=el('section','page');w.append(el('div','panel','Membre introuvable.'));return w}
  const w=el('section','page');const head=el('div','page-head split-head'),copy=el('div');copy.append(el('h1','',fullName(m)),el('p','muted',`Fiche individuelle • N° ${m.no||'—'}`));const actions=el('div','member-actions');
  if(canEditMembers()){const edit=el('button','btn primary','Modifier');edit.onclick=()=>openMemberEditor(m.id);actions.append(edit)}head.append(copy,actions);w.append(head);
  const info=el('div','profile-grid');
  const fields=[['Statut',m.active?'Actif':'Inactif'],['Téléphone',m.phone||'—'],['Fonction',m.function||'—'],['Catégorie',m.category||'—'],['Groupe',m.group||'—'],['Début cotisation',m.contributionStartMonth||'—']];
  for(const [k,v] of fields){const p=el('div','panel profile-field');p.append(el('span','muted',k),el('strong','',v));info.append(p)}w.append(info,statsStrip(m));
  const a=attendanceStats(m.id),f=financeStats(m.id),detail=el('div','profile-grid');
  const p1=el('div','panel');p1.innerHTML=`<h3>Ponctualité</h3><p>Présence : <b>${a.attendanceRate}%</b></p><p>Ponctualité : <b>${a.punctualityRate}%</b></p>`;
  const p2=el('div','panel');p2.innerHTML=`<h3>Situation financière</h3><p>Dû : <b>${esc(money(f.due))}</b></p><p>Payé : <b>${esc(money(f.paid))}</b></p><p>Dette : <b>${esc(money(f.balance))}</b></p>`;
  detail.append(p1,p2);w.append(detail);
  if(m.note){const note=el('div','panel');note.append(el('h3','','Observation'),el('p','',m.note));w.append(note)}
  return w;
}

function editorDialog(){
  let d=document.getElementById('memberEditorV2');if(d)return d;
  d=document.createElement('dialog');d.id='memberEditorV2';d.className='member-dialog';d.innerHTML=`<form method="dialog" id="memberFormV2"><div class="dialog-head"><div><h2 id="memberDialogTitleV2">Membre</h2><p class="muted">Les données restent compatibles avec CHEBSEL v1.</p></div><button type="button" class="icon-close" data-close>×</button></div><input type="hidden" name="id"><div class="form-grid"><label>N° / Matricule<input name="no"></label><label>Prénom(s)<input name="first"></label><label>Nom<input name="last"></label><label>Sexe<select name="sex"><option value="">Non précisé</option><option>Homme</option><option>Femme</option></select></label><label>Fonction<input name="function"></label><label>Catégorie<input name="category" value="Membre"></label><label>Groupe<input name="group" value="Chœur d’Homme"></label><label>Téléphone<input name="phone" inputmode="tel"></label><label>Mois début cotisation<input name="contributionStartMonth" type="month"></label><label>Statut<select name="active"><option value="true">Actif</option><option value="false">Inactif</option></select></label><label class="wide">Observation<textarea name="note"></textarea></label></div><div class="dialog-actions"><button type="button" class="btn secondary" data-close>Annuler</button><button type="submit" class="btn primary">Enregistrer</button></div></form>`;
  document.body.append(d);d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>d.close());
  d.querySelector('form').addEventListener('submit',e=>{e.preventDefault();saveEditor(d)});return d;
}

export function openMemberEditor(id=''){
  if(!canEditMembers())return;
  const d=editorDialog(),f=d.querySelector('form'),m=normalizeAllMembers(AppState.data.members).find(x=>String(x.id)===String(id));f.reset();
  d.querySelector('#memberDialogTitleV2').textContent=m?'Modifier le membre':'Ajouter un membre';
  const src=m||normalizeMember({active:true,category:'Membre',group:'Chœur d’Homme'});
  ['id','no','first','last','sex','function','category','group','phone','contributionStartMonth','note'].forEach(k=>{if(f.elements[k])f.elements[k].value=src[k]??''});f.elements.active.value=String(src.active!==false);d.showModal();
}

function saveEditor(d){
  const f=d.querySelector('form'),fd=new FormData(f);if(!String(fd.get('first')||'').trim()&&!String(fd.get('last')||'').trim()){alert('Antre omwen yon prenon oswa yon non.');return}
  const list=normalizeAllMembers(AppState.data.members),id=String(fd.get('id')||'')||uid(),i=list.findIndex(x=>String(x.id)===id),base=i>=0?list[i]:{};
  const m=normalizeMember({...base,id,no:String(fd.get('no')||'').trim(),first:String(fd.get('first')||'').trim(),last:String(fd.get('last')||'').trim(),sex:String(fd.get('sex')||''),function:String(fd.get('function')||'').trim(),category:String(fd.get('category')||'').trim()||'Membre',group:String(fd.get('group')||'').trim()||'Chœur d’Homme',phone:String(fd.get('phone')||'').trim(),contributionStartMonth:String(fd.get('contributionStartMonth')||''),active:String(fd.get('active'))==='true',note:String(fd.get('note')||'').trim()});
  if(i>=0)list[i]=m;else list.push(m);persist(list);d.close();
  if(AppState.route==='member-profile')updateState('ui',{selectedMemberId:m.id});
  window.CHEBSEL?.rerender?.();
}

function toggleMember(id){
  const list=normalizeAllMembers(AppState.data.members),i=list.findIndex(x=>String(x.id)===String(id));if(i<0)return;list[i]={...list[i],active:!list[i].active};persist(list);window.CHEBSEL?.rerender?.();
}

function persist(list){saveMembersCompatible(list);updateState('data',{...AppState.data,members:list})}

export function registerMemberRoutes(registerRoute){registerRoute('members',renderMembersPage);registerRoute('member-profile',renderMemberProfile)}
