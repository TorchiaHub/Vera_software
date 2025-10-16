# VERA - System Monitoring Integration

## Overview
Questo documento descrive l'integrazione completa del sistema di monitoraggio hardware tra il frontend React e il backend Tauri/Rust.

## Architecture

### Backend (Rust)
**Location:** `/src-tauri-rust/system_monitor/mod.rs`

Il modulo `system_monitor` utilizza la libreria `sysinfo` per raccogliere metriche hardware in tempo reale:

#### Metriche Raccolte

1. **CPU Metrics**
   - Utilizzo percentuale (%)
   - Temperatura (°C) - Platform-specific
   - Numero di cores
   - Frequenza (MHz)

2. **GPU Metrics**
   - Utilizzo percentuale (%) - Estimato
   - Temperatura (°C) - Estimato
   - VRAM utilizzata (bytes)
   - VRAM totale (bytes)

3. **RAM Metrics**
   - Memoria utilizzata (bytes)
   - Memoria totale (bytes)
   - Percentuale utilizzo (%)

4. **Disk Metrics**
   - Velocità lettura (MB/s)
   - Velocità scrittura (MB/s)
   - Utilizzo totale disco (%)

5. **Power Metrics**
   - Fonte alimentazione (battery/ac)
   - Percentuale batteria (%)
   - Consumo energetico stimato (W)
   - Tempo residuo stimato (secondi)

6. **System Info**
   - Uptime del sistema (secondi)
   - Numero processi attivi
   - Temperatura media sistema (°C)

7. **Active Applications**
   - Nome applicazione
   - Categoria (Development, Browser, Media, Communication, Design, Other)
   - Durata esecuzione (secondi)
   - Utilizzo CPU (%)
   - Utilizzo memoria (MB)

### Frontend (React/TypeScript)
**Location:** `/components/local-pc-monitor.tsx`

Il componente React si connette al backend tramite i comandi Tauri:

#### Tauri Commands Utilizzati

```typescript
// Ottiene le metriche di sistema
invoke('get_system_metrics'): Promise<SystemMetrics>

// Ottiene le applicazioni attive
invoke('get_active_applications'): Promise<ActiveApplication[]>
```

#### Update Frequency
- **Metriche sistema**: Aggiornamento ogni 2 secondi
- **Applicazioni attive**: Aggiornamento ogni 5 secondi

## Platform-Specific Notes

### Windows
- **Temperature Monitoring**: Richiede accesso WMI o sensori hardware specifici
- **Power Monitoring**: Utilizza Windows API per info batteria
- **GPU Monitoring**: Supporto base, richiede librerie vendor-specific per metriche dettagliate (NVML per NVIDIA, ADL per AMD)

### Linux
- **Temperature Monitoring**: Legge da `/sys/class/hwmon/` e `/sys/class/thermal/`
- **Power Monitoring**: Legge da `/sys/class/power_supply/`
- **GPU Monitoring**: Richiede accesso a driver specifici

### macOS
- **Temperature Monitoring**: Richiede IOKit framework
- **Power Monitoring**: Utilizza IOKit per info batteria
- **GPU Monitoring**: Limitato senza framework specifici

## Data Flow

```
┌─────────────────┐
│  Rust Backend   │
│  SystemMonitor  │
└────────┬────────┘
         │ sysinfo library
         │ collects metrics
         ▼
┌─────────────────┐
│ Tauri Commands  │
│ get_system_     │
│ metrics()       │
└────────┬────────┘
         │ JSON serialization
         │ via Tauri bridge
         ▼
┌─────────────────┐
│ React Frontend  │
│ LocalPCMonitor  │
│ Component       │
└─────────────────┘
```

## Usage Example

### Backend (Rust)

```rust
// In main.rs
#[tauri::command]
async fn get_system_metrics(state: tauri::State<'_, AppState>) -> Result<SystemMetrics, String> {
    let mut monitor = state.system_monitor.lock().unwrap();
    Ok(monitor.get_metrics())
}
```

### Frontend (React)

```typescript
// In LocalPCMonitor component
const updateMetrics = async () => {
    const systemMetrics = await invoke('get_system_metrics');
    setMetrics(systemMetrics);
};
```

## Performance Considerations

1. **Memory Usage**: Il componente mantiene gli ultimi 20 punti dati per i grafici (circa 1-2 KB)
2. **CPU Impact**: Il monitoraggio ha un overhead minimo (<1% CPU)
3. **Update Frequency**: 2 secondi è un buon compromesso tra reattività e performance
4. **Error Handling**: Gestione timeout per evitare blocchi UI

## Privacy & Security

- **Local Only**: Tutti i dati sono raccolti e processati localmente
- **No External APIs**: Nessuna chiamata a servizi esterni
- **No PII**: Non vengono raccolti dati personali identificabili
- **Anonymous Metrics**: Solo metriche hardware anonime

## Future Improvements

### GPU Monitoring Enhancement
Per supporto GPU dettagliato, considerare:
- **NVIDIA**: Integrazione NVML (NVIDIA Management Library)
- **AMD**: Integrazione ADL (AMD Display Library)
- **Intel**: Integrazione Intel GPU metrics

### Power Monitoring Enhancement
- Windows: Integrazione completa Windows API
- Linux: Parser `/sys/class/power_supply/*`
- macOS: Integrazione IOKit framework

### Application Categorization
- Machine learning per categorizzazione automatica avanzata
- Database di applicazioni note con categorie pre-definite
- User-defined custom categories

## Dependencies

### Cargo.toml
```toml
sysinfo = "0.30"  # System information library
```

Già incluso nel progetto VERA.

## Testing

Per testare il sistema di monitoraggio:

1. **Build del progetto Tauri**:
   ```bash
   cd src-tauri
   cargo build
   ```

2. **Run in development**:
   ```bash
   npm run tauri dev
   ```

3. **Verifica metriche**: Navigare alla tab "Monitor Local PC"

## Troubleshooting

### Metriche non disponibili
- Verificare che `sysinfo` sia correttamente installato
- Controllare i permessi di accesso ai sensori hardware
- Alcuni valori potrebbero non essere disponibili su tutte le piattaforme

### Performance degradation
- Ridurre la frequenza di aggiornamento
- Limitare il numero di applicazioni monitorate
- Ridurre la finestra di history dei grafici

### Temperature readings = 0
- I sensori temperatura potrebbero non essere accessibili
- Richiede privilegi amministratore su alcune piattaforme
- Fallback a valori stimati basati su utilizzo CPU

## License & Credits

Sistema di monitoraggio sviluppato per VERA utilizzando:
- `sysinfo` - Rust library for system information
- `tauri` - Framework for building desktop apps
- `recharts` - React charting library
