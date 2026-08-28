/* CHEBSEL v1.17.18 — President role parity without observers or Back overrides */
'use strict';
(function(){
 const role=()=>{try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}};
 const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function hide(id){document.getElementById(id)?.classList.remove('open')}
 function ensureHub(id,title,subtitle,html){let v=document.getElementById(id);if(v)return v;v=document.createElement('div');v.id=id;v.className='membersView';v.innerHTML=`<div class="viewerbar"><div class="viewtitle"><b>${title}</b><span>${subtitle}</span></div></div><div class="membersBody"><div class="profilePanel"><div class="utilityMenu">${html}</div></div></div>`;document.body.appendChild(v);return v}
 function applySingleTab(kind,page){
  if(role()!=='president')return;const f=document.getElementById('appFrame');let d,w;try{d=f?.contentDocument;w=f?.contentWindow}catch(e){return}if(!d?.head)return;
  let st=d.getElementById('chebsel-president-single-tab-1178');if(!st){st=d.createElement('style');st.id='chebsel-president-single-tab-1178';d.head.appendChild(st)}
  const label=kind==='attendance'?(page==='settings'?'param':'appel'):(page==='settings'?'param':'sais');
  st.textContent='#nav button,.nav button,[role="tablist"] button,[role="tablist"] a{display:none!important}';
  d.querySelectorAll('#nav button,.nav button,[role="tablist"] button,[role="tablist"] a,button,a[role="tab"]').forEach(el=>{const t=norm(el.textContent),ok=label==='appel'?t.startsWith('appel'):label==='sais'?t.startsWith('sais'):t.startsWith('param');if(ok)el.style.setProperty('display','inline-flex','important')});
  try{if(typeof w?.goPage==='function')w.goPage(page)}catch(e){}
 }
 function openScoped(kind,page){
  if(kind==='attendance')openAttendance(page);else openFinance(page);const f=document.getElementById('appFrame');if(!f)return;
  f.addEventListener('load',()=>applySingleTab(kind,page),{once:true});setTimeout(()=>applySingleTab(kind,page),120);
 }
 window.openPresidentSecretariatHub=function(){
  if(role()!=='president')return window.openSecretariatHub?.();
  const v=ensureHub('presidentSecretariatHub1178','Secrétariat','Même fonctionnement que le Secrétaire',
   '<button class="utilityBtn" onclick="openPresidentCall1178()">✅ Appel<span>Faire ou consulter l’appel.</span></button><button class="utilityBtn" onclick="openPresidentAttendanceSettings1178()">⚙️ Paramètres<span>Paramètres de la fiche d’appel.</span></button><button class="utilityBtn" onclick="openPresidentPunctualityHealth1178()">📈 Historique<span>Santé de ponctualité sur 6 mois.</span></button>');v.classList.add('open');
 };
 window.openPresidentCall1178=function(){hide('presidentSecretariatHub1178');openScoped('attendance','call')};
 window.openPresidentAttendanceSettings1178=function(){hide('presidentSecretariatHub1178');openScoped('attendance','settings')};
 window.openPresidentPunctualityHealth1178=function(){hide('presidentSecretariatHub1178');window.openPresidentPunctualityHealth?.()};
 window.openPresidentTreasuryHub=function(){
  if(role()!=='president')return window.openTreasuryHub?.();
  const v=ensureHub('presidentTreasuryHub1178','Trésorerie','Même fonctionnement que le Trésorier',
   '<button class="utilityBtn" onclick="openPresidentPayments1178()">💵 Paiements<span>Saisie et paramètres financiers.</span></button><button class="utilityBtn" onclick="openPresidentDebtors1178()">📋 Débiteurs<span>Situation des dettes ouvertes.</span></button><button class="utilityBtn" onclick="openPresidentExpenses1178()">💸 Dépenses<span>Livre des sorties de caisse.</span></button><button class="utilityBtn" onclick="openPresidentFinanceHealth1178()">📈 Historique<span>Santé financière sur 6 mois.</span></button>');v.classList.add('open');
 };
 window.openPresidentPayments1178=function(){hide('presidentTreasuryHub1178');const v=ensureHub('presidentPaymentHub1178','Paiements cotisations & amendes','Même fonctionnement que le Trésorier','<button class="utilityBtn" onclick="openPresidentFinanceEntry1178()">💵 Saisir<span>Ouvrir uniquement Saisir.</span></button><button class="utilityBtn" onclick="openPresidentFinanceSettings1178()">⚙️ Paramètres<span>Ouvrir uniquement Paramètres.</span></button>');v.classList.add('open')};
 window.openPresidentFinanceEntry1178=function(){hide('presidentPaymentHub1178');openScoped('finance','entry')};
 window.openPresidentFinanceSettings1178=function(){hide('presidentPaymentHub1178');openScoped('finance','settings')};
 window.openPresidentDebtors1178=function(){hide('presidentTreasuryHub1178');openDebtors()};
 window.openPresidentExpenses1178=function(){hide('presidentTreasuryHub1178');openTreasuryExpenses()};
 window.openPresidentFinanceHealth1178=function(){hide('presidentTreasuryHub1178');window.openPresidentFinanceHealth?.()};
})();
