const SUPABASE_URL='https://obgpocmsmtlpvfwblqvi.supabase.co';
const SUPABASE_KEY='sb_publishable_-EcBi0HIvojuaEuzqvORRA_xwAnRFYV';
const SESSION_KEY=location.pathname.includes('/v2-preview/')?'chebsel_v2_preview_cloud_session':'chebsel_v2_cloud_session';
let session=null;
const headers=(token=session?.access_token,extra={})=>({'apikey':SUPABASE_KEY,'Content-Type':'application/json',...(token?{'Authorization':`Bearer ${token}`}:{ }),...extra});
function saveSession(s){session=s||null;if(s)localStorage.setItem(SESSION_KEY,JSON.stringify(s));else localStorage.removeItem(SESSION_KEY)}
function loadStored(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
async function authRequest(path,body){const r=await fetch(`${SUPABASE_URL}/auth/v1/${path}`,{method:'POST',headers:headers(null),body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j?.msg||j?.message||j?.error_description||`Auth ${r.status}`);return j}
export async function signInPassword(email,password){const s=await authRequest('token?grant_type=password',{email,password});saveSession(s);return s}
export async function refreshCloudSession(){const old=session||loadStored();if(!old?.refresh_token)return null;try{const s=await authRequest('token?grant_type=refresh_token',{refresh_token:old.refresh_token});saveSession(s);return s}catch{saveSession(null);return null}}
export async function restoreCloudSession(){session=loadStored();if(!session)return null;const exp=Number(session.expires_at||0)*1000;if(!exp||exp-Date.now()<120000)return refreshCloudSession();return session}
export function cloudSession(){return session||loadStored()}
export function clearCloudSession(){session=null;localStorage.removeItem(SESSION_KEY)}
export async function cloudSignOut(){const s=cloudSession();if(s?.access_token)try{await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:'POST',headers:headers(s.access_token)})}catch{}clearCloudSession()}
async function request(path,{method='GET',body=null,prefer='',retry=true}={}){let s=cloudSession();if(!s?.access_token)throw new Error('Cloud session absente');const opts={method,headers:headers(s.access_token,prefer?{'Prefer':prefer}:{})};if(body!=null)opts.body=JSON.stringify(body);let r=await fetch(`${SUPABASE_URL}${path}`,opts);if(r.status===401&&retry){s=await refreshCloudSession();if(!s)throw new Error('Session cloud expirée');return request(path,{method,body,prefer,retry:false})}const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!r.ok)throw new Error(data?.message||data?.hint||`Supabase ${r.status}`);return data}
export const restSelect=(table,query='select=*')=>request(`/rest/v1/${table}?${query}`);
export const restInsert=(table,rows)=>request(`/rest/v1/${table}`,{method:'POST',body:rows,prefer:'return=representation'});
export const restUpdate=(table,query,patch)=>request(`/rest/v1/${table}?${query}`,{method:'PATCH',body:patch,prefer:'return=representation'});
export const rpc=(fn,args={})=>request(`/rest/v1/rpc/${fn}`,{method:'POST',body:args});
export async function getMyProfile(){const s=cloudSession();const uid=s?.user?.id;if(!uid)return null;const rows=await restSelect('user_profiles',`select=auth_user_id,organization_id,role,display_name,active&auth_user_id=eq.${encodeURIComponent(uid)}&active=eq.true&limit=1`);return rows?.[0]||null}
export {SUPABASE_URL,SUPABASE_KEY};
