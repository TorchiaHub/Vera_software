# VERA - Guida all'uso del System Monitor

## Introduzione
Il sistema di monitoraggio hardware di VERA è ora completamente integrato con il backend Rust/Tauri. Questa guida spiega come utilizzare il sistema e come estenderlo.

## Utilizzo del Hook `useSystemMonitor`

### Importazione

```typescript
import { useSystemMonitor } from '../hooks/useSystemMonitor';
```

### Esempio Base

```typescript
export function MyComponent() {
  const { metrics, applications, isLoading, error } = useSystemMonitor();

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  return (
    <div>
      <p>CPU Usage: {metrics.cpu.usage}%</p>
      <p>RAM Usage: {metrics.ram.percentage}%</p>
      <p>Active Apps: {applications.length}</p>
    </div>
  );
}
```

### Configurazione Avanzata

```typescript
const { metrics, applications, startMonitoring, stopMonitoring } = useSystemMonitor({
  metricsUpdateInterval: 2000,    // Update ogni 2 secondi
  appsUpdateInterval: 5000,       // Update ogni 5 secondi
  autoStart: true                 // Avvia automaticamente il monitoraggio
});
```

### Controllo Manuale

```typescript
// Avvia il monitoraggio
startMonitoring();

// Ferma il monitoraggio
stopMonitoring();

// Aggiorna manualmente i dati
await refetchMetrics();
await refetchApplications();
```

## Utility Functions

Il hook fornisce diverse funzioni di utilità per formattare i dati:

### formatBytes
Formatta i byte in un formato leggibile:
```typescript
import { formatBytes } from '../hooks/useSystemMonitor';

formatBytes(1024);           // "1.00 KB"
formatBytes(1048576);        // "1.00 MB"
formatBytes(1073741824);     // "1.00 GB"
```

### formatUptime
Formatta l'uptime del sistema:
```typescript
import { formatUptime } from '../hooks/useSystemMonitor';

formatUptime(3600);          // "1h 0m"
formatUptime(90000);         // "1d 1h 0m"
```

### formatDuration
Formatta la durata in ore e minuti:
```typescript
import { formatDuration } from '../hooks/useSystemMonitor';

formatDuration(3600);        // "1h 0m"
formatDuration(1800);        // "30m"
```

### getTemperatureColor
Ottiene il colore Tailwind per la temperatura:
```typescript
import { getTemperatureColor } from '../hooks/useSystemMonitor';

getTemperatureColor(45);     // "text-blue-500" (low)
getTemperatureColor(65);     // "text-green-500" (normal)
getTemperatureColor(75);     // "text-yellow-500" (warm)
getTemperatureColor(90);     // "text-red-500" (hot)
```

### getCategoryColor
Ottiene le classi Tailwind per la categoria dell'applicazione:
```typescript
import { getCategoryColor } from '../hooks/useSystemMonitor';

getCategoryColor('Development');     // "bg-blue-500/10 text-blue-600 border-blue-500/20"
getCategoryColor('Browser');         // "bg-purple-500/10 text-purple-600 border-purple-500/20"
```

## Struttura Dati

### SystemMetrics

```typescript
interface SystemMetrics {
  cpu: {
    usage: number;          // 0-100
    temperature: number;    // °C
    cores: number;
    frequency: number;      // MHz
  };
  gpu: {
    usage: number;          // 0-100
    temperature: number;    // °C
    memory: number;         // MB
    memoryTotal: number;    // MB
  };
  ram: {
    used: number;          // MB
    total: number;         // MB
    percentage: number;    // 0-100
  };
  disk: {
    readSpeed: number;     // MB/s
    writeSpeed: number;    // MB/s
    usage: number;         // 0-100
  };
  power: {
    source: 'battery' | 'ac';
    batteryPercentage: number;  // 0-100
    powerDraw: number;          // Watts
    estimatedTime: number;      // seconds
  };
  system: {
    uptime: number;        // seconds
    processes: number;
    temperature: number;   // °C
  };
}
```

### ActiveApplication

```typescript
interface ActiveApplication {
  name: string;              // Nome applicazione
  category: string;          // Development, Browser, Media, Communication, Design, Other
  duration: number;          // Tempo di esecuzione in secondi
  cpuUsage: number;         // Utilizzo CPU 0-100
  memoryUsage: number;      // Memoria usata in MB
}
```

## Esempi Pratici

### Dashboard Minimale

```typescript
import { useSystemMonitor } from '../hooks/useSystemMonitor';

export function SystemDashboard() {
  const { metrics } = useSystemMonitor();

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard 
        title="CPU" 
        value={`${metrics.cpu.usage.toFixed(1)}%`} 
        subtitle={`${metrics.cpu.temperature.toFixed(1)}°C`}
      />
      <MetricCard 
        title="RAM" 
        value={`${metrics.ram.percentage.toFixed(1)}%`} 
        subtitle={`${(metrics.ram.used / 1024).toFixed(1)} GB`}
      />
      <MetricCard 
        title="Power" 
        value={`${metrics.power.powerDraw.toFixed(1)} W`} 
        subtitle={metrics.power.source === 'ac' ? 'AC Power' : 'Battery'}
      />
    </div>
  );
}
```

### Lista Applicazioni

```typescript
import { useSystemMonitor } from '../hooks/useSystemMonitor';

export function ApplicationList() {
  const { applications } = useSystemMonitor();

  return (
    <ul>
      {applications.map((app, index) => (
        <li key={index}>
          <strong>{app.name}</strong> - {app.category}
          <br />
          CPU: {app.cpuUsage.toFixed(1)}% | RAM: {app.memoryUsage} MB
        </li>
      ))}
    </ul>
  );
}
```

### Grafico CPU Real-time

```typescript
import { useSystemMonitor } from '../hooks/useSystemMonitor';
import { useState, useEffect } from 'react';

export function CPUChart() {
  const { metrics } = useSystemMonitor();
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (metrics) {
      setHistory(prev => [...prev, metrics.cpu.usage].slice(-30));
    }
  }, [metrics]);

  return (
    <div>
      {/* Render chart with history data */}
    </div>
  );
}
```

## Performance Tips

1. **Update Frequency**: Non scendere sotto 1000ms (1 secondo) per evitare overhead
2. **History Size**: Mantieni max 20-30 punti dati per i grafici
3. **Conditional Rendering**: Usa `isLoading` e `error` per gestire gli stati
4. **Memoization**: Usa `useMemo` per calcoli costosi sui dati

```typescript
import { useMemo } from 'react';

const averageCPU = useMemo(() => {
  if (!history.length) return 0;
  return history.reduce((a, b) => a + b, 0) / history.length;
}, [history]);
```

## Troubleshooting

### Metriche sempre a 0
- Verifica che il backend Rust sia compilato correttamente
- Controlla i log della console per errori Tauri
- Assicurati che `sysinfo` sia nella versione corretta in Cargo.toml

### Applicazioni non rilevate
- Alcuni processi di sistema potrebbero essere filtrati
- Verifica i permessi dell'applicazione sul sistema operativo
- Controlla la funzione `categorize_application` in Rust

### Performance degradation
- Riduci `metricsUpdateInterval` e `appsUpdateInterval`
- Limita il numero di applicazioni mostrate
- Ottimizza il rendering dei componenti React

## Best Practices

1. ✅ Usa sempre error boundaries intorno ai componenti che usano il monitor
2. ✅ Implementa fallback UI per stati di loading ed errore
3. ✅ Usa `autoStart: false` se il monitoraggio non è necessario all'avvio
4. ✅ Fermati il monitoraggio quando il componente non è visibile
5. ✅ Mantieni la history dei grafici limitata (max 30 punti)

## Esempio Completo

Vedi il file `/components/local-pc-monitor-v2.tsx` per un'implementazione completa con:
- Cards per metriche principali (CPU, GPU, RAM, Power)
- Grafici real-time (Area charts per CPU/RAM, Line chart per Disk I/O)
- Lista applicazioni attive con scroll
- Pie chart per categorie di applicazioni
- Gestione completa di loading ed errori
- Design responsive e accessibile

## Supporto

Per problemi o domande:
1. Consulta la documentazione Tauri: https://tauri.app/
2. Verifica i log Rust in console
3. Controlla `/SYSTEM_MONITORING_INTEGRATION.md` per dettagli tecnici
