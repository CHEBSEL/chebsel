/* CHEBSEL v1.17.8 — President exact role parity + hard contextual Back */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 let route='home';
 let frameKind=null;

 function hide(id){document.getElementById(id)?.classList.remove('open')}
 function show(id){document.getElementById(id)?.classList.add('open')}
 function clearFrame(){
  const v=document.getElementById('viewer'),f=document.getElementById('appFrame');
  try{v?.classList.remove('open')}catch(e){}
  try{if(f){f.onload=null;f.srcdoc=''}}catch(e){}
  try{activeApp=null}catch(e){}
 }
 function applySingleTab(kind,page){
  if(role()!=='president')return;
  const f=document.getElementById('appFrame');let d,w;try{d=f?.contentDocument;w=f?.contentWindow}catch(e){return}if(!d?.head)return;
  let st=d.getElementById('chebsel-president-single-tab-1178');if(!st){st=d.createElement('style');st.id='chebsel-president-single-tab-1178';d.head.appendChild(st)}
  const label=kind==='attendance'?(page==='settings'?'param':'appel'):(page==='settings'?'param':'sais');
  st.textContent=`#nav button,.nav button,[role="tablist"] button,[role="tablist"] a{display:none!important}`;
  d.querySelectorAll('#nav button,.nav button,[role="tablist"] button,[role="tablist"] a,button,a[role="tab"]').forEach(el=>{
   const t=norm(el.textContent);const ok=label==='appel'?t.startsWith('appel'):label==='sais'?t.startsWith('sais'):t.startsWith('param');
   if(ok)el.style.setProperty('display','inline-flex','important');
  });
  try{if(typeof w?.goPage==='function')w.goPage(page)}catch(e){}
 }
 function openScoped(kind,page,targetRoute){
  frameKind=kind;route=targetRoute;
  if(kind==='attendance')openAttendance(page);else openFinance(page);
  const f=document.getElementById('appFrame');if(f){f.addEventListener('load',()=>{applySingleTab(kind,page);setTimeout(()=>applySingleTab(kind,page),80)},{once:true});[120,260,500].forEach(ms=>setTimeout(()=>applySingleTab(kind,page),ms))}
 }

 window.openPresidentSecretariatHub=function(){
  if(role()!=='president')return window.openSecretariatHub?.();
  route='secretariat';
  let v=document.getElementById('presidentSecretariatHub1178');if(!v){v=document.createElement('div');v.id='presidentSecretariatHub1178';v.className='membersView';v.innerHTML='<div class="viewerbar"><div class="viewtitle"><b>Secrétariat</b><span>Même fonctionnement que le Secrétaire</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu"><button class="utilityBtn" onclick="openPresidentCall1178()">✅ Appel<span>Faire ou consulter l’appel.</span></button><button class="utilityBtn" onclick="openPresidentAttendanceSettings1178()">⚙️ Paramètres<span>Paramètres de la fiche d’appel.</span></button><button class="utilityBtn" onclick="openPresidentPunctualityHealth1178()">📈 Historique<span>Santé de ponctualité sur 6 mois.</span></button></div></div></div>';document.body.appendChild(v)}
  v.classList.add('open');
 };
 window.openPresidentCall1178=function(){hide('presidentSecretariatHub1178');openScoped('attendance','call','secretariat-call')};
 window.openPresidentAttendanceSettings1178=function(){hide('presidentSecretariatHub1178');openScoped('attendance','settings','secretariat-settings')};
 window.openPresidentPunctualityHealth1178=function(){hide('presidentSecretariatHub1178');route='secretariat-history';if(typeof window.openPresidentPunctualityHealth==='function')window.openPresidentPunctualityHealth();else if(typeof window.openSecretaryPunctualityHealth==='function'){try{window.openSecretaryPunctualityHealth()}catch(e){}}};

 window.openPresidentTreasuryHub=function(){
  if(role()!=='president')return window.openTreasuryHub?.();
  route='treasury';
  let v=document.getElementById('presidentTreasuryHub1178');if(!v){v=document.createElement('div');v.id='presidentTreasuryHub1178';v.className='membersView';v.innerHTML='<div class="viewerbar"><div class="viewtitle"><b>Trésorerie</b><span>Même fonctionnement que le Trésorier</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu"><button class="utilityBtn" onclick="openPresidentPayments1178()">💵 Paiements<span>Saisie et paramètres financiers.</span></button><button class="utilityBtn" onclick="openPresidentDebtors1178()">📋 Débiteurs<span>Situation des dettes ouvertes.</span></button><button class="utilityBtn" onclick="openPresidentExpenses1178()">💸 Dépenses<span>Livre des sorties de caisse.</span></button><button class="utilityBtn" onclick="openPresidentFinanceHealth1178()">📈 Historique<span>Santé financière sur 6 mois.</span></button></div></div></div>';document.body.appendChild(v)}
  v.classList.add('open');
 };
 window.openPresidentPayments1178=function(){hide('presidentTreasuryHub1178');route='payments';let v=document.getElementById('presidentPaymentHub1178');if(!v){v=document.createElement('div');v.id='presidentPaymentHub1178';v.className='membersView';v.innerHTML='<div class="viewerbar"><div class="viewtitle"><b>Paiements cotisations & amendes</b><span>Même fonctionnement que le Trésorier</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu"><button class="utilityBtn" onclick="openPresidentFinanceEntry1178()">💵 Saisir<span>Ouvrir uniquement Saisir.</span></button><button class="utilityBtn" onclick="openPresidentFinanceSettings1178()">⚙️ Paramètres<span>Ouvrir uniquement Paramètres.</span></button></div></div></div>';document.body.appendChild(v)}v.classList.add('open')};
 window.openPresidentFinanceEntry1178=function(){hide('presidentPaymentHub1178');openScoped('finance','entry','finance-entry')};
 window.openPresidentFinanceSettings1178=function(){hide('presidentPaymentHub1178');openScoped('finance','settings','finance-settings')};
 window.openPresidentDebtors1178=function(){hide('presidentTreasuryHub1178');route='treasury-debtors';openDebtors()};
 window.openPresidentExpenses1178=function(){hide('presidentTreasuryHub1178');route='treasury-expenses';openTreasuryExpenses()};
 window.openPresidentFinanceHealth1178=function(){hide('presidentTreasuryHub1178');route='treasury-history';if(typeof window.openPresidentFinanceHealth==='function')window.openPresidentFinanceHealth();else if(typeof window.openTreasurerFinanceHealth==='function')window.openTreasurerFinanceHealth()};

 function wireHome(){if(role()!=='president')return;document.querySelectorAll('#cleanRoleRoot button.cleanNavCard,#roleShellGrid button.roleShellCard').forEach(b=>{const t=norm(b.textContent);if(t.includes('secretariat'))b.setAttribute('onclick','openPresidentSecretariatHub()');if(t.includes('tresorerie'))b.setAttribute('onclick','openPresidentTreasuryHub()')})}

 // President Back is a strict in-app state machine. It NEVER falls through to browser/history navigation.
 const previousGlobalBack=window.globalBack;
 window.globalBack=function(){
  if(role()!=='president')return typeof previousGlobalBack==='function'?previousGlobalBack.apply(this,arguments):undefined;
  const viewer=document.getElementById('viewer');
  if(viewer?.classList.contains('open')&&frameKind){clearFrame();const k=frameKind;frameKind=null;if(k==='attendance'){route='secretariat';openPresidentSecretariatHub()}else{route='payments';openPresidentPayments1178()}return}
  if(document.getElementById('presidentPaymentHub1178')?.classList.contains('open')){hide('presidentPaymentHub1178');route='treasury';openPresidentTreasuryHub();return}
  if(document.getElementById('presidentSecretariatHub1178')?.classList.contains('open')){hide('presidentSecretariatHub1178');route='home';return}
  if(document.getElementById('presidentTreasuryHub1178')?.classList.contains('open')){hide('presidentTreasuryHub1178');route='home';return}
  const pv=document.getElementById('presidentPunctHealthView');if(pv?.classList.contains('open')){pv.classList.remove('open');route='secretariat';openPresidentSecretariatHub();return}
  const fv=document.getElementById('presidentFinanceHealthView');if(fv?.classList.contains('open')){fv.classList.remove('open');route='treasury';openPresidentTreasuryHub();return}
  const d=document.getElementById('debtorsView');if(d?.classList.contains('open')){d.classList.remove('open');route='treasury';openPresidentTreasuryHub();return}
  const e=document.getElementById('treasuryExpensesView');if(e?.classList.contains('open')){e.classList.remove('open');route='treasury';openPresidentTreasuryHub();return}
  // At President home, Back intentionally does nothing instead of leaving CHEBSEL.
  route='home';return;
 };

 // Make all visible floating/header Back buttons use the same safe state machine for President.
 function forceBackButtons(){if(role()!=='president')return;document.querySelectorAll('#globalBackBtn,.floating-back').forEach(b=>b.setAttribute('onclick','globalBack()'))}
 const mo=new MutationObserver(()=>{wireHome();forceBackButtons()});
 document.addEventListener('DOMContentLoaded',()=>{wireHome();forceBackButtons();mo.observe(document.body,{subtree:true,childList:true})});
 setTimeout(()=>{wireHome();forceBackButtons()},250);
})();
