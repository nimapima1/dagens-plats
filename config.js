// Inställningar för spelet. Redigera här.
window.GAME_CONFIG = {
  // Lägg INTE nyckeln här (den här filen skickas till GitHub). Kopiera i stället
  // config.local.example.js till config.local.js och fyll i nyckeln där.
  // Utan nyckel körs spelet i demoläge (ingen Street View, bara en ledtråd i text).
  // Begränsa nyckeln till din domän (HTTP referrer) i Google Cloud Console!
  GOOGLE_MAPS_API_KEY: "",

  // Dag 1 i spelet. Därefter byts plats vid midnatt (lokal tid) varje dag.
  START_DATE: "2026-10-01",

  // Får spelaren förflytta sig i Street View (pilarna på marken)?
  // false = spelaren står still och kan bara titta runt. Svårare, och mer rättvist.
  ALLOW_MOVE: true
};
