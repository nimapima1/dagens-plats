// Dagens pussel. Varje pussel är ett land med fem platser, från svårast till lättast.
// Plats 5 är landets kända monument. Platserna slås upp med namn i locations.js.
//
//  country : landets ISO 3166-1 numeriska kod (samma som i kartdatan), t.ex. "752" = Sverige.
//            Svenska landsnamn skapas automatiskt från koden (se countries.js).
//  clues   : fem platsnamn (exakt som i locations.js), ledtråd 1 = svårast ... ledtråd 5 = lättast.
//
// Ordningen på dagarna blandas med SHUFFLE_SEED i config.js.
window.PUZZLES = [
  {
    country: "752", // Sverige
    clues: ["Ales stenar", "Skogskyrkogården", "Uppsala domkyrka", "Stockholms stadshus", "Kungliga slottet"]
  },
  {
    country: "250", // Frankrike
    clues: ["Hôtel d'Alsace", "Pont du Gard", "Mont-Saint-Michel", "Triumfbågen", "Eiffeltornet"]
  },
  {
    country: "380", // Italien
    clues: ["Trulli i Alberobello", "Piazza del Campo", "Markuskyrkan", "Lutande tornet i Pisa", "Colosseum"]
  },
  {
    country: "392", // Japan
    clues: ["Hōryū-ji", "Shirakawa-go", "Atombombskupolen (Genbaku Dome)", "Tokyo Skytree", "Shibuya-övergången"]
  },
  {
    country: "840", // USA
    clues: ["Lorraine Motel", "Hoover Dam", "Space Needle", "Brooklyn Bridge", "Lincolnmonumentet"]
  }
];
