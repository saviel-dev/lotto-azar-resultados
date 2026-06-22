import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMALS } from "@/data/mockData";

/* ─── Types ─────────────────────────────────────────────── */
interface RouletteRevealProps {
  /** Animal emoji that is the final result */
  finalEmoji: string;
  /** Animal name that is the final result */
  finalAnimal: string;
  /** Number of the result */
  finalNumber: string | number;
  /** Called when the full animation finishes */
  onComplete?: () => void;
  /** Whether to show the overlay */
  visible: boolean;
}

/* ─── Helpers ───────────────────────────────────────────── */
const SPIN_DURATION_MS = 2800; // total spin time
const DECEL_START_MS   = 1600; // when we start slowing down
const FRAME_MS         = 60;   // ~16fps feel for the slot

/** Pick N random animals that are NOT the final animal, used as "decoys" */
function buildSlotList(finalEmoji: string, count = 18) {
  const pool = ANIMALS.filter((a) => a.emoji !== finalEmoji);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const decoys = shuffled.slice(0, count - 1).map((a) => ({ emoji: a.emoji, name: a.name }));
  const target = ANIMALS.find((a) => a.emoji === finalEmoji) ?? ANIMALS[0];
  // Insert target near the end so it "lands" last
  return [...decoys, { emoji: target.emoji, name: target.name }];
}

/* ─── Particle burst on reveal ──────────────────────────── */
function BurstParticle({ delay, angle, color }: { delay: number; angle: number; color: string }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full pointer-events-none"
      style={{ background: color, translateX: "-50%", translateY: "-50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle) * (80 + Math.random() * 80),
        y: Math.sin(angle) * (80 + Math.random() * 80),
        opacity: 0,
        scale: [1, 1.4, 0],
      }}
      transition={{ duration: 0.9, delay, ease: "easeOut" }}
    />
  );
}

function ConfettiBurst() {
  const COLORS = ["#fbbf24","#3b82f6","#a855f7","#10b981","#f43f5e","#fb923c","#e879f9","#34d399"];
  const count = 24;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <BurstParticle
          key={i}
          delay={i * 0.015}
          angle={(i / count) * Math.PI * 2}
          color={COLORS[i % COLORS.length]}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   RouletteReveal component
══════════════════════════════════════════════════════════════ */
export default function RouletteReveal({
  finalEmoji,
  finalAnimal,
  finalNumber,
  onComplete,
  visible,
}: RouletteRevealProps) {
  const [phase, setPhase] = useState<"spinning" | "revealing" | "done">("spinning");
  const [currentSlot, setCurrentSlot] = useState<{ emoji: string; name: string }>({ emoji: "🎰", name: "" });
  const [showBurst, setShowBurst] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [slotList] = useState(() => buildSlotList(finalEmoji));
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef  = useRef<number>(0);
  const idxRef    = useRef(0);

  const clearFrame = useCallback(() => {
    if (frameRef.current) clearTimeout(frameRef.current);
  }, []);

  // ── Spin loop ──────────────────────────────────────────
  useEffect(() => {
    if (!visible) { setPhase("spinning"); setShowBurst(false); setShowResult(false); return; }

    startRef.current = performance.now();
    idxRef.current = 0;
    setPhase("spinning");
    setShowBurst(false);
    setShowResult(false);

    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const remaining = SPIN_DURATION_MS - elapsed;

      if (remaining <= 0) {
        // Land on the final animal
        setCurrentSlot({ emoji: finalEmoji, name: finalAnimal });
        setPhase("revealing");
        setTimeout(() => {
          setShowBurst(true);
          setTimeout(() => {
            setShowResult(true);
            setTimeout(() => {
              setPhase("done");
              onComplete?.();
            }, 1800);
          }, 100);
        }, 200);
        return;
      }

      // Slow down the frame rate as we approach the end
      let delay = FRAME_MS;
      if (elapsed > DECEL_START_MS) {
        const decelProgress = (elapsed - DECEL_START_MS) / (SPIN_DURATION_MS - DECEL_START_MS);
        delay = FRAME_MS + decelProgress * 320; // slow from 60ms → 380ms
      }

      // Cycle through slot list
      const slot = slotList[idxRef.current % slotList.length];
      setCurrentSlot(slot);
      idxRef.current++;

      frameRef.current = setTimeout(tick, delay);
    };

    frameRef.current = setTimeout(tick, FRAME_MS);
    return clearFrame;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => clearFrame, [clearFrame]);

  const isRevealing = phase === "revealing" || phase === "done";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ── Dark backdrop with radial spotlight ── */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(6,14,48,0.92) 0%, rgba(0,0,0,0.97) 100%)",
            }}
            onClick={phase === "done" ? onComplete : undefined}
          />

          {/* ── Spotlight beam ── */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Main card ── */}
          <motion.div
            className="relative flex flex-col items-center select-none"
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {/* Roulette title */}
            <motion.p
              className="text-xs font-bold tracking-[0.3em] uppercase mb-6 opacity-70"
              style={{ color: "#93c5fd" }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🎰 Sorteo en curso…
            </motion.p>

            {/* ── Slot machine frame ── */}
            <div
              className="relative flex flex-col items-center"
              style={{ perspective: 1000 }}
            >
              {/* Outer glow ring — pulses during spin */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 220, height: 220,
                  background: isRevealing
                    ? "radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
                  filter: "blur(20px)",
                  top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
                animate={isRevealing
                  ? { scale: [1, 1.4, 1.2], opacity: [1, 0.7, 1] }
                  : { scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }
                }
                transition={{ duration: isRevealing ? 0.6 : 1.2, repeat: isRevealing ? 0 : Infinity }}
              />

              {/* Slot window */}
              <div
                className="relative overflow-hidden flex items-center justify-center"
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: isRevealing
                    ? "linear-gradient(135deg, #1c1505 0%, #2d1f04 50%, #1a1200 100%)"
                    : "linear-gradient(135deg, #0a0f2e 0%, #0d1a4a 50%, #060d28 100%)",
                  border: isRevealing
                    ? "3px solid rgba(251,191,36,0.7)"
                    : "3px solid rgba(59,130,246,0.5)",
                  boxShadow: isRevealing
                    ? "0 0 40px rgba(251,191,36,0.4), inset 0 0 30px rgba(251,191,36,0.1)"
                    : "0 0 40px rgba(59,130,246,0.3), inset 0 0 30px rgba(59,130,246,0.1)",
                  transition: "border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease",
                }}
              >
                {/* Spin blur stripes (visible during fast spin) */}
                {phase === "spinning" && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none z-10"
                    style={{
                      background: "repeating-linear-gradient(0deg, transparent 0px, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 20px)",
                    }}
                    animate={{ backgroundPositionY: ["0px", "40px"] }}
                    transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }}
                  />
                )}

                {/* The emoji slot */}
                <motion.div
                  className="relative z-20 flex items-center justify-center"
                  key={phase === "spinning" ? currentSlot.emoji : "final"}
                  initial={phase === "spinning" ? { y: -30, opacity: 0, scale: 0.6 } : false}
                  animate={{ y: 0, opacity: 1, scale: isRevealing ? [1, 1.25, 1] : 1 }}
                  transition={
                    isRevealing
                      ? { type: "spring", stiffness: 400, damping: 12 }
                      : { duration: 0.08 }
                  }
                >
                  <span
                    className="leading-none select-none"
                    style={{
                      fontSize: "5rem",
                      filter: isRevealing
                        ? "drop-shadow(0 0 20px rgba(251,191,36,0.8))"
                        : "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
                      transition: "filter 0.4s ease",
                    }}
                    role="img"
                    aria-label={currentSlot.name}
                  >
                    {currentSlot.emoji}
                  </span>
                </motion.div>

                {/* Scanline overlay */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none z-30"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
                  }}
                />
              </div>

              {/* ── Confetti burst ── */}
              {showBurst && (
                <div className="absolute top-1/2 left-1/2 pointer-events-none z-50">
                  <ConfettiBurst />
                </div>
              )}

              {/* Decorative orbit ring */}
              <motion.div
                className="absolute rounded-full border pointer-events-none"
                style={{
                  width: 200, height: 200,
                  borderColor: isRevealing ? "rgba(251,191,36,0.3)" : "rgba(59,130,246,0.2)",
                  top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: isRevealing ? 3 : 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute rounded-full border pointer-events-none"
                style={{
                  width: 240, height: 240,
                  borderColor: isRevealing ? "rgba(251,191,36,0.15)" : "rgba(59,130,246,0.1)",
                  top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: isRevealing ? 5 : 2.5, repeat: Infinity, ease: "linear" }}
              />

              {/* ── Speed indicator dots (slot machine teeth) ── */}
              {[0,1,2,3,4,5,6,7].map((i) => {
                const angle = (i / 8) * Math.PI * 2;
                const r = 112;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 8, height: 8,
                      left: `calc(50% + ${Math.cos(angle) * r}px - 4px)`,
                      top:  `calc(50% + ${Math.sin(angle) * r}px - 4px)`,
                      background: isRevealing ? "#fbbf24" : "#3b82f6",
                      boxShadow: isRevealing ? "0 0 6px #fbbf24" : "0 0 6px #3b82f6",
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.075,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>

            {/* ── Result reveal ── */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  className="mt-8 flex flex-col items-center text-center px-6"
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                  {/* Winner banner */}
                  <motion.div
                    className="mb-3 px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      color: "#1c1505",
                      boxShadow: "0 0 20px rgba(251,191,36,0.5)",
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🏆 ¡Resultado!
                  </motion.div>

                  <motion.h2
                    className="text-4xl font-black text-white tracking-tight"
                    style={{ textShadow: "0 0 30px rgba(251,191,36,0.4)" }}
                  >
                    {finalAnimal}
                  </motion.h2>

                  <motion.p
                    className="mt-2 text-5xl font-black tabular-nums"
                    style={{ color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.6)" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.15 }}
                  >
                    {finalNumber}
                  </motion.p>

                  <motion.p
                    className="mt-4 text-xs font-medium"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Toca en cualquier parte para continuar
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
