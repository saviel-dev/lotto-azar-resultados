# Lotto Azar – Resultados de Loterías en Tiempo Real

Sitio web de resultados de loterías venezolanas en tiempo real. Consulta los últimos sorteos, historial semanal y las predicciones diarias de La Pirámide.

## Características

- 🏆 **Últimos resultados** — resultado del sorteo más reciente con animal y número
- 📅 **Historial semanal** — tabla con resultados por fecha y horario (hasta 7 días)
- 🔺 **La Pirámide** — predicción del día en formato pirámide invertida
- 🔍 **Búsqueda y filtros** — filtra por animal, fecha desde/hasta
- 📱 **Responsive** — diseño adaptado a móvil y escritorio

## Loterías cubiertas

- Lotto Azar
- Triple Táchira
- Kino Táchira
- Granjita
- La Guaira
- Caracas

## Tecnologías

- [Vite](https://vitejs.dev/) — bundler ultrarrápido
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) — estilos utilitarios
- [shadcn/ui](https://ui.shadcn.com/) — componentes UI
- [Framer Motion](https://www.framer.com/motion/) — animaciones

## Instalación y desarrollo

```sh
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd lotto-azar-live

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

El servidor de desarrollo estará disponible en `http://localhost:5173`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilar para producción |
| `npm run preview` | Previsualizar el build de producción |

## Estructura del proyecto

```
src/
├── components/
│   ├── Footer.tsx          # Footer del sitio
│   ├── HeroSection.tsx     # Sección principal con último resultado
│   ├── HistorySection.tsx  # Tabla de historial de sorteos
│   ├── LottoHeader.tsx     # Cabecera fija de navegación
│   └── PyramidSection.tsx  # La Pirámide del día
├── data/
│   └── mockData.ts         # Datos y generación de resultados
├── pages/
│   └── Index.tsx           # Página principal
└── index.css               # Estilos globales y componentes
```

## Licencia

© 2026 Lotto Azar. Todos los derechos reservados.  
Los resultados se muestran con fines informativos únicamente.
