/* CHEBSEL v1.17.6 — President scope mirrors Secretary/Treasurer UX + contextual back */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const esc=s=>{try{return escapeHtml(String(s??''))}catch(e){return String(s??'')}};
 const moneyX=v=>{try{return money(v)}catch(e){return new Intl.NumberFormat('fr-FR').format(Number(v||0))+' G'}};
 const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 let presidentBackTarget=null;
 let presidentFrameScope=null;

 function ensureHub(id,title,subtitle=''){
  let v=document.getElementById(id);if(v)return v;
  v=document.createElement('div');v.className='membersView';v.id=id;
  v.innerHTML=`<div class="viewerbar"><div class="viewtitle"><b>${esc(title)}</b><span>${esc(subtitle)}</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu" id="${id}Menu"></div></div></div>`;
  document.body.appendChild(v);return v
 }
 function item(icon,title,text,fn){return `<button class="utilityBtn" onclick="${fn}">${icon} ${esc(title)}<span>${esc(text)}</span></button>`}
 window.closePresidentHub=id=>document.getElementById(id)?.classList.remove('open');

 window.openPresidentSecretariatHub=function(){
  if(role()!=='president')return window.openSecretariatHub?.();
  presidentBackTarget=null;
  const v=ensureHub('presidentSecretariatHub1176','Secrétariat','Même organisation que l’espace Secrétaire'),m=document.getElementById('presidentSecretariatHub1176Menu');
  m.innerHTML=item('✅','Appel','Faire ou consulter l’appel.',"closePresidentHub('presidentSecretariatHub1176');openPresidentAttendanceOnly('call')")+item('⚙️','Paramètres','Paramètres de la fiche d’appel.',"closePresidentHub('presidentSecretariatHub1176');openPresidentAttendanceOnly('settings')")+item('📈','Historique','Santé de ponctualité du groupe sur 6 mois.',"closePresidentHub('presidentSecretariatHub1176');openPresidentPunctualityHealth()");
  v.classList.add('open')
 };

 function scopeFrame(app,mode){
  presidentFrameScope={app,mode};
  const page=mode;
  if(app==='attendance')openAttendance(page);else openFinance(page);
  const frame=document.getElementById('appFrame');
  const apply=()=>{
   if(role()!=='president'||!presidentFrameScope)return;let d,w;try{d=frame?.contentDocument;w=frame?.contentWindow}catch(e){return}if(!d)return;
   const isAtt=app==='attendance',allowed=mode==='settings'?['parametre','parametres']:(isAtt?['appel']:['saisir']);
   const names=isAtt?['accueil','appel','historique','rapport','rapports','sauvegarde','sauvegardes','parametre','parametres']:['accueil','saisir','mois','historique','rapport','rapports','sauvegarde','sauvegardes','parametre','parametres'];
   const nav=d.querySelector('#nav,.nav,[role="tablist"]');
   (nav?nav.querySelectorAll('button,a,[role="tab"]'):[]).forEach(el=>{const t=norm(el.textContent);if(names.some(x=>t===x||t.startsWith(x+' ')))el.style.setProperty('display',allowed.some(x=>t===x||t.startsWith(x+' '))?'':'none','important')});
   try{if(typeof w?.goPage==='function')w.goPage(mode)}catch(e){}
  };
  if(frame){frame.addEventListener('load',apply,{once:true});[80,180,350].forEach(ms=>setTimeout(apply,ms))}
 }
 window.openPresidentAttendanceOnly=function(mode){if(role()!=='president')return openAttendance(mode);presidentBackTarget='secretariat';scopeFrame('attendance',mode==='settings'?'settings':'call')};
 window.openPresidentFinanceOnly=function(mode){if(role()!=='president')return openFinance(mode);presidentBackTarget='payments';scopeFrame('finance',mode==='settings'?'settings':'entry')};

 window.openPresidentTreasuryHub=function(){
  if(role()!=='president')return window.openTreasuryHub?.();
  presidentBackTarget=null;
  const v=ensureHub('presidentTreasuryHub1176','Trésorerie','Même organisation que l’espace Trésorier'),m=document.getElementById('presidentTreasuryHub1176Menu');
  m.innerHTML=item('💵','Paiements','Saisie et paramètres des cotisations et amendes.',"closePresidentHub('presidentTreasuryHub1176');openPresidentPaymentHub()")+item('📋','Débiteurs','Situation des dettes ouvertes.',"closePresidentHub('presidentTreasuryHub1176');presidentBackTarget='treasury';openDebtors()")+item('💸','Dépenses','Livre des sorties de caisse.',"closePresidentHub('presidentTreasuryHub1176');presidentBackTarget='treasury';openTreasuryExpenses()")+item('📈','Historique','Santé financière du groupe sur 6 mois.',"closePresidentHub('presidentTreasuryHub1176');openPresidentFinanceHealth()");
  v.classList.add('open')
 };
 window.openPresidentPaymentHub=function(){
  if(role()!=='president')return window.openTreasuryPaymentHub?.();
  presidentBackTarget='treasury';const v=ensureHub('presidentPaymentHub1176','Paiements cotisations & amendes','Même organisation que l’espace Trésorier'),m=document.getElementById('presidentPaymentHub1176Menu');
  m.innerHTML=item('💵','Saisir','Ouvrir uniquement la saisie.',"closePresidentHub('presidentPaymentHub1176');openPresidentFinanceOnly('entry')")+item('⚙️','Paramètres','Ouvrir uniquement les paramètres financiers.',"closePresidentHub('presidentPaymentHub1176');openPresidentFinanceOnly('settings')");v.classList.add('open')
 };

 function monthBounds(month){const [y,m]=month.split('-').map(Number),last=new Date(y,m,0).getDate();return {from:`${month}-01`,to:`${month}-${String(last).padStart(2,'0')}`}}
 function monthList(n=6){const out=[],d=new Date();d.setDate(1);for(let i=n-1;i>=0;i--){const x=new Date(d);x.setMonth(x.getMonth()-i);out.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`)}return out}
 function financeHealthData(){return monthList().map(m=>{const b=monthBounds(m),ins=typeof treasuryIncomeRows==='function'?treasuryIncomeRows(b.from,b.to):[],outs=typeof treasuryExpenseRows==='function'?treasuryExpenseRows(b.from,b.to):[],snap=typeof monthlySnapshot==='function'?monthlySnapshot(m):{};const income=ins.reduce((s,x)=>s+Number(x.amount||0),0),expenses=outs.reduce((s,x)=>s+Number(x.amount||0),0);return {month:m,income,expenses,net:income-expenses,debt:Number(snap?.balance||0)}})}
 function ensureFinanceHealth(){let v=document.getElementById('presidentFinanceHealthView');if(v)return v;v=document.createElement('div');v.className='membersView';v.id='presidentFinanceHealthView';v.innerHTML='<div class="viewerbar"><div class="viewtitle"><b>Santé financière CHEBSEL</b><span>Historique graphique des 6 derniers mois</span></div></div><div class="membersBody" id="presidentFinanceHealthBody"></div>';document.body.appendChild(v);return v}
 window.openPresidentFinanceHealth=function(){if(role()!=='president')return window.openTreasurerFinanceHealth?.();presidentBackTarget='treasury';ensureFinanceHealth().classList.add('open');renderPresidentFinanceHealth()};
 window.renderPresidentFinanceHealth=function(){const box=document.getElementById('presidentFinanceHealthBody');if(!box)return;const rows=financeHealthData(),max=Math.max(1,...rows.flatMap(r=>[r.income,r.expenses,Math.max(0,r.net),r.debt])),W=920,H=390,pad=58,group=(W-pad*2)/rows.length,bar=group/5;let svg=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="currentColor" opacity=".3"/>`;rows.forEach((r,i)=>{const x=pad+i*group+group*.10,scale=(H-pad*2)/max,vals=[r.income,r.expenses,Math.max(0,r.net),r.debt],cols=['#16794B','#B42318','#C59D3F','#2563EB'];vals.forEach((v,j)=>{const h=Math.max(2,v*scale);svg+=`<rect x="${x+j*bar}" y="${H-pad-h}" width="${Math.max(5,bar-3)}" height="${h}" rx="4" fill="${cols[j]}"/>`});svg+=`<text x="${x+bar*1.5}" y="${H-22}" text-anchor="middle" font-size="16" fill="currentColor">${r.month.slice(5)}</text>`});svg+='</svg>';const cur=rows.at(-1)||{};box.innerHTML=`<div class="profilePanel"><div class="treasurySummary"><div class="mini"><b>${moneyX(cur.income)}</b><span>Entrées</span></div><div class="mini"><b>${moneyX(cur.expenses)}</b><span>Dépenses</span></div><div class="mini"><b>${moneyX(cur.net)}</b><span>Solde net</span></div><div class="mini"><b>${moneyX(cur.debt)}</b><span>Dette / Créances</span></div></div></div><div class="profilePanel"><h3>Évolution de la santé financière — 6 derniers mois</h3><div class="memberMeta">Vert = Entrées • Rouge = Dépenses • Or = Solde net • Bleu = Dette / Créances</div>${svg}</div>`};

 function punctualityHealthData(){const a=(()=>{try{return JSON.parse(localStorage.getItem('chebsel_attendance_app_v1')||'{}')}catch(e){return {}}})(),calls=Array.isArray(a.calls)?a.calls:[];return monthList().map(month=>{const mc=calls.filter(c=>String(c.date||'').slice(0,7)===month);let total=0,present=0,onTime=0,late=0,absent=0;for(const c of mc){for(const r of Object.values(c.records||{})){const st=String(r?.status||'').toUpperCase();if(!st)continue;total++;if(st==='P'){present++;onTime++}else if(st==='RM'||st==='RNM'||st==='R'){present++;late++}else if(st==='AM'||st==='ANM'||st==='ANMP'||st==='A'){absent++}}}return {month,activities:mc.length,presence:total?Math.round(present*100/total):0,punctuality:present?Math.round(onTime*100/present):0,late:total?Math.round(late*100/total):0,absent:total?Math.round(absent*100/total):0}})}
 function ensurePunctHealth(){let v=document.getElementById('presidentPunctHealthView');if(v)return v;v=document.createElement('div');v.className='membersView';v.id='presidentPunctHealthView';v.innerHTML='<div class="viewerbar"><div class="viewtitle"><b>Santé de ponctualité CHEBSEL</b><span>Historique graphique des 6 derniers mois</span></div></div><div class="membersBody" id="presidentPunctHealthBody"></div>';document.body.appendChild(v);return v}
 window.openPresidentPunctualityHealth=function(){if(role()!=='president')return;presidentBackTarget='secretariat';ensurePunctHealth().classList.add('open');renderPresidentPunctualityHealth()};
 window.renderPresidentPunctualityHealth=function(){const box=document.getElementById('presidentPunctHealthBody');if(!box)return;const rows=punctualityHealthData(),W=920,H=390,pad=58,group=(W-pad*2)/rows.length,bar=group/5,scale=(H-pad*2)/100;let svg=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="currentColor" opacity=".3"/>`;rows.forEach((r,i)=>{const x=pad+i*group+group*.10,vals=[r.presence,r.punctuality,r.late,r.absent],cols=['#16794B','#2563EB','#C59D3F','#B42318'];vals.forEach((v,j)=>{const h=Math.max(2,v*scale);svg+=`<rect x="${x+j*bar}" y="${H-pad-h}" width="${Math.max(5,bar-3)}" height="${h}" rx="4" fill="${cols[j]}"/>`});svg+=`<text x="${x+bar*1.5}" y="${H-22}" text-anchor="middle" font-size="16" fill="currentColor">${r.month.slice(5)}</text>`});svg+='</svg>';const cur=rows.at(-1)||{};box.innerHTML=`<div class="profilePanel"><div class="treasurySummary"><div class="mini"><b>${cur.activities||0}</b><span>Activités</span></div><div class="mini"><b>${cur.presence||0} %</b><span>Présence</span></div><div class="mini"><b>${cur.punctuality||0} %</b><span>Ponctualité</span></div><div class="mini"><b>${cur.late||0} %</b><span>Retards</span></div><div class="mini"><b>${cur.absent||0} %</b><span>Absences</span></div></div></div><div class="profilePanel"><h3>Évolution de la santé de ponctualité — 6 derniers mois</h3><div class="memberMeta">Vert = Présence • Bleu = Ponctualité • Or = Retards • Rouge = Absences</div>${svg}</div>`};

 // Replace President launch destinations while leaving Secretary/Treasurer untouched.
 function wirePresidentHome(){if(role()!=='president')return;document.querySelectorAll('#cleanRoleRoot button.cleanNavCard').forEach(b=>{const t=norm(b.textContent);if(t==='secretariat')b.setAttribute('onclick','openPresidentSecretariatHub()');if(t==='tresorerie')b.setAttribute('onclick','openPresidentTreasuryHub()')})}
 const mo=new MutationObserver(()=>wirePresidentHome());document.addEventListener('DOMContentLoaded',()=>{wirePresidentHome();mo.observe(document.body,{subtree:true,childList:true})});setTimeout(wirePresidentHome,300);

 const baseBack=window.globalBack;
 window.globalBack=function(){
  if(role()==='president'){
   const viewer=document.getElementById('viewer');if(viewer?.classList.contains('open')&&presidentFrameScope){viewer.classList.remove('open');try{document.getElementById('appFrame').srcdoc=''}catch(e){}presidentFrameScope=null;const target=presidentBackTarget;presidentBackTarget=null;if(target==='secretariat')openPresidentSecretariatHub();else if(target==='payments')openPresidentPaymentHub();return}
   const ph=document.getElementById('presidentPaymentHub1176');if(ph?.classList.contains('open')){ph.classList.remove('open');openPresidentTreasuryHub();return}
   const sh=document.getElementById('presidentSecretariatHub1176');if(sh?.classList.contains('open')){sh.classList.remove('open');return}
   const th=document.getElementById('presidentTreasuryHub1176');if(th?.classList.contains('open')){th.classList.remove('open');return}
   const pvh=document.getElementById('presidentPunctHealthView');if(pvh?.classList.contains('open')){pvh.classList.remove('open');openPresidentSecretariatHub();return}
   const fvh=document.getElementById('presidentFinanceHealthView');if(fvh?.classList.contains('open')){fvh.classList.remove('open');openPresidentTreasuryHub();return}
   const dv=document.getElementById('debtorsView');if(dv?.classList.contains('open')&&presidentBackTarget==='treasury'){dv.classList.remove('open');presidentBackTarget=null;openPresidentTreasuryHub();return}
   const ev=document.getElementById('treasuryExpensesView');if(ev?.classList.contains('open')&&presidentBackTarget==='treasury'){ev.classList.remove('open');presidentBackTarget=null;openPresidentTreasuryHub();return}
  }
  return typeof baseBack==='function'?baseBack.apply(this,arguments):undefined
 };
})();
