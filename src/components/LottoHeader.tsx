import { motion } from "framer-motion";
import { Calendar, ChevronDown } from "lucide-react";

interface LottoHeaderProps {
  onToggleFilters: () => void;
}

const LottoHeader = ({ onToggleFilters }: LottoHeaderProps) => {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 h-[60px] md:h-[72px] header-glass border-b border-border flex items-center justify-between px-4 md:px-8"
      role="banner"
    >
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-black text-sm md:text-base">LA</span>
        </div>
        <h1 className="text-lg md:text-xl font-extrabold text-primary tracking-tight">
          Lotto Azar
        </h1>
      </div>
      <div className="flex-1 flex justify-end">
        <button
          onClick={onToggleFilters}
          aria-label="Ver historial de sorteos"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-muted"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Historial</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.header>
  );
};

export default LottoHeader;
