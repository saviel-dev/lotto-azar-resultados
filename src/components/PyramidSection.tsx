import { motion } from "framer-motion";
import { PYRAMID_DATA, HOT_NUMBERS } from "@/data/mockData";

const BLOCK_STYLES = [
  "bg-primary text-primary-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-accent text-accent-foreground",
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { scale: 0, opacity: 0, rotate: -15 },
  show: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

const PyramidSection = () => {
  return (
    <section className="w-full py-12 px-4" aria-label="Números de la suerte">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-display-sm text-foreground mb-2">
          Números de la Suerte
        </h2>
        <p className="text-sm text-muted-foreground">Predicción del día basada en patrones históricos</p>
        <div className="section-divider mt-4" />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-30px" }}
        className="flex flex-col items-center gap-2.5 md:gap-3"
      >
        {PYRAMID_DATA.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2.5 md:gap-3">
            {row.map((num, colIdx) => {
              const isHot = HOT_NUMBERS.has(num);
              const colorClass = BLOCK_STYLES[(rowIdx + colIdx) % BLOCK_STYLES.length];
              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  variants={item}
                  className={`pyramid-block w-[52px] h-[52px] md:w-[76px] md:h-[76px] lg:w-[96px] lg:h-[96px] text-base md:text-xl lg:text-2xl ${colorClass} ${isHot ? "ring-2 ring-secondary ring-offset-2 ring-offset-background" : ""}`}
                  aria-label={`Número ${num}${isHot ? ", caliente" : ""}`}
                >
                  {num}
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-muted-foreground mt-6 italic"
      >
        Los números con borde verde están "calientes" 🔥
      </motion.p>
    </section>
  );
};

export default PyramidSection;
