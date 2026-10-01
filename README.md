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

## Publicering

Sajten publiceras automatiskt till GitHub Pages (https://nimapima1.github.io/dagens-plats/) varje gång något skickas till `main`. Flödet ligger i `.github/workflows/pages.yml`.

Google-nyckeln hämtas från GitHub-hemligheten `GOOGLE_MAPS_API_KEY` och skrivs till `config.local.js` under bygget. Byt nyckel med `gh secret set GOOGLE_MAPS_API_KEY` och kör sedan om flödet. Lägg också till `https://nimapima1.github.io/*` som tillåten hänvisare för nyckeln i Google Cloud.

## Ordning på platserna

Platserna visas i en blandad ordning som är lika för alla spelare. Ordningen bestäms av `SHUFFLE_SEED` i `config.js`. Ingen plats upprepas förrän hela listan har visats, och sedan blandas den om. Ändra inte fröet efter lansering, då byter alla kommande dagar plats. Sätt `START_DATE` till lanseringsdagen.

Om du lägger till nya platser i `locations.js` ändras den blandade ordningen för alla dagar som inte hunnit visas. Gör det därför helst före lansering.

## Testa en viss plats

Testparametrarna fungerar bara när spelet körs lokalt (`start.bat`, adressen `localhost`). På den publicerade sidan ignoreras de. Statistiken påverkas inte av dem:

- `?dag=3` visar den tredje dagens plats i den blandade ordningen.
- `?plats=3` visar plats nummer 3 i `locations.js`, oavsett blandning.
- `?from=250,90` (avstånd i meter, väderstreck i grader) provar en annan startpunkt i Street View.

## Tekniker

HTML, CSS och JavaScript utan byggsteg. Gissningskartan använder [Leaflet](https://leafletjs.com/) med OpenStreetMap, och Street View kommer från Google Maps JavaScript API.
