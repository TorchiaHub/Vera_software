import { getSupabaseClient, checkSupabaseConnection, PerformanceData } from '../utils/supabase/client';
import {
  getLocalQueue,
  removeFromQueue,
  incrementRetryCount,
  clearLocalQueue,
  getQueueStats,
} from './localStorageService';

const MAX_RETRY_ATTEMPTS = 5;
const SYNC_INTERVAL = 60000; // 1 minuto

let syncIntervalId: number | null = null;
let isSyncing = false;

/**
 * Sincronizza tutti i dati dalla coda locale a Supabase
 */
export const syncLocalDataToSupabase = async (): Promise<{
  success: boolean;
  synced: number;
  failed: number;
}> => {
  if (isSyncing) {
    console.log('⏳ VERA: Sincronizzazione già in corso...');
    return { success: false, synced: 0, failed: 0 };
  }

  isSyncing = true;
  const queue = getLocalQueue();

  if (queue.length === 0) {
    isSyncing = false;
    return { success: true, synced: 0, failed: 0 };
  }

  console.log(`🔄 VERA: Inizio sincronizzazione ${queue.length} record...`);

  const supabase = getSupabaseClient();
  let synced = 0;
  let failed = 0;

  // Verifica connessione prima di iniziare
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    console.log('❌ VERA: Supabase non raggiungibile, sincronizzazione rimandata');
    isSyncing = false;
    return { success: false, synced: 0, failed: queue.length };
  }

  // Processa in batch di 50 record per volta
  const batchSize = 50;
  for (let i = 0; i < queue.length; i += batchSize) {
    const batch = queue.slice(i, i + batchSize);
    const validBatch = batch.filter(item => item.retry_count < MAX_RETRY_ATTEMPTS);

    if (validBatch.length === 0) {
      // Rimuovi tutti i record che hanno superato il max retry
      for (let j = batch.length - 1; j >= 0; j--) {
        if (batch[j].retry_count >= MAX_RETRY_ATTEMPTS) {
          console.warn('⚠️ VERA: Record scartato dopo troppi tentativi:', batch[j]);
          removeFromQueue(i + j);
          failed++;
        }
      }
      continue;
    }

    try {
      // Prepara i dati per l'inserimento
      const dataToInsert = validBatch.map(({ queued_at, retry_count, ...data }) => data);

      const { error } = await supabase
        .from('performance_metrics')
        .insert(dataToInsert);

      if (error) {
        console.error('❌ VERA: Errore batch insert:', error);
        // Incrementa retry count per tutti gli elementi del batch
        validBatch.forEach((_, index) => {
          incrementRetryCount(i + index);
        });
        failed += validBatch.length;
      } else {
        // Rimuovi i record sincronizzati con successo (dal fondo per non spostare gli indici)
        for (let j = validBatch.length - 1; j >= 0; j--) {
          removeFromQueue(i);
        }
        synced += validBatch.length;
        console.log(`✅ VERA: Sincronizzati ${validBatch.length} record`);
      }
    } catch (error) {
      console.error('❌ VERA: Errore sincronizzazione batch:', error);
      validBatch.forEach((_, index) => {
        incrementRetryCount(i + index);
      });
      failed += validBatch.length;
    }
  }

  isSyncing = false;

  if (synced > 0) {
    console.log(`✅ VERA: Sincronizzazione completata - ${synced} successi, ${failed} falliti`);
  }

  return { success: synced > 0 || failed === 0, synced, failed };
};

/**
 * Avvia la sincronizzazione automatica periodica
 */
export const startAutoSync = (intervalMs: number = SYNC_INTERVAL): void => {
  if (syncIntervalId !== null) {
    console.log('⚠️ VERA: Auto-sync già attivo');
    return;
  }

  console.log(`🔄 VERA: Auto-sync avviato (ogni ${intervalMs / 1000}s)`);

  // Sincronizza subito
  syncLocalDataToSupabase();

  // Poi periodicamente
  syncIntervalId = window.setInterval(() => {
    const stats = getQueueStats();
    if (stats.total > 0) {
      console.log(`🔄 VERA: Auto-sync - ${stats.total} record in coda`);
      syncLocalDataToSupabase();
    }
  }, intervalMs);
};

/**
 * Ferma la sincronizzazione automatica
 */
export const stopAutoSync = (): void => {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('⏹️ VERA: Auto-sync fermato');
  }
};

/**
 * Forza una sincronizzazione immediata
 */
export const forceSyncNow = async (): Promise<void> => {
  console.log('🔄 VERA: Sincronizzazione forzata...');
  await syncLocalDataToSupabase();
};

/**
 * Ottieni lo stato della sincronizzazione
 */
export const getSyncStatus = () => {
  const stats = getQueueStats();
  return {
    isActive: syncIntervalId !== null,
    isSyncing,
    queueSize: stats.total,
    oldestRecord: stats.oldest,
    newestRecord: stats.newest,
    problemRecords: stats.highRetryCount,
  };
};
