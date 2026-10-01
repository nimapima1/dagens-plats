# Dagens Plats

Ett Street View per dag på ett monument, en byggnad eller en historisk plats. Spelaren klickar på en karta och gissar var det ligger. Poängen beror på avståndet.

## Köra lokalt

Dubbelklicka på `start.bat` (Windows). Det startar en liten lokal server på http://localhost:8123 och öppnar webbläsaren.

Spelet fungerar inte om `index.html` öppnas direkt från disk, det behöver en webbserver.

## Inställningar

- `config.js`: startdatum och om spelaren får gå runt i Street View.
- `config.local.js`: din Google Maps-nyckel (finns bara lokalt, se nedan).
- `locations.js`: listan med platser. Ordningen avgör vilken plats som visas vilken dag.

Utan Google-nyckel körs spelet i demoläge med en textledtråd i stället för Street View.

## Google-nyckel

1. Skapa en nyckel i Google Cloud Console och aktivera Maps JavaScript API.
2. Begränsa nyckeln till din domän (HTTP referrer) och sätt en budgetvarning.
3. Kopiera `config.local.example.js` till `config.local.js` och fyll i nyckeln där. Filen ligger i `.gitignore` och skickas aldrig till GitHub.

Nyckeln hamnar ändå i klientkoden och blir synlig för alla som besöker den publicerade sidan. Domänbegränsningen är det som skyddar den. Vid publicering behöver `config.local.js` läggas på webbplatsen utan att committas, till exempel genom att ladda upp den separat eller skapa den i bygget.

## Testa en viss plats

Lägg till `?dag=3` i adressen för att visa plats nummer 3 utan att statistiken påverkas.

## Tekniker

HTML, CSS och JavaScript utan byggsteg. Gissningskartan använder [Leaflet](https://leafletjs.com/) med OpenStreetMap, och Street View kommer från Google Maps JavaScript API.
