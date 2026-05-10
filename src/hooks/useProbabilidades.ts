/**
 * useProbabilidades — Lee las probabilidades de la tabla `probabilidades` en Supabase.
 * - Si la tabla no existe o está vacía, hace fallback a ANIMAL_WEIGHTS del mockData.
 * - Expone `weights` como Record<string, number> compatible con useProyeccion.
 * - Se suscribe a cambios en tiempo real (Supabase Realtime).
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ANIMAL_WEIGHTS } from "@/data/mockData";
import { LS_WEIGHTS_KEY } from "@/hooks/useProyeccion";

export interface ProbabilidadRow {
  id: number;
  animal: string;
  emoji: string;
  numero: string;
  peso: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseProbabilidadesResult {
  rows: ProbabilidadRow[];
  weights: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Event name para notificar cambios internos
export const PROB_UPDATED_EVENT = "lotto-probabilidades-updated";

/** Convierte filas de Supabase en Record<name, peso> */
function rowsToWeights(rows: ProbabilidadRow[]): Record<string, number> {
  return Object.fromEntries(
    rows.filter((r) => r.activo).map((r) => [r.animal, r.peso])
  );
}

export function useProbabilidades(): UseProbabilidadesResult {
  const [rows, setRows] = useState<ProbabilidadRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchErr } = await supabase
        .from("probabilidades")
        .select("*")
        .order("peso", { ascending: false });

      if (fetchErr) throw fetchErr;

      const fetched = (data ?? []) as ProbabilidadRow[];
      setRows(fetched);
      setError(null);

      // Sincronizar con localStorage para que useProyeccion lo lea sin cambios
      if (fetched.length > 0) {
        const weightsMap = rowsToWeights(fetched);
        try {
          localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(weightsMap));
          window.dispatchEvent(new Event("lotto-weights-updated"));
        } catch {
          // silenciar errores de storage
        }
      }
    } catch (err: any) {
      console.warn("useProbabilidades: error fetching from Supabase:", err);
      setError(err?.message ?? "Error desconocido");
      // Fallback a ANIMAL_WEIGHTS si la tabla no existe aún
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Suscripción Realtime para reflejar cambios en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel("probabilidades-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "probabilidades" },
        () => {
          fetchRows();
        }
      )
      .subscribe();

    // También escuchar evento local (cuando el admin guarda desde el mismo tab)
    const onLocal = () => fetchRows();
    window.addEventListener(PROB_UPDATED_EVENT, onLocal);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener(PROB_UPDATED_EVENT, onLocal);
    };
  }, [fetchRows]);

  // Calcular weights (activos solamente)
  const weights: Record<string, number> =
    rows.length > 0 ? rowsToWeights(rows) : ANIMAL_WEIGHTS;

  return { rows, weights, isLoading, error, refetch: fetchRows };
}
