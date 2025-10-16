# Database Documentation

## Database Architecture

VERA uses multiple database systems depending on the deployment context:

### Production: Supabase PostgreSQL
- **Primary Database**: PostgreSQL hosted on Supabase
- **Authentication**: Supabase Auth (built on GoTrue)
- **Real-time**: PostgreSQL + Supabase Realtime
- **File Storage**: Supabase Storage

### Desktop: SQLite
- **Local Database**: SQLite for offline functionality
- **Sync Mechanism**: Two-way sync with Supabase
- **Performance**: Optimized for local queries

## Schema Overview

### Authentication Tables

#### `auth.users` (Supabase managed)
```sql
-- Built-in Supabase table
id: UUID PRIMARY KEY
email: VARCHAR UNIQUE
encrypted_password: VARCHAR
email_confirmed_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

#### `devices`
```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- 'desktop', 'mobile', 'tablet'
    os_info JSONB,
    hardware_info JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Performance Data Tables

#### `performance_data`
```sql
CREATE TABLE performance_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- System Metrics
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_usage DECIMAL(10,2),
    
    -- Energy Metrics  
    power_consumption DECIMAL(8,2),
    energy_efficiency_score DECIMAL(5,2),
    
    -- Environmental Impact
    co2_emissions_grams DECIMAL(10,2),
    
    -- Raw Data (for flexibility)
    raw_metrics JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `energy_statistics`
```sql
CREATE TABLE energy_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Daily Aggregates
    total_energy_kwh DECIMAL(10,4),
    avg_power_watts DECIMAL(8,2),
    peak_power_watts DECIMAL(8,2),
    efficiency_score DECIMAL(5,2),
    co2_saved_grams DECIMAL(10,2),
    
    -- Usage Time
    active_time_minutes INTEGER,
    idle_time_minutes INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, device_id, date)
);
```

## Indexes

### Performance Indexes
```sql
-- Query optimization
CREATE INDEX idx_performance_data_user_device 
    ON performance_data(user_id, device_id);
    
CREATE INDEX idx_performance_data_timestamp 
    ON performance_data(timestamp DESC);
    
CREATE INDEX idx_performance_data_device_timestamp 
    ON performance_data(device_id, timestamp DESC);

-- Energy statistics
CREATE INDEX idx_energy_stats_user_date 
    ON energy_statistics(user_id, date DESC);
    
CREATE INDEX idx_energy_stats_device_date 
    ON energy_statistics(device_id, date DESC);
```

### Composite Indexes
```sql
-- Time-series queries
CREATE INDEX idx_performance_time_series 
    ON performance_data(device_id, timestamp DESC, cpu_usage, memory_usage);
    
-- Dashboard queries  
CREATE INDEX idx_dashboard_metrics
    ON performance_data(user_id, timestamp DESC)
    WHERE timestamp > NOW() - INTERVAL '24 hours';
```

## Row Level Security (RLS)

### Devices Table
```sql
-- Users can only access their own devices
CREATE POLICY "Users can view own devices" ON devices
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own devices" ON devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own devices" ON devices
    FOR UPDATE USING (auth.uid() = user_id);
```

### Performance Data
```sql
-- Users can only access their own performance data
CREATE POLICY "Users can view own performance data" ON performance_data
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own performance data" ON performance_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Database Functions

### Statistics Functions
```sql
-- Get user energy summary
CREATE OR REPLACE FUNCTION get_user_energy_summary(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_energy_kwh DECIMAL,
    avg_efficiency DECIMAL,
    co2_saved_grams DECIMAL,
    active_devices INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(es.total_energy_kwh)::DECIMAL,
        AVG(es.efficiency_score)::DECIMAL,
        SUM(es.co2_saved_grams)::DECIMAL,
        COUNT(DISTINCT es.device_id)::INTEGER
    FROM energy_statistics es
    WHERE es.user_id = p_user_id
      AND es.date >= CURRENT_DATE - p_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Data Cleanup Functions
```sql
-- Clean old performance data
CREATE OR REPLACE FUNCTION cleanup_old_performance_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM performance_data 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

## Triggers

### Auto-update Timestamps
```sql
-- Update device last_sync
CREATE OR REPLACE FUNCTION update_device_last_sync()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE devices 
    SET last_sync = NOW(), updated_at = NOW()
    WHERE id = NEW.device_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_sync
    AFTER INSERT ON performance_data
    FOR EACH ROW
    EXECUTE FUNCTION update_device_last_sync();
```

## Views

### Dashboard Metrics View
```sql
CREATE VIEW user_dashboard_metrics AS
SELECT 
    d.user_id,
    d.device_name,
    d.device_type,
    COALESCE(latest.cpu_usage, 0) as current_cpu,
    COALESCE(latest.memory_usage, 0) as current_memory,
    COALESCE(latest.power_consumption, 0) as current_power,
    d.last_sync
FROM devices d
LEFT JOIN LATERAL (
    SELECT cpu_usage, memory_usage, power_consumption
    FROM performance_data pd
    WHERE pd.device_id = d.id
    ORDER BY pd.timestamp DESC
    LIMIT 1
) latest ON true
WHERE d.is_active = true;
```

## Migration Scripts

### Initial Setup
```sql
-- Run this script to set up the complete database
\i database-schema-auth.sql
```

### Version Migrations
```sql
-- Migration v1.1.0 - Add energy efficiency scoring
ALTER TABLE performance_data 
ADD COLUMN energy_efficiency_score DECIMAL(5,2);

-- Migration v1.2.0 - Add device categories
ALTER TABLE devices 
ADD COLUMN category VARCHAR(50) DEFAULT 'desktop';
```

## Backup Strategy

### Automated Backups
- **Supabase**: Automatic daily backups
- **SQLite**: Backup on app close and sync

### Manual Backups
```sql
-- Export user data
COPY (
    SELECT * FROM performance_data 
    WHERE user_id = 'user-uuid'
    AND timestamp > NOW() - INTERVAL '30 days'
) TO '/path/to/backup.csv' WITH CSV HEADER;
```

## Performance Tuning

### Query Optimization
```sql
-- Explain query plans
EXPLAIN ANALYZE 
SELECT * FROM performance_data 
WHERE device_id = 'device-uuid' 
AND timestamp > NOW() - INTERVAL '24 hours';
```

### Connection Pooling
- **Supabase**: Built-in connection pooling
- **Local**: Use connection pool for SQLite

### Monitoring
- **Slow Query Log**: Enabled for queries > 1000ms
- **Connection Monitoring**: Track active connections
- **Index Usage**: Monitor index hit ratios

## Data Retention

### Retention Policies
- **Raw Performance Data**: 90 days
- **Daily Aggregates**: 2 years  
- **Monthly Summaries**: Indefinite
- **User Authentication**: Indefinite

### Cleanup Jobs
```sql
-- Daily cleanup job
SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 
    'SELECT cleanup_old_performance_data();'
);
```