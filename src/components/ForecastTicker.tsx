import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const COUNT = 4; // animales visibles en el pronóstico

/**
 * Genera 4 índices únicos de animales basado en una semilla (hora actual).
 * La semilla cambia cada hora → cada hora aparecen animales distintos.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 42) * 10000;
  return x - Math.floor(x);
}

function pickAnimals(hourSeed: number) {
  const picked: typeof ANIMALS = [];
  const used = new Set<number>();
  let i = 0;
  while (picked.length < COUNT) {
    const idx = Math.floor(seededRandom(hourSeed + i * 7) * ANIMALS.length);
    if (!used.has(idx)) {
      used.add(idx);
      picked.push(ANIMALS[idx]);
    }
    i++;
  }
  return picked;
}

function getHourSeed(): number {
  const now = new Date();
  // Semilla única por hora del día (0-23) y día del año
  return now.getHours() * 100 + now.getDate() + now.getMonth() * 31;
}

function msUntilNextHour(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 0, 0);
  return next.getTime() - now.getTime();
}

const ForecastTicker = () => {
  const [hourSeed, setHourSeed] = useState(getHourSeed);
  const [visible, setVisible] = useState(true);

  // Actualizar cuando cambia la hora
  useEffect(() => {
    const scheduleRefresh = () => {
      const ms = msUntilNextHour();
      const timer = setTimeout(() => {
        // Pequeña animación de salida/entrada al cambiar
        setVisible(false);
        setTimeout(() => {
          setHourSeed(getHourSeed());
          setVisible(true);
        }, 400);
        scheduleRefresh(); // próxima hora
      }, ms);
      return timer;
    };
    const t = scheduleRefresh();
    return () => clearTimeout(t);
  }, []);

  const animals = pickAnimals(hourSeed);
  const hour = new Date().getHours();
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return (
    <div
      className="w-full bg-card/80 backdrop-blur-sm border-b border-border/60 px-3 py-1"
      role="region"
      aria-label="Pronóstico de animales por hora"
    >
      <div className="flex items-center gap-3 max-w-screen-lg mx-auto">
        {/* Etiqueta izquierda */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-none">
            🔮 Pronóstico
          </span>
          <span className="text-[9px] text-muted-foreground/70 leading-none">
            {displayHour}:00 {period}
          </span>
        </div>

        {/* Divisor */}
        <div className="w-px h-4 bg-border/60 shrink-0" />

        {/* Animales */}
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={hourSeed}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-2 flex-1"
            >
              {animals.map((animal, i) => (
                <motion.div
                  key={animal.name}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07, duration: 0.25 }}
                  className="flex items-center gap-1 bg-background/60 border border-border/50 rounded-full px-2 py-0.5"
                  title={animal.name}
                >
                  <span className="text-sm leading-none">{animal.emoji}</span>
                  <span className="text-[10px] font-semibold text-foreground/80 leading-none hidden xs:inline sm:inline">
                    {animal.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de próxima actualización */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="text-[9px] text-muted-foreground/60 leading-none hidden sm:inline">
            +1h
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForecastTicker;
