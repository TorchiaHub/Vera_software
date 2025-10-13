# 📦 VERA - Passi di Installazione Supabase

Segui questi passaggi **nell'ordine esatto** per integrare correttamente Supabase nel tuo progetto VERA.

---

## ✅ Step 1: Installa le Dipendenze

Apri il terminale nella root del progetto ed esegui:

```bash
npm install @supabase/supabase-js
```

Verifica che sia stato aggiunto a `package.json`:

```json
"@supabase/supabase-js": "^2.39.3"
```

---

## ✅ Step 2: Crea un Progetto Supabase

1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clicca **"New Project"**
3. Compila:
   - **Name**: `vera-energy-monitor` (o il nome che preferisci)
   - **Database Password**: Scegli una password sicura e **salvala**
   - **Region**: Scegli la regione più vicina a te (es. `Europe (Frankfurt)`)
4. Clicca **"Create new project"**
5. ⏳ Aspetta 2-3 minuti per la creazione del progetto

---

## ✅ Step 3: Recupera le Credenziali

Una volta creato il progetto:

1. Vai su **Settings** (icona ingranaggio in basso a sinistra)
2. Clicca su **API**
3. Copia questi valori:

   **Project URL:**
   ```
   https://pwzjiebobxoejwdopqnx.supabase.co
   ```
   
   **anon / public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ Step 4: Configura le Variabili d'Ambiente

### 4.1 Crea il file `.env`

Nella **root del progetto** (dove c'è `package.json`), crea un file chiamato `.env`:

```bash
# Su Windows (PowerShell)
New-Item .env

# Su macOS/Linux
touch .env
```

### 4.2 Compila il file `.env`

Apri `.env` e incolla:

```env
VITE_SUPABASE_URL=https://pwzjiebobxoejwdopqnx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3emppZWJvYnhvZWp3ZG9wcW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDM5NDUsImV4cCI6MjA3NTc3OTk0NX0.3wOQlCHxddL0Q7aHj8mAdSZWNFb6hodRER7X-of-S6s
```

⚠️ **Sostituisci** i valori con quelli **del tuo progetto** che hai copiato al Step 3!

### 4.3 Verifica `.gitignore`

Assicurati che `.env` sia nel `.gitignore` per non committare le credenziali:

```gitignore
# .gitignore
.env
.env.local
```

---

## ✅ Step 5: Crea il Database

1. Nel tuo progetto Supabase, vai su **SQL Editor** (nella sidebar sinistra)
2. Clicca **"New query"**
3. Apri il file `/database-schema.sql` che hai ricevuto
4. **Copia tutto il contenuto** del file
5. **Incollalo** nell'editor SQL di Supabase
6. Clicca **"Run"** (o premi `Ctrl+Enter`)

✅ Dovresti vedere:

```
Success. No rows returned.
```

Questo ha creato:
- ✅ Tabella `performance_metrics`
- ✅ Indici per query veloci
- ✅ Funzioni SQL per statistiche
- ✅ View per dashboard

### Verifica che la tabella esista:

Vai su **Table Editor** → Dovresti vedere la tabella `performance_metrics`

---

## ✅ Step 6: Test della Connessione

### 6.1 Crea un file di test

Crea `/test-supabase-connection.tsx`:

```tsx
import { getSupabaseClient, checkSupabaseConnection } from './utils/supabase/client';

export async function testConnection() {
  console.log('🔍 Test connessione Supabase...');
  
  const client = getSupabaseClient();
  console.log('✅ Client creato:', client);
  
  const isConnected = await checkSupabaseConnection();
  console.log(isConnected ? '✅ Connesso!' : '❌ Connessione fallita');
  
  // Prova un insert di test
  const { data, error } = await client
    .from('performance_metrics')
    .insert([{
      timestamp: new Date().toISOString(),
      cpu_usage: 50,
      ram_usage: 60,
      gpu_usage: 30,
      disk_usage: 70,
      network_usage: 5,
      water_bottles_equivalent: 0.025,
      device_id: 'test-device',
      device_name: 'Test PC',
    }]);
  
  if (error) {
    console.error('❌ Errore insert:', error);
  } else {
    console.log('✅ Insert riuscito!', data);
  }
}
```

### 6.2 Esegui il test

Importa e chiama `testConnection()` in `App.tsx`:

```tsx
import { useEffect } from 'react';
import { testConnection } from './test-supabase-connection';

function App() {
  useEffect(() => {
    testConnection();
  }, []);
  
  return <div>...</div>;
}
```

### 6.3 Verifica nella Console

Apri la **Console del Browser** (`F12`) e dovresti vedere:

```
🔍 Test connessione Supabase...
✅ Client creato: {...}
✅ Connesso!
✅ Insert riuscito! null
```

### 6.4 Verifica su Supabase

Vai su **Table Editor** → `performance_metrics` → Dovresti vedere il record di test!

---

## ✅ Step 7: Integra nell'App VERA

Ora puoi usare gli hook nei tuoi componenti!

### Esempio 1: Auto-Save nel Monitor

Apri il tuo componente di monitoring (es. `local-pc-monitor.tsx`) e aggiungi:

```tsx
import { useAutoSavePerformance } from './hooks/usePerformanceData';

function LocalPCMonitor() {
  const systemData = useSystemMonitor(); // Il tuo hook esistente
  
  // Auto-save ogni 30 secondi
  const { isOnline, syncStatus } = useAutoSavePerformance(
    () => ({
      cpu_usage: systemData.cpu,
      ram_usage: systemData.ram,
      gpu_usage: systemData.gpu,
      disk_usage: systemData.disk,
      network_usage: systemData.network,
      water_bottles_equivalent: systemData.waterBottles,
    }),
    30000,
    {
      deviceId: systemData.deviceId,
      deviceName: systemData.deviceName,
    }
  );
  
  return (
    <div>
      {/* Il tuo UI esistente */}
      {!isOnline && <div>⚠️ Offline - dati salvati localmente</div>}
    </div>
  );
}
```

### Esempio 2: Status Indicator nell'Header

Nel tuo header:

```tsx
import { SupabaseStatusIndicator } from './components/supabase-status-indicator';

function Header() {
  return (
    <header>
      {/* Altri elementi header */}
      <SupabaseStatusIndicator />
    </header>
  );
}
```

---

## ✅ Step 8: Riavvia il Dev Server

**IMPORTANTE**: Le variabili d'ambiente richiedono un restart!

```bash
# Ferma il server (Ctrl+C)
# Poi riavvia

npm run dev
# oppure per Tauri
npm run tauri:dev
```

---

## 🎉 Completato!

Ora VERA:
- ✅ Salva automaticamente i dati su Supabase ogni 30s
- ✅ Funziona offline con fallback locale
- ✅ Sincronizza automaticamente quando torna online
- ✅ Mostra lo status della connessione nell'UI

---

## 🔧 Risoluzione Problemi

### Problema: "Cannot find module '@supabase/supabase-js'"

**Soluzione:**
```bash
rm -rf node_modules
npm install
```

### Problema: "Supabase URL is undefined"

**Soluzione:**
1. Verifica che `.env` esista e contenga `VITE_SUPABASE_URL`
2. Riavvia il dev server
3. Verifica che le variabili inizino con `VITE_`

### Problema: "Insert permission denied"

**Soluzione:**

Nel SQL Editor di Supabase:

```sql
-- Disabilita RLS temporaneamente per test
ALTER TABLE performance_metrics DISABLE ROW LEVEL SECURITY;

-- Oppure crea una policy permissiva
CREATE POLICY "Allow all" ON performance_metrics FOR ALL USING (true);
```

### Problema: "Network error" o timeout

**Soluzione:**
1. Verifica la tua connessione internet
2. Controlla che il progetto Supabase sia attivo (Dashboard)
3. Verifica l'URL in `.env` (deve iniziare con `https://`)

---

## 📚 Prossimi Passi

1. ✅ Implementa dashboard con grafici storici (vedi `/examples/example-usage-dashboard.tsx`)
2. ✅ Aggiungi export CSV dei dati
3. ✅ Configura pulizia automatica dati vecchi
4. ✅ Personalizza gli intervalli di salvataggio

Consulta `/SUPABASE_INTEGRATION_GUIDE.md` per esempi dettagliati!
