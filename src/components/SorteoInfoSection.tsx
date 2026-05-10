import { motion } from "framer-motion";
import { HOURS_LIST } from "@/data/mockData";

/* ─── Helpers ──────────────────────────────────────────────── */
function hourStrToNum(hourStr: string): number {
  const [timePart, period] = hourStr.split(" ");
  let [h] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h;
}

function getCurrentHourIndex(): number {
  const currentH = new Date().getHours();
  let best = -1;
  for (let i = 0; i < HOURS_LIST.length; i++) {
    if (hourStrToNum(HOURS_LIST[i]) <= currentH) best = i;
  }
  return best === -1 ? 0 : best;
}



/* ════════════════════════════════════════════════════════════════
   SorteoInfoSection
═══════════════════════════════════════════════════════════════════ */
const SorteoInfoSection = () => {
  const activeIdx = getCurrentHourIndex();

  return (
    <section
      className="w-full py-10 sm:py-14 px-4 bg-background border-t border-border"
      aria-label="Información del sorteo: horarios y premios"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-10">

        {/* ── Encabezado ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-widest mb-2 px-3 py-1 rounded-full"
            style={{
              background: "rgba(59,130,246,0.15)",
              color: "#60a5fa",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            📋 Información del Sorteo
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Horarios & Premios
          </h2>
          <p className="text-sm mt-1 text-muted-foreground">
            Sorteos diarios de lunes a domingo
          </p>
        </motion.div>

        {/* ── Franja de horarios ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl p-5 sm:p-6 bg-card border border-border shadow-sm"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4 text-primary">
            🕐 Horarios de sorteo
          </p>

          <div className="grid grid-cols-3 min-[400px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
            {HOURS_LIST.map((h, i) => {
              const isPast = i <= activeIdx;
              const isActive = i === activeIdx;
              const label = h.replace(":00", "");

              let bg = "bg-muted";
              let color = "text-muted-foreground";
              let border = "border-transparent";
              let shadow = "none";

              if (isActive) {
                bg = "bg-primary";
                color = "text-primary-foreground";
                border = "border-transparent";
                shadow = "0 4px 14px hsl(var(--primary) / 0.45)";
              } else if (isPast) {
                bg = "bg-emerald-100 dark:bg-emerald-900/40";
                color = "text-emerald-700 dark:text-emerald-400";
                border = "border-emerald-200 dark:border-emerald-800/50";
              }

              return (
                <div
                  key={h}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${bg} ${color} ${border}`}
                  style={{ boxShadow: shadow }}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                  {label}
                </div>
              );
            })}
          </div>

          <p className="text-center text-[10px] sm:text-xs mt-5 text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-primary align-middle" />
            Sorteo actual
            <span className="mx-3 opacity-40">·</span>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-emerald-500 align-middle" />
            Sorteo completado
          </p>
        </motion.div>

        {/* ── Pagos: Normal + Comodín ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Jugada Normal */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4 bg-card border shadow-sm dark:bg-white/10 dark:border-blue-400/25 dark:backdrop-blur-xl dark:shadow-[0_12px_35px_rgba(0,0,0,0.35)]"
            style={{ borderColor: "rgba(59,130,246,0.25)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              >
                🎯 Jugada Normal
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-1">
              {[
                { win: "70", mult: "1" },
                { win: "700", mult: "10" },
                { win: "7.000", mult: "100" },
              ].map((item, idx) => (
                <div key={idx} className="bg-card/60 hover:bg-card transition-colors border-[1px] border-blue-200/50 dark:bg-white/5 dark:hover:bg-white/15 dark:border-blue-300/20 py-4 px-4 rounded-xl flex justify-center items-center gap-3 shadow-sm dark:backdrop-blur-md">
                  <span className="text-blue-500 text-3xl font-black">{item.win}</span>
                  <span className="text-muted-foreground text-2xl font-black opacity-50">×</span>
                  <span className="text-foreground text-3xl font-black">{item.mult}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] leading-relaxed text-muted-foreground mt-1">
              * El pago es por cada unidad apostada. Ejemplo: 10 Bs en Exacta = 700 Bs ganados.
            </p>
          </motion.div>

          {/* Comodín */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4 bg-card border shadow-sm dark:bg-white/10 dark:border-purple-400/25 dark:backdrop-blur-xl dark:shadow-[0_12px_35px_rgba(0,0,0,0.35)]"
            style={{ borderColor: "rgba(168,85,247,0.25)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
              >
                🌟 Jugada Comodín
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-1">
              {[
                { win: "140", mult: "1" },
                { win: "1.400", mult: "10" },
                { win: "14.000", mult: "100" },
              ].map((item, idx) => (
                <div key={idx} className="bg-card/60 hover:bg-card transition-colors border-[1px] border-purple-200/50 dark:bg-white/5 dark:hover:bg-white/15 dark:border-purple-300/20 py-4 px-4 rounded-xl flex justify-center items-center gap-3 shadow-sm dark:backdrop-blur-md">
                  <span className="text-purple-500 text-3xl font-black">{item.win}</span>
                  <span className="text-muted-foreground text-2xl font-black opacity-50">×</span>
                  <span className="text-foreground text-3xl font-black">{item.mult}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] leading-relaxed text-muted-foreground mt-1">
              * El comodín duplica el multiplicador de la jugada base. Válido en todos los sorteos del día.
            </p>
          </motion.div>
        </div>

        {/* ── Nota legal ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-center"
        >
          <p className="text-[11px] text-muted-foreground/80">
            Los premios mostrados son referenciales. Consulta con tu punto de venta autorizado.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default SorteoInfoSection;
