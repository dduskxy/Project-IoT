#include "command_handler.h"
#include "led_controller.h"
#include "pump_controller.h"
#include "device_status.h"
#include "supabase_client.h"
#include <ArduinoJson.h>

void CommandHandler_Process(String commandJson) {
    Serial.println("Processing command: " + commandJson);
    
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, commandJson);
    
    if (error) {
        Serial.println("Failed to parse command JSON");
        return;
    }
    
    String id = doc["id"].as<String>();
    String device = doc["device"].as<String>();
    String command = doc["command"].as<String>();
    
    if (id == "null" || id == "") {
        return; // Invalid command ID
    }
    
    // 2. Transition state to PROCESSING
    Supabase_UpdateCommandStatus(id, "PROCESSING");
    
    bool matched = false;
    
    // 3. Action Dispatch
    if (device == "LED") {
        if (command == "ON") {
            LED_Set(true);
            matched = true;
        } else if (command == "OFF") {
            LED_Set(false);
            matched = true;
        }
    } else if (device == "PUMP") {
        if (command == "ON") {
            Pump_Set(true);
            matched = true;
        } else if (command == "OFF") {
            Pump_Set(false);
            matched = true;
        }
    }
    
    // 4. Result reporting
    if (matched) {
        Supabase_UpdateCommandStatus(id, "EXECUTED");
        DeviceStatus_Report(); // Update the device status table immediately
    } else {
        Serial.println("Unknown device or command");
        Supabase_UpdateCommandStatus(id, "FAILED");
    }
}
