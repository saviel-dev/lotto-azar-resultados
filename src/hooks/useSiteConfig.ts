/**
 * useSiteConfig — Lee y escribe claves en la tabla `site_config` de Supabase.
 *
 * Estrategia:
 *  - Al montar: lee el valor de la DB. Mientras carga, devuelve el valor de
 *    localStorage como fallback (evita flash de contenido por defecto).
 *  - Realtime: suscripción a cambios en site_config → actualiza en vivo en
 *    todos los navegadores/tabs sin necesidad de recargar la página.
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

  // Aplicar un valor recibido de la DB y sincronizar caché local
  const applyDbValue = useCallback((dbValue: string) => {
    setValue(dbValue);
    try { localStorage.setItem(lsKey, dbValue); } catch { /* ignorar */ }
  }, [lsKey]);

  // 1. Cargar valor inicial desde la DB al montar
  useEffect(() => {
    let cancelled = false;

    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from("site_config")
          .select("value")
          .eq("key", key)
          .single();

        if (cancelled) return;
        if (!error && data?.value) applyDbValue(data.value as string);
      } catch {
        // Tabla no disponible → seguir con localStorage/default
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchInitial();
    return () => { cancelled = true; };
  }, [key, applyDbValue]);

  // 2. Suscripción Realtime: recibe cambios de otros admins/tabs en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel(`site_config:${key}`)
      .on(
        "postgres_changes",
        {
          event: "*",           // INSERT, UPDATE, DELETE
          schema: "public",
          table: "site_config",
          filter: `key=eq.${key}`,
        },
        (payload) => {
          // payload.new contiene la fila actualizada
          const newRow = payload.new as { key: string; value: string } | null;
          if (newRow?.value !== undefined) {
            applyDbValue(newRow.value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [key, applyDbValue]);

  // 3. Guardar en DB + localStorage
  const save = useCallback(async (newValue: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_config")
        .upsert({ key, value: newValue, updated_at: new Date().toISOString() }, { onConflict: "key" });

      if (error) throw error;

      // El canal Realtime notificará a todos los tabs/browsers, pero
      // actualizamos localmente de inmediato para que el admin no espere
      applyDbValue(newValue);
    } catch (err) {
      // Si falla la DB, al menos aplicar localmente
      applyDbValue(newValue);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [key, applyDbValue]);

  return { value, isLoading, save, isSaving };
}
