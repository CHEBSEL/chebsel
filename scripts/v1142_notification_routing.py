from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=re.sub(r'CHEBSEL v1\.14\.1 — Centre de gestion','CHEBSEL v1.14.2 — Centre de gestion',s)
s=re.sub(r'<span class="versionChip">v1\.14\.1</span>','<span class="versionChip">v1.14.2</span>',s)
anchor='<script src="./js/monthly-governance-1140.js?v=1400"></script>'
script='<script src="./js/notification-routing-1142.js?v=1420"></script>'
if script not in s:
    if anchor not in s: raise SystemExit('monthly governance script anchor not found')
    s=s.replace(anchor,anchor+'\n'+script,1)
# Add small actionable-alert styling without touching app.css.
style='''\n<style id="notification-routing-1142-style">\n.alertRow.actionableAlert{cursor:pointer;position:relative;padding-right:90px;transition:border-color .16s ease,background .16s ease,transform .16s ease}\n.alertRow.actionableAlert:focus{outline:2px solid #c59d3f;outline-offset:2px}\n.alertRow.actionableAlert:active{transform:scale(.995)}\n.alertRouteHint{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:.78rem;font-weight:800;color:#c59d3f;white-space:nowrap}\n@media(max-width:520px){.alertRow.actionableAlert{padding-right:22px;padding-bottom:34px}.alertRouteHint{top:auto;bottom:10px;right:14px;transform:none}}\n@media(hover:hover) and (pointer:fine){.alertRow.actionableAlert:hover{border-color:#c59d3f;background:color-mix(in srgb,#c59d3f 6%,transparent)}}\n</style>\n'''
if 'notification-routing-1142-style' not in s:
    s=s.replace('</head>',style+'</head>',1)
idx.write_text(s,encoding='utf-8')

mf=root/'manifest.webmanifest'
m=mf.read_text(encoding='utf-8').replace('CHEBSEL v1.14.1','CHEBSEL v1.14.2')
mf.write_text(m,encoding='utf-8')

sw=root/'sw.js'
w=sw.read_text(encoding='utf-8')
w=re.sub(r"chebsel-pwa-stable-v\d+","chebsel-pwa-stable-v1142",w)
entry=" './js/notification-routing-1142.js',"
if entry not in w:
    a=" './js/monthly-governance-1140.js',"
    if a not in w: raise SystemExit('service worker anchor not found')
    w=w.replace(a,a+'\n'+entry,1)
sw.write_text(w,encoding='utf-8')

boot=root/'js/bootstrap.js'
if boot.exists():
    b=boot.read_text(encoding='utf-8')
    b=re.sub(r"version:'1\.14\.1'","version:'1.14.2'",b)
    if "'notification-routing-1142'" not in b:
        b=b.replace("modules:[", "modules:['notification-routing-1142',",1)
    boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.14.2 actionable notifications patch applied')
