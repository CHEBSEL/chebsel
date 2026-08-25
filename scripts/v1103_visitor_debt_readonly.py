from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.10.2' in s
assert "const APP_VERSION='1.10.2';" in s
s=s.replace('CHEBSEL v1.10.2 — Centre de gestion','CHEBSEL v1.10.3 — Centre de gestion')
s=s.replace('<span class="versionChip">v1.10.2</span>','<span class="versionChip">v1.10.3</span>')
s=s.replace("const APP_VERSION='1.10.2';","const APP_VERSION='1.10.3';")

old=""" if(isVisitor()&&publicVisitorSnapshot()){
  let rows=(publicVisitorSnapshot().debtors||[]).map(x=>({name:x.name||'—',balance:Number(x.debt||0),count:Number(x.debt_count||0),days:x.oldest_date?daysOld(x.oldest_date):0}));
  rows=rows.filter(x=>(!q||x.name.toLowerCase().includes(q))&&(bucket==='all'||ageBucket(x.days)===bucket)).sort((a,b)=>b.balance-a.balance);
  debtorsList.innerHTML=rows.length?rows.map(x=>`<div class=\"memberCard\"><div class=\"memberHead\"><div><div class=\"memberName\">${escapeHtml(x.name)}</div><div class=\"memberMeta\">${x.count} dette(s) • plus ancienne : ${x.days} jour(s)</div></div><span class=\"debtTag\">${money(x.balance)}</span></div></div>`).join(''):'<div class=\"empty\">Aucun débiteur dans ce filtre.</div>';return
 }"""
new=""" if(isVisitor()&&publicVisitorSnapshot()){
  let rows=(publicVisitorSnapshot().debtors||[]).map(x=>({memberId:x.member_id||'',name:x.name||'—',balance:Number(x.debt||0),days:x.oldest_date?daysOld(x.oldest_date):0,oldestDate:x.oldest_date||''}));
  rows=rows.filter(x=>(!q||x.name.toLowerCase().includes(q))&&(bucket==='all'||ageBucket(x.days)===bucket)).sort((a,b)=>b.balance-a.balance);
  debtorsList.innerHTML=rows.length?rows.map(x=>`<div class=\"memberCard\"><div class=\"memberHead\"><div><div class=\"memberName\">${escapeHtml(x.name)}</div><div class=\"memberMeta\">Dette depuis ${x.days} jour(s)</div></div><span class=\"debtTag\">${money(x.balance)}</span></div><div class=\"memberActions\"><button class=\"secondaryQuick\" onclick=\"openVisitorDebtorProfile('${x.memberId}')\">Voir fiche</button></div></div>`).join(''):'<div class=\"empty\">Aucun débiteur dans ce filtre.</div>';return
 }"""
assert old in s
s=s.replace(old,new,1)

anchor="function openProfileFromDebtors(mid){debtorsView.classList.remove('open');openProfile(mid)}"
replacement="""function openVisitorDebtorProfile(mid){
 const x=(publicVisitorSnapshot()?.debtors||[]).find(d=>String(d.member_id||'')===String(mid||''));if(!x)return;
 const days=x.oldest_date?daysOld(x.oldest_date):0;
 debtorsView.classList.remove('open');profileView.classList.add('open');
 profileBody.innerHTML=`<div class=\"profilePanel\"><div class=\"profileTitle\"><div><h3>${escapeHtml(x.name||'—')}</h3><div class=\"memberMeta\">Fiche débiteur — lecture seule</div></div><span class=\"readonlyTag\">Visiteur</span></div><div class=\"memberStats\"><div class=\"mini\"><b>${money(Number(x.debt||0))}</b><span>Dette</span></div><div class=\"mini\"><b>${days}</b><span>Jour(s) de dette</span></div></div><div class=\"smallnote\">Aucune opération financière ne peut être enregistrée en mode Visiteur.</div></div>`;
}
function openProfileFromDebtors(mid){debtorsView.classList.remove('open');if(isVisitor()){openVisitorDebtorProfile(mid);return}openProfile(mid)}"""
assert anchor in s
s=s.replace(anchor,replacement,1)

old_open="function openProfile(mid){syncBridge();profileView.classList.add('open');renderProfile(mid)}"
new_open="function openProfile(mid){if(isVisitor()){openVisitorDebtorProfile(mid);return}syncBridge();profileView.classList.add('open');renderProfile(mid)}"
assert old_open in s
s=s.replace(old_open,new_open,1)

marker="function ensureCompletedMonthlyDebts(){"
cleanup="""function removePrematureCurrentMonthDebts(){
 const now=new Date(),current=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
 const closes=safeParse('chebsel_monthly_close_v1')||{};if(closes[current]?.locked)return 0;
 const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))return 0;
 const before=f.entries.length;
 f.entries=f.entries.filter(e=>!(isMonthlyEntry(e)&&entryMonth(e)===current&&Number(e.paid||0)<=0));
 const removed=before-f.entries.length;if(removed>0)saveJSON(FIN_KEY,f);return removed;
}

"""
assert marker in s
s=s.replace(marker,cleanup+marker,1)

boot="initializeMasterMembers();getAuth();syncMembersToApps();applyRegulatoryDefaults();ensureCompletedMonthlyDebts();syncBridge();updateAuthUI();refreshHome();requireStartupLogin();initSyncReady();updateCloudUI();"
boot_new="initializeMasterMembers();getAuth();syncMembersToApps();applyRegulatoryDefaults();removePrematureCurrentMonthDebts();ensureCompletedMonthlyDebts();syncBridge();updateAuthUI();refreshHome();requireStartupLogin();initSyncReady();updateCloudUI();"
assert boot in s
s=s.replace(boot,boot_new,1)

p.write_text(s,encoding='utf-8')
print('v1.10.3 visitor debt readonly + current-month debt cleanup applied')
