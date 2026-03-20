import { useState, useEffect, useRef } from "react";
import LottoHeader from "@/components/LottoHeader";
import ForecastTicker from "@/components/ForecastTicker";
import HeroSection from "@/components/HeroSection";
import PyramidSection from "@/components/PyramidSection";
import HistorySection from "@/components/HistorySection";
import Footer from "@/components/Footer";
import SorteoInfoSection from "@/components/SorteoInfoSection";
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
      {/* Contenedor sticky único para Header y Ticker con separación (hr implícito por los bordes) */}
      <div className="sticky top-0 z-50 w-full flex flex-col shadow-sm">
        <LottoHeader onToggleFilters={scrollToHistory} />
        <ForecastTicker />
      </div>
      {/* main rest of content */}
      <main className="pt-4">
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

      <SorteoInfoSection />
      <Footer />
    </div>
  );
};

export default Index;
