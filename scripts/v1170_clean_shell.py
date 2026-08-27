from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=re.sub(r'CHEBSEL v1\.16\.\d+ — Centre de gestion','CHEBSEL v1.17.0 — Centre de gestion',s)
s=re.sub(r'<span class="versionChip">v1\.16\.\d+</span>','<span class="versionChip">v1.17.0</span>',s)
if './js/clean-shell-1170.js?v=1700' not in s:
    s=s.replace('</body>','<script src="./js/clean-shell-1170.js?v=1700"></script>\n</body>',1)
idx.write_text(s,encoding='utf-8')

css=root/'css/app.css'
c=css.read_text(encoding='utf-8')
marker='/* CHEBSEL v1.17.0 clean shell */'
if marker not in c:
    c+='''\n\n/* CHEBSEL v1.17.0 clean shell */\n.cleanRoleRoot{margin-top:16px}.cleanRoleHeader{display:flex;align-items:center;justify-content:space-between;margin:0 0 10px}.cleanRoleHeader h2{margin:0;font-size:1.18rem}.cleanRoleGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.cleanNavCard{min-height:112px;border:1px solid var(--line);border-radius:18px;background:var(--card);color:var(--text);box-shadow:var(--shadow-sm);padding:16px;text-align:left;display:flex;flex-direction:column;justify-content:center;gap:10px}.cleanNavCard:active{transform:scale(.99)}.cleanNavIcon{font-size:1.7rem}.cleanNavTitle{font-weight:900;font-size:.98rem}.old-tech-panel,.visitorOnlyNote,#syncMessage,.smallnote{display:none!important}@media(min-width:760px){.cleanRoleGrid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:520px){.cleanRoleGrid{grid-template-columns:1fr 1fr;gap:9px}.cleanNavCard{min-height:96px;padding:13px}.cleanNavTitle{font-size:.9rem}}\n'''
css.write_text(c,encoding='utf-8')

manifest=root/'manifest.webmanifest'
if manifest.exists():
    m=manifest.read_text(encoding='utf-8')
    m=re.sub(r'v1\.16\.\d+','v1.17.0',m)
    manifest.write_text(m,encoding='utf-8')

sw=root/'sw.js'
if sw.exists():
    w=sw.read_text(encoding='utf-8')
    w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1170",w)
    if " './js/clean-shell-1170.js'," not in w:
        w=w.replace(" './js/role-shell-1160.js',"," './js/role-shell-1160.js',\n './js/clean-shell-1170.js',")
    sw.write_text(w,encoding='utf-8')
print('CHEBSEL v1.17.0 clean shell patched')
