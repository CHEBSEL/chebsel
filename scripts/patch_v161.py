from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('CHEBSEL v1.6.0 — Centre de gestion','CHEBSEL v1.6.1 — Centre de gestion')
s=s.replace("const APP_VERSION='1.5.5';","const APP_VERSION='1.6.1';")

anchor="async function pushPilotEntity(store,table,payloadFn,org){"
if 'async function alignCloudMemberIds(org)' not in s:
    fn="""async function alignCloudMemberIds(org){
 const c=await getCloudClient(),{data,error}=await c.from('members').select('id,legacy_id').eq('organization_id',org).is('deleted_at',null);
 if(error)throw error;
 const byLegacy=new Map((data||[]).filter(x=>x.legacy_id).map(x=>[String(x.legacy_id),x.id]));
 const local=centralMembers();let changed=0;
 for(const m of local){const cloudId=byLegacy.get(String(m.id||''));if(cloudId&&m.syncId!==cloudId){m.syncId=cloudId;changed++}}
 if(changed){localStorage.setItem(MASTER_KEY,JSON.stringify(local));syncMembersToApps();await syncReadyReconcilePilot(false)}
 return changed
}
"""
    if anchor not in s: raise SystemExit('pushPilotEntity anchor missing')
    s=s.replace(anchor,fn+anchor,1)

old="const p=await getCloudProfile(),org=p.organization_id,userId=p.auth_user_id;\n  cloudState.textContent='Envoi des membres…';"
new="const p=await getCloudProfile(),org=p.organization_id,userId=p.auth_user_id;\n  cloudState.textContent='Alignement des identifiants membres…';\n  await alignCloudMemberIds(org);\n  cloudState.textContent='Envoi des membres…';"
if old not in s: raise SystemExit('cloud sync profile anchor missing')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
if sw.exists():
    t=sw.read_text(encoding='utf-8').replace("chebsel-pwa-stable-v160","chebsel-pwa-stable-v161")
    sw.write_text(t,encoding='utf-8')

print('patched v1.6.1')
