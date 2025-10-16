import { useEffect, useState } from 'react';
import { checkSupabaseConnection } from '../utils/supabase/client';
import { getSyncStatus } from '../services/syncService';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SupabaseStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const SupabaseStatusIndicator = ({
  showDetails = false,
  className = '',
}: SupabaseStatusIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      const connected = await checkSupabaseConnection();
      setIsOnline(connected);
      setSyncStatus(getSyncStatus());
      setLastChecked(new Date());
    };

    // Controlla subito
    checkStatus();

    // Poi ogni 10 secondi
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (syncStatus.queueSize > 0) return 'warning';
    return 'default';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Sincronizzazione...';
    if (syncStatus.queueSize > 0) return `${syncStatus.queueSize} in coda`;
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <CloudOff className="w-3 h-3" />;
    if (syncStatus.queueSize > 0) return <AlertCircle className="w-3 h-3" />;
    return <Cloud className="w-3 h-3" />;
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getStatusColor() as any} className={`gap-1 ${className}`}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p>
                <strong>Stato:</strong> {isOnline ? 'Connesso a Supabase' : 'Offline'}
              </p>
              {syncStatus.queueSize > 0 && (
                <p>
                  <strong>Coda:</strong> {syncStatus.queueSize} record da sincronizzare
                </p>
              )}
              <p className="text-muted-foreground">
                Ultimo controllo: {lastChecked.toLocaleTimeString()}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-sm">
          {isOnline ? 'Connesso a Supabase' : 'Modalità offline'}
        </span>
      </div>

      {syncStatus.queueSize > 0 && (
        <div className="text-xs text-muted-foreground">
          {syncStatus.queueSize} record in attesa di sincronizzazione
        </div>
      )}

      {syncStatus.isSyncing && (
        <div className="text-xs text-blue-500">Sincronizzazione in corso...</div>
      )}

      {syncStatus.problemRecords > 0 && (
        <div className="text-xs text-yellow-600">
          {syncStatus.problemRecords} record con problemi
        </div>
      )}
    </div>
  );
};
