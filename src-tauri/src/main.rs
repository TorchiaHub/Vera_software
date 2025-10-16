// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

struct AppState {
    monitoring_active: Mutex<bool>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello {}! Welcome to VERA Energy Monitor", name)
}

#[tauri::command]
fn get_current_power() -> f64 {
    45.2
}

#[tauri::command]
fn get_system_metrics() -> serde_json::Value {
    serde_json::json!({
        "cpu_usage": 35.4,
        "memory_usage": 65.2,
        "disk_usage": 78.1,
        "network_speed": 1024.0,
        "temperature": 42.5,
        "power_consumption": 67.8
    })
}

#[tauri::command]
fn get_energy_stats() -> serde_json::Value {
    serde_json::json!({
        "daily": 1.25,
        "weekly": 8.75,
        "monthly": 37.5,
        "co2_saved": 250.0
    })
}

#[tauri::command]
fn start_monitoring(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut active = state.monitoring_active.lock().unwrap();
    *active = true;
    Ok(())
}

#[tauri::command]
fn stop_monitoring(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut active = state.monitoring_active.lock().unwrap();
    *active = false;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            monitoring_active: Mutex::new(true),
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_current_power,
            get_system_metrics,
            get_energy_stats,
            start_monitoring,
            stop_monitoring
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
