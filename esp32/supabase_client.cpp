#include "supabase_client.h"
#include "config.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

static WiFiClientSecure secureClient;
static HTTPClient http;
static bool clientInitialized = false;

void Supabase_InitClient() {
    if (!clientInitialized) {
        secureClient.setInsecure();
        http.setReuse(true);
        clientInitialized = true;
    }
}

void Supabase_SendSensorData(float value) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Skipping SendSensorData.");
        return;
    }
    Supabase_InitClient();
    http.setTimeout(5000);
    
    String url = String(SUPABASE_URL) + "/rest/v1/sensor_data";
    http.begin(secureClient, url);
    http.addHeader("apikey", SUPABASE_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Prefer", "return=minimal");
    
    JsonDocument doc;
    doc["device_id"] = DEVICE_ID;
    doc["sensor_type"] = "SOIL_MOISTURE";
    doc["value"] = value;
    doc["unit"] = "%";
    
    String payload;
    serializeJson(doc, payload);
    
    int httpResponseCode = http.POST(payload);
    if (httpResponseCode >= 200 && httpResponseCode < 300) {
        Serial.print("Sensor data sent. Moisture: ");
        Serial.print(value);
        Serial.println("%");
    } else {
        Serial.print("Error sending sensor data. HTTP Code: ");
        Serial.println(httpResponseCode);
        if (httpResponseCode > 0) {
            Serial.println("Response: " + http.getString());
        }
    }
    http.end();
}

String Supabase_FetchCommand() {
    if (WiFi.status() != WL_CONNECTED) return "";
    Supabase_InitClient();
    http.setTimeout(5000);
    
    String url = String(SUPABASE_URL) + "/rest/v1/commands?select=*&device_id=eq." + String(DEVICE_ID) + "&status=eq.PENDING&order=created_at.asc&limit=1";
    http.begin(secureClient, url);
    http.addHeader("apikey", SUPABASE_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.GET();
    String commandJson = "";
    
    if (httpResponseCode >= 200 && httpResponseCode < 300) {
        String payload = http.getString();
        if (payload.length() > 0 && payload != "[]") {
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, payload);
            if (!error) {
                if (doc.is<JsonArray>() && doc.size() > 0) {
                    serializeJson(doc[0], commandJson);
                } else if (doc.is<JsonObject>()) {
                    serializeJson(doc, commandJson);
                }
            } else {
                Serial.print("Failed to parse command JSON: ");
                Serial.println(error.c_str());
            }
        }
    } else {
        if (httpResponseCode > 0) {
            Serial.print("Error fetching commands. HTTP Code: ");
            Serial.println(httpResponseCode);
        } else {
            Serial.print("HTTP GET request failed. Code: ");
            Serial.println(httpResponseCode);
        }
    }
    http.end();
    return commandJson;
}

void Supabase_UpdateStatus(bool ledOn, bool pumpOn, int batteryLevel, int waterLevel) {
    if (WiFi.status() != WL_CONNECTED) return;
    Supabase_InitClient();
    http.setTimeout(5000);
    
    String url = String(SUPABASE_URL) + "/rest/v1/device_status?device_id=eq." + String(DEVICE_ID);
    http.begin(secureClient, url);
    http.addHeader("apikey", SUPABASE_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Prefer", "return=minimal");
    
    JsonDocument doc;
    doc["led_status"] = ledOn ? "ON" : "OFF";
    doc["pump_status"] = pumpOn ? "ON" : "OFF";
    doc["battery_level"] = batteryLevel;
    doc["water_level"] = waterLevel;
    
    String payload;
    serializeJson(doc, payload);
    
    int httpResponseCode = http.PATCH(payload);
    if (httpResponseCode < 200 || httpResponseCode >= 300) {
        Serial.print("Error updating device status. HTTP Code: ");
        Serial.println(httpResponseCode);
    }
    http.end();
}

void Supabase_UpdateCommandStatus(String commandId, String status) {
    if (WiFi.status() != WL_CONNECTED) return;
    Supabase_InitClient();
    http.setTimeout(5000);
    
    String url = String(SUPABASE_URL) + "/rest/v1/commands?id=eq." + commandId;
    http.begin(secureClient, url);
    http.addHeader("apikey", SUPABASE_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
    http.addHeader("Content-Type", "application/json");
    
    JsonDocument doc;
    doc["status"] = status;
    if (status == "EXECUTED" || status == "FAILED") {
        http.addHeader("Prefer", "return=minimal,resolution=merge-duplicates");
    } else {
        http.addHeader("Prefer", "return=minimal");
    }
    
    String payload;
    serializeJson(doc, payload);
    
    int httpResponseCode = http.PATCH(payload);
    if (httpResponseCode < 200 || httpResponseCode >= 300) {
        Serial.print("Error updating command status. HTTP Code: ");
        Serial.println(httpResponseCode);
    }
    http.end();
}
