'use strict';
const PREFIX='last-window-'+self.registration.scope;
const CACHE=PREFIX+'v1.0.2';
const FILES=['./','index.html','styles.css','app.js','story-data.js','story.txt','manifest.webmanifest','assets/cover.webp','assets/control-room.webp','assets/expedition.webp','assets/dawn.webp','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);await self.clients.claim();for(const client of await self.clients.matchAll())client.postMessage({type:'BOOK_CACHED'});})()));
self.addEventListener('message',event=>{if(event.data?.type==='CACHE_STATUS')event.waitUntil((async()=>{const cache=await caches.open(CACHE);const checks=await Promise.all(FILES.map(file=>cache.match(new URL(file,self.registration.scope).href)));if(checks.every(Boolean))event.source?.postMessage({type:'BOOK_CACHED'});})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(event.request,{ignoreSearch:true});if(cached)return cached;try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate')return await cache.match('index.html');throw error;}})());});
