const CACHE_NAME = "askesis-v4";
const ASSETS = [
  "./", "./index.html", "./style.css", "./data.js", "./quotes.js", "./ritual.js", "./destino.js", "./app.js", "./firebase-config.js",
  "./manifest.json", "./vendor/xlsx.full.min.js", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./favicon.svg", "./favicon-32.png", "./favicon-48.png",
  "./fonts/libre-caslon-text-latin-400-normal.woff2",
  "./fonts/jost-latin-400-normal.woff2", "./fonts/jost-latin-500-normal.woff2", "./fonts/jost-latin-600-normal.woff2",
];
const FIREBASE_ASSETS = [
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js",
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("firestore.googleapis.com") || event.request.url.includes("identitytoolkit.googleapis.com")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          if (FIREBASE_ASSETS.some((u) => event.request.url.startsWith(u.split("/firebasejs/")[0])) ||
              ASSETS.some((a) => event.request.url.endsWith(a.replace("./", "")))) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
