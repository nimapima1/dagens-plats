(function () {
  "use strict";

  var cfg = window.GAME_CONFIG || {};
  var LOCS = window.LOCATIONS || [];
  var PUZZLES = window.PUZZLES || [];
  var CODES = window.COUNTRY_CODES || {};
  var STORAGE_KEY = "dagensplats.v2";
  var POINTS = [5000, 4000, 3000, 2000, 1000]; // poäng om landet hittas på ledtråd 1..5
  var ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";

  function $(id) { return document.getElementById(id); }
  function fmtNum(n) { return Math.round(n).toLocaleString("sv-SE"); }

  // ---------- Vilken dag / vilket pussel? ----------

  function utcDay(y, m, d) { return Math.floor(Date.UTC(y, m, d) / 86400000); }
  function todayIndex() {
    var n = new Date();
    return utcDay(n.getFullYear(), n.getMonth(), n.getDate());
  }
  var sp = (cfg.START_DATE || "2026-10-01").split("-").map(Number);
  var START = utcDay(sp[0], sp[1] - 1, sp[2]);

  // Ordningen blandas med ett fast frö (SHUFFLE_SEED i config.js), så att alla spelare får samma
  // pussel samma dag. Inget pussel upprepas förrän alla har visats, sedan blandas listan om.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Varje varv har en fast storlek: de N första pusslen i puzzles.js blandas. CYCLE_SIZES i config.js låser
  // storleken för varv som redan har börjat, så att nya pussel aldrig ändrar dagar som redan har visats.
  // Varv utan angiven storlek använder alla pussel som finns.
  function cycleSize(cycle) {
    var s = cfg.CYCLE_SIZES && cfg.CYCLE_SIZES[cycle];
    return Math.max(1, Math.min(s || PUZZLES.length, PUZZLES.length));
  }
  function orderForCycle(cycle) {
    var n = cycleSize(cycle);
    var seed = cfg.SHUFFLE_SEED === undefined ? 2026 : cfg.SHUFFLE_SEED;
    var idx = [], i;
    for (i = 0; i < n; i++) idx.push(i);
    var rnd = mulberry32(seed + cycle * 7919);
    for (i = n - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
    }
    // Samma pussel får inte komma två dagar i rad när ett nytt varv börjar
    if (cycle > 0 && n > 1) {
      var prev = orderForCycle(cycle - 1), prevLast = prev[prev.length - 1];
      if (idx[0] === prevLast) { var t = idx[0]; idx[0] = idx[1]; idx[1] = t; }
    }
    return idx;
  }
  function puzzleIndexForDay(day) {
    var d = Math.max(0, day - 1), cycle = 0;
    while (d >= cycleSize(cycle)) { d -= cycleSize(cycle); cycle++; }
    return orderForCycle(cycle)[d];
  }

  // Testparametrar (statistiken påverkas inte). De fungerar BARA när sidan körs lokalt
  // (localhost), och ignoreras på den publicerade sidan:
  //   ?dag=3       visar den tredje dagens pussel i den blandade ordningen
  //   ?plats=3     visar pussel nummer 3 i puzzles.js, oavsett blandning
  //   ?bild=12     visar plats nummer 12 i locations.js som en enda bild (för att finjustera vinklar)
  //   ?ledtrad=3   börjar på ledtråd 3
  //   ?from=250,90 provar en annan startpunkt (avstånd i meter, väderstreck) för alla bilder
  //   ?pitch=35    lutar blicken uppåt (grader) för alla bilder
  var isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var params = new URLSearchParams(isLocalHost ? location.search : "");
  var testDay = parseInt(params.get("dag"), 10);
  var testPlace = parseInt(params.get("plats"), 10);
  var testImage = parseInt(params.get("bild"), 10);
  var testClue = parseInt(params.get("ledtrad"), 10);
  var isTest = isFinite(testDay) || isFinite(testPlace) || isFinite(testImage);

  function findLoc(name) {
    for (var i = 0; i < LOCS.length; i++) if (LOCS[i].name === name) return LOCS[i];
    return null;
  }

  var puzzle, clueLocs, dayNumber;
  if (isFinite(testImage)) {
    var one = LOCS[(((testImage - 1) % LOCS.length) + LOCS.length) % LOCS.length];
    puzzle = { country: "000" };
    clueLocs = [one, one, one, one, one];
    dayNumber = 1;
  } else {
    dayNumber = isFinite(testDay) ? testDay : (isTest ? 1 : Math.max(1, todayIndex() - START + 1));
    puzzle = isFinite(testPlace)
      ? PUZZLES[(((testPlace - 1) % PUZZLES.length) + PUZZLES.length) % PUZZLES.length]
      : PUZZLES[puzzleIndexForDay(dayNumber)];
    clueLocs = puzzle.clues.map(findLoc);
    clueLocs.forEach(function (l, i) { if (!l) console.error("Hittar inte platsen:", puzzle.clues[i]); });
  }

  // ---------- Sparad data ----------

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (s && s.stats && s.days) return s;
    } catch (e) {}
    return {
      seenHelp: false,
      stats: { played: 0, totalScore: 0, streak: 0, bestStreak: 0, lastWinDay: 0 },
      days: {}
    };
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  var data = load();

  function freshDay() { return { clue: 1, history: [], done: false, correct: false, score: 0 }; }
  var state = (!isTest && data.days[dayNumber]) || freshDay();
  if (isTest && isFinite(testClue)) state.clue = Math.max(1, Math.min(5, testClue));
  var viewClue = state.done ? 5 : state.clue;
  var selected = null; // { id, name } för det land spelaren markerat

  function persist() {
    if (isTest) return;
    data.days[dayNumber] = state;
    save();
  }
  function historyFor(clue) {
    for (var i = 0; i < state.history.length; i++) if (state.history[i].clue === clue) return state.history[i];
    return null;
  }
  function wrongIds() {
    return state.history.filter(function (h) { return h.type === "wrong"; }).map(function (h) { return h.id; });
  }

  // ---------- Landsnamn ----------

  var dnSv = null;
  try { dnSv = new Intl.DisplayNames(["sv"], { type: "region" }); } catch (e) {}
  function countryName(id, fallback) {
    var code = CODES[String(id).padStart(3, "0")];
    if (code && dnSv) {
      try { var n = dnSv.of(code); if (n && n !== code) return n; } catch (e) {}
    }
    return fallback || String(id);
  }

  // ---------- Geometri ----------

  function rad(d) { return d * Math.PI / 180; }
  function deg(r) { return r * 180 / Math.PI; }
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

  // ---------- Street View ----------

  var gm = { lib: null, svc: null, pano: null, req: 0, cur: null };

  function showDemo(note, tag, l) {
    $("pano").hidden = true;
    $("demo").hidden = false;
    $("demoTag").textContent = tag || "Demoläge";
    $("demoClue").textContent = "Ledtråd: " + (l && l.clue ? l.clue : "");
    $("demoNote").textContent = note;
    $("resetView").hidden = true;
  }

  function loadGoogle(key) {
    return new Promise(function (resolve, reject) {
      if (window.google && window.google.maps) return resolve();
      window.__gmReady = resolve;
      window.gm_authFailure = function () {
        showDemo("Google avvisade API-nyckeln. Kontrollera att Maps JavaScript API är aktiverat och att nyckelns domänbegränsning stämmer.", "Nyckelfel", clueLocs[viewClue - 1]);
      };
      var s = document.createElement("script");
      s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) +
        "&v=weekly&loading=async&language=sv&callback=__gmReady";
      s.async = true;
      s.onerror = function () { reject(new Error("Kunde inte ladda Google Maps")); };
      document.head.appendChild(s);
    });
  }

  async function showClue(i) {
    viewClue = i;
    renderChips();
    var l = clueLocs[i - 1];
    var my = ++gm.req;
    var key = (cfg.GOOGLE_MAPS_API_KEY || "").trim();
    if (!l) return;
    if (!key) {
      showDemo("Ingen Google-nyckel inlagd. Lägg in en för att visa riktig Street View.", null, l);
      return;
    }
    try {
      if (!gm.lib) {
        await loadGoogle(key);
        gm.lib = await google.maps.importLibrary("streetView");
        gm.svc = new gm.lib.StreetViewService();
      }
      var fromOverride = (params.get("from") || "").split(",").map(Number);
      var from = fromOverride.length === 2 && fromOverride.every(isFinite)
        ? { dist: fromOverride[0], bearing: fromOverride[1] } : l.from;
      var start = destination(l, from.dist, from.bearing);
      var res = await gm.svc.getPanorama({
        location: start,
        radius: 250,
        preference: gm.lib.StreetViewPreference ? gm.lib.StreetViewPreference.NEAREST : undefined,
        sources: ["google", "outdoor"] // bara Googles egna utomhusbilder, inga användaruppladdade eller inomhus
      });
      if (my !== gm.req) return; // spelaren har hunnit byta ledtråd
      var p = res.data.location;
      var pos = { lat: p.latLng.lat(), lng: p.latLng.lng() };
      var pitchOverride = parseFloat(params.get("pitch"));
      var pov = { heading: bearing(pos, l), pitch: isFinite(pitchOverride) ? pitchOverride : (l.pitch || 8) };
      var zoom = l.zoom || 0;
      if (!gm.pano) {
        gm.pano = new gm.lib.StreetViewPanorama($("pano"), {
          pano: p.pano,
          pov: pov,
          zoom: zoom,
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
      } else {
        $("pano").hidden = false;
        gm.pano.setPano(p.pano);
        gm.pano.setPov(pov);
        gm.pano.setZoom(zoom);
        google.maps.event.trigger(gm.pano, "resize");
      }
      gm.cur = { pano: p.pano, pov: pov, zoom: zoom };
      $("pano").hidden = false;
      $("demo").hidden = true;
      $("resetView").hidden = false;
    } catch (e) {
      if (my === gm.req) {
        showDemo("Hittade ingen Street View-bild vid platsen, eller Google kunde inte nås (" + (e && e.message ? e.message : "okänt fel") + ").", "Ingen bild", l);
      }
    }
  }

  $("resetView").onclick = function () {
    if (!gm.pano || !gm.cur) return;
    gm.pano.setPano(gm.cur.pano);
    gm.pano.setPov(gm.cur.pov);
    gm.pano.setZoom(gm.cur.zoom);
  };

  // ---------- Karta med länder (Leaflet + OpenStreetMap + world-atlas) ----------

  // På pekskärmar (särskilt i appars inbyggda webbläsare) fungerar kartan bättre med färre animationer
  // och större tolerans för att fingret rör sig lite vid ett tryck.
  var coarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  var map = L.map("map", {
    worldCopyJump: true, minZoom: 2, zoomControl: true, preferCanvas: true,
    clickTolerance: coarse ? 12 : 3,
    inertia: !coarse, zoomAnimation: !coarse, fadeAnimation: !coarse, markerZoomAnimation: !coarse,
    zoomSnap: coarse ? 0.5 : 1, bounceAtZoomLimits: false
  }).setView([28, 12], 2);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var STYLE = {
    base:     { color: "#37474f", weight: 0.7, opacity: 0.55, fill: true, fillColor: "#000000", fillOpacity: 0.001 },
    hover:    { color: "#1f6f5c", weight: 1.5, opacity: 0.9, fill: true, fillColor: "#1f6f5c", fillOpacity: 0.15 },
    selected: { color: "#1f6f5c", weight: 2.5, opacity: 1, fill: true, fillColor: "#1f6f5c", fillOpacity: 0.4 },
    wrong:    { color: "#d9382b", weight: 1.5, opacity: 0.9, fill: true, fillColor: "#d9382b", fillOpacity: 0.25 },
    right:    { color: "#1f9d55", weight: 2.5, opacity: 1, fill: true, fillColor: "#1f9d55", fillOpacity: 0.45 }
  };
  var layersById = {};

  function styleFor(id) {
    if (state.done && id === puzzle.country) return STYLE.right;
    if (wrongIds().indexOf(id) !== -1) return STYLE.wrong;
    if (selected && selected.id === id) return STYLE.selected;
    return STYLE.base;
  }
  function refreshStyles() {
    Object.keys(layersById).forEach(function (id) {
      layersById[id].forEach(function (layer) { layer.setStyle(styleFor(id)); });
    });
  }

  function selectCountry(id, name) {
    if (state.done) return;
    selected = { id: id, name: name };
    refreshStyles();
    $("guessBtn").disabled = false;
    $("hint").textContent = "Valt land: " + name + ". Tryck på Gissa land.";
  }

  function focusAnswer() {
    var layers = layersById[puzzle.country];
    if (!layers) return;
    var b = null;
    layers.forEach(function (l) { b = b ? b.extend(l.getBounds()) : L.latLngBounds(l.getBounds().getSouthWest(), l.getBounds().getNorthEast()); });
    if (b) map.fitBounds(b, { padding: [30, 30], maxZoom: 6 });
  }

  // Länder som korsar datumgränsen (t.ex. Ryssland och Fiji) ger annars långa vågräta linjer över kartan.
  // Vi gör längdgraderna sammanhängande i varje ring, så att landet ritas som en enda form.
  function unwrapRing(ring) {
    var out = [], off = 0, prev = ring[0][0];
    out.push([prev, ring[0][1]]);
    for (var i = 1; i < ring.length; i++) {
      var lng = ring[i][0], d = lng - prev;
      if (d > 180) off -= 360; else if (d < -180) off += 360;
      out.push([lng + off, ring[i][1]]);
      prev = lng;
    }
    return out;
  }
  function fixAntimeridian(fc) {
    fc.features = fc.features.filter(function (f) { return String(f.id) !== "010"; }); // utan Antarktis
    fc.features.forEach(function (f) {
      var g = f.geometry;
      if (!g) return;
      if (g.type === "Polygon") g.coordinates = g.coordinates.map(unwrapRing);
      else if (g.type === "MultiPolygon") g.coordinates = g.coordinates.map(function (poly) { return poly.map(unwrapRing); });
    });
    return fc;
  }

  var countriesReady = false;
  function loadCountries() {
    fetch(ATLAS_URL).then(function (r) { return r.json(); }).then(function (topo) {
      var fc = fixAntimeridian(topojson.feature(topo, topo.objects.countries));
      L.geoJSON(fc, {
        style: function () { return STYLE.base; },
        onEachFeature: function (f, layer) {
          var id = f.id !== undefined && f.id !== null ? String(f.id).padStart(3, "0") : "n:" + f.properties.name;
          var name = countryName(id, f.properties && f.properties.name);
          (layersById[id] = layersById[id] || []).push(layer);
          layer.bindTooltip(name, { sticky: true, direction: "top", className: "country-tip" });
          layer.on("click", function () { selectCountry(id, name); });
          layer.on("mouseover", function () { if (!state.done && !(selected && selected.id === id) && wrongIds().indexOf(id) === -1) layer.setStyle(STYLE.hover); });
          layer.on("mouseout", function () { layer.setStyle(styleFor(id)); });
        }
      }).addTo(map);
      countriesReady = true;
      refreshStyles();
      if (state.done) focusAnswer();
    }).catch(function () {
      $("hint").textContent = "Kunde inte ladda länderkartan. Ladda om sidan.";
    });
  }

  // ---------- Ledtrådsfält och knappar ----------

  function renderChips() {
    var box = $("chips");
    box.innerHTML = "";
    for (var i = 1; i <= 5; i++) {
      (function (n) {
        var b = document.createElement("button");
        b.className = "chip";
        b.textContent = n;
        var h = historyFor(n);
        if (h && h.type === "wrong") b.classList.add("wrong");
        else if (h && h.type === "skip") b.classList.add("skip");
        else if (h && h.type === "right") b.classList.add("right");
        if (n === viewClue) b.classList.add("viewing");
        var unlocked = state.done || n <= state.clue; // när spelet är slut kan man titta på alla fem
        b.disabled = !unlocked;
        b.title = unlocked ? "Visa ledtråd " + n : "Låst";
        b.onclick = function () { if (n !== viewClue) showClue(n); };
        box.appendChild(b);
      })(i);
    }
    $("worth").textContent = state.done ? "" : "Värt " + fmtNum(POINTS[state.clue - 1]) + " p";
  }

  function renderButtons() {
    $("guessBtn").hidden = state.done;
    $("skipBtn").hidden = state.done || state.clue >= 5;
    $("showResultBtn").hidden = !state.done;
    $("guessBtn").disabled = !selected;
    $("map").classList.toggle("locked", state.done);
    if (state.done) $("hint").textContent = "Grönt land = rätt svar, rött = dina felgissningar.";
  }

  // ---------- Feedback när en ledtråd misslyckas ----------

  var toastTimer = null;
  function showToast(kind, title, sub) {
    var t = $("toast");
    t.className = "toast " + (kind === "wrong" ? "" : "neutral");
    $("toastIcon").textContent = kind === "wrong" ? "✕" : "→";
    $("toastTitle").textContent = title;
    $("toastSub").textContent = sub || "";
    t.hidden = false;
    void t.offsetWidth; // starta om animationen
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; t.classList.remove("show"); }, 3100);
  }

  function restartClass(el, names, ms) {
    if (!el) return;
    names.forEach(function (n) { el.classList.remove(n); });
    void el.offsetWidth;
    names.forEach(function (n) { el.classList.add(n); });
    setTimeout(function () { names.forEach(function (n) { el.classList.remove(n); }); }, ms);
  }

  // Felgissning: ruta över bilden, röd blixt, skakning, pulserande ledtrådssiffra och poäng, blinkande land
  function feedbackWrong(picked, clue) {
    var last = clue >= 5;
    showToast("wrong", "Inte " + picked.name,
      last ? "Inga fler ledtrådar kvar" : "Ledtråd " + (clue + 1) + " av 5 · nu värt " + fmtNum(POINTS[clue]) + " p");
    restartClass($("viewPane"), ["shake", "flash-wrong"], 900);
    restartClass($("chips").children[clue - 1], ["pulse"], 1000);
    if (!last) restartClass($("worth"), ["drop"], 1100);
    (layersById[picked.id] || []).forEach(function (l) { l.setStyle({ weight: 5, fillOpacity: 0.65 }); });
    setTimeout(refreshStyles, 700);
  }

  // ---------- Spelgång ----------

  function guess() {
    if (state.done || !selected) return;
    var clue = state.clue, ok = selected.id === puzzle.country, picked = selected;
    state.history.push({ clue: clue, type: ok ? "right" : "wrong", id: picked.id, name: picked.name });
    selected = null;
    if (ok) {
      finish(true, POINTS[clue - 1]);
      return;
    }
    if (clue < 5) {
      state.clue = clue + 1;
      $("hint").textContent = "Fel: " + picked.name + " är inte rätt. Här är ledtråd " + state.clue + ".";
      persist(); refreshStyles(); renderButtons(); showClue(state.clue);
      feedbackWrong(picked, clue);
    } else {
      finish(false, 0, 1700); // ge spelaren en stund att se vad som hände innan resultatet visas
      feedbackWrong(picked, clue);
    }
  }

  function skip() {
    if (state.done || state.clue >= 5) return;
    var from = state.clue;
    state.history.push({ clue: from, type: "skip" });
    state.clue += 1;
    selected = null;
    $("hint").textContent = "Ledtråd " + state.clue + ". Klicka på det land du tror att bilden finns i.";
    persist(); refreshStyles(); renderButtons(); showClue(state.clue);
    showToast("skip", "Ledtråd " + from + " hoppades över", "Ledtråd " + state.clue + " av 5 · nu värt " + fmtNum(POINTS[state.clue - 1]) + " p");
    restartClass($("worth"), ["drop"], 1100);
  }

  function finish(correct, score, resultDelayMs) {
    state.done = true;
    state.correct = correct;
    state.score = score;
    if (!isTest) {
      var s = data.stats;
      s.played += 1;
      s.totalScore += score;
      if (correct) {
        s.streak = (s.lastWinDay === dayNumber - 1) ? s.streak + 1 : 1;
        s.lastWinDay = dayNumber;
        s.bestStreak = Math.max(s.bestStreak, s.streak);
      } else {
        s.streak = 0;
      }
    }
    persist();
    refreshStyles();
    renderButtons();
    if (countriesReady) focusAnswer();
    showClue(5);
    if (resultDelayMs) setTimeout(showResult, resultDelayMs);
    else showResult();
  }

  // ---------- Resultat ----------

  function renderStats() {
    var s = data.stats;
    $("stPlayed").textContent = s.played;
    $("stAvg").textContent = s.played ? fmtNum(s.totalScore / s.played) : 0;
    $("stStreak").textContent = s.streak;
    $("stBest").textContent = s.bestStreak;
  }

  function shareText() {
    var boxes = "";
    for (var i = 1; i <= 5; i++) {
      var h = historyFor(i);
      boxes += h ? (h.type === "right" ? "🟩" : h.type === "wrong" ? "🟥" : "⬛") : "⬜";
    }
    return "Dagens Plats #" + dayNumber + " 🌍\n" + boxes + " " + fmtNum(state.score) + " poäng\n" +
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
      $("nextIn").textContent = "Nästa land om " + p(Math.floor(s / 3600)) + ":" + p(Math.floor(s / 60) % 60) + ":" + p(s % 60);
    }
    tick();
    clearInterval(nextTimer);
    nextTimer = setInterval(tick, 1000);
  }

  function showResult() {
    var foundAt = 0;
    state.history.forEach(function (h) { if (h.type === "right") foundAt = h.clue; });
    $("resEyebrow").textContent = state.correct ? "Rätt land!" : "Dagens land";
    $("resName").textContent = countryName(puzzle.country, "Okänt land");
    $("resLine").textContent = state.correct
      ? "Du hittade landet på ledtråd " + foundAt + " av 5."
      : "Landet hittades inte den här gången.";
    $("resScore").textContent = fmtNum(state.score);
    $("resClues").textContent = (state.correct ? foundAt : 5) + " av 5";

    var list = $("resList");
    list.innerHTML = "";
    clueLocs.forEach(function (l, i) {
      if (!l) return;
      var li = document.createElement("li");
      if (state.correct && i + 1 === foundAt) li.className = "found";
      var b = document.createElement("b"); b.textContent = l.name;
      var w = document.createElement("span"); w.className = "where"; w.textContent = " – " + l.place;
      var f = document.createElement("span"); f.className = "fact"; f.textContent = l.fact || "";
      li.appendChild(b); li.appendChild(w); li.appendChild(f);
      list.appendChild(li);
    });

    renderStats();
    startCountdown();
    $("shareBtn").onclick = function () {
      var txt = shareText(), btn = $("shareBtn");
      var done = function () { btn.textContent = "Kopierat!"; setTimeout(function () { btn.textContent = "Dela resultat"; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { window.prompt("Kopiera:", txt); });
      else window.prompt("Kopiera:", txt);
    };
    openModal("result");
  }

  // ---------- Start ----------

  $("dayLabel").textContent = "#" + dayNumber + (isTest ? " (test)" : "");
  $("guessBtn").onclick = guess;
  $("skipBtn").onclick = skip;
  $("showResultBtn").onclick = showResult;
  $("helpBtn").onclick = function () { openModal("help"); };

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest && t.closest("[data-close]")) closeModal(t.closest(".modal"));
    else if (t.classList && t.classList.contains("modal")) closeModal(t);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll(".modal").forEach(closeModal);
  });

  if (isLocalHost) window.__dp = { selectCountry: selectCountry, state: state, puzzle: puzzle, shareText: shareText, showToast: showToast, feedbackWrong: feedbackWrong, puzzleIndexForDay: puzzleIndexForDay }; // bara för lokal testning

  // Håll layout och karta i takt med den verkliga skärmstorleken. Appars webbläsare ändrar höjd när
  // verktygsfält visas och döljs, och 100vh stämmer ofta inte med det som syns.
  function syncSize() {
    document.documentElement.style.setProperty("--app-h", window.innerHeight + "px");
    map.invalidateSize({ animate: false });
  }
  var sizeTimer = null;
  function scheduleSync() { clearTimeout(sizeTimer); sizeTimer = setTimeout(syncSize, 60); }
  window.addEventListener("resize", scheduleSync);
  window.addEventListener("orientationchange", function () { setTimeout(syncSize, 300); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", scheduleSync);
  if (window.ResizeObserver) new ResizeObserver(scheduleSync).observe($("mapPane"));
  syncSize();

  // Tips när spelet öppnas i en app (Snapchat, Messenger, Instagram, TikTok m.fl.)
  var inApp = /(FBAN|FBAV|FB_IAB|Instagram|Snapchat|TikTok|musical_ly|Line\/|MicroMessenger|; wv\))/i.test(navigator.userAgent) || params.get("inapp") === "1";
  var inAppDismissed = false;
  try { inAppDismissed = sessionStorage.getItem("dp.inapp") === "1"; } catch (e) {}
  if (inApp && !inAppDismissed) $("inapp").hidden = false;
  $("inappClose").onclick = function () {
    $("inapp").hidden = true;
    try { sessionStorage.setItem("dp.inapp", "1"); } catch (e) {}
    scheduleSync();
  };
  $("copyLink").onclick = function () {
    var url = location.origin + location.pathname, btn = $("copyLink");
    var done = function () { btn.textContent = "Kopierad!"; setTimeout(function () { btn.textContent = "Kopiera länk"; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt("Kopiera länken och klistra in den i din webbläsare:", url); });
    else window.prompt("Kopiera länken och klistra in den i din webbläsare:", url);
  };

  renderChips();
  renderButtons();
  showClue(viewClue);
  loadCountries();

  if (state.done) {
    showResult();
  } else if (!data.seenHelp) {
    data.seenHelp = true;
    save();
    openModal("help");
  }
})();
