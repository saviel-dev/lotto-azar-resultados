/**
 * useProyeccion — Motor de proyección aleatoria con pesos configurables.
 *
 * Reglas:
 *  1. Cada animal tiene un peso (ANIMAL_WEIGHTS en mockData) que determina su probabilidad.
 *  2. El animal que salió AYER queda EXCLUIDO de la proyección de hoy.
 *  3. La selección es aleatoria pero controlada por los pesos.
 *  4. La proyección se regenera automáticamente cada `refreshMs` ms (por defecto cada 30 s),
 *     y también puede forzarse manualmente con `refresh()`.
 *  5. El hook expone `weightedList` (todos los animales con su peso y % normalizado)
 *     para que la UI lo muestre al jugador.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { ANIMALS, ANIMAL_WEIGHTS, type LotteryResult } from "@/data/mockData";

/* ─── Tipos públicos ─────────────────────────────────────── */
export interface AnimalWeight {
  name: string;
  emoji: string;
  number: string;
  weight: number;       // peso crudo configurado
  probability: number;  // porcentaje normalizado 0-100 sobre el pool activo
  isExcluded: boolean;  // true si fue el resultado de ayer
}

export interface ProyeccionItem {
  name: string;
  emoji: string;
  number: string;
  weight: number;
  probability: number;
}

export interface UseProyeccionResult {
  /** Lista completa con pesos y probabilidades para mostrar al jugador */
  weightedList: AnimalWeight[];
  /** Los N animales proyectados para el próximo sorteo */
  proyeccion: ProyeccionItem[];
  /** Animal del día anterior excluido */
  excludedYesterday: string | null;
  /** Último instante en que se actualizó la proyección */
  lastUpdated: Date;
  /** Fuerza una nueva proyección inmediatamente */
  refresh: () => void;
}

/* ─── Helper: weighted random selection sin repetidos ────── */
function weightedSample(
  pool: { name: string; weight: number }[],
  count: number
): string[] {
  const selected: string[] = [];
  const remaining = [...pool];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((s, a) => s + a.weight, 0);
    if (totalWeight <= 0) break;

    let rand = Math.random() * totalWeight;
    let chosenIdx = 0;
    for (let j = 0; j < remaining.length; j++) {
      rand -= remaining[j].weight;
      if (rand <= 0) {
        chosenIdx = j;
        break;
      }
    }
    selected.push(remaining[chosenIdx].name);
    remaining.splice(chosenIdx, 1); // sin repetidos
  }
  return selected;
}

/* ─── Helper: obtener la fecha de ayer en formato ISO ────── */
function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

/* ════════════════════════════════════════════════════════════
   Hook principal
══════════════════════════════════════════════════════════════ */
export function useProyeccion(
  results: LotteryResult[],
  proyeccionCount = 5,
  refreshMs = 30_000
): UseProyeccionResult {
  const [seed, setSeed] = useState(0); // incrementar para forzar re-generación
  const [lastUpdated, setLastUpdated] = useState(new Date());

  /* ── Animal excluido: el que salió ayer ─────────────────── */
  const excludedYesterday = useMemo<string | null>(() => {
    const yest = yesterdayStr();
    // Buscar el resultado más reciente de ayer (último sorteo del día)
    const yesterdayResults = (results || []).filter((r) => r.date === yest);
    if (yesterdayResults.length === 0) return null;
    // Tomamos el último sorteo de ayer (por hora descendente)
    const sorted = [...yesterdayResults].sort((a, b) =>
      b.hour.localeCompare(a.hour)
    );
    return sorted[0].animal;
  }, [results]);

  /* ── Pool activo: todos los animales con peso, excluyendo ayer ── */
  const activePool = useMemo(() => {
    return ANIMALS.filter((a) => a.name !== excludedYesterday).map((a) => ({
      name: a.name,
      weight: ANIMAL_WEIGHTS[a.name] ?? 10,
    }));
  }, [excludedYesterday]);

  /* ── Lista completa con probabilidades visibles ──────────── */
  const weightedList = useMemo<AnimalWeight[]>(() => {
    const activeTotal = activePool.reduce((s, a) => s + a.weight, 0);

    return ANIMALS.map((a) => {
      const rawWeight = ANIMAL_WEIGHTS[a.name] ?? 10;
      const isExcluded = a.name === excludedYesterday;
      const effectiveWeight = isExcluded ? 0 : rawWeight;
      const probability =
        activeTotal > 0 && !isExcluded
          ? (effectiveWeight / activeTotal) * 100
          : 0;

      return {
        name: a.name,
        emoji: a.emoji,
        number: a.number,
        weight: rawWeight,
        probability,
        isExcluded,
      };
    }).sort((a, b) => b.weight - a.weight); // ordenar por peso descendente
  }, [activePool, excludedYesterday, seed]); // seed para forzar recalculación visual

  /* ── Proyección actual (aleatoria, controlada por pesos) ─── */
  const proyeccion = useMemo<ProyeccionItem[]>(() => {
    // seed hace que se recalcule en cada refresh
    void seed;

    const selected = weightedSample(activePool, proyeccionCount);
    return selected.map((name) => {
      const animal = ANIMALS.find((a) => a.name === name)!;
      const weight = ANIMAL_WEIGHTS[name] ?? 10;
      const activeTotal = activePool.reduce((s, a) => s + a.weight, 0);
      return {
        name,
        emoji: animal.emoji,
        number: animal.number,
        weight,
        probability: activeTotal > 0 ? (weight / activeTotal) * 100 : 0,
      };
    });
  }, [activePool, seed]);

  /* ── Refresh manual ─────────────────────────────────────── */
  const refresh = useCallback(() => {
    setSeed((s) => s + 1);
    setLastUpdated(new Date());
  }, []);

  /* ── Auto-refresh periódico ──────────────────────────────── */
  useEffect(() => {
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
  }, [refresh, refreshMs]);

  return { weightedList, proyeccion, excludedYesterday, lastUpdated, refresh };
}
