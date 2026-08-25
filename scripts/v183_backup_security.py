from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

assert 'CHEBSEL v1.8.2' in s
assert "const APP_VERSION='1.8.2';" in s

s = s.replace('CHEBSEL v1.8.2 — Centre de gestion', 'CHEBSEL v1.8.3 — Centre de gestion')
s = s.replace('<span class="versionChip">v1.8.2</span>', '<span class="versionChip">v1.8.3</span>')
s = s.replace("const APP_VERSION='1.8.2';", "const APP_VERSION='1.8.3';")

s = s.replace(
    '<button class="topbtn" onclick="portalBackup()" title="Sauvegarder les données" aria-label="Sauvegarder">💾</button>',
    '<button class="topbtn" id="backupTopBtn" onclick="portalBackup()" title="Sauvegarder les données" aria-label="Sauvegarder">💾</button>'
)

needle = " const president=r==='president';\n"
insert = """ const president=r==='president';
 const backupSelector='[onclick*=\"portalBackup\"],[onclick*=\"openRestoreModal\"],[onclick*=\"openRestoreTestModal\"]';
 document.querySelectorAll(backupSelector).forEach(e=>e.classList.toggle('role-hidden',!president));
 document.querySelectorAll('.profilePanel').forEach(panel=>{if(panel.querySelector(backupSelector))panel.classList.toggle('role-hidden',!president)});
"""
assert needle in s
s = s.replace(needle, insert, 1)

marker = 'applyShellTheme(localStorage.getItem(SHELL_THEME)'
guard = """const _chebselPortalBackup=portalBackup;
portalBackup=function(){if(currentRoleView()!=='president'){alert('Sauvegarde réservée au Président.');return false}return _chebselPortalBackup.apply(this,arguments)};
const _chebselOpenRestoreModal=openRestoreModal;
openRestoreModal=function(){if(currentRoleView()!=='president'){alert('Restauration réservée au Président.');return false}return _chebselOpenRestoreModal.apply(this,arguments)};
const _chebselOpenRestoreTestModal=openRestoreTestModal;
openRestoreTestModal=function(){if(currentRoleView()!=='president'){alert('Test de sauvegarde réservé au Président.');return false}return _chebselOpenRestoreTestModal.apply(this,arguments)};

"""
assert marker in s
s = s.replace(marker, guard + marker, 1)

p.write_text(s, encoding='utf-8')
print('CHEBSEL v1.8.3 backup security applied')
