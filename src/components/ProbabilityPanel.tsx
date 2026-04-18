import React, { useMemo } from 'react';
import { type LotteryResult, ANIMALS } from '@/data/mockData';
import { TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatAnimalNumber } from '@/lib/utils';

interface ProbabilityPanelProps {
  results: LotteryResult[];
}

export const ProbabilityPanel: React.FC<ProbabilityPanelProps> = ({ results }) => {
  const tendencies = useMemo(() => {
    // Only look at the last 50 draws to get recent context
    const recentResults = (results || []).slice(0, 50);
    const totalRecent = recentResults.length;
    
    // Count occurrences
    const counts = new Map<string, number>();
    recentResults.forEach(r => {
      counts.set(r.animal, (counts.get(r.animal) || 0) + 1);
    });

    if (totalRecent === 0) return [];

    // Map to array and calculate percentages
    const list = Array.from(counts.entries()).map(([name, count]) => {
      const animalRef = ANIMALS.find(a => a.name === name);
      return {
        name,
        emoji: animalRef?.emoji || '❔',
        number: animalRef?.number || '0',
        count,
        percentage: (count / totalRecent) * 100
      };
    });

    // Sort by most frequent
    return list.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [results]);

  // Max percentage to scale bars relatively
  const maxPercentage = tendencies.length > 0 ? tendencies[0].percentage : 100;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-indigo-800/50">
      {/* Background Decor */}
      <div className="absolute -right-10 -bottom-10 text-indigo-500/10 pointer-events-none">
        <Target size={200} strokeWidth={1} />
      </div>

      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-800/50 flex items-center justify-center text-indigo-300 shadow-sm border border-indigo-700/50">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Probabilidades</h2>
            <p className="text-sm font-medium text-indigo-300">Tendencias por salida reciente</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {tendencies.map((t, idx) => (
          <div key={t.name} className="flex items-center gap-3 group">
            {/* Emoji & Num */}
            <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 items-center gap-2 min-w-[100px]">
              <span className="text-2xl drop-shadow-sm">{t.emoji}</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">{t.name}</span>
                <span className="text-sm font-black text-white leading-none">{formatAnimalNumber(t.name, t.number)}</span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1.5 px-0.5">
                <span className="text-xs font-semibold text-indigo-200">
                  {t.count} {t.count === 1 ? 'salida' : 'salidas'}
                </span>
                <span className="text-xs font-black text-indigo-300">
                  {t.percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="h-2.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(t.percentage / maxPercentage) * 100}%` }}
                  transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                </motion.div>
              </div>
            </div>
          </div>
        ))}

        {tendencies.length === 0 && (
          <div className="text-center py-6 text-indigo-400">
            <p className="text-sm">Sin datos suficientes</p>
          </div>
        )}
      </div>
    </div>
  );
};
