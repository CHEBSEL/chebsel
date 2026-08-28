from pathlib import Path
import re, json

# index.html: force the installed PWA to see the new release directly.
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=re.sub(r'<title>CHEBSEL v\d+(?:\.\d+){1,2} — Centre de gestion</title>','<title>CHEBSEL v1.17.8 — Centre de gestion</title>',s,count=1)
s=re.sub(r'<span class="versionChip">v\d+(?:\.\d+){1,2}</span>','<span class="versionChip">v1.17.8</span>',s,count=1)
# Bust the bootstrap cache used by the currently installed v1.17.3 shell.
s=re.sub(r'<script src="\./js/bootstrap\.js\?v=\d+"></script>','<script src="./js/bootstrap.js?v=1780"></script>',s,count=1)
# Load the parity/back patch directly from index as well as via bootstrap.
insert='''<script src="./js/hotfix-1175.js?v=1780"></script>\n<script src="./js/president-scope-1176.js?v=1780"></script>\n<script src="./js/president-scope-1178.js?v=1780"></script>\n<script src="./js/update-manager-1177.js?v=1780"></script>\n'''
if 'president-scope-1178.js?v=1780' not in s:
    marker='<script src="./js/treasurer-scope-1173.js?v=1730"></script>\n'
    if marker not in s:
        raise SystemExit('treasurer script marker not found')
    s=s.replace(marker,marker+insert,1)
p.write_text(s,encoding='utf-8')

# bootstrap runtime marker.
p=Path('js/bootstrap.js')
b=p.read_text(encoding='utf-8')
b=re.sub(r"version:'1\.17\.\d+'","version:'1.17.8'",b,count=1)
if "'president-scope-1178'" not in b:
    b=b.replace("'president-scope-1176']","'president-scope-1176','president-scope-1178','update-manager-1177']",1)
b=b.replace("CHEBSEL v1.17.6","CHEBSEL v1.17.8")
b=b.replace("v1.17.6","v1.17.8")
if "chebsel-president-scope-1178" not in b:
    b=b.replace("chebselLoadRuntime('chebsel-president-scope-1176','./js/president-scope-1176.js?v=1760');",
                "chebselLoadRuntime('chebsel-president-scope-1176','./js/president-scope-1176.js?v=1780');\n chebselLoadRuntime('chebsel-president-scope-1178','./js/president-scope-1178.js?v=1780');\n chebselLoadRuntime('chebsel-update-manager-1177','./js/update-manager-1177.js?v=1780');")
b=b.replace("./js/hotfix-1175.js?v=1760","./js/hotfix-1175.js?v=1780")
p.write_text(b,encoding='utf-8')

# Service worker release cache.
p=Path('sw.js')
w=p.read_text(encoding='utf-8')
w=re.sub(r"const CACHE_NAME='chebsel-pwa-stable-v\d+';","const CACHE_NAME='chebsel-pwa-stable-v1178';",w,count=1)
for f in ['./js/president-scope-1178.js','./js/update-manager-1177.js']:
    if f not in w:
        w=w.replace(" './js/president-scope-1176.js',", " './js/president-scope-1176.js',\n '"+f+"',",1)
p.write_text(w,encoding='utf-8')

# Manifest visible version.
p=Path('manifest.webmanifest')
m=json.loads(p.read_text(encoding='utf-8'))
m['name']='CHEBSEL v1.17.8 — Chœur d’Homme de l’Église Baptiste Sel et Lumière'
m['description']='CHEBSEL v1.17.8 — accès sécurisé, synchronisation et gestion du chœur.'
p.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

print('CHEBSEL v1.17.8 release patch applied')
