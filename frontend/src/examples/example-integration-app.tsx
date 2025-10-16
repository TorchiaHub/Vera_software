/**
 * ESEMPIO: Integrazione completa in App.tsx
 * 
 * Mostra come sostituire il componente LocalPCMonitor esistente
 * con il nuovo OptimizedPerformanceMonitor
 */

import React, { useState } from 'react';
import { OptimizedPerformanceMonitor } from './components/optimized-performance-monitor';
import { LocalPCMonitor } from './components/local-pc-monitor-v2'; // Componente vecchio
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Zap, Activity } from 'lucide-react';

export function PCMonitorTab() {
  const [useOptimized, setUseOptimized] = useState(true);

  return (
    <div className="h-full flex flex-col">
      {/* Toggle per confrontare vecchio vs nuovo */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <span className="font-medium">Monitor Local PC</span>
          {useOptimized && (
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              Ottimizzato
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setUseOptimized(!useOptimized)}
        >
          {useOptimized ? 'Versione Standard' : 'Versione Ottimizzata'}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {useOptimized ? (
          <OptimizedPerformanceMonitor 
            deviceId="main-device-001"
            deviceName="PC Windows Gaming"
          />
        ) : (
          <LocalPCMonitor />
        )}
      </div>
    </div>
  );
}

/**
 * Integrazione minima in App.tsx esistente
 */
export function AppMinimalIntegration() {
  const [activeTab, setActiveTab] = useState('pcmonitor');

  return (
    <div>
      {/* ... resto dell'app ... */}

      {/* Sostituisci questa sezione: */}
      {activeTab === 'pcmonitor' && (
        <div className="h-full p-6 overflow-y-auto">
          {/* PRIMA: */}
          {/* <LocalPCMonitor /> */}

          {/* DOPO: */}
          <OptimizedPerformanceMonitor 
            deviceId="main-device"
            deviceName="PC Windows"
          />
        </div>
      )}

      {/* ... resto dell'app ... */}
    </div>
  );
}

/**
 * Integrazione con gestione device multipli
 */
export function AppWithMultipleDevices() {
  const [activeTab, setActiveTab] = useState('pcmonitor');
  const [selectedDevice, setSelectedDevice] = useState('pc');

  // Mappa device ID
  const deviceConfig = {
    pc: {
      id: 'main-desktop-001',
      name: 'PC Desktop Gaming',
    },
    cellulare: {
      id: 'smartphone-android-001',
      name: 'Samsung Galaxy S23',
    },
    tablet: {
      id: 'tablet-ipad-001',
      name: 'iPad Pro 12.9"',
    },
  };

  return (
    <div>
      {/* ... sidebar con device selector ... */}

      {activeTab === 'pcmonitor' && (
        <div className="h-full p-6 overflow-y-auto">
          <OptimizedPerformanceMonitor 
            deviceId={deviceConfig[selectedDevice].id}
            deviceName={deviceConfig[selectedDevice].name}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Integrazione con controlli avanzati
 */
export function AppWithAdvancedControls() {
  const [activeTab, setActiveTab] = useState('pcmonitor');

  return (
    <div>
      {activeTab === 'pcmonitor' && (
        <div className="h-full flex flex-col">
          {/* Header personalizzato */}
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Monitor Prestazioni Real-Time
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Dashboard ottimizzata con aggiornamento ogni secondo e salvataggio batch ogni 5 minuti
            </p>
          </div>

          {/* Monitor */}
          <div className="flex-1 overflow-y-auto p-6">
            <OptimizedPerformanceMonitor 
              deviceId="main-device"
              deviceName="PC Windows"
            />
          </div>
        </div>
      )}
    </div>
  );
}
