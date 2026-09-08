#include <WiFi.h>
#include <esp_wifi.h>
#include "wifi_manager.h"
#include "config.h"

void WiFi_Init() {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    // [ทางเลือก] หากต้องการปลอม MAC Address ให้เหมือนมือถือ (Spoofing) 
    // ให้เอาคอมเมนต์ด้านล่างออก แล้วใส่ MAC Address ของมือถือคุณ
    // uint8_t new_mac[6] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF};
    // esp_wifi_set_mac(WIFI_IF_STA, &new_mac[0]);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 40) { // 20 seconds timeout
        delay(500);
        Serial.print(".");
        retries++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" Connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println(" Failed to connect.");
    }

    // แสดง MAC Address ของบอร์ด เพื่อนำไปใช้ลงทะเบียนกับฝ่ายไอที (Whitelist)
    Serial.print("ESP32 MAC Address: ");
    Serial.println(WiFi.macAddress());
}

void WiFi_Maintain() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost. Reconnecting...");
        WiFi.disconnect();
        WiFi.reconnect();
        int retries = 0;
        while (WiFi.status() != WL_CONNECTED && retries < 10) {
            delay(500);
            retries++;
        }
    }
}
