import { useState, useEffect, useCallback } from 'react';

// Types for energy statistics
export interface EnergyStats {
  currentPower: number;      // Watts
  todayKwh: number;
  weeklyKwh: number;
  monthlyKwh: number;
  bottlesToday: number;
  bottlesWeek: number;
  bottlesMonth: number;
  co2Today: number;          // grams
  co2Week: number;
  co2Month: number;
  weeklyTrend: number;       // percentage
  peakToday: number;
  maxPower: number;
}

export interface UserSettings {
  quietHoursStart: number;   // 0-23
  quietHoursEnd: number;     // 0-23
  region: string;
  theme: string;
  notificationsEnabled: boolean;
  deviceType: 'pc' | 'cellulare' | 'tablet';
}

// Check if we're running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// Mock Tauri API for development/web environment
const mockTauriAPI = {
  async invoke(cmd: string, args?: any): Promise<any> {
    console.log(`[Mock Tauri] invoke: ${cmd}`, args);
    
    // Simulate Tauri command responses
    switch (cmd) {
      case 'get_current_power':
        return Promise.resolve(85 + Math.random() * 20);
      
      case 'get_energy_stats':
        const period = args?.period || 'day';
        return Promise.resolve({
          currentPower: 85,
          todayKwh: 0.46,
          weeklyKwh: 3.1,
          monthlyKwh: 12.4,
          bottlesToday: 1.4,
          bottlesWeek: 9.3,
          bottlesMonth: 37.2,
          co2Today: 230,
          co2Week: 1550,
          co2Month: 6200,
          weeklyTrend: -8,
          peakToday: 127,
          maxPower: 150
        });
      
      case 'update_settings':
        console.log('[Mock Tauri] Settings updated:', args?.settings);
        return Promise.resolve(null);
      
      case 'get_settings':
        return Promise.resolve({
          quietHoursStart: 19,
          quietHoursEnd: 8,
          region: 'Lombardia',
          theme: 'light',
          notificationsEnabled: true,
          deviceType: 'pc'
        });
      
      case 'get_notifications':
        return Promise.resolve([
          {
            id: '1',
            title: 'Consumo elevato',
            message: 'Il PC ha consumato 2.5 kWh oggi',
            timestamp: Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000),
            read: false,
            type: 'warning'
          },
          {
            id: '2',
            title: 'Obiettivo raggiunto!',
            message: 'Hai risparmiato 15 bottiglie d\'acqua questa settimana',
            timestamp: Math.floor((Date.now() - 5 * 60 * 60 * 1000) / 1000),
            read: false,
            type: 'success'
          },
          {
            id: '3',
            title: 'Aggiornamento disponibile',
            message: 'Nuove funzionalità disponibili per VERA',
            timestamp: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000),
            read: true,
            type: 'info'
          }
        ]);
      
      case 'mark_notification_read':
      case 'mark_all_notifications_read':
      case 'delete_notification':
        console.log(`[Mock Tauri] ${cmd}:`, args);
        return Promise.resolve(null);
      
      default:
        return Promise.reject(new Error(`Unknown command: ${cmd}`));
    }
  },

  event: {
    listen: async (event: string, handler: (event: any) => void) => {
      console.log(`[Mock Tauri] Listening to event: ${event}`);
      
      // Simulate real-time energy updates
      if (event === 'energy-update') {
        const interval = setInterval(() => {
          handler({
            payload: {
              currentPower: 85 + Math.random() * 20,
              todayKwh: 0.46 + Math.random() * 0.1,
              bottlesToday: 1.4 + Math.random() * 0.3,
              co2Today: 230 + Math.random() * 50
            }
          });
        }, 3000);

        // Return unlisten function
        return () => clearInterval(interval);
      }

      return () => {};
    },

    emit: async (event: string, payload?: any) => {
      console.log(`[Mock Tauri] Emit event: ${event}`, payload);
    }
  },

  window: {
    appWindow: {
      hide: async () => {
        console.log('[Mock Tauri] Window hidden');
      },
      show: async () => {
        console.log('[Mock Tauri] Window shown');
      },
      minimize: async () => {
        console.log('[Mock Tauri] Window minimized');
      },
      close: async () => {
        console.log('[Mock Tauri] Window close requested (hiding instead)');
      }
    }
  },

  notification: {
    sendNotification: async (options: { title: string; body: string }) => {
      console.log('[Mock Tauri] Notification:', options);
      // In browser, use native Notification API if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(options.title, { body: options.body });
      }
    },
    requestPermission: async () => {
      if ('Notification' in window) {
        return await Notification.requestPermission();
      }
      return 'granted';
    }
  }
};

// Get Tauri API (real or mock)
const getTauriAPI = () => {
  if (isTauri()) {
    // Real Tauri environment
    // @ts-ignore - Tauri API will be available at runtime
    const { invoke } = window.__TAURI__.tauri;
    // @ts-ignore
    const { listen, emit } = window.__TAURI__.event;
    // @ts-ignore
    const { appWindow } = window.__TAURI__.window;
    // @ts-ignore
    const { sendNotification, requestPermission } = window.__TAURI__.notification;

    return {
      invoke,
      event: { listen, emit },
      window: { appWindow },
      notification: { sendNotification, requestPermission }
    };
  }
  
  // Mock API for web environment
  return mockTauriAPI;
};

/**
 * Hook to interact with Tauri backend
 */
export function useTauri() {
  const api = getTauriAPI();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return {
    isReady,
    isTauriEnv: isTauri(),
    invoke: api.invoke,
    listen: api.event.listen,
    emit: api.event.emit,
    window: api.window,
    notification: api.notification
  };
}

/**
 * Hook to get real-time energy statistics
 */
export function useEnergyStats(deviceType: 'pc' | 'cellulare' | 'tablet' = 'pc') {
  const { invoke, listen, isReady } = useTauri();
  const [stats, setStats] = useState<EnergyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial stats
  useEffect(() => {
    if (!isReady) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await invoke('get_energy_stats', { period: 'day', deviceType });
        setStats(data as EnergyStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch energy stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isReady, invoke, deviceType]);

  // Listen for real-time updates
  useEffect(() => {
    if (!isReady) return;

    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      unlisten = await listen('energy-update', (event: any) => {
        const payload = event.payload as Partial<EnergyStats>;
        setStats(prev => prev ? { ...prev, ...payload } : null);
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [isReady, listen]);

  return { stats, loading, error };
}

/**
 * Hook to manage user settings
 */
export function useSettings() {
  const { invoke, isReady } = useTauri();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    const fetchSettings = async () => {
      try {
        const data = await invoke('get_settings');
        setSettings(data as UserSettings);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isReady, invoke]);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!settings) return;

    const updated = { ...settings, ...newSettings };
    
    try {
      await invoke('update_settings', { settings: updated });
      setSettings(updated);
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  }, [invoke, settings]);

  return { settings, loading, updateSettings };
}

/**
 * Hook to send notifications
 */
export function useNotification() {
  const { notification, isReady } = useTauri();

  const sendNotification = useCallback(async (title: string, body: string) => {
    if (!isReady) return;

    try {
      await notification.sendNotification({ title, body });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  }, [isReady, notification]);

  const requestPermission = useCallback(async () => {
    if (!isReady) return 'denied';

    try {
      return await notification.requestPermission();
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return 'denied';
    }
  }, [isReady, notification]);

  return { sendNotification, requestPermission };
}

/**
 * Hook to control app window
 */
export function useAppWindow() {
  const { window: win, isReady } = useTauri();

  const hideWindow = useCallback(async () => {
    if (!isReady) return;
    try {
      await win.appWindow.hide();
    } catch (err) {
      console.error('Failed to hide window:', err);
    }
  }, [isReady, win]);

  const showWindow = useCallback(async () => {
    if (!isReady) return;
    try {
      await win.appWindow.show();
    } catch (err) {
      console.error('Failed to show window:', err);
    }
  }, [isReady, win]);

  const minimizeWindow = useCallback(async () => {
    if (!isReady) return;
    try {
      await win.appWindow.minimize();
    } catch (err) {
      console.error('Failed to minimize window:', err);
    }
  }, [isReady, win]);

  return { hideWindow, showWindow, minimizeWindow };
}
