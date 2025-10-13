import { useState, useEffect, useCallback } from 'react';

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
  metricsUpdateInterval?: number;
  appsUpdateInterval?: number;
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

// Simulated system monitor for browser/preview environment
export function useSystemMonitorMock(options: UseSystemMonitorOptions = {}): UseSystemMonitorReturn {
  const {
    metricsUpdateInterval = 2000,
    appsUpdateInterval = 5000,
    autoStart = true
  } = options;

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [applications, setApplications] = useState<ActiveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(autoStart);
  const [uptime, setUptime] = useState(0);

  // Simulate realistic system metrics
  const generateMetrics = useCallback((): SystemMetrics => {
    const prevMetrics = metrics;
    
    // Generate values with smooth transitions
    const cpuUsage = prevMetrics 
      ? Math.max(15, Math.min(95, prevMetrics.cpu.usage + (Math.random() - 0.5) * 10))
      : 30 + Math.random() * 40;
    
    const gpuUsage = prevMetrics
      ? Math.max(10, Math.min(90, prevMetrics.gpu.usage + (Math.random() - 0.5) * 15))
      : 20 + Math.random() * 50;
    
    const ramPercentage = prevMetrics
      ? Math.max(30, Math.min(85, prevMetrics.ram.percentage + (Math.random() - 0.5) * 5))
      : 40 + Math.random() * 30;

    const ramTotal = 16384; // 16 GB
    const ramUsed = (ramPercentage / 100) * ramTotal;

    return {
      cpu: {
        usage: cpuUsage,
        temperature: 45 + cpuUsage * 0.35,
        cores: 8,
        frequency: 3200 + Math.random() * 800
      },
      gpu: {
        usage: gpuUsage,
        temperature: 50 + gpuUsage * 0.4,
        memory: 2048 + Math.random() * 1024,
        memoryTotal: 8192
      },
      ram: {
        used: ramUsed,
        total: ramTotal,
        percentage: ramPercentage
      },
      disk: {
        readSpeed: Math.random() * 500,
        writeSpeed: Math.random() * 300,
        usage: 65 + Math.random() * 10
      },
      power: {
        source: 'ac' as const,
        batteryPercentage: 100,
        powerDraw: 80 + cpuUsage * 1.2 + gpuUsage * 0.8,
        estimatedTime: 0
      },
      system: {
        uptime: uptime,
        processes: 180 + Math.floor(Math.random() * 20),
        temperature: 40 + (cpuUsage + gpuUsage) / 4
      }
    };
  }, [metrics, uptime]);

  const generateApplications = useCallback((): ActiveApplication[] => {
    const apps = [
      { name: 'Visual Studio Code', category: 'Development', baseCpu: 12.5, baseMemory: 850 },
      { name: 'Google Chrome', category: 'Browser', baseCpu: 8.3, baseMemory: 1240 },
      { name: 'Spotify', category: 'Media', baseCpu: 2.1, baseMemory: 180 },
      { name: 'Discord', category: 'Communication', baseCpu: 3.7, baseMemory: 320 },
      { name: 'Figma', category: 'Design', baseCpu: 15.2, baseMemory: 980 },
      { name: 'Microsoft Teams', category: 'Communication', baseCpu: 5.5, baseMemory: 450 },
      { name: 'Firefox', category: 'Browser', baseCpu: 6.8, baseMemory: 890 },
      { name: 'Slack', category: 'Communication', baseCpu: 4.2, baseMemory: 380 },
    ];

    // Randomly select 5-7 apps
    const numApps = 5 + Math.floor(Math.random() * 3);
    const selectedApps = apps
      .sort(() => Math.random() - 0.5)
      .slice(0, numApps);

    return selectedApps.map(app => ({
      name: app.name,
      category: app.category,
      duration: Math.floor(1800 + Math.random() * 5400), // 30min to 2h
      cpuUsage: app.baseCpu + (Math.random() - 0.5) * 5,
      memoryUsage: Math.floor(app.baseMemory + (Math.random() - 0.5) * 100)
    }));
  }, []);

  const refetchMetrics = useCallback(async () => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const newMetrics = generateMetrics();
      setMetrics(newMetrics);
      setError(null);
      
      if (isLoading) {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch system metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [generateMetrics, isLoading]);

  const refetchApplications = useCallback(async () => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const apps = generateApplications();
      setApplications(apps);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch active applications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [generateApplications]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Update uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 2);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Fetch metrics at specified interval
  useEffect(() => {
    if (!isMonitoring) return;

    // Initial fetch
    refetchMetrics();

    const interval = setInterval(refetchMetrics, metricsUpdateInterval);
    return () => clearInterval(interval);
  }, [isMonitoring, metricsUpdateInterval, refetchMetrics]);

  // Fetch applications at specified interval
  useEffect(() => {
    if (!isMonitoring) return;

    // Initial fetch
    refetchApplications();

    const interval = setInterval(refetchApplications, appsUpdateInterval);
    return () => clearInterval(interval);
  }, [isMonitoring, appsUpdateInterval, refetchApplications]);

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

// Utility functions
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
