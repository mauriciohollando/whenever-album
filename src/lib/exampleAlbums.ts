import type { AlbumPage, AlbumPhoto, AlbumYear, PublicAlbum } from "./types";

export type ExamplePerson = {
  name: string;
  description: string;
  look: string;
};

export type ExampleAlbum = {
  id: string;
  family: string;
  window: string;
  place: string;
  tags: string[];
  blurb: string;
  start: AlbumYear;
  end: AlbumYear;
  people: ExamplePerson[];
  events: { name: string; description: string }[];
  pages: AlbumPage[];
};

function shot(
  album: string,
  id: string,
  title: string,
  description: string,
  yearLabel: string,
  members: string[]
): AlbumPhoto {
  return {
    id,
    title,
    description,
    yearLabel,
    imageUrl: `/examples/${album}/${id}.png`,
    members,
  };
}

export const EXAMPLE_ALBUMS: ExampleAlbum[] = [
  {
    id: "callahans",
    family: "The Callahans",
    window: "1946–1968",
    place: "Queens, then a borrowed lake house",
    tags: ["Candid", "Seasonal", "Tender"],
    blurb:
      "A postwar kitchen, a first car that never started on the first try, and the summer the twins learned to float.",
    start: { year: 1946, era: "AD" },
    end: { year: 1968, era: "AD" },
    people: [
      {
        name: "Frank",
        description: "Mechanic hands, Sunday shirts, thinks a joke can fix a silence.",
        look: "Irish-American man, dark wavy hair, thick brows, warm brown eyes, square jaw, broad shoulders",
      },
      {
        name: "Nora",
        description: "Keeps four kinds of fruit in the bag and still asks if anyone is hungry.",
        look: "Fair woman, auburn pin-curl hair, freckles, green eyes, slim, calm mouth",
      },
      {
        name: "Annie",
        description: "Eldest twin. Watches the room before she enters it.",
        look: "Girl then young woman, Frank's dark hair, Nora's freckles, serious eyes",
      },
      {
        name: "Peggy",
        description: "The other twin. Enters the room first.",
        look: "Annie's twin, same face a little sunnier, gap tooth as a child",
      },
      {
        name: "Tommy",
        description: "Younger brother. Ears like radar. Always wet from somewhere.",
        look: "Younger boy, Nora's auburn, protruding ears, skinny, restless",
      },
    ],
    events: [
      { name: "The stoop", description: "First Sunday they all fit on the steps." },
      { name: "Borrowed lake house", description: "They told the kids the canoe came with the house." },
      { name: "The twins learn to float", description: "Peggy did. Annie negotiated with the water." },
      { name: "First car", description: "It never started on the first try." },
    ],
    pages: [
      {
        index: 1,
        heading: "The stoop, 1948",
        photos: [
          shot(
            "callahans",
            "c01",
            "Sunday shirts",
            "Frank holds the baby like a football. Nora has flour on one wrist and will not admit it.",
            "1948",
            ["Frank", "Nora", "Annie"]
          ),
        ],
      },
      {
        index: 2,
        heading: "The garden that fed us",
        photos: [
          shot(
            "callahans",
            "c02",
            "Nora in June",
            "She planted tomatoes like they were an argument she intended to win.",
            "1951",
            ["Nora"]
          ),
          shot(
            "callahans",
            "c03",
            "The twins, unimpressed",
            "Annie and Peggy in the beans, already deciding who gets the bigger chair.",
            "1951",
            ["Annie", "Peggy"]
          ),
        ],
      },
      {
        index: 3,
        heading: "After the shop closed",
        photos: [
          shot(
            "callahans",
            "c04",
            "Frank's hands",
            "Grease in the creases. He washed twice and still left a thumbprint on the icebox.",
            "1952",
            ["Frank"]
          ),
        ],
      },
      {
        index: 4,
        heading: "The lake that wasn't ours",
        photos: [
          shot(
            "callahans",
            "c05",
            "Borrowed oars",
            "They told the kids the canoe came with the house. It did not.",
            "1956",
            ["Frank", "Tommy"]
          ),
          shot(
            "callahans",
            "c06",
            "Nora in the shade",
            "She packed four kinds of fruit and still asked if anyone was hungry.",
            "1956",
            ["Nora"]
          ),
        ],
      },
      {
        index: 5,
        heading: "The twins learn to float",
        photos: [
          shot(
            "callahans",
            "c07",
            "Peggy first",
            "Peggy went horizontal like she had been waiting for permission from the lake.",
            "1956",
            ["Peggy"]
          ),
        ],
      },
      {
        index: 6,
        heading: "Radio hour",
        photos: [
          shot(
            "callahans",
            "c08",
            "The good chair",
            "Frank got the chair. Everyone else got the floor and a story about a pitcher they had never seen.",
            "1957",
            ["Frank", "Nora", "Annie", "Peggy", "Tommy"]
          ),
        ],
      },
      {
        index: 7,
        heading: "First car",
        photos: [
          shot(
            "callahans",
            "c09",
            "It never started first",
            "Tommy is already in the back seat. Frank is still negotiating with the hood.",
            "1958",
            ["Frank", "Tommy"]
          ),
          shot(
            "callahans",
            "c10",
            "Nora will not sit in it yet",
            "She said she would ride when it learned manners. The car is listening, poorly.",
            "1958",
            ["Nora"]
          ),
        ],
      },
      {
        index: 8,
        heading: "Picture day",
        photos: [
          shot(
            "callahans",
            "c11",
            "Annie's ribbon",
            "She hated the ribbon and wore it anyway. The photograph is the only one who won.",
            "1959",
            ["Annie"]
          ),
        ],
      },
      {
        index: 9,
        heading: "Kitchen table, winter",
        photos: [
          shot(
            "callahans",
            "c12",
            "Homework and stew",
            "Peggy is doing fractions in the steam. Tommy is eating like he invented hunger.",
            "1960",
            ["Nora", "Peggy", "Tommy"]
          ),
        ],
      },
      {
        index: 10,
        heading: "The borrowed house again",
        photos: [
          shot(
            "callahans",
            "c13",
            "Same dock, taller kids",
            "The boards remember their feet. The kids do not remember being small.",
            "1961",
            ["Annie", "Peggy", "Tommy"]
          ),
        ],
      },
      {
        index: 11,
        heading: "Tommy's bicycle",
        photos: [
          shot(
            "callahans",
            "c14",
            "No hands, briefly",
            "Frank said if he broke his arm he could still work the register. Tommy took this as encouragement.",
            "1962",
            ["Tommy"]
          ),
        ],
      },
      {
        index: 12,
        heading: "Nora at the window",
        photos: [
          shot(
            "callahans",
            "c15",
            "Late light, Queens",
            "She is not waiting for anyone. She is counting the years that already happened.",
            "1963",
            ["Nora"]
          ),
        ],
      },
      {
        index: 13,
        heading: "Block party",
        photos: [
          shot(
            "callahans",
            "c16",
            "Frank brought the folding table",
            "He also brought a story about the table. Both were slightly unstable.",
            "1964",
            ["Frank", "Annie"]
          ),
        ],
      },
      {
        index: 14,
        heading: "High school, Annie",
        photos: [
          shot(
            "callahans",
            "c17",
            "The serious year",
            "She started wearing Nora's coat. It fit in the shoulders and nowhere else that mattered.",
            "1965",
            ["Annie"]
          ),
        ],
      },
      {
        index: 15,
        heading: "Dusk on the lake",
        photos: [
          shot(
            "callahans",
            "c18",
            "Peggy still wet",
            "She never toweled off in time. The photograph always caught the shine.",
            "1965",
            ["Peggy"]
          ),
          shot(
            "callahans",
            "c19",
            "Frank watches from the porch",
            "He looks like a man who finally believes the canoe is theirs.",
            "1965",
            ["Frank"]
          ),
        ],
      },
      {
        index: 16,
        heading: "Thanksgiving",
        photos: [
          shot(
            "callahans",
            "c20",
            "Too many chairs",
            "Nora made them bring the kitchen chairs outside. Someone's cousin is already carved out of the frame.",
            "1966",
            ["Frank", "Nora", "Annie", "Peggy", "Tommy"]
          ),
        ],
      },
      {
        index: 17,
        heading: "Tommy taller than Nora",
        photos: [
          shot(
            "callahans",
            "c21",
            "The doorway proof",
            "They made him stand in the frame. He pretended not to like it. He liked it.",
            "1967",
            ["Nora", "Tommy"]
          ),
        ],
      },
      {
        index: 18,
        heading: "Last summer at the lake",
        photos: [
          shot(
            "callahans",
            "c22",
            "The four of them, almost grown",
            "Annie has a camera. Peggy has a secret. Tommy has a sunburn. The lake has all of them.",
            "1967",
            ["Annie", "Peggy", "Tommy"]
          ),
        ],
      },
      {
        index: 19,
        heading: "A quiet Sunday",
        photos: [
          shot(
            "callahans",
            "c23",
            "Coffee for two",
            "The kids are elsewhere. The radio is lower. Frank has finally learned to sit.",
            "1968",
            ["Frank", "Nora"]
          ),
        ],
      },
      {
        index: 20,
        heading: "Still here, 1968",
        photos: [
          shot(
            "callahans",
            "c24",
            "The stoop again",
            "Same steps. Different height of the light. They kept the Sunday shirts.",
            "1968",
            ["Frank", "Nora", "Annie", "Peggy", "Tommy"]
          ),
        ],
      },
    ],
  },
  {
    id: "adler",
    family: "House of Adler",
    window: "1089–1099",
    place: "Somewhere dusty on the way to the old city",
    tags: ["Ridiculous", "Epic", "Travel"],
    blurb:
      "A family album that treats the First Crusade like a chaotic group trip, complete with a caption about meeting a very large dog outside the walls.",
    start: { year: 1089, era: "AD" },
    end: { year: 1099, era: "AD" },
    people: [
      {
        name: "Ida",
        description: "Packs the map, ignores the map, arrives anyway.",
        look: "Olive-skinned woman, mid-40s, dark braid, strong nose, determined eyes, wool cloak",
      },
      {
        name: "Levi",
        description: "Keeps the cheese. Loses the road. Means well loudly.",
        look: "Lean man, full beard, anxious kind eyes, receding hair, linen and dust",
      },
      {
        name: "Ruth",
        description: "Fourteen going on commander. Names every animal.",
        look: "Teen girl, Ida's eyes, dust in dark hair, too-big cloak, curious grin",
      },
      {
        name: "Jonas",
        description: "The youngest. Thinks the whole century is a parade.",
        look: "Small boy, Levi's ears, sunburned nose, wooden toy sword",
      },
    ],
    events: [
      { name: "Provisions", description: "Three cloaks, one map, a wheel of cheese that becomes a character." },
      { name: "A very large dog", description: "Ruth maintains it was a lion." },
      { name: "Conquest of Jerusalem", description: "That time we conquered the old city." },
      { name: "The cheese funeral", description: "It did not survive Antioch." },
    ],
    pages: [
      {
        index: 1,
        heading: "Provisions, 1091",
        photos: [
          shot(
            "adler",
            "a01",
            "The packing list",
            "Three cloaks, one questionable map, and a wheel of cheese that becomes a character.",
            "1091",
            ["Ida", "Levi"]
          ),
        ],
      },
      {
        index: 2,
        heading: "We left before the bread cooled",
        photos: [
          shot(
            "adler",
            "a02",
            "Jonas and the gate",
            "He waved at a city that was not waving back. Ida let him. It was that kind of morning.",
            "1091",
            ["Ida", "Jonas"]
          ),
          shot(
            "adler",
            "a03",
            "Levi counts the sacks again",
            "There were five. There are four. He is choosing which number to believe.",
            "1091",
            ["Levi"]
          ),
        ],
      },
      {
        index: 3,
        heading: "The map situation",
        photos: [
          shot(
            "adler",
            "a04",
            "Ida knows a shortcut",
            "The shortcut has hills. The hills have opinions. Ruth is already ahead.",
            "1092",
            ["Ida", "Ruth"]
          ),
        ],
      },
      {
        index: 4,
        heading: "A river, finally",
        photos: [
          shot(
            "adler",
            "a05",
            "Washing the century off",
            "Levi pretends he is not happy. His beard gives him away.",
            "1093",
            ["Levi", "Jonas"]
          ),
        ],
      },
      {
        index: 5,
        heading: "Camp bread",
        photos: [
          shot(
            "adler",
            "a06",
            "Ruth's fire",
            "She is fourteen and already better at this than the men who briefed the trip.",
            "1093",
            ["Ruth"]
          ),
        ],
      },
      {
        index: 6,
        heading: "Someone else's horse",
        photos: [
          shot(
            "adler",
            "a07",
            "We were just looking",
            "Jonas was just looking. The horse was just leaving. Ida was just inhaling.",
            "1094",
            ["Ida", "Jonas"]
          ),
        ],
      },
      {
        index: 7,
        heading: "The cheese funeral",
        photos: [
          shot(
            "adler",
            "a08",
            "It did not survive Antioch",
            "Levi held a short service. Ruth declined to cry. The flies sent flowers.",
            "1095",
            ["Levi", "Ruth"]
          ),
          shot(
            "adler",
            "a09",
            "Ida keeps walking",
            "She said mourning is cheaper if you do it with your feet.",
            "1095",
            ["Ida"]
          ),
        ],
      },
      {
        index: 8,
        heading: "Dust, then more dust",
        photos: [
          shot(
            "adler",
            "a10",
            "The family as a dune",
            "Four people, one cloak shared wrong, a road that forgot its own name.",
            "1096",
            ["Ida", "Levi", "Ruth", "Jonas"]
          ),
        ],
      },
      {
        index: 9,
        heading: "A very large dog",
        photos: [
          shot(
            "adler",
            "a11",
            "Ruth names it",
            "Ruth maintains it was a lion. The lion maintains it was busy.",
            "1097",
            ["Ruth"]
          ),
        ],
      },
      {
        index: 10,
        heading: "Levi asks for directions",
        photos: [
          shot(
            "adler",
            "a12",
            "This cannot be right",
            "The man he asked also had a map. It disagreed with ours and with geography.",
            "1097",
            ["Levi"]
          ),
        ],
      },
      {
        index: 11,
        heading: "Walls on the horizon",
        photos: [
          shot(
            "adler",
            "a13",
            "Jonas sees it first",
            "He pointed so hard his wooden sword dropped. Nobody picked it up for a full minute.",
            "1098",
            ["Jonas", "Ida"]
          ),
        ],
      },
      {
        index: 12,
        heading: "Outside the walls",
        photos: [
          shot(
            "adler",
            "a14",
            "We look like pilgrims and also like a mistake",
            "Ida is already bargaining. Levi is already lost. Ruth is already friends with a goat.",
            "1098",
            ["Ida", "Levi", "Ruth"]
          ),
        ],
      },
      {
        index: 13,
        heading: "The goat situation",
        photos: [
          shot(
            "adler",
            "a15",
            "Ruth's second animal",
            "She said if the lion was busy, the goat would do. The goat had a union.",
            "1098",
            ["Ruth"]
          ),
        ],
      },
      {
        index: 14,
        heading: "Night before",
        photos: [
          shot(
            "adler",
            "a16",
            "They actually slept",
            "A rare picture. Levi's mouth is open. Ida's eyes are not.",
            "1099",
            ["Ida", "Levi"]
          ),
        ],
      },
      {
        index: 15,
        heading: "Conquest of Jerusalem",
        photos: [
          shot(
            "adler",
            "a17",
            "That time we conquered the old city",
            "Ida is pointing at a goat. Levi is lost. Ruth has the only accurate expression: delight.",
            "1099",
            ["Ida", "Levi", "Ruth"]
          ),
          shot(
            "adler",
            "a18",
            "Jonas on a wall",
            "He should not be on the wall. He is on the wall. History will leave this part out.",
            "1099",
            ["Jonas"]
          ),
        ],
      },
      {
        index: 16,
        heading: "A market, finally",
        photos: [
          shot(
            "adler",
            "a19",
            "Ida buys fruit like a local",
            "She is not a local. The fruit does not mind. Levi minds the price.",
            "1099",
            ["Ida", "Levi"]
          ),
        ],
      },
      {
        index: 17,
        heading: "The lion again, maybe",
        photos: [
          shot(
            "adler",
            "a20",
            "Ruth was right enough",
            "Something large walked past the tents. We have this picture and no further questions.",
            "1099",
            ["Ruth", "Jonas"]
          ),
        ],
      },
      {
        index: 18,
        heading: "Levi finds the road home",
        photos: [
          shot(
            "adler",
            "a21",
            "He will not stop talking about it",
            "The road is ordinary. He is glowing. Ida lets him have this one.",
            "1099",
            ["Levi"]
          ),
        ],
      },
      {
        index: 19,
        heading: "One last camp",
        photos: [
          shot(
            "adler",
            "a22",
            "The four of us, dustier",
            "Ten years on the same faces. The cloaks lost the argument with the road.",
            "1099",
            ["Ida", "Levi", "Ruth", "Jonas"]
          ),
        ],
      },
      {
        index: 20,
        heading: "We meant to write",
        photos: [
          shot(
            "adler",
            "a23",
            "Ida looks back",
            "Not regret. Inventory. She is already packing the next century in her head.",
            "1099",
            ["Ida"]
          ),
        ],
      },
    ],
  },
  {
    id: "okafors",
    family: "The Okafors",
    window: "2074–2119",
    place: "Lagos balcony, then a weekend on the orbital tram",
    tags: ["Lifestyle", "Journal", "Funny"],
    blurb:
      "Grandparents who still print photographs. Kids who think gravity is a suggestion. A 2112 picnic with a view of weather they ordered.",
    start: { year: 2074, era: "AD" },
    end: { year: 2119, era: "AD" },
    people: [
      {
        name: "Adaeze",
        description: "Checks the sky the old way, with her eyes. Still prints photographs.",
        look: "Yoruba woman, deep brown skin, short natural hair silvering, gold earrings, elegant posture",
      },
      {
        name: "Chidi",
        description: "Brought a paper album onto an orbital tram. Nobody stopped him.",
        look: "Yoruba man, taller, warm eyes, thin analog glasses, salt-and-pepper later, calm mouth",
      },
      {
        name: "Kelechi",
        description: "Oldest. Treats gravity as a suggestion and dinner as a meeting.",
        look: "Young man, Adaeze's smile, athletic, close-cropped hair, future fabrics that still look like clothes",
      },
      {
        name: "Amaka",
        description: "Youngest. Orders clouds and then forgets to look up.",
        look: "Girl then teen, braids, curious eyes, Chidi's glasses later, bright layered clothes",
      },
    ],
    events: [
      { name: "Balcony light", description: "Before the tram tickets." },
      { name: "Weekend above weather", description: "They paid extra for late-afternoon gold." },
      { name: "Paper album on the tram", description: "Chidi, still analog." },
      { name: "Amaka's first orbit", description: "She packed snacks and a complaint." },
    ],
    pages: [
      {
        index: 1,
        heading: "Balcony light, 2076",
        photos: [
          shot(
            "okafors",
            "o01",
            "Before the tram tickets",
            "Adaeze checks the sky the old way, with her eyes. Chidi is already packed.",
            "2076",
            ["Adaeze", "Chidi"]
          ),
        ],
      },
      {
        index: 2,
        heading: "Lagos still knows our names",
        photos: [
          shot(
            "okafors",
            "o02",
            "Market glass",
            "The stalls float now. The peppers do not. Adaeze buys both like it's 2019.",
            "2079",
            ["Adaeze"]
          ),
          shot(
            "okafors",
            "o03",
            "Kelechi after school",
            "School is a room that follows him home. He is trying to outwalk it.",
            "2079",
            ["Kelechi"]
          ),
        ],
      },
      {
        index: 3,
        heading: "Amaka is new",
        photos: [
          shot(
            "okafors",
            "o04",
            "First balcony",
            "They held her up to the weather they had not ordered yet. She approved.",
            "2081",
            ["Chidi", "Amaka"]
          ),
        ],
      },
      {
        index: 4,
        heading: "Print day",
        photos: [
          shot(
            "okafors",
            "o05",
            "Adaeze at the printer",
            "A machine that smells faintly of vinegar and stubbornness. She will not switch to glass.",
            "2084",
            ["Adaeze"]
          ),
        ],
      },
      {
        index: 5,
        heading: "The kids discover height",
        photos: [
          shot(
            "okafors",
            "o06",
            "Kelechi on the rail",
            "The rail is a suggestion. His mother is a fact. This picture chose a side.",
            "2086",
            ["Kelechi", "Adaeze"]
          ),
        ],
      },
      {
        index: 6,
        heading: "Chidi's paper habit",
        photos: [
          shot(
            "okafors",
            "o07",
            "He captions in pencil",
            "The album is already thick. The future keeps arriving and he keeps gluing it down.",
            "2088",
            ["Chidi"]
          ),
        ],
      },
      {
        index: 7,
        heading: "A birthday with designed rain",
        photos: [
          shot(
            "okafors",
            "o08",
            "Amaka asked for purple",
            "The city gave her a ten-minute violet shower over one block. Cake survived.",
            "2091",
            ["Amaka", "Kelechi"]
          ),
          shot(
            "okafors",
            "o09",
            "Adaeze in the doorway",
            "She let the rain happen. She did not let it in.",
            "2091",
            ["Adaeze"]
          ),
        ],
      },
      {
        index: 8,
        heading: "First tram tickets",
        photos: [
          shot(
            "okafors",
            "o10",
            "The four of us, still earthbound",
            "They posed like people who had not yet seen the city from the hinge of the sky.",
            "2096",
            ["Adaeze", "Chidi", "Kelechi", "Amaka"]
          ),
        ],
      },
      {
        index: 9,
        heading: "Weekend above weather",
        photos: [
          shot(
            "okafors",
            "o11",
            "Ordered clouds",
            "They paid extra for late-afternoon gold. The children ate the snacks first.",
            "2112",
            ["Adaeze", "Kelechi", "Amaka"]
          ),
        ],
      },
      {
        index: 10,
        heading: "Chidi, still analog",
        photos: [
          shot(
            "okafors",
            "o12",
            "Paper on the orbital tram",
            "He brought a paper album onto an orbital tram and nobody stopped him.",
            "2112",
            ["Chidi"]
          ),
        ],
      },
      {
        index: 11,
        heading: "Amaka's first orbit",
        photos: [
          shot(
            "okafors",
            "o13",
            "She packed a complaint",
            "The complaint was about the snacks. The view did not get a word in.",
            "2112",
            ["Amaka"]
          ),
        ],
      },
      {
        index: 12,
        heading: "Kelechi works up there now",
        photos: [
          shot(
            "okafors",
            "o14",
            "A uniform that looks like silk",
            "He says it is workwear. It photographs like a rumor about the 22nd century.",
            "2114",
            ["Kelechi"]
          ),
        ],
      },
      {
        index: 13,
        heading: "Dinner over the Gulf",
        photos: [
          shot(
            "okafors",
            "o15",
            "They still pass the bowl left",
            "The window shows a coastline redrawn. The jollof did not get the memo.",
            "2114",
            ["Adaeze", "Chidi", "Kelechi", "Amaka"]
          ),
        ],
      },
      {
        index: 14,
        heading: "Adaeze's earrings",
        photos: [
          shot(
            "okafors",
            "o16",
            "Same gold, later year",
            "She wore them in 2076. She is wearing them in a corridor that hums.",
            "2116",
            ["Adaeze"]
          ),
        ],
      },
      {
        index: 15,
        heading: "Amaka, older",
        photos: [
          shot(
            "okafors",
            "o17",
            "Glasses like her father's",
            "She swore she would not. The tram light caught the frames and the swear dissolved.",
            "2116",
            ["Amaka"]
          ),
          shot(
            "okafors",
            "o18",
            "Chidi notices",
            "He does not say anything. He writes it in the paper album later.",
            "2116",
            ["Chidi"]
          ),
        ],
      },
      {
        index: 16,
        heading: "A picnic they scheduled",
        photos: [
          shot(
            "okafors",
            "o19",
            "Weather, on time",
            "Late gold, no wind, a table that knows their knees. Lagos is a glittering floor below.",
            "2117",
            ["Adaeze", "Amaka"]
          ),
        ],
      },
      {
        index: 17,
        heading: "Kelechi brings someone",
        photos: [
          shot(
            "okafors",
            "o20",
            "We do not have their name yet",
            "The photograph does not need it. Adaeze has already set a fifth bowl in her head.",
            "2118",
            ["Kelechi", "Adaeze"]
          ),
        ],
      },
      {
        index: 18,
        heading: "The balcony, later",
        photos: [
          shot(
            "okafors",
            "o21",
            "Same railing, new city",
            "Towers grew. The geraniums did not get the memo either. Chidi waters them by hand.",
            "2118",
            ["Chidi"]
          ),
        ],
      },
      {
        index: 19,
        heading: "Printed, still",
        photos: [
          shot(
            "okafors",
            "o22",
            "Adaeze lays out the year",
            "A table of real photographs in a house that could have been a screen. She prefers the weight.",
            "2119",
            ["Adaeze"]
          ),
        ],
      },
      {
        index: 20,
        heading: "Still here, 2119",
        photos: [
          shot(
            "okafors",
            "o23",
            "The four of us, in the weather we asked for",
            "They look like a family that outlived a few forecasts. The earrings stayed. The paper album stayed.",
            "2119",
            ["Adaeze", "Chidi", "Kelechi", "Amaka"]
          ),
        ],
      },
    ],
  },
];

export function getExampleAlbum(id: string): ExampleAlbum | undefined {
  return EXAMPLE_ALBUMS.find((album) => album.id === id);
}

export function exampleCoverPhotos(album: ExampleAlbum, count = 4): AlbumPhoto[] {
  return album.pages.flatMap((page) => page.photos).slice(0, count);
}

export function exampleToPublicAlbum(album: ExampleAlbum): PublicAlbum {
  return {
    id: `example-${album.id}`,
    email: null,
    status: "ready",
    members: album.people.map((person, i) => ({
      id: `${album.id}-m${i}`,
      name: person.name,
      description: person.description,
      photos: [],
    })),
    start: album.start,
    end: album.end,
    events: album.events.map((event, i) => ({
      id: `${album.id}-e${i}`,
      name: event.name,
      description: event.description,
    })),
    tags: album.tags,
    pages: album.pages,
    createdAt: "2026-04-12T00:00:00.000Z",
    updatedAt: "2026-04-12T00:00:00.000Z",
  };
}
