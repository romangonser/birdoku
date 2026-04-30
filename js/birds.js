// ═══════════════════════════════════════
// birds.js — Vogeldaten
// Bilder kommen in: assets/birds/
// Dateiname = id + '.png' (z.B. 'seagull.png')
// ═══════════════════════════════════════

const BIRD_DATA = [
  {
    id: 'arielfregattvogel',
    name: 'Arielfregattvogel',
    emoji: '🐦',
    image: 'assets/birds/Arielfregattvogel.png',
    cost: { mouse: 1, berry: 1, worm: 1 }
  },
  {
    id: 'astralischer-gleitaar',
    name: 'Astralischer Gleitaar',
    emoji: '🦅',
    image: 'assets/birds/Astralischer Gleitaar.png',
    cost: { berry: 1, worm: 1 }
  },
  {
    id: 'australspornpieper',
    name: 'Australspornpieper',
    emoji: '🐦',
    image: 'assets/birds/Australspornpieper.png',
    cost: { fish: 1, worm: 1 }
  },
  {
    id: 'azurfink',
    name: 'Azurfink',
    emoji: '🐦',
    image: 'assets/birds/Azurfink.png',
    cost: { berry: 1 }
  },
  {
    id: 'gimpel',
    name: 'Gimpel',
    emoji: '🐦',
    image: 'assets/birds/Gimpel.png',
    cost: { fish: 1, grain: 1 }
  },
  {
    id: 'goldammer',
    name: 'Goldammer',
    emoji: '🐦',
    image: 'assets/birds/Goldammer.png',
    cost: { fish: 1 }
  },
  {
    id: 'inkataeubchen',
    name: 'Inkatäubchen',
    emoji: '🐦',
    image: 'assets/birds/Inkatäubchen.png',
    cost: { mouse: 1, grain: 1 }
  },
  {
    id: 'kakapo',
    name: 'Kakapo',
    emoji: '🐧',
    image: 'assets/birds/Kakapo.png',
    cost: { mouse: 1, worm: 1 }
  },
  {
    id: 'lincolnammer',
    name: 'Lincolnammer',
    emoji: '🪶',
    image: 'assets/birds/Lincolnammer.png',
    cost: { mouse: 1 }
  },
  {
    id: 'mississippiweih',
    name: 'Mississippiweih',
    emoji: '🐦',
    image: 'assets/birds/Mississippiweih.png',
    cost: { mouse: 1, worm: 1 }
  },
  {
    id: 'ringelschnabelmoeve',
    name: 'Ringelschnabelmöve',
    emoji: '🐦‍⬛',
    image: 'assets/birds/Ringelschnabelmöve.png',
    cost: { berry: 1, mouse: 1 }
  },
  {
    id: 'trompetenschwan',
    name: 'Trompetenschwan',
    emoji: '🐦',
    image: 'assets/birds/Trompetenschwan.png',
    cost: { grain: 1, berry: 1 }
  },
  {
    id: 'truthuhn',
    name: 'Truthuhn',
    emoji: '🐦',
    image: 'assets/birds/Truthuhn.png',
    cost: { worm: 1, grain: 1 }
  }
];

function shuffleBirds(list) {
  const shuffled = [...list];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

const BIRDS = shuffleBirds(BIRD_DATA);

// Ressourcen-Konfiguration (Icons statt Emoji)
const RESOURCES = {
  berry: { image: 'assets/icons/berry.png', label: 'Beere' },
  grain: { image: 'assets/icons/grain.png', label: 'Korn' },
  mouse: { image: 'assets/icons/mouse.png', label: 'Maus' },
  fish: { image: 'assets/icons/fish.png', label: 'Fisch' },
  worm: { image: 'assets/icons/worm.png', label: 'Wurm' }
};
