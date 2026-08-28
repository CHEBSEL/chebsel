import {AppState,updateState} from './app-state.js';

const KEYS={
  members:'chebsel_master_members_v1',
  attendance:'chebsel_attendance_app_v1',
  finance:'chebsel_finance_app_v1',
  session:'chebsel_v2_session',
  settings:'chebsel_v2_settings'
};

function parse(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}}
export function save(key,value){localStorage.setItem(key,JSON.stringify(value))}

export function loadLocalData(){
  const members=parse(KEYS.members,[]);
  const attendanceRaw=parse(KEYS.attendance,{});
  const financeRaw=parse(KEYS.finance,{});
  const settings=parse(KEYS.settings,{});
  updateState('data',{
    members:Array.isArray(members)?members:[],
    attendance:Array.isArray(attendanceRaw?.calls)?attendanceRaw.calls:[],
    finance:Array.isArray(financeRaw?.entries)?financeRaw.entries:[],
    settings
  });
  return AppState.data;
}

export function loadSession(){return parse(KEYS.session,null)}
export function saveSession(session){save(KEYS.session,session)}
export function clearSession(){localStorage.removeItem(KEYS.session)}
export {KEYS};
