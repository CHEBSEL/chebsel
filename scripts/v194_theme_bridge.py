from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.9.3' in s
assert "const APP_VERSION='1.9.3';" in s
s=s.replace('CHEBSEL v1.9.3 — Centre de gestion','CHEBSEL v1.9.4 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.9.3</span>','<span class="versionChip">v1.9.4</span>')
s=s.replace("const APP_VERSION='1.9.3';","const APP_VERSION='1.9.4';")
old="function applyShellTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(SHELL_THEME,t);themeBtn.textContent=t==='dark'?'☀️':'🌙';themeMeta.setAttribute('content',t==='dark'?'#05080d':'#0b1220')}"
new="""function propagateThemeToFrame(t){
 const f=document.getElementById('appFrame');if(!f)return;
 try{
  const d=f.contentDocument;if(!d)return;
  d.documentElement.dataset.theme=t;
  d.documentElement.classList.toggle('dark',t==='dark');
  d.body?.classList.toggle('dark',t==='dark');
  let st=d.getElementById('chebsel-parent-theme');
  if(!st){st=d.createElement('style');st.id='chebsel-parent-theme';d.head?.appendChild(st)}
  st.textContent=t==='dark'?`:root{color-scheme:dark}html,body{background:#0d1117!important;color:#f0f3f7!important}body,.container,.app,.page,.card,.panel,.modal-content,.sheet,.table-wrap{color:#f0f3f7}input,select,textarea{background:#0f141b!important;color:#f0f3f7!important;border-color:#30363d!important}`:`:root{color-scheme:light}`;
 }catch(e){console.warn('Theme iframe CHEBSEL:',e)}
}
function applyShellTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(SHELL_THEME,t);themeBtn.textContent=t==='dark'?'☀️':'🌙';themeMeta.setAttribute('content',t==='dark'?'#05080d':'#0b1220');propagateThemeToFrame(t)}"""
assert old in s
s=s.replace(old,new,1)
marker="function normalizeMember(m)"
bridge="""const _chebselThemeFrame=document.getElementById('appFrame');
if(_chebselThemeFrame)_chebselThemeFrame.addEventListener('load',()=>propagateThemeToFrame(localStorage.getItem(SHELL_THEME)==='dark'?'dark':'light'));

"""
s=s.replace(marker,bridge+marker,1)
p.write_text(s,encoding='utf-8')
print('v1.9.4 theme bridge applied')
