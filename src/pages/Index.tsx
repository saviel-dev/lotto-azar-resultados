import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import LottoHeader from "@/components/LottoHeader";
import HeroSection from "@/components/HeroSection";
import PyramidSection from "@/components/PyramidSection";
import HistorySection from "@/components/HistorySection";
import { generateResults } from "@/data/mockData";

const allResults = generateResults();

const Index = () => {
  const [updatedAgo, setUpdatedAgo] = useState(2);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdatedAgo((prev) => (prev >= 5 ? 0 : prev + 1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const latestResult = allResults[0];

  return (
    <div className="min-h-screen bg-background">
      <LottoHeader onToggleFilters={scrollToHistory} />
      <main className="pt-[60px] md:pt-[72px]">
        <HeroSection result={latestResult} updatedAgo={updatedAgo} />
        
        <div className="bg-card border-y border-border">
          <PyramidSection />
        </div>
        
        <div ref={historyRef}>
          <HistorySection results={allResults} />
        </div>
      </main>
      
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-8 text-center text-xs text-muted-foreground border-t border-border bg-card"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-[10px]">LA</span>
          </div>
          <span className="font-bold text-foreground">Lotto Azar</span>
        </div>
        <p>© 2026 Lotto Azar · Resultados con fines informativos</p>
      </motion.footer>
    </div>
  );
};

export default Index;
