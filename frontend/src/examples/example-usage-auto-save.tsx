/**
 * ESEMPIO 1: Auto-Save con useAutoSavePerformance
 * 
 * Questo esempio mostra come implementare il salvataggio automatico
 * dei dati di performance del PC ogni 30 secondi.
 */

import { useAutoSavePerformance } from '../hooks/usePerformanceData';
import { useSystemMonitor } from '../hooks/useSystemMonitor';
import { SupabaseStatusIndicator } from '../components/supabase-status-indicator';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RefreshCw } from 'lucide-react';

export function AutoSaveExample() {
  // Hook che monitora le prestazioni del sistema (il tuo hook esistente)
  const systemData = useSystemMonitor();

  // Hook per auto-save automatico
  const { isOnline, syncStatus, forceSync, lastSaveTime, isSaving } = useAutoSavePerformance(
    // Funzione che ritorna i dati correnti da salvare
    () => ({
      cpu_usage: systemData.cpu,
      ram_usage: systemData.ram,
      gpu_usage: systemData.gpu,
      disk_usage: systemData.disk,
      network_usage: systemData.network,
      water_bottles_equivalent: calculateWaterBottles(systemData),
    }),
    30000, // Salva ogni 30 secondi
    {
      deviceId: systemData.deviceId,
      deviceName: systemData.deviceName,
      enableAutoSync: true, // Abilita sincronizzazione automatica
    }
  );

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monitor Real-Time con Auto-Save</span>
            <SupabaseStatusIndicator />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Connection */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isOnline ? 'Connesso a Supabase' : 'Modalità Offline'}</span>
          </div>

          {/* Sync Status */}
          {syncStatus.queueSize > 0 && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm">
                {syncStatus.queueSize} record in attesa di sincronizzazione
              </p>
              <Button size="sm" onClick={forceSync} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizza Ora
              </Button>
            </div>
          )}

          {/* Last Save Time */}
          {lastSaveTime && (
            <p className="text-sm text-muted-foreground">
              Ultimo salvataggio: {lastSaveTime.toLocaleTimeString()}
              {isSaving && ' (Salvataggio in corso...)'}
            </p>
          )}

          {/* Current Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="CPU" value={systemData.cpu} />
            <MetricCard label="RAM" value={systemData.ram} />
            <MetricCard label="GPU" value={systemData.gpu} />
            <MetricCard label="Disk" value={systemData.disk} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper per calcolare bottiglie d'acqua
function calculateWaterBottles(data: any): number {
  // La tua formula di conversione
  const totalUsage = (data.cpu + data.ram + data.gpu) / 3;
  return totalUsage * 0.001; // Esempio semplificato
}

// Componente per mostrare una metrica
function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 border rounded-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl">{value.toFixed(1)}%</p>
    </div>
  );
}
