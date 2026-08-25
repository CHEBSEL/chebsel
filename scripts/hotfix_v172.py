from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Version/title/badge
s=s.replace('CHEBSEL v1.7.1 — Centre de gestion','CHEBSEL v1.7.2 — Centre de gestion')
s=s.replace("const APP_VERSION='1.7.1';","const APP_VERSION='1.7.2';")
s=s.replace('<span class="versionChip">v1.6.0</span>','<span class="versionChip">v1.7.2</span>')

old=""" if(paymentRows.length){const {error}=await client.from('payments').upsert(paymentRows,{onConflict:'id'});if(error)throw error}
 const allocRows=[];
 for(const p of payments){if(!p.syncId)continue;for(const al of p.alloc||[]){const e=entryByLegacy.get(String(al.entryId||''));if(!e||!e.syncId||Number(al.amount||0)<=0)continue;allocRows.push({id:al.syncId,organization_id:org,payment_id:p.syncId,financial_entry_id:e.syncId,amount:Number(al.amount||0)})}}
 if(allocRows.length){const {error}=await client.from('payment_allocations').upsert(allocRows,{onConflict:'id'});if(error)throw error}
"""
new=""" if(paymentRows.length){const {error}=await client.from('payments').upsert(paymentRows,{onConflict:'id'});if(error)throw error}
 const cancelledPaymentIds=payments.filter(p=>p.syncId&&p.status==='cancelled').map(p=>p.syncId);
 if(cancelledPaymentIds.length){const {error}=await client.from('payment_allocations').delete().in('payment_id',cancelledPaymentIds);if(error)throw error}
 const allocRows=[];
 for(const p of payments){if(!p.syncId||p.status==='cancelled')continue;for(const al of p.alloc||[]){const e=entryByLegacy.get(String(al.entryId||''));if(!e||!e.syncId||Number(al.amount||0)<=0)continue;allocRows.push({id:al.syncId,organization_id:org,payment_id:p.syncId,financial_entry_id:e.syncId,amount:Number(al.amount||0)})}}
 if(allocRows.length){const {error}=await client.from('payment_allocations').upsert(allocRows,{onConflict:'id'});if(error)throw error}
"""
if old not in s:
    raise SystemExit('push finance allocation block not found')
s=s.replace(old,new,1)

old2="const paidByEntry=new Map();for(const a of allocs||[])paidByEntry.set(a.financial_entry_id,(paidByEntry.get(a.financial_entry_id)||0)+Number(a.amount||0));"
new2="const activePaymentIds=new Set((payments||[]).filter(p=>p.status!=='cancelled').map(p=>p.id));const paidByEntry=new Map();for(const a of allocs||[]){if(!activePaymentIds.has(a.payment_id))continue;paidByEntry.set(a.financial_entry_id,(paidByEntry.get(a.financial_entry_id)||0)+Number(a.amount||0))}"
if old2 not in s:
    raise SystemExit('pull finance paidByEntry block not found')
s=s.replace(old2,new2,1)

p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
t=sw.read_text(encoding='utf-8')
import re
t=re.sub(r"const CACHE_NAME='chebsel-pwa-stable-v\d+';","const CACHE_NAME='chebsel-pwa-stable-v172';",t,count=1)
sw.write_text(t,encoding='utf-8')
