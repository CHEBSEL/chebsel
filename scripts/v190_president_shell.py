from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.8.3' in s
assert "const APP_VERSION='1.8.3';" in s
s=s.replace('CHEBSEL v1.8.3 — Centre de gestion','CHEBSEL v1.9.0 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.8.3</span>','<span class="versionChip">v1.9.0</span>')
s=s.replace("const APP_VERSION='1.8.3';","const APP_VERSION='1.9.0';")

css='''\n.connectionDot{width:11px;height:11px;border-radius:999px;background:var(--red);box-shadow:0 0 0 3px rgba(255,255,255,.10);flex:0 0 11px}.connectionDot.online{background:var(--green)}.syncToggle{width:42px;height:24px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.14);position:relative;padding:0}.syncToggle:after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.18s}.syncToggle.on{background:#16794b}.syncToggle.on:after{left:21px}.syncCheck{font-size:.74rem;font-weight:900;opacity:.82}.utilityMenu{display:grid;grid-template-columns:1fr;gap:10px}.utilityBtn{border:1px solid var(--line);border-radius:14px;background:var(--soft);color:var(--text);padding:13px;text-align:left;font-weight:850}.utilityBtn span{display:block;color:var(--muted);font-size:.73rem;font-weight:600;margin-top:3px}.presidentCompact{display:flex;align-items:center;gap:7px}.old-tech-panel{display:none!important}@media(min-width:700px){.utilityMenu{grid-template-columns:repeat(2,1fr)}}\n'''
s=s.replace('</style>',css+'</style>',1)

# Replace auth strip with compact connection status + sync toggle before username.
old='<div class="authStrip"><span class="authUser" id="authUserLabel">Mode lecture seule</span></div></header>'
new='''<div class="authStrip"><div class="presidentCompact" id="presidentCompactStatus"><span id="netDot" class="connectionDot" title="État de connexion"></span><button id="syncToggleBtn" class="syncToggle" onclick="toggleAutoSync()" title="Synchronisation automatique" aria-label="Synchronisation automatique"></button><span class="syncCheck" id="syncToggleLabel">Sync</span></div><span class="authUser" id="authUserLabel">Mode lecture seule</span></div></header>'''
assert old in s
s=s.replace(old,new,1)

# Hide old technical panels while keeping DOM for existing functions.
s=s.replace('<div class="syncReadyPanel visitor-hidden" id="syncReadyPanel">','<div class="syncReadyPanel visitor-hidden old-tech-panel" id="syncReadyPanel">',1)
s=s.replace('<div class="cloudPanel visitor-hidden" id="cloudFoundationPanel">','<div class="cloudPanel visitor-hidden old-tech-panel" id="cloudFoundationPanel">',1)

# Replace old admin launch cluster by Settings / Confidentialité / À propos cards.
pattern=r''' <section class=\"grid\" style=\"margin-top:14px\">\n  <button class=\"launch visitor-hidden\" onclick=\"openDiagnostics\(\)\">.*?</section>'''
repl=''' <section class="grid" style="margin-top:14px" id="presidentUtilityCards">
  <button class="launch visitor-hidden" onclick="openSettingsHub()"><div class="icon">⚙️</div><h2>Paramètres</h2><p>Journal, diagnostic, sécurité et gestion des rôles.</p><span class="go">Ouvrir les paramètres →</span></button>
  <button class="launch visitor-hidden" onclick="openPrivacyHub()"><div class="icon">🔒</div><h2>Confidentialité</h2><p>Passation de comité, sauvegarde et restauration.</p><span class="go">Ouvrir confidentialité →</span></button>
  <button class="launch visitor-hidden" onclick="openAboutHub()"><div class="icon">ℹ️</div><h2>À propos</h2><p>Manuel, version et informations sur l’application CHEBSEL.</p><span class="go">À propos de l’app →</span></button>
 </section>'''
s,n=re.subn(pattern,repl,s,count=1,flags=re.S)
assert n==1, 'admin cluster not replaced'

# Insert 3 lightweight hub views before cloud config modal.
marker='<div class="modal" id="cloudConfigModal">'
hubs='''<div class="membersView" id="settingsHub"><div class="viewerbar"><button class="back" onclick="closeSettingsHub()">← Retour</button><div class="viewtitle"><b>Paramètres</b><span>Administration CHEBSEL</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu"><button class="utilityBtn" onclick="closeSettingsHub();openAudit()">🧾 Journal<span>Historique des opérations et modifications.</span></button><button class="utilityBtn" onclick="closeSettingsHub();openDiagnostics()">🩺 Diagnostic<span>Vérifier l’intégrité et les incohérences.</span></button><button class="utilityBtn" onclick="closeSettingsHub();openSecurity()">🔐 Sécurité & rôles<span>Profils autorisés et droits d’accès.</span></button></div></div></div></div>
<div class="membersView" id="privacyHub"><div class="viewerbar"><button class="back" onclick="closePrivacyHub()">← Retour</button><div class="viewtitle"><b>Confidentialité</b><span>Données sensibles et transfert</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu"><button class="utilityBtn" onclick="closePrivacyHub();openHandover()">🤝 Passation de comité<span>Préparer un transfert de responsabilité.</span></button><button class="utilityBtn" onclick="portalBackup()">💾 Sauvegarder<span>Exporter une copie des données CHEBSEL.</span></button><button class="utilityBtn" onclick="openRestoreModal()">↥ Restaurer<span>Restaurer une sauvegarde autorisée.</span></button><button class="utilityBtn" onclick="openRestoreTestModal()">✓ Tester une sauvegarde<span>Contrôler un fichier sans modifier les données.</span></button></div></div></div></div>
<div class="membersView" id="aboutHub"><div class="viewerbar"><button class="back" onclick="closeAboutHub()">← Retour</button><div class="viewtitle"><b>À propos</b><span>CHEBSEL</span></div></div><div class="membersBody"><div class="profilePanel"><h2 style="margin-top:0">CHEBSEL <span id="aboutVersion"></span></h2><p class="memberMeta">Centre de gestion du Chœur d’Homme de l’Église Baptiste Sel et Lumière.</p><div class="utilityMenu" style="margin-top:12px"><button class="utilityBtn" onclick="closeAboutHub();openHelp()">📘 Manuel de l’application<span>Aide, règles et utilisation générale.</span></button></div></div></div></div>
'''
s=s.replace(marker,hubs+marker,1)

# Add sync preference logic before bindOfflineSession.
marker='async function bindOfflineSession(role){'
logic='''const AUTO_SYNC_PREF_KEY='chebsel_auto_sync_enabled_v1';
function autoSyncEnabled(){return localStorage.getItem(AUTO_SYNC_PREF_KEY)!=='0'}
function updateCompactStatus(){
 const dot=document.getElementById('netDot'),btn=document.getElementById('syncToggleBtn'),label=document.getElementById('syncToggleLabel'),wrap=document.getElementById('presidentCompactStatus');
 if(dot)dot.classList.toggle('online',navigator.onLine);
 if(btn)btn.classList.toggle('on',autoSyncEnabled());
 if(label)label.textContent=autoSyncEnabled()?'✓ Sync':'Sync off';
 if(wrap)wrap.style.display=currentRoleView()==='president'?'flex':'none';
}
function toggleAutoSync(){
 if(currentRoleView()!=='president')return;
 const next=!autoSyncEnabled();localStorage.setItem(AUTO_SYNC_PREF_KEY,next?'1':'0');updateCompactStatus();
 if(next&&navigator.onLine)scheduleAutoCloudSync('toggle-on',150);
}
function openSettingsHub(){if(currentRoleView()!=='president')return;settingsHub.classList.add('open')}
function closeSettingsHub(){settingsHub.classList.remove('open')}
function openPrivacyHub(){if(currentRoleView()!=='president')return;privacyHub.classList.add('open')}
function closePrivacyHub(){privacyHub.classList.remove('open')}
function openAboutHub(){if(currentRoleView()!=='president')return;aboutVersion.textContent='v'+APP_VERSION;aboutHub.classList.add('open')}
function closeAboutHub(){aboutHub.classList.remove('open')}

'''
s=s.replace(marker,logic+marker,1)

# Disable all automatic cloud sync when toggle is off. Manual cloudPilotSync remains available internally if needed.
s=s.replace("function scheduleAutoCloudSync(reason='auto',delay=1200){\n if(!navigator.onLine||AUTO_CLOUD_SYNC_RUNNING||isVisitor())return;",
'''function scheduleAutoCloudSync(reason='auto',delay=1200){
 if(!autoSyncEnabled()||!navigator.onLine||AUTO_CLOUD_SYNC_RUNNING||isVisitor())return;''',1)
s=s.replace("async function autoCloudSync(reason='auto'){\n if(AUTO_CLOUD_SYNC_RUNNING||!navigator.onLine||isVisitor())return false;",
'''async function autoCloudSync(reason='auto'){
 if(!autoSyncEnabled()||AUTO_CLOUD_SYNC_RUNNING||!navigator.onLine||isVisitor())return false;''',1)

# Update visibility controller: technical panels hidden permanently, compact status + utility cards only President.
s=s.replace(" ['cloudFoundationPanel','syncReadyPanel','backupHealth'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.toggle('role-hidden',!president)});",
" ['cloudFoundationPanel','syncReadyPanel','backupHealth'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('role-hidden')});\n const util=document.getElementById('presidentUtilityCards');if(util)util.classList.toggle('role-hidden',!president);updateCompactStatus();",1)

# Network changes should update dot immediately and only schedule sync if toggle on.
s=s.replace("window.addEventListener('online',()=>updateCloudUI());window.addEventListener('offline',()=>updateCloudUI());",
"window.addEventListener('online',()=>{updateCloudUI();updateCompactStatus();scheduleAutoCloudSync('online',200)});window.addEventListener('offline',()=>{updateCloudUI();updateCompactStatus()});",1)

# Keep hubs closed for visitors / non-president transitions.
s=s.replace("[viewer,membersView,diagnosticsView,securityView,handoverView,helpView]",
"[viewer,membersView,diagnosticsView,securityView,handoverView,helpView,settingsHub,privacyHub,aboutHub]",1)

# Ensure status renders on startup.
s=s.replace('applyShellTheme(localStorage.getItem(SHELL_THEME)', 'updateCompactStatus();\napplyShellTheme(localStorage.getItem(SHELL_THEME)',1)

p.write_text(s,encoding='utf-8')
print('v1.9.0 president shell applied')