import { useState, useEffect, useRef, useCallback, type FormEvent, type ChangeEvent } from "react";
import { RefreshCw, Plus, Trash2, Upload, Loader2, CheckCircle, AlertCircle, Wand2,
         ShieldOff, RotateCcw, MinusCircle, Undo2 } from "lucide-react";
import styles from "./asset-management.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  provider: string;
  type: string;
  bin: string;
  bank: string;
  country: string;
  expiry: string;
  limitUsd: number;
  priceUsdCents: number;
  stock: number;
  status: "in_stock" | "sold_out";
}

interface BinInfo {
  scheme: string; // visa / mastercard / amex / discover
  type: string; // DEBIT / CREDIT / PREPAID
  brand: string;
  bank: string;
  country: string; // ISO 2-letter
  countryName: string;
}

type BinStatus = "idle" | "loading" | "ok" | "error";

// ─── Country → States mapping (top countries) ────────────────────────────────

// ─── Banks by Country ─────────────────────────────────────────────────────────

const BANKS_BY_COUNTRY: Record<string, string[]> = {
  US: [
    "Chase Bank", "Bank of America", "Wells Fargo", "Citibank", "US Bank",
    "Capital One", "PNC Bank", "TD Bank", "Truist", "Goldman Sachs",
    "Fifth Third Bank", "Regions Bank", "Citizens Bank", "HSBC USA",
    "Santander Bank", "BMO Harris Bank", "Comerica Bank", "First Republic Bank",
    "Silicon Valley Bank", "American Express Bank", "Discover Bank",
  ],
  GB: [
    "Barclays", "HSBC UK", "Lloyds Bank", "NatWest", "Santander UK",
    "Standard Chartered UK", "Nationwide Building Society", "Metro Bank",
    "Virgin Money", "TSB Bank", "Co-operative Bank", "Monzo", "Starling Bank",
  ],
  CA: [
    "Royal Bank of Canada (RBC)", "Toronto-Dominion Bank (TD)", "Scotiabank",
    "Bank of Montreal (BMO)", "Canadian Imperial Bank of Commerce (CIBC)",
    "National Bank of Canada", "HSBC Canada", "Simplii Financial",
    "Tangerine Bank", "EQ Bank", "Motusbank", "Laurentian Bank",
  ],
  AU: [
    "Commonwealth Bank", "Westpac", "ANZ Bank", "National Australia Bank (NAB)",
    "Macquarie Bank", "Bendigo Bank", "Suncorp Bank", "Bankwest",
    "ING Australia", "Citibank Australia", "HSBC Australia",
  ],
  DE: [
    "Deutsche Bank", "Commerzbank", "KfW Bank", "DZ Bank", "HypoVereinsbank (UniCredit)",
    "Landesbank Baden-Württemberg", "Norddeutsche Landesbank", "ING Germany",
    "Comdirect Bank", "Targobank", "Postbank", "Sparkasse",
  ],
  FR: [
    "BNP Paribas", "Société Générale", "Crédit Agricole", "Natixis",
    "Banque Populaire", "Caisse d'Épargne", "HSBC France", "Crédit Mutuel",
    "La Banque Postale", "BNP Paribas Personal Finance",
  ],
  IT: [
    "UniCredit", "Intesa Sanpaolo", "Banca Monte dei Paschi di Siena",
    "UBI Banca", "Banco BPM", "Credito Valtellinese", "Banca Popolare di Sondrio",
    "Banca Mediolanum", "FinecoBank", "CheBanca!",
  ],
  ES: [
    "Banco Santander", "BBVA", "CaixaBank", "Banco Sabadell",
    "Bankinter", "Kutxabank", "Abanca", "Unicaja Banco",
    "Ibercaja Banco", "Banco Popular Español",
  ],
  NL: [
    "ING Bank", "ABN AMRO", "Rabobank", "De Volksbank (NN)",
    "Triodos Bank", "Van Lanschot Kempen", "Knab", "Bunq",
  ],
  BE: [
    "BNP Paribas Fortis", "KBC Bank", "ING Belgium", "Belfius",
    "Argenta", "AXA Bank Belgium", "Crelan", "VDK Bank",
  ],
  CH: [
    "UBS", "Credit Suisse", "Zürcher Kantonalbank", "Raiffeisen Switzerland",
    "PostFinance", "Julius Baer", "Vontobel", "Pictet Group",
  ],
  AT: [
    "Erste Group Bank", "Raiffeisen Bank International", "UniCredit Bank Austria",
    "Österreichische Postsparkasse (P.S.K.)", "BAWAG P.S.K.", "Oberbank",
  ],
  SE: [
    "Swedbank", "SEB", "Nordea Sweden", "Danske Bank Sweden",
    "Handelsbanken", "Länsförsäkringar Bank", "SBAB", "Skandiabanken",
  ],
  NO: [
    "DNB Bank", "Nordea Norway", "SpareBank 1", "Danske Bank Norway",
    "Handelsbanken Norway", "Storebrand Bank", "SR-Bank",
  ],
  DK: [
    "Danske Bank", "Nordea Denmark", "Jyske Bank", "Sydbank",
    "Nykredit Bank", "Arbejdernes Landsbank", "Saxo Bank",
  ],
  FI: [
    "Nordea Finland", "OP Financial Group", "Danske Bank Finland",
    "Handelsbanken Finland", "Ålandsbanken", "S-Pankki",
  ],
  PL: [
    "PKO BP", "Bank Pekao", "ING Bank Śląski", "mBank", "Santander Bank Polska",
    "Alior Bank", "Millennium Bank", "BNP Paribas Poland", "Credit Agricole Poland",
  ],
  PT: [
    "Caixa Geral de Depósitos", "Millennium BCP", "Banco Santander Portugal",
    "Novo Banco", "Banco BPI", "Montepio",
  ],
  GR: [
    "National Bank of Greece", "Piraeus Bank", "Alpha Bank", "Eurobank Ergasias",
    "Attica Bank", "Bank of Greece",
  ],
  CZ: [
    "Česká spořitelna", "ČSOB", "Komerční banka", "UniCredit Bank Czech Republic",
    "Raiffeisenbank", "Moneta Money Bank", "Air Bank",
  ],
  RO: [
    "Banca Transilvania", "BRD – Groupe Société Générale", "BCR (Erste Group)",
    "ING Bank Romania", "Raiffeisen Bank Romania", "OTP Bank Romania",
  ],
  HU: [
    "OTP Bank", "K&H Bank", "Erste Bank Hungary", "CIB Bank",
    "Raiffeisen Bank Hungary", "UniCredit Bank Hungary", "MKB Bank",
  ],
  SK: [
    "Slovenská sporiteľňa", "Všeobecná úverová banka (VÚB)", "Tatra banka",
    "ČSOB Slovakia", "Prima banka", "OTP Banka Slovensko",
  ],
  HR: [
    "Zagrebačka banka", "Privredna banka Zagreb (PBZ)", "Erste&Steiermärkische Bank",
    "Raiffeisen Bank Croatia", "OTP Bank Croatia", "Addiko Bank Croatia",
  ],
  IN: [
    "State Bank of India (SBI)", "HDFC Bank", "ICICI Bank", "Punjab National Bank",
    "Axis Bank", "Bank of Baroda", "Canara Bank", "Union Bank of India",
    "IDBI Bank", "IndusInd Bank", "Kotak Mahindra Bank", "Yes Bank",
  ],
  CN: [
    "Industrial and Commercial Bank of China (ICBC)", "China Construction Bank",
    "Agricultural Bank of China", "Bank of China", "Bank of Communications",
    "China Merchants Bank", "China CITIC Bank", "Shanghai Pudong Development Bank",
    "China Minsheng Banking Corp", "China Everbright Bank",
  ],
  JP: [
    "Mitsubishi UFJ Financial Group (MUFG)", "Sumitomo Mitsui Banking Corporation",
    "Mizuho Financial Group", "Japan Post Bank", "Resona Holdings",
    "Seven Bank", "Sony Bank", "Rakuten Bank",
  ],
  KR: [
    "Shinhan Bank", "Kookmin Bank (KB)", "Hana Bank", "Woori Bank",
    "Industrial Bank of Korea", "Nonghyup Bank", "SC Bank Korea",
  ],
  SG: [
    "DBS Bank", "OCBC Bank", "United Overseas Bank (UOB)", "Standard Chartered Singapore",
    "Citibank Singapore", "HSBC Singapore", "Maybank Singapore",
  ],
  HK: [
    "HSBC Hong Kong", "Standard Chartered Hong Kong", "Bank of China (Hong Kong)",
    "Hang Seng Bank", "Bank of East Asia", "OCBC Wing Hang", "Dah Sing Bank",
  ],
  TW: [
    "Bank of Taiwan", "CTBC Bank", "Cathay United Bank", "Mega International Commercial Bank",
    "Taipei Fubon Bank", "Land Bank of Taiwan", "Chang Hwa Bank",
  ],
  TH: [
    "Bangkok Bank", "Kasikornbank (KBank)", "Siam Commercial Bank (SCB)",
    "Krungthai Bank", "Bank of Ayudhya (Krungsri)", "Thanachart Bank",
    "TMBThanachart Bank (ttb)", "CIMB Thai",
  ],
  ID: [
    "Bank Central Asia (BCA)", "Bank Mandiri", "Bank Rakyat Indonesia (BRI)",
    "Bank Negara Indonesia (BNI)", "CIMB Niaga", "Bank Danamon",
    "Panin Bank", "Bank Permata",
  ],
  MY: [
    "Malayan Banking Berhad (Maybank)", "CIMB Bank", "Public Bank Berhad",
    "RHB Bank", "Hong Leong Bank", "AmBank", "Bank Islam Malaysia",
    "Standard Chartered Malaysia",
  ],
  PH: [
    "Banco de Oro (BDO)", "Metrobank", "Bank of the Philippine Islands (BPI)",
    "Land Bank of the Philippines", "Security Bank", "China Banking Corporation",
    "EastWest Bank", "UnionBank",
  ],
  VN: [
    "Vietcombank", "Bank for Investment and Development of Vietnam (BIDV)",
    "VietinBank", "Military Commercial Joint Stock Bank (MBBank)",
    "Asia Commercial Bank (ACB)", "Techcombank", "Sacombank",
  ],
  PK: [
    "Habib Bank Limited (HBL)", "National Bank of Pakistan (NBP)", "United Bank Limited (UBL)",
    "MCB Bank", "Allied Bank Limited (ABL)", "Bank Alfalah", "Meezan Bank",
  ],
  BD: [
    "Sonali Bank", "Janata Bank", "Agrani Bank", "Rupali Bank",
    "BRAC Bank", "Dutch-Bangla Bank", "Eastern Bank Limited", "United Commercial Bank",
  ],
  LK: [
    "Bank of Ceylon", "People's Bank", "Commercial Bank of Ceylon", "Hatton National Bank",
    "Sampath Bank", "Nations Trust Bank", "Seylan Bank",
  ],
  AE: [
    "Emirates NBD", "First Abu Dhabi Bank (FAB)", "Abu Dhabi Commercial Bank (ADCB)",
    "Dubai Islamic Bank", "Mashreq Bank", "Abu Dhabi Islamic Bank (ADIB)",
    "Emirates Islamic", "RAKBank",
  ],
  SA: [
    "National Commercial Bank (NCB)", "Riyad Bank", "Banque Saudi Fransi",
    "Saudi British Bank (SABB)", "Arab National Bank", "Al Rajhi Bank",
    "Saudi Investment Bank", "Samba Financial Group",
  ],
  IL: [
    "Bank Hapoalim", "Bank Leumi", "Israel Discount Bank", "Mizrahi Tefahot Bank",
    "First International Bank of Israel (FIBI)", "Bank Yahav", "Israel Postal Bank",
  ],
  TR: [
    "Türkiye İş Bankası", "Garanti BBVA", "Akbank", "Yapı Kredi",
    "Halkbank", "Ziraat Bankası", "VakıfBank", "QNB Finansbank",
  ],
  EG: [
    "National Bank of Egypt (NBE)", "Banque Misr", "Commercial International Bank (CIB)",
    "Qatar National Bank (QNB) Egypt", "Banque du Caire", "Alexandria Bank",
  ],
  ZA: [
    "Standard Bank South Africa", "First National Bank (FNB)", "Absa Bank",
    "Nedbank", "Capitec Bank", "Investec Bank", "African Bank",
  ],
  NG: [
    "First Bank of Nigeria", "Guaranty Trust Bank (GTBank)", "Access Bank",
    "United Bank for Africa (UBA)", "Zenith Bank", "Ecobank Nigeria",
    "Union Bank of Nigeria", "Sterling Bank",
  ],
  KE: [
    "Equity Bank", "KCB Bank", "Co-operative Bank of Kenya", "Standard Chartered Kenya",
    "Barclays Bank of Kenya (Absa)", "Diamond Trust Bank", "I&M Bank",
  ],
  GH: [
    "Ghana Commercial Bank (GCB)", "Ecobank Ghana", "Standard Chartered Ghana",
    "Barclays Ghana (Absa)", "Fidelity Bank Ghana", "CalBank", "Guaranty Trust Bank Ghana",
  ],
  MX: [
    "BBVA México", "Santander México", "Banorte", "Citibanamex",
    "HSBC México", "Scotiabank México", "Inbursa", "Banregio",
  ],
  BR: [
    "Itaú Unibanco", "Banco do Brasil", "Bradesco", "Caixa Econômica Federal",
    "Santander Brasil", "Banco Safra", "Nubank", "Inter",
  ],
  AR: [
    "Banco de la Nación Argentina", "Banco Santander Río", "Banco Galicia",
    "BBVA Banco Francés", "Banco Macro", "Banco Patagonia", "Banco Itaú Argentina",
  ],
  CO: [
    "Bancolombia", "Banco de Bogotá", "BBVA Colombia", "Davivienda",
    "Banco de Occidente", "Scotiabank Colpatria", "Itaú Colombia",
  ],
  CL: [
    "Banco de Chile", "Banco Santander Chile", "Banco Estado", "Scotiabank Chile",
    "Banco BCI", "Banco Itaú Chile", "Banco Security", "CorpBanca",
  ],
  PE: [
    "Banco de Crédito del Perú (BCP)", "BBVA Perú", "Scotiabank Perú",
    "Interbank", "Banco de la Nación", "Banco Falabella",
  ],
  VE: [
    "Banco de Venezuela", "Banesco", "Banco Mercantil", "BBVA Provincial",
    "Banco Nacional de Crédito", "Banco Exterior", "Banco Caroní",
  ],
  RU: [
    "Sberbank", "VTB Bank", "Gazprombank", "Alfa-Bank", "Tinkoff Bank",
    "Raiffeisenbank Russia", "Rosbank", "Promsvyazbank",
  ],
  UA: [
    "PrivatBank", "Oschadbank", "Ukreximbank", "Raiffeisen Bank Aval",
    "Ukrgasbank", "Sense Bank", "Credit Agricole Ukraine",
  ],
  NZ: [
    "ANZ Bank New Zealand", "ASB Bank", "Bank of New Zealand (BNZ)", "Westpac New Zealand",
    "Kiwibank", "Heartland Bank", "The Co-operative Bank",
  ],
};

// ─── Cities by Country ─────────────────────────────────────────────────────────

const COUNTRY_CITIES: Record<string, string[]> = {
  US: [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
    "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
    "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis",
    "Seattle", "Denver", "Washington", "Boston", "El Paso", "Nashville",
    "Detroit", "Oklahoma City", "Las Vegas", "Louisville", "Baltimore",
    "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa", "Sacramento",
    "Atlanta", "Kansas City", "Colorado Springs", "Omaha", "Raleigh",
  ],
  GB: [
    "London", "Birmingham", "Manchester", "Leeds", "Glasgow", "Sheffield",
    "Bradford", "Liverpool", "Edinburgh", "Cardiff", "Belfast", "Leicester",
    "Coventry", "Nottingham", "Newcastle", "Sunderland", "Brighton", "Hull",
    "Plymouth", "Stoke-on-Trent", "Derby", "Southampton", "Wolverhampton",
    "Portsmouth", "York", "Oxford", "Cambridge", "Bristol", "Bath",
  ],
  CA: [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa",
    "Winnipeg", "Quebec City", "Hamilton", "Kitchener", "London", "Halifax",
    "St. Catharines", "Oshawa", "Victoria", "Windsor", "Saskatoon", "Regina",
    "Barrie", "St. John's", "Kelowna", "Abbotsford", "Trois-Rivières",
    "Kingston", "Guelph", "Moncton", "Brantford", "Thunder Bay", "Peterborough",
  ],
  AU: [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast",
    "Newcastle", "Canberra", "Sunshine Coast", "Wollongong", "Hobart",
    "Geelong", "Townsville", "Cairns", "Toowoomba", "Darwin", "Ballarat",
    "Bendigo", "Albury", "Launceston", "Mackay", "Rockhampton", "Bunbury",
    "Bundaberg", "Coffs Harbour", "Wagga Wagga", "Hervey Bay", "Port Macquarie",
  ],
  DE: [
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart",
    "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden",
    "Hanover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
    "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden",
    "Gelsenkirchen", "Mönchengladbach", "Braunschweig", "Chemnitz", "Kiel",
  ],
  FR: [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes",
    "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims",
    "Le Havre", "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers",
    "Nîmes", "Villeurbanne", "Saint-Denis", "Le Mans", "Aix-en-Provence",
    "Brest", "Limoges", "Clermont-Ferrand", "Tours", "Amiens", "Perpignan",
  ],
  IT: [
    "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa",
    "Bologna", "Florence", "Bari", "Catania", "Venice", "Verona",
    "Messina", "Padua", "Trieste", "Taranto", "Brescia", "Prato",
    "Reggio Calabria", "Modena", "Parma", "Perugia", "Livorno", "Ravenna",
    "Cagliari", "Foggia", "Rimini", "Salerno", "Ferrara", "Sassari",
  ],
  ES: [
    "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga",
    "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba",
    "Valladolid", "Vigo", "Gijón", "Hospitalet de Llobregat", "A Coruña",
    "Vitoria-Gasteiz", "Granada", "Elche", "Oviedo", "Santa Cruz de Tenerife",
    "Badalona", "Cartagena", "Terrassa", "Jerez de la Frontera", "Sabadell",
  ],
  NL: [
    "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg",
    "Groningen", "Almere", "Breda", "Nijmegen", "Enschede", "Haarlem",
    "Arnhem", "Zaanstad", "Amersfoort", "Apeldoorn", "Hoofddorp", "Maastricht",
    "Leiden", "Dordrecht", "Zoetermeer", "Zwolle", "Emmen", "Delft",
  ],
  BE: [
    "Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges",
    "Namur", "Leuven", "Mons", "Mechelen", "Aalst", "La Louvière",
    "Kortrijk", "Hasselt", "Ostend", "Sint-Niklaas", "Tournai", "Genk",
    "Seraing", "Roeselare", "Verviers", "Mouscron", "Dendermonde", "Beveren",
  ],
  CH: [
    "Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur",
    "Lucerne", "St. Gallen", "Lugano", "Biel/Bienne", "Thun", "Köniz",
    "Bellinzona", "Fribourg", "Chur", "Uster", "Sion", "Emmen",
    "Zug", "Schaffhausen", "Frauenfeld", "Liestal", "Olten", "Solothurn",
  ],
  AT: [
    "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt",
    "Wels", "Villach", "Sankt Pölten", "Dornbirn", "Steyr", "Leonding",
    "Klosterneuburg", "Wolfsberg", "Leoben", "Traun", "Amstetten",
    "Ansfelden", "Baden bei Wien", "Stockerau", "Marchtrenk", "Korneuburg",
  ],
  SE: [
    "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Linköping", "Västerås",
    "Örebro", "Norrköping", "Helsingborg", "Jönköping", "Umeå", "Lund",
    "Borås", "Sundsvall", "Gävle", "Växjö", "Karlstad", "Södertälje",
    "Trollhättan", "Kalmar", "Kristianstad", "Falun", "Skövde", "Östersund",
  ],
  NO: [
    "Oslo", "Bergen", "Trondheim", "Stavanger", "Bærum", "Drammen",
    "Fredrikstad", "Sandnes", "Tromsø", "Haugesund", "Gjøvik", "Porsgrunn",
    "Kristiansand", "Ålesund", "Tønsberg", "Moss", "Bodø", "Arendal",
    "Sandefjord", "Skien", "Molde", "Harstad", "Lillehammer", "Halden",
  ],
  DK: [
    "Copenhagen", "Aarhus", "Odense", "Aalborg", "Frederiksberg", "Esbjerg",
    "Horsens", "Randers", "Kolding", "Vejle", "Roskilde", "Helsingør",
    "Silkeborg", "Herning", "Næstved", "Greve Strand", "Tårnby", "Fredericia",
    "Ballerup", "Rødovre", "Vordingborg", "Lyngby-Taarbæk", "Gladsaxe", "Hvidovre",
  ],
  FI: [
    "Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku",
    "Jyväskylä", "Lahti", "Kuopio", "Kouvola", "Pori", "Joensuu",
    "Lappeenranta", "Vaasa", "Hämeenlinna", "Rovaniemi", "Seinäjoki",
    "Mikkeli", "Kotka", "Salo", "Kokkola", "Imatra", "Kajaani", "Nokia",
  ],
  PL: [
    "Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk",
    "Szczecin", "Bydgoszcz", "Lublin", "Katowice", "Białystok", "Gdynia",
    "Częstochowa", "Radom", "Sosnowiec", "Toruń", "Kielce", "Rzeszów",
    "Olsztyn", "Gliwice", "Zabrze", "Bytom", "Zielona Góra", "Rybnik",
  ],
  PT: [
    "Lisbon", "Porto", "Amadora", "Braga", "Setúbal", "Coimbra",
    "Queluz", "Funchal", "Cacem", "Vila Nova de Gaia", "Algés", "Loures",
    "Felgueiras", "Evora", "Rio Tinto", "Barreiro", "Aveiro", "Odivelas",
    "Rio de Mouro", "Corroios", "Barcelos", "Guimarães", "Ermesinde", "Maia",
  ],
  GR: [
    "Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos",
    "Ioannina", "Trikala", "Chalcis", "Serres", "Karditsa", "Alexandroupoli",
    "Xanthi", "Komotini", "Agrinio", "Kalamata", "Kavala", "Drama",
    "Veria", "Kozani", "Katerini", "Ptolemaida", "Veroia", "Corfu",
  ],
  CZ: [
    "Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc",
    "České Budějovice", "Hradec Králové", "Ústí nad Labem", "Pardubice",
    "Zlín", "Havířov", "Kladno", "Most", "Opava", "Frýdek-Místek",
    "Jihlava", "Karlovy Vary", "Teplice", "Chomutov", "Karviná", "Jablonec nad Nisou",
  ],
  RO: [
    "Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova",
    "Brașov", "Galați", "Ploiești", "Oradea", "Brăila", "Arad",
    "Pitești", "Sibiu", "Bacău", "Târgu Mureș", "Baia Mare", "Buzău",
    "Botoșani", "Satu Mare", "Râmnicu Vâlcea", "Suceava", "Drobeta-Turnu Severin",
  ],
  HU: [
    "Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr",
    "Nyíregyháza", "Kecskemét", "Székesfehérvár", "Szombathely", "Szolnok",
    "Tatabánya", "Kaposvár", "Érd", "Veszprém", "Békéscsaba", "Zalaegerszeg",
    "Sopron", "Eger", "Nagykanizsa", "Dunaújváros", "Hódmezővásárhely",
  ],
  SK: [
    "Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica",
    "Trnava", "Martin", "Trenčín", "Poprad", "Prievidza", "Zvolen",
    "Michalovce", "Spišská Nová Ves", "Komárno", "Levice", "Humenné", "Bardejov",
    "Liptovský Mikuláš", "Lučenec", "Pezinok", "Ružomberok", "Piešťany",
  ],
  HR: [
    "Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Slavonski Brod",
    "Karlovac", "Varaždin", "Šibenik", "Dubrovnik", "Sisak", "Kaštela",
    "Vukovar", "Bjelovar", "Vinkovci", "Koprivnica", "Pula", "Đakovo",
    "Čakovec", "Požega", "Zaprešić", "Solin", "Kutina", "Metković",
  ],
  IN: [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
    "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur",
    "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad",
    "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  ],
  CN: [
    "Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Chengdu", "Hangzhou",
    "Wuhan", "Xi'an", "Suzhou", "Nanjing", "Chongqing", "Tianjin",
    "Wuxi", "Ningbo", "Zhengzhou", "Changsha", "Qingdao", "Foshan",
    "Dongguan", "Shenyang", "Dalian", "Kunming", "Hefei", "Shijiazhuang",
  ],
  JP: [
    "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka",
    "Kobe", "Kawasaki", "Kyoto", "Saitama", "Hiroshima", "Sendai",
    "Kitakyushu", "Chiba", "Sakai", "Niigata", "Hamamatsu", "Kumamoto",
    "Sagamihara", "Okayama", "Shizuoka", "Kanazawa", "Utsunomiya", "Matsuyama",
  ],
  KR: [
    "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju",
    "Suwon", "Ulsan", "Changwon", "Goyang", "Yongin", "Seongnam",
    "Bucheon", "Cheongju", "Ansan", "Namyangju", "Hwaseong", "Anyang",
    "Cheonan", "Pohang", "Gimhae", "Jeonju", "Siheung", "Pyeongtaek",
  ],
  SG: [
    "Singapore", "Woodlands", "Tampines", "Pasir Ris", "Yishun", "Jurong West",
    "Choa Chu Kang", "Hougang", "Sengkang", "Punggol", "Ang Mo Kio", "Bedok",
    "Clementi", "Bukit Timah", "Bishan", "Toa Payoh", "Geylang", "Marine Parade",
    "Bukit Merah", "Queenstown", "Kallang", "Bukit Panjang", "Serangoon", "Novena",
  ],
  HK: [
    "Hong Kong Island", "Kowloon", "New Territories", "Victoria Peak", "Central",
    "Wan Chai", "Causeway Bay", "Tsim Sha Tsui", "Mong Kok", "Yau Ma Tei",
    "Sham Shui Po", "Kowloon Bay", "Kwun Tong", "Wong Tai Sin", "Sha Tin",
    "Tuen Mun", "Tseung Kwan O", "Tai Po", "Fanling", "Yuen Long", "Sheung Shui",
  ],
  TW: [
    "Taipei", "New Taipei City", "Taichung", "Kaohsiung", "Tainan", "Taoyuan",
    "Hsinchu", "Keelung", "Chiayi", "Changhua", "Pingtung", "Yunlin",
    "Nantou", "Hualien", "Ilan", "Taitung", "Miaoli", "Kinmen", "Penghu",
    "Lienchiang",
  ],
  TH: [
    "Bangkok", "Nonthaburi", "Nakhon Ratchasima", "Chiang Mai", "Hat Yai",
    "Udon Thani", "Pak Kret", "Khon Kaen", "Nakhon Si Thammarat", "Lampang",
    "Si Racha", "Phitsanulok", "Thon Buri", "Sattahip", "Yala", "Surat Thani",
    "Chon Buri", "Rayong", "Samut Prakan", "Ratchaburi", "Ayutthaya",
  ],
  ID: [
    "Jakarta", "Surabaya", "Bandung", "Bekasi", "Medan", "Tangerang",
    "Depok", "Semarang", "Palembang", "Makassar", "South Tangerang", "Batam",
    "Pekanbaru", "Bogor", "Bandar Lampung", "Padang", "Malang", "Samarinda",
    "Tasikmalaya", "Denpasar", "Pontianak", "Jambi", "Cimahi", "Surakarta",
  ],
  MY: [
    "Kuala Lumpur", "George Town", "Ipoh", "Shah Alam", "Petaling Jaya",
    "Johor Bahru", "Subang Jaya", "Iskandar Puteri", "Klang", "Kuantan",
    "Kota Kinabalu", "Kuching", "Malacca City", "Miri", "Alor Setar",
    "Sungai Petani", "Kuala Terengganu", "Muar", "Butterworth", "Seberang Perai",
  ],
  PH: [
    "Quezon City", "Manila", "Caloocan", "Davao City", "Cebu City", "Zamboanga City",
    "Antipolo", "Pasig", "Taguig", "Valenzuela", "Dasmariñas", "Makati",
    "Marikina", "Parañaque", "Muntinlupa", "Las Piñas", "Mandaluyong",
    "Bacolod", "Iloilo City", "General Santos", "Malolos", "Cainta",
  ],
  VN: [
    "Ho Chi Minh City", "Hanoi", "Can Tho", "Hai Phong", "Da Nang", "Bien Hoa",
    "Hue", "Nha Trang", "Vinh", "Qui Nhon", "My Tho", "Thai Nguyen",
    "Long Xuyen", "Buon Ma Thuot", "Nam Dinh", "Phan Thiet", "Cam Ranh",
    "Vung Tau", "Ha Long", "Thanh Hoa", "Play Cu", "Tuy Hoa",
  ],
  PK: [
    "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan",
    "Hyderabad", "Peshawar", "Quetta", "Islamabad", "Sargodha", "Sialkot",
    "Bahawalpur", "Sukkur", "Jhang", "Sheikhupura", "Larkana", "Gujrat",
    "Mardan", "Kasur", "Rahim Yar Khan", "Sahiwal", "Okara", "Wah",
  ],
  BD: [
    "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Barisal", "Sylhet",
    "Rangpur", "Comilla", "Narayanganj", "Gazipur", "Mymensingh", "Jessore",
    "Kushtia", "Bogra", "Dinajpur", "Tangail", "Pabna", "Noakhali",
    "Brahmanbaria", "Feni", "Faridpur", "Jamalpur", "Naogaon", "Cox's Bazar",
  ],
  LK: [
    "Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Negombo", "Pita Kotte",
    "Sri Jayewardenepura Kotte", "Kandy", "Galle", "Trincomalee", "Jaffna",
    "Batticaloa", "Katunayake", "Dambulla", "Kolonnawa", "Anuradhapura",
    "Ratnapura", "Gampaha", "Matara", "Badulla", "Homagama",
  ],
  AE: [
    "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah",
    "Fujairah", "Umm Al Quwain", "Dibba Al-Fujairah", "Khor Fakkan",
    "Jebel Ali", "Madinat Zayed", "Ruwais", "Dhaid", "Ghayathi",
    "Liwa Oasis", "Kalba", "Dibba Al-Hisn",
  ],
  SA: [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Ta'if",
    "Tabuk", "Buraidah", "Khobar", "Hofuf", "Jubail", "Khamis Mushait",
    "Ha'il", "Najran", "Yanbu", "Abha", "Qatif", "Muhayil", "Arar",
    "Sakaka", "Hafar Al-Batin", "Jizan", "Unaizah",
  ],
  IL: [
    "Jerusalem", "Tel Aviv", "Haifa", "Ashdod", "Rishon LeZion", "Petah Tikva",
    "Beersheba", "Netanya", "Holon", "Bnei Brak", "Ramat Gan", "Bat Yam",
    "Rehovot", "Herzliya", "Kfar Saba", "Modi'in", "Hadera", "Ra'anana",
    "Lod", "Nazareth", "Nahariya", "Givatayim", "Eilat",
  ],
  TR: [
    "Istanbul", "Ankara", "Izmir", "Bursa", "Adana", "Gaziantep",
    "Konya", "Antalya", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir",
    "Samsun", "Denizli", "Şanlıurfa", "Malatya", "Kahramanmaraş", "Erzurum",
    "Van", "Batman", "Elazığ", "Sivas", "Manisa", "Hatay",
  ],
  EG: [
    "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez",
    "Luxor", "Mansoura", "El Mahalla El Kubra", "Tanta", "Asyut", "Ismailia",
    "Fayyum", "Zagazig", "Aswan", "Damietta", "Minya", "Beni Suef",
    "Qena", "Sohag", "Hurghada", "Arish", "Mallawi",
  ],
  ZA: [
    "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth",
    "Bloemfontein", "Nelspruit", "Kimberley", "Polokwane", "Pietermaritzburg",
    "Rustenburg", "East London", "Soweto", "Tembisa", "Katlehong",
    "Umlazi", "Khayelitsha", "Randburg", "Sandton", "Midrand",
  ],
  NG: [
    "Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City",
    "Maiduguri", "Zaria", "Aba", "Ilorin", "Oyo", "Enugu",
    "Abeokuta", "Onitsha", "Warri", "Kaduna", "Calabar", "Uyo",
    "Sokoto", "Ogbomosho", "Akure", "Osogbo", "Bauchi", "Ilesha",
  ],
  KE: [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Kehancha",
    "Ruiru", "Kikuyu", "Kangundo-Tala", "Malindi", "Naivasha", "Thika",
    "Kitale", "Garissa", "Kakamega", "Kilifi", "Machakos", "Athi River",
    "Nyeri", "Wajir", "Mandera", "Migori", "Bungoma", "Vihiga",
  ],
  GH: [
    "Accra", "Kumasi", "Tamale", "Sekondi-Takoradi", "Ashaiman", "Tema",
    "Cape Coast", "Koforidua", "Sunyani", "Ho", "Techiman", "Obuasi",
    "Wa", "Bolgatanga", "Dunkwa", "Nsawam", "Oda", "Winneba",
    "Ejura", "Tafo", "Yendi", "Savelugu", "Kpandu",
  ],
  MX: [
    "Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León",
    "Juárez", "Zapopan", "Monclova", "Cancún", "Querétaro", "Mérida",
    "Chihuahua", "San Luis Potosí", "Aguascalientes", "Toluca", "Cuernavaca",
    "Acapulco", "Hermosillo", "Saltillo", "Morelia", "Veracruz", "Culiacán",
  ],
  BR: [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza",
    "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre",
    "Belém", "Goiânia", "Guarulhos", "Campinas", "São Luís", "São Gonçalo",
    "Maceió", "Duque de Caxias", "Natal", "Campo Grande", "Teresina", "São Bernardo do Campo",
  ],
  AR: [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán",
    "Mar del Plata", "Salta", "Santa Fe", "San Juan", "Resistencia",
    "Santiago del Estero", "Corrientes", "Bahía Blanca", "Neuquén", "Posadas",
    "San Salvador de Jujuy", "Paraná", "Formosa", "San Luis", "Catamarca",
  ],
  CO: [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta",
    "Soledad", "Ibagué", "Bucaramanga", "Soacha", "Villavicencio", "Santa Marta",
    "Bello", "Valledupar", "Montería", "Pereira", "Manizales", "Pasto",
    "Neiva", "Armenia", "Popayán", "Sincelejo", "Floridablanca",
  ],
  CL: [
    "Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta",
    "Iquique", "Temuco", "Puerto Montt", "Rancagua", "Talca", "Arica",
    "Chillán", "Los Ángeles", "Calama", "Copiapó", "Valdivia", "Quillota",
    "Osorno", "Curicó", "Punta Arenas", "San Antonio", "San Bernardo",
  ],
  PE: [
    "Lima", "Arequipa", "Callao", "Trujillo", "Chiclayo", "Piura",
    "Chimbote", "Huancayo", "Cusco", "Tacna", "Iquitos", "Pucallpa",
    "Juliaca", "Sullana", "Chincha Alta", "Tarapoto", "Paita", "Ica",
    "Ayacucho", "Huánuco", "Huaraz", "Puno", "Huaral",
  ],
  VE: [
    "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana",
    "San Cristóbal", "Maturín", "Puerto La Cruz", "Barcelona", "Cumaná",
    "Barinas", "San Fernando de Apure", "Los Teques", "Cabimas", "Coro",
    "Guanare", "Valera", "Acarigua", "Ciudad Bolívar", "Punto Fijo",
  ],
  RU: [
    "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan",
    "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk", "Rostov-on-Don",
    "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd", "Krasnodar",
    "Saratov", "Tyumen", "Tolyatti", "Barnaul", "Tver", "Izhevsk",
  ],
  UA: [
    "Kyiv", "Kharkiv", "Odesa", "Dnipro", "Donetsk", "Zaporizhzhia",
    "Lviv", "Kryvyi Rih", "Mykolaiv", "Mariupol", "Sevastopol", "Luhansk",
    "Vinnytsia", "Simferopol", "Chernihiv", "Kherson", "Poltava",
    "Khmelnytskyi", "Cherkasy", "Chernivtsi", "Zhytomyr", "Sumy", "Rivne",
  ],
  NZ: [
    "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
    "Napier-Hastings", "Dunedin", "Palmerston North", "Nelson", "New Plymouth",
    "Whangarei", "Rotorua", "Invercargill", "Kapiti", "Whanganui",
    "Gisborne", "Blenheim", "Pukekohe", "Timaru", "Masterton",
  ],
};

// ─── Helper: random item from array ───────────────────────────────────────────

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── Helper: get random country with full data ─────────────────────────────────

function getRandomCountry(): { code: string; name: string; flag: string } {
  return pickRandom(COUNTRIES);
}

// ─── Helper: get random bank for country ────────────────────────────────────────

function getRandomBankForCountry(countryCode: string): string {
  const banks = BANKS_BY_COUNTRY[countryCode];
  if (!banks || banks.length === 0) return "";
  return pickRandom(banks);
}

// ─── Helper: get random state for country ───────────────────────────────────────

function getRandomStateForCountry(countryCode: string): string {
  const states = COUNTRY_STATES[countryCode];
  if (!states || states.length === 0) return "";
  return pickRandom(states);
}

// ─── Helper: get random city for country ────────────────────────────────────────

function getRandomCityForCountry(countryCode: string): string {
  const cities = COUNTRY_CITIES[countryCode];
  if (!cities || cities.length === 0) return "";
  return pickRandom(cities);
}

// ─── Geo Data: Country → State → City mapping ──────────────────────────────

const GEO_DATA: Record<string, { states: string[]; cities: Record<string, string[]> }> = {
  US: {
    states: ["California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts", "Tennessee", "Indiana", "Missouri", "Maryland", "Wisconsin"],
    cities: {
      "California": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim"],
      "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"],
      "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral"],
      "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
      "Illinois": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Cicero"],
      "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona"],
      "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain"],
      "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Sandy Springs", "Roswell", "Johns Creek", "Albany", "Warner Robins"],
      "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Concord"],
      "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn", "Livonia", "Clinton Township"],
      "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood", "Toms River", "Hamilton", "Trenton"],
      "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Roanoke", "Portsmouth", "Suffolk"],
      "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Yakima", "Federal Way"],
      "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Gilbert", "Glendale", "Scottsdale", "Tempe", "Peoria", "Surprise"],
      "Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "New Bedford", "Brockton", "Quincy", "Lynn", "Fall River"],
      "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Jackson", "Johnson City", "Bartlett"],
      "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Lafayette"],
      "Missouri": ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "St. Peters"],
      "Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Annapolis", "College Park", "Salisbury", "Laurel"],
      "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Oshkosh", "Eau Claire", "Janesville"],
    },
  },
  NL: {
    states: ["North Holland", "South Holland", "Utrecht", "North Brabant", "Limburg", "Groningen", "Friesland", "Drenthe", "Overijssel", "Gelderland", "Flevoland", "Zeeland"],
    cities: {
      "North Holland": ["Amsterdam", "Haarlem", "Zaanstad", "Hilversum", "Purmerend", "Amstelveen", "Hoofddorp", "Zaandam", "Aalsmeer", "Heemskerk"],
      "South Holland": ["The Hague", "Rotterdam", "Zoetermeer", "Dordrecht", "Leiden", "Delft", "Gouda", "Spijkenisse", "Capelle aan den IJssel", "Vlaardingen"],
      "Utrecht": ["Utrecht", "Amersfoort", "Nieuwegein", "Veenendaal", "Zeist", "Houten", "Woerden", "IJsselstein", "Bilthoven", "Leusden"],
      "North Brabant": ["Eindhoven", "Tilburg", "Breda", "'s-Hertogenbosch", "Helmond", "Roosendaal", "Oss", "Bergen op Zoom", "Oosterhout", "Valkenswaard"],
      "Limburg": ["Maastricht", "Venlo", "Sittard", "Heerlen", "Roermond", "Kerkrade", "Weert", "Geleen", "Stein", "Brunssum"],
      "Groningen": ["Groningen", "Delfzijl", "Hoogezand", "Veendam", "Stadskanaal", "Winschoten", "Haren", "Leek", "Zuidhorn", "Ten Boer"],
      "Friesland": ["Leeuwarden", "Drachten", "Sneek", "Heerenveen", "Harlingen", "Dokkum", "Franeker", "Joure", "Wolvega", "Bolsward"],
      "Drenthe": ["Assen", "Emmen", "Hoogeveen", "Meppel", "Coevorden", "Roden", "Beilen", "Haren", "Anloo", "Zuidlaren"],
      "Overijssel": ["Zwolle", "Enschede", "Deventer", "Almelo", "Hengelo", "Kampen", "Raalte", "Wierden", "Rijssen", "Oldenzaal"],
      "Gelderland": ["Nijmegen", "Arnhem", "Apeldoorn", "Ede", "Doetinchem", "Zutphen", "Harderwijk", "Tiel", "Wageningen", "Culemborg"],
      "Flevoland": ["Almere", "Lelystad", "Dronten", "Zeewolde", "Noordoostpolder", "Urk", "Emmeloord", "Biddinghuizen", "Swifterbant", "Luttelgeest"],
      "Zeeland": ["Middelburg", "Vlissingen", "Goes", "Terneuzen", "Zierikzee", "Tholen", "Sint Maartensdijk", "Kruiningen", "Borsele", "Kapelle"],
    },
  },
  GB: {
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    cities: {
      "England": ["London", "Birmingham", "Manchester", "Leeds", "Newcastle", "Sheffield", "Liverpool", "Nottingham", "Bristol", "Leicester"],
      "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Paisley", "East Kilbride", "Livingston", "Hamilton", "Cumbernauld", "Kirkcaldy"],
      "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Neath", "Cwmbran", "Bridgend", "Llanelli", "Merthyr Tydfil"],
      "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newtownabbey", "Bangor", "Craigavon", "Castlereagh", "Ballymena", "Newtownards", "Carrickfergus"],
    },
  },
  CA: {
    states: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island"],
    cities: {
      "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"],
      "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Levis", "Trois-Rivieres", "Terrebonne"],
      "British Columbia": ["Vancouver", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Coquitlam", "Kelowna", "Langley", "Saanich", "Delta"],
      "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove", "Lloydminster"],
      "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Portage la Prairie", "Thompson", "Winkler", "Selkirk", "Morden", "Dauphin", "The Pas"],
      "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current", "Yorkton", "North Battleford", "Estevan", "Weyburn", "Coteau-du-Lac"],
      "Nova Scotia": ["Halifax", "Sydney", "Dartmouth", "Truro", "New Glasgow", "Glace Bay", "Kentville", "Amherst", "Bridgewater", "Yarmouth"],
      "New Brunswick": ["Fredericton", "Saint John", "Moncton", "Dieppe", "Miramichi", "Edmundston", "Bathurst", "Campbellton", "Oromocto", "Shediac"],
      "Newfoundland and Labrador": ["St. John's", "Mount Pearl", "Corner Brook", "Conception Bay South", "Paradise", "Grand Falls-Windsor", "Gander", "Happy Valley-Goose Bay", "Labrador City", "Carbonear"],
      "Prince Edward Island": ["Charlottetown", "Summerside", "Stratford", "Cornwall", "Montague", "Kensington", "Souris", "Alberton", "Tignish", "Georgetown"],
    },
  },
  AU: {
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
    cities: {
      "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Maitland", "Tweed Heads", "Coffs Harbour", "Port Macquarie", "Orange", "Dubbo", "Bathurst"],
      "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Melton", "Mildura", "Warrnambool", "Sunbury", "Traralgon"],
      "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba", "Mackay", "Rockhampton", "Bundaberg", "Hervey Bay"],
      "Western Australia": ["Perth", "Mandurah", "Bunbury", "Kalgoorlie", "Geraldton", "Albany", "Busselton", "Karratha", "Broome", "Port Hedland"],
      "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Lincoln", "Port Pirie", "Victor Harbor", "Gawler", "Naracoorte", "Renmark"],
      "Tasmania": ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone", "New Norfolk", "Wynyard", "Smithton", "Scottsdale", "Bridport"],
      "Australian Capital Territory": ["Canberra", "Queanbeyan"],
      "Northern Territory": ["Darwin", "Alice Springs", "Palmerston", "Katherine", "Tennant Creek", "Nhulunbuy", "Yulara", "Jabiru", "Maningrida", "Ngukurr"],
    },
  },
  DE: {
    states: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Lower Saxony", "Hesse", "Saxony", "Rhineland-Palatinate", "Berlin", "Schleswig-Holstein", "Brandenburg"],
    cities: {
      "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Erlangen", "Bayreuth", "Bamberg"],
      "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster"],
      "Baden-Württemberg": ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg", "Heidelberg", "Pforzheim", "Reutlingen", "Ulm", "Heilbronn", "Esslingen"],
      "Lower Saxony": ["Hanover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg", "Göttingen", "Salzgitter", "Hildesheim", "Delmenhorst", "Celle"],
      "Hesse": ["Frankfurt", "Wiesbaden", "Darmstadt", "Kassel", "Offenbach", "Hanau", "Marburg", "Giessen", "Fulda", "Rüsselsheim"],
      "Saxony": ["Dresden", "Leipzig", "Chemnitz", "Zwickau", "Plauen", "Görlitz", "Freiberg", "Bautzen", "Pirna", "Riesa"],
      "Rhineland-Palatinate": ["Mainz", "Ludwigshafen", "Koblenz", "Trier", "Kaiserslautern", "Neustadt", "Speyer", "Frankenthal", "Bitburg", "Zweibrücken"],
      "Berlin": ["Berlin"],
      "Schleswig-Holstein": ["Kiel", "Lübeck", "Flensburg", "Neumünster", "Norderstedt", "Elmshorn", "Pinneberg", "Itzehoe", "Wedel", "Geesthacht"],
      "Brandenburg": ["Potsdam", "Cottbus", "Brandenburg an der Havel", "Frankfurt (Oder)", "Oranienburg", "Eberswalde", "Schwedt", "Königs Wusterhausen", "Falkensee", "Bernau"],
    },
  },
};

// ─── Helper: get random state and city pair for country ───────────────────────

function getRandomStateAndCityForCountry(countryCode: string): { state: string; city: string } {
  const geo = GEO_DATA[countryCode];
  if (!geo || geo.states.length === 0) {
    // Fallback to old method
    const state = getRandomStateForCountry(countryCode) || "N/A";
    const city = getRandomCityForCountry(countryCode) || "N/A";
    return { state, city };
  }
  
  const state = pickRandom(geo.states);
  const cities = geo.cities[state];
  const city = cities && cities.length > 0 ? pickRandom(cities) : "N/A";
  
  return { state, city };
}

// ─── Country → States mapping (top countries) ────────────────────────────────

const COUNTRY_STATES: Record<string, string[]> = {
  US: [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "District of Columbia",
  ],
  GB: [
    "England",
    "Scotland",
    "Wales",
    "Northern Ireland",
    "Greater London",
    "West Midlands",
    "Greater Manchester",
    "West Yorkshire",
    "Merseyside",
    "South Yorkshire",
    "Tyne and Wear",
  ],
  CA: [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
  ],
  AU: [
    "New South Wales",
    "Victoria",
    "Queensland",
    "Western Australia",
    "South Australia",
    "Tasmania",
    "Australian Capital Territory",
    "Northern Territory",
  ],
  DE: [
    "Baden-Württemberg",
    "Bavaria",
    "Berlin",
    "Brandenburg",
    "Bremen",
    "Hamburg",
    "Hesse",
    "Lower Saxony",
    "Mecklenburg-Vorpommern",
    "North Rhine-Westphalia",
    "Rhineland-Palatinate",
    "Saarland",
    "Saxony",
    "Saxony-Anhalt",
    "Schleswig-Holstein",
    "Thuringia",
  ],
  FR: [
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Centre-Val de Loire",
    "Corse",
    "Grand Est",
    "Hauts-de-France",
    "Île-de-France",
    "Normandie",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Pays de la Loire",
    "Provence-Alpes-Côte d'Azur",
  ],
  IN: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
  ],
  MX: [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Chiapas",
    "Chihuahua",
    "Coahuila",
    "Colima",
    "Durango",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Mexico City",
    "Mexico State",
    "Michoacán",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas",
  ],
  BR: [
    "Acre",
    "Alagoas",
    "Amapá",
    "Amazonas",
    "Bahia",
    "Ceará",
    "Distrito Federal",
    "Espírito Santo",
    "Goiás",
    "Maranhão",
    "Mato Grosso",
    "Mato Grosso do Sul",
    "Minas Gerais",
    "Pará",
    "Paraíba",
    "Paraná",
    "Pernambuco",
    "Piauí",
    "Rio de Janeiro",
    "Rio Grande do Norte",
    "Rio Grande do Sul",
    "Rondônia",
    "Roraima",
    "Santa Catarina",
    "São Paulo",
    "Sergipe",
    "Tocantins",
  ],
  NG: [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Federal Capital Territory",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ],
};

const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
];

const FLAG_MAP: Record<string, string> = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.flag]));

// ─── BIN lookup ───────────────────────────────────────────────────────────────

async function lookupBin(bin: string): Promise<BinInfo | null> {
  try {
    const res = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { "Accept-Version": "3" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const scheme = (data.scheme ?? "").toUpperCase();
    const rawType = (data.type ?? "").toUpperCase();
    const type = rawType === "PREPAID" ? "PREPAID" : rawType === "CREDIT" ? "CREDIT" : "DEBIT";
    const brand = (data.brand ?? scheme) || "UNKNOWN";
    const bank = data.bank?.name ?? "";
    const countryCode = (data.country?.alpha2 ?? "").toUpperCase();
    const countryName = data.country?.name ?? "";
    return { scheme, type, brand, bank, country: countryCode, countryName };
  } catch {
    return null;
  }
}

// Normalise provider name from scheme
function schemeToProvider(scheme: string): string {
  const s = scheme.toUpperCase();
  if (s.includes("VISA")) return "VISA";
  if (s.includes("MASTER")) return "MASTERCARD";
  if (s.includes("AMEX") || s.includes("AMERICAN")) return "AMEX";
  if (s.includes("DISCOVER")) return "DISCOVER";
  if (s.includes("UNIONPAY") || s.includes("CUP")) return "UNIONPAY";
  if (s.includes("JCB")) return "JCB";
  if (s.includes("MAESTRO")) return "MAESTRO";
  return scheme || "VISA";
}

// Detect provider from BIN prefix (offline fallback)
function guessBinProvider(bin: string): string {
  if (!bin) return "VISA";
  const n = parseInt(bin.slice(0, 2), 10);
  if (bin[0] === "4") return "VISA";
  if ((n >= 51 && n <= 55) || (parseInt(bin.slice(0, 4), 10) >= 2221 && parseInt(bin.slice(0, 4), 10) <= 2720))
    return "MASTERCARD";
  if (bin[0] === "3" && (bin[1] === "4" || bin[1] === "7")) return "AMEX";
  if (
    bin.startsWith("6011") ||
    bin.startsWith("65") ||
    (parseInt(bin.slice(0, 4), 10) >= 6440 && parseInt(bin.slice(0, 4), 10) <= 6599)
  )
    return "DISCOVER";
  if (bin.startsWith("62")) return "UNIONPAY";
  if (bin.startsWith("35")) return "JCB";
  return "VISA";
}

// Expected card number length by provider
function expectedCardLength(provider: string): number {
  if (provider === "AMEX") return 15;
  if (provider === "DISCOVER") return 16;
  if (provider === "MAESTRO") return 18;
  return 16;
}

// ─── Bulk parser helpers ──────────────────────────────────────────────────────

function extractBinFromLine(line: string): string {
  const parts = line.split("|");
  if (parts.length > 0 && parts[0].trim().length >= 6) {
    return parts[0].trim().slice(0, 6);
  }
  const digits = line.replace(/\D/g, "");
  return digits.slice(0, 6);
}

// ─── Auto-generation helpers ──────────────────────────────────────────────────

// ─── Card number generator ────────────────────────────────────────────────────

/**
 * Luhn checksum digit for a partial card number string.
 * Pass digits WITHOUT the check digit — returns the check digit.
 */
function luhnCheckDigit(partial: string): string {
  const digits = partial.split("").map(Number).reverse();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

/**
 * Generate a full card number starting with `bin`.
 * Total length: 16 for most schemes, 15 for AMEX.
 * Passes Luhn check.
 */
function generateCardNumber(bin: string, provider: string): string {
  const totalLen = provider === "AMEX" ? 15 : 16;
  const fillLen = totalLen - bin.length - 1; // -1 for check digit
  let middle = "";
  for (let i = 0; i < fillLen; i++) middle += String(Math.floor(Math.random() * 10));
  const partial = bin + middle;
  return partial + luhnCheckDigit(partial);
}

/** Random 3-digit CVV (never derived from BIN). AMEX = 4 digits. */
function generateCvv(provider = "VISA"): string {
  const len = provider === "AMEX" ? 4 : 3;
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

/**
 * Random future expiry date: +1 to +5 years from today.
 * Returns "MM/YY" string. Not derived from BIN.
 */
function generateExpiry(): string {
  const now = new Date();
  const yearsAhead = 1 + Math.floor(Math.random() * 5); // 1..5
  const monthOffset = Math.floor(Math.random() * 12); // 0..11
  const target = new Date(now.getFullYear() + yearsAhead, now.getMonth() + monthOffset, 1);
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const yy = String(target.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

/** Random western-style cardholder name */
const FIRST_NAMES = [
  "JAMES",
  "JOHN",
  "ROBERT",
  "MICHAEL",
  "WILLIAM",
  "DAVID",
  "RICHARD",
  "JOSEPH",
  "THOMAS",
  "CHARLES",
  "CHRISTOPHER",
  "DANIEL",
  "MATTHEW",
  "ANTHONY",
  "MARK",
  "DONALD",
  "STEVEN",
  "PAUL",
  "ANDREW",
  "KENNETH",
  "JENNIFER",
  "PATRICIA",
  "LINDA",
  "BARBARA",
  "ELIZABETH",
  "SUSAN",
  "JESSICA",
  "SARAH",
  "KAREN",
  "LISA",
  "NANCY",
  "BETTY",
  "MARGARET",
  "SANDRA",
  "ASHLEY",
  "EMILY",
];
const LAST_NAMES = [
  "SMITH",
  "JOHNSON",
  "WILLIAMS",
  "BROWN",
  "JONES",
  "GARCIA",
  "MILLER",
  "DAVIS",
  "RODRIGUEZ",
  "MARTINEZ",
  "HERNANDEZ",
  "LOPEZ",
  "GONZALEZ",
  "WILSON",
  "ANDERSON",
  "THOMAS",
  "TAYLOR",
  "MOORE",
  "JACKSON",
  "MARTIN",
  "LEE",
  "PEREZ",
  "THOMPSON",
  "WHITE",
  "HARRIS",
  "SANCHEZ",
  "CLARK",
];

function generateName(): string {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

// ─── Fake address generator ───────────────────────────────────────────────────

type AddressTemplate = { streets: string[]; cities: string[]; states: string[]; zips: () => string };

const ADDRESS_DATA: Record<string, AddressTemplate> = {
  US: {
    streets: [
      "Main St",
      "Oak Ave",
      "Maple Dr",
      "Cedar Ln",
      "Pine Rd",
      "Elm St",
      "Park Blvd",
      "Lake View Dr",
      "Sunset Blvd",
      "Broadway",
    ],
    cities: [
      "Los Angeles",
      "New York",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
      "Dallas",
      "San Diego",
      "San Jose",
      "Austin",
      "Jacksonville",
      "Fort Worth",
      "Columbus",
      "Charlotte",
    ],
    states: [
      "California",
      "Texas",
      "Florida",
      "New York",
      "Illinois",
      "Pennsylvania",
      "Ohio",
      "Georgia",
      "North Carolina",
      "Michigan",
    ],
    zips: () => String(10000 + Math.floor(Math.random() * 89999)),
  },
  GB: {
    streets: [
      "High Street",
      "Church Road",
      "Station Road",
      "London Road",
      "Park Lane",
      "Victoria Road",
      "King Street",
      "Queen Street",
      "Mill Lane",
      "The Grove",
    ],
    cities: [
      "London",
      "Birmingham",
      "Manchester",
      "Leeds",
      "Glasgow",
      "Liverpool",
      "Bristol",
      "Sheffield",
      "Edinburgh",
      "Cardiff",
      "Leicester",
      "Coventry",
      "Bradford",
    ],
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    zips: () => {
      const letters = "ABCDEFGHIJKLMNOPRSTUW";
      return `${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(10 + Math.random() * 90)} ${Math.floor(1 + Math.random() * 9)}${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}`;
    },
  },
  CA: {
    streets: [
      "Main St",
      "Yonge St",
      "Bloor St",
      "Queen St",
      "King St",
      "Bay St",
      "Dundas St",
      "College St",
      "Harbourfront",
      "Rideau St",
    ],
    cities: [
      "Toronto",
      "Vancouver",
      "Montreal",
      "Calgary",
      "Edmonton",
      "Ottawa",
      "Winnipeg",
      "Quebec City",
      "Hamilton",
      "Kitchener",
    ],
    states: ["Ontario", "British Columbia", "Quebec", "Alberta", "Manitoba", "Nova Scotia", "Saskatchewan"],
    zips: () => {
      const a = "ABCEGHJKLMNPRSTVXY";
      const d = "0123456789";
      const l = (s: string) => s[Math.floor(Math.random() * s.length)];
      return `${l(a)}${l(d)}${l(a)} ${l(d)}${l(a)}${l(d)}`;
    },
  },
  AU: {
    streets: [
      "George St",
      "Collins St",
      "Pitt St",
      "Elizabeth St",
      "King St",
      "Queen St",
      "Flinders St",
      "Bourke St",
      "Market St",
      "Castlereagh St",
    ],
    cities: [
      "Sydney",
      "Melbourne",
      "Brisbane",
      "Perth",
      "Adelaide",
      "Gold Coast",
      "Canberra",
      "Newcastle",
      "Hobart",
      "Darwin",
    ],
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"],
    zips: () => String(1000 + Math.floor(Math.random() * 8999)),
  },
  DE: {
    streets: [
      "Hauptstraße",
      "Schulstraße",
      "Gartenstraße",
      "Bahnhofstraße",
      "Bergstraße",
      "Kirchstraße",
      "Feldstraße",
      "Lindenstraße",
      "Ringstraße",
      "Dorfstraße",
    ],
    cities: [
      "Berlin",
      "Hamburg",
      "Munich",
      "Cologne",
      "Frankfurt",
      "Stuttgart",
      "Düsseldorf",
      "Leipzig",
      "Dresden",
      "Nuremberg",
    ],
    states: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Hesse", "Saxony", "Berlin"],
    zips: () => String(10000 + Math.floor(Math.random() * 89999)),
  },
  FR: {
    streets: [
      "Rue de la Paix",
      "Avenue des Champs",
      "Rue du Faubourg",
      "Boulevard Haussmann",
      "Rue Royale",
      "Avenue Montaigne",
      "Rue de Rivoli",
      "Rue Saint-Honoré",
    ],
    cities: [
      "Paris",
      "Marseille",
      "Lyon",
      "Toulouse",
      "Nice",
      "Nantes",
      "Strasbourg",
      "Montpellier",
      "Bordeaux",
      "Lille",
    ],
    states: [
      "Île-de-France",
      "Provence-Alpes-Côte d'Azur",
      "Auvergne-Rhône-Alpes",
      "Hauts-de-France",
      "Nouvelle-Aquitaine",
    ],
    zips: () => String(10000 + Math.floor(Math.random() * 89999)),
  },
  IN: {
    streets: [
      "MG Road",
      "Nehru Street",
      "Gandhi Nagar",
      "Rajaji Street",
      "Connaught Place",
      "Linking Road",
      "Bandra",
      "Juhu Lane",
      "Sector 15",
      "Civil Lines",
    ],
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"],
    states: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "Rajasthan", "West Bengal"],
    zips: () => String(100000 + Math.floor(Math.random() * 899999)),
  },
  NG: {
    streets: [
      "Broad Street",
      "Marina Road",
      "Victoria Island",
      "Lekki Phase",
      "Allen Avenue",
      "Awolowo Road",
      "Ikorodu Road",
      "Oshodi Express",
    ],
    cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba", "Kaduna"],
    states: ["Lagos", "Abuja FCT", "Kano", "Oyo", "Rivers", "Edo", "Enugu", "Delta"],
    zips: () => String(100000 + Math.floor(Math.random() * 899999)),
  },
};

const STREET_NUMS = () => String(1 + Math.floor(Math.random() * 9999));

function generateAddress(country: string): { street: string; city: string; state: string; zip: string } {
  const data = ADDRESS_DATA[country];
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  
  if (!data) {
    // Use GEO_DATA for linked state-city if available
    const geo = GEO_DATA[country];
    if (geo && geo.states.length > 0) {
      const state = pick(geo.states);
      const cities = geo.cities[state];
      const city = cities && cities.length > 0 ? pick(cities) : "N/A";
      const zip = country === "US" 
        ? String(10000 + Math.floor(Math.random() * 89999))
        : String(1000 + Math.floor(Math.random() * 8999));
      
      return {
        street: `${STREET_NUMS()} Main Street`,
        city,
        state,
        zip,
      };
    }
    
    // Fallback to old method
    const cities = COUNTRY_CITIES[country];
    const states = COUNTRY_STATES[country];
    const zip = country === "US" 
      ? String(10000 + Math.floor(Math.random() * 89999))
      : String(1000 + Math.floor(Math.random() * 8999));
    
    return {
      street: `${STREET_NUMS()} Main Street`,
      city: cities ? pick(cities) : "N/A",
      state: states ? pick(states) : "N/A",
      zip,
    };
  }
  
  return {
    street: `${STREET_NUMS()} ${pick(data.streets)}`,
    city: pick(data.cities),
    state: pick(data.states),
    zip: data.zips(),
  };
}

/** Validate expiry string "MM/YY" — must be a future month */
function isExpiryValid(expiry: string): boolean {
  const m = expiry.match(/^(\d{1,2})\/(\d{2})$/);
  if (!m) return false;
  const month = parseInt(m[1], 10);
  const year = 2000 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month - 1, 1); // first day of expiry month
  const cur = new Date(now.getFullYear(), now.getMonth(), 1);
  return exp > cur;
}

// ─── Generated card type ──────────────────────────────────────────────────────

interface GeneratedCard {
  id: string; // local UUID for key/edit tracking
  bin: string;
  provider: string;
  type: string;
  bank: string;
  country: string;
  countryFlag: string;
  cardNumber: string;
  cvv: string;
  expiry: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  priceUsd: string;
  limitUsd: string;
  isValid: boolean;
}

/**
 * Generate `qty` unique cards for a given BIN + BinInfo.
 * No duplicates: card numbers are tracked in a Set.
 */
function generateBatch(
  bin: string,
  info: { provider: string; type: string; bank: string; country: string; countryFlag: string },
  qty: number,
  defaults: { priceUsd: string; limitUsd: string; isValid: boolean },
): GeneratedCard[] {
  const seen = new Set<string>();
  const cards: GeneratedCard[] = [];
  let attempts = 0;
  const MAX_ATTEMPTS = qty * 20;

  while (cards.length < qty && attempts < MAX_ATTEMPTS) {
    attempts++;
    const cardNumber = generateCardNumber(bin, info.provider);
    if (seen.has(cardNumber)) continue;
    seen.add(cardNumber);

    const addr = generateAddress(info.country);
    
    // Use provided bank or random bank from country
    const cardBank = info.bank || getRandomBankForCountry(info.country);
    // Get linked state and city for country
    const { state: cardState, city: cardCity } = getRandomStateAndCityForCountry(info.country);
    
    cards.push({
      id: crypto.randomUUID(),
      bin,
      provider: info.provider,
      type: info.type,
      bank: cardBank,
      country: info.country,
      countryFlag: info.countryFlag,
      cardNumber,
      cvv: generateCvv(info.provider),
      expiry: generateExpiry(),
      fullName: generateName(),
      street: addr.street,
      city: cardCity,
      state: cardState,
      zip: addr.zip,
      priceUsd: defaults.priceUsd,
      limitUsd: defaults.limitUsd,
      isValid: defaults.isValid,
    });
  }
  return cards;
}

// ─── Form defaults ─────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  bin: "",
  provider: "VISA",
  type: "DEBIT",
  expiry: "",
  name: "",
  country: "US",
  countryFlag: "🇺🇸",
  street: "",
  city: "",
  state: "",
  zip: "",
  extras: "",
  bank: "",
  priceUsd: "",
  limitUsd: "",
  stock: "1",
  cardNumber: "",
  cvv: "",
  fullName: "",
  color: "#3b82f6",
  isValid: false,
};

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

type ModalVariant = "danger" | "warning" | "success" | "info";

interface ConfirmModalProps {
  title: string;
  desc: string;
  variant: ModalVariant;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmModal({ title, desc, variant, confirmLabel, onCancel, onConfirm }: ConfirmModalProps) {
  const confirmCls = {
    danger:  styles.modalConfirmDanger,
    warning: styles.modalConfirmWarning,
    success: styles.modalConfirmSuccess,
    info:    styles.modalConfirmInfo,
  }[variant];
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalTitle}>{title}</div>
        <div className={styles.modalDesc}>{desc}</div>
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onCancel}>Cancel</button>
          <button className={`${styles.modalConfirm} ${confirmCls}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

interface ToastMsg { text: string; ok: boolean; }

// ─── Component ────────────────────────────────────────────────────────────────

export function AssetManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // ── Bulk action state ─────────────────────────────────────────────────────
  const [bulkModal, setBulkModal] = useState<null | {
    title: string; desc: string; variant: ModalVariant;
    confirmLabel: string; action: string;
  }>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (text: string, ok: boolean) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };


  const [binStatus, setBinStatus] = useState<BinStatus>("idle");
  const [binInfo, setBinInfo] = useState<BinInfo | null>(null);
  const [binAutoFilled, setBinAutoFilled] = useState(false);
  const binTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLookedUpBin = useRef<string>("");

  // Auto-generation flags (track which fields were auto-generated so we show the badge)
  const [cvvGenerated, setCvvGenerated] = useState(false);
  const [expiryGenerated, setExpiryGenerated] = useState(false);
  const [nameGenerated, setNameGenerated] = useState(false);

  // Card number validation
  const [cardNumError, setCardNumError] = useState("");

  // Bulk upload state
  const [bulkText, setBulkText] = useState("");
  const [bulkValid, setBulkValid] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [bulkBinStatus, setBulkBinStatus] = useState<{ total: number; parsed: number } | null>(null);

  const [globalPrice, setGlobalPrice] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [useRandomPrice, setUseRandomPrice] = useState(false);

  const [globalLimit, setGlobalLimit] = useState("");
  const [limitMin, setLimitMin] = useState("");
  const [limitMax, setLimitMax] = useState("");
  const [useRandomLimit, setUseRandomLimit] = useState(false);
  const [useRandomType, setUseRandomType] = useState(false);

  const [useRandomStock, setUseRandomStock] = useState(false);
  const [stockMin, setStockMin] = useState("");
  const [stockMax, setStockMax] = useState("");

  const [useRandomExpiry, setUseRandomExpiry] = useState(false);
  const [useRandomBank, setUseRandomBank] = useState(false);
  const [useRandomCountry, setUseRandomCountry] = useState(false);
  const [useRandomAddressFlag, setUseRandomAddressFlag] = useState(false);

  // ── Smart Batch Generator state ─────────────────────────────────────────────
  const [genManualMode, setGenManualMode] = useState(false);
  const [genBin, setGenBin] = useState("");
  const [genQty, setGenQty] = useState<number>(10);
  const [genPrice, setGenPrice] = useState("");
  const [genLimit, setGenLimit] = useState("");
  const [genIsValid, setGenIsValid] = useState(false);
  const [genCards, setGenCards] = useState<GeneratedCard[]>([]);
  const [genBinStatus, setGenBinStatus] = useState<BinStatus>("idle");
  const [genBinInfo, setGenBinInfo] = useState<BinInfo | null>(null);
  const [genSubmitting, setGenSubmitting] = useState(false);
  const [genMsg, setGenMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const genBinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGenBin = useRef<string>("");

  // Available states, banks, and cities for selected country
  const availableStates = COUNTRY_STATES[form.country] ?? [];
  const availableBanks = BANKS_BY_COUNTRY[form.country] ?? [];
  const availableCities = COUNTRY_CITIES[form.country] ?? [];

  // ─── Batch Generator: BIN lookup (debounced 500 ms) ─────────────────────────

  const triggerGenBinLookup = useCallback((bin: string) => {
    if (genBinTimer.current) clearTimeout(genBinTimer.current);
    if (bin.length < 6) {
      setGenBinStatus("idle");
      setGenBinInfo(null);
      if (bin.length >= 1) {
        const g = guessBinProvider(bin);
        setGenBinInfo((prev) => (prev ? { ...prev, scheme: g, brand: g } : null));
      }
      return;
    }
    if (bin.length === 6) {
      if (lastGenBin.current === bin) return;
      setGenBinStatus("loading");
      genBinTimer.current = setTimeout(async () => {
        const info = await lookupBin(bin);
        lastGenBin.current = bin;
        if (info) {
          setGenBinInfo(info);
          setGenBinStatus("ok");
        } else {
          // fallback: offline guess only
          const provider = guessBinProvider(bin);
          setGenBinInfo({ scheme: provider, brand: provider, type: "DEBIT", bank: "", country: "", countryName: "" });
          setGenBinStatus("error");
        }
      }, 500);
    }
  }, []);

  const handleGenBinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setGenBin(val);
    setGenCards([]);
    setGenMsg(null);
    triggerGenBinLookup(val);
  };

  // ─── Batch Generator: generate cards ────────────────────────────────────────

  const handleGenerate = useCallback(() => {
    if (!genPrice) {
      setGenMsg({ type: "err", text: "Enter a price per card before generating." });
      return;
    }

    if (genManualMode) {
      // MANUAL MODE: Generate cards with random country, bank, linked state+city
      const randomCountry = pickRandom(COUNTRIES);
      const randomBank = getRandomBankForCountry(randomCountry.code);
      const { state: randomState, city: randomCity } = getRandomStateAndCityForCountry(randomCountry.code);
      
      const batch = Array.from({ length: genQty }).map(() => ({
        id: crypto.randomUUID(),
        bin: genBin || "",
        provider: "VISA",
        type: "DEBIT",
        bank: randomBank,
        country: randomCountry.code,
        countryFlag: randomCountry.flag,
        cardNumber: "",
        cvv: "",
        expiry: "",
        fullName: "",
        street: "",
        city: randomCity,
        state: randomState,
        zip: "",
        priceUsd: genPrice,
        limitUsd: genLimit,
        isValid: genIsValid,
      }));
      setGenCards((prev) => [...prev, ...batch]);
      setGenMsg(null);
      return;
    }

    // AUTO MODE: Requires BIN
    if (genBin.length !== 6) {
      setGenMsg({ type: "err", text: "Enter a valid 6-digit BIN first." });
      return;
    }

    const provider = genBinInfo ? schemeToProvider(genBinInfo.scheme || genBinInfo.brand) : guessBinProvider(genBin);
    const type = genBinInfo?.type || "DEBIT";
    
    // Determine country from BIN or random if not available
    const country = genBinInfo?.country || pickRandom(COUNTRIES).code;
    const countryFlag = FLAG_MAP[country] || "";
    
    // Use bank from BIN lookup, or random bank from country
    const bank = genBinInfo?.bank || getRandomBankForCountry(country);

    const batch = generateBatch(genBin, { provider, type, bank, country, countryFlag }, genQty, {
      priceUsd: genPrice,
      limitUsd: genLimit,
      isValid: genIsValid,
    });
    setGenCards(batch); // Auto mode overrides the table
    setGenMsg(null);
  }, [genBin, genBinInfo, genQty, genPrice, genLimit, genIsValid, genManualMode]);

  // Edit a single field in a generated card row
  const updateGenCard = (id: string, key: keyof GeneratedCard, value: string | boolean) => {
    setGenCards((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
  };

  // Remove a generated card row
  const removeGenCard = (id: string) => setGenCards((prev) => prev.filter((c) => c.id !== id));

  // Regenerate a single card row
  const regenCard = (id: string) => {
    setGenCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newNum = generateCardNumber(c.bin, c.provider);
        const addr = generateAddress(c.country);
        // Get linked state and city for country
        const { state: cardState, city: cardCity } = getRandomStateAndCityForCountry(c.country);
        // Use random bank from country if current bank is empty
        const cardBank = c.bank || getRandomBankForCountry(c.country);
        return {
          ...c,
          cardNumber: newNum,
          cvv: generateCvv(c.provider),
          expiry: generateExpiry(),
          fullName: generateName(),
          street: addr.street,
          city: cardCity,
          state: cardState,
          zip: addr.zip,
          bank: cardBank,
        };
      }),
    );
  };

  // ─── Batch Generator: bulk submit to API ────────────────────────────────────

  const handleGenSubmit = async () => {
    if (genCards.length === 0) {
      setGenMsg({ type: "err", text: "No cards to submit." });
      return;
    }
    if (!genPrice) {
      setGenMsg({ type: "err", text: "Price is required." });
      return;
    }
    setGenSubmitting(true);
    setGenMsg(null);

    // Build pipe-delimited lines for each card
    // Format: card_number|expiry|cvv|name|bank|country|state|city|zip|limit|price|type|street
    const lines = genCards
      .map((c) => {
        // BUG FIX: Use genPrice as fallback if card price is empty
        const finalPrice = c.priceUsd || genPrice || "0";
        console.log(`[handleGenSubmit] Card ${c.id}: priceUsd=${c.priceUsd}, genPrice=${genPrice}, final=${finalPrice}`);
        return [
          c.cardNumber,
          c.expiry,
          c.cvv,
          c.fullName,
          c.bank,
          c.country,
          c.state,
          c.city,
          c.zip,
          c.limitUsd || "0",
          finalPrice,
          c.type,
          c.street,
        ].join("|");
      })
      .join("\n");

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_products", text: lines, isValid: genIsValid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenMsg({ type: "err", text: data.error ?? "Submit failed." });
        return;
      }
      const created = data.created ?? 0;
      const errCount = data.errors?.length ?? 0;
      setGenMsg({
        type: "ok",
        text: `${created} card(s) added to inventory.${errCount ? ` ${errCount} skipped.` : ""}`,
      });
      setGenCards([]);
      fetchProducts();
    } catch {
      setGenMsg({ type: "err", text: "Network error." });
    } finally {
      setGenSubmitting(false);
    }
  };

  // ─── Fetch products ─────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin?action=products", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      const list = (data.products ?? []) as Product[];
      setProducts(list);
      const next: Record<string, string> = {};
      for (const p of list) next[p.id] = String(p.stock);
      setStockDraft(next);
    } catch {
      setError("Could not load product inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── Field setter ────────────────────────────────────────────────────────────

  const field = (key: keyof typeof EMPTY_FORM, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─── BIN auto-lookup (debounced 500 ms) ─────────────────────────────────────

  const triggerBinLookup = useCallback((bin: string) => {
    if (binTimerRef.current) clearTimeout(binTimerRef.current);
    if (bin.length < 6) {
      setBinStatus("idle");
      setBinInfo(null);
      setBinAutoFilled(false);
      // Offline guess while typing
      if (bin.length >= 1) {
        const guessed = guessBinProvider(bin);
        setForm((prev) => ({ ...prev, provider: guessed }));
      }
      return;
    }
    if (bin.length === 6) {
      // Immediate offline provider guess
      const guessed = guessBinProvider(bin);
      setForm((prev) => ({ ...prev, provider: guessed }));

      if (lastLookedUpBin.current === bin) return; // already fetched

      setBinStatus("loading");
      binTimerRef.current = setTimeout(async () => {
        const info = await lookupBin(bin);
        lastLookedUpBin.current = bin;
        if (info) {
          setBinInfo(info);
          setBinStatus("ok");
          setBinAutoFilled(true);
          const provider = schemeToProvider(info.scheme || info.brand);
          const countryCode = info.country || "";
          const countryFlag = FLAG_MAP[countryCode] ?? "";
          // Determine bank: from lookup, or random from country
          const newBank = info.bank || (countryCode ? getRandomBankForCountry(countryCode) : "");
          
          setForm((prev) => {
            // Check if country changed
            const countryChanged = countryCode !== "" && countryCode !== prev.country;
            return {
              ...prev,
              provider,
              type: info.type || prev.type,
              bank: newBank || prev.bank,
              country: countryCode || prev.country,
              countryFlag: countryFlag || prev.countryFlag,
              // Reset state and city if country changed
              state: countryChanged ? "" : prev.state,
              city: countryChanged ? "" : prev.city,
            };
          });
        } else {
          // Fallback: keep offline guess, allow manual
          setBinStatus("error");
          setBinInfo(null);
          setBinAutoFilled(false);
        }
      }, 500);
    }
  }, []);

  // Handle BIN input change
  const handleBinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    field("bin", val);
    triggerBinLookup(val);
  };

  // ─── Auto-generate CVV + Expiry + Name + Country + Bank + State + City ──────

  const handleAutoGenerate = useCallback(() => {
    const newCvv = generateCvv(form.provider);
    const newExpiry = generateExpiry();
    const newName = generateName();
    
    // Generate random country, bank, linked state+city
    const randomCountry = getRandomCountry();
    const randomBank = getRandomBankForCountry(randomCountry.code);
    const { state: randomState, city: randomCity } = getRandomStateAndCityForCountry(randomCountry.code);
    
    setForm((prev) => ({
      ...prev,
      cvv: newCvv,
      expiry: newExpiry,
      fullName: prev.fullName || newName,
      country: randomCountry.code,
      countryFlag: randomCountry.flag,
      bank: randomBank,
      state: randomState,
      city: randomCity,
    }));
    setCvvGenerated(true);
    setExpiryGenerated(true);
    setNameGenerated(true);
  }, [form.provider]);

  // ─── Card number validation + auto-generate on complete ─────────────────────

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    field("cardNumber", val);
    if (val.length === 0) {
      setCardNumError("");
      return;
    }
    const expected = expectedCardLength(form.provider);
    if (val.length !== expected) {
      setCardNumError(`${form.provider} cards require ${expected} digits (got ${val.length})`);
    } else {
      setCardNumError("");
      // Auto-generate CVV and Expiry when card number reaches full length
      // (only if they are currently empty — never overwrite manual entries)
      setForm((prev) => {
        const newCvv = prev.cvv ? prev.cvv : generateCvv(prev.provider);
        const newExpiry = prev.expiry ? prev.expiry : generateExpiry();
        const didCvv = !prev.cvv;
        const didExpiry = !prev.expiry;
        if (didCvv) setCvvGenerated(true);
        if (didExpiry) setExpiryGenerated(true);
        return { ...prev, cvv: newCvv, expiry: newExpiry };
      });
    }
  };

  // ─── Country change → reset state, city, and bank ───────────────────────────

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const flag = FLAG_MAP[code] ?? "";
    setForm((prev) => ({ 
      ...prev, 
      country: code, 
      countryFlag: flag, 
      state: "", 
      city: "",
      bank: "" // Reset bank when country changes
    }));
  };

  // ─── Submit single card ──────────────────────────────────────────────────────

  const handleAddCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.bin || !form.provider || !form.priceUsd || !form.expiry) {
      setSubmitMsg({ type: "err", text: "BIN, Provider, Expiry, and Price are required." });
      return;
    }
    if (!isExpiryValid(form.expiry)) {
      setSubmitMsg({ type: "err", text: "Expiry must be a future date in MM/YY format." });
      return;
    }
    if (form.cvv && !/^\d{3,4}$/.test(form.cvv)) {
      setSubmitMsg({ type: "err", text: "CVV must be 3 or 4 digits." });
      return;
    }
    if (cardNumError) {
      setSubmitMsg({ type: "err", text: cardNumError });
      return;
    }
    const stockNum = Math.max(0, Math.floor(parseInt(form.stock, 10) || 0));
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_product",
          product: {
            bin: form.bin,
            provider: form.provider,
            type: form.type,
            expiry: form.expiry,
            name: form.name || `${form.provider}Card`,
            country: form.country,
            countryFlag: form.countryFlag,
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
            extras: form.extras || null,
            bank: form.bank,
            priceUsdCents: Math.round(parseFloat(form.priceUsd) * 100),
            limitUsd: parseFloat(form.limitUsd) || 0,
            validUntil: form.expiry,
            stock: stockNum,
            isValid: form.isValid,
            color: form.color,
            cardNumber: form.cardNumber || undefined,
            cvv: form.cvv || undefined,
            fullName: form.fullName || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitMsg({ type: "err", text: data.error ?? "Failed to add card." });
        return;
      }
      setSubmitMsg({ type: "ok", text: `Card added successfully! Product ID: ${data.productId}` });
      setForm(EMPTY_FORM);
      setBinInfo(null);
      setBinStatus("idle");
      setBinAutoFilled(false);
      lastLookedUpBin.current = "";
      setCardNumError("");
      setCvvGenerated(false);
      setExpiryGenerated(false);
      setNameGenerated(false);
      fetchProducts();
    } catch {
      setSubmitMsg({ type: "err", text: "Network error." });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Stock update ─────────────────────────────────────────────────────────────

  const handleUpdateStock = async (productId: string) => {
    const raw = stockDraft[productId] ?? "0";
    const n = Math.max(0, Math.floor(parseInt(raw, 10)));
    if (Number.isNaN(n)) {
      setError("Stock must be a non-negative integer.");
      return;
    }
    setBusyId(productId);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_stock", productId, stock: n }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update stock.");
        return;
      }
      await fetchProducts();
    } catch {
      setError("Network error updating stock.");
    } finally {
      setBusyId(null);
    }
  };

  // ─── Bulk upload ──────────────────────────────────────────────────────────────

  const handleBulkFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setBulkText(String(reader.result ?? ""));
    reader.readAsText(f);
    e.target.value = "";
  };

  // ─── Enrich bulk text: auto-generate missing CVV / expiry ───────────────────

  /**
   * For each line in bulk text, if expiry (field[1]) or cvv (field[2]) is
   * missing / empty / "x" / "xx" / "xxx", replace them with auto-generated values.
   * Original lines with real values are untouched.
   */
  function enrichBulkText(raw: string): string {
    return raw
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        const parts = trimmed.split("|");
        if (parts.length < 2) return line; // can't parse

        // field[1] = expiry, field[2] = cvv
        const expiryRaw = (parts[1] ?? "").trim();
        const cvvRaw = (parts[2] ?? "").trim();

        const isMissingExpiry = !expiryRaw || /^x+$/i.test(expiryRaw) || !isExpiryValid(expiryRaw);
        const isMissingCvv = !cvvRaw || /^x+$/i.test(cvvRaw) || !/^\d{3,4}$/.test(cvvRaw);

        if (isMissingExpiry) parts[1] = generateExpiry();
        if (isMissingCvv) parts[2] = generateCvv();

        return parts.join("|");
      })
      .join("\n");
  }

  // Pre-parse BIN counts from bulk text for display
  useEffect(() => {
    if (!bulkText.trim()) {
      setBulkBinStatus(null);
      return;
    }
    const lines = bulkText
      .trim()
      .split("\n")
      .filter((l) => l.trim());
    const total = lines.length;
    const parsed = lines.filter((l) => extractBinFromLine(l).length === 6).length;
    setBulkBinStatus({ total, parsed });
  }, [bulkText]);

  const handleBulkImport = async (e: FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      setBulkMsg({ type: "err", text: "Paste card lines or upload a .txt file." });
      return;
    }
    setBulkSubmitting(true);
    setBulkMsg(null);
    try {
      // Auto-fill missing CVV / expiry for each line before sending
      const enrichedText = enrichBulkText(bulkText);
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_import_products",
          text: enrichedText,
          isValid: bulkValid,
          pricing: { globalPrice, priceMin, priceMax, useRandomPrice, globalLimit, limitMin, limitMax, useRandomLimit, useRandomType, useRandomStock, stockMin, stockMax, useRandomExpiry, useRandomBank, useRandomCountry, useRandomAddressFlag },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBulkMsg({ type: "err", text: data.error ?? "Bulk import failed." });
        return;
      }
      const errCount = (data.errors?.length ?? 0) as number;
      const created = data.created ?? 0;
      const errs = Array.isArray(data.errors) ? (data.errors as { line: number; message: string }[]) : [];
      const errPreview =
        errs.length > 0
          ? ` Failures: ${errs
              .slice(0, 3)
              .map((e) => `line ${e.line}: ${e.message}`)
              .join(" · ")}${errs.length > 3 ? " …" : ""}`
          : "";
      setBulkMsg({
        type: errCount && created === 0 ? "err" : "ok",
        text: `Imported ${created} card(s).${errCount ? ` ${errCount} line(s) skipped.${errPreview}` : ""}`,
      });
      if (errs.length) console.warn("[bulk import errors]", errs);
      setBulkText("");
      setBulkBinStatus(null);
      fetchProducts();
    } catch {
      setBulkMsg({ type: "err", text: "Network error." });
    } finally {
      setBulkSubmitting(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────────

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure?")) return;
    setBusyId(productId);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_product", productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to delete product.");
        return;
      }
      await fetchProducts();
    } catch {
      setError("Network error deleting product.");
    } finally {
      setBusyId(null);
    }
  };

  // ─── Bulk Actions ────────────────────────────────────────────────────────────

  const BULK_CONFIGS: Record<string, {
    title: string; desc: string; variant: ModalVariant;
    confirmLabel: string; toast: string;
  }> = {
    bulk_delete_all: {
      title: "Delete All Cards?",
      desc: "All active inventory will be soft-deleted. No data is permanently lost — use Recover Deleted to undo.",
      variant: "danger",
      confirmLabel: "Delete All",
      toast: "✓ All cards deleted (recoverable)",
    },
    bulk_mark_sold_out: {
      title: "Mark All as Sold Out?",
      desc: "Sets stock = 0 and status = sold_out for every active card in inventory.",
      variant: "warning",
      confirmLabel: "Mark Sold Out",
      toast: "✓ All cards marked as sold out",
    },
    bulk_restore_all: {
      title: "Restore All Cards?",
      desc: "Resets stock = 1 and status = in_stock for every active (non-deleted) card.",
      variant: "success",
      confirmLabel: "Restore All",
      toast: "✓ All cards restored to in stock",
    },
    bulk_recover_deleted: {
      title: "Recover Deleted Cards?",
      desc: "Restores all previously soft-deleted cards back into active inventory.",
      variant: "info",
      confirmLabel: "Recover All",
      toast: "✓ Deleted cards recovered successfully",
    },
  };

  const openBulkModal = (action: string) => {
    const cfg = BULK_CONFIGS[action];
    if (!cfg) return;
    // Only spread non-toast fields into modal state
    setBulkModal({ action, title: cfg.title, desc: cfg.desc, variant: cfg.variant, confirmLabel: cfg.confirmLabel });
  };

  const executeBulkAction = async () => {
    if (!bulkModal) return;
    const { action } = bulkModal;
    const toastText = BULK_CONFIGS[action]?.toast ?? "Done";
    setBulkModal(null);
    setBulkBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json() as { success?: boolean; affected?: number; error?: string };
      if (!res.ok || !data.success) {
        const errMsg = data.error ?? "Bulk action failed.";
        setError(errMsg);
        showToast(`✗ ${errMsg}`, false);
      } else {
        const n = data.affected ?? 0;
        showToast(`${toastText}${n ? ` (${n})` : ""}`, true);
        await fetchProducts();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setError(msg);
      showToast(`✗ ${msg}`, false);
    } finally {
      setBulkBusy(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────


  const binBadge = () => {
    if (binStatus === "loading")
      return (
        <span className={styles.binBadge} data-status="loading">
          <Loader2 size={11} className={styles.spinIcon} /> Looking up BIN…
        </span>
      );
    if (binStatus === "ok" && binInfo)
      return (
        <span className={styles.binBadge} data-status="ok">
          <CheckCircle size={11} /> {binInfo.scheme || binInfo.brand} · {binInfo.countryName || binInfo.country} ·{" "}
          {binInfo.bank || "—"}
        </span>
      );
    if (binStatus === "error")
      return (
        <span className={styles.binBadge} data-status="error">
          <AlertCircle size={11} /> BIN not found — manual entry enabled
        </span>
      );
    return null;
  };

  return (
    <div className={styles.wrap}>
      {/* ── Add New Card ─────────────────────────────────────────────────────── */}
      <div className={styles.formCard}>
        <h2 className={styles.title}>Add New Card Asset</h2>
        <form onSubmit={handleAddCard}>
          {/* Section: BIN + Auto-fill */}
          <div className={styles.sectionLabel}>BIN &amp; Auto-fill</div>
          <div className={styles.grid}>
            {/* BIN */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>BIN (6 digits) *</label>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 547383"
                value={form.bin}
                onChange={handleBinChange}
              />
              {binBadge()}
            </div>

            {/* Provider — auto-filled */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Provider *{binAutoFilled && <span className={styles.autoTag}>auto</span>}
              </label>
              <select
                className={styles.input}
                value={form.provider}
                onChange={(e) => field("provider", e.target.value)}
              >
                <option>VISA</option>
                <option>MASTERCARD</option>
                <option>AMEX</option>
                <option>DISCOVER</option>
                <option>UNIONPAY</option>
                <option>JCB</option>
                <option>MAESTRO</option>
              </select>
            </div>

            {/* Type — auto-filled */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Type
                {binAutoFilled && <span className={styles.autoTag}>auto</span>}
              </label>
              <select className={styles.input} value={form.type} onChange={(e) => field("type", e.target.value)}>
                <option>DEBIT</option>
                <option>CREDIT</option>
                <option>PREPAID</option>
              </select>
            </div>

            {/* Bank — dropdown if available, else text */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Bank
                {binAutoFilled && form.bank && <span className={styles.autoTag}>auto</span>}
              </label>
              {availableBanks.length > 0 ? (
                <select className={styles.input} value={form.bank} onChange={(e) => field("bank", e.target.value)}>
                  <option value="">— Select bank —</option>
                  {availableBanks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Chase"
                  value={form.bank}
                  onChange={(e) => field("bank", e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Section: Card Details */}
          <div className={styles.sectionLabel}>
            Card Details
            <button
              type="button"
              className={styles.autoGenBtn}
              onClick={handleAutoGenerate}
              title="Auto-generate CVV, expiry, and cardholder name (never from BIN)"
            >
              <Wand2 size={11} style={{ display: "inline", marginRight: "4px" }} />
              Auto Generate Details
            </button>
          </div>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Full Card Number</label>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                placeholder="4111111111111111"
                value={form.cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                style={{ borderColor: cardNumError ? "rgba(239,68,68,0.6)" : undefined }}
              />
              {cardNumError && (
                <span style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "2px" }}>{cardNumError}</span>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                CVV {form.provider === "AMEX" ? "(4 digits)" : "(3 digits)"}
                {cvvGenerated && <span className={styles.autoTag}>generated</span>}
              </label>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder={form.provider === "AMEX" ? "1234" : "123"}
                value={form.cvv}
                onChange={(e) => {
                  field("cvv", e.target.value.replace(/\D/g, ""));
                  setCvvGenerated(false);
                }}
                style={{ borderColor: form.cvv && !/^\d{3,4}$/.test(form.cvv) ? "rgba(239,68,68,0.6)" : undefined }}
              />
              {form.cvv && !/^\d{3,4}$/.test(form.cvv) && (
                <span style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "2px" }}>CVV must be 3–4 digits</span>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Expiry (MM/YY) *{expiryGenerated && <span className={styles.autoTag}>generated</span>}
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="12/28"
                value={form.expiry}
                onChange={(e) => {
                  field("expiry", e.target.value);
                  setExpiryGenerated(false);
                }}
                style={{ borderColor: form.expiry && !isExpiryValid(form.expiry) ? "rgba(239,68,68,0.6)" : undefined }}
              />
              {form.expiry && !isExpiryValid(form.expiry) && (
                <span style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "2px" }}>
                  Must be a future date (MM/YY)
                </span>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Cardholder Name
                {nameGenerated && <span className={styles.autoTag}>generated</span>}
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="JOHN DOE"
                value={form.fullName}
                onChange={(e) => {
                  field("fullName", e.target.value);
                  setNameGenerated(false);
                }}
              />
            </div>
          </div>

          {/* Section: Address */}
          <div className={styles.sectionLabel}>
            Billing Address
            {binAutoFilled && form.country && <span className={styles.autoTag}>country auto-detected</span>}
            <button
              type="button"
              className={styles.autoGenBtn}
              onClick={() => {
                const addr = generateAddress(form.country);
                setForm((prev) => ({
                  ...prev,
                  street: addr.street,
                  city: addr.city,
                  state: addr.state || prev.state,
                  zip: addr.zip,
                }));
              }}
              title="Generate a random address for the detected country"
            >
              <Wand2 size={11} style={{ display: "inline", marginRight: "4px" }} />
              Generate Address
            </button>
          </div>
          <div className={styles.grid}>
            {/* Country dropdown */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Country
                {binAutoFilled && <span className={styles.autoTag}>auto</span>}
              </label>
              <select className={styles.input} value={form.country} onChange={handleCountryChange}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* State — dropdown if available, else text */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>State / Region</label>
              {availableStates.length > 0 ? (
                <select className={styles.input} value={form.state} onChange={(e) => field("state", e.target.value)}>
                  <option value="">— Select state —</option>
                  {availableStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type="text"
                  placeholder="State / Province"
                  value={form.state}
                  onChange={(e) => field("state", e.target.value)}
                />
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Street Address</label>
              <input
                className={styles.input}
                type="text"
                placeholder="123 Main St"
                value={form.street}
                onChange={(e) => field("street", e.target.value)}
              />
            </div>
            {/* City — dropdown if available, else text */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>City</label>
              {availableCities.length > 0 ? (
                <select className={styles.input} value={form.city} onChange={(e) => field("city", e.target.value)}>
                  <option value="">— Select city —</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Los Angeles"
                  value={form.city}
                  onChange={(e) => field("city", e.target.value)}
                />
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>ZIP / Postal</label>
              <input
                className={styles.input}
                type="text"
                placeholder="90001"
                value={form.zip}
                onChange={(e) => field("zip", e.target.value)}
              />
            </div>
          </div>

          {/* Section: Pricing */}
          <div className={styles.sectionLabel}>Pricing &amp; Stock</div>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Price (USD) *</label>
              <input
                className={styles.input}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="36.00"
                value={form.priceUsd}
                onChange={(e) => field("priceUsd", e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Stock (qty) *</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="1"
                placeholder="1"
                value={form.stock}
                onChange={(e) => field("stock", e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Limit (USD)</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                placeholder="500"
                value={form.limitUsd}
                onChange={(e) => field("limitUsd", e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup} style={{ display: "flex", alignItems: "flex-end" }}>
              <label className={styles.label} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="checkbox" checked={form.isValid} onChange={(e) => field("isValid", e.target.checked)} />
                Show in 100% Valid section
              </label>
            </div>
          </div>

          {submitMsg && (
            <div
              style={{
                fontSize: "0.8rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                marginTop: "0.5rem",
                background: submitMsg.type === "ok" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                color: submitMsg.type === "ok" ? "#4ade80" : "#ef4444",
              }}
            >
              {submitMsg.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            <Plus size={14} style={{ display: "inline", marginRight: "4px" }} />
            {submitting ? "Adding…" : "Add Card"}
          </button>
        </form>
      </div>

      {/* ── Smart Batch Generator ────────────────────────────────────────────── */}
      <div className={styles.formCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <h2 className={styles.title} style={{ marginBottom: 0 }}>Smart Batch Card Generator</h2>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", cursor: "pointer", color: "#e2e8f0" }}>
            <input 
              type="checkbox" 
              checked={genManualMode} 
              onChange={(e) => setGenManualMode(e.target.checked)} 
              style={{ cursor: "pointer" }}
            />
            Manual Mode
          </label>
        </div>
        <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "1rem", lineHeight: 1.5 }}>
          Enter a BIN to auto-detect provider/bank/country, choose quantity, then generate realistic test cards with
          unique numbers, random CVV, future expiry, names, and addresses. All data is synthetic — never real.
        </p>

        {/* ── Generator Controls ─────────────────────────────────────── */}
        <div className={styles.genControls}>
          {/* BIN Input */}
          <div className={styles.fieldGroup} style={{ flex: "0 0 140px" }}>
            <label className={styles.label}>
              BIN (6 digits) {!genManualMode && "*"}
            </label>
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="547383"
              value={genBin}
              onChange={handleGenBinChange}
            />
            {genBinStatus === "loading" && (
              <span className={styles.binBadge} data-status="loading">
                <Loader2 size={11} className={styles.spinIcon} /> Looking up…
              </span>
            )}
            {genBinStatus === "ok" && genBinInfo && (
              <span className={styles.binBadge} data-status="ok">
                <CheckCircle size={11} /> {genBinInfo.scheme || genBinInfo.brand}
                {genBinInfo.country ? ` · ${genBinInfo.country}` : ""}
                {genBinInfo.bank ? ` · ${genBinInfo.bank}` : ""}
              </span>
            )}
            {genBinStatus === "error" && (
              <span className={styles.binBadge} data-status="error">
                <AlertCircle size={11} /> Manual mode
              </span>
            )}
          </div>

          {/* Quantity preset buttons */}
          <div className={styles.fieldGroup} style={{ flex: "0 0 220px" }}>
            <label className={styles.label}>Quantity</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.qtyBtn} ${genQty === n ? styles.qtyBtnActive : ""}`}
                  onClick={() => setGenQty(n)}
                >
                  {n}
                </button>
              ))}
              <input
                className={styles.input}
                type="number"
                min={1}
                max={500}
                style={{ width: "60px", padding: "0.3rem 0.5rem", fontSize: "0.75rem" }}
                value={genQty}
                onChange={(e) => setGenQty(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>

          {/* Price */}
          <div className={styles.fieldGroup} style={{ flex: "0 0 110px" }}>
            <label className={styles.label}>Price (USD) *</label>
            <input
              className={styles.input}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="36.00"
              value={genPrice}
              onChange={(e) => setGenPrice(e.target.value)}
            />
          </div>

          {/* Limit */}
          <div className={styles.fieldGroup} style={{ flex: "0 0 110px" }}>
            <label className={styles.label}>Limit (USD)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              placeholder="500"
              value={genLimit}
              onChange={(e) => setGenLimit(e.target.value)}
            />
          </div>

          {/* Valid flag */}
          <div className={styles.fieldGroup} style={{ justifyContent: "flex-end" }}>
            <label className={styles.label} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input type="checkbox" checked={genIsValid} onChange={(e) => setGenIsValid(e.target.checked)} />
              100% Valid section
            </label>
          </div>
        </div>

        {/* Generate button */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className={styles.genBtn}
            onClick={handleGenerate}
            disabled={(!genManualMode && genBin.length !== 6) || !genPrice}
          >
            <Wand2 size={14} style={{ display: "inline", marginRight: "6px" }} />
            Generate {genQty} Card{genQty !== 1 ? "s" : ""}
          </button>
          {genCards.length > 0 && (
            <>
              <button type="button" className={styles.submitBtn} onClick={handleGenSubmit} disabled={genSubmitting}>
                <Plus size={13} style={{ display: "inline", marginRight: "5px" }} />
                {genSubmitting ? "Submitting…" : `Submit all ${genCards.length} to Inventory`}
              </button>
              <button
                type="button"
                onClick={() => setGenCards([])}
                style={{
                  fontSize: "0.72rem",
                  color: "#888",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Clear
              </button>
            </>
          )}
        </div>

        {genMsg && (
          <div
            style={{
              fontSize: "0.8rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              marginBottom: "0.75rem",
              background: genMsg.type === "ok" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              color: genMsg.type === "ok" ? "#4ade80" : "#ef4444",
            }}
          >
            {genMsg.text}
          </div>
        )}

        {/* ── Generated Cards Preview Table ──────────────────────────── */}
        {genCards.length > 0 && (
          <div className={styles.tableWrap} style={{ overflowX: "auto" }}>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#666",
                padding: "0.4rem 1rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {genCards.length} card{genCards.length !== 1 ? "s" : ""} generated — all data is synthetic test data only
            </div>
            <table className={styles.table} style={{ minWidth: "900px", width: "100%" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Card Number</th>
                  <th>Provider</th>
                  <th>Type</th>
                  <th>CVV</th>
                  <th>Expiry</th>
                  <th>Name</th>
                  <th>Country</th>
                  <th>State</th>
                  <th>City</th>
                  <th>ZIP</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {genCards.map((c, idx) => (
                  <tr key={c.id}>
                    <td style={{ color: "#666", fontSize: "0.7rem" }}>{idx + 1}</td>
                    <td>
                      <input
                        className={styles.genCellInput}
                        value={c.cardNumber}
                        onChange={(e) => updateGenCard(c.id, "cardNumber", e.target.value.replace(/\D/g, ""))}
                        maxLength={19}
                        style={{ width: "160px", fontFamily: "ui-monospace, monospace", fontSize: "0.72rem" }}
                      />
                    </td>
                    <td>
                      <select
                        className={styles.genCellInput}
                        value={c.provider}
                        onChange={(e) => updateGenCard(c.id, "provider", e.target.value)}
                        style={{ width: "110px" }}
                      >
                        <option>VISA</option>
                        <option>MASTERCARD</option>
                        <option>AMEX</option>
                        <option>DISCOVER</option>
                        <option>UNIONPAY</option>
                        <option>JCB</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={styles.genCellInput}
                        value={c.type}
                        onChange={(e) => updateGenCard(c.id, "type", e.target.value)}
                        style={{ width: "90px" }}
                      >
                        <option>DEBIT</option>
                        <option>CREDIT</option>
                        <option>PREPAID</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className={styles.genCellInput}
                        value={c.cvv}
                        onChange={(e) => updateGenCard(c.id, "cvv", e.target.value.replace(/\D/g, ""))}
                        maxLength={4}
                        style={{ width: "50px", fontFamily: "ui-monospace, monospace" }}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.genCellInput}
                        value={c.expiry}
                        onChange={(e) => updateGenCard(c.id, "expiry", e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        style={{ width: "60px", fontFamily: "ui-monospace, monospace" }}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.genCellInput}
                        value={c.fullName}
                        onChange={(e) => updateGenCard(c.id, "fullName", e.target.value)}
                        style={{ width: "130px" }}
                      />
                    </td>
                    <td style={{ fontSize: "0.72rem" }}>
                      {c.countryFlag} {c.country}
                    </td>
                    <td>
                      <input
                        className={styles.genCellInput}
                        value={c.state}
                        onChange={(e) => updateGenCard(c.id, "state", e.target.value)}
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.genCellInput}
                        value={c.city}
                        onChange={(e) => updateGenCard(c.id, "city", e.target.value)}
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.genCellInput}
                        value={c.zip}
                        onChange={(e) => updateGenCard(c.id, "zip", e.target.value)}
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.genCellInput}
                        type="number"
                        value={c.priceUsd}
                        onChange={(e) => updateGenCard(c.id, "priceUsd", e.target.value)}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          type="button"
                          title="Re-generate this row"
                          onClick={() => regenCard(c.id)}
                          style={{
                            fontSize: "0.65rem",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            border: "1px solid rgba(99,102,241,0.3)",
                            background: "rgba(99,102,241,0.12)",
                            color: "#a5b4fc",
                            cursor: "pointer",
                          }}
                        >
                          <RefreshCw size={10} />
                        </button>
                        <button
                          type="button"
                          title="Remove row"
                          onClick={() => removeGenCard(c.id)}
                          style={{
                            fontSize: "0.65rem",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            border: "1px solid rgba(239,68,68,0.3)",
                            background: "rgba(239,68,68,0.08)",
                            color: "#f87171",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Bulk Upload ──────────────────────────────────────────────────────── */}
      <div className={styles.formCard}>
        <h2 className={styles.title}>Bulk Upload Cards</h2>
        <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.75rem", lineHeight: 1.5 }}>
          Paste one card per line or load a <strong>.txt</strong> file. Pipe-separated fields (12):{" "}
          <code style={{ fontSize: "0.68rem", wordBreak: "break-all" }}>
            card_number|expiry|cvv|name|bank|country|state|city|zip|limit|price|type
          </code>
          <br />
          Optional (13): add <strong>street</strong> after zip —{" "}
          <code style={{ fontSize: "0.68rem" }}>…|zip|street|limit|price|type</code>
          <br />
          <span style={{ color: "#6366f1" }}>BIN is auto-extracted from card number for each line.</span>
        </p>

        {bulkBinStatus && (
          <div className={styles.bulkBinInfo}>
            <CheckCircle size={12} style={{ color: "#4ade80" }} />
            {bulkBinStatus.total} line(s) detected · {bulkBinStatus.parsed} BIN(s) parseable
          </div>
        )}

        <div style={{ marginBottom: "0.6rem" }}>
          <label
            style={{
              fontSize: "0.75rem",
              color: "#aaa",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Upload size={14} />
            <span>Load from file</span>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={handleBulkFile}
              style={{ fontSize: "0.7rem", maxWidth: "200px" }}
            />
          </label>
        </div>
        <form onSubmit={handleBulkImport}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#ccc", fontWeight: 600 }}>Set Price For All</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {!useRandomPrice ? (
                  <input type="number" placeholder="Price" value={globalPrice} onChange={e => setGlobalPrice(e.target.value)} className={styles.input} style={{ width: "80px", padding: "4px 8px" }} />
                ) : (
                  <>
                    <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} className={styles.input} style={{ width: "70px", padding: "4px 8px" }} />
                    <span style={{color:"#888"}}>-</span>
                    <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} className={styles.input} style={{ width: "70px", padding: "4px 8px" }} />
                  </>
                )}
                <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.7rem", color: "#aaa", marginLeft: "4px" }}>
                  <input type="checkbox" checked={useRandomPrice} onChange={e => setUseRandomPrice(e.target.checked)} />
                  Random Price
                </label>
              </div>
            </div>

            <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#ccc", fontWeight: 600 }}>Set Limit For All</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {!useRandomLimit ? (
                  <input type="number" placeholder="Limit" value={globalLimit} onChange={e => setGlobalLimit(e.target.value)} className={styles.input} style={{ width: "80px", padding: "4px 8px" }} />
                ) : (
                  <>
                    <input type="number" placeholder="Min" value={limitMin} onChange={e => setLimitMin(e.target.value)} className={styles.input} style={{ width: "70px", padding: "4px 8px" }} />
                    <span style={{color:"#888"}}>-</span>
                    <input type="number" placeholder="Max" value={limitMax} onChange={e => setLimitMax(e.target.value)} className={styles.input} style={{ width: "70px", padding: "4px 8px" }} />
                  </>
                )}
                <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.7rem", color: "#aaa", marginLeft: "4px" }}>
                  <input type="checkbox" checked={useRandomLimit} onChange={e => setUseRandomLimit(e.target.checked)} />
                  Random Limit
                </label>
              </div>
            </div>

            <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
               <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }}>
                  <input type="checkbox" checked={useRandomType} onChange={e => setUseRandomType(e.target.checked)} />
                  Random Card Type (Debit/Credit)
               </label>
               <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }}>
                  <input type="checkbox" checked={useRandomExpiry} onChange={e => setUseRandomExpiry(e.target.checked)} />
                  Random Expiry Date
               </label>
               <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }}>
                  <input type="checkbox" checked={useRandomBank} onChange={e => setUseRandomBank(e.target.checked)} />
                  Random Bank Assign
               </label>
               <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }}>
                  <input type="checkbox" checked={useRandomCountry} onChange={e => setUseRandomCountry(e.target.checked)} />
                  Random Country + State
               </label>
               <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#aaa" }}>
                  <input type="checkbox" checked={useRandomAddressFlag} onChange={e => setUseRandomAddressFlag(e.target.checked)} />
                  Random Address Flag (YES/NO)
               </label>
            </div>

            <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#ccc", fontWeight: 600 }}>Random Stock</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {!useRandomStock ? (
                  <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.7rem", color: "#aaa", marginLeft: "4px" }}>
                    <input type="checkbox" checked={useRandomStock} onChange={e => setUseRandomStock(e.target.checked)} />
                    Enable
                  </label>
                ) : (
                  <>
                    <input type="number" placeholder="Min" value={stockMin} onChange={e => setStockMin(e.target.value)} className={styles.input} style={{ width: "70px", padding: "4px 8px" }} />
                    <span style={{color:"#888"}}>-</span>
                    <input type="number" placeholder="Max" value={stockMax} onChange={e => setStockMax(e.target.value)} className={styles.input} style={{ width: "70px", padding: "4px 8px" }} />
                    <label style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "0.7rem", color: "#aaa", marginLeft: "4px" }}>
                      <input type="checkbox" checked={useRandomStock} onChange={e => setUseRandomStock(e.target.checked)} />
                      Enable
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
          <textarea
            className={styles.input}
            rows={12}
            style={{
              width: "100%",
              minHeight: "180px",
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.72rem",
              lineHeight: 1.4,
            }}
            placeholder={
              "4111111111111111|12/28|123|JOHN DOE|Chase|US|California|Los Angeles|90001|500|36.00|DEBIT\n5555555555554444|11/27|456|MIKE SMITH|Bank of America|US|Texas|Houston|77001|1000|50.00|CREDIT"
            }
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <div style={{ marginTop: "0.65rem", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.78rem" }}>
              <input type="checkbox" checked={bulkValid} onChange={(e) => setBulkValid(e.target.checked)} />
              Show in 100% Valid section
            </label>
            <button type="submit" className={styles.submitBtn} disabled={bulkSubmitting}>
              {bulkSubmitting ? "Importing…" : "Import all lines"}
            </button>
          </div>
          {bulkMsg && (
            <div
              style={{
                fontSize: "0.8rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                marginTop: "0.65rem",
                background: bulkMsg.type === "ok" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                color: bulkMsg.type === "ok" ? "#4ade80" : "#ef4444",
              }}
            >
              {bulkMsg.text}
            </div>
          )}
        </form>
      </div>

      {/* ── Inventory Table ───────────────────────────────────────────────────── */}
      <div>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}
        >
          <h2 className={styles.inventoryTitle}>Current Inventory</h2>

          {/* Right side: bulk actions + refresh */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            {/* Bulk action buttons */}
            <div className={styles.bulkActions}>
              <button
                className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`}
                disabled={bulkBusy || loading}
                onClick={() => openBulkModal("bulk_delete_all")}
                title="Soft-delete all active cards"
              >
                <ShieldOff size={11} /> Delete All
              </button>
              <button
                className={`${styles.bulkBtn} ${styles.bulkBtnWarning}`}
                disabled={bulkBusy || loading}
                onClick={() => openBulkModal("bulk_mark_sold_out")}
                title="Mark all cards as sold out"
              >
                <MinusCircle size={11} /> Mark Sold Out
              </button>
              <button
                className={`${styles.bulkBtn} ${styles.bulkBtnSuccess}`}
                disabled={bulkBusy || loading}
                onClick={() => openBulkModal("bulk_restore_all")}
                title="Restore all active cards to in stock"
              >
                <RotateCcw size={11} /> Restore All
              </button>
              <button
                className={`${styles.bulkBtn} ${styles.bulkBtnInfo}`}
                disabled={bulkBusy || loading}
                onClick={() => openBulkModal("bulk_recover_deleted")}
                title="Recover previously soft-deleted cards"
              >
                <Undo2 size={11} /> Recover Deleted
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchProducts}
              disabled={loading || bulkBusy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ccc",
                padding: "0.3rem 0.7rem",
                borderRadius: "6px",
                fontSize: "0.7rem",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={11} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
            </button>
          </div>
        </div>

        {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</div>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Provider / BIN</th>
                <th>Type</th>
                <th>Bank</th>
                <th>Country</th>
                <th>Expiry</th>
                <th>Limit</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", color: "#888", padding: "2rem", fontSize: "0.8rem" }}>
                    Loading inventory…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", color: "#888", padding: "2rem", fontSize: "0.8rem" }}>
                    No products in inventory. Add one above.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.provider}</strong> <span style={{ color: "#888", fontSize: "0.7rem" }}>{p.bin}</span>
                    </td>
                    <td>{p.type}</td>
                    <td>{p.bank}</td>
                    <td>
                      <span className={styles.countryCode}>{String(p.country ?? "").trim().toUpperCase()}</span>
                    </td>
                    <td>{p.expiry}</td>
                    <td>${p.limitUsd}</td>
                    <td>${(p.priceUsdCents / 100).toFixed(2)}</td>
                    <td>
                      <input
                        className={styles.input}
                        type="number"
                        min={0}
                        step={1}
                        style={{ width: "4.5rem", padding: "0.25rem 0.4rem", fontSize: "0.75rem" }}
                        value={stockDraft[p.id] ?? String(p.stock)}
                        onChange={(e) => setStockDraft((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        disabled={busyId === p.id}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateStock(p.id)}
                        disabled={busyId === p.id}
                        style={{
                          marginLeft: "6px",
                          fontSize: "0.65rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid rgba(255,255,255,0.15)",
                          background: "rgba(99,102,241,0.2)",
                          color: "#a5b4fc",
                          cursor: "pointer",
                        }}
                      >
                        Update
                      </button>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          background: p.status === "in_stock" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                          color: p.status === "in_stock" ? "#4ade80" : "#f87171",
                        }}
                      >
                        {p.status === "in_stock" ? "in_stock" : "sold_out"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={busyId === p.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.65rem",
                          padding: "0.25rem 0.55rem",
                          borderRadius: "4px",
                          border: "1px solid rgba(239,68,68,0.35)",
                          background: "rgba(239,68,68,0.08)",
                          color: "#f87171",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: "0.72rem", color: "#666", marginTop: "0.5rem", textAlign: "right" }}>
          {products.filter((p) => p.status === "in_stock").length} in stock ·{" "}
          {products.filter((p) => p.status === "sold_out").length} sold out
        </div>
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      {bulkModal && (
        <ConfirmModal
          title={bulkModal.title}
          desc={bulkModal.desc}
          variant={bulkModal.variant}
          confirmLabel={bulkModal.confirmLabel}
          onCancel={() => setBulkModal(null)}
          onConfirm={executeBulkAction}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
          {toast.ok ? <CheckCircle size={14} style={{ color: "#4ade80", flexShrink: 0 }} />
                    : <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />}
          {toast.text}
        </div>
      )}
    </div>
  );
}
