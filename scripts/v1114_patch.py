from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.11.3 — Centre de gestion','CHEBSEL v1.11.4 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.10.3</span>','<span class="versionChip">v1.11.4</span>')
s=s.replace('<div class="loginPrivacyNote">🔒 Aucune donnée CHEBSEL n’est affichée avant l’ouverture d’une session.</div>','<div class="loginPraiseVerse"><blockquote>« Que tout ce qui respire loue l’Éternel ! Louez l’Éternel ! »</blockquote><cite>Psaume 150:6</cite></div>')
s=s.replace('</style>','\n.loginPraiseVerse{margin:18px auto 2px;max-width:520px;text-align:center;padding:14px 16px;border-top:1px solid rgba(197,157,63,.28);color:#c59d3f}.loginPraiseVerse blockquote{margin:0;font-size:.88rem;line-height:1.55;font-style:italic;font-weight:650;color:#cfa94d}.loginPraiseVerse cite{display:block;margin-top:6px;font-size:.72rem;font-style:normal;font-weight:800;letter-spacing:.045em;color:#b98b2f}html[data-theme="dark"] .loginPraiseVerse blockquote{color:#e2c36c}\n</style>',1)
p.write_text(s,encoding='utf-8')
