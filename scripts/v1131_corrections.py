from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'
s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.13.0 — Centre de gestion','CHEBSEL v1.13.1 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.13.0</span>','<span class="versionChip">v1.13.1</span>')
s=s.replace('./css/app.css?v=1300','./css/app.css?v=1310')
# Remove payment justificatif image upload from the payment form, permanently.
s=re.sub(r'\s*<div class="wide"><label>Photo / reçu justificatif \(optionnel\)</label><input type="file" id="payEvidenceFile"[^>]*><div class="memberMeta">JPEG ou PNG.*?</div></div>','',s,flags=re.S)
# Load corrective integration after whatever current institutional-ops cache-bust is present.
if './js/corrections-1131.js?v=1310' not in s:
    m=re.search(r'<script src="\./js/institutional-ops\.js\?v=[^"]+"></script>',s)
    if not m:
        raise SystemExit('institutional-ops script anchor not found')
    anchor=m.group(0)
    s=s.replace(anchor,anchor+'\n<script src="./js/corrections-1131.js?v=1310"></script>',1)
idx.write_text(s,encoding='utf-8')

css=root/'css/app.css'
c=css.read_text(encoding='utf-8')
marker='/* CHEBSEL v1.13.1 corrective navigation */'
if marker not in c:
    c += '''\n\n/* CHEBSEL v1.13.1 corrective navigation */\n.viewerbar .back,.floating-back{display:none!important}\n#globalBackBtn{position:fixed!important;left:18px!important;bottom:18px!important;right:auto!important;top:auto!important;width:54px!important;height:54px!important;border-radius:999px!important;z-index:9000!important;background:var(--brand-navy)!important;border:1px solid rgba(197,157,63,.55)!important;box-shadow:0 14px 34px rgba(0,0,0,.34)!important;color:#fff!important;font-size:1.35rem!important;display:none;place-items:center!important}\n#globalBackBtn:hover{transform:translateY(-1px);background:var(--brand-navy-2)!important}\n#globalBackBtn:active{transform:translateY(0)}\n@media(max-width:520px){#globalBackBtn{left:12px!important;bottom:14px!important;width:50px!important;height:50px!important}}\n'''
css.write_text(c,encoding='utf-8')

manifest=root/'manifest.webmanifest'
m=manifest.read_text(encoding='utf-8').replace('v1.13.0','v1.13.1')
manifest.write_text(m,encoding='utf-8')

sw=root/'sw.js'
w=sw.read_text(encoding='utf-8')
w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1131",w)
if " './js/corrections-1131.js'," not in w:
    w=w.replace(" './js/institutional-ops.js',"," './js/institutional-ops.js',\n './js/corrections-1131.js',")
sw.write_text(w,encoding='utf-8')

boot=root/'js/bootstrap.js'
if boot.exists():
    b=boot.read_text(encoding='utf-8').replace("version:'1.12.0'","version:'1.13.1'").replace("version:'1.13.0'","version:'1.13.1'")
    if 'corrections-1131' not in b and 'modules:[' in b:
        b=b.replace("'finance-evidence'","'finance-evidence','institutional-ops','corrections-1131'") if "'finance-evidence'" in b else b.replace("modules:[","modules:['corrections-1131',")
    boot.write_text(b,encoding='utf-8')
print('CHEBSEL v1.13.1 corrective patch applied')
