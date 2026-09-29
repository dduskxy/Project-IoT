#include <Arduino.h>
#include "config.h"
#include "wifi_manager.h"
#include "supabase_client.h"
#include "sensor_module.h"

unsigned long lastSensorUpdate = 0;
unsigned long lastCommandCheck = 0;
String currentBuzzerStatus = "OFF";

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("Starting Smart Sleep Monitor (with Buzzer)...");

    Sensor_Init();
    Buzzer_Init();
    WiFi_Init();
}

void loop() {
    WiFi_Maintain();

    unsigned long currentMillis = millis();

    // Read and send sensor data every SENSOR_UPDATE_INTERVAL ms
    if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
        lastSensorUpdate = currentMillis;
        
        float temp = Temperature_Read();
        float light = Light_Read();
        
        Serial.printf("Temp: %.1fC, Light: %.1f%%, Buzzer: %s\n", temp, light, currentBuzzerStatus.c_str());
        
        // Push to Supabase
        Supabase_SendSleepData(temp, light);
    }

    // Check for buzzer commands every COMMAND_CHECK_INTERVAL ms
    if (currentMillis - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
        lastCommandCheck = currentMillis;
        String status = Supabase_FetchBuzzerStatus();
        if (status != "" && status != currentBuzzerStatus) {
            currentBuzzerStatus = status;
            Serial.print("Buzzer status changed to: ");
            Serial.println(status);
            
            if (status == "ON") {
                Buzzer_Set(true);
            } else {
                Buzzer_Set(false);
            }
        }
    }
}
