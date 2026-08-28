const CACHE_NAME='chebsel-pwa-stable-v1178';
const APP_SHELL=[
 './',
 './index.html',
 './manifest.webmanifest',
 './js/bootstrap.js',
 './js/sync-policy.js',
 './js/report-images.js',
 './js/institutional-ops.js',
 './js/corrections-1131.js',
 './js/stability-1132.js',
 './js/payment-reason-history-1133.js',
 './js/closing-canonical-1134.js',
 './js/monthly-governance-1140.js',
 './js/notification-routing-1142.js',
 './js/deletion-1141.js',
 './js/reports-center-1150.js',
 './js/role-shell-1160.js',
 './js/clean-shell-1170.js',
 './js/secretary-scope-1171.js',
 './js/treasurer-scope-1173.js',
 './js/hotfix-1175.js',
 './js/president-scope-1176.js',
 './js/president-scope-1178.js',
 './js/update-manager-1177.js',
 './js/strict-role-ui-1161.js',
 './js/auth-security.js',
 './js/legacy-core.js',
 './js/embedded-apps.js',
 './css/app.css',
 './icons/chebsel-logo.png',
 './icons/icon-192.png',
 './icons/icon-512.png',
 './icons/icon-maskable-512.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});clients.forEach(c=>c.postMessage({type:'CHEBSEL_UPDATE_ACTIVE',version:'1.17.7'}));})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
