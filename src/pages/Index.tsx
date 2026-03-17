import { useState, useEffect, useRef } from "react";
import LottoHeader from "@/components/LottoHeader";
import ForecastTicker from "@/components/ForecastTicker";
import HeroSection from "@/components/HeroSection";
import PyramidSection from "@/components/PyramidSection";
import HistorySection from "@/components/HistorySection";
import Footer from "@/components/Footer";
import { useSorteos } from "@/hooks/useSorteos";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [updatedAgo, setUpdatedAgo] = useState(2);
  const historyRef = useRef<HTMLDivElement>(null);
  const { results, loading, error } = useSorteos();

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdatedAgo((prev) => (prev >= 5 ? 0 : prev + 1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <LottoHeader onToggleFilters={scrollToHistory} />
      {/* Ticker de pronóstico fijo justo debajo del header */}
      <div className="fixed left-0 right-0 z-40 top-[60px] md:top-[72px]">
        <ForecastTicker />
      </div>
      {/* main con padding para header + ticker (~30px extra) */}
      <main className="pt-[90px] md:pt-[106px]">
        <HeroSection updatedAgo={updatedAgo} />

        <div className="bg-card border-y border-border">
          <PyramidSection />
        </div>

        <div ref={historyRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm">Cargando historial…</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-destructive">
              <span className="text-sm font-medium">Error al cargar el historial</span>
              <span className="text-xs opacity-70">{error}</span>
            </div>
          ) : (
            <HistorySection results={results} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
