const CACHE_NAME = "rankers-nest-v8";
const FILES = [
  "./",
  "./index.html",
  "./neet-physics-online-classes.html",
  "./jee-physics-online-classes.html",
  "./online-physics-classes.html",
  "./manifest.json",
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
  "./icon.svg"
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
