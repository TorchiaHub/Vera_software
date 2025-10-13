-- ============================================
-- VERA - Database Schema per Supabase
-- ============================================
-- Tabella per memorizzare le metriche di performance del PC
-- con supporto multi-dispositivo e tracciamento temporale

-- Abilita estensione UUID se non già attiva
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella principale: performance_metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  -- Chiave primaria
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timestamp della misurazione
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metriche hardware (valori 0-100 in percentuale)
  cpu_usage REAL NOT NULL CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
  ram_usage REAL NOT NULL CHECK (ram_usage >= 0 AND ram_usage <= 100),
  gpu_usage REAL NOT NULL CHECK (gpu_usage >= 0 AND gpu_usage <= 100),
  disk_usage REAL NOT NULL CHECK (disk_usage >= 0 AND disk_usage <= 100),
  network_usage REAL NOT NULL CHECK (network_usage >= 0),
  
  -- Equivalente in bottigliette d'acqua (calcolato dal frontend)
  water_bottles_equivalent REAL NOT NULL CHECK (water_bottles_equivalent >= 0),
  
  -- Informazioni dispositivo (opzionali per multi-device)
  device_id TEXT,
  device_name TEXT,
  
  -- Timestamp di creazione automatico
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per ottimizzare le query più comuni
CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_device ON performance_metrics(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_created_at ON performance_metrics(created_at DESC);

-- Indice composito per query multi-dispositivo con range temporale
CREATE INDEX IF NOT EXISTS idx_performance_device_time ON performance_metrics(device_id, timestamp DESC, created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Nota: Per semplicità, iniziamo senza RLS
-- Abilitare RLS quando si implementa l'autenticazione utente

-- ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy per inserimento (chiunque può inserire - per ora)
-- CREATE POLICY "Allow insert for all users" ON performance_metrics
--   FOR INSERT WITH CHECK (true);

-- Policy per lettura (chiunque può leggere - per ora)
-- CREATE POLICY "Allow select for all users" ON performance_metrics
--   FOR SELECT USING (true);

-- ============================================
-- Funzioni utility
-- ============================================

-- Funzione per calcolare statistiche aggregate per intervallo temporale
CREATE OR REPLACE FUNCTION get_performance_stats(
  p_device_id TEXT DEFAULT NULL,
  p_start_time TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  p_end_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  avg_cpu REAL,
  avg_ram REAL,
  avg_gpu REAL,
  avg_disk REAL,
  avg_network REAL,
  total_water_bottles REAL,
  max_cpu REAL,
  max_ram REAL,
  max_gpu REAL,
  record_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG(cpu_usage)::REAL as avg_cpu,
    AVG(ram_usage)::REAL as avg_ram,
    AVG(gpu_usage)::REAL as avg_gpu,
    AVG(disk_usage)::REAL as avg_disk,
    AVG(network_usage)::REAL as avg_network,
    SUM(water_bottles_equivalent)::REAL as total_water_bottles,
    MAX(cpu_usage)::REAL as max_cpu,
    MAX(ram_usage)::REAL as max_ram,
    MAX(gpu_usage)::REAL as max_gpu,
    COUNT(*)::BIGINT as record_count
  FROM performance_metrics
  WHERE 
    timestamp BETWEEN p_start_time AND p_end_time
    AND (p_device_id IS NULL OR device_id = p_device_id);
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggregare dati per ora (utile per grafici)
CREATE OR REPLACE FUNCTION get_hourly_performance(
  p_device_id TEXT DEFAULT NULL,
  p_hours INT DEFAULT 24
)
RETURNS TABLE (
  hour_bucket TIMESTAMPTZ,
  avg_cpu REAL,
  avg_ram REAL,
  avg_gpu REAL,
  avg_water_bottles REAL,
  sample_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('hour', timestamp) as hour_bucket,
    AVG(cpu_usage)::REAL as avg_cpu,
    AVG(ram_usage)::REAL as avg_ram,
    AVG(gpu_usage)::REAL as avg_gpu,
    AVG(water_bottles_equivalent)::REAL as avg_water_bottles,
    COUNT(*)::BIGINT as sample_count
  FROM performance_metrics
  WHERE 
    timestamp >= NOW() - (p_hours || ' hours')::INTERVAL
    AND (p_device_id IS NULL OR device_id = p_device_id)
  GROUP BY hour_bucket
  ORDER BY hour_bucket DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Pulizia automatica dati vecchi (opzionale)
-- ============================================
-- Funzione per eliminare record più vecchi di N giorni
CREATE OR REPLACE FUNCTION cleanup_old_metrics(days_to_keep INT DEFAULT 90)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger per mantenere timestamp aggiornato
-- ============================================
-- Nota: created_at è impostato automaticamente, ma timestamp può essere sovrascritto
-- dal client per precisione

-- ============================================
-- View per dashboard (opzionale)
-- ============================================
CREATE OR REPLACE VIEW recent_performance AS
SELECT 
  id,
  timestamp,
  cpu_usage,
  ram_usage,
  gpu_usage,
  disk_usage,
  network_usage,
  water_bottles_equivalent,
  device_id,
  device_name,
  created_at
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- ============================================
-- Commenti descrittivi
-- ============================================
COMMENT ON TABLE performance_metrics IS 'Memorizza le metriche di performance del PC raccolte da VERA';
COMMENT ON COLUMN performance_metrics.water_bottles_equivalent IS 'Equivalente in bottiglie d''acqua da 500ml del consumo energetico';
COMMENT ON COLUMN performance_metrics.device_id IS 'Identificatore univoco del dispositivo (fingerprint)';
COMMENT ON COLUMN performance_metrics.timestamp IS 'Momento esatto della misurazione (dal client)';
COMMENT ON COLUMN performance_metrics.created_at IS 'Momento di inserimento nel database (server)';

-- ============================================
-- Grant permessi (da adattare in base alle policy RLS)
-- ============================================
-- GRANT SELECT, INSERT ON performance_metrics TO authenticated;
-- GRANT SELECT ON recent_performance TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_performance_stats TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_hourly_performance TO authenticated;
