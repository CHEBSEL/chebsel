from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('CHEBSEL v1.11.2 — Centre de gestion','CHEBSEL v1.11.3 — Centre de gestion')
s=s.replace("const APP_VERSION='1.11.2'","const APP_VERSION='1.11.3'")
s=s.replace('>v1.11.2<','>v1.11.3<')

anchor=".roleChoiceGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:14px 0}.roleChoice{border:1px solid var(--line);background:var(--soft);color:var(--text);border-radius:16px;padding:16px 10px;font-weight:900;min-height:82px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}.roleChoice span{font-size:1.45rem}.roleChoice.active{outline:3px solid var(--primary);background:var(--card)}.roleChoice.visitor{grid-column:1/-1}.loginRoleName{text-align:center;font-weight:900;margin:4px 0 10px}.role-hidden{display:none!important}@media(min-width:620px){.roleChoiceGrid{grid-template-columns:repeat(4,1fr)}.roleChoice.visitor{grid-column:auto}}"
replacement=""".roleChoiceGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}.roleChoice{border:1px solid var(--line);background:var(--soft);color:var(--text);border-radius:16px;padding:16px 10px;font-weight:900;min-height:82px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}.roleChoice span{font-size:1.45rem}.roleChoice.active{outline:3px solid var(--primary);background:var(--card)}.roleChoice[data-login-role=\"president\"]{grid-column:1/-1}.roleChoice.visitor{grid-column:1/-1}.loginRoleName{text-align:center;font-weight:900;margin:4px 0 10px}.role-hidden{display:none!important}@media(min-width:620px){.roleChoiceGrid{grid-template-columns:repeat(4,1fr)}.roleChoice[data-login-role=\"president\"],.roleChoice.visitor{grid-column:auto}}"""
if anchor not in s:
    raise SystemExit('role choice CSS anchor not found')
s=s.replace(anchor,replacement,1)

p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
if sw.exists():
    t=sw.read_text(encoding='utf-8')
    t=t.replace("chebsel-pwa-stable-v1112","chebsel-pwa-stable-v1113")
    t=t.replace("chebsel-pwa-stable-v1111","chebsel-pwa-stable-v1113")
    sw.write_text(t,encoding='utf-8')

mf=Path('manifest.webmanifest')
if mf.exists():
    t=mf.read_text(encoding='utf-8')
    t=t.replace('v1.11.2','v1.11.3')
    t=t.replace('v1.11.1','v1.11.3')
    mf.write_text(t,encoding='utf-8')
