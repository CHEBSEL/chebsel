from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('<title>CHEBSEL v1.7.2 — Centre de gestion</title>','<title>CHEBSEL v1.7.3 — Centre de gestion</title>')
s=s.replace('<span class="versionChip">v1.7.2</span>','<span class="versionChip">v1.7.3</span>')
s=s.replace("const APP_VERSION='1.7.2';","const APP_VERSION='1.7.3';")

old='<button class="secondaryQuick" onclick="cloudSignIn()">🔐 Connexion cloud</button><button class="secondaryQuick" onclick="cloudPilotSync()">↕ Synchroniser pilote</button>'
new='<button class="secondaryQuick" onclick="cloudSignUp()">🆕 Activer mon compte</button><button class="secondaryQuick" onclick="cloudSignIn()">🔐 Connexion cloud</button><button class="secondaryQuick" onclick="cloudPilotSync()">↕ Synchroniser cloud</button>'
if old not in s:
    raise SystemExit('cloud buttons anchor not found')
s=s.replace(old,new,1)

old_fn="async function cloudSignIn(){if(isVisitor()){alert('Accès réservé aux responsables.');return}try{const cfg=getCloudConfig();if(!cfg.url||!cfg.anonKey){openCloudConfigModal();return}const email=(cfg.email||'').trim();if(!email){openCloudConfigModal();alert('Ajoutez votre email Supabase et votre mot de passe dans le formulaire qui vient de s’ouvrir.');return}const modal=cloudEl('cloudConfigModal'),passEl=cloudEl('cloudPassword');const password=((modal&&modal.classList.contains('open')&&passEl)?passEl.value:'')||prompt('Mot de passe Supabase pour '+email+':')||'';if(!password)return;const c=await getCloudClient(),{data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),signedInAt:syncNowISO(),userId:data.user?.id||''});await registerCloudDevice();updateCloudUI();alert('Connexion CHEBSEL Cloud réussie.')}catch(e){alert('Connexion cloud impossible : '+e.message);updateCloudUI()}}"
new_fn="""const CLOUD_AUTHORIZED_EMAILS=new Set(['presidanchebsel@outlook.fr','secretairechebsel@gmail.com','tresorierdugroupe@outlook.com']);
function saveCloudEmail(email){const c=getCloudConfig();saveJSON(CLOUD_CONFIG_KEY,{url:c.url,anonKey:c.anonKey,email:(email||'').trim().toLowerCase(),configuredAt:syncNowISO()})}
async function ensureAuthorizedCloudProfile(){const c=await getCloudClient(),s=await cloudSessionInfo();if(!s)throw new Error('Connexion cloud requise.');const {data:existing}=await c.from('user_profiles').select('auth_user_id,organization_id,role,active').eq('auth_user_id',s.user.id).maybeSingle();if(existing?.active)return existing;const {data,error}=await c.rpc('activate_authorized_account');if(error)throw error;return data}
async function cloudSignUp(){if(isVisitor()){alert('Accès réservé aux responsables.');return}try{const cfg=getCloudConfig();const email=(prompt('Email officiel CHEBSEL à activer :',(cfg.email||'').trim())||'').trim().toLowerCase();if(!email)return;if(!CLOUD_AUTHORIZED_EMAILS.has(email))throw new Error('Cet email ne fait pas partie des trois comptes CHEBSEL autorisés.');const password=prompt('Choisissez votre mot de passe CHEBSEL Cloud (8 caractères minimum) :')||'';if(password.length<8)throw new Error('Le mot de passe doit contenir au moins 8 caractères.');const confirm=prompt('Confirmez le même mot de passe :')||'';if(password!==confirm)throw new Error('Les deux mots de passe ne correspondent pas.');saveCloudEmail(email);const c=await getCloudClient(),{data,error}=await c.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;if(data?.session){await ensureAuthorizedCloudProfile();await registerCloudDevice();saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),signedInAt:syncNowISO(),userId:data.user?.id||''});await updateCloudUI();alert('Compte CHEBSEL Cloud activé et connecté.')}else{await updateCloudUI();alert('Compte créé. Vérifiez la boîte email de '+email+' pour confirmer l’adresse, puis revenez dans CHEBSEL et appuyez sur « Connexion cloud ».')}}catch(e){alert('Activation du compte impossible : '+e.message);updateCloudUI()}}
async function cloudSignIn(){if(isVisitor()){alert('Accès réservé aux responsables.');return}try{const cfg=getCloudConfig();if(!cfg.url||!cfg.anonKey){openCloudConfigModal();return}const email=(prompt('Email CHEBSEL Cloud :',(cfg.email||'').trim())||'').trim().toLowerCase();if(!email)return;const password=prompt('Mot de passe Supabase pour '+email+':')||'';if(!password)return;saveCloudEmail(email);const c=await getCloudClient(),{data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;const profile=await ensureAuthorizedCloudProfile();saveJSON(CLOUD_META_KEY,{...(safeParse(CLOUD_META_KEY)||{}),signedInAt:syncNowISO(),userId:data.user?.id||'',role:profile?.role||''});await registerCloudDevice();updateCloudUI();alert('Connexion CHEBSEL Cloud réussie — rôle : '+(profile?.role||'responsable')+'.')}catch(e){alert('Connexion cloud impossible : '+e.message);updateCloudUI()}}"""
if old_fn not in s:
    raise SystemExit('cloudSignIn anchor not found')
s=s.replace(old_fn,new_fn,1)

p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
t=sw.read_text(encoding='utf-8')
t=t.replace("chebsel-pwa-stable-v172","chebsel-pwa-stable-v173")
sw.write_text(t,encoding='utf-8')

print('v1.7.3 patch applied')
