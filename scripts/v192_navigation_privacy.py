from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.9.1' in s
assert "const APP_VERSION='1.9.1';" in s
s=s.replace('CHEBSEL v1.9.1 — Centre de gestion','CHEBSEL v1.9.2 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.9.1</span>','<span class="versionChip">v1.9.2</span>')
s=s.replace("const APP_VERSION='1.9.1';","const APP_VERSION='1.9.2';")

# Journal belongs only to Confidentialité: remove standalone home card.
s=s.replace('  <button class="launch" onclick="openAudit()"><div class="icon">🧾</div><h2>Journal</h2><p>Historique local des ajouts, modifications, paiements et corrections.</p><span class="go">Voir le journal →</span></button>\n','',1)

# Update home hub descriptions.
s=s.replace('<h2>Paramètres</h2><p>Journal, diagnostic, sécurité et gestion des rôles.</p>', '<h2>Paramètres</h2><p>Diagnostic, sécurité et gestion des rôles.</p>',1)
s=s.replace('<h2>Confidentialité</h2><p>Passation de comité, sauvegarde et restauration.</p>', '<h2>Confidentialité</h2><p>Journal, passation de comité, sauvegarde et restauration.</p>',1)

# Remove Journal from Paramètres hub.
s=s.replace('<button class="utilityBtn" onclick="closeSettingsHub();openAudit()">🧾 Journal<span>Historique des opérations et modifications.</span></button>','',1)

# Add Journal as first item in Confidentialité hub.
needle='<div class="membersView" id="privacyHub"><div class="viewerbar"><button class="back" onclick="closePrivacyHub()">← Retour</button><div class="viewtitle"><b>Confidentialité</b><span>Données sensibles et transfert</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu">'
assert needle in s
s=s.replace(needle, needle+'<button class="utilityBtn" onclick="closePrivacyHub();openAudit()">🧾 Journal<span>Historique des opérations et modifications.</span></button>',1)

# Remove duplicate backup/restore panel from home. Confidentialité is the single entry point.
pattern=r'''\n <div class="profilePanel" style="margin-top:12px">\n  <div class="profileTitle"><div><h3>Sauvegarde & restauration</h3>.*?\n </div>\n <div class="syncbox" id="syncMessage">'''
m=re.search(pattern,s,flags=re.S)
assert m, 'duplicate backup panel not found'
s=s[:m.start()]+"\n <div class=\"syncbox\" id=\"syncMessage\">"+s[m.end():]

# Hide the top backup shortcut: backup now lives only under Confidentialité.
s=s.replace('<button class="topbtn" id="backupTopBtn" onclick="portalBackup()" title="Sauvegarder les données" aria-label="Sauvegarder">💾</button>',
            '<button class="topbtn" id="backupTopBtn" onclick="portalBackup()" title="Sauvegarder les données" aria-label="Sauvegarder" style="display:none!important">💾</button>',1)

# Persistent Back button, above every view/modal.
css='''\n#globalBackBtn{position:fixed!important;left:14px!important;bottom:18px!important;right:auto!important;top:auto!important;z-index:1000!important;width:48px!important;height:48px!important;border-radius:999px!important;background:var(--top)!important;color:#fff!important;box-shadow:0 10px 28px rgba(0,0,0,.34)!important;display:grid!important;place-items:center!important;font-size:1.2rem!important}\n@media(min-width:760px){#globalBackBtn{left:22px!important;bottom:22px!important}}\n'''
s=s.replace('</style>',css+'</style>',1)

# Global back must close every CHEBSEL layer before falling back to browser history.
anchor='function globalBack(){\n'
assert anchor in s
insert='''function globalBack(){
 if(settingsHub?.classList.contains('open')){closeSettingsHub();return}
 if(privacyHub?.classList.contains('open')){closePrivacyHub();return}
 if(aboutHub?.classList.contains('open')){closeAboutHub();return}
'''
s=s.replace(anchor,insert,1)

# If the login overlay is open, the back control remains functional. Authenticated/visitor closes it;
# on the mandatory startup gate it falls back to browser history instead of silently doing nothing.
old=" if(loginModal?.classList.contains('open')){closeLoginModal();return}\n"
new=" if(loginModal?.classList.contains('open')){if(currentUser()||isVisitor()){closeLoginModal();return}else{history.back();return}}\n"
assert old in s
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('v1.9.2 privacy/navigation cleanup applied')
