import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Thermometer, 
  Zap, 
  Activity,
  Battery,
  BatteryCharging,
  Fan,
  Monitor,
  Clock,
  Laptop,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  useSystemMonitor, 
  formatUptime, 
  formatDuration, 
  getTemperatureColor,
  getCategoryColor 
} from '../hooks/useSystemMonitor';
import { cn } from './ui/utils';

export function LocalPCMonitor() {
  const { metrics, applications, isLoading, error } = useSystemMonitor({
    metricsUpdateInterval: 2000,
    appsUpdateInterval: 5000,
    autoStart: true
  });

  // Check if we're in preview/browser mode (no Tauri)
  const isPreviewMode = typeof window !== 'undefined' && !(window as any).__TAURI__;

  const [cpuHistory, setCpuHistory] = useState<Array<{ time: string; value: number }>>([]);
  const [ramHistory, setRamHistory] = useState<Array<{ time: string; value: number }>>([]);
  const [diskHistory, setDiskHistory] = useState<Array<{ time: string; read: number; write: number }>>([]);

  // Update history charts when metrics change
  useEffect(() => {
    if (!metrics) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setCpuHistory(prev => {
      const newHistory = [...prev, { time: timeStr, value: metrics.cpu.usage }];
      return newHistory.slice(-20);
    });

    setRamHistory(prev => {
      const newHistory = [...prev, { time: timeStr, value: metrics.ram.percentage }];
      return newHistory.slice(-20);
    });

    setDiskHistory(prev => {
      const newHistory = [...prev, { 
        time: timeStr, 
        read: metrics.disk.readSpeed, 
        write: metrics.disk.writeSpeed 
      }];
      return newHistory.slice(-20);
    });
  }, [metrics]);

  // Calculate category data for pie chart
  const categoryData = applications.reduce((acc, app) => {
    const existing = acc.find(item => item.name === app.category);
    if (existing) {
      existing.value += app.duration;
    } else {
      acc.push({ name: app.category, value: app.duration });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Caricamento dati di sistema...</p>
        </div>
      </div>
    );
  }

  // Check if metrics are available
  if (!metrics) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Caricamento metriche di sistema in corso...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>Modalità Preview:</strong> Stai visualizzando dati simulati. 
            In ambiente Tauri, i dati saranno raccolti dal sistema operativo reale.
          </AlertDescription>
        </Alert>
      )}

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                CPU
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {metrics.cpu.cores} cores
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Usage</span>
                <span className="text-sm">{metrics.cpu.usage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cpu.usage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Temp</p>
                <p className={cn("font-medium", getTemperatureColor(metrics.cpu.temperature))}>
                  {metrics.cpu.temperature.toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Freq</p>
                <p className="font-medium">{metrics.cpu.frequency.toFixed(0)} MHz</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPU Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" />
                GPU
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {(metrics.gpu.memoryTotal / 1024).toFixed(0)} GB
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Usage</span>
                <span className="text-sm">{metrics.gpu.usage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.gpu.usage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Temp</p>
                <p className={cn("font-medium", getTemperatureColor(metrics.gpu.temperature))}>
                  {metrics.gpu.temperature.toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">VRAM</p>
                <p className="font-medium">{(metrics.gpu.memory / 1024).toFixed(1)} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RAM Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-primary" />
                RAM
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {(metrics.ram.total / 1024).toFixed(0)} GB
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Usage</span>
                <span className="text-sm">{metrics.ram.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.ram.percentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Used</p>
                <p className="font-medium">{(metrics.ram.used / 1024).toFixed(1)} GB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Free</p>
                <p className="font-medium">{((metrics.ram.total - metrics.ram.used) / 1024).toFixed(1)} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Power Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Power
              </CardTitle>
              <Badge variant={metrics.power.source === 'ac' ? 'default' : 'secondary'} className="text-xs">
                {metrics.power.source === 'ac' ? (
                  <>
                    <BatteryCharging className="h-3 w-3 mr-1" />
                    AC Power
                  </>
                ) : (
                  <>
                    <Battery className="h-3 w-3 mr-1" />
                    Battery
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Battery</span>
                <span className="text-sm">{metrics.power.batteryPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={metrics.power.batteryPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Draw</p>
                <p className="font-medium">{metrics.power.powerDraw.toFixed(1)} W</p>
              </div>
              <div>
                <p className="text-muted-foreground">Processes</p>
                <p className="font-medium">{metrics.system.processes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Charts */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cpu" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cpu">CPU</TabsTrigger>
                <TabsTrigger value="ram">RAM</TabsTrigger>
                <TabsTrigger value="disk">Disk</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cpu" className="space-y-2">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={cpuHistory}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="time" stroke="currentColor" opacity={0.5} tick={{ fontSize: 10 }} />
                    <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#cpuGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="ram" className="space-y-2">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={ramHistory}>
                    <defs>
                      <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="time" stroke="currentColor" opacity={0.5} tick={{ fontSize: 10 }} />
                    <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#ramGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="disk" className="space-y-2">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={diskHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="time" stroke="currentColor" opacity={0.5} tick={{ fontSize: 10 }} />
                    <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line type="monotone" dataKey="read" stroke="#10b981" name="Read (MB/s)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="write" stroke="#f59e0b" name="Write (MB/s)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Read: {metrics.disk.readSpeed.toFixed(1)} MB/s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Write: {metrics.disk.writeSpeed.toFixed(1)} MB/s</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Hardware Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Hardware Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Temperature Overview */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    CPU Temperature
                  </span>
                  <span className={cn("text-sm", getTemperatureColor(metrics.cpu.temperature))}>
                    {metrics.cpu.temperature.toFixed(1)}°C
                  </span>
                </div>
                <Progress value={(metrics.cpu.temperature / 100) * 100} className="h-1.5" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    GPU Temperature
                  </span>
                  <span className={cn("text-sm", getTemperatureColor(metrics.gpu.temperature))}>
                    {metrics.gpu.temperature.toFixed(1)}°C
                  </span>
                </div>
                <Progress value={(metrics.gpu.temperature / 100) * 100} className="h-1.5" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs flex items-center gap-1">
                    <Laptop className="h-3 w-3" />
                    System Temperature
                  </span>
                  <span className={cn("text-sm", getTemperatureColor(metrics.system.temperature))}>
                    {metrics.system.temperature.toFixed(1)}°C
                  </span>
                </div>
                <Progress value={(metrics.system.temperature / 100) * 100} className="h-1.5" />
              </div>
            </div>

            {/* System Info */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  System Uptime
                </span>
                <span>{formatUptime(metrics.system.uptime)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Fan className="h-3 w-3" />
                  Cooling Status
                </span>
                <Badge variant="outline" className="text-xs">
                  {metrics.cpu.temperature > 70 ? 'High Speed' : 'Normal'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Disk Usage
                </span>
                <span>{metrics.disk.usage.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Applications & Activity Duration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Applications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Active Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {applications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nessuna applicazione attiva rilevata
                </div>
              ) : (
                <div className="space-y-2">
                  {applications.map((app, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm">{app.name}</p>
                          <Badge variant="outline" className={cn("text-xs border", getCategoryColor(app.category))}>
                            {app.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(app.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Cpu className="h-3 w-3" />
                            {app.cpuUsage.toFixed(1)}%
                          </span>
                          <span className="flex items-center gap-1">
                            <MemoryStick className="h-3 w-3" />
                            {app.memoryUsage} MB
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Activity Duration by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Activity by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nessun dato disponibile
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatDuration(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-muted-foreground">{formatDuration(category.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Privacy Note:</strong> Tutti i dati di monitoraggio sono raccolti e salvati localmente sul tuo dispositivo. 
            Nessuna informazione personale o metrica hardware viene inviata a server esterni. VERA utilizza questi dati 
            esclusivamente per calcolare il consumo energetico e fornire statistiche sul tuo utilizzo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
