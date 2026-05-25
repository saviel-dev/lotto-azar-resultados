/**
 * usePronosticos — Lee los pronósticos de la tabla `pronosticos` en Supabase.
 * - Caché localStorage de 1 hora (los pronósticos cambian raramente en el día).
 * - SIN suscripción Realtime (innecesario para datos que cambian poco).
 * - Stale-while-revalidate: si hay caché (aunque expirada), muestra los datos
 *   inmediatamente sin spinner y refresca Supabase silenciosamente en fondo.
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getCachedStale, setCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

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
  // Stale-while-revalidate: inicializar desde caché (aunque esté expirada)
  const { data: staleData, isStale } = getCachedStale<Pronostico[]>(
    CACHE_KEYS.PRONOSTICOS,
    CACHE_TTL.PRONOSTICOS_MS
  );

  const [pronosticos, setPronosticos] = useState<Pronostico[]>(staleData ?? []);
  // Si hay datos (aunque viejos), no mostramos spinner inicial
  const [loading, setLoading] = useState(staleData === null);
  const [error, setError] = useState<string | null>(null);

  const fetchPronosticos = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    const { data, error: sbErr } = await supabase
      .from("pronosticos")
      .select("id, hora, loteria, animal, numero")
      .order("hora", { ascending: true });

    if (sbErr) {
      if (!silent) {
        setError(sbErr.message);
        setLoading(false);
      }
      return;
    }

    // Adjuntar emoji desde el catálogo local
    const { ANIMALS } = await import("@/data/mockData");
    const mapped: Pronostico[] = (data ?? []).map((row: any) => ({
      id: row.id,
      hora: row.hora,
      loteria: row.loteria,
      animal: row.animal,
      numero: row.numero,
      emoji: ANIMALS.find((a) => a.name === row.animal)?.emoji ?? "🐾",
    }));

    // Guardar en caché por 1 hora
    setCached(CACHE_KEYS.PRONOSTICOS, mapped);
    setPronosticos(mapped);
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    if (staleData !== null && !isStale) {
      // Caché fresca: no hacer nada, ya inicializamos con ella
      setLoading(false);
      return;
    }

    if (staleData !== null && isStale) {
      // Caché expirada: tenemos datos viejos visibles, refrescar en background
      fetchPronosticos(true);
    } else {
      // Sin caché: fetch normal con spinner
      fetchPronosticos(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { pronosticos, loading, error };
}
