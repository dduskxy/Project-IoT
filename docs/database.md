# Database Schema

The database uses Supabase PostgreSQL.

- **sensor_data**: Stores incoming sensor telemetry (id, device_id, sensor_type, value, unit, timestamp).
- **device_status**: Stores the latest known state of each device (LED, Servo, Online status).
- **commands**: Stores commands for the ESP32 to execute, representing the command lifecycle (PENDING, PROCESSING, EXECUTED, FAILED).
