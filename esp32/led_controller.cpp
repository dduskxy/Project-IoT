#include <Arduino.h>
#include "led_controller.h"
#include "config.h"

bool ledState = false;

void LED_Init() {
    pinMode(LED_PIN, OUTPUT);
    LED_Set(false);
}

void LED_Set(bool on) {
    ledState = on;
    digitalWrite(LED_PIN, on ? HIGH : LOW);
}

bool LED_GetStatus() {
    return ledState;
}
