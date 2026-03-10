import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LotteryResult } from "@/data/mockData";
import { Search, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface HistorySectionProps {
  results: LotteryResult[];
}

// Colour ring per animal initial (decorative, mimics the red circle style)
const RING_COLORS = [
  "#e53e3e", "#dd6b20", "#d69e2e", "#38a169",
  "#3182ce", "#805ad5", "#d53f8c", "#319795",
  "#e53e3e", "#c53030",
];

function getAnimalColor(animal: string): string {
  let hash = 0;
  for (let i = 0; i < animal.length; i++) hash += animal.charCodeAt(i);
  return RING_COLORS[hash % RING_COLORS.length];
}

function formatDateHeader(dateStr: string) {
  // "2026-03-10" → "03-10"
  const parts = dateStr.split("-");
  return `${parts[1]}-${parts[2]}`;
}

function formatDateFull(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getDayName(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[d.getDay()];
}

const HOURS_ORDER = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

const HistorySection = ({ results }: HistorySectionProps) => {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const COLS_PER_PAGE = 5;

  // Build a lookup map: [date][hour] → result
  const resultMap = useMemo(() => {
    const map: Record<string, Record<string, LotteryResult>> = {};
    for (const r of results) {
      if (!map[r.date]) map[r.date] = {};
      map[r.date][r.hour] = r;
    }
    return map;
  }, [results]);

  // Sorted unique dates
  const allDates = useMemo(() => {
    const dates = Array.from(new Set(results.map((r) => r.date))).sort(
      (a, b) => (a < b ? 1 : -1) // most recent first
    );
    let filtered = dates;
    if (dateFrom) filtered = filtered.filter((d) => d >= dateFrom);
    if (dateTo)   filtered = filtered.filter((d) => d <= dateTo);
    return filtered;
  }, [results, dateFrom, dateTo]);

  // Pagination for columns
  const totalPages = Math.ceil(allDates.length / COLS_PER_PAGE);
  const visibleDates = allDates.slice(
    page * COLS_PER_PAGE,
    page * COLS_PER_PAGE + COLS_PER_PAGE
  );

  // Filter rows by search (highlight matching animal name)
  const searchLower = search.trim().toLowerCase();
  const searchMatches = (animal: string) =>
    !searchLower || animal.toLowerCase().includes(searchLower);

  return (
    <section className="w-full py-12 px-2 sm:px-4" aria-label="Historial de sorteos">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h2 className="text-display-sm text-foreground">Historial de Sorteos</h2>
        </div>
        <p className="text-sm text-muted-foreground">Últimos resultados de Lotto Azar</p>
        <div className="section-divider mt-4" />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-3 items-end"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar animal..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="history-filter-input pl-9"
            aria-label="Buscar animal"
          />
        </div>
        {/* From */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className="history-filter-input"
            aria-label="Fecha desde"
          />
        </div>
        {/* To */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className="history-filter-input"
            aria-label="Fecha hasta"
          />
        </div>
      </motion.div>

      {/* Table wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="max-w-5xl mx-auto"
      >
        {allDates.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No se encontraron resultados.
          </p>
        ) : (
          <>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mb-3">
                <span className="text-xs text-muted-foreground">
                  {formatDateFull(allDates[allDates.length - 1])} –{" "}
                  {formatDateFull(allDates[0])}
                </span>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="history-page-btn"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-foreground">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="history-page-btn"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Responsive scroll container */}
            <div className="history-table-scroll">
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="history-th history-th-hour">Horario</th>
                    {visibleDates.map((date) => (
                      <th key={date} className="history-th history-th-date">
                        <span className="block text-[10px] font-normal opacity-80">
                          {getDayName(date)}
                        </span>
                        <span className="block text-xs font-bold">
                          {date.substring(0, 7)}
                        </span>
                        <span className="block text-sm font-extrabold tracking-tight">
                          {formatDateHeader(date)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS_ORDER.map((hour, rowIdx) => (
                    <tr
                      key={hour}
                      className={rowIdx % 2 === 0 ? "history-row-even" : "history-row-odd"}
                    >
                      <td className="history-td history-td-hour">{hour}</td>
                      {visibleDates.map((date) => {
                        const r = resultMap[date]?.[hour];
                        const highlight = r && searchMatches(r.animal);
                        const dimmed = searchLower && r && !searchMatches(r.animal);
                        return (
                          <td key={date} className="history-td history-td-cell">
                            {r ? (
                              <div
                                className={`animal-cell ${dimmed ? "animal-cell-dim" : ""} ${highlight && searchLower ? "animal-cell-highlight" : ""}`}
                                title={`${r.animal} · #${r.number.toString().padStart(2, "0")}`}
                              >
                                <div
                                  className="animal-circle"
                                  style={{ borderColor: getAnimalColor(r.animal) }}
                                >
                                  <span className="animal-emoji" role="img" aria-label={r.animal}>
                                    {r.emoji}
                                  </span>
                                </div>
                                <span className="animal-name">{r.animal}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
};

export default HistorySection;
