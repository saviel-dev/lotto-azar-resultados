import { motion } from "framer-motion";
import { LotteryResult } from "@/data/mockData";
import TypewriterText from "@/components/TypewriterText";

interface HeroSectionProps {
  result: LotteryResult;
  updatedAgo: number;
}

// Iconos relacionados con la lotería / suerte
const LOTTERY_ICONS = ["🎰", "🎲", "💰", "⭐", "🌟", "💫", "🍀", "🎯", "🏆", "💎", "🃏", "🎴", "✨", "🪙", "🎊"];

// Generador determinista para posiciones y tiempos de partículas
function seeded(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  icon: LOTTERY_ICONS[Math.floor(seeded(i) * LOTTERY_ICONS.length)],
  x: seeded(i + 50) * 95,           // % horizontal (0–95)
  y: seeded(i + 100) * 80,          // % vertical inicial (0–80)
  size: `${1 + seeded(i + 150) * 1.4}rem`,   // 1–2.4rem
  opacity: 0.25 + seeded(i + 200) * 0.45,    // 0.25–0.70
  duration: 4 + seeded(i + 250) * 5,         // 4–9s
  delay: seeded(i + 300) * 4,               // 0–4s delay inicial
  drift: 30 + seeded(i + 350) * 50,          // px flotación vertical
  rotate: seeded(i + 400) * 360 - 180,       // rotación inicial
  spin: (seeded(i + 450) > 0.5 ? 1 : -1) * (20 + seeded(i + 500) * 60), // giro total
}));

const HeroSection = ({ result, updatedAgo }: HeroSectionProps) => {
  return (
    <section
      className="w-full min-h-[42vh] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      aria-label="Último resultado del sorteo"
    >
      {/* Fondo difuminado — solo la imagen tiene blur, no el contenido */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)",
          transform: "scale(1.06)", // evita bordes blancos del blur
        }}
      />
      {/* Overlay semitransparente para mejorar legibilidad */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(10, 20, 60, 0.68)" }} />

      {/* Partículas flotantes de lotería */}
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute pointer-events-none select-none z-5"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
          initial={{ opacity: 0, y: 0, rotate: p.rotate }}
          animate={{
            opacity: [0, p.opacity, p.opacity, 0],
            y: [0, -p.drift, -p.drift * 1.6, -p.drift * 2.2],
            rotate: [p.rotate, p.rotate + p.spin],
            scale: [0.7, 1, 1, 0.7],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        >
          {p.icon}
        </motion.span>
      ))}

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-secondary/5 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary/5 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
        className="relative z-10 text-[72px] md:text-[100px] lg:text-[120px] leading-none mb-3"
        aria-hidden="true"
      >
        {result.emoji}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10 text-center"
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
        className="relative z-10 text-center mt-2"
      >
        <p className="text-base md:text-lg font-semibold text-foreground/80 text-white">
          Animal: <span className="text-foreground font-bold text-white">{result.animal}</span>
        </p>
      </motion.div>

      <motion.p
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 1.5 }}
        className="relative z-10 text-5xl md:text-6xl lg:text-7xl font-black text-secondary mt-3 tabular-nums"
      >
        {result.number.toString().padStart(2, "0")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="relative z-10 mt-4 flex flex-col items-center gap-3"
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
