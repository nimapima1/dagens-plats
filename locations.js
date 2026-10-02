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
  },
  {
    name: "Triumfbågen", place: "Paris, Frankrike",
    lat: 48.87379, lng: 2.29504, from: { dist: 120, bearing: 60 },
    clue: "En enorm triumfbåge mitt i en stor rondell där tolv avenyer möts.",
    fact: "Beställdes av Napoleon 1806 och stod klart 1836. Under valvet ligger den okände soldatens grav."
  },
  {
    name: "Tower Bridge", place: "London, Storbritannien",
    lat: 51.50551, lng: -0.07535, from: { dist: 150, bearing: 190 },
    clue: "En bro med två gotiska torn över en berömd flod. Den förväxlas ofta med en annan bro i samma stad.",
    fact: "Öppnades 1894. Mittdelen kan fällas upp så att stora fartyg kan passera."
  },
  {
    name: "Edinburgh Castle", place: "Edinburgh, Skottland",
    lat: 55.94861, lng: -3.19999, from: { dist: 120, bearing: 90 },
    clue: "En medeltida fästning på en vulkanklippa som tornar upp sig över en skotsk huvudstad.",
    fact: "Slottet ligger på den utdöda vulkanen Castle Rock. Den äldsta bevarade delen, St Margaret's Chapel, är från 1100-talet."
  },
  {
    name: "Lutande tornet i Pisa", place: "Pisa, Italien",
    lat: 43.72297, lng: 10.39656, from: { dist: 150, bearing: 270 },
    clue: "Ett vitt marmortorn som lutar kraftigt, på en gräsmatta bredvid en katedral.",
    fact: "Bygget började 1173 och tornet började luta redan under byggtiden. Det är klocktorn till stadens katedral."
  },
  {
    name: "Markuskyrkan", place: "Venedig, Italien",
    lat: 45.43413, lng: 12.33890, from: { dist: 100, bearing: 280 },
    clue: "En kyrka med guldmosaiker och flera kupoler vid ett stort torg i en stad byggd på vatten.",
    fact: "Basilikan invigdes 1094 och är känd för sina bysantinska kupoler och guldmosaiker."
  },
  {
    name: "Parlamentet", place: "Budapest, Ungern",
    lat: 47.50728, lng: 19.04597, from: { dist: 400, bearing: 270 }, zoom: 1,
    clue: "En enorm nygotisk byggnad med kupol längs en flod som delar huvudstaden i två delar.",
    fact: "Byggdes 1885–1904 vid Donau i nygotisk stil och är Ungerns största byggnad."
  },
  {
    name: "Pyramiderna i Giza", place: "Giza, Egypten",
    lat: 29.97925, lng: 31.13418, from: { dist: 400, bearing: 150 },
    clue: "Enorma stenpyramider i en öken, intill en storstad vid en berömd flod.",
    fact: "Cheopspyramiden byggdes för över 4 500 år sedan och var världens högsta byggnad i ungefär 3 800 år."
  },
  {
    name: "Angkor Wat", place: "Siem Reap, Kambodja",
    lat: 13.41250, lng: 103.86699, from: { dist: 250, bearing: 280 },
    clue: "Ett enormt tempel med fem torn formade som lotusknoppar, omgivet av en vallgrav i en tropisk djungel.",
    fact: "Byggdes på 1100-talet som hinduiskt tempel och räknas som världens största religiösa byggnad."
  },
  {
    name: "Golden Gate Bridge", place: "San Francisco, USA",
    lat: 37.81990, lng: -122.47830, from: { dist: 450, bearing: 160 },
    clue: "En röd hängbro över ett sund, ofta insvept i dimma, vid en kuststad på västkusten.",
    fact: "Invigdes 1937 och var då världens längsta hängbro."
  },
  {
    name: "Kölner Dom", place: "Köln, Tyskland",
    lat: 50.94131, lng: 6.95813, from: { dist: 150, bearing: 180 },
    clue: "En gotisk katedral med två smala torn vid en stor flod. Bygget tog över 600 år.",
    fact: "Bygget började 1248 och blev klart först 1880. Domen är världsarv sedan 1996."
  },
  {
    name: "Burj Khalifa", place: "Dubai, Förenade Arabemiraten",
    lat: 25.19720, lng: 55.27438, from: { dist: 300, bearing: 150 },
    clue: "En smal glasskrapa som är den högsta byggnaden i världen, i en stad i öknen.",
    fact: "Invigdes 2010 och är med sina 828 meter världens högsta byggnad."
  },
  {
    name: "Hagia Sofia", place: "Istanbul, Turkiet",
    lat: 41.00859, lng: 28.98003, from: { dist: 150, bearing: 220 },
    clue: "En väldig byggnad med en jättelik kupol som varit både kyrka och moské, i en stad som ligger i två världsdelar.",
    fact: "Byggdes som kyrka 537 under kejsar Justinianus, har varit moské och museum och är sedan 2020 åter moské."
  },
  {
    name: "Lincolnmonumentet", place: "Washington D.C., USA",
    lat: 38.88940, lng: -77.05010, from: { dist: 250, bearing: 90 },
    clue: "Ett tempelliknande monument med en jättelik sittande staty av en president, vid en lång vattenspegel.",
    fact: "Invigdes 1922 och har 36 kolonner, en för varje delstat i USA när Lincoln dog."
  },
  {
    name: "Brooklyn Bridge", place: "New York, USA",
    lat: 40.70607, lng: -73.99686, from: { dist: 400, bearing: 120 },
    clue: "En gammal hängbro med spetsbågar i stenpelarna över en flod, mellan två stadsdelar i en storstad.",
    fact: "Öppnades 1883 och var då världens längsta hängbro."
  },
  {
    name: "Kristusstatyn (Cristo Redentor)", place: "Rio de Janeiro, Brasilien",
    lat: -22.95192, lng: -43.21047, from: { dist: 80, bearing: 90 },
    clue: "En enorm staty med utsträckta armar uppe på ett berg ovanför en stad vid havet.",
    fact: "Statyn är 30 meter hög, utan sockeln, och invigdes 1931."
  },
  {
    name: "Machu Picchu", place: "Cusco-regionen, Peru",
    lat: -13.16333, lng: -72.54500, from: { dist: 300, bearing: 180 },
    clue: "En forntida bergsstad med terrasser högt uppe i Anderna, byggd av ett kejsardöme.",
    fact: "Inkastaden byggdes på 1400-talet och blev känd för omvärlden 1911."
  },
  {
    name: "Atomium", place: "Bryssel, Belgien",
    lat: 50.89497, lng: 4.34151, from: { dist: 150, bearing: 180 },
    clue: "Nio blänkande klot sammanfogade i ett kubiskt mönster, byggt som symbol för en världsutställning.",
    fact: "Byggdes till världsutställningen i Bryssel 1958. Formen föreställer en järnkristall förstorad 165 miljarder gånger."
  },
  {
    name: "Wat Arun", place: "Bangkok, Thailand",
    lat: 13.74370, lng: 100.48890, from: { dist: 350, bearing: 110 }, zoom: 2,
    clue: "Ett tempel med ett högt, rikt dekorerat torn vid en bred flod i en asiatisk storstad, uppkallat efter gryningen.",
    fact: "Templet vid Chao Phraya-floden är känt för sitt centrala torn, en prang som är cirka 70 meter hög."
  },
  {
    name: "Hallgrímskirkja", place: "Reykjavik, Island",
    lat: 64.14175, lng: -21.92661, from: { dist: 100, bearing: 300 },
    clue: "En vit kyrka med ett högt torn och en form som ska påminna om basaltpelare, högt över en nordisk huvudstad.",
    fact: "Byggdes 1945–1986 och är drygt 74 meter hög. Formen är inspirerad av isländska basaltpelare."
  },
  {
    name: "Helsingfors domkyrka", place: "Helsingfors, Finland",
    lat: 60.17026, lng: 24.95206, from: { dist: 100, bearing: 180 },
    clue: "En vit klassicistisk kyrka med grön kupol högt upp på trappor vid ett stort torg i en nordisk huvudstad.",
    fact: "Stod klar 1852 och ritades av Carl Ludvig Engel. Kyrkan ligger vid Senatstorget."
  },
  {
    name: "Pantheon", place: "Rom, Italien",
    lat: 41.89861, lng: 12.47686, from: { dist: 80, bearing: 20 },
    clue: "Ett antikt romerskt tempel med kolonner och en enorm kupol med ett runt hål i toppen.",
    fact: "Byggdes omkring år 126 e.Kr. under kejsar Hadrianus och har världens största oarmerade betongkupol."
  },
  {
    name: "Mont-Saint-Michel", place: "Normandie, Frankrike",
    lat: 48.63603, lng: -1.51149, from: { dist: 500, bearing: 150 },
    clue: "En medeltida klosterö med en kyrka högst upp, omgiven av tidvatten vid en kust i norra Europa.",
    fact: "Klostret började byggas på 900-talet och ön är världsarv sedan 1979."
  },
  {
    name: "Stockholms stadshus", place: "Stockholm, Sverige",
    lat: 59.32752, lng: 18.05413, from: { dist: 400, bearing: 125 },
    clue: "En röd tegelbyggnad vid vattnet med ett högt torn krönt av tre kronor, där en berömd middag hålls varje år.",
    fact: "Invigdes 1923 och har ett 106 meter högt torn. Här hålls Nobelbanketten varje år."
  },
  {
    name: "Chichén Itzá", place: "Yucatán, Mexiko",
    lat: 20.68302, lng: -88.56866, from: { dist: 150, bearing: 315 },
    clue: "En stor stegpyramid från ett forntida indianfolk, mitt i en djungel på en halvö.",
    fact: "Pyramiden El Castillo har fyra trappor med 91 trappsteg vardera, och med plattformen blir det 365, ett för varje dag på året."
  },
  {
    name: "Obelisken", place: "Buenos Aires, Argentina",
    lat: -34.60371, lng: -58.38157, from: { dist: 150, bearing: 0 }, zoom: 1,
    clue: "En smal vit stenobelisk mitt på en av världens bredaste avenyer i en sydamerikansk huvudstad.",
    fact: "Byggdes 1936 för att fira stadens 400-årsjubileum. Den är 67,5 meter hög."
  },
  {
    name: "Gateway of India", place: "Mumbai, Indien",
    lat: 18.92200, lng: 72.83472, from: { dist: 100, bearing: 270 },
    clue: "En stor stenbåge vid en hamn, uppförd för att fira ett kungabesök.",
    fact: "Byggdes 1911–1924 för att minnas ett kungligt besök och står vid hamnen i Mumbai."
  },
  {
    name: "India Gate", place: "New Delhi, Indien",
    lat: 28.61293, lng: 77.22951, from: { dist: 250, bearing: 270 }, zoom: 1,
    clue: "En stor triumfbåge vid en bred ceremoniell allé, byggd som krigsminnesmärke.",
    fact: "Invigdes 1931 och är 42 meter högt. Det minns cirka 70 000 indiska soldater som stupade i första världskriget."
  },
  {
    name: "Gwanghwamun", place: "Seoul, Sydkorea",
    lat: 37.57595, lng: 126.97688, from: { dist: 150, bearing: 180 }, zoom: 1,
    clue: "Huvudporten till ett kungligt palats från en gammal dynasti, med höga berg bakom, i en storstad i Östasien.",
    fact: "Porten är huvudingång till Gyeongbokgung-palatset, som byggdes 1395 under Joseondynastin."
  },
  {
    name: "Petronas Towers", place: "Kuala Lumpur, Malaysia",
    lat: 3.15785, lng: 101.71163, from: { dist: 250, bearing: 90 },
    clue: "Två smala skyskrapor förbundna med en bro högt upp, i en asiatisk huvudstad.",
    fact: "Tornen är 452 meter höga och var världens högsta byggnader 1998–2004."
  },
  {
    name: "Marina Bay Sands", place: "Singapore",
    lat: 1.28368, lng: 103.86071, from: { dist: 700, bearing: 243 },
    clue: "Tre höga hotelltorn med ett stort skeppsliknande tak med en pool, vid en vik i en asiatisk stadsstat.",
    fact: "Öppnade 2010 och består av tre torn som bär upp ett skeppsformat Skypark med en pool."
  },
  {
    name: "Sydney Harbour Bridge", place: "Sydney, Australien",
    lat: -33.85230, lng: 151.21080, from: { dist: 400, bearing: 260 },
    clue: "En stor stålbåge över en hamn, med en berömd operabyggnad i närheten.",
    fact: "Öppnades 1932 och kallas Klädhängaren på grund av sin form."
  },
  {
    name: "CN Tower", place: "Toronto, Kanada",
    lat: 43.64255, lng: -79.38706, from: { dist: 300, bearing: 90 },
    clue: "Ett mycket högt betongtorn med en utsiktsplattform, vid en stor sjö i Nordamerika.",
    fact: "Stod klart 1976 och var världens högsta fristående byggnad i över 30 år."
  },
  {
    name: "Space Needle", place: "Seattle, USA",
    lat: 47.62058, lng: -122.34928, from: { dist: 250, bearing: 200 },
    clue: "Ett torn som ser ut som en flygande tefat på en pelare, byggt till en världsutställning på 1960-talet.",
    fact: "Byggdes till världsutställningen 1962 och är 184 meter högt."
  },
  {
    name: "Kapitolium (US Capitol)", place: "Washington D.C., USA",
    lat: 38.88977, lng: -77.00905, from: { dist: 350, bearing: 270 },
    clue: "En vit kupolbyggnad på en kulle där landets lagstiftande församling möts.",
    fact: "Byggdes i omgångar från 1793, och den nuvarande gjutjärnskupolen stod klar 1866."
  },
  {
    name: "Niagarafallen", place: "Niagara Falls, Kanada och USA",
    lat: 43.07966, lng: -79.07475, from: { dist: 200, bearing: 180 },
    clue: "Enorma vattenfall på en gräns mellan två länder, där en bred flod störtar ner över en hästskoformad kant.",
    fact: "Horseshoe Falls är det största av de tre vattenfallen och ligger på gränsen mellan Kanada och USA."
  },
  {
    name: "Taffelberget", place: "Kapstaden, Sydafrika",
    lat: -33.96280, lng: 18.40980, from: { dist: 4000, bearing: 345 },
    clue: "Ett bergsmassiv med platt topp som reser sig rakt ovanför en stad vid havet på en sydlig kontinent.",
    fact: "Berget är cirka 1 085 meter högt och är bakgrund till Kapstaden, ett av Afrikas mest kända landmärken."
  },

  // ---- Nya platser för femledtrådsspelet (svåra ledtrådar) ----
  {
    name: "Ales stenar", place: "Kåseberga, Sverige",
    lat: 55.38278, lng: 14.05611, from: { dist: 300, bearing: 200 },
    clue: "En skeppsformad ring av stora stenar på en kulle ovanför en strand vid ett inlandshav.",
    fact: "Skeppssättningen har 59 stenar och uppskattas vara ungefär 1 400 år gammal."
  },
  {
    name: "Skogskyrkogården", place: "Stockholm, Sverige",
    lat: 59.27556, lng: 18.09944, from: { dist: 200, bearing: 0 },
    clue: "En begravningsplats i en tallskog, ritad av två arkitekter, med en lång stig mot ett kors.",
    fact: "Ritades av Gunnar Asplund och Sigurd Lewerentz och är världsarv sedan 1994. Greta Garbo är begravd här."
  },
  {
    name: "Hôtel d'Alsace", place: "Paris, Frankrike",
    lat: 48.85634, lng: 2.33603, from: { dist: 40, bearing: 90 },
    clue: "Ett litet hotell på en smal gata där en irländsk författare dog i sin sista sjukdom.",
    fact: "Här dog författaren Oscar Wilde 1900. Hotellet heter numera L'Hôtel och ligger i Saint-Germain-des-Prés."
  },
  {
    name: "Pont du Gard", place: "Gard, Frankrike",
    lat: 43.94722, lng: 4.53500, from: { dist: 150, bearing: 200 },
    clue: "En enorm romersk stenbro i tre våningar över en flod, byggd för att leda vatten.",
    fact: "Akvedukten byggdes under första århundradet e.Kr., är cirka 49 meter hög och är världsarv sedan 1985."
  },
  {
    name: "Trulli i Alberobello", place: "Apulien, Italien",
    lat: 40.78250, lng: 17.23800, from: { dist: 100, bearing: 270 },
    clue: "En stad full av vita stenhus med koniska tak, byggda utan murbruk.",
    fact: "Trullihusen har koniska tak av torrmurad sten. De finns i Apulien och Alberobello är världsarv sedan 1996."
  },
  {
    name: "Piazza del Campo", place: "Siena, Italien",
    lat: 43.31838, lng: 11.33153, from: { dist: 60, bearing: 0 },
    clue: "Ett skalformat torg i en medeltida stad, där en hästkapplöpning hålls varje sommar.",
    fact: "Torget i Siena är format som ett skal. Här hålls hästkapplöpningen Palio två gånger varje sommar."
  },
  {
    name: "Hōryū-ji", place: "Nara, Japan",
    lat: 34.61444, lng: 135.73444, from: { dist: 100, bearing: 180 },
    clue: "Ett buddhistiskt tempelområde med några av världens äldsta bevarade trähus, grundat på 600-talet.",
    fact: "Templet grundades år 607 och har några av världens äldsta trähus. Det är världsarv sedan 1993."
  },
  {
    name: "Shirakawa-go", place: "Gifu, Japan",
    lat: 36.25744, lng: 136.90611, from: { dist: 300, bearing: 0 },
    clue: "En bergsby med gårdar vars branta halmtak ser ut som två händer som ber.",
    fact: "Byn är känd för sina gårdar i gassho-zukuri-stil, med branta halmtak. Den är världsarv sedan 1995."
  },
  {
    name: "Atombombskupolen (Genbaku Dome)", place: "Hiroshima, Japan",
    lat: 34.39556, lng: 132.45361, from: { dist: 60, bearing: 270 },
    clue: "Ruinen av en kupolbyggnad som står kvar som minnesmärke i en stads fredspark.",
    fact: "Byggnaden stod nära den plats där atombomben exploderade över Hiroshima 6 augusti 1945. Världsarv sedan 1996."
  },
  {
    name: "Tokyo Skytree", place: "Tokyo, Japan",
    lat: 35.71006, lng: 139.81070, from: { dist: 700, bearing: 300 }, pitch: 35,
    clue: "Ett mycket högt sändartorn med glasplattformar som är världens högsta fristående torn.",
    fact: "Öppnade 2012 och är 634 meter högt, världens högsta fristående torn."
  },
  {
    name: "Shibuya-övergången", place: "Tokyo, Japan",
    lat: 35.65950, lng: 139.70070, from: { dist: 60, bearing: 200 }, pitch: 10,
    clue: "En enorm gångkorsning där alla bilar stannar samtidigt och hundratals människor går över på en gång.",
    fact: "Shibuya Scramble Crossing är en av världens mest trafikerade övergångar. Flera tusen människor korsar den vid varje grönt ljus."
  },
  {
    name: "Lorraine Motel", place: "Memphis, USA",
    lat: 35.13488, lng: -90.05803, from: { dist: 60, bearing: 180 },
    clue: "Ett före detta motell med ett balkongfönster i en stad vid en stor flod, nu museum.",
    fact: "Här sköts Martin Luther King Jr. den 4 april 1968. Motellet är numera National Civil Rights Museum."
  },
  {
    name: "Hoover Dam", place: "Nevada och Arizona, USA",
    lat: 36.01604, lng: -114.73708, from: { dist: 150, bearing: 330 },
    clue: "En enorm betongdamm i en kanjon som tämjer en stor flod i en öken.",
    fact: "Byggdes 1931–1936 i Black Canyon vid Coloradofloden och är 221 meter hög."
  }
];
