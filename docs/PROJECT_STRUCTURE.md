# VERA Environmental Awareness - Struttura Progetto Organizzata

## 📁 Struttura Cartelle

### 📄 `/docs/` - Documentazione
Contiene tutta la documentazione del progetto:
- `README.md` - Documentazione principale
- `SETUP.md` - Istruzioni di setup
- `RISOLUZIONE_DESKTOP.md` - Risoluzione problemi desktop
- `IMPLEMENTATION_COMPLETE.md` - Documentazione implementazione
- `AUTH_IMPLEMENTATION_GUIDE.md` - Guida autenticazione
- `SUPABASE_INTEGRATION_GUIDE.md` - Guida integrazione Supabase
- `TAURI_IMPLEMENTATION.md` - Implementazione Tauri
- E tutti gli altri file di documentazione...

### ⚙️ `/scripts/` - Script e Automazione
Contiene tutti gli script di build, sviluppo e deployment:
- `build-*.ps1` - Script di build vari
- `create-*.ps1` - Script di creazione (icone, installer, etc.)
- `start-vera.*` - Script di avvio applicazione
- `setup*.ps1` - Script di setup ambiente
- `dev*.ps1` - Script di sviluppo
- `installer.*` - Script di installazione
- `monitor-build.ps1` - Monitoraggio build

### 🖥️ `/frontend/` - Frontend React/Vite
Applicazione web React con Vite

### ⚙️ `/src-tauri/` - Desktop Tauri
Applicazione desktop con Rust backend

### 📦 `/src-tauri/target/release/bundle/` - Build Finali
- `nsis/` - Installer Windows NSIS
- `msi/` - File MSI (quando disponibili)
- `vera.exe` - Eseguibile desktop (8.6 MB)

## 🚀 Quick Start

### Per Sviluppatori:
```bash
# Setup ambiente
./scripts/setup.ps1

# Sviluppo frontend
./scripts/dev.ps1

# Build completa
./scripts/build.ps1
```

### Per Utenti Finali:
1. Vai in `/src-tauri/target/release/bundle/nsis/`
2. Esegui `VERA-Environmental-Awareness_2.0.0_x64-setup.exe`
3. Installa e goditi VERA! 🌱

## 📋 File Principali

| File | Descrizione |
|------|-------------|
| `package.json` | Configurazione NPM principale |
| `vite.config.ts` | Configurazione Vite |
| `src-tauri/tauri.conf.json` | Configurazione Tauri |
| `docs/README.md` | Documentazione principale |
| `scripts/build.ps1` | Script build principale |

## 🧹 Pulizia Effettuata

✅ **Spostati in `/docs/`:**
- Tutti i file `.md` sparsi
- Documentazione tecnica
- Guide implementazione

✅ **Spostati in `/scripts/`:**
- Tutti i file `.ps1` e `.bat`
- Script di build e development
- Tool di automazione

✅ **Rimossi:**
- File vuoti o duplicati
- Script obsoleti

## 📞 Supporto
Per supporto consultare la documentazione in `/docs/` o contattare il team di sviluppo.