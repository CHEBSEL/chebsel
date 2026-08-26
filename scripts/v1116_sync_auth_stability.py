from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('CHEBSEL v1.11.5 — Centre de gestion','CHEBSEL v1.11.6 — Centre de gestion')
s=s.replace("const APP_VERSION='1.11.4';","const APP_VERSION='1.11.6';")
s=s.replace('<span class="versionChip">v1.11.5</span>','<span class="versionChip">v1.11.6</span>')

# Password visibility control
old='<input type="password" id="loginPin" autocomplete="current-password" placeholder="Mot de passe CHEBSEL">'
new='<div class="passwordFieldWrap"><input type="password" id="loginPin" autocomplete="current-password" placeholder="Mot de passe CHEBSEL"><button type="button" class="passwordEye" id="loginPasswordEye" onclick="toggleLoginPassword()" aria-label="Afficher le mot de passe" title="Voir / masquer le mot de passe"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg></button></div>'
if old not in s: raise SystemExit('login password input marker not found')
s=s.replace(old,new,1)

css='''\n/* v1.11.6 — auth + sync stabilization */\n.passwordFieldWrap{position:relative;display:flex;align-items:center}.passwordFieldWrap input{padding-right:52px!important}.passwordEye{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:38px;height:38px;border:0;border-radius:10px;background:var(--chip);color:var(--text);display:grid;place-items:center}.passwordEye svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.passwordEye:hover{background:var(--soft)}\n'''
s=s.replace('</style>',css+'</style>',1)

# Reset password visibility whenever role/login screen is reset.
s=s.replace("function resetLoginChoice(){loginUser.value='';loginPin.value='';loginPasswordWrap.style.display='none';", "function resetLoginChoice(){loginUser.value='';loginPin.value='';loginPin.type='password';if(window.loginPasswordEye){loginPasswordEye.setAttribute('aria-label','Afficher le mot de passe')}loginPasswordWrap.style.display='none';",1)

marker="const LOGIN_ROLE_LABELS={president:'Président',secretary:'Secrétaire',treasurer:'Trésorier'};"
helper="""const LOGIN_ROLE_LABELS={president:'Président',secretary:'Secrétaire',treasurer:'Trésorier'};\nfunction toggleLoginPassword(){\n const visible=loginPin.type==='text';loginPin.type=visible?'password':'text';\n if(window.loginPasswordEye)loginPasswordEye.setAttribute('aria-label',visible?'Afficher le mot de passe':'Masquer le mot de passe');\n loginPin.focus();\n}\nfunction authCredentialError(e){const m=String(e?.message||'').toLowerCase();return Number(e?.status||0)===400&&(m.includes('invalid login credentials')||m.includes('invalid credentials')||m.includes('email or password'));}\nfunction authRateLimitError(e){return Number(e?.status||0)===429||String(e?.message||'').toLowerCase().includes('rate limit');}\nfunction sleepCHEBSEL(ms){return new Promise(r=>setTimeout(r,ms))}\nasync function reliableRoleSignIn(role,password){\n const c=await getCloudClient(),email=ROLE_CLOUD_EMAILS[role];let last=null;\n for(let attempt=0;attempt<2;attempt++){\n  try{const {data,error}=await c.auth.signInWithPassword({email,password});if(!error)return {client:c,data};last=error;if(authCredentialError(error)||authRateLimitError(error))throw error}catch(e){last=e;if(authCredentialError(e)||authRateLimitError(e))throw e}\n  if(attempt===0)await sleepCHEBSEL(650);\n }\n throw last||new Error('Connexion cloud indisponible.');\n}\nasync function cloudBootstrapFresh(){\n if(!navigator.onLine)return false;const ss=await cloudSessionInfo();if(!ss)return false;\n const p=await getCloudProfile(),org=p?.organization_id||p?.org_id;if(!org)throw new Error('Organisation CHEBSEL introuvable.');\n cloudState.textContent='Chargement des données à jour…';\n await pullCloudMembers(org);await pullCloudCalendar(org);await pullCloudAttendance(org);await pullCloudFinance(org);\n try{if(['president','treasurer'].includes(String(p?.role||'').toLowerCase()))await pullCloudExpenses(org)}catch(e){console.warn('Bootstrap dépenses:',e)}\n await syncReadyReconcilePilot(false);refreshHome();await updateCloudUI();return true;\n}\n"""
if marker not in s: raise SystemExit('LOGIN_ROLE_LABELS marker not found')
s=s.replace(marker,helper,1)

# More reliable online login + fresh cloud bootstrap on every successful online login.
old_login="""   const c=await getCloudClient(),email=ROLE_CLOUD_EMAILS[role];\n   const {data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;\n   const profile=await ensureAuthorizedCloudProfile();\n   if(String(profile?.role||'').toLowerCase()!==role){await c.auth.signOut();throw new Error('Kont sa a pa koresponn ak wòl ou chwazi a.')}\n   await cacheOfflinePassword(role,password,data.user?.id||'');\n   await bindLocalSessionToCloud(profile,'password');await registerCloudDevice();\n   loginPin.value='';scheduleAutoCloudSync('login',250)\n  }catch(e){alert('Mot de passe CHEBSEL pa kòrèk oswa koneksyon an echwe : '+e.message)}"""
new_login="""   const signed=await reliableRoleSignIn(role,password),c=signed.client,data=signed.data;\n   const profile=await ensureAuthorizedCloudProfile();\n   if(String(profile?.role||'').toLowerCase()!==role){await c.auth.signOut({scope:'local'});throw new Error('Kont sa a pa koresponn ak wòl ou chwazi a.')}\n   await cacheOfflinePassword(role,password,data.user?.id||'');\n   await bindLocalSessionToCloud(profile,'password');await registerCloudDevice();\n   await cloudBootstrapFresh();\n   loginPin.value='';loginPin.type='password';scheduleAutoCloudSync('login',500)\n  }catch(e){\n   if(authCredentialError(e))alert('Mot de passe CHEBSEL la pa kòrèk pou pwofil sa a.');\n   else if(authRateLimitError(e))alert('Twòp tantativ koneksyon. Tann yon ti moman epi eseye ankò.');\n   else alert('Koneksyon CHEBSEL la pa reyisi. Modpas la pa nesesèman mal. Verifye entènèt la epi eseye ankò. Detay: '+(e?.message||e));\n  }"""
if old_login not in s: raise SystemExit('online login block not found')
s=s.replace(old_login,new_login,1)

# Local-only Supabase signout on CHEBSEL logout; never globally signs other devices out.
old_logout="function logoutUser(){const u=currentUser();if(u)audit('Déconnexion',u.name,{entity:'security',entityId:u.key});sessionStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(VISITOR_KEY);loginModal.classList.remove('open');updateAuthUI();refreshHome();setTimeout(openLoginModal,80)}"
new_logout="function logoutUser(){const u=currentUser();if(u)audit('Déconnexion',u.name,{entity:'security',entityId:u.key});try{getCloudClient().then(c=>c.auth.signOut({scope:'local'})).catch(()=>{})}catch(e){}sessionStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(VISITOR_KEY);loginModal.classList.remove('open');updateAuthUI();refreshHome();setTimeout(openLoginModal,80)}"
if old_logout not in s: raise SystemExit('logout block not found')
s=s.replace(old_logout,new_logout,1)

# Monthly finance cloud merge: recognize same member+month and attach cloud syncId instead of duplicating.
old_fin=""" const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const bySync=new Map(f.entries.filter(x=>x.syncId).map(x=>[x.syncId,x]));\n for(const r of entries||[]){const legacyMember=maps.byCloud.get(r.member_id);if(!legacyMember)continue;let e=bySync.get(r.id);if(!e){e={id:'cloudfin_'+r.id.slice(0,8),syncId:r.id,memberId:legacyMember};f.entries.push(e);bySync.set(r.id,e)}Object.assign(e,{memberId:legacyMember,type:r.entry_type||'other',typeLabel:r.description||r.entry_type||'Écriture',due:Number(r.due_amount||0),paid:Number(paidByEntry.get(r.id)||0),date:r.entry_date||'',note:r.description||'',updatedAt:r.updated_at||syncNowISO()})}\n localStorage.setItem(FIN_KEY,JSON.stringify(f));"""
new_fin=""" const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const bySync=new Map(f.entries.filter(x=>x.syncId).map(x=>[x.syncId,x]));const byMonthly=new Map(f.entries.filter(x=>isMonthlyEntry(x)).map(x=>[String(x.memberId||'')+'|'+String(entryMonth(x)||''),x]));\n for(const r of entries||[]){const legacyMember=maps.byCloud.get(r.member_id);if(!legacyMember)continue;let e=bySync.get(r.id);const monthlyKey=String(legacyMember)+'|'+String(r.month_reference||'');if(!e&&r.entry_type==='monthly'&&r.month_reference)e=byMonthly.get(monthlyKey);if(!e){e={id:'cloudfin_'+r.id.slice(0,8),memberId:legacyMember};f.entries.push(e)}e.syncId=r.id;bySync.set(r.id,e);if(r.entry_type==='monthly'&&r.month_reference)byMonthly.set(monthlyKey,e);Object.assign(e,{memberId:legacyMember,type:r.entry_type||'other',typeLabel:r.description||r.entry_type||'Écriture',due:Number(r.due_amount||0),paid:Number(paidByEntry.get(r.id)||0),date:r.entry_date||'',sourceMonth:r.month_reference||e.sourceMonth||'',note:r.description||'',updatedAt:r.updated_at||syncNowISO()})}\n const seenMonthly=new Set();f.entries=f.entries.filter(e=>{if(!isMonthlyEntry(e))return true;const k=String(e.memberId||'')+'|'+String(entryMonth(e)||'');if(seenMonthly.has(k))return false;seenMonthly.add(k);return true});\n localStorage.setItem(FIN_KEY,JSON.stringify(f));"""
if old_fin not in s: raise SystemExit('finance pull merge block not found')
s=s.replace(old_fin,new_fin,1)

# Closing monthly dues must sync immediately to cloud for other devices/users.
old_close="function saveMonthlyClose(){const month=closeMonth.value;if(!month)return;ensureMonthBeforeClosing(month);const closes=safeParse(CLOSE_KEY)||{};closes[month]={at:new Date().toISOString(),note:closeNote.value||''};saveJSON(CLOSE_KEY,closes);audit('Clôture mensuelle',`${month} • ${closeNote.value||'sans observation'}`);renderMonthlyClose()}"
new_close="function saveMonthlyClose(){const month=closeMonth.value;if(!month)return;ensureMonthBeforeClosing(month);const closes=safeParse(CLOSE_KEY)||{};closes[month]={at:new Date().toISOString(),note:closeNote.value||''};saveJSON(CLOSE_KEY,closes);audit('Clôture mensuelle',`${month} • ${closeNote.value||'sans observation'}`);renderMonthlyClose();scheduleAutoCloudSync('cloture-mensuelle',120)}"
if old_close not in s: raise SystemExit('monthly close block not found')
s=s.replace(old_close,new_close,1)

p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
if sw.exists():
 x=sw.read_text(encoding='utf-8').replace("chebsel-pwa-stable-v1115","chebsel-pwa-stable-v1116")
 sw.write_text(x,encoding='utf-8')

mf=Path('manifest.webmanifest')
if mf.exists():
 x=mf.read_text(encoding='utf-8').replace('CHEBSEL v1.11.5','CHEBSEL v1.11.6')
 mf.write_text(x,encoding='utf-8')
