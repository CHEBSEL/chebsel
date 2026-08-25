from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.9.0' in s
assert "const APP_VERSION='1.9.0';" in s
s=s.replace('CHEBSEL v1.9.0 — Centre de gestion','CHEBSEL v1.9.1 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.9.0</span>','<span class="versionChip">v1.9.1</span>')
s=s.replace("const APP_VERSION='1.9.0';","const APP_VERSION='1.9.1';")
old="""function updateCompactStatus(){
 const dot=document.getElementById('netDot'),btn=document.getElementById('syncToggleBtn'),label=document.getElementById('syncToggleLabel'),wrap=document.getElementById('presidentCompactStatus');
 if(dot)dot.classList.toggle('online',navigator.onLine);
 if(btn)btn.classList.toggle('on',autoSyncEnabled());
 if(label)label.textContent=autoSyncEnabled()?'✓ Sync':'Sync off';
 if(wrap)wrap.style.display=currentRoleView()==='president'?'flex':'none';
}
function toggleAutoSync(){
 if(currentRoleView()!=='president')return;
 const next=!autoSyncEnabled();localStorage.setItem(AUTO_SYNC_PREF_KEY,next?'1':'0');updateCompactStatus();
 if(next&&navigator.onLine)scheduleAutoCloudSync('toggle-on',150);
}
"""
new="""function isResponsibleRole(role=currentRoleView()){return ['president','secretary','treasurer'].includes(role)}
function updateCompactStatus(){
 const dot=document.getElementById('netDot'),btn=document.getElementById('syncToggleBtn'),label=document.getElementById('syncToggleLabel'),wrap=document.getElementById('presidentCompactStatus');
 if(dot){dot.classList.toggle('online',navigator.onLine);dot.title=navigator.onLine?'En ligne':'Hors connexion'}
 if(btn)btn.classList.toggle('on',autoSyncEnabled());
 if(label)label.textContent=autoSyncEnabled()?'✓ Sync':'Sync off';
 if(wrap)wrap.style.display=isResponsibleRole()?'flex':'none';
}
function toggleAutoSync(){
 if(!isResponsibleRole())return;
 const next=!autoSyncEnabled();localStorage.setItem(AUTO_SYNC_PREF_KEY,next?'1':'0');updateCompactStatus();
 if(next&&navigator.onLine)scheduleAutoCloudSync('toggle-on',150);
}
"""
assert old in s
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('v1.9.1 responsible sync controls applied')
