import { LotteryResult } from "@/data/mockData";

interface HeroSectionProps {
  result: LotteryResult;
  updatedAgo: number;
}

const HeroSection = ({ result, updatedAgo }: HeroSectionProps) => {
  return (
    <section
      className="winner-bg w-full min-h-[40vh] flex flex-col items-center justify-center px-4 py-8 animate-fade-in"
      aria-label="Último resultado del sorteo"
    >
      <div className="text-[80px] md:text-[120px] leading-none mb-2" aria-hidden="true">
        {result.emoji}
      </div>
      <p className="text-2xl md:text-4xl font-extrabold text-accent mb-1">
        ¡GANADOR!
      </p>
      <p className="text-lg md:text-xl font-semibold text-foreground">
        Animal: {result.animal}
      </p>
      <p className="text-4xl md:text-5xl font-extrabold text-secondary mt-2">
        {result.number.toString().padStart(2, "0")}
      </p>
      <span className="mt-3 inline-flex items-center gap-2 rounded-md bg-card px-3 py-1 text-sm font-medium text-muted-foreground border border-border">
        {result.hour}
      </span>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse-dot" aria-hidden="true" />
        <span>Actualizado hace {updatedAgo} min</span>
      </div>
    </section>
  );
};

export default HeroSection;
