# VERA - Preview vs Production Environment

## Overview
Questo documento spiega le differenze tra l'ambiente di preview (browser) e l'ambiente di produzione (Tauri desktop app).

## Ambiente di Preview (Browser)

### Caratteristiche
- **Piattaforma**: Web browser (Chrome, Firefox, Safari, Edge)
- **Sistema di Monitoraggio**: Dati simulati/mock
- **Backend**: Non disponibile (nessun accesso a Rust/Tauri)
- **Dati**: Generati casualmente ma realistici

### Cosa Funziona
✅ Interfaccia utente completa  
✅ Tutti i componenti React  
✅ Grafici e visualizzazioni  
✅ Navigazione tra le pagine  
✅ Temi (light/dark)  
✅ Simulazione metriche di sistema  
✅ Applicazioni mock  

### Cosa NON Funziona
❌ Raccolta dati reali dal sistema operativo  
❌ Monitoraggio hardware effettivo  
❌ Salvataggio dati nel database SQLite  
❌ Notifiche di sistema native  
❌ System tray integration  
❌ Background monitoring  

### Hook Utilizzato
```typescript
import { useSystemMonitorMock } from './hooks/useSystemMonitorMock';
```

Genera automaticamente dati realistici che simulano:
- CPU usage: 15-95% con variazioni naturali
- GPU usage: 10-90% con variazioni
- RAM usage: 30-85% del totale
- Temperature: calcolate in base all'utilizzo
- Applicazioni attive: 5-7 app casuali da un pool predefinito
- Uptime: incrementato ogni 2 secondi

---

## Ambiente di Produzione (Tauri Desktop App)

### Caratteristiche
- **Piattaforma**: Desktop nativo (Windows/Linux/macOS)
- **Sistema di Monitoraggio**: Dati reali dal sistema operativo
- **Backend**: Rust con libreria `sysinfo`
- **Dati**: Raccolti direttamente dall'hardware

### Cosa Funziona
✅ Tutto quello che funziona in preview +  
✅ Raccolta dati reali CPU/GPU/RAM/Disk  
✅ Temperature hardware reali (dove supportato)  
✅ Lista processi attivi reali  
✅ Database SQLite locale  
✅ Notifiche push di sistema  
✅ System tray con menu  
✅ Monitoraggio in background  
✅ Consumo energetico reale  
✅ Salvataggio statistiche storiche  

### Hook Utilizzato
```typescript
import { useSystemMonitor } from './hooks/useSystemMonitor';
```

Si connette ai comandi Tauri:
- `get_system_metrics()` - Chiama Rust backend
- `get_active_applications()` - Ottiene processi reali

### Comandi Tauri Registrati
```rust
// In main.rs
.invoke_handler(tauri::generate_handler![
    get_system_metrics,        // Metriche sistema
    get_active_applications,   // Applicazioni attive
    get_current_power,         // Consumo energetico
    get_energy_stats,          // Statistiche storiche
    // ... altri comandi
])
```

---

## Sistema di Fallback Automatico

Il sistema rileva automaticamente l'ambiente ed usa i dati appropriati:

```typescript
// hooks/useSystemMonitor.ts
export function useSystemMonitor(options) {
  const { invoke, isReady } = useTauri();
  const mockMonitor = useSystemMonitorMock(options);
  const [useMock, setUseMock] = useState(false);

  const refetchMetrics = async () => {
    if (!isReady) {
      setUseMock(true);  // Usa mock se Tauri non è pronto
      return;
    }

    try {
      const data = await invoke('get_system_metrics');
      // Usa dati reali
    } catch (err) {
      setUseMock(true);  // Fallback a mock se comando fallisce
    }
  };

  if (useMock) {
    return mockMonitor;  // Ritorna dati simulati
  }

  return realData;  // Ritorna dati reali
}
```

---

## Compilazione per Produzione

### Build dell'applicazione Tauri

1. **Installa dipendenze Rust**:
   ```bash
   # Windows
   # Scarica e installa da: https://rustup.rs/
   
   # Linux
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # macOS
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Installa dipendenze Node**:
   ```bash
   npm install
   ```

3. **Build development**:
   ```bash
   npm run tauri dev
   ```

4. **Build production**:
   ```bash
   npm run tauri build
   ```

5. **Output**:
   - Windows: `src-tauri/target/release/vera.exe`
   - Linux: `src-tauri/target/release/vera`
   - macOS: `src-tauri/target/release/bundle/macos/VERA.app`

---

## Testing

### Test in Preview
```bash
npm run dev
```
Apri http://localhost:5173 - vedrai dati simulati

### Test in Tauri
```bash
npm run tauri dev
```
Lancia l'app desktop - vedrai dati reali

---

## Identificazione dell'Ambiente

### Nel Codice TypeScript
```typescript
const isTauriEnv = typeof window !== 'undefined' && !!(window as any).__TAURI__;

if (isTauriEnv) {
  console.log('Running in Tauri desktop app');
} else {
  console.log('Running in browser preview');
}
```

### Nel Codice Rust
```rust
#[cfg(debug_assertions)]
fn is_dev_mode() -> bool {
    true
}

#[cfg(not(debug_assertions))]
fn is_dev_mode() -> bool {
    false
}
```

---

## Banner Informativo

L'applicazione mostra automaticamente un banner quando è in modalità preview:

```tsx
{isPreviewMode && (
  <Alert>
    <Activity className="h-4 w-4" />
    <AlertDescription>
      <strong>Modalità Preview:</strong> Stai visualizzando dati simulati. 
      In ambiente Tauri, i dati saranno raccolti dal sistema operativo reale.
    </AlertDescription>
  </Alert>
)}
```

---

## Limitazioni Platform-Specific

### Windows
- ✅ CPU monitoring completo
- ⚠️ Temperature richiede privilegi admin
- ✅ RAM monitoring
- ✅ Disk I/O
- ⚠️ GPU richiede librerie vendor-specific (NVML)

### Linux
- ✅ CPU monitoring via `/proc/stat`
- ✅ Temperature via `/sys/class/thermal/`
- ✅ RAM monitoring via `/proc/meminfo`
- ✅ Disk I/O via `/proc/diskstats`
- ⚠️ GPU limitato senza driver proprietari

### macOS
- ✅ CPU monitoring via `sysinfo`
- ⚠️ Temperature richiede IOKit framework
- ✅ RAM monitoring
- ⚠️ Disk I/O limitato
- ⚠️ GPU limitato senza Metal framework

---

## FAQ

**Q: Perché vedo "Unknown command: get_system_metrics"?**  
A: Stai usando l'ambiente preview nel browser. I comandi Tauri non sono disponibili. Il sistema passa automaticamente ai dati simulati.

**Q: Come posso testare con dati reali?**  
A: Esegui `npm run tauri dev` invece di `npm run dev`.

**Q: I dati simulati sono casuali?**  
A: No, seguono pattern realistici con transizioni fluide e valori plausibili.

**Q: Posso forzare l'uso di dati reali nel browser?**  
A: No, il browser non ha accesso alle API di sistema. È necessaria l'app Tauri.

**Q: Come distinguo visivamente tra preview e produzione?**  
A: C'è un banner blu nella pagina "Monitor Local PC" quando sei in preview mode.

---

## Best Practices

1. ✅ **Sviluppa nell'ambiente preview** per iterazioni rapide UI/UX
2. ✅ **Testa in Tauri** prima del rilascio per verificare dati reali
3. ✅ **Usa il sistema di fallback** per gestire entrambi gli ambienti
4. ✅ **Non assumere che Tauri sia sempre disponibile**
5. ✅ **Gestisci errori gracefully** con try-catch
6. ✅ **Mostra indicatori chiari** agli utenti su quale ambiente stanno usando

---

## Conclusione

VERA è progettata per funzionare sia come:
- **Preview web** → Sviluppo rapido, testing UI, demo
- **Desktop app** → Produzione, dati reali, piena funzionalità

Il sistema di fallback automatico garantisce un'esperienza fluida in entrambi i casi.
