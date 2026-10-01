# Dagens Plats

Ett Street View per dag på ett monument, en byggnad eller en historisk plats. Spelaren klickar på en karta och gissar var det ligger. Poängen beror på avståndet.

## Köra lokalt

Dubbelklicka på `start.bat` (Windows). Det startar en liten lokal server på http://localhost:8123 och öppnar webbläsaren.

Spelet fungerar inte om `index.html` öppnas direkt från disk, det behöver en webbserver.

## Inställningar

- `config.js`: Google Maps-nyckel, startdatum och om spelaren får gå runt i Street View.
- `locations.js`: listan med platser. Ordningen avgör vilken plats som visas vilken dag.

Utan Google-nyckel körs spelet i demoläge med en textledtråd i stället för Street View.

## Google-nyckel

1. Skapa en nyckel i Google Cloud Console och aktivera Maps JavaScript API.
2. Begränsa nyckeln till din domän (HTTP referrer) och sätt en budgetvarning.
3. Lägg in nyckeln i `GOOGLE_MAPS_API_KEY` i `config.js`.

Nyckeln hamnar i klientkoden och blir därmed synlig för alla som besöker sidan. Domänbegränsningen är det som skyddar den.

## Testa en viss plats

Lägg till `?dag=3` i adressen för att visa plats nummer 3 utan att statistiken påverkas.

## Tekniker

HTML, CSS och JavaScript utan byggsteg. Gissningskartan använder [Leaflet](https://leafletjs.com/) med OpenStreetMap, och Street View kommer från Google Maps JavaScript API.
