import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient, PerformanceData } from '../utils/supabase/client';

interface FetchOptions {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  deviceId?: string;
}

/**
 * Hook per salvare e recuperare dati performance con autenticazione
 */
export function usePerformanceDataAuth() {
  const { user, isAuthenticated } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = getSupabaseClient();

  /**
   * Salva dati performance con user_id e device_id
   */
  const savePerformanceData = useCallback(
    async (data: {
      device_id: string;
      cpu_usage: number;
      ram_usage: number;
      gpu_usage: number;
      disk_usage: number;
      disk_read_speed: number;
      disk_write_speed: number;
      network_download: number;
      network_upload: number;
      water_bottles_equivalent: number;
    }): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        console.error('❌ User non autenticato');
        return false;
      }

      setIsSaving(true);

      try {
        const performanceData = {
          ...data,
          user_id: user.id,
          timestamp: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('performance_data')
          .insert([performanceData]);

        if (error) {
          console.error('❌ Errore salvataggio:', error);
          setIsSaving(false);
          return false;
        }

        setIsSaving(false);
        return true;
      } catch (error) {
        console.error('❌ Errore salvataggio:', error);
        setIsSaving(false);
        return false;
      }
    },
    [isAuthenticated, user, supabase]
  );

  /**
   * Recupera dati storici con filtri
   */
  const fetchHistoricalData = useCallback(
    async (options: FetchOptions = {}): Promise<PerformanceData[]> => {
      if (!isAuthenticated || !user) {
        return [];
      }

      const { limit = 100, startDate, endDate, deviceId } = options;

      try {
        let query = supabase
          .from('performance_data')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (deviceId) {
          query = query.eq('device_id', deviceId);
        }

        if (startDate) {
          query = query.gte('timestamp', startDate.toISOString());
        }

        if (endDate) {
          query = query.lte('timestamp', endDate.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Errore fetch storico:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('❌ Errore fetch storico:', error);
        return [];
      }
    },
    [isAuthenticated, user, supabase]
  );

  /**
   * Ottieni statistiche aggregate per dispositivo
   */
  const getDeviceStats = useCallback(
    async (deviceId: string, hours: number = 24) => {
      if (!isAuthenticated || !user) {
        return null;
      }

      try {
        const { data, error } = await supabase.rpc('get_device_stats', {
          p_user_id: user.id,
          p_device_id: deviceId,
          p_start_time: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
          p_end_time: new Date().toISOString(),
        });

        if (error) {
          console.error('❌ Errore statistiche:', error);
          return null;
        }

        return data?.[0] || null;
      } catch (error) {
        console.error('❌ Errore statistiche:', error);
        return null;
      }
    },
    [isAuthenticated, user, supabase]
  );

  /**
   * Ottieni dati aggregati per ora
   */
  const getHourlyData = useCallback(
    async (deviceId: string, hours: number = 24) => {
      if (!isAuthenticated || !user) {
        return [];
      }

      try {
        const { data, error } = await supabase.rpc('get_hourly_device_performance', {
          p_user_id: user.id,
          p_device_id: deviceId,
          p_hours: hours,
        });

        if (error) {
          console.error('❌ Errore dati orari:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('❌ Errore dati orari:', error);
        return [];
      }
    },
    [isAuthenticated, user, supabase]
  );

  return {
    savePerformanceData,
    fetchHistoricalData,
    getDeviceStats,
    getHourlyData,
    isOnline,
    isSaving,
  };
}
