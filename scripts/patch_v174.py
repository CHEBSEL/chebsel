from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.7.3 — Centre de gestion','CHEBSEL v1.7.4 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.7.3</span>','<span class="versionChip">v1.7.4</span>')
s=s.replace("const APP_VERSION='1.7.3';","const APP_VERSION='1.7.4';")
old='''<div class="modalActions"><button class="save" onclick="loginUserAction()">Connexion</button><button class="cancel" onclick="enterVisitorMode()">👁 Accès visiteur</button></div><div class="permissionNote" style="margin-top:10px">Accès visiteur : consultation uniquement. Aucune modification, suppression, restauration, clôture ou paiement n’est autorisé.</div>'''
new='''<div class="modalActions"><button class="save" onclick="cloudSignInFromLogin()">☁️ Connexion cloud</button><button class="secondaryQuick" onclick="cloudSignUpFromLogin()">🆕 Activer mon compte</button></div><div class="modalActions"><button class="secondaryQuick" onclick="loginUserAction()">🔒 Déverrouillage local</button><button class="cancel" onclick="enterVisitorMode()">👁 Accès visiteur</button></div><div class="permissionNote" style="margin-top:10px">Sur un nouvel appareil, une connexion cloud est obligatoire avant tout accès de modification. Le déverrouillage local n’est accepté que sur un appareil déjà lié à un compte cloud actif du même rôle.</div>'''
if old not in s: raise SystemExit('login modal block not found')
s=s.replace(old,new)
oldfun='''async function loginUserAction(){
 const k=loginUser.value,p=loginPin.value.trim(),a=getAuth(),u=a.users[k];
 if(!/^\\d{4,12}$/.test(p)){alert('Entrez un code d’accès ou PIN de 4 à 12 chiffres.');return}
 const globalOk=/^\\d{8}$/.test(p)?await verifyGlobalAccess(k,p):false;
 const localOk=u?.pinHash?((await hashPin(p,u.salt))===u.pinHash):false;
 if(!globalOk&&!localOk){
  alert('Code d’accès / PIN incorrect pour ce profil.');
  audit('Échec de connexion',u.name,{entity:'security',entityId:k});return
 }
 sessionStorage.removeItem(VISITOR_KEY);
 sessionStorage.setItem(SESSION_KEY,JSON.stringify({key:k,at:new Date().toISOString(),method:globalOk?'global':'local'}));
 audit('Connexion',u.name+' • '+(globalOk?'code global':'PIN local'),{entity:'security',entityId:k});
 loginModal.classList.remove('open');updateAuthUI();refreshHome()
}'''
newfun='''async function bindLocalSessionToCloud(profile,method='cloud'){
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
 const k=loginUser.value,pin=loginPin.value.trim(),a=getAuth(),u=a.users[k];
 if(!/^\\d{4,12}$/.test(pin)){alert('Entrez votre PIN local de 4 à 12 chiffres.');return}
 const session=await cloudSessionInfo();
 if(!session){alert('Sur ce nouvel appareil, connectez d’abord votre compte CHEBSEL Cloud.');return}
 let profile;try{profile=await getCloudProfile()}catch(e){alert('Profil cloud requis : '+e.message);return}
 if(profile.role!==k){alert('Le compte cloud connecté appartient au rôle « '+profile.role+' », pas au profil sélectionné.');return}
 const meta=safeParse(CLOUD_META_KEY)||{};
 if(meta.deviceBoundRole!==k){alert('Cet appareil n’est pas encore lié à ce rôle. Faites d’abord une connexion cloud réussie.');return}
 const localOk=u?.pinHash?((await hashPin(pin,u.salt))===u.pinHash):false;
 if(!localOk){alert('PIN local incorrect.');audit('Échec de déverrouillage local',u?.name||k,{entity:'security',entityId:k});return}
 await bindLocalSessionToCloud(profile,'local-pin');
}'''
if oldfun not in s: raise SystemExit('loginUserAction block not found')
s=s.replace(oldfun,newfun)
oldsignin="""saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),signedInAt:syncNowISO(),userId:data.user?.id||'',role:profile?.role||''});await registerCloudDevice();updateCloudUI();alert('Connexion CHEBSEL Cloud réussie — rôle : '+(profile?.role||'responsable')+'.')"""
newsignin="""saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),signedInAt:syncNowISO(),userId:data.user?.id||'',role:profile?.role||'',deviceBoundRole:profile?.role||'',deviceBoundAt:syncNowISO()});await registerCloudDevice();updateCloudUI();alert('Connexion CHEBSEL Cloud réussie — rôle : '+(profile?.role||'responsable')+'.')"""
if oldsignin not in s: raise SystemExit('cloud signin meta block not found')
s=s.replace(oldsignin,newsignin)
oldstartup="requireStartupLogin();initSyncReady();updateCloudUI();"
newstartup="""(async()=>{try{const ss=await cloudSessionInfo();if(ss){const cp=await getCloudProfile();await bindLocalSessionToCloud(cp,'persisted-cloud');return}}catch(e){}requireStartupLogin()})();initSyncReady();updateCloudUI();"""
if oldstartup not in s: raise SystemExit('startup block not found')
s=s.replace(oldstartup,newstartup)
p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
t=sw.read_text(encoding='utf-8').replace("chebsel-pwa-stable-v173","chebsel-pwa-stable-v174")
sw.write_text(t,encoding='utf-8')
