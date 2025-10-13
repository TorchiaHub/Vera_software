import { useState } from 'react';
import { useOptimizedPerformanceCollection } from '../hooks/useOptimizedPerformanceCollection';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { PerformanceIndicator } from './performance-indicator';
import { RealtimeChart } from './realtime-chart';
import { DebugPanel } from './debug-panel';
import { SupabaseStatusIndicator } from './supabase-status-indicator';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  Laptop, 
  HardDrive, 
  Network,
  Droplet,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface OptimizedPerformanceMonitorProps {
  deviceId?: string;
  deviceName?: string;
}

export function OptimizedPerformanceMonitor({
  deviceId = 'main-device',
  deviceName = 'PC Windows',
}: OptimizedPerformanceMonitorProps) {
  const {
    currentData,
    waterBottles,
    realtimeBuffer,
    isOnline,
    isTauriAvailable,
    stats,
    batchSize,
    forceFlush,
    pauseCollection,
    resumeCollection,
    isPaused,
  } = useOptimizedPerformanceCollection(deviceId, deviceName);

  const [showDebug, setShowDebug] = useState(false);

  // Gestione errori
  if (!isTauriAvailable) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Tauri API Non Disponibile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            L'applicazione non riesce a comunicare con il backend Tauri per raccogliere i dati delle prestazioni.
          </p>
          <div className="bg-muted p-3 rounded-md text-xs space-y-1">
            <p><strong>Possibili cause:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>L'app non è in esecuzione tramite Tauri</li>
              <li>Il comando <code>get_system_metrics</code> non è registrato</li>
              <li>Il backend Rust ha errori</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
          <p className="text-muted-foreground">Raccolta dati in corso...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Status e Controlli */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Monitor Prestazioni Real-Time
            </CardTitle>
            <div className="flex items-center gap-2">
              <SupabaseStatusIndicator />
              {batchSize > 0 && (
                <Badge variant="secondary">
                  {batchSize} in batch
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={isPaused ? resumeCollection : pauseCollection}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Riprendi
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausa
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={forceFlush}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alert Modalità Offline */}
      {!isOnline && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Modalità Offline</p>
                <p className="text-sm">I dati verranno sincronizzati quando la connessione verrà ripristinata</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicatori Principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceIndicator
              label="Utilizzo Processore"
              value={currentData.cpu_usage}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MemoryStick className="w-4 h-4" />
              RAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceIndicator
              label="Memoria Sistema"
              value={currentData.ram_usage}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Laptop className="w-4 h-4" />
              GPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceIndicator
              label="Scheda Video"
              value={currentData.gpu_usage}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Disco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceIndicator
              label="Utilizzo Disco"
              value={currentData.disk_usage}
            />
          </CardContent>
        </Card>
      </div>

      {/* Grafici Real-Time (ultimi 60 secondi) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RealtimeChart
          data={realtimeBuffer}
          dataKey="cpu"
          title="CPU - Ultimi 60 Secondi"
          color="#3b82f6"
        />
        <RealtimeChart
          data={realtimeBuffer}
          dataKey="ram"
          title="RAM - Ultimi 60 Secondi"
          color="#10b981"
        />
        <RealtimeChart
          data={realtimeBuffer}
          dataKey="gpu"
          title="GPU - Ultimi 60 Secondi"
          color="#f59e0b"
        />
        <RealtimeChart
          data={realtimeBuffer}
          dataKey="disk"
          title="Disco - Ultimi 60 Secondi"
          color="#8b5cf6"
        />
      </div>

      {/* Network e Consumo Energetico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="w-4 h-4" />
              Rete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Download</span>
              <div className="flex items-center gap-2">
                <span className="text-xl text-blue-600 dark:text-blue-400">
                  {currentData.network_download.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">MB/s</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Upload</span>
              <div className="flex items-center gap-2">
                <span className="text-xl text-green-600 dark:text-green-400">
                  {currentData.network_upload.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">MB/s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              Consumo Energetico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Droplet className="w-8 h-8 text-blue-500" />
                <span className="text-4xl text-blue-600 dark:text-blue-400">
                  {waterBottles.toFixed(4)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                bottiglie d'acqua/sec (500ml)
              </p>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground">
                Stima basata sul consumo energetico reale dei componenti
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Statistiche Sessione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Dati Raccolti</p>
              <p className="text-2xl">{stats.totalCollected}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Salvati su DB</p>
              <p className="text-2xl">{stats.totalSaved}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Errori</p>
              <p className={`text-2xl ${stats.totalErrors > 0 ? 'text-red-600' : ''}`}>
                {stats.totalErrors}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Anomalie</p>
              <p className="text-2xl">
                {stats.lastAnomaly ? '1' : '0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel */}
      <DebugPanel
        isOnline={isOnline}
        isTauriAvailable={isTauriAvailable}
        stats={stats}
        batchSize={batchSize}
        currentData={currentData}
        onForceFlush={forceFlush}
      />
    </div>
  );
}
