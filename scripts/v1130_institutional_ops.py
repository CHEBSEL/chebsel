from pathlib import Path
import re

root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')

s=s.replace('CHEBSEL v1.12.1 — Centre de gestion','CHEBSEL v1.13.0 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.12.1</span>','<span class="versionChip">v1.13.0</span>')
s=s.replace('./css/app.css?v=1210','./css/app.css?v=1300')

# Notification bell in secure header.
if 'id="notificationBtn"' not in s:
    needle='<div class="topactions"><span class="versionChip">v1.13.0</span>'
    repl=needle+'\n   <button class="topbtn notificationBtn" id="notificationBtn" onclick="openNotifications()" title="Alertes CHEBSEL" aria-label="Alertes" style="display:none"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><span class="notificationBadge" id="notificationBadge" style="display:none">0</span></button>'
    if needle not in s: raise SystemExit('topactions anchor not found')
    s=s.replace(needle,repl)

# Institutional cards.
if 'id="archivesLaunchCard"' not in s:
    anchor='''  <button class="launch" onclick="openMonthlyClose()"><div class="icon">📅</div><h2>Clôture mensuelle</h2><p>Résumé mensuel : dû, payé, solde, membres à jour et débiteurs.</p><span class="go">Clôturer / consulter →</span></button>'''
    cards=anchor+'''\n  <button class="launch visitor-hidden role-hidden" id="archivesLaunchCard" onclick="openArchives()"><div class="icon">🗂️</div><h2>Archives</h2><p>Registre des reçus, rapports et clôtures générés par période.</p><span class="go">Consulter les archives →</span></button>\n  <button class="launch visitor-hidden role-hidden" id="conflictsLaunchCard" onclick="openConflictJournal()"><div class="icon">⚖️</div><h2>Journal des conflits</h2><p>Voir les arbitrages automatiques lors de modifications concurrentes.</p><span class="go">Voir la traçabilité →</span></button>'''
    if anchor not in s: raise SystemExit('monthly card anchor not found')
    s=s.replace(anchor,cards)

# Replace old one-step monthly closing action with dynamic institutional actions.
s=s.replace('<div class="memberActions" style="margin-top:10px"><button class="quickBtn" onclick="saveMonthlyClose()">Enregistrer la clôture</button></div>','<div class="memberActions" id="monthlyCloseActions" style="margin-top:10px"></div>')
s=s.replace('<div class="viewerbar"><button class="back" onclick="closeMonthlyClose()">← Retour</button><div class="viewtitle"><b>Clôture mensuelle</b><span>Résumé financier du mois</span></div></div>','<div class="viewerbar"><button class="back" onclick="closeMonthlyClose()">← Retour</button><div class="viewtitle"><b>Clôture mensuelle institutionnelle</b><span>Préparation Trésorier → Validation Président → Verrouillage</span></div></div>')

# New operational views.
if 'id="notificationsView"' not in s:
    views='''\n<div class="membersView" id="notificationsView">\n <div class="viewerbar"><button class="back" onclick="closeNotifications()">← Retour</button><div class="viewtitle"><b>Centre d’alertes</b><span>Dettes, cotisations, clôtures et synchronisation</span></div></div>\n <div class="membersBody"><div class="profilePanel"><div class="profileTitle"><div><h3>Alertes CHEBSEL</h3><div class="memberMeta">Les alertes sont calculées automatiquement à partir des données réelles.</div></div></div><div class="memberActions"><button class="secondaryQuick" onclick="renderAlertsPanel()">Actualiser</button><button class="secondaryQuick" onclick="markAllAlertsRead()">Tout marquer comme lu</button></div></div><div class="profilePanel" id="notificationList"></div></div>\n</div>\n\n<div class="membersView" id="archivesView">\n <div class="viewerbar"><button class="back" onclick="closeArchives()">← Retour</button><div class="viewtitle"><b>Archives CHEBSEL</b><span>Registre des documents générés par période</span></div></div>\n <div class="membersBody"><div class="profilePanel"><div class="memberTools"><select id="archiveYear" onchange="renderArchives()"><option value="">Toutes les années</option></select><select id="archiveType" onchange="renderArchives()"><option value="">Tous les types</option><option value="payment_receipt">Reçus de paiement</option><option value="financial_report">Rapports financiers</option><option value="punctuality_report">Rapports de ponctualité</option><option value="monthly_closing_prepared">Clôtures préparées</option><option value="monthly_closing_approved">Clôtures validées</option></select><button class="secondaryQuick" onclick="renderArchives()">Actualiser</button></div><div class="memberMeta">Le registre mémorise quel document JPEG a été généré, par qui et pour quelle période. Le fichier JPEG lui-même reste enregistré sur l’appareil utilisé.</div></div><div class="profilePanel" id="archiveList"></div></div>\n</div>\n\n<div class="membersView" id="conflictView">\n <div class="viewerbar"><button class="back" onclick="closeConflictJournal()">← Retour</button><div class="viewtitle"><b>Journal des conflits</b><span>Arbitrage automatique multi-appareils</span></div></div>\n <div class="membersBody"><div class="profilePanel"><div class="memberMeta">Président : tous les domaines • Secrétaire : Appel/Présence • Trésorier : Finance. La version gagnante est déterminée par la politique de priorité CHEBSEL.</div><div class="memberActions"><button class="secondaryQuick" onclick="renderConflictJournal()">Actualiser</button></div></div><div class="profilePanel" id="conflictList"></div></div>\n</div>\n'''
    anchor='<div class="membersView" id="settingsHub">'
    if anchor not in s: raise SystemExit('settings view anchor not found')
    s=s.replace(anchor,views+'\n'+anchor)

# Load institutional module after reports/sync/auth, before bootstrap.
if './js/institutional-ops.js?v=1300' not in s:
    anchor='<script src="./js/report-images.js?v=1210"></script>'
    if anchor not in s: raise SystemExit('report-images script anchor not found')
    s=s.replace(anchor,anchor+'\n<script src="./js/institutional-ops.js?v=1300"></script>')
s=s.replace('./js/bootstrap.js?v=1210','./js/bootstrap.js?v=1300')
idx.write_text(s,encoding='utf-8')

# CSS additions.
css=root/'css/app.css'
c=css.read_text(encoding='utf-8')
marker='/* CHEBSEL v1.13.0 institutional operations */'
if marker not in c:
    c+='''\n\n'''+marker+'''\n.notificationBtn{position:relative}.notificationBtn svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.notificationBadge{position:absolute;right:-5px;top:-6px;min-width:19px;height:19px;padding:0 4px;border-radius:999px;background:var(--state-danger);color:#fff;font-size:.62rem;font-weight:900;place-items:center;border:2px solid var(--brand-navy-2)}\n.alertRow{display:grid;grid-template-columns:12px 1fr;gap:10px;align-items:start;padding:12px 4px;border-bottom:1px solid var(--line)}.alertRow:last-child{border-bottom:0}.alertDot{width:9px;height:9px;border-radius:50%;margin-top:5px;background:var(--primary)}.alert-warn .alertDot{background:var(--amber)}.alert-critical .alertDot{background:var(--red)}.alert-read{opacity:.58}\n.closingStatus{padding:10px 12px;border-radius:12px;margin-bottom:12px;font-size:.78rem;letter-spacing:.02em}.closing-draft{background:var(--chip)}.closing-prepared{background:#fff4d8;color:#7b5100}.closing-approved{background:#e6f6ed;color:#11633d}.closing-reopened{background:#fee4e2;color:#9c1c13}html[data-theme="dark"] .closing-prepared{background:#372b0b;color:#ffd36d}html[data-theme="dark"] .closing-approved{background:#103422;color:#8ff0b5}html[data-theme="dark"] .closing-reopened{background:#3b1717;color:#ffb4ad}.institutionalMeta{margin-top:8px;padding-top:8px;border-top:1px solid var(--line)}\n.archiveRow,.conflictRow{padding:12px 2px;border-bottom:1px solid var(--line)}.archiveRow:last-child,.conflictRow:last-child{border-bottom:0}.conflictHead{display:flex;justify-content:space-between;gap:12px;align-items:center}.conflictHead span{font-size:.72rem;color:var(--muted)}\n'''
    css.write_text(c,encoding='utf-8')

# Manifest.
manifest=root/'manifest.webmanifest'
m=manifest.read_text(encoding='utf-8').replace('v1.12.1','v1.13.0')
manifest.write_text(m,encoding='utf-8')

# Service worker cache and module.
sw=root/'sw.js'
w=sw.read_text(encoding='utf-8')
w=re.sub(r"chebsel-pwa-stable-v\d+","chebsel-pwa-stable-v1130",w)
if " './js/institutional-ops.js'," not in w:
    w=w.replace(" './js/report-images.js',"," './js/report-images.js',\n './js/institutional-ops.js',")
sw.write_text(w,encoding='utf-8')

# Bootstrap metadata.
boot=root/'js/bootstrap.js'
b=boot.read_text(encoding='utf-8')
b=re.sub(r"version:'[^']+'","version:'1.13.0'",b)
if 'institutional-ops' not in b:
    b=b.replace("'sync-policy'","'sync-policy','institutional-ops'")
boot.write_text(b,encoding='utf-8')

print('CHEBSEL v1.13.0 institutional operations patch applied')
