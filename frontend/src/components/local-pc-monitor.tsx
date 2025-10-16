import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
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
  Laptop
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTauri } from '../hooks/useTauri';
import { cn } from './ui/utils';

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

interface ActiveApp {
  name: string;
  category: string;
  duration: number;
  cpuUsage: number;
  memoryUsage: number;
}

export function LocalPCMonitor() {
  const { invoke, isReady } = useTauri();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, temperature: 0, cores: 8, frequency: 0 },
    gpu: { usage: 0, temperature: 0, memory: 0, memoryTotal: 8192 },
    ram: { used: 0, total: 16384, percentage: 0 },
    disk: { readSpeed: 0, writeSpeed: 0, usage: 0 },
    power: { source: 'ac', batteryPercentage: 100, powerDraw: 0, estimatedTime: 0 },
    system: { uptime: 0, processes: 0, temperature: 0 }
  });

  const [activeApps, setActiveApps] = useState<ActiveApp[]>([]);
  const [cpuHistory, setCpuHistory] = useState<Array<{ time: string; value: number }>>([]);
  const [ramHistory, setRamHistory] = useState<Array<{ time: string; value: number }>>([]);
  const [diskHistory, setDiskHistory] = useState<Array<{ time: string; read: number; write: number }>>([]);

  // Fetch real-time data from Tauri backend
  useEffect(() => {
    if (!isReady) return;

    const updateMetrics = async () => {
      try {
        // Get system metrics from Rust backend
        const systemMetrics = await invoke('get_system_metrics') as SystemMetrics;
        
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        // Convert Rust data structure to component state
        setMetrics({
          cpu: {
            usage: systemMetrics.cpu.usage,
            temperature: systemMetrics.cpu.temperature,
            cores: systemMetrics.cpu.cores,
            frequency: systemMetrics.cpu.frequency
          },
          gpu: {
            usage: systemMetrics.gpu.usage,
            temperature: systemMetrics.gpu.temperature,
            memory: systemMetrics.gpu.memory / (1024 * 1024), // Convert bytes to MB
            memoryTotal: systemMetrics.gpu.memory_total / (1024 * 1024)
          },
          ram: {
            used: systemMetrics.ram.used / (1024 * 1024), // Convert bytes to MB
            total: systemMetrics.ram.total / (1024 * 1024),
            percentage: systemMetrics.ram.percentage
          },
          disk: {
            readSpeed: systemMetrics.disk.read_speed,
            writeSpeed: systemMetrics.disk.write_speed,
            usage: systemMetrics.disk.usage
          },
          power: {
            source: systemMetrics.power.source as 'battery' | 'ac',
            batteryPercentage: systemMetrics.power.battery_percentage,
            powerDraw: systemMetrics.power.power_draw,
            estimatedTime: systemMetrics.power.estimated_time
          },
          system: {
            uptime: systemMetrics.system.uptime,
            processes: systemMetrics.system.processes,
            temperature: systemMetrics.system.temperature
          }
        });

        // Update history charts (keep last 20 points)
        setCpuHistory(prev => {
          const newHistory = [...prev, { time: timeStr, value: systemMetrics.cpu.usage }];
          return newHistory.slice(-20);
        });

        setRamHistory(prev => {
          const newHistory = [...prev, { time: timeStr, value: systemMetrics.ram.percentage }];
          return newHistory.slice(-20);
        });

        setDiskHistory(prev => {
          const newHistory = [...prev, { 
            time: timeStr, 
            read: systemMetrics.disk.read_speed, 
            write: systemMetrics.disk.write_speed 
          }];
          return newHistory.slice(-20);
        });
      } catch (error) {
        console.error('Failed to fetch system metrics:', error);
      }
    };

    // Initial fetch
    updateMetrics();

    // Update every 2 seconds
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, [isReady, invoke]);

  // Fetch active applications from Tauri backend
  useEffect(() => {
    if (!isReady) return;

    const fetchActiveApps = async () => {
      try {
        const apps = await invoke('get_active_applications') as ActiveApp[];
        setActiveApps(apps);
      } catch (error) {
        console.error('Failed to fetch active applications:', error);
      }
    };

    // Initial fetch
    fetchActiveApps();

    // Update every 5 seconds (less frequent than metrics)
    const interval = setInterval(fetchActiveApps, 5000);

    return () => clearInterval(interval);
  }, [isReady, invoke]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 50) return 'text-blue-500';
    if (temp < 70) return 'text-green-500';
    if (temp < 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Development': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Browser': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Media': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
      'Communication': 'bg-green-500/10 text-green-600 border-green-500/20',
      'Design': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  // Category time distribution
  const categoryData = activeApps.reduce((acc, app) => {
    const existing = acc.find(item => item.name === app.category);
    if (existing) {
      existing.value += app.duration;
    } else {
      acc.push({ name: app.category, value: app.duration });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-4">
      {/* System Overview */}
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
            <CardTitle className="text-sm">Active Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {activeApps.map((app, index) => (
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
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Activity Duration by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Activity by Category</CardTitle>
          </CardHeader>
          <CardContent>
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
