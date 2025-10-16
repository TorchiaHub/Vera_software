# ⚡ Quick Start - Sistema Ottimizzato

## 🎯 In 3 Passi

### 1️⃣ Verifica che Supabase sia configurato

```bash
# Controlla che .env esista e contenga:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Se non l'hai ancora fatto, segui `/INSTALLATION_STEPS.md`

### 2️⃣ Implementa il comando Tauri

Nel tuo backend Rust (`src-tauri-rust/main.rs`), aggiungi:

```rust
#[tauri::command]
async fn get_system_metrics() -> Result<SystemMetrics, String> {
    // Usa il tuo sistema di monitoring esistente
    Ok(SystemMetrics {
        cpu_usage: monitor::get_cpu_usage(),
        ram_usage: monitor::get_ram_usage(),
        gpu_usage: monitor::get_gpu_usage(),
        disk_usage: monitor::get_disk_usage(),
        network_download: monitor::get_network_download_mbps(),
        network_upload: monitor::get_network_upload_mbps(),
    })
}

#[derive(serde::Serialize)]
struct SystemMetrics {
    cpu_usage: f64,      // 0-100%
    ram_usage: f64,      // 0-100%
    gpu_usage: f64,      // 0-100%
    disk_usage: f64,     // 0-100%
    network_download: f64, // MB/s
    network_upload: f64,   // MB/s
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_metrics,
            // ... altri comandi esistenti
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3️⃣ Sostituisci il componente in App.tsx

```tsx
// App.tsx
import { OptimizedPerformanceMonitor } from './components/optimized-performance-monitor';

// Trova questa sezione:
{activeTab === 'pcmonitor' && (
  <div className="h-full p-6 overflow-y-auto">
    {/* Sostituisci LocalPCMonitor con: */}
    <OptimizedPerformanceMonitor 
      deviceId="main-device"
      deviceName="PC Windows"
    />
  </div>
)}
```

---

## ✅ Test

1. **Avvia l'app in modalità dev:**
   ```bash
   npm run tauri:dev
   ```

2. **Vai alla tab "Monitor Local PC"**

3. **Verifica che vedi:**
   - ✅ Grafici che si aggiornano ogni secondo
   - ✅ Percentuali CPU/RAM/GPU/Disk
   - ✅ Indicatore stato Supabase (online/offline)
   - ✅ Contatore batch in alto a destra

4. **Apri Debug Panel** (in fondo alla pagina)
   - Verifica "Dati raccolti" aumenta ogni secondo
   - Verifica "In batch" aumenta
   - Dopo 5 minuti, verifica "Dati salvati" aumenta

5. **Controlla Console Browser** (F12)
   ```
   📊 VERA: Dati raccolti - CPU: 45.2%, RAM: 67.8%, GPU: 32.1%
   📦 VERA: Batch aggiunto (1/20)
   ```

---

## 🎨 Personalizza

### Cambia intervallo salvataggio (default: 5 min)

```tsx
// /hooks/useOptimizedPerformanceCollection.ts
const SAVE_INTERVAL = 3 * 60; // 3 minuti invece di 5
```

### Cambia dimensione batch (default: 20)

```tsx
// /services/batchService.ts
private readonly MAX_BATCH_SIZE = 30; // 30 invece di 20
```

### Cambia soglie anomalie

```tsx
// /services/dataValidationService.ts
if (data.cpu_usage > 70) { // 70% invece di 80%
  return { hasAnomaly: true, type: 'cpu_spike', value: data.cpu_usage };
}
```

---

## 🐛 Problemi Comuni

### "command get_system_metrics not found"

**Causa:** Comando Tauri non implementato

**Soluzione:** Segui Step 2️⃣ sopra

### Grafici fermi / non si aggiornano

**Causa:** Backend non ritorna dati

**Soluzione:** 
1. Apri Debug Panel
2. Controlla se "Tauri API: Disponibile ✓"
3. Se no, verifica implementazione Rust

### Batch non viene salvato

**Causa:** Supabase offline o non configurato

**Soluzione:**
1. Verifica indicatore Supabase (verde = online)
2. Se rosso, controlla `.env`
3. Verifica tabella `performance_metrics` esista in Supabase

### Valori sempre 0 o NaN

**Causa:** Backend Rust ritorna dati invalidi

**Soluzione:**
1. Controlla Debug Panel > "Dati Correnti"
2. Verifica formato JSON corrisponda a `SystemMetrics`
3. Aggiungi log in Rust per debugging

---

## 📚 Prossimi Passi

- [Guida Completa Sistema Ottimizzato](/OPTIMIZED_COLLECTION_GUIDE.md)
- [Documentazione Supabase](/SUPABASE_INTEGRATION_GUIDE.md)
- [Esempi Avanzati](/examples/)

---

**Fatto! 🚀**

Il sistema è pronto e funzionante!
