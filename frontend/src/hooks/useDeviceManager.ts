import { useState, useEffect, useCallback } from 'react';

export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  platform: string;
  status: 'online' | 'offline' | 'idle';
  lastActive: Date;
  registeredAt: Date;
  isCurrentDevice: boolean;
  metrics: {
    totalEnergyKwh: number;
    totalWaterBottles: number;
    avgDailyKwh: number;
    uptime: number; // hours
  };
}

interface DeviceManagerState {
  devices: Device[];
  currentDevice: Device | null;
  isLoading: boolean;
}

// Generate a unique device ID based on browser fingerprint
const generateDeviceId = (): string => {
  const stored = localStorage.getItem('vera_device_id');
  if (stored) return stored;
  
  const fingerprint = `${navigator.userAgent}_${screen.width}x${screen.height}_${navigator.language}`;
  const id = btoa(fingerprint).replace(/=/g, '').substring(0, 16);
  localStorage.setItem('vera_device_id', id);
  return id;
};

// Detect device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Get platform info
const getPlatform = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') !== -1) return 'Windows';
  if (ua.indexOf('Mac') !== -1) return 'macOS';
  if (ua.indexOf('Linux') !== -1) return 'Linux';
  if (ua.indexOf('Android') !== -1) return 'Android';
  if (ua.indexOf('iOS') !== -1 || ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) return 'iOS';
  return 'Unknown';
};

// Get device name
const getDeviceName = (type: string, platform: string): string => {
  const typeNames = {
    desktop: 'Desktop PC',
    mobile: 'Smartphone',
    tablet: 'Tablet'
  };
  return `${typeNames[type as keyof typeof typeNames]} (${platform})`;
};

// Mock devices data - In production, this would come from Supabase
const getMockDevices = (currentDeviceId: string): Device[] => {
  const stored = localStorage.getItem('vera_registered_devices');
  
  if (stored) {
    const devices = JSON.parse(stored);
    return devices.map((d: Device) => ({
      ...d,
      lastActive: new Date(d.lastActive),
      registeredAt: new Date(d.registeredAt),
      isCurrentDevice: d.id === currentDeviceId
    }));
  }
  
  // Initial mock data
  const currentDeviceType = getDeviceType();
  const currentPlatform = getPlatform();
  
  const devices: Device[] = [
    {
      id: currentDeviceId,
      name: getDeviceName(currentDeviceType, currentPlatform),
      type: currentDeviceType,
      platform: currentPlatform,
      status: 'online',
      lastActive: new Date(),
      registeredAt: new Date(),
      isCurrentDevice: true,
      metrics: {
        totalEnergyKwh: 0,
        totalWaterBottles: 0,
        avgDailyKwh: 0,
        uptime: 0
      }
    }
  ];
  
  localStorage.setItem('vera_registered_devices', JSON.stringify(devices));
  return devices;
};

export function useDeviceManager() {
  const [state, setState] = useState<DeviceManagerState>({
    devices: [],
    currentDevice: null,
    isLoading: true
  });

  // Initialize devices
  useEffect(() => {
    const deviceId = generateDeviceId();
    const devices = getMockDevices(deviceId);
    const currentDevice = devices.find(d => d.id === deviceId) || null;
    
    setState({
      devices,
      currentDevice,
      isLoading: false
    });

    // Update last active timestamp for current device
    const updateLastActive = () => {
      const updatedDevices = devices.map(d => 
        d.isCurrentDevice 
          ? { ...d, lastActive: new Date(), status: 'online' as const }
          : d
      );
      localStorage.setItem('vera_registered_devices', JSON.stringify(updatedDevices));
    };

    // Update every 30 seconds
    const interval = setInterval(updateLastActive, 30000);
    updateLastActive();

    return () => clearInterval(interval);
  }, []);

  // Simulate real-time sync (in production, this would be Supabase real-time)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setState(prev => {
        const now = new Date();
        const updatedDevices = prev.devices.map(device => {
          if (device.isCurrentDevice) {
            return { ...device, lastActive: now, status: 'online' as const };
          }
          
          // Mark devices as offline if not active for 2 minutes
          const timeSinceActive = now.getTime() - new Date(device.lastActive).getTime();
          const isOffline = timeSinceActive > 120000; // 2 minutes
          
          return {
            ...device,
            status: isOffline ? 'offline' as const : 
                    timeSinceActive > 60000 ? 'idle' as const : 
                    'online' as const
          };
        });
        
        return { ...prev, devices: updatedDevices };
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(syncInterval);
  }, []);

  // Register a new device
  const registerDevice = useCallback((deviceName?: string) => {
    const deviceId = generateDeviceId();
    const deviceType = getDeviceType();
    const platform = getPlatform();
    
    const newDevice: Device = {
      id: deviceId,
      name: deviceName || getDeviceName(deviceType, platform),
      type: deviceType,
      platform,
      status: 'online',
      lastActive: new Date(),
      registeredAt: new Date(),
      isCurrentDevice: false,
      metrics: {
        totalEnergyKwh: 0,
        totalWaterBottles: 0,
        avgDailyKwh: 0,
        uptime: 0
      }
    };

    setState(prev => {
      const updatedDevices = [...prev.devices, newDevice];
      localStorage.setItem('vera_registered_devices', JSON.stringify(updatedDevices));
      return { ...prev, devices: updatedDevices };
    });

    return newDevice;
  }, []);

  // Update device metrics
  const updateDeviceMetrics = useCallback((deviceId: string, metrics: Partial<Device['metrics']>) => {
    setState(prev => {
      const updatedDevices = prev.devices.map(device =>
        device.id === deviceId
          ? { ...device, metrics: { ...device.metrics, ...metrics } }
          : device
      );
      
      localStorage.setItem('vera_registered_devices', JSON.stringify(updatedDevices));
      
      return { 
        ...prev, 
        devices: updatedDevices,
        currentDevice: prev.currentDevice?.id === deviceId
          ? { ...prev.currentDevice, metrics: { ...prev.currentDevice.metrics, ...metrics } }
          : prev.currentDevice
      };
    });
  }, []);

  // Remove a device
  const removeDevice = useCallback((deviceId: string) => {
    setState(prev => {
      const updatedDevices = prev.devices.filter(d => d.id !== deviceId);
      localStorage.setItem('vera_registered_devices', JSON.stringify(updatedDevices));
      return { ...prev, devices: updatedDevices };
    });
  }, []);

  // Rename a device
  const renameDevice = useCallback((deviceId: string, newName: string) => {
    setState(prev => {
      const updatedDevices = prev.devices.map(device =>
        device.id === deviceId ? { ...device, name: newName } : device
      );
      
      localStorage.setItem('vera_registered_devices', JSON.stringify(updatedDevices));
      
      return { 
        ...prev, 
        devices: updatedDevices,
        currentDevice: prev.currentDevice?.id === deviceId
          ? { ...prev.currentDevice, name: newName }
          : prev.currentDevice
      };
    });
  }, []);

  return {
    devices: state.devices,
    currentDevice: state.currentDevice,
    isLoading: state.isLoading,
    registerDevice,
    updateDeviceMetrics,
    removeDevice,
    renameDevice
  };
}
