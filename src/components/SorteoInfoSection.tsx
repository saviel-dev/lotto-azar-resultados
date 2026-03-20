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

/* ─── Datos de pagos ──────────────────────────────────────── */
const PAGOS_NORMAL = [
  { tipo: "Terminal", descripcion: "Último dígito del número", pago: "7x" },
  { tipo: "Centena", descripcion: "Últimos 2 dígitos", pago: "70x" },
  { tipo: "Exacta", descripcion: "Número exacto (00-99)", pago: "70x" },
  { tipo: "Corrida", descripcion: "Cualquier combinación del número", pago: "12x" },
];

const PAGOS_COMODIN = [
  { tipo: "Terminal Comodín", descripcion: "Último dígito + comodín", pago: "14x" },
  { tipo: "Centena Comodín", descripcion: "Últimos 2 dígitos + comodín", pago: "140x" },
  { tipo: "Exacta Comodín", descripcion: "Número exacto + comodín", pago: "140x" },
  { tipo: "Corrida Comodín", descripcion: "Combinación + comodín", pago: "24x" },
];

/* ─── Subcomponentes ────────────────────────────────────────── */

function PayCard({
  tipo,
  descripcion,
  pago,
  isComodin,
}: {
  tipo: string;
  descripcion: string;
  pago: string;
  isComodin?: boolean;
}) {
  const accent = isComodin
    ? "rgba(168,85,247,0.18)"
    : "rgba(59,130,246,0.15)";
  const accentBorder = isComodin
    ? "rgba(168,85,247,0.3)"
    : "rgba(59,130,246,0.25)";
  const payColor = isComodin ? "#c084fc" : "#60a5fa";

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 border bg-card/60 hover:bg-card transition-colors"
      style={{
        borderColor: accentBorder,
      }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-bold text-foreground leading-tight truncate">
          {tipo}
        </span>
        <span className="text-[11px] leading-snug text-muted-foreground">
          {descripcion}
        </span>
      </div>
      <span
        className="text-xl font-black tabular-nums shrink-0"
        style={{ color: payColor }}
      >
        {pago}
      </span>
    </div>
  );
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
            className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4 bg-card border shadow-sm"
            style={{ borderColor: "rgba(59,130,246,0.25)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              >
                🎯 Jugada Normal
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {PAGOS_NORMAL.map((p) => (
                <PayCard key={p.tipo} {...p} />
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
            className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4 bg-card border shadow-sm"
            style={{ borderColor: "rgba(168,85,247,0.25)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
              >
                🌟 Jugada Comodín
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {PAGOS_COMODIN.map((p) => (
                <PayCard key={p.tipo} {...p} isComodin />
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
