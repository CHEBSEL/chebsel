from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.14.0 — Centre de gestion','CHEBSEL v1.14.1 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.14.0</span>','<span class="versionChip">v1.14.1</span>')
if './js/deletion-1141.js?v=1410' not in s:
    m=re.search(r'<script src="\./js/monthly-governance-1140\.js\?v=[^"]+"></script>',s)
    if not m: raise SystemExit('monthly-governance anchor not found')
    a=m.group(0);s=s.replace(a,a+'\n<script src="./js/deletion-1141.js?v=1410"></script>',1)
idx.write_text(s,encoding='utf-8')

mf=root/'manifest.webmanifest';m=mf.read_text(encoding='utf-8').replace('CHEBSEL v1.14.0','CHEBSEL v1.14.1');mf.write_text(m,encoding='utf-8')
sw=root/'sw.js';w=sw.read_text(encoding='utf-8');w=re.sub(r"chebsel-pwa-stable-v\d+","chebsel-pwa-stable-v1141",w)
if " './js/deletion-1141.js'," not in w:w=w.replace(" './js/monthly-governance-1140.js',"," './js/monthly-governance-1140.js',\n './js/deletion-1141.js',")
sw.write_text(w,encoding='utf-8')
boot=root/'js/bootstrap.js';b=boot.read_text(encoding='utf-8');b=re.sub(r"version:'1\.14\.0'","version:'1.14.1'",b)
if "'deletion-1141'" not in b:b=b.replace('modules:[',"modules:['deletion-1141',",1)
boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.14.1 durable deletion patch applied')
