# Backend Integration - VERA

## Implementazioni Completate

### 1. Notifiche in Tempo Reale
- **Hook**: `useTauriNotifications.ts` - Gestisce le notifiche dal backend Tauri
- **Componente**: `notification-menu.tsx` - Menu dropdown per visualizzare notifiche
- **Backend**: 
  - Tabella SQLite `notifications` per persistenza
  - Comandi Tauri: `get_notifications`, `mark_notification_read`, `mark_all_notifications_read`, `delete_notification`
  - Eventi real-time: `new-notification` emesso dal backend

### 2. Sincronizzazione Tema con Database
- **Hook**: `useTauri.ts` - Carica tema all'avvio da SQLite
- **Componente**: `theme-toggle.tsx` - Salva preferenza tema nel database
- **Backend**: Campo `theme` nella tabella `user_settings`
- **Comandi**: `get_settings`, `update_settings`

### 3. Ordinamento Header Dinamico
- **Implementazione**: In `App.tsx`
- **Comportamento**:
  - **Light/Dark**: Profilo → Tema
  - **School**: Tema → Profilo

### 4. Ottimizzazioni Performance
- Rimosso `motion/react` per evitare timeout
- Utilizzate transizioni CSS native con animazioni custom
- Gestione errori migliorata con fallback

## Comandi Tauri Disponibili

### Energia
- `get_current_power()` - Consumo corrente in Watts
- `get_energy_stats(period, deviceType)` - Statistiche per periodo

### Impostazioni
- `get_settings()` - Carica impostazioni utente
- `update_settings(settings)` - Salva impostazioni (incluso tema)

### Notifiche
- `get_notifications()` - Lista notifiche dal database
- `mark_notification_read(id)` - Segna notifica come letta
- `mark_all_notifications_read()` - Segna tutte come lette
- `delete_notification(id)` - Elimina notifica

### Monitoraggio
- `start_monitoring()` - Avvia monitoraggio energia
- `stop_monitoring()` - Ferma monitoraggio

## Eventi Real-Time

### energy-update
Payload: `{ currentPower, todayKwh, bottlesToday, co2Today }`
Frequenza: Ogni 3 secondi

### new-notification
Payload: `Notification { id, title, message, timestamp, read, type }`
Trigger: Quando il backend crea una notifica

## Schema Database SQLite

### notifications
```sql
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL
);
```

### user_settings
```sql
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY,
    quiet_hours_start INTEGER,
    quiet_hours_end INTEGER,
    region TEXT,
    theme TEXT,
    notifications_enabled INTEGER,
    device_type TEXT
);
```

## CSS Animations

Aggiunte animazioni custom in `globals.css`:
- `fade-in` - Fade in opacity
- `slide-in-from-top-2` - Slide da alto
- Classe helper `animate-in` con `duration-200`

## Note Implementazione

1. **Fallback Mock**: Il hook `useTauri.ts` include mock API per sviluppo web
2. **Formato Timestamp**: Notifiche usano Unix timestamp (secondi), convertiti in formato leggibile
3. **Tipo Notifica**: `info | warning | success` con colori differenti
4. **Persistenza Tema**: Salvato automaticamente al cambio, caricato all'avvio
5. **Privacy**: Solo metriche anonime, nessun dato personale oltre le impostazioni locali
