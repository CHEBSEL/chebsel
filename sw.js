const CACHE_NAME='chebsel-pwa-stable-v1133';
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
 './js/auth-security.js',
 './js/legacy-core.js',
 './js/embedded-apps.js',
 './css/app.css',
 './icons/chebsel-logo.png',
 './icons/icon-192.png',
 './icons/icon-512.png',
 './icons/icon-maskable-512.png'
];

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
 self.skipWaiting();
});

self.addEventListener('activate',event=>{
 event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
 );
 self.clients.claim();
});

self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 event.respondWith(
  fetch(event.request,{cache:'no-store'})
   .then(response=>{
    const copy=response.clone();
    caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
    return response;
   })
   .catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html')))
 );
});

self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
