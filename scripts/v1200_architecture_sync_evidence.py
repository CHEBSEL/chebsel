from pathlib import Path
import re

ROOT=Path('.')
idx=ROOT/'index.html'
s=idx.read_text(encoding='utf-8')

# ---- Version ----
s=s.replace('CHEBSEL v1.11.6 — Centre de gestion','CHEBSEL v1.12.0 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.11.6</span>','<span class="versionChip">v1.12.0</span>')
s=s.replace("const APP_VERSION='1.11.6';","const APP_VERSION='1.12.0';")

# ---- Finance evidence UI ----
payment_marker='''  <div class="wide"><label>Mode / référence</label><input id="payRef" placeholder="Espèces, transfert, référence..."></div>\n </div>'''
payment_repl='''  <div class="wide"><label>Mode / référence</label><input id="payRef" placeholder="Espèces, transfert, référence..."></div>\n  <div class="wide"><label>Photo / reçu justificatif (optionnel)</label><input type="file" id="payEvidenceFile" accept="image/jpeg,image/png"><div class="memberMeta">JPEG ou PNG • 5 Mo maximum. Le paiement reste valide même si l’image ne peut pas être envoyée.</div></div>\n </div>'''
if payment_marker not in s:
    raise SystemExit('payment modal marker not found')
s=s.replace(payment_marker,payment_repl,1)

report_marker='''   <div class="memberActions"><button class="quickBtn" onclick="renderTreasuryReport()">Générer</button><button class="secondaryQuick" onclick="printTreasuryReport()">Imprimer / PDF</button><button class="secondaryQuick" onclick="exportTreasuryReportCSV()">Exporter CSV</button></div>\n  </div>\n  <div id="treasuryReportBody"></div>'''
report_repl='''   <div class="memberActions"><button class="quickBtn" onclick="renderTreasuryReport()">Générer</button><button class="secondaryQuick" onclick="printTreasuryReport()">Imprimer / PDF</button><button class="secondaryQuick" onclick="exportTreasuryReportCSV()">Exporter CSV</button></div>\n  </div>\n  <div class="profilePanel" id="treasuryEvidencePanel">\n   <div class="profileTitle"><div><h3>Pièces justificatives du rapport</h3><div class="memberMeta">Président et Trésorier peuvent archiver une image JPEG/PNG liée à la période affichée.</div></div></div>\n   <div class="form"><div class="wide"><label>Image du rapport / pièce justificative</label><input type="file" id="treasuryReportEvidenceFile" accept="image/jpeg,image/png"></div><div class="wide"><label>Note</label><input id="treasuryReportEvidenceNote" placeholder="Ex. Photo du rapport signé, bordereau, état de caisse..."></div></div>\n   <div class="memberActions" style="margin-top:10px"><button class="quickBtn" onclick="saveTreasuryReportEvidence()">Archiver l’image</button></div>\n   <div id="treasuryReportEvidenceList" class="evidenceList"></div>\n  </div>\n  <div id="treasuryReportBody"></div>'''
if report_marker not in s:
    raise SystemExit('treasury report marker not found')
s=s.replace(report_marker,report_repl,1)

# ---- Extract all inline styles into css/app.css ----
styles=re.findall(r'<style(?:\s[^>]*)?>(.*?)</style>',s,flags=re.S|re.I)
if not styles:
    raise SystemExit('no inline styles found')
css='\n\n'.join(x.strip() for x in styles)+'\n\n/* v1.12.0 — modular finance evidence */\n.evidenceList{display:grid;gap:9px;margin-top:12px}.evidenceItem{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--soft)}.evidenceItemMain{min-width:0}.evidenceItemTitle{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.evidenceItemMeta{font-size:.72rem;color:var(--muted);margin-top:2px}.evidenceActions{display:flex;gap:6px;flex:0 0 auto}.evidenceActions button{border:0;border-radius:9px;padding:8px 10px;font-weight:750;background:var(--chip);color:var(--text)}\n'
(ROOT/'css').mkdir(exist_ok=True)
(ROOT/'css/app.css').write_text(css,encoding='utf-8')
s=re.sub(r'<style(?:\s[^>]*)?>.*?</style>','',s,flags=re.S|re.I)
s=s.replace('</head>','<link rel="stylesheet" href="./css/app.css?v=1200">\n</head>',1)

# ---- Extract inline JS into compatibility layer ----
inline_scripts=[]
def take_script(m):
    attrs=m.group(1) or ''
    body=m.group(2)
    if 'src=' in attrs.lower():
        return m.group(0)
    inline_scripts.append(body.strip())
    return ''
s=re.sub(r'<script([^>]*)>(.*?)</script>',take_script,s,flags=re.S|re.I)
if not inline_scripts:
    raise SystemExit('no inline scripts found')
legacy='\n\n'.join(inline_scripts)

# Separate PWA/bootstrap preamble and large embedded iframe payloads where possible.
att=re.search(r"const ATT_B64='([^']*)';",legacy,re.S)
fin=re.search(r"const FIN_B64='([^']*)';",legacy,re.S)
if not att or not fin:
    raise SystemExit('embedded app payload markers not found')
embedded="const ATT_B64='"+att.group(1)+"';\nconst FIN_B64='"+fin.group(1)+"';\n"
legacy=legacy[:att.start()]+legacy[att.end():]
fin2=re.search(r"const FIN_B64='([^']*)';",legacy,re.S)
if not fin2:
    raise SystemExit('FIN payload second pass not found')
legacy=legacy[:fin2.start()]+legacy[fin2.end():]

(ROOT/'js').mkdir(exist_ok=True)
(ROOT/'js/embedded-apps.js').write_text("'use strict';\n"+embedded,encoding='utf-8')
(ROOT/'js/legacy-core.js').write_text(legacy.strip()+'\n',encoding='utf-8')

# Dedicated auth-security module: same CHEBSEL password as login, legacy PIN fallback.
auth_js=r'''/* CHEBSEL v1.12.0 — Auth & sensitive-operation confirmation */
'use strict';
(function(){
  async function verifyCHEBSELCredential(role, secret){
    if(!secret) return false;
    try{
      if(typeof verifyOfflinePassword==='function' && await verifyOfflinePassword(role,secret)) return true;
    }catch(e){console.warn('Offline credential check:',e)}
    try{
      if(typeof verifyPinFor==='function' && await verifyPinFor(role,secret)) return true;
    }catch(e){console.warn('Legacy PIN fallback:',e)}
    return false;
  }
  window.verifyCHEBSELCredential=verifyCHEBSELCredential;
  window.criticalGuard=criticalGuard=async function(permission,label){
    if(!requirePermission(permission)) return false;
    const u=currentUser();
    if(!u) return false;
    const role=(typeof currentRoleView==='function'&&currentRoleView())||u.key;
    const secret=prompt(label+'\n\nConfirmez votre mot de passe CHEBSEL ('+u.name+') :');
    if(secret===null) return false;
    if(await verifyCHEBSELCredential(role,secret)) return true;
    alert('Mot de passe / code CHEBSEL incorrect. Utilisez le même mot de passe que pour votre connexion CHEBSEL.');
    return false;
  };
})();
'''
(ROOT/'js/auth-security.js').write_text(auth_js,encoding='utf-8')

sync_js=r'''/* CHEBSEL v1.12.0 — Role-priority synchronization policy */
'use strict';
(function(){
 const POLICY=Object.freeze({
   president:{attendance:100,finance:100,admin:100},
   secretary:{attendance:80,finance:10,admin:10},
   treasurer:{attendance:10,finance:80,admin:10}
 });
 window.CHEBSEL_SYNC_POLICY=POLICY;
 window.chebselWriterPriority=function(domain,role){return Number(POLICY[role]?.[domain]||10)};
 window.rolePriorityReconcile=async function(reason='priority-reconcile'){
   if(!navigator.onLine||typeof isVisitor==='function'&&isVisitor())return false;
   try{
     const ss=await cloudSessionInfo();if(!ss)return false;
     const p=await getCloudProfile(),org=p?.organization_id||p?.org_id;if(!org)return false;
     await pullCloudMembers(org);await pullCloudCalendar(org);await pullCloudAttendance(org);await pullCloudFinance(org);
     try{if(['president','treasurer'].includes(String(p?.role||'').toLowerCase()))await pullCloudExpenses(org)}catch(e){}
     if(typeof syncReadyReconcilePilot==='function')await syncReadyReconcilePilot(false);
     if(typeof refreshHome==='function')refreshHome();
     return true;
   }catch(e){console.warn('CHEBSEL priority reconcile ['+reason+']:',e);return false}
 };
 // The server trigger is authoritative. Always pull after a completed automatic sync,
 // so a lower-priority local edit that lost a close conflict is immediately reconciled.
 if(typeof autoCloudSync==='function'){
   const baseAutoCloudSync=autoCloudSync;
   window.autoCloudSync=autoCloudSync=async function(reason='auto'){
     const out=await baseAutoCloudSync(reason);
     if(navigator.onLine)await window.rolePriorityReconcile(reason);
     return out;
   };
 }
})();
'''
(ROOT/'js/sync-policy.js').write_text(sync_js,encoding='utf-8')

finance_js=r'''/* CHEBSEL v1.12.0 — Finance evidence (JPEG/PNG) */
'use strict';
(function(){
 const BUCKET='chebsel-finance-evidence';
 const MAX=5*1024*1024;
 function validateImage(file){
   if(!file)return {ok:false,error:'Aucune image sélectionnée.'};
   if(!['image/jpeg','image/png'].includes(file.type))return {ok:false,error:'Seules les images JPEG et PNG sont acceptées.'};
   if(file.size>MAX)return {ok:false,error:'Image trop volumineuse. Maximum : 5 Mo.'};
   return {ok:true};
 }
 function safeName(name){return String(name||'preuve').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-100)}
 async function context(){
   const c=await getCloudClient(),p=await getCloudProfile(),org=p?.organization_id||p?.org_id;
   if(!org)throw new Error('Organisation CHEBSEL introuvable.');
   return {c,p,org};
 }
 async function upload(entityType,entityId,file,note=''){
   const v=validateImage(file);if(!v.ok)throw new Error(v.error);
   if(!navigator.onLine)throw new Error('Connexion Internet requise pour archiver une image.');
   const {c,org}=await context();
   const path=org+'/'+entityType+'/'+String(entityId)+'/'+Date.now()+'_'+safeName(file.name);
   const up=await c.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});
   if(up.error)throw up.error;
   const ins=await c.from('finance_evidence').insert({organization_id:org,entity_type:entityType,entity_id:String(entityId),storage_path:path,original_name:file.name,mime_type:file.type,note:note||null});
   if(ins.error){try{await c.storage.from(BUCKET).remove([path])}catch(e){}throw ins.error}
   return path;
 }
 async function list(entityType,entityId){
   const {c,org}=await context();
   const q=await c.from('finance_evidence').select('*').eq('organization_id',org).eq('entity_type',entityType).eq('entity_id',String(entityId)).order('uploaded_at',{ascending:false});
   if(q.error)throw q.error;return {c,rows:q.data||[]};
 }
 async function openEvidence(path){
   try{const {c}=await context();const x=await c.storage.from(BUCKET).createSignedUrl(path,600);if(x.error)throw x.error;window.open(x.data.signedUrl,'_blank','noopener')}catch(e){alert('Impossible d’ouvrir cette pièce : '+(e?.message||e))}
 }
 window.openFinanceEvidence=openEvidence;
 function reportEntityId(){
   let a=treasuryReportFrom?.value||'',b=treasuryReportTo?.value||'';if(a>b)[a,b]=[b,a];return 'report-'+a+'-'+b;
 }
 window.refreshTreasuryReportEvidence=async function(){
   const box=document.getElementById('treasuryReportEvidenceList');if(!box)return;
   if(typeof currentRoleView==='function'&&!['president','treasurer'].includes(currentRoleView())){box.innerHTML='';return}
   try{
     const {rows}=await list('financial_report',reportEntityId());
     box.innerHTML=rows.length?rows.map(r=>'<div class="evidenceItem"><div class="evidenceItemMain"><div class="evidenceItemTitle">'+escapeHtml(r.original_name||'Image justificative')+'</div><div class="evidenceItemMeta">'+new Date(r.uploaded_at).toLocaleString('fr-FR')+(r.note?' • '+escapeHtml(r.note):'')+'</div></div><div class="evidenceActions"><button onclick="openFinanceEvidence(\''+String(r.storage_path).replace(/'/g,"\\'")+'\')">Voir</button></div></div>').join(''):'<div class="memberMeta">Aucune image archivée pour cette période.</div>';
   }catch(e){box.innerHTML='<div class="memberMeta">Pièces indisponibles : '+escapeHtml(e?.message||String(e))+'</div>'}
 };
 window.saveTreasuryReportEvidence=async function(){
   if(!requirePermission('finance.write'))return;
   const input=document.getElementById('treasuryReportEvidenceFile'),file=input?.files?.[0],note=(document.getElementById('treasuryReportEvidenceNote')?.value||'').trim();
   const v=validateImage(file);if(!v.ok){alert(v.error);return}
   try{await upload('financial_report',reportEntityId(),file,note);input.value='';document.getElementById('treasuryReportEvidenceNote').value='';await refreshTreasuryReportEvidence();audit('Pièce financière archivée','Rapport '+reportEntityId(),{entity:'finance_evidence',entityId:reportEntityId()})}catch(e){alert('Image non archivée : '+(e?.message||e))}
 };
 if(typeof renderTreasuryReport==='function'){
   const baseRender=renderTreasuryReport;
   window.renderTreasuryReport=renderTreasuryReport=function(){const x=baseRender.apply(this,arguments);setTimeout(()=>refreshTreasuryReportEvidence(),0);return x};
 }
 if(typeof applySmartPayment==='function'){
   const basePay=applySmartPayment;
   window.applySmartPayment=applySmartPayment=async function(){
     const input=document.getElementById('payEvidenceFile'),file=input?.files?.[0]||null;
     if(file){const v=validateImage(file);if(!v.ok){alert(v.error);return}}
     const before=new Set((typeof getPaymentLog==='function'?getPaymentLog():[]).map(x=>x.id));
     const out=await basePay.apply(this,arguments);
     const after=typeof getPaymentLog==='function'?getPaymentLog():[];
     const created=after.find(x=>!before.has(x.id));
     if(created&&file){
       try{await upload('payment',created.id,file,'Justificatif de paiement');input.value='';audit('Justificatif paiement archivé',created.id,{entity:'finance_evidence',entityId:created.id})}
       catch(e){alert('Paiement enregistré avec succès, mais l’image justificative n’a pas pu être envoyée. Vous pourrez l’archiver plus tard. Détail : '+(e?.message||e))}
     }
     return out;
   };
 }
})();
'''
(ROOT/'js/finance-evidence.js').write_text(finance_js,encoding='utf-8')

bootstrap_js="""/* CHEBSEL v1.12.0 — modular bootstrap marker */\n'use strict';\nwindow.CHEBSEL_ARCHITECTURE={version:'1.12.0',modules:['embedded-apps','legacy-core','auth-security','sync-policy','finance-evidence']};\n"""
(ROOT/'js/bootstrap.js').write_text(bootstrap_js,encoding='utf-8')

# Load scripts at end of body in dependency-safe order.
loads='''\n<script src="./js/embedded-apps.js?v=1200"></script>\n<script src="./js/legacy-core.js?v=1200"></script>\n<script src="./js/auth-security.js?v=1200"></script>\n<script src="./js/sync-policy.js?v=1200"></script>\n<script src="./js/finance-evidence.js?v=1200"></script>\n<script src="./js/bootstrap.js?v=1200"></script>\n'''
s=s.replace('</body>',loads+'</body>',1)
idx.write_text(s,encoding='utf-8')

# ---- PWA shell ----
sw=ROOT/'sw.js'
x=sw.read_text(encoding='utf-8')
x=x.replace("chebsel-pwa-stable-v1116","chebsel-pwa-stable-v1120")
for asset in [" './css/app.css',"," './js/embedded-apps.js',"," './js/legacy-core.js',"," './js/auth-security.js',"," './js/sync-policy.js',"," './js/finance-evidence.js',"," './js/bootstrap.js',"]:
    if asset not in x:
        x=x.replace(" './manifest.webmanifest',", " './manifest.webmanifest',\n"+asset,1)
sw.write_text(x,encoding='utf-8')

mf=ROOT/'manifest.webmanifest'
if mf.exists():
    m=mf.read_text(encoding='utf-8').replace('CHEBSEL v1.11.6','CHEBSEL v1.12.0')
    mf.write_text(m,encoding='utf-8')

# Structural sanity checks
out=idx.read_text(encoding='utf-8')
assert '<style' not in out.lower(), 'inline style block remains'
assert "const ATT_B64='" not in out, 'embedded attendance payload remains in index'
assert "const FIN_B64='" not in out, 'embedded finance payload remains in index'
assert '<script>' not in out.lower(), 'anonymous inline script remains'
assert 'css/app.css?v=1200' in out and 'js/bootstrap.js?v=1200' in out
print('CHEBSEL v1.12.0 refactor complete')
