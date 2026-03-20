import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LotteryResult } from "@/data/mockData";

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

/** Hash ligero: serializa los IDs ordenados para detectar cambios sin deep-compare. */
function hashIds(rows: SorteoRow[]): string {
  return rows.map((r) => r.id).sort((a, b) => a - b).join(",");
}

export function useSorteos(): UseSorteosResult {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastHashRef = useRef<string>("");

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

      const mapped: LotteryResult[] = rows.map((row) => ({
        id: row.id,
        animal: row.animal,
        number: row.numero,
        hour: row.hora,
        date: row.fecha,
        emoji: row.emoji,
      }));

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

  return { results, loading, error };
}
