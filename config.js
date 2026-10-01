// Inställningar för spelet. Redigera här.
window.GAME_CONFIG = {
  // Klistra in din Google Maps JavaScript API-nyckel mellan citattecknen.
  // Lämnas den tom körs spelet i demoläge (ingen Street View, bara en ledtråd i text).
  // Begränsa nyckeln till din domän (HTTP referrer) i Google Cloud Console!
  GOOGLE_MAPS_API_KEY: "",

  // Dag 1 i spelet. Därefter byts plats vid midnatt (lokal tid) varje dag.
  START_DATE: "2026-10-01",

  // Får spelaren förflytta sig i Street View (pilarna på marken)?
  // false = spelaren står still och kan bara titta runt. Svårare, och mer rättvist.
  ALLOW_MOVE: true
};
