import { PerformanceData } from '../utils/supabase/client';

const STORAGE_KEY = 'vera_performance_data_queue';
const MAX_QUEUE_SIZE = 1000; // Massimo 1000 record in coda

export interface QueuedData extends PerformanceData {
  queued_at: string;
  retry_count: number;
}

/**
 * Salva i dati in localStorage quando Supabase non è disponibile
 */
export const queueDataLocally = (data: PerformanceData): void => {
  try {
    const queue = getLocalQueue();
    const queuedData: QueuedData = {
      ...data,
      queued_at: new Date().toISOString(),
      retry_count: 0,
    };

    queue.push(queuedData);

    // Limita la dimensione della coda
    if (queue.length > MAX_QUEUE_SIZE) {
      queue.shift(); // Rimuovi il più vecchio
      console.warn('⚠️ VERA: Coda locale piena, rimosso record più vecchio');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    console.log('✅ VERA: Dati salvati in coda locale', queue.length, 'record');
  } catch (error) {
    console.error('❌ VERA: Errore salvataggio locale:', error);
  }
};

/**
 * Recupera tutti i dati dalla coda locale
 */
export const getLocalQueue = (): QueuedData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ VERA: Errore lettura coda locale:', error);
    return [];
  }
};

/**
 * Rimuove un record dalla coda dopo sincronizzazione
 */
export const removeFromQueue = (index: number): void => {
  try {
    const queue = getLocalQueue();
    queue.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('❌ VERA: Errore rimozione da coda:', error);
  }
};

/**
 * Incrementa il contatore di retry per un record
 */
export const incrementRetryCount = (index: number): void => {
  try {
    const queue = getLocalQueue();
    if (queue[index]) {
      queue[index].retry_count += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
  } catch (error) {
    console.error('❌ VERA: Errore incremento retry:', error);
  }
};

/**
 * Pulisce la coda (dopo sincronizzazione completa)
 */
export const clearLocalQueue = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ VERA: Coda locale pulita');
  } catch (error) {
    console.error('❌ VERA: Errore pulizia coda:', error);
  }
};

/**
 * Salva snapshot dei dati per grafici offline
 */
export const saveOfflineSnapshot = (data: PerformanceData[]): void => {
  try {
    const key = 'vera_offline_snapshot';
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('❌ VERA: Errore salvataggio snapshot offline:', error);
  }
};

/**
 * Recupera snapshot offline
 */
export const getOfflineSnapshot = (): PerformanceData[] => {
  try {
    const stored = localStorage.getItem('vera_offline_snapshot');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ VERA: Errore lettura snapshot offline:', error);
    return [];
  }
};

/**
 * Statistiche della coda
 */
export const getQueueStats = () => {
  const queue = getLocalQueue();
  return {
    total: queue.length,
    oldest: queue[0]?.queued_at,
    newest: queue[queue.length - 1]?.queued_at,
    highRetryCount: queue.filter(q => q.retry_count > 3).length,
  };
};
