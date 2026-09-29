#include "supabase_client.h"
#include "config.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

WiFiClientSecure *secureClient = nullptr;
HTTPClient http;

void Supabase_InitClient() {
    if (secureClient == nullptr) {
        secureClient = new WiFiClientSecure();
        secureClient->setInsecure(); // Disable SSL certificate verification for simplicity
    }
}

void Supabase_SendSleepData(float temperature, float light) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Skipping SendSleepData.");
        return;
    }
    
    Supabase_InitClient();
    http.setReuse(true);
    http.setTimeout(5000); // 5 seconds timeout
    
    String url = String(SUPABASE_URL) + "/rest/v1/sleep_monitor_data";
    http.begin(*secureClient, url);
    http.addHeader("apikey", SUPABASE_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Prefer", "return=minimal");
    
    JsonDocument doc;
    doc["device_id"] = DEVICE_ID;
    doc["temperature"] = temperature;
    doc["light"] = light;
    
    String payload;
    serializeJson(doc, payload);
    
    int httpResponseCode = http.POST(payload);
    if (httpResponseCode < 200 || httpResponseCode >= 300) {
        Serial.print("Error sending data. HTTP Code: ");
        Serial.println(httpResponseCode);
        Serial.print("Response: ");
        Serial.println(http.getString());
    }
    http.end();
}

bool Supabase_FetchDeviceStatus(String &buzzer, String &rgbStatus, String &rgbColor) {
    if (WiFi.status() != WL_CONNECTED) return false;
    Supabase_InitClient();
    http.setReuse(true);
    http.setTimeout(5000);
    
    String url = String(SUPABASE_URL) + "/rest/v1/device_status?select=buzzer_status,rgb_status,rgb_color&device_id=eq." + String(DEVICE_ID) + "&limit=1";
    http.begin(*secureClient, url);
    http.addHeader("apikey", SUPABASE_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.GET();
    bool success = false;
    
    if (httpResponseCode >= 200 && httpResponseCode < 300) {
        String payload = http.getString();
        if (payload.length() > 0 && payload != "[]") {
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, payload);
            if (!error) {
                if (doc.is<JsonArray>() && doc.size() > 0) {
                    buzzer = doc[0]["buzzer_status"].as<String>();
                    rgbStatus = doc[0]["rgb_status"].as<String>();
                    rgbColor = doc[0]["rgb_color"].as<String>();
                    success = true;
                }
            }
        }
    }
    http.end();
    return success;
}
