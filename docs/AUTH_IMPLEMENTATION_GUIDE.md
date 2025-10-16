# 🔐 VERA - Guida Implementazione Autenticazione Multi-Dispositivo

## 📋 Panoramica

Sistema completo di autenticazione e gestione multi-dispositivo integrato con Supabase Authentication.

---

## 🏗️ Architettura

```
┌──────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH                          │
│              (User Management & Sessions)                 │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
    ┌────▼──────┐        ┌─────▼──────┐
    │  devices  │        │ auth.users │
    │  table    │◄───────┤  (built-in)│
    └────┬──────┘        └────────────┘
         │
         │ Foreign Key
         │
    ┌────▼────────────┐
    │ performance_data│
    │     table       │
    └─────────────────┘
```

---

## 🚀 Setup Rapido (5 minuti)

### 1. Crea Tabelle su Supabase

1. Vai su Supabase Dashboard → SQL Editor
2. Copia tutto il contenuto di `/database-schema-auth.sql`
3. Incolla ed esegui (Run)

Questo creerà:
- ✅ Tabella `devices`
- ✅ Tabella `performance_data` (con relazioni)
- ✅ Row Level Security (RLS) policies
- ✅ Indici per performance
- ✅ Funzioni utility (statistiche, cleanup)
- ✅ Trigger auto-update last_sync
- ✅ View con statistiche aggregate

### 2. Verifica .env

Assicurati che `.env` contenga:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Avvia l'app

```bash
npm run dev
# oppure
npm run tauri:dev
```

---

## 📚 Componenti Creati

### 1. **AuthContext** (`/contexts/AuthContext.tsx`)

Context React per gestire stato autenticazione globale.

**API:**
```typescript
const {
  user,              // User object o null
  session,           // Sessione Supabase
  isLoading,         // Caricamento iniziale
  isAuthenticated,   // Boolean - user loggato?
  signUp,            // (email, password, name) => Promise
  signIn,            // (email, password) => Promise
  signOut,           // () => Promise
  resetPassword,     // (email) => Promise
} = useAuth();
```

**Utilizzo:**
```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, signOut } = useAuth();
  
  return (
    <div>
      <p>Ciao, {user?.user_metadata?.name}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### 2. **LoginPage** (`/components/LoginPage.tsx`)

Schermata login/registrazione con design moderno.

**Features:**
- ✅ Tab Login / Registrati
- ✅ Validazione client-side
- ✅ Password dimenticata con reset via email
- ✅ Messaggi errore user-friendly
- ✅ Loading states
- ✅ Design responsive

### 3. **ProtectedRoute** (`/components/ProtectedRoute.tsx`)

HOC per proteggere routes che richiedono autenticazione.

**Comportamento:**
- Se `isLoading`: mostra loader
- Se `!isAuthenticated`: mostra LoginPage
- Se `isAuthenticated`: mostra children

**Utilizzo:**
```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### 4. **DeviceService** (`/services/deviceService.ts`)

Servizio per gestione dispositivi.

**Funzioni principali:**
```typescript
// Auto-registrazione dispositivo
registerDevice(userId: string): Promise<Device | null>

// Lista dispositivi utente
getUserDevices(userId: string): Promise<Device[]>

// Heartbeat (mantieni online)
updateDeviceHeartbeat(deviceId: string): Promise<void>

// Gestione
renameDevice(deviceId: string, newName: string): Promise<boolean>
removeDevice(deviceId: string): Promise<boolean>

// Utility
isDeviceOnline(device: Device): boolean
detectDeviceType(): 'desktop' | 'laptop' | 'tablet' | 'phone'
detectOS(): string
```

### 5. **useDeviceManager** (`/hooks/useDeviceManager.tsx`)

Hook React per gestione dispositivi con auto-registrazione e heartbeat.

**API:**
```typescript
const {
  devices,              // Device[] - tutti i dispositivi
  currentDevice,        // Device | null - dispositivo corrente
  selectedDeviceId,     // string | null - ID selezionato
  isLoading,           // boolean
  setSelectedDeviceId, // (id: string) => void
  getSelectedDevice,   // () => Device | null
  renameDevice,        // (id, name) => Promise<boolean>
  removeDevice,        // (id) => Promise<boolean>
  loadDevices,         // () => Promise<void>
  isDeviceOnline,      // (device) => boolean
} = useDeviceManager();
```

**Funzionalità automatiche:**
- ✅ Registra dispositivo all'avvio
- ✅ Heartbeat ogni 2 minuti
- ✅ Ricarica dispositivi ogni 30 secondi
- ✅ Toast notifications per eventi

### 6. **usePerformanceDataAuth** (`/hooks/usePerformanceDataAuth.tsx`)

Hook per salvare/recuperare dati con autenticazione.

**API:**
```typescript
const {
  savePerformanceData,    // Salva con user_id + device_id
  fetchHistoricalData,    // Recupera con filtri
  getDeviceStats,         // Statistiche aggregate
  getHourlyData,          // Dati per grafici
  isOnline,              // Status connessione
  isSaving,              // Salvataggio in corso
} = usePerformanceDataAuth();
```

---

## 🔐 Row Level Security (RLS)

### Come Funziona

Supabase RLS garantisce che ogni utente veda **SOLO i propri dati**.

### Policies Attive

#### Tabella `devices`:
```sql
-- SELECT: vedi solo tuoi dispositivi
WHERE auth.uid() = user_id

-- INSERT: crei solo tuoi dispositivi
WITH CHECK auth.uid() = user_id

-- UPDATE: modifichi solo tuoi
USING auth.uid() = user_id

-- DELETE: elimini solo tuoi
USING auth.uid() = user_id
```

#### Tabella `performance_data`:
```sql
-- SELECT: vedi solo tuoi dati
WHERE auth.uid() = user_id

-- INSERT: salvi solo con tuo user_id
WITH CHECK auth.uid() = user_id

-- DELETE: elimini solo tuoi
USING auth.uid() = user_id

-- UPDATE: disabilitato (dati immutabili)
```

### Test RLS

Prova queste query nella dashboard Supabase (SQL Editor):

```sql
-- Come User A (loggato)
SELECT * FROM devices;
-- Vedi solo devices con user_id = A

-- Come User B (loggato)
SELECT * FROM devices;
-- Vedi solo devices con user_id = B

-- Tentativo di accesso cross-user (fallisce)
SELECT * FROM devices WHERE user_id = 'altro-user-id';
-- Ritorna 0 righe (RLS blocca)
```

---

## 🔄 Flusso Autenticazione

### 1. Primo Avvio (Utente Non Autenticato)

```
App loads
    │
    ├─→ AuthProvider initializes
    │       │
    │       └─→ Checks existing session
    │               │
    │               ├─→ No session found
    │               │       │
    │               │       └─→ isAuthenticated = false
    │               │
    │               └─→ ProtectedRoute sees !isAuthenticated
    │                       │
    │                       └─→ Shows LoginPage
```

### 2. Registrazione

```
User compila form SignUp
    │
    ├─→ signUp(email, password, name)
    │       │
    │       └─→ Supabase Auth creates user
    │               │
    │               ├─→ Success
    │               │       │
    │               │       └─→ Email di conferma inviata
    │               │
    │               └─→ Error
    │                       │
    │                       └─→ Mostra messaggio errore
```

### 3. Login

```
User compila form Login
    │
    ├─→ signIn(email, password)
    │       │
    │       └─→ Supabase Auth validates
    │               │
    │               ├─→ Success
    │               │       │
    │               │       ├─→ Session created
    │               │       │
    │               │       ├─→ isAuthenticated = true
    │               │       │
    │               │       ├─→ ProtectedRoute shows Dashboard
    │               │       │
    │               │       └─→ useDeviceManager auto-registers device
    │               │
    │               └─→ Error
    │                       │
    │                       └─→ Mostra messaggio errore
```

### 4. Dashboard Attiva

```
User in Dashboard
    │
    ├─→ useDeviceManager active
    │       │
    │       ├─→ Registers current device
    │       │
    │       ├─→ Starts heartbeat (every 2 min)
    │       │
    │       └─→ Reloads devices (every 30 sec)
    │
    └─→ usePerformanceDataAuth active
            │
            └─→ Saves data with user_id + device_id
```

### 5. Logout

```
User clicks Logout
    │
    ├─→ signOut()
    │       │
    │       └─→ Supabase clears session
    │               │
    │               ├─→ isAuthenticated = false
    │               │
    │               ├─→ useDeviceManager stops heartbeat
    │               │
    │               └─→ ProtectedRoute shows LoginPage
```

---

## 💾 Salvataggio Dati

### Formato Record

```typescript
{
  id: 'uuid',
  user_id: 'uuid-from-auth',        // Auto-filled
  device_id: 'uuid-from-devices',   // Dal device manager
  timestamp: '2025-01-15T10:30:00Z',
  cpu_usage: 45.2,
  ram_usage: 67.8,
  gpu_usage: 32.1,
  disk_usage: 85.5,
  disk_read_speed: 120.5,
  disk_write_speed: 80.2,
  network_download: 5.2,
  network_upload: 1.8,
  water_bottles_equivalent: 0.023,
  created_at: '2025-01-15T10:30:00Z',
}
```

### Esempio Salvataggio

```typescript
import { usePerformanceDataAuth } from './hooks/usePerformanceDataAuth';
import { useDeviceManager } from './hooks/useDeviceManager';

function MonitorComponent() {
  const { savePerformanceData } = usePerformanceDataAuth();
  const { currentDevice } = useDeviceManager();

  const handleSave = async () => {
    if (!currentDevice) return;

    const success = await savePerformanceData({
      device_id: currentDevice.id,
      cpu_usage: 45.2,
      ram_usage: 67.8,
      gpu_usage: 32.1,
      disk_usage: 85.5,
      disk_read_speed: 120.5,
      disk_write_speed: 80.2,
      network_download: 5.2,
      network_upload: 1.8,
      water_bottles_equivalent: 0.023,
    });

    if (success) {
      console.log('✅ Dati salvati');
    }
  };

  return <button onClick={handleSave}>Salva</button>;
}
```

---

## 📊 Query Dati

### 1. Recupero Storico

```typescript
// Ultimi 100 record del dispositivo corrente
const data = await fetchHistoricalData({
  limit: 100,
  deviceId: currentDevice.id,
});

// Con range temporale
const data = await fetchHistoricalData({
  deviceId: currentDevice.id,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
  limit: 1000,
});
```

### 2. Statistiche Aggregate

```typescript
// Statistiche ultime 24 ore
const stats = await getDeviceStats(currentDevice.id, 24);

console.log(stats);
// {
//   avg_cpu: 45.2,
//   avg_ram: 67.8,
//   total_water_bottles: 15.3,
//   max_cpu: 89.2,
//   record_count: 2880
// }
```

### 3. Dati per Grafici

```typescript
// Dati aggregati per ora (ultime 24 ore)
const hourlyData = await getHourlyData(currentDevice.id, 24);

console.log(hourlyData);
// [
//   {
//     hour_bucket: '2025-01-15 10:00:00',
//     avg_cpu: 45.2,
//     avg_ram: 67.8,
//     avg_gpu: 32.1,
//     avg_water_bottles: 0.023,
//     sample_count: 120
//   },
//   ...
// ]
```

---

## 🔧 Configurazione Avanzata

### Personalizza Device Detection

Modifica `/services/deviceService.ts`:

```typescript
export function detectDeviceType() {
  // La tua logica personalizzata
  const screenWidth = screen.width;
  
  if (screenWidth < 768) return 'phone';
  if (screenWidth < 1024) return 'tablet';
  if (screenWidth < 1920) return 'laptop';
  return 'desktop';
}
```

### Cambia Frequenza Heartbeat

In `/hooks/useDeviceManager.tsx`:

```typescript
heartbeatIntervalRef.current = window.setInterval(() => {
  if (currentDevice) {
    updateDeviceHeartbeat(currentDevice.id);
  }
}, 60000); // Cambia da 120000 (2 min) a 60000 (1 min)
```

### Retention Dati

Esegui cleanup periodico (cron job):

```sql
-- Ogni settimana, elimina dati più vecchi di 90 giorni
SELECT cleanup_old_performance_data(90);
```

---

## 🧪 Testing

### Test 1: Registrazione

1. Apri app in incognito/private
2. Click "Registrati"
3. Compila form con email, password, nome
4. Click "Crea Account"
5. ✅ Verifica: email di conferma ricevuta

### Test 2: Login

1. Conferma email (click link in email)
2. Torna all'app
3. Click "Accedi"
4. Compila email e password
5. ✅ Verifica: accesso alla dashboard

### Test 3: Device Auto-Registration

1. Dopo login, apri Console Browser (F12)
2. ✅ Verifica log: "✅ Dispositivo registrato: [nome]"
3. Vai su Supabase → Table Editor → `devices`
4. ✅ Verifica: 1 record con tuo user_id

### Test 4: Multi-Device

1. Fai login dallo stesso account su browser diverso
2. ✅ Verifica: toast "Dispositivo registrato: [nome2]"
3. Vai su Supabase → Table Editor → `devices`
4. ✅ Verifica: 2 record con stesso user_id

### Test 5: RLS

1. Crea 2 account diversi (email1, email2)
2. Login con email1, registra dispositivo
3. Login con email2, registra dispositivo
4. Vai su Supabase SQL Editor:
   ```sql
   SELECT * FROM devices;
   ```
5. ✅ Verifica: vedi solo dispositivo dell'account loggato

---

## 📱 Gestione Dispositivi UI

### Componente Selector

Crea un device selector nella sidebar:

```typescript
import { useDeviceManager } from './hooks/useDeviceManager';

function DeviceSelector() {
  const { devices, selectedDeviceId, setSelectedDeviceId, currentDevice } = useDeviceManager();

  return (
    <select
      value={selectedDeviceId || currentDevice?.id || ''}
      onChange={(e) => setSelectedDeviceId(e.target.value)}
    >
      {devices.map(device => (
        <option key={device.id} value={device.id}>
          {device.device_name}
          {device.id === currentDevice?.id && ' (Questo)'}
        </option>
      ))}
    </select>
  );
}
```

---

## 🆘 Troubleshooting

### Problema: "Email not confirmed"

**Soluzione:** Controlla inbox e spam per email di conferma Supabase.

### Problema: "User already registered"

**Soluzione:** Usa "Password dimenticata" per recuperare account esistente.

### Problema: Dispositivo non registrato

**Soluzione:** Verifica console per errori. Controlla policies RLS su tabella `devices`.

### Problema: Dati non si salvano

**Soluzione:** 
1. Verifica `currentDevice` non sia null
2. Controlla policies RLS su `performance_data`
3. Verifica `user_id` e `device_id` nel payload

---

## ✅ Checklist Integrazione

- [ ] Eseguito `database-schema-auth.sql` su Supabase
- [ ] Verificato `.env` con credenziali corrette
- [ ] Testata registrazione nuovo utente
- [ ] Testato login utente esistente
- [ ] Verificata auto-registrazione dispositivo
- [ ] Testato salvataggio dati con relazioni
- [ ] Verificato RLS (utenti vedono solo propri dati)
- [ ] Testato heartbeat dispositivo
- [ ] Testato multi-device da browser diversi
- [ ] Testato logout e re-login

---

## 🎉 Risultato Finale

**Sistema completo con:**
- ✅ Autenticazione Supabase
- ✅ Gestione multi-dispositivo
- ✅ Auto-registrazione dispositivi
- ✅ Heartbeat per status online
- ✅ Row Level Security
- ✅ Relazioni user-device-data
- ✅ Query ottimizzate con indici
- ✅ Funzioni aggregate SQL
- ✅ UI login/registrazione moderna
- ✅ Protected routes
- ✅ Session management automatico

**Pronto per produzione! 🚀**
