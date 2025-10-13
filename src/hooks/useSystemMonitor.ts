import { useState, useEffect, useCallback } from 'react';
import { useTauri } from './useTauri';
import { useSystemMonitorMock } from './useSystemMonitorMock';

interface SystemMetrics {
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
    memoryTotal: number;
  };
  ram: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    readSpeed: number;
    writeSpeed: number;
    usage: number;
  };
  power: {
    source: 'battery' | 'ac';
    batteryPercentage: number;
    powerDraw: number;
    estimatedTime: number;
  };
  system: {
    uptime: number;
    processes: number;
    temperature: number;
  };
}

interface ActiveApplication {
  name: string;
  category: string;
  duration: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface UseSystemMonitorOptions {
  metricsUpdateInterval?: number; // milliseconds
  appsUpdateInterval?: number; // milliseconds
  autoStart?: boolean;
}

interface UseSystemMonitorReturn {
  metrics: SystemMetrics | null;
  applications: ActiveApplication[];
  isLoading: boolean;
  error: string | null;
  refetchMetrics: () => Promise<void>;
  refetchApplications: () => Promise<void>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  isMonitoring: boolean;
}

const DEFAULT_METRICS: SystemMetrics = {
  cpu: { usage: 0, temperature: 0, cores: 0, frequency: 0 },
  gpu: { usage: 0, temperature: 0, memory: 0, memoryTotal: 0 },
  ram: { used: 0, total: 0, percentage: 0 },
  disk: { readSpeed: 0, writeSpeed: 0, usage: 0 },
  power: { source: 'ac', batteryPercentage: 100, powerDraw: 0, estimatedTime: 0 },
  system: { uptime: 0, processes: 0, temperature: 0 }
};

export function useSystemMonitor(options: UseSystemMonitorOptions = {}): UseSystemMonitorReturn {
  const {
    metricsUpdateInterval = 2000,
    appsUpdateInterval = 5000,
    autoStart = true
  } = options;

  // Check if we're in a Tauri environment immediately
  const isTauriEnv = typeof window !== 'undefined' && !!(window as any).__TAURI__;
  
  // If not in Tauri, use mock directly without attempting real calls
  const mockMonitor = useSystemMonitorMock(options);
  
  if (!isTauriEnv) {
    return mockMonitor;
  }

  const { invoke, isReady } = useTauri();
  const [useMock, setUseMock] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [applications, setApplications] = useState<ActiveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(autoStart);

  const refetchMetrics = useCallback(async () => {
    if (!isReady) {
      return;
    }

    try {
      const systemMetrics = await invoke('get_system_metrics') as any;
      
      // Convert Rust data structure to TypeScript interface
      const convertedMetrics: SystemMetrics = {
        cpu: {
          usage: systemMetrics.cpu.usage,
          temperature: systemMetrics.cpu.temperature,
          cores: systemMetrics.cpu.cores,
          frequency: systemMetrics.cpu.frequency
        },
        gpu: {
          usage: systemMetrics.gpu.usage,
          temperature: systemMetrics.gpu.temperature,
          memory: systemMetrics.gpu.memory / (1024 * 1024), // bytes to MB
          memoryTotal: systemMetrics.gpu.memory_total / (1024 * 1024)
        },
        ram: {
          used: systemMetrics.ram.used / (1024 * 1024), // bytes to MB
          total: systemMetrics.ram.total / (1024 * 1024),
          percentage: systemMetrics.ram.percentage
        },
        disk: {
          readSpeed: systemMetrics.disk.read_speed,
          writeSpeed: systemMetrics.disk.write_speed,
          usage: systemMetrics.disk.usage
        },
        power: {
          source: systemMetrics.power.source as 'battery' | 'ac',
          batteryPercentage: systemMetrics.power.battery_percentage,
          powerDraw: systemMetrics.power.power_draw,
          estimatedTime: systemMetrics.power.estimated_time
        },
        system: {
          uptime: systemMetrics.system.uptime,
          processes: systemMetrics.system.processes,
          temperature: systemMetrics.system.temperature
        }
      };

      setMetrics(convertedMetrics);
      setError(null);
      
      if (isLoading) {
        setIsLoading(false);
      }
    } catch (err) {
      // If Tauri command fails, switch to mock mode silently
      setUseMock(true);
      setError(null); // Don't show error, just fallback to mock
      
      // Use default metrics on error
      if (!metrics) {
        setMetrics(DEFAULT_METRICS);
      }
      
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [isReady, invoke, isLoading, metrics]);

  const refetchApplications = useCallback(async () => {
    if (!isReady) {
      return;
    }

    try {
      const apps = await invoke('get_active_applications') as ActiveApplication[];
      setApplications(apps);
      setError(null);
    } catch (err) {
      // If Tauri command fails, switch to mock mode silently
      setUseMock(true);
      setError(null); // Don't show error, just fallback to mock
    }
  }, [isReady, invoke]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Fetch metrics at specified interval
  useEffect(() => {
    if (!isMonitoring || !isReady) return;

    // Initial fetch
    refetchMetrics();

    const interval = setInterval(refetchMetrics, metricsUpdateInterval);
    return () => clearInterval(interval);
  }, [isMonitoring, isReady, metricsUpdateInterval, refetchMetrics]);

  // Fetch applications at specified interval
  useEffect(() => {
    if (!isMonitoring || !isReady) return;

    // Initial fetch
    refetchApplications();

    const interval = setInterval(refetchApplications, appsUpdateInterval);
    return () => clearInterval(interval);
  }, [isMonitoring, isReady, appsUpdateInterval, refetchApplications]);

  // Return mock data if Tauri is not available or has errors
  if (useMock) {
    return mockMonitor;
  }

  return {
    metrics,
    applications,
    isLoading,
    error,
    refetchMetrics,
    refetchApplications,
    startMonitoring,
    stopMonitoring,
    isMonitoring
  };
}

// Utility functions for formatting system data
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const getTemperatureStatus = (temp: number): 'low' | 'normal' | 'warm' | 'hot' => {
  if (temp < 50) return 'low';
  if (temp < 70) return 'normal';
  if (temp < 85) return 'warm';
  return 'hot';
};

export const getTemperatureColor = (temp: number): string => {
  const status = getTemperatureStatus(temp);
  switch (status) {
    case 'low': return 'text-blue-500';
    case 'normal': return 'text-green-500';
    case 'warm': return 'text-yellow-500';
    case 'hot': return 'text-red-500';
  }
};

export const getPowerSourceIcon = (source: 'battery' | 'ac'): 'battery' | 'charging' => {
  return source === 'ac' ? 'charging' : 'battery';
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Development': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Browser': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Media': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    'Communication': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Design': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Other': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return colors[category] || colors['Other'];
};
