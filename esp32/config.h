
#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
extern const char* WIFI_SSID;
extern const char* WIFI_PASSWORD;

// Supabase Configuration
extern const char* SUPABASE_URL;
extern const char* SUPABASE_KEY;

// Device Configuration
extern const char* DEVICE_ID;

// Hardware Pins (Assumed generic for now, replace with actual pins)
#define LED_PIN 2
#define SERVO_PIN 18
#define SENSOR_PIN 34 // Example Analog pin

// Timings
#define SENSOR_UPDATE_INTERVAL 10000 // 10 seconds
#define COMMAND_CHECK_INTERVAL 3000  // 3 seconds

#endif // CONFIG_H
