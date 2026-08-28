export const APP_VERSION='2.0.0-alpha.10';
const listeners=new Set();
export const AppState={version:APP_VERSION,boot:{ready:false,error:null},user:null,role:'visitor',route:'home',navigationStack:['home'],data:{members:[],attendance:[],finance:[],expenses:[],financeSettings:{},settings:{},conflicts:[]},ui:{selectedMemberId:null,selectedAttendanceCallId:null},syncStatus:{online:navigator.onLine,state:'idle',lastSync:null,pending:0},notifications:{unread:0,items:[]}};
export function setState(patch){Object.assign(AppState,patch);listeners.forEach(fn=>{try{fn(AppState)}catch(e){console.error('CHEBSEL state listener',e)}})}
export function updateState(section,patch){AppState[section]={...(AppState[section]||{}),...patch};listeners.forEach(fn=>{try{fn(AppState)}catch(e){console.error('CHEBSEL state listener',e)}})}
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
