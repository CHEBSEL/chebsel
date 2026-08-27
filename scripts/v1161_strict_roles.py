from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.16.0 — Centre de gestion','CHEBSEL v1.16.1 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.16.0</span>','<span class="versionChip">v1.16.1</span>')
if './js/strict-role-ui-1161.js?v=1610' not in s:
    m=re.search(r'<script src="\./js/role-shell-1160\.js\?v=[^"]+"></script>',s)
    if not m: raise SystemExit('role-shell anchor not found')
    anchor=m.group(0)
    s=s.replace(anchor,anchor+'\n<script src="./js/strict-role-ui-1161.js?v=1610"></script>',1)
idx.write_text(s,encoding='utf-8')

css=root/'css/app.css'
c=css.read_text(encoding='utf-8')
marker='/* CHEBSEL v1.16.1 strict role distribution */'
if marker not in c:
 c += '''\n\n/* CHEBSEL v1.16.1 strict role distribution */\n.strictRoleArea{margin-top:18px;padding:16px;background:var(--card);border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow)}\n.strictRoleHead{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--line)}\n.strictRoleEyebrow{display:block;font-size:.68rem;letter-spacing:.11em;font-weight:900;color:var(--brand-gold);margin-bottom:3px}.strictRoleHead h2{margin:0;font-size:1.35rem}.strictRoleHead p{margin:5px 0 0;color:var(--muted);font-size:.82rem;line-height:1.45}.strictRoleBadge{display:inline-flex;padding:6px 10px;border:1px solid color-mix(in srgb,var(--brand-gold) 55%,var(--line));border-radius:999px;font-size:.72rem;font-weight:900;color:var(--brand-gold);white-space:nowrap}.strictRoleArea #roleShellGrid{display:grid!important;visibility:visible!important;opacity:1!important}.calendarRoleNote{margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)}\n@media(max-width:620px){.strictRoleHead{display:block}.strictRoleBadge{margin-top:9px}.strictRoleArea{padding:12px}}\n'''
 css.write_text(c,encoding='utf-8')

manifest=root/'manifest.webmanifest'
if manifest.exists():
 m=manifest.read_text(encoding='utf-8').replace('v1.16.0','v1.16.1')
 manifest.write_text(m,encoding='utf-8')

sw=root/'sw.js'
w=sw.read_text(encoding='utf-8')
w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1161",w)
if " './js/strict-role-ui-1161.js'," not in w:
 w=w.replace(" './js/role-shell-1160.js',"," './js/role-shell-1160.js',\n './js/strict-role-ui-1161.js',")
sw.write_text(w,encoding='utf-8')

boot=root/'js/bootstrap.js'
if boot.exists():
 b=boot.read_text(encoding='utf-8').replace("version:'1.15.0'","version:'1.16.1'").replace("version:'1.16.0'","version:'1.16.1'")
 boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.16.1 strict role distribution patched')
