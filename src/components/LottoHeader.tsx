import { Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LottoHeaderProps {
  onToggleFilters: () => void;
}

const LottoHeader = ({ onToggleFilters }: LottoHeaderProps) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[60px] md:h-[80px] bg-card border-b border-border flex items-center justify-between px-4 md:px-8"
      role="banner"
    >
      <div className="flex-1" />
      <h1 className="text-xl md:text-2xl font-extrabold text-primary tracking-tight">
        Lotto Azar
      </h1>
      <div className="flex-1 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFilters}
          aria-label="Filtros e historial"
          className="text-primary"
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default LottoHeader;
