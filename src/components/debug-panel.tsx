import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp, Bug, Database, Wifi, WifiOff, Activity } from 'lucide-react';
import { batchService } from '../services/batchService';

interface DebugPanelProps {
  isOnline: boolean;
  isTauriAvailable: boolean;
  stats: {
    totalCollected: number;
    totalSaved: number;
    totalErrors: number;
    lastCollection: Date | null;
    lastSave: Date | null;
    lastAnomaly: { type: string; value: number; timestamp: Date } | null;
  };
  batchSize: number;
  currentData: any;
  onForceFlush: () => Promise<void>;
}

export function DebugPanel({
  isOnline,
  isTauriAvailable,
  stats,
  batchSize,
  currentData,
  onForceFlush,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const batchStats = batchService.getStats();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Bug className="w-4 h-4 mr-2" />
          Debug Panel
          {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Sistema di Raccolta Dati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Status Connessioni */}
            <div className="space-y-2">
              <p className="text-xs opacity-70">Status Connessioni</p>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span>Supabase: {isOnline ? 'Online ✓' : 'Offline ✗'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Tauri API: {isTauriAvailable ? 'Disponibile ✓' : 'Non disponibile ✗'}</span>
              </div>
            </div>

            {/* Statistiche Raccolta */}
            <div className="space-y-2 border-t pt-2">
              <p className="text-xs opacity-70">Statistiche Raccolta</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="opacity-70">Dati raccolti:</p>
                  <Badge variant="secondary">{stats.totalCollected}</Badge>
                </div>
                <div>
                  <p className="opacity-70">Dati salvati:</p>
                  <Badge variant="secondary">{stats.totalSaved}</Badge>
                </div>
                <div>
                  <p className="opacity-70">Errori:</p>
                  <Badge variant={stats.totalErrors > 0 ? 'destructive' : 'secondary'}>
                    {stats.totalErrors}
                  </Badge>
                </div>
                <div>
                  <p className="opacity-70">In batch:</p>
                  <Badge variant="secondary">{batchSize}</Badge>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="space-y-2 border-t pt-2">
              <p className="text-xs opacity-70">Timestamp</p>
              <div>
                <p className="opacity-70">Ultima raccolta:</p>
                <p>{stats.lastCollection?.toLocaleString() || 'Mai'}</p>
              </div>
              <div>
                <p className="opacity-70">Ultimo salvataggio:</p>
                <p>{stats.lastSave?.toLocaleString() || 'Mai'}</p>
              </div>
            </div>

            {/* Ultima Anomalia */}
            {stats.lastAnomaly && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs opacity-70">Ultima Anomalia</p>
                <div className="bg-yellow-100 dark:bg-yellow-950 p-2 rounded-md">
                  <p>Tipo: {stats.lastAnomaly.type}</p>
                  <p>Valore: {stats.lastAnomaly.value.toFixed(1)}%</p>
                  <p>Quando: {stats.lastAnomaly.timestamp.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Batch Stats */}
            <div className="space-y-2 border-t pt-2">
              <p className="text-xs opacity-70">Batch Service</p>
              <div>
                <p className="opacity-70">Dimensione: {batchStats.size}</p>
                <p className="opacity-70">
                  Ultimo flush: {new Date(batchStats.lastFlush).toLocaleTimeString()}
                </p>
                <p className="opacity-70">
                  Tempo da ultimo flush: {Math.floor(batchStats.timeSinceLastFlush / 1000)}s
                </p>
              </div>
            </div>

            {/* Dati Correnti */}
            {currentData && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs opacity-70">Dati Correnti</p>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(currentData, null, 2)}
                </pre>
              </div>
            )}

            {/* Azioni */}
            <div className="space-y-2 border-t pt-2">
              <Button onClick={onForceFlush} size="sm" className="w-full">
                Force Flush Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
