import { useState, useEffect, useCallback, useRef } from 'react';
import { useTauri } from './useTauri';

/**
 * REAL system monitor - NO MOCK DATA
 * Reads actual system metrics from Tauri backend
 */

export interface SystemMetricsReal {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
    frequency: number;
  };
  gpu: {
    usage: number;
    temperature: number;
    memory: number;
    memory_total: number;
  };
  ram: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    read_speed: number;
    write_speed: number;
    usage: number;
  };
  power: {
    source: string;
    battery_percentage: number;
    power_draw: number;
    estimated_time: number;
  };
  system: {
    uptime: number;
    processes: number;
    temperature: number;
  };
}

export interface ActiveApplication {
  name: string;
  category: string;
  duration: number;
  cpu_usage: number;
  memory_usage: number;
}

export function useSystemMonitorReal() {
  const { invoke, isReady, isTauriEnv } = useTauri();
  const [metrics, setMetrics] = useState<SystemMetricsReal | null>(null);
  const [applications, setApplications] = useState<ActiveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  /**
   * Fetch real metrics from Tauri
   */
  const fetchMetrics = useCallback(async () => {
    if (!isReady || !isTauriEnv) {
      setError('Tauri not available. Run with: npm run tauri:dev');
      setIsLoading(false);
      return;
    }

    try {
      console.log('📊 VERA: Fetching real system metrics from Tauri...');
      
      const data = await invoke('get_system_metrics') as SystemMetricsReal;
      
      console.log('✅ VERA: Real data received:', {
        cpu: `${data.cpu.usage.toFixed(1)}%`,
        ram: `${data.ram.percentage.toFixed(1)}%`,
        gpu: `${data.gpu.usage.toFixed(1)}%`,
        disk: `${data.disk.usage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
      });

      setMetrics(data);
      setLastUpdate(new Date());
      setError(null);
      setIsLoading(false);
    } catch (err: any) {
      console.error('❌ VERA: Error fetching metrics:', err);
      setError(err.message || 'Failed to fetch system metrics');
      setIsLoading(false);
    }
  }, [invoke, isReady, isTauriEnv]);

  /**
   * Fetch active applications
   */
  const fetchApplications = useCallback(async () => {
    if (!isReady || !isTauriEnv) return;

    try {
      const apps = await invoke('get_active_applications') as ActiveApplication[];
      console.log(`✅ VERA: ${apps.length} active applications fetched`);
      setApplications(apps);
    } catch (err: any) {
      console.error('❌ VERA: Error fetching applications:', err);
    }
  }, [invoke, isReady, isTauriEnv]);

  /**
   * Start monitoring with interval
   */
  const startMonitoring = useCallback((intervalMs: number = 2000) => {
    if (intervalRef.current !== null) {
      console.log('⚠️ VERA: Monitoring already started');
      return;
    }

    console.log(`🚀 VERA: Starting real-time monitoring (every ${intervalMs}ms)`);
    
    // Initial fetch
    fetchMetrics();
    fetchApplications();

    // Set up interval
    intervalRef.current = window.setInterval(() => {
      fetchMetrics();
    }, intervalMs);

    // Fetch applications less frequently (every 10 seconds)
    const appsInterval = window.setInterval(() => {
      fetchApplications();
    }, 10000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearInterval(appsInterval);
    };
  }, [fetchMetrics, fetchApplications]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏹️ VERA: Monitoring stopped');
    }
  }, []);

  /**
   * Auto-start monitoring on mount
   */
  useEffect(() => {
    if (!isReady) return;

    const cleanup = startMonitoring(2000); // Update every 2 seconds

    return cleanup;
  }, [isReady, startMonitoring]);

  return {
    metrics,
    applications,
    isLoading,
    error,
    lastUpdate,
    isTauriAvailable: isTauriEnv,
    startMonitoring,
    stopMonitoring,
    refresh: fetchMetrics,
  };
}
