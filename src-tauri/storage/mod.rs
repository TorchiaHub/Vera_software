// Storage module for local database
pub mod db;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSettings {
    pub quiet_hours_start: u8,    // 0-23
    pub quiet_hours_end: u8,      // 0-23
    pub region: String,
    pub theme: String,
    pub notifications_enabled: bool,
    pub device_type: String,
}

impl Default for UserSettings {
    fn default() -> Self {
        Self {
            quiet_hours_start: 19,
            quiet_hours_end: 8,
            region: "Lombardia".to_string(),
            theme: "light".to_string(),
            notifications_enabled: true,
            device_type: "pc".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notification {
    pub id: String,
    pub title: String,
    pub message: String,
    pub timestamp: i64,
    pub read: bool,
    #[serde(rename = "type")]
    pub type_: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notification {
    pub id: String,
    pub title: String,
    pub message: String,
    pub timestamp: i64,
    pub read: bool,
    #[serde(rename = "type")]
    pub type_: String,
}
