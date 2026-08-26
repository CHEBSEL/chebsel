/* CHEBSEL v1.12.0 — Finance evidence (JPEG/PNG) */
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
