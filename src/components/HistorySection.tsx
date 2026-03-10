import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LotteryResult } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HistorySectionProps {
  results: LotteryResult[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      delay: Math.min(i * 0.04, 0.4),
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const HistorySection = ({ results }: HistorySectionProps) => {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    let r = results;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.animal.toLowerCase().includes(q) ||
          x.number.toString().includes(q)
      );
    }
    if (dateFrom) r = r.filter((x) => x.date >= dateFrom);
    if (dateTo) r = r.filter((x) => x.date <= dateTo);
    return r.slice(0, 30);
  }, [results, search, dateFrom, dateTo]);

  return (
    <section className="w-full py-12 px-4" aria-label="Historial de sorteos">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-display-sm text-foreground mb-2">
          Historial de Sorteos
        </h2>
        <p className="text-sm text-muted-foreground">Últimos resultados de Lotto Azar</p>
        <div className="section-divider mt-4" />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-3xl mx-auto mb-8 space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar animal o número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-card border-border rounded-lg"
            aria-label="Buscar animal o número"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Desde</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 bg-card"
              aria-label="Fecha desde"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Hasta</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 bg-card"
              aria-label="Fecha hasta"
            />
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((r, idx) => (
          <motion.div
            key={`${r.id}-${search}-${dateFrom}-${dateTo}`}
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-20px" }}
            className="result-card"
          >
            <div className="text-4xl flex-shrink-0" aria-hidden="true">{r.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold bg-primary/10 text-primary rounded-md px-2 py-0.5">
                  {r.hour}
                </span>
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
              <p className="font-bold text-foreground mt-1 truncate text-sm">{r.animal}</p>
            </div>
            <span className="text-2xl font-black text-secondary tabular-nums">
              {r.number.toString().padStart(2, "0")}
            </span>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground mt-8"
        >
          No se encontraron resultados.
        </motion.p>
      )}
    </section>
  );
};

export default HistorySection;
