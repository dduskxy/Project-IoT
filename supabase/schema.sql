-- Supabase Schema for Smart Sleep Monitor

-- Table: sleep_monitor_data
CREATE TABLE sleep_monitor_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL,
    temperature NUMERIC,
    light NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: device_status (for two-way control)
CREATE TABLE device_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT UNIQUE NOT NULL,
    buzzer_status TEXT DEFAULT 'OFF',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update device_status timestamp
CREATE OR REPLACE FUNCTION update_device_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_device_status_timestamp ON device_status;
CREATE TRIGGER trigger_update_device_status_timestamp
BEFORE UPDATE ON device_status
FOR EACH ROW
EXECUTE FUNCTION update_device_status_timestamp();

-- Enable Realtime for the tables
alter publication supabase_realtime add table sleep_monitor_data;
alter publication supabase_realtime add table device_status;
