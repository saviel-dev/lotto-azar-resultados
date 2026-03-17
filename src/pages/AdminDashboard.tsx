import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { animate, stagger } from "animejs";
import { sileo } from "sileo";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Backwards compatibility layer for AnimeJS v3 usage pattern
const anime = Object.assign((options: any) => {
  const { targets, ...rest } = options;
  return animate(targets, rest);
}, { stagger });
import {
  LayoutDashboard,
  Triangle,
  Radio,
  Trophy,
  History,
  LogOut,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Clock,
  CircleCheckBig,
} from "lucide-react";
import {
  PYRAMID_DATA,
  ANIMALS,
  HOURS_LIST,
  generateResults,
  type LotteryResult,
} from "@/data/mockData";
import { supabase } from "@/lib/supabase";

/* ── helpers ────────────────────────────────────────────────────── */
const YELLOW = { bg: "#f6c90e", text: "#1a1a00" };
const GREEN = { bg: "#2d8c3e", text: "#ffffff" };

const ALL_ANIMALS = ANIMALS.map((a) => a.name);

const LOTTERY_NAMES = ["Ardilla", "León", "Camello", "Vaca"];

type Section = "dashboard" | "piramide" | "pronosticos" | "sorteos" | "historial";

interface Forecast {
  id: number;
  hora: string;
  loteria: string;
  animal: string;
  numero: number;
}

/* ── nav ────────────────────────────────────────────────────────── */
const navItems: { id: Section; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "piramide", icon: Triangle, label: "La Pirámide" },
  { id: "pronosticos", icon: Radio, label: "Control de Pronósticos" },
  { id: "sorteos", icon: Trophy, label: "Sorteos" },
  { id: "historial", icon: History, label: "Historial" },
];

/* ════════════════════════════════════════════════════════════════
   Sección 0 – Dashboard general
════════════════════════════════════════════════════════════ */
const activityLog = [
  { time: "08:00 AM", text: "Sorteo Ardilla publicado correctamente", dot: "bg-emerald-500" },
  { time: "09:30 AM", text: "Nuevo usuario registrado en el sistema", dot: "bg-blue-500" },
  { time: "10:05 AM", text: "Error en sincronización de datos — resuelto", dot: "bg-rose-500" },
  { time: "12:00 PM", text: "Sorteo León — en transmisión en vivo", dot: "bg-yellow-500" },
  { time: "01:15 PM", text: "Backup automático completado", dot: "bg-emerald-500" },
];

const SectionDashboard = () => {
  const allResults = generateResults();
  const latest = allResults.slice(0, 6);
  const totalDigits = PYRAMID_DATA.reduce((acc, row) => acc + row.length, 0);
  const today = allResults.filter((r) => r.date === allResults[0].date);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate stats cards
    anime({
      targets: '.stat-card',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(50),
      duration: 400,
      easing: 'easeOutQuad'
    });

    // Animate tables/lists
    anime({
      targets: '.dashboard-list-item',
      translateX: [-15, 0],
      opacity: [0, 1],
      delay: anime.stagger(40, { start: 200 }),
      duration: 400,
      easing: 'easeOutSine'
    });
  }, []);

  const vals = [
    { label: "Resultados Registrados", value: allResults.length.toString(), sub: `${today.length} hoy` },
    { label: "Animales en Sistema", value: ANIMALS.length.toString(), sub: "catálogo completo" },
    { label: "Franjas Horarias", value: HOURS_LIST.length.toString(), sub: "sorteos por día" },
    { label: "Dígitos en Pirámide", value: totalDigits.toString(), sub: `${PYRAMID_DATA.length} filas` },
  ];

  return (
    <div ref={containerRef}>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Resumen General</h2>
        <p className="text-sm text-gray-500">Información general del panel de Lotto Azar</p>
      </div>

      {/* Stat cards — hardcoded so Tailwind JIT detects border-l colors */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className="stat-card opacity-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 flex-1 relative flex flex-col justify-center">
            <h3 className="text-3xl font-extrabold text-blue-600 z-10 tracking-tight">{vals[0].value}</h3>
            <p className="mt-1 text-sm text-gray-500 font-medium z-10">{vals[0].label}</p>
            <div className="absolute top-5 right-5 text-gray-100 z-0">
              <Trophy className="h-10 w-10" strokeWidth={1.5} />
            </div>
          </div>
          <div className="bg-blue-600 px-5 py-2.5 flex justify-between items-center text-white">
            <span className="text-xs font-medium">{vals[0].sub}</span>
            <div className="flex items-end gap-0.5 h-3 opacity-90">
              <div className="w-1 h-1.5 bg-white rounded-t-sm"></div>
              <div className="w-1 h-3 bg-white rounded-t-sm"></div>
              <div className="w-1 h-2.5 bg-white rounded-t-sm"></div>
              <div className="w-1 h-2 bg-white rounded-t-sm"></div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="stat-card opacity-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 flex-1 relative flex flex-col justify-center">
            <h3 className="text-3xl font-extrabold text-orange-600 z-10 tracking-tight">{vals[1].value}</h3>
            <p className="mt-1 text-sm text-gray-500 font-medium z-10">{vals[1].label}</p>
            <div className="absolute top-5 right-5 text-gray-100 z-0">
              <Users className="h-10 w-10" strokeWidth={1.5} />
            </div>
          </div>
          <div className="bg-orange-600 px-5 py-2.5 flex justify-between items-center text-white">
            <span className="text-xs font-medium">{vals[1].sub}</span>
            <div className="flex items-end gap-0.5 h-3 opacity-90">
              <div className="w-1 h-2 bg-white rounded-t-sm"></div>
              <div className="w-1 h-1 bg-white rounded-t-sm"></div>
              <div className="w-1 h-3 bg-white rounded-t-sm"></div>
              <div className="w-1 h-2.5 bg-white rounded-t-sm"></div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card opacity-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 flex-1 relative flex flex-col justify-center">
            <h3 className="text-3xl font-extrabold text-[#47a84e] z-10 tracking-tight">{vals[2].value}</h3>
            <p className="mt-1 text-sm text-gray-500 font-medium z-10">{vals[2].label}</p>
            <div className="absolute top-5 right-5 text-gray-100 z-0">
              <Activity className="h-10 w-10" strokeWidth={1.5} />
            </div>
          </div>
          <div className="bg-[#47a84e] px-5 py-2.5 flex justify-between items-center text-white">
            <span className="text-xs font-medium">{vals[2].sub}</span>
            <div className="flex items-end gap-0.5 h-3 opacity-90">
              <div className="w-1 h-2.5 bg-white rounded-t-sm"></div>
              <div className="w-1 h-1.5 bg-white rounded-t-sm"></div>
              <div className="w-1 h-2.5 bg-white rounded-t-sm"></div>
              <div className="w-1 h-2 bg-white rounded-t-sm"></div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="stat-card opacity-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 flex-1 relative flex flex-col justify-center">
            <h3 className="text-3xl font-extrabold text-[#f39c12] z-10 tracking-tight">{vals[3].value}</h3>
            <p className="mt-1 text-sm text-gray-500 font-medium z-10">{vals[3].label}</p>
            <div className="absolute top-5 right-5 text-gray-100 z-0">
              <Bell className="h-10 w-10" strokeWidth={1.5} />
            </div>
          </div>
          <div className="bg-[#f39c12] px-5 py-2.5 flex justify-between items-center text-white">
            <span className="text-xs font-medium">{vals[3].sub}</span>
            <div className="flex items-end gap-0.5 h-3 opacity-90">
              <div className="w-1 h-3 bg-white rounded-t-sm"></div>
              <div className="w-1 h-2 bg-white rounded-t-sm"></div>
              <div className="w-1 h-1.5 bg-white rounded-t-sm"></div>
              <div className="w-1 h-2.5 bg-white rounded-t-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Últimos resultados */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-blue-600 rounded-t-2xl">
            <h3 className="font-semibold text-white text-sm">ÚLtimos Resultados</h3>
            <span className="text-xs text-blue-100 font-medium">{latest.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1f5650] text-xs text-white uppercase tracking-wider border-b border-[#1f5650]">
                  <th className="text-left px-5 py-3 font-semibold">Fecha</th>
                  <th className="text-left px-5 py-3 font-semibold">Hora</th>
                  <th className="text-left px-5 py-3 font-semibold">Animal</th>
                  <th className="text-left px-5 py-3 font-semibold">Número</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {latest.map((r) => (
                  <tr key={r.id} className="dashboard-list-item opacity-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{r.date}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{r.hour}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{r.emoji} {r.animal}</td>
                    <td className="px-5 py-3 font-bold text-blue-600">{r.number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-blue-600 rounded-t-2xl">
            <h3 className="font-semibold text-white text-sm">Actividad Reciente</h3>
            <Clock className="h-4 w-4 text-blue-100" />
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {activityLog.map((item, i) => (
                <div key={i} className="dashboard-list-item opacity-0 flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${item.dot}`} />
                    {i < activityLog.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                  </div>
                  <div className="pb-4 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">{item.time}</p>
                    <p className="text-xs text-gray-700 leading-snug">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   Sección 1 – Pirámide
══════════════════════════════════════════════════════════════════ */
const SectionPiramide = () => {
  const [pyramid, setPyramid] = useState<(number | string)[][]>([]);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPyramid = async () => {
      try {
        const { data, error } = await supabase
          .from("pyramid")
          .select("data")
          .eq("id", 1)
          .single();

        if (error) throw error;
        if (data && data.data) {
          setPyramid(data.data);
        } else {
          setPyramid(PYRAMID_DATA.map((row) => [...row]));
        }
      } catch (err) {
        console.error("Error fetching pyramid:", err);
        setPyramid(PYRAMID_DATA.map((row) => [...row]));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPyramid();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate the row containers sequentially from bottom to top
    // Alternatively, animate the cells staggering from the top
    anime({
      targets: '.pyramid-cell',
      translateY: [-50, 0],
      scale: [0.8, 1],
      opacity: [0, 1],
      delay: anime.stagger(40, { start: 100, from: 'first' }),
      duration: 600,
      easing: 'easeOutElastic(1, .8)'
    });
  }, []);

  const updateCell = (r: number, c: number, val: string) => {
    if (val === "") {
      setPyramid((prev) =>
        prev.map((row, ri) =>
          ri === r ? row.map((cell, ci) => (ci === c ? "" : cell)) : row
        )
      );
      return;
    }

    let n = parseInt(val);
    if (!isNaN(n) && val.length > 1) {
      n = parseInt(val.slice(-1));
    }

    if (isNaN(n) || n < 0 || n > 9) return;
    setPyramid((prev) =>
      prev.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? n : cell)) : row
      )
    );
  };

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">La Pirámide</h2>
          <p className="text-sm text-gray-500">Edita los dígitos de la pirámide invertida</p>
        </div>
        <button
          onClick={async () => {
            if (editing) {
              const hasEmpty = pyramid.some(row => row.some(cell => cell === ""));
              if (hasEmpty) {
                sileo.error({
                  title: "Error de validación",
                  description: "Ningún campo puede estar vacío antes de guardar.",
                  duration: 1500
                });
                return;
              }

              try {
                const cleanData = pyramid.map(row =>
                  row.map(cell => typeof cell === "string" ? parseInt(cell) || 0 : Number(cell))
                );

                const { data: success, error } = await supabase.rpc("update_pyramid", {
                  new_data: cleanData,
                });

                if (error) throw error;
                if (!success) throw new Error("No rows updated");

                sileo.success({
                  title: "Cambios Guardados",
                  description: "Pirámide actualizada con éxito en la base de datos.",
                  duration: 1500
                });
                setEditing(false);
              } catch (err) {
                console.error("Error saving pyramid:", err);
                sileo.error({
                  title: "Error",
                  description: "No se pudo guardar la pirámide en la base de datos.",
                  duration: 2000
                });
              }
            } else {
              setEditing(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${editing
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {editing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editing ? "Guardar cambios" : "Editar pirámide"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          {pyramid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {row.map((digit, colIdx) => {
                const isYellow = (rowIdx + colIdx) % 2 === 0;
                const color = isYellow ? YELLOW : GREEN;
                return editing ? (
                  <input
                    key={colIdx}
                    type="number"
                    min={0}
                    max={9}
                    value={digit}
                    onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                    className="pyramid-cell w-10 h-10 text-center text-sm font-bold rounded border-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ borderColor: color.bg }}
                  />
                ) : (
                  <div
                    key={colIdx}
                    className="pyramid-cell w-10 h-10 flex items-center justify-center text-sm font-bold rounded shadow-sm"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {digit}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="flex justify-center gap-6 mt-6">
          {[["Positivo", YELLOW.bg], ["Suerte", GREEN.bg]].map(([label, bg]) => (
            <span key={label as string} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="inline-block w-4 h-4 rounded-sm" style={{ background: bg as string }} />
              {label as string}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   Sección 2 – Control de Pronósticos
══════════════════════════════════════════════════════════════════ */
const seedForecasts = (): Forecast[] =>
  HOURS_LIST.map((hora, i) => ({
    id: i + 1,
    hora,
    loteria: LOTTERY_NAMES[i % LOTTERY_NAMES.length],
    animal: ANIMALS[i % ANIMALS.length].name,
    numero: parseInt(ANIMALS[i % ANIMALS.length].number ?? "0", 10),
  }));

const blankForecastForm = () => ({
  hora: HOURS_LIST[0],
  loteria: LOTTERY_NAMES[0],
  animal: ANIMALS[0].name,
  numero: parseInt(ANIMALS[0].number ?? "0", 10),
});

const SectionPronosticos = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(blankForecastForm());

  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Fetch from Supabase ───────────────────────────────────────
  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const { data, error } = await supabase
          .from("pronosticos")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        const mapped: Forecast[] = (data ?? []).map((row: any) => ({
          id: row.id,
          hora: row.hora,
          loteria: row.loteria,
          animal: row.animal,
          numero: row.numero,
        }));

        mapped.sort((a, b) => HOURS_LIST.indexOf(a.hora) - HOURS_LIST.indexOf(b.hora));
        setForecasts(mapped);
      } catch (err) {
        console.error("Error fetching pronosticos:", err);
        setForecasts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecasts();
  }, []);

  useEffect(() => {
    if (!containerRef.current || forecasts.length === 0) return;

    anime({
      targets: '.pronostico-item',
      translateX: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(40, { start: 50 }),
      duration: 400,
      easing: 'easeOutQuart'
    });

    anime({
      targets: '.horario-item',
      translateX: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(30, { start: 100 }),
      duration: 350,
      easing: 'easeOutQuart'
    });
  }, [forecasts]);

  const coveredHours = new Set(forecasts.map((f) => f.hora));
  const missingHours = HOURS_LIST.filter((h) => !coveredHours.has(h));

  const openAddModal = (preHora?: string) => {
    setEditId(null);
    setForm({ ...blankForecastForm(), hora: preHora ?? HOURS_LIST[0] });
    setModalOpen(true);
  };

  const openEditModal = (f: Forecast) => {
    setEditId(f.id);
    setForm({ hora: f.hora, loteria: f.loteria, animal: f.animal, numero: f.numero });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  // ─── Upsert via RPC ────────────────────────────────────────────
  const saveModal = async () => {
    setIsSaving(true);
    try {
      const { data: result, error } = await supabase.rpc("upsert_pronostico", {
        p_hora: form.hora,
        p_loteria: form.loteria,
        p_animal: form.animal,
        p_numero: form.numero,
      });

      if (error) throw error;

      // Refresh list from server
      const { data: fresh, error: fetchErr } = await supabase
        .from("pronosticos")
        .select("*")
        .order("created_at", { ascending: true });

      if (fetchErr) throw fetchErr;

      const mapped: Forecast[] = (fresh ?? []).map((row: any) => ({
        id: row.id,
        hora: row.hora,
        loteria: row.loteria,
        animal: row.animal,
        numero: row.numero,
      }));
      mapped.sort((a, b) => HOURS_LIST.indexOf(a.hora) - HOURS_LIST.indexOf(b.hora));
      setForecasts(mapped);

      const isEdit = editId !== null || forecasts.some(f => f.hora === form.hora);
      sileo.success({
        title: isEdit ? "Pronóstico Actualizado" : "Pronóstico Creado",
        description: isEdit ? "Se ha modificado correctamente." : "Se ha añadido el nuevo pronóstico exitosamente.",
        duration: 2000
      });
      closeModal();
    } catch (err) {
      console.error("Error saving pronostico:", err);
      sileo.error({ title: "Error", description: "No se pudo guardar el pronóstico.", duration: 2000 });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete via RPC ─────────────────────────────────────────────
  const deleteForecast = async (id: number) => {
    try {
      const { error } = await supabase.rpc("delete_pronostico", { p_id: id });
      if (error) throw error;
      setForecasts((prev) => prev.filter((f) => f.id !== id));
      sileo.success({ title: "Pronóstico Eliminado", description: "El registro ha sido removido del sistema.", duration: 2000 });
    } catch (err) {
      console.error("Error deleting pronostico:", err);
      sileo.error({ title: "Error", description: "No se pudo eliminar el pronóstico.", duration: 2000 });
    }
  };

  const getEmoji = (animalName: string) =>
    ANIMALS.find((a) => a.name === animalName)?.emoji ?? "🐾";

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Control de Pronósticos</h2>
          <p className="text-sm text-gray-500">Administra los pronósticos y horas pendientes</p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar Pronóstico
        </button>
      </div>

      {/* ── Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {editId !== null ? "Editar Pronóstico" : "Nuevo Pronóstico"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {editId !== null
                ? "Modifica los datos del pronóstico seleccionado."
                : "Selecciona el horario y el animal para el nuevo pronóstico."}
            </p>

            <div className="space-y-4">
              {/* Horario */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Horario
                </label>
                <select
                  value={form.hora}
                  disabled={editId !== null}
                  onChange={(e) => setForm((d) => ({ ...d, hora: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {HOURS_LIST.map((h) => {
                    const isCovered = coveredHours.has(h);
                    return (
                      <option
                        key={h}
                        value={h}
                        className={isCovered ? "text-gray-400 font-medium bg-gray-50" : "text-gray-900"}
                      >
                        {h} {isCovered ? "(Ocupado)" : ""}
                      </option>
                    );
                  })}
                </select>
                {editId === null && coveredHours.has(form.hora) && (
                  <p className="text-xs text-amber-500 mt-1">
                    ⚠ Este horario ya tiene un pronóstico — se sobreescribirá.
                  </p>
                )}
              </div>

              {/* Animal */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Animal
                </label>
                <select
                  value={form.animal}
                  onChange={(e) => {
                    const selAnimal = ANIMALS.find(a => a.name === e.target.value);
                    setForm((d) => ({
                      ...d,
                      animal: e.target.value,
                      numero: parseInt(selAnimal?.number ?? "0", 10)
                    }));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {ANIMALS.map((a) => (
                    <option key={a.name} value={a.name}>{a.emoji} {a.name}</option>
                  ))}
                </select>
                {/* Preview */}
                <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-xl shadow-sm">
                    {getEmoji(form.animal)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{form.animal}</p>
                    <p className="text-xs text-gray-400">Vista previa del animal</p>
                  </div>
                </div>
              </div>

              {/* Número Automático (Solo Vista) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Número
                </label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500 font-mono font-bold">
                  {String(form.numero).padStart(2, "0")}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveModal}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  editId !== null ? "Guardar cambios" : "Agregar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de pronósticos */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#1f5650] rounded-t-2xl">
            <h3 className="font-semibold text-white text-sm">Pronósticos Asignados</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium">
              <span>{forecasts.length} registrados</span>
              <CircleCheckBig className="h-3.5 w-3.5" />
            </div>
          </div>

          {forecasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Radio className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No hay pronósticos</p>
              <p className="text-xs text-gray-400 mt-1">Agrega pronósticos usando el botón de arriba.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {forecasts.map((f) => (
                <div
                  key={f.id}
                  className="pronostico-item opacity-0 flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Emoji avatar */}
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-2xl border border-gray-200 shadow-sm">
                    {getEmoji(f.animal)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{f.animal}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span className="font-mono">{f.hora}</span>
                      <span className="mx-1.5 text-gray-200">·</span>
                      <span className="text-gray-500">{f.loteria}</span>
                    </p>
                    <p className="text-xs mt-1">
                      <span className="text-gray-400">Nro:</span>{" "}
                      <span className="font-bold text-blue-600">
                        {String(f.numero).padStart(2, "0")}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteForecast(f.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card derecha (Horas sin cubrir) */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-3.5 bg-rose-500 rounded-t-2xl">
              <h3 className="font-semibold text-white text-sm">Horarios Vacíos</h3>
              <Clock className="h-4 w-4 text-rose-100" />
            </div>
            <div className="p-5 overflow-y-auto max-h-[500px]">
              {missingHours.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-4">
                    Faltan pronósticos para las siguientes tandas horarias:
                  </p>
                  {missingHours.map((h, i) => (
                    <div
                      key={i}
                      className="horario-item opacity-0 flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 group hover:border-rose-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-400 group-hover:bg-rose-500 transition-colors" />
                        <span className="text-sm font-mono text-gray-700 font-medium">{h}</span>
                      </div>
                      <button
                        onClick={() => openAddModal(h)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
                      >
                        Añadir
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                    <Save className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">¡Todo cubierto!</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                    Todas las horas del día tienen su pronóstico asignado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ════════════════════════════════════════════════════════════════
   Sección 3 – Sorteos CRUD
══════════════════════════════════════════════════════════════════ */
const blankSorteoForm = () => ({
  animal: ANIMALS[0].name,
  number: parseInt(ANIMALS[0].number ?? "0", 10),
  hour: HOURS_LIST[0],
  date: new Date().toISOString().split("T")[0],
  emoji: ANIMALS[0].emoji,
});

const SectionSorteos = () => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(blankSorteoForm());
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Helpers ────────────────────────────────────────────────────
  const mapRow = (row: any): LotteryResult => ({
    id: row.id,
    animal: row.animal,
    number: row.numero,
    hour: row.hora,
    date: row.fecha,
    emoji: row.emoji,
  });

  const refreshSorteos = async () => {
    const { data, error } = await supabase
      .from("sorteos")
      .select("*")
      .order("fecha", { ascending: false })
      .order("hora", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  };

  // ─── Fetch on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchSorteos = async () => {
      try {
        const data = await refreshSorteos();
        setResults(data);
      } catch (err) {
        console.error("Error fetching sorteos:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSorteos();
  }, []);

  useEffect(() => {
    if (!containerRef.current || results.length === 0) return;

    anime({
      targets: '.sorteo-item',
      translateX: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(40, { start: 50 }),
      duration: 400,
      easing: 'easeOutQuart'
    });

    anime({
      targets: '.panel-item',
      translateX: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(30, { start: 100 }),
      duration: 350,
      easing: 'easeOutQuart'
    });
  }, [results, search]);

  // Date panel
  const availableDates = Array.from(new Set(results.map((r) => r.date))).sort(
    (a, b) => b.localeCompare(a)
  );
  const [panelDate, setPanelDate] = useState(() =>
    availableDates[0] ?? new Date().toISOString().split("T")[0]
  );

  const filtered = results.filter(
    (r) =>
      r.animal.toLowerCase().includes(search.toLowerCase()) ||
      r.date.includes(search) ||
      String(r.number).includes(search)
  );

  const hoursCoveredForDate = new Set(
    results.filter((r) => r.date === panelDate).map((r) => r.hour)
  );

  const openAddModal = (preHour?: string) => {
    setEditId(null);
    setForm({ ...blankSorteoForm(), hour: preHour ?? HOURS_LIST[0] });
    setModalOpen(true);
  };

  const openEditModal = (r: LotteryResult) => {
    setEditId(r.id);
    setForm({
      animal: r.animal,
      number: r.number,
      hour: r.hour,
      date: r.date,
      emoji: r.emoji,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  // ─── Save (create or update) via RPC ────────────────────────────
  const saveModal = async () => {
    setIsSaving(true);
    try {
      if (editId !== null) {
        // UPDATE existing
        const { error } = await supabase.rpc("update_sorteo", {
          p_id: editId,
          p_animal: form.animal,
          p_numero: form.number,
          p_hora: form.hour,
          p_fecha: form.date,
          p_emoji: form.emoji,
        });
        if (error) throw error;
        sileo.success({ title: "Sorteo Actualizado", description: "El resultado del sorteo ha sido modificado.", duration: 2000 });
      } else {
        // INSERT (upsert by fecha+hora)
        const { error } = await supabase.rpc("upsert_sorteo", {
          p_animal: form.animal,
          p_numero: form.number,
          p_hora: form.hour,
          p_fecha: form.date,
          p_emoji: form.emoji,
        });
        if (error) throw error;
        if (!availableDates.includes(form.date)) setPanelDate(form.date);
        sileo.success({ title: "Sorteo Registrado", description: "El nuevo resultado del sorteo ha sido guardado.", duration: 2000 });
      }

      // Refresh from DB
      const fresh = await refreshSorteos();
      setResults(fresh);
      closeModal();
    } catch (err) {
      console.error("Error saving sorteo:", err);
      sileo.error({ title: "Error", description: "No se pudo guardar el sorteo.", duration: 2000 });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete via RPC ──────────────────────────────────────────────
  const deleteRow = async (id: number) => {
    try {
      const { error } = await supabase.rpc("delete_sorteo", { p_id: id });
      if (error) throw error;
      setResults((prev) => prev.filter((r) => r.id !== id));
      sileo.success({ title: "Sorteo Eliminado", description: "El registro del sorteo ha sido removido.", duration: 2000 });
    } catch (err) {
      console.error("Error deleting sorteo:", err);
      sileo.error({ title: "Error", description: "No se pudo eliminar el sorteo.", duration: 2000 });
    }
  };

  const updateFormAnimal = (name: string) => {
    const a = ANIMALS.find((x) => x.name === name);
    setForm((d) => ({
      ...d,
      animal: name,
      emoji: a?.emoji ?? "🐾",
      number: parseInt(a?.number ?? "0", 10),
    }));
  };

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestión de Sorteos</h2>
          <p className="text-sm text-gray-500">Crea, edita y elimina resultados de sorteos</p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo sorteo
        </button>
      </div>

      {/* ── Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {editId !== null ? "Editar Sorteo" : "Nuevo Sorteo"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {editId !== null ? "Modifica los datos del sorteo." : "Registra un nuevo resultado de sorteo."}
            </p>

            <div className="space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((d) => ({ ...d, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Horario</label>
                <select
                  value={form.hour}
                  onChange={(e) => setForm((d) => ({ ...d, hour: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {HOURS_LIST.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Animal */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Animal</label>
                <select
                  value={form.animal}
                  onChange={(e) => updateFormAnimal(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {ANIMALS.map((a) => (
                    <option key={a.name} value={a.name}>{a.emoji} {a.name}</option>
                  ))}
                </select>
                {/* Preview */}
                <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-xl shadow-sm">
                    {form.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{form.animal}</p>
                    <p className="text-xs text-gray-400">Nro: <span className="font-bold text-blue-600">{String(form.number).padStart(2, "0")}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={saveModal} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                {editId !== null ? "Guardar cambios" : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por animal, fecha o número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de sorteos */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#1f5650] rounded-t-2xl">
            <h3 className="font-semibold text-white text-sm">Sorteos Registrados</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium">
              <span>{filtered.length} registrados</span>
              <CircleCheckBig className="h-3.5 w-3.5" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Radio className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">Sin resultados</p>
              <p className="text-xs text-gray-400 mt-1">No hay sorteos que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="sorteo-item opacity-0 flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Emoji avatar */}
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-2xl border border-gray-200 shadow-sm">
                    {r.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.animal}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span className="font-mono">{r.date}</span>
                      <span className="mx-1.5 text-gray-200">·</span>
                      <span className="font-mono">{r.hour}</span>
                    </p>
                    <p className="text-xs mt-1">
                      <span className="text-gray-400">Nro:</span>{" "}
                      <span className="font-bold text-blue-600">
                        {String(r.number).padStart(2, "0")}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteRow(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho – Horarios por fecha */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#1f5650] rounded-t-2xl">
              <h3 className="font-semibold text-white text-sm">Horarios del Día</h3>
              <Clock className="h-4 w-4 text-emerald-200" />
            </div>

            {/* Date selector */}
            <div className="px-4 pt-4 pb-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Fecha</label>
              <input
                type="date"
                value={panelDate}
                onChange={(e) => setPanelDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-4 space-y-2 overflow-y-auto max-h-[420px]">
              {HOURS_LIST.map((h) => {
                const covered = hoursCoveredForDate.has(h);
                const entry = results.find((r) => r.date === panelDate && r.hour === h);
                return (
                  <div
                    key={h}
                    className={`panel-item opacity-0 flex items-center justify-between p-3 rounded-lg border transition-colors ${covered
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-100 bg-gray-50 hover:border-blue-200"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${covered ? "bg-emerald-400" : "bg-gray-300"
                          }`}
                      />
                      <div>
                        <p className="text-xs font-mono font-medium text-gray-700">{h}</p>
                        {covered && entry && (
                          <p className="text-xs text-emerald-600 font-medium truncate max-w-[120px]">
                            {entry.emoji} {entry.animal} · <span className="font-bold">{String(entry.number).padStart(2, "0")}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {covered ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                        ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => openAddModal(h)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Añadir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ════════════════════════════════════════════════════════════════
   Sección 4 – Historial
══════════════════════════════════════════════════════════════════ */
const SectionHistorial = () => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSorteos = async () => {
      try {
        const { data, error } = await supabase
          .from("sorteos")
          .select("*")
          .order("fecha", { ascending: false })
          .order("hora", { ascending: true });

        if (error) throw error;

        const mapped: LotteryResult[] = (data ?? []).map((row: any) => ({
          id: row.id,
          animal: row.animal,
          number: row.numero,
          hour: row.hora,
          date: row.fecha,
          emoji: row.emoji,
        }));
        setResults(mapped);
      } catch (err) {
        console.error("Error fetching historial:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSorteos();
  }, []);

  useEffect(() => {
    if (!containerRef.current || results.length === 0) return;
    anime({
      targets: '.historial-row',
      translateY: [15, 0],
      opacity: [0, 1],
      delay: anime.stagger(30, { start: 50 }),
      duration: 350,
      easing: 'easeOutQuart'
    });
  }, [results]);

  // Obtener las últimas 5 fechas únicas, ordenadas descendentemente
  const uniqueDates = Array.from(new Set(results.map((r) => r.date))).sort(
    (a, b) => b.localeCompare(a)
  );
  const displayDates = uniqueDates.slice(0, 5);

  const getDayLabel = (dateString: string) => {
    const [y, m, d] = dateString.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return {
      name: dias[dateObj.getDay()],
      ym: `${y}-${String(m).padStart(2, "0")}`,
      md: `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    };
  };

  const borderColors = [
    "border-blue-500",
    "border-red-500",
    "border-yellow-500",
    "border-emerald-500",
    "border-purple-500",
    "border-pink-500",
    "border-cyan-500",
    "border-orange-500",
  ];

  // Color seudo-aleatorio consistente
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return borderColors[hash % borderColors.length];
  };

  const bgColors = ["bg-[#22675e]", "bg-[#297b70]", "bg-[#2f8f82]", "bg-[#35a394]", "bg-[#3bb7a6]"];

  return (
    <div ref={containerRef} className="flex-1 w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Historial de Sorteos</h2>
        <p className="text-sm text-gray-500">Consulta el registro completo de todos los sorteos en vista de cuadrícula</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-max">
            <thead>
              <tr>
                <th className="bg-[#1f5650] text-white px-6 py-4 font-semibold text-left border-b border-[#1f5650] whitespace-nowrap align-middle">
                  Horario
                </th>
                {displayDates.map((date, idx) => {
                  const label = getDayLabel(date);
                  const bgColor = bgColors[idx % bgColors.length];
                  return (
                    <th key={date} className={`${bgColor} text-white px-4 py-3 font-medium text-center border-l border-white/20 align-middle`}>
                      <div className="flex flex-col items-center justify-center leading-tight">
                        <span className="text-sm">{label.name}</span>
                        <span className="text-xs text-white/90">{label.ym}</span>
                        <span className="text-xs mt-0.5 font-bold">{label.md}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS_LIST.map((hour) => (
                <tr key={hour} className="historial-row opacity-0 hover:bg-gray-50/50 group">
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600 border border-gray-100 bg-gray-50/30 whitespace-nowrap">
                    {hour}
                  </td>
                  {displayDates.map((date) => {
                    const result = results.find((r) => r.date === date && r.hour === hour);
                    return (
                      <td key={date} className="p-3 border border-gray-100 text-center bg-white group-hover:bg-gray-50/50 transition-colors">
                        {result ? (
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <div
                              className={`w-10 h-10 flex items-center justify-center rounded-full border-[2px] ${getColor(
                                result.animal
                              )} bg-white shadow-sm`}
                            >
                              <span className="text-xl leading-none">{result.emoji}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-600 capitalize">
                              {result.animal}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   Shell principal
══════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  useEffect(() => {
    if (!sessionStorage.getItem("adminAuth")) {
      navigate("/");
    }
  }, [navigate]);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <SectionDashboard />;
      case "piramide": return <SectionPiramide />;
      case "pronosticos": return <SectionPronosticos />;
      case "sorteos": return <SectionSorteos />;
      case "historial": return <SectionHistorial />;
    }
  };

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.5,
      popoverClass: "admin-tour-popover",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Entendido!",
      progressText: "{{current}} de {{total}}",
      steps: [
        {
          element: "#tour-dashboard",
          popover: {
            title: "🏠 Dashboard",
            description: "Vista general del panel: estadísticas clave, últimos resultados y actividad reciente del sistema.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-piramide",
          popover: {
            title: "🔺 La Pirámide",
            description: "Edita los dígitos de la pirámide invertida. Haz clic en 'Editar pirámide' para modificar cada celda y guarda los cambios con Supabase.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-pronosticos",
          popover: {
            title: "📡 Control de Pronósticos",
            description: "Administra los pronósticos por hora. Agrega, edita o elimina las predicciones de cada franja horaria.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-sorteos",
          popover: {
            title: "🏆 Sorteos",
            description: "Registra y gestiona los resultados de cada sorteo. Puedes agregar nuevos resultados o editar los existentes.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-historial",
          popover: {
            title: "📋 Historial",
            description: "Consulta el registro completo de todos los sorteos en formato de cuadrícula por fecha y hora.",
            side: "right",
            align: "start",
          },
        },
      ],
    });
    driverObj.drive();
  }, []);

  return (
    <>
      {/* Estilos personalizados del tour */}
      <style>{`
        .admin-tour-popover {
          background: #ffffff !important;
          border-radius: 14px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18) !important;
          border: 1px solid #e2e8f0 !important;
          font-family: inherit !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        .admin-tour-popover .driver-popover-title {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          padding: 18px 20px 0 20px !important;
          margin: 0 !important;
        }
        .admin-tour-popover .driver-popover-description {
          font-size: 13px !important;
          color: #475569 !important;
          line-height: 1.6 !important;
          padding: 8px 20px 0 20px !important;
          margin: 0 !important;
        }
        .admin-tour-popover .driver-popover-progress-text {
          font-size: 11px !important;
          color: #94a3b8 !important;
          font-weight: 500 !important;
        }
        .admin-tour-popover .driver-popover-footer {
          padding: 14px 20px !important;
          background: #f8fafc !important;
          border-top: 1px solid #f1f5f9 !important;
          margin-top: 14px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .admin-tour-popover .driver-popover-prev-btn,
        .admin-tour-popover .driver-popover-next-btn,
        .admin-tour-popover .driver-popover-close-btn {
          border-radius: 8px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 7px 14px !important;
          transition: all 0.2s !important;
          border: none !important;
          cursor: pointer !important;
        }
        .admin-tour-popover .driver-popover-next-btn {
          background: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 2px 8px rgba(37,99,235,0.35) !important;
        }
        .admin-tour-popover .driver-popover-next-btn:hover {
          background: #1d4ed8 !important;
        }
        .admin-tour-popover .driver-popover-prev-btn {
          background: #ffffff !important;
          color: #475569 !important;
          border: 1px solid #e2e8f0 !important;
        }
        .admin-tour-popover .driver-popover-prev-btn:hover {
          background: #f1f5f9 !important;
        }
        .admin-tour-popover .driver-popover-close-btn {
          background: transparent !important;
          color: #94a3b8 !important;
          padding: 4px 8px !important;
        }
        .admin-tour-popover .driver-popover-close-btn:hover {
          color: #475569 !important;
        }
        .driver-overlay {
          background: rgba(0,0,0,0.5) !important;
        }
      `}</style>

      <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside className="w-56 flex-shrink-0 flex flex-col bg-[#1a1f37] text-white">
          {/* Logo + Tour button */}
          <div className="px-5 py-5 border-b border-white/10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Lotto <span className="text-blue-400">Azar</span>
                </span>
                <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-widest">
                  Admin Panel
                </p>
              </div>
              {/* Tour button */}
              <button
                id="tour-btn"
                onClick={startTour}
                title="Tour del panel"
                className="flex-shrink-0 mt-0.5 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
              >
                <span>🗺️</span>
                <span>Tour</span>
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <p className="px-5 text-[10px] text-white/30 uppercase tracking-widest mb-2">
              Módulos
            </p>
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                id={`tour-${id}`}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 w-full px-5 py-2.5 text-sm transition-colors ${
                  activeSection === id
                    ? "bg-blue-600 text-white font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {activeSection === id && (
                  <ChevronRight className="h-3 w-3 ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* User + logout */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                A
              </div>
              <div>
                <p className="text-xs font-medium text-white">Admin</p>
                <p className="text-[10px] text-white/40">whpj6436@gmail.com</p>
              </div>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("adminAuth");
                navigate("/");
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-8">
          {renderSection()}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
