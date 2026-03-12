// Location data (cities, postal codes, countries) per language
// Extracted from index.html lines 1512-1615

export const LANG_LOCATIONS: Record<string, Array<{city: string; postalCode: string; country: string}>> = {
  de: [
    {city:'Berlin',postalCode:'10115',country:'DE'},{city:'München',postalCode:'80331',country:'DE'},{city:'Hamburg',postalCode:'20095',country:'DE'},
    {city:'Köln',postalCode:'50667',country:'DE'},{city:'Frankfurt',postalCode:'60311',country:'DE'},{city:'Stuttgart',postalCode:'70173',country:'DE'},
    {city:'Düsseldorf',postalCode:'40210',country:'DE'},{city:'Leipzig',postalCode:'04109',country:'DE'},{city:'Nürnberg',postalCode:'90402',country:'DE'},
    {city:'Dresden',postalCode:'01067',country:'DE'},{city:'Bonn',postalCode:'53229',country:'DE'},{city:'Hannover',postalCode:'30159',country:'DE'},
  ],
  en: [
    {city:'London',postalCode:'EC1A',country:'GB'},{city:'Manchester',postalCode:'M1',country:'GB'},{city:'New York',postalCode:'10001',country:'US'},
    {city:'Los Angeles',postalCode:'90001',country:'US'},{city:'Chicago',postalCode:'60601',country:'US'},{city:'Sydney',postalCode:'2000',country:'AU'},
    {city:'Toronto',postalCode:'M5V',country:'CA'},{city:'Dublin',postalCode:'D01',country:'IE'},{city:'Birmingham',postalCode:'B1',country:'GB'},
    {city:'San Francisco',postalCode:'94102',country:'US'},{city:'Austin',postalCode:'73301',country:'US'},{city:'Miami',postalCode:'33101',country:'US'},
  ],
  fr: [
    {city:'Paris',postalCode:'75001',country:'FR'},{city:'Lyon',postalCode:'69001',country:'FR'},{city:'Marseille',postalCode:'13001',country:'FR'},
    {city:'Toulouse',postalCode:'31000',country:'FR'},{city:'Nice',postalCode:'06000',country:'FR'},{city:'Bordeaux',postalCode:'33000',country:'FR'},
    {city:'Strasbourg',postalCode:'67000',country:'FR'},{city:'Lille',postalCode:'59000',country:'FR'},{city:'Nantes',postalCode:'44000',country:'FR'},
    {city:'Montpellier',postalCode:'34000',country:'FR'},{city:'Rennes',postalCode:'35000',country:'FR'},{city:'Grenoble',postalCode:'38000',country:'FR'},
  ],
  es: [
    {city:'Madrid',postalCode:'28001',country:'ES'},{city:'Barcelona',postalCode:'08001',country:'ES'},{city:'Valencia',postalCode:'46001',country:'ES'},
    {city:'Sevilla',postalCode:'41001',country:'ES'},{city:'Málaga',postalCode:'29001',country:'ES'},{city:'Bilbao',postalCode:'48001',country:'ES'},
    {city:'Alicante',postalCode:'03001',country:'ES'},{city:'Zaragoza',postalCode:'50001',country:'ES'},{city:'Granada',postalCode:'18001',country:'ES'},
    {city:'Palma',postalCode:'07001',country:'ES'},{city:'Murcia',postalCode:'30001',country:'ES'},{city:'Salamanca',postalCode:'37001',country:'ES'},
  ],
  it: [
    {city:'Roma',postalCode:'00100',country:'IT'},{city:'Milano',postalCode:'20100',country:'IT'},{city:'Napoli',postalCode:'80100',country:'IT'},
    {city:'Torino',postalCode:'10100',country:'IT'},{city:'Firenze',postalCode:'50100',country:'IT'},{city:'Bologna',postalCode:'40100',country:'IT'},
    {city:'Venezia',postalCode:'30100',country:'IT'},{city:'Verona',postalCode:'37100',country:'IT'},{city:'Genova',postalCode:'16100',country:'IT'},
    {city:'Palermo',postalCode:'90100',country:'IT'},{city:'Catania',postalCode:'95100',country:'IT'},{city:'Bari',postalCode:'70100',country:'IT'},
  ],
  nl: [
    {city:'Amsterdam',postalCode:'1011',country:'NL'},{city:'Rotterdam',postalCode:'3011',country:'NL'},{city:'Den Haag',postalCode:'2511',country:'NL'},
    {city:'Utrecht',postalCode:'3511',country:'NL'},{city:'Eindhoven',postalCode:'5611',country:'NL'},{city:'Groningen',postalCode:'9711',country:'NL'},
    {city:'Tilburg',postalCode:'5038',country:'NL'},{city:'Breda',postalCode:'4811',country:'NL'},{city:'Nijmegen',postalCode:'6511',country:'NL'},
    {city:'Maastricht',postalCode:'6211',country:'NL'},{city:'Leiden',postalCode:'2311',country:'NL'},{city:'Haarlem',postalCode:'2011',country:'NL'},
  ],
  pt: [
    {city:'Lisboa',postalCode:'1100',country:'PT'},{city:'Porto',postalCode:'4000',country:'PT'},{city:'Braga',postalCode:'4700',country:'PT'},
    {city:'Coimbra',postalCode:'3000',country:'PT'},{city:'Faro',postalCode:'8000',country:'PT'},{city:'Funchal',postalCode:'9000',country:'PT'},
    {city:'Aveiro',postalCode:'3800',country:'PT'},{city:'Évora',postalCode:'7000',country:'PT'},{city:'Setúbal',postalCode:'2900',country:'PT'},
    {city:'Viseu',postalCode:'3500',country:'PT'},{city:'Leiria',postalCode:'2400',country:'PT'},{city:'Guimarães',postalCode:'4800',country:'PT'},
  ],
  pl: [
    {city:'Warszawa',postalCode:'00-001',country:'PL'},{city:'Kraków',postalCode:'30-001',country:'PL'},{city:'Wrocław',postalCode:'50-001',country:'PL'},
    {city:'Poznań',postalCode:'60-001',country:'PL'},{city:'Gdańsk',postalCode:'80-001',country:'PL'},{city:'Łódź',postalCode:'90-001',country:'PL'},
    {city:'Katowice',postalCode:'40-001',country:'PL'},{city:'Lublin',postalCode:'20-001',country:'PL'},{city:'Szczecin',postalCode:'70-001',country:'PL'},
    {city:'Toruń',postalCode:'87-100',country:'PL'},{city:'Bydgoszcz',postalCode:'85-001',country:'PL'},{city:'Białystok',postalCode:'15-001',country:'PL'},
  ],
  tr: [
    {city:'İstanbul',postalCode:'34000',country:'TR'},{city:'Ankara',postalCode:'06000',country:'TR'},{city:'İzmir',postalCode:'35000',country:'TR'},
    {city:'Antalya',postalCode:'07000',country:'TR'},{city:'Bursa',postalCode:'16000',country:'TR'},{city:'Adana',postalCode:'01000',country:'TR'},
    {city:'Konya',postalCode:'42000',country:'TR'},{city:'Gaziantep',postalCode:'27000',country:'TR'},{city:'Mersin',postalCode:'33000',country:'TR'},
    {city:'Eskişehir',postalCode:'26000',country:'TR'},{city:'Kayseri',postalCode:'38000',country:'TR'},{city:'Trabzon',postalCode:'61000',country:'TR'},
  ],
  ru: [
    {city:'Москва',postalCode:'101000',country:'RU'},{city:'Санкт-Петербург',postalCode:'190000',country:'RU'},{city:'Новосибирск',postalCode:'630000',country:'RU'},
    {city:'Екатеринбург',postalCode:'620000',country:'RU'},{city:'Казань',postalCode:'420000',country:'RU'},{city:'Нижний Новгород',postalCode:'603000',country:'RU'},
    {city:'Самара',postalCode:'443000',country:'RU'},{city:'Краснодар',postalCode:'350000',country:'RU'},{city:'Сочи',postalCode:'354000',country:'RU'},
    {city:'Ростов-на-Дону',postalCode:'344000',country:'RU'},{city:'Уфа',postalCode:'450000',country:'RU'},{city:'Воронеж',postalCode:'394000',country:'RU'},
  ],
  sv: [
    {city:'Stockholm',postalCode:'111 20',country:'SE'},{city:'Göteborg',postalCode:'411 01',country:'SE'},{city:'Malmö',postalCode:'211 18',country:'SE'},
    {city:'Uppsala',postalCode:'751 70',country:'SE'},{city:'Linköping',postalCode:'581 83',country:'SE'},{city:'Örebro',postalCode:'701 10',country:'SE'},
    {city:'Västerås',postalCode:'722 11',country:'SE'},{city:'Helsingborg',postalCode:'252 20',country:'SE'},{city:'Norrköping',postalCode:'602 21',country:'SE'},
    {city:'Lund',postalCode:'221 00',country:'SE'},{city:'Umeå',postalCode:'903 25',country:'SE'},{city:'Jönköping',postalCode:'553 20',country:'SE'},
  ],
  da: [
    {city:'København',postalCode:'1000',country:'DK'},{city:'Aarhus',postalCode:'8000',country:'DK'},{city:'Odense',postalCode:'5000',country:'DK'},
    {city:'Aalborg',postalCode:'9000',country:'DK'},{city:'Esbjerg',postalCode:'6700',country:'DK'},{city:'Randers',postalCode:'8900',country:'DK'},
    {city:'Kolding',postalCode:'6000',country:'DK'},{city:'Horsens',postalCode:'8700',country:'DK'},{city:'Vejle',postalCode:'7100',country:'DK'},
    {city:'Roskilde',postalCode:'4000',country:'DK'},{city:'Herning',postalCode:'7400',country:'DK'},{city:'Silkeborg',postalCode:'8600',country:'DK'},
  ],
  no: [
    {city:'Oslo',postalCode:'0001',country:'NO'},{city:'Bergen',postalCode:'5003',country:'NO'},{city:'Trondheim',postalCode:'7010',country:'NO'},
    {city:'Stavanger',postalCode:'4001',country:'NO'},{city:'Drammen',postalCode:'3001',country:'NO'},{city:'Tromsø',postalCode:'9008',country:'NO'},
    {city:'Kristiansand',postalCode:'4611',country:'NO'},{city:'Fredrikstad',postalCode:'1601',country:'NO'},{city:'Sandnes',postalCode:'4307',country:'NO'},
    {city:'Bodø',postalCode:'8001',country:'NO'},{city:'Ålesund',postalCode:'6003',country:'NO'},{city:'Tønsberg',postalCode:'3110',country:'NO'},
  ],
  fi: [
    {city:'Helsinki',postalCode:'00100',country:'FI'},{city:'Espoo',postalCode:'02100',country:'FI'},{city:'Tampere',postalCode:'33100',country:'FI'},
    {city:'Turku',postalCode:'20100',country:'FI'},{city:'Oulu',postalCode:'90100',country:'FI'},{city:'Jyväskylä',postalCode:'40100',country:'FI'},
    {city:'Lahti',postalCode:'15100',country:'FI'},{city:'Kuopio',postalCode:'70100',country:'FI'},{city:'Rovaniemi',postalCode:'96100',country:'FI'},
    {city:'Vaasa',postalCode:'65100',country:'FI'},{city:'Joensuu',postalCode:'80100',country:'FI'},{city:'Hämeenlinna',postalCode:'13100',country:'FI'},
  ],
  ro: [
    {city:'București',postalCode:'010001',country:'RO'},{city:'Cluj-Napoca',postalCode:'400001',country:'RO'},{city:'Timișoara',postalCode:'300001',country:'RO'},
    {city:'Iași',postalCode:'700001',country:'RO'},{city:'Brașov',postalCode:'500001',country:'RO'},{city:'Constanța',postalCode:'900001',country:'RO'},
    {city:'Sibiu',postalCode:'550001',country:'RO'},{city:'Craiova',postalCode:'200001',country:'RO'},{city:'Oradea',postalCode:'410001',country:'RO'},
    {city:'Galați',postalCode:'800001',country:'RO'},{city:'Ploiești',postalCode:'100001',country:'RO'},{city:'Arad',postalCode:'310001',country:'RO'},
  ],
  cs: [
    {city:'Praha',postalCode:'110 00',country:'CZ'},{city:'Brno',postalCode:'602 00',country:'CZ'},{city:'Ostrava',postalCode:'702 00',country:'CZ'},
    {city:'Plzeň',postalCode:'301 00',country:'CZ'},{city:'Liberec',postalCode:'460 01',country:'CZ'},{city:'Olomouc',postalCode:'779 00',country:'CZ'},
    {city:'České Budějovice',postalCode:'370 01',country:'CZ'},{city:'Hradec Králové',postalCode:'500 02',country:'CZ'},{city:'Pardubice',postalCode:'530 02',country:'CZ'},
    {city:'Zlín',postalCode:'760 01',country:'CZ'},{city:'Karlovy Vary',postalCode:'360 01',country:'CZ'},{city:'Jihlava',postalCode:'586 01',country:'CZ'},
  ],
  hu: [
    {city:'Budapest',postalCode:'1011',country:'HU'},{city:'Debrecen',postalCode:'4024',country:'HU'},{city:'Szeged',postalCode:'6720',country:'HU'},
    {city:'Miskolc',postalCode:'3525',country:'HU'},{city:'Pécs',postalCode:'7621',country:'HU'},{city:'Győr',postalCode:'9021',country:'HU'},
    {city:'Nyíregyháza',postalCode:'4400',country:'HU'},{city:'Kecskemét',postalCode:'6000',country:'HU'},{city:'Székesfehérvár',postalCode:'8000',country:'HU'},
    {city:'Szombathely',postalCode:'9700',country:'HU'},{city:'Eger',postalCode:'3300',country:'HU'},{city:'Veszprém',postalCode:'8200',country:'HU'},
  ],
};
