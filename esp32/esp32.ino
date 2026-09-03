#include <Arduino.h>
#include <esp_task_wdt.h>
#include "config.h"
#include "wifi_manager.h"
#include "supabase_client.h"
#include "sensor_module.h"
#include "led_controller.h"
#include "pump_controller.h"
#include "command_handler.h"
#include "device_status.h"

#define WDT_TIMEOUT 30

unsigned long lastSensorUpdate = 0;
unsigned long lastCommandCheck = 0;

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("Starting IoT Device...");

    // Initialize WDT for ESP32 Arduino Core v3.0+ (ESP-IDF v5)
    esp_task_wdt_config_t wdt_config = {
        .timeout_ms = WDT_TIMEOUT * 1000,
        .idle_core_mask = (1 << CONFIG_FREERTOS_NUMBER_OF_CORES) - 1,    // Bitmask of all cores
        .trigger_panic = true
    };
    esp_task_wdt_init(&wdt_config);
    esp_task_wdt_add(NULL);

    // Initialize modules
    LED_Init();
    Pump_Init();
    Sensor_Init();
    WiFi_Init();
    
    // Initial status report
    DeviceStatus_Report();
}

void loop() {
    esp_task_wdt_reset();

    // Ensure WiFi is connected
    WiFi_Maintain();
    
    // Maintain pump safety and PWM
    Pump_Maintain();

    unsigned long currentMillis = millis();

    // Read and send sensor data every SENSOR_UPDATE_INTERVAL ms
    if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
        lastSensorUpdate = currentMillis;
        
        float moisture = SoilMoisture_Read();
        int waterLevel = WaterLevel_Read();
        int battery = Battery_Read();
        
        Serial.printf("Moisture: %.1f%%, Water Level: %d%%, Battery: %d%%\n", moisture, waterLevel, battery);
        
        // Push primary sensor (moisture) to Supabase (can be extended to push all)
        Supabase_SendSensorData(moisture);
        // Reuse already-read values — avoids ~450ms of duplicate blocking sensor reads
        DeviceStatus_ReportCached(waterLevel, battery);
    }

    // Check for new commands every COMMAND_CHECK_INTERVAL ms
    if (currentMillis - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
        lastCommandCheck = currentMillis;
        String commandJson = Supabase_FetchCommand();
        if (commandJson != "") {
            CommandHandler_Process(commandJson);
        }
    }
}
