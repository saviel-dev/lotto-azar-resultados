import { PYRAMID_DATA, HOT_NUMBERS } from "@/data/mockData";

const BLOCK_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-accent text-accent-foreground",
];

const PyramidSection = () => {
  return (
    <section className="w-full py-10 px-4" aria-label="Números de la suerte">
      <h2 className="text-xl md:text-2xl font-bold text-center text-foreground mb-6">
        Números de la Suerte Hoy
      </h2>
      <div className="flex flex-col items-center gap-2 md:gap-3">
        {PYRAMID_DATA.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2 md:gap-3">
            {row.map((num, colIdx) => {
              const isHot = HOT_NUMBERS.has(num);
              const colorClass = BLOCK_COLORS[(rowIdx + colIdx) % BLOCK_COLORS.length];
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`w-[52px] h-[52px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px] rounded-lg flex items-center justify-center font-bold text-lg md:text-2xl cursor-default transition-transform duration-200 hover:scale-110 ${colorClass} ${isHot ? "ring-2 ring-secondary ring-offset-2 ring-offset-background" : ""}`}
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
                  aria-label={`Número ${num}${isHot ? ", caliente" : ""}`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-center text-xs md:text-sm text-muted-foreground mt-5">
        Predicción basada en patrones históricos
      </p>
    </section>
  );
};

export default PyramidSection;
