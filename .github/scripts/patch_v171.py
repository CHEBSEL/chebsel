from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = """  cloudState.textContent='Réception des finances…';
  const rf=await pullCloudFinance(org);
  let pf={entries:0,payments:0,allocations:0,closings:0};
  if(['president','treasurer'].includes(p.role)){
   cloudState.textContent='Envoi des finances…';
   pf=await pushCloudFinance(org,userId);
   cloudState.textContent='Vérification des finances…';
   await pullCloudFinance(org);
  }
"""
new = """  cloudState.textContent='Réception des finances…';
  const rfBefore=await pullCloudFinance(org);
  let pf={entries:0,payments:0,allocations:0,closings:0};
  if(['president','treasurer'].includes(p.role)){
   cloudState.textContent='Envoi des finances…';
   pf=await pushCloudFinance(org,userId);
  }
  cloudState.textContent='Vérification des finances…';
  const rf=await pullCloudFinance(org);
"""
if old not in s:
    raise SystemExit('finance sync block not found')
s = s.replace(old, new, 1)
old_alert = "alert(`Synchronisation terminée. Membres: ${rm}. Calendrier: ${rc}. Appels cloud: ${ra.events}; présences cloud: ${ra.records}. Finances cloud: ${rf.entries} écriture(s), ${rf.payments} paiement(s), ${rf.closings} clôture(s). Envoyés: ${pa.events} appel(s), ${pa.records} présence(s), ${pf.entries} écriture(s), ${pf.payments} paiement(s).`)"
new_alert = "alert(`Synchronisation terminée. Membres: ${rm}. Calendrier: ${rc}. Appels cloud: ${ra.events}; présences cloud: ${ra.records}. Finances cloud APRÈS sync: ${rf.entries} écriture(s)/dette(s), ${rf.payments} paiement(s), ${rf.allocations} allocation(s), ${rf.closings} clôture(s). Envoyés: ${pa.events} appel(s), ${pa.records} présence(s), ${pf.entries} écriture(s), ${pf.payments} paiement(s), ${pf.allocations} allocation(s), ${pf.closings} clôture(s).`)"
if old_alert not in s:
    raise SystemExit('final sync alert not found')
s = s.replace(old_alert, new_alert, 1)
s = s.replace("lastSummary:{pm,pc,rm,rc,attendancePush:pa,attendancePull:ra,financePush:pf,financePull:rf}", "lastSummary:{pm,pc,rm,rc,attendancePush:pa,attendancePull:ra,financePush:pf,financePullBefore:rfBefore,financePull:rf}", 1)
s = s.replace('v1.7.0', 'v1.7.1')
s = s.replace("const APP_VERSION='1.7.0'", "const APP_VERSION='1.7.1'")
p.write_text(s, encoding='utf-8')

sw = Path('sw.js')
w = sw.read_text(encoding='utf-8')
w = w.replace("chebsel-pwa-stable-v161", "chebsel-pwa-stable-v171")
sw.write_text(w, encoding='utf-8')

print('patched v1.7.1')
