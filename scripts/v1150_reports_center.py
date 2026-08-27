from pathlib import Path
import re
root=Path('.')

# index + version + new module
p=root/'index.html'; s=p.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.14.2 — Centre de gestion','CHEBSEL v1.15.0 — Centre de gestion').replace('CHEBSEL v1.14.1 — Centre de gestion','CHEBSEL v1.15.0 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.14.2</span>','<span class="versionChip">v1.15.0</span>').replace('<span class="versionChip">v1.14.1</span>','<span class="versionChip">v1.15.0</span>')
if './js/reports-center-1150.js?v=1500' not in s:
    anchor='<script src="./js/deletion-1141.js?v=1410"></script>'
    if anchor not in s: raise SystemExit('deletion module anchor missing')
    s=s.replace(anchor,anchor+'\n<script src="./js/reports-center-1150.js?v=1500"></script>')
p.write_text(s,encoding='utf-8')

# Individual notification read state: keep the existing alert source IDs as the canonical read keys.
p=root/'js/institutional-ops.js'; s=p.read_text(encoding='utf-8')
old="window.markAllAlertsRead=function(){const s=readSet();lastAlerts.forEach(a=>s.add(a.id));localStorage.setItem(ALERT_READ_KEY,JSON.stringify([...s].slice(-500)));renderAlertsPanel();updateAlertBadge()}"
new=old+"\n window.markAlertRead=function(id){if(!id)return;const s=readSet();s.add(String(id));localStorage.setItem(ALERT_READ_KEY,JSON.stringify([...s].slice(-500)));return updateAlertBadge()}"
if 'window.markAlertRead=function' not in s:
    if old not in s: raise SystemExit('markAllAlertsRead anchor missing')
    s=s.replace(old,new,1)
old_render="box.innerHTML=lastAlerts.length?lastAlerts.map(a=>`<div class=\"alertRow alert-${esc(a.severity)} ${read.has(a.id)?'alert-read':''}\"><div class=\"alertDot\"></div><div><b>${esc(a.title)}</b><div class=\"memberMeta\">${esc(a.text)}</div></div></div>`).join(''):'<div class=\"statusGood\">✓ Aucun signal nécessitant votre attention.</div>';"
new_render="box.innerHTML=lastAlerts.length?lastAlerts.map(a=>`<div class=\"alertRow alert-${esc(a.severity)} ${read.has(a.id)?'alert-read':'alert-unread'}\" data-alert-id=\"${esc(a.id)}\"><div class=\"alertDot\"></div><div><b>${esc(a.title)}</b><div class=\"memberMeta\">${esc(a.text)}</div></div></div>`).join(''):'<div class=\"statusGood\">✓ Aucun signal nécessitant votre attention.</div>';"
if 'data-alert-id=' not in s:
    if old_render not in s: raise SystemExit('alert render anchor missing')
    s=s.replace(old_render,new_render,1)
p.write_text(s,encoding='utf-8')

# CSS: reports center, notification hierarchy and login busy feedback.
p=root/'css/app.css'; c=p.read_text(encoding='utf-8')
marker='/* CHEBSEL v1.15.0 unified reports center */'
if marker not in c:
    c += '''\n\n/* CHEBSEL v1.15.0 unified reports center */\n.reportsRoleGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:14px}\n.reportHubCard{width:100%;min-height:112px;display:flex;align-items:center;gap:14px;text-align:left;padding:17px;border-radius:18px;border:1px solid var(--border,#dfe5ee);background:var(--surface-card,#fff);color:inherit;cursor:pointer}\n.reportHubCard:hover{border-color:var(--brand-gold,#c59d3f)}\n.reportHubIcon{font-size:30px;flex:0 0 42px}.reportHubCopy{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}.reportHubCopy b{font-size:16px}.reportHubCopy small{color:var(--text-muted,#667085);line-height:1.4}.reportHubCopy em{font-style:normal;font-size:11px;font-weight:800;color:var(--brand-gold,#c59d3f)}.reportHubArrow{font-size:24px}\n.reportPresets{margin-top:10px;flex-wrap:wrap}.reportGlobalResult h3{margin:18px 0 8px}.reportSynthesis{margin-top:16px;padding:12px;border-left:3px solid var(--brand-gold,#c59d3f)}\n.alertRow.actionableAlert{position:relative;padding-right:88px;transition:opacity .18s ease,background .18s ease,border-color .18s ease}.alertRow.alert-unread{font-weight:650;border-color:rgba(197,157,63,.65)!important;background:rgba(197,157,63,.08)}.alertRow.alert-read{opacity:.52;background:transparent!important}.alertRow.alert-read .alertRouteHint{opacity:.72}.alertRouteHint{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:800;color:var(--brand-gold,#c59d3f)}\n#loginModal button[aria-busy=\"true\"]{opacity:.72;cursor:wait;pointer-events:none}\n@media(max-width:520px){.reportsRoleGrid{grid-template-columns:1fr}.reportHubCard{min-height:96px;padding:14px}.alertRow.actionableAlert{padding-right:72px}.alertRouteHint{right:10px;font-size:11px}}\n'''
p.write_text(c,encoding='utf-8')

# manifest
p=root/'manifest.webmanifest'; m=p.read_text(encoding='utf-8'); m=re.sub(r'CHEBSEL v1\.14\.[0-9]+','CHEBSEL v1.15.0',m); p.write_text(m,encoding='utf-8')

# SW
p=root/'sw.js'; w=p.read_text(encoding='utf-8'); w=re.sub(r"chebsel-pwa-stable-v[0-9]+","chebsel-pwa-stable-v1150",w)
if " './js/reports-center-1150.js'," not in w:
    w=w.replace(" './js/deletion-1141.js',"," './js/deletion-1141.js',\n './js/reports-center-1150.js',")
p.write_text(w,encoding='utf-8')

# bootstrap version
p=root/'js/bootstrap.js'; b=p.read_text(encoding='utf-8'); b=re.sub(r"version:'1\.[0-9]+\.[0-9]+'","version:'1.15.0'",b); p.write_text(b,encoding='utf-8')
print('CHEBSEL v1.15.0 patch applied')
