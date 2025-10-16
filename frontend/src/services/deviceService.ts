import { getSupabaseClient } from '../utils/supabase/client';

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'desktop' | 'laptop' | 'tablet' | 'phone';
  device_id_unique: string;
  os: string;
  last_sync: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Genera un ID univoco per il dispositivo basato su caratteristiche hardware
 */
export function generateDeviceId(): string {
  // Combina vari fattori per creare un ID univoco
  const navigatorInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    maxTouchPoints: navigator.maxTouchPoints,
  };

  const screenInfo = {
    width: screen.width,
    height: screen.height,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
  };

  const combined = JSON.stringify({ ...navigatorInfo, ...screenInfo });
  
  // Crea hash semplice
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return `device_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}

/**
 * Rileva il tipo di dispositivo
 */
export function detectDeviceType(): 'desktop' | 'laptop' | 'tablet' | 'phone' {
  const ua = navigator.userAgent.toLowerCase();
  const screenWidth = screen.width;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'phone';
  }

  // Distingui desktop da laptop basandoti su dimensioni schermo e battery API
  if ('getBattery' in navigator || 'battery' in navigator) {
    return 'laptop';
  }

  if (screenWidth >= 1920) {
    return 'desktop';
  }

  return 'laptop'; // Default
}

/**
 * Rileva sistema operativo
 */
export function detectOS(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.2')) return 'Windows 8';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Windows')) return 'Windows';

  if (ua.includes('Mac OS X')) {
    const version = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1].replace('_', '.');
    return version ? `macOS ${version}` : 'macOS';
  }

  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) {
    const version = ua.match(/Android (\d+)/)?.[1];
    return version ? `Android ${version}` : 'Android';
  }
  if (ua.includes('iOS') || platform.includes('iPhone') || platform.includes('iPad')) {
    const version = ua.match(/OS (\d+)_(\d+)/);
    return version ? `iOS ${version[1]}.${version[2]}` : 'iOS';
  }

  return 'Unknown OS';
}

/**
 * Genera un nome dispositivo user-friendly
 */
export function generateDeviceName(): string {
  const type = detectDeviceType();
  const os = detectOS();
  const timestamp = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

  const typeNames = {
    desktop: 'PC Desktop',
    laptop: 'Laptop',
    tablet: 'Tablet',
    phone: 'Smartphone',
  };

  return `${typeNames[type]} ${os} (${timestamp})`;
}

/**
 * Registra un nuovo dispositivo o aggiorna quello esistente
 */
export async function registerDevice(userId: string): Promise<Device | null> {
  const supabase = getSupabaseClient();
  const deviceIdUnique = generateDeviceId();

  // Controlla se dispositivo già esiste
  const { data: existingDevice } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .eq('device_id_unique', deviceIdUnique)
    .single();

  if (existingDevice) {
    // Aggiorna last_sync
    const { data, error } = await supabase
      .from('devices')
      .update({
        last_sync: new Date().toISOString(),
        is_active: true,
      })
      .eq('id', existingDevice.id)
      .select()
      .single();

    if (error) {
      console.error('Errore aggiornamento dispositivo:', error);
      return null;
    }

    console.log('✅ Dispositivo esistente aggiornato:', data.device_name);
    return data;
  }

  // Registra nuovo dispositivo
  const newDevice = {
    user_id: userId,
    device_name: generateDeviceName(),
    device_type: detectDeviceType(),
    device_id_unique: deviceIdUnique,
    os: detectOS(),
    last_sync: new Date().toISOString(),
    is_active: true,
  };

  const { data, error } = await supabase
    .from('devices')
    .insert([newDevice])
    .select()
    .single();

  if (error) {
    console.error('Errore registrazione dispositivo:', error);
    return null;
  }

  console.log('✅ Nuovo dispositivo registrato:', data.device_name);
  return data;
}

/**
 * Ottieni tutti i dispositivi dell'utente
 */
export async function getUserDevices(userId: string): Promise<Device[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_sync', { ascending: false });

  if (error) {
    console.error('Errore caricamento dispositivi:', error);
    return [];
  }

  return data || [];
}

/**
 * Aggiorna last_sync (heartbeat)
 */
export async function updateDeviceHeartbeat(deviceId: string): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase
    .from('devices')
    .update({
      last_sync: new Date().toISOString(),
    })
    .eq('id', deviceId);
}

/**
 * Verifica se dispositivo è online (last_sync < 5 minuti fa)
 */
export function isDeviceOnline(device: Device): boolean {
  const lastSync = new Date(device.last_sync);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSync.getTime()) / 1000 / 60;
  return diffMinutes < 5;
}

/**
 * Rinomina dispositivo
 */
export async function renameDevice(deviceId: string, newName: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('devices')
    .update({ device_name: newName })
    .eq('id', deviceId);

  if (error) {
    console.error('Errore rinomina dispositivo:', error);
    return false;
  }

  return true;
}

/**
 * Rimuovi dispositivo
 */
export async function removeDevice(deviceId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('devices')
    .delete()
    .eq('id', deviceId);

  if (error) {
    console.error('Errore rimozione dispositivo:', error);
    return false;
  }

  return true;
}

/**
 * Ottieni dispositivo corrente
 */
export async function getCurrentDevice(userId: string): Promise<Device | null> {
  const deviceIdUnique = generateDeviceId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .eq('device_id_unique', deviceIdUnique)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
