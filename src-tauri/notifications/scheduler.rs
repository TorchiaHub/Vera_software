// Notification scheduler respecting quiet hours
use tauri::{AppHandle, Manager};
use tokio::time::{interval, Duration};
use chrono::{Local, Timelike, Datelike, Weekday};

use crate::storage;

/// Check if current time is within quiet hours
async fn is_quiet_hours() -> bool {
    match storage::db::load_settings().await {
        Ok(settings) => {
            let now = Local::now();
            let hour = now.hour() as u8;
            
            let start = settings.quiet_hours_start;
            let end = settings.quiet_hours_end;
            
            // Handle wrap-around (e.g., 19:00 to 08:00)
            if start > end {
                hour >= start || hour < end
            } else {
                hour >= start && hour < end
            }
        }
        Err(_) => {
            // Default: 19:00 to 08:00
            let hour = Local::now().hour();
            hour >= 19 || hour < 8
        }
    }
}

/// Check if a fullscreen application is running
#[cfg(target_os = "windows")]
fn is_fullscreen_app_active() -> bool {
    // TODO: Implementare usando Windows API
    // Richiede: winapi crate
    // GetForegroundWindow() + GetWindowRect() + confronto con screen size
    false
}

#[cfg(not(target_os = "windows"))]
fn is_fullscreen_app_active() -> bool {
    false
}

/// Start notification scheduler
pub async fn start(app: AppHandle) {
    let mut check_interval = interval(Duration::from_secs(60)); // Check every minute
    
    let mut last_daily_notification = 0u32;
    let mut last_weekly_notification = (0u32, 0u32); // (week, year)
    let mut last_monthly_notification = (0u32, 0u32); // (month, year)
    
    loop {
        check_interval.tick().await;
        
        // Skip if in quiet hours
        if is_quiet_hours().await {
            continue;
        }
        
        // Skip if fullscreen app is active
        if is_fullscreen_app_active() {
            continue;
        }
        
        // Check if notifications are enabled
        let settings = match storage::db::load_settings().await {
            Ok(s) => s,
            Err(_) => continue,
        };
        
        if !settings.notifications_enabled {
            continue;
        }
        
        let now = Local::now();
        let hour = now.hour();
        let minute = now.minute();
        let day = now.day();
        let weekday = now.weekday();
        let month = now.month();
        let year = now.year() as u32;
        
        // Daily notification at 18:00
        if hour == 18 && minute == 0 && last_daily_notification != day {
            send_daily_summary(&app).await;
            last_daily_notification = day;
        }
        
        // Weekly notification on Sunday at 10:00
        if weekday == Weekday::Sun && hour == 10 && minute == 0 {
            let week = now.iso_week().week();
            if last_weekly_notification != (week, year) {
                send_weekly_summary(&app).await;
                last_weekly_notification = (week, year);
            }
        }
        
        // Monthly notification on 1st day at 10:00
        if day == 1 && hour == 10 && minute == 0 {
            if last_monthly_notification != (month, year) {
                send_monthly_summary(&app).await;
                last_monthly_notification = (month, year);
            }
        }
    }
}

async fn send_daily_summary(app: &AppHandle) {
    match storage::db::get_stats("day", "pc").await {
        Ok(stats) => {
            let notification_type = if stats.today_kwh > 2.0 { "warning" } else { "info" };
            let title = if stats.today_kwh > 2.0 { 
                "Consumo elevato oggi" 
            } else { 
                "Riepilogo giornaliero" 
            };
            
            let message = format!(
                "Oggi: {:.2} kWh ≈ {:.1} bottiglie 💧 | CO₂: {:.0}g",
                stats.today_kwh,
                stats.bottles_today,
                stats.co2_today
            );
            
            // Save notification to database
            let notification = storage::Notification {
                id: format!("daily-{}", chrono::Utc::now().timestamp()),
                title: title.to_string(),
                message,
                timestamp: chrono::Utc::now().timestamp(),
                read: false,
                type_: notification_type.to_string(),
            };
            
            if let Err(e) = storage::db::save_notification(notification.clone()).await {
                eprintln!("Failed to save notification: {}", e);
            }
            
            // Emit to frontend
            app.emit_all("new-notification", &notification).ok();
        }
        Err(e) => {
            eprintln!("Failed to get daily stats: {}", e);
        }
    }
}

async fn send_weekly_summary(app: &AppHandle) {
    match storage::db::get_stats("week", "pc").await {
        Ok(stats) => {
            let notification_type = if stats.weekly_trend < -5.0 { "success" } else { "info" };
            let title = if stats.weekly_trend < -5.0 {
                "Ottimo lavoro questa settimana! 🎉"
            } else {
                "Riepilogo settimanale"
            };
            
            let message = format!(
                "Questa settimana: {:.2} kWh ≈ {:.1} bottiglie 💧 | Trend: {:.1}%",
                stats.weekly_kwh,
                stats.bottles_week,
                stats.weekly_trend
            );
            
            // Save notification to database
            let notification = storage::Notification {
                id: format!("weekly-{}", chrono::Utc::now().timestamp()),
                title: title.to_string(),
                message,
                timestamp: chrono::Utc::now().timestamp(),
                read: false,
                type_: notification_type.to_string(),
            };
            
            if let Err(e) = storage::db::save_notification(notification.clone()).await {
                eprintln!("Failed to save notification: {}", e);
            }
            
            // Emit to frontend
            app.emit_all("new-notification", &notification).ok();
        }
        Err(e) => {
            eprintln!("Failed to get weekly stats: {}", e);
        }
    }
}

async fn send_monthly_summary(app: &AppHandle) {
    match storage::db::get_stats("month", "pc").await {
        Ok(stats) => {
            let euro_cost = stats.monthly_kwh * 0.30; // €0.30/kWh average
            
            let message = format!(
                "Report mensile: {:.2} kWh ≈ {:.0} bottiglie 💧 | CO₂: {:.1} kg | Costo stimato: €{:.2}",
                stats.monthly_kwh,
                stats.bottles_month,
                stats.co2_month / 1000.0,
                euro_cost
            );
            
            // Save notification to database
            let notification = storage::Notification {
                id: format!("monthly-{}", chrono::Utc::now().timestamp()),
                title: "Report mensile 📊".to_string(),
                message,
                timestamp: chrono::Utc::now().timestamp(),
                read: false,
                type_: "info".to_string(),
            };
            
            if let Err(e) = storage::db::save_notification(notification.clone()).await {
                eprintln!("Failed to save notification: {}", e);
            }
            
            // Emit to frontend
            app.emit_all("new-notification", &notification).ok();
        }
        Err(e) => {
            eprintln!("Failed to get monthly stats: {}", e);
        }
    }
}
