from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.15.0 — Centre de gestion','CHEBSEL v1.16.0 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.15.0</span>','<span class="versionChip">v1.16.0</span>')
if './js/role-shell-1160.js?v=1600' not in s:
    anchor='<script src="./js/bootstrap.js?v=1300"></script>'
    if anchor not in s:
        m=re.search(r'<script src="\./js/bootstrap\.js\?v=[^"]+"></script>',s)
        if not m: raise SystemExit('bootstrap anchor not found')
        anchor=m.group(0)
    s=s.replace(anchor,'<script src="./js/role-shell-1160.js?v=1600"></script>\n'+anchor,1)
idx.write_text(s,encoding='utf-8')

manifest=root/'manifest.webmanifest'
if manifest.exists():
    m=manifest.read_text(encoding='utf-8').replace('v1.15.0','v1.16.0')
    manifest.write_text(m,encoding='utf-8')

sw=root/'sw.js'
if sw.exists():
    w=sw.read_text(encoding='utf-8')
    w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1160",w)
    if " './js/role-shell-1160.js'," not in w:
        w=w.replace(" './js/reports-center-1150.js',"," './js/reports-center-1150.js',\n './js/role-shell-1160.js',")
    sw.write_text(w,encoding='utf-8')
print('CHEBSEL v1.16.0 role shell patched')
