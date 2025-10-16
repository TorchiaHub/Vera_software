-- ============================================
-- VERA - Schema Database con Autenticazione Multi-Dispositivo
-- ============================================

-- La tabella users è gestita automaticamente da Supabase Auth (auth.users)
-- Non è necessario crearla manualmente

-- ============================================
-- Tabella: devices
-- ============================================
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('desktop', 'laptop', 'tablet', 'phone')),
  device_id_unique TEXT NOT NULL,
  os TEXT NOT NULL,
  last_sync TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: un user_id non può avere più dispositivi con lo stesso device_id_unique
  UNIQUE(user_id, device_id_unique)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_sync ON devices(last_sync DESC);
CREATE INDEX IF NOT EXISTS idx_devices_user_active ON devices(user_id, is_active);

-- ============================================
-- Tabella: performance_data
-- ============================================
CREATE TABLE IF NOT EXISTS performance_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metriche hardware (0-100%)
  cpu_usage REAL NOT NULL CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
  ram_usage REAL NOT NULL CHECK (ram_usage >= 0 AND ram_usage <= 100),
  gpu_usage REAL NOT NULL CHECK (gpu_usage >= 0 AND gpu_usage <= 100),
  disk_usage REAL NOT NULL CHECK (disk_usage >= 0 AND disk_usage <= 100),
  
  -- Velocità disco (MB/s)
  disk_read_speed REAL NOT NULL CHECK (disk_read_speed >= 0),
  disk_write_speed REAL NOT NULL CHECK (disk_write_speed >= 0),
  
  -- Network (MB/s)
  network_download REAL NOT NULL CHECK (network_download >= 0),
  network_upload REAL NOT NULL CHECK (network_upload >= 0),
  
  -- Equivalente bottiglie d'acqua
  water_bottles_equivalent REAL NOT NULL CHECK (water_bottles_equivalent >= 0),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance query
CREATE INDEX IF NOT EXISTS idx_performance_user_timestamp ON performance_data(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_device_timestamp ON performance_data(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_user_device ON performance_data(user_id, device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_created_at ON performance_data(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Abilita RLS sulle tabelle
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies per devices
-- ============================================

-- Policy: Users possono vedere solo i propri dispositivi
CREATE POLICY "Users can view own devices"
  ON devices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users possono inserire solo i propri dispositivi
CREATE POLICY "Users can insert own devices"
  ON devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users possono aggiornare solo i propri dispositivi
CREATE POLICY "Users can update own devices"
  ON devices
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users possono eliminare solo i propri dispositivi
CREATE POLICY "Users can delete own devices"
  ON devices
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies per performance_data
-- ============================================

-- Policy: Users possono vedere solo i propri dati
CREATE POLICY "Users can view own performance data"
  ON performance_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users possono inserire solo i propri dati
CREATE POLICY "Users can insert own performance data"
  ON performance_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users NON possono aggiornare i dati (immutabili)
-- (Nessuna policy UPDATE - i dati storici non dovrebbero essere modificati)

-- Policy: Users possono eliminare solo i propri dati
CREATE POLICY "Users can delete own performance data"
  ON performance_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Funzioni Utility
-- ============================================

-- Funzione: Ottieni statistiche aggregate per dispositivo
CREATE OR REPLACE FUNCTION get_device_stats(
  p_user_id UUID,
  p_device_id UUID,
  p_start_time TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  p_end_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  avg_cpu REAL,
  avg_ram REAL,
  avg_gpu REAL,
  avg_disk REAL,
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
    SUM(water_bottles_equivalent)::REAL as total_water_bottles,
    MAX(cpu_usage)::REAL as max_cpu,
    MAX(ram_usage)::REAL as max_ram,
    MAX(gpu_usage)::REAL as max_gpu,
    COUNT(*)::BIGINT as record_count
  FROM performance_data
  WHERE 
    user_id = p_user_id
    AND device_id = p_device_id
    AND timestamp BETWEEN p_start_time AND p_end_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Ottieni dispositivi attivi (last_sync < 5 minuti fa)
CREATE OR REPLACE FUNCTION get_active_devices(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  device_name TEXT,
  device_type TEXT,
  os TEXT,
  last_sync TIMESTAMPTZ,
  minutes_since_sync INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.device_name,
    d.device_type,
    d.os,
    d.last_sync,
    EXTRACT(EPOCH FROM (NOW() - d.last_sync))::INTEGER / 60 as minutes_since_sync
  FROM devices d
  WHERE 
    d.user_id = p_user_id
    AND d.is_active = true
    AND d.last_sync > NOW() - INTERVAL '30 days'
  ORDER BY d.last_sync DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Cleanup dati vecchi (retention 90 giorni)
CREATE OR REPLACE FUNCTION cleanup_old_performance_data(days_to_keep INT DEFAULT 90)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM performance_data
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Aggregazione oraria per grafici
CREATE OR REPLACE FUNCTION get_hourly_device_performance(
  p_user_id UUID,
  p_device_id UUID,
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
  FROM performance_data
  WHERE 
    user_id = p_user_id
    AND device_id = p_device_id
    AND timestamp >= NOW() - (p_hours || ' hours')::INTERVAL
  GROUP BY hour_bucket
  ORDER BY hour_bucket DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Auto-aggiornamento last_sync
-- ============================================

CREATE OR REPLACE FUNCTION update_device_last_sync()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE devices
  SET last_sync = NOW()
  WHERE id = NEW.device_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_last_sync
  AFTER INSERT ON performance_data
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_sync();

-- ============================================
-- View: Dispositivi con statistiche recenti
-- ============================================

CREATE OR REPLACE VIEW devices_with_stats AS
SELECT 
  d.id,
  d.user_id,
  d.device_name,
  d.device_type,
  d.os,
  d.last_sync,
  d.is_active,
  d.created_at,
  COUNT(pd.id) as total_records,
  MAX(pd.timestamp) as last_data_timestamp,
  AVG(pd.cpu_usage)::REAL as avg_cpu,
  AVG(pd.ram_usage)::REAL as avg_ram,
  SUM(pd.water_bottles_equivalent)::REAL as total_water_bottles
FROM devices d
LEFT JOIN performance_data pd ON pd.device_id = d.id AND pd.timestamp > NOW() - INTERVAL '24 hours'
GROUP BY d.id, d.user_id, d.device_name, d.device_type, d.os, d.last_sync, d.is_active, d.created_at;

-- ============================================
-- Grant permessi sulle funzioni
-- ============================================

GRANT EXECUTE ON FUNCTION get_device_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_devices TO authenticated;
GRANT EXECUTE ON FUNCTION get_hourly_device_performance TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_performance_data TO service_role;

-- ============================================
-- Commenti
-- ============================================

COMMENT ON TABLE devices IS 'Dispositivi registrati per ogni utente con info hardware';
COMMENT ON TABLE performance_data IS 'Dati storici di performance con relazioni user-device';
COMMENT ON FUNCTION get_device_stats IS 'Statistiche aggregate per dispositivo in range temporale';
COMMENT ON FUNCTION get_active_devices IS 'Lista dispositivi attivi (sync recente)';
COMMENT ON FUNCTION cleanup_old_performance_data IS 'Pulizia automatica dati più vecchi di N giorni';

-- ============================================
-- Setup iniziale completato
-- ============================================

-- Per testare RLS, esegui queste query come utente autenticato:
-- SELECT * FROM devices; -- Vedi solo i tuoi dispositivi
-- SELECT * FROM performance_data WHERE device_id = 'xxx'; -- Vedi solo i tuoi dati
