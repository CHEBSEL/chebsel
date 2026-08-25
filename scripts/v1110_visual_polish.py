from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')
assert 'CHEBSEL v1.10.4' in s, 'Expected v1.10.4 base'
assert "const APP_VERSION='1.10.4'" in s, 'APP_VERSION v1.10.4 not found'

s=s.replace('CHEBSEL v1.10.4 — Centre de gestion','CHEBSEL v1.11.0 — Centre de gestion')
s=s.replace("const APP_VERSION='1.10.4'","const APP_VERSION='1.11.0'")
s=s.replace('>v1.10.4<','>v1.11.0<')

css=r'''
/* CHEBSEL v1.11.0 — Visual Polish Layer */
:root{
 --shadow-sm:0 2px 8px rgba(16,24,40,.055);
 --shadow-md:0 8px 24px rgba(16,24,40,.085);
 --shadow-lg:0 18px 46px rgba(16,24,40,.14);
 --radius-sm:12px;--radius-md:18px;--radius-lg:24px;
 --accent-members:#2563eb;--accent-attendance:#0f766e;--accent-finance:#16803f;
 --accent-expense:#c65d08;--accent-debt:#b42318;--accent-calendar:#7357c7;--accent-admin:#4b6478;
}
html[data-theme="dark"]{
 --shadow-sm:0 2px 8px rgba(0,0,0,.18);--shadow-md:0 8px 24px rgba(0,0,0,.27);--shadow-lg:0 18px 46px rgba(0,0,0,.38);
}
html,body,button,input,select,textarea{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
body{letter-spacing:-.006em}
.brandtitle,.hero h1,.launch h2,.memberName,.profileTitle h3{letter-spacing:-.025em}
.brandtitle{font-weight:780}.hero h1{font-weight:800}.launch h2{font-weight:760}.memberName{font-weight:750}.profileTitle h3{font-weight:800}
.launch,.stat,.memberCard,.profilePanel,.calendarPanel{box-shadow:var(--shadow-sm)}
.hero{box-shadow:var(--shadow-lg)}
.modalBox{box-shadow:var(--shadow-lg)}
.launch{position:relative;overflow:hidden;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.launch:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}
.launch:active{transform:translateY(0) scale(.995)}
.launch::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--module-accent,var(--primary));opacity:.72}
.launch[data-module="members"]{--module-accent:var(--accent-members)}
.launch[data-module="attendance"]{--module-accent:var(--accent-attendance)}
.launch[data-module="finance"]{--module-accent:var(--accent-finance)}
.launch[data-module="expense"]{--module-accent:var(--accent-expense)}
.launch[data-module="debt"]{--module-accent:var(--accent-debt)}
.launch[data-module="calendar"]{--module-accent:var(--accent-calendar)}
.launch[data-module="admin"]{--module-accent:var(--accent-admin)}
.icon{background:color-mix(in srgb,var(--module-accent,var(--primary)) 11%,var(--card));color:var(--module-accent,var(--primary));border:1px solid color-mix(in srgb,var(--module-accent,var(--primary)) 18%,transparent);box-shadow:none}
.icon svg{width:25px;height:25px;display:block;stroke:currentColor;stroke-width:1.9;fill:none;stroke-linecap:round;stroke-linejoin:round}
.stats{gap:12px}.stat{position:relative;overflow:hidden;padding:15px 14px 14px;border-radius:18px;min-height:92px}
.stat::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--kpi-accent,var(--primary));opacity:.85}
.stat .kpiTop{display:flex;align-items:center;justify-content:space-between;gap:8px}
.stat .kpiIcon{width:31px;height:31px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,var(--kpi-accent,var(--primary)) 10%,var(--card));color:var(--kpi-accent,var(--primary))}
.stat .kpiIcon svg{width:17px;height:17px;stroke:currentColor;stroke-width:1.9;fill:none;stroke-linecap:round;stroke-linejoin:round}
.stat.kpi-members{--kpi-accent:var(--accent-members)}.stat.kpi-attendance{--kpi-accent:var(--accent-attendance)}.stat.kpi-debt{--kpi-accent:var(--accent-debt)}.stat.kpi-fines{--kpi-accent:var(--accent-expense)}
.stat b{font-size:1.48rem;font-weight:800;letter-spacing:-.035em;margin-top:9px}.stat span{font-weight:600}
.memberCard{border-radius:18px}.memberStats{gap:8px}.mini{border-radius:13px;padding:10px 8px}.mini b{font-size:1.02rem;font-weight:780}.mini span{font-size:.7rem;font-weight:560}
.memberActions button,.quickBtn,.secondaryQuick,.back,.topbtn{transition:transform .14s ease,filter .14s ease,background .14s ease}
.memberActions button:active,.quickBtn:active,.secondaryQuick:active,.back:active,.topbtn:active{transform:scale(.975)}
.profilePanel:first-child{position:relative;overflow:hidden}
.profilePanel:first-child::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--primary),var(--accent-attendance))}
.profileTitle{align-items:center}.profileIdentity{display:flex;align-items:center;gap:12px;min-width:0}
.profileAvatar{width:50px;height:50px;flex:0 0 50px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(145deg,var(--primary),#426fb4);color:white;font-size:1rem;font-weight:850;box-shadow:var(--shadow-sm)}
.profileIdentityText{min-width:0}.profileIdentityText h3{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.profileSectionTitle{font-size:.74rem;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:750;margin:16px 0 7px}
.ledgerRow{padding:11px 0}.ledgerMain{font-weight:700}.ledgerMeta{line-height:1.45}
.modalBox::before{content:"";display:block;width:38px;height:4px;border-radius:999px;background:var(--line);margin:-6px auto 12px}
.finVisualPanel{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:15px;margin:14px 0;box-shadow:var(--shadow-sm)}
.finVisualHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.finVisualHead h3{margin:0;font-size:1rem;font-weight:780}.finVisualHead p{margin:4px 0 0;color:var(--muted);font-size:.76rem;line-height:1.35}.finVisualBadge{font-size:.68rem;font-weight:750;padding:5px 8px;border-radius:999px;background:var(--soft);color:var(--muted);white-space:nowrap}
.finBars{display:grid;grid-template-columns:repeat(6,minmax(42px,1fr));gap:9px;align-items:end;min-height:150px;padding-top:8px}
.finBarGroup{display:grid;grid-template-rows:110px auto;gap:7px;min-width:0}.finBarPlot{height:110px;display:flex;align-items:end;justify-content:center;gap:4px;border-bottom:1px solid var(--line)}
.finBar{width:min(16px,35%);min-height:2px;border-radius:5px 5px 2px 2px}.finBar.in{background:var(--accent-finance)}.finBar.out{background:var(--accent-expense)}
.finMonth{text-align:center;font-size:.67rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.finLegend{display:flex;gap:14px;align-items:center;margin-top:11px;font-size:.72rem;color:var(--muted)}.finLegend span{display:flex;align-items:center;gap:5px}.finDot{width:8px;height:8px;border-radius:999px}.finDot.in{background:var(--accent-finance)}.finDot.out{background:var(--accent-expense)}
.debtBars{display:grid;gap:9px}.debtBarRow{display:grid;grid-template-columns:minmax(95px,1fr) 2.4fr auto;gap:9px;align-items:center;font-size:.74rem}.debtBarTrack{height:8px;background:var(--soft);border-radius:999px;overflow:hidden}.debtBarFill{height:100%;border-radius:999px;background:var(--accent-debt)}.debtBarValue{font-weight:750;white-space:nowrap}
@media(max-width:620px){.finBars{gap:5px}.finBarGroup{grid-template-rows:96px auto}.finBarPlot{height:96px}.finBar{width:12px}.finVisualPanel{padding:13px}.debtBarRow{grid-template-columns:90px 1fr auto}}
@media(min-width:760px){.launch{padding:20px}.stat{padding:16px}.profilePanel{padding:16px}.membersBody{padding:18px}}
@media(prefers-reduced-motion:reduce){.launch,.memberActions button,.quickBtn,.secondaryQuick,.back,.topbtn{transition:none!important}}
'''
s=s.replace('</style>',css+'\n</style>',1)

js=r'''
// CHEBSEL v1.11.0 — visual polish runtime (presentation only)
const V1110_ICONS={
 users:'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
 check:'<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
 money:'<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 10h.01M18 14h.01"/></svg>',
 alert:'<svg viewBox="0 0 24 24"><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
 calendar:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>',
 clipboard:'<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/></svg>',
 chart:'<svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
 wallet:'<svg viewBox="0 0 24 24"><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6"/><path d="M16 13h4"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
 file:'<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>'
};
function v1110Icon(name){return V1110_ICONS[name]||V1110_ICONS.file}
function v1110ModuleKey(txt){txt=(txt||'').toLowerCase();if(/membre/.test(txt))return ['members','users'];if(/appel|présence|presence/.test(txt))return ['attendance','clipboard'];if(/cotisation|amende|finance/.test(txt))return ['finance','wallet'];if(/dépense|depense/.test(txt))return ['expense','money'];if(/débiteur|debiteur|dette/.test(txt))return ['debt','alert'];if(/calendrier|activité|activite/.test(txt))return ['calendar','calendar'];if(/rapport/.test(txt))return ['finance','chart'];if(/paramètre|parametre|confidentialité|confidentialite|à propos|a propos|diagnostic|sécurité|securite/.test(txt))return ['admin','settings'];return ['admin','file']}
function v1110PolishLaunchers(){document.querySelectorAll('.launch').forEach(card=>{const title=card.querySelector('h2')?.textContent||card.textContent||'';const [mod,ico]=v1110ModuleKey(title);card.dataset.module=mod;const i=card.querySelector('.icon');if(i&&!i.dataset.polished){i.innerHTML=v1110Icon(ico);i.dataset.polished='1'}})}
function v1110PolishKpis(){document.querySelectorAll('#homeStats .stat').forEach(k=>{const label=k.querySelector('span')?.textContent||'';const low=label.toLowerCase();let cls='kpi-members',ico='users';if(/présent|present/.test(low)){cls='kpi-attendance';ico='check'}else if(/dette/.test(low)){cls='kpi-debt';ico='money'}else if(/amende/.test(low)){cls='kpi-fines';ico='alert'}k.classList.add(cls);const span=k.querySelector('span');if(span&&!span.closest('.kpiTop')){const top=document.createElement('div');top.className='kpiTop';span.parentNode.insertBefore(top,span);top.appendChild(span);const icon=document.createElement('div');icon.className='kpiIcon';icon.innerHTML=v1110Icon(ico);top.appendChild(icon)}})}
function v1110Initials(name){const x=String(name||'').trim().split(/\s+/).filter(Boolean);return (x.slice(0,2).map(v=>v[0]?.toUpperCase()||'').join('')||'CH')}
function v1110PolishProfile(){const body=document.getElementById('profileBody');if(!body)return;const first=body.querySelector('.profilePanel');const pt=first?.querySelector('.profileTitle');if(!pt||pt.dataset.polished)return;const h=pt.querySelector('h3');if(!h)return;const existingParent=h.parentElement;const identity=document.createElement('div');identity.className='profileIdentity';const av=document.createElement('div');av.className='profileAvatar';av.textContent=v1110Initials(h.textContent);const text=document.createElement('div');text.className='profileIdentityText';while(existingParent.firstChild)text.appendChild(existingParent.firstChild);identity.append(av,text);existingParent.replaceWith(identity);pt.dataset.polished='1'}
function v1110MonthKey(d){return String(d||'').slice(0,7)}
function v1110LastMonths(n=6){const out=[],d=new Date();d.setDate(1);for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`)}return out}
function v1110MonthShort(ym){const [y,m]=ym.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('fr-FR',{month:'short'})}
function v1110FinancialData(){const months=v1110LastMonths(6),ins=Object.fromEntries(months.map(m=>[m,0])),outs=Object.fromEntries(months.map(m=>[m,0]));const pays=safeParse(PAYMENT_LOG_KEY)||[];for(const p of pays){if(String(p.status||'active').toLowerCase()==='cancelled'||p.cancelled)continue;const k=v1110MonthKey(p.date);if(k in ins)ins[k]+=Number(p.applied??p.amount??0)||0}const exps=(typeof treasuryExpenses==='function'?treasuryExpenses():safeParse('chebsel_expenses_v1'))||[];for(const e of exps){if(e.deletedAt||String(e.status||'').toLowerCase()==='cancelled')continue;const k=v1110MonthKey(e.date);if(k in outs)outs[k]+=Number(e.amount||0)||0}const f=safeParse(FIN_KEY)||{},groups={Cotisations:0,RNM:0,ANM:0,Prestations:0,Autres:0};for(const e of (f.entries||[])){const bal=Math.max(0,Number(e.due||0)-Number(e.paid||0));if(!bal)continue;const t=String(e.type||'').toLowerCase();if(t==='monthly')groups.Cotisations+=bal;else if(t==='rnm')groups.RNM+=bal;else if(t==='anm')groups.ANM+=bal;else if(t==='performance')groups.Prestations+=bal;else groups.Autres+=bal}return {months,ins,outs,groups}}
function v1110FinancialPanel(){if(isVisitor()||!(currentUser()?.key==='president'||currentUser()?.key==='treasurer'))return null;const {months,ins,outs,groups}=v1110FinancialData();const max=Math.max(1,...months.flatMap(m=>[ins[m],outs[m]]));const p=document.createElement('section');p.className='finVisualPanel';p.id='v1110FinanceVisual';p.innerHTML=`<div class="finVisualHead"><div><h3>Aperçu financier</h3><p>Entrées et dépenses des 6 derniers mois, puis répartition des créances ouvertes.</p></div><span class="finVisualBadge">Données CHEBSEL</span></div><div class="finBars">${months.map(m=>`<div class="finBarGroup"><div class="finBarPlot" title="${v1110MonthShort(m)} — Entrées ${money(ins[m])}, Dépenses ${money(outs[m])}"><i class="finBar in" style="height:${Math.max(2,Math.round(ins[m]/max*100))}%"></i><i class="finBar out" style="height:${Math.max(2,Math.round(outs[m]/max*100))}%"></i></div><div class="finMonth">${v1110MonthShort(m)}</div></div>`).join('')}</div><div class="finLegend"><span><i class="finDot in"></i>Entrées</span><span><i class="finDot out"></i>Dépenses</span></div><div class="profileSectionTitle">Créances ouvertes</div><div class="debtBars">${Object.entries(groups).filter(([,v])=>v>0).map(([k,v])=>{const total=Math.max(1,Object.values(groups).reduce((a,b)=>a+b,0));return `<div class="debtBarRow"><span>${k}</span><div class="debtBarTrack"><div class="debtBarFill" style="width:${Math.max(2,Math.round(v/total*100))}%"></div></div><span class="debtBarValue">${money(v)}</span></div>`}).join('')||'<div class="memberMeta">Aucune créance ouverte.</div>'}</div>`;return p}
function v1110PlaceFinancialPanel(){const old=document.getElementById('v1110FinanceVisual');if(old)old.remove();const p=v1110FinancialPanel();if(!p)return;const md=document.getElementById('monthlyDashboard');const panel=md?.closest('.profilePanel,.calendarPanel')||md?.parentElement;if(panel?.parentElement)panel.parentElement.insertBefore(p,panel.nextSibling);else{const home=document.querySelector('.home');if(home)home.appendChild(p)}}
function v1110PolishAll(){v1110PolishLaunchers();v1110PolishKpis();v1110PolishProfile();v1110PlaceFinancialPanel()}
let V1110_POLISH_TIMER=0;function v1110Schedule(){clearTimeout(V1110_POLISH_TIMER);V1110_POLISH_TIMER=setTimeout(v1110PolishAll,60)}
const V1110_OBSERVER=new MutationObserver(v1110Schedule);V1110_OBSERVER.observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',v1110Schedule);setTimeout(v1110PolishAll,250);
'''
anchor='updateCompactStatus();'
assert anchor in s, 'Initialization anchor not found'
s=s.replace(anchor,js+'\n'+anchor,1)

p.write_text(s,encoding='utf-8')
print('patched v1.11.0 visual polish')
