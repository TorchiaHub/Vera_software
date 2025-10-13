// VERA - Tauri Backend (Rust)
// This file should be placed in: src-tauri/src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::{Manager, WindowEvent};
use std::sync::Mutex;

mod energy;
mod notifications;
mod storage;
mod system_monitor;

// Global state
struct AppState {
    monitoring_active: Mutex<bool>,
    system_monitor: Mutex<system_monitor::SystemMonitor>,
}

// Tauri Commands - API callable from frontend
#[tauri::command]
async fn get_current_power() -> Result<f64, String> {
    energy::monitor::get_current_consumption()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_energy_stats(period: String, device_type: String) -> Result<energy::EnergyStats, String> {
    storage::db::get_stats(&period, &device_type)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_settings(settings: storage::UserSettings) -> Result<(), String> {
    storage::db::save_settings(settings)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_settings() -> Result<storage::UserSettings, String> {
    storage::db::load_settings()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn start_monitoring(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut active = state.monitoring_active.lock().unwrap();
    *active = true;
    Ok(())
}

#[tauri::command]
async fn stop_monitoring(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut active = state.monitoring_active.lock().unwrap();
    *active = false;
    Ok(())
}

#[tauri::command]
async fn get_notifications() -> Result<Vec<storage::Notification>, String> {
    storage::db::get_notifications()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn mark_notification_read(id: String) -> Result<(), String> {
    storage::db::mark_notification_read(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn mark_all_notifications_read() -> Result<(), String> {
    storage::db::mark_all_notifications_read()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_notification(id: String) -> Result<(), String> {
    storage::db::delete_notification(&id)
        .await
        .map_err(|e| e.to_string())
}

// System monitoring commands
#[tauri::command]
async fn get_system_metrics(state: tauri::State<'_, AppState>) -> Result<system_monitor::SystemMetrics, String> {
    let mut monitor = state.system_monitor.lock().unwrap();
    Ok(monitor.get_metrics())
}

#[tauri::command]
async fn get_active_applications(state: tauri::State<'_, AppState>) -> Result<Vec<system_monitor::ActiveApplication>, String> {
    let mut monitor = state.system_monitor.lock().unwrap();
    Ok(monitor.get_active_applications())
}

fn main() {
    // System Tray setup
    let show = CustomMenuItem::new("show".to_string(), "Show VERA");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide Window");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit VERA");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .manage(AppState {
            monitoring_active: Mutex::new(true),
            system_monitor: Mutex::new(system_monitor::SystemMonitor::new()),
        })
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
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
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
            update_settings,
            get_settings,
            start_monitoring,
            stop_monitoring,
            get_notifications,
            mark_notification_read,
            mark_all_notifications_read,
            delete_notification,
            get_system_metrics,
            get_active_applications
        ])
        .setup(|app| {
            // Initialize database
            tauri::async_runtime::block_on(async {
                storage::db::init_database().await.expect("Failed to initialize database");
            });

            // Start background energy monitoring
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                energy::monitor::start_monitoring(app_handle).await;
            });

            // Start notification scheduler
            let app_handle2 = app.handle();
            tauri::async_runtime::spawn(async move {
                notifications::scheduler::start(app_handle2).await;
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
