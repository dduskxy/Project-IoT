
#include <Arduino.h>
#include "config.h"
#include "wifi_manager.h"
#include "supabase_client.h"
#include "sensor_module.h"
#include "led_controller.h"
#include "servo_controller.h"
#include "command_handler.h"
#include "device_status.h"

unsigned long lastSensorUpdate = 0;
unsigned long lastCommandCheck = 0;

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("Starting IoT Device...");

    // Initialize modules
    LED_Init();
    Servo_Init();
    Sensor_Init();
    WiFi_Init();
    
    // Initial status report
    DeviceStatus_Report();
}

void loop() {
    // Ensure WiFi is connected
    WiFi_Maintain();

    unsigned long currentMillis = millis();

    // Read and send sensor data every SENSOR_UPDATE_INTERVAL ms
    if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
        lastSensorUpdate = currentMillis;
        float sensorValue = Sensor_Read();
        if (Sensor_IsValid(sensorValue)) {
            Supabase_SendSensorData(sensorValue);
        }
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
