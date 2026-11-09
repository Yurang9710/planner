const C='planner-v3';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// 같은 사이트 파일은 "최신 먼저, 오프라인이면 저장본" 방식. 외부(클라우드 연동) 요청은 건드리지 않음.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(new URL(e.request.url).origin!==self.location.origin)return;
  const fallback=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')).then(r=>r||new Response('오프라인이에요. 인터넷에 연결한 뒤 한 번 열어 주세요.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}));
  e.respondWith(new Promise(res=>{
    let done=false;
    const t=setTimeout(()=>{caches.match(e.request,{ignoreSearch:true}).then(r=>{if(r&&!done){done=true;res(r)}})},4000);
    fetch(e.request.url,{cache:'no-cache'}).then(r=>{
      clearTimeout(t);
      if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}
      if(!done){done=true;res(r)}
    }).catch(()=>{clearTimeout(t);if(!done){done=true;fallback().then(res)}});
  }));
});
