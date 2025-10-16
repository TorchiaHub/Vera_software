import { useState, useCallback, useRef, useEffect } from 'react';
import { useInterval } from './useInterval';
import { useCircularBuffer, DataPoint } from './useCircularBuffer';
import { 
  validatePerformanceData, 
  detectAnomalies, 
  calculateWaterBottles,
  sanitizeData,
  RawPerformanceData 
} from '../services/dataValidationService';
import { batchService } from '../services/batchService';
import { checkSupabaseConnection } from '../utils/supabase/client';
import { invoke } from '@tauri-apps/api/tauri';

interface CollectionStats {
  totalCollected: number;
  totalSaved: number;
  totalErrors: number;
  lastCollection: Date | null;
  lastSave: Date | null;
  lastAnomaly: { type: string; value: number; timestamp: Date } | null;
}

interface UseOptimizedPerformanceCollectionReturn {
  // Dati correnti
  currentData: RawPerformanceData | null;
  waterBottles: number;
  
  // Buffer per grafici
  realtimeBuffer: DataPoint[];
  
  // Stato connessione
  isOnline: boolean;
  isTauriAvailable: boolean;
  
  // Statistiche
  stats: CollectionStats;
  batchSize: number;
  
  // Controlli
  forceFlush: () => Promise<void>;
  pauseCollection: () => void;
  resumeCollection: () => void;
  isPaused: boolean;
}

export function useOptimizedPerformanceCollection(
  deviceId?: string,
  deviceName?: string
): UseOptimizedPerformanceCollectionReturn {
  // Stato
  const [currentData, setCurrentData] = useState<RawPerformanceData | null>(null);
  const [waterBottles, setWaterBottles] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isTauriAvailable, setIsTauriAvailable] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [batchSize, setBatchSize] = useState(0);
  
  const [stats, setStats] = useState<CollectionStats>({
    totalCollected: 0,
    totalSaved: 0,
    totalErrors: 0,
    lastCollection: null,
    lastSave: null,
    lastAnomaly: null,
  });

  // Buffer circolare per ultimi 60 secondi
  const { buffer: realtimeBuffer, addDataPoint } = useCircularBuffer(60);

  // Riferimenti per evitare ricreazione funzioni
  const saveCounterRef = useRef(0);
  const SAVE_INTERVAL = 5 * 60; // Salva ogni 5 minuti (300 secondi)

  /**
   * Raccolta dati da Tauri (ogni 1 secondo)
   */
  const collectData = useCallback(async () => {
    if (isPaused) return;

    try {
      // Chiamata a Tauri per ottenere dati sistema
      const data = await invoke<RawPerformanceData>('get_system_metrics');

      // Valida i dati
      const validation = validatePerformanceData(data);

      if (!validation.isValid) {
        console.error('❌ VERA: Dati non validi:', validation.errors);
        setStats(prev => ({
          ...prev,
          totalErrors: prev.totalErrors + 1,
        }));
        return;
      }

      // Sanitizza per sicurezza
      const cleanData = sanitizeData(data);

      // Aggiorna stato corrente
      setCurrentData(cleanData);

      // Calcola bottiglie
      const bottles = calculateWaterBottles(cleanData);
      setWaterBottles(bottles);

      // Aggiungi al buffer circolare per grafici real-time
      addDataPoint({
        timestamp: Date.now(),
        cpu: cleanData.cpu_usage,
        ram: cleanData.ram_usage,
        gpu: cleanData.gpu_usage,
        disk: cleanData.disk_usage,
        network_download: cleanData.network_download,
        network_upload: cleanData.network_upload,
      });

      // Aggiorna statistiche
      setStats(prev => ({
        ...prev,
        totalCollected: prev.totalCollected + 1,
        lastCollection: new Date(),
      }));

      // Rileva anomalie
      const anomaly = detectAnomalies(cleanData);
      
      if (anomaly.hasAnomaly) {
        console.warn(`⚠️ VERA: Anomalia rilevata - ${anomaly.type}: ${anomaly.value}%`);
        
        setStats(prev => ({
          ...prev,
          lastAnomaly: {
            type: anomaly.type,
            value: anomaly.value,
            timestamp: new Date(),
          },
        }));

        // Salva immediatamente su Supabase
        await saveToSupabase(cleanData, bottles, true);
      } else {
        // Salvataggio normale (ogni 5 minuti)
        saveCounterRef.current++;
        
        if (saveCounterRef.current >= SAVE_INTERVAL) {
          await saveToSupabase(cleanData, bottles, false);
          saveCounterRef.current = 0;
        }
      }

      console.log(`📊 VERA: Dati raccolti - CPU: ${cleanData.cpu_usage.toFixed(1)}%, RAM: ${cleanData.ram_usage.toFixed(1)}%, GPU: ${cleanData.gpu_usage.toFixed(1)}%`);

    } catch (error: any) {
      console.error('❌ VERA: Errore raccolta dati Tauri:', error);
      
      if (error.toString().includes('command get_system_metrics not found')) {
        setIsTauriAvailable(false);
      }

      setStats(prev => ({
        ...prev,
        totalErrors: prev.totalErrors + 1,
      }));
    }
  }, [isPaused, addDataPoint]);

  /**
   * Salvataggio su Supabase con batch
   */
  const saveToSupabase = useCallback(async (
    data: RawPerformanceData,
    bottles: number,
    isImmediate: boolean
  ) => {
    try {
      // Verifica connessione
      const connected = await checkSupabaseConnection();
      setIsOnline(connected);

      if (!connected) {
        console.log('📴 VERA: Offline - salvataggio rinviato');
        return;
      }

      const dataToSave = {
        timestamp: new Date().toISOString(),
        cpu_usage: data.cpu_usage,
        ram_usage: data.ram_usage,
        gpu_usage: data.gpu_usage,
        disk_usage: data.disk_usage,
        network_usage: (data.network_download + data.network_upload) / 2,
        water_bottles_equivalent: bottles,
        device_id: deviceId,
        device_name: deviceName,
      };

      if (isImmediate) {
        // Salvataggio immediato (anomalia)
        console.log('⚡ VERA: Salvataggio immediato per anomalia');
        batchService.addToBatch(dataToSave);
        await batchService.forceFlush();
      } else {
        // Aggiungi al batch normale
        batchService.addToBatch(dataToSave);
      }

      setBatchSize(batchService.getBatchSize());

      setStats(prev => ({
        ...prev,
        totalSaved: prev.totalSaved + 1,
        lastSave: new Date(),
      }));

      console.log(`💾 VERA: Dati ${isImmediate ? 'salvati immediatamente' : 'aggiunti al batch'} - Timestamp: ${new Date().toLocaleTimeString()}`);

    } catch (error) {
      console.error('❌ VERA: Errore salvataggio Supabase:', error);
      setStats(prev => ({
        ...prev,
        totalErrors: prev.totalErrors + 1,
      }));
    }
  }, [deviceId, deviceName]);

  /**
   * Forza flush del batch
   */
  const forceFlush = useCallback(async () => {
    const result = await batchService.forceFlush();
    setBatchSize(batchService.getBatchSize());
    console.log(`✅ VERA: Flush completato - ${result.count} record salvati`);
  }, []);

  /**
   * Controlla connessione periodicamente
   */
  useInterval(async () => {
    const connected = await checkSupabaseConnection();
    setIsOnline(connected);
    setBatchSize(batchService.getBatchSize());
  }, 30000); // Ogni 30 secondi

  /**
   * Raccolta dati ogni 1 secondo
   */
  useInterval(collectData, isPaused ? null : 1000);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Salva tutto prima di smontare
      batchService.forceFlush();
    };
  }, []);

  return {
    currentData,
    waterBottles,
    realtimeBuffer,
    isOnline,
    isTauriAvailable,
    stats,
    batchSize,
    forceFlush,
    pauseCollection: () => setIsPaused(true),
    resumeCollection: () => setIsPaused(false),
    isPaused,
  };
}
