import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient, checkSupabaseConnection, PerformanceData } from '../utils/supabase/client';
import { queueDataLocally, getOfflineSnapshot, saveOfflineSnapshot } from '../services/localStorageService';
import { startAutoSync, stopAutoSync, getSyncStatus, forceSyncNow } from '../services/syncService';

interface UsePerformanceDataOptions {
  autoSaveInterval?: number; // Intervallo di salvataggio automatico in ms (default: 30000 = 30s)
  enableAutoSync?: boolean; // Abilita sincronizzazione automatica (default: true)
  deviceId?: string; // ID univoco del dispositivo
  deviceName?: string; // Nome del dispositivo
}

interface UsePerformanceDataReturn {
  // Funzioni principali
  savePerformanceData: (data: Omit<PerformanceData, 'timestamp' | 'device_id' | 'device_name'>) => Promise<boolean>;
  fetchHistoricalData: (options?: FetchOptions) => Promise<PerformanceData[]>;
  
  // Stato
  isOnline: boolean;
  isSaving: boolean;
  lastSaveTime: Date | null;
  syncStatus: ReturnType<typeof getSyncStatus>;
  
  // Utility
  forceSync: () => Promise<void>;
  clearCache: () => void;
}

interface FetchOptions {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  deviceId?: string;
}

export const usePerformanceData = (options: UsePerformanceDataOptions = {}): UsePerformanceDataReturn => {
  const {
    autoSaveInterval = 30000,
    enableAutoSync = true,
    deviceId,
    deviceName,
  } = options;

  const [isOnline, setIsOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  
  const checkConnectionRef = useRef<number | null>(null);
  const supabase = getSupabaseClient();

  // Controlla la connessione a Supabase periodicamente
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsOnline(connected);
    };

    checkConnection();
    checkConnectionRef.current = window.setInterval(checkConnection, 30000); // Ogni 30s

    return () => {
      if (checkConnectionRef.current) {
        clearInterval(checkConnectionRef.current);
      }
    };
  }, []);

  // Avvia auto-sync se abilitato
  useEffect(() => {
    if (enableAutoSync) {
      startAutoSync();
    }

    return () => {
      stopAutoSync();
    };
  }, [enableAutoSync]);

  // Aggiorna sync status periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus());
    }, 5000); // Ogni 5s

    return () => clearInterval(interval);
  }, []);

  /**
   * Salva i dati delle prestazioni
   */
  const savePerformanceData = useCallback(
    async (data: Omit<PerformanceData, 'timestamp' | 'device_id' | 'device_name'>): Promise<boolean> => {
      setIsSaving(true);

      const performanceData: PerformanceData = {
        ...data,
        timestamp: new Date().toISOString(),
        device_id: deviceId,
        device_name: deviceName,
      };

      try {
        // Controlla se siamo online
        const connected = await checkSupabaseConnection();
        setIsOnline(connected);

        if (!connected) {
          // Salva in locale se offline
          console.log('📴 VERA: Offline - salvataggio in coda locale');
          queueDataLocally(performanceData);
          setLastSaveTime(new Date());
          setIsSaving(false);
          return true; // Ritorna true perché è salvato localmente
        }

        // Salva su Supabase
        const { error } = await supabase
          .from('performance_metrics')
          .insert([performanceData]);

        if (error) {
          console.error('❌ VERA: Errore salvataggio Supabase:', error);
          // Fallback a storage locale
          queueDataLocally(performanceData);
          setLastSaveTime(new Date());
          setIsSaving(false);
          return false;
        }

        console.log('✅ VERA: Dati salvati su Supabase');
        setLastSaveTime(new Date());
        setIsSaving(false);
        return true;
      } catch (error) {
        console.error('❌ VERA: Errore salvataggio:', error);
        // Fallback a storage locale
        queueDataLocally(performanceData);
        setLastSaveTime(new Date());
        setIsSaving(false);
        return false;
      }
    },
    [deviceId, deviceName, supabase]
  );

  /**
   * Recupera dati storici
   */
  const fetchHistoricalData = useCallback(
    async (fetchOptions: FetchOptions = {}): Promise<PerformanceData[]> => {
      const { limit = 100, startDate, endDate, deviceId: filterDeviceId } = fetchOptions;

      try {
        // Controlla connessione
        const connected = await checkSupabaseConnection();
        setIsOnline(connected);

        if (!connected) {
          console.log('📴 VERA: Offline - usando snapshot locale');
          return getOfflineSnapshot();
        }

        // Query Supabase
        let query = supabase
          .from('performance_metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limit);

        // Filtri opzionali
        if (filterDeviceId) {
          query = query.eq('device_id', filterDeviceId);
        }

        if (startDate) {
          query = query.gte('timestamp', startDate.toISOString());
        }

        if (endDate) {
          query = query.lte('timestamp', endDate.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ VERA: Errore fetch storico:', error);
          return getOfflineSnapshot();
        }

        // Salva snapshot per uso offline
        if (data && data.length > 0) {
          saveOfflineSnapshot(data);
        }

        return data || [];
      } catch (error) {
        console.error('❌ VERA: Errore fetch storico:', error);
        return getOfflineSnapshot();
      }
    },
    [supabase]
  );

  /**
   * Forza sincronizzazione immediata
   */
  const forceSync = useCallback(async () => {
    await forceSyncNow();
    setSyncStatus(getSyncStatus());
  }, []);

  /**
   * Pulisce cache locale
   */
  const clearCache = useCallback(() => {
    localStorage.removeItem('vera_offline_snapshot');
    console.log('🗑️ VERA: Cache locale pulita');
  }, []);

  return {
    savePerformanceData,
    fetchHistoricalData,
    isOnline,
    isSaving,
    lastSaveTime,
    syncStatus,
    forceSync,
    clearCache,
  };
};

/**
 * Hook semplificato per salvataggio automatico periodico
 */
export const useAutoSavePerformance = (
  getCurrentData: () => Omit<PerformanceData, 'timestamp' | 'device_id' | 'device_name'>,
  interval: number = 30000,
  options: UsePerformanceDataOptions = {}
) => {
  const { savePerformanceData, ...rest } = usePerformanceData(options);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const autoSave = async () => {
      const data = getCurrentData();
      await savePerformanceData(data);
    };

    // Salva immediatamente
    autoSave();

    // Poi periodicamente
    intervalRef.current = window.setInterval(autoSave, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [getCurrentData, savePerformanceData, interval]);

  return { savePerformanceData, ...rest };
};
