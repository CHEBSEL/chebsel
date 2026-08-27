from pathlib import Path
import re
root=Path('.')
idx=root/'index.html'; s=idx.read_text(encoding='utf-8')
s=s.replace('CHEBSEL v1.13.1 — Centre de gestion','CHEBSEL v1.13.2 — Centre de gestion').replace('<span class="versionChip">v1.13.1</span>','<span class="versionChip">v1.13.2</span>')
if './js/stability-1132.js?v=1320' not in s:
    anchor='<script src="./js/corrections-1131.js?v=1310"></script>'
    if anchor not in s: raise SystemExit('corrections anchor missing')
    s=s.replace(anchor,anchor+'\n<script src="./js/stability-1132.js?v=1320"></script>',1)
idx.write_text(s,encoding='utf-8')

# Make prepared closings of ANY month visible to President alerts, not only previous month.
p=root/'js/institutional-ops.js'; x=p.read_text(encoding='utf-8')
old="const pm=prevMonth(),cl=localClosings()[pm];if(closingAllowed()&&cl?.status!=='approved'){list.push({id:`close:${pm}:${cl?.status||'none'}`,severity:cl?.status==='prepared'&&role()==='president'?'critical':'warn',title:'Clôture mensuelle',text:cl?.status==='prepared'?`${pm} est préparé et attend la validation du Président.`:`${pm} n’est pas encore validé.`})}"
new="const closings=localClosings(),pm=prevMonth();if(closingAllowed()){for(const [cm,cl] of Object.entries(closings)){if(cl?.status==='prepared'&&role()==='president')list.push({id:`close:${cm}:prepared`,severity:'critical',title:'Clôture à valider',text:`${cm} est préparé par le Trésorier et attend votre validation.`})}const pcl=closings[pm];if(pcl?.status!=='approved'&&pcl?.status!=='prepared')list.push({id:`close:${pm}:${pcl?.status||'none'}`,severity:'warn',title:'Clôture mensuelle',text:`${pm} n’est pas encore validé.`})}"
if old not in x: raise SystemExit('closing alert anchor missing')
x=x.replace(old,new,1).replace('/* CHEBSEL v1.13.0 — Institutional Operations */','/* CHEBSEL v1.13.2 — Institutional Operations */',1)
p.write_text(x,encoding='utf-8')

m=root/'manifest.webmanifest'; t=m.read_text(encoding='utf-8').replace('v1.13.1','v1.13.2'); m.write_text(t,encoding='utf-8')
sw=root/'sw.js'; w=sw.read_text(encoding='utf-8'); w=re.sub(r"chebsel-pwa-stable-v[^']+","chebsel-pwa-stable-v1132",w)
if " './js/stability-1132.js'," not in w: w=w.replace(" './js/corrections-1131.js',"," './js/corrections-1131.js',\n './js/stability-1132.js',")
sw.write_text(w,encoding='utf-8')
b=root/'js/bootstrap.js'; z=b.read_text(encoding='utf-8').replace("version:'1.13.1'","version:'1.13.2'")
z=z.replace("'corrections-1131']","'corrections-1131','stability-1132']")
b.write_text(z,encoding='utf-8')
print('v1.13.2 applied')