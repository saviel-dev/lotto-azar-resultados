import { useEffect, useState } from "react";
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

export function useSorteos(): UseSorteosResult {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSorteos() {
      setLoading(true);
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

      const mapped: LotteryResult[] = (data as SorteoRow[]).map((row) => ({
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

    // Suscripción en tiempo real: actualiza automáticamente cuando se añade/modifica/elimina un sorteo
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

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { results, loading, error };
}
