import {AppState,updateState} from './app-state.js';
import {navigate} from './router.js';
import {saveAttendanceCompatible,readAttendanceEnvelope} from './storage.js';

const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const uid=()=>globalThis.crypto?.randomUUID?.()||`call_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const fullName=m=>[m?.first,m?.last].filter(Boolean).join(' ').trim()||m?.name||'Sans nom';
const today=()=>new Date().toISOString().slice(0,10);

export const STATUS={
  '':{label:'— Non marqué —',kind:'none',fine:0},
  P:{label:'Présent',kind:'present',fine:0},
  RM:{label:'Retard motivé',kind:'late',fine:0},
  RNM:{label:'Retard non motivé',kind:'late',fine:25},
  AM:{label:'Absence motivée',kind:'absent',fine:0},
  ANM:{label:'Absence non motivée',kind:'absent',fine:50},
  ANMP:{label:'Absence non motivée — prestation',kind:'absent',fine:250}
};

export function normalizeAttendanceStatus(raw,isPerformance=false){
  const s=String(raw||'').trim().toUpperCase();
  if(['P','PRESENT','PRÉSENT'].includes(s))return 'P';
  if(['RM','RETARD MOTIVE','RETARD MOTIVÉ','R','RETARD EXCUSE','RETARD EXCUSÉ'].includes(s))return 'RM';
  if(['RNM','RETARD NON MOTIVE','RETARD NON MOTIVÉ'].includes(s))return 'RNM';
  if(['AM','ABSENCE MOTIVEE','ABSENCE MOTIVÉE','A','ABSENCE EXCUSEE','ABSENCE EXCUSÉE'].includes(s))return 'AM';
  if(['ANMP','ANM PRESTATION','ABSENCE NON MOTIVEE PRESTATION','ABSENCE NON MOTIVÉE PRESTATION'].includes(s))return 'ANMP';
  if(['ANM','ABSENCE NON MOTIVEE','ABSENCE NON MOTIVÉE'].includes(s))return isPerformance?'ANMP':'ANM';
  return STATUS[s]?s:'';
}

function canEdit(){return ['president','secretary'].includes(AppState.role)}
function activeMembers(){return (AppState.data.members||[]).filter(m=>m?.active!==false).sort((a,b)=>fullName(a).localeCompare(fullName(b),'fr'))}
function calls(){return Array.isArray(AppState.data.attendance)?AppState.data.attendance:[]}
function settings(){return readAttendanceEnvelope().settings||{}}
function isPerformance(call){const s=norm(`${call?.type||''} ${call?.activity||''}`);return s.includes('prestation')||s.includes('concert')}
function selectedCall(){const id=AppState.ui?.selectedAttendanceCallId;return calls().find(c=>String(c?.id)===String(id))||null}

function pageHead(title,subtitle){const h=el('div','page-head split-head'),copy=el('div');copy.append(el('h1','',title),el('p','muted',subtitle));h.append(copy);return h}
function field(label,input){const w=el('label','form-field');w.append(el('span','',label),input);return w}
function input(type,name,value=''){const x=document.createElement('input');x.type=type;x.name=name;x.value=value||'';return x}
function select(name,options,value=''){const x=document.createElement('select');x.name=name;for(const [v,l] of options){const o=document.createElement('option');o.value=v;o.textContent=l;x.append(o)}x.value=value||'';return x}

export function renderAttendancePage(){
  const existing=selectedCall(),cfg=settings(),editable=canEdit();
  const w=el('section','page');const head=pageHead(existing?'Modifier l’appel':'Fiche d’Appel','Présence, retards et absences — CHEBSEL v2');
  const actions=el('div','member-actions');
  const hist=el('button','btn secondary','Historique');hist.onclick=()=>navigate('attendance-history');actions.append(hist);
  if(editable){const par=el('button','btn secondary','Paramètres');par.onclick=()=>navigate('attendance-settings');actions.append(par)}head.append(actions);w.append(head);

  const meta=el('div','panel attendance-meta');
  const date=input('date','date',existing?.date||today());
  const activity=input('text','activity',existing?.activity||cfg.defaultActivity||'Répétition');activity.placeholder='Ex. Répétition, culte, prestation…';
  const type=select('type',[['regular','Activité régulière'],['performance','Prestation / concert'],['meeting','Réunion'],['other','Autre']],existing?.type||(isPerformance(existing)?'performance':cfg.defaultType||'regular'));
  const note=input('text','note',existing?.note||existing?.notes||'');note.placeholder='Observation générale facultative';
  meta.append(field('Date',date),field('Activité',activity),field('Type',type),field('Observation',note));w.append(meta);

  const summary=el('div','attendance-live-summary');w.append(summary);
  const list=el('div','attendance-list');w.append(list);
  const records={};
  const performance=()=>type.value==='performance'||norm(activity.value).includes('prestation')||norm(activity.value).includes('concert');

  for(const m of activeMembers()){
    const old=existing?.records?.[m.id]||{};const row=el('article','attendance-row');
    const who=el('div','attendance-person');who.append(el('strong','',fullName(m)),el('span','muted',`N° ${m.no||'—'}`));
    const st=select('status',Object.entries(STATUS).map(([k,v])=>[k,v.label]),normalizeAttendanceStatus(old.status,isPerformance(existing)));
    const obs=input('text','memberNote',old.note||old.reason||old.observation||'');obs.placeholder='Motif / observation';
    if(!editable){st.disabled=true;obs.disabled=true}
    const normalizeForType=()=>{if(st.value==='ANM'&&performance())st.value='ANMP';if(st.value==='ANMP'&&!performance())st.value='ANM';updateLive()};
    st.addEventListener('change',normalizeForType);obs.addEventListener('input',()=>{});
    records[m.id]={statusEl:st,noteEl:obs};row.append(who,st,obs);list.append(row);
  }

  function updateLive(){let p=0,l=0,a=0,u=0;for(const r of Object.values(records)){const s=normalizeAttendanceStatus(r.statusEl.value,performance());if(s==='P')p++;else if(['RM','RNM'].includes(s))l++;else if(['AM','ANM','ANMP'].includes(s))a++;else u++}summary.textContent=`Présents ${p} • Retards ${l} • Absents ${a} • Non marqués ${u}`}
  list.addEventListener('change',updateLive);updateLive();

  if(editable){
    const saveBar=el('div','sticky-save-bar');
    const save=el('button','btn primary',existing?'Enregistrer les modifications':'Enregistrer l’appel');
    save.onclick=()=>{
      if(!date.value){alert('Chwazi dat aktivite a.');return}
      if(!activity.value.trim()){alert('Antre non aktivite a.');return}
      const rec={};for(const [mid,r] of Object.entries(records)){const s=normalizeAttendanceStatus(r.statusEl.value,performance());if(!s)continue;rec[mid]={...(existing?.records?.[mid]||{}),status:s,note:r.noteEl.value.trim()}}
      const now=new Date().toISOString();const call={...(existing||{}),id:existing?.id||uid(),date:date.value,activity:activity.value.trim(),type:type.value,note:note.value.trim(),records:rec,createdAt:existing?.createdAt||now,updatedAt:now};
      const next=[...calls()];const i=next.findIndex(c=>String(c?.id)===String(call.id));if(i>=0)next[i]=call;else next.push(call);
      saveAttendanceCompatible(next);updateState('data',{...AppState.data,attendance:next});updateState('ui',{...(AppState.ui||{}),selectedAttendanceCallId:call.id});
      save.textContent='Enregistré ✓';setTimeout(()=>{save.textContent='Enregistrer les modifications'},700);
    };
    const fresh=el('button','btn secondary','Nouvel appel');fresh.onclick=()=>{updateState('ui',{...(AppState.ui||{}),selectedAttendanceCallId:null});window.CHEBSEL?.rerender?.()};
    saveBar.append(save,fresh);w.append(saveBar);
  }
  return w;
}

function callStats(call){let present=0,late=0,absent=0,total=0;for(const r of Object.values(call?.records||{})){const s=normalizeAttendanceStatus(r?.status,isPerformance(call));if(!s)continue;total++;if(s==='P')present++;else if(['RM','RNM'].includes(s))late++;else if(['AM','ANM','ANMP'].includes(s))absent++}return {present,late,absent,total,rate:total?Math.round(((present+late)/total)*100):0}}

export function renderAttendanceHistory(){
  const w=el('section','page');w.append(pageHead('Historique des appels','Rechercher, analyser et relouvrir un appel existant.'));
  const tools=el('div','panel member-toolbar');const q=input('search','q','');q.placeholder='Rechercher activité ou date…';const month=input('month','month','');tools.append(q,month);w.append(tools);
  const summary=el('div','attendance-live-summary');w.append(summary);const list=el('div','attendance-history-list');w.append(list);
  const render=()=>{
    const needle=norm(q.value),mo=month.value;let rows=[...calls()].filter(c=>(!mo||String(c.date||'').startsWith(mo))&&(!needle||norm(`${c.date} ${c.activity} ${c.type}`).includes(needle))).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    let P=0,L=0,A=0,T=0;for(const c of rows){const s=callStats(c);P+=s.present;L+=s.late;A+=s.absent;T+=s.total}summary.textContent=`${rows.length} appel(s) • Présents ${P} • Retards ${L} • Absents ${A} • Présence ${(T?Math.round(((P+L)/T)*100):0)}%`;
    list.replaceChildren();if(!rows.length){list.append(el('div','panel empty-state','Aucun appel trouvé.'));return}
    for(const c of rows){const s=callStats(c),row=el('article','panel history-call');const copy=el('div');copy.append(el('h3','',c.activity||'Activité'),el('p','muted',`${c.date||'—'} • Présence ${s.rate}% • P ${s.present} / R ${s.late} / A ${s.absent}`));const open=el('button','btn secondary',canEdit()?'Ouvrir / modifier':'Consulter');open.onclick=()=>{updateState('ui',{...(AppState.ui||{}),selectedAttendanceCallId:c.id});navigate('attendance')};row.append(copy,open);list.append(row)}
  };
  q.addEventListener('input',render);month.addEventListener('change',render);render();return w;
}

export function renderAttendanceSettings(){
  if(!canEdit()){const w=el('section','page');w.append(el('div','panel','Accès réservé au Président et au Secrétaire.'));return w}
  const cfg=settings(),w=el('section','page');w.append(pageHead('Paramètres de l’appel','Paramètres propres à la fiche d’appel; aucune boucle de rafraîchissement.'));
  const form=el('div','panel settings-form');const activity=input('text','defaultActivity',cfg.defaultActivity||'Répétition');const type=select('defaultType',[['regular','Activité régulière'],['performance','Prestation / concert'],['meeting','Réunion'],['other','Autre']],cfg.defaultType||'regular');form.append(field('Activité par défaut',activity),field('Type par défaut',type));
  const rules=el('div','panel');rules.innerHTML='<h3>Règles canoniques</h3><p>P = Présent • RM = Retard motivé • RNM = Retard non motivé (25 G) • AM = Absence motivée • ANM = Absence non motivée (50 G) • ANMP = Absence non motivée lors d’une prestation (250 G).</p><p class="muted">Les montants financiers seront centralisés dans le module Finance v2; l’Appel conserve seulement les statuts sources.</p>';
  const save=el('button','btn primary','Enregistrer les paramètres');save.onclick=()=>{const env=readAttendanceEnvelope();saveAttendanceCompatible(calls(),{...(env.settings||{}),defaultActivity:activity.value.trim()||'Répétition',defaultType:type.value});save.textContent='Enregistré ✓';setTimeout(()=>save.textContent='Enregistrer les paramètres',700)};
  w.append(form,rules,save);return w;
}

export function registerAttendanceRoutes(registerRoute){
  registerRoute('attendance',renderAttendancePage);
  registerRoute('attendance-settings',renderAttendanceSettings);
  registerRoute('attendance-history',renderAttendanceHistory);
}
