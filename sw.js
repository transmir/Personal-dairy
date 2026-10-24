// Offline shell for the diary. Diary data itself always goes to the network (Google Apps Script) and is never cached here.
const V='diary-shell-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const sameOrigin=u.origin===location.origin;
  const staticCdn=/(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(u.host);
  if(!sameOrigin&&!staticCdn)return; // Apps Script / everything else: straight to network
  if(r.mode==='navigate'){ // page: network first, fall back to cached copy when offline
    e.respondWith(fetch(r).then(res=>{const copy=res.clone();caches.open(V).then(c=>c.put(r,copy));return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.open(V).then(async c=>{ // assets: stale-while-revalidate
    const hit=await c.match(r);
    const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res;}).catch(()=>hit);
    return hit||net;
  }));
});
