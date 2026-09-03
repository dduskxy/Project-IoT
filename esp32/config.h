#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration (from config_secrets.h)
extern const char* WIFI_SSID;
extern const char* WIFI_PASSWORD;

// Supabase Configuration (from config_secrets.h)
extern const char* SUPABASE_URL;
extern const char* SUPABASE_KEY;

// Device Configuration (from config.cpp)
extern const char* DEVICE_ID;

// Hardware Pins
#define LED_PIN 2
#define PUMP_PIN 23
#define MOISTURE_POWER_PIN 19
#define MOISTURE_SIGNAL_PIN 33
#define BATTERY_PIN 32
#define WATER_LEVEL_GROUND_PIN 35

// Timings
#define SENSOR_UPDATE_INTERVAL 10000 // 10 seconds
#define COMMAND_CHECK_INTERVAL 3000  // 3 seconds

#endif // CONFIG_H
