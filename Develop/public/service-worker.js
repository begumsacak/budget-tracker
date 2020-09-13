const FILES_TO_CACHE = [
    '/',
    '/index.js',
    '/manifest.webmanifest',
    '/styles.css',
    // images are in the manifest so no need to add them here
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";

//
// install
// self.addEventListener("install", function (evt) {
//     // pre cache image data
//     evt.waitUntil(
//       caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/images"))
//       );
      
//     // pre cache all static assets
//     evt.waitUntil(
//       caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
//     );
  
//     // tell the browser to activate this service worker immediately once it
//     // has finished installing
//     self.skipWaiting();
//   });
  
  //Activate 

  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

  // Fetch

  self.addEventListener("fetch", function(evt) {
    // cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }

    // if the request is not for the API, serve static assets using "offline-first" approach.
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
});
