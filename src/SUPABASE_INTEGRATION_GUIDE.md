# 🚀 VERA - Guida Integrazione Supabase

## 📋 Indice

1. [Setup Iniziale](#setup-iniziale)
2. [Configurazione Database](#configurazione-database)
3. [Utilizzo nell'Applicazione](#utilizzo-nellapplicazione)
4. [Esempi Pratici](#esempi-pratici)
5. [Sistema di Fallback Offline](#sistema-di-fallback-offline)
6. [Troubleshooting](#troubleshooting)

---

## 🛠️ Setup Iniziale

### 1. Installa le dipendenze

```bash
npm install @supabase/supabase-js
```

### 2. Configura le variabili d'ambiente

Copia il file `.env.example` in `.env`:

```bash
cp .env.example .env
```

Compila le seguenti variabili nel file `.env`:

```env
VITE_SUPABASE_URL=https://[TUO_PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Come ottenere le credenziali:**

1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto (o creane uno nuovo)
3. Vai su **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon/public` → `VITE_SUPABASE_ANON_KEY`

### 3. Crea il database

Vai nel tuo progetto Supabase:

1. **SQL Editor** (nella sidebar)
2. Clicca **New Query**
3. Copia e incolla il contenuto di `/database-schema.sql`
4. Clicca **Run** (o `Ctrl+Enter`)

Questo creerà:
- ✅ Tabella `performance_metrics`
- ✅ Indici per query ottimizzate
- ✅ Funzioni SQL per statistiche aggregate
- ✅ View per dashboard

---

## 📊 Configurazione Database

### Struttura Tabella

```sql
performance_metrics
├── id (UUID, primary key)
├── timestamp (TIMESTAMPTZ) - momento della misurazione
├── cpu_usage (REAL) - 0-100%
├── ram_usage (REAL) - 0-100%
├── gpu_usage (REAL) - 0-100%
├── disk_usage (REAL) - 0-100%
├── network_usage (REAL) - MB/s
├── water_bottles_equivalent (REAL) - bottiglie da 500ml
├── device_id (TEXT) - ID univoco dispositivo
├── device_name (TEXT) - nome dispositivo
└── created_at (TIMESTAMPTZ) - timestamp inserimento
```

### Funzioni SQL Disponibili

#### 1. `get_performance_stats()` - Statistiche aggregate

```sql
SELECT * FROM get_performance_stats(
  'device-123',                    -- device_id (opzionale)
  NOW() - INTERVAL '24 hours',     -- data inizio
  NOW()                             -- data fine
);
```

Ritorna:
- Media CPU, RAM, GPU, Disk, Network
- Totale bottiglie d'acqua
- Massimi CPU, RAM, GPU
- Conteggio record

#### 2. `get_hourly_performance()` - Dati aggregati per ora

```sql
SELECT * FROM get_hourly_performance(
  'device-123',  -- device_id (opzionale)
  24             -- ore da recuperare
);
```

Perfetto per generare grafici!

#### 3. `cleanup_old_metrics()` - Pulizia automatica

```sql
SELECT cleanup_old_metrics(90);  -- Elimina record più vecchi di 90 giorni
```

---

## 💻 Utilizzo nell'Applicazione

### Hook Principale: `usePerformanceData`

```tsx
import { usePerformanceData } from './hooks/usePerformanceData';

function MyComponent() {
  const {
    savePerformanceData,
    fetchHistoricalData,
    isOnline,
    isSaving,
    lastSaveTime,
    syncStatus,
    forceSync,
    clearCache,
  } = usePerformanceData({
    autoSaveInterval: 30000,     // 30 secondi
    enableAutoSync: true,         // Sincronizzazione automatica
    deviceId: 'my-device-123',
    deviceName: 'PC Gaming',
  });

  // ... usa le funzioni
}
```

### Salvataggio Dati

```tsx
// Salvataggio manuale
const handleSave = async () => {
  const success = await savePerformanceData({
    cpu_usage: 45.2,
    ram_usage: 67.8,
    gpu_usage: 32.1,
    disk_usage: 85.5,
    network_usage: 12.4,
    water_bottles_equivalent: 0.023,
  });

  if (success) {
    console.log('✅ Dati salvati!');
  }
};
```

### Recupero Dati Storici

```tsx
// Ultimi 100 record
const data = await fetchHistoricalData();

// Con filtri
const filteredData = await fetchHistoricalData({
  limit: 50,
  startDate: new Date('2025-01-01'),
  endDate: new Date(),
  deviceId: 'my-device-123',
});
```

### Hook Auto-Save

Per salvare automaticamente ogni N secondi:

```tsx
import { useAutoSavePerformance } from './hooks/usePerformanceData';

function MonitorComponent() {
  const [metrics, setMetrics] = useState({...});

  // Salva automaticamente ogni 30s
  const { isOnline, syncStatus } = useAutoSavePerformance(
    () => ({
      cpu_usage: metrics.cpu,
      ram_usage: metrics.ram,
      gpu_usage: metrics.gpu,
      disk_usage: metrics.disk,
      network_usage: metrics.network,
      water_bottles_equivalent: metrics.waterBottles,
    }),
    30000, // 30 secondi
    {
      deviceId: 'my-device',
      deviceName: 'PC Windows',
    }
  );

  return <div>Online: {isOnline ? '✅' : '❌'}</div>;
}
```

---

## 🔌 Sistema di Fallback Offline

### Come Funziona

1. **Online** → Salva direttamente su Supabase
2. **Offline** → Salva in localStorage (coda locale)
3. **Torna Online** → Sincronizza automaticamente la coda

### Servizi Disponibili

#### LocalStorage Service

```tsx
import {
  queueDataLocally,
  getLocalQueue,
  clearLocalQueue,
  getQueueStats,
} from './services/localStorageService';

// Salva in coda locale
queueDataLocally(performanceData);

// Ottieni statistiche coda
const stats = getQueueStats();
console.log(`${stats.total} record in coda`);
```

#### Sync Service

```tsx
import {
  startAutoSync,
  stopAutoSync,
  forceSyncNow,
  getSyncStatus,
} from './services/syncService';

// Avvia sincronizzazione automatica (ogni 1 minuto)
startAutoSync(60000);

// Forza sincronizzazione immediata
await forceSyncNow();

// Controlla stato
const status = getSyncStatus();
console.log(`Coda: ${status.queueSize}, Attivo: ${status.isActive}`);
```

### Componente Status Indicator

```tsx
import { SupabaseStatusIndicator } from './components/supabase-status-indicator';

function Header() {
  return (
    <div>
      {/* Versione compatta con tooltip */}
      <SupabaseStatusIndicator />

      {/* Versione dettagliata */}
      <SupabaseStatusIndicator showDetails />
    </div>
  );
}
```

---

## 📚 Esempi Pratici

### Esempio 1: Monitor Real-Time con Auto-Save

```tsx
import { useAutoSavePerformance } from './hooks/usePerformanceData';
import { useSystemMonitor } from './hooks/useSystemMonitor';

function RealtimeMonitor() {
  const systemData = useSystemMonitor();
  
  const { isOnline, syncStatus, forceSync } = useAutoSavePerformance(
    () => ({
      cpu_usage: systemData.cpu,
      ram_usage: systemData.ram,
      gpu_usage: systemData.gpu,
      disk_usage: systemData.disk,
      network_usage: systemData.network,
      water_bottles_equivalent: systemData.waterBottles,
    }),
    30000, // Salva ogni 30 secondi
    {
      deviceId: systemData.deviceId,
      deviceName: systemData.deviceName,
    }
  );

  return (
    <div>
      <h2>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</h2>
      {syncStatus.queueSize > 0 && (
        <button onClick={forceSync}>
          Sincronizza {syncStatus.queueSize} record
        </button>
      )}
    </div>
  );
}
```

### Esempio 2: Dashboard con Grafici Storici

```tsx
import { usePerformanceData } from './hooks/usePerformanceData';
import { useEffect, useState } from 'react';

function Dashboard() {
  const { fetchHistoricalData } = usePerformanceData();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // Ultimi 7 giorni
      const data = await fetchHistoricalData({
        limit: 1000,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
      
      setChartData(data);
    };

    loadData();
  }, [fetchHistoricalData]);

  return (
    <div>
      {/* Usa recharts per visualizzare chartData */}
      <h2>Storico Ultimi 7 Giorni</h2>
      {/* ... grafici ... */}
    </div>
  );
}
```

### Esempio 3: Multi-Dispositivo

```tsx
import { usePerformanceData } from './hooks/usePerformanceData';

function MultiDeviceDashboard() {
  const { fetchHistoricalData } = usePerformanceData();
  const [devices, setDevices] = useState<string[]>([]);

  const loadDeviceData = async (deviceId: string) => {
    const data = await fetchHistoricalData({
      deviceId,
      limit: 100,
    });
    return data;
  };

  return (
    <div>
      {devices.map(deviceId => (
        <DeviceCard
          key={deviceId}
          deviceId={deviceId}
          loadData={() => loadDeviceData(deviceId)}
        />
      ))}
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Problema: "Failed to connect to Supabase"

**Soluzione:**
1. Verifica che `.env` sia configurato correttamente
2. Controlla che le variabili inizino con `VITE_`
3. Riavvia il dev server: `npm run dev`
4. Verifica che il progetto Supabase sia attivo

### Problema: "Insert failed - permission denied"

**Soluzione:**
1. Vai su Supabase Dashboard → Authentication → Policies
2. Disabilita RLS temporaneamente per test:
   ```sql
   ALTER TABLE performance_metrics DISABLE ROW LEVEL SECURITY;
   ```
3. Oppure crea policy permissiva:
   ```sql
   CREATE POLICY "Allow all" ON performance_metrics FOR ALL USING (true);
   ```

### Problema: "Coda locale piena"

**Soluzione:**
```tsx
import { forceSyncNow, clearLocalQueue } from './services/syncService';

// Prova a sincronizzare
await forceSyncNow();

// Se persiste, pulisci manualmente
clearLocalQueue();
```

### Problema: "Dati non sincronizzati"

**Soluzione:**
1. Controlla console browser per errori
2. Verifica connessione internet
3. Controlla status sync:
   ```tsx
   const status = getSyncStatus();
   console.log(status);
   ```
4. Forza sync manuale:
   ```tsx
   await forceSyncNow();
   ```

---

## 📈 Best Practices

### 1. Intervallo di Salvataggio

- **Sviluppo:** 10-30 secondi (per test)
- **Produzione:** 30-60 secondi (bilanciamento tra precisione e carico DB)

### 2. Pulizia Dati Vecchi

Imposta un cron job per pulire record vecchi:

```sql
-- Esegui settimanalmente
SELECT cleanup_old_metrics(90); -- Mantieni 90 giorni
```

### 3. Monitoraggio Coda

Mostra sempre lo status della coda all'utente:

```tsx
<SupabaseStatusIndicator showDetails />
```

### 4. Gestione Errori

```tsx
const { savePerformanceData } = usePerformanceData();

try {
  const success = await savePerformanceData(data);
  if (!success) {
    // Notifica utente: "Salvato in locale, sincronizzeremo dopo"
  }
} catch (error) {
  console.error('Errore critico:', error);
  // Fallback garantito dal sistema
}
```

---

## 🎯 Checklist Integrazione Completa

- [ ] Installato `@supabase/supabase-js`
- [ ] Creato file `.env` con credenziali
- [ ] Eseguito `database-schema.sql` su Supabase
- [ ] Importato `usePerformanceData` nel componente
- [ ] Configurato auto-save o salvataggio manuale
- [ ] Aggiunto `SupabaseStatusIndicator` nell'header
- [ ] Testato funzionamento offline/online
- [ ] Verificato sincronizzazione automatica
- [ ] Implementato visualizzazione dati storici

---

## 📞 Supporto

Per problemi o domande:
1. Controlla la console browser per errori dettagliati
2. Verifica i log di Supabase (Dashboard → Logs)
3. Controlla la documentazione: [https://supabase.com/docs](https://supabase.com/docs)

---

**Fatto! 🎉**

Ora VERA salva automaticamente tutti i dati su Supabase con fallback offline intelligente!
