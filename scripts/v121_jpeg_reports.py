from pathlib import Path
import re

root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')

s=s.replace('CHEBSEL v1.12.0 — Centre de gestion','CHEBSEL v1.12.1 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.12.0</span>','<span class="versionChip">v1.12.1</span>')
s=s.replace('./css/app.css?v=1200','./css/app.css?v=1210')

s=s.replace('<button class="save" onclick="printReceipt()">Imprimer / PDF</button>','<button class="save" onclick="saveReceiptJPEG()">Enregistrer en JPEG</button>')
s=s.replace('<button class="secondaryQuick" onclick="printTreasuryReport()">Imprimer / PDF</button>','<button class="secondaryQuick" onclick="saveTreasuryReportJPEG()">Enregistrer en JPEG</button>')

# Remove the mistakenly introduced upload/evidence UI. The backend table can remain unused for compatibility.
s=re.sub(r'\n\s*<div class="profilePanel" id="treasuryEvidencePanel">.*?<div id="treasuryReportEvidenceList" class="evidenceList"></div>\s*</div>','',s,flags=re.S)

# Add punctuality launch card next to attendance-related tools.
needle='''  <button class="launch visitor-hidden" onclick="openAttendance('call')"><div class="icon">✅</div><h2>Fiche d'appel</h2><p>Votre fiche d'appel reste identique, sauf que la gestion des membres est désormais centralisée ici.</p><span class="go">Faire l'appel →</span></button>'''
card='''  <button class="launch visitor-hidden" onclick="openAttendance('call')"><div class="icon">✅</div><h2>Fiche d'appel</h2><p>Votre fiche d'appel reste identique, sauf que la gestion des membres est désormais centralisée ici.</p><span class="go">Faire l'appel →</span></button>\n  <button class="launch visitor-hidden role-hidden" id="punctualityLaunchCard" onclick="openPunctualityReport()"><div class="icon">⏱️</div><h2>Rapport de ponctualité</h2><p>Analyser les présences, retards et absences par période et par membre.</p><span class="go">Générer le rapport →</span></button>'''
if 'id="punctualityLaunchCard"' not in s:
    if needle not in s: raise SystemExit('attendance card anchor not found')
    s=s.replace(needle,card)

# Add punctuality report view before Settings.
view='''\n<div class="membersView" id="punctualityReportView">\n <div class="viewerbar"><button class="back" onclick="closePunctualityReport()">← Retour</button><div class="viewtitle"><b>Rapport de ponctualité</b><span>Présences, retards et absences du groupe</span></div></div>\n <div class="membersBody">\n  <div class="profilePanel">\n   <div class="profileTitle"><div><h3>Période du rapport</h3><div class="memberMeta">Réservé au Président et au Secrétaire.</div></div></div>\n   <div class="treasuryFilters"><div><label>Date début</label><input type="date" id="punctualityFrom"></div><div><label>Date fin</label><input type="date" id="punctualityTo"></div></div>\n   <div class="memberActions"><button class="quickBtn" onclick="renderPunctualityReport()">Générer</button><button class="secondaryQuick" onclick="savePunctualityReportJPEG()">Enregistrer en JPEG</button></div>\n  </div>\n  <div id="punctualityReportBody"></div>\n </div>\n</div>\n'''
if 'id="punctualityReportView"' not in s:
    anchor='<div class="membersView" id="settingsHub">'
    if anchor not in s: raise SystemExit('settings anchor not found')
    s=s.replace(anchor,view+'\n'+anchor)

# Load JPEG report module and stop loading the obsolete upload module.
s=s.replace('<script src="./js/finance-evidence.js?v=1200"></script>\n','')
if './js/report-images.js?v=1210' not in s:
    s=s.replace('<script src="./js/sync-policy.js?v=1200"></script>','<script src="./js/sync-policy.js?v=1200"></script>\n<script src="./js/report-images.js?v=1210"></script>')
s=s.replace('./js/bootstrap.js?v=1200','./js/bootstrap.js?v=1210')
idx.write_text(s,encoding='utf-8')

# Manifest version.
manifest=root/'manifest.webmanifest'
m=manifest.read_text(encoding='utf-8')
m=m.replace('v1.12.0','v1.12.1')
manifest.write_text(m,encoding='utf-8')

# Service worker: cache new module, stop caching obsolete evidence module, bump cache.
sw=root/'sw.js'
w=sw.read_text(encoding='utf-8')
w=re.sub(r"chebsel-pwa-stable-v\d+","chebsel-pwa-stable-v1121",w)
w=w.replace(" './js/finance-evidence.js',\n",'')
if " './js/report-images.js'," not in w:
    w=w.replace(" './js/sync-policy.js',"," './js/sync-policy.js',\n './js/report-images.js',")
sw.write_text(w,encoding='utf-8')

print('CHEBSEL v1.12.1 JPEG reports patch applied')
