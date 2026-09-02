# Architecture

The Project-IoT architecture connects an ESP32 to the Supabase cloud, enabling telemetry from sensors and remote control via a Web Dashboard and LLM interface.

## Data Flow
Sensor -> ESP32 -> Supabase -> Web/LLM

## Control Flow
User -> Web/LLM -> Supabase -> ESP32 -> LED/Servo
