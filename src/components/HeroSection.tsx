import { motion } from "framer-motion";
import { LotteryResult } from "@/data/mockData";
import TypewriterText from "@/components/TypewriterText";

interface HeroSectionProps {
  result: LotteryResult;
  updatedAgo: number;
}

const HeroSection = ({ result, updatedAgo }: HeroSectionProps) => {
  return (
    <section
      className="winner-surface w-full min-h-[42vh] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      aria-label="Último resultado del sorteo"
    >
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-secondary/5 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary/5 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
        className="text-[72px] md:text-[100px] lg:text-[120px] leading-none mb-3"
        aria-hidden="true"
      >
        {result.emoji}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <TypewriterText
          text="¡GANADOR!"
          speed={80}
          delay={700}
          className="text-2xl md:text-3xl lg:text-4xl font-black text-accent block"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="text-center mt-2"
      >
        <p className="text-base md:text-lg font-semibold text-foreground/80">
          Animal: <span className="text-foreground font-bold">{result.animal}</span>
        </p>
      </motion.div>

      <motion.p
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 1.5 }}
        className="text-5xl md:text-6xl lg:text-7xl font-black text-secondary mt-3 tabular-nums"
      >
        {result.number.toString().padStart(2, "0")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-4 flex flex-col items-center gap-3"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-semibold text-foreground border border-border card-elevated">
          🕐 {result.hour}
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse-dot" aria-hidden="true" />
          <span>En vivo · Actualizado hace {updatedAgo} min</span>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
