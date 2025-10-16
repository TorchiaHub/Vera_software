import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Wifi, 
  WifiOff, 
  Clock, 
  Zap,
  Droplet,
  Activity,
  Edit2,
  Trash2,
  Check,
  X,
  Info
} from 'lucide-react';
import { useDeviceManager, Device } from '../hooks/useDeviceManager';
import { cn } from './ui/utils';

interface DevicesPanelProps {
  embedded?: boolean;
}

export function DevicesPanel({ embedded = true }: DevicesPanelProps) {
  const { devices, currentDevice, isLoading, removeDevice, renameDevice } = useDeviceManager();
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'desktop':
        return Laptop;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Laptop;
    }
  };

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'idle':
        return 'text-yellow-500';
      case 'offline':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: Device['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Online</Badge>;
      case 'idle':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Idle</Badge>;
      case 'offline':
        return <Badge variant="outline" className="text-muted-foreground">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleStartEdit = (device: Device) => {
    setEditingDeviceId(device.id);
    setEditName(device.name);
  };

  const handleSaveEdit = (deviceId: string) => {
    if (editName.trim()) {
      renameDevice(deviceId, editName.trim());
    }
    setEditingDeviceId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingDeviceId(null);
    setEditName('');
  };

  const handleRemove = (deviceId: string) => {
    if (confirm('Sei sicuro di voler rimuovere questo dispositivo?')) {
      removeDevice(deviceId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <Activity className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Caricamento dispositivi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", embedded && "h-full overflow-y-auto")}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">I Miei Dispositivi</h2>
        <p className="text-sm text-muted-foreground">
          Visualizza e gestisci tutti i dispositivi collegati al tuo account VERA. 
          Ogni dispositivo monitora il proprio consumo energetico in modo indipendente.
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Architettura Distribuita
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Tutti i dispositivi sono alla pari. Nessuno funge da centro di controllo. 
                I dati vengono sincronizzati automaticamente tra tutti i device collegati.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dispositivi Totali</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.status === 'online').length}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Totale</p>
                <p className="text-2xl font-bold">
                  {devices.reduce((sum, d) => sum + d.metrics.totalEnergyKwh, 0).toFixed(2)} kWh
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices List */}
      <div className="space-y-3">
        <h3 className="font-medium">Dispositivi Registrati</h3>
        
        {devices.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Laptop className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessun dispositivo registrato
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {devices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.type);
              const isEditing = editingDeviceId === device.id;

              return (
                <Card 
                  key={device.id} 
                  className={cn(
                    "transition-all",
                    device.isCurrentDevice && "border-primary bg-primary/5"
                  )}
                >
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Device Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            "p-2 rounded-lg",
                            device.isCurrentDevice 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted"
                          )}>
                            <DeviceIcon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="Nome dispositivo"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSaveEdit(device.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEdit}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium truncate">{device.name}</h4>
                                  {device.isCurrentDevice && (
                                    <Badge variant="outline" className="text-xs">
                                      Questo dispositivo
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {device.platform} • {device.type}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(device.status)}
                          {!device.isCurrentDevice && !isEditing && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(device)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(device.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Device Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Ultima attività</span>
                          </div>
                          <p className="text-sm font-medium">
                            {formatLastActive(device.lastActive)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            <span>Energia totale</span>
                          </div>
                          <p className="text-sm font-medium">
                            {device.metrics.totalEnergyKwh.toFixed(2)} kWh
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Droplet className="h-3 w-3" />
                            <span>Bottiglie</span>
                          </div>
                          <p className="text-sm font-medium">
                            {device.metrics.totalWaterBottles.toFixed(0)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            <span>Media giornaliera</span>
                          </div>
                          <p className="text-sm font-medium">
                            {device.metrics.avgDailyKwh.toFixed(2)} kWh
                          </p>
                        </div>
                      </div>

                      {/* Device ID (for debugging) */}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground font-mono">
                          ID: {device.id}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <Card className="border-muted">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Come funziona la sincronizzazione</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Ogni dispositivo monitora autonomamente il proprio consumo energetico</li>
              <li>• I dati vengono sincronizzati automaticamente tra tutti i device collegati</li>
              <li>• Non esiste un "centro di controllo" - tutti i device sono alla pari</li>
              <li>• Lo stato (online/offline/idle) viene aggiornato in tempo reale</li>
              <li>• Puoi rinominare o rimuovere dispositivi da qualsiasi device</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
