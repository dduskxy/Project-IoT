#include "supabase_client.h"
#include "config.h"
#include <HTTPClient.h>

// Dummy implementations for now. Replace with actual HTTP POST/GET to Supabase REST API

void Supabase_SendSensorData(float value) {
    Serial.println("Sending sensor data to Supabase: " + String(value));
}

String Supabase_FetchCommand() {
    // Serial.println("Checking for new commands...");
    return ""; // Return empty JSON string if no command
}

void Supabase_UpdateStatus(bool ledOn, int servoPos) {
    Serial.printf("Updating status - LED: %s, Servo: %d\n", ledOn ? "ON" : "OFF", servoPos);
}

void Supabase_UpdateCommandStatus(String commandId, String status) {
    Serial.println("Updating command " + commandId + " status to " + status);
}
