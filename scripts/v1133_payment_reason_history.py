from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'; s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.13.2 — Centre de gestion','CHEBSEL v1.13.3 — Centre de gestion')
s=s.replace('CHEBSEL v1.13.1 — Centre de gestion','CHEBSEL v1.13.3 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.13.2</span>','<span class="versionChip">v1.13.3</span>').replace('<span class="versionChip">v1.13.1</span>','<span class="versionChip">v1.13.3</span>')
if './js/payment-reason-history-1133.js?v=1330' not in s:
    anchor=re.search(r'<script src="\./js/stability-1132\.js\?v=[^"]+"></script>',s)
    if not anchor: raise SystemExit('stability-1132 anchor not found')
    a=anchor.group(0); s=s.replace(a,a+'\n<script src="./js/payment-reason-history-1133.js?v=1330"></script>',1)
idx.write_text(s,encoding='utf-8')

css=root/'css/app.css'; c=css.read_text(encoding='utf-8')
if 'CHEBSEL v1.13.3 monthly history controls' not in c:
    c+='''\n/* CHEBSEL v1.13.3 monthly history controls */\n.monthlyHistoryNav{margin-left:auto;align-items:center;flex-wrap:wrap}.monthlyHistoryNav input[type=month]{min-width:150px;max-width:180px}.monthlyHistoryNav button:disabled{opacity:.4;cursor:not-allowed}.monthlyHistoryNav .secondaryQuick{min-width:46px}\n@media(max-width:680px){.profileTitle{align-items:flex-start;gap:10px;flex-wrap:wrap}.monthlyHistoryNav{width:100%;margin-left:0}.monthlyHistoryNav input[type=month]{flex:1;min-width:140px}}\n'''
css.write_text(c,encoding='utf-8')

manifest=root/'manifest.webmanifest'; m=manifest.read_text(encoding='utf-8'); m=re.sub(r'v1\.13\.[12]', 'v1.13.3', m); manifest.write_text(m,encoding='utf-8')
sw=root/'sw.js'; w=sw.read_text(encoding='utf-8'); w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1133",w)
if " './js/payment-reason-history-1133.js'," not in w:
    w=w.replace(" './js/stability-1132.js',"," './js/stability-1132.js',\n './js/payment-reason-history-1133.js',")
sw.write_text(w,encoding='utf-8')
boot=root/'js/bootstrap.js'; b=boot.read_text(encoding='utf-8'); b=re.sub(r"version:'1\.13\.[12]'","version:'1.13.3'",b)
if 'payment-reason-history-1133' not in b: b=b.replace("'corrections-1131'","'corrections-1131','stability-1132','payment-reason-history-1133'")
boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.13.3 patch applied')
