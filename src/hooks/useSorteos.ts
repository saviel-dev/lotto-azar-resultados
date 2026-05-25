import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LotteryResult, ANIMALS } from "@/data/mockData";
import { getCachedForever, setCached, CACHE_KEYS } from "@/lib/cache";

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

/** Convierte una fila de Supabase al formato LotteryResult */
function rowToResult(row: SorteoRow): LotteryResult {
  const catalogEmoji = ANIMALS.find((a) => a.name === row.animal)?.emoji ?? row.emoji;
  return {
    id: row.id,
    animal: row.animal,
    number: row.numero,
    hour: row.hora,
    date: row.fecha,
    emoji: catalogEmoji,
  };
}

/**
 * Fusiona resultados nuevos con los cacheados.
 * Usa el id como clave única para evitar duplicados.
 * Ordena: fecha desc, hora asc.
 */
function mergeResults(cached: LotteryResult[], incoming: LotteryResult[]): LotteryResult[] {
  const map = new Map<number, LotteryResult>();
  for (const r of cached) map.set(r.id, r);
  for (const r of incoming) map.set(r.id, r); // incoming sobreescribe
  return Array.from(map.values()).sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return a.hour.localeCompare(b.hour);
  });
}

/** Hash ligero para detectar cambios sin deep-compare. */
function hashIds(rows: LotteryResult[]): string {
  return rows.map((r) => r.id).sort((a, b) => a - b).join(",");
}

/**
 * Polling Inteligente — calcula el intervalo óptimo en ms:
 *
 * - Minutos :58 y :59 de cada hora → "Modo Cacería" cada 10s
 *   (el admin publica entre 12:55 y 12:58 → la app baja el dato
 *   y lo mantiene OCULTO hasta que el reloj marque la hora exacta)
 *
 * - Minuto :00 de cada hora → cada 20s (ventana de gracia por si
 *   el admin publicó justo en el minuto :00)
 *
 * - Resto del tiempo → cada 5 minutos (modo ahorro)
 */
function getPollingInterval(): number {
  const { m } = nowInVenezuela();
  if (m === 58 || m === 59) return 10_000;   // Modo Cacería: cada 10s
  if (m === 0)               return 20_000;   // Ventana de gracia: cada 20s
  return 5 * 60 * 1000;                       // Modo Ahorro: cada 5 min
}

export function useSorteos(): UseSorteosResult {
  // Inicializar desde caché inmediatamente (0ms de espera visible)
  const [results, setResults] = useState<LotteryResult[]>(() => {
    return getCachedForever<LotteryResult[]>(CACHE_KEYS.SORTEOS) ?? [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastHashRef = useRef<string>("");
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      // ── Fetch delta: solo pedir datos desde la última fecha cacheada ──
      const cached = getCachedForever<LotteryResult[]>(CACHE_KEYS.SORTEOS) ?? [];
      const today = getTodayStrVE();

      // Primera visita: bajar 30 días. Visitas siguientes: solo desde ayer.
      let fromDate: string;
      if (cached.length === 0) {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        fromDate = d.toISOString().split("T")[0];
      } else {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        fromDate = d.toISOString().split("T")[0];
      }

      const { data, error: sbError } = await supabase
        .from("sorteos")
        .select("id, animal, numero, hora, fecha, emoji")
        .gte("fecha", fromDate)
        .order("fecha", { ascending: false })
        .order("hora", { ascending: true })
        .limit(200);

      if (cancelled) return;

      if (sbError) {
        console.error("[useSorteos] Error al obtener sorteos:", sbError.message);
        setError(sbError.message);
        setLoading(false);
        return;
      }

      const incoming = (data as SorteoRow[]).map(rowToResult);
      const merged = mergeResults(cached, incoming);

      // Truncar caché a los últimos 30 días para no saturar localStorage
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      const trimmed = merged.filter((r) => r.date >= cutoffStr);

      // Solo actualizar el estado si hubo cambios reales
      const newHash = hashIds(trimmed);
      if (silent && newHash === lastHashRef.current) {
        scheduleNextPoll(silent);
        return;
      }
      lastHashRef.current = newHash;

      // Guardar en caché (datos recortados a 30 días)
      setCached(CACHE_KEYS.SORTEOS, trimmed);

      setResults(trimmed);
      setLoading(false);

      // Programar el próximo poll con intervalo dinámico
      scheduleNextPoll(true);
    }

    /**
     * Programa el próximo fetch con el intervalo inteligente.
     * Usamos setTimeout recursivo en lugar de setInterval para que
     * el intervalo se recalcule dinámicamente en cada ciclo.
     */
    function scheduleNextPoll(silent: boolean) {
      if (cancelled) return;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      const delay = getPollingInterval();
      pollTimerRef.current = setTimeout(() => {
        if (!cancelled) fetchSorteos(silent);
      }, delay);
    }

    fetchSorteos(false);

    return () => {
      cancelled = true;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  // Filtro de gating temporal: jamás revelar resultados antes de la hora exacta
  const visibleResults = results.filter((r) => {
    const today = getTodayStrVE();
    if (r.date > today) return false;
    if (r.date === today) {
      const rh = hourStrToNum(r.hour);
      if (rh > currentH) return false;
    }
    return true;
  });

  return { results: visibleResults, loading, error };
}
