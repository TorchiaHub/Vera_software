import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Thermometer, 
  Zap, 
  Activity,
  Laptop,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSystemMonitorReal } from '../hooks/useSystemMonitorReal';
import { Button } from './ui/button';

/**
 * REAL PC Monitor - NO MOCK DATA
 * Displays actual system metrics from Tauri backend
 */
export function LocalPCMonitorReal() {
  const { 
    metrics, 
    applications, 
    isLoading, 
    error, 
    lastUpdate,
    isTauriAvailable,
    refresh 
  } = useSystemMonitorReal();

  const [cpuHistory, setCpuHistory] = useState<Array<{ time: string; value: number }>>([]);
  const [ramHistory, setRamHistory] = useState<Array<{ time: string; value: number }>>([]);

  // Update history charts when metrics change
  useEffect(() => {
    if (!metrics) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    console.log(`📈 VERA: Updating charts - CPU: ${metrics.cpu.usage.toFixed(1)}%, RAM: ${metrics.ram.percentage.toFixed(1)}%`);

    setCpuHistory(prev => {
      const newHistory = [...prev, { time: timeStr, value: Math.round(metrics.cpu.usage) }];
      return newHistory.slice(-30); // Keep last 30 points
    });

    setRamHistory(prev => {
      const newHistory = [...prev, { time: timeStr, value: Math.round(metrics.ram.percentage) }];
      return newHistory.slice(-30);
    });
  }, [metrics]);

  // Show error if Tauri not available
  if (!isTauriAvailable) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-semibold mb-2">Tauri API non disponibile</p>
          <p className="text-sm mb-2">
            Per vedere i dati reali del PC, avvia l'applicazione con:
          </p>
          <code className="block bg-black text-white p-2 rounded text-xs">
            npm run tauri:dev
          </code>
          <p className="text-xs mt-2 opacity-70">
            Attualmente stai visualizzando l'app in modalità web browser senza backend Tauri.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            Lettura dati di sistema dal backend Tauri...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-semibold">Errore lettura sistema</p>
          <p className="text-sm">{error}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={refresh}>
            <RefreshCw className="h-3 w-3 mr-2" />
            Riprova
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No data available
  if (!metrics) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nessun dato disponibile. Attendere raccolta metriche...
        </AlertDescription>
      </Alert>
    );
  }

  const formatBytes = (bytes: number): string => {
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header with last update */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Laptop className="h-6 w-6" />
            Monitor Prestazioni PC
          </h2>
          <p className="text-sm text-muted-foreground">
            Dati reali raccolti ogni 2 secondi
          </p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="gap-2">
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            Connesso a Tauri
          </Badge>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              Ultimo aggiornamento: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Processore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold">
                    {metrics.cpu.usage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {metrics.cpu.cores} cores
                  </span>
                </div>
                <Progress 
                  value={metrics.cpu.usage} 
                  className={metrics.cpu.usage > 80 ? 'bg-red-200' : ''}
                />
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequenza:</span>
                  <span>{metrics.cpu.frequency} MHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperatura:</span>
                  <span>{metrics.cpu.temperature.toFixed(1)}°C</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RAM Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              Memoria RAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold">
                    {metrics.ram.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={metrics.ram.percentage} 
                  className={metrics.ram.percentage > 85 ? 'bg-red-200' : ''}
                />
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In uso:</span>
                  <span>{formatBytes(metrics.ram.used)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Totale:</span>
                  <span>{formatBytes(metrics.ram.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPU Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Scheda Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold">
                    {metrics.gpu.usage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.gpu.usage} />
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VRAM:</span>
                  <span>{formatBytes(metrics.gpu.memory)} / {formatBytes(metrics.gpu.memory_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperatura:</span>
                  <span>{metrics.gpu.temperature.toFixed(1)}°C</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disk Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Disco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold">
                    {metrics.disk.usage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={metrics.disk.usage}
                  className={metrics.disk.usage > 90 ? 'bg-red-200' : ''}
                />
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lettura:</span>
                  <span>{metrics.disk.read_speed.toFixed(1)} MB/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scrittura:</span>
                  <span>{metrics.disk.write_speed.toFixed(1)} MB/s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">CPU - Ultimi 60 secondi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  interval="preserveEnd"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* RAM History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">RAM - Ultimi 60 secondi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ramHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  interval="preserveEnd"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Informazioni Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-semibold">{formatUptime(metrics.system.uptime)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Processi</p>
              <p className="font-semibold">{metrics.system.processes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Temperatura</p>
              <p className="font-semibold">{metrics.system.temperature.toFixed(1)}°C</p>
            </div>
            <div>
              <p className="text-muted-foreground">Potenza</p>
              <p className="font-semibold">{metrics.power.power_draw.toFixed(1)}W</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Applications */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Applicazioni Attive (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {applications.map((app, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{app.category}</Badge>
                    <span className="text-sm font-medium">{app.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-4">
                    <span>CPU: {app.cpu_usage.toFixed(1)}%</span>
                    <span>RAM: {app.memory_usage} MB</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Debug:</strong> Dati ricevuti da Tauri backend in tempo reale.
          Nessun dato simulato o random. Frequenza aggiornamento: 2 secondi.
          {lastUpdate && ` Ultima lettura: ${lastUpdate.toLocaleTimeString()}`}
        </AlertDescription>
      </Alert>
    </div>
  );
}
