/**
 * useProyeccion — Motor de proyección aleatoria con pesos configurables.
 *
 *  1. Cada animal tiene un peso numérico (ANIMAL_WEIGHTS en mockData) que determina su probabilidad.
 *     Estos valores se pueden sobreescribir vía localStorage key "lotto_weights".
 *  2. El animal que salió AYER y los que ya salieron HOY quedan EXCLUIDOS de la proyección actual.
 *  3. La selección es aleatoria pero controlada por su probabilidad.
 *  4. En modo "auto" la proyección se regenera automáticamente cada `refreshMs` ms
 *     (por defecto cada 4 horas). En modo "manual" solo se actualiza al llamar refresh().
 *  5. El hook expone `weightedList` (top animales con su porcentaje de salida)
 *     para que la UI lo muestre al jugador.
 *  6. Si un animal sale en el resultado real de hoy, desaparece automáticamente de las probabilidades activas.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { ANIMALS, ANIMAL_WEIGHTS, type LotteryResult } from "@/data/mockData";

/* ─── Constantes ─────────────────────────────────────────── */
export const LS_WEIGHTS_KEY = "lotto_weights";
export const DEFAULT_REFRESH_MS = 4 * 60 * 60 * 1000; // 4 horas
const WEIGHT_MIN = 0;
const WEIGHT_MAX = 100;
const WEIGHTS_UPDATED_EVENT = "lotto-weights-updated";

/* ─── Tipos públicos ─────────────────────────────────────── */
export interface AnimalWeight {
  name: string;
  emoji: string;
  number: string;
  weight: number;       // peso crudo configurado (% de salida interno)
  probability: number;  // porcentaje de salida normalizado 0-100 sobre el pool activo
  isExcluded: boolean;  // true si fue el resultado de ayer
}

export interface ProyeccionItem {
  name: string;
  emoji: string;
  number: string;
  weight: number;
  probability: number;
}

export type SorteoMode = "auto" | "manual";

export interface UseProyeccionResult {
  /** Lista completa con probabilidades de salida para mostrar al jugador */
  weightedList: AnimalWeight[];
  /** Los N animales proyectados para el próximo sorteo */
  proyeccion: ProyeccionItem[];
  /** Animal del día anterior excluido */
  excludedYesterday: string | null;
  /** Animales del día de hoy excluidos */
  excludedToday: string[];
  /** Último instante en que se actualizó la proyección */
  lastUpdated: Date;
  /** Fuerza una nueva proyección inmediatamente (sirve en ambos modos) */
  refresh: () => void;
  /** Modo actual del sorteo */
  mode: SorteoMode;
  /** Cambia el modo auto/manual */
  setMode: (m: SorteoMode) => void;
  /** Pesos activos (pueden estar sobreescritos desde admin) */
  activeWeights: Record<string, number>;
  /** Actualiza los pesos y los persiste en localStorage */
  updateWeights: (weights: Record<string, number>) => void;
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

/* ─── Helper: obtener la fecha de hoy en formato ISO ────── */
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/* ─── Helper: cargar pesos desde localStorage ─────────────── */
function loadWeightsFromStorage(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(LS_WEIGHTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, number>;
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, Math.max(WEIGHT_MIN, Math.min(WEIGHT_MAX, v))])
    );
  } catch {
    return null;
  }
}

/* ════════════════════════════════════════════════════════════
   Hook principal
══════════════════════════════════════════════════════════════ */
export function useProyeccion(
  results: LotteryResult[],
  proyeccionCount = 5,
  refreshMs = DEFAULT_REFRESH_MS
): UseProyeccionResult {
  const [seed, setSeed] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mode, setMode] = useState<SorteoMode>("auto");

  // Pesos con override de localStorage
  const [customWeights, setCustomWeights] = useState<Record<string, number> | null>(
    () => loadWeightsFromStorage()
  );

  const activeWeights = useMemo<Record<string, number>>(() => {
    const rawWeights = customWeights ? { ...ANIMAL_WEIGHTS, ...customWeights } : ANIMAL_WEIGHTS;
    return Object.fromEntries(
      Object.entries(rawWeights).map(([k, v]) => [k, Math.max(WEIGHT_MIN, Math.min(WEIGHT_MAX, v))])
    );
  }, [customWeights]);

  /* ── Animal excluido: el que salió ayer ─────────────────── */
  const excludedYesterday = useMemo<string | null>(() => {
    const yest = yesterdayStr();
    const yesterdayResults = (results || []).filter((r) => r.date === yest);
    if (yesterdayResults.length === 0) return null;
    const sorted = [...yesterdayResults].sort((a, b) =>
      b.hour.localeCompare(a.hour)
    );
    return sorted[0].animal;
  }, [results]);

  /* ── Animales excluidos: los que ya salieron hoy ─────────────────── */
  const excludedToday = useMemo<string[]>(() => {
    const today = todayStr();
    return (results || []).filter((r) => r.date === today).map((r) => r.animal);
  }, [results]);

  /* ── Pool activo: todos los animales con probabilidad, excluyendo ayer y HOY ── */
  const activePool = useMemo(() => {
    return ANIMALS.filter((a) => a.name !== excludedYesterday && !excludedToday.includes(a.name)).map((a) => ({
      name: a.name,
      weight: activeWeights[a.name] ?? WEIGHT_MIN,
    }));
  }, [excludedYesterday, excludedToday, activeWeights]);

  /* ── Lista completa con probabilidades de salida ──────────── */
  const weightedList = useMemo<AnimalWeight[]>(() => {
    const activeTotal = activePool.reduce((s, a) => s + a.weight, 0);

    return ANIMALS.map((a) => {
      const rawWeight = activeWeights[a.name] ?? WEIGHT_MIN;
      const isExcluded = a.name === excludedYesterday || excludedToday.includes(a.name);
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
    }).sort((a, b) => b.weight - a.weight);
  // seed incluido para forzar recalculación visual al cambiar probabilidades
  }, [activePool, excludedYesterday, excludedToday, activeWeights, seed]);

  /* ── Proyección actual (aleatoria, controlada por pesos) ─── */
  const proyeccion = useMemo<ProyeccionItem[]>(() => {
    void seed; // seed hace que se recalcule en cada refresh

    const selected = weightedSample(activePool, proyeccionCount);
    return selected.map((name) => {
      const animal = ANIMALS.find((a) => a.name === name)!;
      const weight = activeWeights[name] ?? WEIGHT_MIN;
      const activeTotal = activePool.reduce((s, a) => s + a.weight, 0);
      return {
        name,
        emoji: animal.emoji,
        number: animal.number,
        weight,
        probability: activeTotal > 0 ? (weight / activeTotal) * 100 : 0,
      };
    });
  }, [activePool, activeWeights, seed]);

  /* ── Refresh manual ─────────────────────────────────────── */
  const refresh = useCallback(() => {
    setSeed((s) => s + 1);
    setLastUpdated(new Date());
  }, []);

  /* ── Auto-refresh periódico (solo en modo auto) ──────────── */
  useEffect(() => {
    if (mode !== "auto") return;
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
  }, [refresh, refreshMs, mode]);

  /* ── Persistir pesos personalizados ─────────────────────── */
  const updateWeights = useCallback((weights: Record<string, number>) => {
    setCustomWeights(weights);
    try {
      localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(weights));
      window.dispatchEvent(new Event(WEIGHTS_UPDATED_EVENT));
    } catch {
      // silenciar errores de storage
    }
    // Forzar regeneración de proyección con nuevos pesos
    setSeed((s) => s + 1);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const syncWeights = () => {
      setCustomWeights(loadWeightsFromStorage());
      setSeed((s) => s + 1);
      setLastUpdated(new Date());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === LS_WEIGHTS_KEY) syncWeights();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(WEIGHTS_UPDATED_EVENT, syncWeights);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(WEIGHTS_UPDATED_EVENT, syncWeights);
    };
  }, []);

  return {
    weightedList,
    proyeccion,
    excludedYesterday,
    excludedToday,
    lastUpdated,
    refresh,
    mode,
    setMode,
    activeWeights,
    updateWeights,
  };
}
