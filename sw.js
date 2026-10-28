const C='planner-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.open(C).then(c=>c.match(e.request,{ignoreSearch:true}).then(r=>{
    const f=fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res}).catch(()=>r||c.match('./index.html'));
    return r||f;
  })));
});
