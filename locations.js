// Platslistan. Ordningen avgör vilken plats som visas vilken dag (dag 1 = första posten osv.).
// När listan är slut börjar den om från början.
//
//  name, place : visas efter gissningen
//  lat, lng    : platsens riktiga position (det spelaren ska hitta)
//  from        : var Street View startar, relativt platsen.
//                dist = meter från platsen, bearing = väderstreck (0=norr, 90=öst, 180=söder, 270=väst).
//                Spelet söker upp närmaste Street View-bild och riktar blicken mot platsen.
//  zoom        : (valfritt) startzoom i Street View, 0 = ingen. Används när monumentet ligger långt bort.
//  clue        : ledtråd som bara visas i demoläget (utan Google-nyckel)
//  fact        : kort faktatext som visas efter gissningen
//
// OBS: Startpunkterna (from) är uppskattade och måste testas mot riktig Street View.
window.LOCATIONS = [
  {
    name: "Eiffeltornet", place: "Paris, Frankrike",
    lat: 48.85837, lng: 2.29448, from: { dist: 260, bearing: 135 },
    clue: "Ett smidesjärnstorn från 1800-talet, byggt som entré till en världsutställning vid en stor flod.",
    fact: "Invigdes 1889 inför världsutställningen i Paris och var världens högsta byggnad i över 40 år."
  },
  {
    name: "Colosseum", place: "Rom, Italien",
    lat: 41.89021, lng: 12.49223, from: { dist: 180, bearing: 220 },
    clue: "En enorm oval arena från antiken där gladiatorer en gång kämpade inför tiotusentals åskådare.",
    fact: "Stod klart år 80 e.Kr. och kunde ta uppskattningsvis 50 000 åskådare."
  },
  {
    name: "Peterskyrkan", place: "Vatikanstaten",
    lat: 41.90217, lng: 12.45394, from: { dist: 250, bearing: 90 },
    clue: "En enorm renässanskupol i slutet av en lång, rak boulevard, i en liten stat som ligger inne i en annan stad.",
    fact: "Den nuvarande kyrkan invigdes 1626 och kupolen ritades av Michelangelo."
  },
  {
    name: "Taj Mahal", place: "Agra, Indien",
    lat: 27.17500, lng: 78.04210, from: { dist: 330, bearing: 180 },
    clue: "Ett vitt marmormausoleum vid en flod, byggt av en härskare till minne av hans hustru.",
    fact: "Uppfördes på 1600-talet av Shah Jahan som gravmonument över hustrun Mumtaz Mahal."
  },
  {
    name: "Brandenburger Tor", place: "Berlin, Tyskland",
    lat: 52.51628, lng: 13.37771, from: { dist: 110, bearing: 90 },
    clue: "En klassicistisk stadsport krönt av en vagn med fyra hästar, som en gång stod precis vid en delad stads gräns.",
    fact: "Byggdes 1788–1791 och blev en symbol för både Tysklands delning och återförening."
  },
  {
    name: "Sagrada Família", place: "Barcelona, Spanien",
    lat: 41.40364, lng: 2.17436, from: { dist: 170, bearing: 90 },
    clue: "En basilika med spetsiga torn i organiska former, ritad av en berömd arkitekt och byggd under mer än ett sekel.",
    fact: "Bygget började 1882 och Antoni Gaudí arbetade med kyrkan fram till sin död 1926."
  },
  {
    name: "Stonehenge", place: "Wiltshire, England",
    lat: 51.17886, lng: -1.82621, from: { dist: 200, bearing: 100 }, zoom: 2,
    clue: "En ring av enorma stenblock på en öppen slätt, rest för flera tusen år sedan av okänd anledning.",
    fact: "De stora stenarna restes omkring 2500 f.Kr. Syftet med monumentet är fortfarande omdiskuterat."
  },
  {
    name: "Kungliga slottet", place: "Stockholm, Sverige",
    lat: 59.32687, lng: 18.07170, from: { dist: 300, bearing: 355 },
    clue: "Ett stort barockslott i en gammal stadskärna på en ö, där landets monark har sin officiella residens.",
    fact: "Det nuvarande slottet byggdes efter en brand 1697 och stod klart 1754. Det är kungens officiella residens."
  },
  {
    name: "Big Ben (Elizabeth Tower)", place: "London, Storbritannien",
    lat: 51.50073, lng: -0.12462, from: { dist: 150, bearing: 100 },
    clue: "Ett gotiskt klocktorn vid parlamentet, intill en berömd flod som delar staden.",
    fact: "Tornet stod klart 1859 och döptes 2012 om till Elizabeth Tower. Själva klockan heter Big Ben."
  },
  {
    name: "Operahuset", place: "Sydney, Australien",
    lat: -33.85679, lng: 151.21526, from: { dist: 280, bearing: 240 },
    clue: "En byggnad med segelliknande skal på en udde i en stor hamn på södra halvklotet.",
    fact: "Ritades av Jørn Utzon, invigdes 1973 och blev världsarv 2007."
  },
  {
    name: "Sankt Basilius katedral", place: "Moskva, Ryssland",
    lat: 55.75252, lng: 37.62315, from: { dist: 220, bearing: 320 },
    clue: "En kyrka med färgglada lökkupoler vid ett stort torg framför en befäst stadsborg.",
    fact: "Byggdes 1555–1561 på order av Ivan den förskräcklige."
  },
  {
    name: "Uppsala domkyrka", place: "Uppsala, Sverige",
    lat: 59.85797, lng: 17.63271, from: { dist: 180, bearing: 260 },
    clue: "En tegelkyrka i en gammal universitetsstad, med torn som tillhör de högsta i sitt land.",
    fact: "Nordens största kyrka. Tornen är drygt 118 meter höga och bygget påbörjades på 1200-talet."
  }
];
