// Energy conversion calculations

// Coefficienti di conversione regionali per l'Italia
pub const ITALY_REGIONS_CO2: &[(&str, f64)] = &[
    ("Abruzzo", 0.42),
    ("Basilicata", 0.38),
    ("Calabria", 0.45),
    ("Campania", 0.48),
    ("Emilia-Romagna", 0.35),
    ("Friuli-Venezia Giulia", 0.32),
    ("Lazio", 0.50),
    ("Liguria", 0.40),
    ("Lombardia", 0.38),
    ("Marche", 0.40),
    ("Molise", 0.45),
    ("Piemonte", 0.35),
    ("Puglia", 0.52),
    ("Sardegna", 0.55),
    ("Sicilia", 0.58),
    ("Toscana", 0.38),
    ("Trentino-Alto Adige", 0.25),
    ("Umbria", 0.40),
    ("Valle d'Aosta", 0.22),
    ("Veneto", 0.35),
];

// Media nazionale italiana (2024)
pub const ITALY_CO2_PER_KWH: f64 = 0.5; // kg CO₂/kWh

// Formula VERA: 1 kWh ≈ 1.5L acqua ≈ 3 bottiglie da 0.5L
pub const BOTTLES_PER_KWH: f64 = 3.0;

/// Converti kWh in kg di CO₂ per una regione specifica
pub fn kwh_to_co2(kwh: f64, region: &str) -> f64 {
    let co2_factor = ITALY_REGIONS_CO2
        .iter()
        .find(|(r, _)| r == &region)
        .map(|(_, factor)| *factor)
        .unwrap_or(ITALY_CO2_PER_KWH);
    
    kwh * co2_factor
}

/// Converti kWh in numero di bottiglie d'acqua equivalenti
pub fn kwh_to_bottles(kwh: f64) -> f64 {
    kwh * BOTTLES_PER_KWH
}

/// Converti Watt in kWh per un dato periodo (in secondi)
pub fn watts_to_kwh(watts: f64, duration_seconds: f64) -> f64 {
    (watts * duration_seconds) / (1000.0 * 3600.0)
}

/// Calcola il risparmio energetico rispetto a una baseline
pub fn calculate_savings(current_kwh: f64, baseline_kwh: f64) -> (f64, f64) {
    let kwh_saved = baseline_kwh - current_kwh;
    let percentage = if baseline_kwh > 0.0 {
        (kwh_saved / baseline_kwh) * 100.0
    } else {
        0.0
    };
    
    (kwh_saved, percentage)
}

/// Calcola il trend (percentuale di variazione)
pub fn calculate_trend(current: f64, previous: f64) -> f64 {
    if previous == 0.0 {
        return 0.0;
    }
    
    ((current - previous) / previous) * 100.0
}

/// Proiezione consumo mensile basato su dati parziali
pub fn project_monthly_consumption(current_day: u32, total_kwh_so_far: f64) -> f64 {
    if current_day == 0 {
        return 0.0;
    }
    
    let days_in_month = 30.0; // Semplificazione
    let avg_per_day = total_kwh_so_far / current_day as f64;
    
    avg_per_day * days_in_month
}

/// Calcola il costo energetico (prezzo medio italiano: €0.30/kWh)
pub fn kwh_to_euro(kwh: f64, price_per_kwh: f64) -> f64 {
    kwh * price_per_kwh
}

pub const ITALY_AVG_PRICE_PER_KWH: f64 = 0.30; // Euro

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_kwh_to_bottles() {
        assert_eq!(kwh_to_bottles(1.0), 3.0);
        assert_eq!(kwh_to_bottles(0.5), 1.5);
    }

    #[test]
    fn test_kwh_to_co2() {
        let co2 = kwh_to_co2(1.0, "Lombardia");
        assert_eq!(co2, 0.38);
    }

    #[test]
    fn test_calculate_trend() {
        let trend = calculate_trend(110.0, 100.0);
        assert_eq!(trend, 10.0);
        
        let trend_negative = calculate_trend(90.0, 100.0);
        assert_eq!(trend_negative, -10.0);
    }

    #[test]
    fn test_watts_to_kwh() {
        // 100W per 1 ora = 0.1 kWh
        let kwh = watts_to_kwh(100.0, 3600.0);
        assert!((kwh - 0.1).abs() < 0.001);
    }
}
