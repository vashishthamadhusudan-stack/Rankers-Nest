/* Firebase Cloud Messaging background notifications. Public web-app config only. */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");
firebase.initializeApp({
  apiKey: "AIzaSyAbq6uqAZkq4f3fmORjIReufbgP5-PPT1M",
  authDomain: "rankets-nest.firebaseapp.com",
  projectId: "rankets-nest",
  storageBucket: "rankets-nest.firebasestorage.app",
  messagingSenderId: "703058556884",
  appId: "1:703058556884:web:001203e8e9f2c0ffbe8841",
  measurementId: "G-TQHGGPEZXJ"
});
const rnMessaging = firebase.messaging();
rnMessaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = notification.title || data.title || "Rankers Nest — New Update";
  const options = {
    body: notification.body || data.body || "A new Physics resource is available.",
    icon: "./icon.svg",
    badge: "./icon.svg",
    data: { url: data.url || "./#site-updates" },
    tag: data.tag || "rankers-nest-update",
    renotify: false
  };
  return self.registration.showNotification(title, options);
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "./#site-updates", self.location.href).href;
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(windowClients => {
    for (const client of windowClients) {
      if (client.url === target && "focus" in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(target);
  }));
});

const CACHE_NAME = "rankers-nest-v17";
const FILES = [
  "./",
  "./index.html",
  "./neet-physics-online-classes.html",
  "./physics-weakness-scanner.html",
  "./physics-diagnostic-lab.html",
  "./todays-physics-challenge.html",
  "./electrostatics-practice-paper-01.html",
  "./complete-physics-roadmap.html",
  "./jee-physics-diagnostic.html",
  "./neet-physics-diagnostic.html",
  "./jee-physics-online-classes.html",
  "./online-physics-classes.html",
  "./manifest.json",
  "./site-updates.json",
  "./student-dashboard.html",
  "./daily-practice.html",
  "./video-library.html",
  "./weekly-challenge.html",
  "./quality-check.html",
  "./pyq-solutions.html",
  "./jee-main.html",
  "./jee-advanced.html",
  "./neet-physics.html",
  "./neet-magnetism-pyq.html",
  "./neet-moving-charges-magnetism-pyq-test.html",
  "./neet-magnetism-and-matter-pyq-test.html",
  "./neet-rotational-dynamics-pyq.html",
  "./current-electricity-neet-pyq.html",
  "./national-talent-hunt.html",
  "./rankers_nest_neet_physics_test.html",
  "./neet_rotation_shm_test.html",
  "./jee_main_conservation_of_momentum.html",
  "./online-physics-classes.html",
  "./jee-physics-online-classes.html",
  "./neet-physics-online-classes.html",
  "./premium.css?v=20261020",
  "./icon.svg",
  "./madhusudan-vashishtha.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(response =>
        response || (event.request.mode === "navigate"
          ? caches.match("./index.html")
          : undefined)
      )
    )
  );
});
