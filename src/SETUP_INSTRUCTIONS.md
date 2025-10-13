# VERA - Tauri Setup Instructions

## 🚀 Quick Start Guide

Segui questi passaggi per trasformare il prototipo web in un'applicazione desktop nativa con Tauri.

---

## Prerequisites

### 1. Install Rust
```bash
# Windows
# Scarica e installa da: https://rustup.rs/
# Oppure usa winget:
winget install Rustlang.Rustup

# Verifica installazione
rustc --version
cargo --version
```

### 2. Install Node.js
```bash
# Windows
# Scarica da: https://nodejs.org/ (v18 o superiore)
# Oppure usa winget:
winget install OpenJS.NodeJS

# Verifica
node --version
npm --version
```

### 3. Install Visual Studio Build Tools (Windows)
```bash
# Richiesto per compilare Rust su Windows
# Scarica da: https://visualstudio.microsoft.com/downloads/
# Installa: "Desktop development with C++"
# Oppure solo "Build Tools for Visual Studio 2022"
```

---

## Project Setup

### Step 1: Install Dependencies

```bash
# Nella directory del progetto
npm install
```

### Step 2: Initialize Tauri

```bash
# Installa Tauri CLI
npm install -D @tauri-apps/cli

# Inizializza Tauri (se non già fatto)
npx tauri init

# Durante l'init, usa questi valori:
# App name: VERA
# Window title: VERA - Environmental Monitor
# Web assets location: ../dist
# Dev server URL: http://localhost:5173
# Frontend dev command: npm run dev
# Frontend build command: npm run build
```

### Step 3: Copia i File Rust

La directory `src-tauri-rust/` contiene tutto il backend Rust. Copia il contenuto in `src-tauri/`:

```bash
# Windows PowerShell
Copy-Item -Recurse src-tauri-rust/* src-tauri/src/

# Oppure manualmente:
# 1. Crea src-tauri/src/energy/
# 2. Crea src-tauri/src/notifications/
# 3. Crea src-tauri/src/storage/
# 4. Copia tutti i file .rs
```

**Struttura finale:**
```
src-tauri/
├── Cargo.toml           (da src-tauri-rust/Cargo.toml)
├── tauri.conf.json      (già presente)
├── build.rs             (auto-generato)
└── src/
    ├── main.rs
    ├── energy/
    │   ├── mod.rs
    │   ├── monitor.rs
    │   └── calculator.rs
    ├── notifications/
    │   ├── mod.rs
    │   └── scheduler.rs
    └── storage/
        ├── mod.rs
        └── db.rs
```

### Step 4: Create Icons

Crea le icone per l'applicazione:

```bash
# Installa generatore icone
npm install @tauri-apps/tauricon

# Genera icone da un'immagine PNG (1024x1024 o 512x512)
# Crea prima app-icon.png nella root
npx @tauri-apps/tauricon ./app-icon.png

# Le icone saranno generate in src-tauri/icons/
```

**Icona temporanea:** Se non hai un'icona, usa una qualsiasi PNG e il tool genererà tutti i formati necessari.

---

## Development

### Run in Development Mode

```bash
# Avvia l'app in modalità sviluppo
npm run tauri:dev

# Questo farà:
# 1. Avviare Vite dev server (http://localhost:5173)
# 2. Compilare il backend Rust
# 3. Aprire la finestra desktop
```

**Primo avvio:** La compilazione Rust richiede 2-5 minuti la prima volta. Le successive saranno molto più veloci.

### Hot Reload

- **Frontend (React):** Supporto completo hot reload via Vite
- **Backend (Rust):** Richiede restart dell'app per cambiamenti

---

## Building

### Development Build

```bash
npm run tauri:build
```

### Production Build

```bash
# Build ottimizzato per distribuzione
npm run tauri:build -- --release

# Output:
# src-tauri/target/release/bundle/msi/VERA_1.0.0_x64_en-US.msi (Windows installer)
# src-tauri/target/release/vera.exe (Eseguibile standalone)
```

**Dimensione:** L'eseguibile sarà ~3-5 MB (molto più leggero di Electron!)

---

## Testing

### Test the App

1. **Energy Monitoring:**
   - Apri l'app
   - Verifica che mostri il consumo in tempo reale
   - Controlla che i valori si aggiornino ogni 5 secondi

2. **Database:**
   - L'app crea `vera_data.db` nella directory di esecuzione
   - Puoi aprirlo con SQLite Browser per verificare i dati

3. **System Tray:**
   - Clicca sulla X della finestra → deve nascondersi, non chiudersi
   - Clicca sull'icona nella tray → finestra si mostra
   - Right-click su tray → menu con opzioni

4. **Notifications:**
   - Aspetta 10 secondi (per demo)
   - Verifica che appaia una notifica Windows

---

## Troubleshooting

### Errore: "Rust not found"
```bash
# Verifica PATH
rustc --version

# Se non funziona, riavvia il terminale o aggiungi al PATH:
# C:\Users\<USER>\.cargo\bin
```

### Errore: "MSVC toolchain not found"
```bash
# Installa Visual Studio Build Tools
# https://visualstudio.microsoft.com/downloads/

# Verifica:
cl.exe /?
```

### Errore: "Failed to compile rusqlite"
```bash
# rusqlite richiede bundled feature (già configurato in Cargo.toml)
# Se persiste, prova:
cargo clean
cargo build
```

### Finestra non si apre
```bash
# Verifica che Vite sia in ascolto su 5173
netstat -an | findstr 5173

# Verifica tauri.conf.json:
# "devPath": "http://localhost:5173"
```

### Database non si crea
```bash
# Verifica permessi nella directory
# L'app deve poter scrivere vera_data.db

# In produzione, il DB sarà in:
# Windows: %APPDATA%\com.vera.energymonitor\
```

---

## Project Structure

```
vera-app/
├── src/                          # Frontend React
│   ├── App.tsx                   # Main component
│   ├── components/               # React components
│   │   ├── energy-monitor.tsx
│   │   ├── energy-chart.tsx
│   │   └── settings-panel.tsx
│   ├── hooks/                    # Custom hooks
│   │   └── useTauri.ts          # Tauri integration
│   └── styles/
│       └── globals.css
│
├── src-tauri/                    # Backend Rust
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── energy/              # Energy monitoring
│   │   │   ├── mod.rs
│   │   │   ├── monitor.rs       # Real-time monitoring
│   │   │   └── calculator.rs    # Conversions
│   │   ├── notifications/       # Notification system
│   │   │   ├── mod.rs
│   │   │   └── scheduler.rs
│   │   └── storage/             # Database
│   │       ├── mod.rs
│   │       └── db.rs
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri config
│   └── icons/                   # App icons
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tauri.conf.json              # Tauri configuration
```

---

## Next Steps

### Phase 1: Basic Functionality ✅
- [x] Setup Tauri
- [x] Energy monitoring mock
- [x] Database structure
- [x] System tray

### Phase 2: Real Monitoring
- [ ] Implementare lettura CPU/GPU reale
- [ ] Windows Performance Counters integration
- [ ] Calibrazione basata su misurazione reale
- [ ] Multi-device support (PC + phone + tablet)

### Phase 3: Advanced Features
- [ ] Fullscreen detection (Windows API)
- [ ] Auto-start con Windows
- [ ] Export dati CSV
- [ ] Grafici storici dettagliati
- [ ] Obiettivi e achievements

### Phase 4: Polish
- [ ] Icona custom
- [ ] Installer con opzioni
- [ ] Auto-update
- [ ] Localizzazione italiana completa

---

## Resources

### Documentation
- [Tauri Docs](https://tauri.app/v1/guides/)
- [Tauri API Reference](https://tauri.app/v1/api/js/)
- [Rust Book](https://doc.rust-lang.org/book/)

### Crates Used
- `tauri` - Desktop framework
- `sysinfo` - System monitoring
- `rusqlite` - SQLite database
- `tokio` - Async runtime
- `chrono` - Date/time handling
- `serde` - Serialization

### Community
- [Tauri Discord](https://discord.com/invite/tauri)
- [GitHub Discussions](https://github.com/tauri-apps/tauri/discussions)

---

## Performance Tips

### Rust Optimization
```toml
# In Cargo.toml, profile per produzione:
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
strip = true
```

### Frontend Optimization
```typescript
// Lazy load heavy components
const EnergyChart = lazy(() => import('./components/energy-chart'));

// Debounce Tauri calls
const debouncedUpdate = debounce(updateSettings, 300);
```

---

## Security & Privacy

### Data Storage
- ✅ Tutti i dati sono locali (SQLite)
- ✅ Nessuna connessione internet
- ✅ Nessun tracking o telemetria
- ✅ Database criptabile (opzionale)

### Tauri Allowlist
Il `tauri.conf.json` limita le API disponibili:
- ✅ Notifications: allowed
- ✅ Window control: allowed
- ✅ System tray: allowed
- ❌ File system: denied (except DB)
- ❌ HTTP requests: denied
- ❌ Shell: denied

---

## FAQ

**Q: Quanto consuma VERA stessa?**
A: ~15-30 MB RAM, < 1% CPU. Il monitoraggio ogni 5 secondi ha impatto minimo.

**Q: Funziona su laptop a batteria?**
A: Sì, anzi è utile per ottimizzare il consumo in mobilità.

**Q: Posso usarla senza connessione internet?**
A: Sì, VERA è completamente offline.

**Q: I dati sono condivisi?**
A: No, tutto rimane locale sul tuo PC.

**Q: Posso installare su più PC?**
A: Sì, ogni installazione ha il suo database separato.

**Q: Come disinstallo?**
A: Windows Settings > Apps > VERA > Uninstall
   Rimuove anche il database in %APPDATA%.

---

## Support

Per problemi o domande:
1. Controlla questa documentazione
2. Verifica TAURI_IMPLEMENTATION.md per dettagli tecnici
3. Consulta i log: `src-tauri/target/debug/` o `~/.tauri/logs/`

---

**Buon coding! 🚀🌍💚**
