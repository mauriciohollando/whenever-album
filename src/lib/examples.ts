import type { AlbumPage } from "./types";

export type ExampleAlbum = {
  id: string;
  family: string;
  window: string;
  place: string;
  tags: string[];
  blurb: string;
  pages: AlbumPage[];
};

export const EXAMPLE_ALBUMS: ExampleAlbum[] = [
  {
    id: "callahans",
    family: "The Callahans",
    window: "1946–1968",
    place: "Queens, then a borrowed lake house",
    tags: ["Candid", "Seasonal", "Tender"],
    blurb:
      "A postwar kitchen, a first car that never started on the first try, and the summer the twins learned to float.",
    pages: [
      {
        index: 1,
        heading: "The stoop, 1948",
        photos: [
          {
            id: "c1",
            title: "Sunday shirts",
            description:
              "Frank holds the baby like a football. Nora has flour on one wrist and will not admit it.",
            yearLabel: "1948",
            imageUrl: "/examples/callahan-sunday-shirts.png",
            members: ["Frank", "Nora", "Annie"],
          },
        ],
      },
      {
        index: 2,
        heading: "The lake that wasn't ours",
        photos: [
          {
            id: "c2",
            title: "Borrowed oars",
            description: "They told the kids the canoe came with the house. It did not.",
            yearLabel: "1956",
            imageUrl: "/examples/callahan-borrowed-oars.png",
            members: ["Frank", "Tommy"],
          },
          {
            id: "c3",
            title: "Nora in the shade",
            description: "She packed four kinds of fruit and still asked if anyone was hungry.",
            yearLabel: "1956",
            imageUrl: "/examples/callahan-nora-shade.png",
            members: ["Nora"],
          },
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
    pages: [
      {
        index: 1,
        heading: "Provisions, 1091",
        photos: [
          {
            id: "a1",
            title: "The packing list",
            description:
              "Three cloaks, one questionable map, and a wheel of cheese that becomes a character.",
            yearLabel: "1091",
            imageUrl: "/examples/adler-provisions.png",
            members: ["Ida", "Levi"],
          },
        ],
      },
      {
        index: 2,
        heading: "Outside the walls",
        photos: [
          {
            id: "a2",
            title: "Conquest of Jerusalem",
            description:
              "That time we conquered the old city! (Ida is pointing at a goat. Levi is lost.)",
            yearLabel: "1099",
            imageUrl: "/examples/adler-jerusalem.png",
            members: ["Ida", "Levi", "Ruth"],
          },
          {
            id: "a3",
            title: "A very large dog",
            description: "Ruth maintains it was a lion. The lion maintains it was busy.",
            yearLabel: "1099",
            imageUrl: "/examples/adler-large-dog.png",
            members: ["Ruth"],
          },
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
    pages: [
      {
        index: 1,
        heading: "Balcony light, 2076",
        photos: [
          {
            id: "o1",
            title: "Before the tram tickets",
            description:
              "Adaeze checks the sky the old way, with her eyes. Chidi is already packed.",
            yearLabel: "2076",
            imageUrl: "/examples/okafor-balcony.png?v=2112",
            members: ["Adaeze", "Chidi"],
          },
        ],
      },
      {
        index: 2,
        heading: "Weekend above weather",
        photos: [
          {
            id: "o2",
            title: "Ordered clouds",
            description: "They paid extra for late-afternoon gold. The children ate the snacks first.",
            yearLabel: "2112",
            imageUrl: "/examples/okafor-clouds.png?v=2112",
            members: ["Adaeze", "Kelechi", "Amaka"],
          },
          {
            id: "o3",
            title: "Chidi, still analog",
            description: "He brought a paper album onto an orbital tram and nobody stopped him.",
            yearLabel: "2112",
            imageUrl: "/examples/okafor-chidi.png?v=2112",
            members: ["Chidi"],
          },
        ],
      },
    ],
  },
];

export const REVIEWS = [
  {
    name: "Marisol V.",
    place: "Austin",
    text: "I sent my dad the 1971–1988 one. He called about a picnic we never took and then asked if we could do another decade.",
  },
  {
    name: "Jonah + Priya",
    place: "Leeds",
    text: "We did 1922–1960 as a wedding gift for her grandparents. The posed ones look like they were in a drawer since Tuesday.",
  },
  {
    name: "Ben K.",
    place: "Chicago",
    text: "My brother's crusades phase is now a ten-event medieval sitcom. Worth every dollar and then some.",
  },
  {
    name: "Nia O.",
    place: "Accra / London",
    text: "2070–2115 with our actual faces. My mother is 94 in one picture and still wearing the same earrings. Unsettling. Perfect.",
  },
];

export const GUESTBOOK = [
  {
    name: "Theo",
    note: "Did 500–545 for a history teacher. She used a page in class. Not sorry.",
  },
  {
    name: "Asha",
    note: "Trip to Disneyland / that time we met Goofy — except we set it in 1959 and it somehow works.",
  },
  {
    name: "Chris",
    note: "Quiet + Journal tags. No jokes. Just the four of us getting older in a kitchen that never existed.",
  },
  {
    name: "Lina",
    note: "Far past, 120 BC–80 BC, family farm. The goat has a name now.",
  },
];
