import { motion } from "framer-motion";
import { PYRAMID_DATA } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

// Alternating yellow / green block colours matching the reference image
const YELLOW = {
  bg: "#f6c90e",
  text: "#1a1a00",
  shadow: "0 3px 8px rgba(246,201,14,0.45)",
};
const GREEN = {
  bg: "#2d8c3e",
  text: "#ffffff",
  shadow: "0 3px 8px rgba(45,140,62,0.45)",
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.2 },
  },
};

const blockAnim = {
  hidden: { scale: 0, opacity: 0, y: -8 },
  show: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 18,
    },
  },
};

const PyramidSection = () => {
  const [pyramidData, setPyramidData] = useState<number[][]>(PYRAMID_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPyramid = async () => {
      try {
        const { data, error } = await supabase
          .from("pyramid")
          .select("data")
          .eq("id", 1)
          .single();

        if (error) throw error;
        if (data && data.data) {
          setPyramidData(data.data);
        }
      } catch (err) {
        console.error("Error fetching pyramid:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPyramid();
  }, []);

  return (
    <section className="w-full py-12 px-4" aria-label="La Pirámide de números">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-display-sm text-foreground mb-2">La Pirámide</h2>
        <p className="text-sm text-muted-foreground">
          Números que irradian energía y suerte para hoy
        </p>
        <div className="section-divider mt-4" />
      </motion.div>

      {/* Pyramid — inverted triangle, widest row on top */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-30px" }}
        className="flex flex-col items-center gap-[3px]"
      >
        {pyramidData.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-[3px]">
            {row.map((digit, colIdx) => {
              // Alternate yellow / green:  (rowIdx + colIdx) % 2 === 0 → yellow, else green
              const isYellow = (rowIdx + colIdx) % 2 === 0;
              const color = isYellow ? YELLOW : GREEN;
              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  variants={blockAnim}
                  whileHover={{ scale: 1.18, zIndex: 10 }}
                  className={`pyramid-lotto-block ${isLoading ? 'animate-pulse opacity-80' : ''}`}
                  style={{
                    backgroundColor: color.bg,
                    color: color.text,
                    boxShadow: color.shadow,
                  }}
                  aria-label={`Dígito ${digit}`}
                >
                  {digit}
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-center gap-4 mt-7"
      >
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block w-4 h-4 rounded-sm"
            style={{ background: YELLOW.bg, border: "1px solid #c9a50a" }}
          />
          Positivo
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block w-4 h-4 rounded-sm"
            style={{ background: GREEN.bg }}
          />
          Suerte
        </span>
      </motion.div>
    </section>
  );
};

export default PyramidSection;
