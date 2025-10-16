import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Database types
export interface PerformanceData {
  id?: string;
  timestamp: string;
  cpu_usage: number;
  ram_usage: number;
  gpu_usage: number;
  disk_usage: number;
  network_usage: number;
  water_bottles_equivalent: number;
  device_id?: string;
  device_name?: string;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      performance_metrics: {
        Row: PerformanceData;
        Insert: Omit<PerformanceData, 'id' | 'created_at'>;
        Update: Partial<Omit<PerformanceData, 'id' | 'created_at'>>;
      };
    };
  };
}

// Singleton Supabase client
let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createSupabaseClient<Database>(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-app-name': 'VERA',
        },
      },
    });
  }
  return supabaseClient;
};

// Helper to check connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('performance_metrics').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};
