# VERA - Implementazione con Tauri + Rust + React + Vite

## Stato Attuale del Progetto

**IMPORTANTE**: Questo è attualmente un **prototipo web** creato con React + TypeScript + Tailwind CSS. 

### Stack Corrente (Prototipo Web)
- ✅ **Frontend**: React + TypeScript + Tailwind CSS v4
- ✅ **UI Components**: shadcn/ui
- ✅ **Build Tool**: Vite (implicito in questo ambiente)
- ❌ **Backend**: Nessuno (solo mock data nel frontend)
- ❌ **Desktop Native**: Nessuno (applicazione web)

### Stack Target per VERA Desktop
- ✅ **Frontend**: React + Vite + TypeScript
- ✅ **Backend**: Rust + Tauri
- ✅ **Desktop**: Applicazione nativa Windows (tramite Tauri)

---

## Perché Tauri è Perfetto per VERA

1. **Accesso Nativo al Sistema**: Rust può monitorare il consumo energetico reale del PC
2. **Sicurezza**: Rust garantisce memory safety e sicurezza dei dati
3. **Performance**: Applicazione leggera (2-5MB vs 100MB+ di Electron)
4. **Privacy**: Tutto locale, nessuna raccolta dati, come richiesto da VERA
5. **Background Execution**: Può funzionare invisibilmente in background
6. **System Notifications**: Supporto nativo per notifiche Windows
7. **System Tray**: Può nascondere l'icona desktop e vivere solo nella tray

---

## Architettura VERA con Tauri

```
vera-app/
├── src/                    # Frontend React (già implementato)
│   ├── App.tsx
│   ├── components/
│   ├── styles/
│   └── ...
├── src-tauri/             # Backend Rust (DA CREARE)
│   ├── src/
│   │   ├── main.rs        # Entry point Tauri
│   │   ├── energy/        # Modulo monitoraggio energetico
│   │   │   ├── monitor.rs # Lettura consumi reali
│   │   │   └── calculator.rs # Conversioni CO₂/bottiglie
│   │   ├── notifications/ # Sistema notifiche
│   │   │   └── scheduler.rs
│   │   ├── storage/       # Database locale (SQLite)
│   │   │   └── db.rs
│   │   └── utils/
│   ├── Cargo.toml         # Dipendenze Rust
│   ├── tauri.conf.json    # Configurazione Tauri
│   └── icons/             # Icone applicazione
├── package.json           # Dipendenze frontend
├── vite.config.ts         # Configurazione Vite
└── tsconfig.json          # Configurazione TypeScript
```

---

## Passaggi per Implementare VERA con Tauri

### 1. Setup Iniziale

```bash
# Prerequisiti
# - Node.js 18+
# - Rust (rustup.rs)
# - Visual Studio Build Tools (per Windows)

# Creare progetto Tauri da questo prototipo
npm install -D @tauri-apps/cli
npx tauri init

# Durante l'init, specificare:
# - Window title: VERA - Environmental Monitor
# - Web assets: ../dist
# - Dev server: http://localhost:5173
# - Frontend dev command: npm run dev
# - Frontend build command: npm run build
```

### 2. Configurazione `tauri.conf.json`

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "VERA",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": false
      },
      "notification": {
        "all": true
      },
      "window": {
        "all": false,
        "close": true,
        "hide": true,
        "show": true,
        "maximize": false,
        "minimize": true,
        "setAlwaysOnTop": false
      },
      "systemTray": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "category": "Utility",
      "copyright": "",
      "identifier": "com.vera.energymonitor",
      "longDescription": "VERA monitors PC energy consumption and raises environmental awareness",
      "shortDescription": "Environmental energy monitoring",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 600,
        "width": 900,
        "resizable": false,
        "title": "VERA - Environmental Monitor",
        "visible": false,
        "decorations": true,
        "alwaysOnTop": false,
        "skipTaskbar": false
      }
    ],
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true,
      "menuOnLeftClick": false
    }
  }
}
```

### 3. Backend Rust - Entry Point (`src-tauri/src/main.rs`)

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod energy;
mod notifications;
mod storage;

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::{Manager, WindowEvent};

// Tauri Commands (API chiamabili dal frontend)
#[tauri::command]
async fn get_current_power() -> Result<f64, String> {
    energy::monitor::get_current_consumption()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_energy_stats(period: String) -> Result<energy::EnergyStats, String> {
    storage::db::get_stats(&period)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_settings(settings: storage::UserSettings) -> Result<(), String> {
    storage::db::save_settings(settings)
        .await
        .map_err(|e| e.to_string())
}

fn main() {
    // System Tray setup
    let quit = CustomMenuItem::new("quit".to_string(), "Quit VERA");
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                // Prevent closing, hide instead
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_current_power,
            get_energy_stats,
            update_settings
        ])
        .setup(|app| {
            // Avvia monitoraggio in background
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                energy::monitor::start_monitoring(app_handle).await;
            });

            // Avvia scheduler notifiche
            let app_handle2 = app.handle();
            tauri::async_runtime::spawn(async move {
                notifications::scheduler::start(app_handle2).await;
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 4. Monitoraggio Energetico (`src-tauri/src/energy/monitor.rs`)

```rust
use sysinfo::{System, SystemExt, ProcessorExt};
use tauri::AppHandle;
use tokio::time::{interval, Duration};

pub struct EnergyStats {
    pub current_power: f64,      // Watts
    pub today_kwh: f64,
    pub weekly_kwh: f64,
    pub monthly_kwh: f64,
    pub bottles_today: f64,
    pub co2_today: f64,           // grams
}

// Coefficiente di conversione per l'Italia
const ITALY_CO2_PER_KWH: f64 = 0.5;  // kg CO₂/kWh
const BOTTLES_PER_KWH: f64 = 3.0;     // bottiglie da 0.5L per kWh

pub async fn get_current_consumption() -> Result<f64, Box<dyn std::error::Error>> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // Stima del consumo basata su:
    // - CPU usage
    // - Numero di processi attivi
    // - Memoria utilizzata
    
    let cpu_usage = sys.global_processor_info().cpu_usage();
    let base_consumption = 50.0; // Watt base per un PC desktop
    let cpu_factor = cpu_usage / 100.0 * 100.0; // Max 100W per CPU
    
    let total_power = base_consumption + cpu_factor;
    
    Ok(total_power)
}

pub async fn start_monitoring(app: AppHandle) {
    let mut interval = interval(Duration::from_secs(5));
    let mut total_kwh_today = 0.0;
    
    loop {
        interval.tick().await;
        
        match get_current_consumption().await {
            Ok(power) => {
                // Calcola kWh: (Watt * secondi) / (1000 * 3600)
                let kwh_increment = (power * 5.0) / (1000.0 * 3600.0);
                total_kwh_today += kwh_increment;
                
                // Salva nel database
                let stats = EnergyStats {
                    current_power: power,
                    today_kwh: total_kwh_today,
                    weekly_kwh: 0.0, // Da recuperare dal DB
                    monthly_kwh: 0.0, // Da recuperare dal DB
                    bottles_today: total_kwh_today * BOTTLES_PER_KWH,
                    co2_today: total_kwh_today * ITALY_CO2_PER_KWH * 1000.0, // grammi
                };
                
                // Emetti evento al frontend per aggiornamento real-time
                app.emit_all("energy-update", &stats).ok();
                
                // Salva nel database
                crate::storage::db::save_reading(power, kwh_increment).await.ok();
            }
            Err(e) => {
                eprintln!("Error monitoring energy: {}", e);
            }
        }
    }
}
```

### 5. Sistema Notifiche (`src-tauri/src/notifications/scheduler.rs`)

```rust
use tauri::{AppHandle, Manager};
use tokio::time::{interval, Duration};
use chrono::{Local, Timelike};

pub async fn start(app: AppHandle) {
    let mut check_interval = interval(Duration::from_secs(60)); // Controlla ogni minuto
    
    loop {
        check_interval.tick().await;
        
        let now = Local::now();
        let hour = now.hour();
        
        // Rispetta ore di silenzio (19:00-08:00)
        if hour >= 19 || hour < 8 {
            continue;
        }
        
        // Controlla se è il momento per una notifica
        if should_send_daily_notification(&now) {
            send_daily_summary(&app).await;
        }
        
        if should_send_weekly_notification(&now) {
            send_weekly_summary(&app).await;
        }
        
        if should_send_monthly_notification(&now) {
            send_monthly_summary(&app).await;
        }
    }
}

async fn send_daily_summary(app: &AppHandle) {
    let stats = crate::storage::db::get_stats("day").await.unwrap();
    
    let notification_body = format!(
        "Today: {:.2} kWh ≈ {:.1} bottles 💧\nCO₂: {:.0}g",
        stats.today_kwh,
        stats.bottles_today,
        stats.co2_today
    );
    
    app.emit_all("show-notification", notification_body).ok();
}

fn should_send_daily_notification(now: &chrono::DateTime<Local>) -> bool {
    // Invia alle 18:00
    now.hour() == 18 && now.minute() == 0
}

fn should_send_weekly_notification(now: &chrono::DateTime<Local>) -> bool {
    // Invia la domenica alle 10:00
    now.weekday() == chrono::Weekday::Sun && now.hour() == 10 && now.minute() == 0
}

fn should_send_monthly_notification(now: &chrono::DateTime<Local>) -> bool {
    // Invia il primo giorno del mese alle 10:00
    now.day() == 1 && now.hour() == 10 && now.minute() == 0
}
```

### 6. Database Locale (`src-tauri/src/storage/db.rs`)

```rust
use rusqlite::{Connection, Result};
use tokio::sync::Mutex;
use std::sync::Arc;

lazy_static::lazy_static! {
    static ref DB: Arc<Mutex<Connection>> = {
        let conn = Connection::open("vera_data.db").unwrap();
        init_database(&conn).unwrap();
        Arc::new(Mutex::new(conn))
    };
}

fn init_database(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS energy_readings (
            id INTEGER PRIMARY KEY,
            timestamp INTEGER NOT NULL,
            power_watts REAL NOT NULL,
            kwh_increment REAL NOT NULL
        )",
        [],
    )?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY,
            quiet_hours_start INTEGER,
            quiet_hours_end INTEGER,
            region TEXT,
            theme TEXT
        )",
        [],
    )?;
    
    Ok(())
}

pub async fn save_reading(power: f64, kwh: f64) -> Result<()> {
    let db = DB.lock().await;
    let timestamp = chrono::Utc::now().timestamp();
    
    db.execute(
        "INSERT INTO energy_readings (timestamp, power_watts, kwh_increment) VALUES (?1, ?2, ?3)",
        [timestamp, power, kwh],
    )?;
    
    Ok(())
}

pub async fn get_stats(period: &str) -> Result<crate::energy::EnergyStats> {
    let db = DB.lock().await;
    
    // Query basata sul periodo
    let (query, params) = match period {
        "day" => {
            let start_of_day = chrono::Local::now()
                .date_naive()
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_utc()
                .timestamp();
            
            ("SELECT SUM(kwh_increment) FROM energy_readings WHERE timestamp >= ?1", 
             vec![start_of_day])
        },
        "week" => {
            // Implementa logica per settimana
            todo!()
        },
        "month" => {
            // Implementa logica per mese
            todo!()
        },
        _ => panic!("Invalid period")
    };
    
    // Esegui query e costruisci EnergyStats
    // ...
    
    Ok(crate::energy::EnergyStats {
        current_power: 0.0,
        today_kwh: 0.0,
        weekly_kwh: 0.0,
        monthly_kwh: 0.0,
        bottles_today: 0.0,
        co2_today: 0.0,
    })
}
```

### 7. Dipendenze Rust (`src-tauri/Cargo.toml`)

```toml
[package]
name = "vera"
version = "1.0.0"
edition = "2021"

[dependencies]
tauri = { version = "1.5", features = ["system-tray", "notification", "shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.35", features = ["full"] }
chrono = "0.4"
rusqlite = { version = "0.30", features = ["bundled"] }
lazy_static = "1.4"
sysinfo = "0.30"

[build-dependencies]
tauri-build = { version = "1.5" }
```

### 8. Frontend - Integrazione Tauri (`src/App.tsx`)

Modificare l'App.tsx esistente per usare le API Tauri:

```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { sendNotification } from '@tauri-apps/api/notification';

// Nel componente EnergyMonitor, sostituire mock data con chiamate reali:

useEffect(() => {
  // Ricevi aggiornamenti real-time dal backend
  const unlisten = listen('energy-update', (event) => {
    const stats = event.payload as EnergyData;
    setData(stats);
  });

  return () => {
    unlisten.then(fn => fn());
  };
}, []);

// Per ottenere stats on-demand:
const fetchStats = async (period: 'day' | 'week' | 'month') => {
  try {
    const stats = await invoke('get_energy_stats', { period });
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};
```

### 9. Configurazione Vite (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Importante per Tauri
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

---

## Funzionalità Specifiche VERA

### 1. Funzionamento in Background

```rust
// In tauri.conf.json
"windows": [{
  "visible": false,  // Parte nascosto
  "skipTaskbar": true // Non appare nella taskbar
}]

// L'utente può aprirlo dalla system tray
```

### 2. Rilevamento Fullscreen (No Interruzioni)

```rust
// src-tauri/src/utils/fullscreen_detector.rs
use windows::Win32::UI::WindowsAndMessaging::GetForegroundWindow;

pub fn is_fullscreen_active() -> bool {
    // Implementazione Windows-specific per rilevare fullscreen
    // Blocca le notifiche se un'app è fullscreen
    false // Placeholder
}
```

### 3. Notifiche Native Windows

```typescript
// Frontend
import { sendNotification } from '@tauri-apps/api/notification';

const showDailySummary = async () => {
  await sendNotification({
    title: 'VERA Daily Summary',
    body: 'Today: 0.46 kWh ≈ 1.4 bottles 💧',
  });
};
```

---

## Build e Distribuzione

```bash
# Sviluppo
npm run tauri dev

# Build per produzione
npm run tauri build

# L'installer .msi sarà in: src-tauri/target/release/bundle/msi/
```

---

## Priorità Implementazione

### Fase 1 - Setup (1-2 giorni)
1. ✅ Inizializzare progetto Tauri
2. ✅ Configurare tauri.conf.json
3. ✅ Setup database SQLite
4. ✅ Creare struttura moduli Rust

### Fase 2 - Backend Core (3-5 giorni)
1. ✅ Implementare monitoraggio energetico base
2. ✅ Sistema di storage con SQLite
3. ✅ API Tauri commands
4. ✅ Background monitoring loop

### Fase 3 - Frontend Integration (2-3 giorni)
1. ✅ Sostituire mock data con chiamate Tauri
2. ✅ Real-time updates via eventi
3. ✅ Gestione errori e stati di caricamento

### Fase 4 - Notifiche (2-3 giorni)
1. ✅ Scheduler notifiche
2. ✅ Quiet hours implementation
3. ✅ Fullscreen detection
4. ✅ System tray integration

### Fase 5 - Testing & Refinement (2-3 giorni)
1. ✅ Testing su Windows 10/11
2. ✅ Ottimizzazione performance
3. ✅ Bug fixing
4. ✅ Packaging e installer

---

## Note Importanti

### Privacy & Sicurezza
- ✅ Tutti i dati rimangono locali (vera_data.db)
- ✅ Nessuna connessione internet richiesta
- ✅ Nessuna telemetria o tracking
- ✅ Rust garantisce memory safety

### Monitoraggio Energetico
- Il monitoraggio sarà una **stima** basata su CPU/RAM/processi
- Per monitoraggio hardware reale servirebbero librerie specifiche (es. NVIDIA SMI per GPU)
- Alternative: usare Windows Performance Counters o Intel RAPL

### Limitazioni
- Tauri richiede che l'utente abbia Webview2 installato (automatico su Windows 11)
- Il monitoraggio energetico accurato richiede privilegi amministratore

---

## Risorse Utili

- [Documentazione Tauri](https://tauri.app)
- [Rust Book](https://doc.rust-lang.org/book/)
- [sysinfo crate](https://docs.rs/sysinfo/latest/sysinfo/)
- [rusqlite](https://docs.rs/rusqlite/latest/rusqlite/)

---

## Conclusione

Questo documento fornisce una roadmap completa per trasformare il prototipo web VERA in un'applicazione desktop nativa usando Tauri + Rust + React + Vite. Il codice frontend React già sviluppato può essere riutilizzato al 100%, aggiungendo solo le integrazioni con le API Tauri.
