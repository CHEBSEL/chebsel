import {AppState,updateState} from './app-state.js';

const KEYS={
  members:'chebsel_master_members_v1',
  attendance:'chebsel_attendance_app_v1',
  finance:'chebsel_finance_app_v1',
  session:'chebsel_v2_session',
  settings:'chebsel_v2_settings'
};

function parse(key,fallback){try{const raw=localStorage.getItem(key);if(raw==null)return fallback;const v=JSON.parse(raw);return v??fallback}catch{return fallback}}
export function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
export function readRaw(key,fallback={}){return parse(key,fallback)}
export function readAttendanceEnvelope(){const v=parse(KEYS.attendance,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
export function readFinanceEnvelope(){const v=parse(KEYS.finance,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}

export function loadLocalData(){
  let members=parse(KEYS.members,[]);
  const attendanceRaw=readAttendanceEnvelope();
  const financeRaw=readFinanceEnvelope();
  const settings=parse(KEYS.settings,{});
  if(!Array.isArray(members)||!members.length){
    if(Array.isArray(attendanceRaw?.members)&&attendanceRaw.members.length)members=attendanceRaw.members;
    else if(Array.isArray(financeRaw?.members)&&financeRaw.members.length)members=financeRaw.members;
    else members=[];
  }
  updateState('data',{
    members:Array.isArray(members)?members:[],
    attendance:Array.isArray(attendanceRaw?.calls)?attendanceRaw.calls:[],
    finance:Array.isArray(financeRaw?.entries)?financeRaw.entries:[],
    expenses:Array.isArray(financeRaw?.expenses)?financeRaw.expenses:[],
    financeSettings:financeRaw?.settings&&typeof financeRaw.settings==='object'?financeRaw.settings:{},
    settings
  });
  return AppState.data;
}

export function saveMembersCompatible(members){
  const list=Array.isArray(members)?members:[];save(KEYS.members,list);
  const attendanceRaw=parse(KEYS.attendance,null);if(attendanceRaw&&typeof attendanceRaw==='object'&&!Array.isArray(attendanceRaw))save(KEYS.attendance,{...attendanceRaw,members:list.map(m=>({...m}))});
  const financeRaw=parse(KEYS.finance,null);if(financeRaw&&typeof financeRaw==='object'&&!Array.isArray(financeRaw))save(KEYS.finance,{...financeRaw,members:list.map(m=>({...m}))});
  return list;
}

export function saveAttendanceCompatible(calls,settingsPatch=null){
  const current=readAttendanceEnvelope();const next={...current,members:(AppState.data.members||current.members||[]).map(m=>({...m})),calls:Array.isArray(calls)?calls:[]};
  if(settingsPatch&&typeof settingsPatch==='object')next.settings={...(current.settings||{}),...settingsPatch};save(KEYS.attendance,next);return next;
}

export function saveFinanceCompatible({entries,expenses,settings}={}){
  const current=readFinanceEnvelope();
  const next={
    ...current,
    members:(AppState.data.members||current.members||[]).map(m=>({...m})),
    entries:Array.isArray(entries)?entries:(Array.isArray(current.entries)?current.entries:[]),
    expenses:Array.isArray(expenses)?expenses:(Array.isArray(current.expenses)?current.expenses:[]),
    settings:settings&&typeof settings==='object'?{...(current.settings||{}),...settings}:(current.settings||{})
  };
  save(KEYS.finance,next);return next;
}

export function loadSession(){return parse(KEYS.session,null)}
export function saveSession(session){save(KEYS.session,session)}
export function clearSession(){localStorage.removeItem(KEYS.session)}
export {KEYS};
