from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.9.4' in s
assert "const APP_VERSION='1.9.4';" in s

# Version
s=s.replace('CHEBSEL v1.9.4 — Centre de gestion','CHEBSEL v1.10.0 — Centre de gestion',1)
s=s.replace('<span class="versionChip">v1.9.4</span>','<span class="versionChip">v1.10.0</span>',1)
s=s.replace("const APP_VERSION='1.9.4';","const APP_VERSION='1.10.0';",1)

# Treasury cards after Cotisations & Amendes.
finance_card='  <button class="launch visitor-hidden" onclick="openFinance(\'entry\')"><div class="icon">💰</div><h2>Cotisations & Amendes</h2><p>Votre fiche financière reste identique et utilise la même liste centrale de membres.</p><span class="go">Ouvrir la fiche →</span></button>\n'
assert finance_card in s
cards=finance_card+''' </section>\n <section class="grid treasury-launch-grid" style="margin-top:14px">\n  <button class="launch" onclick="openTreasuryExpenses()"><div class="icon">💸</div><h2>Dépenses</h2><p>Enregistrer les sorties d’argent avec date, montant, motif, catégorie et référence.</p><span class="go">Gérer les dépenses →</span></button>\n  <button class="launch" onclick="openTreasuryReport()"><div class="icon">📊</div><h2>Rapports financiers</h2><p>Générer automatiquement les entrées, dépenses et le solde pour une date ou une période.</p><span class="go">Générer un rapport →</span></button>\n'''
s=s.replace(finance_card+' </section>\n',cards,1)

# Styles for treasury report.
css='''\n.treasuryFilters{display:grid;grid-template-columns:1fr;gap:10px}.treasurySummary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.treasurySummary .mini{min-width:0}.treasuryAmountIn{color:var(--green)}.treasuryAmountOut{color:var(--red)}.treasuryTable{width:100%;border-collapse:collapse}.treasuryTable th,.treasuryTable td{padding:9px 7px;border-bottom:1px solid var(--line);text-align:left;font-size:.78rem;vertical-align:top}.treasuryTable th{color:var(--muted);font-size:.7rem;text-transform:uppercase}.treasuryTable td.amount{text-align:right;font-weight:900;white-space:nowrap}@media(min-width:760px){.treasuryFilters{grid-template-columns:repeat(2,1fr)}}\n'''
s=s.replace('</style>',css+'</style>',1)

# New views before Settings hub.
marker='<div class="membersView" id="settingsHub">'
assert marker in s
views=r'''<div class="membersView" id="treasuryExpensesView">
 <div class="viewerbar"><button class="back" onclick="closeTreasuryExpenses()">← Retour</button><div class="viewtitle"><b>Dépenses</b><span>Livre des sorties de caisse</span></div></div>
 <div class="membersBody">
  <div class="profilePanel"><div class="profileTitle"><div><h3>Nouvelle dépense</h3><div class="memberMeta">Réservé au Trésorier et au Président.</div></div></div>
   <div class="form">
    <div><label>Date</label><input type="date" id="expenseDate"></div>
    <div><label>Montant (HTG)</label><input type="number" min="0.01" step="0.01" id="expenseAmount" placeholder="0.00"></div>
    <div><label>Catégorie</label><input id="expenseCategory" placeholder="Ex. transport, matériel, prestation"></div>
    <div><label>Référence</label><input id="expenseReference" placeholder="Facture, reçu, transaction..."></div>
    <div class="wide"><label>Motif / raison *</label><input id="expenseReason" placeholder="Pourquoi cette dépense a-t-elle été faite ?"></div>
    <div class="wide"><label>Observation</label><textarea id="expenseNotes" placeholder="Détails facultatifs"></textarea></div>
   </div>
   <div class="memberActions"><button class="quickBtn" onclick="saveTreasuryExpense()">Enregistrer la dépense</button></div>
  </div>
  <div class="profilePanel"><div class="profileTitle"><div><h3>Historique des dépenses</h3><div class="memberMeta" id="expenseListSummary"></div></div></div><div id="expenseList"></div></div>
 </div>
</div>

<div class="membersView" id="treasuryReportView">
 <div class="viewerbar"><button class="back" onclick="closeTreasuryReport()">← Retour</button><div class="viewtitle"><b>Rapports financiers</b><span>Entrées, dépenses et solde</span></div></div>
 <div class="membersBody">
  <div class="profilePanel">
   <div class="profileTitle"><div><h3>Période du rapport</h3><div class="memberMeta">Pour une seule journée, utilisez la même date au début et à la fin.</div></div></div>
   <div class="treasuryFilters"><div><label>Date début</label><input type="date" id="treasuryReportFrom"></div><div><label>Date fin</label><input type="date" id="treasuryReportTo"></div></div>
   <div class="memberActions"><button class="quickBtn" onclick="renderTreasuryReport()">Générer</button><button class="secondaryQuick" onclick="printTreasuryReport()">Imprimer / PDF</button><button class="secondaryQuick" onclick="exportTreasuryReportCSV()">Exporter CSV</button></div>
  </div>
  <div id="treasuryReportBody"></div>
 </div>
</div>

'''
s=s.replace(marker,views+marker,1)

# Local expense key beside other app constants.
const_marker="const APP_VERSION='1.10.0';"
assert const_marker in s
s=s.replace(const_marker,const_marker+"\nconst EXPENSE_KEY='chebsel_expenses_v1';",1)

# Expand role matrix and visibility map.
s=s.replace("treasurer:new Set(['debtors','finance']),","treasurer:new Set(['debtors','finance','treasury']),",1)
s=s.replace("president:new Set(['members','attendance','finance','debtors','close','audit','diagnostics','security','handover','help'])","president:new Set(['members','attendance','finance','debtors','close','audit','diagnostics','security','handover','help','treasury'])",1)
s=s.replace("openHelp:'help'};","openHelp:'help',openTreasuryExpenses:'treasury',openTreasuryReport:'treasury'};",1)

# Treasury implementation before debtors functions.
js_marker='function openDebtors(){'
assert js_marker in s
js=r'''
function treasuryRoleAllowed(){return ['president','treasurer'].includes(currentRoleView())}
function treasuryExpenses(){const x=safeParse(EXPENSE_KEY);return Array.isArray(x)?x:[]}
function saveTreasuryExpenses(rows){localStorage.setItem(EXPENSE_KEY,JSON.stringify(rows));try{scheduleAutoCloudSync('expense-write',350)}catch(e){}}
function openTreasuryExpenses(){
 if(!treasuryRoleAllowed()){alert('Accès réservé au Trésorier et au Président.');return}
 expenseDate.value=new Date().toISOString().slice(0,10);expenseAmount.value='';expenseCategory.value='';expenseReference.value='';expenseReason.value='';expenseNotes.value='';
 treasuryExpensesView.classList.add('open');renderTreasuryExpenses()
}
function closeTreasuryExpenses(){treasuryExpensesView.classList.remove('open');refreshHome()}
function saveTreasuryExpense(){
 if(!treasuryRoleAllowed()){alert('Accès non autorisé.');return}
 const amount=Number(expenseAmount.value),reason=(expenseReason.value||'').trim(),date=expenseDate.value;
 if(!date){alert('Indiquez la date de la dépense.');return}
 if(!(amount>0)){alert('Indiquez un montant supérieur à zéro.');return}
 if(!reason){alert('Indiquez le motif de la dépense.');return}
 const rows=treasuryExpenses(),row={id:'EXP-'+Date.now().toString(36),syncId:uuidv4(),date,amount,category:(expenseCategory.value||'').trim(),reason,reference:(expenseReference.value||'').trim(),notes:(expenseNotes.value||'').trim(),createdAt:syncNowISO(),createdBy:currentUser()?.name||'',deletedAt:null};
 rows.push(row);saveTreasuryExpenses(rows);audit('Dépense enregistrée',`${date} • ${reason} • ${money(amount)}`,{entity:'expense',entityId:row.syncId,after:row});
 expenseAmount.value='';expenseCategory.value='';expenseReference.value='';expenseReason.value='';expenseNotes.value='';renderTreasuryExpenses()
}
function cancelTreasuryExpense(syncId){
 if(!treasuryRoleAllowed())return;const rows=treasuryExpenses(),x=rows.find(r=>r.syncId===syncId&&!r.deletedAt);if(!x)return;
 if(!confirm('Annuler cette dépense ? Elle restera traçable dans le journal.'))return;
 x.deletedAt=syncNowISO();x.updatedAt=syncNowISO();saveTreasuryExpenses(rows);audit('Dépense annulée',`${x.date} • ${x.reason} • ${money(x.amount)}`,{entity:'expense',entityId:x.syncId,before:{...x,deletedAt:null},after:x});renderTreasuryExpenses()
}
function renderTreasuryExpenses(){
 const rows=treasuryExpenses().filter(x=>!x.deletedAt).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.createdAt||'').localeCompare(a.createdAt||''));
 const total=rows.reduce((n,x)=>n+Number(x.amount||0),0);expenseListSummary.textContent=`${rows.length} dépense(s) • Total : ${money(total)}`;
 expenseList.innerHTML=rows.length?rows.map(x=>`<div class="memberCard"><div class="memberHead"><div><div class="memberName">${escapeHtml(x.reason||'Dépense')}</div><div class="memberMeta">${escapeHtml(x.date||'—')} ${x.category?'• '+escapeHtml(x.category):''} ${x.reference?'• Réf. '+escapeHtml(x.reference):''}</div>${x.notes?`<div class="memberMeta">${escapeHtml(x.notes)}</div>`:''}</div><span class="debtTag">${money(x.amount)}</span></div><div class="memberActions"><button class="delete" onclick="cancelTreasuryExpense('${x.syncId}')">Annuler</button></div></div>`).join(''):'<div class="empty">Aucune dépense enregistrée.</div>'
}
function treasuryIncomeRows(from,to){
 const ps=safeParse(PAYMENT_LOG_KEY)||[];return (Array.isArray(ps)?ps:[]).filter(p=>p.status!=='cancelled'&&p.date&&p.date>=from&&p.date<=to&&Number(p.amount||0)>0).map(p=>{const m=centralMembers().find(x=>x.id===p.memberId);return {date:p.date,label:fullName(m)||'Paiement',reference:p.ref||p.id||'',amount:Number(p.amount||0)}}).sort((a,b)=>a.date.localeCompare(b.date))
}
function treasuryExpenseRows(from,to){return treasuryExpenses().filter(x=>!x.deletedAt&&x.date>=from&&x.date<=to).sort((a,b)=>a.date.localeCompare(b.date))}
function openTreasuryReport(){
 if(!treasuryRoleAllowed()){alert('Accès réservé au Trésorier et au Président.');return}
 const d=new Date(),today=d.toISOString().slice(0,10),first=today.slice(0,8)+'01';treasuryReportFrom.value=first;treasuryReportTo.value=today;treasuryReportView.classList.add('open');renderTreasuryReport()
}
function closeTreasuryReport(){treasuryReportView.classList.remove('open')}
function treasuryReportData(){let from=treasuryReportFrom.value,to=treasuryReportTo.value;if(!from||!to)return null;if(from>to)[from,to]=[to,from];const income=treasuryIncomeRows(from,to),expenses=treasuryExpenseRows(from,to),totalIn=income.reduce((n,x)=>n+x.amount,0),totalOut=expenses.reduce((n,x)=>n+Number(x.amount||0),0);return {from,to,income,expenses,totalIn,totalOut,net:totalIn-totalOut}}
function renderTreasuryReport(){
 const r=treasuryReportData();if(!r){treasuryReportBody.innerHTML='<div class="empty">Choisissez une période valide.</div>';return}
 const incomeRows=r.income.length?r.income.map(x=>`<tr><td>${escapeHtml(x.date)}</td><td>${escapeHtml(x.label)}</td><td>${escapeHtml(x.reference||'—')}</td><td class="amount treasuryAmountIn">${money(x.amount)}</td></tr>`).join(''):'<tr><td colspan="4">Aucune entrée.</td></tr>';
 const expenseRows=r.expenses.length?r.expenses.map(x=>`<tr><td>${escapeHtml(x.date)}</td><td>${escapeHtml(x.reason||'Dépense')}</td><td>${escapeHtml(x.category||x.reference||'—')}</td><td class="amount treasuryAmountOut">${money(x.amount)}</td></tr>`).join(''):'<tr><td colspan="4">Aucune dépense.</td></tr>';
 treasuryReportBody.innerHTML=`<div class="profilePanel" id="treasuryReportPrintable"><h2 style="margin-top:0">Rapport financier CHEBSEL</h2><div class="memberMeta">Période : ${escapeHtml(r.from)} au ${escapeHtml(r.to)}</div><div class="treasurySummary"><div class="mini"><b class="treasuryAmountIn">${money(r.totalIn)}</b><span>Entrées</span></div><div class="mini"><b class="treasuryAmountOut">${money(r.totalOut)}</b><span>Dépenses</span></div><div class="mini"><b>${money(r.net)}</b><span>Solde net</span></div></div><h3>Entrées</h3><div class="table-wrap"><table class="treasuryTable"><thead><tr><th>Date</th><th>Source</th><th>Référence</th><th>Montant</th></tr></thead><tbody>${incomeRows}</tbody></table></div><h3 style="margin-top:18px">Dépenses</h3><div class="table-wrap"><table class="treasuryTable"><thead><tr><th>Date</th><th>Motif</th><th>Catégorie / Réf.</th><th>Montant</th></tr></thead><tbody>${expenseRows}</tbody></table></div></div>`
}
function printTreasuryReport(){renderTreasuryReport();const el=document.getElementById('treasuryReportPrintable');if(!el)return;const w=window.open('','_blank');w.document.write(`<html><head><title>Rapport financier CHEBSEL</title><style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{padding:7px;border-bottom:1px solid #ddd;text-align:left}.mini{display:inline-block;margin-right:24px}.memberMeta{color:#555}</style></head><body>${el.outerHTML}</body></html>`);w.document.close();w.focus();w.print()}
function exportTreasuryReportCSV(){
 const r=treasuryReportData();if(!r)return;const lines=[['RAPPORT FINANCIER CHEBSEL'],['Période',r.from,r.to],[],['SYNTHÈSE'],['Entrées',r.totalIn],['Dépenses',r.totalOut],['Solde net',r.net],[],['ENTRÉES'],['Date','Source','Référence','Montant'],...r.income.map(x=>[x.date,x.label,x.reference,x.amount]),[],['DÉPENSES'],['Date','Motif','Catégorie','Référence','Montant'],...r.expenses.map(x=>[x.date,x.reason,x.category||'',x.reference||'',x.amount])];
 const csv='\ufeff'+lines.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\n'),b=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`Rapport_financier_CHEBSEL_${r.from}_${r.to}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)
}
async function pushCloudExpenses(org,userId){
 const rows=treasuryExpenses();if(!rows.length)return 0;const c=await getCloudClient(),payload=rows.map(x=>({id:x.syncId,organization_id:org,expense_date:x.date,amount:Number(x.amount||0),category:x.category||null,reason:x.reason||'Dépense',reference:x.reference||null,notes:x.notes||null,created_by:userId||null,updated_at:x.updatedAt||x.createdAt||syncNowISO(),deleted_at:x.deletedAt||null}));const {error}=await c.from('expenses').upsert(payload,{onConflict:'id'});if(error)throw error;return payload.length
}
async function pullCloudExpenses(org){
 const c=await getCloudClient(),{data,error}=await c.from('expenses').select('*').eq('organization_id',org);if(error)throw error;const local=treasuryExpenses(),by=new Map(local.filter(x=>x.syncId).map(x=>[x.syncId,x]));for(const r of data||[]){let x=by.get(r.id);if(!x){x={id:'EXP-'+r.id.slice(0,8),syncId:r.id};local.push(x);by.set(r.id,x)}Object.assign(x,{date:r.expense_date,amount:Number(r.amount||0),category:r.category||'',reason:r.reason||'',reference:r.reference||'',notes:r.notes||'',createdAt:r.created_at||x.createdAt||syncNowISO(),updatedAt:r.updated_at||'',deletedAt:r.deleted_at||null})}localStorage.setItem(EXPENSE_KEY,JSON.stringify(local));return (data||[]).length
}

'''
s=s.replace(js_marker,js+js_marker,1)

# Wrap cloud sync to include expenses without disturbing existing finance sync logic.
startup_marker='updateCompactStatus();\napplyShellTheme('
assert startup_marker in s
wrapper=r'''const _chebselCloudPilotSyncWithFinance=cloudPilotSync;
cloudPilotSync=async function(silent=false){
 const ok=await _chebselCloudPilotSyncWithFinance(silent);
 try{
  if(navigator.onLine&&treasuryRoleAllowed()){
   const ss=await cloudSessionInfo();if(ss){const prof=await getCloudProfile(),org=prof?.organization_id||prof?.org_id,userId=prof?.auth_user_id||ss?.user?.id||'';if(org){await pullCloudExpenses(org);await pushCloudExpenses(org,userId);await pullCloudExpenses(org)}}
  }
 }catch(e){if(!silent)console.warn('Synchronisation dépenses:',e);else console.warn('Auto-sync dépenses:',e)}
 return ok
};

'''
s=s.replace(startup_marker,wrapper+startup_marker,1)

# Back button closes treasury layers.
back_marker='function globalBack(){\n'
assert back_marker in s
s=s.replace(back_marker,"function globalBack(){\n if(treasuryExpensesView?.classList.contains('open')){closeTreasuryExpenses();return}\n if(treasuryReportView?.classList.contains('open')){closeTreasuryReport();return}\n",1)

# Include expenses in backup payload and restore if present.
s=s.replace("monthlyClosings:safeParse(CLOSE_KEY)||{},calendar:","monthlyClosings:safeParse(CLOSE_KEY)||{},expenses:treasuryExpenses(),calendar:",1)
restore_anchor="if(p.monthlyClosings && typeof p.monthlyClosings==='object')saveJSON(CLOSE_KEY,p.monthlyClosings);else localStorage.removeItem(CLOSE_KEY);"
assert restore_anchor in s
s=s.replace(restore_anchor,restore_anchor+"\n   if(Array.isArray(p.expenses))localStorage.setItem(EXPENSE_KEY,JSON.stringify(p.expenses));",1)

p.write_text(s,encoding='utf-8')
print('v1.10.0 treasury reporting applied')
