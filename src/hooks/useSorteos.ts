import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LotteryResult, ANIMALS } from "@/data/mockData";

interface SorteoRow {
  id: number;
  animal: string;
  numero: number;
  hora: string;
  fecha: string;
  emoji: string;
}

interface UseSorteosResult {
  results: LotteryResult[];
  loading: boolean;
  error: string | null;
}

/** Hora actual en Venezuela (UTC-4) */
function nowInVenezuela(): { h: number; m: number; s: number } {
  const now = new Date();
  const offsetMs = -4 * 60 * 60 * 1000;
  const ve = new Date(now.getTime() + offsetMs + now.getTimezoneOffset() * 60 * 1000);
  return { h: ve.getHours(), m: ve.getMinutes(), s: ve.getSeconds() };
}

/** Obtenemos string YYYY-MM-DD en hora VE */
function getTodayStrVE(): string {
  const now = new Date();
  const offsetMs = -4 * 60 * 60 * 1000;
  const ve = new Date(now.getTime() + offsetMs + now.getTimezoneOffset() * 60 * 1000);
  return ve.toISOString().split("T")[0];
}

/** Pasa '08:00 AM' a 8, '01:00 PM' a 13 */
function hourStrToNum(hourStr: string): number {
  const [timePart, period] = hourStr.split(" ");
  let [h] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h;
}

/** Hash ligero: serializa los IDs ordenados para detectar cambios sin deep-compare. */
function hashIds(rows: SorteoRow[]): string {
  return rows.map((r) => r.id).sort((a, b) => a - b).join(",");
}

export function useSorteos(): UseSorteosResult {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastHashRef = useRef<string>("");
  
  // Reloj reactivo para revelar el sorteo puntualmente al iniciar su hora
  const [currentH, setCurrentH] = useState(() => nowInVenezuela().h);

  useEffect(() => {
    const clock = setInterval(() => {
      const { h } = nowInVenezuela();
      setCurrentH(prev => (prev !== h ? h : prev));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchSorteos(silent = false) {
      if (!silent) setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from("sorteos")
        .select("id, animal, numero, hora, fecha, emoji")
        .order("fecha", { ascending: false })
        .order("hora", { ascending: true });

      if (cancelled) return;

      if (sbError) {
        console.error("[useSorteos] Error al obtener sorteos:", sbError.message);
        setError(sbError.message);
        setLoading(false);
        return;
      }

      const rows = data as SorteoRow[];

      // Solo actualizar el estado si hubo cambios reales (evita re-renders innecesarios)
      const newHash = hashIds(rows);
      if (silent && newHash === lastHashRef.current) return;
      lastHashRef.current = newHash;

      // El emoji se resuelve SIEMPRE desde el catálogo local para reflejar
      // cualquier cambio en mockData.ts sin depender de lo guardado en la BD.
      const mapped: LotteryResult[] = rows.map((row) => {
        const catalogEmoji = ANIMALS.find((a) => a.name === row.animal)?.emoji ?? row.emoji;
        return {
          id: row.id,
          animal: row.animal,
          number: row.numero,
          hour: row.hora,
          date: row.fecha,
          emoji: catalogEmoji,
        };
      });

      setResults(mapped);
      setLoading(false);
    }

    fetchSorteos();

    // Suscripción en tiempo real vía WebSocket de Supabase
    const channel = supabase
      .channel("sorteos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sorteos" },
        () => {
          if (!cancelled) fetchSorteos();
        }
      )
      .subscribe();

    // Polling de respaldo cada 30 s (por si el WebSocket cae)
    const pollInterval = setInterval(() => {
      if (!cancelled) fetchSorteos(true); // silent=true: no muestra spinner
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtro de gating temporal para asegurar que jamás veamos resultados antes de la hora EXACTA
  const visibleResults = results.filter((r) => {
    const today = getTodayStrVE();
    if (r.date > today) return false; // si se coló algo de mañana
    if (r.date === today) {
      const rh = hourStrToNum(r.hour);
      if (rh > currentH) return false; // El resultado se revela EXACTAMENTE cuando la hora VE alcanza rh
    }
    return true;
  });

  return { results: visibleResults, loading, error };
}
