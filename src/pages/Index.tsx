import { useState, useEffect, useRef } from "react";
import LottoHeader from "@/components/LottoHeader";
import HeroSection from "@/components/HeroSection";
import PyramidSection from "@/components/PyramidSection";
import HistorySection from "@/components/HistorySection";
import { generateResults } from "@/data/mockData";

const allResults = generateResults();

const Index = () => {
  const [updatedAgo, setUpdatedAgo] = useState(2);
  const historyRef = useRef<HTMLDivElement>(null);

  // Simulate auto-refresh every 60s
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
      <main className="pt-[60px] md:pt-[80px]">
        <HeroSection result={latestResult} updatedAgo={updatedAgo} />
        <PyramidSection />
        <div ref={historyRef}>
          <HistorySection results={allResults} />
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        © 2026 Lotto Azar · Resultados con fines informativos
      </footer>
    </div>
  );
};

export default Index;
