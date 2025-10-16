import { useState, useCallback } from 'react';

/**
 * Hook per gestire un buffer circolare in memoria
 * Ottimizzato per grafici real-time (ultimi 60 secondi)
 */
export interface DataPoint {
  timestamp: number;
  cpu: number;
  ram: number;
  gpu: number;
  disk: number;
  network_download: number;
  network_upload: number;
}

export function useCircularBuffer(maxSize: number = 60) {
  const [buffer, setBuffer] = useState<DataPoint[]>([]);

  const addDataPoint = useCallback((dataPoint: DataPoint) => {
    setBuffer(prev => {
      const newBuffer = [...prev, dataPoint];
      // Mantieni solo gli ultimi maxSize elementi
      if (newBuffer.length > maxSize) {
        return newBuffer.slice(-maxSize);
      }
      return newBuffer;
    });
  }, [maxSize]);

  const clearBuffer = useCallback(() => {
    setBuffer([]);
  }, []);

  const getRecentData = useCallback((seconds: number) => {
    const cutoffTime = Date.now() - (seconds * 1000);
    return buffer.filter(point => point.timestamp >= cutoffTime);
  }, [buffer]);

  return {
    buffer,
    addDataPoint,
    clearBuffer,
    getRecentData,
    size: buffer.length,
  };
}
