from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=re.sub(r'CHEBSEL v1\.13\.\d+ — Centre de gestion','CHEBSEL v1.14.0 — Centre de gestion',s)
s=re.sub(r'<span class="versionChip">v1\.13\.\d+</span>','<span class="versionChip">v1.14.0</span>',s)
if './js/monthly-governance-1140.js?v=1400' not in s:
    anchor=re.search(r'<script src="\./js/closing-canonical-1134\.js\?v=[^"]+"></script>',s)
    if not anchor: raise SystemExit('closing-canonical anchor not found')
    a=anchor.group(0)
    s=s.replace(a,a+'\n<script src="./js/monthly-governance-1140.js?v=1400"></script>',1)
idx.write_text(s,encoding='utf-8')

mf=root/'manifest.webmanifest'
m=mf.read_text(encoding='utf-8')
m=re.sub(r'CHEBSEL v1\.13\.\d+','CHEBSEL v1.14.0',m)
mf.write_text(m,encoding='utf-8')

sw=root/'sw.js'
w=sw.read_text(encoding='utf-8')
w=re.sub(r"chebsel-pwa-stable-v\d+","chebsel-pwa-stable-v1140",w)
if " './js/monthly-governance-1140.js'," not in w:
    w=w.replace(" './js/closing-canonical-1134.js',"," './js/closing-canonical-1134.js',\n './js/monthly-governance-1140.js',")
sw.write_text(w,encoding='utf-8')

boot=root/'js/bootstrap.js'
if boot.exists():
    b=boot.read_text(encoding='utf-8')
    b=re.sub(r"version:'1\.13\.\d+'","version:'1.14.0'",b)
    boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.14.0 monthly governance patch applied')
