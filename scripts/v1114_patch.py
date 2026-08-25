from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.11.3 — Centre de gestion','CHEBSEL v1.11.4 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.10.3</span>','<span class="versionChip">v1.11.4</span>')
s=s.replace("const APP_VERSION='1.11.3'","const APP_VERSION='1.11.4'")
s=s.replace('const APP_VERSION="1.11.3"','const APP_VERSION="1.11.4"')
s=s.replace('<div class="loginPrivacyNote">🔒 Aucune donnée CHEBSEL n’est affichée avant l’ouverture d’une session.</div>','<div class="loginPraiseVerse"><blockquote>« Que tout ce qui respire loue l’Éternel ! Louez l’Éternel ! »</blockquote><cite>Psaume 150:6</cite></div>')
if '.loginPraiseVerse{' not in s:
    s=s.replace('</style>','\n.loginPraiseVerse{margin:18px auto 2px;max-width:520px;text-align:center;padding:14px 16px;border-top:1px solid rgba(197,157,63,.28);color:#c59d3f}.loginPraiseVerse blockquote{margin:0;font-size:.88rem;line-height:1.55;font-style:italic;font-weight:650;color:#cfa94d}.loginPraiseVerse cite{display:block;margin-top:6px;font-size:.72rem;font-style:normal;font-weight:800;letter-spacing:.045em;color:#b98b2f}html[data-theme="dark"] .loginPraiseVerse blockquote{color:#e2c36c}html[data-theme="dark"] .loginPraiseVerse cite{color:#cda64d}\n</style>',1)
p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
if sw.exists():
    w=sw.read_text(encoding='utf-8')
    for old in ['chebsel-pwa-stable-v1113','chebsel-pwa-stable-v1112','chebsel-pwa-stable-v1111','chebsel-pwa-stable-v1110']:
        w=w.replace(old,'chebsel-pwa-stable-v1114')
    sw.write_text(w,encoding='utf-8')

mf=Path('manifest.webmanifest')
if mf.exists():
    m=mf.read_text(encoding='utf-8')
    for old in ['CHEBSEL v1.11.3','CHEBSEL v1.11.2','CHEBSEL v1.11.1']:
        m=m.replace(old,'CHEBSEL v1.11.4')
    mf.write_text(m,encoding='utf-8')
