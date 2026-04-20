import React, { useState, useEffect, useMemo } from 'react';
import { type LotteryResult } from '@/data/mockData';
import { TrendingUp, Ban, Zap, ChevronLeft, ChevronRight, Play, RotateCcw, Cpu, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatAnimalNumber } from '@/lib/utils';
import { useProyeccion } from '@/hooks/useProyeccion';

interface ProbabilityPanelProps {
  results: LotteryResult[];
}


/** Color del badge según probabilidad bruta */
function weightColor(weight: number): { bar: string; badge: string; text: string } {
  if (weight >= 28) return { bar: 'from-emerald-500 to-green-400',   badge: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-300' };
  if (weight >= 18) return { bar: 'from-blue-500 to-cyan-400',       badge: 'bg-blue-500/20 border-blue-500/40',       text: 'text-blue-300'   };
  if (weight >= 10) return { bar: 'from-violet-500 to-purple-400',   badge: 'bg-violet-500/20 border-violet-500/40',   text: 'text-violet-300' };
  return               { bar: 'from-slate-500 to-slate-400',         badge: 'bg-slate-500/20 border-slate-500/40',     text: 'text-slate-400'  };
}

export const ProbabilityPanel: React.FC<ProbabilityPanelProps> = ({ results }) => {
  const { proyeccion, weightedList, excludedYesterday, lastUpdated, refresh, mode, setMode } = useProyeccion(results, 5, 4 * 60 * 60 * 1000);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSorteando, setIsSorteando] = useState(false);

  // Top-26 animales (Guía probable) por probabilidad, excluyendo los ya sorteados
  const referenceList = useMemo(() => {
    return weightedList
      .filter((a) => !a.isExcluded)
      .slice(0, 26); // máximo 26 para que el usuario pueda ver suficientes pero no se aburra
  }, [weightedList]);

  // Paginación: 3 por página → máximo 9 páginas
  const itemsPerPage = 3;
  const totalPages = Math.ceil(referenceList.length / itemsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const startIndex = currentPage * itemsPerPage;
  const paginatedAnimals = referenceList.slice(startIndex, startIndex + itemsPerPage);

  const maxWeight = referenceList.length > 0 ? referenceList[0].weight : 1;

  // Animación del botón de sorteo
  const handleSortear = () => {
    setIsSorteando(true);
    refresh();
    setTimeout(() => setIsSorteando(false), 800);
  };

  const handleModeToggle = () => {
    setMode(mode === 'auto' ? 'manual' : 'auto');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-indigo-800/40">
      {/* Background decor */}
      <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
        <TrendingUp size={180} strokeWidth={1} />
      </div>

      {/* Header */}
      <div className="relative mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
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

          {/* Toggle Modo */}
          <button
            onClick={handleModeToggle}
            title={mode === 'auto' ? 'Modo automático activo — click para cambiar a manual' : 'Modo manual activo — click para volver a automático'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              mode === 'auto'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            {mode === 'auto' ? (
              <><Cpu className="w-3 h-3" /> Automático</>
            ) : (
              <><Hand className="w-3 h-3" /> Manual</>
            )}
          </button>
        </div>

        {/* Botón sortear ahora */}
        <motion.button
          onClick={handleSortear}
          whileTap={{ scale: 0.95 }}
          disabled={isSorteando}
          id="btn-sortear-ahora"
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-900/40 border border-indigo-500/30"
        >
          <AnimatePresence mode="wait">
            {isSorteando ? (
              <motion.span
                key="spinning"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 animate-spin" />
                Sorteando…
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {mode === 'auto' ? 'Sortear ahora (forzar)' : 'Iniciar sorteo'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Proyección activa ────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">Proyección activa</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={lastUpdated.getTime()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex flex-wrap gap-2"
          >
            {proyeccion.map((p, idx) => {
              const colors = weightColor(p.weight);
              return (
                <motion.div
                  key={`${p.name}-${idx}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.07, duration: 0.25, type: 'spring', stiffness: 200 }}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 shadow-sm"
                  title={`Proyección activa: ${p.emoji} ${p.name} · Número: ${p.number}`}
                >
                  <span className="text-xl leading-none">{p.emoji}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none truncate">{p.name}</span>
                    <span className={`text-xs font-black leading-none mt-0.5 ${colors.text}`}>{p.number}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Descripción legible para el jugador */}
        {proyeccion.length > 0 && (
          <p className="text-[10px] text-indigo-400/70 mt-2 leading-relaxed">
            <span className="font-bold text-indigo-300">Proyección activa:</span>{' '}
            {proyeccion.map((p, i) => (
              <span key={p.name}>
                {p.emoji} {p.name} {p.number}{i < proyeccion.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-indigo-800/40 mb-5" />

      {/* ── Tabla de % de salida visible al jugador ───────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            Guía Probable (Top 26)
          </p>

          {/* Paginación */}
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
                    {/* Animal chip */}
                    <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-xl px-2.5 py-1.5 min-w-[110px] shrink-0">
                      <span className="text-xl leading-none drop-shadow-sm">{a.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none truncate">{a.name}</span>
                        <span className="text-xs font-black text-white leading-none">{formatAnimalNumber(a.name, a.number)}</span>
                      </div>
                    </div>

                    {/* Barra de % de salida */}
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1 px-0.5">
                        <span className={`text-[10px] font-bold ${colors.text}`}>
                          Probabilidad
                        </span>
                        <span className="text-[10px] font-black text-white">
                          {a.weight}%
                        </span>
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

      {/* ── Animal excluido de ayer ──────────────────────────── */}
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
