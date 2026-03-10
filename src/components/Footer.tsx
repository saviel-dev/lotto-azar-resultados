import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
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
          {["Últimos Resultados", "Historial", "La Pirámide", "Acerca de"].map((label) => (
            <a key={label} href="#" className="footer-link">
              {label}
            </a>
          ))}
        </nav>

        {/* Divider */}
        <div className="w-16 h-px bg-border" />

        {/* Bottom line */}
        <p className="text-xs text-muted-foreground text-center">
          © {year} <strong className="text-foreground font-semibold">Lotto Azar</strong>
          {" · "}Resultados con fines informativos
          {" · "}Hecho con <Heart className="h-3 w-3 inline text-red-500 fill-red-500" /> en Venezuela
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
