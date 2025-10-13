import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  registerDevice,
  getUserDevices,
  updateDeviceHeartbeat,
  getCurrentDevice,
  renameDevice as renameDeviceService,
  removeDevice as removeDeviceService,
  isDeviceOnline,
  Device,
} from '../services/deviceService';
import { toast } from 'sonner';

export function useDeviceManager() {
  const { user, isAuthenticated } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const heartbeatIntervalRef = useRef<number | null>(null);

  /**
   * Carica dispositivi dell'utente
   */
  const loadDevices = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    const userDevices = await getUserDevices(user.id);
    setDevices(userDevices);
    setIsLoading(false);
  }, [user]);

  /**
   * Registra dispositivo corrente
   */
  const registerCurrentDevice = useCallback(async () => {
    if (!user) return null;

    const device = await registerDevice(user.id);
    
    if (device) {
      setCurrentDevice(device);
      
      // Se è un nuovo dispositivo, mostra notifica
      toast.success(`Dispositivo registrato: ${device.device_name}`, {
        description: `${device.device_type} - ${device.os}`,
      });

      // Ricarica lista dispositivi
      await loadDevices();
      
      // Seleziona automaticamente questo dispositivo
      setSelectedDeviceId(device.id);
    }

    return device;
  }, [user, loadDevices]);

  /**
   * Avvia heartbeat per mantenere dispositivo online
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current !== null) return;

    heartbeatIntervalRef.current = window.setInterval(() => {
      if (currentDevice) {
        updateDeviceHeartbeat(currentDevice.id);
      }
    }, 120000); // Ogni 2 minuti

    console.log('✅ Device heartbeat avviato');
  }, [currentDevice]);

  /**
   * Ferma heartbeat
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current !== null) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
      console.log('⏹️ Device heartbeat fermato');
    }
  }, []);

  /**
   * Rinomina dispositivo
   */
  const renameDevice = useCallback(async (deviceId: string, newName: string) => {
    const success = await renameDeviceService(deviceId, newName);
    
    if (success) {
      toast.success('Dispositivo rinominato');
      await loadDevices();
      
      // Aggiorna currentDevice se è quello rinominato
      if (currentDevice?.id === deviceId) {
        setCurrentDevice({ ...currentDevice, device_name: newName });
      }
    } else {
      toast.error('Errore durante la rinomina');
    }

    return success;
  }, [loadDevices, currentDevice]);

  /**
   * Rimuovi dispositivo
   */
  const removeDevice = useCallback(async (deviceId: string) => {
    // Non permettere rimozione del dispositivo corrente
    if (currentDevice?.id === deviceId) {
      toast.error('Non puoi rimuovere il dispositivo corrente');
      return false;
    }

    const success = await removeDeviceService(deviceId);
    
    if (success) {
      toast.success('Dispositivo rimosso');
      await loadDevices();
      
      // Se era selezionato, deseleziona
      if (selectedDeviceId === deviceId) {
        setSelectedDeviceId(currentDevice?.id || null);
      }
    } else {
      toast.error('Errore durante la rimozione');
    }

    return success;
  }, [loadDevices, currentDevice, selectedDeviceId]);

  /**
   * Ottieni dispositivo selezionato
   */
  const getSelectedDevice = useCallback(() => {
    if (!selectedDeviceId) return currentDevice;
    return devices.find(d => d.id === selectedDeviceId) || currentDevice;
  }, [selectedDeviceId, devices, currentDevice]);

  /**
   * Inizializzazione
   */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setDevices([]);
      setCurrentDevice(null);
      setSelectedDeviceId(null);
      stopHeartbeat();
      return;
    }

    // Registra dispositivo corrente
    registerCurrentDevice();
    
    // Carica dispositivi
    loadDevices();

    // Avvia heartbeat
    startHeartbeat();

    return () => {
      stopHeartbeat();
    };
  }, [isAuthenticated, user]);

  /**
   * Ricarica periodica dispositivi (ogni 30 secondi)
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadDevices();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loadDevices]);

  return {
    devices,
    currentDevice,
    selectedDeviceId,
    isLoading,
    setSelectedDeviceId,
    getSelectedDevice,
    renameDevice,
    removeDevice,
    loadDevices,
    isDeviceOnline,
  };
}
