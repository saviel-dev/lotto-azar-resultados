/**
 * useSiteConfig — Lee y escribe claves en la tabla `site_config` de Supabase.
 *
 * Estrategia:
 *  - Al montar: lee el valor de la DB. Mientras carga, devuelve el valor de
 *    localStorage como fallback (evita flash de contenido por defecto).
 *  - Al guardar: escribe en DB y actualiza localStorage como caché local.
 *  - Si la tabla no existe o falla, opera solo con localStorage silenciosamente.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const LS_PREFIX = "lotto_siteconfig_";

export interface UseSiteConfigResult {
  value: string;
  isLoading: boolean;
  save: (newValue: string) => Promise<void>;
  isSaving: boolean;
}

export function useSiteConfig(key: string, defaultValue: string): UseSiteConfigResult {
  const lsKey = LS_PREFIX + key;

  // Inicializar desde localStorage para evitar flash
  const [value, setValue] = useState<string>(
    () => localStorage.getItem(lsKey) ?? defaultValue
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar valor real desde la DB al montar
  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("site_config")
          .select("value")
          .eq("key", key)
          .single();

        if (cancelled) return;

        if (!error && data?.value) {
          const dbValue = data.value as string;
          setValue(dbValue);
          // Sincronizar caché local
          try { localStorage.setItem(lsKey, dbValue); } catch { /* ignorar */ }
        }
      } catch {
        // Tabla no disponible → seguir con localStorage/default
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [key, lsKey]);

  // Guardar en DB + localStorage
  const save = useCallback(async (newValue: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_config")
        .upsert({ key, value: newValue, updated_at: new Date().toISOString() }, { onConflict: "key" });

      if (error) throw error;

      setValue(newValue);
      try { localStorage.setItem(lsKey, newValue); } catch { /* ignorar */ }
    } catch (err) {
      // Si falla la DB, al menos guardar en localStorage
      setValue(newValue);
      try { localStorage.setItem(lsKey, newValue); } catch { /* ignorar */ }
      throw err; // re-lanzar para que el caller pueda mostrar el error
    } finally {
      setIsSaving(false);
    }
  }, [key, lsKey]);

  return { value, isLoading, save, isSaving };
}
