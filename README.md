# Dagens Plats

Fem Street View-bilder per dag från olika platser i samma land, från svår till lätt. Spelaren gissar vilket land det är genom att klicka på kartan. Ju tidigare landet hittas, desto fler poäng: 5 000 på bild 1, sedan 4 000, 3 000, 2 000 och 1 000. Bild 5 är landets kända monument.

## Köra lokalt

Dubbelklicka på `start.bat` (Windows). Det startar en liten lokal server på http://localhost:8123 och öppnar webbläsaren.

Spelet fungerar inte om `index.html` öppnas direkt från disk, det behöver en webbserver.

## Filer

- `config.js`: startdatum, fröet för blandningen och om spelaren får gå runt i Street View.
- `config.local.js`: din Google Maps-nyckel (finns bara lokalt, se nedan).
- `locations.js`: biblioteket med alla platser (koordinater, startvinkel i Street View, faktatext).
- `puzzles.js`: dagens pussel. Varje pussel är ett land med fem platser från `locations.js`.
- `countries.js`: kopplar kartdatans landskoder till tvåbokstavskoder, så att landsnamn blir svenska.
- `game.js`, `index.html`, `style.css`: själva spelet.

Utan Google-nyckel körs spelet i demoläge med en textledtråd i stället för Street View.

## Lägga till ett pussel

1. Lägg till de platser som saknas i `locations.js`. Testa varje plats vinkel i Street View (se testparametrarna nedan).
2. Lägg till ett pussel i `puzzles.js` med landets numeriska ISO-kod och fem platsnamn, från svårast till lättast. Plats 5 ska vara landets kända monument.

Landskoder finns i kartdatan (world-atlas) och i `countries.js`, till exempel Sverige = `752`.

## Google-nyckel

1. Skapa en nyckel i Google Cloud Console och aktivera Maps JavaScript API.
2. Begränsa nyckeln till din domän (HTTP referrer) och sätt en budgetvarning.
3. Kopiera `config.local.example.js` till `config.local.js` och fyll i nyckeln där. Filen ligger i `.gitignore` och skickas aldrig till GitHub.

Nyckeln hamnar ändå i klientkoden och blir synlig för alla som besöker den publicerade sidan. Domänbegränsningen är det som skyddar den. Vid publicering behöver `config.local.js` läggas på webbplatsen utan att committas, till exempel genom att ladda upp den separat eller skapa den i bygget.

## Publicering

Sajten publiceras automatiskt till GitHub Pages (https://dagensplats.nu/) varje gång något skickas till `main`. Flödet ligger i `.github/workflows/pages.yml`.

Google-nyckeln hämtas från GitHub-hemligheten `GOOGLE_MAPS_API_KEY` och skrivs till `config.local.js` under bygget. Byt nyckel med `gh secret set GOOGLE_MAPS_API_KEY` och kör sedan om flödet. Lägg också till sajtens adresser som tillåtna hänvisare för nyckeln i Google Cloud.

## Ordning på dagarna

Pusslen visas i en blandad ordning som är lika för alla spelare. Ordningen bestäms av `SHUFFLE_SEED` i `config.js`. Inget pussel upprepas förrän alla har visats, och sedan blandas listan om. Ändra inte fröet efter lansering, då byter alla kommande dagar pussel. Sätt `START_DATE` till lanseringsdagen.

Om du lägger till nya pussel ändras den blandade ordningen för alla dagar som inte hunnit visas.

## Testa

Testparametrarna fungerar bara när spelet körs lokalt (`start.bat`, adressen `localhost`). På den publicerade sidan ignoreras de. Statistiken påverkas inte av dem:

- `?dag=3` visar den tredje dagens pussel i den blandade ordningen.
- `?plats=3` visar pussel nummer 3 i `puzzles.js`, oavsett blandning.
- `?bild=12` visar plats nummer 12 i `locations.js` som en enda bild.
- `?ledtrad=3` börjar på ledtråd 3.
- `?from=250,90` (avstånd i meter, väderstreck i grader) provar en annan startpunkt i Street View.
- `?pitch=35` lutar blicken uppåt, till exempel för höga torn.

## Tekniker

HTML, CSS och JavaScript utan byggsteg. Kartan använder [Leaflet](https://leafletjs.com/) med OpenStreetMap, och Street View kommer från Google Maps JavaScript API. Landsgränserna kommer från [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, public domain) via [jsDelivr](https://www.jsdelivr.com/) och läses med [topojson-client](https://github.com/topojson/topojson-client).
