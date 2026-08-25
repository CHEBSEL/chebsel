from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('CHEBSEL v1.7.4 — Centre de gestion','CHEBSEL v1.8.0 — Centre de gestion')
s=s.replace("const APP_VERSION='1.7.4';","const APP_VERSION='1.8.0';")
s=s.replace('<span class="versionChip">v1.7.4</span>','<span class="versionChip">v1.8.0</span>')

old="""function syncReadyOnLocalWrite(k,v){
 if(SYNC_TRACKED_KEYS.has(k)&&!SYNC_READY_BOOTING)syncReadySchedule()
}"""
new="""function syncReadyOnLocalWrite(k,v){
 if(SYNC_TRACKED_KEYS.has(k)&&!SYNC_READY_BOOTING){syncReadySchedule();scheduleAutoCloudSync('local-write')}
}"""
assert old in s
s=s.replace(old,new)

anchor="""async function bindLocalSessionToCloud(profile,method='cloud'){
"""
insert="""const ROLE_CLOUD_EMAILS={president:'presidanchebsel@outlook.fr',secretary:'secretairechebsel@gmail.com',treasurer:'tresorierdugroupe@outlook.com'};
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
async function bindOfflineSession(role){
 const u=getAuth().users[role];if(!u)throw new Error('Rôle local introuvable.');
 sessionStorage.removeItem(VISITOR_KEY);sessionStorage.setItem(SESSION_KEY,JSON.stringify({key:role,at:new Date().toISOString(),method:'offline-password'}));
 loginModal.classList.remove('open');updateAuthUI();refreshHome();
}
function scheduleAutoCloudSync(reason='auto',delay=1200){
 if(!navigator.onLine||AUTO_CLOUD_SYNC_RUNNING||isVisitor())return;
 clearTimeout(AUTO_CLOUD_SYNC_TIMER);AUTO_CLOUD_SYNC_TIMER=setTimeout(()=>autoCloudSync(reason),delay)
}
async function autoCloudSync(reason='auto'){
 if(AUTO_CLOUD_SYNC_RUNNING||!navigator.onLine||isVisitor())return false;
 try{const ss=await cloudSessionInfo();if(!ss)return false;AUTO_CLOUD_SYNC_RUNNING=true;return await cloudPilotSync(true)}catch(e){console.warn('Auto-sync CHEBSEL:',e)}finally{AUTO_CLOUD_SYNC_RUNNING=false}
 return false
}
window.addEventListener('online',()=>scheduleAutoCloudSync('internet-retabli',250));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleAutoCloudSync('retour-app',400)});
setInterval(()=>{if(navigator.onLine) scheduleAutoCloudSync('periodique',250)},60000);

"""+anchor
assert anchor in s
s=s.replace(anchor,insert,1)

start=s.index('async function loginUserAction(){')
end=s.index('\nfunction logoutUser()',start)
new_login="""async function loginUserAction(){
 const role=loginUser.value,password=loginPin.value;
 if(!['president','secretary','treasurer'].includes(role)){alert('Chwazi yon responsab.');return}
 if(!password||password.length<6){alert('Antre Mot de passe CHEBSEL la.');return}
 if(navigator.onLine){
  try{
   const c=await getCloudClient(),email=ROLE_CLOUD_EMAILS[role];
   const {data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;
   const profile=await ensureAuthorizedCloudProfile();
   if(String(profile?.role||'').toLowerCase()!==role){await c.auth.signOut();throw new Error('Kont sa a pa koresponn ak wòl ou chwazi a.')}
   await cacheOfflinePassword(role,password,data.user?.id||'');
   await bindLocalSessionToCloud(profile,'password');await registerCloudDevice();
   loginPin.value='';scheduleAutoCloudSync('login',250)
  }catch(e){alert('Mot de passe CHEBSEL pa kòrèk oswa koneksyon an echwe : '+e.message)}
  return
 }
 const ok=await verifyOfflinePassword(role,password);
 if(!ok){alert('Premye koneksyon sou aparèy sa a dwe fèt ak entènèt. Si aparèy la te deja aktive, verifye modpas la.');return}
 await bindOfflineSession(role);loginPin.value=''
}"""
s=s[:start]+new_login+s[end:]

s=s.replace("loginHelp.textContent='Le même code d’accès fonctionne sur tous les appareils. Les anciens PIN locaux restent acceptés sur l’appareil où ils ont été configurés.';","loginHelp.textContent='Chwazi wòl ou epi antre Mot de passe CHEBSEL ou. Menm modpas la mache online ak offline apre premye koneksyon sou aparèy la.';")
s=s.replace('Code d’accès / PIN','Mot de passe CHEBSEL')
s=s.replace('PIN personnel','Mot de passe')

s=s.replace('async function cloudPilotSync(){', 'async function cloudPilotSync(silent=false){')
s=s.replace("if(isVisitor()){alert('Accès réservé aux responsables.');return}\n if(!navigator.onLine){alert('Pas d’Internet. Les modifications restent locales.');return}","if(isVisitor()){if(!silent)alert('Accès réservé aux responsables.');return false}\n if(!navigator.onLine){if(!silent)alert('Pas d’Internet. Les modifications restent locales.');return false}")
old_alert="""  alert(`Synchronisation terminée. Membres: ${rm}. Calendrier: ${rc}. Appels cloud: ${ra.events}; présences cloud: ${ra.records}. Finances cloud APRÈS sync: ${rf.entries} écriture(s)/dette(s), ${rf.payments} paiement(s), ${rf.allocations} allocation(s), ${rf.closings} clôture(s). Envoyés: ${pa.events} appel(s), ${pa.records} présence(s), ${pf.entries} écriture(s), ${pf.payments} paiement(s), ${pf.allocations} allocation(s), ${pf.closings} clôture(s).`)
 }catch(e){
  cloudState.textContent='🔴 Erreur de synchronisation';
  alert('Synchronisation cloud impossible : '+e.message);
  updateCloudUI()
 }"""
new_alert="""  if(!silent)alert(`Synchronisation terminée. Membres: ${rm}. Calendrier: ${rc}. Appels cloud: ${ra.events}; présences cloud: ${ra.records}. Finances cloud APRÈS sync: ${rf.entries} écriture(s)/dette(s), ${rf.payments} paiement(s), ${rf.allocations} allocation(s), ${rf.closings} clôture(s). Envoyés: ${pa.events} appel(s), ${pa.records} présence(s), ${pf.entries} écriture(s), ${pf.payments} paiement(s), ${pf.allocations} allocation(s), ${pf.closings} clôture(s).`);
  return true
 }catch(e){
  cloudState.textContent='🔴 Erreur de synchronisation';
  if(!silent)alert('Synchronisation cloud impossible : '+e.message);else console.warn('Synchronisation cloud impossible :',e);
  updateCloudUI();return false
 }"""
assert old_alert in s
s=s.replace(old_alert,new_alert)

s=s.replace('↕ Synchroniser cloud','↕ Synchroniser maintenant')
s=s.replace('Cloud actif pour Membres, Calendrier, Appels et Finances. Les droits d’écriture dépendent du rôle.','Synchronisation automatique active : les changements restent disponibles hors ligne et partent vers le cloud dès que la connexion revient. Les droits dépendent du rôle.')

p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
ws=sw.read_text(encoding='utf-8').replace("chebsel-pwa-stable-v174","chebsel-pwa-stable-v180")
sw.write_text(ws,encoding='utf-8')
print('patched v1.8.0')
