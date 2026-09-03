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
#ifdef LED_INVERTED
    digitalWrite(LED_PIN, on ? (LED_INVERTED ? LOW : HIGH) : (LED_INVERTED ? HIGH : LOW));
#else
    digitalWrite(LED_PIN, on ? HIGH : LOW);
#endif
}

bool LED_GetStatus() {
    return ledState;
}
