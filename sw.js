const staticCacheName = 'udacity-mws-p1-9';

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(staticCacheName)
      .then(cache =>
        cache.addAll([
          'css/styles.css',
          'js/dbhelper.js',
          'js/restaurant_info.js',
          'data/restaurants.json',
          'index.html',
          'restaurant.html',
          '/'
        ])
      )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [staticCacheName];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(respondWithImg(event.request.url));
      return;
    }
  }

  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          return caches.open(staticCacheName).then(cache => {
            if (event.request.url.indexOf('test') < 0) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          });
        });
      })
      .catch(() => {
        // Do nothing for now :/
      })
  );
});

function respondWithImg (request) {
    var storedUrl = request.replace(/_\dx\.jpg$/, '');
    return caches.open(staticCacheName).then(cache => {
      return cache.match(storedUrl).then(response => {
        return (
          response ||
          fetch(request).then(networkResponse => {
            cache.put(storedUrl, networkResponse.clone());
            return networkResponse;
          })
        );
      });
    })
}