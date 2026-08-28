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

export function loadLocalData(){
  let members=parse(KEYS.members,[]);
  const attendanceRaw=parse(KEYS.attendance,{});
  const financeRaw=parse(KEYS.finance,{});
  const settings=parse(KEYS.settings,{});

  // Compatibility fallback: older CHEBSEL builds may have members only inside Appel or Finance.
  if(!Array.isArray(members)||!members.length){
    if(Array.isArray(attendanceRaw?.members)&&attendanceRaw.members.length)members=attendanceRaw.members;
    else if(Array.isArray(financeRaw?.members)&&financeRaw.members.length)members=financeRaw.members;
    else members=[];
  }

  updateState('data',{
    members:Array.isArray(members)?members:[],
    attendance:Array.isArray(attendanceRaw?.calls)?attendanceRaw.calls:[],
    finance:Array.isArray(financeRaw?.entries)?financeRaw.entries:[],
    settings
  });
  return AppState.data;
}

export function saveMembersCompatible(members){
  const list=Array.isArray(members)?members:[];
  // Canonical v1 master registry remains the source of truth so v1 and v2 can coexist during migration.
  save(KEYS.members,list);

  // Preserve every unknown property/history from v1 Appel and Finance; replace only their member lists.
  const attendanceRaw=parse(KEYS.attendance,null);
  if(attendanceRaw&&typeof attendanceRaw==='object'&&!Array.isArray(attendanceRaw)){
    save(KEYS.attendance,{...attendanceRaw,members:list.map(m=>({...m}))});
  }
  const financeRaw=parse(KEYS.finance,null);
  if(financeRaw&&typeof financeRaw==='object'&&!Array.isArray(financeRaw)){
    save(KEYS.finance,{...financeRaw,members:list.map(m=>({...m}))});
  }
  return list;
}

export function loadSession(){return parse(KEYS.session,null)}
export function saveSession(session){save(KEYS.session,session)}
export function clearSession(){localStorage.removeItem(KEYS.session)}
export {KEYS};
