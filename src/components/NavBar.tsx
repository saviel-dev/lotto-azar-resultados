import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavBarProps {
  onScrollTo: (section: "inicio" | "premios" | "probabilidades" | "historial") => void;
}

const NavBar = ({ onScrollTo }: NavBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const links: { label: string; key: "inicio" | "premios" | "probabilidades" | "historial" }[] = [
    { label: "Inicio",           key: "inicio"          },
    { label: "Tabla de Premios", key: "premios"         },
    { label: "Probabilidades",   key: "probabilidades"  },
    { label: "Historial",        key: "historial"       },
  ];

  const socials = [
    {
      label: "Correo",
      href: "mailto:contacto@lottoazar.com",
      color: "#EA4335",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/lotto_azaroficial?igsh=MXI5Mmx5Zm1oNzBqMw==",
      color: "#E1306C",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: "https://whatsapp.com/channel/0029VbCLGMi3GJP6PvHfh50D",
      color: "#25D366",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      ),
    },
  ];

  const handleLinkClick = (key: typeof links[0]["key"]) => {
    onScrollTo(key);
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          padding-bottom: 2px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 2px;
          border-radius: 9999px;
          background: #3b82f6;
          transition: width 0.25s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>

      <motion.nav
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full"
        style={{ borderBottom: "1px solid rgba(128,128,128,0.12)" }}
        aria-label="Navegación principal"
      >
        {/* ── Barra horizontal (md+) ───────────────────────────── */}
        <div className="hidden md:flex items-center px-6 lg:px-10 h-[52px]">
          {/* Links */}
          <div className="flex items-center gap-1 flex-1">
            {links.map(({ label, key }) => (
              <button
                key={key}
                onClick={() => handleLinkClick(key)}
                className="nav-link px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap bg-transparent border-0 cursor-pointer"
                style={{ color: "rgba(100,100,120,0.9)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(100,100,120,0.9)"; }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 mx-4 shrink-0 bg-border" />

          {/* Social icons */}
          <div className="flex items-center gap-1 shrink-0">
            {socials.map(({ label, href, color, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                style={{ color: "rgba(100,100,120,0.8)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = color;
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(128,128,128,0.08)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(100,100,120,0.8)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Barra móvil (< md) ──────────────────────────────── */}
        <div className="flex md:hidden items-center justify-between px-4 h-[48px]">
          {/* Social icons (siempre visibles en mobile) */}
          <div className="flex items-center gap-1">
            {socials.map(({ label, href, color, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150"
                style={{ color: "rgba(100,100,120,0.8)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = color;
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(128,128,128,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(100,100,120,0.8)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            className="flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-[5px] transition-colors duration-150 hover:bg-muted"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-[2px] rounded-full bg-muted-foreground"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              className="block w-5 h-[2px] rounded-full bg-muted-foreground"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-[2px] rounded-full bg-muted-foreground"
            />
          </button>
        </div>

        {/* ── Dropdown móvil ──────────────────────────────────── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="flex flex-col py-2 px-4 gap-1">
                {links.map(({ label, key }) => (
                  <button
                    key={key}
                    onClick={() => handleLinkClick(key)}
                    className="w-full text-left px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 bg-transparent border-0 cursor-pointer"
                    style={{ color: "rgba(100,100,120,0.9)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(100,100,120,0.9)";
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default NavBar;
