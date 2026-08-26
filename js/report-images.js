/* CHEBSEL v1.12.1 — JPEG document exports + punctuality report */
'use strict';
(function(){
 const BRAND={navy:'#102644',navy2:'#17375f',gold:'#c59d3f',ink:'#111827',muted:'#667085',line:'#d7dce3',paper:'#ffffff',soft:'#f5f7fa',green:'#157347',red:'#b42318'};
 const MARGIN=72;
 let lastReceipt=null;

 function role(){try{return String(currentRoleView?.()||'').toLowerCase()}catch(e){return ''}}
 function punctualityAllowed(){return ['president','secretary'].includes(role())}
 function jpegName(s){return String(s||'CHEBSEL').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'')+'.jpg'}
 function isoToday(){return new Date().toISOString().slice(0,10)}
 function fmtPct(n,d){return d?Math.round((n/d)*100)+' %':'0 %'}
 function moneyText(v){try{return money(v)}catch(e){return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Number(v||0))+' G'}}

 function rounded(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}}
 function text(ctx,s,x,y,size=28,weight=400,color=BRAND.ink,align='left'){ctx.font=`${weight} ${size}px Arial,Helvetica,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(String(s??''),x,y)}
 function wrapLines(ctx,s,maxWidth,size=26,weight=400){ctx.font=`${weight} ${size}px Arial,Helvetica,sans-serif`;const words=String(s??'').split(/\s+/),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);return lines.length?lines:['']}
 function wrapped(ctx,s,x,y,maxWidth,size=26,weight=400,color=BRAND.ink,lineH=Math.round(size*1.3)){const lines=wrapLines(ctx,s,maxWidth,size,weight);lines.forEach((ln,i)=>text(ctx,ln,x,y+i*lineH,size,weight,color));return lines.length*lineH}
 function line(ctx,x1,y1,x2,y2,color=BRAND.line,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
 async function logo(){return await new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='./icons/chebsel-logo.png'})}
 async function header(ctx,title,subtitle,w){const img=await logo();if(img)ctx.drawImage(img,MARGIN,44,108,108);text(ctx,"CHŒUR D’HOMME DE L’ÉGLISE BAPTISTE SEL ET LUMIÈRE",w/2,48,31,800,BRAND.navy,'center');text(ctx,title,w/2,98,38,900,BRAND.ink,'center');if(subtitle)text(ctx,subtitle,w/2,145,23,500,BRAND.muted,'center');line(ctx,MARGIN,184,w-MARGIN,184,BRAND.gold,4);return 218}
 function footer(ctx,w,h,left='CHEBSEL',right='Document généré par CHEBSEL'){line(ctx,MARGIN,h-104,w-MARGIN,h-104,BRAND.line,1.5);text(ctx,left,MARGIN,h-84,20,700,BRAND.navy);text(ctx,right,w-MARGIN,h-84,20,400,BRAND.muted,'right')}
 function downloadCanvas(canvas,name){canvas.toBlob(blob=>{if(!blob){alert('Impossible de générer l’image JPEG.');return}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=jpegName(name);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1200)},'image/jpeg',0.94)}
 function makeCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle=BRAND.paper;ctx.fillRect(0,0,w,h);return {c,ctx}}

 function drawKeyValue(ctx,y,label,value,w,bold=false){text(ctx,label,MARGIN+18,y,27,500,BRAND.ink);text(ctx,value,w*0.56,y,27,bold?800:500,BRAND.ink);line(ctx,MARGIN,y+43,w-MARGIN,y+43,BRAND.line,1);return y+56}
 function drawSignature(ctx,y,w){line(ctx,MARGIN+15,y,w*0.38,y,BRAND.ink,1);line(ctx,w*0.62,y,w-MARGIN-15,y,BRAND.ink,1);text(ctx,'Signature du payeur',MARGIN+15,y+12,20,400,BRAND.muted);text(ctx,'Signature du trésorier',w-MARGIN-15,y+12,20,400,BRAND.muted,'right')}

 if(typeof showReceipt==='function'){
   const baseShowReceipt=showReceipt;
   window.showReceipt=showReceipt=function(mid,amount,date,ref,alloc,remain,receiptNo=''){
     lastReceipt={mid,amount,date,ref,alloc:Array.isArray(alloc)?alloc:[],remain,receiptNo};
     return baseShowReceipt.apply(this,arguments);
   };
 }
 window.saveReceiptJPEG=async function(){
   if(!lastReceipt){alert('Aucun reçu actif à enregistrer.');return}
   const m=centralMembers().find(x=>x.id===lastReceipt.mid),name=fullName(m),receiptNo=lastReceipt.receiptNo||document.querySelector('#receiptPrint .rmeta')?.textContent?.trim()||('REC-'+Date.now().toString().slice(-8));
   const f=safeParse(FIN_KEY)||{},entries=(f.entries||[]).filter(e=>e.memberId===lastReceipt.mid),bal=entries.reduce((s,e)=>s+Math.max(0,Number(e.due||0)-Number(e.paid||0)),0);
   const extra=Math.max(0,lastReceipt.alloc.length-1)*42+(lastReceipt.remain>0?42:0),H=1500+extra,{c,ctx}=makeCanvas(1200,H);let y=await header(ctx,'REÇU DE PAIEMENT',receiptNo,c.width);
   rounded(ctx,MARGIN,y,c.width-2*MARGIN,390,18,BRAND.soft,BRAND.line);y+=28;
   y=drawKeyValue(ctx,y,'Date',lastReceipt.date,c.width);y=drawKeyValue(ctx,y,'Membre',name,c.width);y=drawKeyValue(ctx,y,'Montant reçu',moneyText(lastReceipt.amount),c.width,true);y=drawKeyValue(ctx,y,'Référence',lastReceipt.ref||'—',c.width);y=drawKeyValue(ctx,y,'Solde restant',moneyText(bal),c.width);
   y+=45;text(ctx,'Affectation',MARGIN,y,27,800,BRAND.navy);y+=44;
   for(const a of lastReceipt.alloc){text(ctx,a.label||'Affectation',MARGIN+18,y,24,500,BRAND.ink);text(ctx,moneyText(a.amount),c.width-MARGIN-18,y,24,700,BRAND.ink,'right');y+=42}
   if(lastReceipt.remain>0){text(ctx,'Excédent non affecté',MARGIN+18,y,24,500,BRAND.muted);text(ctx,moneyText(lastReceipt.remain),c.width-MARGIN-18,y,24,700,BRAND.muted,'right');y+=42}
   y=Math.max(y+110,H-360);drawSignature(ctx,y,c.width);footer(ctx,c.width,H,'CHEBSEL • '+receiptNo,'Reçu enregistré le '+new Date().toLocaleString('fr-FR'));
   downloadCanvas(c,`Recu_CHEBSEL_${receiptNo}_${name}_${lastReceipt.date}`);
 };

 function financialRowsHeight(rows){return Math.max(1,rows.length)*54+70}
 function financialTable(ctx,title,rows,y,w,type){text(ctx,title,MARGIN,y,29,800,BRAND.navy);y+=45;const cols=[MARGIN,MARGIN+185,MARGIN+690,w-MARGIN];rounded(ctx,MARGIN,y,w-2*MARGIN,48,8,BRAND.navy);text(ctx,'Date',cols[0]+12,y+11,20,700,'#fff');text(ctx,type==='income'?'Source':'Motif',cols[1]+12,y+11,20,700,'#fff');text(ctx,type==='income'?'Référence':'Catégorie / Réf.',cols[2]+12,y+11,20,700,'#fff');text(ctx,'Montant',cols[3]-12,y+11,20,700,'#fff','right');y+=48;
   const use=rows.length?rows:[{date:'—',label:'Aucune entrée',reason:'Aucune dépense',reference:'',category:'',amount:0,empty:true}];
   use.forEach((r,i)=>{if(i%2===0){ctx.fillStyle=BRAND.soft;ctx.fillRect(MARGIN,y,w-2*MARGIN,54)}text(ctx,r.date||'—',cols[0]+12,y+14,19,500,BRAND.ink);text(ctx,type==='income'?(r.label||'Paiement'):(r.reason||'Dépense'),cols[1]+12,y+14,19,500,BRAND.ink);text(ctx,type==='income'?(r.reference||'—'):(r.category||r.reference||'—'),cols[2]+12,y+14,19,500,BRAND.ink);text(ctx,r.empty?'—':moneyText(r.amount),cols[3]-12,y+14,19,700,r.empty?BRAND.muted:(type==='income'?BRAND.green:BRAND.red),'right');line(ctx,MARGIN,y+54,w-MARGIN,y+54,BRAND.line,1);y+=54});return y+36}
 window.saveTreasuryReportJPEG=async function(){
   if(!['president','treasurer'].includes(role())){alert('Accès réservé au Président et au Trésorier.');return}
   try{renderTreasuryReport()}catch(e){}
   const r=treasuryReportData?.();if(!r){alert('Choisissez une période valide.');return}
   const H=Math.min(30000,760+financialRowsHeight(r.income)+financialRowsHeight(r.expenses)),W=1600,{c,ctx}=makeCanvas(W,H);let y=await header(ctx,'RAPPORT FINANCIER',`Période : ${r.from} au ${r.to}`,W);
   const boxW=(W-2*MARGIN-40)/3;[['Entrées',r.totalIn,BRAND.green],['Dépenses',r.totalOut,BRAND.red],['Solde net',r.net,BRAND.navy]].forEach((a,i)=>{const x=MARGIN+i*(boxW+20);rounded(ctx,x,y,boxW,120,16,BRAND.soft,BRAND.line);text(ctx,a[0],x+22,y+20,22,600,BRAND.muted);text(ctx,moneyText(a[1]),x+22,y+58,30,850,a[2])});y+=160;
   y=financialTable(ctx,'Entrées',r.income,y,W,'income');y=financialTable(ctx,'Dépenses',r.expenses,y,W,'expense');
   const signY=Math.min(H-210,y+70);line(ctx,MARGIN,signY,MARGIN+390,signY,BRAND.ink,1);line(ctx,W-MARGIN-390,signY,W-MARGIN,signY,BRAND.ink,1);text(ctx,'Président',MARGIN,signY+12,20,400,BRAND.muted);text(ctx,'Trésorier',W-MARGIN,signY+12,20,400,BRAND.muted,'right');footer(ctx,W,H,'CHEBSEL • Rapport financier','Généré le '+new Date().toLocaleString('fr-FR'));
   downloadCanvas(c,`Rapport_financier_CHEBSEL_${r.from}_${r.to}`);
 };

 function normalizeStatus(raw,perf=false){let s=String(raw||'').toUpperCase().trim();try{if(typeof normalizeAttendanceStatus==='function')s=normalizeAttendanceStatus(s,perf)}catch(e){}if(s==='R')s='RM';if(s==='A')s='AM';if(s==='ANM'&&perf)s='ANMP';return s}
 function punctualityData(){
   const from=document.getElementById('punctualityFrom')?.value,to=document.getElementById('punctualityTo')?.value;if(!from||!to)return null;let a=from,b=to;if(a>b)[a,b]=[b,a];
   const state=safeParse(ATT_KEY)||{},calls=(state.calls||[]).filter(c=>c.date&&c.date>=a&&c.date<=b),members=centralMembers().filter(m=>m.active!==false),rows=[];
   const totals={P:0,RM:0,RNM:0,AM:0,ANM:0,ANMP:0,marked:0,attended:0,late:0,absent:0};
   for(const m of members){const x={member:m,P:0,RM:0,RNM:0,AM:0,ANM:0,ANMP:0,marked:0};for(const call of calls){const rec=call.records?.[m.id];if(!rec?.status)continue;const s=normalizeStatus(rec.status,isPerformance(call));if(x[s]!==undefined)x[s]++;x.marked++}x.attended=x.P+x.RM+x.RNM;x.late=x.RM+x.RNM;x.absent=x.AM+x.ANM+x.ANMP;for(const k of ['P','RM','RNM','AM','ANM','ANMP'])totals[k]+=x[k];totals.marked+=x.marked;totals.attended+=x.attended;totals.late+=x.late;totals.absent+=x.absent;rows.push(x)}
   rows.sort((x,y)=>{const px=x.attended?x.P/x.attended:0,py=y.attended?y.P/y.attended:0;return py-px||fullName(x.member).localeCompare(fullName(y.member),'fr')});return {from:a,to:b,calls,members,rows,totals}
 }
 function reportTableHTML(d){return `<div class="profilePanel" id="punctualityPrintable"><h2 style="margin-top:0">Rapport de ponctualité CHEBSEL</h2><div class="memberMeta">Période : ${escapeHtml(d.from)} au ${escapeHtml(d.to)} • ${d.calls.length} activité(s)</div><div class="treasurySummary"><div class="mini"><b>${fmtPct(d.totals.attended,d.totals.marked)}</b><span>Présence</span></div><div class="mini"><b>${fmtPct(d.totals.P,d.totals.attended)}</b><span>Ponctualité</span></div><div class="mini"><b>${fmtPct(d.totals.late,d.totals.attended)}</b><span>Retards</span></div><div class="mini"><b>${fmtPct(d.totals.absent,d.totals.marked)}</b><span>Absences</span></div></div><div class="table-wrap"><table class="treasuryTable"><thead><tr><th>Membre</th><th>Act.</th><th>P</th><th>RM</th><th>RNM</th><th>AM</th><th>ANM</th><th>Présence</th><th>Ponctualité</th></tr></thead><tbody>${d.rows.map(x=>`<tr><td>${escapeHtml(fullName(x.member))}</td><td>${x.marked}</td><td>${x.P}</td><td>${x.RM}</td><td>${x.RNM}</td><td>${x.AM}</td><td>${x.ANM+x.ANMP}</td><td>${fmtPct(x.attended,x.marked)}</td><td>${fmtPct(x.P,x.attended)}</td></tr>`).join('')}</tbody></table></div></div>`}
 window.openPunctualityReport=function(){if(!punctualityAllowed()){alert('Accès réservé au Président et au Secrétaire.');return}const today=isoToday(),first=today.slice(0,8)+'01';document.getElementById('punctualityFrom').value=first;document.getElementById('punctualityTo').value=today;document.getElementById('punctualityReportView').classList.add('open');renderPunctualityReport()};
 window.closePunctualityReport=function(){document.getElementById('punctualityReportView')?.classList.remove('open')};
 window.renderPunctualityReport=function(){if(!punctualityAllowed())return;const d=punctualityData(),box=document.getElementById('punctualityReportBody');if(!d){box.innerHTML='<div class="empty">Choisissez une période valide.</div>';return}box.innerHTML=reportTableHTML(d)};
 window.savePunctualityReportJPEG=async function(){if(!punctualityAllowed()){alert('Accès réservé au Président et au Secrétaire.');return}const d=punctualityData();if(!d){alert('Choisissez une période valide.');return}const W=1800,rowH=58,H=Math.min(30000,720+Math.max(1,d.rows.length)*rowH),{c,ctx}=makeCanvas(W,H);let y=await header(ctx,'RAPPORT DE PONCTUALITÉ',`Période : ${d.from} au ${d.to} • ${d.calls.length} activité(s)`,W);
   const bw=(W-2*MARGIN-60)/4;[['Présence',fmtPct(d.totals.attended,d.totals.marked)],['Ponctualité',fmtPct(d.totals.P,d.totals.attended)],['Retards',fmtPct(d.totals.late,d.totals.attended)],['Absences',fmtPct(d.totals.absent,d.totals.marked)]].forEach((a,i)=>{const x=MARGIN+i*(bw+20);rounded(ctx,x,y,bw,110,14,BRAND.soft,BRAND.line);text(ctx,a[0],x+18,y+18,20,600,BRAND.muted);text(ctx,a[1],x+18,y+54,30,850,BRAND.navy)});y+=150;
   const xs=[MARGIN,MARGIN+520,MARGIN+625,MARGIN+710,MARGIN+805,MARGIN+900,MARGIN+995,MARGIN+1115,MARGIN+1365,W-MARGIN];rounded(ctx,MARGIN,y,W-2*MARGIN,50,8,BRAND.navy);['Membre','Act.','P','RM','RNM','AM','ANM','Présence','Ponctualité'].forEach((h,i)=>text(ctx,h,xs[i]+10,y+13,18,700,'#fff'));y+=50;
   const rows=d.rows.length?d.rows:[{member:{first:'Aucune donnée',last:''},marked:0,P:0,RM:0,RNM:0,AM:0,ANM:0,ANMP:0,attended:0}];for(let i=0;i<rows.length;i++){const x=rows[i];if(i%2===0){ctx.fillStyle=BRAND.soft;ctx.fillRect(MARGIN,y,W-2*MARGIN,rowH)}const vals=[fullName(x.member),x.marked,x.P,x.RM,x.RNM,x.AM,x.ANM+x.ANMP,fmtPct(x.attended,x.marked),fmtPct(x.P,x.attended)];vals.forEach((v,j)=>text(ctx,v,xs[j]+10,y+17,j===0?18:17,j===0?650:500,BRAND.ink));line(ctx,MARGIN,y+rowH,W-MARGIN,y+rowH,BRAND.line,1);y+=rowH}
   footer(ctx,W,H,'CHEBSEL • Rapport de ponctualité','Généré le '+new Date().toLocaleString('fr-FR'));downloadCanvas(c,`Rapport_ponctualite_CHEBSEL_${d.from}_${d.to}`)};

 function updatePunctualityVisibility(){const b=document.getElementById('punctualityLaunchCard');if(b)b.classList.toggle('role-hidden',!punctualityAllowed())}
 if(typeof applyRoleVisibility==='function'){const base=applyRoleVisibility;window.applyRoleVisibility=applyRoleVisibility=function(){const x=base.apply(this,arguments);updatePunctualityVisibility();return x}}
 window.addEventListener('DOMContentLoaded',updatePunctualityVisibility);
})();
