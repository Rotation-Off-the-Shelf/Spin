/* Rotation: Service Worker. Version bei jeder Änderung der App erhöhen. */
var VERSION='rotation-v3';
var SHELL=['./','index.html','impressum.html','datenschutz.html','legal.css','fonts.css','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png',
  'fonts/bricolage-grotesque-latin-700-normal.woff2','fonts/instrument-sans-latin-400-normal.woff2','fonts/instrument-sans-latin-500-normal.woff2','fonts/instrument-sans-latin-600-normal.woff2',
  'fonts/jetbrains-mono-latin-400-normal.woff2','fonts/jetbrains-mono-latin-500-normal.woff2'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==VERSION}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return; /* Discogs und alles Fremde geht direkt ans Netz */
  /* Seiten: erst Netz (damit Updates ankommen), sonst Cache */
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(r){
      var copy=r.clone();caches.open(VERSION).then(function(c){c.put(req,copy)});return r;
    }).catch(function(){
      return caches.match(req,{ignoreSearch:true}).then(function(hit){return hit||caches.match('./')||caches.match('index.html')});
    }));
    return;
  }
  /* Übrige eigene Dateien: Cache zuerst */
  e.respondWith(caches.match(req).then(function(hit){return hit||fetch(req)}));
});
