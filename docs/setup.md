# Setup Instructions

## 1. Supabase
Create a Supabase project and run the SQL script in supabase/schema.sql.

## 2. Web Dashboard
Configure .env.local in web/ with your Supabase URL and Anon Key. Run 
pm run dev.

## 3. ESP32
Open sp32/ in Arduino IDE or PlatformIO. Update config.cpp with your Wi-Fi credentials and Supabase keys. Flash the ESP32.
