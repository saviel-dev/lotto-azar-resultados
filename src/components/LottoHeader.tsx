import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, X, Eye, EyeOff, LayoutDashboard } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface LottoHeaderProps {
  onToggleFilters: () => void;
}

const LottoHeader = ({ onToggleFilters }: LottoHeaderProps) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = useCallback(() => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setShowLogin(true);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2000);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    setTimeout(() => {
      if (email === "correo@gmail.com" && password === "admin123") {
        setShowLogin(false);
        navigate("/admin");
      } else {
        setIsLoading(false);
        setLoginError("Correo o contraseña incorrectos.");
      }
    }, 1000);
  };

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-0 right-0 z-50 h-[60px] md:h-[72px] header-glass border-b border-border flex items-center justify-between px-4 md:px-8"
        role="banner"
      >
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <h1
            className="text-lg md:text-xl font-extrabold text-primary tracking-tight cursor-pointer select-none"
            onClick={handleLogoClick}
            title="Lotto Azar"
          >
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

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative w-full max-w-[380px] bg-white rounded-[24px] shadow-md px-6 py-8 sm:px-8 sm:py-10 border-2 border-blue-500"
            >
              {/* Close button */}
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Admin icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                  <LayoutDashboard className="text-white w-7 h-7" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-[24px] font-medium text-center text-gray-900 mb-1">
                Acceso al Panel
              </h2>
              <p className="text-center text-blue-500 text-sm mb-6">
                Ingresa tus credenciales de administrador
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="login-email" className="text-sm font-semibold text-gray-800">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none text-gray-900 text-sm py-1.5 placeholder-gray-400 transition-colors"
                    placeholder="Tu respuesta"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="login-password" className="text-sm font-semibold text-gray-800">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      className="w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none text-gray-900 text-sm py-1.5 placeholder-gray-400 transition-colors pr-8"
                      placeholder="Tu respuesta"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 bottom-0 flex items-center text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {loginError && (
                  <p className="text-sm text-rose-600 text-center -mt-1 font-medium">
                    {loginError}
                  </p>
                )}

                {/* Submit */}
                <div className="pt-2 flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-2.5 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium active:scale-95 w-full sm:w-auto disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray="32"
                            strokeDashoffset="12"
                          />
                        </svg>
                        Verificando...
                      </span>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LottoHeader;
