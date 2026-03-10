export interface LotteryResult {
  id: number;
  animal: string;
  number: number;
  hour: string;
  date: string;
  emoji: string;
}

const ANIMALS = [
  { name: "Águila", emoji: "🦅" },
  { name: "Lapa", emoji: "🐢" },
  { name: "Cebra", emoji: "🦓" },
  { name: "León", emoji: "🦁" },
  { name: "Tigre", emoji: "🐯" },
  { name: "Elefante", emoji: "🐘" },
  { name: "Puma", emoji: "🐆" },
  { name: "Venado", emoji: "🦌" },
  { name: "Mono", emoji: "🐒" },
  { name: "Delfín", emoji: "🐬" },
  { name: "Camello", emoji: "🐫" },
  { name: "Gallina", emoji: "🐔" },
  { name: "Gallo", emoji: "🐓" },
  { name: "Conejo", emoji: "🐇" },
  { name: "Paloma", emoji: "🕊️" },
  { name: "Caimán", emoji: "🐊" },
  { name: "Culebra", emoji: "🐍" },
  { name: "Pescado", emoji: "🐟" },
  { name: "Cachicamo", emoji: "🦔" },
  { name: "Camaleón", emoji: "🦎" },
];

const HOURS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateResults(): LotteryResult[] {
  const results: LotteryResult[] = [];
  let id = 1;
  const dates = ["2026-03-10", "2026-03-09", "2026-03-08"];

  for (const date of dates) {
    for (const hour of HOURS) {
      const seed = id * 7 + date.charCodeAt(8);
      const animalIdx = Math.floor(seededRandom(seed) * ANIMALS.length);
      const num = Math.floor(seededRandom(seed + 1) * 100);
      const animal = ANIMALS[animalIdx];
      results.push({
        id: id++,
        animal: animal.name,
        number: num,
        hour,
        date,
        emoji: animal.emoji,
      });
    }
  }
  return results;
}

export const PYRAMID_DATA = [
  [7],
  [12, 19],
  [5, 28, 14],
  [33, 9, 22, 41],
  [16, 27, 3, 38, 11],
];

export const HOT_NUMBERS = new Set([7, 28, 33, 3, 38]);
