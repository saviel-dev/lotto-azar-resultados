import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Pronostico {
  id: number;
  hora: string;
  loteria: string;
  animal: string;
  numero: number;
  emoji?: string;
}

interface UsePronosticosResult {
  pronosticos: Pronostico[];
  loading: boolean;
  error: string | null;
}

export function usePronosticos(): UsePronosticosResult {
  const [pronosticos, setPronosticos] = useState<Pronostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      const { data, error: sbErr } = await supabase
        .from("pronosticos")
        .select("id, hora, loteria, animal, numero")
        .order("hora", { ascending: true });

      if (cancelled) return;

      if (sbErr) {
        setError(sbErr.message);
        setLoading(false);
        return;
      }

      // Attach emoji from ANIMALS catalog for display
      const { ANIMALS } = await import("@/data/mockData");
      const mapped: Pronostico[] = (data ?? []).map((row: any) => ({
        id: row.id,
        hora: row.hora,
        loteria: row.loteria,
        animal: row.animal,
        numero: row.numero,
        emoji: ANIMALS.find((a) => a.name === row.animal)?.emoji ?? "🐾",
      }));

      setPronosticos(mapped);
      setLoading(false);
    }

    fetch();

    // Real-time subscription
    const channel = supabase
      .channel("pronosticos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pronosticos" },
        () => { if (!cancelled) fetch(); }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { pronosticos, loading, error };
}
