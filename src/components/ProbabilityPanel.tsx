import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { type LotteryResult } from '@/data/mockData';
import { TrendingUp, Ban, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatAnimalNumber } from '@/lib/utils';
import { useProyeccion, type ProyeccionItem } from '@/hooks/useProyeccion';

/* ─── Caché de proyección ─────────────────────────────────────── */
const LS_PROYECCION_KEY = 'lotto_proyeccion_v1';
const PROYECCION_TTL_MS  = 4 * 60 * 60 * 1000; // 4 horas

interface CachedProyeccion {
  items: ProyeccionItem[];
  generatedAt: number; // timestamp ms
}

function loadCache(): CachedProyeccion | null {
  try {
    const raw = localStorage.getItem(LS_PROYECCION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedProyeccion;
  } catch { return null; }
}

function saveCache(items: ProyeccionItem[]): void {
  try {
    const data: CachedProyeccion = { items, generatedAt: Date.now() };
    localStorage.setItem(LS_PROYECCION_KEY, JSON.stringify(data));
  } catch { /* silenciar */ }
}

function isCacheValid(cache: CachedProyeccion): boolean {
  return Date.now() - cache.generatedAt < PROYECCION_TTL_MS;
}

/* ─── Constantes UI ───────────────────────────────────────────── */
const PROYECCION_COUNT = 6;

/* ─── Helpers visuales ─────────────────────────────────────────── */
function weightColor(weight: number): { bar: string; badge: string; text: string } {
  if (weight >= 28) return { bar: 'from-emerald-500 to-green-400', badge: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-300' };
  if (weight >= 18) return { bar: 'from-blue-500 to-cyan-400', badge: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-300' };
  if (weight >= 10) return { bar: 'from-violet-500 to-purple-400', badge: 'bg-violet-500/20 border-violet-500/40', text: 'text-violet-300' };
  return { bar: 'from-slate-500 to-slate-400', badge: 'bg-slate-500/20 border-slate-500/40', text: 'text-slate-400' };
}

/* ─── Props ─────────────────────────────────────────────────────── */
interface ProbabilityPanelProps {
  results: LotteryResult[];
  /** true mientras se cargan lotes históricos en background */
  loadingHistory?: boolean;
}

/* ════════════════════════════════════════════════════════════════ */
export const ProbabilityPanel: React.FC<ProbabilityPanelProps> = ({ results, loadingHistory = false }) => {
  const {
    proyeccion,   // selección fresca del motor
    weightedList,
    excludedYesterday,
    lastUpdated,
    refresh,
  } = useProyeccion(results, PROYECCION_COUNT, PROYECCION_TTL_MS);

  // ── Proyección estable (desde localStorage o generada cuando el historial termina) ──
  const [stableProyeccion, setStableProyeccion] = useState<ProyeccionItem[]>(() => {
    // Inicializar desde caché si es válida → evita el spinner cuando ya hay datos guardados
    const cache = loadCache();
    return (cache && isCacheValid(cache)) ? cache.items : [];
  });

  const historyLoadedRef = useRef(false);

  // Fija la proyección cuando el historial termina de cargar
  useEffect(() => {
    if (loadingHistory || historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    const cache = loadCache();
    if (cache && isCacheValid(cache)) {
      // Caché válida → usarla (ya puede estar en el estado inicial)
      setStableProyeccion(cache.items);
    } else if (proyeccion.length > 0) {
      // Sin caché o expirada → usar la proyección recién generada y guardarla
      setStableProyeccion(proyeccion);
      saveCache(proyeccion);
    }
  }, [loadingHistory, proyeccion]);

  // Rotación automática cada 4 horas: regenera y persiste
  const doRefresh = useCallback(() => {
    refresh(); // dispara un nuevo seed en el hook
  }, [refresh]);

  // Cuando `proyeccion` cambie DESPUÉS de la carga inicial (por el auto-refresh),
  // actualizamos la proyección estable y la guardamos en localStorage
  const prevProyeccionRef = useRef(proyeccion);
  useEffect(() => {
    if (!historyLoadedRef.current) return;
    if (proyeccion === prevProyeccionRef.current) return;
    prevProyeccionRef.current = proyeccion;

    if (proyeccion.length > 0) {
      setStableProyeccion(proyeccion);
      saveCache(proyeccion);
    }
  }, [proyeccion]);

  // Auto-refresh cada 4 horas (en sincronía con el TTL del caché)
  useEffect(() => {
    const msUntilFirstRefresh = (() => {
      const cache = loadCache();
      if (!cache) return PROYECCION_TTL_MS;
      const elapsed = Date.now() - cache.generatedAt;
      return Math.max(0, PROYECCION_TTL_MS - elapsed);
    })();

    // Primer disparo exactamente cuando expire el caché actual
    const firstTimeout = setTimeout(() => {
      doRefresh();
      // Luego repite cada 4 horas
    }, msUntilFirstRefresh);

    return () => clearTimeout(firstTimeout);
  }, [doRefresh]);

  // ── ¿Mostrar spinner? Solo si no hay caché válida Y el historial aún carga ──
  const showLoader = loadingHistory && stableProyeccion.length === 0;

  /* ─── Guía Probable (Top 26) ────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(0);

  const referenceList = useMemo(() => {
    return weightedList.filter((a) => !a.isExcluded).slice(0, 26);
  }, [weightedList]);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(referenceList.length / itemsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) setCurrentPage(totalPages - 1);
  }, [totalPages, currentPage]);

  const paginatedAnimals = referenceList.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const maxWeight = referenceList.length > 0 ? referenceList[0].weight : 1;

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-indigo-800/40">
      {/* Background decor */}
      <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
        <TrendingUp size={180} strokeWidth={1} />
      </div>

      {/* Header */}
      <div className="relative mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-800/60 flex items-center justify-center text-indigo-300 border border-indigo-700/50">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-none">Probabilidades</h2>
            <p className="text-xs font-medium text-indigo-400 mt-0.5">
              Probabilidad · Actualiza cada 4 horas
            </p>
          </div>
        </div>
      </div>

      {/* ── Proyección activa ── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            Proyección activa
          </span>
        </div>

        <AnimatePresence mode="wait">
          {showLoader ? (
            /* Spinner — solo aparece cuando no hay caché */
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] py-7"
            >
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-[3px] border-amber-400/20" />
                <motion.div
                  className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-amber-400"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-amber-400">
                Cargando proyección
              </span>
            </motion.div>
          ) : (
            /* Grid de 6 animales */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-3 gap-2"
            >
              {stableProyeccion.slice(0, PROYECCION_COUNT).map((p, i) => {
                const colors = weightColor(p.weight);
                return (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, scale: 0.85, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 220, damping: 22 }}
                    className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/50 rounded-xl px-3 py-2.5 shadow-sm"
                    title={`${p.emoji} ${p.name} · #${p.number}`}
                  >
                    <span className="text-xl leading-none shrink-0">{p.emoji}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white leading-none truncate">
                        {p.name}
                      </span>
                      <span className={`text-sm font-black leading-tight mt-0.5 ${colors.text}`}>
                        {p.number}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-indigo-800/40 mb-5" />

      {/* ── Guía Probable (Top 26) ─────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            Guía Probable (Top 26)
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg p-0.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-5 h-5 flex items-center justify-center rounded-[5px] text-indigo-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[9px] font-bold text-indigo-400 min-w-[2rem] text-center">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="w-5 h-5 flex items-center justify-center rounded-[5px] text-indigo-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3 min-h-[140px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${currentPage}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {paginatedAnimals.map((a, idx) => {
                const colors = weightColor(a.weight);
                const barWidth = maxWeight > 0 ? (a.weight / maxWeight) * 100 : 0;
                return (
                  <div key={a.name} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-xl px-2.5 py-1.5 min-w-[110px] shrink-0">
                      <span className="text-xl leading-none drop-shadow-sm">{a.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none truncate">{a.name}</span>
                        <span className="text-xs font-black text-white leading-none">{formatAnimalNumber(a.name, a.number)}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1 px-0.5">
                        <span className={`text-[10px] font-bold ${colors.text}`}>Probabilidad</span>
                        <span className="text-[10px] font-black text-white">{a.weight}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden border border-slate-700/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.05, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${colors.bar} rounded-full relative`}
                        >
                          <div className="absolute inset-0 bg-white/15 animate-pulse rounded-full" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Animal excluido de ayer ── */}
      {excludedYesterday && (
        <div className="mt-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-900/20 border border-red-800/30">
          <Ban className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 font-medium leading-snug">
            <span className="font-black text-red-200">{excludedYesterday}</span> no proyectado hoy — salió ayer
          </p>
        </div>
      )}

      {/* Última actualización */}
      <p className="text-[9px] text-indigo-500/60 mt-3 text-right">
        Actualizado: {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};
