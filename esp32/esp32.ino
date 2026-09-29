#include <Arduino.h>
#include "config.h"
#include "wifi_manager.h"
#include "supabase_client.h"
#include "sensor_module.h"

unsigned long lastSensorUpdate = 0;
unsigned long lastCommandCheck = 0;

String currentBuzzerStatus = "OFF";
String currentRgbStatus = "OFF";
String currentRgbColor = "#000000";

// Helper to convert HEX string (e.g. "#FF0000") to RGB values
void SetColorFromHex(String hexColor) {
    if (hexColor.length() == 7 && hexColor.charAt(0) == '#') {
        long number = strtol(&hexColor[1], NULL, 16);
        uint8_t r = number >> 16;
        uint8_t g = number >> 8 & 0xFF;
        uint8_t b = number & 0xFF;
        RGB_SetColor(r, g, b);
    } else {
        RGB_Off();
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("Starting Smart Sleep Monitor (with Buzzer and RGB LED)...");

    Sensor_Init();
    Buzzer_Init();
    RGB_Init();
    
    // --- DIAGNOSTIC COLOR TEST ---
    Serial.println("TESTING COLORS...");
    
    Serial.println("Testing RED");
    RGB_SetColor(255, 0, 0); // RED
    delay(1500);
    
    Serial.println("Testing GREEN");
    RGB_SetColor(0, 255, 0); // GREEN
    delay(1500);
    
    Serial.println("Testing BLUE");
    RGB_SetColor(0, 0, 255); // BLUE
    delay(1500);
    
    Serial.println("Testing WHITE");
    RGB_SetColor(255, 255, 255); // WHITE
    delay(1500);
    
    Serial.println("Testing OFF");
    RGB_Off(); // OFF
    delay(1500);
    // ----------------------------
    
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
        
        Serial.printf("[V2] Temp: %.1fC, Light: %.1f%%, Buzzer: %s, RGB: %s (%s)\n", temp, light, currentBuzzerStatus.c_str(), currentRgbStatus.c_str(), currentRgbColor.c_str());
        
        // Push to Supabase
        Supabase_SendSleepData(temp, light);
    }

    // Check for device commands every COMMAND_CHECK_INTERVAL ms
    if (currentMillis - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
        lastCommandCheck = currentMillis;
        
        String newBuzzer, newRgbStatus, newRgbColor;
        bool success = Supabase_FetchDeviceStatus(newBuzzer, newRgbStatus, newRgbColor);
        
        if (success) {
            // Check Buzzer
            if (newBuzzer != currentBuzzerStatus) {
                currentBuzzerStatus = newBuzzer;
                Serial.print("Buzzer status changed to: ");
                Serial.println(currentBuzzerStatus);
                Buzzer_Set(currentBuzzerStatus == "ON");
            }
            
            // Check RGB LED
            if (newRgbStatus != currentRgbStatus || newRgbColor != currentRgbColor) {
                currentRgbStatus = newRgbStatus;
                currentRgbColor = newRgbColor;
                Serial.print("RGB LED changed to: ");
                Serial.print(currentRgbStatus);
                Serial.print(" Color: ");
                Serial.println(currentRgbColor);
                
                if (currentRgbStatus == "ON") {
                    SetColorFromHex(currentRgbColor);
                } else {
                    RGB_Off();
                }
            }
        }
    }
}
