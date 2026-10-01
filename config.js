// Inställningar för spelet. Redigera här.
window.GAME_CONFIG = {
  // Lägg INTE nyckeln här (den här filen skickas till GitHub). Kopiera i stället
  // config.local.example.js till config.local.js och fyll i nyckeln där.
  // Utan nyckel körs spelet i demoläge (ingen Street View, bara en ledtråd i text).
  // Begränsa nyckeln till din domän (HTTP referrer) i Google Cloud Console!
  GOOGLE_MAPS_API_KEY: "",

  // Dag 1 i spelet. Därefter byts plats vid midnatt (lokal tid) varje dag.
  // Sätt det till lanseringsdagen, annars börjar spelet på dag nummer > 1.
  START_DATE: "2026-10-01",

  // Fröet som bestämmer den blandade ordningen på platserna. Alla spelare får samma ordning.
  // Byt tal för att få en annan ordning. Ändra det inte efter lansering, då byter alla dagars platser.
  SHUFFLE_SEED: 10405,

  // Får spelaren förflytta sig i Street View (pilarna på marken)?
  // false = spelaren står still och kan bara titta runt. Svårare, och mer rättvist.
  ALLOW_MOVE: true
};
