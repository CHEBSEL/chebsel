from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.9.2' in s
assert "const APP_VERSION='1.9.2';" in s
old="function requireStartupLogin(){sessionStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(VISITOR_KEY);updateAuthUI();setTimeout(openLoginModal,120)}"
new="function requireStartupLogin(){updateAuthUI();if(!currentUser()&&!isVisitor())setTimeout(openLoginModal,120)}"
assert old in s
s=s.replace(old,new,1)
s=s.replace('CHEBSEL v1.9.2 — Centre de gestion','CHEBSEL v1.9.3 — Centre de gestion',1)
s=s.replace('<span class=\"versionChip\">v1.9.2</span>','<span class=\"versionChip\">v1.9.3</span>',1)
s=s.replace("const APP_VERSION='1.9.2';","const APP_VERSION='1.9.3';",1)
p.write_text(s,encoding='utf-8')
print('v1.9.3 preserve refresh session applied')
