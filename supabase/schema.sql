
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
    servo_position INT DEFAULT 0,
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
