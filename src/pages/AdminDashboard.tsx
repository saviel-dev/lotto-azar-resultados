import { useNavigate } from "react-router-dom";
import { formatAnimalNumber } from "@/lib/utils";
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
  Bell,
  Clock,
  CircleCheckBig,
  Menu,
  Map,
  Settings,
  Sliders,
  Cpu,
  Hand,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  ANIMALS,
  ANIMAL_WEIGHTS,
  HOURS_LIST,
  generateResults,
  type LotteryResult,
} from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { LS_WEIGHTS_KEY, type SorteoMode } from "@/hooks/useProyeccion";

/* ── helpers ────────────────────────────────────────────────────── */
const ALL_ANIMALS = ANIMALS.map((a) => a.name);

const LOTTERY_NAMES = ["Ardilla", "León", "Camello", "Vaca"];

type Section = "dashboard" | "configuracion" | "pronosticos" | "sorteos" | "historial";

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
  { id: "pronosticos", icon: Radio, label: "Control de Pronósticos" },
  { id: "sorteos", icon: Trophy, label: "Sorteos" },
  { id: "historial", icon: History, label: "Historial" },
  { id: "configuracion", icon: Settings, label: "Configuración" },
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
  const [stats, setStats] = useState({
    totalResults: 0,
    todayResults: 0,
    latest: [] as any[],
    isLoading: true
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { count: totalCount } = await supabase
          .from("sorteos")
          .select("*", { count: "exact", head: true });

        const { data: latestData } = await supabase
          .from("sorteos")
          .select("*")
          .order("fecha", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(6);

        const mDate = new Date();
        const year = mDate.getFullYear();
        const month = String(mDate.getMonth() + 1).padStart(2, "0");
        const day = String(mDate.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        const { count: todayCount } = await supabase
          .from("sorteos")
          .select("*", { count: "exact", head: true })
          .eq("fecha", todayStr);

        setStats({
          totalResults: totalCount || 0,
          todayResults: todayCount || 0,
          latest: latestData || [],
          isLoading: false
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!containerRef.current || stats.isLoading) return;

    anime({
      targets: '.stat-card',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(50),
      duration: 400,
      easing: 'easeOutQuad'
    });

    anime({
      targets: '.dashboard-list-item',
      translateX: [-15, 0],
      opacity: [0, 1],
      delay: anime.stagger(40, { start: 200 }),
      duration: 400,
      easing: 'easeOutSine'
    });
  }, [stats.isLoading]);

  const vals = [
    { label: "Resultados Registrados", value: stats.totalResults.toString(), sub: `${stats.todayResults} hoy` },
    { label: "Animales en Sistema", value: ANIMALS.length.toString(), sub: "catálogo completo" },
    { label: "Franjas Horarias", value: HOURS_LIST.length.toString(), sub: "sorteos por día" },
    { label: "Pronósticos Hoy", value: "—", sub: "ver módulo pronósticos" },
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
            <h3 className="stat-value text-3xl font-extrabold text-blue-600 z-10 tracking-tight" data-value={vals[0].value}>
              {vals[0].value}
            </h3>
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
            <h3 className="stat-value text-3xl font-extrabold text-orange-600 z-10 tracking-tight" data-value={vals[1].value}>
              {vals[1].value}
            </h3>
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
            <h3 className="stat-value text-3xl font-extrabold text-[#47a84e] z-10 tracking-tight" data-value={vals[2].value}>
              {vals[2].value}
            </h3>
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
            <h3 className="stat-value text-3xl font-extrabold text-[#f39c12] z-10 tracking-tight" data-value={vals[3].value}>
              {vals[3].value}
            </h3>
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
            <span className="text-xs text-blue-100 font-medium">{stats.latest.length} registros</span>
          </div>
          <div className="overflow-x-auto relative">
            {stats.isLoading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex flex-col justify-center items-center backdrop-blur-[1px]">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
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
                {stats.latest.map((r) => (
                  <tr key={r.id} className="dashboard-list-item opacity-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{r.fecha}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{r.hora}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{r.emoji} {r.animal}</td>
                    <td className="px-5 py-3 font-bold text-blue-600">{formatAnimalNumber(r.animal, r.numero)}</td>
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
   Sección: Configuración de Apuestas
══════════════════════════════════════════════════════════════════ */
interface BetConfig {
  id: number;
  monto_minimo: number;
  monto_maximo: number;
  multiplicador_normal: number;
  multiplicador_comodin: number;
}

const DEFAULT_CONFIG: BetConfig = {
  id: 1,
  monto_minimo: 1,
  monto_maximo: 10000,
  multiplicador_normal: 70,
  multiplicador_comodin: 140,
};

const SectionConfiguracion = () => {
  const [config, setConfig] = useState<BetConfig>(DEFAULT_CONFIG);
  const [form, setForm] = useState<BetConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("bet_config")
          .select("*")
          .eq("id", 1)
          .single();

        if (!error && data) {
          setConfig(data);
          setForm(data);
        }
      } catch (err) {
        console.warn("bet_config table not found, using defaults:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (field: keyof BetConfig, value: string) => {
    if (value === "") {
      setForm((prev) => ({ ...prev, [field]: "" as unknown as number }));
      setIsDirty(true);
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    setForm(prev => ({ ...prev, [field]: num }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    // Validar campos vacíos
    if (Object.values(form).some(v => v === "")) {
      sileo.error({ title: "Error de validación", description: "Ningún campo puede estar vacío.", duration: 2000 });
      return;
    }

    if (form.monto_minimo >= form.monto_maximo) {
      sileo.error({ title: "Error de validación", description: "El monto mínimo debe ser menor al máximo.", duration: 2000 });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("bet_config")
        .upsert({
          id: 1,
          monto_minimo: form.monto_minimo,
          monto_maximo: form.monto_maximo,
          multiplicador_normal: form.multiplicador_normal,
          multiplicador_comodin: form.multiplicador_comodin,
        }, { onConflict: "id" });

      if (error) throw error;

      setConfig(form);
      setIsDirty(false);
      sileo.success({ title: "Configuración Guardada", description: "Los cambios se aplican en tiempo real al sitio público.", duration: 2000 });
    } catch (err) {
      console.error("Error saving bet_config:", err);
      sileo.error({ title: "Error", description: "No se pudo guardar la configuración.", duration: 2000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm(config);
    setIsDirty(false);
  };

  /* Inline editable number cell */
  const EditCell = ({
    value,
    onChange,
    color = "text-blue-600",
    prefix = "",
    suffix = " Bs",
    min = 1,
  }: {
    value: number | string;
    onChange: (v: string) => void;
    color?: string;
    prefix?: string;
    suffix?: string;
    min?: number;
  }) => (
    <div className="flex items-center justify-end gap-2">
      {prefix && <span className={`text-sm font-bold ${color}`}>{prefix}</span>}
      <Input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-32 h-11 text-right text-base font-black border-2 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 shadow-sm transition-colors ${color}`}
      />
      <span className={`text-sm font-bold ${color}`}>{suffix}</span>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Configuración de Apuestas</h2>
          <p className="text-sm text-gray-500">Edita los valores directamente en la tabla — haz clic en cualquier número para modificarlo</p>
        </div>
        {isDirty && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Cambios sin guardar
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-5 max-w-2xl">

          {/* Tabla de pagos — Jugada Normal */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 rounded-t-2xl">
              <span className="text-sm font-bold text-white">🎯 Jugada Normal</span>
              <span className="ml-auto text-[11px] text-blue-200 font-medium">Edita el valor en Bs</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo de apuesta</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago por Bs apostado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* ×1 — editable base */}
                <tr className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-5 py-4 font-medium text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">×1</span>
                      Exacta individual
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <EditCell
                      value={form.multiplicador_normal}
                      onChange={(v) => handleChange("multiplicador_normal", v)}
                      color="text-blue-600"
                    />
                  </td>
                </tr>
                {/* ×10 — calculado */}
                <tr className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">×10</span>
                      Por 10 unidades
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-black text-blue-600">
                      {(form.multiplicador_normal * 10).toLocaleString("es")} Bs
                    </span>
                    <span className="text-[10px] text-gray-400 block">calculado automático</span>
                  </td>
                </tr>
                {/* ×100 — calculado */}
                <tr className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">×100</span>
                      Por 100 unidades
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-black text-blue-600">
                      {(form.multiplicador_normal * 100).toLocaleString("es")} Bs
                    </span>
                    <span className="text-[10px] text-gray-400 block">calculado automático</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabla de pagos — Comodín */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-purple-600 rounded-t-2xl">
              <span className="text-sm font-bold text-white">🌟 Jugada Comodín</span>
              <span className="ml-auto text-[11px] text-purple-200 font-medium">Edita el valor en Bs</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo de apuesta</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago por Bs apostado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* ×1 — editable */}
                <tr className="hover:bg-purple-50/40 transition-colors group">
                  <td className="px-5 py-4 font-medium text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">×1</span>
                      Exacta comodín
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <EditCell
                      value={form.multiplicador_comodin}
                      onChange={(v) => handleChange("multiplicador_comodin", v)}
                      color="text-purple-600"
                    />
                  </td>
                </tr>
                {/* ×10 — calculado */}
                <tr className="hover:bg-purple-50/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">×10</span>
                      Por 10 unidades
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-black text-purple-600">
                      {(form.multiplicador_comodin * 10).toLocaleString("es")} Bs
                    </span>
                    <span className="text-[10px] text-gray-400 block">calculado automático</span>
                  </td>
                </tr>
                {/* ×100 — calculado */}
                <tr className="hover:bg-purple-50/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">×100</span>
                      Por 100 unidades
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-black text-purple-600">
                      {(form.multiplicador_comodin * 100).toLocaleString("es")} Bs
                    </span>
                    <span className="text-[10px] text-gray-400 block">calculado automático</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Rango de apuesta */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-[#1f5650] rounded-t-2xl">
              <span className="text-sm font-bold text-white">💰 Rango de Apuesta</span>
              <span className="ml-auto text-[11px] text-emerald-200 font-medium">Mínimo y máximo permitidos</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto Mínimo</label>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-gray-400">Bs</span>
                  <Input
                    type="number"
                    min={1}
                    value={form.monto_minimo}
                    onChange={(e) => handleChange("monto_minimo", e.target.value)}
                    className="flex-1 h-12 text-base font-black text-gray-800 border-2 border-slate-200 shadow-sm focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto Máximo</label>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-gray-400">Bs</span>
                  <Input
                    type="number"
                    min={form.monto_minimo + 1}
                    value={form.monto_maximo}
                    onChange={(e) => handleChange("monto_maximo", e.target.value)}
                    className="flex-1 h-12 text-base font-black text-gray-800 border-2 border-slate-200 shadow-sm focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones apuestas */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleReset}
              disabled={!isDirty || isSaving}
              className="flex-1 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Descartar cambios
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <><Save className="h-4 w-4" /> Guardar configuración</>
              )}
            </button>
          </div>

          {/* ── Configuración de Probabilidades de Sorteo ────── */}
          <SorteoConfigPanel />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   Sub-panel: Configuración de Probabilidades & Modo Sorteo
══════════════════════════════════════════════════════════════════ */

// Top-10 animales por peso por defecto para edición rápida
const TOP_EDITABLE_ANIMALS = Object.entries(ANIMAL_WEIGHTS)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([name]) => name);

const LS_MODE_KEY = "lotto_sorteo_mode";

const SorteoConfigPanel = () => {
  const [mode, setModeState] = useState<SorteoMode>(() => {
    return (localStorage.getItem(LS_MODE_KEY) as SorteoMode) ?? "auto";
  });

  const [weights, setWeights] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(LS_WEIGHTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, Math.max(10, v)]));
      }
    } catch {}
    return Object.fromEntries(Object.entries(ANIMAL_WEIGHTS).map(([k, v]) => [k, Math.max(10, v)]));
  });

  const [saved, setSaved] = useState(false);

  const handleModeChange = (newMode: SorteoMode) => {
    setModeState(newMode);
    localStorage.setItem(LS_MODE_KEY, newMode);
  };

  const handleWeightChange = (name: string, value: number) => {
    setWeights(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveWeights = () => {
    localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(weights));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    sileo.success({ title: "Probabilidades guardadas", description: "Los % de salida se actualizarán en el próximo sorteo.", duration: 2000 });
  };

  const handleResetWeights = () => {
    setWeights(Object.fromEntries(Object.entries(ANIMAL_WEIGHTS).map(([k, v]) => [k, Math.max(10, v)])));
    localStorage.removeItem(LS_WEIGHTS_KEY);
    sileo.success({ title: "Probabilidades restauradas", description: "Se han restablecido los valores por defecto.", duration: 2000 });
  };

  const animalData = (name: string) => ANIMALS.find(a => a.name === name) ?? { emoji: "🐾", name, number: "?" };
  const maxW = Math.max(...TOP_EDITABLE_ANIMALS.map(n => weights[n] ?? ANIMAL_WEIGHTS[n] ?? 10));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 bg-violet-600 rounded-t-2xl">
        <Sliders className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white">⚙️ Probabilidades de Sorteo</span>
        <span className="ml-auto text-[11px] text-violet-200 font-medium">Probabilidad por animal</span>
      </div>

      <div className="p-5 space-y-6">
        {/* Modo de sorteo */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Modo del Sorteo</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleModeChange("auto")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                mode === "auto"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "bg-white border-gray-200 text-gray-500 hover:border-emerald-400"
              }`}
            >
              <Cpu className="h-4 w-4" />
              Automático
            </button>
            <button
              onClick={() => handleModeChange("manual")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                mode === "manual"
                  ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-white border-gray-200 text-gray-500 hover:border-amber-400"
              }`}
            >
              <Hand className="h-4 w-4" />
              Manual
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {mode === "auto"
              ? "✅ La proyección actualiza automáticamente cada 4 horas."
              : "✋ La proyección solo cambia al presionar 'Iniciar sorteo' en el panel público."}
          </p>
        </div>

        {/* Sliders de Probabilidad – top 10 */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Probabilidad — Top 10</p>
          <p className="text-[11px] text-gray-400 mb-4">Valores más altos = más probable en la proyección. Escala libre, el sistema normaliza automáticamente.</p>
          <div className="space-y-4">
            {TOP_EDITABLE_ANIMALS.map(name => {
              const a = animalData(name);
              const w = Math.max(10, weights[name] ?? ANIMAL_WEIGHTS[name] ?? 10);
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center leading-none shrink-0">{a.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-violet-500 font-bold">Probabilidad:</span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={w}
                          onChange={e => handleWeightChange(name, Math.max(10, Math.min(100, parseInt(e.target.value) || 10)))}
                          className="w-14 h-6 text-xs text-center border border-gray-200 rounded-md font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-violet-400"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={w}
                      onChange={e => handleWeightChange(name, parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-full accent-violet-600 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleResetWeights}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Restaurar
          </button>
          <button
            onClick={handleSaveWeights}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-md ${
              saved
                ? "bg-emerald-600 text-white shadow-emerald-200"
                : "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200"
            }`}
          >
            <Save className="h-4 w-4" />
            {saved ? "¡Guardado!" : "Guardar probabilidades"}
          </button>
        </div>
      </div>
    </div>
  );
};


/* ════════════════════════════════════════════════════════════════
   Sección: Control de Pronósticos
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
                  {formatAnimalNumber(form.animal, form.numero)}
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
                        {formatAnimalNumber(f.animal, f.numero)}
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
  const [scannerInput, setScannerInput] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Fast Entry Scanner ──────────────────────────────────────────
  const handleScannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerInput.trim()) return;

    // Buscar el animal por número (soportando "0" o "00", "01" etc)
    const animalMatch = ANIMALS.find(
      (a) => String(a.number).padStart(2, "0") === scannerInput.trim().padStart(2, "0")
          || String(a.number) === scannerInput.trim()
    );

    if (!animalMatch) {
      sileo.error({ title: "No encontrado", description: "El número no corresponde a ningún animal.", duration: 2000 });
      setScannerInput("");
      return;
    }

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const hoursCoveredToday = new Set(results.filter(r => r.date === today).map(r => r.hour));
      
      let targetHour = HOURS_LIST[0];
      for (const h of HOURS_LIST) {
        if (!hoursCoveredToday.has(h)) {
          targetHour = h;
          break;
        }
      }

      const { error } = await supabase.rpc("upsert_sorteo", {
        p_animal: animalMatch.name,
        p_numero: parseInt(animalMatch.number || "0", 10),
        p_hora: targetHour,
        p_fecha: today,
        p_emoji: animalMatch.emoji,
      });

      if (error) throw error;
      
      sileo.success({ title: "¡Ganador Registrado!", description: `${animalMatch.emoji} ${animalMatch.name} (${targetHour})`, duration: 3000 });
      setScannerInput("");
      
      // Refresh
      const fresh = await refreshSorteos();
      setResults(fresh);
      
    } catch (err) {
      console.error("Error al registrar por escáner:", err);
      sileo.error({ title: "Error", description: "No se pudo registrar el resultado.", duration: 2000 });
    } finally {
      setIsSaving(false);
    }
  };

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
                    <p className="text-xs text-gray-400">Nro: <span className="font-bold text-blue-600">{formatAnimalNumber(form.animal, form.number)}</span></p>
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

      {/* ── Acciones Superiores (Buscar / Escanear) ────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        {/* Búsqueda normal */}
        <input
          type="text"
          placeholder="Buscar por animal, fecha o número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />

        {/* Módulo Escáner (Ingreso Rápido) */}
        <form onSubmit={handleScannerSubmit} className="flex-1 max-w-sm flex">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <input
              type="text"
              placeholder="Escáner/Número + Enter"
              title="Ingresa el número para lanzar el animal automáticamente a la ronda más cercana"
              value={scannerInput}
              onChange={(e) => setScannerInput(e.target.value)}
              disabled={isSaving}
              autoFocus
              className="w-full pl-9 pr-3 py-2 border-2 border-amber-300 rounded-lg text-sm font-bold text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 transition-colors placeholder:text-amber-600/50"
            />
          </div>
        </form>
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
                        {formatAnimalNumber(r.animal, r.number)}
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
                            {entry.emoji} {entry.animal} · <span className="font-bold">{formatAnimalNumber(entry.animal, entry.number)}</span>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("adminAuth")) {
      navigate("/");
    }
  }, [navigate]);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <SectionDashboard />;
      case "pronosticos": return <SectionPronosticos />;
      case "sorteos": return <SectionSorteos />;
      case "historial": return <SectionHistorial />;
      case "configuracion": return <SectionConfiguracion />;
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
        {
          element: "#tour-configuracion",
          popover: {
            title: "⚙️ Configuración",
            description: "Ajusta los montos mínimos y máximos de apuesta permitidos. Los cambios se reflejan en tiempo real en el sitio público.",
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

      <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans overflow-hidden relative">
        {/* ── Mobile Header ───────────────────────────────────── */}
        <div className="md:hidden flex items-center justify-between bg-[#1a1f37] px-5 py-4 text-white z-40 relative">
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Lotto <span className="text-blue-400">Azar</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={startTour}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Map className="h-4 w-4" />
              <span>Tour</span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ────────────────────────────── */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[68px] left-0 right-0 bg-[#1a1f37] z-50 border-t border-white/10 shadow-2xl flex flex-col h-[calc(100vh-68px)] animate-in slide-in-from-top-2 duration-200">
             <nav className="flex-1 py-4 overflow-y-auto">
                <p className="px-5 text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">Módulos</p>
                {navItems.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveSection(id); setIsMobileMenuOpen(false); }}
                    className={`flex items-center w-full px-5 py-3.5 text-base transition-colors ${
                      activeSection === id
                        ? "bg-blue-600/20 text-blue-400 font-semibold border-l-4 border-blue-500"
                        : "text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 mr-3 ${activeSection === id ? "text-blue-400" : "text-white/50"}`} />
                    {label}
                  </button>
                ))}
             </nav>
             <div className="p-5 border-t border-white/10 bg-[#121629]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Administrador</p>
                    <p className="text-xs text-white/40">whpj6436@gmail.com</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sessionStorage.removeItem("adminAuth");
                    navigate("/");
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
             </div>
          </div>
        )}

        {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
        <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-[#1a1f37] text-white z-30 shadow-xl overflow-hidden">
          {/* Logo + Tour button */}
          <div className="px-6 py-6 border-b border-white/10 relative">
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div>
                <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Lotto <span className="text-blue-400">Azar</span>
                </span>
                <p className="text-[11px] text-white/50 mt-1 uppercase tracking-widest font-semibold">
                  Panel de Control
                </p>
              </div>
              {/* Tour button */}
              <button
                id="tour-btn"
                onClick={startTour}
                title="Tour del panel"
                className="flex-shrink-0 mt-0.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md"
              >
                <Map className="h-4 w-4" />
                <span>Tour</span>
              </button>
            </div>
            {/* Soft glow effect for logo area */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
          </div>

          {/* Nav */}
          <nav className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <p className="px-6 text-[11px] text-white/40 uppercase tracking-widest mb-3 font-semibold">
              Módulos
            </p>
            <div className="space-y-1.5 px-4">
              {navItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  id={`tour-${id}`}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-3.5 w-full px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                    activeSection === id
                      ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-900/40"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${activeSection === id ? "text-white" : "text-white/50"}`} />
                  {label}
                  {activeSection === id && (
                    <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-70" />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* User + logout */}
          <div className="p-5 border-t border-white/10 bg-[#121629]">
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold shadow-md">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-[11px] text-white/40 truncate">whpj6436@gmail.com</p>
              </div>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("adminAuth");
                navigate("/");
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-white/70 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-gray-50 flex flex-col min-w-0">
          {renderSection()}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
