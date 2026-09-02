#include <Arduino.h>
#include "sensor_module.h"
#include "config.h"

void Sensor_Init() {
    pinMode(SENSOR_PIN, INPUT);
}

float Sensor_Read() {
    int rawValue = analogRead(SENSOR_PIN);
    // Dummy conversion logic
    return rawValue * (3.3 / 4095.0);
}

bool Sensor_IsValid(float value) {
    return value >= 0.0 && value <= 3.3;
}
