// Energy monitoring module
pub mod monitor;
pub mod calculator;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnergyStats {
    pub current_power: f64,      // Watts
    pub today_kwh: f64,
    pub weekly_kwh: f64,
    pub monthly_kwh: f64,
    pub bottles_today: f64,
    pub bottles_week: f64,
    pub bottles_month: f64,
    pub co2_today: f64,           // grams
    pub co2_week: f64,
    pub co2_month: f64,
    pub weekly_trend: f64,        // percentage
    pub peak_today: f64,
    pub max_power: f64,
}

impl Default for EnergyStats {
    fn default() -> Self {
        Self {
            current_power: 0.0,
            today_kwh: 0.0,
            weekly_kwh: 0.0,
            monthly_kwh: 0.0,
            bottles_today: 0.0,
            bottles_week: 0.0,
            bottles_month: 0.0,
            co2_today: 0.0,
            co2_week: 0.0,
            co2_month: 0.0,
            weekly_trend: 0.0,
            peak_today: 0.0,
            max_power: 150.0,
        }
    }
}
