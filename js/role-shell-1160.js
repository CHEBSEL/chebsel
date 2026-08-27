/* CHEBSEL v1.16.0 — Role shell aligned to institutional workflow */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const esc=s=>{try{return escapeHtml(String(s??''))}catch(e){return String(s??'')}};
 const moneyX=v=>{try{return money(v)}catch(e){return new Intl.NumberFormat('fr-FR').format(Number(v||0))+' G'}};
 function card(icon,title,text,fn){return `<button class="launch roleShellCard" onclick="${fn}"><div class="icon">${icon}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><span class="go">Ouvrir →</span></button>`}
 function hideLegacyNavigation(){
  document.querySelectorAll('main.home > section.grid,main.home > .treasury-launch-grid,#presidentUtilityCards').forEach(x=>x.style.display='none');
  const old=document.getElementById('reportsCenterLaunch');if(old)old.style.display='none';
 }
 function ensureShell(){
  hideLegacyNavigation();let g=document.getElementById('roleShellGrid');if(g)return g;
  g=document.createElement('section');g.id='roleShellGrid';g.className='grid roleShellGrid';
  const dash=document.getElementById('monthlyDashboard')?.closest('.profilePanel');
  if(dash?.parentNode)dash.parentNode.insertBefore(g,dash.nextSibling);else document.querySelector('main.home')?.appendChild(g);
  return g
 }
 function renderShell(){
  const g=ensureShell(),r=role();if(!g)return;let h='';
  if(r==='secretary'){
   h+=card('👥','Membres','Gérer et consulter les membres CHEBSEL.','openMembers()');
   h+=card('✅','Fiche d’Appel','Appel et paramètres de la fiche d’appel.','openSecretariatHub()');
   h+=card('🕘','Historique','Consulter l’historique des appels et activités.','openAttendanceHistory()');
   h+=card('📊','Rapport ponctualité','Rapport périodique ou mensuel, avec clôture soumise au Président et export JPEG.','openReportsCenter()');
   h+=card('📋','Débiteurs','Consulter les membres débiteurs.','openDebtors()');
   h+=card('🗂️','Sauvegarde et Archives','Sauvegarde de secrétariat et rapports déjà générés; possibilité de régénérer un JPEG.','openScopedArchiveHub()');
  }else if(r==='treasurer'){
   h+=card('👥','Membres','Consulter les membres CHEBSEL.','openMembers()');
   h+=card('💰','Paiement cotisations et amendes','Saisir les paiements et accéder aux paramètres financiers.','openTreasuryPaymentHub()');
   h+=card('📋','Débiteurs','Consulter et traiter les dettes ouvertes.','openDebtors()');
   h+=card('💸','Dépenses','Enregistrer et consulter les dépenses.','openTreasuryExpenses()');
   h+=card('📈','Historique / Histogramme','Consulter l’historique et les tendances financières.','openFinanceHistory()');
   h+=card('📊','Rapport financier','Rapport périodique ou mensuel, avec clôture soumise au Président et export JPEG.','openReportsCenter()');
   h+=card('🗂️','Sauvegardes et Archives','Rapports, paiements, dépenses et reçus; possibilité de régénérer les documents JPEG.','openScopedArchiveHub()');
  }else if(r==='president'){
   h+=card('👥','Membres','Gestion complète des membres.','openMembers()');
   h+=card('🗃️','Secrétariat','Fiche d’appel, paramètres et historique.','openSecretariatHub()');
   h+=card('💼','Trésorerie','Paiements, paramètres, débiteurs, dépenses et historique.','openTreasuryHub()');
   h+=card('📚','Rapports','Ponctualité, finance, validations mensuelles et rapport global.','openReportsCenter()');
   h+=card('🗂️','Sauvegarde et Archive générale','Archive générale secrétariat + trésorerie et sauvegarde locale de secours.','openScopedArchiveHub()');
   h+=card('⚖️','Journal des conflits','Consulter les arbitrages multi-appareils.','openConflictJournal()');
   h+=card('⚙️','Paramètres','Diagnostic, sécurité et rôles.','openSettingsHub()');
   h+=card('🔒','Confidentialités','Journal, passation, restauration et contrôles.','openPrivacyHub()');
   h+=card('ℹ️','À propos','Manuel, version et informations CHEBSEL.','openAboutHub()');
  }else{
   h+=card('👥','Membres','Voir uniquement les noms et le statut actif/inactif.','openVisitorMembers()');
   h+=card('💰','Cotisations & Amendes','Consultation en lecture seule; aucune saisie ni modification.','openVisitorFinance()');
   h+=card('📋','Débiteurs','Voir le nom, le montant et la cause de la dette, sans modification.','openDebtors()');
  }
  g.innerHTML=h;
 }
 window.renderRoleShell=renderShell;

 function ensureSimpleHub(id,title,subtitle){let v=document.getElementById(id);if(v)return v;v=document.createElement('div');v.className='membersView';v.id=id;v.innerHTML=`<div class="viewerbar"><div class="viewtitle"><b>${esc(title)}</b><span>${esc(subtitle)}</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu" id="${id}Menu"></div></div></div>`;document.body.appendChild(v);return v}
 function ubtn(icon,title,text,fn){return `<button class="utilityBtn" onclick="${fn}">${icon} ${esc(title)}<span>${esc(text)}</span></button>`}
 window.openSecretariatHub=function(){const v=ensureSimpleHub('secretariatHub','Secrétariat','Appel, paramètres et historique');const m=document.getElementById('secretariatHubMenu');m.innerHTML=ubtn('✅','Appel','Faire ou consulter l’appel.','closeSimpleHub(\'secretariatHub\');openAttendance(\'call\')')+ubtn('⚙️','Paramètres','Paramètres de la fiche d’appel.','closeSimpleHub(\'secretariatHub\');openAttendance(\'settings\')')+ubtn('🕘','Historique','Historique des appels.','closeSimpleHub(\'secretariatHub\');openAttendanceHistory()');v.classList.add('open')};
 window.openTreasuryPaymentHub=function(){const v=ensureSimpleHub('treasuryPaymentHub','Paiements cotisations & amendes','Saisie et paramètres');const m=document.getElementById('treasuryPaymentHubMenu');m.innerHTML=ubtn('💵','Saisir','Ouvrir la saisie des cotisations et amendes.','closeSimpleHub(\'treasuryPaymentHub\');openFinance(\'entry\')')+ubtn('⚙️','Paramètres','Paramètres financiers.','closeSimpleHub(\'treasuryPaymentHub\');openFinance(\'settings\')');v.classList.add('open')};
 window.openTreasuryHub=function(){const v=ensureSimpleHub('treasuryHub','Trésorerie','Paiements, débiteurs, dépenses et historique');const m=document.getElementById('treasuryHubMenu');m.innerHTML=ubtn('💵','Paiements','Cotisations et amendes.','closeSimpleHub(\'treasuryHub\');openTreasuryPaymentHub()')+ubtn('📋','Débiteurs','Situation des dettes.','closeSimpleHub(\'treasuryHub\');openDebtors()')+ubtn('💸','Dépenses','Livre des sorties de caisse.','closeSimpleHub(\'treasuryHub\');openTreasuryExpenses()')+ubtn('📈','Historique','Historique et histogramme financier.','closeSimpleHub(\'treasuryHub\');openFinanceHistory()');v.classList.add('open')};
 window.closeSimpleHub=id=>document.getElementById(id)?.classList.remove('open');
 window.openAttendanceHistory=()=>openAttendance('history');
 window.openFinanceHistory=()=>openFinance('history');

 function ensureVisitorMembers(){let v=document.getElementById('visitorMembersView');if(v)return v;v=document.createElement('div');v.className='membersView';v.id='visitorMembersView';v.innerHTML='<div class="viewerbar"><div class="viewtitle"><b>Membres CHEBSEL</b><span>Lecture seule</span></div></div><div class="membersBody"><div class="profilePanel" id="visitorMembersList"></div></div>';document.body.appendChild(v);return v}
 window.openVisitorMembers=function(){const v=ensureVisitorMembers(),box=document.getElementById('visitorMembersList'),rows=centralMembers().slice().sort((a,b)=>fullName(a).localeCompare(fullName(b),'fr'));box.innerHTML=rows.map(m=>`<div class="memberCard"><div class="memberHead"><div class="memberName">${esc(fullName(m))}</div><span class="status ${m.active?'active':''}">${m.active?'Actif':'Inactif'}</span></div></div>`).join('')||'<div class="empty">Aucun membre.</div>';v.classList.add('open')};
 function ensureVisitorFinance(){let v=document.getElementById('visitorFinanceView');if(v)return v;v=document.createElement('div');v.className='membersView';v.id='visitorFinanceView';v.innerHTML='<div class="viewerbar"><div class="viewtitle"><b>Cotisations & Amendes</b><span>Lecture seule</span></div></div><div class="membersBody"><div class="profilePanel"><div class="memberMeta">Aucune saisie ni modification n’est autorisée en mode Visiteur.</div><div id="visitorFinanceList" style="margin-top:12px"></div></div></div>';document.body.appendChild(v);return v}
 window.openVisitorFinance=function(){const v=ensureVisitorFinance(),box=document.getElementById('visitorFinanceList'),f=safeParse(FIN_KEY)||{},entries=f.entries||[],members=centralMembers();const by=new Map();for(const e of entries){const bal=Math.max(0,Number(e.due||0)-Number(e.paid||0));if(bal<=0)continue;const x=by.get(e.memberId)||{total:0,count:0};x.total+=bal;x.count++;by.set(e.memberId,x)}box.innerHTML=[...by.entries()].map(([mid,x])=>{const m=members.find(z=>z.id===mid);return `<div class="memberCard"><div class="memberHead"><div><div class="memberName">${esc(fullName(m))}</div><div class="memberMeta">${x.count} dette(s) ouverte(s)</div></div><b>${moneyX(x.total)}</b></div></div>`}).join('')||'<div class="statusGood">✓ Aucune dette ouverte.</div>';v.classList.add('open')};

 const scopedTypes={secretary:new Set(['punctuality_report','punctuality_closing_prepared','punctuality_closing_approved','global_monthly_report']),treasurer:new Set(['financial_report','payment_receipt','monthly_closing_prepared','monthly_closing_approved','global_monthly_report'])};
 function archiveAllowed(row,r){if(r==='president')return true;return scopedTypes[r]?.has(String(row.archive_type||''))||false}
 async function fetchArchives(){if(!navigator.onLine)return [];const c=await getCloudClient(),p=await getCloudProfile(),org=p?.organization_id||p?.org_id;if(!org)return [];const q=await c.from('chebsel_archive_registry').select('*').eq('organization_id',org).order('generated_at',{ascending:false}).limit(500);if(q.error)throw q.error;return (q.data||[]).filter(x=>archiveAllowed(x,role()))}
 function ensureArchiveHub(){let v=document.getElementById('scopedArchiveHub');if(v)return v;v=document.createElement('div');v.className='membersView';v.id='scopedArchiveHub';v.innerHTML=`<div class="viewerbar"><div class="viewtitle"><b>Sauvegarde & Archives</b><span id="scopedArchiveSubtitle"></span></div></div><div class="membersBody"><div class="profilePanel"><div class="memberActions"><button class="secondaryQuick" onclick="downloadScopedBackup()">💾 Sauvegarde locale JSON</button><button class="secondaryQuick" onclick="renderScopedArchives()">↻ Actualiser</button></div><div class="memberMeta" style="margin-top:8px">La sauvegarde JSON est une copie locale de secours. Supabase reste la vérité officielle.</div></div><div class="profilePanel" id="scopedArchiveList"></div></div>`;document.body.appendChild(v);return v}
 window.openScopedArchiveHub=async function(){const v=ensureArchiveHub(),r=role(),s=document.getElementById('scopedArchiveSubtitle');if(s)s.textContent=r==='president'?'Archive générale — secrétariat + trésorerie':r==='secretary'?'Archives du secrétariat et ponctualité':'Archives finances, paiements, dépenses et reçus';v.classList.add('open');await renderScopedArchives()};
 window.renderScopedArchives=async function(){const box=document.getElementById('scopedArchiveList');if(!box)return;box.innerHTML='<div class="empty">Chargement…</div>';try{const rows=await fetchArchives();box.innerHTML=rows.length?rows.map(x=>`<div class="memberCard"><div class="memberHead"><div><div class="memberName">${esc(x.filename||x.archive_type)}</div><div class="memberMeta">${esc(x.archive_type)} • ${esc(x.period_start||'')} ${x.period_end&&x.period_end!==x.period_start?'→ '+esc(x.period_end):''}</div></div></div><div class="memberActions"><button class="secondaryQuick" onclick="regenerateArchivedJPEG('${esc(x.id)}')">Rejenere / JPEG</button></div></div>`).join(''):'<div class="empty">Aucune archive disponible pour ce rôle.</div>';window.__chebselScopedArchives=rows}catch(e){box.innerHTML=`<div class="statusBad">Archives indisponibles : ${esc(e?.message||e)}</div>`}};
 window.regenerateArchivedJPEG=async function(id){const x=(window.__chebselScopedArchives||[]).find(z=>String(z.id)===String(id));if(!x)return;const t=String(x.archive_type||'');if(t==='financial_report'){document.getElementById('scopedArchiveHub')?.classList.remove('open');openTreasuryReport();setTimeout(()=>{treasuryReportFrom.value=x.period_start||'';treasuryReportTo.value=x.period_end||x.period_start||'';renderTreasuryReport();setTimeout(()=>saveTreasuryReportJPEG(),250)},120);return}if(t==='punctuality_report'){document.getElementById('scopedArchiveHub')?.classList.remove('open');openPunctualityReport();setTimeout(()=>{punctualityFrom.value=x.period_start||'';punctualityTo.value=x.period_end||x.period_start||'';renderPunctualityReport();setTimeout(()=>savePunctualityReportJPEG(),250)},120);return}if(t==='payment_receipt'){const log=safeParse(PAYMENT_LOG_KEY)||[],needle=String(x.metadata?.receipt||x.filename||''),p=log.find(z=>needle.includes(String(z.id||''))||String(z.id||'').includes(needle.replace(/\D/g,'')));if(p){showReceipt(p.memberId,Number(p.applied||p.amount||0),p.date||'',p.ref||'Paiement CHEBSEL',p.alloc||[],Number(p.unapplied||0),p.id||'');return}alert('Resi a nan archive a, men peman orijinal la pa jwenn sou aparèy sa a. Ouvri historique peman manm nan pou rejenere li.');return}if(t.includes('global')){openReportsCenter();return}alert('Dokiman sa a rete nan archive a. Ouvri rapò ki koresponn lan pou rejenere JPEG la.')};
 window.downloadScopedBackup=function(){const r=role(),stamp=new Date().toISOString(),payload={schema:'CHEBSEL-SCOPED-BACKUP-1',role:r,createdAt:stamp,members:centralMembers()};if(r==='president'||r==='secretary'){payload.attendance=safeParse(ATT_KEY);payload.calendar=safeParse(CALENDAR_KEY)}if(r==='president'||r==='treasurer'){payload.finance=safeParse(FIN_KEY);payload.payments=safeParse(PAYMENT_LOG_KEY);payload.expenses=safeParse('chebsel_treasury_expenses_v1')}const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.download=`CHEBSEL_${r}_backup_${stamp.slice(0,10)}.json`;a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};

 // Keep shell synchronized with role/session changes.
 const oldUpdate=window.updateAuthUI;if(typeof oldUpdate==='function')window.updateAuthUI=function(){const out=oldUpdate.apply(this,arguments);setTimeout(renderShell,0);return out};
 setTimeout(renderShell,100);
 const mo=new MutationObserver(()=>{if(document.body.contains(document.getElementById('roleShellGrid')))return;setTimeout(renderShell,50)});mo.observe(document.body,{childList:true,subtree:false});
})();
