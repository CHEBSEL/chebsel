/* CHEBSEL v1.13.4 — Canonical monthly closing snapshot */
'use strict';
(function(){
 const ROLE=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const NOW=()=>new Date().toISOString();
 const num=v=>Number(v||0);
 const esc=s=>{try{return escapeHtml(String(s??''))}catch(e){return String(s??'')}};
 const monthRange=m=>{const [y,mo]=m.split('-').map(Number),last=new Date(y,mo,0).getDate();return {from:`${m}-01`,to:`${m}-${String(last).padStart(2,'0')}`}};
 async function ctx(){const c=await getCloudClient(),p=await getCloudProfile(),org=p?.organization_id||p?.org_id,uid=p?.auth_user_id;if(!org||!uid)throw new Error('Session CHEBSEL Cloud incomplète.');return {c,p,org,uid}}
 async function canonicalSnapshot(month){const {c}=await ctx();const q=await c.rpc('chebsel_monthly_closing_snapshot',{p_month:month});if(q.error)throw q.error;return q.data||{}}
 window.chebselCanonicalClosingSnapshot=canonicalSnapshot;
 function equalFinance(a,b){return ['due','paid','balance','cashIn','expenses','net'].every(k=>num(a?.[k])===num(b?.[k]))}
 async function upsert(month,row){const {c,org}=await ctx();const ex=await c.from('monthly_closings').select('id').eq('organization_id',org).eq('month_reference',month).maybeSingle();if(ex.error)throw ex.error;const payload={...row,organization_id:org,month_reference:month,updated_at:NOW()};if(ex.data?.id)payload.id=ex.data.id;const q=await c.from('monthly_closings').upsert(payload,{onConflict:ex.data?.id?'id':'organization_id,month_reference'}).select().single();if(q.error)throw q.error;return q.data}
 async function writeHistory(action,month,note,snapshot){try{const {c,org,uid}=await ctx();await c.from('chebsel_closing_history').insert({organization_id:org,month_reference:month,action,actor_id:uid,actor_role:ROLE(),note:note||null,snapshot:snapshot||{}})}catch(e){console.warn('Closing history:',e)}}
 async function syncLocal(){try{if(typeof pullInstitutionalClosings==='function')await pullInstitutionalClosings()}catch(e){}}

 window.prepareInstitutionalClose=async function(){
  if(ROLE()!=='treasurer'){alert('Se Trésorier la ki prepare clôture mansyèl la.');return}
  if(!navigator.onLine){alert('Koneksyon entènèt nesesè pou prepare clôture la.');return}
  const month=document.getElementById('closeMonth')?.value;if(!month)return;
  if(!(await criticalGuard('month.close','Préparer la clôture '+month)))return;
  try{
   const snap=await canonicalSnapshot(month),note=(document.getElementById('closeNote')?.value||'').trim(),{uid}=await ctx();
   const r=await upsert(month,{status:'prepared',prepared_by:uid,prepared_at:NOW(),approved_by:null,approved_at:null,closed_by:null,closed_at:null,reopened_by:null,reopened_at:null,reopened_reason:null,notes:note||null,snapshot:snap});
   await syncLocal();await writeHistory('prepared',month,note,snap);
   try{audit('Clôture préparée — snapshot cloud',`${month} • Dû ${money(snap.due)} • Payé ${money(snap.paid)} • Caisse ${money(snap.cashIn)}`,{entity:'monthly_close',entityId:month,after:r})}catch(e){}
   try{if(typeof registerChebselArchive==='function'){const rg=monthRange(month);await registerChebselArchive('monthly_closing_prepared',rg.from,rg.to,`Cloture_CHEBSEL_${month}_PREPAREE`,{month,status:'prepared'})}}catch(e){}
   if(typeof renderMonthlyClose==='function')await renderMonthlyClose();if(typeof refreshInstitutionalAlerts==='function')refreshInstitutionalAlerts();
   alert('Clôture préparée avèk done ofisyèl Supabase yo. Li ap tann validation Prezidan an.');
  }catch(e){alert('Préparation clôture impossible : '+(e?.message||e))}
 };

 window.approveInstitutionalClose=async function(){
  if(ROLE()!=='president'){alert('Se Prezidan an sèlman ki valide clôture la.');return}
  if(!navigator.onLine){alert('Koneksyon entènèt nesesè pou valide clôture la.');return}
  const month=document.getElementById('closeMonth')?.value;if(!month)return;
  try{
   const {c,org,uid}=await ctx(),q=await c.from('monthly_closings').select('*').eq('organization_id',org).eq('month_reference',month).maybeSingle();
   if(q.error)throw q.error;if(!q.data||q.data.status!=='prepared'){alert('Trezorye a dwe prepare mwa sa a anvan Prezidan an valide li.');return}
   const current=await canonicalSnapshot(month);
   if(!equalFinance(q.data.snapshot,current)){
    const p=q.data.snapshot||{};
    alert(`Done finansye cloud yo chanje apre preparasyon an. Trezorye a dwe reprépare sèlman si gen yon vrè diferans.\n\nPréparé: Dû ${money(p.due)}, Payé ${money(p.paid)}, Caisse ${money(p.cashIn)}, Dépenses ${money(p.expenses)}\nActuel: Dû ${money(current.due)}, Payé ${money(current.paid)}, Caisse ${money(current.cashIn)}, Dépenses ${money(current.expenses)}`);
    return;
   }
   if(!(await criticalGuard('month.close','Valider la clôture '+month)))return;
   const t=NOW(),r=await upsert(month,{status:'approved',prepared_by:q.data.prepared_by,prepared_at:q.data.prepared_at,approved_by:uid,approved_at:t,closed_by:uid,closed_at:t,reopened_by:null,reopened_at:null,reopened_reason:null,notes:q.data.notes||null,snapshot:q.data.snapshot});
   await syncLocal();await writeHistory('approved',month,r.notes,r.snapshot);
   try{audit('Clôture validée par le Président — snapshot cloud',month,{entity:'monthly_close',entityId:month,after:r})}catch(e){}
   try{if(typeof registerChebselArchive==='function'){const rg=monthRange(month);await registerChebselArchive('monthly_closing_approved',rg.from,rg.to,`Cloture_CHEBSEL_${month}_VALIDEE`,{month,status:'approved'})}}catch(e){}
   if(typeof renderMonthlyClose==='function')await renderMonthlyClose();if(typeof refreshInstitutionalAlerts==='function')refreshInstitutionalAlerts();
   alert('Clôture validée et verrouillée avèk snapshot Supabase ofisyèl la.');
  }catch(e){alert('Validation clôture impossible : '+(e?.message||e))}
 };

 // Ensure generic save button routes to the canonical workflow.
 window.saveMonthlyClose=function(){return ROLE()==='treasurer'?window.prepareInstitutionalClose():ROLE()==='president'?window.approveInstitutionalClose():alert('Accès réservé au Président et au Trésorier.')};
})();
