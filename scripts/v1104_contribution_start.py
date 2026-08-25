from pathlib import Path
import re
p=Path('index.html'); s=p.read_text(encoding='utf-8')
assert "const APP_VERSION='1.10.3'" in s
s=s.replace('CHEBSEL v1.10.3 — Centre de gestion','CHEBSEL v1.10.4 — Centre de gestion').replace("const APP_VERSION='1.10.3';","const APP_VERSION='1.10.4';")
needle='  <div><label>Téléphone</label><input id="mPhone" inputmode="tel"></div>\n  <div><label>Statut</label>'
assert needle in s
s=s.replace(needle,'  <div><label>Téléphone</label><input id="mPhone" inputmode="tel"></div>\n  <div><label>Mwa kòmansman kotizasyon</label><input id="mContributionStart" type="month"><div class="memberMeta">Premye mwa manm sa a dwe kòmanse peye kotizasyon mansyèl.</div></div>\n  <div><label>Statut</label>',1)
s=s.replace("mPhone.value=m?.phone||'';mActive.value=String(m?.active??true)","mPhone.value=m?.phone||'';mContributionStart.value=m?.contributionStartMonth||String(m?.joinedAt||'').slice(0,7)||new Date().toISOString().slice(0,7);mActive.value=String(m?.active??true)")
s=s.replace("phone:mPhone.value.trim(),active:mActive.value==='true'","phone:mPhone.value.trim(),contributionStartMonth:mContributionStart.value||new Date().toISOString().slice(0,7),active:mActive.value==='true'")
old="function cloudMemberPayload(m,org){return {id:m.syncId,organization_id:org,legacy_id:m.id||null,member_no:m.no||null,first_name:m.first||'',last_name:m.last||'',phone:m.phone||null,active:m.active!==false,notes:m.note||null,updated_at:syncNowISO(),deleted_at:m._deletedAt||null}}"
new="function cloudMemberPayload(m,org){return {id:m.syncId,organization_id:org,legacy_id:m.id||null,member_no:m.no||null,first_name:m.first||'',last_name:m.last||'',phone:m.phone||null,active:m.active!==false,notes:m.note||null,contribution_start_month:m.contributionStartMonth||null,updated_at:syncNowISO(),deleted_at:m._deletedAt||null}}"
assert old in s; s=s.replace(old,new,1)
s=s.replace("note:r.notes||'',_serverUpdatedAt:r.updated_at","note:r.notes||'',contributionStartMonth:r.contribution_start_month||cur.contributionStartMonth||'',_serverUpdatedAt:r.updated_at")
s=s.replace("note:r.notes||'',category:'Membre'","note:r.notes||'',contributionStartMonth:r.contribution_start_month||'',category:'Membre'")
s=s.replace("const MONTHLY_DUE_START='2026-08';\nconst MONTHLY_DUE_AMOUNT=125;","const MONTHLY_DUE_AMOUNT=125;\nfunction currentMonthYM(){return new Date().toISOString().slice(0,7)}\nfunction memberContributionStart(m){return String(m?.contributionStartMonth||m?.joinedAt||currentMonthYM()).slice(0,7)}")
s=re.sub(r"function completedMonthsSinceStart\(\)\{.*?\n\}","function completedMonthsSinceStart(){const ms=centralMembers().filter(m=>m.active!==false).map(memberContributionStart).filter(Boolean).sort();if(!ms.length)return [];const last=monthBefore(currentMonthYM()),out=[];let ym=ms[0];while(ym<=last){out.push(ym);ym=nextMonth(ym)}return out}",s,count=1,flags=re.S)
pat=r"function ensureCompletedMonthlyDebts\(\)\{.*?\n\}\nfunction ensureMonthBeforeClosing\(ym\)\{.*?\n\}"
rep="""function ensureCompletedMonthlyDebts(){const last=monthBefore(currentMonthYM()),f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const members=centralMembers().filter(m=>m.active!==false);let created=0,months=new Set();for(const m of members){let ym=memberContributionStart(m);while(ym&&ym<=last){if(!monthlyEntryFor(f.entries,m.id,ym)){f.entries.push({id:`monthly-${ym}-${m.id}`,memberId:m.id,type:'monthly',typeLabel:`Cotisation mensuelle — ${monthLabelFR(ym)}`,date:`${ym}-01`,due:MONTHLY_DUE_AMOUNT,paid:0,paidDate:'',autoMonthly:true,sourceMonth:ym,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});created++;months.add(ym)}ym=nextMonth(ym)}}if(created)saveJSON(FIN_KEY,f);return {created,months:Array.from(months)}}
function ensureMonthBeforeClosing(ym){if(!ym)return;const f=safeParse(FIN_KEY)||{};if(!Array.isArray(f.entries))f.entries=[];const members=centralMembers().filter(m=>m.active!==false&&memberContributionStart(m)<=ym);let created=0;for(const m of members){if(monthlyEntryFor(f.entries,m.id,ym))continue;f.entries.push({id:`monthly-${ym}-${m.id}`,memberId:m.id,type:'monthly',typeLabel:`Cotisation mensuelle — ${monthLabelFR(ym)}`,date:`${ym}-01`,due:MONTHLY_DUE_AMOUNT,paid:0,paidDate:'',autoMonthly:true,sourceMonth:ym,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});created++}if(created)saveJSON(FIN_KEY,f)}"""
s,n=re.subn(pat,rep,s,count=1,flags=re.S); assert n==1
assert 'MONTHLY_DUE_START' not in s and 'mContributionStart' in s and 'contribution_start_month' in s
p.write_text(s,encoding='utf-8')
