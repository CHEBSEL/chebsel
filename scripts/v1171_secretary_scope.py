from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.17.0 — Centre de gestion','CHEBSEL v1.17.1 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.17.0</span>','<span class="versionChip">v1.17.1</span>')
if './js/secretary-scope-1171.js?v=1710' not in s:
    m=re.search(r'<script src="\./js/clean-shell-1170\.js\?v=[^"]+"></script>',s)
    if not m: raise SystemExit('clean-shell anchor not found')
    anchor=m.group(0)
    s=s.replace(anchor,anchor+'\n<script src="./js/secretary-scope-1171.js?v=1710"></script>',1)
idx.write_text(s,encoding='utf-8')
manifest=root/'manifest.webmanifest'
if manifest.exists():
    m=manifest.read_text(encoding='utf-8').replace('v1.17.0','v1.17.1')
    manifest.write_text(m,encoding='utf-8')
sw=root/'sw.js'
if sw.exists():
    w=sw.read_text(encoding='utf-8')
    w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1171",w)
    if " './js/secretary-scope-1171.js'," not in w:
        w=w.replace(" './js/clean-shell-1170.js',"," './js/clean-shell-1170.js',\n './js/secretary-scope-1171.js',")
    sw.write_text(w,encoding='utf-8')
boot=root/'js/bootstrap.js'
if boot.exists():
    b=boot.read_text(encoding='utf-8').replace("version:'1.17.0'","version:'1.17.1'").replace("version:'1.15.0'","version:'1.17.1'")
    boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.17.1 secretary scope patched')
