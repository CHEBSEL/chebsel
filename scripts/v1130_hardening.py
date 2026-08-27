from pathlib import Path
import re
root=Path('.')

# Treasurer must be able to see the monthly closing module he is required to prepare.
p=root/'js/legacy-core.js'
s=p.read_text(encoding='utf-8')
s=s.replace("treasurer:new Set(['debtors','finance','treasury'])","treasurer:new Set(['debtors','finance','treasury','close'])")
p.write_text(s,encoding='utf-8')

# Add month filter to archive registry UI.
p=root/'index.html'
s=p.read_text(encoding='utf-8')
old='<select id="archiveYear" onchange="renderArchives()"><option value="">Toutes les années</option></select><select id="archiveType" onchange="renderArchives()">'
new='<select id="archiveYear" onchange="renderArchives()"><option value="">Toutes les années</option></select><select id="archiveMonth" onchange="renderArchives()"><option value="">Tous les mois</option><option value="01">Janvier</option><option value="02">Février</option><option value="03">Mars</option><option value="04">Avril</option><option value="05">Mai</option><option value="06">Juin</option><option value="07">Juillet</option><option value="08">Août</option><option value="09">Septembre</option><option value="10">Octobre</option><option value="11">Novembre</option><option value="12">Décembre</option></select><select id="archiveType" onchange="renderArchives()">'
if old in s:s=s.replace(old,new)
s=s.replace('./js/institutional-ops.js?v=1300','./js/institutional-ops.js?v=1301')
p.write_text(s,encoding='utf-8')

# Dynamic archive years + month filtering.
p=root/'js/institutional-ops.js'
s=p.read_text(encoding='utf-8')
old="const year=document.getElementById('archiveYear')?.value||'',type=document.getElementById('archiveType')?.value||'';rows=rows.filter(x=>(!year||String(x.period_start||x.generated_at).startsWith(year))&&(!type||x.archive_type===type));"
new="const yearEl=document.getElementById('archiveYear'),year=yearEl?.value||'',month=document.getElementById('archiveMonth')?.value||'',type=document.getElementById('archiveType')?.value||'';if(yearEl){const keep=yearEl.value,years=[...new Set(rows.map(x=>String(x.period_start||x.generated_at||'').slice(0,4)).filter(Boolean))].sort().reverse();yearEl.innerHTML='<option value=\"\">Toutes les années</option>'+years.map(y=>'<option value=\"'+esc(y)+'\">'+esc(y)+'</option>').join('');yearEl.value=keep}rows=rows.filter(x=>{const d=String(x.period_start||x.generated_at||''),mr=String(x.month_reference||d.slice(0,7));return (!year||d.startsWith(year))&&(!month||mr.slice(5,7)===month)&&(!type||x.archive_type===type)});"
if old not in s: raise SystemExit('archive filter anchor not found')
s=s.replace(old,new)
p.write_text(s,encoding='utf-8')

# Ensure service worker explicitly precaches the updated institutional module; cache name bump within v1.13.0.
p=root/'sw.js'
s=p.read_text(encoding='utf-8').replace("chebsel-pwa-stable-v1130","chebsel-pwa-stable-v1130h1")
p.write_text(s,encoding='utf-8')
print('CHEBSEL v1.13.0 hardening applied')
