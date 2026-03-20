import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePronosticos } from "@/hooks/usePronosticos";
import { HOURS_LIST } from "@/data/mockData";

/**
 * Convierte "09:00 AM" / "01:00 PM" a hora numérica (0-23).
 */
function hourStrToNum(hourStr: string): number {
  const [timePart, period] = hourStr.split(" ");
  let [h] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h;
}

/**
 * Devuelve el índice (en HOURS_LIST) del próximo sorteo
 * basándose en la hora actual.
 * Si ya pasó el último sorteo del día devuelve 0 (primero del día siguiente).
 */
function getNextHourIndex(): number {
  const currentH = new Date().getHours();
  for (let i = 0; i < HOURS_LIST.length; i++) {
    if (hourStrToNum(HOURS_LIST[i]) > currentH) return i;
  }
  // Ya pasó el último sorteo del día → mostrar el primero (mañana)
  return 0;
}

/** Devuelve el string de la próxima hora de sorteo, ej: "02:00 PM" */
function getNextHourString(): string {
  return HOURS_LIST[getNextHourIndex()];
}

const ForecastTicker = () => {
  const { pronosticos, loading } = usePronosticos();
  const [nextHour, setNextHour] = useState(getNextHourString);
  const [visible, setVisible] = useState(true);

  // Actualizar la hora próxima cada minuto
  useEffect(() => {
    const id = setInterval(() => {
      const next = getNextHourString();
      if (next !== nextHour) {
        setVisible(false);
        setTimeout(() => {
          setNextHour(next);
          setVisible(true);
        }, 400);
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [nextHour]);

  // Pronósticos para la próxima hora
  const nextForecasts = pronosticos.filter((p) => p.hora === nextHour);

  // Si no hay pronósticos para la próxima hora, buscar la más cercana disponible
  const displayForecasts = (() => {
    if (nextForecasts.length > 0) return nextForecasts;
    const idx = HOURS_LIST.indexOf(nextHour);
    // Buscar hacia adelante primero
    for (let i = idx + 1; i < HOURS_LIST.length; i++) {
      const fwd = pronosticos.filter((p) => p.hora === HOURS_LIST[i]);
      if (fwd.length > 0) return fwd;
    }
    // Luego hacia atrás
    for (let i = idx - 1; i >= 0; i--) {
      const bwd = pronosticos.filter((p) => p.hora === HOURS_LIST[i]);
      if (bwd.length > 0) return bwd;
    }
    return pronosticos.slice(0, 4);
  })();

  // Extraer las partes de la hora para el label
  const [timePart, period] = nextHour.split(" ");
  const displayLabel = `${timePart} ${period}`;

  return (
    <div
      className="w-full bg-background border-b border-border px-3 py-1.5 shadow-sm"
      role="region"
      aria-label="Pronóstico de animales por hora"
    >
      <div className="flex items-center gap-3 max-w-screen-lg mx-auto">
        {/* Etiqueta izquierda */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] sm:text-[13px] md:text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest leading-none">
            🔮 Pronóstico Sorteo
          </span>
          <span className="text-[11px] sm:text-[13px] md:text-sm text-slate-600 dark:text-slate-400 leading-none font-bold">
            {displayLabel}
          </span>
        </div>

        {/* Divisor */}
        <div className="hidden sm:block w-px h-6 bg-slate-300 dark:bg-slate-700 shrink-0 mx-1" />

        {/* Animales */}
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={nextHour}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-2 flex-1 overflow-x-auto pb-0.5 sm:pb-0"
              style={{ scrollbarWidth: "none" }}
            >
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"
                  />
                ))
              ) : displayForecasts.length === 0 ? (
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic font-medium">
                  Sin pronósticos
                </span>
              ) : (
                displayForecasts.slice(0, 6).map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07, duration: 0.25 }}
                    className="flex shrink-0 items-center gap-1.5 bg-card border border-border rounded px-2 py-1 shadow-sm"
                    title={`${p.animal} - ${p.loteria}`}
                  >
                    <span className="text-sm sm:text-base leading-none drop-shadow-sm">{p.emoji ?? "🐾"}</span>
                    <span className="text-[11px] sm:text-xs font-bold text-foreground leading-none">
                      {p.animal}
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador: "próximo" en lugar de "+1h" */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0 pl-1">
          <span className={`h-2.5 w-2.5 rounded-full ${loading ? "bg-amber-400" : "bg-emerald-500"} animate-pulse shadow-sm`} />
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none hidden sm:inline">
            {loading ? "..." : "próximo"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForecastTicker;
