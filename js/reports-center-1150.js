/* CHEBSEL v1.15.0 — Unified Reports Center + login feedback */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const esc=s=>{try{return escapeHtml(String(s??''))}catch(e){return String(s??'')}};
 const moneyX=v=>{try{return money(v)}catch(e){return new Intl.NumberFormat('fr-FR').format(Number(v||0))+' G'}};
 let lastGlobalPeriod=null;
 function monthNow(){return new Date().toISOString().slice(0,7)}
 function monthRange(m){const [y,mo]=m.split('-').map(Number);return {from:`${m}-01`,to:`${m}-${String(new Date(y,mo,0).getDate()).padStart(2,'0')}`}}
 function today(){return new Date().toISOString().slice(0,10)}
 function dateShift(days){const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
 function startOfYear(){return `${new Date().getFullYear()}-01-01`}
 function closeAllReportViews(){['reportsCenterView','treasuryReportView','punctualityReportView','monthlyView','globalMonthlyReportView'].forEach(id=>document.getElementById(id)?.classList.remove('open'))}

 function hideLegacyReportCards(){
  const hideByOnclick=['openTreasuryReport()','openMonthlyClose()','openPunctualityReport()'];
  document.querySelectorAll('main.home button.launch').forEach(b=>{const oc=b.getAttribute('onclick')||'';if(hideByOnclick.some(x=>oc.includes(x)))b.style.display='none'});
  const p=document.getElementById('punctualityLaunchCard');if(p)p.style.display='none';
  const g=document.getElementById('globalMonthlyLaunch');if(g)g.style.display='none';
 }
 function ensureLaunch(){
  hideLegacyReportCards();
  let b=document.getElementById('reportsCenterLaunch');
  if(!b){
   b=document.createElement('button');b.id='reportsCenterLaunch';b.className='launch visitor-hidden role-hidden';b.onclick=()=>openReportsCenter();
   b.innerHTML='<div class="icon">📚</div><h2>Rapports</h2><p>Rapports par période, rapports mensuels, validations et rapports globaux selon votre rôle.</p><span class="go">Ouvrir les rapports →</span>';
   const grid=document.querySelector('main.home .treasury-launch-grid')||document.querySelector('main.home .grid');if(grid)grid.insertBefore(b,grid.firstChild);
  }
  b.style.display=['president','secretary','treasurer'].includes(role())?'block':'none';
 }
 function ensureView(){
  if(document.getElementById('reportsCenterView'))return;
  const v=document.createElement('div');v.className='membersView';v.id='reportsCenterView';
  v.innerHTML=`<div class="viewerbar"><div class="viewtitle"><b>Rapports CHEBSEL</b><span id="reportsCenterSubtitle">Centre unique de rapports</span></div></div><div class="membersBody"><div id="reportsRoleMenu" class="reportsRoleGrid"></div><div id="globalPeriodPanel" class="profilePanel" style="display:none"><div class="profileTitle"><div><h3>Rapport global par période</h3><div class="memberMeta">Réservé au Président. Finance + ponctualité calculées par Supabase sur la même période.</div></div></div><div class="treasuryFilters"><div><label>Date début</label><input type="date" id="globalPeriodFrom"></div><div><label>Date fin</label><input type="date" id="globalPeriodTo"></div></div><div class="memberActions reportPresets"><button class="secondaryQuick" onclick="setGlobalPeriodPreset('day')">Aujourd’hui</button><button class="secondaryQuick" onclick="setGlobalPeriodPreset('week')">7 jours</button><button class="secondaryQuick" onclick="setGlobalPeriodPreset('month')">Mois actuel</button><button class="secondaryQuick" onclick="setGlobalPeriodPreset('year')">Année actuelle</button></div><div class="memberActions"><button class="quickBtn" onclick="generateGlobalPeriodReport()">Générer</button><button class="secondaryQuick" id="saveGlobalPeriodJPEGBtn" onclick="saveGlobalPeriodReportJPEG()" disabled>Enregistrer en JPEG</button></div><div id="globalPeriodBody" style="margin-top:12px"></div></div></div>`;
  document.body.appendChild(v);
 }
 function card(icon,title,text,onclick,tag=''){return `<button class="reportHubCard" onclick="${onclick}"><span class="reportHubIcon">${icon}</span><span class="reportHubCopy"><b>${esc(title)}</b><small>${esc(text)}</small>${tag?`<em>${esc(tag)}</em>`:''}</span><span class="reportHubArrow">→</span></button>`}
 function renderMenu(){
  ensureView();const r=role(),box=document.getElementById('reportsRoleMenu'),sub=document.getElementById('reportsCenterSubtitle'),gp=document.getElementById('globalPeriodPanel');if(!box)return;
  let html='';
  if(r==='treasurer'){
   sub.textContent='Finance — rapports libres et rapport mensuel à soumettre';
   html+=card('📊','Rapport financier — période libre','Choisir une journée, une semaine, un mois, plusieurs mois ou une année.','openReportFinancialFree()');
   html+=card('🗓️','Rapport mensuel financier','Préparer le rapport mensuel officiel et l’envoyer au Président pour validation.','openReportFinancialMonthly()','Trésorier → Président');
   gp.style.display='none';
  }else if(r==='secretary'){
   sub.textContent='Ponctualité — rapports libres et rapport mensuel à soumettre';
   html+=card('⏱️','Rapport de ponctualité — période libre','Choisir une journée, une semaine, un mois, plusieurs mois ou une année.','openReportPunctualityFree()');
   html+=card('🗓️','Rapport mensuel de ponctualité','Préparer le rapport mensuel officiel et l’envoyer au Président pour validation.','openReportPunctualityMonthly()','Secrétaire → Président');
   gp.style.display='none';
  }else if(r==='president'){
   sub.textContent='Validation, rapports spécialisés et rapports globaux';
   html+=card('💰','Rapports financiers','Consulter ou générer un rapport financier pour toute période.','openReportFinancialFree()');
   html+=card('⏱️','Rapports de ponctualité','Consulter ou générer la ponctualité pour toute période.','openReportPunctualityFree()');
   html+=card('✅','Validation mensuelle — Finance','Voir le rapport mensuel préparé par le Trésorier et le valider.','openReportFinancialMonthly()','Validation Président');
   html+=card('✅','Validation mensuelle — Ponctualité','Voir le rapport mensuel préparé par le Secrétaire et le valider.','openReportPunctualityMonthly()','Validation Président');
   html+=card('📑','Rapport mensuel global','Fusionner automatiquement les deux rapports mensuels validés.','openReportGlobalMonthly()','Finance + Ponctualité');
   gp.style.display='block';
   if(!document.getElementById('globalPeriodFrom').value)setGlobalPeriodPreset('month');
  }else{html='<div class="statusBad">Accès réservé aux responsables.</div>';gp.style.display='none'}
  box.innerHTML=html;
 }
 window.openReportsCenter=function(){if(!['president','secretary','treasurer'].includes(role()))return;ensureView();renderMenu();document.getElementById('reportsCenterView').classList.add('open')};
 window.closeReportsCenter=function(){document.getElementById('reportsCenterView')?.classList.remove('open')};
 window.openReportFinancialFree=function(){closeReportsCenter();window.openTreasuryReport?.()};
 window.openReportPunctualityFree=function(){closeReportsCenter();window.openPunctualityReport?.()};
 window.openReportFinancialMonthly=function(){closeReportsCenter();window.openMonthlyClose?.();setTimeout(()=>{const e=document.getElementById('closeMonth');if(e&&!e.value)e.value=monthNow();window.renderMonthlyClose?.()},80)};
 window.openReportPunctualityMonthly=function(){closeReportsCenter();window.openPunctualityReport?.();setTimeout(()=>{const e=document.getElementById('punctualityCloseMonth');if(e)e.value=monthNow();window.renderPunctualityClosing?.();document.getElementById('punctualityClosingPanel')?.scrollIntoView({block:'start'})},120)};
 window.openReportGlobalMonthly=function(){if(role()!=='president')return;closeReportsCenter();window.openGlobalMonthlyReport?.();setTimeout(()=>{const e=document.getElementById('globalReportMonth');if(e&&!e.value)e.value=monthNow();window.refreshGlobalMonthlyStatus?.()},100)};

 window.setGlobalPeriodPreset=function(kind){const a=document.getElementById('globalPeriodFrom'),b=document.getElementById('globalPeriodTo');if(!a||!b)return;const t=today();if(kind==='day'){a.value=t;b.value=t}else if(kind==='week'){a.value=dateShift(-6);b.value=t}else if(kind==='year'){a.value=startOfYear();b.value=t}else{const r=monthRange(monthNow());a.value=r.from;b.value=t<r.to?t:r.to}};
 async function cloud(){const c=await getCloudClient();if(!c)throw new Error('CHEBSEL Cloud indisponible.');return c}
 window.generateGlobalPeriodReport=async function(){
  if(role()!=='president')return;const from=document.getElementById('globalPeriodFrom')?.value,to=document.getElementById('globalPeriodTo')?.value,body=document.getElementById('globalPeriodBody');if(!from||!to||to<from){alert('Chwazi yon peryòd valab.');return}if(!navigator.onLine){alert('Koneksyon entènèt nesesè pou rapò global canonical la.');return}
  if(body)body.innerHTML='<div class="empty">Calcul Supabase…</div>';
  try{const c=await cloud(),q=await c.rpc('chebsel_global_period_report',{p_from:from,p_to:to});if(q.error)throw q.error;lastGlobalPeriod=q.data||{};renderGlobalPeriod(lastGlobalPeriod);const btn=document.getElementById('saveGlobalPeriodJPEGBtn');if(btn)btn.disabled=false}catch(e){lastGlobalPeriod=null;if(body)body.innerHTML=`<div class="statusBad">Rapport impossible : ${esc(e?.message||e)}</div>`}
 };
 function renderGlobalPeriod(x){const f=x.finance||{},p=x.punctuality||{},body=document.getElementById('globalPeriodBody');if(!body)return;body.innerHTML=`<div class="profilePanel reportGlobalResult"><div class="closingStatus"><b>${esc(x.from||'')} → ${esc(x.to||'')}</b></div><h3>Finance</h3><div class="memberStats"><div class="mini"><b>${moneyX(f.due)}</b><span>Dû</span></div><div class="mini"><b>${moneyX(f.paid)}</b><span>Payé</span></div><div class="mini"><b>${moneyX(f.balance)}</b><span>Créances</span></div><div class="mini"><b>${Number(f.recovery||0)} %</b><span>Recouvrement</span></div><div class="mini"><b>${moneyX(f.cashIn)}</b><span>Entrées caisse</span></div><div class="mini"><b>${moneyX(f.expenses)}</b><span>Dépenses</span></div><div class="mini"><b>${moneyX(f.net)}</b><span>Solde net</span></div></div><h3>Ponctualité</h3><div class="memberStats"><div class="mini"><b>${Number(p.activities||0)}</b><span>Activités</span></div><div class="mini"><b>${Number(p.attendance_rate||0)} %</b><span>Présence</span></div><div class="mini"><b>${Number(p.punctuality_rate||0)} %</b><span>Ponctualité</span></div><div class="mini"><b>${Number(p.late||0)}</b><span>Retards</span></div><div class="mini"><b>${Number(p.absent||0)}</b><span>Absences</span></div><div class="mini"><b>${Number(p.ANMP||0)}</b><span>ANMP</span></div></div><div class="memberMeta reportSynthesis"><b>Synthèse :</b> ${Number(p.activities||0)} activité(s), ${Number(p.attendance_rate||0)} % de présence, ${Number(p.punctuality_rate||0)} % de ponctualité, ${moneyX(f.cashIn)} encaissés, ${moneyX(f.expenses)} de dépenses et ${moneyX(f.net)} de solde net.</div></div>`}
 window.saveGlobalPeriodReportJPEG=async function(){
  const x=lastGlobalPeriod;if(!x){alert('Générez d’abord le rapport.');return}const f=x.finance||{},p=x.punctuality||{},W=1400,H=1750,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#102644';g.fillRect(0,0,W,190);g.fillStyle='#c59d3f';g.fillRect(0,190,W,8);g.fillStyle='#fff';g.font='700 42px system-ui';g.fillText('CHEBSEL — RAPPORT GLOBAL',70,82);g.font='24px system-ui';g.fillText(`${x.from} au ${x.to}`,70,130);g.fillStyle='#111827';g.font='700 30px system-ui';g.fillText('SITUATION FINANCIÈRE',70,270);g.font='24px system-ui';const lines=[`Dû : ${moneyX(f.due)}`,`Payé : ${moneyX(f.paid)}`,`Créances : ${moneyX(f.balance)}`,`Recouvrement : ${Number(f.recovery||0)} %`,`Entrées caisse : ${moneyX(f.cashIn)}`,`Dépenses : ${moneyX(f.expenses)}`,`Solde net : ${moneyX(f.net)}`];let y=325;for(const s of lines){g.fillText(s,90,y);y+=48}g.font='700 30px system-ui';g.fillText('PONCTUALITÉ & PARTICIPATION',70,y+35);y+=90;g.font='24px system-ui';const pl=[`Activités : ${Number(p.activities||0)}`,`Présence : ${Number(p.attendance_rate||0)} %`,`Ponctualité : ${Number(p.punctuality_rate||0)} %`,`Retards : ${Number(p.late||0)}`,`Absences : ${Number(p.absent||0)}`,`ANMP : ${Number(p.ANMP||0)}`];for(const s of pl){g.fillText(s,90,y);y+=48}g.font='700 30px system-ui';g.fillText('SYNTHÈSE',70,y+45);y+=95;g.font='23px system-ui';const syn=`${Number(p.activities||0)} activité(s) • ${Number(p.attendance_rate||0)} % présence • ${Number(p.punctuality_rate||0)} % ponctualité • ${moneyX(f.cashIn)} encaissés • ${moneyX(f.expenses)} dépenses • ${moneyX(f.net)} solde net.`;wrap(g,syn,90,y,1210,38);g.font='20px system-ui';g.fillStyle='#667085';g.fillText('Généré par le Président — '+new Date().toLocaleString('fr-FR'),70,H-100);const a=document.createElement('a');a.download=`Rapport_global_CHEBSEL_${x.from}_${x.to}.jpg`;a.href=c.toDataURL('image/jpeg',0.94);a.click();try{await registerChebselArchive?.('global_period_report',x.from,x.to,a.download,{from:x.from,to:x.to})}catch(e){}
 };
 function wrap(g,text,x,y,max,line){const words=String(text).split(' ');let s='';for(const w of words){const t=s?`${s} ${w}`:w;if(g.measureText(t).width>max&&s){g.fillText(s,x,y);y+=line;s=w}else s=t}if(s)g.fillText(s,x,y)}

 // Login responsiveness: immediate busy state and double-click protection.
 function installLoginGuard(){
  if(typeof window.loginUserAction!=='function'||window.__chebselLoginGuard)return;window.__chebselLoginGuard=true;const base=window.loginUserAction;let busy=false;
  window.loginUserAction=loginUserAction=async function(){if(busy)return;busy=true;const btn=document.querySelector('#loginModal button[onclick*="loginUserAction"]'),help=document.getElementById('loginHelp'),old=btn?.textContent||'Se connecter',oldHelp=help?.textContent||'';if(btn){btn.disabled=true;btn.setAttribute('aria-busy','true');btn.textContent='Connexion…'}if(help)help.textContent='Vérification sécurisée en cours…';try{return await base.apply(this,arguments)}finally{busy=false;if(btn){btn.disabled=false;btn.removeAttribute('aria-busy');btn.textContent=old}if(help&&document.getElementById('loginModal')?.classList.contains('open'))help.textContent=oldHelp}}
 }

 const obs=new MutationObserver(()=>{ensureLaunch();hideLegacyReportCards()});obs.observe(document.body,{subtree:true,childList:true});
 const baseAuth=window.updateAuthUI;if(typeof baseAuth==='function')window.updateAuthUI=updateAuthUI=function(){const out=baseAuth.apply(this,arguments);setTimeout(()=>{ensureLaunch();renderMenuIfOpen()},0);return out};
 function renderMenuIfOpen(){if(document.getElementById('reportsCenterView')?.classList.contains('open'))renderMenu()}
 setTimeout(()=>{ensureLaunch();ensureView();installLoginGuard()},0);
})();
