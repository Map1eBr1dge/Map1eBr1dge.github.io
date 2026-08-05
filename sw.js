// 四时工坊 Service Worker —— 离线缓存
const CACHE = 'zep4yrs-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/projects.html',
  '/capabilities.html',
  '/pipeline.html',
  '/bulletin.html',
  '/contact.html',
  '/demos.html',
  '/404.html',
  '/assets/css/mimo.css',
  '/assets/js/mimo.js',
  '/assets/svg/logo-zep4yrs.svg',
  '/manifest.json',
  '/feed.xml'
];

// 安装：预缓存核心资源
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 拦截请求：stale-while-revalidate
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const respClone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, respClone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
