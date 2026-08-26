from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.11.4 — Centre de gestion','CHEBSEL v1.11.5 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.11.4</span>','<span class="versionChip">v1.11.5</span>')
old='''<style>\n:root{\n --bg:#f4f7fb;--card:#fff;--text:#142033;--muted:#667085;--line:#dfe5ee;--top:#0b1220;\n --primary:#194185;--soft:#eef4ff;--shadow:0 14px 40px rgba(16,24,40,.10);\n --green:#16794b;--red:#b42318;--amber:#b54708;--input:#fff;--chip:#eef2f6;\n}\nhtml[data-theme="dark"]{\n --bg:#0d1117;--card:#161b22;--text:#f0f3f7;--muted:#9da7b5;--line:#30363d;--top:#05080d;\n --primary:#76a9ff;--soft:#111a28;--shadow:0 15px 42px rgba(0,0,0,.38);\n --green:#5dd39e;--red:#ff8a80;--amber:#ffc463;--input:#0f141b;--chip:#232a34;\n}\n'''
new='''<style>\n:root{\n /* CHEBSEL official brand tokens */\n --brand-navy:#0B1220;\n --brand-navy-2:#102644;\n --brand-navy-3:#18375F;\n --brand-royal:#194185;\n --brand-gold:#C59D3F;\n --brand-gold-light:#D8B65A;\n --brand-gold-soft:#F7F0DE;\n --surface-page:#F4F7FB;\n --surface-card:#FFFFFF;\n --text-main:#142033;\n --text-muted:#667085;\n --border-soft:#DFE5EE;\n --state-success:#16794B;\n --state-warning:#B54708;\n --state-danger:#B42318;\n --shadow-sm:0 4px 14px rgba(16,24,40,.06);\n --shadow-md:0 10px 28px rgba(16,24,40,.09);\n --shadow-lg:0 18px 48px rgba(16,24,40,.13);\n\n /* Compatibility mapping */\n --bg:var(--surface-page);--card:var(--surface-card);--text:var(--text-main);--muted:var(--text-muted);--line:var(--border-soft);--top:var(--brand-navy);\n --primary:var(--brand-royal);--soft:#EEF4FF;--shadow:var(--shadow-md);\n --green:var(--state-success);--red:var(--state-danger);--amber:var(--state-warning);--input:var(--surface-card);--chip:#EEF2F6;\n}\nhtml[data-theme="dark"]{\n --brand-gold:#E2C36C;\n --brand-gold-light:#ECD581;\n --brand-gold-soft:#2A2415;\n --surface-page:#0D1117;\n --surface-card:#161B22;\n --text-main:#F0F3F7;\n --text-muted:#9DA7B5;\n --border-soft:#30363D;\n --state-success:#5DD39E;\n --state-warning:#FFC463;\n --state-danger:#FF8A80;\n --shadow-sm:0 4px 14px rgba(0,0,0,.22);\n --shadow-md:0 12px 30px rgba(0,0,0,.34);\n --shadow-lg:0 20px 52px rgba(0,0,0,.46);\n --bg:var(--surface-page);--card:var(--surface-card);--text:var(--text-main);--muted:var(--text-muted);--line:var(--border-soft);--top:#05080D;\n --primary:#76A9FF;--soft:#111A28;--shadow:var(--shadow-md);\n --green:var(--state-success);--red:var(--state-danger);--amber:var(--state-warning);--input:#0F141B;--chip:#232A34;\n}\n'''
if old not in s:
    # Brand tokens are already applied in normal v1.11.5 -> v1.11.6 stabilization runs.
    pass
else:
    s=s.replace(old,new,1)
    s=s.replace('background:linear-gradient(135deg,#08111f 0%,#102644 58%,#18375f 100%)','background:linear-gradient(135deg,var(--brand-navy) 0%,var(--brand-navy-2) 58%,var(--brand-navy-3) 100%)')
    s=s.replace('background:linear-gradient(135deg,#0b1220,#1c3358)','background:linear-gradient(135deg,var(--brand-navy),var(--brand-navy-3))')
    s=s.replace('.versionChip{display:inline-flex;align-items:center;padding:5px 8px;border:1px solid rgba(255,255,255,.16);border-radius:999px;font-size:.68rem;font-weight:850;background:rgba(255,255,255,.08);color:#fff;white-space:nowrap}', '.versionChip{display:inline-flex;align-items:center;padding:5px 8px;border:1px solid rgba(197,157,63,.55);border-radius:999px;font-size:.68rem;font-weight:850;background:rgba(197,157,63,.12);color:var(--brand-gold-light);white-space:nowrap}')
    s=s.replace('color:#c59d3f}.loginPraiseVerse blockquote{margin:0;font-size:.88rem;line-height:1.55;font-style:italic;font-weight:650;color:#cfa94d}.loginPraiseVerse cite{display:block;margin-top:6px;font-size:.72rem;font-style:normal;font-weight:800;letter-spacing:.045em;color:#b98b2f}', 'color:var(--brand-gold)}.loginPraiseVerse blockquote{margin:0;font-size:.88rem;line-height:1.55;font-style:italic;font-weight:650;color:var(--brand-gold-light)}.loginPraiseVerse cite{display:block;margin-top:6px;font-size:.72rem;font-style:normal;font-weight:800;letter-spacing:.045em;color:var(--brand-gold)}')
    s += '\n<!-- CHEBSEL Brand Palette v1.11.5: Navy + Royal Blue + Gold + White -->\n'
p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
if sw.exists():
    t=sw.read_text(encoding='utf-8')
    t=t.replace('v1114','v1115').replace('v1.11.4','v1.11.5')
    sw.write_text(t,encoding='utf-8')

m=Path('manifest.webmanifest')
if m.exists():
    t=m.read_text(encoding='utf-8')
    t=t.replace('v1.11.4','v1.11.5')
    m.write_text(t,encoding='utf-8')

# v1.11.6 stabilization trigger
