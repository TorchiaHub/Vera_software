// Utility functions for VERA Tauri application

use std::time::{SystemTime, UNIX_EPOCH};

/// Get current timestamp in milliseconds
pub fn get_timestamp_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

/// Format bytes to human readable string
pub fn format_bytes(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    
    if bytes == 0 {
        return "0 B".to_string();
    }
    
    let mut size = bytes as f64;
    let mut unit_index = 0;
    
    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }
    
    format!("{:.1} {}", size, UNITS[unit_index])
}

/// Calculate energy efficiency score (0-100)
pub fn calculate_efficiency_score(
    cpu_usage: f32,
    memory_usage: f32,
    power_consumption: f32,
) -> f32 {
    // Simple efficiency calculation based on resource usage
    let efficiency = 100.0 - ((cpu_usage + memory_usage) / 2.0);
    let power_penalty = (power_consumption / 150.0) * 10.0; // Assume 150W max
    
    (efficiency - power_penalty).max(0.0).min(100.0)
}

/// Convert temperature from Celsius to Fahrenheit
pub fn celsius_to_fahrenheit(celsius: f32) -> f32 {
    (celsius * 9.0 / 5.0) + 32.0
}

/// Validate hardware temperature ranges
pub fn is_temperature_safe(component: &str, temp_celsius: f32) -> bool {
    match component {
        "cpu" => temp_celsius < 80.0,
        "gpu" => temp_celsius < 85.0,
        "motherboard" => temp_celsius < 60.0,
        "storage" => temp_celsius < 55.0,
        _ => temp_celsius < 70.0,
    }
}

/// Generate unique device ID
pub fn generate_device_id() -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let hostname = hostname::get()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    
    let mut hasher = DefaultHasher::new();
    hostname.hash(&mut hasher);
    get_timestamp_ms().hash(&mut hasher);
    
    format!("vera_device_{:x}", hasher.finish())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_bytes() {
        assert_eq!(format_bytes(0), "0 B");
        assert_eq!(format_bytes(512), "512.0 B");
        assert_eq!(format_bytes(1024), "1.0 KB");
        assert_eq!(format_bytes(1536), "1.5 KB");
        assert_eq!(format_bytes(1048576), "1.0 MB");
    }

    #[test]
    fn test_efficiency_score() {
        let score = calculate_efficiency_score(50.0, 60.0, 75.0);
        assert!(score >= 0.0 && score <= 100.0);
    }

    #[test]
    fn test_temperature_safety() {
        assert!(is_temperature_safe("cpu", 70.0));
        assert!(!is_temperature_safe("cpu", 90.0));
        assert!(is_temperature_safe("gpu", 80.0));
        assert!(!is_temperature_safe("gpu", 95.0));
    }
}