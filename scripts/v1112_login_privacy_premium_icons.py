from pathlib import Path
import json

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Version bump
s=s.replace('v1.11.1','v1.11.2').replace("APP_VERSION='1.11.1'","APP_VERSION='1.11.2'")

old='''<div class="modal" id="loginModal"><div class="modalBox"><h3 style="margin-top:0;text-align:center">Connexion CHEBSEL</h3><p class="small" id="loginHelp" style="text-align:center">Chwazi pwofil ou.</p><div class="roleChoiceGrid"><button class="roleChoice" data-login-role="president" onclick="chooseLoginRole('president',this)"><span>👑</span>Président</button><button class="roleChoice" data-login-role="secretary" onclick="chooseLoginRole('secretary',this)"><span>📝</span>Secrétaire</button><button class="roleChoice" data-login-role="treasurer" onclick="chooseLoginRole('treasurer',this)"><span>💰</span>Trésorier</button><button class="roleChoice visitor" onclick="enterVisitorMode()"><span>👁</span>Visiteur</button></div><select id="loginUser" style="display:none"></select><div id="loginPasswordWrap" style="display:none"><div class="loginRoleName" id="loginRoleName"></div><div class="form"><div class="wide"><label>Mot de passe CHEBSEL</label><input type="password" id="loginPin" autocomplete="current-password" placeholder="Mot de passe CHEBSEL"></div></div><div class="modalActions"><button class="save" onclick="loginUserAction()">Se connecter</button><button class="cancel" onclick="resetLoginChoice()">Changer de profil</button></div><div class="permissionNote" style="margin-top:10px;text-align:center">Sou yon nouvo aparèy, premye koneksyon an bezwen entènèt. Apre sa menm modpas la mache offline.</div></div></div></div>'''

new='''<div class="modal loginGate" id="loginModal"><div class="modalBox loginGateBox"><div class="loginBrand"><img src="icons/chebsel-logo.png" alt="CHEBSEL"><div><strong>CHEBSEL</strong><span>Centre de gestion sécurisé</span></div></div><h3 class="loginTitle">Connexion CHEBSEL</h3><p class="small loginIntro" id="loginHelp">Chwazi pwofil ou.</p><div class="roleChoiceGrid"><button class="roleChoice" data-login-role="president" onclick="chooseLoginRole('president',this)"><span class="premiumRoleIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 19h16M5 17h14l-1-9-4 4-2-7-2 7-4-4-1 9Z"/></svg></span><b>Président</b><small>Administration</small></button><button class="roleChoice" data-login-role="secretary" onclick="chooseLoginRole('secretary',this)"><span class="premiumRoleIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6V3Z"/><path d="M9 11h6M9 15h6M9 7h3"/></svg></span><b>Secrétaire</b><small>Membres & appel</small></button><button class="roleChoice" data-login-role="treasurer" onclick="chooseLoginRole('treasurer',this)"><span class="premiumRoleIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h16v12H4V7Z"/><path d="M16 7V5H8v2M8 13h8M12 10v6"/></svg></span><b>Trésorier</b><small>Finances</small></button><button class="roleChoice visitor" onclick="enterVisitorMode()"><span class="premiumRoleIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg></span><b>Visiteur</b><small>Lecture seule</small></button></div><select id="loginUser" style="display:none"></select><div id="loginPasswordWrap" style="display:none"><div class="loginRoleName" id="loginRoleName"></div><div class="form"><div class="wide"><label>Mot de passe CHEBSEL</label><input type="password" id="loginPin" autocomplete="current-password" placeholder="Mot de passe CHEBSEL"></div></div><div class="modalActions"><button class="save" onclick="loginUserAction()">Se connecter</button><button class="cancel" onclick="resetLoginChoice()">Changer de profil</button></div><div class="permissionNote" style="margin-top:10px;text-align:center">Sou yon nouvo aparèy, premye koneksyon an bezwen entènèt. Apre sa menm modpas la mache offline.</div></div><div class="loginPrivacyNote">🔒 Aucune donnée CHEBSEL n’est affichée avant l’ouverture d’une session.</div></div></div>'''

if old not in s:
    raise SystemExit('Login block not found; refusing unsafe patch')
s=s.replace(old,new,1)

css='''
/* CHEBSEL v1.11.2 — Private login gate + premium role icons */
#loginModal.loginGate{position:fixed;inset:0;z-index:5000;display:none;align-items:center;justify-content:center;padding:24px;background:linear-gradient(145deg,#050a12 0%,#081525 50%,#0d223a 100%);backdrop-filter:none!important}
#loginModal.loginGate.open{display:flex}
#loginModal .loginGateBox{width:min(760px,100%);max-height:min(92vh,820px);overflow:auto;border-radius:28px;padding:28px;background:linear-gradient(180deg,rgba(22,31,45,.98),rgba(15,22,33,.99));border:1px solid rgba(255,255,255,.10);box-shadow:0 30px 90px rgba(0,0,0,.48);color:#f7f9fc}
#loginModal .loginBrand{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:18px;text-align:left}
#loginModal .loginBrand img{width:52px;height:52px;object-fit:contain;filter:drop-shadow(0 7px 16px rgba(0,0,0,.28))}
#loginModal .loginBrand strong{display:block;font-size:1rem;letter-spacing:.08em}
#loginModal .loginBrand span{display:block;margin-top:2px;font-size:.72rem;color:#9eb0c6}
#loginModal .loginTitle{margin:0;text-align:center;font-size:1.55rem;font-weight:780;letter-spacing:-.025em;color:#fff}
#loginModal .loginIntro{text-align:center;color:#b5c0cf;margin:8px 0 18px}
#loginModal .roleChoiceGrid{gap:12px;margin:18px 0 20px}
#loginModal .roleChoice{min-height:132px;padding:18px 12px;border:1px solid rgba(255,255,255,.11);background:#101b2b;color:#f7f9fc;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.16);font-weight:650;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease}
#loginModal .roleChoice:hover{transform:translateY(-2px);border-color:rgba(118,169,255,.52);background:#132239;box-shadow:0 13px 30px rgba(0,0,0,.24)}
#loginModal .roleChoice.active{outline:0;border-color:#76a9ff;background:#172a46;box-shadow:0 0 0 3px rgba(118,169,255,.14),0 14px 34px rgba(0,0,0,.25)}
#loginModal .roleChoice b{font-size:1rem;font-weight:760}
#loginModal .roleChoice small{font-size:.69rem;font-weight:550;color:#8fa2ba}
#loginModal .premiumRoleIcon{width:46px;height:46px;display:grid;place-items:center;border-radius:14px;background:rgba(118,169,255,.10);border:1px solid rgba(118,169,255,.16);color:#a9c8ff;font-size:0!important}
#loginModal .premiumRoleIcon svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#loginModal .loginRoleName{color:#d8e3f0;font-weight:760}
#loginModal label{color:#aebbc9}
#loginModal input{background:#0b1420;color:#fff;border-color:#2b3a4e}
#loginModal input:focus{outline:2px solid rgba(118,169,255,.35);border-color:#76a9ff}
#loginModal .modalActions .save{background:#2767c9;color:#fff}
#loginModal .modalActions .cancel{background:#202c3c;color:#d9e1eb}
#loginModal .permissionNote{color:#8fa2ba}
#loginModal .loginPrivacyNote{margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);text-align:center;font-size:.72rem;color:#71849d}
@media(max-width:619px){#loginModal.loginGate{padding:14px}#loginModal .loginGateBox{padding:22px 16px;border-radius:24px}#loginModal .roleChoice{min-height:112px}.loginBrand img{width:44px;height:44px}}
'''
s=s.replace('</style>',css+'\n</style>',1)

p.write_text(s,encoding='utf-8')

# bump service worker cache
sw=Path('sw.js')
if sw.exists():
    w=sw.read_text(encoding='utf-8')
    import re
    w=re.sub(r"const CACHE_NAME='[^']+';", "const CACHE_NAME='chebsel-pwa-stable-v1112';", w, count=1)
    sw.write_text(w,encoding='utf-8')

# align manifest version copy without changing scope/start_url
mf=Path('manifest.webmanifest')
if mf.exists():
    m=json.loads(mf.read_text(encoding='utf-8'))
    m['name']='CHEBSEL v1.11.2 — Chœur d’Homme de l’Église Baptiste Sel et Lumière'
    m['description']='CHEBSEL v1.11.2 — accès sécurisé, synchronisation et gestion du chœur.'
    mf.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

print('CHEBSEL v1.11.2 login privacy/premium icons patch applied')
