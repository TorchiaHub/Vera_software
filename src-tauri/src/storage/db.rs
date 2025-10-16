// SQLite database for local data storage
use rusqlite::{Connection, Result, params};
use tokio::sync::Mutex;
use std::sync::Arc;
use chrono::{Local, NaiveDate, Datelike};
use once_cell::sync::Lazy;

use crate::energy::EnergyStats;
use super::{UserSettings, Notification};

// Global database connection
static DB: Lazy<Arc<Mutex<Connection>>> = Lazy::new(|| {
    let conn = Connection::open("vera_data.db")
        .expect("Failed to open database");
    Arc::new(Mutex::new(conn))
});

/// Initialize database schema
pub async fn init_database() -> Result<()> {
    let db = DB.lock().await;
    
    // Energy readings table
    db.execute(
        "CREATE TABLE IF NOT EXISTS energy_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL,
            device_type TEXT NOT NULL,
            power_watts REAL NOT NULL,
            kwh_increment REAL NOT NULL
        )",
        [],
    )?;

    // Create index for faster queries
    db.execute(
        "CREATE INDEX IF NOT EXISTS idx_timestamp 
         ON energy_readings(timestamp)",
        [],
    )?;

    // User settings table
    db.execute(
        "CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY,
            quiet_hours_start INTEGER,
            quiet_hours_end INTEGER,
            region TEXT,
            theme TEXT,
            notifications_enabled INTEGER,
            device_type TEXT
        )",
        [],
    )?;

    // Insert default settings if not exists
    db.execute(
        "INSERT OR IGNORE INTO user_settings 
         (id, quiet_hours_start, quiet_hours_end, region, theme, notifications_enabled, device_type) 
         VALUES (1, 19, 8, 'Lombardia', 'light', 1, 'pc')",
        [],
    )?;

    // Notifications table
    db.execute(
        "CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            read INTEGER NOT NULL DEFAULT 0,
            type TEXT NOT NULL
        )",
        [],
    )?;

    // Create index for faster queries
    db.execute(
        "CREATE INDEX IF NOT EXISTS idx_notification_timestamp 
         ON notifications(timestamp DESC)",
        [],
    )?;

    Ok(())
}

/// Save energy reading
pub async fn save_reading(power: f64, kwh: f64) -> Result<()> {
    let db = DB.lock().await;
    let timestamp = chrono::Utc::now().timestamp();
    
    db.execute(
        "INSERT INTO energy_readings (timestamp, device_type, power_watts, kwh_increment) 
         VALUES (?1, ?2, ?3, ?4)",
        params![timestamp, "pc", power, kwh],
    )?;
    
    Ok(())
}

/// Get statistics for a given period
pub async fn get_stats(period: &str, device_type: &str) -> Result<EnergyStats> {
    let db = DB.lock().await;
    let now = Local::now();
    
    let (start_timestamp, end_timestamp) = match period {
        "day" => {
            let start_of_day = now
                .date_naive()
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_utc()
                .timestamp();
            let end = now.timestamp();
            (start_of_day, end)
        },
        "week" => {
            let days_since_monday = now.weekday().num_days_from_monday();
            let start_of_week = (now - chrono::Duration::days(days_since_monday as i64))
                .date_naive()
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_utc()
                .timestamp();
            (start_of_week, now.timestamp())
        },
        "month" => {
            let start_of_month = NaiveDate::from_ymd_opt(now.year(), now.month(), 1)
                .unwrap()
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_utc()
                .timestamp();
            (start_of_month, now.timestamp())
        },
        _ => return Err(rusqlite::Error::InvalidQuery),
    };

    // Query total kWh for period
    let total_kwh: f64 = db.query_row(
        "SELECT COALESCE(SUM(kwh_increment), 0.0) 
         FROM energy_readings 
         WHERE timestamp >= ?1 AND timestamp <= ?2 AND device_type = ?3",
        params![start_timestamp, end_timestamp, device_type],
        |row| row.get(0),
    )?;

    // Query peak power for today
    let peak_power: f64 = db.query_row(
        "SELECT COALESCE(MAX(power_watts), 0.0) 
         FROM energy_readings 
         WHERE timestamp >= ?1 AND device_type = ?2",
        params![start_timestamp, device_type],
        |row| row.get(0),
    ).unwrap_or(0.0);

    // Calculate CO2 and bottles
    let co2_grams = total_kwh * 500.0; // 0.5 kg/kWh * 1000
    let bottles = total_kwh * 3.0;

    // Get previous period for trend calculation
    let prev_period_duration = end_timestamp - start_timestamp;
    let prev_start = start_timestamp - prev_period_duration;
    
    let prev_kwh: f64 = db.query_row(
        "SELECT COALESCE(SUM(kwh_increment), 0.0) 
         FROM energy_readings 
         WHERE timestamp >= ?1 AND timestamp < ?2 AND device_type = ?3",
        params![prev_start, start_timestamp, device_type],
        |row| row.get(0),
    ).unwrap_or(0.0);

    let trend = if prev_kwh > 0.0 {
        ((total_kwh - prev_kwh) / prev_kwh) * 100.0
    } else {
        0.0
    };

    // Get stats for different periods
    let today_kwh = if period == "day" { 
        total_kwh 
    } else {
        get_period_kwh(&db, "day", device_type)?
    };

    let weekly_kwh = if period == "week" { 
        total_kwh 
    } else {
        get_period_kwh(&db, "week", device_type)?
    };

    let monthly_kwh = if period == "month" { 
        total_kwh 
    } else {
        get_period_kwh(&db, "month", device_type)?
    };

    Ok(EnergyStats {
        current_power: 0.0, // Will be updated by monitor
        today_kwh,
        weekly_kwh,
        monthly_kwh,
        bottles_today: today_kwh * 3.0,
        bottles_week: weekly_kwh * 3.0,
        bottles_month: monthly_kwh * 3.0,
        co2_today: today_kwh * 500.0,
        co2_week: weekly_kwh * 500.0,
        co2_month: monthly_kwh * 500.0,
        weekly_trend: trend,
        peak_today: peak_power,
        max_power: 150.0, // Default, could be device-specific
    })
}

fn get_period_kwh(db: &Connection, period: &str, device_type: &str) -> Result<f64> {
    let now = Local::now();
    
    let start_timestamp = match period {
        "day" => {
            now.date_naive()
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_utc()
                .timestamp()
        },
        "week" => {
            let days_since_monday = now.weekday().num_days_from_monday();
            (now - chrono::Duration::days(days_since_monday as i64))
                .date_naive()
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_utc()
                .timestamp()
        },
        "month" => {
            NaiveDate::from_ymd_opt(now.year(), now.month(), 1)
                .unwrap()
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_utc()
                .timestamp()
        },
        _ => return Ok(0.0),
    };

    db.query_row(
        "SELECT COALESCE(SUM(kwh_increment), 0.0) 
         FROM energy_readings 
         WHERE timestamp >= ?1 AND device_type = ?2",
        params![start_timestamp, device_type],
        |row| row.get(0),
    )
}

/// Save user settings
pub async fn save_settings(settings: UserSettings) -> Result<()> {
    let db = DB.lock().await;
    
    db.execute(
        "UPDATE user_settings SET 
         quiet_hours_start = ?1,
         quiet_hours_end = ?2,
         region = ?3,
         theme = ?4,
         notifications_enabled = ?5,
         device_type = ?6
         WHERE id = 1",
        params![
            settings.quiet_hours_start,
            settings.quiet_hours_end,
            settings.region,
            settings.theme,
            settings.notifications_enabled as i32,
            settings.device_type
        ],
    )?;
    
    Ok(())
}

/// Load user settings
pub async fn load_settings() -> Result<UserSettings> {
    let db = DB.lock().await;
    
    db.query_row(
        "SELECT quiet_hours_start, quiet_hours_end, region, theme, notifications_enabled, device_type 
         FROM user_settings WHERE id = 1",
        [],
        |row| {
            Ok(UserSettings {
                quiet_hours_start: row.get(0)?,
                quiet_hours_end: row.get(1)?,
                region: row.get(2)?,
                theme: row.get(3)?,
                notifications_enabled: row.get::<_, i32>(4)? != 0,
                device_type: row.get(5)?,
            })
        },
    )
}

/// Clear old data (keep last N days)
pub async fn cleanup_old_data(days_to_keep: i64) -> Result<()> {
    let db = DB.lock().await;
    let cutoff = (Local::now() - chrono::Duration::days(days_to_keep))
        .timestamp();
    
    db.execute(
        "DELETE FROM energy_readings WHERE timestamp < ?1",
        params![cutoff],
    )?;
    
    Ok(())
}

/// Save notification to database
pub async fn save_notification(notification: super::Notification) -> Result<()> {
    let db = DB.lock().await;
    
    db.execute(
        "INSERT INTO notifications (id, title, message, timestamp, read, type) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            notification.id,
            notification.title,
            notification.message,
            notification.timestamp,
            notification.read as i32,
            notification.type_
        ],
    )?;
    
    Ok(())
}

/// Get all notifications
pub async fn get_notifications() -> Result<Vec<super::Notification>> {
    let db = DB.lock().await;
    
    let mut stmt = db.prepare(
        "SELECT id, title, message, timestamp, read, type 
         FROM notifications 
         ORDER BY timestamp DESC 
         LIMIT 50"
    )?;
    
    let notifications = stmt.query_map([], |row| {
        Ok(super::Notification {
            id: row.get(0)?,
            title: row.get(1)?,
            message: row.get(2)?,
            timestamp: row.get(3)?,
            read: row.get::<_, i32>(4)? != 0,
            type_: row.get(5)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;
    
    Ok(notifications)
}

/// Mark notification as read
pub async fn mark_notification_read(id: &str) -> Result<()> {
    let db = DB.lock().await;
    
    db.execute(
        "UPDATE notifications SET read = 1 WHERE id = ?1",
        params![id],
    )?;
    
    Ok(())
}

/// Mark all notifications as read
pub async fn mark_all_notifications_read() -> Result<()> {
    let db = DB.lock().await;
    
    db.execute("UPDATE notifications SET read = 1", [])?;
    
    Ok(())
}

/// Delete notification
pub async fn delete_notification(id: &str) -> Result<()> {
    let db = DB.lock().await;
    
    db.execute(
        "DELETE FROM notifications WHERE id = ?1",
        params![id],
    )?;
    
    Ok(())
}

/// Get all notifications
pub async fn get_notifications() -> Result<Vec<Notification>> {
    let db = DB.lock().await;
    
    let mut stmt = db.prepare(
        "SELECT id, title, message, timestamp, read, type 
         FROM notifications 
         ORDER BY timestamp DESC 
         LIMIT 50"
    )?;
    
    let notifications = stmt.query_map([], |row| {
        Ok(Notification {
            id: row.get(0)?,
            title: row.get(1)?,
            message: row.get(2)?,
            timestamp: row.get(3)?,
            read: row.get::<_, i32>(4)? != 0,
            type_: row.get(5)?,
        })
    })?;
    
    let mut result = Vec::new();
    for notification in notifications {
        result.push(notification?);
    }
    
    Ok(result)
}

/// Save a new notification
pub async fn save_notification(notification: Notification) -> Result<()> {
    let db = DB.lock().await;
    
    db.execute(
        "INSERT INTO notifications (id, title, message, timestamp, read, type) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            notification.id,
            notification.title,
            notification.message,
            notification.timestamp,
            notification.read as i32,
            notification.type_
        ],
    )?;
    
    Ok(())
}

/// Mark notification as read
pub async fn mark_notification_read(id: &str) -> Result<()> {
    let db = DB.lock().await;
    
    db.execute(
        "UPDATE notifications SET read = 1 WHERE id = ?1",
        params![id],
    )?;
    
    Ok(())
}

/// Mark all notifications as read
pub async fn mark_all_notifications_read() -> Result<()> {
    let db = DB.lock().await;
    
    db.execute("UPDATE notifications SET read = 1", [])?;
    
    Ok(())
}

/// Delete notification
pub async fn delete_notification(id: &str) -> Result<()> {
    let db = DB.lock().await;
    
    db.execute(
        "DELETE FROM notifications WHERE id = ?1",
        params![id],
    )?;
    
    Ok(())
}
