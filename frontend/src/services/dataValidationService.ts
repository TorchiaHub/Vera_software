/**
 * Servizio per validazione dei dati raccolti
 * Garantisce che i valori siano corretti prima del salvataggio
 */

export interface RawPerformanceData {
  cpu_usage: number;
  ram_usage: number;
  gpu_usage: number;
  disk_usage: number;
  network_download: number;
  network_upload: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data: RawPerformanceData | null;
}

export interface AnomalyDetection {
  hasAnomaly: boolean;
  type: 'cpu_spike' | 'ram_spike' | 'disk_full' | 'none';
  value: number;
}

/**
 * Valida che i dati siano nell'intervallo corretto
 */
export function validatePerformanceData(data: RawPerformanceData): ValidationResult {
  const errors: string[] = [];

  // Valida CPU (0-100%)
  if (isNaN(data.cpu_usage) || data.cpu_usage < 0 || data.cpu_usage > 100) {
    errors.push(`CPU usage invalido: ${data.cpu_usage}%`);
  }

  // Valida RAM (0-100%)
  if (isNaN(data.ram_usage) || data.ram_usage < 0 || data.ram_usage > 100) {
    errors.push(`RAM usage invalido: ${data.ram_usage}%`);
  }

  // Valida GPU (0-100%)
  if (isNaN(data.gpu_usage) || data.gpu_usage < 0 || data.gpu_usage > 100) {
    errors.push(`GPU usage invalido: ${data.gpu_usage}%`);
  }

  // Valida Disk (0-100%)
  if (isNaN(data.disk_usage) || data.disk_usage < 0 || data.disk_usage > 100) {
    errors.push(`Disk usage invalido: ${data.disk_usage}%`);
  }

  // Valida Network (>= 0, massimo realistico 1000 MB/s = 1 GB/s)
  if (isNaN(data.network_download) || data.network_download < 0 || data.network_download > 1000) {
    errors.push(`Network download invalido: ${data.network_download} MB/s`);
  }

  if (isNaN(data.network_upload) || data.network_upload < 0 || data.network_upload > 1000) {
    errors.push(`Network upload invalido: ${data.network_upload} MB/s`);
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    console.error('❌ VERA: Dati non validi scartati:', errors);
    return { isValid: false, errors, data: null };
  }

  return { isValid: true, errors: [], data };
}

/**
 * Rileva anomalie che richiedono salvataggio immediato
 */
export function detectAnomalies(data: RawPerformanceData): AnomalyDetection {
  // CPU critica (>80%)
  if (data.cpu_usage > 80) {
    return {
      hasAnomaly: true,
      type: 'cpu_spike',
      value: data.cpu_usage,
    };
  }

  // RAM critica (>85%)
  if (data.ram_usage > 85) {
    return {
      hasAnomaly: true,
      type: 'ram_spike',
      value: data.ram_usage,
    };
  }

  // Disk quasi pieno (>95%)
  if (data.disk_usage > 95) {
    return {
      hasAnomaly: true,
      type: 'disk_full',
      value: data.disk_usage,
    };
  }

  return {
    hasAnomaly: false,
    type: 'none',
    value: 0,
  };
}

/**
 * Calcola equivalente in bottigliette d'acqua
 * Formula basata sul consumo energetico reale
 */
export function calculateWaterBottles(data: RawPerformanceData): number {
  // Stima consumo energetico medio per componente (in Watt)
  const cpuWatts = (data.cpu_usage / 100) * 95; // CPU max ~95W
  const ramWatts = (data.ram_usage / 100) * 15; // RAM max ~15W
  const gpuWatts = (data.gpu_usage / 100) * 150; // GPU max ~150W (dipende dalla GPU)
  const diskWatts = (data.disk_usage / 100) * 10; // Disk max ~10W

  const totalWatts = cpuWatts + ramWatts + gpuWatts + diskWatts;

  // Converti Watt in kWh per 1 secondo
  const kWhPerSecond = (totalWatts / 1000) / 3600;

  // 1 kWh di energia = ~0.25 litri di acqua per produzione energetica (media)
  // 1 bottiglia = 0.5 litri
  const litersPerSecond = kWhPerSecond * 0.25;
  const bottlesPerSecond = litersPerSecond / 0.5;

  return bottlesPerSecond;
}

/**
 * Sanitizza i dati forzandoli nell'intervallo corretto
 */
export function sanitizeData(data: RawPerformanceData): RawPerformanceData {
  return {
    cpu_usage: clamp(data.cpu_usage, 0, 100),
    ram_usage: clamp(data.ram_usage, 0, 100),
    gpu_usage: clamp(data.gpu_usage, 0, 100),
    disk_usage: clamp(data.disk_usage, 0, 100),
    network_download: Math.max(0, Math.min(data.network_download, 1000)),
    network_upload: Math.max(0, Math.min(data.network_upload, 1000)),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Determina il colore dell'indicatore in base al valore
 */
export function getStatusColor(value: number): 'green' | 'yellow' | 'red' {
  if (value < 70) return 'green';
  if (value < 85) return 'yellow';
  return 'red';
}
