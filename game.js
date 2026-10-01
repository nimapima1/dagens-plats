(function () {
  "use strict";

  var cfg = window.GAME_CONFIG || {};
  var LOCS = window.LOCATIONS;
  var STORAGE_KEY = "dagensplats.v1";
  var MAX_SCORE = 5000;
  var SCALE_KM = 2000; // högre värde = mer förlåtande poängsättning

  function $(id) { return document.getElementById(id); }

  // ---------- Vilken dag / vilken plats? ----------

  function utcDay(y, m, d) { return Math.floor(Date.UTC(y, m, d) / 86400000); }
  function todayIndex() {
    var n = new Date();
    return utcDay(n.getFullYear(), n.getMonth(), n.getDate());
  }
  var sp = (cfg.START_DATE || "2026-10-01").split("-").map(Number);
  var START = utcDay(sp[0], sp[1] - 1, sp[2]);

  // Ordningen blandas med ett fast frö (SHUFFLE_SEED i config.js), så att alla spelare får samma
  // plats samma dag. Ingen plats upprepas förrän hela listan har visats, sedan blandas den om.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function orderForCycle(n, cycle) {
    var seed = cfg.SHUFFLE_SEED === undefined ? 2026 : cfg.SHUFFLE_SEED;
    var idx = [], i;
    for (i = 0; i < n; i++) idx.push(i);
    var rnd = mulberry32(seed + cycle * 7919);
    for (i = n - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
    }
    // Samma plats får inte komma två dagar i rad när listan börjar om
    if (cycle > 0 && n > 1) {
      var prevLast = orderForCycle(n, cycle - 1)[n - 1];
      if (idx[0] === prevLast) { var t = idx[0]; idx[0] = idx[1]; idx[1] = t; }
    }
    return idx;
  }
  function locationIndexForDay(day) {
    var n = LOCS.length, d = day - 1;
    var cycle = Math.floor(d / n), pos = ((d % n) + n) % n;
    return orderForCycle(n, cycle)[pos];
  }

  // Testparametrar (statistiken påverkas inte). De fungerar BARA när sidan körs lokalt
  // (localhost), och ignoreras på den publicerade sidan:
  //   ?dag=3    visar den tredje dagens plats i den blandade ordningen
  //   ?plats=3  visar plats nummer 3 i locations.js, oavsett blandning
  //   ?from=250,90  provar en annan startpunkt i Street View (avstånd i meter, väderstreck)
  var isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var params = new URLSearchParams(isLocalHost ? location.search : "");
  var testDay = parseInt(params.get("dag"), 10);
  var testPlace = parseInt(params.get("plats"), 10);
  var isTest = isFinite(testDay) || isFinite(testPlace);
  var dayNumber = isFinite(testDay) ? testDay : (isTest ? 1 : Math.max(1, todayIndex() - START + 1));
  var loc = isFinite(testPlace)
    ? LOCS[(((testPlace - 1) % LOCS.length) + LOCS.length) % LOCS.length]
    : LOCS[locationIndexForDay(dayNumber)];

  // ---------- Sparad data ----------

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (s && s.stats && s.results) return s;
    } catch (e) {}
    return { seenHelp: false, stats: { played: 0, totalScore: 0, streak: 0, bestStreak: 0, lastDay: 0 }, results: {} };
  }
  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  var data = load();

  // ---------- Geometri ----------

  function rad(d) { return d * Math.PI / 180; }
  function deg(r) { return r * 180 / Math.PI; }

  function haversineKm(a, b) {
    var R = 6371;
    var dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function bearing(a, b) {
    var f1 = rad(a.lat), f2 = rad(b.lat), dl = rad(b.lng - a.lng);
    var y = Math.sin(dl) * Math.cos(f2);
    var x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
    return (deg(Math.atan2(y, x)) + 360) % 360;
  }
  function destination(p, meters, brg) {
    var d = meters / 6371000, t = rad(brg), f1 = rad(p.lat), l1 = rad(p.lng);
    var f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(t));
    var l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
    return { lat: deg(f2), lng: deg(l2) };
  }
  function scoreFor(km) {
    if (km < 0.2) return MAX_SCORE;
    return Math.round(MAX_SCORE * Math.exp(-km / SCALE_KM));
  }
  function fmtDist(km) {
    if (km < 1) return Math.round(km * 1000) + " m";
    return Math.round(km).toLocaleString("sv-SE") + " km";
  }
  function fmtNum(n) { return Math.round(n).toLocaleString("sv-SE"); }

  // ---------- Street View ----------

  function showDemo(note, tag) {
    $("pano").hidden = true;
    $("demo").hidden = false;
    $("demoTag").textContent = tag || "Demoläge";
    $("demoClue").textContent = "Ledtråd: " + loc.clue;
    $("demoNote").textContent = note;
    $("resetView").hidden = true;
  }

  function loadGoogle(key) {
    return new Promise(function (resolve, reject) {
      if (window.google && window.google.maps) return resolve();
      window.__gmReady = resolve;
      window.gm_authFailure = function () {
        showDemo("Google avvisade API-nyckeln. Kontrollera att Maps JavaScript API är aktiverat och att nyckelns domänbegränsning stämmer.", "Nyckelfel");
      };
      var s = document.createElement("script");
      s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) +
        "&v=weekly&loading=async&language=sv&callback=__gmReady";
      s.async = true;
      s.onerror = function () { reject(new Error("Kunde inte ladda Google Maps")); };
      document.head.appendChild(s);
    });
  }

  async function initStreetView() {
    var key = (cfg.GOOGLE_MAPS_API_KEY || "").trim();
    if (!key) {
      showDemo("Ingen Google-nyckel inlagd i config.js. Lägg in en för att visa riktig Street View.");
      return;
    }
    try {
      await loadGoogle(key);
      var lib = await google.maps.importLibrary("streetView");
      var fromOverride = (params.get("from") || "").split(",").map(Number);
      var from = fromOverride.length === 2 && fromOverride.every(isFinite)
        ? { dist: fromOverride[0], bearing: fromOverride[1] } : loc.from;
      var start = destination(loc, from.dist, from.bearing);
      var res = await new lib.StreetViewService().getPanorama({
        location: start,
        radius: 250,
        preference: lib.StreetViewPreference ? lib.StreetViewPreference.NEAREST : undefined,
        sources: ["google", "outdoor"] // bara Googles egna utomhusbilder, inga användaruppladdade eller inomhus
      });
      var p = res.data.location;
      var pos = { lat: p.latLng.lat(), lng: p.latLng.lng() };
      var pov = { heading: bearing(pos, loc), pitch: 8 };
      var pano = new lib.StreetViewPanorama($("pano"), {
        pano: p.pano,
        pov: pov,
        zoom: loc.zoom || 0,
        addressControl: false,   // dölj adress/plats-text
        showRoadLabels: false,   // dölj gatunamn
        fullscreenControl: false,
        motionTracking: false,
        enableCloseButton: false,
        linksControl: !!cfg.ALLOW_MOVE,
        clickToGo: !!cfg.ALLOW_MOVE,
        panControl: true,
        zoomControl: true
      });
      $("resetView").hidden = false;
      $("resetView").onclick = function () {
        pano.setPano(p.pano);
        pano.setPov(pov);
        pano.setZoom(loc.zoom || 0);
      };
    } catch (e) {
      showDemo("Hittade ingen Street View-bild vid platsen, eller Google kunde inte nås (" + (e && e.message ? e.message : "okänt fel") + ").", "Ingen bild");
    }
  }

  // ---------- Gissningskarta (Leaflet + OpenStreetMap) ----------

  var map = L.map("map", { worldCopyJump: true, minZoom: 2, zoomControl: true }).setView([30, 10], 2);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  function pinIcon(kind) {
    return L.divIcon({ className: "", html: '<div class="pin ' + kind + '"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  }

  var guessMarker = null;
  var locked = false;

  map.on("click", function (e) {
    if (locked) return;
    var ll = e.latlng.wrap();
    if (!guessMarker) guessMarker = L.marker(ll, { icon: pinIcon("guess") }).addTo(map);
    else guessMarker.setLatLng(ll);
    $("guessBtn").disabled = false;
    $("hint").textContent = "Klicka igen för att flytta markören.";
  });

  function lockMap() {
    locked = true;
    $("map").classList.add("locked");
    $("guessBtn").hidden = true;
    $("showResultBtn").hidden = false;
    $("hint").textContent = "Grön = rätt plats, röd = din gissning.";
  }

  function drawResult(res) {
    var guess = L.latLng(res.lat, res.lng);
    var target = L.latLng(loc.lat, loc.lng);
    if (!guessMarker) guessMarker = L.marker(guess, { icon: pinIcon("guess") }).addTo(map);
    else guessMarker.setLatLng(guess);
    L.marker(target, { icon: pinIcon("target") }).addTo(map);
    L.polyline([guess, target], { color: "#d9382b", weight: 3, dashArray: "6 8" }).addTo(map);
    map.fitBounds(L.latLngBounds([guess, target]), { padding: [50, 50], maxZoom: 14 });
    lockMap();
  }

  // ---------- Resultat ----------

  function renderStats() {
    var s = data.stats;
    $("stPlayed").textContent = s.played;
    $("stAvg").textContent = s.played ? fmtNum(s.totalScore / s.played) : 0;
    $("stStreak").textContent = s.streak;
    $("stBest").textContent = s.bestStreak;
  }

  function shareText(res) {
    var filled = Math.max(0, Math.min(5, Math.round(res.score / 1000)));
    var bar = "🟩".repeat(filled) + "⬜".repeat(5 - filled);
    return "Dagens Plats #" + dayNumber + " 📍\n" + bar + " " + fmtNum(res.score) + " / 5 000\n" +
      (res.dist < 1 ? "Rakt på!" : "Jag var " + fmtDist(res.dist) + " ifrån.") + "\n" +
      location.origin + location.pathname;
  }

  function openModal(id) { $(id).hidden = false; }
  function closeModal(el) { el.hidden = true; }

  var nextTimer = null;
  function startCountdown() {
    if (isTest) { $("nextIn").textContent = "Testläge – statistiken påverkas inte."; return; }
    function tick() {
      var n = new Date();
      var next = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
      var s = Math.max(0, Math.floor((next - n) / 1000));
      var p = function (x) { return String(x).padStart(2, "0"); };
      $("nextIn").textContent = "Nästa plats om " + p(Math.floor(s / 3600)) + ":" + p(Math.floor(s / 60) % 60) + ":" + p(s % 60);
    }
    tick();
    clearInterval(nextTimer);
    nextTimer = setInterval(tick, 1000);
  }

  function showResult(res) {
    $("resName").textContent = loc.name;
    $("resPlace").textContent = loc.place;
    $("resDist").textContent = fmtDist(res.dist);
    $("resScore").textContent = fmtNum(res.score);
    $("resFact").textContent = loc.fact;
    renderStats();
    startCountdown();
    $("shareBtn").onclick = function () {
      var txt = shareText(res), btn = $("shareBtn");
      var done = function () { btn.textContent = "Kopierat!"; setTimeout(function () { btn.textContent = "Dela resultat"; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { window.prompt("Kopiera:", txt); });
      else window.prompt("Kopiera:", txt);
    };
    openModal("result");
  }

  function submitGuess() {
    if (!guessMarker || locked) return;
    var g = guessMarker.getLatLng();
    var km = haversineKm({ lat: g.lat, lng: g.lng }, loc);
    var res = { lat: g.lat, lng: g.lng, dist: km, score: scoreFor(km) };

    if (!isTest) {
      var s = data.stats;
      s.streak = (s.lastDay === dayNumber - 1) ? s.streak + 1 : 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      s.played += 1;
      s.totalScore += res.score;
      s.lastDay = dayNumber;
      data.results[dayNumber] = res;
      save(data);
    }
    drawResult(res);
    showResult(res);
    lastResult = res;
  }

  var lastResult = null;

  // ---------- Start ----------

  $("dayLabel").textContent = "#" + dayNumber + (isTest ? " (test)" : "");
  $("guessBtn").onclick = submitGuess;
  $("showResultBtn").onclick = function () { if (lastResult) showResult(lastResult); };
  $("helpBtn").onclick = function () { openModal("help"); };

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest && t.closest("[data-close]")) closeModal(t.closest(".modal"));
    else if (t.classList && t.classList.contains("modal")) closeModal(t);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll(".modal").forEach(closeModal);
  });

  initStreetView();

  var saved = !isTest && data.results[dayNumber];
  if (saved) {
    lastResult = saved;
    drawResult(saved);
    showResult(saved);
  } else if (!data.seenHelp) {
    data.seenHelp = true;
    save(data);
    openModal("help");
  }
})();
