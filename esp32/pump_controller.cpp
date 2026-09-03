#include <Arduino.h>
#include "pump_controller.h"
#include "config.h"

bool currentPumpState = false;
int currentPwmValue = 0;
unsigned long lastPwmIncrease = 0;
unsigned long pumpStartTime = 0;
const int PUMP_PWM_FREQ = 490;
const int PUMP_PWM_RES = 8;
const int MAX_PWM = 200; // Safe max power
const unsigned long PUMP_TIMEOUT_MS = 60000; // 60s safety timeout

void Pump_Init() {
    // New ESP32 v3.x LEDC API
    ledcAttach(PUMP_PIN, PUMP_PWM_FREQ, PUMP_PWM_RES);
    ledcWrite(PUMP_PIN, 0);
}

void Pump_Set(bool on) {
    currentPumpState = on;
    if (!on) {
        currentPwmValue = 0;
        ledcWrite(PUMP_PIN, 0);
        pumpStartTime = 0;
        Serial.println("Pump turned OFF");
    } else {
        // Start from a min PWM to overcome static friction
        currentPwmValue = 100; 
        ledcWrite(PUMP_PIN, currentPwmValue);
        pumpStartTime = millis();
        Serial.println("Pump turned ON (Ramping up)");
    }
}

bool Pump_GetState() {
    return currentPumpState;
}

void Pump_Maintain() {
    if (currentPumpState) {
        // Safety timeout: auto-shutoff after PUMP_TIMEOUT_MS
        if (millis() - pumpStartTime >= PUMP_TIMEOUT_MS) {
            Serial.println("[SAFETY] Pump auto-shutoff after timeout!");
            Pump_Set(false);
            return;
        }
        // PWM ramp-up
        if (currentPwmValue < MAX_PWM) {
            if (millis() - lastPwmIncrease > 20) { // increase every 20ms
                currentPwmValue++;
                ledcWrite(PUMP_PIN, currentPwmValue);
                lastPwmIncrease = millis();
            }
        }
    }
}
