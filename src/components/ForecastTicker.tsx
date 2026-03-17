import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePronosticos } from "@/hooks/usePronosticos";
import { HOURS_LIST } from "@/data/mockData";

/** Devuelve el string de hora que coincide con la hora actual, ej: "09:00 AM" */
function getCurrentHourString(): string {
  const now = new Date();
  const h = now.getHours();
  const period = h < 12 ? "AM" : "PM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, "0")}:00 ${period}`;
}

const ForecastTicker = () => {
  const { pronosticos, loading } = usePronosticos();
  const [currentHour, setCurrentHour] = useState(getCurrentHourString);
  const [visible, setVisible] = useState(true);

  // Actualizar hora cada minuto
  useEffect(() => {
    const id = setInterval(() => {
      const next = getCurrentHourString();
      if (next !== currentHour) {
        setVisible(false);
        setTimeout(() => {
          setCurrentHour(next);
          setVisible(true);
        }, 400);
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [currentHour]);

  // Pronósticos de la hora actual para mostrar en el ticker
  // Si no hay para la hora exacta, tomar los de la hora anterior disponible
  const currentForecasts = pronosticos.filter((p) => p.hora === currentHour);

  // Si no hay pronósticos para esta hora, buscar la última hora con datos
  const displayForecasts = (() => {
    if (currentForecasts.length > 0) return currentForecasts;
    // Encontrar la hora más reciente con pronósticos
    const idx = HOURS_LIST.indexOf(currentHour);
    for (let i = idx - 1; i >= 0; i--) {
      const prev = pronosticos.filter((p) => p.hora === HOURS_LIST[i]);
      if (prev.length > 0) return prev;
    }
    return pronosticos.slice(0, 4); // fallback: primeros registros
  })();

  const h = new Date().getHours();
  const period = h < 12 ? "AM" : "PM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;

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
              key={currentHour}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-2 flex-1"
            >
              {loading ? (
                // Skeleton mientras carga
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-5 w-16 rounded-full bg-border/40 animate-pulse"
                  />
                ))
              ) : displayForecasts.length === 0 ? (
                <span className="text-[10px] text-muted-foreground/60 italic">
                  Sin pronósticos registrados
                </span>
              ) : (
                displayForecasts.slice(0, 6).map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07, duration: 0.25 }}
                    className="flex items-center gap-1 bg-background/60 border border-border/50 rounded-full px-2 py-0.5"
                    title={`${p.animal} - ${p.loteria}`}
                  >
                    <span className="text-sm leading-none">{p.emoji ?? "🐾"}</span>
                    <span className="text-[10px] font-semibold text-foreground/80 leading-none hidden xs:inline sm:inline">
                      {p.animal}
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <span className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-amber-400" : "bg-secondary"} animate-pulse`} />
          <span className="text-[9px] text-muted-foreground/60 leading-none hidden sm:inline">
            {loading ? "..." : "+1h"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForecastTicker;
