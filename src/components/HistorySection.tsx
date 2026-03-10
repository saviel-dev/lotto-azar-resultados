import { useState, useMemo } from "react";
import { LotteryResult } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HistorySectionProps {
  results: LotteryResult[];
}

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
    <section className="w-full py-10 px-4" aria-label="Historial de sorteos">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 text-center">
        Historial de Sorteos
      </h2>

      {/* Filters */}
      <div className="max-w-3xl mx-auto mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar animal o número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Buscar animal o número"
          />
        </div>
        <div className="flex gap-3">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1"
            aria-label="Fecha desde"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1"
            aria-label="Fecha hasta"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((r, idx) => (
          <div
            key={r.id}
            className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 animate-fade-in"
            style={{ animationDelay: `${Math.min(idx * 30, 300)}ms`, animationFillMode: "both" }}
          >
            <span className="text-4xl" aria-hidden="true">{r.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-muted text-muted-foreground rounded px-2 py-0.5">
                  {r.hour}
                </span>
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
              <p className="font-semibold text-foreground mt-1 truncate">{r.animal}</p>
            </div>
            <span className="text-2xl font-extrabold text-secondary">
              {r.number.toString().padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No se encontraron resultados.
        </p>
      )}
    </section>
  );
};

export default HistorySection;
