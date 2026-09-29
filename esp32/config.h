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

// Sleep Monitor Pins
#define TEMP_PIN 34
#define LIGHT_PIN 35
#define BUZZER_PIN 25
#define RGB_CLK_PIN 26
#define RGB_DAT_PIN 27

// Timings
#define SENSOR_UPDATE_INTERVAL 5000 // 5 seconds
#define COMMAND_CHECK_INTERVAL 3000 // 3 seconds

#endif // CONFIG_H
