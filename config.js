// Inställningar för spelet. Redigera här.
window.GAME_CONFIG = {
  // Lägg INTE nyckeln här (den här filen skickas till GitHub). Kopiera i stället
  // config.local.example.js till config.local.js och fyll i nyckeln där.
  // Utan nyckel körs spelet i demoläge (ingen Street View, bara en ledtråd i text).
  // Begränsa nyckeln till din domän (HTTP referrer) i Google Cloud Console!
  GOOGLE_MAPS_API_KEY: "",

  // Dag 1 i spelet. Därefter byts plats vid midnatt (lokal tid) varje dag.
  // Sätt det till lanseringsdagen, annars börjar spelet på dag nummer > 1.
  START_DATE: "2026-10-02",

  // Fröet som bestämmer den blandade ordningen på platserna. Alla spelare får samma ordning.
  // Byt tal för att få en annan ordning. Ändra det inte efter lansering, då byter alla dagars platser.
  SHUFFLE_SEED: 22,

  // Hur många pussel (de första i puzzles.js) som varje varv innehåller. Varv 1 = dag 1-10, varv 2 börjar
  // därefter. Lägg till en siffra när ett varv har börjat, så ändras inte dagar som redan har visats.
  // Varv utan siffra använder alla pussel som finns i puzzles.js.
  CYCLE_SIZES: [10, 30],

  // Får spelaren förflytta sig i Street View (pilarna på marken)?
  // false = spelaren står still och kan bara titta runt. Svårare, och mer rättvist.
  ALLOW_MOVE: true
};
