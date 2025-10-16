# 🌱 VERA - Environmental Awareness Software

# VERA - Environmental Awareness 🌱

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)](https://github.com/TorchiaHub/Vera_software)VERA (Visual Environmental Resource Awareness) è un'applicazione desktop innovativa sviluppata con Tauri che permette di monitorare in tempo reale il consumo energetico del proprio computer e promuovere comportamenti ecosostenibili attraverso meccaniche di gamification.

[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/TorchiaHub/Vera_software)

## 🌟 Caratteristiche Principali

> **Monitora, Risparmia, Proteggi l'Ambiente** 🌍

- **Monitoraggio in Tempo Reale**: Visualizzazione del consumo energetico di CPU, GPU, RAM e disco

VERA è un'applicazione innovativa per il monitoraggio ambientale e il risparmio energetico che combina **tecnologia desktop nativa** con **interfaccia web moderna** per aiutarti a ridurre il tuo impatto ambientale.- **Dashboard Interattiva**: Interface React moderna con grafici dinamici e indicatori di performance

- **Sistema di Gamification**: Punteggi, achievement e classifiche per incentivare l'uso responsabile

![VERA Desktop App](https://img.shields.io/badge/Desktop-Tauri%20%2B%20Rust-orange.svg)- **Notifiche Intelligenti**: Avvisi automatici per ottimizzare il consumo energetico

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue.svg)- **Cross-Platform**: Supporto per Windows, macOS e Linux tramite Tauri

![Bundle Size](https://img.shields.io/badge/Bundle-8.6MB-green.svg)- **Architettura Monorepo**: Struttura organizzata per sviluppo scalabile



---## 🏗️ Architettura Monorepo



## 🚀 Quick Start```

VERA-Environmental Awareness/

### 📦 Per Utenti Finali (Installazione Facile)├── frontend/          # React TypeScript App

1. Vai alla sezione **[Releases](https://github.com/TorchiaHub/Vera_software/releases)**│   ├── src/

2. Scarica `VERA-Environmental-Awareness_2.0.0_x64-setup.exe` (2.5 MB)│   │   ├── components/    # UI Components

3. Esegui l'installer e segui le istruzioni│   │   ├── hooks/         # Custom Hooks  

4. Avvia VERA dal menu Start o Desktop! 🎉│   │   ├── contexts/      # React Contexts

│   │   └── services/      # Frontend Services

### 👩‍💻 Per Sviluppatori│   ├── package.json

```bash│   └── vite.config.ts

# Clone del repository├── backend/           # Node.js API Server

git clone https://github.com/TorchiaHub/Vera_software.git│   ├── src/

cd Vera_software│   │   ├── controllers/   # Route Controllers

│   │   ├── services/      # Business Logic

# Setup ambiente di sviluppo│   │   ├── middleware/    # Express Middleware

./scripts/setup.ps1│   │   └── routes/        # API Routes

│   └── package.json

# Avvio in modalità sviluppo├── shared/            # Common Utilities

./scripts/dev.ps1│   ├── types/             # TypeScript Types

│   ├── schemas/           # Validation Schemas

# Build completa│   └── constants/         # Shared Constants

./scripts/build.ps1├── src-tauri/         # Rust Desktop Backend

```│   ├── src/               # Rust Source Code

│   └── tauri.conf.json

---├── docs/              # Documentation

├── scripts/           # Automation Scripts

## ✨ Funzionalità Principali└── package.json       # Workspace Root

```

### 🖥️ Applicazione Desktop Nativa

- **Tauri + Rust**: Performance native e sicurezza massima## 🚀 Quick Start

- **8.6 MB**: Applicazione completa e leggera

- **Cross-platform**: Windows, macOS, Linux### Prerequisiti

- **Node.js 18+** 

### ⚡ Monitoraggio Energetico Real-time- **Rust** (per Tauri) - [Installa da rustup.rs](https://rustup.rs/)

- 📊 **Dashboard interattiva** con grafici di consumo- **npm** (incluso con Node.js)

- 🔋 **Monitoraggio CPU, RAM, Disco** in tempo reale

- 🌡️ **Temperatura sistema** e stato hardware### Setup Automatico

- 📈 **Statistiche giornaliere/settimanali/mensili**```powershell

# Windows - Esegui lo script di setup

### 🌱 Impatto Ambientale.\scripts\setup-final.ps1

- 🌍 **Calcolo CO2 risparmiata** in tempo reale

- 🏆 **Sistema gamificato** con punteggi e achievement# Oppure manualmente:

- 📊 **Report personalizzati** di efficienza energeticanpm install

- 🔔 **Notifiche smart** per ottimizzazioni```



### 🎨 Interfaccia Moderna### Sviluppo

- 🌙 **Tema scuro/chiaro** adattivo```bash

- 📱 **Design responsive** per tutti i dispositivi# Avvia frontend dev server

- ⚙️ **Personalizzazione completa** dell'interfaccianpm run dev --workspace=frontend

- 🎯 **UX ottimizzata** per produttività

# Avvia backend dev server  

---npm run dev --workspace=backend



## 📁 Struttura Progetto# Avvia Tauri dev (desktop app)

npm run tauri dev

```

Vera_software/# Oppure usa gli script PowerShell:

├── 📂 docs/              # 📚 Documentazione completa (33 file).\scripts\dev-clean.ps1 -Frontend  # Solo frontend

│   ├── INDEX.md          # 🧭 Indice di navigazione.\scripts\dev-clean.ps1 -All       # Tutto insieme

│   ├── README.md          # 📖 Documentazione principale```

│   └── ...               # Guide tecniche e tutorial

├── 📂 scripts/           # ⚙️ Script di automazione (27 script)### Build

│   ├── build.ps1         # 🔨 Build completa```bash

│   ├── setup.ps1         # 🚀 Setup ambiente# Build frontend

│   └── ...               # Tool di svilupponpm run build --workspace=frontend

├── 📂 frontend/          # 🌐 App React/Vite

├── 📂 src-tauri/         # 🖥️ Desktop Tauri# Build backend

└── 📦 Installer Ready    # Bundle NSIS (2.5 MB)npm run build --workspace=backend

```

# Build Tauri desktop app

---npm run tauri build



## 🛠️ Tecnologie# Oppure usa gli script PowerShell:

.\scripts\build-clean.ps1 -Frontend  # Solo frontend

### Frontend Stack.\scripts\build-clean.ps1 -All       # Tutto insieme

- **⚛️ React 18** - UI framework moderno```

- **⚡ Vite** - Build tool ultra-veloce  

- **🎨 Tailwind CSS** - Styling utility-first## 📚 Documentazione

- **📊 Recharts** - Visualizzazione dati

- **🔄 TypeScript** - Type safety- [Architettura Tecnica](docs/ARCHITECTURE.md) - Dettagli sull'architettura del sistema

- [Guida Setup](docs/SETUP_INSTRUCTIONS.md) - Istruzioni dettagliate per l'installazione

### Desktop Stack  - [Tauri Implementation](docs/TAURI_IMPLEMENTATION.md) - Integrazione desktop

- **🦀 Rust** - Backend ad alte performance

- **🖥️ Tauri** - Framework desktop nativo## 🛠️ Stack Tecnologico

- **🔒 WebView2** - Rendering sicuro

- **🗄️ SQLite** - Database locale### Frontend

- **🔔 Sistema notifiche** nativo- **React 18** con TypeScript

- **Vite** per build e dev server

### Build & Deploy- **Tailwind CSS** per styling

- **📦 NSIS** - Installer Windows professionale- **Recharts** per visualizzazione dati

- **⚙️ PowerShell** - Automazione script- **Lucide React** per icone

- **🔧 Cargo** - Build system Rust

- **📋 GitHub Actions** - CI/CD pipeline### Desktop

- **Tauri 2.8.4** - Framework desktop con Rust

---- **System Monitor** - Rust per monitoraggio risorse

- **Native Notifications** - Notifiche desktop

## 📊 Performance

### Development Tools

| Metrica | Valore |- **npm Workspaces** - Gestione monorepo

|---------|--------|- **TypeScript** - Type safety

| **Eseguibile** | 8.6 MB |- **ESLint** - Code linting

| **Installer** | 2.5 MB |- **PowerShell Scripts** - Automazione build

| **RAM utilizzo** | ~50 MB |

| **CPU utilizzo** | <1% idle |## 🎮 Funzionalità Gamification

| **Avvio** | <2 secondi |

| **Build time** | ~15 minuti |- **EcoScore**: Punteggio basato sull'efficienza energetica

- **Achievement System**: Obiettivi e badge da sbloccare

---- **Leaderboard**: Classifica globale degli utenti più virtuosi

- **Daily Challenges**: Sfide quotidiane per migliorare le abitudini

## 🎯 Casi d'Uso

## 📊 Monitoraggio Sistema

### 🏢 **Aziende**

- Monitoraggio flotta PC aziendaleVERA monitora in tempo reale:

- Report di sostenibilità- **CPU Usage & Temperature**

- Riduzione costi energetici- **Memory Consumption**

- Compliance ambientale- **GPU Performance** 

- **Disk Activity**

### 🏠 **Utenti Domestici**  - **Power Consumption Estimation**

- Controllo consumo PC gaming- **Carbon Footprint Calculation**

- Risparmio bolletta elettrica

- Educazione ambientale## 🔧 Sviluppo

- Gamification sostenibilità

### Struttura Componenti

### 🎓 **Istituti Educativi**```typescript

- Laboratori informatici efficientifrontend/src/components/

- Progetti educativi ambientali├── energy-monitor.tsx     # Componente principale monitoraggio

- Monitoraggio infrastrutture├── realtime-chart.tsx     # Grafici tempo reale

- Sensibilizzazione studenti├── performance-indicator.tsx  # Indicatori performance

├── notification-menu.tsx  # Sistema notifiche

---└── settings-panel.tsx     # Pannello impostazioni

```

## 📖 Documentazione

### Custom Hooks

| Documento | Descrizione |```typescript

|-----------|-------------|frontend/src/hooks/

| [📋 Setup](docs/SETUP.md) | Installazione e configurazione |├── useSystemMonitor.ts    # Hook monitoraggio sistema

| [🏗️ Architettura](docs/ARCHITECTURE.md) | Design tecnico sistema |├── usePerformanceData.ts  # Hook gestione dati performance

| [🔐 Autenticazione](docs/AUTH_IMPLEMENTATION_GUIDE.md) | Setup sicurezza |├── useCircularBuffer.ts   # Buffer circolare per dati

| [🖥️ Desktop](docs/TAURI_IMPLEMENTATION.md) | Implementazione Tauri |└── useInterval.ts         # Hook per intervalli

| [🛠️ Troubleshooting](docs/TROUBLESHOOTING.md) | Risoluzione problemi |```



➡️ **[Documentazione Completa](docs/INDEX.md)**## 🚀 Deployment



---### Desktop Build

```bash

## 🤝 Contributing# Build produzione completa

npm run build --workspace=frontend

Contribuire a VERA è semplice e benvenuto!npm run tauri build



1. **🍴 Fork** il repository# Output: src-tauri/target/release/bundle/

2. **🌿 Branch** per la tua feature (`git checkout -b feature/amazing-feature`)```

3. **💾 Commit** le modifiche (`git commit -m 'Add amazing feature'`)

4. **🚀 Push** al branch (`git push origin feature/amazing-feature`)### Development Environment

5. **📥 Pull Request** per il merge```bash

# Ambiente sviluppo completo

### 🧪 Testingnpm run dev --workspace=frontend  # Frontend su http://localhost:5173

```bashnpm run tauri dev                 # Desktop app con hot reload

# Test frontend```

cd frontend && npm test

## 🤝 Contributing

# Test Rust

cd src-tauri && cargo test1. Fork del repository

2. Crea feature branch (`git checkout -b feature/AmazingFeature`)

# Test installer3. Commit changes (`git commit -m 'Add AmazingFeature'`)

./scripts/test-installer.ps14. Push to branch (`git push origin feature/AmazingFeature`)

```5. Apri Pull Request



---## 📝 License



## 📄 LicenzaQuesto progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.



Questo progetto è distribuito sotto licenza **MIT** - vedi il file [LICENSE](LICENSE) per dettagli.## 🙏 Acknowledgments



```- Design originale da [Figma Environmental Awareness App](https://www.figma.com/design/4VVpOTFlAVLQIui6dzGnuu/Environmental-Awareness-App)

Copyright (c) 2025 VERA Environmental Team- Icone da [Lucide](https://lucide.dev/)

```- Framework desktop [Tauri](https://tauri.app/)



------



## 🙏 Crediti**Sviluppato con ❤️ per un futuro più sostenibile**

- **🎨 Design**: Ispirato da principi di sostenibilità
- **🔧 Tecnologie**: Grazie alle community di Tauri, React e Rust
- **🌱 Missione**: Supportare la transizione verso un futuro sostenibile

---

## 📞 Supporto

- 📧 **Email**: support@vera-software.com
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/TorchiaHub/Vera_software/issues)
- 💬 **Discussioni**: [GitHub Discussions](https://github.com/TorchiaHub/Vera_software/discussions)
- 📚 **Wiki**: [Documentazione Estesa](https://github.com/TorchiaHub/Vera_software/wiki)

---

<div align="center">

**🌱 VERA Environmental Awareness - Monitora, Risparmia, Proteggi l'Ambiente 🌍**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/TorchiaHub/Vera_software)
[![Powered by Sustainability](https://img.shields.io/badge/Powered%20by-Sustainability-green.svg)](https://github.com/TorchiaHub/Vera_software)

[⭐ **Star il progetto**](https://github.com/TorchiaHub/Vera_software) se ti piace VERA!

</div>