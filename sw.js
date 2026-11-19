'use strict';
const PREFIX='last-window-'+self.registration.scope;
const CACHE=PREFIX+'v1.5.0-controls-below-story';
const FILES=['./','index.html','styles.css','app.js','story-data.js','story.txt','manifest.webmanifest','assets/cover.webp','assets/control-room.webp','assets/expedition.webp','assets/dawn.webp','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);await self.clients.claim();for(const client of await self.clients.matchAll())client.postMessage({type:'BOOK_CACHED'});})()));
self.addEventListener('message',event=>{if(event.data?.type==='CACHE_STATUS')event.waitUntil((async()=>{const cache=await caches.open(CACHE);const checks=await Promise.all(FILES.map(file=>cache.match(new URL(file,self.registration.scope).href)));if(checks.every(Boolean))event.source?.postMessage({type:'BOOK_CACHED'});})());});

// Chrome on Android requests portions of MP3 files using HTTP Range.
// A cached full 200 response must be converted into a proper 206 response.
async function rangedResponse(fullResponse, rangeHeader) {
  const bytes = await fullResponse.arrayBuffer();
  const total = bytes.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match || (!match[1] && !match[2])) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`}});
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`}});
    start = Math.max(0,total-suffix); end=total-1;
  } else {
    start=Number(match[1]); end=match[2] ? Number(match[2]) : total-1;
  }
  if (!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=total||end<start)
    return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`}});
  end=Math.min(end,total-1);
  const headers=new Headers(fullResponse.headers);
  headers.set('Content-Range',`bytes ${start}-${end}/${total}`);
  headers.set('Content-Length',String(end-start+1));
  headers.set('Accept-Ranges','bytes');
  headers.set('Content-Type',fullResponse.headers.get('Content-Type')||'audio/mpeg');
  headers.delete('Content-Encoding');
  return new Response(bytes.slice(start,end+1),{status:206,statusText:'Partial Content',headers});
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const range=event.request.headers.get('Range');
    // Range requests must not be satisfied with an unmodified cached 200 response.
    const cached=await cache.match(event.request.url,{ignoreSearch:true});
    if(cached) return range ? rangedResponse(cached,range) : cached;
    try{
      const response=await fetch(event.request);
      const isAudio=/\/audio\/page-\d{2}\.mp3$/.test(new URL(event.request.url).pathname);
      // Cache only complete MP3s, never a partial (206) response.
      if(isAudio && response.status===200) await cache.put(event.request.url,response.clone());
      return response;
    }catch(error){
      if(event.request.mode==='navigate')return await cache.match('index.html');
      throw error;
    }
  })());
});
