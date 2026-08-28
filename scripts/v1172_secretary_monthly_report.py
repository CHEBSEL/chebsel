from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.17.1 — Centre de gestion','CHEBSEL v1.17.2 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.17.1</span>','<span class="versionChip">v1.17.2</span>')
s=re.sub(r'\./js/secretary-scope-1171\.js\?v=[^"\']+','./js/secretary-scope-1171.js?v=1720',s)
idx.write_text(s,encoding='utf-8')
manifest=root/'manifest.webmanifest'
if manifest.exists():
    m=manifest.read_text(encoding='utf-8').replace('v1.17.1','v1.17.2')
    manifest.write_text(m,encoding='utf-8')
sw=root/'sw.js'
if sw.exists():
    w=sw.read_text(encoding='utf-8')
    w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1172",w)
    sw.write_text(w,encoding='utf-8')
boot=root/'js/bootstrap.js'
if boot.exists():
    b=boot.read_text(encoding='utf-8').replace("version:'1.17.1'","version:'1.17.2'")
    boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.17.2 secretary monthly report patched')
