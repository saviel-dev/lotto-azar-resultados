import { useState, useEffect, useRef } from "react";
import LottoHeader from "@/components/LottoHeader";
import HeroSection from "@/components/HeroSection";
import PyramidSection from "@/components/PyramidSection";
import HistorySection from "@/components/HistorySection";
import Footer from "@/components/Footer";
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
      
      <Footer />
    </div>
  );
};

export default Index;
