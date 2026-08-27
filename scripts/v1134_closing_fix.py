from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.13.3 — Centre de gestion','CHEBSEL v1.13.4 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.13.3</span>','<span class="versionChip">v1.13.4</span>')
if './js/closing-canonical-1134.js?v=1340' not in s:
    anchor='<script src="./js/payment-reason-history-1133.js?v=1330"></script>'
    if anchor not in s: raise SystemExit('payment reason anchor missing')
    s=s.replace(anchor,anchor+'\n<script src="./js/closing-canonical-1134.js?v=1340"></script>')
idx.write_text(s,encoding='utf-8')

m=root/'manifest.webmanifest'
text=m.read_text(encoding='utf-8').replace('v1.13.3','v1.13.4').replace('v1.13.2','v1.13.4')
m.write_text(text,encoding='utf-8')

sw=root/'sw.js'
w=sw.read_text(encoding='utf-8')
w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1134",w)
if " './js/closing-canonical-1134.js'," not in w:
    w=w.replace(" './js/payment-reason-history-1133.js',"," './js/payment-reason-history-1133.js',\n './js/closing-canonical-1134.js',")
sw.write_text(w,encoding='utf-8')

boot=root/'js/bootstrap.js'
if boot.exists():
    b=boot.read_text(encoding='utf-8').replace("version:'1.13.3'","version:'1.13.4'").replace("version:'1.13.2'","version:'1.13.4'")
    boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.13.4 closing canonical patch applied')
