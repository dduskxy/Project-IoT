
-- Supabase Schema for Project-IoT

-- Table: sensor_data
CREATE TABLE sensor_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Table: device_status
CREATE TABLE device_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT UNIQUE NOT NULL,
    led_status TEXT DEFAULT 'OFF',
    pump_status TEXT DEFAULT 'OFF',
    battery_level INT DEFAULT 100,
    water_level INT DEFAULT 100,
    online_status TEXT DEFAULT 'OFFLINE',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: commands
CREATE TABLE commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL,
    device TEXT NOT NULL,
    command TEXT NOT NULL,
    value NUMERIC,
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, EXECUTED, FAILED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ
);

-- Trigger to auto-set executed_at on status change
CREATE OR REPLACE FUNCTION set_executed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('EXECUTED', 'FAILED') AND OLD.status NOT IN ('EXECUTED', 'FAILED') THEN
    NEW.executed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_executed_at ON commands;
CREATE TRIGGER trigger_set_executed_at
BEFORE UPDATE ON commands
FOR EACH ROW
EXECUTE FUNCTION set_executed_at();

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
