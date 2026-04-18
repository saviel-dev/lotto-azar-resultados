import { useState, useEffect, useRef } from "react";
import LottoHeader from "@/components/LottoHeader";
import ForecastTicker from "@/components/ForecastTicker";
import HeroSection from "@/components/HeroSection";
import HistorySection from "@/components/HistorySection";
import Footer from "@/components/Footer";
import SorteoInfoSection from "@/components/SorteoInfoSection";
import { ProbabilityPanel } from "@/components/ProbabilityPanel";
import { EnjauladosPanel } from "@/components/EnjauladosPanel";
import { useSorteos } from "@/hooks/useSorteos";
import { useEnjaulados } from "@/hooks/useEnjaulados";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [updatedAgo, setUpdatedAgo] = useState(2);
  const historyRef = useRef<HTMLDivElement>(null);
  const { results, loading, error } = useSorteos();
  const enjaulados = useEnjaulados(results);

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

        {/* Panel de Enjaulados y Probabilidades */}
        {!loading && !error && (
          <div className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <ProbabilityPanel results={results} />
            </div>
            <div className="lg:col-span-8">
              <EnjauladosPanel enjaulados={enjaulados} />
            </div>
          </div>
        )}

        <div ref={historyRef} className="container max-w-7xl mx-auto px-4">
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
