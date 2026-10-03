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
  },
  {
    country: "826", // Storbritannien
    clues: ["Bletchley Park", "Stonehenge", "Edinburgh Castle", "Tower Bridge", "Big Ben (Elizabeth Tower)"]
  },
  {
    country: "276", // Tyskland
    clues: ["Zeche Zollverein", "Rothenburg ob der Tauber", "Frauenkirche", "Kölner Dom", "Brandenburger Tor"]
  },
  {
    country: "724", // Spanien
    clues: ["Akvedukten i Segovia", "Plaza de España", "Guggenheimmuseet", "Kungliga slottet i Madrid", "Sagrada Família"]
  },
  {
    country: "036", // Australien
    clues: ["Parliament House", "Flinders Street Station", "Uluru", "Sydney Harbour Bridge", "Operahuset"]
  },
  {
    country: "124", // Kanada
    clues: ["Peggy's Cove-fyren", "Château Frontenac", "Parliament Hill", "Niagarafallen", "CN Tower"]
  },
  {
    country: "076", // Brasilien
    clues: ["Teatro Amazonas", "Escadaria Selarón", "Catedral de Brasília", "Pão de Açúcar (Sockertoppen)", "Kristusstatyn (Cristo Redentor)"]
  },
  {
    country: "410", // Sydkorea
    clues: ["Bukchon Hanok-by", "Dongdaemun Design Plaza", "Lotte World Tower", "N Seoul Tower", "Gwanghwamun"]
  },
  {
    country: "528", // Nederländerna
    clues: ["Euromast", "Erasmusbron", "Zaanse Schans", "Kinderdijk", "Rijksmuseum"]
  },
  {
    country: "484", // Mexiko
    clues: ["Teatro Juárez", "Basílica de Guadalupe", "Palacio de Bellas Artes", "Solpyramiden (Teotihuacan)", "Chichén Itzá"]
  },
  {
    country: "356", // Indien
    clues: ["Mysore Palace", "Hawa Mahal", "Gateway of India", "India Gate", "Taj Mahal"]
  }
];
