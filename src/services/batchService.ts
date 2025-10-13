import { getSupabaseClient, PerformanceData } from '../utils/supabase/client';

/**
 * Servizio per batch insert ottimizzati su Supabase
 * Riduce il numero di chiamate raggruppando i dati
 */

interface BatchItem {
  data: Omit<PerformanceData, 'id' | 'created_at'>;
  timestamp: number;
}

class BatchService {
  private batch: BatchItem[] = [];
  private readonly MAX_BATCH_SIZE = 20; // Massimo 20 record per batch
  private readonly BATCH_TIMEOUT = 5 * 60 * 1000; // 5 minuti
  private timeoutId: number | null = null;
  private lastFlush: number = Date.now();

  /**
   * Aggiungi un record al batch
   */
  addToBatch(data: Omit<PerformanceData, 'id' | 'created_at'>) {
    this.batch.push({
      data,
      timestamp: Date.now(),
    });

    console.log(`📦 VERA: Batch aggiunto (${this.batch.length}/${this.MAX_BATCH_SIZE})`);

    // Flush automatico se raggiungiamo la dimensione massima
    if (this.batch.length >= this.MAX_BATCH_SIZE) {
      this.flush();
    } else {
      // Altrimenti schedula flush dopo timeout
      this.scheduleFlush();
    }
  }

  /**
   * Schedula flush automatico
   */
  private scheduleFlush() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      const timeSinceLastFlush = Date.now() - this.lastFlush;
      
      // Flush solo se è passato abbastanza tempo
      if (timeSinceLastFlush >= this.BATCH_TIMEOUT && this.batch.length > 0) {
        this.flush();
      }
    }, this.BATCH_TIMEOUT);
  }

  /**
   * Flush immediato di tutti i dati nel batch
   */
  async flush(): Promise<{ success: boolean; count: number }> {
    if (this.batch.length === 0) {
      return { success: true, count: 0 };
    }

    const batchToSend = [...this.batch];
    const supabase = getSupabaseClient();

    console.log(`🚀 VERA: Flush batch di ${batchToSend.length} record su Supabase...`);

    try {
      // Prepara i dati per l'inserimento
      const dataToInsert = batchToSend.map(item => item.data);

      const { error } = await supabase
        .from('performance_metrics')
        .insert(dataToInsert);

      if (error) {
        console.error('❌ VERA: Errore batch insert:', error);
        // Non svuotare il batch in caso di errore
        return { success: false, count: 0 };
      }

      // Successo - svuota il batch
      this.batch = this.batch.filter(item => !batchToSend.includes(item));
      this.lastFlush = Date.now();

      console.log(`✅ VERA: Batch salvato con successo (${batchToSend.length} record)`);

      return { success: true, count: batchToSend.length };
    } catch (error) {
      console.error('❌ VERA: Errore flush batch:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Forza flush immediato (per anomalie o shutdown)
   */
  async forceFlush(): Promise<{ success: boolean; count: number }> {
    console.log('⚡ VERA: Flush forzato batch...');
    return this.flush();
  }

  /**
   * Ottieni dimensione corrente del batch
   */
  getBatchSize(): number {
    return this.batch.length;
  }

  /**
   * Pulisci il batch (in caso di errori persistenti)
   */
  clearBatch() {
    this.batch = [];
    console.log('🗑️ VERA: Batch svuotato');
  }

  /**
   * Ottieni statistiche del batch
   */
  getStats() {
    return {
      size: this.batch.length,
      oldestTimestamp: this.batch[0]?.timestamp,
      newestTimestamp: this.batch[this.batch.length - 1]?.timestamp,
      lastFlush: this.lastFlush,
      timeSinceLastFlush: Date.now() - this.lastFlush,
    };
  }
}

// Singleton instance
export const batchService = new BatchService();
