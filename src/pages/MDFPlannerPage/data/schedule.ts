export interface Band {
  name: string;
  start: string;
  end: string;
  origin_genre: string;
  description: string;
}

export interface Stage {
  name: string;
  bands: Band[];
}

export interface DaySchedule {
  day: string;
  date: string;
  doors: Record<string, string>;
  stages: Stage[];
}

export const scheduleData: DaySchedule[] = [
  {
    day: "Friday",
    date: "FRIDAY MAY 22, 2026",
    doors: {
      "MARKET PLACE": "03:00 PM",
      "NEVERMORE HALL": "04:30 PM",
      "SOUNDSTAGE": "03:30 PM"
    },
    stages: [
      {
        name: "POWER PLANT LIVE",
        bands: [
          { name: "LEFT CROSS", start: "06:50 PM", end: "07:35 PM", origin_genre: "USA (Ohio) • Death Metal", description: "Old-school, early US death metal with a raw, primitive intensity." },
          { name: "WOLFHEART", start: "08:45 PM", end: "09:35 PM", origin_genre: "Finland • Melodic Death Metal", description: "Melodic yet ferocious death metal with epic, folk-tinged atmosphere." },
          { name: "THE CROWN", start: "11:10 PM", end: "12:00 AM", origin_genre: "Sweden • Death/Thrash Metal", description: "Swedish death/thrash legends blending speed, melody and brutality." }
        ]
      },
      {
        name: "MARKET PLACE",
        bands: [
          { name: "WITCH VOMIT", start: "03:45 PM", end: "04:20 PM", origin_genre: "USA (California) • Death Metal", description: "Raw, old-school death metal steeped in early '90s influence." },
          { name: "NECROFIER", start: "04:40 PM", end: "05:20 PM", origin_genre: "USA (Texas) • Death Metal", description: "Sick, putrid death metal with a nasty, underground edge." },
          { name: "GOD DETHRONED", start: "05:55 PM", end: "06:45 PM", origin_genre: "Netherlands • Death Metal", description: "Veteran death metal band with a relentless, traditional Dutch sound." },
          { name: "ROTTING CHRIST", start: "07:40 PM", end: "08:40 PM", origin_genre: "Greece • Black/Death Metal", description: "Greek metal pioneers blending black and death metal with occult atmospheres." },
          { name: "OLD MAN'S CHILD", start: "09:40 PM", end: "10:40 PM", origin_genre: "Norway • Black/Death Metal", description: "Progressive, technical black/death metal from former Immortal frontman Galder." }
        ]
      },
      {
        name: "NEVERMORE HALL",
        bands: [
          { name: "LÖMSK", start: "05:15 PM", end: "06:00 PM", origin_genre: "Sweden • Death Metal", description: "Putrid, downtuned death metal with a cavernous, oppressive feel." },
          { name: "PAN-AMERIKAN NATIVE FRONT", start: "06:55 PM", end: "07:40 PM", origin_genre: "USA (Texas) • Black Metal", description: "Raw, aggressive black metal with anti-colonial themes and indigenous resistance." },
          { name: "WAYFARER", start: "08:45 PM", end: "09:25 PM", origin_genre: "USA (Colorado) • Black Metal", description: "Atmospheric, western black metal with a haunting, post-rock influence." },
          { name: "DER WEG EINER FREIHEIT", start: "10:45 PM", end: "11:35 PM", origin_genre: "Germany • Black Metal", description: "Post-black metal with epic songwriting and emotional depth." },
          { name: "ORANSSI PAZUZU", start: "12:15 AM", end: "01:15 AM", origin_genre: "Finland • Progressive Black Metal", description: "Psychedelic, avant-garde black metal pushing the boundaries of the genre." }
        ]
      },
      {
        name: "SOUNDSTAGE",
        bands: [
          { name: "ORDH", start: "04:20 PM", end: "04:50 PM", origin_genre: "USA (California) • Death Metal", description: "Blistering, chaotic death metal with a crusty, punk-fueled edge." },
          { name: "MELTING ROT", start: "05:25 PM", end: "05:55 PM", origin_genre: "USA (Michigan) • Death Metal", description: "Disgusting, groove-laden death metal in the spirit of early '90s American death metal." },
          { name: "DIABOLIC OATH", start: "06:50 PM", end: "07:25 PM", origin_genre: "USA (Washington) • Black/Death Metal", description: "Blackened death metal with satanic themes and vicious Old School energy." },
          { name: "TO VIOLENTLY VOMIT", start: "08:40 PM", end: "09:20 PM", origin_genre: "USA (California) • Death Metal", description: "Slamming, brutal death metal with gore-soaked lyrics and crushing breakdowns." },
          { name: "ROTTREVORE", start: "10:40 PM", end: "11:20 PM", origin_genre: "USA (Pennsylvania) • Death Metal", description: "Grotesque, heavy death metal with a filthy, oppressive sound." },
          { name: "LIVIDITY", start: "12:00 AM", end: "12:50 AM", origin_genre: "USA (Florida) • Death Metal", description: "Technical, heavy death metal with a focus on atmosphere and brutality." }
        ]
      },
      {
        name: "ANGELS ROCK BAR",
        bands: [
          { name: "WITHERING SOUL", start: "09:10 PM", end: "09:40 PM", origin_genre: "USA (Michigan) • Death Metal", description: "Old-school death metal with a dark, doomy atmosphere." },
          { name: "BONE WEAPON", start: "10:40 PM", end: "11:10 PM", origin_genre: "USA (Pennsylvania) • Death Metal", description: "Straightforward, crushing death metal with a classic underground feel." },
          { name: "TITHE", start: "11:30 PM", end: "12:00 AM", origin_genre: "USA (Arizona) • Death Metal", description: "Heavy, punishing death metal with a bleak, apocalyptic tone." }
        ]
      }
    ]
  },
  {
    day: "Saturday",
    date: "SATURDAY MAY 23, 2026",
    doors: {
      "MARKET PLACE": "01:00 PM",
      "NEVERMORE HALL": "04:30 PM",
      "SOUNDSTAGE": "01:30 PM"
    },
    stages: [
      {
        name: "POWER PLANT LIVE",
        bands: [
          { name: "LACERATION", start: "05:35 PM", end: "06:10 PM", origin_genre: "USA (California) • Death Metal", description: "Punishing, old-school death metal with crushing grooves." },
          { name: "MACABRE", start: "07:05 PM", end: "07:50 PM", origin_genre: "USA (Illinois) • Death/Grind", description: "Legends of gore-soaked grind/death metal." },
          { name: "MORTICIAN", start: "08:50 PM", end: "09:35 PM", origin_genre: "USA (New York) • Death Metal", description: "Pioneers of horror-themed death metal with samples and drum machines." },
          { name: "SINISTER", start: "11:15 PM", end: "12:00 AM", origin_genre: "Netherlands • Death Metal", description: "Technical, brutal death metal influenced by thrash." }
        ]
      },
      {
        name: "MARKET PLACE",
        bands: [
          { name: "TORTURE RACK", start: "02:25 PM", end: "03:05 PM", origin_genre: "USA (California) • Death Metal", description: "Old-school death metal with a raw, mid-'90s style." },
          { name: "WARBRINGER", start: "03:30 PM", end: "04:15 PM", origin_genre: "USA (California) • Thrash Metal", description: "Modern thrash metal with speed, melody and sci-fi themes." },
          { name: "WHIPLASH", start: "04:40 PM", end: "05:30 PM", origin_genre: "USA (New Jersey) • Thrash Metal", description: "Classic thrash with crossover influences." },
          { name: "PIG DESTROYER", start: "06:15 PM", end: "07:00 PM", origin_genre: "USA (Virginia) • Grindcore", description: "Intense, technically brutal grindcore with dark themes." },
          { name: "DESTRUCTION", start: "07:55 PM", end: "08:45 PM", origin_genre: "Germany • Thrash Metal", description: "German thrash legends (est. 1982)." },
          { name: "KREATOR", start: "09:45 PM", end: "10:45 PM", origin_genre: "Germany • Thrash Metal", description: "One of Germany's \"Big Four\" of thrash metal." }
        ]
      },
      {
        name: "NEVERMORE HALL",
        bands: [
          { name: "POLTERGEIST", start: "05:35 PM", end: "06:10 PM", origin_genre: "Switzerland • Thrash Metal", description: "Old-school thrash metal in the vein of early '90s." },
          { name: "SARDONIC WITCHERY", start: "06:35 PM", end: "07:15 PM", origin_genre: "USA • Black Metal", description: "Raw black metal with occult and anti-religious themes." },
          { name: "HELLBUTCHER", start: "08:50 PM", end: "09:40 PM", origin_genre: "Sweden • Black Metal", description: "Raw, old-school Swedish black metal from the ex-Nifelheim frontman." },
          { name: "HAVUKRUUNU", start: "10:55 PM", end: "11:45 PM", origin_genre: "Finland • Pagan/Black Metal", description: "Melodic, atmospheric black/pagan metal rooted in Finnish folklore and nature." },
          { name: "1914", start: "12:10 AM", end: "01:00 AM", origin_genre: "Ukraine • Blackened Death/Doom", description: "Atmospheric black metal inspired by WWI history and themes." }
        ]
      },
      {
        name: "SOUNDSTAGE",
        bands: [
          { name: "DEAD VOID", start: "02:00 PM", end: "02:35 PM", origin_genre: "USA (New York) • Death Metal", description: "Old-school death metal with a morbid, underground edge." },
          { name: "GESTATION", start: "03:05 PM", end: "03:35 PM", origin_genre: "USA (California) • Death Metal", description: "Slamming, brutal death metal with technical precision." },
          { name: "MELLOW HARSHER", start: "04:15 PM", end: "04:50 PM", origin_genre: "USA (California) • Death Metal", description: "Heavy, downtuned death metal with a bleak, doom-laden feel." },
          { name: "TERROR CORPSE", start: "05:35 PM", end: "06:10 PM", origin_genre: "USA (Texas) • Death Metal", description: "Grotesque death metal with horror and gore themes." },
          { name: "OSSUARY", start: "07:15 PM", end: "07:55 PM", origin_genre: "USA (Wisconsin) • Death Metal", description: "Old-school death metal with a raw, crushing assault." },
          { name: "SOIL OF IGNORANCE", start: "08:15 PM", end: "08:50 PM", origin_genre: "USA (Michigan) • Death Metal", description: "Brutal, old-school death metal with a hateful edge." },
          { name: "MIASMATIC NECROSIS", start: "10:45 PM", end: "11:15 PM", origin_genre: "USA • Death Metal", description: "Gore-infused death metal with underground ferocity." },
          { name: "SHITSTORM", start: "11:40 PM", end: "12:15 AM", origin_genre: "USA (Florida) • Grindcore", description: "Fast, brutal grindcore with political intensity." },
          { name: "ROTTEN SOUND", start: "12:45 AM", end: "01:30 AM", origin_genre: "Finland • Grindcore", description: "Grindcore pioneers with relentless intensity." }
        ]
      },
      {
        name: "ANGELS ROCK BAR",
        bands: [
          { name: "DESOLUS", start: "09:15 PM", end: "09:45 PM", origin_genre: "USA (Virginia) • Doom/Death", description: "Funeral doom metal with crushing atmosphere." },
          { name: "ATAVISTIC DECAY", start: "10:40 PM", end: "11:10 PM", origin_genre: "USA (Florida) • Death Metal", description: "Old-school death metal with a savage, underground sound." },
          { name: "GLORIOUS DEPRAVITY", start: "11:45 PM", end: "12:15 AM", origin_genre: "USA • Death Metal", description: "Underground death metal with a dark, blasphemous edge." }
        ]
      }
    ]
  },
  {
    day: "Sunday",
    date: "SUNDAY MAY 24, 2026",
    doors: {
      "MARKET PLACE": "02:00 PM",
      "NEVERMORE HALL": "03:30 PM",
      "SOUNDSTAGE": "02:30 PM"
    },
    stages: [
      {
        name: "POWER PLANT LIVE",
        bands: [
          { name: "UNMERCIFUL", start: "05:35 PM", end: "06:15 PM", origin_genre: "USA (Kansas) • Death Metal", description: "Old-school death metal with a sinister edge." },
          { name: "BLOOD RED THRONE", start: "07:05 PM", end: "07:50 PM", origin_genre: "Norway • Death Metal", description: "Blasphemous, unrelenting Norwegian extreme metal." },
          { name: "VIO-LENCE", start: "08:50 PM", end: "09:40 PM", origin_genre: "USA (California) • Thrash Metal", description: "Pioneers of crossover thrash from the Bay Area." },
          { name: "DYING FETUS", start: "11:10 PM", end: "12:00 AM", origin_genre: "USA (Maryland) • Brutal/Tech Death Metal", description: "Political, savage and relentless extreme metal." }
        ]
      },
      {
        name: "MARKET PLACE",
        bands: [
          { name: "CAVEMAN CULT", start: "03:30 PM", end: "04:10 PM", origin_genre: "USA (Florida) • Blackened Death Metal", description: "Primitive, crushing old-school death metal." },
          { name: "CANCER", start: "04:40 PM", end: "05:30 PM", origin_genre: "UK (England) • Death Metal", description: "UK death metal pioneers since 1988." },
          { name: "DEATH ANGEL", start: "06:15 PM", end: "07:05 PM", origin_genre: "USA (California) • Thrash Metal", description: "Bay Area thrash legends since 1982." },
          { name: "GRAVE", start: "07:55 PM", end: "08:45 PM", origin_genre: "Sweden • Death Metal", description: "Legends of Swedish death metal since the late '80s." },
          { name: "SARCÓFAGO", start: "09:45 PM", end: "10:45 PM", origin_genre: "Brazil • Black/Thrash Metal", description: "Brazilian black/thrash metal pioneers." }
        ]
      },
      {
        name: "NEVERMORE HALL",
        bands: [
          { name: "ABERRATION", start: "04:05 PM", end: "04:40 PM", origin_genre: "USA • Death Metal", description: "Old-school style death metal with a nihilistic tone." },
          { name: "WRATHPRAYER", start: "05:35 PM", end: "06:15 PM", origin_genre: "Chile • Black/Death Metal", description: "Chaotic and ritualistic extreme metal from South America." },
          { name: "WOE", start: "07:05 PM", end: "07:50 PM", origin_genre: "USA • Black Metal", description: "Atmospheric, political and uncompromising." },
          { name: "ANTICHRIST SIEGE MACHINE", start: "08:50 PM", end: "09:35 PM", origin_genre: "USA (Virginia) • War Metal", description: "Relentless war metal assault with no mercy." },
          { name: "...AND OCEANS", start: "10:50 PM", end: "11:40 PM", origin_genre: "Finland • Symphonic/Industrial Black Metal", description: "Atmospheric black metal with evolving symphonic and industrial elements." },
          { name: "BATUSHKA", start: "12:20 AM", end: "01:20 AM", origin_genre: "Poland • Black Metal", description: "Liturgical black metal rooted in Orthodox tradition." }
        ]
      },
      {
        name: "SOUNDSTAGE",
        bands: [
          { name: "AISLE19", start: "03:05 PM", end: "03:30 PM", origin_genre: "USA (Maryland) • Death Metal", description: "Modern underground brutality." },
          { name: "HEMORRHOID", start: "04:15 PM", end: "04:50 PM", origin_genre: "Slovakia • Goregrind", description: "Filthy, fast and brutal goregrind assault." },
          { name: "EXCRESCENCE", start: "05:40 PM", end: "06:15 PM", origin_genre: "USA (New York) • Brutal Death Metal", description: "Technical, suffocating brutality." },
          { name: "AFTERMATH", start: "07:15 PM", end: "07:50 PM", origin_genre: "USA (Arizona) • Grindcore", description: "Old-school grindcore violence from the desert." },
          { name: "HOUKAGO GRIND TIME", start: "08:40 PM", end: "09:25 PM", origin_genre: "Japan • Grindcore", description: "Hyper-fast, chaotic Japanese grindcore mayhem." },
          { name: "SEX PRISONER", start: "10:35 PM", end: "11:10 PM", origin_genre: "USA (Arizona) • Grindcore", description: "Fast, raw grindcore with attitude." },
          { name: "I.T.O.O.H.!", start: "11:35 PM", end: "12:20 AM", origin_genre: "Czech Republic (Prague) • Grindcore / Experimental Deathgrind", description: "Chaotic, technical and utterly unhinged." },
          { name: "CEPHALIC CARNAGE", start: "12:45 AM", end: "01:30 AM", origin_genre: "USA (Colorado) • Deathgrind", description: "Technical death metal meets grindcore insanity." }
        ]
      },
      {
        name: "ANGELS ROCK BAR",
        bands: [
          { name: "TÓMARÚM", start: "09:20 PM", end: "09:50 PM", origin_genre: "USA • Progressive Black Metal", description: "Atmospheric, melodic and expansive." },
          { name: "GUDSFORLADT", start: "10:50 PM", end: "11:20 PM", origin_genre: "USA (Salem, Massachusetts / Los Angeles, California) • Black Metal", description: "Raw, hateful black metal. \"Gudsforladt\" (Danish for \"Godforsaken\") — unforgiving and relentless." },
          { name: "CEMETERY MOON", start: "11:45 PM", end: "12:20 AM", origin_genre: "USA • Black Metal", description: "Occult, atmospheric black metal." }
        ]
      }
    ]
  }
];

export const parseTime = (timeStr: string): number => {
  // Example: "06:50 PM" or "12:15 AM"
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  
  if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }
  
  // To handle after-midnight sets (e.g. 12:15 AM -> +24hrs)
  if (period === "AM" && hours < 5) {
    hours += 24;
  }
  
  return (hours * 60) + minutes;
};
