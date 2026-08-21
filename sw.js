const C='chebsel-pwa-logo-v2',A=['./','./index.html','./manifest.webmanifest','./icons/chebsel-logo.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{let y=x.clone();caches.open(C).then(c=>c.put(e.request,y));return x}).catch(()=>caches.match('./index.html'))))});
