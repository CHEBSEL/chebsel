from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.17.2 — Centre de gestion','CHEBSEL v1.17.3 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.17.2</span>','<span class="versionChip">v1.17.3</span>')
if './js/treasurer-scope-1173.js?v=1730' not in s:
    m=re.search(r'<script src="\./js/secretary-scope-1171\.js\?v=[^"]+"></script>',s)
    if not m: raise SystemExit('secretary scope anchor not found')
    anchor=m.group(0)
    s=s.replace(anchor,anchor+'\n<script src="./js/treasurer-scope-1173.js?v=1730"></script>',1)
idx.write_text(s,encoding='utf-8')
manifest=root/'manifest.webmanifest'
if manifest.exists():
    m=manifest.read_text(encoding='utf-8').replace('v1.17.2','v1.17.3')
    manifest.write_text(m,encoding='utf-8')
sw=root/'sw.js'
if sw.exists():
    w=sw.read_text(encoding='utf-8')
    w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1173",w)
    if " './js/treasurer-scope-1173.js'," not in w:
        w=w.replace(" './js/secretary-scope-1171.js',"," './js/secretary-scope-1171.js',\n './js/treasurer-scope-1173.js',")
    sw.write_text(w,encoding='utf-8')
boot=root/'js/bootstrap.js'
if boot.exists():
    b=boot.read_text(encoding='utf-8')
    b=re.sub(r"version:'[^']+'","version:'1.17.3'",b,count=1)
    boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.17.3 Treasurer scope patched')
