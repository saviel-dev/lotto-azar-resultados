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
  { name: "Lapa", emoji: "🦫" },
  { name: "Cebra", emoji: "🦓" },
  { name: "León", emoji: "🦁" },
  { name: "Tigre", emoji: "🐯" },
  { name: "Elefante", emoji: "🐘" },
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
  { name: "Pez", emoji: "🐟" },
  { name: "Ardilla", emoji: "🐿️" },
  { name: "Burro", emoji: "🫏" },
  { name: "Carnero", emoji: "🐏" },
  { name: "Toro", emoji: "🐂" },
  { name: "Cochino", emoji: "🐷" },
  { name: "Oso", emoji: "🐻" },
  { name: "Gato", emoji: "🐱" },
  { name: "Perro", emoji: "🐶" },
  { name: "Iguana", emoji: "🦎" },
  { name: "Jirafa", emoji: "🦒" },
  { name: "Loro", emoji: "🦜" },
  { name: "Zorro", emoji: "🦊" },
  { name: "Ballena", emoji: "🐳" },
  { name: "Ciempiés", emoji: "🐛" },
  { name: "Alacran", emoji: "🦂" },
  { name: "Vaca", emoji: "🐄" },
  { name: "Chivo", emoji: "🐐" },
];

const HOURS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateDates(count: number): string[] {
  const dates: string[] = [];
  const base = new Date(2026, 2, 10); // 2026-03-10
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export function generateResults(): LotteryResult[] {
  const results: LotteryResult[] = [];
  let id = 1;
  const dates = generateDates(7);

  for (const date of dates) {
    for (const hour of HOURS) {
      const seed = id * 13 + date.charCodeAt(8) + date.charCodeAt(9);
      const animalIdx = Math.floor(seededRandom(seed) * ANIMALS.length);
      const num = Math.floor(seededRandom(seed + 3) * 100);
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

export const HOURS_LIST = HOURS;

// Pirámide invertida: fila 1 es la más larga (tope) → fila 8 es la más corta (punta abajo)
// Cada celda es un DÍGITO individual (0-9), alternando amarillo y verde
export const PYRAMID_DATA: number[][] = [
  [0, 8, 0, 3, 2, 0, 2, 6],  // fila 1 – 8 bloques
  [8, 8, 3, 5, 2, 2, 8],     // fila 2 – 7 bloques
  [6, 1, 8, 7, 4, 0],        // fila 3 – 6 bloques
  [7, 9, 5, 1, 4],           // fila 4 – 5 bloques
  [6, 4, 6, 5],              // fila 5 – 4 bloques
  [0, 0, 1],                 // fila 6 – 3 bloques
  [0, 1],                    // fila 7 – 2 bloques
  [1],                       // fila 8 – 1 bloque  (punta)
];

export const HOT_NUMBERS = new Set([0, 5, 8, 6, 1]);
