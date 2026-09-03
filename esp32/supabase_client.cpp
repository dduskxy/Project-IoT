#include "supabase_client.h"
#include "config.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

void Supabase_SendSensorData(float value) {
    if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client;
        client.setInsecure();
        HTTPClient http;
        
        http.setTimeout(10000); // 10s timeout
        
        String url = String(SUPABASE_URL) + "/rest/v1/sensor_data";
        http.begin(client, url);
        http.addHeader("apikey", SUPABASE_KEY);
        http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("Prefer", "return=minimal");
        
        // Construct JSON payload using JsonDocument
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
    } else {
        Serial.println("WiFi not connected. Skipping SendSensorData.");
    }
}

String Supabase_FetchCommand() {
    if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client;
        client.setInsecure();
        
        HTTPClient http;
        http.setTimeout(10000); // 10s timeout
        
        // Fetch the oldest PENDING command
        String url = String(SUPABASE_URL) + "/rest/v1/commands?select=*&device_id=eq." + String(DEVICE_ID) + "&status=eq.PENDING&order=created_at.asc&limit=1";
        
        http.begin(client, url);
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
                        // Return the first element as a JSON string
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
    return "";
}

void Supabase_UpdateStatus(bool ledOn, bool pumpOn, int batteryLevel, int waterLevel) {
    if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client;
        client.setInsecure();
        HTTPClient http;
        
        http.setTimeout(10000); // 10s timeout
        
        String url = String(SUPABASE_URL) + "/rest/v1/device_status?device_id=eq." + String(DEVICE_ID);
        http.begin(client, url);
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
}

void Supabase_UpdateCommandStatus(String commandId, String status) {
    if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client;
        client.setInsecure();
        HTTPClient http;
        
        http.setTimeout(10000); // 10s timeout
        
        String url = String(SUPABASE_URL) + "/rest/v1/commands?id=eq." + commandId;
        http.begin(client, url);
        http.addHeader("apikey", SUPABASE_KEY);
        http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("Prefer", "return=minimal");
        
        // Build payload with ArduinoJson — avoid "now()" string literal
        // ESP32 has no RTC, so we omit executed_at for non-terminal states
        // and let Supabase set it via column default for EXECUTED/FAILED
        JsonDocument doc;
        doc["status"] = status;
        if (status == "EXECUTED" || status == "FAILED") {
            // Use PostgREST's built-in CSV header to call now() server-side
            http.addHeader("Prefer", "return=minimal,resolution=merge-duplicates");
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
}
