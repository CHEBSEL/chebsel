from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.10.0' in s
assert "const APP_VERSION='1.10.0';" in s

s=s.replace('CHEBSEL v1.10.0 — Centre de gestion','CHEBSEL v1.10.1 — Centre de gestion',1)
s=s.replace('<span class="versionChip">v1.10.0</span>','<span class="versionChip">v1.10.1</span>',1)
s=s.replace("const APP_VERSION='1.10.0';","const APP_VERSION='1.10.1';",1)

old="function applyRegulatoryDefaults(){if(localStorage.getItem(REG_APPLIED_KEY))return;const f=safeParse(FIN_KEY);if(f){f.settings=f.settings||{};f.settings.monthly=125;f.settings.rnm=25;f.settings.anm=50;f.settings.performance=250;saveJSON(FIN_KEY,f)}localStorage.setItem(REG_APPLIED_KEY,new Date().toISOString())}"
new="function applyRegulatoryDefaults(){const f=safeParse(FIN_KEY);if(f){f.settings=f.settings||{};f.settings.monthly=125;f.settings.rnm=25;f.settings.anm=50;f.settings.performance=250;saveJSON(FIN_KEY,f)}localStorage.setItem(REG_APPLIED_KEY,new Date().toISOString())}"
assert old in s, 'applyRegulatoryDefaults pattern missing'
s=s.replace(old,new,1)

# Defensive repair for any already-generated automatic prestation debt that still carries the old 100 G amount.
marker='function syncBridge(){'
assert marker in s
repair="""function repairLegacyPerformanceFines(){
 const f=safeParse(FIN_KEY);if(!f||!Array.isArray(f.entries))return;
 let changed=false;
 for(const e of f.entries){
  const lbl=String(e.typeLabel||'').toLowerCase();
  const isPerf=e.type==='performance'||lbl.includes('prestation');
  if(isPerf&&e.bridgeAuto===true&&Number(e.due||0)===100){e.due=250;e.updatedAt=new Date().toISOString();changed=true}
 }
 if(changed)saveJSON(FIN_KEY,f)
}
"""
s=s.replace(marker,repair+marker,1)

# Ensure repair runs before bridge reconciliation and on startup via existing syncBridge calls.
s=s.replace("function syncBridge(){syncMembersToApps();", "function syncBridge(){repairLegacyPerformanceFines();syncMembersToApps();",1)

p.write_text(s,encoding='utf-8')
print('v1.10.1 ANM prestation rate fixed at 250 G')
