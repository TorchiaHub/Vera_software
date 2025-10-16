# VERA - Architettura Multi-Dispositivo Distribuita

## Overview

Sistema di monitoraggio multi-dispositivo dove tutti i device sono alla pari. Nessun dispositivo funge da "centro di controllo" - ogni device può visualizzare lo stato degli altri e sincronizzare i propri dati.

## Architettura

### Frontend-Only (Implementazione Corrente)

```
┌─────────────────────────────────────────────────────┐
│  Device A (Desktop Windows)                         │
│  ┌────────────────────────────────────────────┐    │
│  │ VERA App (React + Tauri)                   │    │
│  │  - Device Manager Hook                     │    │
│  │  - Local Storage (device registry)         │    │
│  │  - System Monitor (Rust backend)           │    │
│  │  - Device Fingerprinting                   │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
         │
         │ (Manual sync simulation)
         │
┌─────────────────────────────────────────────────────┐
│  Device B (Laptop / Mobile)                         │
│  ┌────────────────────────────────────────────┐    │
│  │ VERA App                                   │    │
│  │  - Same architecture                       │    │
│  │  - Independent localStorage                │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Limitazioni Frontend-Only:**
- ❌ No real-time sync tra dispositivi diversi
- ❌ Ogni device ha il suo localStorage separato
- ❌ No sincronizzazione automatica
- ✅ Funziona come prototipo/demo
- ✅ Prepara il codice per integrazione backend

---

### Full-Stack (Con Supabase - Future)

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Device A       │       │   Device B       │       │   Device C       │
│   (Desktop)      │       │   (Laptop)       │       │   (Tablet)       │
│                  │       │                  │       │                  │
│  ┌────────────┐  │       │  ┌────────────┐  │       │  ┌────────────┐  │
│  │ VERA App   │  │       │  │ VERA App   │  │       │  │ VERA App   │  │
│  │            │  │       │  │            │  │       │  │            │  │
│  │ - Monitor  │  │       │  │ - Monitor  │  │       │  │ - Monitor  │  │
│  │ - Sync     │◄─┼───────┼──┤ - Sync     │◄─┼───────┼──┤ - Sync     │  │
│  │ - Display  │  │       │  │ - Display  │  │       │  │ - Display  │  │
│  └────────────┘  │       │  └────────────┘  │       │  └────────────┘  │
│        │         │       │        │         │       │        │         │
└────────┼─────────┘       └────────┼─────────┘       └────────┼─────────┘
         │                          │                          │
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     Supabase Backend          │
                    │                               │
                    │  ┌─────────────────────────┐  │
                    │  │  PostgreSQL Database    │  │
                    │  │  - devices              │  │
                    │  │  - energy_metrics       │  │
                    │  │  - device_status        │  │
                    │  └─────────────────────────┘  │
                    │                               │
                    │  ┌─────────────────────────┐  │
                    │  │  Realtime Subscriptions │  │
                    │  │  - Live sync across     │  │
                    │  │    all devices          │  │
                    │  └─────────────────────────┘  │
                    │                               │
                    │  ┌─────────────────────────┐  │
                    │  │  Row Level Security     │  │
                    │  │  - Privacy first        │  │
                    │  └─────────────────────────┘  │
                    └───────────────────────────────┘
```

**Vantaggi Full-Stack:**
- ✅ Real-time sync automatico
- ✅ Single source of truth
- ✅ Persistenza cross-device
- ✅ Conflict resolution
- ✅ Offline support con sync on reconnect

---

## Componenti Sistema

### 1. Device Manager Hook (`/hooks/useDeviceManager.ts`)

**Responsabilità:**
- Device registration e fingerprinting
- Gestione stato dispositivi
- Simulazione sync (frontend-only)
- CRUD operations su devices

**API:**

```typescript
interface Device {
  id: string;                    // Unique device identifier
  name: string;                  // User-friendly name
  type: 'desktop' | 'mobile' | 'tablet';
  platform: string;              // OS platform
  status: 'online' | 'offline' | 'idle';
  lastActive: Date;
  registeredAt: Date;
  isCurrentDevice: boolean;
  metrics: {
    totalEnergyKwh: number;
    totalWaterBottles: number;
    avgDailyKwh: number;
    uptime: number;
  };
}

const {
  devices,              // Array of all registered devices
  currentDevice,        // This device
  isLoading,
  registerDevice,       // Add new device
  updateDeviceMetrics,  // Update energy stats
  removeDevice,         // Remove device
  renameDevice          // Rename device
} = useDeviceManager();
```

**Device Fingerprinting:**

```typescript
// Generates unique ID based on:
- navigator.userAgent
- screen.width x screen.height
- navigator.language
// Stored in localStorage: 'vera_device_id'
```

**Mock Sync Mechanism:**

```typescript
// Updates every 5 seconds:
1. Mark current device as 'online'
2. Check other devices' last activity
3. Update status:
   - > 2 minutes inactive → 'offline'
   - > 1 minute inactive → 'idle'
   - < 1 minute → 'online'
```

---

### 2. Devices Panel (`/components/devices-panel.tsx`)

**UI Features:**

1. **Header con descrizione**
   - Spiega l'architettura distribuita
   - Nessun centro di controllo

2. **Info Banner**
   - Architettura peer-to-peer
   - Sincronizzazione automatica

3. **Statistics Cards**
   - Dispositivi totali
   - Dispositivi online
   - Consumo energetico aggregato

4. **Device Cards**
   - Icon device (Desktop/Mobile/Tablet)
   - Nome editabile
   - Status badge (Online/Idle/Offline)
   - Last activity timestamp
   - Energy metrics (kWh, bottiglie, media)
   - Device ID (per debug)
   - Actions: Rename, Remove

5. **Current Device Indicator**
   - Badge "Questo dispositivo"
   - Border highlight
   - Non può essere rimosso

6. **Footer Info**
   - Come funziona la sincronizzazione
   - Privacy note

---

## Data Flow

### Frontend-Only (Corrente)

```
User opens VERA App
  ↓
Device Manager Hook initializes
  ↓
Generate/retrieve Device ID from localStorage
  ↓
Load registered devices from localStorage
  ↓
Mark current device as 'online'
  ↓
Start sync simulation (setInterval 5s)
  ↓
Update UI with device status
  ↓
User updates device metrics
  ↓
Save to localStorage
  ↓
(No cross-device sync - each device independent)
```

### Full-Stack (Con Supabase)

```
User opens VERA App on Device A
  ↓
Device Manager connects to Supabase
  ↓
Authenticate device (anonymous auth or user account)
  ↓
Register/update device in 'devices' table
  ↓
Subscribe to real-time changes
  ↓
Device A monitors energy → writes to 'energy_metrics'
  ↓
Supabase broadcasts change to all subscribed devices
  ↓
Device B/C receive update via WebSocket
  ↓
UI automatically updates on all devices
  ↓
User opens VERA on Device B
  ↓
Device B sees Device A status in real-time
  ↓
Perfect sync across all devices
```

---

## Database Schema (Future - Supabase)

### Table: `devices`

```sql
CREATE TABLE devices (
  id TEXT PRIMARY KEY,              -- Device fingerprint
  user_id TEXT NOT NULL,            -- Link to user account
  name TEXT NOT NULL,
  type TEXT NOT NULL,               -- desktop | mobile | tablet
  platform TEXT,                    -- Windows | macOS | Android | iOS
  status TEXT NOT NULL,             -- online | offline | idle
  last_active TIMESTAMP NOT NULL,
  registered_at TIMESTAMP NOT NULL,
  metadata JSONB,                   -- Additional device info
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_devices_status ON devices(status);
```

### Table: `energy_metrics`

```sql
CREATE TABLE energy_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  energy_kwh DECIMAL(10, 4) NOT NULL,
  water_bottles DECIMAL(10, 2),
  co2_kg DECIMAL(10, 4),
  session_type TEXT,                -- active | idle | sleep
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_metrics_device ON energy_metrics(device_id);
CREATE INDEX idx_metrics_timestamp ON energy_metrics(timestamp);
```

### Table: `device_status`

```sql
CREATE TABLE device_status (
  device_id TEXT PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  last_heartbeat TIMESTAMP NOT NULL,
  metrics_summary JSONB,            -- Cached aggregates
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Users can only see their own devices
CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT
  USING (user_id = auth.uid());

-- Users can only update their own devices
CREATE POLICY "Users can update own devices"
  ON devices FOR UPDATE
  USING (user_id = auth.uid());

-- Similar policies for energy_metrics and device_status
```

---

## Real-time Sync Implementation (Supabase)

### Client-side Subscription

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to device changes
const subscription = supabase
  .channel('devices-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'devices',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Device change:', payload);
      // Update local state
      updateDevices(payload.new);
    }
  )
  .subscribe();

// Subscribe to energy metrics
const metricsSubscription = supabase
  .channel('metrics-channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'energy_metrics'
    },
    (payload) => {
      console.log('New metric:', payload);
      // Update device metrics in real-time
      updateDeviceMetrics(payload.new);
    }
  )
  .subscribe();

// Cleanup on unmount
return () => {
  subscription.unsubscribe();
  metricsSubscription.unsubscribe();
};
```

### Heartbeat System

```typescript
// Send heartbeat every 30 seconds
const heartbeatInterval = setInterval(async () => {
  await supabase
    .from('device_status')
    .upsert({
      device_id: currentDeviceId,
      status: 'online',
      last_heartbeat: new Date().toISOString(),
      metrics_summary: getCurrentMetrics()
    });
}, 30000);
```

### Offline Handling

```typescript
// Queue updates when offline
const offlineQueue = [];

window.addEventListener('offline', () => {
  console.log('Device offline - queueing updates');
  isOffline = true;
});

window.addEventListener('online', async () => {
  console.log('Device online - syncing queued updates');
  isOffline = false;
  
  // Flush offline queue
  for (const update of offlineQueue) {
    await supabase.from('energy_metrics').insert(update);
  }
  offlineQueue.length = 0;
});
```

---

## Privacy & Security

### Data Collected (Per Device)

**✅ Collected:**
- Device ID (anonymous fingerprint)
- Device type & platform
- Energy consumption metrics
- Hardware utilization (CPU, GPU, RAM)
- Last activity timestamp
- Device status (online/offline/idle)

**❌ NOT Collected:**
- Personal files or documents
- Browsing history
- Email content
- Location data (beyond region)
- Personal identification info
- Application-specific data

### Security Measures

1. **Anonymous Device IDs**
   - Fingerprint-based, not tied to hardware MAC
   - Can be regenerated if needed

2. **Row Level Security (Supabase)**
   - Users see only their own devices
   - No cross-user data access

3. **Encrypted Transport**
   - All data encrypted in transit (HTTPS/WSS)
   - Supabase handles encryption at rest

4. **No PII Storage**
   - Only anonymous metrics
   - Region-based aggregation only

---

## Migration Path: Frontend → Full-Stack

### Step 1: Prepare Code Structure
✅ **Already Done:**
- Hook-based architecture (`useDeviceManager`)
- Centralized device state management
- Device CRUD operations abstracted
- UI decoupled from data layer

### Step 2: Add Supabase Client

```typescript
// /lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Step 3: Update useDeviceManager

```typescript
// Replace localStorage with Supabase calls
const registerDevice = async (deviceName?: string) => {
  const newDevice = {
    id: generateDeviceId(),
    user_id: userId,
    name: deviceName || getDeviceName(),
    type: getDeviceType(),
    platform: getPlatform(),
    status: 'online',
    last_active: new Date().toISOString(),
    registered_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('devices')
    .insert(newDevice)
    .select();
    
  if (error) throw error;
  return data[0];
};
```

### Step 4: Add Real-time Subscriptions

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('devices')
    .on('postgres_changes', { ... }, handleDeviceChange)
    .subscribe();
    
  return () => subscription.unsubscribe();
}, []);
```

### Step 5: Migrate Data

```typescript
// One-time migration from localStorage to Supabase
const migrateFromLocalStorage = async () => {
  const localDevices = JSON.parse(
    localStorage.getItem('vera_registered_devices') || '[]'
  );
  
  for (const device of localDevices) {
    await supabase.from('devices').upsert(device);
  }
  
  localStorage.removeItem('vera_registered_devices');
};
```

---

## Testing Strategy

### Frontend-Only (Corrente)

**Test Cases:**
1. ✅ Device registration on first launch
2. ✅ Device ID persistence across sessions
3. ✅ Status updates (online → idle → offline)
4. ✅ Metrics update and display
5. ✅ Device rename functionality
6. ✅ Device removal (non-current only)
7. ✅ Current device indicator
8. ✅ Multiple devices in localStorage

**Test Scenarios:**
```bash
# Scenario 1: Single Device
1. Open VERA for first time
2. Verify device auto-registered
3. Verify status = 'online'
4. Close app, wait 2 minutes
5. Reopen app
6. Verify same device ID
7. Verify status updated

# Scenario 2: Multi-Device Simulation
1. Open VERA in Chrome
2. Open VERA in Firefox (different fingerprint)
3. Verify two devices shown
4. Update metrics on Device A
5. Verify metrics shown in list
```

### Full-Stack (Con Supabase)

**Additional Tests:**
1. Cross-device real-time sync
2. Offline queue flush
3. Conflict resolution
4. Concurrent updates
5. Authentication flow
6. RLS policy enforcement

---

## Performance Considerations

### Frontend-Only
- **Storage:** ~1-10KB per device in localStorage
- **Updates:** Local only, instant
- **Sync:** Manual/none
- **Scalability:** Limited to single device view

### Full-Stack
- **Database:** PostgreSQL optimized for time-series
- **Real-time:** WebSocket connections (1 per device)
- **Bandwidth:** ~1-5KB per sync event
- **Latency:** <100ms sync across devices
- **Scalability:** Unlimited devices per user

---

## Roadmap

### Phase 1: ✅ Frontend Prototype (Current)
- Device fingerprinting
- Local device registry
- Mock sync simulation
- UI for device management

### Phase 2: 🔄 Supabase Integration (Next)
- Database schema setup
- Real-time subscriptions
- Authentication integration
- Migration from localStorage

### Phase 3: 📋 Advanced Features (Future)
- Device groups/families
- Energy comparison charts (device vs device)
- Smart notifications (high usage on Device A)
- Device-specific settings sync
- Energy goals per device
- Historical trend analysis

### Phase 4: 📋 Optimization (Future)
- Offline-first architecture
- Conflict resolution strategies
- Data compression
- Batch updates
- Incremental sync
- Background sync workers

---

## Troubleshooting

### Frontend-Only Issues

**Device not showing:**
```javascript
// Check localStorage
console.log(localStorage.getItem('vera_device_id'));
console.log(localStorage.getItem('vera_registered_devices'));

// Clear and re-register
localStorage.removeItem('vera_device_id');
localStorage.removeItem('vera_registered_devices');
// Refresh app
```

**Status stuck on offline:**
```javascript
// Check sync interval
// Verify lastActive timestamp is updating
// Check browser console for errors
```

**Multiple devices showing same ID:**
```javascript
// This shouldn't happen with proper fingerprinting
// Clear localStorage on one device to regenerate
```

### Supabase Issues (Future)

**Real-time not working:**
```javascript
// Check subscription status
console.log(subscription.state); // Should be 'SUBSCRIBED'

// Verify RLS policies
// Check Supabase dashboard for active connections
```

**Sync conflicts:**
```javascript
// Implement last-write-wins or merge strategy
// Add version/timestamp to detect conflicts
```

---

## Conclusion

Questa architettura multi-dispositivo è progettata per essere:

1. **Scalabile**: Da frontend-only a full-stack senza refactoring
2. **Privacy-first**: Nessun dato personale, solo metriche anonime
3. **Distribuita**: Nessun centro di controllo, tutti i device sono pari
4. **Real-time ready**: Preparata per sincronizzazione live
5. **User-friendly**: UI intuitiva per gestione dispositivi

Il sistema è attualmente funzionante in modalità frontend-only come prototipo, ma il codice è strutturato per facilitare l'integrazione con Supabase quando necessario.

**Next Steps:**
1. Testare il sistema frontend-only
2. Raccogliere feedback utenti
3. Valutare integrazione Supabase
4. Implementare real-time sync
5. Espandere features cross-device
