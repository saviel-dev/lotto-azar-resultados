import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const year = new Date().getFullYear();
  const [showReglas, setShowReglas] = useState(false);

  return (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full border-t border-border bg-card"
      >
        <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col items-center gap-5">
          {/* Title only */}
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Lotto Azar
          </h2>

          {/* Quick links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {["Últimos Resultados", "Historial", "La Pirámide"].map((label) => (
              <a key={label} href="#" className="footer-link">
                {label}
              </a>
            ))}
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowReglas(true);
              }}
              className="footer-link cursor-pointer hover:text-primary transition-colors text-sm font-medium"
            >
              Reglas de Pago
            </button>
          </nav>

          {/* Divider */}
          <div className="w-16 h-px bg-border" />

          {/* Bottom line */}
          <p className="text-xs text-muted-foreground text-center">
            © {year} <strong className="text-foreground font-semibold">Lotto Azar</strong>
            {" · "}Resultados con fines informativos
            {" · "}Hecho con <Heart className="h-3 w-3 inline text-red-500 fill-red-500" /> para Colombia, Perú y Venezuela
          </p>
        </div>
      </motion.footer>

      {/* Modal Reglas de Pago */}
      <AnimatePresence>
        {showReglas && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowReglas(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[480px] bg-card rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh] overflow-hidden"
            >
              <button
                onClick={() => setShowReglas(false)}
                className="absolute top-4 right-4 z-20 text-muted-foreground hover:text-foreground bg-background/50 hover:bg-muted rounded-full p-1.5 transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto w-full" style={{ scrollbarWidth: "thin" }}>
                {/* Banner */}
                <header className="bg-primary/5 border-b border-border py-6 px-4 sticky top-0 z-10 backdrop-blur-md">
                  <h2 className="text-xl md:text-2xl font-black uppercase text-primary text-center tracking-tight">
                    Recuadro de Pagos
                  </h2>
                </header>

                {/* Jugada Individual */}
                <section className="py-6 px-5">
                  <h3 className="text-lg text-foreground text-center font-bold uppercase mb-4 tracking-tight">
                    Por jugada individual
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {[
                      { win: "70", mult: "1" },
                      { win: "700", mult: "10" },
                      { win: "7.000", mult: "100" },
                    ].map((item, idx) => (
                      <li key={idx} className="bg-card border-l-4 border-primary py-3 px-4 rounded-lg flex justify-center items-center shadow-sm border-[1px] border-border/50 gap-2">
                        <span className="text-primary text-2xl font-black">{item.win}</span>
                        <span className="text-muted-foreground text-xl font-black mx-1">×</span>
                        <span className="text-foreground text-2xl font-black">{item.mult}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Comodin Section */}
                <section className="bg-muted/30 border-t border-border py-6 px-5">
                  <h3 className="text-primary text-lg font-bold text-center mb-4 flex justify-center items-center gap-2 uppercase tracking-tight">
                    Por Comodín
                  </h3>

                  <div className="bg-primary/10 text-primary border border-primary/20 text-center py-2.5 px-4 rounded-xl text-sm font-bold mb-5 uppercase tracking-wide">
                    Paga el DOBLE de la jugada individual
                  </div>

                  <p className="text-center text-sm font-medium text-muted-foreground mb-5 italic bg-card border border-border p-3 rounded-lg leading-relaxed shadow-sm">
                    "Por comodín paga 1 por tanto, 10 por tanto y 100 por tanto."
                  </p>

                  <ul className="flex flex-col gap-3">
                    {[
                      { win: "140", mult: "1" },
                      { win: "1.400", mult: "10" },
                      { win: "14.000", mult: "100" },
                    ].map((item, idx) => (
                      <li key={idx} className="bg-card border-l-4 border-primary py-3 px-4 rounded-lg flex justify-center items-center shadow-sm border-[1px] border-border/50 gap-2">
                        <span className="text-primary text-2xl font-black">{item.win}</span>
                        <span className="text-muted-foreground text-xl font-black mx-1">×</span>
                        <span className="text-foreground text-2xl font-black">{item.mult}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;
